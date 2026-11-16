/* V20 通用装备「多模态棱镜」数据（任何英雄可用）。效果逻辑在 claude-v20.js。
 * 变奏：施放与上一次不同的技能获得一层变奏（最多4层，持续8秒），每层技能伤害+3%。
 * 谐振：4层时技能命中敌方英雄会额外造成 40+12%AP+20%额外AD 魔法伤害，并清空层数。 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
const ITEM='MULTIMODAL_PRISM';
if(!C.items.some(i=>i.id===ITEM)){C.itemParams??={};
 let d={id:ITEM,name:'多模态棱镜',category:'magic',stats:{attack:30,ap:60,abilityHaste:15},recipe:['sword','C_1026','tome'],icon:'棱',color:'#9fe8ff',
  passive:'变奏：施放与上一次不同的技能获得一层变奏（最多4层，持续8秒），每层技能伤害+3%。谐振：变奏达到4层时，技能命中敌方英雄额外造成40+12%AP+20%额外AD魔法伤害，并清空变奏。',
  params:{stack_max:4,stack_duration:8,damage_per_stack:.03,resonance_base:40,resonance_ap:.12,resonance_bonus_ad:.2}};
 let statText='攻击力 +30 · 法术强度 +60 · 技能急速 +15';
 C.items.push({id:d.id,name:d.name,category:d.category,stats:d.stats,passive:d.passive,uniqueGroups:[],icon:d.icon,quality:'传说',sellRatio:.7,statText,desc:statText+'；'+d.passive,cost:3000,recipe:d.recipe,components:[...d.recipe],buildsInto:[],availableModes:['SR','ARAM'],tier:'LEGENDARY',iconUrl:'assets/items/'+d.id+'.png',boots:false,legendary:true,purchaseRestrictions:'NONE',v20:true,
  params:{__description:d.passive,price:3000,combine_cost:0,name:d.name,category:d.category,tier:'LEGENDARY',recipe:JSON.stringify(d.recipe),icon:'assets/items/'+d.id+'.png',builds_into:'[]',sell_ratio:.7,...d.params},...d.stats});
 C.itemParams[ITEM]=C.items.at(-1).params;
 for(let part of new Set(d.recipe)){let c=C.items.find(i=>i.id===part);if(c?.params){try{let b=JSON.parse(c.params.builds_into||'[]');if(!b.includes(ITEM)){b.push(ITEM);c.params.builds_into=JSON.stringify(b)}}catch{}if(Array.isArray(c.buildsInto)&&!c.buildsInto.includes(ITEM))c.buildsInto.push(ITEM)}}
 (C.itemsV20??=[]).push({id:ITEM,color:d.color,icon:d.icon});
}
})();
