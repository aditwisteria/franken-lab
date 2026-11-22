/**
 * zap.ts — DOM overlay for the ZAP phase (charge ritual + awakening).
 *
 * Conventions (mirrors stitch.ts):
 *  - renderZapScreen(domRoot, state) is idempotent and called every frame.
 *    It mounts the UI once and updates live values via refs; it does NOT
 *    rebuild the DOM every frame.
 *  - clearZapScreen() tears everything down and removes all listeners.
 *  - CSS is injected once at module load.
 *  - Only this module touches the charge/awaken path.
 */

import { GameState, nextPhase } from './state.js';
import {
  ensureAudio,
  startCoilHum,
  stopCoilHum,
  setCharge,
  playThunder,
} from './audio.js';
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
  speakAsMonster,
  FIRST_LINES,
  CommandEvent,
} from './voice.js';

// ── CSS injection (once) ──────────────────────────────────────────────────

let _cssInjected = false;

function ensureStyles(): void {
  if (_cssInjected) return;
  _cssInjected = true;

  const style = document.createElement('style');
  style.textContent = `
/* ── ZAP screen ──────────────────────────────────────────────────────── */
.fl-zap-screen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

/* Stack container — absolutely positioned using height-relative coords so
   the controls always sit in the lower ~44 % of the screen regardless of
   viewport width. 'top: 56%' resolves against the element's own height
   (which equals the viewport height when inset:0 is in force). */
.fl-zap-stack {
  position: absolute;
  top: 56%;
  left: 0;
  right: 0;
  bottom: clamp(16px, 4vh, 48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  overflow: visible;
  pointer-events: none;
}

/* coil charge bar track */
.fl-zap-track {
  width: min(480px, 80vw);
  height: 36px;
  background: rgba(10,15,10,0.85);
  border: 2px solid #2a4a2a;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 12px rgba(57,255,20,0.2);
}

/* fill bar */
.fl-zap-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 0%;
  background: linear-gradient(90deg, #39ff14 0%, #ffb300 70%, #ff4400 100%);
  transition: width 0.03s linear;
  box-shadow: 0 0 10px #39ff1488;
}

/* target zone (green band) */
.fl-zap-target {
  position: absolute;
  top: 0; bottom: 0;
  left: 60%;
  width: 30%;
  background: rgba(57,255,20,0.12);
  border-left:  1px solid rgba(57,255,20,0.4);
  border-right: 1px solid rgba(57,255,20,0.4);
}

/* perfect zone (amber band, inner 10%) */
.fl-zap-perfect-zone {
  position: absolute;
  top: 0; bottom: 0;
  left: 90%;
  width: 10%;
  background: rgba(255,179,0,0.18);
  border-left: 1px solid rgba(255,179,0,0.5);
}

/* percent label inside bar */
.fl-zap-pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.75);
  user-select: none;
  mix-blend-mode: overlay;
}

/* instruction text */
.fl-zap-instruction {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.7rem, 1.8vw, 0.95rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c8d8c0;
  text-align: center;
  pointer-events: none;
}

/* hold button */
.fl-zap-hold-btn {
  pointer-events: all;
  padding: 16px 48px;
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.85rem, 2vw, 1.1rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0a0d0f;
  background: #39ff14;
  border: none;
  cursor: pointer;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  box-shadow: 0 0 20px #39ff14aa;
  user-select: none;
  -webkit-user-select: none;
  transition: background 0.1s, box-shadow 0.1s;
}

.fl-zap-hold-btn:active,
.fl-zap-hold-btn.fl-held {
  background: #ffb300;
  box-shadow: 0 0 32px #ffb300;
}

/* voice status */
.fl-zap-voice-status {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.6rem, 1.4vw, 0.78rem);
  letter-spacing: 0.1em;
  color: #556655;
  text-align: center;
  pointer-events: none;
}

.fl-zap-voice-status.fl-voice-active {
  color: #39ff14;
  animation: fl-voice-pulse 1.2s ease-in-out infinite;
}

@keyframes fl-voice-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@media (max-width: 480px) {
  .fl-zap-hold-btn {
    padding: 14px 32px;
    font-size: 0.9rem;
  }
  .fl-zap-stack {
    gap: 10px;
    bottom: clamp(8px, 2vh, 24px);
  }
}

/* verdict banner */
.fl-zap-verdict {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(1.4rem, 5vw, 3rem);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  text-align: center;
  pointer-events: none;
  display: none;
}

.fl-zap-verdict.fl-verdict-perfect {
  color: #ffb300;
  text-shadow: 0 0 30px #ffb300, 0 0 70px #ffb30088;
}

.fl-zap-verdict.fl-verdict-good {
  color: #39ff14;
  text-shadow: 0 0 24px #39ff14;
}

.fl-zap-verdict.fl-verdict-weak {
  color: #668866;
  text-shadow: 0 0 10px #39ff1444;
}

/* first spoken line text */
.fl-zap-first-line {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.7rem, 1.6vw, 0.9rem);
  letter-spacing: 0.06em;
  color: #c77dff;
  text-align: center;
  max-width: min(560px, 85vw);
  line-height: 1.5;
  pointer-events: none;
  display: none;
  font-style: italic;
}

/* screen-flash overlay */
.fl-zap-flash {
  position: fixed;
  inset: 0;
  background: #ffffff;
  pointer-events: none;
  opacity: 0;
  z-index: 999;
  transition: opacity 0.08s ease-out;
}

.fl-zap-flash.fl-flash-active {
  opacity: 1;
  transition: none;
}
  `;
  document.head.appendChild(style);
}

