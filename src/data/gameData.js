// ─── XP Scoring ───────────────────────────────────────────────────────────────

const HIGH_XP_WORDS = [
  'build','create','design','write','develop','implement','launch','deploy',
  'research','analyze','present','interview','review','refactor','complete',
  'finish','submit','publish','configure','setup','migrate','fix','debug',
  'test','document','plan','architect','integrate',
];
const LOW_XP_WORDS = [
  'check','look','read','browse','ask','reply','respond','update','remind',
  'note','add','edit','change','quick','small','minor',
];

export function scoreTask(text) {
  const lower = text.toLowerCase();
  const len   = lower.split(/\s+/).length;
  let score   = 0;
  if (len >= 8) score += 2; else if (len >= 5) score += 1;
  if (HIGH_XP_WORDS.some(w => lower.includes(w))) score += 2;
  if (LOW_XP_WORDS.some(w => lower.includes(w)))  score -= 1;
  if (lower.includes(' and ') || lower.includes(' then ') || lower.includes(' & ')) score += 1;
  if (score >= 4) return { xp: 50, tier: 'high'   };
  if (score >= 2) return { xp: 30, tier: 'medium'  };
  return            { xp: 15, tier: 'low'    };
}

// ─── Skill Slots by Level ─────────────────────────────────────────────────────

export function getSkillSlots(level) {
  if (level >= 10) return 4;
  if (level >= 8)  return 3;
  if (level >= 5)  return 2;
  return 1;
}

// ─── 20 Skills ────────────────────────────────────────────────────────────────
// cost: null = auto-unlocked on level up | number = purchasable in shop

