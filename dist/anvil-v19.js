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
 BASE:{hp_base:690,hp_growth:118,mana_base:300,mana_growth:40,ad_base:64,ad_growth:3.8,armor_base:40,armor_growth:4.8,mr_base:34,mr_growth:2.1,as_base:.65,as_ratio:.65,as_growth:.02,move_speed:218,attack_range:150,is_ranged:0,hero_name:'砧岳'},
 P:{shield_base:30,shield_per_level:9,shield_maxhp_pct:.03,shield_duration:2.5},
 Q:{damage:lv(80,200),ad_ratio:.4,maxhp_ratio:.04,missing_hp_base_pct:.08,missing_hp_pct_per_100_bonus_ad:.03,missing_hp_monster_cap:300,dash_range:500,dash_duration:.32,knockback:300,knockback_duration:.25,wall_stun:.75,wall_damage_multiplier:2,hit_radius:55,cooldown:lv(9,5),mana:lv(40,50),
    empowered_damage_multiplier:1.5,empowered_range:650,empowered_knockback:420,empowered_window:6},
 W:{duration:1.25,reduction:.5,arc_degrees:120,self_slow:.4,empower_threshold:lv(120,280),empower_threshold_maxhp_pct:.05,cooldown:lv(14,10),mana:lv(40,60)},
 E:{range:450,leap_duration:.4,radius:250,damage:lv(90,250),ad_ratio:.4,maxhp_ratio:.05,slow:.3,slow_duration:1.5,knockup:.4,cooldown:lv(12,8),mana:lv(45,65)},
 R:{range:1000,flight:1.6,radius:600,core_radius:275,damage:[300,450,600],bonus_ad_ratio:.6,maxhp_ratio:.1,min_falloff:.3,knockup:.5,core_slow:.4,outer_slow:.3,slow_duration:2,cooldown:[110,90,70]}
};
const skill=(o)=>({maxRank:5,windup:0,recovery:.1,damageType:'physical',heroOnly:false,...o});
C.heroes[ID]={name:'砧岳',title:'崩山拳',role:'重装战士 / 先手',resource:'mana',color:'#c7873f',
 stats:{hp:P.BASE.hp_base,mana:P.BASE.mana_base,attack:P.BASE.ad_base,ap:0,armor:P.BASE.armor_base,mr:P.BASE.mr_base,baseAS:P.BASE.as_base,asRatio:P.BASE.as_ratio,speed:P.BASE.move_speed,range:P.BASE.attack_range,hpRegen:8,manaRegen:7,
  growth:{hp:P.BASE.hp_growth,mana:P.BASE.mana_growth,attack:P.BASE.ad_growth,armor:P.BASE.armor_growth,mr:P.BASE.mr_growth,as:P.BASE.as_growth,hpRegen:.6,manaRegen:.5}},
 passive:{name:'余震',desc:'技能命中敌方英雄时获得30+9×等级+3%最大生命护盾，持续2.5秒；每次施法最多触发一次。',params:P.P},
 skills:[
  skill({key:'Q',name:'崩山冲拳',icon:'拳',target:'direction',range:500,width:110,cd:P.Q.cooldown,mana:P.Q.mana,damage:P.Q.damage,
   desc:'朝指定方向突进500码，撞到的第一个敌人受到80/110/140/170/200+40%AD+4%自身最大生命物理伤害，外加目标已损失生命8%（每100额外AD +3%）的物理伤害（对野怪最多300），并被击退300码。击退途中撞上墙体或防御塔：眩晕0.75秒，并再受一次同等伤害（共双倍）。强化后突进650码、伤害×1.5、击退420码。'}),
  skill({key:'W',name:'镇岳格挡',icon:'挡',target:'direction',range:0,cd:P.W.cooldown,mana:P.W.mana,damage:0,
   desc:'朝指定方向格挡1.25秒，期间移速-40%。来自正面120°的伤害降低50%。被格挡的伤害累计达到120/160/200/240/280+5%最大生命时，6秒内下一次Q被强化。施放Q会提前结束格挡。'}),
  skill({key:'E',name:'裂地坠击',icon:'砸',target:'area',range:450,radius:250,cd:P.E.cooldown,mana:P.E.mana,damage:P.E.damage,
   desc:'跃向目标点并锤击地面，对250码内敌人造成90/130/170/210/250+40%AD+5%自身最大生命物理伤害，减速30%持续1.5秒，并击飞0.4秒。'}),
  skill({key:'R',name:'天陨',icon:'陨',target:'area',range:1000,radius:600,maxRank:3,heroOnly:false,cd:P.R.cooldown,mana:0,damage:P.R.damage,
   desc:'升空1.6秒，期间不可选中、免疫伤害与控制，随后坠向目标点：600码内敌人受到300/450/600+60%额外AD+10%自身最大生命物理伤害并减速。中心275码内100%伤害、击飞0.5秒、减速40%；275码外伤害随距离线性递减至最低30%，不击飞，仅减速30%，减速持续2秒。'})
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
 function hit(u,t,amount,e,extra={}){let ok=m.deal(t,amount,u,'physical',{event:e,...extra});if(ok)aftershock(u,t,e);return ok}

 // ---- Q：突进 → 第一个命中目标 → 击退，撞墙/塔则眩晕 + 再一次同等伤害 ----
 function startQ(u,c,e){let s=S(u),emp=s.empoweredUntil>now();s.empoweredUntil=0;s.block=null;core.remove(u,x=>x.uniqueKey==='anvil-w-slow:'+u.id,'anvil-q');
  let range=emp?P.Q.empowered_range:P.Q.dash_range,to={x:u.x+Math.cos(c.angle)*range,y:u.y+Math.sin(c.angle)*range};
  let damage=(at(P.Q.damage,u,0)+P.Q.ad_ratio*u.attack+P.Q.maxhp_ratio*u.maxHp)*(emp?P.Q.empowered_damage_multiplier:1);
  s.dash={angle:c.angle,event:e,damage,knockback:emp?P.Q.empowered_knockback:P.Q.knockback,until:now()+P.Q.dash_duration*range/P.Q.dash_range,empowered:emp};
  core.startDisplacement(u,to,{type:'DASH',duration:P.Q.dash_duration*range/P.Q.dash_range,source:u,abilityId:0});fx(u,'qtrail',u,{angle:c.angle,length:range,empowered:emp,life:.4})}
 function tickQ(u){let s=S(u),d=s.dash;if(!d)return;if(now()>d.until||!u.displacement){s.dash=null;return}
  let t=m.nearest(u,P.Q.hit_radius+60,v=>foe(u,v)&&dist(u,v)<=P.Q.hit_radius+(v.radius||25));if(!t)return;
  s.dash=null;u.displacement=null;knock(u,t,d)}
 function missingBonus(u,t){let pct=P.Q.missing_hp_base_pct+P.Q.missing_hp_pct_per_100_bonus_ad*bonusAD(u)/100,v=pct*Math.max(0,t.maxHp-t.hp);return t.type==='monster'?Math.min(P.Q.missing_hp_monster_cap,v):v}
 function knock(u,t,d){let e=d.event;d={...d,damage:d.damage+missingBonus(u,t)*(d.empowered?P.Q.empowered_damage_multiplier:1)};if(!hit(u,t,d.damage,e,{once:true,hitIndex:0,abilityId:0}))return;if(!alive(t))return;
  let desired={x:t.x+Math.cos(d.angle)*d.knockback,y:t.y+Math.sin(d.angle)*d.knockback},end=core.safePoint(t,desired,t.radius||22),wall=dist(end,desired)>24;
  let moved=core.startDisplacement(t,end,{type:'KNOCKBACK',duration:P.Q.knockback_duration,source:u,abilityId:0});if(!moved)return;
  S(u).pending.push({kind:'impact',at:now()+P.Q.knockback_duration*Math.max(.15,dist(t,end)/Math.max(1,d.knockback)),target:t,life:t._life||0,wall,damage:d.damage*(P.Q.wall_damage_multiplier-1),event:e})}

 // ---- W：方向格挡 ----
 function startW(u,c){let s=S(u);s.block={angle:c.angle,until:now()+P.W.duration};s.blocked=0;m.slow(u,P.W.self_slow,P.W.duration,u,null,'anvil-w-slow:'+u.id);fx(u,'block',u,{angle:c.angle,life:P.W.duration})}
 function blocking(t,source){let b=S(t).block;if(!b||now()>b.until||!source)return false;let a=Math.atan2(source.y-t.y,source.x-t.x)-b.angle;a=Math.atan2(Math.sin(a),Math.cos(a));return Math.abs(a)<=P.W.arc_degrees*Math.PI/360}

 // ---- E：跃击 ----
 function startE(u,c,e){let to={x:c.p.x,y:c.p.y};if(dist(u,to)>P.E.range){let a=Math.atan2(to.y-u.y,to.x-u.x);to={x:u.x+Math.cos(a)*P.E.range,y:u.y+Math.sin(a)*P.E.range}}
  core.startDisplacement(u,to,{type:'LEAP',duration:P.E.leap_duration,source:u,abilityId:2});S(u).leap={start:now(),end:now()+P.E.leap_duration,event:e};u.anvilLift={start:now(),end:now()+P.E.leap_duration,height:120}}
 function landE(u,l){let damage=at(P.E.damage,u,2)+P.E.ad_ratio*u.attack+P.E.maxhp_ratio*u.maxHp;for(let t of m.nearby(u,P.E.radius+80,v=>foe(u,v))){if(dist(u,t)>P.E.radius+(t.radius||0))continue;if(!hit(u,t,damage,l.event,{once:true,abilityId:2}))continue;if(!alive(t))continue;m.slow(t,P.E.slow,P.E.slow_duration,u,null,'anvil-e:'+u.id);m.control(t,'AIRBORNE',P.E.knockup,u,{abilityId:2})}env.ring(u.x,u.y,P.E.radius,'#e0a052',.45);fx(u,'quake',u,{radius:P.E.radius})}

 // ---- R：升空 → 坠落 ----
 function startR(u,c,e){let to={x:c.p.x,y:c.p.y};if(dist(u,to)>P.R.range){let a=Math.atan2(to.y-u.y,to.x-u.x);to={x:u.x+Math.cos(a)*P.R.range,y:u.y+Math.sin(a)*P.R.range}}
  to=core.safePoint(to,to,30);let s=S(u);s.flight={start:now(),land:now()+P.R.flight,target:to,event:e};u.untargetable=1;u.invulnerable=P.R.flight+.1;core.apply(u,'CC_IMMUNITY',P.R.flight+.05,u,{uniqueKey:'anvil-r-immune:'+u.id,abilityId:3});
  u.anvilLift={start:now(),end:now()+P.R.flight,height:900,hold:true};s.block=null;s.dash=null;u.displacement=null;u.dest=null;u.recall=0}
 function falloff(d){if(d<=P.R.core_radius)return 1;return Math.max(P.R.min_falloff,1-(1-P.R.min_falloff)*(d-P.R.core_radius)/(P.R.radius-P.R.core_radius))}
 function landR(u,f){let p=f.target;core.startDisplacement(u,p,{type:'BLINK',duration:0,source:u,abilityId:3});u.untargetable=0;u.invulnerable=0;u.anvilLift=null;
  let base=at(P.R.damage,u,3)+P.R.bonus_ad_ratio*bonusAD(u)+P.R.maxhp_ratio*u.maxHp;
  for(let t of m.nearby(p,P.R.radius+80,v=>foe(u,v))){let d=Math.max(0,dist(p,t)-(t.radius||0));if(d>P.R.radius)continue;let ratio=falloff(d),core_=d<=P.R.core_radius;
   if(!hit(u,t,base*ratio,f.event,{once:true,abilityId:3}))continue;if(!alive(t))continue;
   m.slow(t,core_?P.R.core_slow:P.R.outer_slow,P.R.slow_duration,u,null,'anvil-r:'+u.id);if(core_)m.control(t,'AIRBORNE',P.R.knockup,u,{abilityId:3})}
  env.ring(p.x,p.y,P.R.radius,'#f0a24b',.6);env.ring(p.x,p.y,P.R.core_radius,'#ffd27a',.6);fx(u,'meteor',p,{radius:P.R.radius,life:.7})}

 m.registerBehavior(ID,(u,c,skill,e)=>{if(c.i===0)startQ(u,c,e);else if(c.i===1)startW(u,c);else if(c.i===2)startE(u,c,e);else if(c.i===3)startR(u,c,e)},{attackTiming:{windup:.24,recovery:.16}});

 m.heroHooks[ID]={
  tick(u){let s=S(u);tickQ(u);
   if(s.leap&&now()>=s.leap.end){let l=s.leap;s.leap=null;u.anvilLift=null;landE(u,l)}
   if(s.flight){u.untargetable=1;u.invulnerable=Math.max(u.invulnerable||0,.1);if(now()>=s.flight.land){let f=s.flight;s.flight=null;landR(u,f)}}
   if(s.block&&now()>s.block.until)s.block=null;
   s.pending=s.pending.filter(q=>{if(now()<q.at)return true;let t=q.target;if(!alive(t)||(t._life||0)!==q.life)return false;
    if(q.wall){hit(u,t,q.damage,q.event,{abilityId:0,wallSlam:true});if(alive(t))m.control(t,'STUN',P.Q.wall_stun,u,{abilityId:0});env.ring(t.x,t.y,90,'#ffcf7a',.35);fx(u,'slam',t)}return false});
   s.visuals=s.visuals.filter(v=>v.until>now())},
  canMove(u){let s=S(u);return !(s.flight||s.leap||s.dash)},
  reduceDamage(t,value,source){if(!blocking(t,source))return value;let s=S(t),absorbed=value*P.W.reduction;s.blocked+=absorbed;
   let need=at(P.W.empower_threshold,t,1)+P.W.empower_threshold_maxhp_pct*t.maxHp;if(s.blocked>=need&&s.empoweredUntil<=now()){s.empoweredUntil=now()+P.Q.empowered_window;if(t.player)env.toast?.('崩山冲拳已强化');env.ring(t.x,t.y,70,'#ffd27a',.4)}
   return value-absorbed},
  validate(u,i){let s=S(u);if(s.flight||s.leap)return false;return true},
  interrupt(u){let s=S(u);s.dash=null;s.block=null},
  reset(u){u.anvilState=null;u.anvilLift=null;u.untargetable=0}
 };

 function draw(ctx){for(let u of units())if(u.hero===ID&&alive(u)){let s=S(u);
   if(s.block){ctx.save();ctx.translate(u.x,u.y);ctx.rotate(s.block.angle);ctx.beginPath();ctx.arc(0,0,70,-Math.PI/3,Math.PI/3);ctx.strokeStyle='#ffd27acc';ctx.lineWidth=10;ctx.stroke();ctx.restore()}
   if(s.empoweredUntil>now()){ctx.beginPath();ctx.arc(u.x,u.y,48,0,Math.PI*2);ctx.strokeStyle='#ffb347aa';ctx.lineWidth=4;ctx.stroke()}
   if(s.flight){let f=s.flight,k=Math.min(1,(now()-f.start)/P.R.flight);ctx.beginPath();ctx.arc(f.target.x,f.target.y,P.R.radius,0,Math.PI*2);ctx.fillStyle='#f0a24b14';ctx.fill();ctx.strokeStyle='#f0a24b99';ctx.lineWidth=4;ctx.stroke();ctx.beginPath();ctx.arc(f.target.x,f.target.y,P.R.core_radius,0,Math.PI*2);ctx.fillStyle='#ffd27a'+(k>.7?'40':'22');ctx.fill();ctx.beginPath();ctx.arc(f.target.x,f.target.y,P.R.radius*k,0,Math.PI*2);ctx.strokeStyle='#ffe2a8';ctx.lineWidth=2;ctx.stroke()}
   for(let v of s.visuals){let k=(now()-v.started)/(v.until-v.started);ctx.save();ctx.globalAlpha=Math.max(0,1-k);ctx.translate(v.x,v.y);
    if(v.kind==='qtrail'){ctx.rotate(v.angle);ctx.fillStyle=v.empowered?'#ffb34755':'#e0a05240';ctx.fillRect(0,-30,v.length,60)}
    else if(v.kind==='slam'){ctx.strokeStyle='#ffcf7a';ctx.lineWidth=6;for(let i=0;i<6;i++){let a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(Math.cos(a)*30,Math.sin(a)*30);ctx.lineTo(Math.cos(a)*(60+k*40),Math.sin(a)*(60+k*40));ctx.stroke()}}
    else if(v.kind==='quake'||v.kind==='meteor'){ctx.beginPath();ctx.arc(0,0,v.radius*(.6+.4*k),0,Math.PI*2);ctx.strokeStyle=v.kind==='meteor'?'#ffb347':'#e0a052';ctx.lineWidth=v.kind==='meteor'?12:7;ctx.stroke()}
    ctx.restore()}}}
 function aim(ctx,u,i,point){if(i!==3&&i!==0)return false;ctx.save();if(i===0){let s=S(u),r=s.empoweredUntil>now()?P.Q.empowered_range:P.Q.dash_range,a=Math.atan2(point.y-u.y,point.x-u.x);ctx.translate(u.x,u.y);ctx.rotate(a);ctx.fillStyle='#e0a05230';ctx.strokeStyle='#e0a052';ctx.lineWidth=2;ctx.fillRect(0,-55,r,110);ctx.strokeRect(0,-55,r,110)}
  else{let a=Math.atan2(point.y-u.y,point.x-u.x),d=Math.min(P.R.range,dist(u,point)),p={x:u.x+Math.cos(a)*d,y:u.y+Math.sin(a)*d};ctx.beginPath();ctx.arc(p.x,p.y,P.R.radius,0,Math.PI*2);ctx.fillStyle='#f0a24b18';ctx.fill();ctx.strokeStyle='#f0a24b';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,P.R.core_radius,0,Math.PI*2);ctx.fillStyle='#ffd27a30';ctx.fill()}
  ctx.restore();return true}
 function bot(u,t){let s=S(u);if(s.flight||s.leap||s.dash||!t)return true;let d=dist(u,t),ready=i=>u.skillRanks[i]&&m.abilityCooldownRemaining(u,i)<=0;
  if(champ(t)&&ready(3)&&d<=P.R.range&&t.hp/t.maxHp<.55)return m.requestCast(u,3,{x:t.x,y:t.y,target:t});
  if(ready(1)&&champ(t)&&now()-(u.lastHit||-9)<.6&&d<700)return m.requestCast(u,1,{x:t.x,y:t.y,target:t});
  let qr=s.empoweredUntil>now()?P.Q.empowered_range:P.Q.dash_range;if(ready(0)&&d<=qr*.9)return m.requestCast(u,0,{x:t.x,y:t.y,target:t});
  if(ready(2)&&d<=P.E.range+60)return m.requestCast(u,2,{x:t.x,y:t.y,target:t});return false}
 m.anvil={state:S,missingBonus,falloff,blocking,draw,aim,bot,params:P};
};
})();
