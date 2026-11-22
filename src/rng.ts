/**
 * rng.ts — mulberry32 seeded PRNG
 *
 * Seed priority:
 *   1. ?seed=<number> URL query param
 *   2. Default: 20261031 (Kiroween date)
 */

const DEFAULT_SEED = 20261031;

function parseSeedFromURL(): number {
  if (typeof window === 'undefined') return DEFAULT_SEED;
  const param = new URLSearchParams(window.location.search).get('seed');
  if (param === null) return DEFAULT_SEED;
  const n = parseInt(param, 10);
  return Number.isFinite(n) ? n : DEFAULT_SEED;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0; // ensure 32-bit unsigned

  function next(): number {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }

  /** Integer in [min, max] inclusive. */
  function int(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  /** Pick a random element from an array. */
  function pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new RangeError('pick: empty array');
    const item = arr[int(0, arr.length - 1)];
    if (item === undefined) throw new RangeError('pick: index out of bounds');
    return item;
  }

  return { next, int, pick, get seed() { return seed; } };
}

export interface Rng {
  /** Raw float in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Pick a random element from an array. */
  pick<T>(arr: readonly T[]): T;
  readonly seed: number;
}

/** Global RNG instance seeded from the URL (or default). */
export const rng: Rng = createRng(parseSeedFromURL());
