/* V21 新英雄「闪光 · 时空特工」（AD 刺客 / 机动射手，原著：守望先锋 Tracer，全部原创绘制）。
 * 数值参照本项目已平衡的 400 码射手（艾希、麦克雷）设定：低生命、低单发、高攻速、高机动；全部放在 heroParams.tracer，可配置。
 * 被动 时间加速：对敌方英雄造成伤害获得时间能量（普攻每轮 +2；每次Q期间首次命中 +8；技能命中 +6/每次施放一次），上限100，脱战5秒后每秒+3。满100时消耗全部能量，为闪现额外提供1层充能（最多储存1层）。
 * 弹匣：20 发，普攻消耗 1 发，打空自动装填 1.3 秒；闪现不耗弹；闪回恢复到记录时的弹药。
 * Q 双枪速射：2.5 秒内攻速 +35%，普攻伤害为 90%，可暴击，仍消耗弹药。
 * W 闪现：瞬间朝指定方向移动 300 码（BLINK：可越过薄墙但不能停在墙内/地图外），初始 2 层、最多 3 层充能，每层 8 秒。
 * E 闪回：回到 3 秒前（每 0.1 秒记录一次）的位置，恢复当时的生命值与弹药，清除这 3 秒内新获得的普通负面状态（压制/击飞等不可解除效果除外）；0.25 秒不可选取。不恢复冷却、充能、金币等，不回滚其他单位。
 * R 脉冲炸弹：投掷 500 码，附着在第一个命中的敌方英雄（不可选取/无敌目标除外），未命中则落地；1 秒后爆炸，300 码内敌人受到物理伤害：附着目标 100%，其余按距离衰减至最低 50%。 */
