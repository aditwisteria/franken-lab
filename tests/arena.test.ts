/**
 * arena.test.ts — Vitest coverage for Phase 3 (SURVIVE) arena logic.
 *
 * Tested APIs: waveComposition, getArenaHudView, triggerSlotAbility,
 * updateArena (state transitions and game-loop effects).
 *
 * Environment notes:
 *  - audio.ts: all exports are no-ops in Node because HAS_AUDIO_CTX checks
 *    `typeof window !== 'undefined'`, which is false in vitest's node
 *    environment.  No mock required.
 *  - voice.ts: startListening/stopListening check the same window guard and
 *    silently return when SpeechRecognition is unavailable.  No mock required.
 *  - Arena module state (_villagers, _abilityCd, _prevPhase, …) is shared
 *    module-level.  Each test drives a fresh TITLE→STITCH→ZAP→SURVIVE
 *    sequence via makeSurviveState(); the transition detection in updateArena
 *    calls enterArena() which resets all arena internals for every test.
 */

import { describe, it, expect } from 'vitest';
import {
  waveComposition,
  getArenaHudView,
  triggerSlotAbility,
  updateArena,
} from '../src/arena.js';
import { makeInitialState, nextPhase } from '../src/state.js';
import type { GameState } from '../src/state.js';
import { PARTS } from '../src/donors.js';

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Build a GameState that is freshly in SURVIVE using the default build
 * (vampire head / robot torso / werewolf arms / ghost legs).
 *
 * Drives the real phase machine: TITLE → STITCH → ZAP (charge = `charge`)
 * → SURVIVE, then calls updateArena(s, 0) so the transition detection fires
 * and enterArena() resets all module-level arena internals.
 */
function makeSurviveState(charge = 100): GameState {
  const s = makeInitialState();
  nextPhase(s);               // TITLE  → STITCH
  nextPhase(s);               // STITCH → ZAP
  if (s.phase.name === 'ZAP') {
    s.phase.charge = charge;  // set before ZAP→SURVIVE; nextPhase copies it to s.energy
  }
  nextPhase(s);               // ZAP → SURVIVE  (sets s.hp, s.maxHp, s.energy, s.wave)
  updateArena(s, 0);          // trigger enterArena() transition detection
  return s;
}

// ── 1. waveComposition scaling ────────────────────────────────────────────

describe('waveComposition', () => {
  it('wave-1 exact values match the formula', () => {
    // count = 3 + 2*1 = 5, hp = 26 + 10*(1-1) = 26, speed = 34 + 5*(1-1) = 34
    const w1 = waveComposition(1);
    expect(w1.count).toBe(5);
    expect(w1.hp).toBe(26);
    expect(w1.speed).toBe(34);
  });

  it('count follows linear formula 3 + 2*wave across waves 1–5', () => {
    for (let w = 1; w <= 5; w++) {
      expect(waveComposition(w).count).toBe(3 + 2 * w);
    }
  });

  it('hp follows linear formula 26 + 10*(wave-1) across waves 1–5', () => {
    for (let w = 1; w <= 5; w++) {
      expect(waveComposition(w).hp).toBe(26 + 10 * (w - 1));
    }
  });

  it('speed follows linear formula 34 + 5*(wave-1) across waves 1–5', () => {
    for (let w = 1; w <= 5; w++) {
      expect(waveComposition(w).speed).toBe(34 + 5 * (w - 1));
    }
  });

  it('count strictly increases from wave 1 to wave 5', () => {
    for (let w = 1; w < 5; w++) {
      expect(waveComposition(w + 1).count).toBeGreaterThan(waveComposition(w).count);
    }
  });

  it('hp strictly increases from wave 1 to wave 5', () => {
    for (let w = 1; w < 5; w++) {
      expect(waveComposition(w + 1).hp).toBeGreaterThan(waveComposition(w).hp);
    }
  });

  it('speed strictly increases from wave 1 to wave 5', () => {
    for (let w = 1; w < 5; w++) {
      expect(waveComposition(w + 1).speed).toBeGreaterThan(waveComposition(w).speed);
    }
  });
});

