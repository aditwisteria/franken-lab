/**
 * engine.ts — Canvas engine
 *
 * Responsibilities:
 *  - Resize canvas to fill its CSS container, respecting devicePixelRatio
 *  - Render a per-phase background + scene
 *  - STITCH phase: operating table + live monster preview
 *  - Debug key bindings: 1–5 switch phases directly
 */

import { GameState, PhaseName, transitionTo } from './state.js';
import { buildMonster, drawMonster } from './monster.js';
import { drawArena } from './arena.js';

// ── Default debug build ───────────────────────────────────────────────────

const DEBUG_BUILD = { head: 'vampire', torso: 'robot', arms: 'werewolf', legs: 'ghost' } as const;

// ── Colors per phase ──────────────────────────────────────────────────────

const PHASE_STYLE: Record<PhaseName, { bg: string; label: string; color: string }> = {
  TITLE:   { bg: '#0a0d0f', label: 'TITLE',   color: '#39ff14' },
  STITCH:  { bg: '#0d0a14', label: 'STITCH',  color: '#c77dff' },
  ZAP:     { bg: '#0a0f0a', label: 'ZAP',     color: '#ffb300' },
  SURVIVE: { bg: '#0d0505', label: 'SURVIVE', color: '#ff3c3c' },
  END:     { bg: '#050505', label: 'END',     color: '#00e5cc' },
};

// ── Resize handling ───────────────────────────────────────────────────────

export function resizeCanvas(canvas: HTMLCanvasElement): void {
  const dpr    = window.devicePixelRatio ?? 1;
  const rect   = canvas.getBoundingClientRect();
  const width  = Math.round(rect.width  * dpr);
  const height = Math.round(rect.height * dpr);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width  = width;
    canvas.height = height;
  }
}

// ── Grid background (shared) ──────────────────────────────────────────────

function drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number, dpr: number): void {
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth   = 1;
  const gridStep  = 40 * dpr;
  for (let x = 0; x < W; x += gridStep) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += gridStep) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

// ── STITCH phase canvas scene ─────────────────────────────────────────────
//
// Draws the left half of the canvas (the right half is covered by the DOM
// panel).  Centre of left half = centre of the visible canvas area.

