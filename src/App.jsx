import { useState, useEffect, useRef, useCallback } from "react";
import BattleScreen    from "./components/BattleScreen.jsx";
import CharacterSheet  from "./components/CharacterSheet.jsx";
import AuthPage        from "./components/auth/AuthPage.jsx";
import { useAuth }     from "./contexts/AuthContext.jsx";
import { scoreTask, getLevelInfo, getSkillSlots, LEVELS, CLASSES, LEVEL_UNLOCK_SKILLS, DUNGEONS, ITEMS } from "./data/gameData.js";

// ─── Persistence (per-user, keyed by Supabase user ID) ───────────────────────

function userKey(uid)  { return `quest-v4-${uid}`; }
function loadData(uid) {
  try { return JSON.parse(localStorage.getItem(userKey(uid)) || "null"); }
  catch { return null; }
}
function saveData(d, uid) { localStorage.setItem(userKey(uid), JSON.stringify(d)); }

function todayKey() { return new Date().toISOString().slice(0, 10); }

function mkDungeons() {
  return Object.fromEntries(DUNGEONS.map(d => [d.id, { beaten: false }]));
}

function defaultState() {
  return {
    tasks: [], xp: 0, streak: 0, lastActiveDate: null, completedDates: [],
    character: null, dungeons: mkDungeons(),
    gold: 0, inventory: [], equipped: { weapon: null, armor: null, amulet: null },
  };
}

function loadUserState(uid) {
  const saved = loadData(uid);
  if (saved) {
    if (!saved.dungeons)  saved.dungeons  = mkDungeons();
    if (!saved.gold)      saved.gold      = 0;
    if (!saved.inventory) saved.inventory = [];
    if (!saved.equipped)  saved.equipped  = { weapon: null, armor: null, amulet: null };
    if (saved.character) {
      while (saved.character.skills.length < 4) saved.character.skills.push(null);
    }
    return saved;
  }
  return defaultState();
}

// ─── Level helpers ────────────────────────────────────────────────────────────

function currentLevel(xp) {
  let l = LEVELS[0];
  for (const lvl of LEVELS) { if (xp >= lvl.xp) l = lvl; }
  return l.level;
}

// ─── Components ───────────────────────────────────────────────────────────────

function XpFloat({ floats }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
      {floats.map(f => (
        <div key={f.id} style={{ position: "absolute", left: f.x, top: f.y, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#a78bfa", animation: "floatUp 1.2s ease-out forwards", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>
          +{f.xp} XP
        </div>
      ))}
    </div>
  );
}

function LevelUpBanner({ title, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2000, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: "20px", padding: "2rem 3rem", textAlign: "center", boxShadow: "0 0 60px rgba(124,58,237,0.4)", animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚡</div>
      <div style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "0.3rem" }}>Level Up</div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>{title}</div>
    </div>
  );
}

