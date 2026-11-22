/**
 * state.ts — GameState skeleton
 *
 * GameState is the single mutable store. Renderers and systems READ it;
 * only the state machine mutates it.
 *
 * Phase is a discriminated union so TypeScript can narrow per-phase data.
 */

import { rng } from './rng.js';
import { MonsterBuild, ResolvedMonster, buildMonster } from './monster.js';

export type { MonsterBuild } from './monster.js';

// ── Donor & slot types (re-exported for consumers) ───────────────────────

export type DonorId = 'vampire' | 'robot' | 'werewolf' | 'ghost' | 'human';
export type SlotId  = 'head' | 'torso' | 'arms' | 'legs';

// ── Default build (head vampire, torso robot, arms werewolf, legs ghost) ─

export const DEFAULT_BUILD: MonsterBuild = {
  head:  'vampire',
  torso: 'robot',
  arms:  'werewolf',
  legs:  'ghost',
};

// ── Phase discriminants ───────────────────────────────────────────────────

export type PhaseName = 'TITLE' | 'STITCH' | 'ZAP' | 'SURVIVE' | 'END';

interface TitlePhase   { name: 'TITLE'   }

/** STITCH carries the current build selection and a resolved monster
 *  derived from it via buildMonster().  Both are updated together
 *  whenever the player selects a new part. */
interface StitchPhase  {
  name:    'STITCH';
  build:   MonsterBuild;
  monster: ResolvedMonster;
}

interface ZapPhase     { name: 'ZAP';    build: MonsterBuild; monster: ResolvedMonster; charge: number }
interface SurvivePhase { name: 'SURVIVE'; build: MonsterBuild; monster: ResolvedMonster; charge: number }
interface EndPhase     { name: 'END';    score: number; wave: number }

export type Phase =
  | TitlePhase
  | StitchPhase
  | ZapPhase
  | SurvivePhase
  | EndPhase;

// ── Top-level state ───────────────────────────────────────────────────────

export interface GameState {
  phase:   Phase;
  seed:    number;
  /** Milliseconds since the game loop started. */
  elapsed: number;
  /** Current frame timestamp (from rAF). */
  now:     number;

  // Arena fields — zeroed until SURVIVE
  score:   number;
  hp:      number;
  maxHp:   number;
  energy:  number;
  wave:    number;
}

// ── Initial state factory ─────────────────────────────────────────────────

export function makeInitialState(): GameState {
  return {
    phase:   { name: 'TITLE' },
    seed:    rng.seed,
    elapsed: 0,
    now:     0,
    score:   0,
    hp:      100,
    maxHp:   100,
    energy:  0,
    wave:    0,
  };
}

// ── Phase transition helpers ──────────────────────────────────────────────

export function transitionTo(state: GameState, phase: Phase): void {
  state.phase = phase;
}

/** Advance to the next phase in the linear flow. */
export function nextPhase(state: GameState): void {
  const p = state.phase;
  switch (p.name) {
    case 'TITLE':
      transitionTo(state, {
        name:    'STITCH',
        build:   { ...DEFAULT_BUILD },
        monster: buildMonster(DEFAULT_BUILD),
      });
      break;
    case 'STITCH':
      transitionTo(state, {
        name:    'ZAP',
        build:   p.build,
        monster: p.monster,
        charge:  0,
      });
      break;
    case 'ZAP':
      transitionTo(state, {
        name:    'SURVIVE',
        build:   p.build,
        monster: p.monster,
        charge:  p.charge,
      });
      state.hp     = p.monster.stats.maxHp;
      state.maxHp  = p.monster.stats.maxHp;
      state.energy = p.charge;
      state.wave   = 1;
      state.score  = 0;
      break;
    case 'SURVIVE':
      transitionTo(state, {
        name:  'END',
        score: state.score,
        wave:  state.wave,
      });
      break;
    case 'END':
      transitionTo(state, { name: 'TITLE' });
      break;
  }
}

/**
 * Update the STITCH build in place.  Re-resolves the monster immediately.
 * No-op if the current phase is not STITCH.
 */
export function stitchSelectPart(
  state:  GameState,
  slot:   SlotId,
  donor:  DonorId,
): void {
  if (state.phase.name !== 'STITCH') return;
  const newBuild: MonsterBuild = { ...state.phase.build, [slot]: donor };
  state.phase = {
    name:    'STITCH',
    build:   newBuild,
    monster: buildMonster(newBuild),
  };
}
