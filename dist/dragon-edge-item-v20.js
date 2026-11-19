/* V20 通用装备「神龙之刃」数据（任何英雄可用，属性贴合源氏这类远程物理刺客）。效果逻辑在 dragon-edge-v20.js。
 * 龙刃：用技能位移后 4 秒内，接下来 3 次普攻命中额外造成 30+30%额外AD 物理伤害。
 * 龙魂：参与击杀英雄时，基础技能（非终极技能）当前冷却减少 20%。 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
const ITEM='DRAGON_EDGE';
if(!C.items.some(i=>i.id===ITEM)){C.itemParams??={};
 let d={id:ITEM,name:'神龙之刃',category:'physical',stats:{attack:45,bonusAS:.25,crit:.2,movePct:.04},recipe:['C_1037','C_3086'],icon:'龙',color:'#5fe0a0',
  passive:'龙刃：用技能位移后4秒内，接下来3次普攻命中额外造成30+30%额外AD物理伤害。龙魂：参与击杀英雄时，基础技能（非终极技能）当前冷却减少20%。',
  params:{charges:3,window:4,bonus_base:30,bonus_ad_ratio:.3,takedown_cd_pct:.2}};
 let statText='攻击力 +45 · 攻速 +25% · 暴击 +20% · 移速 +4%';
 C.items.push({id:d.id,name:d.name,category:d.category,stats:d.stats,passive:d.passive,uniqueGroups:[],icon:d.icon,quality:'传说',sellRatio:.7,statText,desc:statText+'；'+d.passive,cost:3000,recipe:d.recipe,components:[...d.recipe],buildsInto:[],availableModes:['SR','ARAM'],tier:'LEGENDARY',iconUrl:'assets/items/'+d.id+'.png',boots:false,legendary:true,purchaseRestrictions:'NONE',v20:true,
  params:{__description:d.passive,price:3000,combine_cost:0,name:d.name,category:d.category,tier:'LEGENDARY',recipe:JSON.stringify(d.recipe),icon:'assets/items/'+d.id+'.png',builds_into:'[]',sell_ratio:.7,...d.params},...d.stats});
 C.itemParams[ITEM]=C.items.at(-1).params;
 for(let part of new Set(d.recipe)){let c=C.items.find(i=>i.id===part);if(c?.params){try{let b=JSON.parse(c.params.builds_into||'[]');if(!b.includes(ITEM)){b.push(ITEM);c.params.builds_into=JSON.stringify(b)}}catch{}if(Array.isArray(c.buildsInto)&&!c.buildsInto.includes(ITEM))c.buildsInto.push(ITEM)}}
 (C.itemsV20??=[]).push({id:ITEM,color:d.color,icon:d.icon});
}
})();
