/**
 * monster.ts — Monster build resolution and stitched canvas renderer.
 *
 * buildMonster() is a pure function: same build → same result, no RNG,
 * no mutation of inputs.
 * drawMonster() is a pure render: reads monster data, never writes it.
 */

import { DonorId, Slot, Ability, getPart, DONORS } from './donors.js';

// ── Types ─────────────────────────────────────────────────────────────────

export interface MonsterBuild {
  head:  DonorId;
  torso: DonorId;
  arms:  DonorId;
  legs:  DonorId;
}

export interface ResolvedStats {
  maxHp:      number;
  damage:     number;
  speed:      number;
  maxEnergy:  number;
}

export interface ResolvedMonster {
  build:    MonsterBuild;
  /** Abilities in slot order: [head, torso, arms, legs]. */
  abilities: [Ability, Ability, Ability, Ability];
  stats:    ResolvedStats;
}

// ── Base stats and clamp ranges ───────────────────────────────────────────

const BASE_STATS: ResolvedStats = {
  maxHp:     100,
  damage:     10,
  speed:     100,
  maxEnergy: 100,
};

export const STAT_RANGES = {
  maxHp:     { min:  40, max: 300 },
  damage:    { min:   1, max:  60 },
  speed:     { min:  40, max: 260 },
  maxEnergy: { min:  20, max: 200 },
} as const;

// ── Build resolution ──────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const SLOT_ORDER: Slot[] = ['head', 'torso', 'arms', 'legs'];

/**
 * Resolve a MonsterBuild into a ResolvedMonster.
 * Pure: no RNG, no side-effects, no mutation of `build`.
 */
export function buildMonster(build: MonsterBuild): ResolvedMonster {
  // Freeze the input to enforce purity (throws in strict mode if mutated).
  const frozenBuild: MonsterBuild = Object.freeze({ ...build });

  let hp     = BASE_STATS.maxHp;
  let damage = BASE_STATS.damage;
  let speed  = BASE_STATS.speed;
  let energy = BASE_STATS.maxEnergy;

  const abilities = SLOT_ORDER.map(slot => {
    const part = getPart(frozenBuild[slot], slot);
    hp     += part.mods.hp;
    damage += part.mods.damage;
    speed  += part.mods.speed;
    energy += part.mods.energy;
    return part.ability;
  }) as [Ability, Ability, Ability, Ability];

  const stats: ResolvedStats = {
    maxHp:     clamp(hp,     STAT_RANGES.maxHp.min,     STAT_RANGES.maxHp.max),
    damage:    clamp(damage, STAT_RANGES.damage.min,    STAT_RANGES.damage.max),
    speed:     clamp(speed,  STAT_RANGES.speed.min,     STAT_RANGES.speed.max),
    maxEnergy: clamp(energy, STAT_RANGES.maxEnergy.min, STAT_RANGES.maxEnergy.max),
  };

  return { build: frozenBuild, abilities, stats };
}

// ── Validation ────────────────────────────────────────────────────────────

/**
 * Returns true iff the resolved monster has exactly 4 abilities,
 * all effectKeys are distinct, and all stats are within legal ranges.
 */
export function validateBuild(build: MonsterBuild): boolean {
  try {
    const monster = buildMonster(build);

    if (monster.abilities.length !== 4) return false;

    const keys = monster.abilities.map(a => a.effectKey);
    if (new Set(keys).size !== 4) return false;

    const { maxHp, damage, speed, maxEnergy } = monster.stats;
    if (maxHp     < STAT_RANGES.maxHp.min     || maxHp     > STAT_RANGES.maxHp.max)     return false;
    if (damage    < STAT_RANGES.damage.min     || damage    > STAT_RANGES.damage.max)    return false;
    if (speed     < STAT_RANGES.speed.min      || speed     > STAT_RANGES.speed.max)     return false;
    if (maxEnergy < STAT_RANGES.maxEnergy.min  || maxEnergy > STAT_RANGES.maxEnergy.max) return false;

    return true;
  } catch {
    return false;
  }
}

// ── Canvas renderer ───────────────────────────────────────────────────────
//
// drawMonster(ctx, monster, x, y, scale, t)
//
//  x, y   — centre-bottom anchor point in canvas pixels (before scale)
//  scale  — uniform scale factor (1 = default ~200px tall)
//  t      — time in seconds (used for ghost float, antenna blink, etc.)
//
// Region layout (all in unscaled "model" coords, centre-x = 0, bottom = 0):
//
//   HEAD   : y ∈ [-190, -130]   height 60, width 50
//   TORSO  : y ∈ [-130,  -60]   height 70, width 60
//   ARMS   : y ∈ [-130,  -60]   two 20×60 panels outside torso (±50)
//   LEGS   : y ∈ [ -60,    0]   two 22×60 panels inside (±17 cx)

