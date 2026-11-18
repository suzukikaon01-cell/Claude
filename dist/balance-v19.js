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
// V20.3 太刀侠：完美居合不再眩晕。
{let C=window.GAME_CONFIG,L=C?.heroParams?.longsword_hunter,H=C?.heroes?.longsword_hunter;for(let p of new Set([L,H?.params]))if(p?.R&&p.R.spirit_iai_stun_duration===.5)p.R.spirit_iai_stun_duration=0;let r=H?.skills?.[3];if(r&&L?.R?.spirit_iai_stun_duration===0)r.desc=r.desc.replace('仅成功且斩中敌人眩晕0.5秒，','').replace(/ · 开刃居合眩晕持续时间 0\.5 秒/,'')}
// V20.4 俄洛伊：基础攻击力68，普攻距离125，W强化后距离350，R持续8秒。
{let C=window.GAME_CONFIG,L=C?.heroParams?.illaoi,H=C?.heroes?.illaoi;if(H?.stats){if(H.stats.attack===65)H.stats.attack=68;if(H.stats.range===89)H.stats.range=125}for(let p of new Set([L,H?.params]))if(p?.BASE){if(p.BASE.ad_base===65)p.BASE.ad_base=68;if(p.BASE.attack_range===89)p.BASE.attack_range=125;if(p.W.range_total===314)p.W.range_total=350;p.R.duration=8}}
// V20.5 俄洛伊按参考表：被动冷却20→7.5秒、触手10～180+120%AD、回复4.5%已损失生命；E耗蓝35/45/55/65/75、射程900；R范围450、冷却120/95/70、期间W冷却2秒。
{let C=window.GAME_CONFIG,L=C?.heroParams?.illaoi,H=C?.heroes?.illaoi;for(let p of new Set([L,H?.params]))if(p?.P){Object.assign(p.P,{spawn_cooldown_max:20,spawn_cooldown_min:7.5,tentacle_damage_min:10,tentacle_damage_max:180,base_tentacle_damage_min:10,base_tentacle_damage_max:180,total_ad_ratio:1.2,tentacle_total_ad_ratio_pct:1.2,heal_missing_hp:.045});p.E.mana_cost=[35,45,55,65,75];p.E.range=900;p.E.cast_range=900;p.R.radius=450;p.R.cooldown=[120,95,70];p.R.w_cooldown_multiplier=.5;p.R.w_cooldown_fixed=2}
 let s=H?.skills;if(s){s[2].mana=[35,45,55,65,75];s[2].range=900;s[3].cd=[120,95,70];
  s[0].desc=s[0].desc.replace('9～200','10～180').replace(/110\.?0*\d*%总AD/,'120%总AD');
  s[2].desc=s[2].desc.replace('射程475','射程900');
  s[3].desc=s[3].desc.replace('减半W冷却','W基础冷却降至2秒').replace('范围 500','范围 450').replace('项目R冷却 90/75/60','项目R冷却 120/95/70');}
 if(H?.passive?.desc)H.passive.desc=H.passive.desc.replace('9～200','10～180').replace('110%总AD','120%总AD').replace('5%已损失生命','4.5%已损失生命')}