function RareLootBanner({ name }) {
  return (
    <div style={{ position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", zIndex: 2000, background: "linear-gradient(135deg,#1e1b4b,#312e81)", border: "1px solid #a78bfa", borderRadius: "16px", padding: "1rem 2rem", textAlign: "center", boxShadow: "0 0 40px rgba(167,139,250,0.35)", animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards", fontFamily: "Inter, system-ui, sans-serif", pointerEvents: "none" }}>
      <div style={{ fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#a78bfa", marginBottom: "0.2rem" }}>Rare Drop!</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{name}</div>
    </div>
  );
}

// ─── Character Creation ───────────────────────────────────────────────────────

function CharacterCreation({ onCreate, dark }) {
  const [name, setName] = useState("");
  const [cls, setCls]   = useState("warrior");
  const fg      = dark ? "#e5e7eb" : "#111827";
  const fgMuted = dark ? "#6b7280" : "#9ca3af";
  const cardBg  = dark ? "#161616" : "#ffffff";
  const border  = dark ? "#262626" : "#e5e7eb";
  const accent  = "#7c3aed";

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const c = CLASSES[cls];
    onCreate({
      name: name.trim(), class: cls,
      baseHp: c.baseHp,
      stats: { ...c.baseStats },
      skillPoints: 0,
      skills: [c.startingSkill, null, null, null],
      unlockedSkills: [c.startingSkill],
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: dark ? "#0a0a0a" : "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "Inter, system-ui, sans-serif" }}>
      <form onSubmit={submit} style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: "0.5rem" }}>⚔️</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: fg, textAlign: "center", marginBottom: "0.4rem" }}>Create your character</h1>
        <p style={{ fontSize: "0.82rem", color: fgMuted, textAlign: "center", marginBottom: "2rem" }}>Complete tasks → earn XP → level up → conquer dungeons.</p>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name..."
          style={{ width: "100%", padding: "0.875rem 1rem", background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", fontSize: "1rem", color: fg, fontFamily: "inherit", marginBottom: "1.25rem", boxSizing: "border-box", outline: "none" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1.5rem" }}>
          {Object.entries(CLASSES).map(([key, c]) => (
            <button key={key} type="button" onClick={() => setCls(key)}
              style={{ background: cls === key ? "#2e106530" : cardBg, border: `1px solid ${cls === key ? accent : border}`, borderRadius: "12px", padding: "1rem 0.5rem", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.15s" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{c.icon}</div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: fg, marginBottom: "4px" }}>{c.name}</div>
              <div style={{ fontSize: "0.65rem", color: fgMuted, lineHeight: 1.4 }}>{c.desc}</div>
            </button>
          ))}
        </div>

        <button type="submit" disabled={!name.trim()}
          style={{ width: "100%", background: name.trim() ? accent : "transparent", border: `1px solid ${name.trim() ? accent : border}`, borderRadius: "12px", padding: "0.875rem", cursor: name.trim() ? "pointer" : "default", color: name.trim() ? "#fff" : fgMuted, fontSize: "1rem", fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s" }}>
          Begin Quest
        </button>
      </form>
    </div>
  );
}

// ─── Task Item ────────────────────────────────────────────────────────────────

function TaskItem({ task, onComplete, onDelete, dark, accent }) {
  const fg      = dark ? "#e5e7eb" : "#111827";
  const fgMuted = dark ? "#6b7280" : "#9ca3af";
  const cardBg  = dark ? "#161616" : "#ffffff";
  const border  = dark ? "#262626" : "#e5e7eb";
  const strikeC = dark ? "#2a2a2a" : "#e5e7eb";
  const TIER_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };

  return (
    <div className="task-row" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.8rem 1rem", background: cardBg, border: `1px solid ${task.completed ? strikeC : border}`, borderRadius: "12px", transition: "all 0.2s", opacity: task.completed ? 0.48 : 1, animation: "slideIn 0.22s ease" }}>
      <button onClick={(e) => !task.completed && onComplete(task.id, e)}
        style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${task.completed ? accent : border}`, background: task.completed ? accent : "transparent", cursor: task.completed ? "default" : "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
        {task.completed && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>

      <span style={{ flex: 1, fontSize: "0.88rem", color: task.completed ? fgMuted : fg, textDecoration: task.completed ? "line-through" : "none", textDecorationColor: strikeC, lineHeight: 1.45 }}>
        {task.text}
      </span>

      {!task.completed && (
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: TIER_COLOR[task.tier] || "#6b7280", flexShrink: 0, display: "block" }} />
      )}
      {task.completed && (
        <span style={{ fontSize: "0.68rem", fontWeight: 600, color: accent, opacity: 0.8, flexShrink: 0 }}>+{task.xp}</span>
      )}

      <button onClick={() => onDelete(task.id)} className="delete-btn"
        style={{ background: "none", border: "none", cursor: "pointer", color: fgMuted, fontSize: "0.82rem", padding: "2px 4px", opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>✕</button>
    </div>
  );
}

// ─── Dungeon Panel (sidebar) ──────────────────────────────────────────────────

function DungeonPanel({ dungeons, onEnter, dark }) {
  const fg      = dark ? "#e5e7eb" : "#111827";
  const fgMuted = dark ? "#6b7280" : "#9ca3af";
  const cardBg  = dark ? "#161616" : "#ffffff";
  const border  = dark ? "#262626" : "#e5e7eb";
  const accent  = "#7c3aed";

  const clearedCount = DUNGEONS.filter(d => dungeons[d.id]?.beaten).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: fgMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Dungeons</div>
        <div style={{ fontSize: "0.68rem", color: fgMuted }}>{clearedCount}/{DUNGEONS.length} cleared</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {DUNGEONS.map(d => {
          const beaten = dungeons[d.id]?.beaten;
          return (
            <div key={d.id} style={{ background: cardBg, border: `1px solid ${beaten ? "#7c3aed44" : border}`, borderRadius: "10px", padding: "0.625rem 0.875rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: fg, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                  {beaten && <span style={{ fontSize: "0.6rem", color: "#4ade80", flexShrink: 0 }}>✓</span>}
                </div>
                <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{ width: 8, height: 3, borderRadius: 2, background: i < d.difficulty ? "#7c3aed" : border }} />
                  ))}
                </div>
              </div>
              <button onClick={() => onEnter(d)}
                style={{ background: beaten ? "transparent" : accent, border: `1px solid ${beaten ? border : accent}`, borderRadius: "7px", padding: "4px 10px", cursor: "pointer", color: beaten ? fgMuted : "#fff", fontSize: "0.68rem", fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}>
                {beaten ? "retry" : "enter"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading: authLoading, signOut, touchActivity } = useAuth();

  const [data, setData]           = useState(null);
  const [dark, setDark]           = useState(() => {
    const pref = localStorage.getItem("quest-theme");
    return pref !== null ? pref === "dark" : true;
  });
  const [overlay, setOverlay]     = useState(null);       // "character" | "battle"
  const [charTab, setCharTab]     = useState("stats");
  const [profileMenu, setMenu]    = useState(false);
  const [battleDungeon, setBD]    = useState(null);
  const [input, setInput]         = useState("");
  const [floats, setFloats]       = useState([]);
  const [levelUpMsg, setLvlUp]    = useState(null);
  const [showDone, setShowDone]   = useState(false);
  const [lootFlash, setLootFlash] = useState(null); // rare item name
  const inputRef                  = useRef(null);
  const floatId                   = useRef(0);
  const profileRef                = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load game data when user signs in; clear it when they sign out
  useEffect(() => {
    if (user) {
      setData(loadUserState(user.id));
    } else {
      setData(null);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist game data whenever it changes (per user)
  useEffect(() => {
    if (data && user) saveData(data, user.id);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist dark-mode preference (not user-specific)
  useEffect(() => {
    localStorage.setItem("quest-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (!data) return;
    const today = todayKey();
    if (data.lastActiveDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    setData(d => ({ ...d, streak: d.lastActiveDate === yKey ? d.streak : 0, lastActiveDate: today }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.lastActiveDate]);

  const bg       = dark ? "#0a0a0a" : "#f9fafb";
  const fg       = dark ? "#e5e7eb" : "#111827";
  const fgMuted  = dark ? "#6b7280" : "#9ca3af";
  const cardBg   = dark ? "#161616" : "#ffffff";
  const border   = dark ? "#262626" : "#e5e7eb";
  const accent   = "#7c3aed";
  const accentLt = "#a78bfa";

  // ── Auth: loading ──
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
        <style>{globalStyles}</style>
        <span style={{ color: accent, fontSize: "0.88rem" }}>Loading…</span>
      </div>
    );
  }

  // ── Auth: not signed in ──
  if (!user) {
    return (
      <div style={{ background: bg, minHeight: "100vh" }}>
        <style>{globalStyles}</style>
        <AuthPage dark={dark} />
      </div>
    );
  }

  // ── Game data still hydrating ──
  if (!data) return null;

  const { tasks, xp, streak, character, dungeons, gold, inventory, equipped } = data;
  const levelInfo = getLevelInfo(xp);
  const pending   = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  // ── Gain XP ──
  const gainXp = useCallback((amount) => {
    setData(d => {
      const prevLvl = currentLevel(d.xp);
      const newXp   = d.xp + amount;
      const newLvl  = currentLevel(newXp);
      const gained  = newLvl - prevLvl;

      let newChar = d.character;
      if (newChar && gained > 0) {
        const newUnlocked = [...newChar.unlockedSkills];
        for (let l = prevLvl + 1; l <= newLvl; l++) {
          const unlock = LEVEL_UNLOCK_SKILLS[l];
          if (unlock) {
            for (const sid of unlock) {
              if (!newUnlocked.includes(sid)) newUnlocked.push(sid);
            }
          }
        }

        const newSlots  = getSkillSlots(newLvl);
        const newSkills = [...newChar.skills];
        while (newSkills.length < 4) newSkills.push(null);

        // Auto-equip newly unlocked skills into available empty slots
        for (const sid of newUnlocked) {
          if (!newChar.unlockedSkills.includes(sid)) {
            const emptyIdx = newSkills.slice(0, newSlots).indexOf(null);
            if (emptyIdx >= 0) newSkills[emptyIdx] = sid;
          }
        }

        newChar = { ...newChar, skillPoints: newChar.skillPoints + gained, unlockedSkills: newUnlocked, skills: newSkills };

        const title = LEVELS.find(l => l.level === newLvl)?.title || "";
        setTimeout(() => setLvlUp(title), 300);
      }

      return { ...d, xp: newXp, character: newChar };
    });
  }, []);

  const spawnFloat = useCallback((amount, e) => {
    const id   = ++floatId.current;
    const rect = e?.currentTarget?.getBoundingClientRect?.();
    const x    = rect ? rect.left + rect.width / 2 - 24 : window.innerWidth / 2;
    const y    = rect ? rect.top - 10 : 100;
    setFloats(fs => [...fs, { id, xp: amount, x, y }]);
    setTimeout(() => setFloats(fs => fs.filter(f => f.id !== id)), 1200);
  }, []);

  const addTask = useCallback((e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const { xp: taskXp, tier } = scoreTask(text);
    const task = { id: Date.now().toString(), text, tier, xp: taskXp, completed: false, createdAt: new Date().toISOString() };
    setData(d => ({ ...d, tasks: [task, ...d.tasks] }));
    setInput("");
    inputRef.current?.focus();
  }, [input]);

  const completeTask = useCallback((id, e) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    spawnFloat(task.xp, e);
    gainXp(task.xp);
    const today = todayKey();
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, completed: true } : t),
      streak: d.lastActiveDate === today && !d.completedDates.includes(today) ? d.streak + 1 : d.streak,
      completedDates: d.completedDates.includes(today) ? d.completedDates : [...d.completedDates, today],
    }));
  }, [tasks, spawnFloat, gainXp]);

  const deleteTask = useCallback((id) => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }, []);

  const clearCompleted = useCallback(() => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => !t.completed) }));
  }, []);

  const handleBattleEnd = useCallback((xpReward, loot) => {
    if (xpReward) {
      gainXp(xpReward);
      setData(d => {
        let newInventory = [...d.inventory];
        let newGold = d.gold;

        if (loot) {
          newGold += loot.coins || 0;
          for (const { itemId, qty } of loot.items) {
            const existing = newInventory.find(i => i.itemId === itemId);
            if (existing) {
              newInventory = newInventory.map(i => i.itemId === itemId ? { ...i, qty: i.qty + qty } : i);
            } else {
              newInventory = [...newInventory, { itemId, qty }];
            }
          }

          // Flash for rare+ items
          const rareDrops = loot.items.filter(i => {
            const item = ITEMS[i.itemId];
            return item && ['rare','very_rare','ultra_rare'].includes(item.rarity);
          });
          if (rareDrops.length > 0) {
            const topDrop = ITEMS[rareDrops[rareDrops.length - 1].itemId];
            setTimeout(() => {
              setLootFlash(topDrop.name);
              setTimeout(() => setLootFlash(null), 2800);
            }, 200);
          }
        }

        return { ...d, dungeons: { ...d.dungeons, [battleDungeon.id]: { beaten: true } }, gold: newGold, inventory: newInventory };
      });
    }
    setBD(null);
    setOverlay(null);
  }, [gainXp, battleDungeon]);

  const handlePotionUse = useCallback((itemId) => {
    setData(d => {
      const newInventory = d.inventory.map(i =>
        i.itemId === itemId ? { ...i, qty: i.qty - 1 } : i
      ).filter(i => i.qty > 0);
      return { ...d, inventory: newInventory };
    });
  }, []);

  const handleEquip = useCallback((itemId, slot) => {
    setData(d => {
      const currentlyEquipped = d.equipped[slot];
      let newInventory = [...d.inventory];
      let newEquipped  = { ...d.equipped };

      // Unequip current item back to inventory
      if (currentlyEquipped) {
        const existing = newInventory.find(i => i.itemId === currentlyEquipped);
        if (existing) {
          newInventory = newInventory.map(i => i.itemId === currentlyEquipped ? { ...i, qty: i.qty + 1 } : i);
        } else {
          newInventory = [...newInventory, { itemId: currentlyEquipped, qty: 1 }];
        }
      }

      if (itemId) {
        // Remove 1 from inventory
        newInventory = newInventory.map(i => i.itemId === itemId ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0);
        newEquipped[slot] = itemId;
      } else {
        newEquipped[slot] = null;
      }

      return { ...d, inventory: newInventory, equipped: newEquipped };
    });
  }, []);

  const handleCharUpdate = useCallback((newChar, xpCost = 0) => {
    setData(d => ({ ...d, character: newChar, xp: d.xp - xpCost }));
  }, []);

  // ── Character creation ──
  if (!character) {
    return (
      <div style={{ background: bg, minHeight: "100vh" }}>
        <style>{globalStyles}</style>
        <CharacterCreation onCreate={(c) => setData(d => ({ ...d, character: c }))} dark={dark} />
      </div>
    );
  }

  // ── Battle overlay ──
  if (overlay === "battle" && battleDungeon) {
    return (
      <div style={{ background: bg, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
        <style>{globalStyles}</style>
        <BattleScreen dungeon={battleDungeon} character={character} xp={xp} onEnd={handleBattleEnd} dark={dark} inventory={inventory} equipped={equipped} onPotionUse={handlePotionUse} />
      </div>
    );
  }

  // ── Character sheet overlay ──
  if (overlay === "character") {
    return (
      <div style={{ background: bg, minHeight: "100vh" }}>
        <style>{globalStyles}</style>
        <CharacterSheet character={character} xp={xp} onUpdate={handleCharUpdate} onClose={() => setOverlay(null)} dark={dark} initialTab={charTab} inventory={inventory} equipped={equipped} gold={gold} onEquip={handleEquip} />
      </div>
    );
  }

  const classInfo = CLASSES[character.class];

  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "Inter, system-ui, -apple-system, sans-serif", transition: "background 0.3s, color 0.3s" }}>
      <style>{globalStyles}</style>
      <XpFloat floats={floats} />
      {levelUpMsg  && <LevelUpBanner title={levelUpMsg} onDone={() => setLvlUp(null)} />}
      {lootFlash   && <RareLootBanner name={lootFlash} />}

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: dark ? "rgba(10,10,10,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${border}`, padding: "0.875rem 1.5rem" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: "0.875rem" }}>

          {/* Circle avatar + dropdown */}
          <div ref={profileRef} style={{ position: "relative", flexShrink: 0 }}>
            <button onClick={() => setMenu(m => !m)}
              style={{ position: "relative", width: 38, height: 38, borderRadius: "50%", background: profileMenu ? "linear-gradient(135deg,#6d28d9,#4f46e5)" : "linear-gradient(135deg,#4f46e5,#7c3aed)", border: `2px solid ${profileMenu ? accentLt : "transparent"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", transition: "all 0.15s" }}>
              {classInfo?.icon}
              {character.skillPoints > 0 && (
                <span style={{ position: "absolute", top: -3, right: -3, minWidth: 15, height: 15, borderRadius: "50%", background: "#ef4444", fontSize: "0.5rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 2px" }}>
                  {character.skillPoints}
                </span>
              )}
            </button>

            {profileMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden", zIndex: 300, minWidth: 160, boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.12)", animation: "slideDown 0.16s ease" }}>
                {[
                  { tab: "stats",  label: "Stats",  icon: "⚔️",  note: character.skillPoints > 0 ? `${character.skillPoints} pt` : null },
                  { tab: "skills", label: "Skills", icon: "✨",  note: null },
                  { tab: "shop",   label: "Shop",   icon: "🛒",  note: null },
                ].map(({ tab, label, icon, note }) => (
                  <button key={tab} onClick={() => { setCharTab(tab); setOverlay("character"); setMenu(false); }}
                    style={{ width: "100%", padding: "0.7rem 1rem", background: "none", border: "none", borderBottom: `1px solid ${border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem", fontFamily: "inherit", textAlign: "left", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? "#1f1f1f" : "#f3f4f6"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span style={{ fontSize: "0.9rem" }}>{icon}</span>
                    <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 500, color: fg }}>{label}</span>
                    {note && <span style={{ fontSize: "0.65rem", color: accentLt, fontWeight: 600 }}>{note}</span>}
                  </button>
                ))}
                {/* Sign out */}
                <button onClick={() => { setMenu(false); signOut(); }}
                  style={{ width: "100%", padding: "0.7rem 1rem", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem", fontFamily: "inherit", textAlign: "left", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? "#1f1f1f" : "#f3f4f6"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <span style={{ fontSize: "0.9rem" }}>🚪</span>
                  <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 500, color: "#ef4444" }}>Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Logo + name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, letterSpacing: "-0.02em", color: fg, lineHeight: 1 }}>quest</span>
            <span style={{ fontSize: "0.62rem", color: fgMuted, lineHeight: 1 }}>{character.name}</span>
          </div>

          {/* XP bar */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 600, color: accentLt, whiteSpace: "nowrap" }}>
              Lv.{levelInfo.current.level}
            </span>
            <div style={{ flex: 1, height: 4, background: border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${levelInfo.progress}%`, background: "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: "0.62rem", color: fgMuted, whiteSpace: "nowrap" }}>
              {levelInfo.next ? `${levelInfo.into}/${levelInfo.needed}` : "MAX"}
            </span>
          </div>

          {/* Streak + dark toggle */}
          {streak > 0 && <span style={{ fontSize: "0.78rem", color: "#f59e0b", fontWeight: 600, flexShrink: 0 }}>🔥{streak}</span>}
          {gold > 0 && <span style={{ fontSize: "0.78rem", color: "#fbbf24", fontWeight: 600, flexShrink: 0 }}>🪙{gold.toLocaleString()}</span>}
          <button onClick={() => setDark(d => !d)}
            style={{ background: "none", border: `1px solid ${border}`, borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "0.72rem", color: fgMuted, fontFamily: "inherit", flexShrink: 0 }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "1.5rem", padding: "1.5rem", boxSizing: "border-box", alignItems: "flex-start" }}>

        {/* Tasks — left/main */}
        <main style={{ flex: "1 1 300px", minWidth: 0 }}>
          {/* Add task */}
          <form onSubmit={addTask} style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", background: cardBg, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden", transition: "border-color 0.2s" }}
              onFocusCapture={e => e.currentTarget.style.borderColor = accentLt}
              onBlurCapture={e => e.currentTarget.style.borderColor = border}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Add a task..."
                style={{ flex: 1, padding: "0.875rem 1rem", background: "transparent", border: "none", fontSize: "0.9rem", color: fg, fontFamily: "inherit", outline: "none" }}
              />
              <button type="submit" disabled={!input.trim()}
                style={{ background: input.trim() ? accent : "transparent", border: "none", borderLeft: `1px solid ${border}`, padding: "0 1.1rem", cursor: input.trim() ? "pointer" : "default", color: input.trim() ? "#fff" : fgMuted, fontSize: "1.1rem", borderRadius: "0 14px 14px 0", transition: "background 0.2s" }}>
                +
              </button>
            </div>
            <div style={{ fontSize: "0.66rem", color: fgMuted, marginTop: "0.35rem", paddingLeft: "0.25rem" }}>
              XP scored automatically by task complexity
            </div>
          </form>

          {/* Stats row */}
          {tasks.length > 0 && (
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", fontSize: "0.75rem", color: fgMuted }}>
              <span><span style={{ color: fg, fontWeight: 600 }}>{pending.length}</span> remaining</span>
              <span><span style={{ color: accentLt, fontWeight: 600 }}>{xp}</span> XP</span>
              {completed.length > 0 && <span><span style={{ color: "#4ade80", fontWeight: 600 }}>{completed.length}</span> done</span>}
            </div>
          )}

          {/* Pending tasks */}
          {pending.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1.5rem" }}>
              {pending.map(t => (
                <TaskItem key={t.id} task={t} onComplete={completeTask} onDelete={deleteTask} dark={dark} accent={accentLt} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {pending.length === 0 && tasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 0", color: fgMuted }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚔️</div>
              <div style={{ fontSize: "0.9rem", color: fg, marginBottom: "0.25rem" }}>No quests yet.</div>
              <div style={{ fontSize: "0.78rem" }}>Add a task above to begin your journey.</div>
            </div>
          )}
          {pending.length === 0 && completed.length > 0 && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎉</div>
              <div style={{ fontSize: "0.9rem", color: "#4ade80", fontWeight: 600 }}>All quests complete!</div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <button onClick={() => setShowDone(s => !s)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", color: fgMuted, fontFamily: "inherit", padding: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ display: "inline-block", transform: showDone ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
                {completed.length} completed
                {showDone && (
                  <span onClick={e => { e.stopPropagation(); clearCompleted(); }} style={{ marginLeft: "auto", color: "#ef4444", cursor: "pointer", fontSize: "0.68rem" }}>clear all</span>
                )}
              </button>
              {showDone && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {completed.map(t => (
                    <TaskItem key={t.id} task={t} onComplete={() => {}} onDelete={deleteTask} dark={dark} accent={accentLt} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Dungeons — right panel */}
        <aside style={{ flex: "0 0 260px", minWidth: 0 }}>
          <DungeonPanel
            dungeons={dungeons}
            dark={dark}
            onEnter={(d) => { setBD(d); setOverlay("battle"); }}
          />
        </aside>
      </div>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; }
  @keyframes floatUp  { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-52px) scale(0.88)} }
  @keyframes popIn    { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.65)} 100%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
  @keyframes slideIn   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .task-row:hover .delete-btn { opacity: 1 !important; }
  input:focus { outline: none; }
  button:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
`;