const M = {
  headW: 50, headH: 60, headTop: -190,
  torsoW: 60, torsoH: 70, torsoTop: -130,
  armW: 20, armH: 60, armTop: -130, armCx: 50,
  legW: 22, legH: 60, legTop: -60, legCx: 17,
  seamY1: -130,   // head/torso seam
  seamY2: -60,    // torso/leg seam
};

function applyGhostAlpha(ctx: CanvasRenderingContext2D, isGhost: boolean): void {
  ctx.globalAlpha = isGhost ? 0.55 : 1.0;
}

/** Short bristle lines for werewolf fur texture. */
function drawFurStrokes(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha *= 0.6;
  const cols = Math.floor(w / 6);
  const rows = Math.floor(h / 7);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fx = x + c * 6 + 3;
      const fy = y + r * 7 + 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + (c % 2 === 0 ? 2 : -2), fy - 4);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Draw a filled rounded rectangle. */
function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
  fill: string,
): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/** Stroke a rounded rectangle. */
function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
  stroke: string,
  lineWidth: number,
): void {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

// ── Region drawers ────────────────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  donor: DonorId,
  t: number,
): void {
  const palette = DONORS[donor].palette;
  const isGhost = donor === 'ghost';
  const floatY  = isGhost ? Math.sin(t * 2.1) * 4 : 0;

  ctx.save();
  ctx.translate(0, floatY);
  applyGhostAlpha(ctx, isGhost);

  const x = -M.headW / 2;
  const y = M.headTop;
  const w = M.headW;
  const h = M.headH;

  // Head base
  fillRoundRect(ctx, x, y, w, h, 8, palette.primary);
  if (!isGhost) strokeRoundRect(ctx, x, y, w, h, 8, palette.secondary, 2);

  // Donor motifs
  if (donor === 'vampire') {
    // Fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-6, y + h);
    ctx.lineTo(-3, y + h + 8);
    ctx.lineTo(0,  y + h);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0,  y + h);
    ctx.lineTo(3,  y + h + 8);
    ctx.lineTo(6,  y + h);
    ctx.fill();
    // Cape collar wings — two triangles at the base
    ctx.fillStyle = palette.secondary;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + h - 5);
    ctx.lineTo(x,       y + h + 2);
    ctx.lineTo(x + 5,   y + h - 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w + 10, y + h - 5);
    ctx.lineTo(x + w,       y + h + 2);
    ctx.lineTo(x + w - 5,   y + h - 10);
    ctx.fill();
    // Eyes
    ctx.fillStyle = palette.accent;
    ctx.beginPath(); ctx.ellipse(-10, y + 22, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 10, y + 22, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
  }

  if (donor === 'robot') {
    // Antenna
    const blinkOn = Math.sin(t * 3) > 0;
    ctx.strokeStyle = palette.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(0, y - 18);
    ctx.stroke();
    ctx.fillStyle = blinkOn ? palette.accent : palette.secondary;
    ctx.beginPath();
    ctx.arc(0, y - 22, 4, 0, Math.PI * 2);
    ctx.fill();
    // Visor
    ctx.fillStyle = palette.secondary;
    ctx.globalAlpha *= 0.7;
    fillRoundRect(ctx, x + 6, y + 18, w - 12, 14, 3, palette.secondary);
    ctx.globalAlpha /= 0.7;
    // Panel lines
    ctx.strokeStyle = palette.secondary;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 8, y + 40); ctx.lineTo(x + w - 8, y + 40); ctx.stroke();
  }

  if (donor === 'werewolf') {
    drawFurStrokes(ctx, x, y, w, h, palette.secondary);
    // Amber eyes
    ctx.fillStyle = palette.accent;
    ctx.beginPath(); ctx.ellipse(-10, y + 20, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 10, y + 20, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Snout
    ctx.fillStyle = palette.secondary;
    fillRoundRect(ctx, -8, y + h - 18, 16, 12, 4, palette.secondary);
  }

  if (donor === 'ghost') {
    // Wispy top
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      const wx = i * 14;
      ctx.beginPath();
      ctx.moveTo(wx, y);
      ctx.quadraticCurveTo(wx + 6, y - 12, wx, y - 20);
      ctx.stroke();
    }
    // Eye hollows
    ctx.fillStyle = palette.secondary;
    ctx.beginPath(); ctx.ellipse(-10, y + 25, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 10, y + 25, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
  }

  if (donor === 'human') {
    // Simple eyes and smile
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath(); ctx.arc(-10, y + 22, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 10, y + 22, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, y + 32, 10, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTorso(
  ctx: CanvasRenderingContext2D,
  donor: DonorId,
  t: number,
): void {
  const palette = DONORS[donor].palette;
  const isGhost = donor === 'ghost';
  const floatY  = isGhost ? Math.sin(t * 2.1 + 0.5) * 3 : 0;

  ctx.save();
  ctx.translate(0, floatY);
  applyGhostAlpha(ctx, isGhost);

  const x = -M.torsoW / 2;
  const y = M.torsoTop;
  const w = M.torsoW;
  const h = M.torsoH;

  fillRoundRect(ctx, x, y, w, h, 6, palette.primary);
  if (!isGhost) strokeRoundRect(ctx, x, y, w, h, 6, palette.secondary, 2);

  if (donor === 'vampire') {
    // Cape body drape
    ctx.fillStyle = palette.secondary;
    ctx.globalAlpha *= 0.5;
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x - 15, y + h);
    ctx.lineTo(x + w + 15, y + h);
    ctx.lineTo(x + w + 5, y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha /= 0.5;
  }

  if (donor === 'robot') {
    // Chest panel
    ctx.strokeStyle = palette.secondary;
    ctx.lineWidth = 1.5;
    strokeRoundRect(ctx, x + 8, y + 8, w - 16, h - 16, 4, palette.secondary, 1.5);
    // Reactor dot
    ctx.fillStyle = palette.accent;
    ctx.beginPath(); ctx.arc(0, y + h / 2, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, y + h / 2, 2, 0, Math.PI * 2); ctx.fill();
    // Horizontal panel lines
    for (let i = 1; i <= 2; i++) {
      const ly = y + (h / 3) * i;
      ctx.beginPath(); ctx.moveTo(x + 8, ly); ctx.lineTo(x + w - 8, ly); ctx.stroke();
    }
  }

  if (donor === 'werewolf') {
    drawFurStrokes(ctx, x, y, w, h, palette.secondary);
    // Chest scar
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, y + 15); ctx.lineTo(5, y + 30); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, y + 15); ctx.lineTo(-5, y + 30); ctx.stroke();
  }

  if (donor === 'ghost') {
    // Wisp trails down torso sides
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1.5;
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(side * 20, y + 10);
      ctx.quadraticCurveTo(side * 28, y + h / 2, side * 20, y + h - 10);
      ctx.stroke();
    }
  }

  if (donor === 'human') {
    // Simple collar line
    ctx.strokeStyle = palette.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, y + 5); ctx.lineTo(0, y + 14); ctx.lineTo(12, y + 5);
    ctx.stroke();
  }

  ctx.restore();
}

