/**
 * stitch.test.ts — Property-based tests for the stitching system (R1.4)
 *
 * Tests:
 *  1. All 625 MonsterBuild combinations (5^4):
 *       - buildMonster returns exactly 4 abilities in slot order
 *       - all effectKeys are distinct across those 4 abilities
 *       - validateBuild returns true
 *       - all stats within STAT_RANGES
 *  2. Determinism / purity of buildMonster:
 *       - same build → deep-equal result on two independent calls
 *       - buildMonster does not mutate its input
 *  3. RNG determinism:
 *       - same seed → same sequence of 100 next() values
 *       - different seeds → different sequences
 */

import { describe, it, expect } from 'vitest';
import { buildMonster, validateBuild, STAT_RANGES } from '../src/monster.js';
import { createRng } from '../src/rng.js';
import type { MonsterBuild } from '../src/monster.js';

// ── Donor / slot enumerations ─────────────────────────────────────────────

const DONOR_IDS  = ['vampire', 'robot', 'werewolf', 'ghost', 'human'] as const;
const SLOT_ORDER = ['head', 'torso', 'arms', 'legs'] as const;

type DonorId = typeof DONOR_IDS[number];

// ── 1. Exhaustive build test (625 combinations) ───────────────────────────

describe('buildMonster — all 625 combinations', () => {
  for (const head of DONOR_IDS) {
    for (const torso of DONOR_IDS) {
      for (const arms of DONOR_IDS) {
        for (const legs of DONOR_IDS) {
          const build: MonsterBuild = { head, torso, arms, legs };
          const label = `${head}/${torso}/${arms}/${legs}`;

          it(`${label}: returns 4 abilities`, () => {
            const monster = buildMonster(build);
            expect(monster.abilities).toHaveLength(4);
          });

          it(`${label}: abilities are in slot order (head/torso/arms/legs)`, () => {
            const monster = buildMonster(build);
            for (let i = 0; i < 4; i++) {
              const slot = SLOT_ORDER[i];
              const ability = monster.abilities[i];
              expect(ability).toBeDefined();
              expect(ability!.slot).toBe(slot);
            }
          });

          it(`${label}: all effectKeys are distinct`, () => {
            const monster = buildMonster(build);
            const keys = monster.abilities.map(a => a.effectKey);
            expect(new Set(keys).size).toBe(4);
          });

          it(`${label}: validateBuild returns true`, () => {
            expect(validateBuild(build)).toBe(true);
          });

          it(`${label}: stats within STAT_RANGES`, () => {
            const { stats } = buildMonster(build);
            expect(stats.maxHp).toBeGreaterThanOrEqual(STAT_RANGES.maxHp.min);
            expect(stats.maxHp).toBeLessThanOrEqual(STAT_RANGES.maxHp.max);
            expect(stats.damage).toBeGreaterThanOrEqual(STAT_RANGES.damage.min);
            expect(stats.damage).toBeLessThanOrEqual(STAT_RANGES.damage.max);
            expect(stats.speed).toBeGreaterThanOrEqual(STAT_RANGES.speed.min);
            expect(stats.speed).toBeLessThanOrEqual(STAT_RANGES.speed.max);
            expect(stats.maxEnergy).toBeGreaterThanOrEqual(STAT_RANGES.maxEnergy.min);
            expect(stats.maxEnergy).toBeLessThanOrEqual(STAT_RANGES.maxEnergy.max);
          });
        }
      }
    }
  }
});

// ── 2. Determinism and purity ─────────────────────────────────────────────

describe('buildMonster — determinism and purity', () => {
  const BUILDS_TO_CHECK: MonsterBuild[] = [
    { head: 'vampire', torso: 'robot',    arms: 'werewolf', legs: 'ghost'  },
    { head: 'ghost',   torso: 'human',    arms: 'vampire',  legs: 'robot'  },
    { head: 'human',   torso: 'human',    arms: 'human',    legs: 'human'  },
    { head: 'robot',   torso: 'werewolf', arms: 'ghost',    legs: 'vampire'},
  ];

  for (const build of BUILDS_TO_CHECK) {
    const label = `${build.head}/${build.torso}/${build.arms}/${build.legs}`;

    it(`${label}: two calls return deep-equal results`, () => {
      const r1 = buildMonster(build);
      const r2 = buildMonster(build);
      expect(r1).toEqual(r2);
    });

    it(`${label}: does not mutate the input build`, () => {
      const original = { ...build } as MonsterBuild;
      buildMonster(build);
      expect(build.head ).toBe(original.head );
      expect(build.torso).toBe(original.torso);
      expect(build.arms ).toBe(original.arms );
      expect(build.legs ).toBe(original.legs );
    });
  }
});

// ── 3. RNG determinism ────────────────────────────────────────────────────

describe('createRng — determinism', () => {
  it('same seed produces the same 100 values', () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(12345);
    const seq1 = Array.from({ length: 100 }, () => rng1.next());
    const seq2 = Array.from({ length: 100 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('different seeds produce different sequences', () => {
    const rng1 = createRng(11111);
    const rng2 = createRng(99999);
    const seq1 = Array.from({ length: 100 }, () => rng1.next());
    const seq2 = Array.from({ length: 100 }, () => rng2.next());
    // At least one value must differ (they all will, but one is enough)
    expect(seq1).not.toEqual(seq2);
  });

  it('seed is preserved on the Rng object', () => {
    const rng = createRng(42);
    expect(rng.seed).toBe(42);
    rng.next(); rng.next(); rng.next();
    expect(rng.seed).toBe(42);
  });

  it('int() returns values within [min, max]', () => {
    const rng = createRng(777);
    for (let i = 0; i < 200; i++) {
      const v = rng.int(5, 15);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(15);
    }
  });

  it('pick() returns elements from the array', () => {
    const rng = createRng(42);
    const arr = ['a', 'b', 'c', 'd'] as const;
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });
});