(()=>{'use strict';
const ID='tracer',C=window.GAME_CONFIG;if(!C||!C.heroes)return;
const P={
 BASE:{hp_base:560,hp_growth:92,mana_base:0,mana_growth:0,ad_base:54,ad_growth:2.8,armor_base:26,armor_growth:4.9,mr_base:30,mr_growth:1.8,as_base:.7,as_ratio:.7,as_growth:.03,move_speed:226,attack_range:275,is_ranged:1,hero_name:'闪光'},
 P:{magazine:40,empty_time:1.25,bullet_ad_ratio:.05,on_hit_scale:.03,idle_reload_delay:1.5,reload:1.3,energy_max:100,energy_aa:.25,energy_q:8,energy_skill:6,energy_ooc_regen:3,ooc_delay:5,bonus_blink_max:1,projectile_speed:2600},
 Q:{cooldown:[12,11,10,9,8],duration:2.5,bonus_as:.35,aa_damage_ratio:.9},
 W:{distance:300,charges_initial:2,charges_max:3,recharge:8},
 E:{cooldown:[24,22,20,18,16],rewind:3,sample:.1,anim:.75},
 R:{cooldown:[120,100,80],range:500,speed:1000,radius:300,fuse:1,damage:[250,400,550],bonus_ad_ratio:1,min_falloff:.5,hit_radius:40}
};
C.heroParams[ID]=P;
const skill=o=>({maxRank:5,windup:0,recovery:0,damageType:'physical',heroOnly:false,mana:0,...o});
C.heroes[ID]={name:'闪光',title:'时空特工',role:'AD 刺客 / 机动射手',color:'#ff9a2e',
 stats:{hp:P.BASE.hp_base,mana:0,attack:P.BASE.ad_base,ap:0,armor:P.BASE.armor_base,mr:P.BASE.mr_base,baseAS:P.BASE.as_base,asRatio:P.BASE.as_ratio,speed:P.BASE.move_speed,range:P.BASE.attack_range,hpRegen:3.5,manaRegen:0,
  growth:{hp:P.BASE.hp_growth,mana:0,attack:P.BASE.ad_growth,armor:P.BASE.armor_growth,mr:P.BASE.mr_growth,as:P.BASE.as_growth,hpRegen:.55,manaRegen:0}},
 passive:{name:'时间加速',desc:'对敌方英雄造成伤害获得时间能量：普攻每发命中+0.25，每次双枪速射期间首次命中+8，技能命中+6（每次施放一次）；上限100，脱战5秒后每秒+3。能量满100时自动转化为1层额外闪现充能（最多储存1层）。普攻为双冲锋枪连射（射程275）：弹匣40发，1.25秒打完（随攻速加快），每发单独结算，造成5%AD物理伤害，普攻特效按3%效果触发；打空或1.5秒未开火自动装填1.3秒。',params:P.P},
 skills:[
  skill({key:'Q',name:'双枪速射',icon:'速',target:'self',range:0,cd:P.Q.cooldown,damage:0,
   desc:'2.5秒内攻击速度提高35%，期间普攻造成90%伤害（可暴击，仍消耗弹药，不能跳过装填）。射程不变。'}),
  skill({key:'W',name:'闪现',icon:'闪',target:'direction',range:P.W.distance,cd:0,damage:0,
   desc:'瞬间朝指定方向移动300码（可越过薄墙，但不能停在墙内或地图外；不消耗弹药）。初始2层、最多3层充能，每层8秒恢复；可连续使用。被动满能量时额外获得1层充能。'}),
  skill({key:'E',name:'闪回',icon:'回',target:'self',range:0,cd:P.E.cooldown,damage:0,
   desc:'回到3秒前的位置，并恢复当时的生命值与弹药；清除这3秒内新获得的减速、持续伤害等普通负面状态（压制、击飞等不可解除效果除外）。原地播放0.75秒闪回特效（我方蓝色、敌方红色），期间无法被选中、不受伤害、不能行动，结束时直接回到3秒前的位置并恢复生命与弹药。不恢复技能冷却、闪现充能、金币与经验，也不影响其他单位。'}),
  skill({key:'R',name:'脉冲炸弹',icon:'炸',target:'direction',range:P.R.range,radius:P.R.radius,cd:P.R.cooldown,damage:P.R.damage,maxRank:3,
   desc:'向指定方向投掷脉冲炸弹（500码），附着在第一个命中的敌方英雄身上（不可选取/无敌目标除外），未命中则落地。1秒后爆炸：300码内敌人受到 250/400/550+100%额外AD 物理伤害，附着目标承受100%，其余目标按距离衰减至最低50%。可被风墙、格挡等防御机制挡下。'})]
};
if(window.ChampionStats)ChampionStats[ID]=C.heroes[ID].stats;
if(window.ChampionAbilities)ChampionAbilities[ID]=C.heroes[ID].skills;
(window.ARAM_HERO_BALANCE??={})[ID]={type:'ranged',damage_dealt_multiplier:.95,damage_taken_multiplier:1.03};
C.heroParams[ID].ARAM={damage_dealt_multiplier:.95,damage_taken_multiplier:1.03,healing_multiplier:1,shield_multiplier:1,energy_regen_modifier:1,ability_haste_modifier:0,tenacity_modifier:0,v21Type:'ranged'};
const I=window.ItemSystem;if(I?.recommended&&!I.recommended.tracer){const rec=I.recommended;I.recommended=function(hero){if(hero===ID)return [...(rec.call(this,'ashe')||[])];return rec.apply(this,arguments)};I.recommended.tracer=true}

window.installTracer=function(m,env){
 const core=m.core,now=env.time,units=env.units,alive=t=>t&&t.hp>0&&!(t.death>0),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),TAU=Math.PI*2;
 const rk=(u,i)=>Math.max(1,u.skillRanks?.[i]||1),at=(arr,u,i)=>Array.isArray(arr)?arr[Math.min(arr.length,rk(u,i))-1]:arr;
 const live=t=>t&&t.hp>0&&!(t.death>0);const S=u=>u.tracerState??={ammo:P.P.magazine,reloadUntil:0,energy:0,bonusBlink:0,charges:P.W.charges_initial,nextCharge:0,qUntil:0,qHit:false,history:[],lastSample:-99,lastCombat:-99,untargetUntil:0,bomb:null,fx:[],skillHitCast:new Set};
 const bonusAD=u=>Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0));
 const los=(a,b)=>!GAME_CONFIG.map?.lineOfSight||GAME_CONFIG.map.lineOfSight(a,b);
 const fx=(u,f)=>{let s=S(u);s.fx.push({start:now(),...f});if(s.fx.length>80)s.fx.splice(0,s.fx.length-80)};
 const foeUnit=(u,t)=>alive(t)&&t.team!==u.team&&['hero','minion','monster','tower','nexus','inhibitor'].includes(t.type)&&!t.tentacle&&!t.spiritOwner;
 function gain(u,n){let s=S(u);s.energy=Math.min(P.P.energy_max,s.energy+n);if(s.energy>=P.P.energy_max&&s.bonusBlink<P.P.bonus_blink_max){s.energy=0;s.bonusBlink=P.P.bonus_blink_max;fx(u,{kind:'bonus',x:u.x,y:u.y,life:.6})}}
 function totalCharges(u){let s=S(u);return s.charges+s.bonusBlink}
 function startReload(u){let s=S(u);if(s.reloadUntil||s.ammo>=P.P.magazine)return;s.reloadUntil=now()+P.P.reload;core.emit('ReloadStarted',u,u,{duration:P.P.reload})}
 // ---- 时间记录（仅闪光自身） ----
 function sample(u){let s=S(u);s.history.push({t:now(),x:u.x,y:u.y,hp:u.hp,ammo:s.ammo,reloadUntil:s.reloadUntil});let cut=now()-P.E.rewind-.15;while(s.history.length&&s.history[0].t<cut)s.history.shift();s.lastSample=now()}
 function recordAt(u){let s=S(u),want=now()-P.E.rewind;let best=s.history[0];for(let h of s.history){if(h.t<=want+1e-6)best=h;else break}return best}
 function legalNear(u,p){let blocked=(x,y)=>env.blocked?.(x,y,u.radius||22);if(!blocked(p.x,p.y))return p;for(let r=20;r<=200;r+=20)for(let k=0;k<12;k++){let a=k*TAU/12,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(!blocked(q.x,q.y))return q}return null}
 // 闪回：0.75 秒回溯动画——沿记录路径倒着滑回 3 秒前的位置，期间不可选中、不受伤害、不能行动；动画结束时恢复生命/弹药并清除新负面状态
 function recall(u,e){let s=S(u),rec=recordAt(u);if(!rec)return false;let path=s.history.filter(h=>h.t>=rec.t).map(h=>({x:h.x,y:h.y})).reverse();path.unshift({x:u.x,y:u.y});
  s.rewind={start:now(),end:now()+P.E.anim,path,rec,from:{x:u.x,y:u.y}};u.displacement=null;u.dest=null;u.target=null;u.recall=0;u.pendingAttack=null;u.untargetable=1;s.untargetUntil=0;
  return true}
 function rewindTick(u){let s=S(u),R=s.rewind;if(!R)return;let k=Math.min(1,(now()-R.start)/(R.end-R.start)),pts=R.path;u.untargetable=1;
  u.x=R.from.x;u.y=R.from.y;
  if(k>=1)finishRecall(u)}
 function finishRecall(u){let s=S(u),R=s.rewind;if(!R)return;s.rewind=null;let rec=R.rec,dest=legalNear(u,rec)||legalNear(u,R.from)||R.from;
  u.x=dest.x;u.y=dest.y;core.spatial?.update?.(u);u.displacement=null;
  let healed=Math.max(0,Math.min(u.maxHp,rec.hp)-u.hp);u.hp=Math.max(1,Math.min(u.maxHp,rec.hp));if(healed>0)env.float?.(u,'+'+Math.round(healed),'#7fd6ff');
  s.ammo=rec.ammo;s.reloadUntil=rec.reloadUntil&&rec.reloadUntil>now()?rec.reloadUntil:0;if(s.ammo<=0&&!s.reloadUntil)startReload(u);
  // 清除记录点之后新获得的普通负面状态（压制/击飞等不可解除效果保留）
  core.remove?.(u,x=>x.startTime>rec.t&&x.sourceId!==u.id&&x.dispelCategory==='normal'&&['SLOW','STUN','ROOT','SILENCE','BLIND','TAUNT','FEAR','CHARM','SLEEP','HEAL_REDUCTION','GROUNDED','DOT','BURN','POISON','BLEED','ARMOR_SHRED','MR_SHRED'].includes(x.type),'recalled');core.sync?.(u);
  if((u.groundedUntil||0)>now())u.groundedUntil=0;
  u.untargetable=0;fx(u,{kind:'recallTo',x:u.x,y:u.y,life:.55});s.history=[];sample(u)}
 // ---- R：脉冲炸弹 ----
 function bombTick(u,dt){let s=S(u),b=s.bomb;if(!b)return;let r=P.R;
  if(b.state==='fly'){let step=r.speed*dt,nx=b.x+Math.cos(b.angle)*step,ny=b.y+Math.sin(b.angle)*step;b.travel+=step;
   if(!los({x:b.x,y:b.y},{x:nx,y:ny})){b.state='armed';b.fuseAt=now()+r.fuse;fx(u,{kind:'stick',x:b.x,y:b.y,life:.3});return}
   let blocked=false;try{blocked=core.intercept?.({source:u,blockable:true,x:b.x,y:b.y,team:u.team,radius:12,abilityId:3,event:b.event},{x:b.x,y:b.y},{x:nx,y:ny})}catch(err){blocked=false}if(blocked){s.bomb=null;fx(u,{kind:'bombBlocked',x:b.x,y:b.y,life:.4});return}
   let hit=null,bd=Infinity;for(let t of units()){if(t.type!=='hero'||t.team===u.team||!alive(t)||t.untargetable>0||t.invulnerable>0)continue;let dx=t.x-b.x,dy=t.y-b.y,along=dx*Math.cos(b.angle)+dy*Math.sin(b.angle);if(along<-10||along>step+10)continue;let side=Math.abs(-dx*Math.sin(b.angle)+dy*Math.cos(b.angle));if(side<=(t.radius||22)+r.hit_radius&&along<bd){bd=along;hit=t}}
   if(hit){b.state='stuck';b.target=hit;b.fuseAt=now()+r.fuse;b.x=hit.x;b.y=hit.y;fx(u,{kind:'stick',x:hit.x,y:hit.y,life:.3});return}
   b.x=nx;b.y=ny;if(b.travel>=r.range){b.state='armed';b.fuseAt=now()+r.fuse}return}
  if(b.state==='stuck'){if(alive(b.target)){b.x=b.target.x;b.y=b.target.y}else{b.state='armed';b.target=null}}
  if(now()+1e-9>=b.fuseAt)explode(u)}
 function explode(u){let s=S(u),b=s.bomb;if(!b)return;s.bomb=null;let r=P.R,base=at(r.damage,u,3)+r.bonus_ad_ratio*bonusAD(u),hitHero=false;
  fx(u,{kind:'boom',x:b.x,y:b.y,r:r.radius,life:.6});
  for(let t of units()){if(!foeUnit(u,t)||t.untargetable>0)continue;let d=dist(t,b);if(d>r.radius+(t.radius||0))continue;let k=t===b.target?1:Math.max(r.min_falloff,1-(1-r.min_falloff)*Math.min(1,d/r.radius));
   if(m.deal(t,base*k,u,'physical',{event:b.event,once:true,hitIndex:'pulse:'+t.id,abilityId:3})){core.emit('AbilityHit',u,t,{castId:b.event?.castId,abilityId:3});if(t.type==='hero')hitHero=true}}
  if(hitHero&&!s.skillHitCast.has(b.event?.castId)){s.skillHitCast.add(b.event?.castId);gain(u,P.P.energy_skill)}}
 let audio=null;function sound(u,f,d,type='square'){if(!u?.player||typeof AudioContext==='undefined')return;try{audio??=new AudioContext();let o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=f;g.gain.value=.02;g.gain.exponentialRampToValueAtTime(.0005,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch(e){}}

 m.registerBehavior(ID,(u,c,sk,e)=>{let s=S(u),a=c.angle??Math.atan2((c.p?.y??u.y)-u.y,(c.p?.x??u.x+1)-u.x);
  if(c.i===0){s.qUntil=now()+P.Q.duration;s.qHit=false;m.recalc(u);fx(u,{kind:'q',x:u.x,y:u.y,life:P.Q.duration});sound(u,700,.15)}
  if(c.i===1){u.cd[1]=0;if(s.bonusBlink>0)s.bonusBlink--;else{if(s.charges>=P.W.charges_max)s.nextCharge=now()+P.W.recharge;s.charges=Math.max(0,s.charges-1);if(!s.nextCharge)s.nextCharge=now()+P.W.recharge}
   let from={x:u.x,y:u.y},to={x:u.x+Math.cos(a)*P.W.distance,y:u.y+Math.sin(a)*P.W.distance};u.pendingAttack=null;core.startDisplacement(u,to,{type:'BLINK',duration:0,source:u,abilityId:1});u.angle=a;fx(u,{kind:'blink',x0:from.x,y0:from.y,x1:u.x,y1:u.y,life:.45});sound(u,1400,.06,'sine')}
  if(c.i===2){recall(u,e);sound(u,500,.3,'sine')}
  if(c.i===3){s.bomb={state:'fly',x:u.x,y:u.y,angle:a,travel:0,event:e,start:now()};sound(u,260,.2)}
 },{attackTiming:{windup:.12,recovery:.08}});

 m.heroHooks[ID]={
  cooldownRemaining:(u,i,v)=>i===1?(totalCharges(u)>0?0:Math.max(0,S(u).nextCharge-now())):v,
  prepare(u,i){let s=S(u);if(s.rewind)return false;if(i===1&&totalCharges(u)<=0)return false},
  canMove:u=>!S(u).rewind,
  bonusAS:u=>S(u).qUntil>now()?P.Q.bonus_as:0,
  beforeAttack(u){let s=S(u);if(s.rewind)return false;if(s.reloadUntil||s.ammo<=0){startReload(u);return false}},
  attackProfile:()=>({windup:.03,recovery:.03,projectileSpeed:P.P.projectile_speed}),
  // 冲锋枪：每 0.25 秒（随攻速缩短）一轮 8 发，一个弹匣 40 发 1.25 秒打完；每轮按一次普攻结算（触发普攻特效/装备）
  attackInterval:(u)=>P.P.empty_time/P.P.magazine*Math.min(1,(u.baseAS||P.BASE.as_base)/Math.max(.01,u.attackSpeed)),
  attackPacket(u,t,p){if(!p||!Number.isFinite(p.damage))return;let s=S(u);p.bullets=1;p.onHitScale=P.P.on_hit_scale;p.damage*=P.P.bullet_ad_ratio;if(s.qUntil>now())p.damage*=P.Q.aa_damage_ratio},
  attackRelease(u,t,p){let s=S(u);if(t?.type==='hero'&&t.team!==u.team)s.lastCombat=now();let per=P.P.empty_time/P.P.magazine*Math.min(1,(u.baseAS||P.BASE.as_base)/Math.max(.01,u.attackSpeed)),gap=now()-(s.lastShot??-99),n=gap>.25?1:Math.max(1,Math.min(4,Math.round(gap/per)));n=Math.min(n,s.ammo);s.ammo=Math.max(0,s.ammo-n);s.lastShot=now();for(let k=1;k<n;k++){if(!live(t))break;m.basicImpact(u,t,{...p,impacted:false,hitIndex:'tracer-b'+k+'-'+now()})}if(s.ammo<=0)startReload(u);s.side=!s.side;fx(u,{kind:'burst',x:u.x,y:u.y,tx:t.x,ty:t.y,n:1,side:(s.side=!s.side)?1:-1,life:.08});sound(u,s.qUntil>now()?1500:1200,.025)},
  attackHit(u,t,p){if(t?.type!=='hero'||t.team===u.team)return;let s=S(u);s.lastCombat=now();if(s.qUntil>now()&&!s.qHit){s.qHit=true;gain(u,P.P.energy_q)}else gain(u,P.P.energy_aa)},
  reduceDamage(t,value,src){if(S(t).rewind)return 0;if(src&&src.team!==t.team)S(t).lastCombat=now();return value},
  tick(u,dt){let s=S(u),t=now();
   if(s.rewind){rewindTick(u);return}
   if(t-s.lastSample>=P.E.sample-1e-9)sample(u);
   if(!s.reloadUntil&&s.ammo<P.P.magazine&&!s.rewind&&t-(s.lastShot??-99)>=P.P.idle_reload_delay&&!u.pendingAttack)startReload(u);
   if(s.reloadUntil&&t+1e-9>=s.reloadUntil){s.ammo=P.P.magazine;s.reloadUntil=0;core.emit('ReloadCompleted',u,u)}
   if(s.charges<P.W.charges_max&&s.nextCharge&&t+1e-9>=s.nextCharge){s.charges++;s.nextCharge=s.charges<P.W.charges_max?s.nextCharge+P.W.recharge:0}
   if(s.qUntil&&t>=s.qUntil){s.qUntil=0;m.recalc(u)}
   if(s.untargetUntil&&t>=s.untargetUntil){s.untargetUntil=0;u.untargetable=0}
   if(t-s.lastCombat>=P.P.ooc_delay)gain(u,P.P.energy_ooc_regen*dt);
   bombTick(u,dt)},
  reset(u){let s=S(u);Object.assign(s,{rewind:null,ammo:P.P.magazine,reloadUntil:0,qUntil:0,history:[],bomb:null,untargetUntil:0});u.untargetable=0},
  describeExtra(u,i){let s=S(u);if(i===0)return '当前弹药 '+s.ammo+'/'+P.P.magazine+'。';if(i===1)return '闪现充能 '+s.charges+'/'+P.W.charges_max+(s.bonusBlink?' +1（时间能量）':'')+(s.nextCharge?'，下一层 '+Math.max(0,s.nextCharge-now()).toFixed(1)+' 秒':'')+'。';return ''}
 };
 // 技能命中英雄 +6 能量（每次施放一次；R 在爆炸时单独结算）
 core.on?.('AbilityHit',e=>{let u=units().find(v=>v.id===e.sourceId);if(u?.hero!==ID||e.abilityId===3)return;let t=units().find(v=>v.id===e.targetId);if(t?.type!=='hero')return;let s=S(u);if(s.skillHitCast.has(e.castId))return;s.skillHitCast.add(e.castId);if(s.skillHitCast.size>50)s.skillHitCast=new Set([...s.skillHitCast].slice(-20));gain(u,P.P.energy_skill)});

 // ---- 绘制 ----
 function draw(ctx,viewer){let T=now();for(let u of units()){if(u.hero!==ID)continue;let s=S(u),seen=!viewer||u.team===viewer.team||env.visibleTo?.(viewer,u)!==false;
  s.fx=s.fx.filter(f=>T-f.start<f.life);
  for(let f of s.fx){let k=(T-f.start)/f.life;ctx.save();ctx.globalAlpha=1-k;
   if(f.kind==='blink'){let n=5;for(let j=0;j<=n;j++){let p=j/n;ctx.globalAlpha=(1-k)*(.15+.35*p);ctx.fillStyle='#5ec8ff';ctx.beginPath();ctx.arc(f.x0+(f.x1-f.x0)*p,f.y0+(f.y1-f.y0)*p,(u.radius||22)*(.6+.3*p),0,TAU);ctx.fill()}ctx.globalAlpha=1-k;ctx.strokeStyle='#bfeaff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x0,f.y0);ctx.lineTo(f.x1,f.y1);ctx.stroke()}
   else if(f.kind==='burst'){let ang=Math.atan2(f.ty-f.y,f.tx-f.x),sh=f.n||1;for(let j=0;j<sh;j++){let t0=0;let side=f.side||1,ox=f.x+Math.cos(ang)*24-Math.sin(ang)*9*side,oy=f.y+Math.sin(ang)*24+Math.cos(ang)*9*side,q=k,len=Math.hypot(f.tx-ox,f.ty-oy);ctx.globalAlpha=.9*(1-q);ctx.strokeStyle='#e8f8ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox+Math.cos(ang)*len*q*.7,oy+Math.sin(ang)*len*q*.7);ctx.lineTo(ox+Math.cos(ang)*len*Math.min(1,q*.7+.3),oy+Math.sin(ang)*len*Math.min(1,q*.7+.3));ctx.stroke();if(q<.3&&seen){ctx.fillStyle='#bfeaff';ctx.beginPath();ctx.arc(ox,oy,4,0,TAU);ctx.fill()}}}
   else if(f.kind==='muzzle'&&seen){ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.fillStyle='#bfeaff';ctx.beginPath();ctx.arc(26,f.side*9,6*(1-k)+2,0,TAU);ctx.fill()}
   else if(f.kind==='recallFrom'){ctx.strokeStyle='#5ec8ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(f.x,f.y,40*(1-k)+5,0,TAU);ctx.stroke()}
   else if(f.kind==='recallTo'){let ally=!viewer||u.team===viewer.team,c1=ally?'94,200,255':'255,80,80',c2=ally?'220,245,255':'255,210,210';if(k<.25){ctx.fillStyle='rgba('+c2+','+(.85*(1-k/.25))+')';ctx.beginPath();ctx.arc(f.x,f.y,30+40*k/.25,0,TAU);ctx.fill()}for(let j=0;j<3;j++){ctx.strokeStyle='rgba('+(j?c1:c2)+',.95)';ctx.lineWidth=5-j;ctx.beginPath();ctx.arc(f.x,f.y,Math.max(1,15+90*k-j*14),0,TAU);ctx.stroke()}for(let j=0;j<12;j++){let a=j*TAU/12,r0=20+40*k,r1=40+90*k;ctx.strokeStyle='rgba('+c1+',.85)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*r0,f.y+Math.sin(a)*r0);ctx.lineTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1);ctx.stroke()}}
   else if(f.kind==='recallTrail'&&f.pts?.length>1){ctx.strokeStyle='#5ec8ff';ctx.lineWidth=5;ctx.setLineDash?.([10,8]);ctx.beginPath();f.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash?.([])}
   else if(f.kind==='boom'){ctx.fillStyle='rgba(255,150,40,'+(.45*(1-k))+')';ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.4+.6*Math.min(1,k*2)),0,TAU);ctx.fill();ctx.strokeStyle='#5ec8ff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.3+.8*k),0,TAU);ctx.stroke()}
   else if(f.kind==='stick'||f.kind==='bonus'||f.kind==='bombBlocked'){ctx.strokeStyle=f.kind==='bombBlocked'?'#9aa4b2':'#5ec8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,20+30*k,0,TAU);ctx.stroke()}
   else if(f.kind==='q'&&seen&&alive(u)){ctx.globalAlpha=.6;ctx.strokeStyle='#5ec8ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(u.x,u.y,(u.radius||22)+14,T*10,T*10+4);ctx.stroke()}
   ctx.restore()}
  if(s.rewind&&alive(u)){let R=s.rewind,k=Math.min(1,(T-R.start)/(R.end-R.start)),ally=!viewer||u.team===viewer.team,c1=ally?'94,200,255':'255,80,80',c2=ally?'191,234,255':'255,190,190';ctx.save();
   let g=ctx.createRadialGradient?ctx.createRadialGradient(u.x,u.y,4,u.x,u.y,70):null;if(g){g.addColorStop(0,'rgba('+c2+',.55)');g.addColorStop(1,'rgba('+c1+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(u.x,u.y,70,0,TAU);ctx.fill()}
   for(let j=0;j<4;j++){ctx.strokeStyle='rgba('+(j%2?c2:c1)+',.9)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(u.x,u.y,26+j*11+6*Math.sin(T*10+j),-T*14-j*1.3,-T*14-j*1.3+3.6);ctx.stroke()}
   for(let j=0;j<10;j++){let a=j*TAU/10-T*6,r=60*(1-((T*2+j/10)%1));ctx.fillStyle='rgba('+c2+',.85)';ctx.beginPath();ctx.arc(u.x+Math.cos(a)*r,u.y+Math.sin(a)*r,2.5,0,TAU);ctx.fill()}
   ctx.fillStyle='rgba('+c2+',1)';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText('⟲ 闪回 '+Math.max(0,R.end-T).toFixed(2),u.x,u.y-(u.radius||22)-48);ctx.restore()}
  let b=s.bomb;if(b){ctx.save();let pulse=.5+.5*Math.sin(T*20);ctx.fillStyle='#1d3f5a';ctx.strokeStyle='#5ec8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y-(b.target?40:0),10,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(94,200,255,'+(.5+.5*pulse)+')';ctx.beginPath();ctx.arc(b.x,b.y-(b.target?40:0),4,0,TAU);ctx.fill();
   if(b.state!=='fly'){let left=Math.max(0,b.fuseAt-T);ctx.strokeStyle='rgba(255,150,40,.85)';ctx.lineWidth=3;ctx.setLineDash?.([12,8]);ctx.beginPath();ctx.arc(b.x,b.y,P.R.radius,0,TAU);ctx.stroke();ctx.setLineDash?.([]);ctx.fillStyle='#ffb347';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText(left.toFixed(1),b.x,b.y-(b.target?62:22))}ctx.restore()}
  if(!alive(u)||!seen||s.rewind)continue;
  // 血条下方：弹药条 + 时间能量条
  ctx.save();let y=u.y-92*(u.visualScale||1)+9,bw=65;ctx.fillStyle='#07121ee8';ctx.fillRect(u.x-bw/2-1,y-1,bw+2,8);ctx.fillStyle=s.reloadUntil?'#3a3f46':'#bfeaff';ctx.fillRect(u.x-bw/2,y,bw*s.ammo/P.P.magazine,3);
  if(s.reloadUntil){ctx.fillStyle='#7fd6ff';ctx.fillRect(u.x-bw/2,y,bw*(1-(s.reloadUntil-T)/P.P.reload),3)}ctx.fillStyle='#ffb347';ctx.fillRect(u.x-bw/2,y+4,bw*s.energy/P.P.energy_max,2);
  for(let i=0;i<P.W.charges_max+P.P.bonus_blink_max;i++){let have=i<s.charges||(i>=P.W.charges_max&&s.bonusBlink>i-P.W.charges_max);if(i>=P.W.charges_max&&!s.bonusBlink)continue;ctx.fillStyle=have?(i>=P.W.charges_max?'#ffb347':'#5ec8ff'):'#3a3f46';ctx.beginPath();ctx.arc(u.x+bw/2+8+i*9,y+2,3.5,0,TAU);ctx.fill()}ctx.restore()}
  hud(viewer)}
 function hud(viewer){if(typeof document==='undefined'||!document.body)return;let el=document.getElementById('tracerHud');if(!viewer||viewer.hero!==ID||!alive(viewer)){if(el)el.style.display='none';return}
  let s=S(viewer),host=document.getElementById('abilityControls')||document.body;if(!el){el=document.createElement('div');el.id='tracerHud';el.style.cssText='position:absolute;right:210px;bottom:178px;z-index:40;padding:4px 8px;border-radius:6px;background:rgba(10,14,22,.82);border:1px solid #5ec8ff99;color:#bfeaff;font:bold 12px "Microsoft YaHei",sans-serif;pointer-events:none;white-space:nowrap';host.appendChild(el)}
  el.style.display='';let nc=s.nextCharge?Math.max(0,s.nextCharge-now()):0;let html=(s.reloadUntil?'装填中 '+Math.max(0,s.reloadUntil-now()).toFixed(1)+'s':'弹药 '+s.ammo+'/'+P.P.magazine)+' · 闪现 '+s.charges+'/'+P.W.charges_max+(s.bonusBlink?'+1':'')+(nc?' ('+nc.toFixed(1)+'s)':'')+' · 时间能量 '+Math.floor(s.energy)+(s.qUntil>now()?' · 速射 '+(s.qUntil-now()).toFixed(1)+'s':'');if(el._last!==html){el._last=html;el.textContent=html}}
 m.tracer={state:S,draw,ammo:u=>S(u).ammo,charges:totalCharges,recall,explode,bomb:u=>S(u).bomb,energy:u=>S(u).energy,gain};
};
})();
