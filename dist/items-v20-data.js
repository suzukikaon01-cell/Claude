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
,
 // —— 第二批：暴击 ——
 {id:'BLAZE_REPEATER',name:'赤焰连弩',category:'physical',stats:{attack:40,bonusAS:.35,crit:.25},recipe:['C_1043','C_1018','C_1037'],icon:'弩',color:'#ff6a3d',
  passive:'裂焰：普攻暴击时，对目标周围250码内的其他敌人造成该次伤害30%的物理伤害。',params:{splash_radius:250,splash_ratio:.3}},
 {id:'GALE_LONGBOW',name:'疾风长弓',category:'physical',stats:{bonusAS:.4,crit:.25,movePct:.05},recipe:['C_3086','C_1043'],icon:'风',color:'#8fe3ff',
  passive:'乘风：普攻命中敌方英雄获得1层疾风（持续3秒，最多6层），每层+4%攻击速度；满层时移动速度+8%。',params:{max_stacks:6,as_per_stack:.04,duration:3,full_move_pct:.08}},
 {id:'VERDICT_SCIMITAR',name:'断罪弯刀',category:'physical',stats:{attack:60,crit:.25,lifesteal:.08},recipe:['C_1038','C_1053'],icon:'断',color:'#ff4d6d',
  passive:'断罪：对生命低于40%的敌方英雄造成的伤害提高12%。',params:{hp_threshold:.4,bonus_pct:.12}},
 // —— 第二批：法师 ——
 {id:'ASTRAL_ORB',name:'星海宝珠',category:'magic',stats:{ap:90,magicPenFlat:12,abilityHaste:15},recipe:['C_1058','C_3108'],icon:'星',color:'#7d8bff',
  passive:'星痕：技能命中敌方英雄时留下星痕，4秒内你对其造成的技能伤害提高12%。',params:{duration:4,bonus_pct:.12}},
 {id:'FROSTVEIL_DIADEM',name:'寒霜法冠',category:'magic',stats:{ap:85,hp:250,abilityHaste:15},recipe:['C_3145','ruby','C_3108'],icon:'霜',color:'#9fe8ff',
  passive:'寒霜：技能伤害使敌人减速20%，持续1.5秒；你对被寒霜减速的敌方英雄造成的技能伤害提高8%。',params:{slow:.2,slow_duration:1.5,bonus_pct:.08}},
 {id:'PSYCHIC_FONT',name:'灵能泉杖',category:'magic',stats:{ap:70,mana:500,abilityHaste:25},recipe:['C_3802','C_3108'],icon:'泉',color:'#c38bff',
  passive:'灵泉：技能命中敌方英雄时，获得60+15%法术强度的护盾，持续2.5秒（冷却10秒）。',params:{shield_base:60,shield_ap_ratio:.15,shield_duration:2.5,cooldown:10}},
 // —— 第二批：穿甲 ——
 {id:'SHADEFANG',name:'影噬匕',category:'physical',stats:{attack:55,armorPenFlat:20,abilityHaste:10},recipe:['C_3134','C_1037'],icon:'影',color:'#6c5ce7',
  passive:'噬影：技能对生命低于50%的敌方英雄造成伤害时，额外造成40+25%额外攻击力的物理伤害（每个目标15秒一次）。',params:{hp_threshold:.5,damage:40,bonus_ad_ratio:.25,cooldown:15}},
 {id:'DUSKVEIL_BLADE',name:'夜幕之刃',category:'physical',stats:{attack:50,armorPenFlat:15,abilityHaste:15},recipe:['C_3134','C_3133'],icon:'夜',color:'#4b4f7a',
  passive:'夜行：击杀或助攻敌方英雄后2秒内移动速度+25%，且下一次普攻额外造成60物理伤害。',params:{move_pct:.25,duration:2,empower:60}},
 {id:'RENDING_SICKLE',name:'裂甲钩镰',category:'physical',stats:{attack:45,armorPenFlat:15,hp:250},recipe:['C_3134','ruby','sword'],icon:'镰',color:'#d9a441',
  passive:'裂甲：普攻或技能命中敌方英雄时，削减其3点护甲，持续4秒，最多叠加5层（−15护甲）。',params:{armor_per_stack:3,max_stacks:5,duration:4}}
];
const NAMES={lifesteal:'生命偷取',movePct:'移动速度',magicPenFlat:'法术穿透',hp:'生命',attack:'攻击力',ap:'法术强度',mana:'法力',mr:'魔抗',armor:'护甲',abilityHaste:'技能急速',bonusAS:'攻击速度',crit:'暴击率',armorPenFlat:'穿甲'};
for(let d of items){if(C.items.some(i=>i.id===d.id))continue;let statText=Object.entries(d.stats).map(([k,v])=>(NAMES[k]||k)+' +'+(['bonusAS','crit','lifesteal','movePct'].includes(k)?Math.round(v*100)+'%':v)).join(' · ');
 C.items.push({id:d.id,name:d.name,category:d.category,stats:d.stats,passive:d.passive,uniqueGroups:[],icon:d.icon,quality:'传说',sellRatio:.7,statText,desc:statText+'；'+d.passive,cost:3000,recipe:d.recipe,availableModes:['SR','ARAM'],tier:'LEGENDARY',iconUrl:'assets/items/'+d.id+'.png',boots:false,legendary:true,purchaseRestrictions:'NONE',v20:true,
  params:{__description:d.passive,price:3000,combine_cost:0,name:d.name,category:d.category,tier:'LEGENDARY',recipe:JSON.stringify(d.recipe),icon:'assets/items/'+d.id+'.png',builds_into:'[]',sell_ratio:.7,...d.params},...d.stats});
 C.itemParams[d.id]=C.items.at(-1).params;
 for(let part of new Set(d.recipe)){let c=C.items.find(i=>i.id===part);if(c?.params){try{let b=JSON.parse(c.params.builds_into||'[]');if(!b.includes(d.id)){b.push(d.id);c.params.builds_into=JSON.stringify(b)}}catch{}if(Array.isArray(c.buildsInto)&&!c.buildsInto.includes(d.id))c.buildsInto.push(d.id)}}}
C.itemsV20=items.map(d=>({id:d.id,color:d.color,icon:d.icon}));
})();
