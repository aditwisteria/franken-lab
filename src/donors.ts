/**
 * donors.ts — Single source of truth for all donor, part, and ability data.
 *
 * Five donors × four slots = 20 parts.
 * Each part has exactly one Ability and one set of StatMods.
 * Nothing here references the DOM, canvas, or game state.
 */

// ── Core type definitions ─────────────────────────────────────────────────

export type DonorId = 'vampire' | 'robot' | 'werewolf' | 'ghost' | 'human';
export type Slot    = 'head' | 'torso' | 'arms' | 'legs';

export interface Ability {
  /** Unique identifier, e.g. "vampire_head_lifesteal". */
  id: string;
  /** Display name shown in the HUD, e.g. "Lifesteal Bite". */
  name: string;
  /** Which slot this ability comes from. */
  slot: Slot;
  /** Which donor granted it. */
  donor: DonorId;
  /** One-line flavour description shown in the STITCH screen. */
  description: string;
  /** Seconds between uses. */
  cooldownSec: number;
  /**
   * Short camelCase key consumed by arena.ts to dispatch the right effect.
   * Must be distinct across all 20 parts.
   */
  effectKey: string;
}

export interface StatMods {
  /** Added to BASE_STATS.maxHp.    Range contribution. */
  hp:     number;
  /** Added to BASE_STATS.damage.   Can be negative. */
  damage: number;
  /** Added to BASE_STATS.speed.    Can be negative. */
  speed:  number;
  /** Added to BASE_STATS.maxEnergy. Can be negative. */
  energy: number;
}

// ── Donor display data ────────────────────────────────────────────────────

export interface DonorPalette {
  primary:   string;  // main fill colour
  secondary: string;  // accent fill / outline colour
  accent:    string;  // highlight / effect colour
}

export interface DonorData {
  id:      DonorId;
  name:    string;
  /** Short descriptor for the STITCH card subtitle. */
  motif:   string;
  palette: DonorPalette;
}

export const DONORS: Record<DonorId, DonorData> = {
  vampire: {
    id:     'vampire',
    name:   'Vampire',
    motif:  'Pale skin, crimson cape collar, sharp fangs',
    palette: {
      primary:   '#d4c8e0',  // pale lavender-white flesh
      secondary: '#8b0000',  // deep crimson cape/collar
      accent:    '#ff2244',  // blood-red highlight
    },
  },
  robot: {
    id:     'robot',
    name:   'Robot',
    motif:  'Grey plating, cyan panel lines, retractable antenna',
    palette: {
      primary:   '#7a8490',  // metal grey
      secondary: '#00e5ff',  // cyan panel glow
      accent:    '#ffffff',  // bright white highlight
    },
  },
  werewolf: {
    id:     'werewolf',
    name:   'Werewolf',
    motif:  'Brown matted fur, rough bristle texture, amber eyes',
    palette: {
      primary:   '#6b4423',  // dark brown fur
      secondary: '#a0622a',  // lighter brown fur highlight
      accent:    '#ffb300',  // amber eye glow
    },
  },
  ghost: {
    id:     'ghost',
    name:   'Ghost',
    motif:  'Translucent teal, no hard outline, drifting float',
    palette: {
      primary:   '#80ffe8',  // translucent teal
      secondary: '#004d40',  // deep teal shadow
      accent:    '#e0fff8',  // near-white wisp
    },
  },
  human: {
    id:     'human',
    name:   'Human',
    motif:  'Plain fleshy tones, unmodified anatomy',
    palette: {
      primary:   '#f0c08a',  // warm peach flesh
      secondary: '#c68642',  // tan/shadow
      accent:    '#ffe4c4',  // bisque highlight
    },
  },
};

// ── Part data ─────────────────────────────────────────────────────────────

export interface Part {
  donor:   DonorId;
  slot:    Slot;
  ability: Ability;
  mods:    StatMods;
}

/**
 * All 20 parts indexed as `${donor}_${slot}`.
 * Abilities are listed slot-first (head, torso, arms, legs) within each donor
 * to make balance tuning easy.
 */
