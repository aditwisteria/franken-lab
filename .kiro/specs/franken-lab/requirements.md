# Requirements — FRANKEN-LAB (Frankenstein category)

## R1. Stitching (core identity)
- R1.1 The player SHALL pick exactly one part for each of 4 slots
  (head, torso, arms, legs) from 5 donors: Vampire, Robot, Werewolf,
  Ghost, Human.
- R1.2 Each donor part SHALL grant one named ability and a stat modifier;
  the monster's ability set is exactly the union of its parts' abilities.
- R1.3 The monster SHALL be rendered visibly stitched: each body region
  drawn in its donor's visual language, with seam/stitch marks between
  regions.
- R1.4 All 625 combinations SHALL be valid (property-based test).

## R2. Awakening ritual
- R2.1 A charge phase SHALL let the player build lightning charge with a
  timing bar; release quality (Perfect/Good/Weak) sets starting energy.
- R2.2 The player SHALL be able to awaken the monster by saying
  "it's alive" via SpeechRecognition when available.
- R2.3 A hold-SPACE / hold-button path SHALL produce the identical result
  when speech is unavailable or declined.
- R2.4 On awakening, thunder (synthesized), screen flash, and the
  monster's first spoken line (SpeechSynthesis, voice derived from the
  head donor) SHALL fire.

## R3. Arena survival
- R3.1 Waves of villagers SHALL spawn with escalating count/speed;
  wave number, monster HP, score, and energy are always visible (HUD).
- R3.2 The monster SHALL auto-attack the nearest villager with its arms
  ability; the player SHALL trigger the head, torso and legs abilities
  manually (keys 1–3 / on-screen buttons / voice: "zap", "roar", "phase").
- R3.3 Each ability SHALL behave according to its donor (e.g. Robot arms =
  ranged zap; Ghost legs = phase dash that avoids damage; Vampire head =
  lifesteal bite; Werewolf torso = roar knockback).
- R3.4 The run SHALL end on HP 0 ("THE LAB HAS FALLEN") or continue
  endlessly with score; restart SHALL be one key (R) or one tap.

## R4. Audio (100% procedural)
- R4.1 No audio files. Thunder, coil hum, heartbeat (rate follows HP),
  roar, zap, UI, and a minor-key adaptive music loop SHALL be synthesized
  with Web Audio oscillators/noise/ envelopes.
- R4.2 Mute toggle (M) SHALL exist and persist.

## R5. Persistence
- R5.1 Best score, total runs, and monsters-stitched count SHALL persist
  in localStorage as the "Lab Journal" and show on the title screen.

## R6. Platform & performance
- R6.1 Playable from page load in <2s, no network during play.
- R6.2 Keyboard + mouse + touch controls; layout works at 375×812.
- R6.3 60 FPS target on mid-range hardware; particle budget degrades
  before frame rate does.
- R6.4 Feature-detect SpeechRecognition/SpeechSynthesis; absence never
  blocks any phase.