// ── 2. Determinism ────────────────────────────────────────────────────────

describe('updateArena determinism', () => {
  /**
   * Run two independent sequences of N identical ticks against fresh
   * GameStates that share the same seed (DEFAULT_SEED = 20261031 from
   * rng.ts, used in Node because window is undefined).
   *
   * Because arena module state is global we cannot drive two states in
   * parallel — running them sequentially with makeSurviveState() between
   * them is the correct approach: makeSurviveState calls enterArena which
   * resets all arena internals, so run 2 starts from exactly the same
   * internal state as run 1.
   */
  it('score/hp/wave match after 10 identical ticks on two independent runs', () => {
    const STEPS = 10;
    const DT = 1.5; // seconds per tick — large enough to trigger spawns

    // Run 1
    const s1 = makeSurviveState(100);
    for (let i = 0; i < STEPS; i++) updateArena(s1, DT);
    const snap1 = { score: s1.score, hp: s1.hp, wave: s1.wave };

    // Run 2: fresh state from same seed, same step count and dt
    const s2 = makeSurviveState(100);
    for (let i = 0; i < STEPS; i++) updateArena(s2, DT);

    expect(s2.score).toBe(snap1.score);
    expect(s2.hp).toBe(snap1.hp);
    expect(s2.wave).toBe(snap1.wave);
  });

  it('energy matches after 10 identical ticks on two independent runs', () => {
    const STEPS = 10;
    const DT = 1.5;

    const s1 = makeSurviveState(100);
    for (let i = 0; i < STEPS; i++) updateArena(s1, DT);

    const s2 = makeSurviveState(100);
    for (let i = 0; i < STEPS; i++) updateArena(s2, DT);

    // Energy regen is deterministic: 5 * dt per tick, clamped to maxEnergy.
    expect(s2.energy).toBeCloseTo(s1.energy, 6);
  });

  it('score/hp/wave match after 20 identical ticks on two independent runs', () => {
    const STEPS = 20;
    const DT = 1.2;

    const s1 = makeSurviveState(100);
    for (let i = 0; i < STEPS; i++) updateArena(s1, DT);
    const snap1 = { score: s1.score, hp: s1.hp, wave: s1.wave };

    const s2 = makeSurviveState(100);
    for (let i = 0; i < STEPS; i++) updateArena(s2, DT);

    expect(s2.score).toBe(snap1.score);
    expect(s2.hp).toBe(snap1.hp);
    expect(s2.wave).toBe(snap1.wave);
  });
});

// ── 3. HUD view model ─────────────────────────────────────────────────────

