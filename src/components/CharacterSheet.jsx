import { useState } from "react";
import { CLASSES, SKILL_DEFS, SHOP_SKILLS, getLevelInfo, getSkillSlots, ITEMS, RARITY_COLOR, RARITY_LABEL, getEquipmentBonus } from "../data/gameData.js";

export default function CharacterSheet({ character, xp, onUpdate, onClose, dark, initialTab = "stats", inventory = [], equipped = {}, gold = 0, onEquip }) {
  const [tab, setTab]               = useState(initialTab);
  const [alloc, setAlloc]           = useState({ attack: 0, defense: 0, special: 0, hp: 0 });
  const [swappingSlot, setSwapping] = useState(null);
  const [equipFilter, setEFilter]   = useState("all"); // "all" | "weapon" | "armor" | "amulet" | "potion"

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
  const equipBonus  = getEquipmentBonus(equipped);
  const totalStats  = {
    attack:  character.stats.attack  + (alloc.attack  || 0),
    defense: character.stats.defense + (alloc.defense || 0),
    special: character.stats.special + (alloc.special || 0),
    hp:     (character.stats.hp || 0) + (alloc.hp     || 0),
  };

  const applyAlloc = () => {
    onUpdate({ ...character, stats: totalStats, skillPoints: pending });
    setAlloc({ attack: 0, defense: 0, special: 0, hp: 0 });
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

  const STAT_COLOR = { attack: "#ef4444", defense: "#3b82f6", special: "#a855f7", hp: "#22c55e" };
  const STAT_ICON  = { attack: "⚔️", defense: "🛡️", special: "✨", hp: "❤️" };
  const SLOT_UNLOCK = [1, 5, 8, 10];

  const EQUIP_SLOTS = [
    { key: "weapon", label: "Weapon",  icon: "⚔️" },
    { key: "armor",  label: "Armor",   icon: "🛡️" },
    { key: "amulet", label: "Amulet",  icon: "📿" },
  ];

  // Inventory filtered and sorted
  const filteredInventory = inventory
    .filter(i => {
      const item = ITEMS[i.itemId];
      if (!item) return false;
      if (equipFilter === "all") return true;
      return item.type === equipFilter;
    })
    .sort((a, b) => {
      const ra = ['common','uncommon','rare','very_rare','ultra_rare'].indexOf(ITEMS[a.itemId]?.rarity);
      const rb = ['common','uncommon','rare','very_rare','ultra_rare'].indexOf(ITEMS[b.itemId]?.rarity);
      return rb - ra;
    });

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
          <div style={{ fontSize: "0.68rem", color: fgMuted, display: "flex", gap: "8px" }}>
            <span>{xp} XP</span>
            {gold > 0 && <span style={{ color: "#fbbf24" }}>🪙 {gold.toLocaleString()} gp</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        {["stats", "skills", "inventory", "shop"].map(t => (
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

            {["attack", "defense", "special", "hp"].map(stat => {
              const bonus = equipBonus[stat] || 0;
              return (
                <div key={stat} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "0.875rem 1rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.1rem", width: 24, textAlign: "center" }}>{STAT_ICON[stat]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, color: STAT_COLOR[stat], textTransform: "capitalize", letterSpacing: "0.06em" }}>{stat}</div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 700, color: fg, display: "flex", alignItems: "baseline", gap: "4px" }}>
                      {character.stats[stat]}
                      {alloc[stat] > 0 && <span style={{ color: STAT_COLOR[stat], fontSize: "0.85rem" }}> +{alloc[stat]}</span>}
                      {bonus > 0 && <span style={{ color: "#fbbf24", fontSize: "0.75rem", fontWeight: 600 }}> +{bonus} 🪙</span>}
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
              );
            })}

            {(() => {
              const curHp  = character.baseHp + (character.stats.hp || 0) * 15 + character.stats.defense * 5;
              const nextHp = character.baseHp + totalStats.hp * 15 + totalStats.defense * 5;
              const hpBonus = equipBonus.hp * 15 + equipBonus.defense * 5;
              return (
                <div style={{ fontSize: "0.72rem", color: fgMuted, marginBottom: "1rem", paddingLeft: "0.25rem" }}>
                  HP: {curHp}{hpBonus > 0 && <span style={{ color: "#fbbf24" }}> +{hpBonus} (gear)</span>}
                  {nextHp !== curHp && <span style={{ color: "#22c55e" }}> → {nextHp}</span>}
                </div>
              );
            })()}

            {/* Equipment slots */}
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: fgMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem", marginTop: "0.5rem" }}>Equipment</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" }}>
              {EQUIP_SLOTS.map(({ key, label, icon }) => {
                const equippedId = equipped[key];
                const item = equippedId ? ITEMS[equippedId] : null;
                return (
                  <div key={key} style={{ background: cardBg, border: `1px solid ${item ? RARITY_COLOR[item.rarity] + "66" : border}`, borderRadius: "10px", padding: "0.625rem 0.875rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1rem", width: 22, textAlign: "center" }}>{item ? item.icon : icon}</span>
                    <div style={{ flex: 1 }}>
                      {item ? (
                        <>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: RARITY_COLOR[item.rarity] }}>{item.name}</div>
                          <div style={{ fontSize: "0.62rem", color: fgMuted }}>{item.desc}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: "0.78rem", color: fgMuted }}>{label} — empty</div>
                      )}
                    </div>
                    {item && (
                      <button onClick={() => onEquip?.(null, key)}
                        style={{ background: "none", border: `1px solid ${border}`, borderRadius: "6px", padding: "3px 8px", cursor: "pointer", fontSize: "0.62rem", color: fgMuted, fontFamily: "inherit" }}>
                        remove
                      </button>
                    )}
                    {!item && (
                      <button onClick={() => setTab("inventory")}
                        style={{ background: "none", border: `1px solid ${border}`, borderRadius: "6px", padding: "3px 8px", cursor: "pointer", fontSize: "0.62rem", color: fgMuted, fontFamily: "inherit" }}>
                        equip
                      </button>
                    )}
                  </div>
                );
              })}
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
                  const equipped2 = character.skills.includes(sid);
                  return (
                    <button key={sid} onClick={() => equipSkill(sid, swappingSlot)}
                      style={{ background: cardBg, border: `1px solid ${equipped2 ? accent + "66" : border}`, borderRadius: "10px", padding: "0.75rem 1rem", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: "6px", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: fg }}>{skill.icon} {skill.name}</div>
                        <div style={{ fontSize: "0.65rem", color: fgMuted }}>{skill.desc}</div>
                      </div>
                      {equipped2 && <span style={{ fontSize: "0.65rem", color: accentLt }}>equipped</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Inventory ── */}
        {tab === "inventory" && (
          <div>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "1rem", flexWrap: "wrap" }}>
              {["all", "weapon", "armor", "amulet", "potion"].map(f => (
                <button key={f} onClick={() => setEFilter(f)}
                  style={{ background: equipFilter === f ? accent + "22" : "transparent", border: `1px solid ${equipFilter === f ? accent : border}`, borderRadius: "8px", padding: "3px 10px", cursor: "pointer", fontSize: "0.7rem", color: equipFilter === f ? accentLt : fgMuted, fontFamily: "inherit", textTransform: "capitalize" }}>
                  {f}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: fgMuted, display: "flex", alignItems: "center" }}>
                {inventory.reduce((s, i) => s + i.qty, 0)} items
              </span>
            </div>

            {filteredInventory.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 0", color: fgMuted }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎒</div>
                <div style={{ fontSize: "0.82rem" }}>{inventory.length === 0 ? "No items yet — defeat a dungeon boss to earn loot." : "No items in this category."}</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {filteredInventory.map(({ itemId, qty }) => {
                const item = ITEMS[itemId];
                if (!item) return null;
                const color       = RARITY_COLOR[item.rarity] || '#c8c8c8';
                const isEquipped  = Object.values(equipped).includes(itemId);
                const canEquip    = ['weapon','armor','amulet'].includes(item.type);
                const slotForType = item.type; // weapon → equipped.weapon, etc.

                return (
                  <div key={itemId} style={{ background: cardBg, border: `1px solid ${isEquipped ? color + "88" : border}`, borderRadius: "12px", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color, display: "flex", alignItems: "center", gap: "6px" }}>
                        {item.name}
                        {isEquipped && <span style={{ fontSize: "0.6rem", background: color + "22", border: `1px solid ${color}44`, borderRadius: "4px", padding: "1px 5px", color }}>equipped</span>}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: fgMuted, marginTop: "1px" }}>
                        {RARITY_LABEL[item.rarity]} · {item.desc}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      {qty > 1 && <span style={{ fontSize: "0.72rem", color: fgMuted }}>×{qty}</span>}
                      {canEquip && !isEquipped && (
                        <button onClick={() => onEquip?.(itemId, slotForType)}
                          style={{ background: accent, border: "none", borderRadius: "7px", padding: "4px 12px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, color: "#fff", fontFamily: "inherit" }}>
                          Equip
                        </button>
                      )}
                      {canEquip && isEquipped && (
                        <button onClick={() => onEquip?.(null, slotForType)}
                          style={{ background: "none", border: `1px solid ${border}`, borderRadius: "7px", padding: "4px 10px", cursor: "pointer", fontSize: "0.7rem", color: fgMuted, fontFamily: "inherit" }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
