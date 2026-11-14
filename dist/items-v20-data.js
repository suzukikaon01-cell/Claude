/* V20 原创装备第一批（数据）：名称、属性、合成与被动参数。价格由 items-price-v19.js 按“属性 + 被动价值”统一计算。
 * 效果逻辑见 items-v20.js。 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;C.itemParams??={};
const items=[
 {id:'SOVEREIGN_CROWN',name:'霸业王冠',category:'physical',stats:{hp:300,attack:20,ap:30},recipe:['ruby','sword','C_1026'],icon:'冠',color:'#c9a24f',
  passive:'霸业：生命、护甲、魔抗、攻击力、法术强度、攻击速度和技能急速提高12%。获得此装备后，每次参与击杀英雄再+2%（最多+10%），每次阵亡−3%（最低0%）。',
  params:{base_pct:.12,takedown_pct:.02,takedown_max:5,death_pct:.03}},
 {id:'STARFALL_VERDICT',name:'星陨裁决',category:'physical',stats:{attack:50,crit:.25},recipe:['C_1038','C_1018'],icon:'陨',color:'#ffd15a',
  passive:'星陨：每次暴击额外造成随机的暴击伤害，最多为你暴击率的50%（例如50%暴击率时最多+25%暴击伤害）。',
  params:{max_ratio_of_crit:.5}},
 {id:'THUNDER_RING_BLADE',name:'雷鸣环刃',category:'physical',stats:{attack:55,armorPenFlat:10,abilityHaste:10},recipe:['sword','C_3134'],icon:'雷',color:'#7fc8ff',
  passive:'充能：技能对敌方英雄造成伤害时充能（冷却8秒）。蓄雷：充能后的下一次普攻额外造成目标当前生命6%的物理伤害，并在4秒内获得10穿甲。',
  params:{current_hp_pct:.06,lethality:10,lethality_duration:4,cooldown:8}},
 {id:'TIDEBREAK_ARC',name:'潮汐断弧',category:'physical',stats:{attack:55,armorPenFlat:18,abilityHaste:20},recipe:['C_3133','C_3134'],icon:'潮',color:'#4fd1c5',
  passive:'回潮：你在3秒内伤害过的敌方英雄阵亡时，返还终极技能15%的总冷却时间。',
  params:{window:3,refund_pct:.15}},
 {id:'SIEGE_HORN',name:'攻城号角',category:'physical',stats:{attack:55,armorPenFlat:18,abilityHaste:15},recipe:['C_3134','C_1037'],icon:'号',color:'#ff9f43',
  passive:'震爆：技能对敌方英雄或史诗野怪造成伤害时，额外造成20真实伤害（每次施法每个目标一次）。破城：击杀或助攻敌方英雄后8秒内，下一次攻击防御塔或史诗野怪会在3秒内额外造成150真实伤害。',
  params:{ability_true:20,sabotage_window:8,sabotage_true:150,sabotage_duration:3}},
 {id:'HERETIC_HYDRA',name:'噬罪双头蛇',category:'physical',stats:{attack:55,armorPenFlat:18,abilityHaste:10},recipe:['C_3077','C_3134'],icon:'噬',color:'#9be15d',
  passive:'噬咬：普攻命中时，对目标周围300码内的其他敌人造成40%攻击力的物理伤害。',
  params:{cleave_radius:300,cleave_ad_ratio:.4}},
 {id:'EMBER_LANTERN',name:'黑焰灯',category:'magic',stats:{ap:80,mana:600,abilityHaste:20},recipe:['C_2508','C_3802'],icon:'焰',color:'#a26bff',
  passive:'黑焰：技能伤害使敌人燃烧3秒，共造成30+8%法术强度的魔法伤害。焰心：每有一名敌方英雄或史诗野怪处于你的黑焰中，法术强度提高4%。',
  params:{burn_base:30,burn_ap_ratio:.08,burn_duration:3,ap_pct_per_target:.04}},
 {id:'SURGE_CODEX',name:'涌泉法典',category:'magic',stats:{ap:90,abilityHaste:15},recipe:['C_3145','C_3108'],icon:'涌',color:'#5aa9ff',
  passive:'涌泉：6秒内用3次不同的技能施放命中同一名敌方英雄时，额外造成60+20%法术强度的魔法伤害（冷却6秒）。',
  params:{window:6,hits:3,damage:60,ap_ratio:.2,cooldown:6}},
 {id:'RECOIL_PLATE',name:'反震铁甲',category:'defense',stats:{hp:400,mr:45},recipe:['C_1011','C_1057'],icon:'震',color:'#8fa3b8',
  passive:'反震：3秒内受到敌方英雄的伤害累计达到300时，获得10%最大生命的护盾，持续3秒（冷却20秒）。',
  params:{window:3,threshold:300,shield_maxhp_pct:.1,shield_duration:3,cooldown:20}}
];
const NAMES={hp:'生命',attack:'攻击力',ap:'法术强度',mana:'法力',mr:'魔抗',armor:'护甲',abilityHaste:'技能急速',bonusAS:'攻击速度',crit:'暴击率',armorPenFlat:'穿甲'};
for(let d of items){if(C.items.some(i=>i.id===d.id))continue;let statText=Object.entries(d.stats).map(([k,v])=>(NAMES[k]||k)+' +'+(['bonusAS','crit'].includes(k)?Math.round(v*100)+'%':v)).join(' · ');
 C.items.push({id:d.id,name:d.name,category:d.category,stats:d.stats,passive:d.passive,uniqueGroups:[],icon:d.icon,quality:'传说',sellRatio:.7,statText,desc:statText+'；'+d.passive,cost:3000,recipe:d.recipe,availableModes:['SR','ARAM'],tier:'LEGENDARY',iconUrl:'assets/items/'+d.id+'.png',boots:false,legendary:true,purchaseRestrictions:'NONE',v20:true,
  params:{__description:d.passive,price:3000,combine_cost:0,name:d.name,category:d.category,tier:'LEGENDARY',recipe:JSON.stringify(d.recipe),icon:'assets/items/'+d.id+'.png',builds_into:'[]',sell_ratio:.7,...d.params},...d.stats});
 C.itemParams[d.id]=C.items.at(-1).params;
 for(let part of new Set(d.recipe)){let c=C.items.find(i=>i.id===part);if(c?.params){try{let b=JSON.parse(c.params.builds_into||'[]');if(!b.includes(d.id)){b.push(d.id);c.params.builds_into=JSON.stringify(b)}}catch{}if(Array.isArray(c.buildsInto)&&!c.buildsInto.includes(d.id))c.buildsInto.push(d.id)}}}
C.itemsV20=items.map(d=>({id:d.id,color:d.color,icon:d.icon}));
})();