function drawArms(
  ctx: CanvasRenderingContext2D,
  donor: DonorId,
  t: number,
): void {
  const palette = DONORS[donor].palette;
  const isGhost = donor === 'ghost';
  const floatY  = isGhost ? Math.sin(t * 2.1 + 1.0) * 3 : 0;

  for (const side of [-1, 1] as const) {
    ctx.save();
    ctx.translate(side * M.armCx, floatY);
    applyGhostAlpha(ctx, isGhost);

    const x = side === -1 ? -M.armW : 0;
    const y = M.armTop;
    const w = M.armW;
    const h = M.armH;

    fillRoundRect(ctx, x, y, w, h, 5, palette.primary);
    if (!isGhost) strokeRoundRect(ctx, x, y, w, h, 5, palette.secondary, 2);

    if (donor === 'vampire') {
      // Claw tips
      ctx.fillStyle = palette.secondary;
      const clawX = side === -1 ? x + 2 : x + 2;
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        ctx.moveTo(clawX + c * 6, y + h);
        ctx.lineTo(clawX + c * 6 + 3, y + h + 9);
        ctx.lineTo(clawX + c * 6 + 6, y + h);
        ctx.fill();
      }
    }

    if (donor === 'robot') {
      // Panel seam
      ctx.strokeStyle = palette.secondary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 8);
      ctx.lineTo(x + w / 2, y + h - 8);
      ctx.stroke();
      // Zap emitter at hand
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (donor === 'werewolf') {
      drawFurStrokes(ctx, x, y, w, h, palette.secondary);
      // Long claws
      ctx.fillStyle = palette.secondary;
      for (let c = 0; c < 4; c++) {
        ctx.beginPath();
        ctx.moveTo(x + c * 5, y + h);
        ctx.lineTo(x + c * 5 + 2, y + h + 10);
        ctx.lineTo(x + c * 5 + 4, y + h);
        ctx.fill();
      }
    }

    if (donor === 'ghost') {
      // Wispy tendrils at the hand end
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1.5;
      for (let c = -1; c <= 1; c++) {
        const tx = x + w / 2 + c * 5;
        ctx.beginPath();
        ctx.moveTo(tx, y + h);
        ctx.quadraticCurveTo(tx + c * 6, y + h + 10, tx, y + h + 18);
        ctx.stroke();
      }
    }

    if (donor === 'human') {
      // Knuckle lines
      ctx.strokeStyle = palette.secondary;
      ctx.lineWidth = 1;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h - 10 - k * 6);
        ctx.lineTo(x + w - 4, y + h - 10 - k * 6);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

function drawLegs(
  ctx: CanvasRenderingContext2D,
  donor: DonorId,
  t: number,
): void {
  const palette = DONORS[donor].palette;
  const isGhost = donor === 'ghost';
  const floatY  = isGhost ? Math.sin(t * 2.1 + 1.5) * 2 : 0;

  for (const side of [-1, 1] as const) {
    ctx.save();
    ctx.translate(side * M.legCx, floatY);
    applyGhostAlpha(ctx, isGhost);

    const x = -M.legW / 2;
    const y = M.legTop;
    const w = M.legW;
    const h = M.legH;

    fillRoundRect(ctx, x, y, w, h, 5, palette.primary);
    if (!isGhost) strokeRoundRect(ctx, x, y, w, h, 5, palette.secondary, 2);

    if (donor === 'vampire') {
      // Heel spurs
      ctx.fillStyle = palette.secondary;
      ctx.beginPath();
      ctx.moveTo(x, y + h - 8);
      ctx.lineTo(x - 7, y + h + 4);
      ctx.lineTo(x + 4, y + h - 4);
      ctx.fill();
    }

    if (donor === 'robot') {
      // Turbine ring
      ctx.strokeStyle = palette.secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h - 10, w / 2 - 2, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Exhaust vents
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1;
      for (let v = 0; v < 3; v++) {
        ctx.beginPath();
        ctx.moveTo(x + 3 + v * 5, y + h / 2 - 4);
        ctx.lineTo(x + 3 + v * 5, y + h / 2 + 4);
        ctx.stroke();
      }
    }

    if (donor === 'werewolf') {
      drawFurStrokes(ctx, x, y, w, h, palette.secondary);
      // Hind claw
      ctx.fillStyle = palette.secondary;
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 4, y + h);
      ctx.lineTo(x + w / 2,     y + h + 10);
      ctx.lineTo(x + w / 2 + 4, y + h);
      ctx.fill();
    }

    if (donor === 'ghost') {
      // Fading wisp at foot — alpha already reduced
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h);
      ctx.quadraticCurveTo(x + w / 2 + side * 8, y + h + 12, x + w / 2, y + h + 20);
      ctx.stroke();
    }

    if (donor === 'human') {
      // Boot line
      ctx.strokeStyle = palette.secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + h - 8);
      ctx.lineTo(x + w, y + h - 8);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Stitch seam lines ─────────────────────────────────────────────────────

function drawSeams(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.strokeStyle = '#39ff14';   // neon green surgical thread
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = 0;

  // Head / torso seam
  const seamHalf = M.torsoW / 2 + 4;
  ctx.beginPath();
  ctx.moveTo(-seamHalf, M.seamY1);
  ctx.lineTo( seamHalf, M.seamY1);
  ctx.stroke();

  // Torso / leg seam (wider, spans to arms)
  ctx.beginPath();
  ctx.moveTo(-(M.armCx + M.armW / 2 + 2), M.seamY2);
  ctx.lineTo(  M.armCx + M.armW / 2 + 2,  M.seamY2);
  ctx.stroke();

  // Arm attachment seams (vertical, at shoulder join)
  for (const side of [-1, 1]) {
    const ax = side * (M.armCx);
    ctx.beginPath();
    ctx.moveTo(ax, M.armTop - 4);
    ctx.lineTo(ax, M.armTop + 8);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.restore();
}

// ── Public entry point ────────────────────────────────────────────────────

/**
 * Draw the monster centred at (x, y_bottom).
 *
 * @param ctx    Canvas 2D rendering context
 * @param monster  Resolved monster to render
 * @param x      Centre-x in canvas pixels
 * @param y      Bottom-y in canvas pixels
 * @param scale  Uniform scale (1.0 ≈ 200px tall)
 * @param t      Time in seconds (drives ghost float, antenna blink)
 */
export function drawMonster(
  ctx: CanvasRenderingContext2D,
  monster: ResolvedMonster,
  x: number,
  y: number,
  scale: number,
  t: number,
): void {
  ctx.save();
  // Translate so the monster's bottom-centre is at (x, y), then scale.
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Draw order: back-to-front within the flat 2D silhouette.
  // Arms drawn before torso so torso overlaps them slightly.
  drawArms(ctx, monster.build.arms, t);
  drawLegs(ctx, monster.build.legs, t);
  drawTorso(ctx, monster.build.torso, t);
  drawHead(ctx, monster.build.head, t);
  drawSeams(ctx);

  // Reset globalAlpha in case a ghost region left it modified
  ctx.globalAlpha = 1.0;

  ctx.restore();
}