// V20.6 雪峰弱点（被动与R）：每处弱点 3%+每100额外AD 4% 最大生命真实伤害（R四处合计 12%+每100额外AD 16%）；
// 击破弱点回复 35～100（随等级）生命并获得2秒内衰减的20%移速；15秒或击破后刷新新弱点。
// R：至少击破1处后生成回血阵，每秒为友方回复 75/110/125+60%额外AD，持续2～5秒（击破越多越久）。
{let C=window.GAME_CONFIG,L=C?.heroParams?.xuefeng,H=C?.heroes?.xuefeng;for(let p of new Set([L,H?.params]))if(p?.R&&p.R.vital_heal_damage_ratio_pct===.5&&p.R.vital_base_maxhp_true_damage_max_pct===.03&&p.R.vital_bonus_pct_per_100_total_ad===.01){Object.assign(p.R,{vital_base_maxhp_true_damage_pct:.03,vital_base_maxhp_true_damage_max_pct:.03,vital_bonus_pct_per_100_total_ad:0,vital_bonus_pct_per_100_bonus_ad:.04,vital_heal_damage_ratio_pct:0,vital_heal_flat:[35,100],vital_move_speed_pct:.2,vital_move_speed_duration:2,vital_refresh_interval:15,heal_per_second:[75,110,125],heal_per_second_bonus_ad_ratio:.6,heal_field_min_duration:2});p.R.passive_unlock_requires_r_level=0;p.R.__description='标出目标全部4处弱点并依次斩击；每处弱点造成目标最大生命 3%+每100额外AD 4% 的真实伤害（合计最多 12%+每100额外AD 16%）。至少击破1处后生成回血阵，每秒为友方回复 75/110/125+60%额外AD，持续2～5秒（击破越多越久）。'}
 if(H?.passive&&L?.R?.heal_per_second&&!H.passive.desc.includes('弱点'))H.passive.desc+='\n弱点：附近敌方英雄身上会标出一处弱点。用普攻或技能从对应方向命中，造成目标最大生命 3%+每100额外AD 4% 的真实伤害，回复 35～100（随等级）生命，并获得2秒内衰减的20%移速；15秒后或击破后出现新弱点。';let r=H?.skills?.[3];if(r&&L?.R?.heal_per_second){let i=r.desc.indexOf('\n');r.desc='标出目标全部4处弱点并依次斩击；每处弱点造成目标最大生命 3%+每100额外AD 4% 的真实伤害（合计最多 12%+每100额外AD 16%）；击破弱点回复 35～100（随等级）生命并获得2秒内衰减的20%移速。至少击破1处后生成回血阵，每秒为友方回复 75/110/125+60%额外AD，持续2～5秒（击破越多越久）。'+(i>=0?r.desc.slice(i).replace('每100总AD增加弱点百分点 1%','每100额外AD增加弱点百分点 4%').replace('回血阵持续 2.5 秒','回血阵持续 2～5 秒').replace('每名友方回血阵基础总治疗 150/300/450 数值','回血阵每秒治疗 75/110/125').replace('回血阵总AD加成 125%','回血阵额外AD加成 60%').replace('弱点实际伤害转治疗比例 50%','击破弱点治疗 35～100'):'')}}
// V20.7 砧岳：基础攻击 64→70、成长 3.8→4.5；Q 蓄力伤害 60%→140%，基础 100/125/150/200/225+175%额外AD+12%最大生命（强化Q同）；
// E 100/150/200/250/300+75%额外AD；R 300/400/500+275%额外AD+12%最大生命。
{let C=window.GAME_CONFIG,L=C?.heroParams?.anvil,H=C?.heroes?.anvil,J=JSON.stringify;if(H?.stats){if(H.stats.attack===64)H.stats.attack=70;if(H.stats.growth?.attack===3.8)H.stats.growth.attack=4.5}
 for(let p of new Set([L,H?.params]))if(p?.Q){if(p.BASE?.ad_base===64)p.BASE.ad_base=70;if(p.BASE?.ad_growth===3.8)p.BASE.ad_growth=4.5;
  if(J(p.Q.damage)==='[80,100,120,140,160]'){Object.assign(p.Q,{damage:[100,125,150,200,225],bonus_ad_ratio:1.75,maxhp_ratio:.12,empowered_damage:[100,125,150,200,225],empowered_bonus_ad_ratio:1.75,empowered_maxhp_ratio:.12,max_damage_ratio:1.4})}
  if(J(p.E.damage)==='[50,80,110,140,170]'){p.E.damage=[100,150,200,250,300];p.E.bonus_ad_ratio=.75}
  if(J(p.R.damage)==='[250,350,450]'){p.R.damage=[300,400,500];p.R.bonus_ad_ratio=2.75;p.R.maxhp_ratio=.12}}
 let s=H?.skills;if(s&&L?.Q?.max_damage_ratio===1.4){let q=s[0],e=s[2],r=s[3];
  q.desc=q.desc.replace('伤害（60%→100%）','伤害（60%→140%）').replace(/80\/100\/120\/140\/160\+80%额外AD\+8%自身最大生命/g,'100/125/150/200/225+175%额外AD+12%自身最大生命');if(Array.isArray(q.damage))q.damage=[100,125,150,200,225];
  e.desc=e.desc.replace('50/80/110/140/170+50%额外AD','100/150/200/250/300+75%额外AD');if(Array.isArray(e.damage))e.damage=[100,150,200,250,300];
  r.desc=r.desc.replace('250/350/450+50%额外AD+10%自身最大生命','300/400/500+275%额外AD+12%自身最大生命');if(Array.isArray(r.damage))r.damage=[300,400,500]}}
// V20.8 DIO Q：降低每拳基础伤害、提高总AD加成：每拳 5/8/11/14/17+30%总AD。
{let C=window.GAME_CONFIG,L=C?.heroParams?.dio,H=C?.heroes?.dio,J=JSON.stringify;for(let p of new Set([L,H?.params]))if(p?.Q&&J(p.Q.damage_per_punch)==='[15,20,25,30,35]'&&p.Q.total_ad_ratio_pct===.2){p.Q.damage_per_punch=[5,8,11,14,17];p.Q.total_ad_ratio_pct=.3}
 let q=H?.skills?.[0];if(q&&L?.Q?.total_ad_ratio_pct===.3){q.desc=q.desc.replace(/每拳15\/20\/25\/30\/35\+\d+%(?:额外|总)AD/,'每拳5/8/11/14/17+30%总AD');if(Array.isArray(q.damage))q.damage=[5,8,11,14,17]}}