export const SKILL_DEFS = {

  // ── Tier 1 — Starting (one per class, level 1) ────────────────────────────
  strike: {
    id: 'strike', name: 'Strike', icon: '⚔️', type: 'attack',
    desc: 'Reliable attack. Scales with ATK.',
    getDamage: (s) => 6 + s.attack * 2,
    cooldown: 0, effect: null, cost: null, unlockLevel: 1,
  },
  arcaneBolt: {
    id: 'arcaneBolt', name: 'Arcane Bolt', icon: '🔵', type: 'attack',
    desc: 'Magic strike. Scales with SPL.',
    getDamage: (s) => 4 + s.special * 2,
    cooldown: 0, effect: null, cost: null, unlockLevel: 1,
  },
  quickSlash: {
    id: 'quickSlash', name: 'Quick Slash', icon: '💨', type: 'attack',
    desc: 'Fast hit. Never on cooldown.',
    getDamage: (s) => 5 + s.attack * 2,
    cooldown: 0, effect: null, cost: null, unlockLevel: 1,
  },

  // ── Tier 2 — Level 2 auto-unlocks ────────────────────────────────────────
  guard: {
    id: 'guard', name: 'Guard', icon: '🛡️', type: 'defense',
    desc: 'Next hit deals 50% less damage.',
    getDamage: () => 0,
    cooldown: 3, effect: 'guard', cost: null, unlockLevel: 2,
  },
  minorHeal: {
    id: 'minorHeal', name: 'Minor Heal', icon: '✚', type: 'heal',
    desc: 'Restore 20 + DEF×2 HP.',
    getDamage: () => 0,
    healAmt: (s) => 20 + s.defense * 2,
    cooldown: 4, effect: 'heal', cost: null, unlockLevel: 2,
  },

  // ── Tier 2 — Level 3 auto-unlocks ────────────────────────────────────────
  powerStrike: {
    id: 'powerStrike', name: 'Power Strike', icon: '💥', type: 'attack',
    desc: '2× damage. Short cooldown.',
    getDamage: (s) => (14 + s.attack * 3) * 2,
    cooldown: 2, effect: null, cost: null, unlockLevel: 3,
  },
  weaken: {
    id: 'weaken', name: 'Weaken', icon: '🌀', type: 'utility',
    desc: "Reduce boss ATK 35% for 2 turns.",
    getDamage: () => 0,
    cooldown: 4, effect: 'weaken', cost: null, unlockLevel: 3,
  },

  // ── Tier 2 — Level 4 auto-unlocks ────────────────────────────────────────
  mend: {
    id: 'mend', name: 'Mend', icon: '💚', type: 'heal',
    desc: 'Restore 35 + DEF×4 HP.',
    getDamage: () => 0,
    healAmt: (s) => 35 + s.defense * 4,
    cooldown: 3, effect: 'heal', cost: null, unlockLevel: 4,
  },
  counter: {
    id: 'counter', name: 'Counter', icon: '↩️', type: 'defense',
    desc: 'Reflect the next boss hit back.',
    getDamage: () => 0,
    cooldown: 4, effect: 'counter', cost: null, unlockLevel: 4,
  },

  // ── Tier 3 — Level 5 shop ────────────────────────────────────────────────
  warcry: {
    id: 'warcry', name: 'War Cry', icon: '📢', type: 'utility',
    desc: '+50% damage for 3 turns.',
    getDamage: () => 0,
    cooldown: 5, effect: 'warcry', cost: 60, unlockLevel: 5,
  },
  regen: {
    id: 'regen', name: 'Regenerate', icon: '🌿', type: 'heal',
    desc: 'Heal 15 HP per turn for 3 turns.',
    getDamage: () => 0,
    cooldown: 4, effect: 'regen', cost: 80, unlockLevel: 5,
  },
  venomStrike: {
    id: 'venomStrike', name: 'Venom Strike', icon: '🗡️', type: 'attack',
    desc: 'Hit + poison boss (12 dmg × 3 turns).',
    getDamage: (s) => 10 + s.attack * 2,
    cooldown: 3, effect: 'poison', cost: 110, unlockLevel: 5,
  },

  // ── Tier 3 — Level 6 shop ────────────────────────────────────────────────
  stun: {
    id: 'stun', name: 'Stun', icon: '⚡', type: 'utility',
    desc: 'Stun boss 1 turn + light damage.',
    getDamage: (s) => 8 + s.attack * 2,
    cooldown: 4, effect: 'stun', cost: 140, unlockLevel: 6,
  },
  aegis: {
    id: 'aegis', name: 'Aegis', icon: '🔮', type: 'defense',
    desc: 'Block the next attack entirely.',
    getDamage: () => 0,
    cooldown: 5, effect: 'shield', cost: 175, unlockLevel: 6,
  },

  // ── Tier 4 — Level 7 shop ────────────────────────────────────────────────
  berserk: {
    id: 'berserk', name: 'Berserk', icon: '🔥', type: 'special',
    desc: '+60% damage for 3 turns. Lose 15 HP.',
    getDamage: (s) => 6 + s.attack * 2,
    cooldown: 5, effect: 'berserk', cost: 200, unlockLevel: 7,
  },
  lifeDrain: {
    id: 'lifeDrain', name: 'Life Drain', icon: '🩸', type: 'special',
    desc: 'Deal damage. Heal 60% of it.',
    getDamage: (s) => 20 + s.attack * 3 + s.special * 2,
    cooldown: 4, effect: 'lifeDrain', cost: 250, unlockLevel: 7,
  },
  shatter: {
    id: 'shatter', name: 'Shatter', icon: '💢', type: 'utility',
    desc: 'Boss DEF −40% for 3 turns.',
    getDamage: () => 0,
    cooldown: 5, effect: 'shatter', cost: 275, unlockLevel: 7,
  },

  // ── Tier 5 — Level 8 shop ────────────────────────────────────────────────
  phantomStrike: {
    id: 'phantomStrike', name: 'Phantom Strike', icon: '👻', type: 'attack',
    desc: '3 rapid hits at 40% each.',
    getDamage: (s) => Math.round((14 + s.attack * 3) * 0.4),
    cooldown: 3, effect: 'triple', cost: 300, unlockLevel: 8,
  },
  thunder: {
    id: 'thunder', name: 'Thunder', icon: '🌩️', type: 'special',
    desc: 'Massive hit. Ignores all defense.',
    getDamage: (s) => 30 + s.special * 6,
    cooldown: 5, effect: 'piercing', cost: 325, unlockLevel: 8,
  },

  // ── Tier 5 — Level 9 shop ────────────────────────────────────────────────
  unleash: {
    id: 'unleash', name: 'Unleash', icon: '✨', type: 'special',
    desc: 'Ultimate attack. Pure destruction.',
    getDamage: (s) => 45 + s.special * 8 + s.attack * 3,
    cooldown: 5, effect: null, cost: 425, unlockLevel: 9,
  },
};

