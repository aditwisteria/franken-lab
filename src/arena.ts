/**
 * arena.ts — SURVIVE phase: villager waves, combat, ability effects, rendering.
 *
 * Exports:
 *   updateArena(state, dtSec)     — advance simulation by dtSec seconds
 *   drawArena(ctx, state, W, H, dpr) — render the arena scene
 *   waveComposition(wave)         — pure function: villager count/hp/speed for a wave
 *
 * All module-internal simulation state lives here and is initialised when
 * the phase becomes SURVIVE and torn down when it leaves SURVIVE.
 *
 * Design: renderng reads state; simulation lives in updateArena.
 * GameState.hp, .score, .energy, .wave are the arena's shared output fields.
 */

import { GameState, nextPhase, MonsterBuild } from './state.js';
import { ResolvedMonster, drawMonster } from './monster.js';
import { createRng, Rng } from './rng.js';
import {
  startHeartbeat, stopHeartbeat,
  startMusic, stopMusic, setMusicWave,
  playZap, playRoar,
} from './audio.js';
import { startListening, stopListening, CommandEvent } from './voice.js';
import { recordStitch, recordRun } from './journal.js';

// ── Particle system ───────────────────────────────────────────────────────

interface Particle {
  x:    number;  // CSS px
  y:    number;  // CSS px
  vx:   number;  // CSS px/s
  vy:   number;  // CSS px/s
  life: number;  // seconds remaining
  maxLife: number;
  r:    number;  // radius CSS px
  color: string;
}

const MAX_PARTICLES = 260;

let _particles: Particle[] = [];

/** EMA of frame dt for adaptive quality. */
let _dtEma = 16.67;        // milliseconds
/** Adaptive quality factor q ∈ [0.25, 1]. */
let _quality = 1;

/** Spawn count-adjusted for quality; always at least minCount. */
function qualityCount(ideal: number, minCount = 1): number {
  return Math.max(minCount, Math.round(ideal * _quality));
}

function spawnParticles(
  x: number, y: number,
  count: number,
  vxBase: number, vyBase: number,
  spread: number,
  color: string,
  radius: number,
  life: number,
  rng: () => number,
): void {
  const available = MAX_PARTICLES - _particles.length;
  const n = Math.min(qualityCount(count), available);
  for (let i = 0; i < n; i++) {
    _particles.push({
      x, y,
      vx: vxBase + (rng() - 0.5) * spread,
      vy: vyBase + (rng() - 0.5) * spread,
      life, maxLife: life,
      r: radius * (0.6 + rng() * 0.8),
      color,
    });
  }
}

/** Returns live particle stats for verification. */
export function getParticleStats(): { active: number; cap: number; quality: number } {
  return { active: _particles.length, cap: MAX_PARTICLES, quality: _quality };
}

// ── Villager entity ───────────────────────────────────────────────────────

interface Villager {
  id:        number;
  x:        number;
  y:        number;        // ground-line y (canvas px), set at spawn
  hp:       number;
  maxHp:    number;
  speed:    number;        // px/s (CSS px)
  facing:   1 | -1;       // direction of movement (1 = right, -1 = left)
  alive:    boolean;
  attackCd: number;        // seconds until next attack
  stunTimer: number;       // seconds remaining of stun
  freezeTimer: number;     // seconds remaining of freeze
  knockbackVx: number;     // px/s horizontal impulse
  marked:   boolean;       // target-lock mark
  torch:    boolean;       // torch or pitchfork variant (visual)
  flickerPhase: number;    // random offset for torch flicker
}

// ── Short-lived effects (lightning bolts, impact flashes, ring waves) ─────

type EffectKind = 'bolt' | 'flash' | 'ring' | 'tendril' | 'stomp';

interface Effect {
  kind:    EffectKind;
  x:       number;
  y:       number;
  x2?:     number;   // bolt end-x
  y2?:     number;   // bolt end-y
  r:       number;   // radius (flash/ring) or half-width (bolt)
  life:    number;   // seconds remaining
  maxLife: number;
  color:   string;
}

// ── Module-level arena state ──────────────────────────────────────────────

let _active        = false;   // true while phase === SURVIVE
let _prevPhase     = '';
let _paused        = false;   // true while game is paused (P key)

let _villagers: Villager[]  = [];
let _effects:   Effect[]    = [];

let _spawnQueue:   number   = 0;   // villagers left to spawn
let _spawnTimer:   number   = 0;   // countdown to next spawn (s)
let _nextVillId:   number   = 0;
let _waveRng:      Rng | null = null;
let _waveComplete: boolean  = false; // guard: prevent re-triggering wave end

// Cooldown timers for each of the 4 abilities (head, torso, arms, legs)
const _abilityCd:  [number, number, number, number] = [0, 0, 0, 0];

// Buff timers
let _rallyTimer:        number = 0;  // seconds remaining
let _incorporealTimer:  number = 0;  // seconds remaining (invulnerable + translucent)
let _dashInvulnTimer:   number = 0;  // seconds remaining for dash invulnerability
let _shieldCharges:     number = 0;

// Monster position in CSS px
let _monX: number = 0;
let _monY: number = 0;   // set to groundY at init

// Movement input state
let _moveLeft  = false;
let _moveRight = false;
let _pointerHeld = false;
let _pointerTargetX = 0;

// Ground line in CSS px (not canvas px) — set each frame from H/dpr
let _groundY = 0;
let _canvasW  = 0;

// Listener cleanup refs
let _keydownHandler:   ((e: KeyboardEvent) => void) | null = null;
let _keyupHandler:     ((e: KeyboardEvent) => void) | null = null;
let _pointerdownHandler: ((e: PointerEvent) => void) | null = null;
let _pointerupHandler:   ((e: PointerEvent) => void) | null = null;
let _pointermoveHandler: ((e: PointerEvent) => void) | null = null;
let _pauseKeyHandler:  ((e: KeyboardEvent) => void) | null = null;

// ── Pure helpers ──────────────────────────────────────────────────────────

/**
 * Wave composition formula.
 * count  = 3 + 2 * wave
 * hp     = 26 + 10 * (wave - 1)
 * speed  = 34 + 5  * (wave - 1)
 */
export function waveComposition(wave: number): { count: number; hp: number; speed: number } {
  return {
    count: 3 + 2 * wave,
    hp:    26 + 10 * (wave - 1),
    speed: 34 + 5  * (wave - 1),
  };
}

// ── Last-run recap (stashed before END transition) ────────────────────────

