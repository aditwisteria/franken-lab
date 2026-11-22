/**
 * end.ts — DOM screen renderer for the END phase.
 *
 * Conventions mirror stitch.ts / zap.ts / hud.ts:
 *  - renderEndScreen(domRoot, state) is idempotent and called every frame;
 *    it mounts once and no-ops when nothing has changed.
 *  - clearEndScreen() tears everything down and removes all listeners.
 *  - CSS is injected once at module load.
 */

import { GameState, transitionTo } from './state.js';
import { buildMonster } from './monster.js';
import { getLastRunRecap } from './arena.js';
import { ensureAudio, playUiSelect } from './audio.js';
import { DONORS } from './donors.js';
import { loadJournal } from './journal.js';

// ── CSS injection (once) ──────────────────────────────────────────────────

let _cssInjected = false;

function ensureStyles(): void {
  if (_cssInjected) return;
  _cssInjected = true;

  const style = document.createElement('style');
  style.id = 'fl-end-styles';
  style.textContent = `
/* ── END screen ────────────────────────────────────────────────────────── */
.fl-end-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 28px 20px;
  background: rgba(10, 13, 15, 0.92);
  pointer-events: all;
  z-index: 20;
  overflow-y: auto;
}

.fl-end-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(1.4rem, 5vw, 2.8rem);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #cc2222;
  text-shadow: 0 0 24px #cc222288, 0 0 60px #cc222244;
  text-align: center;
  animation: fl-end-flicker 2.8s ease-in-out infinite;
}

@keyframes fl-end-flicker {
  0%, 90%, 100% { opacity: 1; }
  92%           { opacity: 0.6; }
  94%           { opacity: 1; }
  96%           { opacity: 0.4; }
  98%           { opacity: 1; }
}

.fl-end-stats-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.fl-end-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.fl-end-stat-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #556655;
}

.fl-end-stat-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.4rem;
  color: #ffb300;
  letter-spacing: 0.08em;
  text-shadow: 0 0 10px #ffb30066;
}

.fl-end-seed {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: #3a5a3a;
  text-transform: uppercase;
}

/* Build recap */
.fl-end-build {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 420px;
  border: 1px solid #2a3a2a;
  border-radius: 4px;
  padding: 10px 14px;
  background: rgba(10, 20, 10, 0.6);
}

.fl-end-build-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #556655;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.fl-end-build-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.fl-end-build-slot {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.15em;
  color: #3a5a3a;
  text-transform: uppercase;
  min-width: 40px;
}

.fl-end-build-donor {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.72rem;
  color: #c8d8c0;
  letter-spacing: 0.06em;
}

.fl-end-build-ability {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  color: #c77dff;
  letter-spacing: 0.04em;
}

/* Buttons */
.fl-end-btn-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.fl-end-btn {
  padding: 12px 28px;
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.75rem, 1.8vw, 0.95rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  transition: background 0.15s, box-shadow 0.15s;
}

.fl-end-btn-retry {
  color: #0a0d0f;
  background: #39ff14;
  box-shadow: 0 0 16px #39ff1488;
}

.fl-end-btn-retry:hover,
.fl-end-btn-retry:focus {
  background: #80ff50;
  box-shadow: 0 0 28px #39ff14;
  outline: none;
}

.fl-end-btn-title {
  color: #c8d8c0;
  background: #1a2a1a;
  border: 1px solid #2a4a2a;
  box-shadow: 0 0 8px #2a4a2a44;
}

.fl-end-btn-title:hover,
.fl-end-btn-title:focus {
  background: #223322;
  box-shadow: 0 0 16px #39ff1444;
  outline: none;
}

@media (max-width: 480px) {
  .fl-end-screen {
    padding: 16px 12px;
    gap: 12px;
    justify-content: flex-start;
    overflow-y: auto;
  }
  .fl-end-build {
    padding: 8px 10px;
  }
  .fl-end-build-row {
    flex-wrap: wrap;
    gap: 4px;
  }
  .fl-end-btn-row {
    gap: 10px;
  }
  .fl-end-btn {
    padding: 10px 18px;
    font-size: 0.75rem;
  }
}
  `;
  document.head.appendChild(style);
}

// ── Module-level state ────────────────────────────────────────────────────

let _mounted  = false;
// Sentinel: re-mount only when score or wave changes (phase only flips once
// per run, so this is effectively a one-time guard).
let _lastScore = -1;
let _lastWave  = -1;

let _keyHandler: ((e: KeyboardEvent) => void) | null = null;

// ── Mount ─────────────────────────────────────────────────────────────────

