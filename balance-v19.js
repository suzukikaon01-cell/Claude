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
 // V19 结算节奏：所有持续伤害每0.25秒结算一次，所有持续治疗每0.1秒结算一次（总量不变）。
 {const H=C.heroParams||{},I=C.itemParams||{},ch=(o,k,old,v)=>{if(o&&JSON.stringify(o[k])===JSON.stringify(old))o[k]=v};
  let z=H.zarya?.R;if(z&&z.tick_interval===.5){z.tick_interval=.25;z.tick_count=8;z.tick_damage=z.tick_damage.map(v=>v/2);z.tick_ap_ratio=z.tick_ap_ratio/2}
  ch(H.ana?.P,'enemy_magic_tick_interval',.1,.25);
  ch(H.xuefeng?.W,'heal_tick_interval',.25,.1);ch(H.xuefeng?.R,'heal_field_tick_interval',.5,.1);
  ch(I.liandry,'burn_tick_interval',1,.25);ch(I.MALIGNANCE,'period',.5,.25);ch(I.ZEKES_CONVERGENCE,'period',.5,.25);
  let ud=I.UNENDING_DESPAIR;if(ud&&ud.period===4){ud.period=.25;ud.damage/=16;ud.bonus_hp_ratio/=16}
  let hr=I.HOLLOW_RADIANCE;if(hr&&hr.period===1){hr.period=.25;hr.damage/=4;hr.bonus_hp_ratio/=4}
  let zs=C.heroes?.zarya?.skills?.[3];if(zs){zs.desc=zs.desc.replace('最多4次持续伤害','每0.25秒造成一次持续伤害（最多8次）');if(Array.isArray(zs.tickDamage))zs.tickDamage=zs.tickDamage.map(v=>v/2)}}
 // V19 重伤：死刑宣告 -30% 受到治疗（3秒）；凡性的提醒按敌方当前生命：高于60% -40%，低于40% -60%，之间线性（3秒）。
 {let I=C.itemParams||{};if(I.C_3123){I.C_3123.grievous=.3;I.C_3123.duration=3}if(I.mortal){I.mortal.grievous_wounds=.4;I.mortal.gw_duration=3}
  for(let it of C.items||[]){if(it.id==='C_3123'){it.passive='攻击造成物理伤害时施加3秒重伤：目标受到的治疗效果降低30%。';it.desc=(it.statText?it.statText+'；':'')+it.passive}if(it.id==='mortal'){it.passive='造成物理伤害时施加3秒重伤：目标生命高于60%时治疗效果降低40%，低于40%时降低60%，之间按生命线性变化（实时计算）。';it.desc=(it.statText?it.statText+'；':'')+it.passive}}}
 // V19 泉水防御：每秒500真实伤害，单目标锁定（英雄与小兵），召唤师峡谷半径800、大乱斗沿用原半径。
 if(C.aram)C.aram.fountain_damage=500;C.fountainDamage=500;C.fountainDefenseRadius=800;
 // V19 平衡：D.Va 普攻伤害 +50%（机甲双机枪与驾驶员手枪），Q 额外生命加成：直击 0.75% → 0.5%，爆炸 0.375% → 0.25%。
 {let d=C.heroParams?.dva,H=C.heroes?.dva;if(d){if(d.P.wave_total_ad_ratio===.55125){d.P.wave_total_ad_ratio=.826875;d.P.wave_edge_ad_ratio=.4725}if(d.P.pilot_ad_ratio===.85)d.P.pilot_ad_ratio=1.275;if(d.Q.bonus_hp_ratio===.0075)d.Q.bonus_hp_ratio=.005;if(d.Q.explosion_bonus_hp_ratio===.00375)d.Q.explosion_bonus_hp_ratio=.0025}
  if(H){H.passive.desc=H.passive.desc.replace('55.125%总AD','82.69%总AD').replace('31.5%总AD','47.25%总AD');let q=H.skills[0];q.desc=q.desc.replace('0.75%释放时额外生命','0.5%释放时额外生命').replace('0.375%额外生命','0.25%额外生命');if('bonusHpRatio' in q)q.bonusHpRatio=.005}}
 // V19 太刀侠：大招最高4级（1级自带1级大招，6/11/16级升2/3/4级）；原1/2/3级数值顺延为2/3/4级，1级为100。
 {let H=C.heroes?.longsword_hunter,P=C.heroParams?.longsword_hunter;if(H?.skills?.[3])H.skills[3].maxRank=4;for(let p of new Set([P,H?.params]))if(p?.R&&JSON.stringify(p.R.spirit_iai_base_damage)==='[200,300,400]')p.R.spirit_iai_base_damage=[100,200,300,400];
  if(H?.skills?.[3]){let r=H.skills[3];r.desc=r.desc.replace(/200\/300\/400/g,'100/200/300/400').replace('开刃居合距离 325 码','开刃居合距离 350 码');for(let k in r)if(Array.isArray(r[k])&&r[k].length===3&&k!=='counter_damage_sources')r[k]=[r[k][0]*r[k][0]/r[k][1],...r[k]].map(v=>typeof v==='number'?Math.round(v*100)/100:v)}}
 // V19 太刀侠：开刃改为攻击力倍率 无95%/白100%/黄105%/红110%（取代原2%/4%/10%刀刃增伤）；解放斩消耗1层刃、结束后大招1秒冷却；完美反击窗口保持0.2秒；登龙每段15/20/25/30/35+22.5%额外AD，解放斩每段10/15/20/25/30+25%额外AD；红刃时W突刺阶段减伤50%并霸体；居合反击成功且命中英雄时回复8×等级+25%额外AD生命（史诗野怪一半，多目标取最高）；只有普攻、登龙和解放斩可以暴击；普攻只造成70%伤害；居合成功冷却1/0.75/0.5/0.25秒、失败14/12/10/8秒（按大招等级）；持续伤害不能触发成功居合/见切；居合/见切对所有野怪生效；Q每段朝摇杆方向位移25码。
 {let P=C.heroParams?.longsword_hunter,H=C.heroes?.longsword_hunter;for(let p of new Set([P,H?.params]))if(p){p.P.blade_attack_multipliers=[.95,1,1.05,1.1];p.P.white_damage_multiplier=1;p.P.yellow_damage_multiplier=1;p.P.red_damage_multiplier=1;if(!p.P.counter_damage_sources.includes('MONSTER'))p.P.counter_damage_sources=[...p.P.counter_damage_sources,'MONSTER'];if(JSON.stringify(p.W.helm_tick_base_damage)==='[20,30,40,50,60]'){p.W.helm_tick_base_damage=[15,20,25,30,35];if(p.W.helm_tick_bonus_ad_ratio_pct===.25)p.W.helm_tick_bonus_ad_ratio_pct=.225}if(JSON.stringify(p.RELEASE.tick_base_damage)==='[10,20,30,40,50]'){p.RELEASE.tick_base_damage=[10,15,20,25,30];if(p.RELEASE.tick_bonus_ad_ratio_pct===.3)p.RELEASE.tick_bonus_ad_ratio_pct=.25}p.P.red_w_thrust_reduction=.5;p.R.counter_heal_per_level=8;p.R.counter_heal_bonus_ad_ratio=.25;p.R.counter_heal_epic_ratio=.5;if(p.RELEASE.spirit_level_cost===2)p.RELEASE.spirit_level_cost=1;p.RELEASE.after_release_r_cooldown=1;p.P.basic_attack_damage_ratio=.7;if(p.R.success_cooldown===1)p.R.success_cooldown=[1,.75,.5,.25];if(p.R.spirit_iai_cooldown===10)p.R.spirit_iai_cooldown=[14,12,10,8];p.Q.stage_move=25;if(p.R.spirit_iai_range===325)p.R.spirit_iai_range=350}
  if(H){H.passive.desc=(H.passive.desc||'').replace(/白\/黄\/红刃强化直接刀刃物理伤害2%\/4%\/10%[^。]*。/,'开刃等级决定攻击力：无刃95%、白刃100%、黄刃105%、红刃110%。红刃时W突刺阶段减伤50%并霸体。');for(let sk of H.skills)sk.desc=sk.desc.replace('黄刃消耗两层可释放','黄刃消耗一层可释放').replace(/每段10\/20\/30\/40\/50\+30%额外AD/,'每段10/15/20/25/30+25%额外AD').replace(/每段20\/30\/40\/50\/60\+25%额外AD/,'每段15/20/25/30/35+22.5%额外AD').replace('登龙兜割基础伤害 20/30/40/50/60','登龙兜割基础伤害 15/20/25/30/35').replace(/解放斩每段基础伤害 10\/20\/30\/40\/50/,'解放斩每段基础伤害 10/15/20/25/30');let q=H.skills[0];if(!q.desc.includes('朝摇杆方向'))q.desc=q.desc.replace('每按一次Q挥出一段','每按一次Q挥出一段（每段朝摇杆方向移动25码）')}}
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
  {id:'CHOCO_ICE',name:'巧乐兹雪糕',category:'physical',stats:{attack:45,hp:350,abilityHaste:15},cost:3000,recipe:['C_3133','C_1011'],combine:1250,uniqueGroups:['choco_ice'],icon:'糕',
   passive:'冰冻：对敌方造成伤害后使其减速30%，持续1秒。美味巧乐兹：受到的治疗效果提升25%。',
   params:{slow_pct:.3,slow_duration:1,heal_bonus_pct:.25}},
  {id:'VOID_SPEAR',name:'亚空之矛',category:'magic',stats:{ap:110,bonusAS:.25},cost:3000,recipe:['C_1058','C_1043','tome'],combine:1450,uniqueGroups:['void_spear'],icon:'矛',
   passive:'击杀或助攻敌方英雄后，当前终极技能剩余冷却减少20%。技能命中附带持续3秒的灼烧，3秒内共造成5+1%法术强度的魔法伤害（重复命中刷新）。亚空汲能：每击杀3个小兵/野怪，或击杀/助攻敌方英雄，或击杀史诗级野怪，获得1%攻击速度（最多+25%）。',
   params:{kill_ult_cd_pct:.2,burn_duration:3,burn_base:5,burn_ap_ratio:.01,as_per_stack:.01,max_stacks:25,unit_kills_per_stack:3}},
  {id:'GARGOYLE_MASK',name:'石像鬼面具',category:'defense',stats:{attack:40,hp:450,abilityHaste:20},cost:3000,recipe:['C_3133','C_1011','ruby'],combine:1050,uniqueGroups:['gargoyle_mask'],icon:'鬼',
   passive:'生命低于75%时，受到的治疗效果提升5%，生命越低提升越高，30%生命时达到25%。即将受到致命伤害时免疫此次死亡，并在5秒内回复35%已损失生命值（冷却180秒）。',
   params:{heal_start_ratio:.75,heal_full_ratio:.3,heal_min_pct:.05,heal_max_pct:.25,revive_missing_pct:.35,revive_duration:5,cooldown:180}},
  {id:'DIMENSION_BLADE',name:'斩罪武具次元刀',category:'physical',stats:{attack:5,armorPenPct:.3},cost:3500,recipe:['C_1038','C_3035'],combine:750,uniqueGroups:['dimension_blade','REVIVE'],icon:'刀',
   passive:'属性激化：普攻和技能每次命中附带10～28（随等级）魔法伤害，无冷却（装备、召唤师技能伤害不触发）。基础攻击强化EX：额外获得42攻击力（不计入装备面板）。锋利度强化：30%护甲穿透（百分比穿甲装备只能持有一件）。黑蚀龙之力：战斗中受侵蚀，每秒损失1%最大生命（不会致死）；对敌方英雄累计造成80+12×等级伤害后克服侵蚀，回复12%已损失生命，并获得25%暴击率，持续15秒。侵蚀冷却30秒（从开始侵蚀时计算）。霸主之魂：即将受到致命伤害时免疫该次死亡，1.5秒无敌（冷却180秒）。',
   params:{element_min:10,element_max:28,element_icd:0,erosion_pct:.01,cure_base:80,cure_per_level:12,cure_heal_missing_pct:.12,cure_crit:.25,cure_duration:15,erosion_cooldown:30,ex_attack:42,combat_timeout:5,revive_invuln:1.5,cooldown:180}}];
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
// V19 小兵移速略微提高：115 → 125（仅当仍为旧默认值时生效，Excel 改动优先）。
{let C=window.GAME_CONFIG;if(C?.minion&&C.minion.speed===115)C.minion.speed=125}
// V19 登龙：在空中按下后0.1秒内用摇杆方向决定下劈方向；只对剑身覆盖范围（长220×宽80）内的敌方英雄造成伤害。
{let C=window.GAME_CONFIG,L=C?.heroParams?.longsword_hunter,H=C?.heroes?.longsword_hunter;for(let p of new Set([L,H?.params]))if(p?.W){p.W.helm_aim_window??=.1;p.W.helm_blade_length??=220;p.W.helm_blade_width??=80}}
// V19 登龙：突刺前0.25秒蓄势（先略微后撤），再以1400速度突进235码，命中判定285码；登龙落地后0.25秒后摇。
{let C=window.GAME_CONFIG,L=C?.heroParams?.longsword_hunter,H=C?.heroes?.longsword_hunter;for(let p of new Set([L,H?.params]))if(p?.W){p.W.thrust_windup??=.25;p.W.thrust_backstep??=30;p.W.thrust_dash_speed??=1400;if(p.W.dash_distance===225)p.W.dash_distance=235;if(p.W.thrust_range===275)p.W.thrust_range=285;if(p.W.range===275)p.W.range=285;p.W.helm_landing_recovery??=.25}if(H?.skills?.[1]&&H.skills[1].range===275)H.skills[1].range=285}
// V19 完美居合：伤害75/100/125/150+275%额外AD；红刃（释放时为红刃）完美居合命中英雄/史诗野怪时回复8%+每100额外AD再+1%的已损失生命（史诗野怪减半，多目标取一次）。
{let C=window.GAME_CONFIG,L=C?.heroParams?.longsword_hunter,H=C?.heroes?.longsword_hunter;for(let p of new Set([L,H?.params]))if(p?.R){if(JSON.stringify(p.R.spirit_iai_base_damage)==="[100,200,300,400]")p.R.spirit_iai_base_damage=[75,100,125,150];if(p.R.spirit_iai_bonus_ad_ratio_pct===2)p.R.spirit_iai_bonus_ad_ratio_pct=2.75;p.R.red_counter_heal_missing_pct=.08;p.R.red_counter_heal_missing_pct_per_100_bonus_ad=.01}if(H?.skills?.[3]){let r=H.skills[3];r.desc=r.desc.replace('完整居合伤害100/200/300/400+200%额外AD，失败半伤。','完整居合伤害75/100/125/150+275%额外AD，失败半伤。红刃时完美居合斩中敌方英雄/史诗野怪，回复8%已损失生命（每100额外AD再+1%，史诗野怪减半，多目标只回一次）。').replace('开刃居合基础伤害 100/200/300/400','开刃居合基础伤害 75/100/125/150').replace('开刃居合额外攻击力系数百分比 200%','开刃居合额外攻击力系数百分比 275%');if(Array.isArray(r.damage))r.damage=[75,100,125,150]}}
// V19 腕豪E：前摇0.25秒（期间显示双侧拉人范围，敌我可见）。
{let H=window.GAME_CONFIG?.heroes?.sett;if(H?.skills?.[2]&&(H.skills[2].windup===.15||!H.skills[2].windup))H.skills[2].windup=.25}
// V19 太刀侠回调：普攻100%；登龙每段20/30/40/50/60+25%额外AD；居合75/150/225/300+275%额外AD；解放斩每段10/15/20/25/30+30%额外AD。
{let C=window.GAME_CONFIG,L=C?.heroParams?.longsword_hunter,H=C?.heroes?.longsword_hunter,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);for(let p of new Set([L,H?.params]))if(p){
 if(p.P.basic_attack_damage_ratio===.7)p.P.basic_attack_damage_ratio=1;
 if(same(p.W.helm_tick_base_damage,[15,20,25,30,35])){p.W.helm_tick_base_damage=[20,30,40,50,60];if(p.W.helm_tick_bonus_ad_ratio_pct===.225)p.W.helm_tick_bonus_ad_ratio_pct=.25}
 if(same(p.R.spirit_iai_base_damage,[75,100,125,150]))p.R.spirit_iai_base_damage=[75,150,225,300];
 if(same(p.RELEASE.tick_base_damage,[10,15,20,25,30])&&p.RELEASE.tick_bonus_ad_ratio_pct===.25)p.RELEASE.tick_bonus_ad_ratio_pct=.3}
 if(H?.skills){let w=H.skills[1],r=H.skills[3];if(r){r.desc=r.desc.replace('完整居合伤害75/100/125/150+275%额外AD','完整居合伤害75/150/225/300+275%额外AD').replace('开刃居合基础伤害 75/100/125/150','开刃居合基础伤害 75/150/225/300').replace(/每段10\/15\/20\/25\/30\+25%额外AD/,'每段10/15/20/25/30+30%额外AD');if(Array.isArray(r.damage))r.damage=[75,150,225,300]}
  if(w)w.desc=w.desc.replace(/15\/20\/25\/30\/35\+22\.5%额外AD/g,'20/30/40/50/60+25%额外AD')}}
