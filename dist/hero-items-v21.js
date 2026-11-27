/* V21 新增三件通用传说装备（任何英雄可买，属性与被动参照原著，价格 = 基础属性金币价值 + 被动溢价）。效果逻辑在 hero-items-v21-fx.js。
 * 崩山臂铠（砧岳/铁拳）：AD40 生命400 急速15（属性约2870金）+ 被动溢价530 = 3400
 * 防御矩阵核心（D.Va）：生命450 护甲35 魔抗30（属性约2440金）+ 被动溢价560 = 3000
 * 维和者（麦克雷）：AD55 暴击25% + 被动溢价 = 3500
 * 纳米激素枪（安娜）：AP70 治疗护盾强度12% 急速15（属性约2520金）+ 被动溢价580 = 3100 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
const DEFS=[
 {id:'SEISMIC_GAUNTLET',name:'崩山臂铠',category:'physical',stats:{attack:50,hp:450,abilityHaste:20},recipe:['C_2021','C_3133','C_1011'],icon:'拳',color:'#ffb347',cost:3400,
  statText:'攻击力 +50 · 生命 +450 · 技能急速 +20',
  passive:'最佳防守：技能对敌方英雄造成伤害时，每名英雄提供 40+3%最大生命 的护盾（单次施法最多3名，护盾上限20%最大生命，持续3秒）。火箭重拳：位移技能后3秒内，下一次普攻额外造成 50+4%最大生命 物理伤害（冷却6秒）。',
  params:{shield_base:40,shield_hp_pct:.03,shield_targets:3,shield_cap_pct:.2,shield_duration:3,punch_window:3,punch_base:50,punch_hp_pct:.04,punch_cd:6}},
 {id:'DEFENSE_MATRIX',name:'防御矩阵核心',category:'defense',stats:{hp:550,armor:45,mr:40},recipe:['C_1011','C_1031','C_1057'],icon:'矩',color:'#ff7ac8',cost:3000,
  statText:'生命 +550 · 护甲 +45 · 魔抗 +40',
  passive:'防御矩阵：受到的飞行道具伤害降低20%。紧急弹射：生命值低于30%时获得 25%最大生命 的护盾，持续3秒（冷却60秒）。',
  params:{projectile_reduction:.2,eject_threshold:.3,eject_shield_pct:.25,eject_duration:3,eject_cd:60}},
 {id:'PEACEKEEPER',name:'维和者',category:'physical',stats:{attack:65,crit:.25,armorPenFlat:12},recipe:['C_1038','C_6670'],icon:'维',color:'#c9643c',cost:3500,
  statText:'攻击力 +65 · 暴击 +25% · 穿甲 +12',
  passive:'神枪手：每第6次普攻额外造成 70+80%额外AD 物理伤害（可暴击）。决斗者：暴击命中敌方英雄后1.5秒内移动速度+15%。',
  params:{every:6,bonus_base:70,bonus_ad_ratio:.8,crit_ms:.15,crit_ms_duration:1.5}},
 {id:'CHRONO_PISTOLS',name:'时空脉冲枪',category:'physical',stats:{attack:50,bonusAS:.45,crit:.25,movePct:.08},recipe:['C_3086','C_1037'],icon:'脉',color:'#5ec8ff',cost:3200,
  statText:'攻击力 +50 · 攻速 +45% · 暴击 +25% · 移速 +8%',
  passive:'时空跃迁：使用位移或闪现技能后3秒内，普攻伤害提高25%（按百分比生效，连射的每一发子弹都享受加成）。',
  params:{window:3,basic_amp:.25}},
 {id:'NANO_RIFLE',name:'纳米激素枪',category:'magic',stats:{ap:90,healShieldPower:.15,abilityHaste:20},recipe:['C_3108','C_3114','C_1026'],icon:'激',color:'#7fd6ff',cost:3100,
  statText:'法术强度 +90 · 治疗与护盾强度 +15% · 技能急速 +20',
  passive:'生物手雷：技能对敌方英雄造成伤害时施加40%重伤，持续2.5秒。纳米激素：治疗或护盾友方英雄时，使其获得25%移动速度，持续2秒（每名目标冷却6秒）。',
  params:{grievous:.4,grievous_duration:2.5,boost_ms:.25,boost_duration:2,boost_cd:6}}];
C.itemParams??={};
for(let d of DEFS){if(C.items.some(i=>i.id===d.id))continue;
 C.items.push({id:d.id,name:d.name,category:d.category,stats:d.stats,passive:d.passive,uniqueGroups:[],icon:d.icon,quality:'传说',sellRatio:.7,statText:d.statText,desc:d.statText+'；'+d.passive,cost:d.cost,recipe:d.recipe,components:[...d.recipe],buildsInto:[],availableModes:['SR','ARAM'],tier:'LEGENDARY',iconUrl:'assets/items/'+d.id+'.png',boots:false,legendary:true,purchaseRestrictions:'NONE',v20:true,
  params:{__description:d.passive,price:d.cost,combine_cost:0,name:d.name,category:d.category,tier:'LEGENDARY',recipe:JSON.stringify(d.recipe),icon:'assets/items/'+d.id+'.png',builds_into:'[]',sell_ratio:.7,...d.params},...d.stats});
 C.itemParams[d.id]=C.items.at(-1).params;
 for(let part of new Set(d.recipe)){let c=C.items.find(i=>i.id===part);if(c?.params){try{let b=JSON.parse(c.params.builds_into||'[]');if(!b.includes(d.id)){b.push(d.id);c.params.builds_into=JSON.stringify(b)}}catch{}if(Array.isArray(c.buildsInto)&&!c.buildsInto.includes(d.id))c.buildsInto.push(d.id)}}
 (C.itemsV20??=[]).push({id:d.id,color:d.color,icon:d.icon})}
window.HERO_ITEMS_V21={anvil:'SEISMIC_GAUNTLET',dva:'DEFENSE_MATRIX',ana:'NANO_RIFLE',cassidy:'PEACEKEEPER',tracer:'CHRONO_PISTOLS'};
})();
