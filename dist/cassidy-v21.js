/* V21 新英雄「麦克雷 · 神枪手」（ADC / 物理爆发，原著：守望先锋 卡西迪/麦克雷，全部原创绘制）。
 * 数值参照本项目已平衡的远程射手艾希（射程400、移速缩放基准210）设定，全部放在 heroParams.cassidy，可配置。
 * 被动 神枪手本能：6 发弹匣，普攻消耗 1 发；打空后自动换弹 1.6 秒（换弹期间不能普攻）；4 秒未开火自动补满。暴击 175%，暴击命中英雄时 W 冷却 -1 秒。
 * Q 神射手连发：以 0.09 秒间隔倾泻当前弹匣剩余子弹（最多 6 发），每发独立弹道与散布，400 码外无效。
 * W 战术翻滚：朝指定方向翻滚 350 码（0.4 秒，不能穿墙，可穿过单位），期间受到伤害 -35%，结束时装满弹匣。
 * E 闪光弹：投掷至 450 码内目标点，落地爆炸 225 码：物理伤害、减速 35%（1.25 秒）、禁止位移技能 0.75 秒（遵守控制免疫）。
 * R 神枪手：最长 6 秒；每个锁定目标独立叠伤（二次加速，最高 6 倍），普攻键提前开火，再按 R 取消，开大时装满弹匣。
 *   伤害 =（基础 + 100%额外AD）× 蓄力倍率（1.0→1.5 平滑提升）；开火时已离开范围、被地形遮挡、隐身/不可选中的目标不受伤害；被硬控打断则不开火。 */
