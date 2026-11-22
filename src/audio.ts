/**
 * audio.ts — 100% procedural Web Audio synth kit for FRANKEN-LAB.
 *
 * Graph: each sound → master GainNode → DynamicsCompressor → destination
 *
 * Design rules:
 *  - Zero audio files. Every sound is synthesised with oscillators and
 *    noise buffers via the Web Audio API.
 *  - Feature-detected and SSR/test safe: every export is a no-op when
 *    AudioContext is unavailable or not yet initialised.
 *  - AudioContext is created lazily on the first ensureAudio() call so
 *    browsers are satisfied that playback follows a user gesture.
 *  - Mute state is persisted to localStorage; the master gain drops to 0
 *    while muted. The M key is wired by the caller, not here.
 */

// ── Environment guards ────────────────────────────────────────────────────

/** True when running in a real browser with Web Audio available. */
const HAS_AUDIO_CTX =
  typeof window !== 'undefined' &&
  typeof AudioContext !== 'undefined';

/** Safe localStorage wrapper — returns null instead of throwing in Node/tests. */
const store = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* noop */ }
  },
};

// ── Module-level singletons ───────────────────────────────────────────────

let ctx:        AudioContext      | null = null;
let masterGain: GainNode          | null = null;
let compressor: DynamicsCompressorNode | null = null;

/** Shared one-second white noise buffer, created once and reused. */
let noiseBuffer: AudioBuffer | null = null;

// ── Mute state (loaded at module init) ───────────────────────────────────

const MUTE_KEY = 'frankenlab.muted';

let _muted: boolean = store.get(MUTE_KEY) === 'true';

// ── Context initialisation ───────────────────────────────────────────────

/**
 * Create or resume the AudioContext.  Must be called from a user-gesture
 * handler before any sound function.  Safe to call multiple times.
 */
export function ensureAudio(): void {
  if (!HAS_AUDIO_CTX) return;

  if (!ctx) {
    ctx       = new AudioContext();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value      =  6;
    compressor.ratio.value     =  4;
    compressor.attack.value    =  0.003;
    compressor.release.value   =  0.25;

    masterGain = ctx.createGain();
    masterGain.gain.value = _muted ? 0 : 0.85;

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // Build 1-second stereo white noise buffer
    const SR = ctx.sampleRate;
    noiseBuffer = ctx.createBuffer(1, SR, SR);
    const data  = noiseBuffer.getChannelData(0);
    for (let i = 0; i < SR; i++) data[i] = Math.random() * 2 - 1;
  }

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* ignore */ });
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────

/** Returns the audio context if fully ready, null otherwise. */
function ac(): AudioContext | null {
  if (!ctx || ctx.state === 'closed') return null;
  return ctx;
}

/** Current audio clock time (seconds). */
function now(): number {
  return ctx ? ctx.currentTime : 0;
}

/** Connect a node to the master gain (the shared output bus). */
function toMaster(node: AudioNode): void {
  if (masterGain) node.connect(masterGain);
}

/**
 * Schedule a linear ramp on a param.
 * start → end over duration seconds starting at t0.
 */
function ramp(
  param: AudioParam,
  start: number,
  end:   number,
  t0:    number,
  dur:   number,
): void {
  param.setValueAtTime(start, t0);
  param.linearRampToValueAtTime(end, t0 + dur);
}

/**
 * Play a one-shot noise burst from the shared buffer.
 * Returns the envelope GainNode so callers can chain further shaping.
 */
function noiseShot(
  startTime:  number,
  duration:   number,
  peakGain:   number,
  attack:     number,
  release:    number,
  lpCutoff:   number,
): GainNode | null {
  const a = ac();
  if (!a || !noiseBuffer) return null;

  const src    = a.createBufferSource();
  src.buffer   = noiseBuffer;
  src.loop     = true;

  const filt   = a.createBiquadFilter();
  filt.type    = 'lowpass';
  filt.frequency.value = lpCutoff;

  const env    = a.createGain();
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(peakGain, startTime + attack);
  env.gain.linearRampToValueAtTime(0,        startTime + duration);

  src.connect(filt);
  filt.connect(env);
  toMaster(env);

  src.start(startTime);
  src.stop(startTime + duration + release + 0.05);

  return env;
}