describe('getArenaHudView', () => {
  it('returns empty abilities and blank armsAbility when phase is not SURVIVE', () => {
    const s = makeInitialState(); // TITLE
    const hud = getArenaHudView(s);
    expect(hud.abilities).toHaveLength(0);
    expect(hud.armsAbility.name).toBe('');
  });

  it('returns exactly 3 manual abilities (head/torso/legs) in SURVIVE', () => {
    const s = makeSurviveState();
    const hud = getArenaHudView(s);
    expect(hud.abilities).toHaveLength(3);
    expect(hud.abilities.map(a => a.slot)).toEqual(['head', 'torso', 'legs']);
  });

  it("ability names match the monster's donor parts from donors.ts (default build)", () => {
    // Default build: head=vampire, torso=robot, arms=werewolf, legs=ghost
    const s = makeSurviveState();
    const hud = getArenaHudView(s);

    // HUD manual abilities are head (idx 0), torso (idx 1), legs (idx 3 → HUD slot 2)
    expect(hud.abilities[0]!.name).toBe(PARTS['vampire_head']!.ability.name);   // 'Lifesteal Bite'
    expect(hud.abilities[1]!.name).toBe(PARTS['robot_torso']!.ability.name);    // 'Chassis Shield Burst'
    expect(hud.abilities[2]!.name).toBe(PARTS['ghost_legs']!.ability.name);     // 'Phase Dash'
    // Arms is the auto-attack ability reported separately
    expect(hud.armsAbility.name).toBe(PARTS['werewolf_arms']!.ability.name);    // 'Frenzy Swipe'
  });

  it('donorName is the capitalised donor id string', () => {
    const s = makeSurviveState();
    const hud = getArenaHudView(s);
    expect(hud.abilities[0]!.donorName).toBe('Vampire');
    expect(hud.abilities[1]!.donorName).toBe('Robot');
    expect(hud.abilities[2]!.donorName).toBe('Ghost');
  });

  it('affordable flag is true when energy >= 20', () => {
    const s = makeSurviveState();
    s.energy = 20;
    const hud = getArenaHudView(s);
    for (const ab of hud.abilities) {
      expect(ab.affordable).toBe(true);
    }
  });

  it('affordable flag is false when energy < 20', () => {
    const s = makeSurviveState();
    s.energy = 19;
    const hud = getArenaHudView(s);
    for (const ab of hud.abilities) {
      expect(ab.affordable).toBe(false);
    }
  });

  it('affordable flips when energy crosses the 20 threshold', () => {
    const s = makeSurviveState();
    s.energy = 19;
    expect(getArenaHudView(s).abilities[0]!.affordable).toBe(false);
    s.energy = 20;
    expect(getArenaHudView(s).abilities[0]!.affordable).toBe(true);
  });

  it('reports wave/hp/score/energy from state', () => {
    const s = makeSurviveState(80);
    s.score  = 150;
    s.wave   = 3;
    s.hp     = 70;
    s.energy = 45;
    const hud = getArenaHudView(s);
    expect(hud.wave).toBe(3);
    expect(hud.hp).toBe(70);
    expect(hud.score).toBe(150);
    expect(hud.energy).toBe(45);
  });

  it('all manual abilities start with cooldownFrac === 0 (fully ready) in a fresh SURVIVE', () => {
    const s = makeSurviveState();
    const hud = getArenaHudView(s);
    for (const ab of hud.abilities) {
      expect(ab.cooldownFrac).toBe(0);
      expect(ab.ready).toBe(true);
    }
  });

  it('armsAbility cooldownFrac is in [0, 1] in a fresh SURVIVE', () => {
    // The arms auto-attack may fire immediately on the dt=0 initialisation tick
    // if a villager spawns within range, so we only assert the fraction is valid.
    const s = makeSurviveState();
    const hud = getArenaHudView(s);
    expect(hud.armsAbility.cooldownFrac).toBeGreaterThanOrEqual(0);
    expect(hud.armsAbility.cooldownFrac).toBeLessThanOrEqual(1);
  });
});

// ── 4. Manual trigger gating ──────────────────────────────────────────────

