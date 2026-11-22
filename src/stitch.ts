/**
 * stitch.ts — DOM screen renderers for TITLE and STITCH phases.
 *
 * renderTitleScreen()   — renders the TITLE screen into #dom-root
 * renderStitchScreen()  — renders the STITCH screen into #dom-root
 * clearDomScreen()      — empties #dom-root (used for ZAP/SURVIVE/END)
 *
 * Both functions are idempotent: they may be called every frame, but
 * internally track the previous rendered state and bail out early when
 * nothing has changed.
 */

import { GameState, SlotId, DonorId, stitchSelectPart, transitionTo } from './state.js';
import { DONORS, PARTS } from './donors.js';
import { buildMonster } from './monster.js';
import { loadJournal } from './journal.js';

// ── Slot display order ────────────────────────────────────────────────────

const SLOTS: SlotId[] = ['head', 'torso', 'arms', 'legs'];
const DONOR_IDS: DonorId[] = ['vampire', 'robot', 'werewolf', 'ghost', 'human'];

// ── Change-detection sentinels ────────────────────────────────────────────

let _lastPhase   = '';
let _lastBuildKey = '';

// ── CSS injection (once) ─────────────────────────────────────────────────

let _cssInjected = false;

function ensureStyles(): void {
  if (_cssInjected) return;
  _cssInjected = true;

  const style = document.createElement('style');
  style.textContent = `
/* ── TITLE screen ─────────────────────────────────────────────────────── */
.fl-title-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  pointer-events: all;
  gap: 18px;
  padding: 24px;
  text-align: center;
}
.fl-title-logo {
  font-size: clamp(2rem, 7vw, 4.5rem);
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #39ff14;
  text-shadow:
    0 0 24px #39ff14,
    0 0 60px #39ff14aa;
  animation: fl-logo-pulse 3s ease-in-out infinite;
}

@keyframes fl-logo-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.75; }
}

.fl-title-logo span {
  color: #ffb300;
  text-shadow:
    0 0 24px #ffb300,
    0 0 60px #ffb300aa;
}

.fl-title-pitch {
  max-width: 540px;
  font-size: clamp(0.7rem, 2vw, 0.95rem);
  font-family: 'Courier New', Courier, monospace;
  color: #c8d8c0;
  line-height: 1.6;
  letter-spacing: 0.05em;
}

.fl-title-btn {
  margin-top: 12px;
  padding: 14px 40px;
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.85rem, 2.2vw, 1.1rem);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #0a0d0f;
  background: #39ff14;
  border: none;
  cursor: pointer;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  box-shadow: 0 0 20px #39ff14aa;
  transition: background 0.15s, box-shadow 0.15s;
}

.fl-title-btn:hover,
.fl-title-btn:focus {
  background: #80ff50;
  box-shadow: 0 0 32px #39ff14;
  outline: none;
}

/* ── STITCH screen ────────────────────────────────────────────────────── */
.fl-stitch-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  pointer-events: all;
  overflow: hidden;
}

/* Right panel — part picker, 50 % width on wide screens */
.fl-stitch-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 50%;
  min-width: 300px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  background: rgba(10, 13, 15, 0.92);
  border-left: 2px solid #2a3a2a;
  overflow-y: auto;
  padding: 14px 14px 0;
  gap: 10px;
  z-index: 2;
  pointer-events: all;
}

/* ── Slot rows ── */
.fl-slot-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fl-slot-label {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #556655;
  padding-left: 2px;
}

.fl-donor-cards {
  display: flex;
  gap: 5px;
  flex-wrap: nowrap;
}

/* Individual donor card */
.fl-card {
  flex: 1 1 0;
  min-width: 0;
  padding: 7px 4px 6px;
  background: #111518;
  border: 1.5px solid #2a3a2a;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.1s, background 0.1s;
  display: flex;
  flex-direction: column;
  gap: 3px;
  user-select: none;
  pointer-events: all;
}

.fl-card:hover {
  border-color: #556655;
  background: #161c1a;
}

.fl-card.selected {
  border-color: #39ff14;
  background: #0d1a0d;
  box-shadow: 0 0 8px #39ff1455;
}

.fl-card-name {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c8d8c0;
  font-family: 'Courier New', Courier, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fl-card.selected .fl-card-name {
  color: #39ff14;
}

.fl-card-ability {
  font-size: 0.52rem;
  color: #556655;
  font-family: 'Courier New', Courier, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fl-card.selected .fl-card-ability {
  color: #39ff1499;
}

/* ── Ability list ── */
.fl-ability-section {
  border-top: 1px solid #2a3a2a;
  padding-top: 10px;
  margin-top: 2px;
}

.fl-ability-section-title {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #556655;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.fl-ability-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fl-ability-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fl-ability-name {
  font-size: 0.72rem;
  color: #c77dff;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.08em;
}

.fl-ability-desc {
  font-size: 0.6rem;
  color: #778877;
  font-family: 'Courier New', Courier, monospace;
  line-height: 1.4;
}

/* ── Stats bar ── */
.fl-stats-section {
  border-top: 1px solid #2a3a2a;
  padding-top: 10px;
  margin-top: 2px;
}

.fl-stats-title {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #556655;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.fl-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 14px;
}

.fl-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fl-stat-label {
  font-size: 0.55rem;
  color: #556655;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-family: 'Courier New', Courier, monospace;
}

.fl-stat-value {
  font-size: 0.75rem;
  color: #ffb300;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.08em;
}

/* ── To-the-coil button ── */
.fl-coil-btn-wrap {
  padding: 12px 0 16px;
  display: flex;
  justify-content: flex-end;
}

.fl-coil-btn {
  padding: 12px 24px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0a0d0f;
  background: #ffb300;
  border: none;
  cursor: pointer;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  box-shadow: 0 0 16px #ffb30099;
  transition: background 0.15s, box-shadow 0.15s;
}

.fl-coil-btn:hover,
.fl-coil-btn:focus {
  background: #ffd040;
  box-shadow: 0 0 28px #ffb300;
  outline: none;
}

/* ── Responsive: narrow viewport ── */
@media (max-width: 600px) {
  .fl-stitch-panel {
    width: 100%;
    max-width: 100%;
    border-left: none;
    border-top: 2px solid #2a3a2a;
    top: auto;
    height: 65%;
  }
  .fl-card-ability { display: none; }
}

@media (max-width: 480px) {
  .fl-stitch-panel {
    padding: 10px 8px 0;
    gap: 7px;
  }
  .fl-donor-cards {
    gap: 3px;
  }
  .fl-card {
    padding: 5px 2px 4px;
  }
  .fl-card-name {
    font-size: 0.55rem;
  }
  .fl-coil-btn {
    font-size: 0.75rem;
    padding: 10px 16px;
  }
}

/* ── Lab Journal panel (title screen) ── */
.fl-journal-panel {
  border: 1px solid #2a3a2a;
  border-radius: 4px;
  padding: 10px 20px;
  background: rgba(10, 20, 10, 0.55);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
}

.fl-journal-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #556655;
  margin-bottom: 2px;
}

.fl-journal-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.fl-journal-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #3a5a3a;
}

.fl-journal-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.72rem;
  color: #ffb300;
  letter-spacing: 0.08em;
  text-shadow: 0 0 8px #ffb30055;
}
  `;
  document.head.appendChild(style);
}

