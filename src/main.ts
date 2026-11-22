/**
 * main.ts — Boot entry point
 *
 * 1. Retrieves the <canvas> and DOM overlay elements.
 * 2. Creates the initial GameState.
 * 3. Attaches debug key bindings.
 * 4. Starts the requestAnimationFrame loop.
 * 5. Each frame: renders the canvas scene and updates the DOM overlay
 *    when the phase has changed.
 */

import { makeInitialState, GameState } from './state.js';
import { renderFrame, attachDebugKeys } from './engine.js';
import {
  renderTitleScreen,
  renderStitchScreen,
  clearDomScreen,
} from './stitch.js';
import { renderZapScreen, clearZapScreen } from './zap.js';
import { renderSurviveScreen, clearSurviveScreen } from './hud.js';
import { renderEndScreen, clearEndScreen } from './end.js';
import { toggleMuted } from './audio.js';
import { updateArena } from './arena.js';

// ── DOM references ────────────────────────────────────────────────────────

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
const phaseLabel = document.getElementById('phase-label') as HTMLElement | null;
const domRoot = document.getElementById('dom-root') as HTMLElement | null;

if (!canvas) {
  throw new Error('FRANKEN-LAB: <canvas id="game"> not found in DOM.');
}
if (!domRoot) {
  throw new Error('FRANKEN-LAB: <div id="dom-root"> not found in DOM.');
}

// ── Bootstrap ─────────────────────────────────────────────────────────────

const state: GameState = makeInitialState();

attachDebugKeys(state);

// ── DOM screen router ──���──────────────────────────────────────────────────

let _prevPhaseName = '';

/**
 * Update the DOM overlay to match the current phase.
 * - TITLE   → title screen
 * - STITCH  → stitch screen (re-renders on build selection change)
 * - ZAP     → zap screen (charge bar + voice status)
 * - SURVIVE → HUD overlay (top bar + ability buttons)
 * - END     → end screen (score, build recap, retry/return buttons)
 *
 * Each screen renderer tracks its own last-rendered state and is a cheap
 * no-op when nothing has changed.
 */
function updateDomScreens(): void {
  const phaseName = state.phase.name;

  // Phase-change: propagate to header label and tear down outgoing screen.
  if (phaseName !== _prevPhaseName) {
    if (_prevPhaseName === 'ZAP')     clearZapScreen();
    if (_prevPhaseName === 'SURVIVE') clearSurviveScreen();
    if (_prevPhaseName === 'END')     clearEndScreen();
    _prevPhaseName = phaseName;
    if (phaseLabel) {
      phaseLabel.textContent = phaseName;
    }
  }

  switch (phaseName) {
    case 'TITLE':
      renderTitleScreen(domRoot!, state);
      break;
    case 'STITCH':
      renderStitchScreen(domRoot!, state);
      break;
    case 'ZAP':
      renderZapScreen(domRoot!, state);
      break;
    case 'SURVIVE':
      renderSurviveScreen(domRoot!, state);
      break;
    case 'END':
      renderEndScreen(domRoot!, state);
      break;
    default:
      clearDomScreen(domRoot!);
      break;
  }
}

// ── Global mute toggle (M key) ────────────────────────────────────────────

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'm' || e.key === 'M') {
    toggleMuted();
  }
});

// ── Game loop ─────────────────────────────────────────────────────────────

let lastTimestamp = 0;

function loop(timestamp: number): void {
  const delta = lastTimestamp === 0 ? 0 : timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  state.now     = timestamp;
  state.elapsed += delta;

  // Clamp delta to 50 ms max to avoid spiral of death on tab blur/restore.
  const dtMs = Math.min(delta, 50);
  if (state.phase.name === 'SURVIVE') {
    updateArena(state, dtMs / 1000);
  }

  renderFrame(canvas!, state);
  updateDomScreens();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