export const SHOP_SKILLS = [
  'warcry','regen','venomStrike',
  'stun','aegis',
  'berserk','lifeDrain','shatter',
  'phantomStrike','thunder',
  'unleash',
];

export const LEVEL_UNLOCK_SKILLS = {
  2: ['guard', 'minorHeal'],
  3: ['powerStrike', 'weaken'],
  4: ['mend', 'counter'],
};

// ─── Classes ──────────────────────────────────────────────────────────────────

export const CLASSES = {
  warrior: {
    name: 'Warrior', icon: '⚔️',
    desc: 'Tough and reliable. Strong defense, steady damage.',
    baseStats: { attack: 2, defense: 3, special: 0, hp: 0 },
    baseHp: 40,
    startingSkill: 'strike',
  },
  mage: {
    name: 'Mage', icon: '🔮',
    desc: 'Fragile but devastating. Specials hit like a truck.',
    baseStats: { attack: 0, defense: 0, special: 5, hp: 0 },
    baseHp: 40,
    startingSkill: 'arcaneBolt',
  },
  rogue: {
    name: 'Rogue', icon: '🗡️',
    desc: 'Fast and aggressive. Highest raw attack output.',
    baseStats: { attack: 4, defense: 1, special: 0, hp: 0 },
    baseHp: 40,
    startingSkill: 'quickSlash',
  },
};

// ─── Levels ───────────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1,  title: 'Initiate',    xp: 0    },
  { level: 2,  title: 'Apprentice',  xp: 60   },
  { level: 3,  title: 'Journeyman',  xp: 150  },
  { level: 4,  title: 'Adept',       xp: 300  },
  { level: 5,  title: 'Expert',      xp: 500  },
  { level: 6,  title: 'Master',      xp: 750  },
  { level: 7,  title: 'Grandmaster', xp: 1100 },
  { level: 8,  title: 'Legend',      xp: 1550 },
  { level: 9,  title: 'Mythic',      xp: 2100 },
  { level: 10, title: 'Immortal',    xp: 2800 },
];

export function getLevelInfo(xp) {
  let current = LEVELS[0], next = LEVELS[1];
  for (const lvl of LEVELS) { if (xp >= lvl.xp) { current = lvl; next = LEVELS[LEVELS.indexOf(lvl) + 1] || null; } }
  const into   = next ? xp - current.xp : 0;
  const needed = next ? next.xp - current.xp : 1;
  return { current, next, progress: next ? (into / needed) * 100 : 100, into, needed };
}

// ─── Dungeons ─────────────────────────────────────────────────────────────────

