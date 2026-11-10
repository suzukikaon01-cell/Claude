/* V19 平衡调整（在 Excel 配置快照载入后覆盖，便于单独调整）。
 * （DVA 普攻/Q 的下调直接写在 Excel 工作簿里，保持 Excel 为数值来源。）
 * - 防御塔：30% 护甲穿透。
 * - 大乱斗：防御塔被摧毁后不再生成碎石墙。
 * - 小兵：只受到防御塔/水晶伤害的30%（唯一来源，不与旧的塔普攻减半叠加）。
 * - 大乱斗：防御塔攻击范围 ×1.75×0.65（再缩小35%），桥面宽度=防御塔攻击范围的直径；桥上的草丛/遗迹/传送门/内塔按比例向中线收拢。
 */
(()=>{'use strict';const C=window.GAME_CONFIG;if(!C)return;
 C.towerArmorPenPct=.3;
 // V19 平衡：迪奥——被动改名「不老不死」冷却180秒；Q 每拳15/20/25/30/35+15%额外AD，回复1%已损失生命；飞刀取消同目标递减；R倍率改按额外AD；R结算击杀不再刷新E。
 {let H=C.heroes.dio;for(let p of new Set([C.heroParams?.dio,H?.params]))if(p){// 仅覆盖仍为旧默认值的项，Excel 中手动改过的值优先。
   const ch=(o,k,old,v)=>{if(o&&JSON.stringify(o[k])===JSON.stringify(old)){if(v===undefined)delete o[k];else o[k]=v}};
   ch(p.P,'cooldown',150,180);ch(p.Q,'total_ad_ratio_pct',.18,undefined);ch(p.Q,'bonus_ad_ratio_pct',0,.15);ch(p.W,'damage_decay_per_hit_pct',.1,0);ch(p.R,'damage_settlement_uses_total_ad',1,0);ch(p.R,'refresh_e_on_settlement_champion_kill',1,0);ch(p.W,'marked_kill_refresh_e',1,0);
   p.P.__description='不老不死：致命伤使迪奥原地倒地2.5秒，期间无法行动、不可选中并免伤；随后恢复40%最大生命和全部能量。冷却180秒；特殊倒地不算死亡。本体普攻造成125%总AD物理伤害，攻速固定0.7。'}
  if(H){H.passive.name='不老不死';H.passive.desc=H.params?.P?.__description||C.heroParams.dio.P.__description;let[q,w,e,r]=H.skills;
   q.desc=q.desc.replace('每拳15/20/25/30/35+18%总AD','每拳15/20/25/30/35+15%额外AD');
   w.desc=w.desc.replace(/同目标前1～6把全额，之后每把递减10个百分点，最低50%。/,'多把飞刀命中同一目标均为全额伤害。').replace(/飞刀或R结算击杀带有自己印记的敌方英雄刷新E。?/,'').replace(/无印记目标的飞刀击杀不刷新。?/,'');
   r.desc=r.desc.replace('每点迪奥当前总AD增加0.1个百分点，400AD为140%','每点迪奥额外AD增加0.1个百分点，400额外AD为140%').replace('结算击杀敌方英雄刷新E。','')}}
 // V19 平衡：空之律者 W 空间牢笼吸引速度 35 → 75 码/秒。
 {let P=C.heroParams?.herrscher_of_the_void,H=C.heroes.herrscher_of_the_void;for(let p of new Set([P,H?.params]))if(p?.W&&p.W.pull_speed===35)p.W.pull_speed=75;let w=H?.skills?.[1];if(w)w.desc=w.desc.replace('弱吸引速度 35 码/秒','吸引速度 75 码/秒');if(w&&'pullSpeed' in w)w.pullSpeed=75}
 // V19 平衡：瑟提 Q/R 削弱；盖伦基础属性加强（更肉）。
 {let H=C.heroes.sett,P=C.heroParams?.sett;if(H){let q=H.skills[0],r=H.skills[3];q.damage=[5,10,15,20,25];q.hpAdRatio=[0,0,0,0,0];q.desc=q.desc.replace('5/16.25/27.5/38.75/50','5/10/15/20/25').replace('每拳目标最大生命基础比例 1%','每拳目标最大生命 1%（不再随攻击力成长）');
  r.bonusAdRatio=.6;r.desc=r.desc.replace('额外AD系数 100%','额外AD系数 60%');for(let p of [P,H.params])if(p){if(p.Q){p.Q.damage_flat=[5,10,15,20,25]}if(p.R)p.R.bonus_ad_ratio=.6}}}
 {let s=C.heroes.garen?.stats;if(s){Object.assign(s,{hp:740,attack:70,armor:44,mr:38,hpRegen:10});Object.assign(s.growth,{hp:150,attack:4.8,armor:5.4,mr:2.2,hpRegen:.9})}}
 // 复活类装备（守护天使/石像鬼面具/次元刀）只能持有一件：见 items-v19.js。
 // V19 原创装备（效果见 items-v19.js）：
 //  山岳巨颚：普攻附带1.5%最大生命物理伤害，并溅射目标身后扇形范围；熔铸心甲：额外生命的2.5%转为攻击力，低于50%生命时按已损失生命再获得最多10%攻击力。
 const newItems=[
  {id:'GIANT_MAW',name:'山岳巨颚',category:'physical',stats:{hp:550,attack:40},cost:3300,recipe:['C_1011','C_3044'],combine:1300,uniqueGroups:['giant_maw'],icon:'颚',
   passive:'普攻附带1.5%自身最大生命的额外物理伤害，并对目标身后350码、90°扇形内的其他敌人造成同等伤害（远程英雄60%）。',
   params:{hit_maxhp_pct:.015,cleave_range:350,cleave_degrees:90,ranged_ratio:.6}},
  {id:'FORGED_HEART',name:'熔铸心甲',category:'defense',stats:{hp:650,attack:25},cost:3200,recipe:['C_1011','C_1011','sword'],combine:1050,uniqueGroups:['forged_heart'],icon:'铸',
   passive:'获得相当于额外生命值2.5%的攻击力。生命低于50%时，按已损失生命额外获得最多10%攻击力（生命越低越高）。',
   params:{bonus_hp_to_ad_pct:.025,low_hp_threshold:.5,low_hp_max_ad_pct:.1}},
  {id:'CHOCO_ICE',name:'巧乐兹雪糕',category:'physical',stats:{attack:55,abilityHaste:15},cost:3000,recipe:['C_3133','sword','sword'],combine:1250,uniqueGroups:['choco_ice'],icon:'糕',
   passive:'冰冻：对敌方造成伤害后使其减速30%，持续1秒。美味巧乐兹：受到的治疗效果提升12%。',
   params:{slow_pct:.3,slow_duration:1,heal_bonus_pct:.12}},
  {id:'VOID_SPEAR',name:'亚空之矛',category:'magic',stats:{ap:60,bonusAS:.35},cost:3000,recipe:['C_1026','C_1043'],combine:1450,uniqueGroups:['void_spear'],icon:'矛',
   passive:'击杀或助攻敌方英雄后，当前终极技能剩余冷却减少20%。技能命中附带持续3秒的灼烧，3秒内共造成5+1%法术强度的魔法伤害（重复命中刷新）。',
   params:{kill_ult_cd_pct:.2,burn_duration:3,burn_base:5,burn_ap_ratio:.01}},
  {id:'GARGOYLE_MASK',name:'石像鬼面具',category:'defense',stats:{attack:25,hp:350,abilityHaste:15},cost:3000,recipe:['C_3133','C_1011'],combine:1050,uniqueGroups:['gargoyle_mask'],icon:'鬼',
   passive:'生命低于75%时，受到的治疗效果提升5%，生命越低提升越高，30%生命时达到25%。即将受到致命伤害时免疫此次死亡，并在5秒内回复25%已损失生命值（冷却180秒）。',
   params:{heal_start_ratio:.75,heal_full_ratio:.3,heal_min_pct:.05,heal_max_pct:.25,revive_missing_pct:.25,revive_duration:5,cooldown:180}},
  {id:'DIMENSION_BLADE',name:'斩罪武具次元刀',category:'physical',stats:{attack:5,armorPenPct:.15},cost:3500,recipe:['C_1038','C_3035'],combine:750,uniqueGroups:['dimension_blade','REVIVE'],icon:'刀',
   passive:'属性激化：普攻和技能命中附带35～50（随等级）魔法伤害，同一目标0.25秒最多1次（装备、召唤师技能伤害不触发）。基础攻击强化EX：额外获得42攻击力（不计入装备面板）。锋利度强化：15%护甲穿透。黑蚀龙之力：战斗中受侵蚀，每秒损失1%最大生命（不会致死）；对敌方英雄累计造成80+12×等级伤害后克服侵蚀，回复12%已损失生命，并获得25%暴击率，持续15秒。侵蚀冷却30秒（从开始侵蚀时计算）。霸主之魂：即将受到致命伤害时免疫该次死亡，1.5秒无敌（冷却150秒）。',
   params:{element_min:35,element_max:50,element_icd:.25,erosion_pct:.01,cure_base:80,cure_per_level:12,cure_heal_missing_pct:.12,cure_crit:.25,cure_duration:15,erosion_cooldown:30,ex_attack:42,combat_timeout:5,revive_invuln:1.5,cooldown:150}}];
 for(let d of newItems){if(C.items.some(i=>i.id===d.id))continue;let statText=Object.entries(d.stats).map(([k,v])=>({hp:'生命',attack:'攻击力',ap:'法术强度',abilityHaste:'技能急速',bonusAS:'攻击速度',armorPenPct:'护甲穿透'}[k]||k)+' +'+(['bonusAS','armorPenPct'].includes(k)?Math.round(v*100)+'%':v)).join(' · ');
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
