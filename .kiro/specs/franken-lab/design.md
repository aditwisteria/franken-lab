# Design — FRANKEN-LAB

## Architecture (one page, five stitched organs)

```
index.html          Lab-console shell (DOM/CSS): title, part picker, HUD frame
src/
  main.ts           Boot, phase state machine (TITLE → STITCH → ZAP → SURVIVE → END)
  engine.ts         Canvas loop, entity store, particles, camera shake, hit-stop
  donors.ts         Donor/part/ability data table (the single source of truth)
  monster.ts        Monster build from parts, stat resolution, stitched renderer
  audio.ts          Web Audio synth: thunder, coil, heartbeat, roar, zap, music
  voice.ts          SpeechRecognition commands + SpeechSynthesis monster voice
  arena.ts          Villager waves, combat, ability triggers
  journal.ts        localStorage Lab Journal
```

## Key design decisions
- **Data-driven stitching**: donors.ts declares every part's ability as
  data (id, name, stat mods, cooldown, effect key). monster.ts resolves a
  build purely from that table — this is what makes the 625-combination
  property test possible and keeps balance tuning in one file.
- **One state object**: `GameState` is the only mutable store. Phases are
  a discriminated union; renderers are pure functions of state.
- **Voice as an input device, not a mode**: voice.ts emits the same
  command events as keyboard/touch (`{type:'ability', slot:'head'}`), so
  gameplay code cannot tell which organ produced the input. This is the
  chimera seam, and it is deliberate.
- **Audio graph**: one master GainNode → compressor. Each sound is a
  small function scheduling oscillators/noise buffers. Heartbeat is a
  looping scheduler whose interval is read from monster HP each beat.
  Music: a bass pulse + minor arpeggio scheduler that intensifies with
  wave number.
- **Stitched rendering**: monster drawn region-by-region; each donor has a
  palette + motif (Vampire: pale/red, cape collar; Robot: grey/cyan,
  panel lines, antenna; Werewolf: brown fur strokes; Ghost: translucent
  teal, no outline, float offset; Human: plain). Seams drawn as dashed
  stitch lines between regions.
- **Determinism**: a seeded RNG (mulberry32) drives spawns and particles;
  seed shown on the end screen; `?seed=` supported for testing.

## Screens
1. TITLE — lab door, journal stats, "ENTER THE LAB".
2. STITCH — operating table; 4 slots × 5 donor cards; live monster preview
   re-renders per pick; ability list updates; "TO THE COIL →".
3. ZAP — coil charge bar sweeping; shout "IT'S ALIVE!" or hold SPACE;
   quality verdict; thunder + flash; monster speaks.
4. SURVIVE — arena (lab interior spilling into a graveyard), HUD frame in
   DOM, ability buttons with cooldown sweeps.
5. END — "THE LAB HAS FALLEN" / score, journal updated, R to retry.
