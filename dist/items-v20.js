/* V20 原创装备第一批（效果）：全部事件驱动；持续伤害只遍历正在生效的目标，不每帧扫描所有装备。 */
(()=>{'use strict';
const create=window.createItemEffects;if(!create)return;
window.createItemEffects=function(env,m){
 const base=create(env,m),C=GAME_CONFIG,now=env.time,units=env.units,live=u=>u&&u.hp>0&&!(u.death>0),own=(u,id)=>(u?.items||[]).some(v=>(typeof v==='string'?v:v.id)===id),P=id=>C.itemParams[id];
 const champ=t=>t?.type==='hero'&&!t.spiritOwner&&!t.tentacle&&!t.clone,epic=t=>t?.type==='monster'&&(t.epic||t.monsterType==='EPIC_MONSTER');
 const foe=(u,t)=>live(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0);
 const abilityHit=a=>!a.itemEffect&&!a.dot&&!a.basic&&Number.isInteger(a.event?.index)&&a.event.index>=0&&a.event.index<=3;
 const dots=new Set,timed=new Set;
 // 亚空之矛：击杀小兵/野怪（每3个）或史诗野怪叠层，英雄击杀/助攻在 onTakedown 中叠层。
 const voidStack=(u,n=1)=>{let p=P('VOID_SPEAR');if(!p)return;let before=u.voidSpearStacks||0;u.voidSpearStacks=Math.min(p.max_stacks,before+n);if(u.voidSpearStacks!==before)m.recalc(u)};
 m.core.on?.('UnitKilled',e=>{let list=units(),u=list.find(v=>v.id===e.sourceId),t=list.find(v=>v.id===e.targetId);if(!u||!t||u.type!=='hero'||!own(u,'VOID_SPEAR')||t.team===u.team)return;if(epic(t))return voidStack(u);if(t.type==='minion'||t.type==='monster'){u.voidSpearKills=(u.voidSpearKills||0)+1;if(u.voidSpearKills>=P('VOID_SPEAR').unit_kills_per_stack){u.voidSpearKills=0;voidStack(u)}}}); // timed：疾风层数、夜行、裂甲等需要到期刷新的单位 // 正在燃烧/破城的目标
 const item=(id,extra={})=>({itemEffect:true,itemId:id,...extra});

 function deriveStats(u,s,ratio){base.deriveStats?.(u,s,ratio);
  if(own(u,'SOVEREIGN_CROWN')){let p=P('SOVEREIGN_CROWN'),k=Math.max(0,p.base_pct+p.takedown_pct*Math.min(p.takedown_max,u.crownTakedowns||0)-p.death_pct*(u.crownDeaths||0));u.crownPct=k;
   for(let key of ['attack','ap','armor','mr','abilityHaste'])if(Number.isFinite(u[key]))u[key]*=1+k;if(Number.isFinite(u.attackSpeed))u.attackSpeed*=1+k;if(Number.isFinite(u.maxHp)){u.maxHp*=1+k}}
  if(own(u,'THUNDER_RING_BLADE')&&(u.thunderLethUntil||0)>now())u.armorPenFlat=(u.armorPenFlat||0)+P('THUNDER_RING_BLADE').lethality;
  if(own(u,'VOID_SPEAR')&&u.voidSpearStacks>0&&Number.isFinite(u.attackSpeed))u.attackSpeed+=(u.asRatio||u.baseAS||.625)*P('VOID_SPEAR').as_per_stack*u.voidSpearStacks;
  if(own(u,'EMBER_LANTERN')&&u.emberCount>0)u.ap*=1+P('EMBER_LANTERN').ap_pct_per_target*u.emberCount;
  let T=now();if(own(u,'GALE_LONGBOW')&&u.gale&&u.gale.until>T){let p=P('GALE_LONGBOW');if(Number.isFinite(u.attackSpeed))u.attackSpeed*=1+p.as_per_stack*u.gale.stacks;if(u.gale.stacks>=p.max_stacks&&Number.isFinite(u.speed))u.speed*=1+p.full_move_pct}
  if(own(u,'DUSKVEIL_BLADE')&&(u.duskUntil||0)>T&&Number.isFinite(u.speed))u.speed*=1+P('DUSKVEIL_BLADE').move_pct;
  if(u.sickle&&u.sickle.until>T&&Number.isFinite(u.armor))u.armor=Math.max(0,u.armor-u.sickle.per*u.sickle.stacks)}

 function basicHit(u,t,a={}){base.basicHit?.(u,t,a);if(!u||!t||a.itemEffect||!live(t))return;let T=now();
  if(own(u,'THUNDER_RING_BLADE')&&u.thunderCharged&&t.team!==u.team){let p=P('THUNDER_RING_BLADE');u.thunderCharged=false;m.deal(t,t.hp*p.current_hp_pct,u,'physical',item('THUNDER_RING_BLADE',{event:a.event,hitIndex:'thunder'}));u.thunderLethUntil=T+p.lethality_duration;m.recalc(u);u.v20Fx={kind:'thunder',x:t.x,y:t.y,until:T+.3}}
  if(own(u,'SIEGE_HORN')&&(u.sabotageUntil||0)>T&&(t.type==='tower'||epic(t))){let p=P('SIEGE_HORN');u.sabotageUntil=0;t.siegeDot={source:u,until:T+p.sabotage_duration,next:T+.5,per:p.sabotage_true/(p.sabotage_duration/.5)};dots.add(t)}
  if(own(u,'GALE_LONGBOW')&&champ(t)&&t.team!==u.team){let p=P('GALE_LONGBOW'),g=u.gale&&u.gale.until>T?u.gale:{stacks:0};u.gale={stacks:Math.min(p.max_stacks,g.stacks+1),until:T+p.duration};timed.add(u);m.recalc(u)}
  if(own(u,'DUSKVEIL_BLADE')&&u.duskEmpower&&t.team!==u.team){u.duskEmpower=false;m.deal(t,P('DUSKVEIL_BLADE').empower,u,'physical',item('DUSKVEIL_BLADE',{event:a.event,hitIndex:'dusk'}))}
  if(own(u,'HERETIC_HYDRA')&&t.team!==u.team){let p=P('HERETIC_HYDRA'),dmg=p.cleave_ad_ratio*u.attack*(a.onHitEffectiveness??1);for(let v of m.nearby(t,p.cleave_radius+60,v=>foe(u,v)&&v!==t))if(Math.hypot(v.x-t.x,v.y-t.y)<=p.cleave_radius+(v.radius||0))m.deal(v,dmg,u,'physical',item('HERETIC_HYDRA',{event:a.event,hitIndex:'hydra:'+v.id}));u.v20Fx={kind:'hydra',x:t.x,y:t.y,until:T+.25}}}

 function afterDamage(u,t,amount,type,a={}){base.afterDamage?.(u,t,amount,type,a);if(!u||!t||u.team===t.team||!(amount>0))return;let T=now();
  if(champ(t))(t.tideHits??={})[u.id]=T;
  if(own(t,'RECOIL_PLATE')&&champ(u)&&!((t.recoilReadyAt||0)>T)){let p=P('RECOIL_PLATE'),w=(t.recoilLog||[]).filter(e=>T-e.at<=p.window);w.push({at:T,v:amount});t.recoilLog=w;if(w.reduce((s,e)=>s+e.v,0)>=p.threshold){t.recoilLog=[];t.recoilReadyAt=T+p.cooldown;m.shield(t,t.maxHp*p.shield_maxhp_pct,p.shield_duration,t,{tag:'RECOIL_PLATE'});t.v20Fx={kind:'recoil',x:t.x,y:t.y,until:T+.5}}}
  if(a.critical&&a.basic&&!a.itemEffect&&own(u,'BLAZE_REPEATER')&&live(t)!==undefined){let p=P('BLAZE_REPEATER');for(let v of m.nearby(t,p.splash_radius+60,v=>foe(u,v)&&v!==t))if(Math.hypot(v.x-t.x,v.y-t.y)<=p.splash_radius+(v.radius||0))m.deal(v,amount*p.splash_ratio,u,'physical',item('BLAZE_REPEATER',{event:a.event,hitIndex:'blaze:'+v.id}));u.v20Fx={kind:'blaze',x:t.x,y:t.y,until:T+.3}}
  if(own(u,'RENDING_SICKLE')&&champ(t)&&!a.itemEffect&&!a.dot&&(a.basic||abilityHit(a))){let p=P('RENDING_SICKLE'),k=t.sickle&&t.sickle.until>T?t.sickle:{stacks:0};let st=Math.min(p.max_stacks,k.stacks+1);t.sickle={stacks:st,until:T+p.duration,per:p.armor_per_stack};timed.add(t);if(st!==k.stacks)m.recalc(t)}
  if(!abilityHit(a))return;
  if(own(u,'ASTRAL_ORB')&&champ(t))(t.astralMark??={})[u.id]=T+P('ASTRAL_ORB').duration;
  if(own(u,'FROSTVEIL_DIADEM')&&live(t)){let p=P('FROSTVEIL_DIADEM');m.slow(t,p.slow,p.slow_duration,u,null,'frostveil:'+u.id);(t.frostMark??={})[u.id]=T+p.slow_duration}
  if(own(u,'PSYCHIC_FONT')&&champ(t)&&!((u.fontReadyAt||0)>T)){let p=P('PSYCHIC_FONT');u.fontReadyAt=T+p.cooldown;m.shield(u,p.shield_base+p.shield_ap_ratio*(u.ap||0),p.shield_duration,u,{tag:'PSYCHIC_FONT'});u.v20Fx={kind:'font',x:u.x,y:u.y,until:T+.35}}
  if(own(u,'SHADEFANG')&&champ(t)&&live(t)&&t.hp<t.maxHp*P('SHADEFANG').hp_threshold){let p=P('SHADEFANG'),cdk=(u.shadeReady??={});if(!((cdk[t.id]||0)>T)){cdk[t.id]=T+p.cooldown;m.deal(t,p.damage+p.bonus_ad_ratio*Math.max(0,u.attack-(u.baseAttack??u.attack)),u,'physical',item('SHADEFANG',{event:a.event,hitIndex:'shade'}));u.v20Fx={kind:'shade',x:t.x,y:t.y,until:T+.35}}}
  if(own(u,'THUNDER_RING_BLADE')&&champ(t)&&!(u.thunderReadyAt>T)){u.thunderCharged=true;u.thunderReadyAt=T+P('THUNDER_RING_BLADE').cooldown}
  if(own(u,'SIEGE_HORN')&&(champ(t)||epic(t))){let ev=a.event,seen=(t.siegeCasts??={});if(seen[u.id]!==ev.castId){seen[u.id]=ev.castId;m.deal(t,P('SIEGE_HORN').ability_true,u,'true',item('SIEGE_HORN',{event:ev,hitIndex:'siege:'+t.id}))}}
  if(own(u,'EMBER_LANTERN')&&live(t)){let p=P('EMBER_LANTERN');t.emberBurn={source:u,until:T+p.burn_duration,next:Math.min(t.emberBurn?.next??Infinity,T+.5),per:(p.burn_base+p.burn_ap_ratio*(u.ap||0))/(p.burn_duration/.5)};dots.add(t)}
  if(own(u,'SURGE_CODEX')&&champ(t)&&!((u.surgeReadyAt||0)>T)){let p=P('SURGE_CODEX'),log=((u.surgeLog??={})[t.id]||[]).filter(e=>T-e.at<=p.window);if(!log.some(e=>e.cast===a.event.castId))log.push({cast:a.event.castId,at:T});u.surgeLog[t.id]=log;if(log.length>=p.hits){u.surgeLog[t.id]=[];u.surgeReadyAt=T+p.cooldown;m.deal(t,p.damage+p.ap_ratio*(u.ap||0),u,'magic',item('SURGE_CODEX',{event:a.event,hitIndex:'surge'}));u.v20Fx={kind:'surge',x:t.x,y:t.y,until:T+.35}}}}

 function onTakedown(u,t,a={}){base.onTakedown?.(u,t,a);if(!champ(t)||!['kill','assist'].includes(a.kind))return;let T=now();
  if(own(u,'VOID_SPEAR'))voidStack(u);
  if(own(u,'SOVEREIGN_CROWN')){u.crownTakedowns=(u.crownTakedowns||0)+1;m.recalc(u)}
  if(own(u,'SIEGE_HORN'))u.sabotageUntil=T+P('SIEGE_HORN').sabotage_window;
  if(own(u,'DUSKVEIL_BLADE')){u.duskUntil=T+P('DUSKVEIL_BLADE').duration;u.duskEmpower=true;timed.add(u);m.recalc(u)}
  if(own(u,'TIDEBREAK_ARC')&&u.cd&&T-(t.tideHits?.[u.id]??-99)<=P('TIDEBREAK_ARC').window){let s=u.skills?.[3],r=Math.max(1,u.skillRanks?.[3]||1),full=Array.isArray(s?.cd)?s.cd[Math.min(s.cd.length,r)-1]:(s?.cd||0);u.cd[3]=Math.max(0,(u.cd[3]||0)-P('TIDEBREAK_ARC').refund_pct*full)}}

 function modifyOutgoing(u,t,value,type,meta={}){let v=base.modifyOutgoing?base.modifyOutgoing(u,t,value,type,meta)??value:value;
  if(meta.critical&&!meta.itemEffect&&own(u,'STARFALL_VERDICT')&&v>0){let M=(C.baseCritMultiplier??1.75)+(u.critDamageBonus||0),extra=(env.random||Math.random)()*P('STARFALL_VERDICT').max_ratio_of_crit*Math.min(1,u.crit||0);v*=(M+extra)/M}
  if(v>0&&!meta.itemEffect&&!meta.dot&&champ(t)&&u){let T=now();
   if(own(u,'VERDICT_SCIMITAR')&&t.hp<t.maxHp*P('VERDICT_SCIMITAR').hp_threshold)v*=1+P('VERDICT_SCIMITAR').bonus_pct;
   if(abilityHit(meta)){if(own(u,'ASTRAL_ORB')&&(t.astralMark?.[u.id]||0)>T)v*=1+P('ASTRAL_ORB').bonus_pct;if(own(u,'FROSTVEIL_DIADEM')&&(t.frostMark?.[u.id]||0)>T)v*=1+P('FROSTVEIL_DIADEM').bonus_pct}}
  return v}

 let crownCheckAt=0;
 function tick(dt){base.tick?.(dt);let T=now();
  for(let t of dots){let alive=live(t),any=false;
   let b=t.emberBurn;if(b){if(!alive||T>b.until+1e-6||!live(b.source))t.emberBurn=null;else{any=true;while(b.next<=T+1e-9&&b.next<=b.until+1e-6){m.deal(t,b.per,b.source,'magic',item('EMBER_LANTERN',{dot:true}));b.next+=.5}}}
   let s=t.siegeDot;if(s){if(!alive||T>s.until+1e-6)t.siegeDot=null;else{any=true;while(s.next<=T+1e-9&&s.next<=s.until+1e-6){m.deal(t,s.per,s.source,'true',item('SIEGE_HORN',{dot:true}));s.next+=.5}}}
   if(!any)dots.delete(t)}
  for(let u of timed){let keep=false;if(u.gale){if(u.gale.until<=T){u.gale=null;m.recalc(u)}else keep=true}if(u.duskUntil){if(u.duskUntil<=T){u.duskUntil=0;m.recalc(u)}else keep=true}if(u.sickle){if(u.sickle.until<=T){u.sickle=null;m.recalc(u)}else keep=true}if(!keep)timed.delete(u)}
  if(T<crownCheckAt)return;crownCheckAt=T+.25;
  for(let u of units()){if(u.type!=='hero')continue;
   if(own(u,'SOVEREIGN_CROWN')){if(u.death>0){if(!u.crownDeadMark){u.crownDeadMark=true;u.crownDeaths=(u.crownDeaths||0)+1}}else if(u.crownDeadMark){u.crownDeadMark=false;m.recalc(u)}}else if(u.crownTakedowns||u.crownDeaths){u.crownTakedowns=0;u.crownDeaths=0}
   if(u.thunderLethUntil&&u.thunderLethUntil<=T){u.thunderLethUntil=0;m.recalc(u)}
   if(own(u,'EMBER_LANTERN')){let n=0;for(let t of dots)if(t.emberBurn?.source===u&&(champ(t)||epic(t)))n++;if(n!==(u.emberCount||0)){u.emberCount=n;m.recalc(u)}}else if(u.emberCount){u.emberCount=0}}}

 function draw(ctx){base.draw?.(ctx);let T=now(),vis=env.visible||(()=>true);
  for(let t of dots){if(!vis(t))continue;if(t.emberBurn){ctx.save();ctx.globalAlpha=.5+.2*Math.sin(T*12);ctx.strokeStyle='#a26bff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(t.x,t.y,(t.radius||24)+10,0,Math.PI*2);ctx.stroke();ctx.restore()}}
  for(let u of units()){let f=u.v20Fx;if(!f||f.until<=T||!vis(u))continue;let col={thunder:'#7fc8ff',hydra:'#9be15d',surge:'#5aa9ff',recoil:'#cfe0f0',blaze:'#ff6a3d',font:'#c38bff',shade:'#6c5ce7'}[f.kind]||'#fff';ctx.save();ctx.globalAlpha=Math.max(0,(f.until-T)/.35);ctx.strokeStyle=col;ctx.lineWidth=5;ctx.beginPath();ctx.arc(f.x,f.y,f.kind==='hydra'?P('HERETIC_HYDRA').cleave_radius:f.kind==='blaze'?P('BLAZE_REPEATER').splash_radius:50,0,Math.PI*2);ctx.stroke();ctx.restore()}}

 return {...base,deriveStats,basicHit,afterDamage,onTakedown,modifyOutgoing,tick,draw,v20Dots:dots};
};
})();
