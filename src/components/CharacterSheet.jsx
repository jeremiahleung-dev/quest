import { useState } from "react";
import { CLASSES, SKILL_DEFS, SHOP_SKILLS, getLevelInfo, getSkillSlots } from "../data/gameData.js";

export default function CharacterSheet({ character, xp, onUpdate, onClose, dark, initialTab = "stats" }) {
  const [tab, setTab]               = useState(initialTab);
  const [alloc, setAlloc]           = useState({ attack: 0, defense: 0, special: 0 });
  const [swappingSlot, setSwapping] = useState(null);

  const fg       = dark ? "#e5e7eb" : "#111827";
  const fgMuted  = dark ? "#6b7280" : "#9ca3af";
  const cardBg   = dark ? "#161616" : "#ffffff";
  const border   = dark ? "#262626" : "#e5e7eb";
  const accent   = "#7c3aed";
  const accentLt = "#a78bfa";

  const lvlInfo  = getLevelInfo(xp);
  const curLevel = lvlInfo.current.level;
  const slotCount = getSkillSlots(curLevel);

  const pending     = character.skillPoints - Object.values(alloc).reduce((a, b) => a + b, 0);
  const totalStats  = {
    attack:  character.stats.attack  + (alloc.attack  || 0),
    defense: character.stats.defense + (alloc.defense || 0),
    special: character.stats.special + (alloc.special || 0),
  };

  const applyAlloc = () => {
    onUpdate({ ...character, stats: totalStats, skillPoints: pending });
    setAlloc({ attack: 0, defense: 0, special: 0 });
  };

  const buySkill = (skillId) => {
    const skill = SKILL_DEFS[skillId];
    if (!skill?.cost || xp < skill.cost || character.unlockedSkills.includes(skillId)) return;
    if (curLevel < (skill.unlockLevel || 5)) return;
    const newUnlocked = [...character.unlockedSkills, skillId];
    const newSkills   = [...character.skills];
    const empty       = newSkills.slice(0, slotCount).indexOf(null);
    if (empty >= 0) newSkills[empty] = skillId;
    onUpdate({ ...character, unlockedSkills: newUnlocked, skills: newSkills }, skill.cost);
  };

  const equipSkill = (skillId, slot) => {
    if (slot >= slotCount) return;
    const newSkills = [...character.skills];
    const existing  = newSkills.indexOf(skillId);
    if (existing >= 0) newSkills[existing] = null;
    newSkills[slot] = skillId;
    setSwapping(null);
    onUpdate({ ...character, skills: newSkills });
  };

  const STAT_COLOR = { attack: "#ef4444", defense: "#3b82f6", special: "#a855f7" };
  const STAT_ICON  = { attack: "⚔️", defense: "🛡️", special: "✨" };

  // Slot unlock levels: slot index → min level required
  const SLOT_UNLOCK = [1, 5, 8, 10];

  return (
    <div style={{ position: "fixed", inset: 0, background: dark ? "#0a0a0a" : "#f9fafb", zIndex: 500, display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: fgMuted, fontSize: "1.2rem", padding: 0 }}>←</button>
        <div>
          <div style={{ fontSize: "0.68rem", color: fgMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Character</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: fg }}>{character.name} · {CLASSES[character.class]?.name}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          <div style={{ fontSize: "0.78rem", color: accentLt }}>Lv.{curLevel} {lvlInfo.current.title}</div>
          <div style={{ fontSize: "0.68rem", color: fgMuted }}>{xp} XP</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        {["stats", "skills", "shop"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "0.75rem", background: "none", border: "none",
            borderBottom: `2px solid ${tab === t ? accent : "transparent"}`,
            cursor: "pointer", fontSize: "0.78rem", fontWeight: tab === t ? 600 : 400,
            color: tab === t ? accentLt : fgMuted, fontFamily: "inherit", textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "1.25rem 1.5rem", maxWidth: "580px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* ── Stats ── */}
        {tab === "stats" && (
          <div>
            {character.skillPoints > 0 && (
              <div style={{ background: "#2e106530", border: `1px solid ${accent}`, borderRadius: "12px", padding: "0.875rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: accentLt }}>{character.skillPoints} skill point{character.skillPoints !== 1 ? "s" : ""} to spend</div>
                  <div style={{ fontSize: "0.7rem", color: fgMuted }}>Allocate below to grow stronger</div>
                </div>
              </div>
            )}

            {["attack", "defense", "special"].map(stat => (
              <div key={stat} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "0.875rem 1rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.1rem", width: 24, textAlign: "center" }}>{STAT_ICON[stat]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 600, color: STAT_COLOR[stat], textTransform: "capitalize", letterSpacing: "0.06em" }}>{stat}</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: fg }}>
                    {character.stats[stat]}
                    {alloc[stat] > 0 && <span style={{ color: STAT_COLOR[stat], fontSize: "0.85rem" }}> +{alloc[stat]}</span>}
                  </div>
                </div>
                {pending > 0 && (
                  <button onClick={() => setAlloc(a => ({ ...a, [stat]: a[stat] + 1 }))}
                    style={{ background: STAT_COLOR[stat] + "22", border: `1px solid ${STAT_COLOR[stat]}`, borderRadius: "8px", padding: "4px 12px", cursor: "pointer", color: STAT_COLOR[stat], fontSize: "0.85rem", fontFamily: "inherit" }}>
                    +1
                  </button>
                )}
                {alloc[stat] > 0 && (
                  <button onClick={() => setAlloc(a => ({ ...a, [stat]: Math.max(0, a[stat] - 1) }))}
                    style={{ background: "none", border: `1px solid ${border}`, borderRadius: "8px", padding: "4px 10px", cursor: "pointer", color: fgMuted, fontSize: "0.85rem", fontFamily: "inherit" }}>
                    −
                  </button>
                )}
              </div>
            ))}

            <div style={{ fontSize: "0.72rem", color: fgMuted, marginBottom: "1rem", paddingLeft: "0.25rem" }}>
              HP: {character.baseHp + character.stats.defense * 15}
              {alloc.defense > 0 && <span style={{ color: "#3b82f6" }}> → {character.baseHp + totalStats.defense * 15}</span>}
            </div>

            {Object.values(alloc).some(v => v > 0) && (
              <button onClick={applyAlloc} style={{ background: accent, border: "none", borderRadius: "10px", padding: "10px 24px", cursor: "pointer", color: "#fff", fontSize: "0.88rem", fontWeight: 600, fontFamily: "inherit", width: "100%" }}>
                Confirm ({Object.values(alloc).reduce((a, b) => a + b, 0)} points)
              </button>
            )}
          </div>
        )}

        {/* ── Skills ── */}
        {tab === "skills" && (
          <div>
            <div style={{ fontSize: "0.72rem", color: fgMuted, marginBottom: "1rem" }}>Active skill slots — tap to swap</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1.5rem" }}>
              {Array.from({ length: 4 }).map((_, i) => {
                const sid      = character.skills[i];
                const skill    = sid ? SKILL_DEFS[sid] : null;
                const isSwap   = swappingSlot === i;
                const isLocked = i >= slotCount;
                const unlockAt = SLOT_UNLOCK[i];

                if (isLocked) {
                  return (
                    <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "0.875rem", opacity: 0.45, textAlign: "left" }}>
                      <div style={{ fontSize: "0.75rem", color: fgMuted }}>🔒 Locked</div>
                      <div style={{ fontSize: "0.62rem", color: fgMuted, marginTop: "2px" }}>Unlocks Lv.{unlockAt}</div>
                    </div>
                  );
                }

                return (
                  <button key={i} onClick={() => setSwapping(isSwap ? null : i)}
                    style={{ background: isSwap ? "#2e106530" : cardBg, border: `1px solid ${isSwap ? accent : border}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    {skill ? (
                      <>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: fg, marginBottom: "2px" }}>{skill.icon} {skill.name}</div>
                        <div style={{ fontSize: "0.65rem", color: fgMuted }}>{skill.desc}</div>
                      </>
                    ) : <div style={{ fontSize: "0.75rem", color: fgMuted }}>Empty slot</div>}
                  </button>
                );
              })}
            </div>

            {swappingSlot !== null && swappingSlot < slotCount && (
              <div>
                <div style={{ fontSize: "0.72rem", color: fgMuted, marginBottom: "0.75rem" }}>Equip into slot {swappingSlot + 1}:</div>
                {character.unlockedSkills.map(sid => {
                  const skill    = SKILL_DEFS[sid];
                  const equipped = character.skills.includes(sid);
                  return (
                    <button key={sid} onClick={() => equipSkill(sid, swappingSlot)}
                      style={{ background: cardBg, border: `1px solid ${equipped ? accent + "66" : border}`, borderRadius: "10px", padding: "0.75rem 1rem", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: "6px", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: fg }}>{skill.icon} {skill.name}</div>
                        <div style={{ fontSize: "0.65rem", color: fgMuted }}>{skill.desc}</div>
                      </div>
                      {equipped && <span style={{ fontSize: "0.65rem", color: accentLt }}>equipped</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Shop ── */}
        {tab === "shop" && (
          <div>
            <div style={{ fontSize: "0.72rem", color: fgMuted, marginBottom: "1rem" }}>Spend XP to unlock new skills</div>
            {SHOP_SKILLS.map(sid => {
              const skill        = SKILL_DEFS[sid];
              const owned        = character.unlockedSkills.includes(sid);
              const afford       = xp >= (skill.cost || 0);
              const levelReq     = skill.unlockLevel || 5;
              const levelMet     = curLevel >= levelReq;
              const canBuy       = !owned && afford && levelMet;
              return (
                <div key={sid} style={{ background: cardBg, border: `1px solid ${owned ? accent + "44" : border}`, borderRadius: "12px", padding: "0.875rem 1rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "0.75rem", opacity: !owned && !levelMet ? 0.5 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: fg }}>{skill.icon} {skill.name}</div>
                    <div style={{ fontSize: "0.68rem", color: fgMuted }}>{skill.desc}</div>
                    {!owned && !levelMet && (
                      <div style={{ fontSize: "0.62rem", color: "#f59e0b", marginTop: "2px" }}>Requires Lv.{levelReq}</div>
                    )}
                  </div>
                  {owned
                    ? <span style={{ fontSize: "0.7rem", color: accentLt, fontWeight: 600 }}>✓ owned</span>
                    : <button onClick={() => buySkill(sid)} disabled={!canBuy}
                        style={{ background: canBuy ? accent : "transparent", border: `1px solid ${canBuy ? accent : border}`, borderRadius: "8px", padding: "5px 14px", cursor: canBuy ? "pointer" : "not-allowed", color: canBuy ? "#fff" : fgMuted, fontSize: "0.72rem", fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                        {skill.cost} XP
                      </button>
                  }
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