export interface LastRunRecap {
  build:   MonsterBuild;
  monster: ResolvedMonster;
}

let _lastRunRecap: LastRunRecap | null = null;

/** Returns the build/monster from the most recent SURVIVE run, or null. */
export function getLastRunRecap(): LastRunRecap | null {
  return _lastRunRecap;
}

/** Returns whether the arena is currently paused. */
export function isArenaPaused(): boolean {
  return _paused;
}

// ── HUD read model ────────────────────────────────────────────────────────

export interface HudAbilityView {
  slot:         'head' | 'torso' | 'legs';
  name:         string;
  donorName:    string;
  keyHint:      string;
  cooldownFrac: number;   // 0 = ready, 1 = just used
  ready:        boolean;
  affordable:   boolean;
}

export interface ArenaHudView {
  wave:        number;
  hp:          number;
  maxHp:       number;
  energy:      number;
  maxEnergy:   number;
  score:       number;
  abilities:   HudAbilityView[];
  armsAbility: { name: string; cooldownFrac: number };
}

/** Pure read model consumed by hud.ts on every frame. */
export function getArenaHudView(state: GameState): ArenaHudView {
  const phase = state.phase;

  if (phase.name !== 'SURVIVE') {
    return {
      wave: state.wave, hp: state.hp, maxHp: state.maxHp,
      energy: state.energy, maxEnergy: 100, score: state.score,
      abilities: [], armsAbility: { name: '', cooldownFrac: 0 },
    };
  }

  const monster = phase.monster;
  const maxEnergy = monster.stats.maxEnergy;

  const slotDefs: Array<{ slot: 'head' | 'torso' | 'legs'; idx: number; key: string }> = [
    { slot: 'head',  idx: 0, key: '1' },
    { slot: 'torso', idx: 1, key: '2' },
    { slot: 'legs',  idx: 3, key: '3' },
  ];

  const abilities: HudAbilityView[] = slotDefs.map(({ slot, idx, key }) => {
    const ability = monster.abilities[idx]!;
    const cd      = _abilityCd[idx] ?? 0;
    const frac    = cd > 0 ? cd / ability.cooldownSec : 0;
    return {
      slot,
      name:         ability.name,
      donorName:    ability.donor.charAt(0).toUpperCase() + ability.donor.slice(1),
      keyHint:      key,
      cooldownFrac: Math.max(0, Math.min(1, frac)),
      ready:        cd <= 0,
      affordable:   state.energy >= 20,
    };
  });

  const armsAbility = monster.abilities[2]!;
  const armsCd      = _abilityCd[2] ?? 0;
  const armsFrac    = armsCd > 0 ? armsCd / armsAbility.cooldownSec : 0;

  return {
    wave:        state.wave,
    hp:          state.hp,
    maxHp:       state.maxHp,
    energy:      state.energy,
    maxEnergy,
    score:       state.score,
    abilities,
    armsAbility: {
      name:         armsAbility.name,
      cooldownFrac: Math.max(0, Math.min(1, armsFrac)),
    },
  };
}

// ── Ability trigger (exported for HUD buttons + voice) ────────────────────

/**
 * Manual trigger entry point for HUD buttons, keyboard (1-3), and voice.
 * All three code paths call this single function.
 */
export function triggerSlotAbility(state: GameState, slot: 'head' | 'torso' | 'legs'): void {
  triggerAbility(state, slot);
}

/** Triggered by keyboard keys 1-3, HUD buttons, and voice commands. */
export function triggerAbility(state: GameState, slot: 'head' | 'torso' | 'legs'): void {
  if (state.phase.name !== 'SURVIVE') return;
  const monster = state.phase.monster;

  const slotIdx = slot === 'head' ? 0 : slot === 'torso' ? 1 : 3;
  const ability = monster.abilities[slotIdx];
  if (!ability) return;

  // Check cooldown and energy
  const cd = _abilityCd[slotIdx] ?? 0;
  if (cd > 0) return;
  if (state.energy < 20) return;

  state.energy -= 20;
  _abilityCd[slotIdx] = ability.cooldownSec;

  dispatchEffect(ability.effectKey, state, monster);
}

// ── Ability effect dispatcher ─────────────────────────────────────────────