// V20 平衡：太刀侠 登龙每段25/35/45/55/65+30%额外AD、解放斩每段15/20/25/30/35+35%额外AD、完美居合100/200/300/400+275%额外AD；
// 迪奥 Q每拳+20%额外AD且1.25秒内打完、W每把+25%额外AD、R结算倍率110/120/130%+每点额外AD 0.1个百分点；腕豪 W冷却24/22/20/18/16、基础伤害80/100/125/150/175，E冷却14/13/12/11/10。
{let C=window.GAME_CONFIG,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 let L=C?.heroParams?.longsword_hunter,LH=C?.heroes?.longsword_hunter;for(let p of new Set([L,LH?.params]))if(p){
  if(same(p.W.helm_tick_base_damage,[20,30,40,50,60])){p.W.helm_tick_base_damage=[25,35,45,55,65];if(p.W.helm_tick_bonus_ad_ratio_pct===.25)p.W.helm_tick_bonus_ad_ratio_pct=.3}
  if(same(p.RELEASE.tick_base_damage,[10,15,20,25,30])){p.RELEASE.tick_base_damage=[15,20,25,30,35];if(p.RELEASE.tick_bonus_ad_ratio_pct===.3)p.RELEASE.tick_bonus_ad_ratio_pct=.35}
  if(same(p.R.spirit_iai_base_damage,[75,150,225,300]))p.R.spirit_iai_base_damage=[100,200,300,400]}
 let D=C?.heroParams?.dio,DH=C?.heroes?.dio;for(let p of new Set([D,DH?.params]))if(p){
  if(p.Q.bonus_ad_ratio_pct===.15)p.Q.bonus_ad_ratio_pct=.2;if(p.Q.cast_duration===1.5)p.Q.cast_duration=1.25;if(p.W.bonus_ad_ratio_pct===.15)p.W.bonus_ad_ratio_pct=.25;if(p.R.damage_settlement_base_pct===1)p.R.damage_settlement_base_pct=[1.1,1.2,1.3]}
 if(DH?.skills){if(DH.skills[1]&&DH.skills[1].bonusAdRatio===.15)DH.skills[1].bonusAdRatio=.25}
 let S=C?.heroParams?.sett,SH=C?.heroes?.sett;for(let p of new Set([S,SH?.params]))if(p){
  if(same(p.W.cooldown,[16,14.875,13.75,12.625,11.5]))p.W.cooldown=[24,22,20,18,16];if(same(p.W.damage_base,[80,98.75,117.5,136.25,155]))p.W.damage_base=[80,100,125,150,175];if(same(p.E.cooldown,[13,11.875,10.75,9.625,8.5]))p.E.cooldown=[14,13,12,11,10]}
 if(SH?.skills){let w=SH.skills[1],e=SH.skills[2];if(w&&same(w.cd,[16,14.875,13.75,12.625,11.5]))w.cd=[24,22,20,18,16];if(w&&same(w.damage,[80,98.75,117.5,136.25,155]))w.damage=[80,100,125,150,175];if(e&&same(e.cd,[13,11.875,10.75,9.625,8.5]))e.cd=[14,13,12,11,10]}}