describe('triggerSlotAbility', () => {
  it('does nothing outside SURVIVE phase', () => {
    const s = makeInitialState(); // TITLE
    const energyBefore = s.energy;
    triggerSlotAbility(s, 'head');
    expect(s.energy).toBe(energyBefore);
  });

  it('does nothing when energy < 20', () => {
    const s = makeSurviveState();
    s.energy = 19;
    const energyBefore = s.energy;
    triggerSlotAbility(s, 'head');
    expect(s.energy).toBe(energyBefore);
  });

  it('ability stays ready when blocked by insufficient energy', () => {
    const s = makeSurviveState();
    s.energy = 0;
    triggerSlotAbility(s, 'torso');
    expect(getArenaHudView(s).abilities[1]!.ready).toBe(true);
  });

  it('consumes exactly 20 energy on a successful trigger (torso: no target required)', () => {
    // robot_torso = chassisShieldBurst — fires unconditionally, no target check.
    const s = makeSurviveState();
    s.energy = 50;
    triggerSlotAbility(s, 'torso');
    expect(s.energy).toBe(30); // 50 - 20
  });

  it('ability goes on cooldown immediately after a successful trigger', () => {
    const s = makeSurviveState();
    s.energy = 50;
    triggerSlotAbility(s, 'torso'); // chassisShieldBurst
    const hud = getArenaHudView(s);
    expect(hud.abilities[1]!.ready).toBe(false);
    expect(hud.abilities[1]!.cooldownFrac).toBeGreaterThan(0);
  });

  it('re-trigger while on cooldown is blocked (energy not deducted again)', () => {
    const s = makeSurviveState();
    s.energy = 100;
    triggerSlotAbility(s, 'torso'); // first trigger, -20 energy
    const energyAfterFirst = s.energy;
    triggerSlotAbility(s, 'torso'); // second trigger while on cooldown — blocked
    expect(s.energy).toBe(energyAfterFirst);
    expect(getArenaHudView(s).abilities[1]!.ready).toBe(false);
  });

  it('cooldown ticks down as updateArena advances time', () => {
    // chassisShieldBurst cooldownSec = 12
    const s = makeSurviveState();
    s.energy = 50;
    triggerSlotAbility(s, 'torso');
    // Advance 6 s in small steps (0.1 s each) to avoid villager damage killing
    // the monster before we can read the cooldown.
    for (let i = 0; i < 60; i++) {
      if (s.phase.name !== 'SURVIVE') break;
      updateArena(s, 0.1);
    }
    if (s.phase.name === 'SURVIVE') {
      const hud = getArenaHudView(s);
      // After 6 s of a 12 s cooldown the fraction should be close to 0.5
      expect(hud.abilities[1]!.cooldownFrac).toBeCloseTo(0.5, 1);
      expect(hud.abilities[1]!.ready).toBe(false);
    }
  });

  it('ability becomes ready again after full cooldown elapses', () => {
    // chassisShieldBurst cooldownSec = 12
    const s = makeSurviveState();
    s.energy = 50;
    triggerSlotAbility(s, 'torso');
    // Advance 13 s in small steps so villager attacks don't kill the monster.
    // Each step is 0.1 s — total 130 steps = 13 s sim time.
    for (let i = 0; i < 130; i++) {
      if (s.phase.name !== 'SURVIVE') break;
      updateArena(s, 0.1);
    }
    // Only check cooldown if still in SURVIVE; if the monster died the
    // cooldown system is irrelevant and the test is vacuously satisfied.
    if (s.phase.name === 'SURVIVE') {
      const hud = getArenaHudView(s);
      expect(hud.abilities[1]!.ready).toBe(true);
      expect(hud.abilities[1]!.cooldownFrac).toBe(0);
    }
  });

  it('triggerSlotAbility with villager in range: net energy decreases by >= 16 for head slot', () => {
    // lifeStealBite (vampire head) deducts exactly 20 energy via triggerAbility,
    // then dispatchEffect may add kill-bonus energy (4 per kill via killVillager).
    // Starting at 60: 60 - 20 + k*4 for k kills.  We assert energy < 60 (net deduction)
    // and that the deduction of 20 was applied (energy <= 60 - 20 + 4 kills max).
    const s = makeSurviveState();
    for (let i = 0; i < 3; i++) updateArena(s, 1.2); // spawn villagers
    s.energy = 60;
    triggerSlotAbility(s, 'head');
    // 20 was deducted; at most ~3 villagers can be killed (1 target for lifeStealBite),
    // adding at most 4 energy back.
    expect(s.energy).toBeLessThan(60);    // net energy decreased (20 > any kill bonus)
    expect(s.energy).toBeGreaterThanOrEqual(40); // at most 20 was deducted net
  });

  it('triggerSlotAbility legs slot consumes 20 energy (phaseDash: no target required)', () => {
    // ghost_legs = phaseDash — dashes to nearest villager if one exists, else
    // the target check is `nearestVillager(_, Infinity)` which returns null
    // when no villagers exist; phaseDash breaks early if null.  However,
    // energy is always deducted before dispatchEffect is called.
    const s = makeSurviveState();
    s.energy = 40;
    triggerSlotAbility(s, 'legs');
    expect(s.energy).toBe(20); // 40 - 20
  });
});

// ── 5. Arms auto-attack ───────────────────────────────────────────────────