function dispatchEffect(effectKey: string, state: GameState, monster: ResolvedMonster): void {
  const dmg = baseDamage(state);

  switch (effectKey) {

    case 'lifeStealBite': {
      // Lunge to nearest within 240, damage, heal 50% of damage dealt
      const target = nearestVillager(_monX, 240);
      if (!target) break;
      const dealt = applyDamage(target, dmg, state);
      state.hp = Math.min(state.maxHp, state.hp + dealt * 0.5);
      spawnEffect('flash', target.x, _monX < target.x ? target.x - 20 : target.x + 20, _groundY, 30, 0.3, '#ff2244');
      // Lunge: snap monster x toward target
      _monX = _monX < target.x ? target.x - 40 : target.x + 40;
      break;
    }

    case 'targetLock': {
      // Mark up to 3 nearest villagers
      const nearest = nearestVillagersN(_monX, 3, Infinity);
      for (const v of nearest) v.marked = true;
      spawnEffect('flash', _monX, 0, _groundY, 80, 0.5, '#00e5ff');
      break;
    }

    case 'terrifyingHowl': {
      // Freeze all villagers 2.5s
      for (const v of _villagers) {
        if (v.alive) v.freezeTimer = 2.5;
      }
      spawnEffect('ring', _monX, 0, _groundY, 200, 0.5, '#a0622a');
      break;
    }

    case 'spectralWail': {
      // Damage all on screen 60% of damage stat, +3 energy per villager hit
      for (const v of _villagers) {
        if (v.alive) {
          applyDamage(v, dmg * 0.6, state);
          state.energy = Math.min(monster.stats.maxEnergy, state.energy + 3);
        }
      }
      spawnEffect('ring', _monX, 0, _groundY, 300, 0.6, '#80ffe8');
      break;
    }

    case 'rallyCry': {
      _rallyTimer = 6;
      spawnEffect('flash', _monX, 0, _groundY, 60, 0.5, '#ffe4c4');
      break;
    }

    case 'batSwarmBurst': {
      // All within 280 pushed far back + 40% damage
      for (const v of _villagers) {
        if (!v.alive || Math.abs(v.x - _monX) > 280) continue;
        applyDamage(v, dmg * 0.4, state);
        const dir = v.x > _monX ? 1 : -1;
        v.knockbackVx += dir * 400;
      }
      spawnEffect('ring', _monX, 0, _groundY, 180, 0.5, '#8b0000');
      break;
    }

    case 'chassisShieldBurst': {
      _shieldCharges = 2;
      spawnEffect('ring', _monX, 0, _groundY, 60, 0.5, '#00e5ff');
      break;
    }

    case 'roarKnockback': {
      // All within 260 knocked back hard + 50% damage
      playRoar();
      for (const v of _villagers) {
        if (!v.alive || Math.abs(v.x - _monX) > 260) continue;
        applyDamage(v, dmg * 0.5, state);
        const dir = v.x > _monX ? 1 : -1;
        v.knockbackVx += dir * 500;
      }
      spawnEffect('ring', _monX, 0, _groundY, 180, 0.6, '#ffb300');
      break;
    }

    case 'incorporealShroud': {
      _incorporealTimer = 2.5;
      spawnEffect('flash', _monX, 0, _groundY, 70, 0.4, '#80ffe8');
      break;
    }

    case 'secondWind': {
      state.hp = Math.min(state.maxHp, state.hp + state.maxHp * 0.3);
      spawnEffect('flash', _monX, 0, _groundY, 60, 0.5, '#f0c08a');
      break;
    }

    // ── Auto-attack abilities (arms slot index 2) ─────────────────────

    case 'clawStrike': {
      // All within 100 in facing arc
      const facing = monsterFacing();
      for (const v of _villagers) {
        if (!v.alive) continue;
        const dx = v.x - _monX;
        if (Math.abs(dx) > 100) continue;
        if (dx * facing < 0) continue; // wrong side
        applyDamage(v, dmg, state);
      }
      spawnEffect('flash', _monX + facing * 50, 0, _groundY, 40, 0.2, '#d4c8e0');
      break;
    }

    case 'rangedZap': {
      playZap();
      const target = nearestVillager(_monX, 520);
      if (!target) break;
      applyDamage(target, dmg, state);
      // Lightning bolt effect
      spawnBolt(_monX, target.x, _groundY - 80, _groundY - 40);
      // Spark particles at impact
      spawnParticles(target.x, _groundY - 40, qualityCount(8, 1), 0, -80, 200, '#00e5ff', 3, 0.35, Math.random.bind(Math));
      break;
    }

    case 'frenzySwipe': {
      // Up to 3 nearest within 110
      const targets = nearestVillagersN(_monX, 3, 110);
      for (const v of targets) {
        applyDamage(v, dmg, state);
      }
      spawnEffect('flash', _monX, 0, _groundY, 55, 0.2, '#a0622a');
      break;
    }

    case 'hauntStrike': {
      // Nearest within 460, ignore range obstacles, wispy tendril
      const target = nearestVillager(_monX, 460);
      if (!target) break;
      applyDamage(target, dmg, state);
      spawnEffect('tendril', _monX, target.x, _groundY - 40, 8, 0.4, '#80ffe8');
      // Spectral sparks at impact
      spawnParticles(target.x, _groundY - 40, qualityCount(6, 1), 0, -60, 160, '#80ffe8', 2, 0.4, Math.random.bind(Math));
      break;
    }

    case 'brawlerPunch': {
      // Nearest within 95, strong knockback
      const target = nearestVillager(_monX, 95);
      if (!target) break;
      applyDamage(target, dmg, state);
      const dir = target.x > _monX ? 1 : -1;
      target.knockbackVx += dir * 350;
      spawnEffect('flash', target.x, 0, _groundY, 30, 0.2, '#f0c08a');
      break;
    }

    // ── Legs abilities (manual, slot index 3) ─────────────────────────

    case 'mistDash': {
      // Dash 200px toward facing/nearest, invulnerable during, 40% damage to passed
      const target = nearestVillager(_monX, Infinity);
      const dir = target ? (target.x > _monX ? 1 : -1) : monsterFacing();
      const destX = clampMonX(_monX + dir * 200);
      const minX = Math.min(_monX, destX);
      const maxX = Math.max(_monX, destX);
      _dashInvulnTimer = 0.3;
      _monX = destX;
      for (const v of _villagers) {
        if (!v.alive || v.x < minX || v.x > maxX) continue;
        applyDamage(v, dmg * 0.4, state);
      }
      spawnEffect('ring', destX, 0, _groundY, 50, 0.3, '#d4c8e0');
      break;
    }

    case 'overdriveStomp': {
      // Villagers within 140 stunned 2s + 60% damage, ground ring
      for (const v of _villagers) {
        if (!v.alive || Math.abs(v.x - _monX) > 140) continue;
        applyDamage(v, dmg * 0.6, state);
        v.stunTimer = 2;
      }
      spawnEffect('stomp', _monX, 0, _groundY, 140, 0.5, '#7a8490');
      // Ground dust particles
      spawnParticles(_monX, _groundY, qualityCount(14, 2), 0, -50, 300, '#7a8490', 4, 0.5, Math.random.bind(Math));
      break;
    }

    case 'packLeap': {
      // Leap to densest cluster, 70% damage in 120 radius
      const targetX = densestClusterX(120);
      if (targetX === null) break;
      _monX = clampMonX(targetX);
      for (const v of _villagers) {
        if (!v.alive || Math.abs(v.x - _monX) > 120) continue;
        applyDamage(v, dmg * 0.7, state);
      }
      spawnEffect('ring', _monX, 0, _groundY, 120, 0.5, '#6b4423');
      // Landing dust
      spawnParticles(_monX, _groundY, qualityCount(12, 2), 0, -40, 260, '#8b6030', 4, 0.5, Math.random.bind(Math));
      break;
    }

    case 'phaseDash': {
      // Teleport behind nearest, invulnerable 0.6s
      const target = nearestVillager(_monX, Infinity);
      if (!target) break;
      const dir = target.x > _monX ? 1 : -1;
      _monX = clampMonX(target.x - dir * 50);
      _dashInvulnTimer = 0.6;
      spawnEffect('ring', _monX, 0, _groundY, 50, 0.4, '#004d40');
      break;
    }

    case 'adrenalineSprint': {
      // +80% speed 3s and instant 120px dash away from nearest
      _rallyTimer = Math.max(_rallyTimer, 3); // reuse rally to boost speed
      const target = nearestVillager(_monX, Infinity);
      const awayDir = target ? (target.x > _monX ? -1 : 1) : (monsterFacing() * -1);
      _monX = clampMonX(_monX + awayDir * 120);
      spawnEffect('flash', _monX, 0, _groundY, 50, 0.3, '#ffe4c4');
      break;
    }
  }
}

