/* V21 极地大乱斗英雄平衡（只在大乱斗生效，通过 GameModes.balance 读取 heroParams[hero].ARAM）。
 * 规则：远程英雄 = 造成伤害降低 / 受到伤害提高；近战英雄 = 造成伤害提高 / 受到伤害降低。每个英雄都有。
 * 数值来源：32 局随机阵容的 5v5 大乱斗 AI 对局模拟（每局 240 秒），强度 = (队内伤害占比 + 胜率×2)/2，1.0 为平均。
 *   远程：削弱幅度 = 3% + (强度-0.85)×15%（上限 15%），受到伤害提高 = 削弱幅度×0.6
 *   近战：加强幅度 = 3% + (1.10-强度)×15%（上限 12%），受到伤害降低 = 加强幅度×0.6 */
window.ARAM_HERO_BALANCE={
 zarya:{type:'ranged',damage_dealt_multiplier:0.85,damage_taken_multiplier:1.09},  // 强度 1.66（15 场样本）
 dva:{type:'ranged',damage_dealt_multiplier:0.9,damage_taken_multiplier:1.06},  // 强度 1.29（20 场样本）
 dio:{type:'melee',damage_dealt_multiplier:1.03,damage_taken_multiplier:0.98},  // 强度 1.28（12 场样本）
 anvil:{type:'melee',damage_dealt_multiplier:1.03,damage_taken_multiplier:0.98},  // 强度 1.28（12 场样本）
 darius:{type:'melee',damage_dealt_multiplier:1.03,damage_taken_multiplier:0.98},  // 强度 1.15（21 场样本）
 sett:{type:'melee',damage_dealt_multiplier:1.03,damage_taken_multiplier:0.98},  // 强度 1.12（16 场样本）
 illaoi:{type:'melee',damage_dealt_multiplier:1.03,damage_taken_multiplier:0.98},  // 强度 1.08（11 场样本）
 khazix:{type:'melee',damage_dealt_multiplier:1.03,damage_taken_multiplier:0.98},  // 强度 1.07（21 场样本）
 great_sword:{type:'melee',damage_dealt_multiplier:1.04,damage_taken_multiplier:0.97},  // 强度 1.02（17 场样本）
 claude:{type:'ranged',damage_dealt_multiplier:0.95,damage_taken_multiplier:1.03},  // 强度 0.97（18 场样本）
 xuefeng:{type:'melee',damage_dealt_multiplier:1.05,damage_taken_multiplier:0.97},  // 强度 0.96（13 场样本）
 zero:{type:'ranged',damage_dealt_multiplier:0.96,damage_taken_multiplier:1.03},  // 强度 0.94（21 场样本）
 yasuo:{type:'melee',damage_dealt_multiplier:1.06,damage_taken_multiplier:0.96},  // 强度 0.9（19 场样本）
 garen:{type:'melee',damage_dealt_multiplier:1.07,damage_taken_multiplier:0.96},  // 强度 0.85（10 场样本）
 longsword_hunter:{type:'melee',damage_dealt_multiplier:1.07,damage_taken_multiplier:0.96},  // 强度 0.82（15 场样本）
 genji:{type:'ranged',damage_dealt_multiplier:0.97,damage_taken_multiplier:1.02},  // 强度 0.81（12 场样本）
 masteryi:{type:'melee',damage_dealt_multiplier:1.08,damage_taken_multiplier:0.95},  // 强度 0.8（18 场样本）
 lux:{type:'ranged',damage_dealt_multiplier:0.97,damage_taken_multiplier:1.02},  // 强度 0.77（10 场样本）
 ashe:{type:'ranged',damage_dealt_multiplier:0.97,damage_taken_multiplier:1.02},  // 强度 0.76（13 场样本）
 ana:{type:'ranged',damage_dealt_multiplier:0.97,damage_taken_multiplier:1.02},  // 强度 0.67（14 场样本）
 herrscher_of_the_void:{type:'ranged',damage_dealt_multiplier:0.97,damage_taken_multiplier:1.02}  // 强度 0.51（12 场样本）
};
(function(){let C=window.GAME_CONFIG,T=window.ARAM_HERO_BALANCE;if(!C)return;for(let [id,b] of Object.entries(T)){if(!C.heroes?.[id])continue;let P=C.heroParams[id]??={};let A=P.ARAM??={damage_dealt_multiplier:1,damage_taken_multiplier:1,healing_multiplier:1,shield_multiplier:1,energy_regen_modifier:1,ability_haste_modifier:0,tenacity_modifier:0};A.damage_dealt_multiplier=b.damage_dealt_multiplier;A.damage_taken_multiplier=b.damage_taken_multiplier;A.v21Type=b.type}})();
