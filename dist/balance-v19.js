/* V19 平衡调整（在 Excel 配置快照载入后覆盖，便于单独调整）。
 * （DVA 普攻/Q 的下调直接写在 Excel 工作簿里，保持 Excel 为数值来源。）
 * - 防御塔：30% 护甲穿透。
 * - 大乱斗：防御塔被摧毁后不再生成碎石墙。
 * - 大乱斗：防御塔攻击范围 ×1.75，桥面宽度收窄为防御塔攻击范围的直径，让防御塔覆盖整条路宽。
 */
(()=>{'use strict';const C=window.GAME_CONFIG;if(!C)return;
 C.towerArmorPenPct=.3;
 if(C.aram){C.aram.tower_rubble_enabled=0;C.aram.tower_range_multiplier=1.75;C.aram.bridge_width=2*C.tower.range*C.aram.tower_range_multiplier}
})();