// ── Combat helpers ────────────────────────────────────────────────────────

/** Current damage value, with rally-cry boost applied. */
function baseDamage(state: GameState): number {
  if (state.phase.name !== 'SURVIVE') return 10;
  const base = state.phase.monster.stats.damage;
  return _rallyTimer > 0 ? base * 1.25 : base;
}

/** Apply damage to a villager (respects marks, returns actual damage). */
function applyDamage(v: Villager, dmg: number, state: GameState): number {
  if (!v.alive) return 0;
  const actual = v.marked ? dmg * 2 : dmg;
  v.hp -= actual;
  spawnEffect('flash', v.x, 0, _groundY - 20, 20, 0.15, '#ff9900');
  if (v.hp <= 0) killVillager(v, state);
  return actual;
}

function killVillager(v: Villager, state: GameState): void {
  v.alive = false;
  v.hp = 0;
  state.score += 25;
  state.energy = Math.min(
    state.phase.name === 'SURVIVE' ? state.phase.monster.stats.maxEnergy : 100,
    state.energy + 4,
  );
  // Death poof particles
  const rng = () => Math.random();
  spawnParticles(v.x, _groundY - 30, qualityCount(10, 1), 0, -120, 180, '#7a9a7a', 4, 0.6, rng);
  spawnParticles(v.x, _groundY - 20, qualityCount(5, 1),  0,  -60, 120, '#a09060', 3, 0.4, rng);
}

/** Returns the nearest alive villager within maxDist CSS px, or null. */
function nearestVillager(fromX: number, maxDist: number): Villager | null {
  let best: Villager | null = null;
  let bestD = maxDist;
  for (const v of _villagers) {
    if (!v.alive) continue;
    const d = Math.abs(v.x - fromX);
    if (d < bestD) { bestD = d; best = v; }
  }
  return best;
}

/** Returns up to N nearest alive villagers within maxDist. */
function nearestVillagersN(fromX: number, n: number, maxDist: number): Villager[] {
  return _villagers
    .filter(v => v.alive && Math.abs(v.x - fromX) <= maxDist)
    .sort((a, b) => Math.abs(a.x - fromX) - Math.abs(b.x - fromX))
    .slice(0, n);
}

/** Find the x of the densest cluster within clusterR radius. */
function densestClusterX(clusterR: number): number | null {
  const alive = _villagers.filter(v => v.alive);
  if (alive.length === 0) return null;
  let bestX = alive[0]!.x;
  let bestCount = 0;
  for (const v of alive) {
    const count = alive.filter(o => Math.abs(o.x - v.x) <= clusterR).length;
    if (count > bestCount) { bestCount = count; bestX = v.x; }
  }
  return bestX;
}

/** Current facing direction based on nearest villager. */
function monsterFacing(): 1 | -1 {
  const target = nearestVillager(_monX, Infinity);
  if (!target) return 1;
  return target.x >= _monX ? 1 : -1;
}

/** Clamp monster x to valid canvas range. */
function clampMonX(x: number): number {
  const margin = 40;
  return Math.max(margin, Math.min(_canvasW - margin, x));
}

// ── Effect helpers ────────────────────────────────────────────────────────

function spawnEffect(
  kind:  EffectKind,
  x:     number,
  x2:    number,
  y:     number,
  r:     number,
  life:  number,
  color: string,
): void {
  _effects.push({ kind, x, x2, y2: y, r, life, maxLife: life, color,
    y: kind === 'bolt' || kind === 'tendril' ? y : y });
}

function spawnBolt(mx: number, vx: number, myBolt: number, vyBolt: number): void {
  _effects.push({
    kind: 'bolt', x: mx, y: myBolt, x2: vx, y2: vyBolt,
    r: 3, life: 0.25, maxLife: 0.25, color: '#00e5ff',
  });
}

// ── Wave management ───────────────────────────────────────────────────────

function buildWaveQueue(wave: number, seed: number): void {
  const comp = waveComposition(wave);
  _spawnQueue  = comp.count;
  _spawnTimer  = 0;
  _waveRng     = createRng(seed + wave * 7919);
  _waveComplete = false;
}

function spawnNextVillager(wave: number): void {
  if (_spawnQueue <= 0 || !_waveRng) return;
  _spawnQueue--;

  const comp = waveComposition(wave);
  const jitter = (_waveRng.next() - 0.5) * 10; // ±5 px/s
  const speedVal = comp.speed + jitter;

  // Alternate spawn sides using RNG
  const fromLeft = _waveRng.next() < 0.5;
  const spawnX   = fromLeft ? -20 : _canvasW + 20;
  const facing: 1 | -1 = fromLeft ? 1 : -1;

  const v: Villager = {
    id:          _nextVillId++,
    x:           spawnX,
    y:           _groundY,
    hp:          comp.hp,
    maxHp:       comp.hp,
    speed:       speedVal,
    facing,
    alive:       true,
    attackCd:    _waveRng.next() * 0.4, // stagger initial attacks
    stunTimer:   0,
    freezeTimer: 0,
    knockbackVx: 0,
    marked:      false,
    torch:       _waveRng.next() < 0.6,
    flickerPhase: _waveRng.next() * Math.PI * 2,
  };
  _villagers.push(v);
}

// ── Input binding ─────────────────────────────────────────────────────────

