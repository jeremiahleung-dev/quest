import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "quest-data";

const LEVELS = [
  { level: 1, title: "Initiate",    xpRequired: 0    },
  { level: 2, title: "Apprentice",  xpRequired: 100  },
  { level: 3, title: "Journeyman",  xpRequired: 250  },
  { level: 4, title: "Adept",       xpRequired: 500  },
  { level: 5, title: "Expert",      xpRequired: 850  },
  { level: 6, title: "Master",      xpRequired: 1300 },
  { level: 7, title: "Grandmaster", xpRequired: 1900 },
  { level: 8, title: "Legend",      xpRequired: 2700 },
];

const PRIORITY = {
  low:    { label: "low",    xp: 10,  color: "#6b7280" },
  medium: { label: "medium", xp: 20,  color: "#f59e0b" },
  high:   { label: "high",   xp: 35,  color: "#ef4444" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const xpIntoLevel = next ? xp - current.xpRequired : 0;
  const xpForLevel  = next ? next.xpRequired - current.xpRequired : 1;
  const progress    = next ? (xpIntoLevel / xpForLevel) * 100 : 100;
  return { current, next, progress, xpIntoLevel, xpForLevel };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function initialState() {
  const saved = loadData();
  if (saved) return saved;
  return {
    tasks: [],
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    completedDates: [],
  };
}

// ─── Components ───────────────────────────────────────────────────────────────

function XpFloat({ floats }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
      {floats.map(f => (
        <div
          key={f.id}
          style={{
            position: "absolute",
            left: f.x,
            top: f.y,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "#a78bfa",
            animation: "floatUp 1.2s ease-out forwards",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          +{f.xp} XP
        </div>
      ))}
    </div>
  );
}

function LevelUpBanner({ levelTitle, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 2000,
      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      borderRadius: "20px",
      padding: "2rem 3rem",
      textAlign: "center",
      boxShadow: "0 0 60px rgba(124,58,237,0.4)",
      animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚡</div>
      <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "0.3rem" }}>
        Level Up
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>
        {levelTitle}
      </div>
    </div>
  );
}

function TaskItem({ task, onComplete, onDelete, dark, accent }) {
  const fg       = dark ? "#e5e7eb" : "#111827";
  const fgMuted  = dark ? "#6b7280" : "#9ca3af";
  const cardBg   = dark ? "#161616" : "#ffffff";
  const border   = dark ? "#262626" : "#e5e7eb";
  const strikeColor = dark ? "#374151" : "#d1d5db";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        padding: "0.875rem 1rem",
        background: cardBg,
        border: `1px solid ${task.completed ? strikeColor : border}`,
        borderRadius: "12px",
        transition: "all 0.2s ease",
        opacity: task.completed ? 0.5 : 1,
        animation: "slideIn 0.25s ease",
      }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => !task.completed && onComplete(task.id, e)}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          border: `1.5px solid ${task.completed ? accent : border}`,
          background: task.completed ? accent : "transparent",
          cursor: task.completed ? "default" : "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
        }}
      >
        {task.completed && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span style={{
        flex: 1,
        fontSize: "0.9rem",
        color: task.completed ? fgMuted : fg,
        textDecoration: task.completed ? "line-through" : "none",
        lineHeight: 1.5,
        textDecorationColor: strikeColor,
      }}>
        {task.text}
      </span>

      {/* Priority dot */}
      {!task.completed && (
        <span style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: PRIORITY[task.priority].color,
          flexShrink: 0,
        }} />
      )}

      {/* XP badge on complete */}
      {task.completed && (
        <span style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: accent,
          opacity: 0.8,
          flexShrink: 0,
        }}>
          +{PRIORITY[task.priority].xp}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: fgMuted,
          fontSize: "0.85rem",
          padding: "2px 4px",
          opacity: 0,
          transition: "opacity 0.15s",
          flexShrink: 0,
        }}
        className="delete-btn"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData]           = useState(initialState);
  const [dark, setDark]           = useState(true);
  const [input, setInput]         = useState("");
  const [priority, setPriority]   = useState("medium");
  const [floats, setFloats]       = useState([]);
  const [levelUp, setLevelUp]     = useState(null);
  const [showDone, setShowDone]   = useState(false);
  const inputRef                  = useRef(null);
  const floatIdRef                = useRef(0);

  // Persist whenever data changes
  useEffect(() => { saveData(data); }, [data]);

  // Update streak on load / day change
  useEffect(() => {
    const today = todayKey();
    if (data.lastActiveDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);

    setData(d => ({
      ...d,
      streak: d.lastActiveDate === yKey ? d.streak : 0,
      lastActiveDate: today,
    }));
  }, []);

  // Colors
  const bg        = dark ? "#0a0a0a" : "#f9fafb";
  const fg        = dark ? "#e5e7eb" : "#111827";
  const fgMuted   = dark ? "#6b7280" : "#9ca3af";
  const cardBg    = dark ? "#161616" : "#ffffff";
  const border    = dark ? "#262626" : "#e5e7eb";
  const accent    = "#7c3aed";
  const accentLt  = "#a78bfa";

  const { tasks, xp, streak } = data;
  const levelInfo = getLevelInfo(xp);
  const pending   = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  const spawnFloat = useCallback((xpAmount, e) => {
    const id = ++floatIdRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    setFloats(fs => [...fs, { id, xp: xpAmount, x: rect.left + rect.width / 2 - 24, y: rect.top - 10 }]);
    setTimeout(() => setFloats(fs => fs.filter(f => f.id !== id)), 1200);
  }, []);

  const addTask = useCallback((e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const task = {
      id: Date.now().toString(),
      text,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setData(d => ({ ...d, tasks: [task, ...d.tasks] }));
    setInput("");
    inputRef.current?.focus();
  }, [input, priority]);

  const completeTask = useCallback((id, e) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const gained = PRIORITY[task.priority].xp;
    const prevLevel = getLevelInfo(xp).current.level;
    const newXp = xp + gained;
    const newLevel = getLevelInfo(newXp).current.level;

    spawnFloat(gained, e);

    const today = todayKey();
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, completed: true } : t),
      xp: newXp,
      streak: d.lastActiveDate === today && !d.completedDates.includes(today)
        ? d.streak + 1
        : d.streak,
      completedDates: d.completedDates.includes(today)
        ? d.completedDates
        : [...d.completedDates, today],
      lastActiveDate: today,
    }));

    if (newLevel > prevLevel) {
      const title = getLevelInfo(newXp).current.title;
      setTimeout(() => setLevelUp(title), 400);
    }
  }, [tasks, xp, spawnFloat]);

  const deleteTask = useCallback((id) => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }, []);

  const clearCompleted = useCallback(() => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => !t.completed) }));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: bg,
      color: fg,
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-48px) scale(0.9); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .task-row:hover .delete-btn { opacity: 1 !important; }
        input:focus { outline: none; }
        button:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
      `}</style>

      <XpFloat floats={floats} />
      {levelUp && <LevelUpBanner levelTitle={levelUp} onDone={() => setLevelUp(null)} />}

      {/* ── Header ── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: dark ? "rgba(10,10,10,0.9)" : "rgba(249,250,251,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${border}`,
        padding: "1rem 1.5rem",
      }}>
        <div style={{ maxWidth: "580px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.1rem" }}>⚔️</span>
              <span style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: fg }}>
                quest
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {streak > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "#f59e0b", fontWeight: 600 }}>
                  🔥 {streak}
                </div>
              )}
              <button
                onClick={() => setDark(d => !d)}
                style={{
                  background: "none",
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: fgMuted,
                  fontFamily: "inherit",
                }}
              >
                {dark ? "light" : "dark"}
              </button>
            </div>
          </div>

          {/* XP bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: accentLt,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}>
              Lv.{levelInfo.current.level} {levelInfo.current.title}
            </div>
            <div style={{ flex: 1, height: "4px", background: border, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${levelInfo.progress}%`,
                background: `linear-gradient(90deg, #4f46e5, #7c3aed)`,
                borderRadius: "2px",
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ fontSize: "0.7rem", color: fgMuted, whiteSpace: "nowrap" }}>
              {levelInfo.next
                ? `${levelInfo.xpIntoLevel}/${levelInfo.xpForLevel}`
                : "MAX"}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: "580px", margin: "0 auto", padding: "1.5rem" }}>

        {/* Add task form */}
        <form onSubmit={addTask} style={{ marginBottom: "1.5rem" }}>
          <div style={{
            display: "flex",
            gap: "0",
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: "14px",
            overflow: "hidden",
            transition: "border-color 0.2s",
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = accentLt}
            onBlurCapture={e => e.currentTarget.style.borderColor = border}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Add a task..."
              style={{
                flex: 1,
                padding: "0.875rem 1rem",
                background: "transparent",
                border: "none",
                fontSize: "0.9rem",
                color: fg,
                fontFamily: "inherit",
              }}
            />
            {/* Priority toggle */}
            <div style={{ display: "flex", alignItems: "center", borderLeft: `1px solid ${border}` }}>
              {["low", "medium", "high"].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    background: priority === p ? (dark ? "#1f1f1f" : "#f3f4f6") : "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 0.6rem",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={`${p} (+${PRIORITY[p].xp} XP)`}
                >
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: priority === p ? PRIORITY[p].color : (dark ? "#333" : "#d1d5db"),
                    transition: "background 0.15s",
                    display: "block",
                  }} />
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                background: input.trim() ? accent : "transparent",
                border: "none",
                borderLeft: `1px solid ${border}`,
                padding: "0 1.1rem",
                cursor: input.trim() ? "pointer" : "default",
                color: input.trim() ? "#fff" : fgMuted,
                fontSize: "1.1rem",
                transition: "background 0.2s",
                borderRadius: "0 14px 14px 0",
              }}
            >
              +
            </button>
          </div>
          <div style={{ marginTop: "0.4rem", paddingLeft: "0.25rem", fontSize: "0.7rem", color: fgMuted }}>
            {["low", "medium", "high"].map(p => (
              <span key={p} style={{ marginRight: "0.75rem" }}>
                <span style={{ color: PRIORITY[p].color }}>●</span> {p} +{PRIORITY[p].xp} XP
              </span>
            ))}
          </div>
        </form>

        {/* Stats row */}
        {tasks.length > 0 && (
          <div style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.25rem",
            fontSize: "0.78rem",
            color: fgMuted,
          }}>
            <span><span style={{ color: fg, fontWeight: 600 }}>{pending.length}</span> remaining</span>
            <span><span style={{ color: accentLt, fontWeight: 600 }}>{xp}</span> total XP</span>
            {completed.length > 0 && (
              <span><span style={{ color: "#4ade80", fontWeight: 600 }}>{completed.length}</span> done</span>
            )}
          </div>
        )}

        {/* Pending tasks */}
        {pending.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1.5rem" }}>
            {pending.map(task => (
              <div key={task.id} className="task-row">
                <TaskItem
                  task={task}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  dark={dark}
                  accent={accentLt}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {pending.length === 0 && tasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: fgMuted }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚔️</div>
            <div style={{ fontSize: "0.9rem", marginBottom: "0.25rem", color: fg }}>No quests yet.</div>
            <div style={{ fontSize: "0.8rem" }}>Add a task above to begin your journey.</div>
          </div>
        )}

        {pending.length === 0 && completed.length > 0 && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎉</div>
            <div style={{ fontSize: "0.9rem", color: "#4ade80", fontWeight: 600 }}>All quests complete!</div>
          </div>
        )}

        {/* Completed tasks */}
        {completed.length > 0 && (
          <div>
            <button
              onClick={() => setShowDone(s => !s)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.75rem",
                color: fgMuted,
                fontFamily: "inherit",
                padding: "0 0 0.75rem 0",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span style={{ transition: "transform 0.2s", display: "inline-block", transform: showDone ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
              {completed.length} completed
              {showDone && (
                <span
                  onClick={e => { e.stopPropagation(); clearCompleted(); }}
                  style={{ marginLeft: "auto", color: "#ef4444", cursor: "pointer", fontSize: "0.7rem" }}
                >
                  clear
                </span>
              )}
            </button>
            {showDone && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {completed.map(task => (
                  <div key={task.id} className="task-row">
                    <TaskItem
                      task={task}
                      onComplete={() => {}}
                      onDelete={deleteTask}
                      dark={dark}
                      accent={accentLt}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