// V20.9 砧岳：Q 突进上限500，击退100～425（强化Q 425），伤害 150/200/250/300/350+200%总AD（强化Q同，仍乘蓄力60%～140%）；
// R 400/500/600+275%总AD+15%最大生命。
{let C=window.GAME_CONFIG,L=C?.heroParams?.anvil,H=C?.heroes?.anvil,J=JSON.stringify;for(let p of new Set([L,H?.params]))if(p?.Q){
 if(J(p.Q.damage)==='[100,125,150,200,225]'){Object.assign(p.Q,{dash_range:500,empowered_range:500,min_knockback:100,knockback:425,empowered_knockback:425,damage:[150,200,250,300,350],ad_ratio:2,bonus_ad_ratio:0,maxhp_ratio:0,empowered_damage:[150,200,250,300,350],empowered_ad_ratio:2,empowered_bonus_ad_ratio:0,empowered_maxhp_ratio:0})}
 if(J(p.R.damage)==='[300,400,500]'){p.R.damage=[400,500,600];p.R.ad_ratio=2.75;p.R.bonus_ad_ratio=0;p.R.maxhp_ratio=.15}}
 let s=H?.skills;if(s&&L?.Q?.ad_ratio===2){let q=s[0],r=s[3];q.range=500;q.desc=q.desc.replace('（190→425码）','（'+Math.round(500*L.Q.min_charge_ratio)+'→500码）').replace('（150→300码）','（100→425码）').replace(/100\/125\/150\/200\/225\+175%额外AD\+12%自身最大生命/g,'150/200/250/300/350+200%总AD').replace('击退360码','击退425码');if(Array.isArray(q.damage))q.damage=[150,200,250,300,350];
  r.desc=r.desc.replace('300/400/500+275%额外AD+12%自身最大生命','400/500/600+275%总AD+15%自身最大生命');if(Array.isArray(r.damage))r.damage=[400,500,600]}}
// V20.10 查莉娅（毛妹）重做：普攻=粒子榴弹（固定1秒/次，不吃攻速），自动锁定射程内生命绝对值最低的敌人、砸在目标出手时的位置（不追踪），
// 爆炸半径随能量 125→225；伤害 40～160（随等级）+60%AD+3%最大生命+40%AP，×(1+能量×1%)。
// Q=持续3秒的非指向粒子激光，实时朝瞄准方向扫射：每秒 40/60/80/100/120+4%最大生命+50%AP，×(1+能量×1%)。
// R 额外 +6%最大生命并吃能量增伤。
{let C=window.GAME_CONFIG,L=C?.heroParams?.zarya,H=C?.heroes?.zarya;for(let p of new Set([L,H?.params]))if(p?.P&&p.P.aa_interval==null){
 Object.assign(p.P,{aa_interval:1,aa_base_min:40,aa_base_max:160,aa_ad_ratio:.6,aa_maxhp_ratio:.03,aa_ap_ratio:.4,aa_radius_min:125,aa_radius_max:225,aa_projectile_speed:1100,damage_per_energy:.01});
 Object.assign(p.Q,{laser_duration:3,laser_tick:.25,laser_length:650,laser_width:80,laser_dps:[40,60,80,100,120],laser_maxhp_ratio:.04,laser_ap_ratio:.5,cooldown:[10,9,8,7,6],windup:0,backswing:0});
 p.R.maxhp_ratio=.06;if(p.BASE)p.BASE.attack_range=450}
 if(H&&L?.P?.aa_interval){if(H.stats.range===325)H.stats.range=450;let q=H.skills[0];Object.assign(q,{name:'粒子激光',target:'direction',range:650,width:80,windup:0,recovery:0,cd:[10,9,8,7,6],damage:0,projectileSpeed:undefined});
  q.desc='按住持续发射3秒粒子激光，实时朝瞄准方向扫射（松手提前结束），穿透路径上所有敌人：每秒 40/60/80/100/120+4%最大生命+50%AP 魔法伤害，享受能量增伤（每点能量+1%）。\n冷却 10/9/8/7/6 · 长度 650 · 宽度 80';
  if(H.passive)H.passive.desc='普攻改为粒子榴弹：固定每秒1次（不受攻速影响），自动锁定射程内生命值最低的敌人，砸在目标出手时的位置（目标位移后会落空）。爆炸半径随能量 125→225，造成 40～160（随等级）+60%AD+3%最大生命+40%AP 魔法伤害。所有伤害享受能量增伤（每点能量+1%）。W、E各储存2次施放，护盾实际吸收伤害转为能量，4秒未吸收后每秒衰减1。';
  let r=H.skills[3];if(r&&!r.desc.includes('最大生命'))r.desc=r.desc.replace('发射重力弹','发射重力弹（命中伤害额外+6%最大生命，享受能量增伤）')}}
