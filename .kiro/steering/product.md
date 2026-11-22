# Product Steering — FRANKEN-LAB

## What this is
FRANKEN-LAB is a browser arcade game built for the Kiroween 2026 hackathon,
category **Frankenstein**: stitch together a chimera of technologies into one
app. The game itself is about stitching a monster from incompatible donor
parts; the app itself is stitched from incompatible web technologies.

## The pitch in one line
Stitch a monster from vampire, robot, werewolf and ghost parts, shout it
alive with your real voice, then defend the lab against the villagers —
every sound, voice and animation is generated in the browser, zero assets.

## Core experience (three phases, one sitting, ~3 minutes per run)
1. **STITCH** — pick one part per slot (head, torso, arms, legs) from five
   donors (Vampire, Robot, Werewolf, Ghost, Human). Each part grants a real
   ability, so the combination IS the build.
2. **ZAP** — a timing ritual: charge the lightning coil, then awaken the
   monster by shouting "IT'S ALIVE!" into the microphone (Web Speech API)
   or holding SPACE. Timing quality sets the monster's starting charge.
3. **SURVIVE** — side-view arena. The stitched monster fights waves of
   torch-and-pitchfork villagers. Its attacks come from its parts; the
   player triggers abilities with keys 1–3, clicks, or voice commands
   ("zap!", "roar!", "phase!"). Survive escalating waves, chase the score.

## Design rules (never break these)
- **Zero friction**: playable in under 2 seconds from page load, no login,
  no install, no network calls during play.
- **Voice is an enhancement, never a gate**: every voice action has a
  keyboard/mouse/touch equivalent with identical effect. Judges may test
  without a microphone.
- **Zero external assets**: all art is drawn in code (Canvas 2D), all audio
  is synthesized (Web Audio API), the monster's voice is SpeechSynthesis.
  No image files, no audio files, no webfonts.
- **60 FPS** on a mid-range laptop; degrade particle counts before ever
  dropping frames.
- **Deterministic core**: same seed + same inputs = same run, so the game
  is testable headlessly.
- Family-safe Halloween: spooky and funny, never gore.

## Audience
Hackathon judges first (they must "get it" in 10 seconds), casual browser
gamers second. The Frankenstein metaphor must be visible in the first
screen: a monster visibly stitched from mismatched parts.
