// ─── XP Scoring ───────────────────────────────────────────────────────────────
// Automatically scores tasks based on keywords + length. No user input needed.

const HIGH_XP_WORDS = [
  'build', 'create', 'design', 'write', 'develop', 'implement', 'launch',
  'deploy', 'research', 'analyze', 'present', 'interview', 'review', 'refactor',
  'complete', 'finish', 'submit', 'publish', 'configure', 'setup', 'migrate',
  'fix', 'debug', 'test', 'document', 'plan', 'architect', 'integrate',
];

const LOW_XP_WORDS = [
  'check', 'look', 'read', 'browse', 'ask', 'reply', 'respond', 'update',
  'remind', 'note', 'add', 'edit', 'change', 'quick', 'small', 'minor',
];

export function scoreTask(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const len = words.length;

  let score = 0;

  // Length heuristic: longer tasks = more work
  if (len >= 8) score += 2;
  else if (len >= 5) score += 1;

  // Keyword match
  const hasHigh = HIGH_XP_WORDS.some(w => lower.includes(w));
  const hasLow  = LOW_XP_WORDS.some(w => lower.includes(w));

  if (hasHigh) score += 2;
  if (hasLow)  score -= 1;

  // Connectors suggest multi-step tasks
  if (lower.includes(' and ') || lower.includes(' then ') || lower.includes(' &')) score += 1;

  // Map score to XP tier
  if (score >= 4) return { xp: 35, tier: 'high'   };
  if (score >= 2) return { xp: 20, tier: 'medium'  };
  return            { xp: 10, tier: 'low'    };
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export const SKILL_DEFS = {
  strike: {
    id: 'strike', name: 'Strike', icon: '⚔️', type: 'attack',
    desc: 'Basic attack',
    getDamage: (s) => 12 + s.attack * 3,
    cooldown: 0, effect: null, cost: null, unlockLevel: 1,
  },
  guard: {
    id: 'guard', name: 'Guard', icon: '🛡️', type: 'defense',
    desc: 'Halve the next hit',
    getDamage: () => 0,
    cooldown: 3, effect: 'guard', cost: null, unlockLevel: 1,
  },
  powerStrike: {
    id: 'powerStrike', name: 'Power Strike', icon: '💥', type: 'attack',
    desc: '2× damage',
    getDamage: (s) => (12 + s.attack * 3) * 2,
    cooldown: 2, effect: null, cost: null, unlockLevel: 2,
  },
  mend: {
    id: 'mend', name: 'Mend', icon: '💚', type: 'heal',
    desc: 'Restore 30 + DEF×3 HP',
    getDamage: () => 0,
    healAmt: (s) => 30 + s.defense * 3,
    cooldown: 3, effect: 'heal', cost: null, unlockLevel: 3,
  },
  unleash: {
    id: 'unleash', name: 'Unleash', icon: '✨', type: 'special',
    desc: 'Massive special hit',
    getDamage: (s) => 35 + s.special * 6,
    cooldown: 4, effect: null, cost: null, unlockLevel: 4,
  },
  stun: {
    id: 'stun', name: 'Stun', icon: '⚡', type: 'special',
    desc: 'Stun boss 1 turn + damage',
    getDamage: (s) => 8 + s.attack * 2,
    cooldown: 4, effect: 'stun', cost: 150, unlockLevel: null,
  },
  venomStrike: {
    id: 'venomStrike', name: 'Venom Strike', icon: '🗡️', type: 'attack',
    desc: 'Poison: 12 dmg × 3 turns',
    getDamage: (s) => 10 + s.attack * 2,
    cooldown: 3, effect: 'poison', poisonDmg: 12, cost: 250, unlockLevel: null,
  },
  aegis: {
    id: 'aegis', name: 'Aegis', icon: '🔮', type: 'defense',
    desc: 'Block next attack entirely',
    getDamage: () => 0,
    cooldown: 5, effect: 'shield', cost: 300, unlockLevel: null,
  },
  berserk: {
    id: 'berserk', name: 'Berserk', icon: '🔥', type: 'special',
    desc: '+60% dmg 3 turns, lose 15 HP',
    getDamage: (s) => 6 + s.attack * 2,
    cooldown: 5, effect: 'berserk', cost: 350, unlockLevel: null,
  },
  thunder: {
    id: 'thunder', name: 'Thunder', icon: '🌩️', type: 'special',
    desc: 'Ignore all defense',
    getDamage: (s) => 28 + s.special * 5,
    cooldown: 5, effect: 'piercing', cost: 450, unlockLevel: null,
  },
};

export const SHOP_SKILLS = ['stun', 'venomStrike', 'aegis', 'berserk', 'thunder'];

export const LEVEL_UNLOCK_SKILLS = { 2: 'powerStrike', 3: 'mend', 4: 'unleash' };

// ─── Classes ──────────────────────────────────────────────────────────────────

export const CLASSES = {
  warrior: {
    name: 'Warrior', icon: '⚔️',
    desc: 'Tough and reliable. Strong defense, steady damage.',
    baseStats: { attack: 2, defense: 3, special: 0 },
    baseHp: 130,
  },
  mage: {
    name: 'Mage', icon: '🔮',
    desc: 'Fragile but devastating. Specials hit like a truck.',
    baseStats: { attack: 0, defense: 0, special: 5 },
    baseHp: 90,
  },
  rogue: {
    name: 'Rogue', icon: '🗡️',
    desc: 'Fast and aggressive. Highest raw attack output.',
    baseStats: { attack: 4, defense: 1, special: 0 },
    baseHp: 105,
  },
};

// ─── Levels ───────────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1,  title: 'Initiate',    xp: 0    },
  { level: 2,  title: 'Apprentice',  xp: 100  },
  { level: 3,  title: 'Journeyman',  xp: 250  },
  { level: 4,  title: 'Adept',       xp: 500  },
  { level: 5,  title: 'Expert',      xp: 850  },
  { level: 6,  title: 'Master',      xp: 1300 },
  { level: 7,  title: 'Grandmaster', xp: 1900 },
  { level: 8,  title: 'Legend',      xp: 2700 },
  { level: 9,  title: 'Mythic',      xp: 3700 },
  { level: 10, title: 'Immortal',    xp: 5000 },
];