// V20.11 砧岳Q恢复最大生命加成：150/200/250/300/350+200%总AD+12%最大生命（强化Q同）。
{let C=window.GAME_CONFIG,L=C?.heroParams?.anvil,H=C?.heroes?.anvil;for(let p of new Set([L,H?.params]))if(p?.Q&&p.Q.ad_ratio===2&&p.Q.maxhp_ratio===0){p.Q.maxhp_ratio=.12;p.Q.empowered_maxhp_ratio=.12}
 let q=H?.skills?.[0];if(q&&L?.Q?.maxhp_ratio===.12)q.desc=q.desc.replace(/150\/200\/250\/300\/350\+200%总AD(?!\+12%)/g,'150/200/250/300/350+200%总AD+12%自身最大生命')}
// V20.12 砧岳Q伤害-60%：60/80/100/120/140+80%总AD+5%最大生命（强化Q同）。
{let C=window.GAME_CONFIG,L=C?.heroParams?.anvil,H=C?.heroes?.anvil,J=JSON.stringify;for(let p of new Set([L,H?.params]))if(p?.Q&&J(p.Q.damage)==='[150,200,250,300,350]'&&p.Q.ad_ratio===2){Object.assign(p.Q,{damage:[60,80,100,120,140],ad_ratio:.8,maxhp_ratio:.05,empowered_damage:[60,80,100,120,140],empowered_ad_ratio:.8,empowered_maxhp_ratio:.05})}
 let q=H?.skills?.[0];if(q&&L?.Q?.ad_ratio===.8){q.desc=q.desc.replace(/150\/200\/250\/300\/350\+200%总AD\+12%自身最大生命/g,'60/80/100/120/140+80%总AD+5%自身最大生命');if(Array.isArray(q.damage))q.damage=[60,80,100,120,140]}}
// V20.13 砧岳R总AD加成 275%→125%：400/500/600+125%总AD+15%最大生命。
{let C=window.GAME_CONFIG,L=C?.heroParams?.anvil,H=C?.heroes?.anvil;for(let p of new Set([L,H?.params]))if(p?.R&&p.R.ad_ratio===2.75)p.R.ad_ratio=1.25;let r=H?.skills?.[3];if(r&&L?.R?.ad_ratio===1.25)r.desc=r.desc.replace('400/500/600+275%总AD','400/500/600+125%总AD')}
// V20.14 砧岳R中心范围 275→225 码。
{let C=window.GAME_CONFIG,L=C?.heroParams?.anvil,H=C?.heroes?.anvil;for(let p of new Set([L,H?.params]))if(p?.R&&p.R.core_radius===275)p.R.core_radius=225;let r=H?.skills?.[3];if(r&&L?.R?.core_radius===225)r.desc=r.desc.replace(/中心275码/g,'中心225码').replace(/275码外/g,'225码外')}
// V20.15 艾希：W 射程500、弹速600、冷却22/20/18/16/14；R 飞行速度 800→1200。
{let C=window.GAME_CONFIG,L=C?.heroParams?.ashe,H=C?.heroes?.ashe,J=JSON.stringify;for(let p of new Set([L,H?.params]))if(p?.W&&p.W.cast_range===1200){p.W.cast_range=500;p.W.projectile_speed=600;p.W.cooldown=[22,20,18,16,14];p.R.projectile_speed_initial=800;p.R.projectile_speed_max=1200}
 let s=H?.skills;if(s&&L?.W?.cast_range===500){Object.assign(s[1],{range:500,projectileSpeed:600,cd:[22,20,18,16,14]});s[1].desc=s[1].desc.replace('射程 1200','射程 500').replace('弹速 2000','弹速 600').replace('冷却 18/14.5/11/7.5/4','冷却 22/20/18/16/14');Object.assign(s[3],{projectileSpeed:800,maxSpeed:1200});s[3].desc=s[3].desc.replace('初始弹速 1500','初始弹速 800').replace('最高弹速 2100','最高弹速 1200')}}
