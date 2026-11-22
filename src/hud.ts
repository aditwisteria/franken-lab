/**
 * hud.ts — DOM HUD overlay for the SURVIVE phase.
 *
 * Conventions mirror zap.ts / stitch.ts:
 *  - renderSurviveScreen(domRoot, state) is idempotent and called every
 *    frame. It mounts the HUD once, then updates only the values that have
 *    changed (via cached sentinels). It does NOT rebuild the DOM every frame.
 *  - clearSurviveScreen() tears everything down and removes all listeners.
 *  - CSS is injected once at module load.
 *
 * Pointer-events strategy: containers are pointer-events: none so canvas
 * tap-to-move still works.  Only the ability buttons are pointer-events: auto.
 */

import { GameState } from './state.js';
import {
  getArenaHudView,
  triggerSlotAbility,
  isArenaPaused,
  HudAbilityView,
} from './arena.js';
import { ensureAudio, playUiClick } from './audio.js';

// ── CSS injection (once) ──────────────────────────────────────────────────

let _cssInjected = false;

function ensureStyles(): void {
  if (_cssInjected) return;
  _cssInjected = true;

  const style = document.createElement('style');
  style.id = 'fl-hud-styles';
  style.textContent = `
/* ── HUD outer shell ───────────────────────────────────────────────────── */
.fl-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  font-family: 'Courier New', Courier, monospace;
}

/* ── Top bar ───────────────────────────────────────────────────────────── */
.fl-hud-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 14px;
  background: rgba(10, 13, 15, 0.78);
  border-bottom: 1px solid #2a3a2a;
  pointer-events: none;
}

.fl-hud-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.fl-hud-stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #556655;
}

.fl-hud-stat-value {
  font-size: 0.75rem;
  color: #c8d8c0;
  min-width: 2.2em;
  text-align: right;
}

/* HP bar */
.fl-hud-hp-track {
  flex: 1 1 80px;
  max-width: 160px;
  height: 10px;
  background: #1a0a0a;
  border: 1px solid #3a1a1a;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.fl-hud-hp-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: #cc2222;
  transition: width 0.08s linear;
  border-radius: 2px;
}

/* Energy bar */
.fl-hud-en-track {
  flex: 1 1 60px;
  max-width: 120px;
  height: 10px;
  background: #1a1500;
  border: 1px solid #3a3000;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.fl-hud-en-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: #ffb300;
  transition: width 0.08s linear;
  border-radius: 2px;
}

/* ── Bottom ability bar ─────────────────────────────────────────────────── */
.fl-hud-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(10, 13, 15, 0.78);
  border-top: 1px solid #2a3a2a;
  pointer-events: none;
}

/* Individual ability button */
.fl-hud-ability-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 72px;
  min-height: 56px;
  padding: 6px 8px 5px;
  background: #0d1a0d;
  border: 1.5px solid #2a4a2a;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  pointer-events: auto;
  user-select: none;
  -webkit-user-select: none;
  transition: border-color 0.1s, background 0.1s;
  gap: 2px;
}

.fl-hud-ability-btn:hover:not(.fl-hud-btn-disabled) {
  border-color: #39ff14;
  background: #122012;
}

.fl-hud-ability-btn:active:not(.fl-hud-btn-disabled) {
  background: #1a3a1a;
}

.fl-hud-btn-disabled {
  opacity: 0.42;
  cursor: default;
}

/* Cooldown sweep overlay — fills from bottom up as frac goes 0→1→0 */
.fl-hud-cd-overlay {
  position: absolute;
  left: 0; bottom: 0; right: 0;
  height: 0%;
  background: rgba(0, 0, 0, 0.55);
  pointer-events: none;
  transition: height 0.08s linear;
}

.fl-hud-ability-name {
  position: relative;
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #39ff14;
  text-align: center;
  line-height: 1.2;
  z-index: 1;
}

.fl-hud-btn-disabled .fl-hud-ability-name {
  color: #556655;
}

.fl-hud-ability-donor {
  position: relative;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  color: #556655;
  text-align: center;
  z-index: 1;
}

.fl-hud-ability-key {
  position: relative;
  font-size: 0.6rem;
  color: #ffb300;
  letter-spacing: 0.08em;
  z-index: 1;
}

/* Arms chip (non-button, auto-attack status) */
.fl-hud-arms-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  padding: 5px 7px 4px;
  background: #0a0f0a;
  border: 1px solid #1a2a1a;
  border-radius: 4px;
  gap: 4px;
  pointer-events: none;
}

.fl-hud-arms-label {
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3a5a3a;
}

.fl-hud-arms-name {
  font-size: 0.55rem;
  color: #778877;
  text-align: center;
  line-height: 1.2;
}

.fl-hud-arms-cd-track {
  width: 100%;
  height: 3px;
  background: #1a2a1a;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.fl-hud-arms-cd-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: #778877;
  transition: width 0.08s linear;
  border-radius: 2px;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .fl-hud-top {
    flex-wrap: wrap;
    gap: 6px 10px;
    padding: 6px 8px;
    font-size: 0.85em;
  }
  .fl-hud-stat-label {
    font-size: 0.55rem;
  }
  .fl-hud-stat-value {
    font-size: 0.7rem;
  }
  .fl-hud-hp-track {
    max-width: 100px;
    flex: 1 1 60px;
  }
  .fl-hud-en-track {
    max-width: 80px;
    flex: 1 1 50px;
  }
  .fl-hud-bottom {
    gap: 5px;
    padding: 6px 6px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .fl-hud-ability-btn {
    min-width: 0;
    flex: 1 1 calc(33% - 10px);
    min-height: 48px;
    padding: 5px 4px 4px;
  }
  .fl-hud-arms-chip {
    min-width: 0;
    flex: 1 1 calc(33% - 10px);
    min-height: 48px;
    justify-content: center;
  }
}

/* ── Pause overlay ──────────────────────────────────────────────────────── */
.fl-hud-pause-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 15;
}

.fl-hud-pause-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(1rem, 3vw, 1.6rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c8d8c0;
  background: rgba(10, 13, 15, 0.82);
  border: 1px solid #2a4a2a;
  padding: 12px 28px;
  border-radius: 4px;
  text-shadow: 0 0 12px #39ff1444;
}
  `;
  document.head.appendChild(style);
}

