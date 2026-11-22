/**
 * journal.test.ts — Unit tests for src/journal.ts
 *
 * Covers:
 *  1. parseJournal — null, garbage JSON, partial data, negative/non-number fields
 *  2. applyStitch  — purity (input not mutated) and correctness
 *  3. applyRun     — purity, bestScore only rises, donor usage per slot, totals
 *  4. load/save round-trip via a stubbed in-memory localStorage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  emptyJournal,
  parseJournal,
  applyStitch,
  applyRun,
  loadJournal,
  saveJournal,
} from '../src/journal.js';
import type { JournalData } from '../src/journal.js';
import type { MonsterBuild } from '../src/monster.js';

// ── Fixtures ──────────────────────────────────────────────────────────────

const BUILD_A: MonsterBuild = { head: 'vampire', torso: 'robot', arms: 'werewolf', legs: 'ghost' };
const BUILD_B: MonsterBuild = { head: 'human',   torso: 'human', arms: 'human',    legs: 'human' };
const BUILD_C: MonsterBuild = { head: 'ghost',   torso: 'vampire', arms: 'robot',  legs: 'werewolf' };

// ── 1. parseJournal ───────────────────────────────────────────────────────

describe('parseJournal', () => {
  it('returns emptyJournal() for null input', () => {
    expect(parseJournal(null)).toEqual(emptyJournal());
  });

  it('returns emptyJournal() for undefined cast as null', () => {
    expect(parseJournal(null)).toEqual(emptyJournal());
  });

  it('returns emptyJournal() for empty string', () => {
    expect(parseJournal('')).toEqual(emptyJournal());
  });

  it('returns emptyJournal() for garbage JSON', () => {
    expect(parseJournal('not json at all')).toEqual(emptyJournal());
    expect(parseJournal('{{{bad')).toEqual(emptyJournal());
  });

  it('returns emptyJournal() when JSON root is an array', () => {
    expect(parseJournal('[1, 2, 3]')).toEqual(emptyJournal());
  });

  it('returns emptyJournal() when JSON root is a primitive', () => {
    expect(parseJournal('42')).toEqual(emptyJournal());
    expect(parseJournal('"hello"')).toEqual(emptyJournal());
    expect(parseJournal('true')).toEqual(emptyJournal());
    expect(parseJournal('null')).toEqual(emptyJournal());
  });

  it('defaults missing numeric fields to 0', () => {
    const result = parseJournal('{}');
    expect(result.bestScore).toBe(0);
    expect(result.totalRuns).toBe(0);
    expect(result.monstersStitched).toBe(0);
  });

  it('defaults all five donor keys to 0 when donorUsage is missing', () => {
    const result = parseJournal('{}');
    expect(result.donorUsage).toEqual({ vampire: 0, robot: 0, werewolf: 0, ghost: 0, human: 0 });
  });

  it('defaults all five donor keys to 0 when donorUsage is not an object', () => {
    const result = parseJournal(JSON.stringify({ donorUsage: 'bad' }));
    expect(result.donorUsage).toEqual({ vampire: 0, robot: 0, werewolf: 0, ghost: 0, human: 0 });
  });

  it('replaces negative bestScore with 0', () => {
    const result = parseJournal(JSON.stringify({ bestScore: -99 }));
    expect(result.bestScore).toBe(0);
  });

  it('replaces negative totalRuns with 0', () => {
    const result = parseJournal(JSON.stringify({ totalRuns: -1 }));
    expect(result.totalRuns).toBe(0);
  });

  it('replaces negative monstersStitched with 0', () => {
    const result = parseJournal(JSON.stringify({ monstersStitched: -5 }));
    expect(result.monstersStitched).toBe(0);
  });

  it('replaces non-number bestScore with 0', () => {
    const result = parseJournal(JSON.stringify({ bestScore: 'high' }));
    expect(result.bestScore).toBe(0);
  });

  it('replaces negative donor values with 0', () => {
    const raw = JSON.stringify({
      donorUsage: { vampire: -3, robot: 5, werewolf: -1, ghost: 0, human: 2 },
    });
    const result = parseJournal(raw);
    expect(result.donorUsage.vampire).toBe(0);
    expect(result.donorUsage.werewolf).toBe(0);
    expect(result.donorUsage.robot).toBe(5);
    expect(result.donorUsage.human).toBe(2);
  });

  it('replaces non-number donor values with 0', () => {
    const raw = JSON.stringify({
      donorUsage: { vampire: 'lots', robot: null, werewolf: 3, ghost: true, human: 1 },
    });
    const result = parseJournal(raw);
    expect(result.donorUsage.vampire).toBe(0);
    expect(result.donorUsage.robot).toBe(0);
    expect(result.donorUsage.ghost).toBe(0);
    expect(result.donorUsage.werewolf).toBe(3);
    expect(result.donorUsage.human).toBe(1);
  });

  it('rounds fractional numbers down to integer', () => {
    const raw = JSON.stringify({ bestScore: 100.9, totalRuns: 2.7, monstersStitched: 5.5 });
    const result = parseJournal(raw);
    expect(result.bestScore).toBe(100);
    expect(result.totalRuns).toBe(2);
    expect(result.monstersStitched).toBe(5);
  });

  it('accepts and passes through partial donorUsage (missing keys default to 0)', () => {
    const raw = JSON.stringify({ donorUsage: { vampire: 3, robot: 1 } });
    const result = parseJournal(raw);
    expect(result.donorUsage.vampire).toBe(3);
    expect(result.donorUsage.robot).toBe(1);
    expect(result.donorUsage.werewolf).toBe(0);
    expect(result.donorUsage.ghost).toBe(0);
    expect(result.donorUsage.human).toBe(0);
  });

  it('round-trips a valid JournalData correctly', () => {
    const original: JournalData = {
      version: 1,
      bestScore: 450,
      totalRuns: 7,
      monstersStitched: 10,
      donorUsage: { vampire: 4, robot: 3, werewolf: 5, ghost: 2, human: 1 },
    };
    const result = parseJournal(JSON.stringify(original));
    expect(result).toEqual(original);
  });

  it('always sets version to 1 regardless of input', () => {
    expect(parseJournal(JSON.stringify({ version: 99 })).version).toBe(1);
    expect(parseJournal(null).version).toBe(1);
  });
});

// ── 2. applyStitch ────────────────────────────────────────────────────────

describe('applyStitch', () => {
  it('increments monstersStitched by 1', () => {
    const before = emptyJournal();
    const after  = applyStitch(before, BUILD_A);
    expect(after.monstersStitched).toBe(1);
  });

  it('increments from non-zero value', () => {
    const before: JournalData = { ...emptyJournal(), monstersStitched: 5 };
    const after  = applyStitch(before, BUILD_A);
    expect(after.monstersStitched).toBe(6);
  });

  it('does not mutate the input object', () => {
    const before = emptyJournal();
    const snap   = JSON.stringify(before);
    applyStitch(before, BUILD_A);
    expect(JSON.stringify(before)).toBe(snap);
  });

  it('does not mutate the input donorUsage object', () => {
    const before    = emptyJournal();
    const usageRef  = before.donorUsage;
    applyStitch(before, BUILD_A);
    expect(before.donorUsage).toBe(usageRef);  // same reference, not mutated
    expect(usageRef.vampire).toBe(0);
  });

  it('leaves other fields unchanged', () => {
    const before: JournalData = {
      version: 1, bestScore: 200, totalRuns: 3,
      monstersStitched: 1,
      donorUsage: { vampire: 2, robot: 1, werewolf: 0, ghost: 0, human: 0 },
    };
    const after = applyStitch(before, BUILD_A);
    expect(after.bestScore).toBe(200);
    expect(after.totalRuns).toBe(3);
    expect(after.donorUsage).toEqual(before.donorUsage);
  });

  it('repeated calls accumulate correctly', () => {
    let j = emptyJournal();
    j = applyStitch(j, BUILD_A);
    j = applyStitch(j, BUILD_B);
    j = applyStitch(j, BUILD_C);
    expect(j.monstersStitched).toBe(3);
  });
});

// ── 3. applyRun ───────────────────────────────────────────────────────────

describe('applyRun', () => {
  it('increments totalRuns by 1', () => {
    const after = applyRun(emptyJournal(), 100, BUILD_A);
    expect(after.totalRuns).toBe(1);
  });

  it('sets bestScore to the run score when journal is empty', () => {
    const after = applyRun(emptyJournal(), 300, BUILD_A);
    expect(after.bestScore).toBe(300);
  });

  it('bestScore does not fall below current best', () => {
    const before: JournalData = { ...emptyJournal(), bestScore: 500 };
    const after  = applyRun(before, 100, BUILD_A);
    expect(after.bestScore).toBe(500);
  });

  it('bestScore rises when new score exceeds current best', () => {
    const before: JournalData = { ...emptyJournal(), bestScore: 200 };
    const after  = applyRun(before, 350, BUILD_A);
    expect(after.bestScore).toBe(350);
  });

  it('increments donorUsage once for each of the four slots', () => {
    const after = applyRun(emptyJournal(), 100, BUILD_A);
    // BUILD_A: head=vampire, torso=robot, arms=werewolf, legs=ghost
    expect(after.donorUsage.vampire).toBe(1);
    expect(after.donorUsage.robot).toBe(1);
    expect(after.donorUsage.werewolf).toBe(1);
    expect(after.donorUsage.ghost).toBe(1);
    expect(after.donorUsage.human).toBe(0);
  });

  it('increments the same donor multiple times when it appears in multiple slots', () => {
    // BUILD_B: all slots = human
    const after = applyRun(emptyJournal(), 50, BUILD_B);
    expect(after.donorUsage.human).toBe(4);   // one per slot = 4
    expect(after.donorUsage.vampire).toBe(0);
    expect(after.donorUsage.robot).toBe(0);
    expect(after.donorUsage.werewolf).toBe(0);
    expect(after.donorUsage.ghost).toBe(0);
  });

  it('accumulates donorUsage across multiple runs', () => {
    let j = emptyJournal();
    j = applyRun(j, 100, BUILD_A);  // vampire, robot, werewolf, ghost each +1
    j = applyRun(j, 200, BUILD_B);  // human +4
    j = applyRun(j, 50,  BUILD_A);  // vampire, robot, werewolf, ghost each +1 again
    expect(j.donorUsage.vampire).toBe(2);
    expect(j.donorUsage.robot).toBe(2);
    expect(j.donorUsage.werewolf).toBe(2);
    expect(j.donorUsage.ghost).toBe(2);
    expect(j.donorUsage.human).toBe(4);
  });

  it('totalRuns accumulates correctly across multiple runs', () => {
    let j = emptyJournal();
    j = applyRun(j, 100, BUILD_A);
    j = applyRun(j, 200, BUILD_B);
    j = applyRun(j, 300, BUILD_C);
    expect(j.totalRuns).toBe(3);
  });

  it('bestScore tracks the peak across multiple runs', () => {
    let j = emptyJournal();
    j = applyRun(j, 100, BUILD_A);
    expect(j.bestScore).toBe(100);
    j = applyRun(j, 400, BUILD_B);
    expect(j.bestScore).toBe(400);
    j = applyRun(j, 50,  BUILD_C);
    expect(j.bestScore).toBe(400);  // didn't drop
  });

  it('does not mutate the input object', () => {
    const before = emptyJournal();
    const snap   = JSON.stringify(before);
    applyRun(before, 999, BUILD_A);
    expect(JSON.stringify(before)).toBe(snap);
  });

  it('does not mutate the input donorUsage object', () => {
    const before   = emptyJournal();
    const usageRef = before.donorUsage;
    applyRun(before, 100, BUILD_A);
    expect(before.donorUsage).toBe(usageRef);
    expect(usageRef.vampire).toBe(0);
  });

  it('treats a negative score as 0 (does not lower bestScore to negative)', () => {
    const before: JournalData = { ...emptyJournal(), bestScore: 100 };
    const after  = applyRun(before, -50, BUILD_A);
    expect(after.bestScore).toBe(100);
  });

  it('score of 0 does not raise bestScore', () => {
    const before: JournalData = { ...emptyJournal(), bestScore: 100 };
    const after  = applyRun(before, 0, BUILD_A);
    expect(after.bestScore).toBe(100);
  });
});

// ── 4. loadJournal / saveJournal round-trip with stubbed localStorage ─────

describe('loadJournal / saveJournal — localStorage round-trip', () => {
  // Build a minimal in-memory localStorage stub
  function makeLocalStorageStub(): Storage {
    const store: Record<string, string> = {};
    return {
      getItem:    (k: string) => store[k] ?? null,
      setItem:    (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear:      () => { for (const k in store) delete store[k]; },
      key:        (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    };
  }

  beforeEach(() => {
    // Replace window.localStorage with our in-memory stub before each test
    vi.stubGlobal('window', { localStorage: makeLocalStorageStub() });
  });

  it('loadJournal returns emptyJournal() when storage is empty', () => {
    expect(loadJournal()).toEqual(emptyJournal());
  });

  it('saveJournal then loadJournal returns the same data', () => {
    const data: JournalData = {
      version: 1,
      bestScore: 1250,
      totalRuns: 11,
      monstersStitched: 15,
      donorUsage: { vampire: 6, robot: 4, werewolf: 7, ghost: 3, human: 2 },
    };
    saveJournal(data);
    expect(loadJournal()).toEqual(data);
  });

  it('overwrites previous save on second saveJournal call', () => {
    const first: JournalData  = { ...emptyJournal(), bestScore: 100, totalRuns: 1 };
    const second: JournalData = { ...emptyJournal(), bestScore: 500, totalRuns: 3 };
    saveJournal(first);
    saveJournal(second);
    expect(loadJournal()).toEqual(second);
  });

  it('round-trips after applyRun chain', () => {
    let j = emptyJournal();
    j = applyRun(j, 300, BUILD_A);
    j = applyRun(j, 150, BUILD_B);
    j = applyStitch(j, BUILD_C);
    saveJournal(j);
    const loaded = loadJournal();
    expect(loaded.totalRuns).toBe(2);
    expect(loaded.bestScore).toBe(300);
    expect(loaded.monstersStitched).toBe(1);
    expect(loaded.donorUsage.vampire).toBe(1);  // BUILD_A head
    expect(loaded.donorUsage.human).toBe(4);    // BUILD_B all slots
  });
});