// V20.16 平衡：源氏下调（R单刀 100/150/200+180%额外AD，Q +120%额外AD）；零上调（生命600，Q 65～185+50%AP，W 70～190+45%AP，R 120/190/260+55%AP，E冷却22～16）；
// 拉克丝（W每段护盾55～135，R冷却60/48/36）；盖伦（E每圈AD系数36%～48%）。
{let C=window.GAME_CONFIG,HP=C?.heroParams||{},H=C?.heroes||{},J=JSON.stringify,same=(a,b)=>J(a)===J(b),rep=(s,a,b)=>{if(s&&typeof s.desc==='string')s.desc=s.desc.split(a).join(b)};
 // 源氏
 {let p=HP.genji,s=H.genji?.skills;if(p?.R&&same(p.R.base_hit_damage,[125,175,225])&&same(p.R.bonus_ad_ratio,[2.3,2.3,2.3])){p.R.base_hit_damage=[100,150,200];p.R.bonus_ad_ratio=[1.8,1.8,1.8];if(p.Q.bonus_ad_ratio===1.35)p.Q.bonus_ad_ratio=1.2;
   if(s){s[3].damage=[100,150,200];s[3].bonusAdRatio=[1.8,1.8,1.8];s[0].bonusAdRatio=1.2;rep(s[3],'125/175/250+225%额外AD','100/150/200+180%额外AD');rep(s[3],'125/175/225','100/150/200');rep(s[3],'230%','180%');rep(s[0],'135%','120%')}}}
 // 零
 {let p=HP.zero,h=H.zero,s=h?.skills;if(p?.Q&&same(p.Q.damage,[55,85,115,145,175])){p.Q.damage=[65,95,125,155,185];p.Q.ap_ratio=.5;p.R.damage=[120,190,260];p.R.ap_ratio=.55;p.E.cooldown=[22,20.5,19,17.5,16];p.W.damage=[70,100,130,160,190];p.W.ap_ratio=.45;if(p.BASE?.hp_base===570)p.BASE.hp_base=600;if(h.stats.hp===570)h.stats.hp=600;
   if(s){s[0].damage=[65,95,125,155,185];s[0].apRatio=.5;s[3].damage=[120,190,260];s[3].apRatio=.55;s[2].cd=[22,20.5,19,17.5,16];s[1].damage=[70,100,130,160,190];s[1].apRatio=.45;rep(s[1],'55/80/105/130/155','70/100/130/160/190');rep(s[0],'55/85/115/145/175','65/95/125/155/185');rep(s[3],'75/130/185','120/190/260');rep(s[2],'26/24/22/20/18','22/20.5/19/17.5/16')}}}
 // 拉克丝
 {let p=HP.lux,s=H.lux?.skills;if(p?.W&&same(p.W.shield_per_pass,[40,55,70,85,100])){p.W.shield_per_pass=[55,75,95,115,135];p.R.cooldown=[60,48,36];if(s){s[1].shield=[55,75,95,115,135];s[3].cd=[60,48,36];rep(s[1],'40/55/70/85/100','55/75/95/115/135');rep(s[3],'55/42/30','60/48/36')}if(C.ultimateCooldowns?.lux)C.ultimateCooldowns.lux=[60,48,36]}}
 // 盖伦
 {let p=HP.garen,s=H.garen?.skills;if(p?.E&&same(p.E.per_tick_ad_ratio,[.4,.43,.46,.49,.52])){p.E.per_tick_ad_ratio=[.36,.39,.42,.45,.48];if(s){s[2].adRatio=[.36,.39,.42,.45,.48];rep(s[2],'40/43/46/49/52%','36/39/42/45/48%')}}}}
// V20.17 对照全英雄基准（同等级同装备打木桩12秒，对比全体中位数）再校准这四位：
// 源氏 R 额外AD系数 180%→200%（回到中位数附近）；拉克丝 Q 90～270、E +90%AP、R 350/475/600（约为中位数85%，远程安全位）；
// 零 Q +60%AP、冷却7～5秒，W +55%AP（约为中位数80%+，后期靠熵增补足）；盖伦维持上一版。
{let C=window.GAME_CONFIG,HP=C?.heroParams||{},H=C?.heroes||{},J=JSON.stringify,same=(a,b)=>J(a)===J(b),rep=(s,a,b)=>{if(s&&typeof s.desc==='string')s.desc=s.desc.split(a).join(b)};
 {let p=HP.genji,s=H.genji?.skills;if(p?.R&&same(p.R.bonus_ad_ratio,[1.8,1.8,1.8])){p.R.bonus_ad_ratio=[2,2,2];if(s){s[3].bonusAdRatio=[2,2,2];rep(s[3],'180%','200%')}}}
 {let p=HP.lux,s=H.lux?.skills;if(p?.Q&&same(p.Q.damage,[80,120,160,200,240])){p.Q.damage=[90,135,180,225,270];p.Q.ap_ratio=.85;p.E.ap_ratio=.9;p.E.damage=[80,130,180,230,280];p.R.damage=[350,475,600];p.R.ap_ratio=1.3;if(s){s[0].damage=[90,135,180,225,270];s[0].apRatio=.85;s[2].apRatio=.9;s[2].damage=[80,130,180,230,280];s[3].damage=[350,475,600];s[3].apRatio=1.3;rep(s[2],'65/115/165/215/265','80/130/180/230/280');rep(s[0],'80/120/160/200/240','90/135/180/225/270');rep(s[3],'300/400/500','350/475/600')}}}
 {let p=HP.zero,s=H.zero?.skills;if(p?.Q&&p.Q.ap_ratio===.5&&same(p.Q.damage,[65,95,125,155,185])){p.Q.ap_ratio=.7;p.Q.damage=[80,115,150,185,220];p.Q.cooldown=[6,5.5,5,4.5,4];p.W.ap_ratio=.55;p.R.damage=[150,250,350];p.R.ap_ratio=.7;if(s){s[0].apRatio=.7;s[0].damage=[80,115,150,185,220];s[0].cd=[6,5.5,5,4.5,4];s[1].apRatio=.55;s[3].damage=[150,250,350];s[3].apRatio=.7;rep(s[0],'8/7.5/7/6.5/6','6/5.5/5/4.5/4');rep(s[0],'65/95/125/155/185','80/115/150/185/220');rep(s[3],'120/190/260','150/250/350')}}}}