// ── TITLE screen ─────────────────────────────────────────────────────────

export function renderTitleScreen(domRoot: HTMLElement, state: GameState): void {
  // Re-render the title screen when journal data changes between visits.
  const journal = loadJournal();
  const journalKey = `${journal.bestScore}:${journal.totalRuns}:${journal.monstersStitched}`;
  if (_lastPhase === 'TITLE' && _lastBuildKey === journalKey) return;
  _lastPhase    = 'TITLE';
  _lastBuildKey = journalKey;

  ensureStyles();
  domRoot.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'fl-title-screen';

  const logo = document.createElement('div');
  logo.className = 'fl-title-logo';
  logo.innerHTML = 'FRANKEN<span>-LAB</span>';

  const pitch = document.createElement('p');
  pitch.className = 'fl-title-pitch';
  pitch.textContent =
    'Stitch a monster from vampire, robot, werewolf and ghost parts, ' +
    'shout it alive with your real voice, then defend the lab against the villagers — ' +
    'every sound, voice and animation is generated in the browser, zero assets.';

  // ── Lab Journal panel ─────────────────────────────────────────────────
  const journalPanel = document.createElement('div');
  journalPanel.className = 'fl-journal-panel';

  const journalTitle = document.createElement('div');
  journalTitle.className   = 'fl-journal-title';
  journalTitle.textContent = 'LAB JOURNAL';
  journalPanel.appendChild(journalTitle);

  const journalStats: Array<[string, string | number]> = [
    ['BEST SCORE',       journal.bestScore],
    ['RUNS',             journal.totalRuns],
    ['MONSTERS STITCHED', journal.monstersStitched],
  ];
  for (const [label, value] of journalStats) {
    const row = document.createElement('div');
    row.className = 'fl-journal-row';
    const lbl = document.createElement('span');
    lbl.className   = 'fl-journal-label';
    lbl.textContent = label;
    const val = document.createElement('span');
    val.className   = 'fl-journal-value';
    val.textContent = String(value);
    row.appendChild(lbl);
    row.appendChild(val);
    journalPanel.appendChild(row);
  }

  const btn = document.createElement('button');
  btn.className = 'fl-title-btn';
  btn.textContent = 'ENTER THE LAB';
  btn.addEventListener('click', () => {
    _lastPhase    = '';  // force re-render of next screen
    _lastBuildKey = '';
    transitionTo(state, {
      name:    'STITCH',
      build:   { head: 'vampire', torso: 'robot', arms: 'werewolf', legs: 'ghost' },
      monster: buildMonster({ head: 'vampire', torso: 'robot', arms: 'werewolf', legs: 'ghost' }),
    });
  });

  wrap.appendChild(logo);
  wrap.appendChild(pitch);
  wrap.appendChild(journalPanel);
  wrap.appendChild(btn);
  domRoot.appendChild(wrap);
}