export const DUNGEONS = [
  {
    id: 'goblin_warren', name: 'Goblin Warren', sub: 'The Shallow Dark',
    desc: 'Vermin lurk in narrow tunnels. A fitting first trial.',
    difficulty: 1, rec: 1,
    boss: { name: 'Grak the Vile', type: 'goblin', maxHp: 80, attack: 8, xpReward: 75, attacks: ['Slash','Cackle','Bite'] },
  },
  {
    id: 'haunted_crypt', name: 'Haunted Crypt', sub: 'Where the Dead Walk',
    desc: 'Ancient bones walk again. Silence the restless dead.',
    difficulty: 2, rec: 2,
    boss: { name: 'Lord Bonechill', type: 'skeleton', maxHp: 120, attack: 13, xpReward: 130, attacks: ['Bone Crush','Death Rattle','Chill Touch'] },
  },
  {
    id: 'dragons_lair', name: "Dragon's Lair", sub: 'Fire and Fury',
    desc: 'A young drake guards stolen gold. Mind the flames.',
    difficulty: 3, rec: 3,
    boss: { name: 'Pyrax the Scorcher', type: 'dragon', maxHp: 160, attack: 19, xpReward: 200, attacks: ['Fire Breath','Claw Swipe','Tail Lash'] },
  },
  {
    id: 'shadow_temple', name: 'Shadow Temple', sub: 'Darkness Incarnate',
    desc: 'A demon born of shadow feeds on fear itself.',
    difficulty: 4, rec: 4,
    boss: { name: 'Umbrakon', type: 'demon', maxHp: 200, attack: 24, xpReward: 280, attacks: ['Shadow Bolt','Darkness Wave','Soul Drain'] },
  },
  {
    id: 'frost_cavern', name: 'Frost Cavern', sub: 'The Frozen Deep',
    desc: 'A golem forged from eternal ice blocks the path.',
    difficulty: 5, rec: 5,
    boss: { name: 'Glacior', type: 'golem', maxHp: 240, attack: 22, xpReward: 360, attacks: ['Ice Slam','Frost Breath','Blizzard'] },
  },
  {
    id: 'volcanic_forge', name: 'Volcanic Forge', sub: 'Heart of the Mountain',
    desc: "Born from the earth's core — pure elemental rage.",
    difficulty: 6, rec: 6,
    boss: { name: 'Ignaros', type: 'elemental', maxHp: 280, attack: 30, xpReward: 450, attacks: ['Magma Surge','Eruption','Lava Bind'] },
  },
  {
    id: 'abyssal_deep', name: 'Abyssal Deep', sub: 'Below the Tide',
    desc: 'Something vast stirs in lightless water. Do not look down.',
    difficulty: 7, rec: 7,
    boss: { name: 'Krath the Ancient', type: 'serpent', maxHp: 320, attack: 32, xpReward: 540, attacks: ['Constrict','Tidal Wave','Venomous Fang'] },
  },
  {
    id: 'celestial_tower', name: 'Celestial Tower', sub: 'Above the Clouds',
    desc: 'A fallen guardian of light. Its judgment is merciless.',
    difficulty: 8, rec: 8,
    boss: { name: 'Seraphex', type: 'celestial', maxHp: 360, attack: 36, xpReward: 640, attacks: ['Holy Lance','Judgment','Radiant Burst'] },
  },
  {
    id: 'void_sanctum', name: 'Void Sanctum', sub: 'Between Worlds',
    desc: 'Reality tears here. The Wraith is what remains of a god.',
    difficulty: 9, rec: 9,
    boss: { name: 'Nyxara the Void', type: 'wraith', maxHp: 420, attack: 42, xpReward: 780, attacks: ['Void Rift','Phase Shift','Annihilate'] },
  },
  {
    id: 'the_final_keep', name: 'The Final Keep', sub: 'End of All Things',
    desc: 'The Dark Lord waits on an obsidian throne. This is what you were made for.',
    difficulty: 10, rec: 10,
    boss: { name: 'Malachar the Undying', type: 'darkLord', maxHp: 520, attack: 50, xpReward: 1000, attacks: ['Dark Surge','Doomsday','Soul Shatter'] },
  },
];

// ─── Items ────────────────────────────────────────────────────────────────────
// rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'ultra_rare'
// type:   'coins' | 'weapon' | 'armor' | 'amulet' | 'potion'

export const RARITY_COLOR = {
  common:     '#c8c8c8',
  uncommon:   '#4ade80',
  rare:       '#60a5fa',
  very_rare:  '#a78bfa',
  ultra_rare: '#fbbf24',
};

