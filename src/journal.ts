/**
 * journal.ts — Lab Journal: persistent run statistics.
 *
 * Data is stored under localStorage key 'frankenlab.journal.v1'.
 *
 * Shape:
 *   { version: 1, bestScore, totalRuns, monstersStitched,
 *     donorUsage: Record<DonorId, number> }
 *
 * All five DonorId keys are always present in donorUsage.
 *
 * The pure functions (emptyJournal, parseJournal, applyStitch, applyRun)
 * never throw and never mutate their inputs.  The storage wrappers
 * (loadJournal, saveJournal, recordStitch, recordRun) guard every
 * window/localStorage access in try/catch so they are safe no-ops in
 * Node test environments and private-browsing modes.
 */

import type { MonsterBuild } from './monster.js';
import type { DonorId } from './state.js';

// ── Types ─────────────────────────────────────────────────────────────────

export interface JournalData {
  version:          1;
  bestScore:        number;
  totalRuns:        number;
  monstersStitched: number;
  donorUsage:       Record<DonorId, number>;
}

// ── Constants ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'frankenlab.journal.v1';

const DONOR_IDS: DonorId[] = ['vampire', 'robot', 'werewolf', 'ghost', 'human'];

// ── Pure helpers ──────────────────────────────────────────────────────────

function emptyDonorUsage(): Record<DonorId, number> {
  return { vampire: 0, robot: 0, werewolf: 0, ghost: 0, human: 0 };
}

// ── Pure, exported functions ───────────────────────────────────────────────

/** Returns a zeroed JournalData with all five donor keys present. */
export function emptyJournal(): JournalData {
  return {
    version:          1,
    bestScore:        0,
    totalRuns:        0,
    monstersStitched: 0,
    donorUsage:       emptyDonorUsage(),
  };
}

/**
 * Parse a raw localStorage string into JournalData.
 * null input, invalid JSON, wrong types, negative numbers, and missing
 * fields all fall back to safe defaults field-by-field.  Never throws.
 */
export function parseJournal(raw: string | null): JournalData {
  const defaults = emptyJournal();

  if (raw === null || raw === undefined) return defaults;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return defaults;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return defaults;
  }

  const obj = parsed as Record<string, unknown>;

  const bestScore = typeof obj['bestScore'] === 'number' && obj['bestScore'] >= 0
    ? Math.floor(obj['bestScore'])
    : 0;

  const totalRuns = typeof obj['totalRuns'] === 'number' && obj['totalRuns'] >= 0
    ? Math.floor(obj['totalRuns'])
    : 0;

  const monstersStitched = typeof obj['monstersStitched'] === 'number' && obj['monstersStitched'] >= 0
    ? Math.floor(obj['monstersStitched'])
    : 0;

  // Parse donorUsage: accept partial objects, default missing/bad keys to 0
  const rawUsage = typeof obj['donorUsage'] === 'object' && obj['donorUsage'] !== null
    ? obj['donorUsage'] as Record<string, unknown>
    : {};

  const donorUsage = emptyDonorUsage();
  for (const id of DONOR_IDS) {
    const val = rawUsage[id];
    if (typeof val === 'number' && val >= 0) {
      donorUsage[id] = Math.floor(val);
    }
  }

  return { version: 1, bestScore, totalRuns, monstersStitched, donorUsage };
}

/**
 * Returns a new JournalData with monstersStitched incremented by 1.
 * Does not mutate `data`.
 */
export function applyStitch(data: JournalData, _build: MonsterBuild): JournalData {
  return {
    ...data,
    donorUsage: { ...data.donorUsage },
    monstersStitched: data.monstersStitched + 1,
  };
}

/**
 * Returns a new JournalData with:
 *   - totalRuns incremented by 1
 *   - bestScore updated to max(current, score)
 *   - donorUsage incremented once per slot for the build's four donors
 *
 * Does not mutate `data`.
 */
export function applyRun(data: JournalData, score: number, build: MonsterBuild): JournalData {
  const newUsage: Record<DonorId, number> = { ...data.donorUsage };

  const slots: Array<keyof MonsterBuild> = ['head', 'torso', 'arms', 'legs'];
  for (const slot of slots) {
    const donor = build[slot] as DonorId;
    newUsage[donor] = (newUsage[donor] ?? 0) + 1;
  }

  const safeScore = typeof score === 'number' && isFinite(score) ? Math.max(0, score) : 0;

  return {
    ...data,
    totalRuns:  data.totalRuns + 1,
    bestScore:  Math.max(data.bestScore, safeScore),
    donorUsage: newUsage,
  };
}

// ── Storage wrappers ──────────────────────────────────────────────────────

/**
 * Load JournalData from localStorage.
 * Returns emptyJournal() if localStorage is unavailable or the value is absent/corrupt.
 */
export function loadJournal(): JournalData {
  try {
    if (typeof window === 'undefined') return emptyJournal();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return parseJournal(raw);
  } catch {
    return emptyJournal();
  }
}

/**
 * Save JournalData to localStorage.
 * Silent no-op if localStorage is unavailable.
 */
export function saveJournal(data: JournalData): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded, private mode, or non-browser — ignore
  }
}

/** Load, apply applyStitch, save. */
export function recordStitch(build: MonsterBuild): void {
  const updated = applyStitch(loadJournal(), build);
  saveJournal(updated);
}

/** Load, apply applyRun, save. */
export function recordRun(score: number, build: MonsterBuild): void {
  const updated = applyRun(loadJournal(), score, build);
  saveJournal(updated);
}