// ── STITCH screen ─────────────────────────────────────────────────────────

export function renderStitchScreen(domRoot: HTMLElement, state: GameState): void {
  if (state.phase.name !== 'STITCH') return;

  const { build, monster } = state.phase;
  const buildKey = `${build.head}-${build.torso}-${build.arms}-${build.legs}`;

  if (_lastPhase === 'STITCH' && _lastBuildKey === buildKey) return;

  _lastPhase    = 'STITCH';
  _lastBuildKey = buildKey;

  ensureStyles();
  domRoot.innerHTML = '';

  // ── Right panel ───────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'fl-stitch-panel';

  // ── Slot rows ─────────────────────────────────────────────────────────
  for (const slot of SLOTS) {
    const row = document.createElement('div');
    row.className = 'fl-slot-row';

    const label = document.createElement('div');
    label.className = 'fl-slot-label';
    label.textContent = slot.toUpperCase();

    const cards = document.createElement('div');
    cards.className = 'fl-donor-cards';

    for (const donorId of DONOR_IDS) {
      const part   = PARTS[`${donorId}_${slot}`];
      const donor  = DONORS[donorId];
      const isSelected = build[slot] === donorId;

      const card = document.createElement('div');
      card.className = 'fl-card' + (isSelected ? ' selected' : '');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', String(isSelected));
      card.setAttribute('tabindex', '0');

      const name = document.createElement('div');
      name.className  = 'fl-card-name';
      name.textContent = donor.name;

      const abilityName = document.createElement('div');
      abilityName.className  = 'fl-card-ability';
      abilityName.textContent = part?.ability.name ?? '';

      card.appendChild(name);
      card.appendChild(abilityName);

      const selectFn = (): void => {
        stitchSelectPart(state, slot, donorId);
        // Re-render immediately on selection change
        _lastPhase    = '';
        _lastBuildKey = '';
        renderStitchScreen(domRoot, state);
      };
      card.addEventListener('click', selectFn);
      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectFn(); }
      });

      cards.appendChild(card);
    }

    row.appendChild(label);
    row.appendChild(cards);
    panel.appendChild(row);
  }

  // ── Abilities section ─────────────────────────────────────────────────
  const abilitySection = document.createElement('div');
  abilitySection.className = 'fl-ability-section';

  const abilityTitle = document.createElement('div');
  abilityTitle.className = 'fl-ability-section-title';
  abilityTitle.textContent = 'ABILITIES';

  const abilityList = document.createElement('div');
  abilityList.className = 'fl-ability-list';

  for (const ability of monster.abilities) {
    const item = document.createElement('div');
    item.className = 'fl-ability-item';

    const aName = document.createElement('div');
    aName.className = 'fl-ability-name';
    aName.textContent = `▸ ${ability.name}`;

    const aDesc = document.createElement('div');
    aDesc.className = 'fl-ability-desc';
    aDesc.textContent = ability.description;

    item.appendChild(aName);
    item.appendChild(aDesc);
    abilityList.appendChild(item);
  }

  abilitySection.appendChild(abilityTitle);
  abilitySection.appendChild(abilityList);
  panel.appendChild(abilitySection);

  // ── Stats section ─────────────────────────────────────────────────────
  const statsSection = document.createElement('div');
  statsSection.className = 'fl-stats-section';

  const statsTitle = document.createElement('div');
  statsTitle.className = 'fl-stats-title';
  statsTitle.textContent = 'RESOLVED STATS';

  const statsGrid = document.createElement('div');
  statsGrid.className = 'fl-stats-grid';

  const statDefs: Array<[string, number]> = [
    ['HP',     monster.stats.maxHp],
    ['DAMAGE', monster.stats.damage],
    ['SPEED',  monster.stats.speed],
    ['ENERGY', monster.stats.maxEnergy],
  ];

  for (const [label, value] of statDefs) {
    const stat = document.createElement('div');
    stat.className = 'fl-stat';

    const sl = document.createElement('div');
    sl.className = 'fl-stat-label';
    sl.textContent = label;

    const sv = document.createElement('div');
    sv.className = 'fl-stat-value';
    sv.textContent = String(value);

    stat.appendChild(sl);
    stat.appendChild(sv);
    statsGrid.appendChild(stat);
  }

  statsSection.appendChild(statsTitle);
  statsSection.appendChild(statsGrid);
  panel.appendChild(statsSection);

  // ── To-the-coil button ────────────────────────────────────────────────
  const btnWrap = document.createElement('div');
  btnWrap.className = 'fl-coil-btn-wrap';

  const coilBtn = document.createElement('button');
  coilBtn.className = 'fl-coil-btn';
  coilBtn.textContent = 'TO THE COIL →';
  coilBtn.addEventListener('click', () => {
    _lastPhase    = '';
    _lastBuildKey = '';
    if (state.phase.name === 'STITCH') {
      transitionTo(state, {
        name:    'ZAP',
        build:   state.phase.build,
        monster: state.phase.monster,
        charge:  0,
      });
    }
  });

  btnWrap.appendChild(coilBtn);
  panel.appendChild(btnWrap);

  domRoot.appendChild(panel);
}

// ── Clear overlay ─────────────────────────────────────────────────────────

export function clearDomScreen(domRoot: HTMLElement): void {
  if (_lastPhase !== 'CLEAR') {
    _lastPhase    = 'CLEAR';
    _lastBuildKey = '';
    domRoot.innerHTML = '';
  }
}