export const RARITY_LABEL = {
  common:     'Common',
  uncommon:   'Uncommon',
  rare:       'Rare',
  very_rare:  'Very Rare',
  ultra_rare: 'Ultra Rare',
};

export const ITEMS = {
  // ── Coins ─────────────────────────────────────────────────────────────────
  coins: {
    id: 'coins', name: 'Gold Coins', icon: '🪙', type: 'coins',
    rarity: 'common', desc: 'The lifeblood of adventurers.',
  },

  // ── Weapons ───────────────────────────────────────────────────────────────
  rusty_sword: {
    id: 'rusty_sword', name: 'Rusty Sword', icon: '🗡️', type: 'weapon',
    rarity: 'common', bonus: { attack: 1 }, desc: '+1 Attack',
  },
  bone_staff: {
    id: 'bone_staff', name: 'Bone Staff', icon: '🔱', type: 'weapon',
    rarity: 'uncommon', bonus: { special: 2 }, desc: '+2 Special',
  },
  drake_fang: {
    id: 'drake_fang', name: 'Drake Fang', icon: '🦷', type: 'weapon',
    rarity: 'rare', bonus: { attack: 2, special: 1 }, desc: '+2 Attack, +1 Special',
  },
  shadow_blade: {
    id: 'shadow_blade', name: 'Shadow Blade', icon: '🌑', type: 'weapon',
    rarity: 'rare', bonus: { attack: 3 }, desc: '+3 Attack',
  },
  frost_wand: {
    id: 'frost_wand', name: 'Frost Wand', icon: '❄️', type: 'weapon',
    rarity: 'rare', bonus: { special: 4 }, desc: '+4 Special',
  },
  volcanic_axe: {
    id: 'volcanic_axe', name: 'Volcanic Axe', icon: '🪓', type: 'weapon',
    rarity: 'rare', bonus: { attack: 4 }, desc: '+4 Attack',
  },
  kraken_blade: {
    id: 'kraken_blade', name: "Kraken's Blade", icon: '🐙', type: 'weapon',
    rarity: 'rare', bonus: { attack: 5 }, desc: '+5 Attack',
  },
  holy_sword: {
    id: 'holy_sword', name: 'Holy Sword', icon: '✝️', type: 'weapon',
    rarity: 'rare', bonus: { attack: 3, special: 2 }, desc: '+3 Attack, +2 Special',
  },
  void_blade: {
    id: 'void_blade', name: 'Void Blade', icon: '⚫', type: 'weapon',
    rarity: 'very_rare', bonus: { attack: 6, special: 3 }, desc: '+6 Attack, +3 Special',
  },
  dark_sceptre: {
    id: 'dark_sceptre', name: "Dark Lord's Sceptre", icon: '💀', type: 'weapon',
    rarity: 'ultra_rare', bonus: { attack: 5, special: 5 }, desc: '+5 Attack, +5 Special',
  },

  // ── Armor ─────────────────────────────────────────────────────────────────
  leather_coif: {
    id: 'leather_coif', name: 'Leather Coif', icon: '🪖', type: 'armor',
    rarity: 'common', bonus: { defense: 1 }, desc: '+1 Defense',
  },
  bone_armour: {
    id: 'bone_armour', name: 'Bone Armour', icon: '🦴', type: 'armor',
    rarity: 'uncommon', bonus: { defense: 2 }, desc: '+2 Defense',
  },
  dragonhide: {
    id: 'dragonhide', name: 'Dragonhide Body', icon: '🐉', type: 'armor',
    rarity: 'rare', bonus: { defense: 2, hp: 1 }, desc: '+2 Defense, +1 HP',
  },
  shadow_robes: {
    id: 'shadow_robes', name: 'Shadow Robes', icon: '🌂', type: 'armor',
    rarity: 'rare', bonus: { defense: 2, special: 1 }, desc: '+2 Defense, +1 Special',
  },
  glacier_shield: {
    id: 'glacier_shield', name: 'Glacier Shield', icon: '🧊', type: 'armor',
    rarity: 'rare', bonus: { defense: 3 }, desc: '+3 Defense',
  },
  obsidian_plate: {
    id: 'obsidian_plate', name: 'Obsidian Plate', icon: '⬛', type: 'armor',
    rarity: 'rare', bonus: { defense: 3, hp: 1 }, desc: '+3 Defense, +1 HP',
  },
  abyssal_aegis: {
    id: 'abyssal_aegis', name: 'Abyssal Aegis', icon: '🌊', type: 'armor',
    rarity: 'rare', bonus: { defense: 4 }, desc: '+4 Defense',
  },
  seraph_wings: {
    id: 'seraph_wings', name: 'Seraph Wings', icon: '😇', type: 'armor',
    rarity: 'very_rare', bonus: { defense: 3, hp: 2 }, desc: '+3 Defense, +2 HP',
  },
  void_shroud: {
    id: 'void_shroud', name: 'Void Shroud', icon: '🌫️', type: 'armor',
    rarity: 'very_rare', bonus: { defense: 4, special: 2 }, desc: '+4 Defense, +2 Special',
  },
  dark_armour: {
    id: 'dark_armour', name: "Dark Lord's Armour", icon: '🖤', type: 'armor',
    rarity: 'ultra_rare', bonus: { defense: 4, hp: 3 }, desc: '+4 Defense, +3 HP',
  },

  // ── Amulets ───────────────────────────────────────────────────────────────
  lucky_charm: {
    id: 'lucky_charm', name: 'Lucky Charm', icon: '🍀', type: 'amulet',
    rarity: 'uncommon', bonus: { attack: 1, defense: 1, special: 1 }, desc: '+1 to all stats',
  },
  str_amulet: {
    id: 'str_amulet', name: 'Strength Amulet', icon: '💪', type: 'amulet',
    rarity: 'rare', bonus: { attack: 2 }, desc: '+2 Attack',
  },
  prot_ring: {
    id: 'prot_ring', name: 'Protection Ring', icon: '💍', type: 'amulet',
    rarity: 'rare', bonus: { defense: 2 }, desc: '+2 Defense',
  },
  ancient_talisman: {
    id: 'ancient_talisman', name: 'Ancient Talisman', icon: '🔮', type: 'amulet',
    rarity: 'very_rare', bonus: { special: 3, attack: 1 }, desc: '+3 Special, +1 Attack',
  },
  dark_amulet: {
    id: 'dark_amulet', name: "Dark Lord's Amulet", icon: '⛓️', type: 'amulet',
    rarity: 'ultra_rare', bonus: { attack: 3, defense: 3, special: 3 }, desc: '+3 to all stats',
  },

  // ── Potions ───────────────────────────────────────────────────────────────
  health_potion: {
    id: 'health_potion', name: 'Health Potion', icon: '🧪', type: 'potion',
    rarity: 'common', effect: { heal: 40 }, desc: 'Restore 40 HP in battle',
  },
  super_health: {
    id: 'super_health', name: 'Super Restore', icon: '💊', type: 'potion',
    rarity: 'uncommon', effect: { heal: 80 }, desc: 'Restore 80 HP in battle',
  },
  strength_brew: {
    id: 'strength_brew', name: 'Strength Brew', icon: '⚗️', type: 'potion',
    rarity: 'uncommon', effect: { boost: 'attack', amount: 3, turns: 3 }, desc: '+3 Attack for 3 turns',
  },
  magic_brew: {
    id: 'magic_brew', name: 'Magic Brew', icon: '🫧', type: 'potion',
    rarity: 'uncommon', effect: { boost: 'special', amount: 3, turns: 3 }, desc: '+3 Special for 3 turns',
  },
};