// V20 迪奥：Q每拳+20%总攻击力，W每把+25%总攻击力（原为额外攻击力）。
{let D=window.GAME_CONFIG?.heroParams?.dio,DH=window.GAME_CONFIG?.heroes?.dio;for(let p of new Set([D,DH?.params]))if(p){if(p.Q.total_ad_ratio_pct===undefined&&p.Q.bonus_ad_ratio_pct===.2)p.Q.total_ad_ratio_pct=.2;if(p.W.total_ad_ratio_pct===undefined&&p.W.bonus_ad_ratio_pct===.25)p.W.total_ad_ratio_pct=.25}if(DH?.skills?.[1]&&DH.skills[1].bonusAdRatio===.25){DH.skills[1].bonusAdRatio=0;DH.skills[1].adRatio=.25}}
// V20 迪奥：Q每拳附带的攻击特效效果改为33%。
{let D=window.GAME_CONFIG?.heroParams?.dio,DH=window.GAME_CONFIG?.heroes?.dio;for(let p of new Set([D,DH?.params]))if(p?.Q&&p.Q.on_hit_effectiveness_pct===.25)p.Q.on_hit_effectiveness_pct=.33;if(DH?.skills?.[0]?.desc)DH.skills[0].desc=DH.skills[0].desc.replace(/普攻附加伤害按25%结算/g,'普攻附加伤害按33%结算')}