function renderStitchCanvas(
  ctx:   CanvasRenderingContext2D,
  state: GameState,
  W:     number,
  H:     number,
  dpr:   number,
  t:     number,
): void {
  if (state.phase.name !== 'STITCH') return;

  // The DOM panel covers the right ~50 %.  Monster preview lives in the left half.
  const previewW = W * 0.5;
  const cx       = previewW / 2;

  // ── Operating table ───────────────────────────────────────────────────
  const tableW  = Math.min(previewW * 0.7, 240 * dpr);
  const tableH  = 18 * dpr;
  const tableX  = cx - tableW / 2;
  const tableY  = H * 0.72;

  // Table surface
  ctx.fillStyle = '#1a2a1a';
  ctx.strokeStyle = '#2a4a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(tableX, tableY, tableW, tableH, 4);
  ctx.fill();
  ctx.stroke();

  // Table legs
  ctx.strokeStyle = '#2a3a2a';
  ctx.lineWidth = 3;
  for (const legX of [tableX + 12 * dpr, tableX + tableW - 12 * dpr]) {
    ctx.beginPath();
    ctx.moveTo(legX, tableY + tableH);
    ctx.lineTo(legX, tableY + tableH + 28 * dpr);
    ctx.stroke();
  }

  // ── Lamp glow overhead ────────────────────────────────────────────────
  const lampY    = H * 0.08;
  const glowR    = tableW * 0.55;
  const pulse    = 0.85 + Math.sin(t * 1.4) * 0.08;
  const gradient = ctx.createRadialGradient(cx, lampY, 0, cx, lampY, glowR);
  gradient.addColorStop(0,    `rgba(200, 240, 180, ${0.22 * pulse})`);
  gradient.addColorStop(0.4,  `rgba(150, 220, 120, ${0.10 * pulse})`);
  gradient.addColorStop(1,    'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(cx, tableY / 2 + lampY / 2, glowR, (tableY - lampY) * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lamp fixture
  ctx.fillStyle = '#39ff14';
  ctx.beginPath();
  ctx.arc(cx, lampY, 5 * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a4a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, lampY);
  ctx.stroke();

  // ── Monster preview ───────────────────────────────────────────────────
  // Scale to fit in preview region, bottom-resting on table surface.
  const monsterH  = 190; // model height in unscaled coords
  const scale     = Math.min((H * 0.58) / monsterH / dpr, 1.6) * dpr;
  const monsterX  = cx;
  const monsterY  = tableY;  // bottom of monster = top of table

  drawMonster(ctx, state.phase.monster, monsterX, monsterY, scale, t);

  // ── "OPERATING TABLE" caption ─────────────────────────────────────────
  const capSize = Math.round(10 * dpr);
  ctx.font      = `${capSize}px 'Courier New', Courier, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(85, 102, 85, 0.6)';
  ctx.fillText('▸ OPERATING TABLE ◂', cx, tableY + tableH + 32 * dpr);
}

// ── ZAP phase canvas scene ────────────────────────────────────────────────
//
// Draws the monster centred on the canvas (the DOM overlay provides the UI).
// Mirrors renderStitchCanvas scaling/positioning so the monster looks the same.

function renderZapCanvas(
  ctx:   CanvasRenderingContext2D,
  state: GameState,
  W:     number,
  H:     number,
  dpr:   number,
  t:     number,
): void {
  if (state.phase.name !== 'ZAP') return;

  // Centre the monster in the full canvas (no DOM panel offset here)
  const cx = W / 2;

  // A subtle lab-glow overhead — amber coil colour
  const glowR    = W * 0.35;
  const pulse    = 0.85 + Math.sin(t * 2.2) * 0.12;
  const gradient = ctx.createRadialGradient(cx, H * 0.1, 0, cx, H * 0.1, glowR);
  gradient.addColorStop(0,   `rgba(255,179,0,${0.18 * pulse})`);
  gradient.addColorStop(0.5, `rgba(255,100,0,${0.08 * pulse})`);
  gradient.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Monster — shifted up so full body (including legs/feet) ends above ~52 %
  // of canvas height, leaving the lower half clear for the DOM overlay.
  const monsterH  = 190;
  const tableY    = H * 0.52;
  const scale     = Math.min((H * 0.42) / monsterH / dpr, 1.6) * dpr;
  drawMonster(ctx, state.phase.monster, cx, tableY, scale, t);
}

// ── Placeholder label (non-STITCH, non-TITLE phases) ─────────────────────

function renderPlaceholderLabel(
  ctx:   CanvasRenderingContext2D,
  style: { label: string; color: string },
  W: number,
  H: number,
  seed: number,
  elapsed: number,
): void {
  const fontSize = Math.round(Math.min(W, H) * 0.12);
  ctx.font        = `bold ${fontSize}px 'Courier New', Courier, monospace`;
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';

  // Glow pass
  ctx.shadowColor  = style.color;
  ctx.shadowBlur   = fontSize * 0.4;
  ctx.fillStyle    = style.color;
  ctx.fillText(style.label, W / 2, H / 2);

  // Sharp pass
  ctx.shadowBlur   = 0;
  ctx.fillStyle    = '#ffffff';
  ctx.globalAlpha  = 0.85;
  ctx.fillText(style.label, W / 2, H / 2);
  ctx.globalAlpha  = 1;

  // Sub-label: seed + time
  const subSize = Math.round(fontSize * 0.18);
  ctx.font      = `${subSize}px 'Courier New', Courier, monospace`;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText(`SEED: ${seed}  T: ${Math.floor(elapsed / 1000)}s`, W / 2, H / 2 + fontSize * 0.75);
}

// ── Main render entry point ───────────────────────────────────────────────

export function renderFrame(canvas: HTMLCanvasElement, state: GameState): void {
  resizeCanvas(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr       = window.devicePixelRatio ?? 1;
  const W         = canvas.width;
  const H         = canvas.height;
  const phaseName = state.phase.name as PhaseName;
  const style     = PHASE_STYLE[phaseName];
  const t         = state.elapsed / 1000;

  // Background
  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, W, H);

  drawGrid(ctx, W, H, dpr);

  if (phaseName === 'STITCH') {
    renderStitchCanvas(ctx, state, W, H, dpr, t);
  } else if (phaseName === 'ZAP') {
    // DOM overlay handles the UI; draw the monster centered on the canvas.
    renderZapCanvas(ctx, state, W, H, dpr, t);
  } else if (phaseName === 'SURVIVE') {
    drawArena(ctx, state, W, H, dpr);
  } else if (phaseName === 'END') {
    // END: placeholder label until Phase 5 implements the end screen.
    renderPlaceholderLabel(ctx, style, W, H, state.seed, state.elapsed);
  }
  // TITLE: DOM overlay covers everything, no canvas label needed.
}

// ── Debug key bindings ────────────────────────────────────────────────────

/**
 * Pressing 1–5 jumps directly to TITLE/STITCH/ZAP/SURVIVE/END.
 * Pressing R from anywhere resets to STITCH.
 */
export function attachDebugKeys(state: GameState): () => void {
  const handler = (e: KeyboardEvent): void => {
    // Keys 1-5 are ability triggers in SURVIVE — don't intercept them there.
    if (state.phase.name === 'SURVIVE') return;
    switch (e.key) {
      case '1':
        transitionTo(state, { name: 'TITLE' });
        break;
      case '2': {
        const m = buildMonster(DEBUG_BUILD);
        transitionTo(state, { name: 'STITCH', build: DEBUG_BUILD, monster: m });
        break;
      }
      case '3': {
        const m = buildMonster(DEBUG_BUILD);
        transitionTo(state, { name: 'ZAP', build: DEBUG_BUILD, monster: m, charge: 0 });
        break;
      }
      case '4': {
        const m = buildMonster(DEBUG_BUILD);
        transitionTo(state, { name: 'SURVIVE', build: DEBUG_BUILD, monster: m, charge: 80 });
        break;
      }
      case '5':
        transitionTo(state, { name: 'END', score: state.score, wave: state.wave });
        break;
    }
  };

  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