export function getLevelInfo(xp) {
  let current = LEVELS[0], next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) { current = LEVELS[i]; next = LEVELS[i + 1] || null; }
  }
  const into    = next ? xp - current.xp : 0;
  const needed  = next ? next.xp - current.xp : 1;
  return { current, next, progress: next ? (into / needed) * 100 : 100, into, needed };
}

// ─── Dungeons ─────────────────────────────────────────────────────────────────

export const DUNGEONS = [
  {
    id: 'goblin_warren', name: 'Goblin Warren', sub: 'The Shallow Dark',
    desc: 'Vermin lurk in narrow tunnels. A fitting first trial.',
    difficulty: 1, rec: 1,
    boss: { name: 'Grak the Vile', type: 'goblin', maxHp: 80, attack: 8, xpReward: 75,
      attacks: ['Slash', 'Cackle', 'Bite'] },
  },
  {
    id: 'haunted_crypt', name: 'Haunted Crypt', sub: 'Where the Dead Walk',
    desc: 'Ancient bones walk again. Silence the restless dead.',
    difficulty: 2, rec: 2,
    boss: { name: 'Lord Bonechill', type: 'skeleton', maxHp: 120, attack: 13, xpReward: 130,
      attacks: ['Bone Crush', 'Death Rattle', 'Chill Touch'] },
  },
  {
    id: 'dragons_lair', name: "Dragon's Lair", sub: 'Fire and Fury',
    desc: 'A young drake guards stolen gold. Mind the flames.',
    difficulty: 3, rec: 3,
    boss: { name: 'Pyrax the Scorcher', type: 'dragon', maxHp: 160, attack: 19, xpReward: 200,
      attacks: ['Fire Breath', 'Claw Swipe', 'Tail Lash'] },
  },
  {
    id: 'shadow_temple', name: 'Shadow Temple', sub: 'Darkness Incarnate',
    desc: 'A demon born of shadow feeds on fear itself.',
    difficulty: 4, rec: 4,
    boss: { name: 'Umbrakon', type: 'demon', maxHp: 200, attack: 24, xpReward: 280,
      attacks: ['Shadow Bolt', 'Darkness Wave', 'Soul Drain'] },
  },
  {
    id: 'frost_cavern', name: 'Frost Cavern', sub: 'The Frozen Deep',
    desc: 'A golem forged from eternal ice blocks the path.',
    difficulty: 5, rec: 5,
    boss: { name: 'Glacior', type: 'golem', maxHp: 240, attack: 22, xpReward: 360,
      attacks: ['Ice Slam', 'Frost Breath', 'Blizzard'] },
  },
  {
    id: 'volcanic_forge', name: 'Volcanic Forge', sub: 'Heart of the Mountain',
    desc: "Born from the earth's core — pure elemental rage.",
    difficulty: 6, rec: 6,
    boss: { name: 'Ignaros', type: 'elemental', maxHp: 280, attack: 30, xpReward: 450,
      attacks: ['Magma Surge', 'Eruption', 'Lava Bind'] },
  },
  {
    id: 'abyssal_deep', name: 'Abyssal Deep', sub: 'Below the Tide',
    desc: 'Something vast stirs in lightless water. Do not look down.',
    difficulty: 7, rec: 7,
    boss: { name: 'Krath the Ancient', type: 'serpent', maxHp: 320, attack: 32, xpReward: 540,
      attacks: ['Constrict', 'Tidal Wave', 'Venomous Fang'] },
  },
  {
    id: 'celestial_tower', name: 'Celestial Tower', sub: 'Above the Clouds',
    desc: 'A fallen guardian of light. Its judgment is merciless.',
    difficulty: 8, rec: 8,
    boss: { name: 'Seraphex', type: 'celestial', maxHp: 360, attack: 36, xpReward: 640,
      attacks: ['Holy Lance', 'Judgment', 'Radiant Burst'] },
  },
  {
    id: 'void_sanctum', name: 'Void Sanctum', sub: 'Between Worlds',
    desc: 'Reality tears here. The Wraith is what remains of a god.',
    difficulty: 9, rec: 9,
    boss: { name: 'Nyxara the Void', type: 'wraith', maxHp: 420, attack: 42, xpReward: 780,
      attacks: ['Void Rift', 'Phase Shift', 'Annihilate'] },
  },
  {
    id: 'the_final_keep', name: 'The Final Keep', sub: 'End of All Things',
    desc: 'The Dark Lord waits on an obsidian throne. This is what you were made for.',
    difficulty: 10, rec: 10,
    boss: { name: 'Malachar the Undying', type: 'darkLord', maxHp: 520, attack: 50, xpReward: 1000,
      attacks: ['Dark Surge', 'Doomsday', 'Soul Shatter'] },
  },
];