// ─── Loot Tables ──────────────────────────────────────────────────────────────
// always: guaranteed drops every kill
// rolls:  number of random table rolls
// table:  weighted entries — higher weight = more likely; itemId: null = empty roll

export const LOOT_TABLES = {
  goblin_warren: {
    always: [{ itemId: 'coins', qty: [15, 35] }],
    rolls: 2,
    table: [
      { itemId: 'rusty_sword',   weight: 20, qty: [1, 1] },
      { itemId: 'leather_coif',  weight: 20, qty: [1, 1] },
      { itemId: 'health_potion', weight: 30, qty: [1, 2] },
      { itemId: 'lucky_charm',   weight: 5,  qty: [1, 1] },
      { itemId: null,            weight: 25 },
    ],
  },
  haunted_crypt: {
    always: [{ itemId: 'coins', qty: [30, 60] }],
    rolls: 2,
    table: [
      { itemId: 'bone_staff',    weight: 15, qty: [1, 1] },
      { itemId: 'bone_armour',   weight: 15, qty: [1, 1] },
      { itemId: 'health_potion', weight: 25, qty: [1, 2] },
      { itemId: 'str_amulet',    weight: 8,  qty: [1, 1] },
      { itemId: 'prot_ring',     weight: 8,  qty: [1, 1] },
      { itemId: null,            weight: 29 },
    ],
  },
  dragons_lair: {
    always: [{ itemId: 'coins', qty: [60, 100] }],
    rolls: 2,
    table: [
      { itemId: 'drake_fang',    weight: 12, qty: [1, 1] },
      { itemId: 'dragonhide',    weight: 12, qty: [1, 1] },
      { itemId: 'super_health',  weight: 20, qty: [1, 1] },
      { itemId: 'strength_brew', weight: 15, qty: [1, 2] },
      { itemId: 'lucky_charm',   weight: 6,  qty: [1, 1] },
      { itemId: null,            weight: 35 },
    ],
  },
  shadow_temple: {
    always: [{ itemId: 'coins', qty: [80, 130] }],
    rolls: 2,
    table: [
      { itemId: 'shadow_blade',  weight: 10, qty: [1, 1] },
      { itemId: 'shadow_robes',  weight: 10, qty: [1, 1] },
      { itemId: 'magic_brew',    weight: 18, qty: [1, 2] },
      { itemId: 'super_health',  weight: 15, qty: [1, 1] },
      { itemId: 'prot_ring',     weight: 7,  qty: [1, 1] },
      { itemId: null,            weight: 40 },
    ],
  },
  frost_cavern: {
    always: [{ itemId: 'coins', qty: [100, 160] }],
    rolls: 2,
    table: [
      { itemId: 'frost_wand',       weight: 10, qty: [1, 1] },
      { itemId: 'glacier_shield',   weight: 10, qty: [1, 1] },
      { itemId: 'super_health',     weight: 18, qty: [1, 2] },
      { itemId: 'ancient_talisman', weight: 4,  qty: [1, 1] },
      { itemId: 'strength_brew',    weight: 12, qty: [1, 2] },
      { itemId: null,               weight: 46 },
    ],
  },
  volcanic_forge: {
    always: [{ itemId: 'coins', qty: [130, 200] }],
    rolls: 3,
    table: [
      { itemId: 'volcanic_axe',     weight: 9,  qty: [1, 1] },
      { itemId: 'obsidian_plate',   weight: 9,  qty: [1, 1] },
      { itemId: 'super_health',     weight: 18, qty: [1, 2] },
      { itemId: 'strength_brew',    weight: 14, qty: [1, 2] },
      { itemId: 'ancient_talisman', weight: 3,  qty: [1, 1] },
      { itemId: null,               weight: 47 },
    ],
  },
  abyssal_deep: {
    always: [{ itemId: 'coins', qty: [160, 250] }],
    rolls: 3,
    table: [
      { itemId: 'kraken_blade',     weight: 8,  qty: [1, 1] },
      { itemId: 'abyssal_aegis',    weight: 8,  qty: [1, 1] },
      { itemId: 'super_health',     weight: 16, qty: [1, 3] },
      { itemId: 'magic_brew',       weight: 14, qty: [1, 2] },
      { itemId: 'ancient_talisman', weight: 4,  qty: [1, 1] },
      { itemId: null,               weight: 50 },
    ],
  },
  celestial_tower: {
    always: [{ itemId: 'coins', qty: [200, 300] }],
    rolls: 3,
    table: [
      { itemId: 'holy_sword',       weight: 7,  qty: [1, 1] },
      { itemId: 'seraph_wings',     weight: 5,  qty: [1, 1] },
      { itemId: 'super_health',     weight: 15, qty: [1, 3] },
      { itemId: 'magic_brew',       weight: 12, qty: [1, 2] },
      { itemId: 'ancient_talisman', weight: 5,  qty: [1, 1] },
      { itemId: null,               weight: 56 },
    ],
  },
  void_sanctum: {
    always: [{ itemId: 'coins', qty: [250, 400] }],
    rolls: 3,
    table: [
      { itemId: 'void_blade',    weight: 5,  qty: [1, 1] },
      { itemId: 'void_shroud',   weight: 5,  qty: [1, 1] },
      { itemId: 'super_health',  weight: 14, qty: [1, 3] },
      { itemId: 'strength_brew', weight: 10, qty: [1, 2] },
      { itemId: 'magic_brew',    weight: 10, qty: [1, 2] },
      { itemId: null,            weight: 56 },
    ],
  },
  the_final_keep: {
    always: [
      { itemId: 'coins',       qty: [500, 750] },
      { itemId: 'dark_sceptre', qty: [1, 1] },
      { itemId: 'dark_armour',  qty: [1, 1] },
    ],
    rolls: 2,
    table: [
      { itemId: 'dark_amulet',  weight: 25, qty: [1, 1] },
      { itemId: 'super_health', weight: 30, qty: [2, 4] },
      { itemId: 'void_blade',   weight: 10, qty: [1, 1] },
      { itemId: null,           weight: 35 },
    ],
  },
};