function attachInputListeners(state: GameState, canvas: HTMLCanvasElement): void {
  _keydownHandler = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'ArrowLeft':  case 'KeyA': _moveLeft  = true;  e.preventDefault(); break;
      case 'ArrowRight': case 'KeyD': _moveRight = true;  e.preventDefault(); break;
      case 'Digit1': triggerAbility(state, 'head');  break;
      case 'Digit2': triggerAbility(state, 'torso'); break;
      case 'Digit3': triggerAbility(state, 'legs');  break;
    }
  };

  _keyupHandler = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'ArrowLeft':  case 'KeyA': _moveLeft  = false; break;
      case 'ArrowRight': case 'KeyD': _moveRight = false; break;
    }
  };

  _pauseKeyHandler = (e: KeyboardEvent): void => {
    if (e.code === 'KeyP' && state.phase.name === 'SURVIVE') {
      e.preventDefault();
      togglePause(state);
    }
  };

  const dpr = window.devicePixelRatio ?? 1;
  _pointerdownHandler = (e: PointerEvent): void => {
    if (state.phase.name !== 'SURVIVE') return;
    const rect = canvas.getBoundingClientRect();
    _pointerHeld    = true;
    _pointerTargetX = (e.clientX - rect.left); // CSS px
    e.preventDefault();
  };
  _pointermoveHandler = (e: PointerEvent): void => {
    if (!_pointerHeld) return;
    const rect = canvas.getBoundingClientRect();
    _pointerTargetX = (e.clientX - rect.left);
  };
  _pointerupHandler = (): void => { _pointerHeld = false; };

  window.addEventListener('keydown', _keydownHandler);
  window.addEventListener('keyup',   _keyupHandler);
  window.addEventListener('keydown', _pauseKeyHandler);
  canvas.addEventListener('pointerdown', _pointerdownHandler);
  window.addEventListener('pointermove', _pointermoveHandler);
  window.addEventListener('pointerup',   _pointerupHandler);

  // Voice commands dispatch into the same trigger function
  startListening((cmd: CommandEvent) => {
    if (state.phase.name !== 'SURVIVE') return;
    if (cmd.type !== 'ability') return;
    const monster = state.phase.monster;
    // Find which of the monster's abilities matches the effectKey or slot
    const slots: Array<'head' | 'torso' | 'legs'> = ['head', 'torso', 'legs'];
    // Try effectKey match first
    for (const slot of slots) {
      const idx = slot === 'head' ? 0 : slot === 'torso' ? 1 : 3;
      if (monster.abilities[idx]?.effectKey === cmd.effectKey) {
        triggerAbility(state, slot);
        return;
      }
    }
    // Fall back: slot match
    if (cmd.slot === 'head' || cmd.slot === 'torso' || cmd.slot === 'legs') {
      triggerAbility(state, cmd.slot);
    }
  });
}

function detachInputListeners(canvas: HTMLCanvasElement): void {
  if (_keydownHandler)      window.removeEventListener('keydown', _keydownHandler);
  if (_keyupHandler)        window.removeEventListener('keyup',   _keyupHandler);
  if (_pauseKeyHandler)     window.removeEventListener('keydown', _pauseKeyHandler);
  if (_pointerdownHandler)  canvas.removeEventListener('pointerdown', _pointerdownHandler);
  if (_pointermoveHandler)  window.removeEventListener('pointermove', _pointermoveHandler);
  if (_pointerupHandler)    window.removeEventListener('pointerup',   _pointerupHandler);
  _keydownHandler = null;
  _keyupHandler   = null;
  _pauseKeyHandler = null;
  _pointerdownHandler = null;
  _pointermoveHandler = null;
  _pointerupHandler   = null;
}

// ── Arena entry / exit ────────────────────────────────────────────────────

/** Toggle pause state: stops/resumes audio and freezes simulation. */
function togglePause(state: GameState): void {
  _paused = !_paused;
  if (_paused) {
    stopHeartbeat();
    stopMusic();
  } else {
    startHeartbeat(() => state.hp / state.maxHp);
    startMusic();
    setMusicWave(state.wave);
  }
}

function enterArena(state: GameState): void {
  _active      = true;
  _paused      = false;
  _villagers   = [];
  _effects     = [];
  _particles   = [];
  _spawnQueue  = 0;
  _spawnTimer  = 0;
  _nextVillId  = 0;
  _waveRng     = null;
  _waveComplete = false;
  _abilityCd[0] = 0;
  _abilityCd[1] = 0;
  _abilityCd[2] = 0;
  _abilityCd[3] = 0;
  _rallyTimer       = 0;
  _incorporealTimer = 0;
  _dashInvulnTimer  = 0;
  _shieldCharges    = 0;
  _moveLeft  = false;
  _moveRight = false;
  _pointerHeld = false;

  // Position monster at centre horizontally, on ground line
  // _canvasW and _groundY are updated each frame; seed a default
  _monX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
  _monY = typeof window !== 'undefined' ? window.innerHeight * 0.80 : 400;

  // Record the stitch for this run in the Lab Journal
  if (state.phase.name === 'SURVIVE') {
    recordStitch(state.phase.build);
  }

  // Start audio
  startHeartbeat(() => state.hp / state.maxHp);
  startMusic();
  setMusicWave(state.wave);

  // Build first wave queue
  buildWaveQueue(state.wave, state.seed);

  // Attach canvas input — the canvas element lives on #game
  const canvas = typeof document !== 'undefined'
    ? (document.getElementById('game') as HTMLCanvasElement | null)
    : null;
  if (canvas) attachInputListeners(state, canvas);
}

function exitArena(): void {
  _active = false;
  _paused = false;
  stopHeartbeat();
  stopMusic();
  stopListening();

  const canvas = typeof document !== 'undefined'
    ? (document.getElementById('game') as HTMLCanvasElement | null)
    : null;
  if (canvas) detachInputListeners(canvas);

  _moveLeft    = false;
  _moveRight   = false;
  _pointerHeld = false;
  _particles   = [];
}

// ── updateArena ───────────────────────────────────────────────────────────

/**
 * Advance the arena simulation by dtSec seconds.
 * Called from main.ts game loop when phase is SURVIVE.
 * Also detects phase transitions to wire/unwire arena state.
 */