(()=>{'use strict';
const ID='cassidy',C=window.GAME_CONFIG;if(!C||!C.heroes)return;
const P={
 BASE:{hp_base:600,hp_growth:100,mana_base:0,mana_growth:0,ad_base:63,ad_growth:3.3,armor_base:28,armor_growth:4.85,mr_base:30,mr_growth:1.8,as_base:.625,as_ratio:.625,as_growth:.025,move_speed:216,attack_range:400,is_ranged:1,hero_name:'麦克雷'},
 P:{magazine:6,reload:1.6,idle_reload_delay:4,crit_multiplier:1.75,crit_w_refund:1,projectile_speed:2400},
 Q:{cooldown:[10,9,8,7,6],damage:[12,18,24,30,36],ad_ratio:.4,range:400,interval:.09,near:200,spread_deg:7,bullet_radius:10},
 W:{cooldown:[14,13,12,11,10],distance:350,duration:.4,damage_reduction:.35,reset_q:true},
 E:{cooldown:[16,15,14,13,12],range:450,radius:225,speed:1100,damage:[60,90,120,150,180],bonus_ad_ratio:.8,slow:.35,slow_duration:1.25,ground_duration:.75},
 R:{cooldown:[120,100,80],reset_q:true,range:1200,cone_deg:180,move_slow:.5,move_slow_end:.25,end_window:1,damage_reduction:.5,shot_width:24,max_targets:5,lock_time:.75,max_charge:6,shot_interval:.15,damage:[50,75,100],bonus_ad_ratio:[.4,.5,.6],missing_hp_ratio:[.15,.2,.25],charge_max_mult:6,charge_curve:2}
};
C.heroParams[ID]=P;
const skill=o=>({maxRank:5,windup:0,recovery:0,damageType:'physical',heroOnly:false,mana:0,...o});
C.heroes[ID]={name:'麦克雷',title:'神枪手',role:'ADC / 物理爆发',color:'#c9643c',
 stats:{hp:P.BASE.hp_base,mana:0,attack:P.BASE.ad_base,ap:0,armor:P.BASE.armor_base,mr:P.BASE.mr_base,baseAS:P.BASE.as_base,asRatio:P.BASE.as_ratio,speed:P.BASE.move_speed,range:P.BASE.attack_range,hpRegen:3.5,manaRegen:0,
  growth:{hp:P.BASE.hp_growth,mana:0,attack:P.BASE.ad_growth,armor:P.BASE.armor_growth,mr:P.BASE.mr_growth,as:P.BASE.as_growth,hpRegen:.55,manaRegen:0}},
 passive:{name:'神枪手本能',desc:'左轮弹匣 6 发，每次普攻消耗 1 发；打空后自动换弹 1.6 秒（换弹期间不能普攻），4 秒未开火会自动补满。普攻暴击伤害 175%；暴击命中敌方英雄时战术翻滚冷却 -1 秒。',params:P.P},
 skills:[
  skill({key:'Q',name:'神射手连发',icon:'连',target:'direction',range:P.Q.range,width:60,cd:P.Q.cooldown,damage:P.Q.damage,adRatio:P.Q.ad_ratio,
   desc:'快速倾泻弹匣中剩余的全部子弹（最多6发，每发间隔0.09秒），每发造成 12/18/24/30/36+40%AD 物理伤害。200码内散布小，200～400码散布逐渐增大，400码外无效。每发子弹可暴击（175%）。打空后自动换弹。'}),
  skill({key:'W',name:'战术翻滚',icon:'滚',target:'direction',range:P.W.distance,cd:P.W.cooldown,damage:0,
   desc:'朝指定方向翻滚350码（0.4秒，不能穿墙，可穿过敌方英雄），翻滚期间受到的伤害降低35%、不能普攻，结束时立即装满6发子弹，并刷新神射手连发的冷却。'}),
  skill({key:'E',name:'闪光弹',icon:'闪',target:'area',range:P.E.range,radius:P.E.radius,cd:P.E.cooldown,damage:P.E.damage,
   desc:'向450码内的目标点投掷闪光弹，落地爆炸：225码内敌人受到 60/90/120/150/180+80%额外AD 物理伤害并减速35%（1.25秒），敌方英雄0.75秒内无法使用位移技能。'}),
  skill({key:'R',name:'神枪手',icon:'瞄',target:'direction',range:P.R.range,cd:P.R.cooldown,damage:P.R.damage,maxRank:3,
   desc:'朝指定方向进入瞄准状态（不能普攻，移速-50%，最后1秒为-25%，受到伤害-50%），锁定前方180°、1200码内可见的最多5名敌方英雄，每个目标累计被瞄准0.75秒后锁定完成（丢失视野时暂停并保留进度，直到本次大招结束）。最长持续6秒，按普攻键开火或到时自动开火，再次按R取消（不开火，冷却照常）。开大瞬间装满6发子弹并刷新神射手连发的冷却：按锁定顺序逐个开枪（每枪间隔0.15秒），每个已锁定目标受到（50/75/100+40/50/60%额外AD）×该目标的叠伤倍率 + 目标15/20/25%已损失生命值（不受叠伤倍率影响、不能暴击）物理伤害；锁定完成后目标在视野内被瞄准越久，倍率涨得越快（二次曲线），最高6倍（丢失视野时暂停叠加），每个目标的基础与额外AD部分可单独暴击（175%）。开大时镜头拉远，可看到大招全部范围。子弹会被墙体、敌方英雄和其他实体单位（防御塔、大型/史诗野怪等，小兵和小型野怪除外）阻挡，第一个阻挡的敌方英雄/防御塔/野怪会吃下这一枪；被硬控打断则不开火。'})]
};
if(window.ChampionStats)ChampionStats[ID]=C.heroes[ID].stats;
if(window.ChampionAbilities)ChampionAbilities[ID]=C.heroes[ID].skills;
(window.ARAM_HERO_BALANCE??={})[ID]={type:'ranged',damage_dealt_multiplier:.95,damage_taken_multiplier:1.03};
{let A=(C.heroParams[ID].ARAM={damage_dealt_multiplier:.95,damage_taken_multiplier:1.03,healing_multiplier:1,shield_multiplier:1,energy_regen_modifier:1,ability_haste_modifier:0,tenacity_modifier:0,v21Type:'ranged'})}

// 推荐出装：与艾希同类的暴击/穿甲路线
const I=window.ItemSystem;if(I?.recommended&&!I.recommended.cassidy){const rec=I.recommended;I.recommended=function(hero){if(hero===ID){let a=rec.call(this,'ashe')||[];return [...a]}return rec.apply(this,arguments)};I.recommended.cassidy=true}

window.installCassidy=function(m,env){
 const core=m.core,now=env.time,units=env.units,alive=t=>t&&t.hp>0&&!(t.death>0),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),TAU=Math.PI*2;
 const rk=(u,i)=>Math.max(1,u.skillRanks?.[i]||1),at=(arr,u,i)=>Array.isArray(arr)?arr[Math.min(arr.length,rk(u,i))-1]:arr;
 const S=u=>u.cassidyState??={ammo:P.P.magazine,reloadUntil:0,lastShot:-99,fan:null,roll:null,flash:[],dead:null,fx:[],seq:0};
 const bonusAD=u=>Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0));
 const foeUnit=(u,t)=>alive(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0)&&!t.tentacle&&!t.spiritOwner;
 const ccImmune=t=>core.has?.(t,'CC_IMMUNITY')||t.ccImmune>0;
 const los=(a,b)=>!GAME_CONFIG.map?.lineOfSight||GAME_CONFIG.map.lineOfSight(a,b);
 const fx=(u,f)=>{let s=S(u);s.fx.push({start:now(),...f});if(s.fx.length>60)s.fx.splice(0,s.fx.length-60)};
 function startReload(u){let s=S(u);if(s.reloadUntil||s.ammo>=P.P.magazine)return;s.reloadUntil=now()+P.P.reload;core.emit('ReloadStarted',u,u,{duration:P.P.reload})}
 function refill(u){let s=S(u);s.ammo=P.P.magazine;s.reloadUntil=0;core.emit('ReloadCompleted',u,u)}
 function spend(u){let s=S(u);s.ammo=Math.max(0,s.ammo-1);s.lastShot=now();if(s.ammo<=0)startReload(u)}
 // ---- Q：倾泻弹匣 ----
 // Q/R 可暴击：按英雄暴击率掷骰，暴击伤害 175%（叠加装备的暴击伤害加成）
 function critRoll(u){let c=Math.max(0,Math.min(1,u.crit||0));return c>0&&(env.random?.()??Math.random())<c}
 function critMult(u){return P.P.crit_multiplier+(u.critDamageBonus||0)}
 function fireBullet(u,f){let s=S(u),q=P.Q,k=f.fired,pattern=[0,.55,-.55,1,-1,.25][k%6],dev=pattern*q.spread_deg*Math.PI/180+(env.random?.()??Math.random()-.5)*.02,a=f.angle+dev,cos=Math.cos(a),sin=Math.sin(a);
  let best=null,bd=Infinity;for(let t of units()){if(!foeUnit(u,t))continue;let dx=t.x-u.x,dy=t.y-u.y,along=dx*cos+dy*sin;if(along<0||along>q.range+(t.radius||20))continue;let side=Math.abs(-dx*sin+dy*cos);if(side>(t.radius||20)+q.bullet_radius)continue;if(!los(u,t))continue;if(along<bd){bd=along;best=t}}
  let end=best?{x:u.x+cos*bd,y:u.y+sin*bd}:{x:u.x+cos*q.range,y:u.y+sin*q.range};
  let crit=false;if(best){crit=critRoll(u);m.deal(best,(at(q.damage,u,0)+q.ad_ratio*u.attack)*(crit?critMult(u):1),u,'physical',{event:f.event,once:true,hitIndex:'fan'+k,abilityId:0,displayCritical:crit,critical:crit})}
  fx(u,{kind:'tracer',x0:u.x,y0:u.y,x1:end.x,y1:end.y,hit:!!best,life:.16});f.fired++;spend(u);u.angle=f.angle;sound(u,1100-k*40,.03)}
 // ---- E：闪光弹 ----
 function explode(u,b){let e=P.E;fx(u,{kind:'flashbang',x:b.x,y:b.y,r:e.radius,life:.45});for(let t of units()){if(!foeUnit(u,t)||dist(t,b)>e.radius+(t.radius||0))continue;
  let ok=m.deal(t,at(e.damage,u,2)+e.bonus_ad_ratio*bonusAD(u),u,'physical',{event:b.event,once:true,hitIndex:'flash',abilityId:2});if(!ok)continue;core.emit('AbilityHit',u,t,{castId:b.event?.castId,abilityId:2});
  if(ccImmune(t))continue;m.slow(t,e.slow,e.slow_duration,u);if(t.type==='hero'){t.groundedUntil=Math.max(t.groundedUntil||0,now()+e.ground_duration);t.cassidyFlashed=now()+e.ground_duration}}}
 // ---- R：神枪手 ----
 function inCone(u,t){let d=S(u).dead;if(!d||d.angle==null)return true;let a=Math.atan2(t.y-u.y,t.x-u.x)-d.angle;a=Math.atan2(Math.sin(a),Math.cos(a));return Math.abs(a)<=P.R.cone_deg*Math.PI/360}
 function lockable(u,t){return inCone(u,t)&&alive(t)&&t.type==='hero'&&t.team!==u.team&&!(t.untargetable>0)&&!(t.invulnerable>0)&&!(t.invisible>0)&&!t.clone&&!t.dvaBomb&&dist(u,t)<=P.R.range&&(env.visibleTo?env.visibleTo(u,t)!==false:true)}
 // 大招子弹阻挡：敌方英雄与其他实体（防御塔/水晶/大型及史诗野怪/召唤物等）会挡子弹，小兵和小型野怪不挡
 function solid(u,v,t){if(v===u||v===t||!alive(v))return false;if(v.type==='minion'||v.tentacle||v.spiritOwner)return false;if(v.type==='monster')return v.epic||(GAME_CONFIG.heroParams.longsword_hunter?.P?.large_monster_types||[]).includes(v.monsterId);if(v.type==='hero')return v.team!==u.team&&!(v.untargetable>0);return ['tower','nexus','inhibitor'].includes(v.type)||!!v.dvaBomb}
 function blocker(u,t){let dx=t.x-u.x,dy=t.y-u.y,L=Math.hypot(dx,dy)||1,best=null,bd=Infinity,wall=!los(u,t)?wallPoint(u,t):null,maxD=wall?dist(u,wall):L;for(let v of units()){if(!solid(u,v,t))continue;let along=((v.x-u.x)*dx+(v.y-u.y)*dy)/L;if(along<=0||along>=maxD)continue;let side=Math.abs((-(v.x-u.x)*dy+(v.y-u.y)*dx)/L);if(side<=(v.radius||22)+P.R.shot_width/2&&along<bd){bd=along;best=v}}return best}
 function wallPoint(u,t){let lo=0,hi=1;for(let k=0;k<12;k++){let mid=(lo+hi)/2;if(los(u,{x:u.x+(t.x-u.x)*mid,y:u.y+(t.y-u.y)*mid}))lo=mid;else hi=mid}return{x:u.x+(t.x-u.x)*lo,y:u.y+(t.y-u.y)*lo}}
 // 每个目标独立叠伤：锁定完成后，目标在视野内被持续瞄准的时间越长，倍率增长越快（二次曲线），最高 6 倍
 function targetMult(L){let r=P.R,k=Math.max(0,Math.min(1,(L?.charge||0)/(r.max_charge-r.lock_time)));return 1+(r.charge_max_mult-1)*Math.pow(k,r.charge_curve)}
 // 预计伤害（未计算护甲与暴击）：基础 + 额外AD + 目标已损失生命值，乘该目标的叠伤倍率
 function previewDamage(u,t,L){let r=P.R;return (at(r.damage,u,3)+at(r.bonus_ad_ratio,u,3)*bonusAD(u))*targetMult(L)+at(r.missing_hp_ratio,u,3)*Math.max(0,(t.maxHp||0)-(t.hp||0))}
 function chargeMult(u){let d=S(u).dead;if(!d)return 1;return Math.max(1,...d.locks.filter(L=>!L.lost).map(targetMult))}
 // 开火：按锁定顺序逐个射击（间隔 shot_interval），每枪在射出那一刻判定视野/阻挡/已损失生命值；倍率在开火瞬间按目标锁定
 function fireDeadeye(u){let s=S(u),d=s.dead;if(!d)return false;s.volley={event:d.event,next:now(),queue:d.locks.map(L=>({L,mult:targetMult(L),lockedOk:(L.prog||0)>=P.R.lock_time}))};s.dead=null;return true}
 function shoot(u,item,event){let d={event},r=P.R,n=0,L=item.L,t=L.t;if(!item.lockedOk||!lockable(u,t)){fx(u,{kind:'deadMiss',x:t.x,y:t.y,life:.5});return}
   let wall=!los(u,t),blk=blocker(u,t);if(wall&&!blk){let wp=wallPoint(u,t);fx(u,{kind:'deadShot',x0:u.x,y0:u.y,x1:wp.x,y1:wp.y,life:.35});return}
   let mult=item.mult,hitT=blk||t,dmg=(at(r.damage,u,3)+at(r.bonus_ad_ratio,u,3)*bonusAD(u))*mult,missDmg=at(r.missing_hp_ratio,u,3)*Math.max(0,(hitT.maxHp||0)-(hitT.hp||0));if(hitT.team!==u.team){let crit=critRoll(u);if(crit)dmg*=critMult(u);dmg+=missDmg;if(m.deal(hitT,dmg,u,'physical',{event:d.event,once:true,hitIndex:'deadeye:'+t.id,abilityId:3,displayCritical:crit,critical:crit})){n++;core.emit('AbilityHit',u,hitT,{castId:d.event?.castId,abilityId:3})}}fx(u,{kind:'deadShot',x0:u.x,y0:u.y,x1:hitT.x,y1:hitT.y,life:.35})
  fx(u,{kind:'muzzle',x:u.x,y:u.y,angle:Math.atan2(t.y-u.y,t.x-u.x),life:.25,big:true});sound(u,180,.18);u.angle=Math.atan2(t.y-u.y,t.x-u.x)}
 function cancelDeadeye(u){let s=S(u);if(s.dead){s.dead=null;fx(u,{kind:'deadCancel',x:u.x,y:u.y,life:.4})}}
 let audio=null;function sound(u,f,d){if(!u?.player||typeof AudioContext==='undefined')return;try{audio??=new AudioContext();let o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=f;g.gain.value=.025;g.gain.exponentialRampToValueAtTime(.0005,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch(e){}}

 m.registerBehavior(ID,(u,c,sk,e)=>{let s=S(u),a=c.angle??Math.atan2((c.p?.y??u.y)-u.y,(c.p?.x??u.x+1)-u.x);
  if(c.i===0){s.fan={angle:a,event:e,fired:0,total:s.ammo,next:now()};fx(u,{kind:'fanSpin',x:u.x,y:u.y,life:s.ammo*P.Q.interval+.1})}
  if(c.i===1){let w=P.W,to={x:u.x+Math.cos(a)*w.distance,y:u.y+Math.sin(a)*w.distance};s.roll={until:now()+w.duration,angle:a,from:{x:u.x,y:u.y}};if(w.reset_q&&u.cd)u.cd[0]=0;s.fan=null;core.startDisplacement(u,to,{type:'DASH',duration:w.duration,source:u,abilityId:1});fx(u,{kind:'roll',x:u.x,y:u.y,angle:a,life:w.duration+.25})}
  if(c.i===2){let e2=P.E,d=Math.min(e2.range,Math.hypot((c.p?.x??u.x)-u.x,(c.p?.y??u.y)-u.y)),tx=u.x+Math.cos(a)*d,ty=u.y+Math.sin(a)*d;s.flash.push({x0:u.x,y0:u.y,x:tx,y:ty,start:now(),land:now()+Math.max(.12,d/e2.speed),event:e})}
  if(c.i===3){let r=P.R;s.dead={start:now(),until:now()+r.max_charge,event:e,locks:[],angle:a};s.dead.locks=units().filter(t=>lockable(u,t)).sort((x,y)=>dist(u,x)-dist(u,y)).slice(0,r.max_targets).map(t=>({t,since:now(),prog:0}));s.fan=null;u.target=null;refill(u);if(P.R.reset_q&&u.cd)u.cd[0]=0;sound(u,300,.4)}
 },{attackTiming:{windup:.2,recovery:.12}});

 m.heroHooks[ID]={
  prepare(u,i){let s=S(u);if((s.dead||s.volley)&&i!==3)return false;if(s.volley)return false;if(i===0&&(s.ammo<=0||s.reloadUntil||s.fan||s.roll))return false},
  recast(u,i){let s=S(u);if(i===3&&s.dead){cancelDeadeye(u);return true}return undefined},
  canMove(u){return true},
  beforeAttack(u){let s=S(u);if(s.dead||s.volley||s.fan||(s.roll&&s.roll.until>now()))return false;if(s.reloadUntil||s.ammo<=0){startReload(u);return false}},
  attackProfile:()=>({windup:.2,recovery:.12,projectileSpeed:P.P.projectile_speed}),
  attackRelease(u,t,p){spend(u);fx(u,{kind:'muzzle',x:u.x,y:u.y,angle:Math.atan2(t.y-u.y,t.x-u.x),life:.12});sound(u,900,.04)},
  attackHit(u,t,p){if(p?.critical&&t?.type==='hero'&&t.team!==u.team&&u.cd?.[1]>0)u.cd[1]=Math.max(0,u.cd[1]-P.P.crit_w_refund)},
  reduceDamage(t,value){let s=S(t);if(s.dead)value*=1-P.R.damage_reduction;return s.roll&&s.roll.until>now()?value*(1-P.W.damage_reduction):value},
  tick(u,dt){let s=S(u),t=now();
   if(s.reloadUntil&&t+1e-9>=s.reloadUntil)refill(u);
   if(!s.reloadUntil&&s.ammo<P.P.magazine&&!s.fan&&!s.dead&&t-s.lastShot>=P.P.idle_reload_delay&&!u.pendingAttack)startReload(u);
   if(s.roll&&t>=s.roll.until){s.roll=null;refill(u);fx(u,{kind:'reload',x:u.x,y:u.y,life:.4})}
   if(s.fan){if(core.hardLocked(u)||s.ammo<=0||s.fan.fired>=s.fan.total)s.fan=null;else while(s.fan&&t+1e-9>=s.fan.next&&s.fan.fired<s.fan.total&&s.ammo>0){fireBullet(u,s.fan);s.fan.next+=P.Q.interval;if(s.fan.fired>=s.fan.total||s.ammo<=0)s.fan=null}}
   if(s.volley){if(!alive(u)||core.hardLocked(u))s.volley=null;else while(s.volley&&t+1e-9>=s.volley.next){let it=s.volley.queue.shift();if(it)shoot(u,it,s.volley.event);s.volley.next+=P.R.shot_interval;if(!s.volley.queue.length)s.volley=null}}
   for(let b of s.flash.slice())if(t+1e-9>=b.land){s.flash.splice(s.flash.indexOf(b),1);explode(u,b)}
   if(s.dead){if(core.hardLocked(u)||u.silence>0)cancelDeadeye(u);else{for(let L of s.dead.locks){L.lost=!lockable(u,L.t);if(!L.lost){if((L.prog||0)>=P.R.lock_time)L.charge=(L.charge||0)+dt;L.prog=Math.min(P.R.lock_time,(L.prog||0)+dt)}}
     m.slow(u,s.dead.until-t<=P.R.end_window?P.R.move_slow_end:P.R.move_slow,.12,u,null,'cassidy-deadeye');
     if(s.dead.locks.length<P.R.max_targets)for(let v of units().filter(v=>lockable(u,v)&&!s.dead.locks.some(L=>L.t===v)).sort((a,b)=>dist(u,a)-dist(u,b)).slice(0,P.R.max_targets-s.dead.locks.length))s.dead.locks.push({t:v,since:t,prog:0});
     if(Math.floor((t-s.dead.start)*6)!==s.dead.beat){s.dead.beat=Math.floor((t-s.dead.start)*6);sound(u,320+260*(chargeMult(u)-1)*2,.05)}
     if(t>=s.dead.until)fireDeadeye(u)}}},
  interrupt(u){cancelDeadeye(u);S(u).fan=null},
  reset(u){let s=S(u);s.volley=null;s.ammo=P.P.magazine;s.reloadUntil=0;s.fan=null;s.roll=null;s.flash=[];s.dead=null},
  describeExtra(u,i){let s=S(u);if(i===0)return '当前可倾泻 '+s.ammo+' 发。';if(i===3&&s.dead)return '已锁定 '+s.dead.locks.filter(L=>!L.lost).length+' 名，蓄力倍率 ×'+chargeMult(u).toFixed(2);return ''}
 };

 // ---- 绘制：弹药、弹道、枪口火焰、翻滚残影、闪光弹、神枪手锁定 ----
 function draw(ctx,viewer){let T=now();for(let u of units()){if(u.hero!==ID)continue;let s=S(u),seen=!viewer||u.team===viewer.team||env.visibleTo?.(viewer,u)!==false;
  s.fx=s.fx.filter(f=>T-f.start<f.life);
  for(let f of s.fx){let k=(T-f.start)/f.life;ctx.save();ctx.globalAlpha=1-k;
   if(f.kind==='tracer'||f.kind==='deadShot'){ctx.strokeStyle=f.kind==='deadShot'?'#ffe9a8':'#fff2c6';ctx.lineWidth=f.kind==='deadShot'?6:2.5;ctx.beginPath();ctx.moveTo(f.x0,f.y0);ctx.lineTo(f.x1,f.y1);ctx.stroke();if(f.hit||f.kind==='deadShot'){ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.arc(f.x1,f.y1,f.kind==='deadShot'?22*(1-k)+6:8*(1-k)+3,0,TAU);ctx.fill()}}
   else if(f.kind==='muzzle'&&seen){ctx.translate(f.x,f.y);ctx.rotate(f.angle??u.angle??0);ctx.fillStyle='#ffcf5a';ctx.beginPath();ctx.moveTo(26,-7*(f.big?2:1));ctx.lineTo(26+(f.big?60:28)*(1-k*.5),0);ctx.lineTo(26,7*(f.big?2:1));ctx.closePath();ctx.fill()}
   else if(f.kind==='roll'&&seen){for(let j=1;j<=3;j++){let p=Math.max(0,Math.min(1,(T-f.start)/.4-j*.12));ctx.globalAlpha=(1-k)*.3;ctx.fillStyle=u.color;ctx.beginPath();ctx.arc(f.x+Math.cos(f.angle)*350*p,f.y+Math.sin(f.angle)*350*p,(u.radius||22)*.9,0,TAU);ctx.fill()}}
   else if(f.kind==='reload'&&seen){ctx.strokeStyle='#ffd27a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(u.x,u.y-20,30+20*k,0,TAU*(1-k));ctx.stroke()}
   else if(f.kind==='flashbang'){ctx.fillStyle='rgba(255,255,240,'+(.75*(1-k))+')';ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.5+.5*k),0,TAU);ctx.fill();for(let i=0;i<12;i++){let a=i*TAU/12;ctx.strokeStyle='#fff6c8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*f.r*.3,f.y+Math.sin(a)*f.r*.3);ctx.lineTo(f.x+Math.cos(a)*f.r*(.6+.5*k),f.y+Math.sin(a)*f.r*(.6+.5*k));ctx.stroke()}}
   else if(f.kind==='deadMiss'){ctx.strokeStyle='#9aa4b2';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,30,0,TAU);ctx.stroke()}
   ctx.restore()}
  for(let b of s.flash){let k=Math.min(1,(T-b.start)/(b.land-b.start)),x=b.x0+(b.x-b.x0)*k,y=b.y0+(b.y-b.y0)*k-Math.sin(k*Math.PI)*60;ctx.save();ctx.fillStyle='#d9dde3';ctx.strokeStyle='#3a3f46';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,8,0,TAU);ctx.fill();ctx.stroke();ctx.globalAlpha=.35;ctx.strokeStyle='#fff6c8';ctx.beginPath();ctx.arc(b.x,b.y,P.E.radius,0,TAU);ctx.stroke();ctx.restore()}
  if(!alive(u))continue;
  if(seen){// 弹药：头顶 6 颗子弹，已消耗的变暗；换弹时显示进度环
   ctx.save();let y=u.y-92*(u.visualScale||1)+9,bw=65,gap=2,pw=(bw-gap*(P.P.magazine-1))/P.P.magazine;ctx.fillStyle='#07121ee8';ctx.fillRect(u.x-bw/2-1,y-1,bw+2,6);for(let i=0;i<P.P.magazine;i++){ctx.fillStyle=i<s.ammo?'#ffd27a':'#3a3f46';ctx.fillRect(u.x-bw/2+i*(pw+gap),y,pw,4)}
   if(s.reloadUntil){let k=1-(s.reloadUntil-T)/P.P.reload;ctx.strokeStyle='#ffd27a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(u.x+bw/2+9,y+2,5,-Math.PI/2,-Math.PI/2+TAU*k);ctx.stroke()}ctx.restore()}
  if(s.dead&&seen){ctx.save();let g=ctx.createRadialGradient?ctx.createRadialGradient(u.x,u.y,8,u.x,u.y,70):null;if(g){g.addColorStop(0,'rgba(255,40,20,.55)');g.addColorStop(1,'rgba(255,40,20,0)');ctx.fillStyle=g}else ctx.fillStyle='rgba(255,40,20,.3)';ctx.beginPath();ctx.arc(u.x,u.y,70+6*Math.sin(T*10),0,TAU);ctx.fill();ctx.restore()}
  if(s.dead){let d=s.dead,lockK=Math.min(1,(T-d.start)/P.R.lock_time),mult=chargeMult(u);ctx.save();
   // 敌我双方都能看到：瞄准光圈 + 扫描范围
   ctx.strokeStyle='rgba(255,90,60,'+(.35+.3*Math.abs(Math.sin(T*8)))+')';ctx.lineWidth=3;ctx.setLineDash?.([18,12]);let ca=d.angle??0,hc=P.R.cone_deg*Math.PI/360;ctx.beginPath();ctx.moveTo(u.x,u.y);ctx.arc(u.x,u.y,P.R.range,ca-hc,ca+hc);ctx.closePath();ctx.stroke();ctx.setLineDash?.([]);ctx.fillStyle='rgba(255,90,60,.06)';ctx.fill();
   ctx.strokeStyle='#ffcf5a';ctx.lineWidth=6;ctx.beginPath();ctx.arc(u.x,u.y,46,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,(T-d.start)/P.R.max_charge));ctx.stroke();
   for(let L of d.locks){let t=L.t;if(!alive(t))continue;let k2=Math.min(1,(L.prog||0)/P.R.lock_time),rr=(t.radius||22)+60-34*k2,col=L.lost?'#9aa4b2':k2>=1?'#ff3b30':'#ff9a3c';ctx.strokeStyle=col;ctx.lineWidth=3+2*k2*(mult-1)*2;ctx.save();ctx.translate(t.x,t.y);ctx.rotate(T*2);for(let q=0;q<4;q++){ctx.beginPath();ctx.arc(0,0,rr,q*Math.PI/2+.3,q*Math.PI/2+Math.PI/2-.3);ctx.stroke()}ctx.restore();
    if(k2>=1&&!L.lost){ctx.fillStyle=col;ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText('☠ ×'+targetMult(L).toFixed(1),t.x,t.y-(t.radius||22)-70);if(!viewer||u.team===viewer.team){ctx.font='bold 13px Arial';ctx.fillText('≈'+Math.round(previewDamage(u,t,L)),t.x,t.y-(t.radius||22)-52)}}
    ctx.globalAlpha=.25*lockK;ctx.strokeStyle='#ff5a3c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(u.x,u.y);ctx.lineTo(t.x,t.y);ctx.stroke();ctx.globalAlpha=1}
   ctx.restore()}}
  hud(viewer)}
 // ---- DOM：技能栏旁的弹药/锁定/蓄力显示 + 神枪手镜头暗角 ----
 function hud(viewer){if(typeof document==='undefined'||!document.body)return;let el=document.getElementById('cassidyHud'),vg=document.getElementById('cassidyVignette');if(!viewer||viewer.hero!==ID||!alive(viewer)){if(el)el.style.display='none';if(vg)vg.style.opacity=0;return}
  let s=S(viewer),host=document.getElementById('abilityControls')||document.body;if(!el){el=document.createElement('div');el.id='cassidyHud';el.style.cssText='position:absolute;right:210px;bottom:178px;z-index:40;padding:4px 8px;border-radius:6px;background:rgba(10,14,22,.82);border:1px solid #c9643c99;color:#ffd27a;font:bold 12px "Microsoft YaHei",sans-serif;pointer-events:none;white-space:nowrap';host.appendChild(el)}
  if(!vg){vg=document.createElement('div');vg.id='cassidyVignette';vg.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:20;transition:opacity .25s;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(90,10,0,.55) 100%)';document.body.appendChild(vg)}
  el.style.display='';let pips='';for(let i=0;i<P.P.magazine;i++)pips+='<span style="display:inline-block;width:6px;height:12px;margin-right:2px;border-radius:2px;background:'+(i<s.ammo?'#ffd27a':'#3a3f46')+'"></span>';
  let txt=s.reloadUntil?'换弹中 '+Math.max(0,s.reloadUntil-now()).toFixed(1)+'s':'弹药 '+s.ammo+'/'+P.P.magazine+' · Q 可倾泻 '+s.ammo+' 发';
  if(s.dead)txt='神枪手 · 锁定 '+s.dead.locks.filter(L=>!L.lost&&(L.prog||0)>=P.R.lock_time).length+'/'+s.dead.locks.length+' · 最高 ×'+chargeMult(viewer).toFixed(1)+' · 普攻键开火 / 再按 R 取消';
  let html=pips+' '+txt;if(el._last!==html){el._last=html;el.innerHTML=html}let op=s.dead?'1':'0';if(vg.style.opacity!==op)vg.style.opacity=op}
 m.cassidy={state:S,draw,ammo:u=>S(u).ammo,reloading:u=>!!S(u).reloadUntil,deadeye:u=>S(u).dead,volley:u=>S(u).volley,chargeMult,targetMult,fireDeadeye,refill};
};
})();
