/* V20 通用装备「长思之卷」数据（任何英雄可用）。效果逻辑在 claude-v20.js。 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
const ITEM='LONG_THOUGHT_CODEX';
if(C.items&&!C.items.some(i=>i.id===ITEM)){C.itemParams??={};
 let d={id:ITEM,name:'长思之卷',category:'magic',stats:{ap:75,mana:300,abilityHaste:20},recipe:['C_1026','tome'],icon:'思',color:'#e8a26a',
  passive:'思维链：每次施放技能获得一层思路（持续6秒，最多3层）。达到3层时，下一次技能伤害+15%，并返还该技能20%的剩余冷却。',
  params:{stack_max:3,stack_duration:6,damage_bonus:.15,refund_pct:.2,ready_window:6}};
 let statText='法术强度 +75 · 法力 +300 · 技能急速 +20';
 C.items.push({id:d.id,name:d.name,category:d.category,stats:d.stats,passive:d.passive,uniqueGroups:[],icon:d.icon,quality:'传说',sellRatio:.7,statText,desc:statText+'；'+d.passive,cost:3000,recipe:d.recipe,components:[...d.recipe],buildsInto:[],availableModes:['SR','ARAM'],tier:'LEGENDARY',iconUrl:'assets/items/'+d.id+'.png',boots:false,legendary:true,purchaseRestrictions:'NONE',v20:true,
  params:{__description:d.passive,price:3000,combine_cost:0,name:d.name,category:d.category,tier:'LEGENDARY',recipe:JSON.stringify(d.recipe),icon:'assets/items/'+d.id+'.png',builds_into:'[]',sell_ratio:.7,...d.params},...d.stats});
 C.itemParams[ITEM]=C.items.at(-1).params;
 for(let part of new Set(d.recipe)){let c=C.items.find(i=>i.id===part);if(c?.params){try{let b=JSON.parse(c.params.builds_into||'[]');if(!b.includes(ITEM)){b.push(ITEM);c.params.builds_into=JSON.stringify(b)}}catch{}if(Array.isArray(c.buildsInto)&&!c.buildsInto.includes(ITEM))c.buildsInto.push(ITEM)}}
 (C.itemsV20??=[]).push({id:ITEM,color:d.color,icon:d.icon});
}
})();
