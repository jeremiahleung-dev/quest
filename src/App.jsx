import { useState, useEffect, useRef, useCallback } from "react";
import BattleScreen    from "./components/BattleScreen.jsx";
import CharacterSheet  from "./components/CharacterSheet.jsx";
import { scoreTask, getLevelInfo, LEVELS, CLASSES, LEVEL_UNLOCK_SKILLS, DUNGEONS } from "./data/gameData.js";

// ─── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "quest-v2";

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
  catch { return null; }
}

function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

function todayKey() { return new Date().toISOString().slice(0, 10); }

function mkDungeons() {
  return Object.fromEntries(DUNGEONS.map(d => [d.id, { beaten: false }]));
}

function initialState() {
  const saved = loadData();
  if (saved) {
    if (!saved.dungeons) saved.dungeons = mkDungeons();
    return saved;
  }
  return { tasks: [], xp: 0, streak: 0, lastActiveDate: null, completedDates: [], character: null, dungeons: mkDungeons() };
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

// ─── Character Creation ───────────────────────────────────────────────────────

function CharacterCreation({ onCreate, dark }) {
  const [name, setName]     = useState("");
  const [cls, setCls]       = useState("warrior");
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
      skills: ["strike", "guard", null, null],
      unlockedSkills: ["strike", "guard"],
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
  const fg       = dark ? "#e5e7eb" : "#111827";
  const fgMuted  = dark ? "#6b7280" : "#9ca3af";
  const cardBg   = dark ? "#161616" : "#ffffff";
  const border   = dark ? "#262626" : "#e5e7eb";
  const strikeC  = dark ? "#2a2a2a" : "#e5e7eb";
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

// ─── Dungeon List ─────────────────────────────────────────────────────────────

function DungeonList({ dungeons, onEnter, dark }) {
  const fg      = dark ? "#e5e7eb" : "#111827";
  const fgMuted = dark ? "#6b7280" : "#9ca3af";
  const cardBg  = dark ? "#161616" : "#ffffff";
  const border  = dark ? "#262626" : "#e5e7eb";
  const accent  = "#7c3aed";

  return (
    <div style={{ padding: "1.5rem", maxWidth: "580px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <div style={{ fontSize: "0.72rem", color: fgMuted, marginBottom: "1.25rem", letterSpacing: "0.05em" }}>
        {DUNGEONS.filter(d => dungeons[d.id]?.beaten).length} / {DUNGEONS.length} conquered
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {DUNGEONS.map(d => {
          const state  = dungeons[d.id] || {};
          const beaten = state.beaten;
          return (
            <div key={d.id} style={{ background: cardBg, border: `1px solid ${beaten ? "#7c3aed44" : border}`, borderRadius: "14px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2px" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: fg }}>{d.name}</span>
                  {beaten && <span style={{ fontSize: "0.65rem", color: "#4ade80", background: "#14532d33", border: "1px solid #16a34a", borderRadius: "4px", padding: "1px 6px" }}>✓ cleared</span>}
                </div>
                <div style={{ fontSize: "0.7rem", color: fgMuted, marginBottom: "4px" }}>{d.boss.name}</div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{ width: 10, height: 4, borderRadius: 2, background: i < d.difficulty ? "#7c3aed" : border }} />
                  ))}
                </div>
              </div>
              <button onClick={() => onEnter(d)}
                style={{ background: beaten ? "transparent" : accent, border: `1px solid ${beaten ? border : accent}`, borderRadius: "10px", padding: "8px 16px", cursor: "pointer", color: beaten ? fgMuted : "#fff", fontSize: "0.78rem", fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}>
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
  const [data, setData]         = useState(initialState);
  const [dark, setDark]         = useState(true);
  const [view, setView]         = useState("tasks");    // tasks | dungeons
  const [overlay, setOverlay]   = useState(null);       // "character" | "battle"
  const [battleDungeon, setBD]  = useState(null);
  const [input, setInput]       = useState("");
  const [floats, setFloats]     = useState([]);
  const [levelUpMsg, setLvlUp]  = useState(null);
  const [showDone, setShowDone] = useState(false);
  const inputRef                = useRef(null);
  const floatId                 = useRef(0);

  useEffect(() => { saveData(data); }, [data]);

  // Streak update on mount
  useEffect(() => {
    const today = todayKey();
    if (data.lastActiveDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    setData(d => ({ ...d, streak: d.lastActiveDate === yKey ? d.streak : 0, lastActiveDate: today }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Colors ──
  const bg       = dark ? "#0a0a0a" : "#f9fafb";
  const fg       = dark ? "#e5e7eb" : "#111827";
  const fgMuted  = dark ? "#6b7280" : "#9ca3af";
  const cardBg   = dark ? "#161616" : "#ffffff";
  const border   = dark ? "#262626" : "#e5e7eb";
  const accent   = "#7c3aed";
  const accentLt = "#a78bfa";

  const { tasks, xp, streak, character, dungeons } = data;
  const levelInfo  = getLevelInfo(xp);
  const pending    = tasks.filter(t => !t.completed);
  const completed  = tasks.filter(t => t.completed);

  // ── Gain XP (handles level-up + skill unlocks) ──
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
          if (unlock && !newUnlocked.includes(unlock)) newUnlocked.push(unlock);
        }
        const newSkills = [...newChar.skills];
        for (const sid of newUnlocked) {
          if (!newChar.unlockedSkills.includes(sid)) {
            const empty = newSkills.indexOf(null);
            if (empty >= 0) newSkills[empty] = sid;
          }
        }
        newChar = { ...newChar, skillPoints: newChar.skillPoints + gained, unlockedSkills: newUnlocked, skills: newSkills };

        if (gained > 0) {
          const title = LEVELS.find(l => l.level === newLvl)?.title || "";
          setTimeout(() => setLvlUp(title), 300);
        }
      }

      return { ...d, xp: newXp, character: newChar };
    });
  }, []);

  // ── Spawn XP float ──
  const spawnFloat = useCallback((amount, e) => {
    const id   = ++floatId.current;
    const rect = e?.currentTarget?.getBoundingClientRect?.();
    const x    = rect ? rect.left + rect.width / 2 - 24 : window.innerWidth / 2;
    const y    = rect ? rect.top - 10 : 100;
    setFloats(fs => [...fs, { id, xp: amount, x, y }]);
    setTimeout(() => setFloats(fs => fs.filter(f => f.id !== id)), 1200);
  }, []);

  // ── Add task ──
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

  // ── Complete task ──
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

  // ── Battle end ──
  const handleBattleEnd = useCallback((xpReward) => {
    if (xpReward) {
      gainXp(xpReward);
      setData(d => ({
        ...d,
        dungeons: { ...d.dungeons, [battleDungeon.id]: { beaten: true } },
      }));
    }
    setBD(null);
    setOverlay(null);
  }, [gainXp, battleDungeon]);

  // ── Character update (from CharacterSheet) ──
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
        <BattleScreen dungeon={battleDungeon} character={character} onEnd={handleBattleEnd} dark={dark} />
      </div>
    );
  }

  // ── Character sheet overlay ──
  if (overlay === "character") {
    return (
      <div style={{ background: bg, minHeight: "100vh" }}>
        <style>{globalStyles}</style>
        <CharacterSheet character={character} xp={xp} onUpdate={handleCharUpdate} onClose={() => setOverlay(null)} dark={dark} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "Inter, system-ui, -apple-system, sans-serif", transition: "background 0.3s, color 0.3s" }}>
      <style>{globalStyles}</style>
      <XpFloat floats={floats} />
      {levelUpMsg && <LevelUpBanner title={levelUpMsg} onDone={() => setLvlUp(null)} />}

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: dark ? "rgba(10,10,10,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${border}`, padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
              <span style={{ fontSize: "1rem" }}>⚔️</span>
              <span style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: fg }}>quest</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {streak > 0 && <span style={{ fontSize: "0.78rem", color: "#f59e0b", fontWeight: 600 }}>🔥 {streak}</span>}
              <button onClick={() => setOverlay("character")}
                style={{ background: "none", border: `1px solid ${border}`, borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "0.72rem", color: fgMuted, fontFamily: "inherit" }}>
                {character.name}
                {character.skillPoints > 0 && <span style={{ color: accentLt, marginLeft: 4 }}>⚡{character.skillPoints}</span>}
              </button>
              <button onClick={() => setDark(d => !d)}
                style={{ background: "none", border: `1px solid ${border}`, borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "0.72rem", color: fgMuted, fontFamily: "inherit" }}>
                {dark ? "light" : "dark"}
              </button>
            </div>
          </div>

          {/* XP bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: accentLt, whiteSpace: "nowrap" }}>
              Lv.{levelInfo.current.level} {levelInfo.current.title}
            </span>
            <div style={{ flex: 1, height: 4, background: border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${levelInfo.progress}%`, background: "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: "0.68rem", color: fgMuted, whiteSpace: "nowrap" }}>
              {levelInfo.next ? `${levelInfo.into}/${levelInfo.needed}` : "MAX"}
            </span>
          </div>

          {/* Nav tabs */}
          <div style={{ display: "flex", gap: "4px" }}>
            {["tasks", "dungeons"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "4px 14px", background: view === v ? accent + "22" : "none", border: `1px solid ${view === v ? accent : border}`, borderRadius: "20px", cursor: "pointer", fontSize: "0.75rem", fontWeight: view === v ? 600 : 400, color: view === v ? accentLt : fgMuted, fontFamily: "inherit", textTransform: "capitalize", transition: "all 0.15s" }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Tasks view ── */}
      {view === "tasks" && (
        <main style={{ maxWidth: 580, margin: "0 auto", padding: "1.5rem", boxSizing: "border-box" }}>
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
              XP is scored automatically based on task complexity
            </div>
          </form>

          {/* Stats */}
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
      )}

      {/* ── Dungeons view ── */}
      {view === "dungeons" && (
        <DungeonList dungeons={dungeons} dark={dark}
          onEnter={(d) => { setBD(d); setOverlay("battle"); }}
        />
      )}
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; }
  @keyframes floatUp  { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-52px) scale(0.88)} }
  @keyframes popIn    { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.65)} 100%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
  @keyframes slideIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .task-row:hover .delete-btn { opacity: 1 !important; }
  input:focus { outline: none; }
  button:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
`;