// ── Module-level state ────────────────────────────────────────────────────

interface HudRefs {
  screen:      HTMLElement;
  waveVal:     HTMLElement;
  scoreVal:    HTMLElement;
  hpFill:      HTMLElement;
  hpVal:       HTMLElement;
  enFill:      HTMLElement;
  /** per-slot: [head, torso, legs] */
  abilityBtns: HTMLElement[];
  cdOverlays:  HTMLElement[];
  armsCdFill:  HTMLElement;
  pauseOverlay: HTMLElement;
}

let _refs:    HudRefs | null = null;
let _mounted  = false;

// Change-detection sentinels
let _lastWave     = -1;
let _lastScore    = -1;
let _lastHp       = -1;
let _lastEnergy   = -1;
// Packed as strings to compare cheaply
let _lastAbilityKeys: string[] = [];
let _lastArmsFrac   = -1;
let _lastPaused     = false;

// Key-listener ref for cleanup
let _keyHandler: ((e: KeyboardEvent) => void) | null = null;

// ── Mount ─────────────────────────────────────────────────────────────────

function mountHud(domRoot: HTMLElement, state: GameState): void {
  ensureStyles();
  domRoot.innerHTML = '';

  const hud = document.createElement('div');
  hud.className = 'fl-hud';

  // ── Top bar ──────────────────────────────────────────────────────────
  const top = document.createElement('div');
  top.className = 'fl-hud-top';

  // WAVE
  const waveStat = makeStat('WAVE');
  const waveVal  = waveStat.val;
  top.appendChild(waveStat.wrap);

  // HP
  const hpStat   = makeStat('HP');
  const hpVal    = hpStat.val;
  top.appendChild(hpStat.wrap);

  const hpTrack = document.createElement('div');
  hpTrack.className = 'fl-hud-hp-track';
  const hpFill = document.createElement('div');
  hpFill.className  = 'fl-hud-hp-fill';
  hpFill.style.width = '100%';
  hpTrack.appendChild(hpFill);
  top.appendChild(hpTrack);

  // ENERGY
  const enStat  = makeStat('EN');
  top.appendChild(enStat.wrap);

  const enTrack = document.createElement('div');
  enTrack.className = 'fl-hud-en-track';
  const enFill = document.createElement('div');
  enFill.className  = 'fl-hud-en-fill';
  enFill.style.width = '0%';
  enTrack.appendChild(enFill);
  top.appendChild(enTrack);

  // SCORE
  const scoreStat = makeStat('SCORE');
  const scoreVal  = scoreStat.val;
  top.appendChild(scoreStat.wrap);

  hud.appendChild(top);

  // ── Bottom ability bar ────────────────────────────────────────────────
  const bottom = document.createElement('div');
  bottom.className = 'fl-hud-bottom';

  const abilityBtns: HTMLElement[] = [];
  const cdOverlays:  HTMLElement[] = [];

  const slotDefs: Array<{ slot: 'head' | 'torso' | 'legs'; keyHint: string }> = [
    { slot: 'head',  keyHint: '1' },
    { slot: 'torso', keyHint: '2' },
    { slot: 'legs',  keyHint: '3' },
  ];

  for (let i = 0; i < 3; i++) {
    const { slot } = slotDefs[i]!;

    const btn = document.createElement('button');
    btn.className = 'fl-hud-ability-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', `Use ${slot} ability`);

    const cdOverlay = document.createElement('div');
    cdOverlay.className = 'fl-hud-cd-overlay';

    const abilityName = document.createElement('div');
    abilityName.className = 'fl-hud-ability-name';

    const donorLabel = document.createElement('div');
    donorLabel.className = 'fl-hud-ability-donor';

    const keyLabel = document.createElement('div');
    keyLabel.className = 'fl-hud-ability-key';

    btn.appendChild(cdOverlay);
    btn.appendChild(abilityName);
    btn.appendChild(donorLabel);
    btn.appendChild(keyLabel);
    bottom.appendChild(btn);

    abilityBtns.push(btn);
    cdOverlays.push(cdOverlay);

    // Click handler — capture slot in closure
    const capturedSlot = slot;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('fl-hud-btn-disabled')) return;
      ensureAudio();
      playUiClick();
      triggerSlotAbility(state, capturedSlot);
    });
  }

  // Arms chip (auto-attack status, not a button)
  const armsChip = document.createElement('div');
  armsChip.className = 'fl-hud-arms-chip';

  const armsLabel = document.createElement('div');
  armsLabel.className = 'fl-hud-arms-label';
  armsLabel.textContent = 'AUTO';

  const armsName = document.createElement('div');
  armsName.className = 'fl-hud-arms-name';

  const armsCdTrack = document.createElement('div');
  armsCdTrack.className = 'fl-hud-arms-cd-track';
  const armsCdFill = document.createElement('div');
  armsCdFill.className  = 'fl-hud-arms-cd-fill';
  armsCdFill.style.width = '0%';
  armsCdTrack.appendChild(armsCdFill);

  armsChip.appendChild(armsLabel);
  armsChip.appendChild(armsName);
  armsChip.appendChild(armsCdTrack);
  bottom.appendChild(armsChip);

  hud.appendChild(bottom);

  // ── Pause overlay ─────────────────────────────────────────────────────
  const pauseOverlay = document.createElement('div');
  pauseOverlay.className = 'fl-hud-pause-overlay';
  pauseOverlay.style.display = 'none';

  const pauseText = document.createElement('div');
  pauseText.className = 'fl-hud-pause-text';
  pauseText.textContent = '❚❚ PAUSED — P to resume';
  pauseOverlay.appendChild(pauseText);
  hud.appendChild(pauseOverlay);

  domRoot.appendChild(hud);

  // Populate ability labels from initial view
  const view = getArenaHudView(state);
  for (let i = 0; i < 3; i++) {
    const ab = view.abilities[i];
    if (!ab) continue;
    const btn  = abilityBtns[i]!;
    const name = btn.querySelector<HTMLElement>('.fl-hud-ability-name')!;
    const donor = btn.querySelector<HTMLElement>('.fl-hud-ability-donor')!;
    const key  = btn.querySelector<HTMLElement>('.fl-hud-ability-key')!;
    name.textContent  = ab.name;
    donor.textContent = ab.donorName;
    key.textContent   = `[${ab.keyHint}]`;
  }
  armsName.textContent = view.armsAbility.name;

  _refs = {
    screen:      hud,
    waveVal,
    scoreVal,
    hpFill,
    hpVal,
    enFill,
    abilityBtns,
    cdOverlays,
    armsCdFill,
    pauseOverlay,
  };
  _mounted = true;

  // Keyboard shortcut for R → retry while in END (handled in end.ts, not here)
  // No additional key listeners needed: 1/2/3 and movement keys are in arena.ts.
}

