/* V19 平衡调整（在 Excel 配置快照载入后覆盖，便于单独调整）。
 * （DVA 普攻/Q 的下调直接写在 Excel 工作簿里，保持 Excel 为数值来源。）
 * - 防御塔：30% 护甲穿透。
 * - 大乱斗：防御塔被摧毁后不再生成碎石墙。
 * - 小兵：只受到防御塔/水晶伤害的30%（唯一来源，不与旧的塔普攻减半叠加）。
 * - 大乱斗：防御塔攻击范围 ×1.75×0.65（再缩小35%），桥面宽度=防御塔攻击范围的直径；桥上的草丛/遗迹/传送门/内塔按比例向中线收拢。
 */
(()=>{'use strict';const C=window.GAME_CONFIG;if(!C)return;
 C.towerArmorPenPct=.3;
 // V19 原创装备（效果见 items-v19.js）：
 //  山岳巨颚：普攻附带1.5%最大生命物理伤害，并溅射目标身后扇形范围；熔铸心甲：额外生命的2.5%转为攻击力，低于50%生命时按已损失生命再获得最多10%攻击力。
 const newItems=[
  {id:'GIANT_MAW',name:'山岳巨颚',category:'physical',stats:{hp:550,attack:40},cost:3300,recipe:['C_1011','C_3044'],combine:1300,uniqueGroups:['giant_maw'],icon:'颚',
   passive:'普攻附带1.5%自身最大生命的额外物理伤害，并对目标身后350码、90°扇形内的其他敌人造成同等伤害（远程英雄60%）。',
   params:{hit_maxhp_pct:.015,cleave_range:350,cleave_degrees:90,ranged_ratio:.6}},
  {id:'FORGED_HEART',name:'熔铸心甲',category:'defense',stats:{hp:650,attack:25},cost:3200,recipe:['C_1011','C_1011','sword'],combine:1050,uniqueGroups:['forged_heart'],icon:'铸',
   passive:'获得相当于额外生命值2.5%的攻击力。生命低于50%时，按已损失生命额外获得最多10%攻击力（生命越低越高）。',
   params:{bonus_hp_to_ad_pct:.025,low_hp_threshold:.5,low_hp_max_ad_pct:.1}}];
 for(let d of newItems){if(C.items.some(i=>i.id===d.id))continue;let statText=Object.entries(d.stats).map(([k,v])=>({hp:'生命',attack:'攻击力'}[k]||k)+' +'+v).join(' · ');
  C.items.push({id:d.id,name:d.name,category:d.category,stats:d.stats,passive:d.passive,uniqueGroups:d.uniqueGroups,icon:d.icon,quality:'传说',sellRatio:.7,statText,desc:statText+'；'+d.passive,cost:d.cost,recipe:d.recipe,availableModes:['SR','ARAM'],tier:'LEGENDARY',iconUrl:'assets/items/'+d.id+'.png',boots:false,legendary:true,purchaseRestrictions:'NONE',params:{__description:d.passive,price:d.cost,combine_cost:d.combine,name:d.name,category:d.category,tier:'LEGENDARY',recipe:JSON.stringify(d.recipe),icon:'assets/items/'+d.id+'.png',builds_into:'[]',sell_ratio:.7,...d.params},...d.stats});
  C.itemParams[d.id]=C.items.at(-1).params;
  for(let part of new Set(d.recipe)){let c=C.items.find(i=>i.id===part);if(c?.params){try{let b=JSON.parse(c.params.builds_into||'[]');if(!b.includes(d.id)){b.push(d.id);c.params.builds_into=JSON.stringify(b)}}catch{}if(Array.isArray(c.buildsInto)&&!c.buildsInto.includes(d.id))c.buildsInto.push(d.id)}}}
 C.minionTowerDamageTaken=.3;
 if(C.aram){let a=C.aram,cy=a.bridge_center_y,oldHalf=a.bridge_width/2;a.tower_rubble_enabled=0;a.tower_range_multiplier=1.75*.65;a.bridge_width=2*C.tower.range*a.tower_range_multiplier;
  // 桥面随防御塔射程收窄：草丛、遗迹、传送门、内塔离中线的距离按同一比例向内收，避免落进桥外的墙里。
  let k=(a.bridge_width/2)/oldHalf,squeeze=p=>{if(p&&Number.isFinite(p.y))p.y=cy+(p.y-cy)*k};
  for(let b of a.bushes||[]){squeeze(b);if(b.h)b.h=Math.min(b.h,Math.max(120,a.bridge_width/2-Math.abs(b.y-cy))*1.6)}
  for(let list of [a.relic_positions,a.portal_positions,a.inhibitor_positions,a.nexus_positions])for(let p of list||[])squeeze(p);
  for(let team of a.tower_positions||[])for(let p of team)squeeze(p)}
})();
