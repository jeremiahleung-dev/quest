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
    getDamage: (s) => 14 + s.attack * 3,
    cooldown: 0, effect: null, cost: null, unlockLevel: 1,
  },
  arcaneBolt: {
    id: 'arcaneBolt', name: 'Arcane Bolt', icon: '🔵', type: 'attack',
    desc: 'Magic strike. Scales with SPL.',
    getDamage: (s) => 12 + s.special * 4,
    cooldown: 0, effect: null, cost: null, unlockLevel: 1,
  },
  quickSlash: {
    id: 'quickSlash', name: 'Quick Slash', icon: '💨', type: 'attack',
    desc: 'Fast hit. Never on cooldown.',
    getDamage: (s) => 10 + s.attack * 3,
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