// ── Helpers ───────────────────────────────────────────────────────────────

function makeStat(label: string): { wrap: HTMLElement; val: HTMLElement } {
  const wrap = document.createElement('div');
  wrap.className = 'fl-hud-stat';

  const lbl = document.createElement('span');
  lbl.className  = 'fl-hud-stat-label';
  lbl.textContent = label;

  const val = document.createElement('span');
  val.className  = 'fl-hud-stat-value';
  val.textContent = '—';

  wrap.appendChild(lbl);
  wrap.appendChild(val);
  return { wrap, val };
}

// ── renderSurviveScreen — called every frame ──────────────────────────────

export function renderSurviveScreen(domRoot: HTMLElement, state: GameState): void {
  if (state.phase.name !== 'SURVIVE') return;

  if (!_mounted) {
    resetSentinels();
    mountHud(domRoot, state);
  }

  if (!_refs) return;

  const view = getArenaHudView(state);

  // ── Top bar: wave, score, hp, energy ──────────────────────────────
  if (view.wave !== _lastWave) {
    _refs.waveVal.textContent = String(view.wave);
    _lastWave = view.wave;
  }

  if (view.score !== _lastScore) {
    _refs.scoreVal.textContent = String(view.score);
    _lastScore = view.score;
  }

  const hpInt = Math.round(view.hp);
  if (hpInt !== _lastHp) {
    _refs.hpVal.textContent  = `${hpInt}/${view.maxHp}`;
    _refs.hpFill.style.width = `${Math.max(0, (view.hp / view.maxHp) * 100)}%`;
    _lastHp = hpInt;
  }

  const enInt = Math.round(view.energy);
  if (enInt !== _lastEnergy) {
    _refs.enFill.style.width = `${Math.max(0, (view.energy / view.maxEnergy) * 100)}%`;
    _lastEnergy = enInt;
  }

  // ── Bottom bar: abilities ──────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    const ab  = view.abilities[i];
    if (!ab) continue;

    const key = `${ab.cooldownFrac.toFixed(2)}-${ab.ready}-${ab.affordable}`;
    if (key === _lastAbilityKeys[i]) continue;
    _lastAbilityKeys[i] = key;

    const btn     = _refs.abilityBtns[i]!;
    const overlay = _refs.cdOverlays[i]!;

    const disabled = !ab.ready || !ab.affordable;
    btn.classList.toggle('fl-hud-btn-disabled', disabled);
    // cooldown overlay height: 100% when just used, 0% when ready
    overlay.style.height = `${ab.cooldownFrac * 100}%`;
  }

  // ── Arms chip cooldown ─────────────────────────────────────────────
  const armsFrac2 = Math.round(view.armsAbility.cooldownFrac * 100) / 100;
  if (armsFrac2 !== _lastArmsFrac) {
    // Show filled portion of the cooldown (ready = full bar green, charging = partial)
    _refs.armsCdFill.style.width = `${(1 - view.armsAbility.cooldownFrac) * 100}%`;
    _lastArmsFrac = armsFrac2;
  }

  // ── Pause overlay ──────────────────────────────────────────────────
  const paused = isArenaPaused();
  if (paused !== _lastPaused) {
    _refs.pauseOverlay.style.display = paused ? 'flex' : 'none';
    _lastPaused = paused;
  }
}

// ── clearSurviveScreen — teardown ─────────────────────────────────────────

export function clearSurviveScreen(): void {
  if (_keyHandler) {
    window.removeEventListener('keydown', _keyHandler);
    _keyHandler = null;
  }

  _refs    = null;
  _mounted = false;
  resetSentinels();
}

function resetSentinels(): void {
  _lastWave       = -1;
  _lastScore      = -1;
  _lastHp         = -1;
  _lastEnergy     = -1;
  _lastAbilityKeys = [];
  _lastArmsFrac   = -1;
  _lastPaused     = false;
}