// ─── Loot Rolling ─────────────────────────────────────────────────────────────

export function rollLoot(dungeonId) {
  const table = LOOT_TABLES[dungeonId];
  if (!table) return { coins: 0, items: [] };

  const result = { coins: 0, items: [] };

  // Always drops
  for (const drop of table.always) {
    const qty = drop.qty[0] + Math.floor(Math.random() * (drop.qty[1] - drop.qty[0] + 1));
    if (drop.itemId === 'coins') {
      result.coins += qty;
    } else {
      result.items.push({ itemId: drop.itemId, qty });
    }
  }

  // Random rolls
  const totalWeight = table.table.reduce((s, e) => s + e.weight, 0);
  for (let r = 0; r < table.rolls; r++) {
    let roll = Math.random() * totalWeight;
    for (const entry of table.table) {
      roll -= entry.weight;
      if (roll <= 0) {
        if (entry.itemId) {
          const qty = entry.qty
            ? entry.qty[0] + Math.floor(Math.random() * (entry.qty[1] - entry.qty[0] + 1))
            : 1;
          const existing = result.items.find(i => i.itemId === entry.itemId);
          if (existing) existing.qty += qty;
          else result.items.push({ itemId: entry.itemId, qty });
        }
        break;
      }
    }
  }

  return result;
}

// ─── Equipment Helpers ────────────────────────────────────────────────────────

// equipped: { weapon: id|null, armor: id|null, amulet: id|null }
export function getEquipmentBonus(equipped) {
  const bonus = { attack: 0, defense: 0, special: 0, hp: 0 };
  for (const itemId of Object.values(equipped || {})) {
    if (!itemId) continue;
    const item = ITEMS[itemId];
    if (!item?.bonus) continue;
    for (const [stat, val] of Object.entries(item.bonus)) {
      bonus[stat] = (bonus[stat] || 0) + val;
    }
  }
  return bonus;
}