// V20.2 太刀侠：降低基础伤害、提高额外AD加成（额外AD参考上限约400）。
// 登龙每段20/25/30/35/40+40%额外AD，解放斩每段15/15/20/20/25+40%额外AD，完美居合75/125/175/225+337.5%额外AD。
{let C=window.GAME_CONFIG,L=C?.heroParams?.longsword_hunter,H=C?.heroes?.longsword_hunter;for(let p of new Set([L,H?.params]))if(p?.W&&p.RELEASE&&p.R){let J=JSON.stringify;if(J(p.W.helm_tick_base_damage)==='[25,35,45,55,65]')p.W.helm_tick_base_damage=[20,25,30,35,40];if(p.W.helm_tick_bonus_ad_ratio_pct===.3)p.W.helm_tick_bonus_ad_ratio_pct=.4;if(J(p.RELEASE.tick_base_damage)==='[15,20,25,30,35]')p.RELEASE.tick_base_damage=[15,15,20,20,25];if(p.RELEASE.tick_bonus_ad_ratio_pct===.35)p.RELEASE.tick_bonus_ad_ratio_pct=.4;if(J(p.R.spirit_iai_base_damage)==='[100,200,300,400]')p.R.spirit_iai_base_damage=[75,125,175,225];if(p.R.spirit_iai_bonus_ad_ratio_pct===2.75)p.R.spirit_iai_bonus_ad_ratio_pct=3.375}
 let w=H?.skills?.[1],r=H?.skills?.[3];if(L&&L.W.helm_tick_bonus_ad_ratio_pct!==.4)w=null;if(L&&L.R.spirit_iai_bonus_ad_ratio_pct!==3.375)r=null;if(w)w.desc=w.desc.replace(/每段[\d/]+\+[\d.]+%额外AD/,'每段20/25/30/35/40+40%额外AD').replace(/兜割分段基础伤害 [\d/]+/,'兜割分段基础伤害 20/25/30/35/40').replace(/兜割分段额外攻击力系数百分比 [\d.]+%/,'兜割分段额外攻击力系数百分比 40%');
 if(r){r.desc=r.desc.replace(/每段[\d/]+\+[\d.]+%额外AD/,'每段15/15/20/20/25+40%额外AD').replace(/完整居合伤害[\d/]+\+[\d.]+%额外AD/,'完整居合伤害75/125/175/225+337.5%额外AD').replace(/开刃居合基础伤害 [\d/]+/,'开刃居合基础伤害 75/125/175/225').replace(/开刃居合额外攻击力系数百分比 [\d.]+%/,'开刃居合额外攻击力系数百分比 337.5%');if(Array.isArray(r.damage))r.damage=[75,125,175,225]}}
