# Tech Steering — FRANKEN-LAB

## The chimera (this is the Frankenstein thesis — protect it)
The app deliberately stitches technologies that do not normally ship in
one game. Each must be load-bearing, not decorative:

1. **Canvas 2D** — the entire game world, hand-rolled engine (game loop,
   entities, particles). No game framework.
2. **Web Audio API** — 100% procedural audio: thunder, coil charge hum,
   heartbeat, monster roar, UI clicks, adaptive music. No audio files.
3. **Web Speech API — SpeechRecognition** — voice casting: "IT'S ALIVE!"
   to awaken; "zap / roar / phase" ability commands in the arena.
4. **Web Speech API — SpeechSynthesis** — the monster speaks: its voice
   (pitch/rate) is derived from its stitched head donor.
5. **localStorage** — the Lab Journal: best score, runs, monsters stitched.
6. **Vanilla DOM/CSS** — lab-console UI shell around the canvas (menus,
   part picker, HUD frame), deliberately a different rendering tech than
   the canvas world it frames.

## Stack constraints
- Vanilla TypeScript compiled with Vite, or plain ES modules if Vite adds
  friction. No runtime dependencies. No backend.
- Single deployable static site (GitHub Pages compatible).
- SpeechRecognition is Chromium-only: feature-detect and degrade to the
  button/keyboard path everywhere else. Never let its absence break a run.
- All state lives in one explicit game-state object; rendering reads it,
  never mutates it.

## Quality gates (from the team's MBO Track E standard)
- Headless playtest before any "done" claim: 0 console/page errors,
  canvas pixel-check (non-blank, changes between frames), simulated keys
  move the game state, screenshots at 1280×720 and 375×812 inspected.
- Property-based tests for the stitching rules: every donor combination
  (5^4 = 625) must produce a valid monster with 4 abilities and legal stats.
- Performance: frame time sampled in playtest; report the number, don't
  assert it.