// ── Module-level state ────────────────────────────────────────────────────

/** Mounted DOM references — null when screen is not active. */
interface ZapRefs {
  screen:      HTMLElement;
  fill:        HTMLElement;
  pct:         HTMLElement;
  holdBtn:     HTMLElement;
  voiceStatus: HTMLElement;
  verdict:     HTMLElement;
  firstLine:   HTMLElement;
  flash:       HTMLElement;
}

let _refs:      ZapRefs | null = null;
let _mounted    = false;
/** State reference stored at mount so listeners can call awaken(). */
let _state:     GameState | null = null;

/** Current charge 0-100 (integer). */
let _charge     = 0;
/** Whether the coil button / SPACE is being held. */
let _holding    = false;
/** Whether the awakening has already fired (guard double-awaken). */
let _awakened   = false;
/** rAF id for the charge animation tick. */
let _chargeRaf: number | null = null;
/** Timestamp (ms) when holding started. */
let _holdStart  = 0;
/** Charge value at hold start (so we can resume from partial). */
let _chargeAtHoldStart = 0;

/** Total rise time 0→100 in milliseconds. */
const CHARGE_RISE_MS = 1600;

// ── Keyboard / pointer listeners ──────────────────────────────────────────

function onKeyDown(e: KeyboardEvent): void {
  if (e.key !== ' ') return;
  if (e.repeat) return;
  e.preventDefault();
  beginHold();
}

function onKeyUp(e: KeyboardEvent): void {
  if (e.key !== ' ') return;
  endHold();
}

function beginHold(): void {
  if (_awakened) return;
  if (_holding) return;
  _holding = true;
  _holdStart = performance.now();
  _chargeAtHoldStart = _charge;
  startChargeAnimation();
  _refs?.holdBtn.classList.add('fl-held');
}

function endHold(): void {
  if (!_holding) return;
  _holding = false;
  stopChargeAnimation();
  _refs?.holdBtn.classList.remove('fl-held');
  if (!_awakened && _state) awaken(_charge, _state);
}

// ── Charge animation ──────────────────────────────────────────────────────

function startChargeAnimation(): void {
  if (_chargeRaf !== null) return;
  tickCharge();
}

function stopChargeAnimation(): void {
  if (_chargeRaf !== null) {
    cancelAnimationFrame(_chargeRaf);
    _chargeRaf = null;
  }
}

function tickCharge(): void {
  const elapsed = performance.now() - _holdStart;
  // 0→100 over CHARGE_RISE_MS, offset by whatever charge was before we started
  const gained  = Math.min((elapsed / CHARGE_RISE_MS) * 100, 100 - _chargeAtHoldStart);
  _charge       = Math.round(_chargeAtHoldStart + gained);

  updateChargeUI();

  if (_charge >= 100) {
    // Auto-release as perfect when fully charged
    _holding = false;
    _refs?.holdBtn.classList.remove('fl-held');
    stopChargeAnimation();
    if (!_awakened && _state) awaken(_charge, _state);
    return;
  }

  if (_holding) {
    _chargeRaf = requestAnimationFrame(tickCharge);
  } else {
    _chargeRaf = null;
  }
}

