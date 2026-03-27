import { useState, useCallback, useRef, useEffect } from "react";
import PixelBoss from "./PixelBoss.jsx";
import { SKILL_DEFS, getLevelInfo, getSkillSlots } from "../data/gameData.js";

export default function BattleScreen({ dungeon, character, xp, onEnd, dark }) {
  const stats       = character.stats;
  const boss        = dungeon.boss;
  const playerMaxHp = character.baseHp + (stats.hp || 0) * 15 + stats.defense * 5;
  const slotCount   = getSkillSlots(getLevelInfo(xp).current.level);

  const [playerHp, setPlayerHp]     = useState(playerMaxHp);
  const [bossHp, setBossHp]         = useState(boss.maxHp);
  const [turn, setTurn]             = useState("player");
  const [outcome, setOutcome]       = useState(null);
  const [log, setLog]               = useState([`⚔️  ${boss.name} blocks your path!`]);
  const [cooldowns, setCooldowns]   = useState({});
  const [effects, setEffects]       = useState({
    guard: 0, shield: 0, stun: 0, poison: 0,
    berserk: 0, weaken: 0, counter: 0, warcry: 0, regen: 0, shatter: 0,
  });
  const [bossIsHit, setBossIsHit]   = useState(false);
  const [bossAttacking, setBossAtk] = useState(false);
  const [busy, setBusy]             = useState(false);
  const logRef                      = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = useCallback((msg) => {
    setLog(prev => [...prev.slice(-5), msg]);
  }, []);

  const calcPlayerDmg = (skill, fx = effects) =>
    Math.max(1, Math.round(
      (typeof skill.getDamage === "function" ? skill.getDamage(stats) : 0)
      * (fx.berserk > 0 ? 1.6 : 1)
      * (fx.warcry  > 0 ? 1.5 : 1)
      * (fx.shatter > 0 ? 1.4 : 1)
    ));

  const calcBossDmg = (fx = effects) => {
    let d = Math.max(3, boss.attack - Math.floor(stats.defense * 1.5));
    if (fx.weaken > 0) d = Math.floor(d * 0.65);
    if (fx.guard  > 0) d = Math.floor(d * 0.5);
    if (fx.shield > 0) d = 0;
    return d;
  };

  const doUseSkill = useCallback(async (skillId) => {
    if (busy || turn !== "player") return;
    const skill = SKILL_DEFS[skillId];
    if (!skill || (cooldowns[skillId] || 0) > 0) return;

    setBusy(true);

    let hp  = playerHp;
    let bhp = bossHp;
    let fx  = { ...effects };
    let cds = { ...cooldowns };

    if (skill.cooldown > 0) cds[skillId] = skill.cooldown;

    switch (skill.effect) {
      case "guard":
        fx.guard = 2;
        addLog("🛡️  You brace — next hit halved.");
        break;
      case "heal": {
        const amt = skill.healAmt ? Math.round(skill.healAmt(stats)) : 25;
        hp = Math.min(playerMaxHp, hp + amt);
        addLog(`💚 Recovered ${amt} HP.`);
        break;
      }
      case "shield":
        fx.shield = 1;
        addLog("🔮 Aegis raised — next hit absorbed!");
        break;
      case "stun": {
        const dmg = calcPlayerDmg(skill, fx);
        bhp = Math.max(0, bhp - dmg);
        fx.stun = 1;
        setBossIsHit(true); setTimeout(() => setBossIsHit(false), 300);
        addLog(`⚡ ${dmg} damage — boss stunned!`);
        break;
      }
      case "poison": {
        const dmg = calcPlayerDmg(skill, fx);
        bhp = Math.max(0, bhp - dmg);
        fx.poison = 3;
        setBossIsHit(true); setTimeout(() => setBossIsHit(false), 300);
        addLog(`🗡️  ${dmg} damage + poisoned (3 turns).`);
        break;
      }
      case "berserk": {
        fx.berserk = 3;
        const dmg = calcPlayerDmg(skill, fx);
        bhp = Math.max(0, bhp - dmg);
        hp = Math.max(1, hp - 15);
        setBossIsHit(true); setTimeout(() => setBossIsHit(false), 300);
        addLog(`🔥 Berserk! ${dmg} damage, -15 HP.`);
        break;
      }
      case "weaken":
        fx.weaken = 2;
        addLog("🌀 Boss weakened — ATK −35% for 2 turns.");
        break;
      case "counter":
        fx.counter = 1;
        addLog("↩️  Counter set — next boss hit reflected!");
        break;
      case "warcry":
        fx.warcry = 3;
        addLog("📢 War Cry! +50% damage for 3 turns.");
        break;
      case "regen":
        fx.regen = 3;
        addLog("🌿 Regenerate — +15 HP/turn for 3 turns.");
        break;
      case "shatter":
        fx.shatter = 3;
        addLog("💢 Shatter! Boss DEF −40% for 3 turns.");
        break;
      case "lifeDrain": {
        const dmg = calcPlayerDmg(skill, fx);
        const heal = Math.round(dmg * 0.6);
        bhp = Math.max(0, bhp - dmg);
        hp = Math.min(playerMaxHp, hp + heal);
        setBossIsHit(true); setTimeout(() => setBossIsHit(false), 300);
        addLog(`🩸 ${dmg} damage — drained ${heal} HP.`);
        break;
      }
      case "triple": {
        const hit = calcPlayerDmg(skill, fx);
        const total = hit * 3;
        bhp = Math.max(0, bhp - total);
        setBossIsHit(true); setTimeout(() => setBossIsHit(false), 300);
        addLog(`👻 3 hits × ${hit} = ${total} total damage.`);
        break;
      }
      case "piercing": {
        const dmg = Math.max(1, Math.round(
          typeof skill.getDamage === "function" ? skill.getDamage(stats) : 0
        ));
        bhp = Math.max(0, bhp - dmg);
        setBossIsHit(true); setTimeout(() => setBossIsHit(false), 300);
        addLog(`🌩️  ${skill.name}: ${dmg} damage (ignores defense).`);
        break;
      }
      default: {
        const dmg = calcPlayerDmg(skill, fx);
        bhp = Math.max(0, bhp - dmg);
        setBossIsHit(true); setTimeout(() => setBossIsHit(false), 300);
        addLog(`${skill.icon} ${skill.name}: ${dmg} damage.`);
      }
    }

    setBossHp(bhp); setPlayerHp(hp); setEffects(fx); setCooldowns(cds);

    if (bhp <= 0) {
      setTimeout(() => {
        addLog(`💀 ${boss.name} is defeated!`);
        setTurn("end"); setOutcome("win"); setBusy(false);
      }, 450);
      return;
    }

    setTimeout(() => doBossTurn(hp, bhp, fx, cds), 650);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, turn, playerHp, bossHp, effects, cooldowns, stats, playerMaxHp]);

  const doBossTurn = (hp, bhp, fx, cds) => {
    let newFx  = { ...fx };
    let newCds = { ...cds };

    Object.keys(newCds).forEach(k => { if (newCds[k] > 0) newCds[k]--; });

    // Poison tick
    if (newFx.poison > 0) {
      bhp = Math.max(0, bhp - 12);
      newFx.poison--;
      setBossHp(bhp);
      addLog("☠️  Poison: 12 damage.");
      if (bhp <= 0) {
        setTimeout(() => { addLog(`💀 Poison finishes ${boss.name}!`); setTurn("end"); setOutcome("win"); setBusy(false); }, 300);
        return;
      }
    }

    // Regen tick
    if (newFx.regen > 0) {
      hp = Math.min(playerMaxHp, hp + 15);
      newFx.regen--;
      addLog("🌿 Regen: +15 HP.");
    }

    // Tick duration buffs
    ["guard", "shield", "berserk", "warcry", "shatter", "weaken"].forEach(k => {
      if (newFx[k] > 0) newFx[k]--;
    });

    // Stun check
    if (newFx.stun > 0) {
      newFx.stun--;
      setPlayerHp(hp);
      addLog("💫 Boss is stunned — skips turn.");
      setEffects(newFx); setCooldowns(newCds); setTurn("player"); setBusy(false);
      return;
    }

    const atkName = boss.attacks[Math.floor(Math.random() * boss.attacks.length)];

    // Counter check — boss attack is reflected
    if (newFx.counter > 0) {
      const reflected = Math.max(3, boss.attack - Math.floor(stats.defense * 1.5));
      bhp = Math.max(0, bhp - reflected);
      newFx.counter--;
      setBossHp(bhp);
      setBossAtk(true); setTimeout(() => setBossAtk(false), 400);
      setPlayerHp(hp);
      setEffects(newFx); setCooldowns(newCds);
      addLog(`↩️  ${atkName} — Countered! ${reflected} reflected.`);
      if (bhp <= 0) {
        setTimeout(() => { addLog(`💀 ${boss.name} is defeated!`); setTurn("end"); setOutcome("win"); setBusy(false); }, 300);
        return;
      }
      setTurn("player"); setBusy(false);
      return;
    }

    const dmg      = calcBossDmg(fx);
    const shielded = fx.shield > 0;
    const guarded  = fx.guard  > 0;

    setBossAtk(true); setTimeout(() => setBossAtk(false), 400);

    const newHp = Math.max(0, hp - dmg);
    setPlayerHp(newHp);
    setEffects(newFx);
    setCooldowns(newCds);

    if (shielded)     addLog(`🔮 ${atkName} — Aegis blocks all damage!`);
    else if (guarded) addLog(`🛡️  ${atkName} — guarded! ${dmg} damage.`);
    else              addLog(`💢 ${atkName} hits for ${dmg} damage.`);

    if (newHp <= 0) {
      setTimeout(() => { addLog("💀 You were defeated..."); setTurn("end"); setOutcome("lose"); setBusy(false); }, 300);
      return;
    }
    setTurn("player"); setBusy(false);
  };

  const fg       = dark ? "#e5e7eb" : "#111827";
  const fgMuted  = dark ? "#6b7280" : "#9ca3af";
  const cardBg   = dark ? "#161616" : "#ffffff";
  const border   = dark ? "#262626" : "#e5e7eb";
  const accent   = "#7c3aed";
  const accentLt = "#a78bfa";

  const SKILL_BORDER = {
    attack: "#7c3aed", defense: "#1d4ed8", heal: "#15803d",
    special: "#9333ea", utility: "#d97706",
  };

  const activeSkills = character.skills.slice(0, slotCount);

  return (
    <div style={{ position: "fixed", inset: 0, background: dark ? "#0a0a0a" : "#f9fafb", zIndex: 500, display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes bossIdle    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes bossHit     { 0%{transform:translateX(0)} 25%{transform:translateX(-9px)} 75%{transform:translateX(9px)} 100%{transform:translateX(0)} }
        @keyframes bossAttack  { 0%{transform:translateX(0) scale(1)} 50%{transform:translateX(-22px) scale(1.1)} 100%{transform:translateX(0) scale(1)} }
      `}</style>

      {/* Header */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
        <button onClick={() => onEnd(null)} style={{ background: "none", border: "none", cursor: "pointer", color: fgMuted, fontSize: "1.2rem", padding: 0 }}>←</button>
        <div>
          <div style={{ fontSize: "0.68rem", color: fgMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{dungeon.name}</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: fg }}>{boss.name}</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "0.72rem" }}>
          {turn === "player" && !outcome && <span style={{ color: "#4ade80" }}>your turn</span>}
          {turn === "boss"   && !outcome && <span style={{ color: "#ef4444" }}>boss turn</span>}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1.25rem 1.5rem", gap: "1rem", overflowY: "auto" }}>

        {/* Boss HP */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: fgMuted, marginBottom: "0.3rem" }}>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>{boss.name}</span>
            <span>{Math.max(0, bossHp)} / {boss.maxHp}</span>
          </div>
          <div style={{ height: "7px", background: border, borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(bossHp / boss.maxHp) * 100}%`, background: "linear-gradient(90deg,#b91c1c,#ef4444)", borderRadius: "4px", transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "0.3rem", flexWrap: "wrap" }}>
            {effects.poison > 0 && <span style={{ fontSize: "0.65rem", color: "#a3e635", background: "#1a2e0833", border: "1px solid #4d7c0f", borderRadius: "4px", padding: "1px 6px" }}>☠️ Poison ×{effects.poison}</span>}
            {effects.weaken > 0 && <span style={{ fontSize: "0.65rem", color: "#c084fc", background: "#2e106533", border: "1px solid #7c3aed", borderRadius: "4px", padding: "1px 6px" }}>🌀 Weakened ×{effects.weaken}</span>}
            {effects.shatter > 0 && <span style={{ fontSize: "0.65rem", color: "#f87171", background: "#43140733", border: "1px solid #b91c1c", borderRadius: "4px", padding: "1px 6px" }}>💢 Shattered ×{effects.shatter}</span>}
            {effects.stun > 0  && <span style={{ fontSize: "0.65rem", color: "#fbbf24", background: "#45260033", border: "1px solid #d97706", borderRadius: "4px", padding: "1px 6px" }}>💫 Stunned</span>}
          </div>
        </div>

        {/* Boss sprite */}
        <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
          <PixelBoss type={boss.type} isHit={bossIsHit} isAttacking={bossAttacking} size={110} />
        </div>

        {/* Log */}
        <div ref={logRef} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "3px", minHeight: "76px" }}>
          {log.map((entry, i) => (
            <div key={i} style={{ fontSize: "0.78rem", color: i === log.length - 1 ? fg : fgMuted, transition: "color 0.2s" }}>
              {entry}
            </div>
          ))}
        </div>

        {/* Player HP + status */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: fgMuted, marginBottom: "0.3rem" }}>
            <span style={{ color: "#4ade80", fontWeight: 600 }}>{character.name}</span>
            <span>{Math.max(0, playerHp)} / {playerMaxHp}</span>
          </div>
          <div style={{ height: "7px", background: border, borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(playerHp / playerMaxHp) * 100}%`, background: "linear-gradient(90deg,#15803d,#4ade80)", borderRadius: "4px", transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "0.3rem", flexWrap: "wrap" }}>
            {effects.guard   > 0 && <span style={{ fontSize: "0.65rem", color: "#60a5fa", background: "#1e3a5f33", border: "1px solid #1d4ed8", borderRadius: "4px", padding: "1px 6px" }}>🛡️ Guard ×{effects.guard}</span>}
            {effects.shield  > 0 && <span style={{ fontSize: "0.65rem", color: "#c084fc", background: "#2e106533", border: "1px solid #7c3aed", borderRadius: "4px", padding: "1px 6px" }}>🔮 Aegis</span>}
            {effects.berserk > 0 && <span style={{ fontSize: "0.65rem", color: "#fb923c", background: "#43140733", border: "1px solid #ea580c", borderRadius: "4px", padding: "1px 6px" }}>🔥 Berserk ×{effects.berserk}</span>}
            {effects.warcry  > 0 && <span style={{ fontSize: "0.65rem", color: "#fbbf24", background: "#45260033", border: "1px solid #d97706", borderRadius: "4px", padding: "1px 6px" }}>📢 War Cry ×{effects.warcry}</span>}
            {effects.regen   > 0 && <span style={{ fontSize: "0.65rem", color: "#86efac", background: "#0a1a0f33", border: "1px solid #15803d", borderRadius: "4px", padding: "1px 6px" }}>🌿 Regen ×{effects.regen}</span>}
            {effects.counter > 0 && <span style={{ fontSize: "0.65rem", color: "#a78bfa", background: "#2e106533", border: "1px solid #6d28d9", borderRadius: "4px", padding: "1px 6px" }}>↩️ Counter</span>}
          </div>
        </div>

        {/* Skills */}
        {turn === "player" && !outcome && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {activeSkills.map((skillId, i) => {
              if (!skillId) return <div key={i} style={{ height: 60, background: cardBg, border: `1px solid ${border}`, borderRadius: "10px", opacity: 0.3 }} />;
              const skill = SKILL_DEFS[skillId];
              if (!skill) return null;
              const cd  = cooldowns[skillId] || 0;
              const off = cd > 0 || busy;
              return (
                <button key={i} onClick={() => doUseSkill(skillId)} disabled={off}
                  style={{ background: cardBg, border: `1px solid ${off ? border : SKILL_BORDER[skill.type] || accent}`, borderRadius: "10px", padding: "0.6rem 0.75rem", cursor: off ? "not-allowed" : "pointer", textAlign: "left", opacity: off ? 0.45 : 1, fontFamily: "inherit", transition: "all 0.15s" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: fg }}>{skill.icon} {skill.name}</span>
                    {cd > 0 && <span style={{ fontSize: "0.62rem", color: fgMuted }}>⏳{cd}</span>}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: fgMuted, lineHeight: 1.3 }}>{skill.desc}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Outcome */}
        {outcome && (
          <div style={{ textAlign: "center", padding: "1.5rem", background: cardBg, border: `1px solid ${border}`, borderRadius: "16px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{outcome === "win" ? "🏆" : "💀"}</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, color: fg, marginBottom: "0.4rem" }}>
              {outcome === "win" ? "Victory!" : "Defeated"}
            </div>
            {outcome === "win" && (
              <div style={{ fontSize: "0.82rem", color: accentLt, marginBottom: "1rem" }}>+{boss.xpReward} XP earned</div>
            )}
            <button onClick={() => onEnd(outcome === "win" ? boss.xpReward : 0)}
              style={{ background: accent, border: "none", borderRadius: "10px", padding: "10px 28px", cursor: "pointer", color: "#fff", fontSize: "0.9rem", fontWeight: 600, fontFamily: "inherit" }}>
              {outcome === "win" ? "Claim Victory" : "Retreat"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