function mountEndScreen(domRoot: HTMLElement, state: GameState): void {
  ensureStyles();
  domRoot.innerHTML = '';

  if (state.phase.name !== 'END') return;

  const { score, wave } = state.phase;
  const recap = getLastRunRecap();

  const screen = document.createElement('div');
  screen.className = 'fl-end-screen';

  // Title
  const title = document.createElement('div');
  title.className   = 'fl-end-title';
  title.textContent = 'THE LAB HAS FALLEN';
  screen.appendChild(title);

  // Stats row
  const statsRow = document.createElement('div');
  statsRow.className = 'fl-end-stats-row';

  const journal = loadJournal();
  const statDefs: Array<[string, string]> = [
    ['SCORE', String(score)],
    ['BEST',  String(journal.bestScore)],
    ['WAVE',  String(wave)],
  ];
  for (const [label, value] of statDefs) {
    const stat = document.createElement('div');
    stat.className = 'fl-end-stat';
    const lbl = document.createElement('div');
    lbl.className   = 'fl-end-stat-label';
    lbl.textContent = label;
    const val = document.createElement('div');
    val.className   = 'fl-end-stat-value';
    val.textContent = value;
    stat.appendChild(lbl);
    stat.appendChild(val);
    statsRow.appendChild(stat);
  }
  screen.appendChild(statsRow);

  // Seed
  const seedEl = document.createElement('div');
  seedEl.className   = 'fl-end-seed';
  seedEl.textContent = `SEED: ${state.seed.toString(16).toUpperCase().padStart(8, '0')}`;
  screen.appendChild(seedEl);

  // Build recap
  if (recap) {
    const buildWrap = document.createElement('div');
    buildWrap.className = 'fl-end-build';

    const buildTitle = document.createElement('div');
    buildTitle.className   = 'fl-end-build-title';
    buildTitle.textContent = 'YOUR MONSTER';
    buildWrap.appendChild(buildTitle);

    const slots: Array<keyof typeof recap.build> = ['head', 'torso', 'arms', 'legs'];
    const slotAbilityIdx: Record<string, number> = { head: 0, torso: 1, arms: 2, legs: 3 };

    for (const slot of slots) {
      const donorId   = recap.build[slot];
      const donorData = DONORS[donorId];
      const ability   = recap.monster.abilities[slotAbilityIdx[slot]!]!;

      const row = document.createElement('div');
      row.className = 'fl-end-build-row';

      const slotEl = document.createElement('span');
      slotEl.className   = 'fl-end-build-slot';
      slotEl.textContent = slot.toUpperCase();

      const donorEl = document.createElement('span');
      donorEl.className   = 'fl-end-build-donor';
      donorEl.textContent = donorData.name;

      const abilityEl = document.createElement('span');
      abilityEl.className   = 'fl-end-build-ability';
      abilityEl.textContent = `▸ ${ability.name}`;

      row.appendChild(slotEl);
      row.appendChild(donorEl);
      row.appendChild(abilityEl);
      buildWrap.appendChild(row);
    }
    screen.appendChild(buildWrap);
  }

  // Buttons
  const btnRow = document.createElement('div');
  btnRow.className = 'fl-end-btn-row';

  const retryBtn = document.createElement('button');
  retryBtn.className   = 'fl-end-btn fl-end-btn-retry';
  retryBtn.textContent = 'RETRY (R)';
  retryBtn.addEventListener('click', () => doRetry(state));
  btnRow.appendChild(retryBtn);

  const titleBtn = document.createElement('button');
  titleBtn.className   = 'fl-end-btn fl-end-btn-title';
  titleBtn.textContent = 'RETURN TO LAB';
  titleBtn.addEventListener('click', () => doReturnToLab(state));
  btnRow.appendChild(titleBtn);

  screen.appendChild(btnRow);
  domRoot.appendChild(screen);

  _mounted   = true;
  _lastScore = score;
  _lastWave  = wave;

  // Keyboard: R → retry
  _keyHandler = (e: KeyboardEvent): void => {
    if (state.phase.name !== 'END') return;
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      doRetry(state);
    }
  };
  window.addEventListener('keydown', _keyHandler);
}

// ── Actions ───────────────────────────────────────────────────────────────

function doRetry(state: GameState): void {
  ensureAudio();
  playUiSelect();
  removeListeners();

  const recap = getLastRunRecap();
  const build = recap
    ? { ...recap.build }
    : { head: 'vampire' as const, torso: 'robot' as const, arms: 'werewolf' as const, legs: 'ghost' as const };

  transitionTo(state, {
    name:    'STITCH',
    build,
    monster: buildMonster(build),
  });

  _mounted   = false;
  _lastScore = -1;
  _lastWave  = -1;
}

function doReturnToLab(state: GameState): void {
  ensureAudio();
  playUiSelect();
  removeListeners();

  transitionTo(state, { name: 'TITLE' });

  _mounted   = false;
  _lastScore = -1;
  _lastWave  = -1;
}

// ── renderEndScreen — called every frame ──────────────────────────────────

export function renderEndScreen(domRoot: HTMLElement, state: GameState): void {
  if (state.phase.name !== 'END') return;

  const { score, wave } = state.phase;

  if (!_mounted || score !== _lastScore || wave !== _lastWave) {
    mountEndScreen(domRoot, state);
  }
  // DOM is fully built by mountEndScreen; no per-frame updates needed.
}

// ── clearEndScreen — teardown ─────────────────────────────────────────────

export function clearEndScreen(): void {
  removeListeners();
  _mounted   = false;
  _lastScore = -1;
  _lastWave  = -1;
}

function removeListeners(): void {
  if (_keyHandler) {
    window.removeEventListener('keydown', _keyHandler);
    _keyHandler = null;
  }
}