// V20.18 亚索R：冷却 60/45/30；之后15秒内暴击伤害穿透目标额外护甲（总护甲−基础与成长护甲，含装备/技能/队友/符文/龙等全部来源）的 30/40/50%。
{let C=window.GAME_CONFIG,L=C?.heroParams?.yasuo,H=C?.heroes?.yasuo;for(let p of new Set([L,H?.params]))if(p?.R&&p.R.penetration_bonus_armor===.55){p.R.penetration_bonus_armor=[.3,.4,.5];p.R.cooldown=[60,45,30]}
 let r=H?.skills?.[3];if(r&&Array.isArray(L?.R?.penetration_bonus_armor)){r.cd=[60,45,30];if(C.ultimateCooldowns)C.ultimateCooldowns.yasuo=[60,45,30];r.desc='只能对处于合法击飞的英雄使用；范围打击并延长空中控制。之后15秒内，暴击伤害穿透目标30/40/50%的额外护甲。\n基础物理伤害 200/350/500 物理 · 额外AD系数 150% · 冷却 60/45/30 秒 · 延长击飞 1.3 秒 · 暴击穿透额外护甲 30/40/50% · 穿透持续 15 秒'}}
// V20.19 亚索按参考表全面调整：被动护盾125～600；Q 20/45/70/95/120+105%AD（暴击时攻击力部分×暴击倍率：199.5%AD），额外攻速110%时冷却达1.33秒下限；
// W 宽320～600、冷却30～18；E 70～130+20%额外AD+60%AP，每层再+17.5～32.5+5%额外AD+15%AP（最多4层），冷却0.5～0.1，同目标10～6秒；R 冷却70/50/30、距离1400、暴击无视60%额外护甲。
{let C=window.GAME_CONFIG,p=C?.heroParams?.yasuo,H=C?.heroes?.yasuo,s=H?.skills;if(p?.P&&p.P.shield_min===77){
 Object.assign(p.P,{shield_min:125,shield_max:600});Object.assign(p.Q,{damage:[20,45,70,95,120],bonus_as_for_min_cooldown_pct:1.1});Object.assign(p.W,{wall_width:[320,390,460,530,600],cooldown:[30,27,24,21,18]});
 Object.assign(p.E,{damage:[70,85,100,115,130],cooldown:[.5,.4,.3,.2,.1],same_target_lockout:[10,9,8,7,6],stack_damage:[17.5,21.25,25,28.75,32.5],stack_bonus_ad_ratio:.05,stack_ap_ratio:.15,max_stacks:4});
 Object.assign(p.R,{cooldown:[70,50,30],penetration_bonus_armor:[.6,.6,.6],cast_range:1400});
 if(s){s[0].damage=[20,45,70,95,120];s[1].width=[320,390,460,530,600];s[1].cd=[30,27,24,21,18];Object.assign(s[2],{damage:[70,85,100,115,130],cd:[.5,.4,.3,.2,.1],targetLock:[10,9,8,7,6]});s[3].cd=[70,50,30];s[3].range=1400;if(C.ultimateCooldowns)C.ultimateCooldowns.yasuo=[70,50,30];
  s[0].desc='向前戳刺，造成20/45/70/95/120+105%攻击力物理伤害；可以暴击，暴击时造成20/45/70/95/120+199.5%攻击力物理伤害，对命中的首个敌人施加攻击特效。命中叠1层（持续6秒），2层时下一次Q改为发射龙卷风，造成同等伤害并击飞1秒。冲刺中施放改为环形斩击。冷却4秒，随额外攻速缩短，额外攻速110%时达到下限1.33秒。';
  s[1].desc='形成持续4秒的风墙，阻挡敌方飞行道具（防御塔的子弹与光束除外）。宽度320/390/460/530/600，冷却30/27/24/21/18秒。';
  s[2].desc='冲刺穿过一个目标，造成70/85/100/115/130+20%额外攻击力+60%法强魔法伤害；每次施放后5秒内的后续施放每层额外+17.5/21.25/25/28.75/32.5+5%额外攻击力+15%法强，最多叠4层。冷却0.5/0.4/0.3/0.2/0.1秒，对同一目标冷却10/9/8/7/6秒。';
  s[3].desc='传送到1400码内一名浮空的敌方英雄身边，造成200/350/500+150%额外攻击力物理伤害并使附近浮空的敌人继续浮空1秒，获得满剑意并失去所有斩钢闪层数。之后15秒内，暴击无视60%额外护甲。冷却70/50/30秒。'}
 if(H?.passive)H.passive.desc='百折不屈：移动时积攒剑意，剑意满时受到英雄或野怪伤害会获得125～600（随等级）护盾。\n向死而生：暴击几率翻倍，暴击伤害降低；超过100%的暴击几率每1%转化为0.5额外攻击力。'}}
