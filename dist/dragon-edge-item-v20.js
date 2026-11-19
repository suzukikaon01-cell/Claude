/* V20 通用装备「神龙之刃」数据（任何英雄可用，参照源氏原著的拔刀/影/斩/龙刃设计）。效果逻辑在 dragon-edge-v20.js。
 * 拔刀疾斩：技能位移后 4 秒内，接下来 3 次普攻额外造成 35+35%额外AD 物理伤害。
 * 龙神之剑：施放终极技能后 8 秒内攻击力 +15%（原著：龙刃出鞘 8 秒）。 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
const ITEM='DRAGON_EDGE';
if(!C.items.some(i=>i.id===ITEM)){C.itemParams??={};
 let d={id:ITEM,name:'神龙之刃',category:'physical',stats:{attack:65,crit:.25,armorPenFlat:10,movePct:.05},recipe:['C_1038','C_1018','C_3134'],icon:'龙',color:'#5fe0a0',
  passive:'拔刀疾斩：技能位移后4秒内，接下来3次普攻额外造成35+35%额外AD物理伤害。龙神之剑：施放终极技能后8秒内攻击力+15%。',
  params:{charges:3,window:4,bonus_base:35,bonus_ad_ratio:.35,awaken_duration:8,awaken_ad_pct:.15}};
 let statText='攻击力 +65 · 暴击 +25% · 穿甲 +10 · 移速 +5%';
 C.items.push({id:d.id,name:d.name,category:d.category,stats:d.stats,passive:d.passive,uniqueGroups:[],icon:d.icon,quality:'传说',sellRatio:.7,statText,desc:statText+'；'+d.passive,cost:3700,recipe:d.recipe,components:[...d.recipe],buildsInto:[],availableModes:['SR','ARAM'],tier:'LEGENDARY',iconUrl:'assets/items/'+d.id+'.png',boots:false,legendary:true,purchaseRestrictions:'NONE',v20:true,
  params:{__description:d.passive,price:3700,combine_cost:0,name:d.name,category:d.category,tier:'LEGENDARY',recipe:JSON.stringify(d.recipe),icon:'assets/items/'+d.id+'.png',builds_into:'[]',sell_ratio:.7,...d.params},...d.stats});
 C.itemParams[ITEM]=C.items.at(-1).params;
 for(let part of new Set(d.recipe)){let c=C.items.find(i=>i.id===part);if(c?.params){try{let b=JSON.parse(c.params.builds_into||'[]');if(!b.includes(ITEM)){b.push(ITEM);c.params.builds_into=JSON.stringify(b)}}catch{}if(Array.isArray(c.buildsInto)&&!c.buildsInto.includes(ITEM))c.buildsInto.push(ITEM)}}
 (C.itemsV20??=[]).push({id:ITEM,color:d.color,icon:d.icon});
}
})();