export const PARTS: Record<string, Part> = {

  // ── VAMPIRE ──────────────────────────────────────────────────────────────

  vampire_head: {
    donor: 'vampire', slot: 'head',
    ability: {
      id: 'vampire_head_lifesteal', name: 'Lifesteal Bite',
      slot: 'head', donor: 'vampire',
      description: 'Lunge and drain HP from the nearest villager, healing yourself.',
      cooldownSec: 6,
      effectKey: 'lifeStealBite',
    },
    mods: { hp: +20, damage: +5, speed: +10, energy: -10 },
  },

  vampire_torso: {
    donor: 'vampire', slot: 'torso',
    ability: {
      id: 'vampire_torso_batform', name: 'Bat Swarm Burst',
      slot: 'torso', donor: 'vampire',
      description: 'Release a swarm of bats that scatter, pushing back all villagers.',
      cooldownSec: 10,
      effectKey: 'batSwarmBurst',
    },
    mods: { hp: +10, damage: +10, speed: +5, energy: +5 },
  },

  vampire_arms: {
    donor: 'vampire', slot: 'arms',
    ability: {
      id: 'vampire_arms_clawstrike', name: 'Claw Strike',
      slot: 'arms', donor: 'vampire',
      description: 'Slash both claws in a wide arc, hitting villagers in melee range.',
      cooldownSec: 2,
      effectKey: 'clawStrike',
    },
    mods: { hp: 0, damage: +15, speed: 0, energy: -5 },
  },

  vampire_legs: {
    donor: 'vampire', slot: 'legs',
    ability: {
      id: 'vampire_legs_mistdash', name: 'Mist Dash',
      slot: 'legs', donor: 'vampire',
      description: 'Dissolve into mist and surge forward, passing through villagers.',
      cooldownSec: 5,
      effectKey: 'mistDash',
    },
    mods: { hp: -10, damage: 0, speed: +30, energy: +10 },
  },

  // ── ROBOT ─────────────────────────────────────────────────────────────────

  robot_head: {
    donor: 'robot', slot: 'head',
    ability: {
      id: 'robot_head_targetlock', name: 'Target Lock',
      slot: 'head', donor: 'robot',
      description: 'Scan the arena and mark three villagers; they take double damage until cleared.',
      cooldownSec: 8,
      effectKey: 'targetLock',
    },
    mods: { hp: 0, damage: +5, speed: -5, energy: +20 },
  },

  robot_torso: {
    donor: 'robot', slot: 'torso',
    ability: {
      id: 'robot_torso_shieldburst', name: 'Chassis Shield Burst',
      slot: 'torso', donor: 'robot',
      description: 'Deploy an energy barrier that absorbs the next two hits.',
      cooldownSec: 12,
      effectKey: 'chassisShieldBurst',
    },
    mods: { hp: +30, damage: 0, speed: -10, energy: +10 },
  },

  robot_arms: {
    donor: 'robot', slot: 'arms',
    ability: {
      id: 'robot_arms_rangedzap', name: 'Ranged Zap',
      slot: 'arms', donor: 'robot',
      description: 'Fire a crackling bolt of electricity at the nearest villager.',
      cooldownSec: 1.5,
      effectKey: 'rangedZap',
    },
    mods: { hp: 0, damage: +10, speed: -5, energy: +15 },
  },

  robot_legs: {
    donor: 'robot', slot: 'legs',
    ability: {
      id: 'robot_legs_overdrive', name: 'Overdrive Stomp',
      slot: 'legs', donor: 'robot',
      description: 'Turbine legs propel a ground-shaking stomp, stunning nearby villagers.',
      cooldownSec: 7,
      effectKey: 'overdriveStomp',
    },
    mods: { hp: +10, damage: +5, speed: +15, energy: 0 },
  },

  // ── WEREWOLF ──────────────────────────────────────────────────────────────

  werewolf_head: {
    donor: 'werewolf', slot: 'head',
    ability: {
      id: 'werewolf_head_howl', name: 'Terrifying Howl',
      slot: 'head', donor: 'werewolf',
      description: 'Let loose a horrifying howl that freezes every villager in fear.',
      cooldownSec: 9,
      effectKey: 'terrifyingHowl',
    },
    mods: { hp: +10, damage: +10, speed: +5, energy: -5 },
  },

  werewolf_torso: {
    donor: 'werewolf', slot: 'torso',
    ability: {
      id: 'werewolf_torso_roarknockback', name: 'Roar Knockback',
      slot: 'torso', donor: 'werewolf',
      description: 'Slam your chest and bellow, blasting all villagers backward.',
      cooldownSec: 8,
      effectKey: 'roarKnockback',
    },
    mods: { hp: +20, damage: +5, speed: 0, energy: +5 },
  },

  werewolf_arms: {
    donor: 'werewolf', slot: 'arms',
    ability: {
      id: 'werewolf_arms_frenzyswipe', name: 'Frenzy Swipe',
      slot: 'arms', donor: 'werewolf',
      description: 'Unleash a flurry of rapid claw swipes, hitting up to three villagers.',
      cooldownSec: 3,
      effectKey: 'frenzySwipe',
    },
    mods: { hp: 0, damage: +20, speed: +5, energy: -10 },
  },

  werewolf_legs: {
    donor: 'werewolf', slot: 'legs',
    ability: {
      id: 'werewolf_legs_packleap', name: 'Pack Leap',
      slot: 'legs', donor: 'werewolf',
      description: 'Spring into the thickest group of villagers, landing for area damage.',
      cooldownSec: 6,
      effectKey: 'packLeap',
    },
    mods: { hp: +5, damage: +10, speed: +20, energy: -5 },
  },

  // ── GHOST ─────────────────────────────────────────────────────────────────

  ghost_head: {
    donor: 'ghost', slot: 'head',
    ability: {
      id: 'ghost_head_wail', name: 'Spectral Wail',
      slot: 'head', donor: 'ghost',
      description: 'Emit a piercing spectral wail that drains energy from every villager on screen.',
      cooldownSec: 10,
      effectKey: 'spectralWail',
    },
    mods: { hp: -10, damage: +5, speed: +10, energy: +20 },
  },

  ghost_torso: {
    donor: 'ghost', slot: 'torso',
    ability: {
      id: 'ghost_torso_incorporeal', name: 'Incorporeal Shroud',
      slot: 'torso', donor: 'ghost',
      description: 'Briefly turn fully intangible; incoming attacks pass through you.',
      cooldownSec: 11,
      effectKey: 'incorporealShroud',
    },
    mods: { hp: -20, damage: 0, speed: +15, energy: +20 },
  },

  ghost_arms: {
    donor: 'ghost', slot: 'arms',
    ability: {
      id: 'ghost_arms_hauntstrike', name: 'Haunt Strike',
      slot: 'arms', donor: 'ghost',
      description: 'Extend ghostly tendrils that phase through armour and deal direct damage.',
      cooldownSec: 2.5,
      effectKey: 'hauntStrike',
    },
    mods: { hp: -10, damage: +5, speed: +5, energy: +10 },
  },

  ghost_legs: {
    donor: 'ghost', slot: 'legs',
    ability: {
      id: 'ghost_legs_phasedash', name: 'Phase Dash',
      slot: 'legs', donor: 'ghost',
      description: 'Phase out of reality and reappear behind the nearest villager, avoiding all damage.',
      cooldownSec: 4,
      effectKey: 'phaseDash',
    },
    mods: { hp: -15, damage: 0, speed: +40, energy: +15 },
  },

  // ── HUMAN ─────────────────────────────────────────────────────────────────

  human_head: {
    donor: 'human', slot: 'head',
    ability: {
      id: 'human_head_rally', name: 'Rally Cry',
      slot: 'head', donor: 'human',
      description: 'A determined battle cry that boosts all stats momentarily.',
      cooldownSec: 15,
      effectKey: 'rallyCry',
    },
    mods: { hp: +10, damage: 0, speed: +5, energy: +5 },
  },

  human_torso: {
    donor: 'human', slot: 'torso',
    ability: {
      id: 'human_torso_secondwind', name: 'Second Wind',
      slot: 'torso', donor: 'human',
      description: 'Draw on pure willpower to restore a chunk of HP.',
      cooldownSec: 20,
      effectKey: 'secondWind',
    },
    mods: { hp: +40, damage: -5, speed: 0, energy: 0 },
  },

  human_arms: {
    donor: 'human', slot: 'arms',
    ability: {
      id: 'human_arms_brawl', name: 'Brawler Punch',
      slot: 'arms', donor: 'human',
      description: 'A reliable, unadorned punch — no frills, solid knockback.',
      cooldownSec: 1,
      effectKey: 'brawlerPunch',
    },
    mods: { hp: 0, damage: +5, speed: 0, energy: 0 },
  },

  human_legs: {
    donor: 'human', slot: 'legs',
    ability: {
      id: 'human_legs_sprint', name: 'Adrenaline Sprint',
      slot: 'legs', donor: 'human',
      description: 'Pump your legs and sprint clear of a mob, buying precious distance.',
      cooldownSec: 8,
      effectKey: 'adrenalineSprint',
    },
    mods: { hp: 0, damage: 0, speed: +20, energy: 0 },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

/** Look up a part by donor and slot. Always defined for valid inputs. */
export function getPart(donor: DonorId, slot: Slot): Part {
  const key = `${donor}_${slot}`;
  const part = PARTS[key];
  if (!part) throw new RangeError(`getPart: no part for donor="${donor}" slot="${slot}"`);
  return part;
}

/** Flat list of all 20 abilities, in donor-then-slot order. */
export const ABILITIES: Ability[] = (
  ['vampire', 'robot', 'werewolf', 'ghost', 'human'] as DonorId[]
).flatMap(donor =>
  (['head', 'torso', 'arms', 'legs'] as Slot[]).map(slot => getPart(donor, slot).ability)
);