// V20.20 兰顿之兆：无主动，400生命+75护甲；坚如磐石：受到的普攻伤害降低5+0.35%最大生命，至多为该次伤害的40%；暴击抵抗：受到的暴击伤害降低20%。移除“冰冷”叠层。
{let C=window.GAME_CONFIG,p=C?.itemParams?.armor,it=C?.items?.find(i=>i.id==='armor');if(p&&p.crit_damage_reduction===.3){Object.assign(p,{crit_damage_reduction:.2,rock_flat:5,rock_per_max_hp:.0035,rock_cap:.4,ms_per_stack:0,slow_resist_per_stack:0,max_stacks:0,armor:75});if(it){it.stats={...it.stats,armor:75};it.armor=75;it.active=undefined;it.passive='坚如磐石：受到的普攻伤害降低5+0.35%最大生命，至多为该次伤害的40%。暴击抵抗：受到的暴击伤害降低20%。';p.__description=it.passive}}}
// V20.21 兰顿之兆暴击抵抗改为降低30%暴击伤害。
{let C=window.GAME_CONFIG,p=C?.itemParams?.armor,it=C?.items?.find(i=>i.id==='armor');if(p&&p.rock_cap){p.crit_damage_reduction=.3;if(it){it.passive=it.passive.replace('受到的暴击伤害降低20%','受到的暴击伤害降低30%');p.__description=it.passive}}}
// V20.22 全局暴击伤害：默认175%，无尽之刃+35%（210%）；亚索被动固定−10%（165%，出无尽200%）。
{let C=window.GAME_CONFIG;if(C){C.baseCritMultiplier=1.75;let p=C.itemParams?.infinity;if(p)p.standard_crit_multiplier=2.1;let y=C.heroParams?.yasuo;if(y?.P)y.P.crit_damage_penalty=.1;
 let H=C.heroes?.yasuo;if(H?.passive)H.passive.desc=H.passive.desc.replace('暴击几率翻倍，暴击伤害降低；','暴击几率翻倍，暴击伤害固定−10%（默认165%，出无尽之刃200%）；')}}
// V20.23 DIO：Q拳数与W飞刀数随技能等级提升 12/13/14/15/16。
{let C=window.GAME_CONFIG,p=C?.heroParams?.dio,H=C?.heroes?.dio;if(p?.Q&&p.W){p.Q.count_by_rank=[12,13,14,15,16];p.W.count_by_rank=[12,13,14,15,16];
 let s=H?.skills;if(s){s[0].desc=s[0].desc.replace(/10～16拳/g,'12/13/14/15/16拳').replace(/275×110范围内10～16拳/,'275×110范围内12/13/14/15/16拳');s[1].desc=s[1].desc.replace(/10～16(把|枚)?飞刀/g,'12/13/14/15/16把飞刀')}}}