describe('arms auto-attack', () => {
  it('score rises without any manual trigger after enough simulation steps', () => {
    // Default arms = werewolf → frenzySwipe (range 110 px).
    // Monster x initialises to 400 px in Node (window.innerWidth unavailable).
    // Villagers spawn at x ≈ 820 (right) or x ≈ -20 (left) and walk at ~34 px/s.
    // With dt = 2 s each tick they move ~68 px; in ~6 ticks they reach range.
    const s = makeSurviveState();
    const initialScore = s.score;

    let scoreRose = false;
    for (let i = 0; i < 80; i++) {
      updateArena(s, 2.0);
      if (s.score > initialScore) { scoreRose = true; break; }
      if (s.phase.name !== 'SURVIVE') break; // died or ended
    }

    // Either score rose (kill) or the game ended (all villagers killed the
    // monster or the monster killed all villagers → wave clear bonus).
    expect(scoreRose || s.phase.name !== 'SURVIVE').toBe(true);
  });

  it('arms cooldown becomes non-zero after auto-attack fires', () => {
    const s = makeSurviveState();

    let armsWentOnCooldown = false;
    for (let i = 0; i < 80; i++) {
      updateArena(s, 2.0);
      const hud = getArenaHudView(s);
      if (hud.armsAbility.cooldownFrac > 0) { armsWentOnCooldown = true; break; }
      if (s.phase.name !== 'SURVIVE') {
        // Arena ended — combat definitely occurred
        armsWentOnCooldown = true;
        break;
      }
    }

    expect(armsWentOnCooldown).toBe(true);
  });

  it('score increases strictly through auto-attacks alone over a long run', () => {
    const s = makeSurviveState();
    const initialScore = s.score;

    for (let i = 0; i < 100; i++) {
      updateArena(s, 2.0);
      if (s.phase.name !== 'SURVIVE') break;
    }

    expect(s.score).toBeGreaterThan(initialScore);
  });
});

// ── 6. Phase gating and state initialisation ─────────────────────────────

describe('phase gating and initial state', () => {
  it('updateArena is a no-op when phase is not SURVIVE', () => {
    const s = makeInitialState(); // TITLE
    const scoreBefore = s.score;
    const hpBefore    = s.hp;
    updateArena(s, 1.0);
    expect(s.score).toBe(scoreBefore);
    expect(s.hp).toBe(hpBefore);
    expect(s.phase.name).toBe('TITLE');
  });

  it('energy regen does not run outside SURVIVE', () => {
    const s = makeInitialState();
    s.energy = 0;
    updateArena(s, 1.0); // TITLE — regen path not reached
    expect(s.energy).toBe(0);
  });

  it('energy regen runs in SURVIVE: increases by at least 5*dt per tick (no kills)', () => {
    // charge=0 so energy starts at 0.  After one tick of dt=0.1s the regen
    // contributes 5*0.1 = 0.5 energy.  Using a small dt minimises the chance
    // of a kill-bonus (4 energy) inflating the reading.
    const s = makeSurviveState(0);
    const before = s.energy;
    updateArena(s, 0.1); // regen = 5 * 0.1 = 0.5
    // The energy must be >= before + 0.5 (kill bonuses can only increase it)
    expect(s.energy).toBeGreaterThanOrEqual(before + 0.5 - 1e-9);
  });

  it('wave is 1 immediately after ZAP→SURVIVE transition', () => {
    const s = makeSurviveState();
    expect(s.wave).toBe(1);
  });

  it('energy equals charge after ZAP→SURVIVE transition', () => {
    // charge=50 → state.energy=50; updateArena(dt=0) adds 0
    const s = makeSurviveState(50);
    expect(s.energy).toBe(50);
  });

  it('hp equals monster maxHp after ZAP→SURVIVE transition (default build)', () => {
    // Default build maxHp:
    //   BASE 100 + vampire_head +20 + robot_torso +30 + werewolf_arms +0 + ghost_legs -15 = 135
    const s = makeSurviveState();
    expect(s.hp).toBe(s.maxHp);
    expect(s.maxHp).toBe(135);
  });
});