export function updateArena(state: GameState, dtSec: number): void {
  const phase = state.phase.name;

  // ── Transition detection ───────────────────────────────────────────
  if (phase !== _prevPhase) {
    if (_prevPhase === 'SURVIVE') exitArena();
    if (phase === 'SURVIVE')      enterArena(state);
    _prevPhase = phase;
  }

  if (!_active || phase !== 'SURVIVE') return;

  // ── Adaptive quality: EMA of frame dt ─────────────────────────────
  const dtMs = dtSec * 1000;
  _dtEma = _dtEma * 0.9 + dtMs * 0.1;
  if (_dtEma > 19 && _quality > 0.25) {
    _quality = Math.max(0.25, _quality * 0.85);
  } else if (_dtEma < 13 && _quality < 1) {
    _quality = Math.min(1, _quality + 0.05);
  }

  // ── Pause check: freeze all simulation but still notice phase exit ─
  if (_paused) {
    // Detect external phase transition (e.g. debug skip) while paused
    if (state.phase.name !== 'SURVIVE') {
      exitArena();
    }
    return;
  }

  const monster = state.phase.monster;

  // ── Sync layout from actual canvas dimensions ─────────────────────
  const canvas = typeof document !== 'undefined'
    ? (document.getElementById('game') as HTMLCanvasElement | null)
    : null;
  if (canvas) {
    const dpr = window.devicePixelRatio ?? 1;
    _canvasW  = canvas.width  / dpr;   // CSS px
    _groundY  = canvas.height / dpr * 0.80;
    _monY     = _groundY;
  }

  // ── Monster movement ───────────────────────────────────────────────
  const spd = monster.stats.speed * (_rallyTimer > 0 ? 1.25 : 1);
  if (_moveLeft  && !_moveRight) _monX -= spd * dtSec;
  if (_moveRight && !_moveLeft)  _monX += spd * dtSec;
  if (_pointerHeld) {
    const dx  = _pointerTargetX - _monX;
    const step = spd * dtSec;
    if (Math.abs(dx) > step) _monX += Math.sign(dx) * step;
    else _monX = _pointerTargetX;
  }
  _monX = clampMonX(_monX);

  // ── Cooldown ticks ─────────────────────────────────────────────────
  for (let i = 0; i < 4; i++) {
    if ((_abilityCd[i] ?? 0) > 0) _abilityCd[i] = Math.max(0, (_abilityCd[i] ?? 0) - dtSec);
  }

  // ── Buff timers ────────────────────────────────────────────────────
  if (_rallyTimer       > 0) _rallyTimer       = Math.max(0, _rallyTimer       - dtSec);
  if (_incorporealTimer > 0) _incorporealTimer = Math.max(0, _incorporealTimer - dtSec);
  if (_dashInvulnTimer  > 0) _dashInvulnTimer  = Math.max(0, _dashInvulnTimer  - dtSec);

  // ── Energy regen ───────────────────────────────────────────────────
  state.energy = Math.min(monster.stats.maxEnergy, state.energy + 5 * dtSec);

  // ── Spawn queue ────────────────────────────────────────────────────
  if (_spawnQueue > 0) {
    _spawnTimer -= dtSec;
    if (_spawnTimer <= 0) {
      spawnNextVillager(state.wave);
      _spawnTimer = 1.1;
    }
  }

  // ── Villager update ────────────────────────────────────────────────
  for (const v of _villagers) {
    if (!v.alive) continue;

    // Stun / freeze
    if (v.stunTimer  > 0) v.stunTimer  = Math.max(0, v.stunTimer  - dtSec);
    if (v.freezeTimer > 0) v.freezeTimer = Math.max(0, v.freezeTimer - dtSec);

    const immobile = v.stunTimer > 0 || v.freezeTimer > 0;

    // Knockback decay
    if (v.knockbackVx !== 0) {
      v.x += v.knockbackVx * dtSec;
      const decay = Math.sign(v.knockbackVx) * Math.min(Math.abs(v.knockbackVx), 1200 * dtSec);
      v.knockbackVx -= decay;
      if (Math.abs(v.knockbackVx) < 1) v.knockbackVx = 0;
    }

    // Movement toward monster
    if (!immobile && v.knockbackVx === 0) {
      const dx = _monX - v.x;
      if (Math.abs(dx) > 2) {
        v.x += Math.sign(dx) * v.speed * dtSec;
        v.facing = dx > 0 ? 1 : -1;
      }
    }

    // Attack monster in contact range
    const contactRange = 55;
    if (!immobile && Math.abs(v.x - _monX) < contactRange) {
      v.attackCd -= dtSec;
      if (v.attackCd <= 0) {
        v.attackCd = 0.8;
        const invulnerable = _incorporealTimer > 0 || _dashInvulnTimer > 0;
        if (!invulnerable) {
          if (_shieldCharges > 0) {
            _shieldCharges--;
            spawnEffect('ring', _monX, 0, _groundY, 50, 0.2, '#00e5ff');
          } else {
            state.hp = Math.max(0, state.hp - 8);
            if (state.hp <= 0) {
              state.hp = 0;
              // Stash recap before nextPhase wipes the SURVIVE phase
              if (state.phase.name === 'SURVIVE') {
                _lastRunRecap = {
                  build:   state.phase.build,
                  monster: state.phase.monster,
                };
                // Record the completed run in the Lab Journal
                recordRun(state.score, state.phase.build);
              }
              nextPhase(state);
              return;
            }
          }
        }
      }
    } else {
      // Reset attackCd when out of range so they don't instantly attack on re-entry
      if (v.attackCd < 0.4) v.attackCd = 0.4;
    }
  }

  // ── Arms auto-attack ───────────────────────────────────────────────
  const armsAbility = monster.abilities[2];
  if (armsAbility) {
    const armsCd = _abilityCd[2] ?? 0;
    if (armsCd <= 0) {
      // Find a valid target — range depends on the effectKey
      const autoRange = autoAttackRange(armsAbility.effectKey);
      const target = nearestVillager(_monX, autoRange);
      if (target) {
        _abilityCd[2] = armsAbility.cooldownSec;
        dispatchEffect(armsAbility.effectKey, state, monster);
      }
    }
  }

  // ── Effects update ─────────────────────────────────────────────────
  for (const ef of _effects) ef.life -= dtSec;
  // Remove expired effects
  for (let i = _effects.length - 1; i >= 0; i--) {
    if ((_effects[i]?.life ?? 0) <= 0) _effects.splice(i, 1);
  }

  // ── Particles update ───────────────────────────────────────────────
  const gravity = 300; // CSS px/s²
  for (const p of _particles) {
    p.vy += gravity * dtSec;
    p.x  += p.vx * dtSec;
    p.y  += p.vy * dtSec;
    p.life -= dtSec;
  }
  for (let i = _particles.length - 1; i >= 0; i--) {
    if ((_particles[i]?.life ?? 0) <= 0) _particles.splice(i, 1);
  }

  // ── Wave completion check ──────────────────────────────────────────
  if (!_waveComplete && _spawnQueue === 0 && _villagers.every(v => !v.alive)) {
    _waveComplete = true;
    // Award wave-clear bonus
    state.score += 25 * state.wave;
    state.wave++;
    setMusicWave(state.wave);
    // Clear dead villagers, build next wave
    _villagers = [];
    buildWaveQueue(state.wave, state.seed);
  }
}

/** Returns the auto-attack range for a given arms effectKey. */
function autoAttackRange(effectKey: string): number {
  switch (effectKey) {
    case 'rangedZap':    return 520;
    case 'hauntStrike':  return 460;
    case 'frenzySwipe':  return 110;
    case 'clawStrike':   return 100;
    case 'brawlerPunch': return 95;
    default:             return 100;
  }
}