// ── Sound: Thunder ────────────────────────────────────────────────────────

/**
 * playThunder() — broadband noise burst with a low-frequency rumble tail.
 *
 * Two layers:
 *  1. High-energy white-noise crack (LP @ 8 kHz), fast attack, 0.3 s.
 *  2. Sub-bass oscillator rumble (40 Hz → 20 Hz), 2 s decay.
 */
export function playThunder(): void {
  const a = ac();
  if (!a) return;

  const t = now();

  // Layer 1 — crack
  noiseShot(t, 1.8, 0.9, 0.003, 1.8, 8000);

  // Layer 2 — rumble oscillator
  const osc   = a.createOscillator();
  osc.type    = 'sawtooth';
  ramp(osc.frequency, 42, 18, t, 2.0);

  const env   = a.createGain();
  env.gain.setValueAtTime(0,   t);
  env.gain.linearRampToValueAtTime(0.5, t + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

  const lp    = a.createBiquadFilter();
  lp.type     = 'lowpass';
  lp.frequency.value = 120;

  osc.connect(lp);
  lp.connect(env);
  toMaster(env);

  osc.start(t);
  osc.stop(t + 2.4);
}

// ── Sound: Zap ────────────────────────────────────────────────────────────

/**
 * playZap() — harsh square/saw descending burst, 0.4 s.
 * Layered with a short noise transient for bite.
 */
export function playZap(): void {
  const a = ac();
  if (!a) return;

  const t = now();

  // Oscillator sweep: 1200 Hz → 80 Hz
  const osc  = a.createOscillator();
  osc.type   = 'square';
  ramp(osc.frequency, 1200, 80, t, 0.35);

  const env  = a.createGain();
  env.gain.setValueAtTime(0,    t);
  env.gain.linearRampToValueAtTime(0.4,  t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

  osc.connect(env);
  toMaster(env);

  osc.start(t);
  osc.stop(t + 0.45);

  // Bite transient
  noiseShot(t, 0.08, 0.5, 0.002, 0.08, 4000);
}

// ── Sound: Roar ───────────────────────────────────────────────────────────

/**
 * playRoar() — three detuned sawtooth oscillators with a pitch envelope
 * and a noise layer for breath texture.  Duration ~1.4 s.
 */
export function playRoar(): void {
  const a = ac();
  if (!a) return;

  const t = now();

  const detunes  = [0, +14, -12];
  const freqBase = 90;

  for (const detune of detunes) {
    const osc   = a.createOscillator();
    osc.type    = 'sawtooth';
    osc.detune.value = detune;
    // Pitch arch: rise then fall
    osc.frequency.setValueAtTime(freqBase * 0.6, t);
    osc.frequency.linearRampToValueAtTime(freqBase * 1.3, t + 0.2);
    osc.frequency.linearRampToValueAtTime(freqBase * 0.8, t + 1.4);

    const env   = a.createGain();
    env.gain.setValueAtTime(0,     t);
    env.gain.linearRampToValueAtTime(0.28, t + 0.08);
    env.gain.linearRampToValueAtTime(0.18, t + 0.9);
    env.gain.linearRampToValueAtTime(0,    t + 1.4);

    osc.connect(env);
    toMaster(env);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  // Breath noise layer
  noiseShot(t, 1.2, 0.18, 0.05, 1.1, 2200);
}

// ── Sound: UI ─────────────────────────────────────────────────────────────

/** playUiClick() — short tick used for button presses. */
export function playUiClick(): void {
  const a = ac();
  if (!a) return;

  const t   = now();
  const osc = a.createOscillator();
  osc.type  = 'square';
  osc.frequency.value = 440;

  const env = a.createGain();
  env.gain.setValueAtTime(0,   t);
  env.gain.linearRampToValueAtTime(0.15, t + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

  osc.connect(env);
  toMaster(env);
  osc.start(t);
  osc.stop(t + 0.08);
}

/** playUiSelect() — ascending two-note confirm sting. */
export function playUiSelect(): void {
  const a = ac();
  if (!a) return;

  const t     = now();
  const notes = [523.25, 783.99]; // C5, G5

  notes.forEach((freq, i) => {
    const onset = t + i * 0.07;
    const osc   = a.createOscillator();
    osc.type    = 'triangle';
    osc.frequency.value = freq;

    const env   = a.createGain();
    env.gain.setValueAtTime(0,    onset);
    env.gain.linearRampToValueAtTime(0.18, onset + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, onset + 0.15);

    osc.connect(env);
    toMaster(env);
    osc.start(onset);
    osc.stop(onset + 0.18);
  });
}

// ── Sound: Coil hum ───────────────────────────────────────────────────────

/**
 * Sustaining oscillator whose frequency rises from 60 Hz to 1200 Hz as
 * charge goes 0 → 1.  Call setCharge() during the ZAP phase to track
 * the player's timing bar.
 */

let coilOsc:   OscillatorNode | null = null;
let coilGain:  GainNode        | null = null;

/** Charge value [0, 1] for coil pitch mapping. */
let _coilCharge = 0;

/** Start the coil hum drone. */
export function startCoilHum(): void {
  if (coilOsc) return; // already running
  const a = ac();
  if (!a) return;

  const t = now();

  coilOsc = a.createOscillator();
  coilOsc.type = 'sawtooth';
  coilOsc.frequency.value = 60;

  // Add a slight tremolo via a secondary gain modulator
  const lfo   = a.createOscillator();
  lfo.type    = 'sine';
  lfo.frequency.value = 7;

  const lfoGain = a.createGain();
  lfoGain.gain.value = 8; // ± 8 Hz tremolo depth

  lfo.connect(lfoGain);
  lfoGain.connect(coilOsc.frequency);

  coilGain = a.createGain();
  coilGain.gain.setValueAtTime(0, t);
  coilGain.gain.linearRampToValueAtTime(0.22, t + 0.3);

  coilOsc.connect(coilGain);
  toMaster(coilGain);

  coilOsc.start(t);
  lfo.start(t);

  // Store lfo reference on the osc object for cleanup
  (coilOsc as AudioNode & { _lfo?: OscillatorNode })._lfo = lfo;
}

/** Update the coil pitch according to charge fraction [0, 1]. */
export function setCharge(charge: number): void {
  _coilCharge = Math.max(0, Math.min(1, charge));
  if (!coilOsc || !ctx) return;

  const minFreq = 60;
  const maxFreq = 1200;
  const freq    = minFreq + _coilCharge * (maxFreq - minFreq);
  coilOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
}

/** Stop and discard the coil hum oscillator. */
export function stopCoilHum(): void {
  if (!coilOsc || !ctx) return;

  const t = ctx.currentTime;

  if (coilGain) {
    coilGain.gain.setValueAtTime(coilGain.gain.value, t);
    coilGain.gain.linearRampToValueAtTime(0, t + 0.15);
  }

  const lfo = (coilOsc as AudioNode & { _lfo?: OscillatorNode })._lfo;
  const oscRef  = coilOsc;
  const gainRef = coilGain;

  setTimeout(() => {
    try { oscRef.stop();  } catch { /* already stopped */ }
    try { lfo?.stop();    } catch { /* already stopped */ }
    gainRef?.disconnect();
  }, 200);

  coilOsc  = null;
  coilGain = null;
}

// ── Sound: Heartbeat ─────────────────────────────────────────────────────

/**
 * startHeartbeat(getHpFraction) — a looping "lub-dub" scheduler.
 * Interval is recalculated each beat from the HP fraction callback:
 *   full HP → ~1.0 s between beats, low HP → ~0.3 s.
 * The callback is called once per beat cycle so callers can connect it
 * directly to GameState without polling.
 */

let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
let _getHpFraction: (() => number) | null = null;

/** Schedule a single lub-dub pair at time t (audio clock seconds). */
function scheduleHeartBeat(t: number): void {
  const a = ac();
  if (!a) return;

  // Lub
  const lub = a.createOscillator();
  lub.type  = 'sine';
  lub.frequency.value = 55;

  const lubEnv = a.createGain();
  lubEnv.gain.setValueAtTime(0,    t);
  lubEnv.gain.linearRampToValueAtTime(0.6, t + 0.012);
  lubEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

  lub.connect(lubEnv);
  toMaster(lubEnv);
  lub.start(t);
  lub.stop(t + 0.14);

  // Dub (slightly higher pitch, 0.15 s later)
  const dub = a.createOscillator();
  dub.type  = 'sine';
  dub.frequency.value = 48;

  const dubEnv = a.createGain();
  const dt     = t + 0.15;
  dubEnv.gain.setValueAtTime(0,    dt);
  dubEnv.gain.linearRampToValueAtTime(0.4, dt + 0.012);
  dubEnv.gain.exponentialRampToValueAtTime(0.0001, dt + 0.10);

  dub.connect(dubEnv);
  toMaster(dubEnv);
  dub.start(dt);
  dub.stop(dt + 0.14);
}

function tickHeartbeat(): void {
  if (!heartbeatTimer) return; // was stopped

  const hp       = _getHpFraction ? Math.max(0, Math.min(1, _getHpFraction())) : 1;
  // Interval: 1000 ms at full HP, 300 ms near death
  const interval = 300 + hp * 700;

  if (ac()) {
    scheduleHeartBeat(now() + 0.02);
  }

  heartbeatTimer = setTimeout(tickHeartbeat, interval);
}

/** Start the heartbeat scheduler. `getHpFraction` is polled each beat. */
export function startHeartbeat(getHpFraction: () => number): void {
  if (heartbeatTimer !== null) return; // already running
  _getHpFraction  = getHpFraction;
  heartbeatTimer  = setTimeout(tickHeartbeat, 0);
}

/** Stop the heartbeat scheduler. */
export function stopHeartbeat(): void {
  if (heartbeatTimer !== null) {
    clearTimeout(heartbeatTimer);
    heartbeatTimer = null;
  }
  _getHpFraction = null;
}

// ── Adaptive music ────────────────────────────────────────────────────────

/**
 * Minor-key lookahead scheduler.
 *
 * Key: A natural minor — A B C D E F G (roots at 110 Hz)
 * Structure: 4-beat bar at ~105 BPM.
 *  - Bass: root (A2 = 110 Hz) on beats 1 and 3.
 *  - Arpeggio: 8th-note minor thirds/fifths cycling up the scale.
 *  - Wave intensity (setMusicWave): higher wave → denser arp + extra
 *    saw-pad layer + increased arp gain.
 *
 * Uses a ~0.1 s lookahead window via setTimeout to avoid gaps.
 */

// A natural minor scale (Hz) across two octaves starting at A2 (110 Hz)
const SCALE_HZ: readonly number[] = [
  110.00, // A2
  123.47, // B2
  130.81, // C3
  146.83, // D3
  164.81, // E3
  174.61, // F3
  196.00, // G3
  220.00, // A3
  246.94, // B3
  261.63, // C4
  293.66, // D4
  329.63, // E4
];

const MUSIC_BPM    = 105;
const BEAT_SEC     = 60 / MUSIC_BPM;         // seconds per beat
const LOOKAHEAD    = 0.12;                    // s ahead to schedule
const SCHEDULER_MS = 50;                      // ms between scheduler ticks

let musicTimer:    ReturnType<typeof setTimeout> | null = null;
let musicNextBeat: number = 0;               // audio-clock time of next beat
let musicBeat:     number = 0;               // beat counter (0-indexed)
let _musicWave:    number = 0;               // current wave number

/** Update wave number to scale music intensity. */
export function setMusicWave(n: number): void {
  _musicWave = Math.max(0, n);
}

/** Schedule all notes that fall within the lookahead window. */
function musicScheduler(): void {
  if (!musicTimer) return;

  const a = ac();
  if (!a) {
    musicTimer = setTimeout(musicScheduler, SCHEDULER_MS);
    return;
  }

  const horizon = a.currentTime + LOOKAHEAD;

  while (musicNextBeat < horizon) {
    const t    = musicNextBeat;
    const beat = musicBeat % 4; // 0-3 within bar

    scheduleMusicBeat(a, t, beat);
    musicNextBeat += BEAT_SEC;
    musicBeat++;
  }

  musicTimer = setTimeout(musicScheduler, SCHEDULER_MS);
}

function scheduleMusicBeat(a: AudioContext, t: number, beat: number): void {
  const wave       = _musicWave;
  const arpGain    = 0.07 + Math.min(wave * 0.015, 0.12);
  const arpDensity = beat % 2 === 0 ? 2 : (wave >= 3 ? 3 : 1); // 8th-notes per beat

  // Bass pulse on beats 0 and 2
  if (beat === 0 || beat === 2) {
    scheduleNote(a, t, 110, 'triangle', 0.28, BEAT_SEC * 0.9);
  }

  // Arp notes
  for (let i = 0; i < arpDensity; i++) {
    const onset     = t + (i / arpDensity) * BEAT_SEC;
    const scaleIdx  = ((musicBeat * arpDensity + i) % SCALE_HZ.length);
    const freq      = SCALE_HZ[scaleIdx] ?? 220;
    scheduleNote(a, onset, freq, 'sine', arpGain, BEAT_SEC * 0.4);
  }

  // Extra saw-pad layer on waves 5+
  if (wave >= 5 && beat === 0) {
    const padGain = 0.06 + Math.min((wave - 5) * 0.01, 0.06);
    scheduleNote(a, t, 55, 'sawtooth', padGain, BEAT_SEC * 4); // whole-bar sustain
  }
}

function scheduleNote(
  a:        AudioContext,
  t:        number,
  freq:     number,
  type:     OscillatorType,
  gain:     number,
  duration: number,
): void {
  const osc   = a.createOscillator();
  osc.type    = type;
  osc.frequency.value = freq;

  const env   = a.createGain();
  const att   = 0.015;
  const rel   = Math.min(0.1, duration * 0.2);
  env.gain.setValueAtTime(0,    t);
  env.gain.linearRampToValueAtTime(gain,  t + att);
  env.gain.setValueAtTime(gain,           t + duration - rel);
  env.gain.linearRampToValueAtTime(0,     t + duration);

  osc.connect(env);
  toMaster(env);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** Start the adaptive music scheduler. */
export function startMusic(): void {
  if (musicTimer !== null) return; // already running

  const a = ac();
  musicNextBeat = a ? a.currentTime + 0.05 : 0;
  musicBeat     = 0;
  musicTimer    = setTimeout(musicScheduler, 0);
}

/** Stop the adaptive music scheduler immediately. */
export function stopMusic(): void {
  if (musicTimer !== null) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

// ── Mute controls ─────────────────────────────────────────────────────────

/** Set mute state.  Persists to localStorage. */
export function setMuted(m: boolean): void {
  _muted = m;
  store.set(MUTE_KEY, String(m));
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(m ? 0 : 0.85, ctx.currentTime, 0.05);
  }
}

/** Returns the current mute state. */
export function isMuted(): boolean {
  return _muted;
}

/** Toggle mute and return the new state. */
export function toggleMuted(): boolean {
  setMuted(!_muted);
  return _muted;
}
