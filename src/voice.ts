/**
 * voice.ts — SpeechRecognition commands + SpeechSynthesis monster voice.
 *
 * Design contract ("Voice as an input device, not a mode"):
 *   voice.ts emits CommandEvents with the same shape as keyboard/touch input,
 *   so gameplay code cannot tell which organ produced the input.
 *
 * SpeechRecognition is Chromium-only. Absence (or declined permission) is
 * silently swallowed; the keyboard/button path is always equivalent.
 */

import { DonorId } from './state.js';

// ── CommandEvent — identical shape to keyboard/touch input ───────────────

export type CommandEvent =
  | { type: 'awaken' }
  | { type: 'ability'; slot: 'head' | 'torso' | 'legs'; effectKey: string };

// ── Minimal local SpeechRecognition interface (no @types package) ────────
//
// We only declare the surface we use so this never breaks in Node/vitest.

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly 0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous:    boolean;
  interimResults: boolean;
  lang:          string;
  onresult:      ((e: SpeechRecognitionEvent) => void) | null;
  onerror:       ((e: Event) => void) | null;
  onend:         (() => void) | null;
  start(): void;
  stop():  void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

// ── Feature detection ─────────────────────────────────────────────────────

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w['SpeechRecognition'] ?? w['webkitSpeechRecognition']) as
    | SpeechRecognitionConstructor
    | undefined;
  return Ctor ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// ── Transcript → CommandEvent mapping ────────────────────────────────────
//
// effectKey strings are taken verbatim from donors.ts:
//   'rangedZap'      robot_arms
//   'roarKnockback'  werewolf_torso
//   'phaseDash'      ghost_legs

function transcriptToCommand(raw: string): CommandEvent | null {
  const t = raw.toLowerCase();
  if (t.includes('alive'))  return { type: 'awaken' };
  if (t.includes('zap'))    return { type: 'ability', slot: 'head',  effectKey: 'rangedZap' };
  if (t.includes('roar'))   return { type: 'ability', slot: 'torso', effectKey: 'roarKnockback' };
  if (t.includes('phase'))  return { type: 'ability', slot: 'legs',  effectKey: 'phaseDash' };
  return null;
}

// ── SpeechRecognition listener ────────────────────────────────────────────

let _recognition: SpeechRecognitionInstance | null = null;
let _listening   = false;
let _callback: ((cmd: CommandEvent) => void) | null = null;

/**
 * Start listening for voice commands.
 * Returns true if SpeechRecognition is available and was started,
 * false otherwise (caller falls back to keyboard/button path).
 */
export function startListening(onCommand: (cmd: CommandEvent) => void): boolean {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return false;

  // Stop any previous session cleanly.
  if (_recognition) {
    _listening = false;
    try { _recognition.abort(); } catch { /* swallow */ }
    _recognition = null;
  }

  _callback  = onCommand;
  _listening = true;

  function createAndStart(): void {
    if (!_listening || !_callback) return;
    const Ctor2 = getSpeechRecognitionCtor();
    if (!Ctor2) return;

    const rec = new Ctor2();
    _recognition = rec;

    rec.continuous     = true;
    rec.interimResults = false;
    rec.lang           = 'en-US';

    rec.onresult = (e: SpeechRecognitionEvent) => {
      try {
        for (let i = 0; i < e.results.length; i++) {
          const result = e.results[i];
          if (!result) continue;
          if (!result.isFinal) continue;
          const alt = result[0];
          if (!alt) continue;
          const cmd = transcriptToCommand(alt.transcript);
          if (cmd && _callback) _callback(cmd);
        }
      } catch { /* swallow */ }
    };

    rec.onerror = () => { /* swallow all recognition errors */ };

    rec.onend = () => {
      // Auto-restart only while listening was explicitly requested.
      if (_listening) {
        // Small delay avoids a tight retry loop on hard failures.
        setTimeout(createAndStart, 150);
      }
    };

    try {
      rec.start();
    } catch { /* swallow — e.g. already started */ }
  }

  createAndStart();
  return true;
}

/** Stop listening for voice commands. Safe to call even if never started. */
export function stopListening(): void {
  _listening = false;
  _callback  = null;
  if (_recognition) {
    try { _recognition.abort(); } catch { /* swallow */ }
    _recognition = null;
  }
}

// ── SpeechSynthesis monster voice ─────────────────────────────────────────

export interface MonsterVoiceProfile {
  pitch: number;  // SpeechSynthesisUtterance.pitch  (0 – 2, default 1)
  rate:  number;  // SpeechSynthesisUtterance.rate   (0.1 – 10, default 1)
}

/**
 * Voice profile per head donor.
 * Vampire: low/slow (creepy baritone).
 * Robot:   flat mid-pitch, slightly clipped.
 * Werewolf: deep/fast-ish (excited growl).
 * Ghost:   high pitch, slow drawl.
 * Human:   neutral.
 */
const VOICE_PROFILES: Record<DonorId, MonsterVoiceProfile> = {
  vampire:  { pitch: 0.5, rate: 0.75 },
  robot:    { pitch: 0.9, rate: 1.1  },
  werewolf: { pitch: 0.4, rate: 1.3  },
  ghost:    { pitch: 1.8, rate: 0.65 },
  human:    { pitch: 1.0, rate: 1.0  },
};

/** Returns the voice profile for the given head donor. Unit-testable. */
export function getMonsterVoiceProfile(headDonor: DonorId): MonsterVoiceProfile {
  return VOICE_PROFILES[headDonor];
}

/**
 * First spoken line per head donor — family-safe and funny.
 * Fired on awakening (R2.4).
 */
export const FIRST_LINES: Record<DonorId, string> = {
  vampire:  "I hunger... for villagers! Also, do you have any garlic bread? Asking for a friend.",
  robot:    "BOOT SEQUENCE COMPLETE. Emotions: none. Desire to stomp villagers: maximum.",
  werewolf: "YES! LEGS! I HAVE LEGS! WAIT — are those torches? Run. I mean, I mean CHARGE!",
  ghost:    "Ooooh... I am AWAKE. Do not be alarmed. I am mostly harmless. Mostly.",
  human:    "I feel... INCREDIBLE! Has anyone checked whether this is legal? No? Great, let's go!",
};

/**
 * Speak `text` using the monster's voice derived from its head donor.
 * Safe no-op when SpeechSynthesis is unavailable.
 */
export function speakAsMonster(text: string, headDonor: DonorId): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    const synth    = window.speechSynthesis;
    const profile  = getMonsterVoiceProfile(headDonor);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = profile.pitch;
    utterance.rate  = profile.rate;
    // Cancel any ongoing speech first (e.g. a previous awakening).
    synth.cancel();
    synth.speak(utterance);
  } catch { /* swallow — synthesis unavailable or permission denied */ }
}