// ── drawArena ─────────────────────────────────────────────────────────────

/**
 * Render the full arena scene onto ctx.
 * W, H are canvas pixel dimensions; dpr converts to CSS px for layout.
 */
export function drawArena(
  ctx:   CanvasRenderingContext2D,
  state: GameState,
  W:     number,
  H:     number,
  dpr:   number,
): void {
  if (state.phase.name !== 'SURVIVE') return;

  const t         = state.elapsed / 1000;
  const monster   = state.phase.monster;
  const groundY   = H * 0.80;        // canvas pixels
  const cssScale  = dpr;             // 1 CSS px = dpr canvas px

  // ── Backdrop ─────────────────────────────────────────────────────
  drawBackdrop(ctx, W, H, groundY, t, dpr);

  // ── Villagers (behind monster in z-order) ─────────────────────────
  for (const v of _villagers) {
    if (!v.alive) continue;
    drawVillager(ctx, v, groundY, t, dpr);
  }

  // ── Monster ───────────────────────────────────────────────────────
  const monXPx  = _monX * dpr;         // CSS → canvas px
  const monYPx  = groundY;
  const monH    = 190;                 // model height in unscaled coords
  const monScale = Math.min((H * 0.42) / monH, 1.6 * dpr);

  const isInvulnerable = _incorporealTimer > 0 || _dashInvulnTimer > 0;

  ctx.save();
  if (isInvulnerable) ctx.globalAlpha = 0.4;

  // Mirror based on facing direction
  const facing = monsterFacing();
  if (facing === -1) {
    ctx.save();
    ctx.translate(monXPx * 2, 0);
    ctx.scale(-1, 1);
    drawMonster(ctx, monster, monXPx, monYPx, monScale, t);
    ctx.restore();
  } else {
    drawMonster(ctx, monster, monXPx, monYPx, monScale, t);
  }
  ctx.restore();

  // Shield ring
  if (_shieldCharges > 0) {
    ctx.save();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth   = 3 * dpr;
    ctx.globalAlpha = 0.7 + Math.sin(t * 6) * 0.2;
    ctx.beginPath();
    ctx.arc(monXPx, monYPx - 80 * dpr, 70 * dpr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Mark reticles (target-lock)
  for (const v of _villagers) {
    if (!v.alive || !v.marked) continue;
    drawReticle(ctx, v.x * dpr, groundY - 30 * dpr, 18 * dpr, t);
  }

  // ── Effects ───────────────────────────────────────────────────────
  for (const ef of _effects) {
    drawEffect(ctx, ef, dpr);
  }

  // ── Particles ─────────────────────────────────────────────────────
  for (const p of _particles) {
    if (p.life <= 0) continue;
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = p.color;
    const px = p.x * dpr;   // CSS px → canvas px
    const py = p.y * dpr;   // CSS px → canvas px
    const pr = p.r * dpr;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Backdrop ──────────────────────────────────────────────────────────────

function drawBackdrop(
  ctx:    CanvasRenderingContext2D,
  W:      number,
  H:      number,
  groundY: number,
  t:      number,
  dpr:    number,
): void {
  // Moon
  const moonR = 36 * dpr;
  const moonX = W * 0.82;
  const moonY = H * 0.12;
  ctx.save();
  ctx.fillStyle = '#e8e0c0';
  ctx.shadowColor = '#ffe8a0';
  ctx.shadowBlur  = 30 * dpr;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Ground
  const gr = ctx.createLinearGradient(0, groundY, 0, H);
  gr.addColorStop(0, '#1a2a1a');
  gr.addColorStop(1, '#0a0f0a');
  ctx.fillStyle = gr;
  ctx.fillRect(0, groundY, W, H - groundY);

  // Ground line
  ctx.strokeStyle = '#2a4a2a';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // Fence silhouettes
  drawFence(ctx, W, groundY, dpr);

  // Gravestones
  drawGravestones(ctx, W, groundY, dpr);
}

function drawFence(
  ctx:     CanvasRenderingContext2D,
  W:       number,
  groundY: number,
  dpr:     number,
): void {
  const postW  = 6  * dpr;
  const postH  = 42 * dpr;
  const railY  = groundY - postH * 0.6;
  const spacing = 32 * dpr;

  ctx.fillStyle   = '#1c2c1c';
  ctx.strokeStyle = '#2a4a2a';
  ctx.lineWidth   = 1;

  // Horizontal rail
  ctx.fillRect(0, railY, W, 4 * dpr);

  // Pickets
  for (let x = 0; x < W; x += spacing) {
    ctx.fillRect(x, groundY - postH, postW, postH);
    // Pointed top
    ctx.beginPath();
    ctx.moveTo(x, groundY - postH);
    ctx.lineTo(x + postW / 2, groundY - postH - 8 * dpr);
    ctx.lineTo(x + postW, groundY - postH);
    ctx.fill();
  }
}

function drawGravestones(
  ctx:     CanvasRenderingContext2D,
  W:       number,
  groundY: number,
  dpr:     number,
): void {
  // Simple gravestones at fixed positions (decorative only)
  const positions = [0.12, 0.32, 0.65, 0.88];
  for (const frac of positions) {
    const gx = W * frac;
    const gw = 22 * dpr;
    const gh = 32 * dpr;
    ctx.fillStyle   = '#1a2420';
    ctx.strokeStyle = '#2a4a2a';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.roundRect(gx - gw / 2, groundY - gh, gw, gh, [gw / 2, gw / 2, 2, 2]);
    ctx.fill();
    ctx.stroke();
  }
}

// ── Villager renderer ─────────────────────────────────────────────────────

function drawVillager(
  ctx:     CanvasRenderingContext2D,
  v:       Villager,
  groundY: number,
  t:       number,
  dpr:     number,
): void {
  const cx = v.x * dpr;
  const gy = groundY;
  const sc = dpr;

  ctx.save();

  // Freeze tint
  if (v.freezeTimer > 0) {
    ctx.globalAlpha = 0.7;
    ctx.filter = 'hue-rotate(180deg) brightness(1.5)';
  }

  // Stun stars (simple visual cue: yellow flash above head)
  if (v.stunTimer > 0) {
    ctx.fillStyle = '#ffdd00';
    ctx.font = `${10 * sc}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillText('★', cx, gy - 68 * sc);
  }

  // Body
  ctx.fillStyle   = '#5a4030';
  ctx.strokeStyle = '#3a2820';
  ctx.lineWidth   = 1.5;
  // Torso
  ctx.beginPath();
  ctx.roundRect(cx - 10 * sc, gy - 50 * sc, 20 * sc, 30 * sc, 3);
  ctx.fill(); ctx.stroke();

  // Head
  ctx.fillStyle = '#c8a070';
  ctx.beginPath();
  ctx.arc(cx, gy - 60 * sc, 11 * sc, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Legs
  ctx.strokeStyle = '#3a2820';
  ctx.lineWidth = 4 * sc;
  ctx.beginPath();
  ctx.moveTo(cx - 5 * sc, gy - 20 * sc); ctx.lineTo(cx - 6 * sc, gy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 5 * sc, gy - 20 * sc); ctx.lineTo(cx + 6 * sc, gy);
  ctx.stroke();

  // Torch or pitchfork
  if (v.torch) {
    drawTorch(ctx, cx + v.facing * 14 * sc, gy - 40 * sc, t + v.flickerPhase, sc);
  } else {
    drawPitchfork(ctx, cx + v.facing * 14 * sc, gy - 40 * sc, v.facing, sc);
  }

  // HP bar
  const barW = 28 * sc;
  const hpFrac = Math.max(0, v.hp / v.maxHp);
  ctx.fillStyle = '#330000';
  ctx.fillRect(cx - barW / 2, gy - 78 * sc, barW, 4 * sc);
  ctx.fillStyle = hpFrac > 0.5 ? '#39ff14' : hpFrac > 0.25 ? '#ffb300' : '#ff3c3c';
  ctx.fillRect(cx - barW / 2, gy - 78 * sc, barW * hpFrac, 4 * sc);

  ctx.restore();
}

function drawTorch(
  ctx:   CanvasRenderingContext2D,
  x:     number,
  y:     number,
  t:     number,
  sc:    number,
): void {
  // Handle
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth   = 3 * sc;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y + 20 * sc);
  ctx.stroke();

  // Flame — flickering
  const flicker = Math.sin(t * 14) * 3;
  const gy2 = ctx.createRadialGradient(x, y - 6 * sc, 2, x, y, 10 * sc);
  gy2.addColorStop(0, '#ffffa0');
  gy2.addColorStop(0.4, '#ff8c00');
  gy2.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = gy2;
  ctx.beginPath();
  ctx.ellipse(x, y - 4 * sc + flicker, (5 + Math.abs(flicker) * 0.3) * sc, 9 * sc, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPitchfork(
  ctx:   CanvasRenderingContext2D,
  x:     number,
  y:     number,
  facing: 1 | -1,
  sc:    number,
): void {
  ctx.strokeStyle = '#7a6050';
  ctx.lineWidth   = 2.5 * sc;
  // Handle
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y + 20 * sc);
  ctx.stroke();
  // Tines
  ctx.lineWidth = 2 * sc;
  for (const off of [-5, 0, 5]) {
    ctx.beginPath();
    ctx.moveTo(x + off * sc, y);
    ctx.lineTo(x + off * sc, y - 14 * sc);
    ctx.stroke();
  }
  // Cross-bar
  ctx.beginPath();
  ctx.moveTo(x - 5 * sc, y - 8 * sc);
  ctx.lineTo(x + 5 * sc, y - 8 * sc);
  ctx.stroke();
}

// ── Effect renderer ───────────────────────────────────────────────────────

function drawEffect(ctx: CanvasRenderingContext2D, ef: Effect, dpr: number): void {
  const alpha = Math.max(0, ef.life / ef.maxLife);
  ctx.save();
  ctx.globalAlpha = alpha;

  const x  = ef.x  * dpr;
  const y  = (ef.y2 ?? ef.y);
  const x2 = (ef.x2 ?? ef.x) * dpr;

  switch (ef.kind) {
    case 'flash': {
      const r = ef.r * dpr;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, ef.color);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'ring': {
      const progress = 1 - alpha;
      const r = ef.r * dpr * (0.3 + progress * 0.7);
      ctx.strokeStyle = ef.color;
      ctx.lineWidth   = 3 * dpr * alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'bolt': {
      // Lightning polyline between (x, ef.y) and (x2, ef.y2)
      const startX = x;
      const startY = ef.y;
      const endX   = x2;
      const endY   = ef.y2 ?? ef.y;
      ctx.strokeStyle = ef.color;
      ctx.lineWidth   = ef.r * dpr * alpha;
      ctx.shadowColor = ef.color;
      ctx.shadowBlur  = 8 * dpr;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      // Jag points for lightning shape
      const steps = 5;
      for (let i = 1; i < steps; i++) {
        const frac = i / steps;
        const mx = startX + (endX - startX) * frac + (Math.random() - 0.5) * 20 * dpr;
        const my = startY + (endY - startY) * frac + (Math.random() - 0.5) * 10 * dpr;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }

    case 'tendril': {
      // Wispy curved tendril from monster to target
      const startX = x;
      const startY = ef.y;
      const endX   = x2;
      const endY   = ef.y2 ?? ef.y;
      const mx     = (startX + endX) / 2 + (Math.random() - 0.5) * 30 * dpr;
      const my     = (startY + endY) / 2 - 20 * dpr;
      ctx.strokeStyle = ef.color;
      ctx.lineWidth   = ef.r * dpr * alpha * 0.5;
      ctx.shadowColor = ef.color;
      ctx.shadowBlur  = 6 * dpr;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(mx, my, endX, endY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }

    case 'stomp': {
      // Ground ring expanding outward
      const progress = 1 - alpha;
      const r = ef.r * dpr * (0.5 + progress * 0.5);
      ctx.strokeStyle = ef.color;
      ctx.lineWidth   = 5 * dpr * alpha;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// ── Reticle (target-lock mark) ────────────────────────────────────────────

function drawReticle(
  ctx: CanvasRenderingContext2D,
  x:   number,
  y:   number,
  r:   number,
  t:   number,
): void {
  ctx.save();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth   = 1.5;
  ctx.globalAlpha = 0.8 + Math.sin(t * 8) * 0.15;
  // Rotating bracket marks
  ctx.translate(x, y);
  ctx.rotate(t * 1.5);
  const gap = r * 0.4;
  for (let q = 0; q < 4; q++) {
    ctx.save();
    ctx.rotate(q * Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(r, -gap);
    ctx.lineTo(r, 0);
    ctx.lineTo(r - gap, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
