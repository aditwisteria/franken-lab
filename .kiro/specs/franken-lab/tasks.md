# Tasks — FRANKEN-LAB

## Phase 0 — Scaffolding
- [x] Vite + TypeScript project, static build, GitHub Pages-ready
- [x] index.html lab-console shell + canvas mount
- [x] Seeded RNG + GameState skeleton + phase state machine

## Phase 1 — The stitching (R1)
- [x] donors.ts data table: 5 donors × 4 slots, abilities + stat mods
- [x] monster.ts build resolution + stitched canvas renderer with seams
- [x] STITCH screen: donor cards, live preview, ability list
- [x] Property-based test: all 625 combos valid

## Phase 2 — The organs of sound and voice (R2, R4)
- [x] audio.ts synth kit: thunder, coil hum, heartbeat, roar, zap, UI
- [x] Adaptive minor-key music scheduler
- [x] voice.ts: SpeechRecognition commands ("it's alive", "zap", "roar",
      "phase") behind feature detection
- [x] SpeechSynthesis monster voice derived from head donor
- [x] ZAP screen: charge bar, hold-SPACE path identical to voice path

## Phase 3 — The arena (R3)
- [x] Villager waves, escalating spawns (seeded)
- [x] Auto-attack from arms ability; manual head/torso/legs abilities
- [x] All 5-donor ability behaviours per slot
- [x] HUD (DOM): wave, HP, energy, score, cooldown buttons; touch support
- [x] END screen + R restart

## Phase 4 — Journal & polish (R5, R6)
- [x] Lab Journal in localStorage (best score, runs, stitched count)
- [x] Mute (M) persisted; pause (P)
- [x] 375×812 layout pass; particle budget auto-degrade

## Phase 5 — Verification (quality gates)
- [ ] Headless playtest: 0 console errors, canvas pixel-change check,
      simulated keys reach SURVIVE, screenshots 1280×720 + 375×812
- [ ] FPS sample reported from playtest
- [ ] Mic-less full run verified (voice fallback path end-to-end)

## Phase 6 — Submission
- [ ] Public GitHub repo, MIT license, /.kiro committed (never gitignored)
- [ ] Working app URL live (GitHub Pages)
- [ ] Demo video < 3 min, public on YouTube
- [ ] Devpost text: description + "How we used Kiro" write-up
- [ ] Bonus: Social Blitz post starting with #KiroweenHackathon26;
      bonus blog post about the build