function updateChargeUI(): void {
  if (!_refs) return;
  setCharge(_charge / 100);
  _refs.fill.style.width = `${_charge}%`;
  _refs.pct.textContent  = `${_charge}%`;
}

// ── Quality + awaken ──────────────────────────────────────────────────────

type Quality = 'perfect' | 'good' | 'weak';

function chargeToQuality(charge: number): Quality {
  if (charge >= 90) return 'perfect';
  if (charge >= 60) return 'good';
  return 'weak';
}

function qualityToEnergy(q: Quality): number {
  if (q === 'perfect') return 100;
  if (q === 'good')    return 70;
  return 40;
}

/**
 * Single shared awaken path — called by both release and voice paths.
 * Takes the charge value at the moment of awakening so both paths are
 * literally the same function with the same mapping.
 */
function awaken(charge: number, state: GameState): void {
  if (_awakened) return;
  _awakened = true;

  // Stop the coil and voice input
  stopCoilHum();
  stopListening();
  stopChargeAnimation();
  removeListeners();

  const quality = chargeToQuality(charge);
  const energy  = qualityToEnergy(quality);

  // Persist energy into ZAP phase before nextPhase reads it
  if (state.phase.name === 'ZAP') {
    state.phase.charge = energy;
  }

  // Flash effect
  if (_refs) {
    _refs.flash.classList.add('fl-flash-active');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (_refs) _refs.flash.classList.remove('fl-flash-active');
      });
    });
  }

  playThunder();

  // Show verdict banner
  if (_refs) {
    const verdictLabels: Record<Quality, string> = {
      perfect: 'PERFECT AWAKENING!',
      good:    'GREAT AWAKENING!',
      weak:    'WEAK AWAKENING',
    };
    const verdictClasses: Record<Quality, string> = {
      perfect: 'fl-verdict-perfect',
      good:    'fl-verdict-good',
      weak:    'fl-verdict-weak',
    };
    _refs.verdict.textContent  = verdictLabels[quality];
    _refs.verdict.className    = `fl-zap-verdict ${verdictClasses[quality]}`;
    _refs.verdict.style.display = 'block';

    // Hide the hold button and charge bar now
    _refs.holdBtn.style.display   = 'none';
    _refs.fill.parentElement!.style.visibility = 'hidden';
  }

  // Monster speaks
  if (state.phase.name === 'ZAP') {
    const { build } = state.phase;
    const firstLine = FIRST_LINES[build.head];

    speakAsMonster(firstLine, build.head);

    if (_refs) {
      _refs.firstLine.textContent  = `"${firstLine}"`;
      _refs.firstLine.style.display = 'block';
    }
  }

  // Advance to SURVIVE after a short verdict display
  setTimeout(() => {
    nextPhase(state);
  }, 900);
}

// ── Voice command handler ─────────────────────────────────────────────────

function onVoiceCommand(cmd: CommandEvent, state: GameState): void {
  if (cmd.type !== 'awaken') return;
  awaken(_charge, state);
}

// ── Listener management ───────────────────────────────────────────────────

let _listenersAttached = false;

function attachListeners(state: GameState): void {
  if (_listenersAttached) return;
  _listenersAttached = true;

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup',   onKeyUp);

  if (_refs) {
    _refs.holdBtn.addEventListener('pointerdown', beginHold);
    window.addEventListener('pointerup', endHold);
  }

  // Start voice if supported
  if (isSpeechRecognitionSupported()) {
    startListening((cmd: CommandEvent) => onVoiceCommand(cmd, state));
    if (_refs) {
      _refs.voiceStatus.textContent = '🎤 LISTENING — shout: IT\'S ALIVE!';
      _refs.voiceStatus.classList.add('fl-voice-active');
    }
  } else {
    if (_refs) {
      _refs.voiceStatus.textContent = 'voice unavailable — hold SPACE';
    }
  }
}

