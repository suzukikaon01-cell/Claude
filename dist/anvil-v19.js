/* V19 原创英雄「砧岳 · 崩山拳」：近战重拳战士。
 *
 * 本文件分两部分：
 *  1. 载入时把英雄数据注入 GAME_CONFIG（不改 Excel，便于单独调整）；
 *  2. installAnvil(m,env)：挂接公共施法/伤害/位移/控制服务，实现 P/Q/W/E/R。
 *
 * Q 崩山冲拳：方向突进，撞到的第一个敌人被击退；击退途中撞上墙体或防御塔 → 眩晕并再受一次同等伤害（双倍）。
 * W 镇岳格挡：朝一个方向举拳格挡，正面伤害 -50%；累计格挡足够伤害后，下一次 Q 强化（更远、更痛、击退更远）。
 * E 裂地坠击：跃向目标点，落地范围伤害 + 减速 + 短暂击飞。
 * R 天陨：升空，不可选中、免疫伤害与控制；落地对大范围造成伤害与减速，中心 275 码满伤并击飞，外圈随距离衰减到 30%、只减速。
 * P 余震：技能命中敌方英雄时获得短暂护盾（每次施法最多一次）。
 */
(()=>{'use strict';
const ID='anvil',C=window.GAME_CONFIG;if(!C||!C.heroes)return;
const lv=(a,b,n=5)=>Array.from({length:n},(_,i)=>+(a+(b-a)*i/(n-1)).toFixed(3));
const P={
 BASE:{resource_type:'ENERGY',max_energy:200,energy_regen:10,hp_base:690,hp_growth:118,mana_base:0,mana_growth:0,ad_base:64,ad_growth:3.8,armor_base:40,armor_growth:4.8,mr_base:34,mr_growth:2.1,as_base:.65,as_ratio:.65,as_growth:.02,move_speed:218,attack_range:150,is_ranged:0,hero_name:'砧岳'},
 P:{energy_on_attack:20,energy_attack_window:4,energy_on_block:50,energy_on_empowered_slam:60,shield_base:30,shield_per_level:9,shield_maxhp_pct:.03,shield_duration:2.5},
 Q:{charge_max:1,min_charge_ratio:.45,min_damage_ratio:.6,min_knockback:150,charge_self_slow:.3,splash_radius:250,damage:lv(80,200),ad_ratio:.4,maxhp_ratio:.04,missing_hp_base_pct:.08,missing_hp_pct_per_100_bonus_ad:.03,missing_hp_monster_cap:300,dash_range:425,dash_duration:.3,knockback:300,knockback_duration:.25,wall_stun:.75,wall_damage_multiplier:2,hit_radius:55,cooldown:lv(9,5),energy_cost:lv(50,30),
    empowered_damage_multiplier:1.3,empowered_range:425,empowered_knockback:360,empowered_window:6},
 W:{duration:1.5,interrupt_grace:.12,empower_incoming_damage:150,reduction:.5,arc_degrees:120,self_slow:.4,cooldown:lv(14,10),energy_cost:lv(60,40)},
 E:{range:450,leap_duration:.4,radius:320,cone_degrees:110,pull_to:110,pull_duration:.2,damage:lv(90,250),ad_ratio:.4,maxhp_ratio:.05,slow:.3,slow_duration:1.5,knockup:.4,cooldown:lv(12,8),energy_cost:lv(60,40)},
 R:{range:0,flight:2.5,move_speed_bonus:1,radius:600,core_radius:275,damage:[300,450,600],bonus_ad_ratio:.6,maxhp_ratio:.1,min_falloff:.3,knockup:.5,core_slow:.4,outer_slow:.3,slow_duration:2,cooldown:[110,90,70],energy_cost:100}
};
const skill=(o)=>({maxRank:5,windup:0,recovery:.1,damageType:'physical',heroOnly:false,...o});
C.heroes[ID]={name:'砧岳',title:'崩山拳',role:'重装战士 / 先手',resource:'energy',color:'#c7873f',
 stats:{hp:P.BASE.hp_base,mana:P.BASE.mana_base,attack:P.BASE.ad_base,ap:0,armor:P.BASE.armor_base,mr:P.BASE.mr_base,baseAS:P.BASE.as_base,asRatio:P.BASE.as_ratio,speed:P.BASE.move_speed,range:P.BASE.attack_range,hpRegen:8,manaRegen:0,
  growth:{hp:P.BASE.hp_growth,mana:P.BASE.mana_growth,attack:P.BASE.ad_growth,armor:P.BASE.armor_growth,mr:P.BASE.mr_growth,as:P.BASE.as_growth,hpRegen:.6,manaRegen:0}},
 passive:{name:'余震',desc:'能量英雄（上限200，每秒回复10）。技能命中敌方英雄时获得30+9×等级+3%最大生命护盾，持续2.5秒，每次施法最多触发一次。技能命中敌人后4秒内，普攻命中回复20能量；W格挡伤害达到阈值时回复50能量；强化Q把敌人锤到墙体/防御塔上眩晕时回复60能量。能量消耗：Q 50/45/40/35/30，W 60/55/50/45/40，E 60/55/50/45/40，R 固定100。',params:P.P},
 skills:[
  skill({key:'Q',name:'崩山冲拳',icon:'拳',target:'direction',range:425,width:110,cd:P.Q.cooldown,mana:0,damage:P.Q.damage,
   desc:'按住蓄力（最长1秒），松手朝指定方向突进（可穿墙：越过墙体厚度2/3即可穿过）：蓄力越久，突进距离（190→425码）、伤害（60%→100%）和击退距离（150→300码）越高。撞到的第一个敌人受到80/110/140/170/200+40%AD+4%自身最大生命物理伤害，外加目标已损失生命8%（每100额外AD +3%）的伤害（对野怪最多300），并被击退。被击退途中撞上墙体或防御塔：眩晕0.75秒，并再受一次同等伤害（共双倍）。强化Q：自动满蓄力、伤害×1.3、击退360码，命中后对目标周围250码内的敌人同样造成伤害并一起击退。'}),
  skill({key:'W',name:'镇岳格挡',icon:'挡',target:'direction',range:0,cd:P.W.cooldown,mana:0,damage:0,
   desc:'朝指定方向格挡1.5秒，期间移速-40%，移动不会改变朝向。来自正面120°的伤害降低50%。格挡期间正面受到的伤害累计达到150点时，立刻获得强化Q（Q冷却直接刷新，仍需消耗能量）。会被控制技能打断；打断时那一下的伤害若已使累计达到150点，仍会获得强化Q。施放Q会提前结束格挡。'}),
  skill({key:'E',name:'裂地坠击',icon:'砸',target:'area',range:450,radius:320,cd:P.E.cooldown,mana:0,damage:P.E.damage,
   desc:'跃向目标点并锤击地面，对落地前方110°扇形、320码内的敌人造成90/130/170/210/250+40%AD+5%自身最大生命物理伤害，减速30%持续1.5秒，将其拉向砧岳身前并击飞0.4秒。'}),
  skill({key:'R',name:'天陨',icon:'陨',target:'self',range:0,radius:600,maxRank:3,heroOnly:false,cd:P.R.cooldown,mana:0,damage:P.R.damage,
   desc:'升空2.5秒，期间不可选中、免疫伤害与控制，移动速度提高100%，可用摇杆或方向键控制落点；随后在当前位置坠落：600码内敌人受到300/450/600+60%额外AD+10%自身最大生命物理伤害并减速。中心275码内100%伤害、击飞0.5秒、减速40%；275码外伤害随距离线性递减至最低30%，不击飞，仅减速30%，减速持续2秒。落地后获得强化Q（Q冷却直接刷新）。'})
 ],params:P};
C.heroParams??={};C.heroParams[ID]=P;
if(C.ultimateCooldowns)C.ultimateCooldowns[ID]=P.R.cooldown;
if(window.ChampionStats)ChampionStats[ID]=C.heroes[ID].stats;
if(window.ChampionAbilities)ChampionAbilities[ID]=C.heroes[ID].skills;

window.installAnvil=function(m,env){
 const core=m.core,now=env.time,units=env.units,alive=t=>t&&t.hp>0&&!(t.death>0),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const rk=(u,i)=>Math.max(1,u.skillRanks?.[i]||1),at=(arr,u,i)=>Array.isArray(arr)?arr[Math.min(arr.length,rk(u,i))-1]:arr;
 const bonusAD=u=>Math.max(0,u.attack-(u.baseAttack??u.attack));
 const S=u=>u.anvilState??={dash:null,block:null,blocked:0,empoweredUntil:0,leap:null,flight:null,pending:[],shieldCast:null,visuals:[]};
 const foe=(u,t)=>alive(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0)&&!t.tentacle&&!t.spiritOwner;
 const champ=t=>t?.type==='hero'&&!t.clone&&!t.dvaBomb;
 function fx(u,kind,p,data={}){let v=S(u).visuals;v.push({kind,x:p.x,y:p.y,started:now(),until:now()+(data.life||.45),...data});if(v.length>24)v.shift()}
 function aftershock(u,t,e){if(!champ(t))return;let s=S(u);if(s.shieldCast===e?.castId)return;s.shieldCast=e?.castId;m.shield(u,P.P.shield_base+P.P.shield_per_level*(u.level||1)+P.P.shield_maxhp_pct*u.maxHp,P.P.shield_duration,u,{tag:'ANVIL_AFTERSHOCK'})}
 function costOf(u,i){let c=P['QWER'[i]].energy_cost;return Array.isArray(c)?at(c,u,i):c}
 function gain(u,n){if(u.resourceType!=='ENERGY')return;u.energy=Math.min(u.maxEnergy||P.BASE.max_energy,(u.energy||0)+n)}
 function hit(u,t,amount,e,extra={}){let ok=m.deal(t,amount,u,'physical',{event:e,...extra});if(ok){aftershock(u,t,e);S(u).energyWindow=now()+P.P.energy_attack_window}return ok}

 // ---- Q：突进 → 第一个命中目标 → 击退，撞墙/塔则眩晕 + 再一次同等伤害 ----
 function chargeRatio(u){let c=S(u).charging;return c?Math.min(1,Math.max(0,(now()-c.start)/P.Q.charge_max)):0}
 function canQ(u){return alive(u)&&u.skillRanks?.[0]>0&&m.abilityCooldownRemaining(u,0)<=0&&(u.resourceType!=='ENERGY'||u.energy>=costOf(u,0))&&!S(u).flight&&!S(u).leap&&!S(u).dash}
 function beginCharge(u){let s=S(u);if(!canQ(u)||s.charging)return false;s.charging={start:now()};if(s.empoweredUntil<=now())m.slow(u,P.Q.charge_self_slow,P.Q.charge_max+3,u,null,'anvil-q-charge:'+u.id);return true}
 function cancelCharge(u){let s=S(u);s.charging=null;core.remove(u,x=>x.uniqueKey==='anvil-q-charge:'+u.id,'anvil-q-release')}
 function startQ(u,c,e){let s=S(u),emp=s.empoweredUntil>now(),k=emp?1:chargeRatio(u);cancelCharge(u);s.empoweredUntil=0;s.block=null;core.remove(u,x=>x.uniqueKey==='anvil-w-slow:'+u.id,'anvil-q');
  let lerp=(a,b)=>a+(b-a)*k,range=(emp?P.Q.empowered_range:P.Q.dash_range)*lerp(P.Q.min_charge_ratio,1),to={x:u.x+Math.cos(c.angle)*range,y:u.y+Math.sin(c.angle)*range},dur=P.Q.dash_duration*range/P.Q.dash_range;
  let damage=(at(P.Q.damage,u,0)+P.Q.ad_ratio*u.attack+P.Q.maxhp_ratio*u.maxHp)*lerp(P.Q.min_damage_ratio,1)*(emp?P.Q.empowered_damage_multiplier:1);
  s.dash={angle:c.angle,event:e,damage,knockback:emp?P.Q.empowered_knockback:lerp(P.Q.min_knockback,P.Q.knockback),until:now()+dur,empowered:emp,charge:k};
  core.startDisplacement(u,to,{type:'LEAP',duration:dur,source:u,abilityId:0});fx(u,'qtrail',u,{angle:c.angle,length:range,empowered:emp,life:.4})}
 function tickQ(u){let s=S(u),d=s.dash;if(!d)return;if(now()>d.until||!u.displacement){s.dash=null;return}
  let t=m.nearest(u,P.Q.hit_radius+60,v=>foe(u,v)&&dist(u,v)<=P.Q.hit_radius+(v.radius||25));if(!t)return;
  s.dash=null;u.displacement=null;if(env.blocked(u.x,u.y,u.radius||22)){let q=C.map.nearestLegal?.(u,u.radius||22);if(q){u.x=q.x;u.y=q.y}}knock(u,t,d)}
 function missingBonus(u,t){let pct=P.Q.missing_hp_base_pct+P.Q.missing_hp_pct_per_100_bonus_ad*bonusAD(u)/100,v=pct*Math.max(0,t.maxHp-t.hp);return t.type==='monster'?Math.min(P.Q.missing_hp_monster_cap,v):v}
 function knock(u,t,d,splash=true){let e=d.event;if(splash&&d.empowered){for(let v of m.nearby(t,P.Q.splash_radius+60,v=>foe(u,v)&&v!==t))if(dist(v,t)<=P.Q.splash_radius+(v.radius||0))knock(u,v,d,false);env.ring(t.x,t.y,P.Q.splash_radius,'#9fd8ff',.4);fx(u,'thunder',t,{radius:P.Q.splash_radius,life:.5})}d={...d,damage:d.damage+missingBonus(u,t)*(d.empowered?P.Q.empowered_damage_multiplier:1)};if(!hit(u,t,d.damage,e,{once:true,hitIndex:0,abilityId:0}))return;if(!alive(t))return;
  let desired={x:t.x+Math.cos(d.angle)*d.knockback,y:t.y+Math.sin(d.angle)*d.knockback},end=core.safePoint(t,desired,t.radius||22),wall=dist(end,desired)>24;
  let moved=core.startDisplacement(t,end,{type:'KNOCKBACK',duration:P.Q.knockback_duration,source:u,abilityId:0});if(!moved)return;
  S(u).pending.push({kind:'impact',empowered:!!d.empowered,at:now()+P.Q.knockback_duration*Math.max(.15,dist(t,end)/Math.max(1,d.knockback)),target:t,life:t._life||0,wall,damage:d.damage*(P.Q.wall_damage_multiplier-1),event:e})}

 // ---- W：方向格挡 ----
 function startW(u,c){let s=S(u);s.block={angle:c.angle,until:now()+P.W.duration};s.blocked=0;s.blockedIncoming=0;m.slow(u,P.W.self_slow,P.W.duration,u,null,'anvil-w-slow:'+u.id);fx(u,'block',u,{angle:c.angle,life:P.W.duration})}
 function empowerQ(u){let s=S(u);s.empoweredUntil=now()+P.Q.empowered_window;u.cd[0]=0;if(u.player)env.toast?.('崩山冲拳已强化');env.ring(u.x,u.y,70,'#9fd8ff',.4)}
 function blocking(t,source){let b=S(t).block;if(!b||b.broken||now()>b.until||!source)return false;let a=Math.atan2(source.y-t.y,source.x-t.x)-b.angle;a=Math.atan2(Math.sin(a),Math.cos(a));return Math.abs(a)<=P.W.arc_degrees*Math.PI/360}

 // ---- E：跃击 ----
 function startE(u,c,e){let to={x:c.p.x,y:c.p.y};if(dist(u,to)>P.E.range){let a=Math.atan2(to.y-u.y,to.x-u.x);to={x:u.x+Math.cos(a)*P.E.range,y:u.y+Math.sin(a)*P.E.range}}
  let ang=dist(u,to)>5?Math.atan2(to.y-u.y,to.x-u.x):(u.angle||0);core.startDisplacement(u,to,{type:'LEAP',duration:P.E.leap_duration,source:u,abilityId:2});S(u).leap={start:now(),end:now()+P.E.leap_duration,event:e,angle:ang};u.anvilLift={start:now(),end:now()+P.E.leap_duration,height:120}}
 function inCone(u,t,angle,radius,deg){let d=dist(u,t);if(d>radius+(t.radius||0))return false;if(d<(t.radius||25)+30)return true;let a=Math.atan2(t.y-u.y,t.x-u.x)-angle;a=Math.atan2(Math.sin(a),Math.cos(a));return Math.abs(a)<=deg*Math.PI/360+Math.asin(Math.min(1,(t.radius||0)/Math.max(d,1)))}
 function landE(u,l){let damage=at(P.E.damage,u,2)+P.E.ad_ratio*u.attack+P.E.maxhp_ratio*u.maxHp,angle=l.angle,front={x:u.x+Math.cos(angle)*P.E.pull_to,y:u.y+Math.sin(angle)*P.E.pull_to};u.angle=angle;
  for(let t of m.nearby(u,P.E.radius+80,v=>foe(u,v))){if(!inCone(u,t,angle,P.E.radius,P.E.cone_degrees))continue;if(!hit(u,t,damage,l.event,{once:true,abilityId:2}))continue;if(!alive(t))continue;m.slow(t,P.E.slow,P.E.slow_duration,u,null,'anvil-e:'+u.id);
   if(dist(t,front)>40)core.startDisplacement(t,front,{type:'PULL',duration:P.E.pull_duration,source:u,abilityId:2});S(u).pending.push({kind:'knockup',at:now()+P.E.pull_duration,target:t,life:t._life||0})}
  fx(u,'cone',u,{angle,radius:P.E.radius,deg:P.E.cone_degrees,life:.5})}

 // ---- R：升空 → 坠落 ----
 function startR(u,c,e){let s=S(u);cancelCharge(u);s.flight={start:now(),land:now()+P.R.flight,event:e};u.untargetable=1;u.invulnerable=P.R.flight+.1;core.apply(u,'CC_IMMUNITY',P.R.flight+.05,u,{uniqueKey:'anvil-r-immune:'+u.id,abilityId:3});
  u.anvilLift={start:now(),end:now()+P.R.flight,height:900,hold:true};s.block=null;s.dash=null;u.displacement=null;u.recall=0;m.recalc(u)}
 function falloff(d){if(d<=P.R.core_radius)return 1;return Math.max(P.R.min_falloff,1-(1-P.R.min_falloff)*(d-P.R.core_radius)/(P.R.radius-P.R.core_radius))}
 function landR(u,f){let p={x:u.x,y:u.y};u.untargetable=0;u.invulnerable=0;u.anvilLift=null;m.recalc(u);empowerQ(u);
  let base=at(P.R.damage,u,3)+P.R.bonus_ad_ratio*bonusAD(u)+P.R.maxhp_ratio*u.maxHp;
  for(let t of m.nearby(p,P.R.radius+80,v=>foe(u,v))){let d=Math.max(0,dist(p,t)-(t.radius||0));if(d>P.R.radius)continue;let ratio=falloff(d),core_=d<=P.R.core_radius;
   if(!hit(u,t,base*ratio,f.event,{once:true,abilityId:3}))continue;if(!alive(t))continue;
   m.slow(t,core_?P.R.core_slow:P.R.outer_slow,P.R.slow_duration,u,null,'anvil-r:'+u.id);if(core_)m.control(t,'AIRBORNE',P.R.knockup,u,{abilityId:3})}
  env.ring(p.x,p.y,P.R.radius,'#f0a24b',.6);env.ring(p.x,p.y,P.R.core_radius,'#ffd27a',.6);fx(u,'meteor',p,{radius:P.R.radius,life:.7})}

 m.registerBehavior(ID,(u,c,skill,e)=>{if(c.i===0)startQ(u,c,e);else if(c.i===1)startW(u,c);else if(c.i===2)startE(u,c,e);else if(c.i===3)startR(u,c,e)},{attackTiming:{windup:.24,recovery:.16}});

 m.heroHooks[ID]={
  tick(u,dt){let s=S(u);tickQ(u);if(u.resourceType==='ENERGY'&&dt>0)gain(u,P.BASE.energy_regen*dt);
   if(s.leap&&now()>=s.leap.end){let l=s.leap;s.leap=null;u.anvilLift=null;landE(u,l)}
   if(s.flight){u.untargetable=1;u.invulnerable=Math.max(u.invulnerable||0,.1);if(now()>=s.flight.land){let f=s.flight;s.flight=null;landR(u,f)}}
   if(s.block&&(s.block.broken?now()>s.block.graceUntil:now()>s.block.until))s.block=null;if(s.block&&!s.block.broken)u.angle=s.block.angle;if(s.charging&&(!alive(u)||u.skillRanks[0]<1))cancelCharge(u);
   s.pending=s.pending.filter(q=>{if(now()<q.at)return true;let t=q.target;if(!alive(t)||(t._life||0)!==q.life)return false;if(q.kind==='knockup'){m.control(t,'AIRBORNE',P.E.knockup,u,{abilityId:2});return false}
    if(q.wall){hit(u,t,q.damage,q.event,{abilityId:0,wallSlam:true});if(alive(t))m.control(t,'STUN',P.Q.wall_stun,u,{abilityId:0});if(q.empowered)gain(u,P.P.energy_on_empowered_slam);env.ring(t.x,t.y,90,'#ffcf7a',.35);fx(u,'slam',t)}return false});
   s.visuals=s.visuals.filter(v=>v.until>now())},
  canMove(u){let s=S(u);return !(s.leap||s.dash)},
  derive(u){u.resourceType='ENERGY';u.maxEnergy=P.BASE.max_energy;u.energy=Math.min(u.maxEnergy,Math.max(0,u.energy??u.maxEnergy));if(S(u).flight)u.speed*=1+P.R.move_speed_bonus},
  attackHit(u,t){if(S(u).energyWindow>now()&&t&&t.team!==u.team)gain(u,P.P.energy_on_attack)},
  reduceDamage(t,value,source){let s=S(t),b=s.block;if(!b||!source)return value;let front=(()=>{let a=Math.atan2(source.y-t.y,source.x-t.x)-b.angle;a=Math.atan2(Math.sin(a),Math.cos(a));return Math.abs(a)<=P.W.arc_degrees*Math.PI/360})();if(!front)return value;
   let live=!b.broken&&now()<=b.until,grace=b.broken&&now()<=b.graceUntil;if(!live&&!grace)return value;
   s.blockedIncoming=(s.blockedIncoming||0)+value;if(s.blockedIncoming>=P.W.empower_incoming_damage&&!b.empowered){b.empowered=true;empowerQ(t);gain(t,P.P.energy_on_block)}
   if(!live)return value;let absorbed=value*P.W.reduction;s.blocked+=absorbed;s.blockFlash=now();return value-absorbed},
  validate(u,i){let s=S(u);if(s.flight||s.leap)return false;return true},
  interrupt(u,reason){let s=S(u);s.dash=null;if(s.block&&!s.block.broken&&now()<=s.block.until){s.block.broken=true;s.block.graceUntil=now()+P.W.interrupt_grace;core.remove(u,x=>x.uniqueKey==='anvil-w-slow:'+u.id,'anvil-w-broken')}cancelCharge(u)},
  reset(u){u.anvilState=null;u.anvilLift=null;u.untargetable=0}
 };

 function sector(ctx,x,y,angle,radius,deg,fill,stroke,width=3){let h=deg*Math.PI/360;ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,radius,angle-h,angle+h);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
 function qPreview(ctx,u,angle){let s=S(u),emp=s.empoweredUntil>now(),k=emp?1:chargeRatio(u),max=emp?P.Q.empowered_range:P.Q.dash_range,r=max*(P.Q.min_charge_ratio+(1-P.Q.min_charge_ratio)*k);
  ctx.save();ctx.translate(u.x,u.y);ctx.rotate(angle);ctx.fillStyle='#e0a05218';ctx.strokeStyle='#e0a05266';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.strokeRect(0,-55,max,110);ctx.setLineDash([]);
  ctx.fillStyle=emp?'#7fc8ff40':'#ffb34740';ctx.fillRect(0,-55,r,110);ctx.strokeStyle=emp?'#bfe6ff':'#ffd27a';ctx.lineWidth=3;ctx.strokeRect(0,-55,r,110);if(emp){ctx.beginPath();ctx.arc(r,0,P.Q.splash_radius,0,Math.PI*2);ctx.strokeStyle='#9fd8ff88';ctx.setLineDash([6,6]);ctx.stroke();ctx.setLineDash([])}ctx.restore()}
 function draw(ctx){for(let u of units())if(u.hero===ID&&alive(u)){let s=S(u),t=now();
   if(s.block&&!s.block.broken){let a=s.block.angle,flash=s.blockFlash&&t-s.blockFlash<.15,prog=Math.min(1,(s.blockedIncoming||0)/P.W.empower_incoming_damage);
    ctx.save();let g=ctx.createRadialGradient(u.x,u.y,30,u.x,u.y,230);g.addColorStop(0,flash?'#ffe9b0aa':'#ffd27a66');g.addColorStop(1,'#ffd27a00');sector(ctx,u.x,u.y,a,230,P.W.arc_degrees,g,null);
    sector(ctx,u.x,u.y,a,230,P.W.arc_degrees,null,'#ffd27a88',2);ctx.beginPath();ctx.arc(u.x,u.y,95,a-P.W.arc_degrees*Math.PI/360,a+P.W.arc_degrees*Math.PI/360);ctx.strokeStyle=flash?'#fff6d8':'#ffd27a';ctx.lineWidth=14;ctx.lineCap='round';ctx.stroke();
    ctx.beginPath();ctx.arc(u.x,u.y,118,a-P.W.arc_degrees*Math.PI/360,a-P.W.arc_degrees*Math.PI/360+prog*P.W.arc_degrees*Math.PI/180);ctx.strokeStyle=prog>=1?'#9fd8ff':'#ffb347';ctx.lineWidth=5;ctx.stroke();ctx.restore()}
   if(s.empoweredUntil>t){ctx.save();ctx.strokeStyle='#9fd8ff';ctx.lineWidth=3;for(let i=0;i<5;i++){let a=t*5+i*1.257,r1=46,r2=66;ctx.beginPath();ctx.moveTo(u.x+Math.cos(a)*r1,u.y+Math.sin(a)*r1);ctx.lineTo(u.x+Math.cos(a+.15)*(r1+10),u.y+Math.sin(a+.15)*(r1+10)-6);ctx.lineTo(u.x+Math.cos(a+.05)*r2,u.y+Math.sin(a+.05)*r2);ctx.stroke()}ctx.restore()}
   if(s.charging&&!u.player)qPreview(ctx,u,u.angle||0);
   if(s.flight){let k=Math.min(1,(t-s.flight.start)/P.R.flight);ctx.beginPath();ctx.arc(u.x,u.y,P.R.radius,0,Math.PI*2);ctx.fillStyle='#f0a24b14';ctx.fill();ctx.strokeStyle='#f0a24b99';ctx.lineWidth=4;ctx.stroke();ctx.beginPath();ctx.arc(u.x,u.y,P.R.core_radius,0,Math.PI*2);ctx.fillStyle='#ffd27a'+(k>.75?'45':'22');ctx.fill();ctx.beginPath();ctx.arc(u.x,u.y,P.R.radius*k,0,Math.PI*2);ctx.strokeStyle='#ffe2a8';ctx.lineWidth=2;ctx.stroke()}
   for(let v of s.visuals){let k=(t-v.started)/(v.until-v.started);ctx.save();ctx.globalAlpha=Math.max(0,1-k);ctx.translate(v.x,v.y);
    if(v.kind==='qtrail'){ctx.rotate(v.angle);ctx.fillStyle=v.empowered?'#7fc8ff55':'#e0a05240';ctx.fillRect(0,-30,v.length,60)}
    else if(v.kind==='slam'){ctx.strokeStyle='#ffcf7a';ctx.lineWidth=6;for(let i=0;i<6;i++){let a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(Math.cos(a)*30,Math.sin(a)*30);ctx.lineTo(Math.cos(a)*(60+k*40),Math.sin(a)*(60+k*40));ctx.stroke()}}
    else if(v.kind==='thunder'){ctx.strokeStyle='#bfe6ff';ctx.lineWidth=4;for(let i=0;i<8;i++){let a=i*Math.PI/4+v.started,r=v.radius*(.4+.6*k);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a+.2)*r*.5,Math.sin(a+.2)*r*.5);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke()}}
    else if(v.kind==='cone')sector(ctx,0,0,v.angle,v.radius*(.6+.4*k),v.deg,'#e0a05240','#ffcf7a',6);
    else if(v.kind==='quake'||v.kind==='meteor'){ctx.beginPath();ctx.arc(0,0,v.radius*(.6+.4*k),0,Math.PI*2);ctx.strokeStyle=v.kind==='meteor'?'#ffb347':'#e0a052';ctx.lineWidth=v.kind==='meteor'?12:7;ctx.stroke()}
    ctx.restore()}}}
 function aim(ctx,u,i,point){let a=Math.atan2(point.y-u.y,point.x-u.x);if(i===0){qPreview(ctx,u,a);return true}
  if(i===2){let d=Math.min(P.E.range,dist(u,point)),p={x:u.x+Math.cos(a)*d,y:u.y+Math.sin(a)*d};ctx.beginPath();ctx.arc(u.x,u.y,P.E.range,0,Math.PI*2);ctx.strokeStyle='#e0a05266';ctx.lineWidth=2;ctx.stroke();sector(ctx,p.x,p.y,a,P.E.radius,P.E.cone_degrees,'#e0a05230','#ffcf7a',2);return true}
  if(i===3){ctx.beginPath();ctx.arc(u.x,u.y,P.R.radius,0,Math.PI*2);ctx.fillStyle='#f0a24b18';ctx.fill();ctx.strokeStyle='#f0a24b';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(u.x,u.y,P.R.core_radius,0,Math.PI*2);ctx.fillStyle='#ffd27a30';ctx.fill();return true}
  if(i===1){sector(ctx,u.x,u.y,a,230,P.W.arc_degrees,'#ffd27a30','#ffd27a',2);return true}return false}
 function bot(u,t){let s=S(u);if(s.flight){if(t){u.dest={x:t.x,y:t.y}}return true}if(s.leap||s.dash||!t)return true;let d=dist(u,t),ready=i=>u.skillRanks[i]&&m.abilityCooldownRemaining(u,i)<=0&&(u.energy??999)>=costOf(u,i);
  if(s.charging){if(chargeRatio(u)>=s.botCharge||d>P.Q.dash_range*1.1)return m.requestCast(u,0,{x:t.x,y:t.y,target:t});return true}
  if(champ(t)&&ready(3)&&d<=500&&t.hp/t.maxHp<.55)return m.requestCast(u,3,u);
  if(ready(1)&&champ(t)&&now()-(u.lastHit||-9)<.6&&d<700)return m.requestCast(u,1,{x:t.x,y:t.y,target:t});
  if(ready(0)&&d<=P.Q.dash_range*.95){if(s.empoweredUntil>now())return m.requestCast(u,0,{x:t.x,y:t.y,target:t});s.botCharge=Math.min(1,Math.max(.2,(d-P.Q.dash_range*P.Q.min_charge_ratio)/(P.Q.dash_range*(1-P.Q.min_charge_ratio))+.15));return beginCharge(u)}
  if(ready(2)&&d<=P.E.range+60)return m.requestCast(u,2,{x:t.x,y:t.y,target:t});return false}
 m.anvil={gain,costOf,state:S,missingBonus,falloff,beginCharge,cancelCharge,chargeRatio,qEmpowered:u=>S(u).empoweredUntil>now(),blocking,draw,aim,bot,params:P};
};
})();