// V20.24 死亡之舞：60攻击力/15技能急速/45护甲；无视痛苦 近战30%、远程10%；蔑视 3秒内受你伤害的英雄阵亡时净化剩余延后伤害，2秒内回复75%额外攻击力。
{let C=window.GAME_CONFIG,p=C?.itemParams?.deathdance,it=C?.items?.find(i=>i.id==='deathdance');if(p&&p.ranged_deferral===.12){Object.assign(p,{ad:60,ranged_deferral:.1,kill_heal_bonus_ad_ratio:.75});if(it){it.stats={...it.stats,attack:60};it.attack=60;it.statText='攻击力 +60 · 护甲 +45 · 技能急速 +15'}}}
// V20.25 DIO R：领域半径150、施法距离400、前摇0.35秒（前摇期间双方可见预警圈）。
{let C=window.GAME_CONFIG,p=C?.heroParams?.dio?.R,s=C?.heroes?.dio?.skills?.[3];if(p&&p.radius===135){p.radius=150;p.cast_range=400;p.windup=.35;if(s){s.radius=150;s.range=400;s.windup=.35;s.desc=s.desc.replace('在385码内指定半径135的领域','在400码内指定半径150的领域（0.35秒前摇，期间敌我双方都能看到即将时停的区域）').replace('施法距离 385 · 范围半径 135','施法距离 400 · 范围半径 150 · 前摇 0.35 秒')}}}
// V20.26 石像鬼面具：30攻击力/350生命/20技能急速；不死之身（原“不屈”）：免疫致命伤害并无敌1.5秒（冷却180秒）；
// 新增不屈：生命低于70%时攻击力+5%，随生命降低线性提高，30%生命时达到+10%。
{let C=window.GAME_CONFIG,p=C?.itemParams?.GARGOYLE_MASK,it=C?.items?.find(i=>i.id==='GARGOYLE_MASK');if(p&&!p.revive_invuln){Object.assign(p,{revive_invuln:1.5,ad_start_ratio:.7,ad_full_ratio:.3,ad_min_pct:.05,ad_max_pct:.1,ad:30,hp:350});
 if(it){it.stats={...it.stats,attack:30,hp:350};it.attack=30;it.hp=350;it.statText='攻击力 +30 · 生命 +350 · 技能急速 +20';it.passive='生命低于75%时受到的治疗效果提升，30%生命时达到+25%。生命低于70%时攻击力+5%～10%。即将受到致命伤害时免疫此次死亡并无敌1.5秒（冷却180秒）。';p.__description=it.passive}}}
// V20.27 技能距离/范围按本作地图比例（远程普攻375≈端游550，约0.68）校正：
// 拉克丝 Q 1300→850、W 1175→800、E 1100→750/半径310→210、R 3400→2300/宽200→140；D.Va 自毁半径/射程 1000→700；Claude Q 900→700。
{let C=window.GAME_CONFIG,HP=C?.heroParams||{},H=C?.heroes||{},rep=(s,a,b)=>{if(s&&typeof s.desc==='string')s.desc=s.desc.split(a).join(b)};
 {let p=HP.lux,s=H.lux?.skills;if(p?.Q?.range===1300){p.Q.range=850;p.W.range=800;p.E.range=750;p.E.radius=210;p.R.range=2300;p.R.width=140;
  if(s){s[0].range=850;s[1].range=800;s[2].range=750;s[2].radius=210;s[3].range=2300;s[3].width=140;for(let [a,b] of [['1300','850'],['1175','800'],['1100','750'],['310','210'],['3400','2300']])for(let k of s)rep(k,a,b);rep(s[3],'宽度 200','宽度 140')}}}
 {let p=HP.dva,s=H.dva?.skills;if(p?.R?.radius===1000){p.R.radius=700;p.R.range=700;if(s?.[3]){s[3].radius=700;s[3].range=700;rep(s[3],'1000','700')}}}
 {let p=HP.claude,s=H.claude?.skills;if(p?.Q&&s?.[0]?.range===900){s[0].range=700;for(let f of ['haiku','sonnet','opus','fable'])if(p.Q[f]){if(p.Q[f].line_length===700)p.Q[f].line_length=600;if(p.Q[f].range_max===1000)p.Q[f].range_max=800}}}}
// V20.28 D.Va 自毁：300/400/500+30%额外生命 真实伤害；对小兵/野怪伤害60%。
{let C=window.GAME_CONFIG,p=C?.heroParams?.dva?.R,s=C?.heroes?.dva?.skills?.[3];if(p&&p.base_damage?.[0]===800&&p.bonus_hp_ratio===.5){Object.assign(p,{base_damage:[300,400,500],bonus_hp_ratio:.3,nonhero_damage_multiplier:.6,damage_type:'true'});
 if(s){s.damage=[300,400,500];s.damageType='true';s.desc=s.desc.replace('800/1000/1200+50%释放前机甲额外生命魔法伤害','300/400/500+30%释放前机甲额外生命真实伤害').replace('对小兵/野怪最终伤害降低20%','对小兵/野怪造成60%伤害').replace('基础伤害 800/1000/1200','基础伤害 300/400/500')}}}