function removeListeners(): void {
  if (!_listenersAttached) return;
  _listenersAttached = false;

  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup',   onKeyUp);
  window.removeEventListener('pointerup', endHold);

  if (_refs) {
    _refs.holdBtn.removeEventListener('pointerdown', beginHold);
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────

function mountZapScreen(domRoot: HTMLElement, state: GameState): void {
  ensureStyles();
  domRoot.innerHTML = '';

  // Flash overlay — appended to body so it covers everything
  const flash = document.createElement('div');
  flash.className = 'fl-zap-flash';
  document.body.appendChild(flash);

  // Screen container
  const screen = document.createElement('div');
  screen.className = 'fl-zap-screen';

  // Verdict (initially hidden)
  const verdict = document.createElement('div');
  verdict.className  = 'fl-zap-verdict';
  verdict.style.display = 'none';

  // First spoken line (initially hidden)
  const firstLine = document.createElement('div');
  firstLine.className  = 'fl-zap-first-line';
  firstLine.style.display = 'none';

  // Charge track
  const track = document.createElement('div');
  track.className = 'fl-zap-track';

  const fill = document.createElement('div');
  fill.className = 'fl-zap-fill';

  // Target zone indicators
  const targetZone = document.createElement('div');
  targetZone.className = 'fl-zap-target';
  const perfectZone = document.createElement('div');
  perfectZone.className = 'fl-zap-perfect-zone';

  const pct = document.createElement('div');
  pct.className  = 'fl-zap-pct';
  pct.textContent = '0%';

  track.appendChild(fill);
  track.appendChild(targetZone);
  track.appendChild(perfectZone);
  track.appendChild(pct);

  // Instructions
  const instruction = document.createElement('div');
  instruction.className = 'fl-zap-instruction';
  instruction.textContent = 'HOLD SPACE — or SHOUT: IT\'S ALIVE!';

  // Hold button
  const holdBtn = document.createElement('button');
  holdBtn.className  = 'fl-zap-hold-btn';
  holdBtn.textContent = '⚡ HOLD TO CHARGE ⚡';
  holdBtn.setAttribute('aria-label', 'Hold to charge the coil');

  // Voice status
  const voiceStatus = document.createElement('div');
  voiceStatus.className = 'fl-zap-voice-status';
  voiceStatus.textContent = isSpeechRecognitionSupported()
    ? '🎤 Initialising microphone…'
    : 'voice unavailable — hold SPACE';

  // Stack wrapper — absolutely positioned via .fl-zap-stack CSS
  const stack = document.createElement('div');
  stack.className = 'fl-zap-stack';
  stack.appendChild(verdict);
  stack.appendChild(firstLine);
  stack.appendChild(track);
  stack.appendChild(instruction);
  stack.appendChild(holdBtn);
  stack.appendChild(voiceStatus);

  screen.appendChild(stack);
  domRoot.appendChild(screen);

  _refs = { screen, fill, pct, holdBtn, voiceStatus, verdict, firstLine, flash };
  _mounted = true;
  _state  = state;

  // Reset charge state for this run
  _charge             = 0;
  _holding            = false;
  _awakened           = false;
  _chargeAtHoldStart  = 0;

  // Start coil hum at zero charge
  ensureAudio();
  startCoilHum();
  setCharge(0);

  attachListeners(state);
}

// ── renderZapScreen — called every frame ──────────────────────────────────

export function renderZapScreen(domRoot: HTMLElement, state: GameState): void {
  if (state.phase.name !== 'ZAP') return;

  if (!_mounted) {
    mountZapScreen(domRoot, state);
  }
  // Live values are updated from the charge animation tick;
  // no per-frame DOM rebuild needed.
}

// ── clearZapScreen — teardown ─────────────────────────────────────────────

export function clearZapScreen(): void {
  stopChargeAnimation();
  removeListeners();
  stopListening();
  stopCoilHum();

  if (_refs?.flash?.parentNode) {
    _refs.flash.parentNode.removeChild(_refs.flash);
  }

  _refs    = null;
  _mounted = false;
  _state   = null;
  _awakened = false;
  _holding  = false;
  _charge   = 0;
  _chargeAtHoldStart = 0;
}
