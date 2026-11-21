/* V21 崩山臂铠 / 防御矩阵核心 / 纳米激素枪 被动效果（接入现有 createItemEffects 钩子：afterDamage / modifyIncoming / basicHit）。 */
(()=>{'use strict';
const create=window.createItemEffects;if(!create)return;
window.createItemEffects=function(env,m){
 const base=create(env,m),C=GAME_CONFIG,now=env.time,P=id=>C.itemParams[id],live=u=>u&&u.hp>0&&!(u.death>0),core=m.core;
 const own=(u,id)=>(u?.items||[]).some(v=>(typeof v==='string'?v:v.id)===id)&&!window.ItemPassivesV20?.suppressed?.(u,id);
 const isAbility=meta=>Number.isInteger(meta?.event?.index)&&meta.event.index>=0&&!meta.basic&&!meta.itemEffect;
 // 火箭重拳：自身位移技能后开启窗口
 const start=core?.startDisplacement;
 if(start&&!start.heroItemsV21){core.startDisplacement=function(u,to,o={}){let ok=start.apply(this,arguments);if(ok&&(o.source??u)===u&&own(u,'SEISMIC_GAUNTLET')&&Number.isInteger(o.abilityId))u.gauntletPunchUntil=now()+P('SEISMIC_GAUNTLET').punch_window;if(ok&&(o.source??u)===u&&own(u,'CHRONO_PISTOLS')&&Number.isInteger(o.abilityId)){u.chronoCharges=P('CHRONO_PISTOLS').charges;u.chronoUntil=now()+P('CHRONO_PISTOLS').window}return ok};core.startDisplacement.heroItemsV21=true}
 if(core?.on&&!core.heroItemsV21Listen){core.heroItemsV21Listen=true;
  const boost=(src,t)=>{if(!src||!t||t.type!=='hero'||t.team!==src.team||t===src||!own(src,'NANO_RIFLE'))return;let p=P('NANO_RIFLE'),k='nanoBoost'+src.id;if((t[k]||-99)>now())return;t[k]=now()+p.boost_cd;core.apply(t,'MOVE_SPEED_BUFF',p.boost_duration,src,{amount:p.boost_ms,tenacity:false,uniqueKey:'nano-boost'})};
  const unit=id=>env.units().find(v=>v.id===id);
  core.on('HealingApplied',e=>boost(unit(e.sourceId),unit(e.targetId)));core.on('ShieldApplied',e=>boost(unit(e.sourceId),unit(e.targetId)))}
 function afterDamage(s,t,value,type,meta={}){base.afterDamage?.(s,t,value,type,meta);if(!s||!t||!(value>0))return;
  if(t.type==='hero'&&s.team!==t.team&&isAbility(meta)){
   if(own(s,'SEISMIC_GAUNTLET')){let p=P('SEISMIC_GAUNTLET'),cast=meta.event.castId??('t'+Math.floor(now()*10)),g=s.gauntletCast;if(!g||g.id!==cast)g=s.gauntletCast={id:cast,hit:new Set};if(!g.hit.has(t.id)&&g.hit.size<p.shield_targets){g.hit.add(t.id);let cur=(s.shields||[]).filter(x=>x.gauntlet&&x.until>now()).reduce((a,x)=>a+x.amount,0),add=Math.min(p.shield_base+p.shield_hp_pct*s.maxHp,Math.max(0,p.shield_cap_pct*s.maxHp-cur));if(add>0)m.shield(s,add,p.shield_duration,s,{gauntlet:true})}}
   if(own(s,'NANO_RIFLE')){let p=P('NANO_RIFLE');core.apply(t,'HEAL_REDUCTION',p.grievous_duration,s,{amount:p.grievous,uniqueKey:'nano-grievous'})}}
  if(t.type==='hero'&&own(t,'DEFENSE_MATRIX')&&live(t)){let p=P('DEFENSE_MATRIX');if(t.hp<t.maxHp*p.eject_threshold&&(t.ejectReadyAt||0)<=now()){t.ejectReadyAt=now()+p.eject_cd;m.shield(t,t.maxHp*p.eject_shield_pct,p.eject_duration,t,{eject:true});env.ring?.(t.x,t.y,70,'#ff7ac8',.4)}}}
 function modifyIncoming(t,value,s,type,meta={}){let v=base.modifyIncoming?.(t,value,s,type,meta)??value;if(own(t,'DEFENSE_MATRIX')&&(meta.projectile||meta.reflected)&&type!=='true')v*=1-P('DEFENSE_MATRIX').projectile_reduction;return v}
 function basicHit(u,t,a={}){base.basicHit?.(u,t,a);if(u&&t&&!a.itemEffect&&live(t)&&t.team!==u.team&&own(u,'CHRONO_PISTOLS')&&(u.chronoCharges||0)>0&&(u.chronoUntil||0)>now()){let p=P('CHRONO_PISTOLS');u.chronoCharges--;m.deal(t,p.bonus_base+p.bonus_ad_ratio*Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0)),u,'physical',{itemEffect:true,itemId:'CHRONO_PISTOLS',event:a.event,hitIndex:'chrono'+u.chronoCharges});env.ring?.(t.x,t.y,40,'#5ec8ff',.25)}if(u&&t&&!a.itemEffect&&live(t)&&t.team!==u.team&&own(u,'PEACEKEEPER')){let p=P('PEACEKEEPER');u.peaceCount=(u.peaceCount||0)+1;if(u.peaceCount>=p.every){u.peaceCount=0;let bonusAd=Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0)),crit=!['tower','nexus','inhibitor'].includes(t.type)&&(env.random?.()??Math.random())<(u.crit||0);m.deal(t,(p.bonus_base+p.bonus_ad_ratio*bonusAd)*(crit?(C.baseCritMultiplier??1.75)+(u.critDamageBonus||0):1),u,'physical',{itemEffect:true,itemId:'PEACEKEEPER',event:a.event,hitIndex:'peacekeeper',displayCritical:crit});env.ring?.(t.x,t.y,45,'#c9643c',.3)}if(a.critical&&t.type==='hero')core.apply(u,'MOVE_SPEED_BUFF',p.crit_ms_duration,u,{amount:p.crit_ms,tenacity:false,refresh:true,uniqueKey:'peacekeeper-ms'})}if(!u||!t||a.itemEffect||!live(t)||t.team===u.team||!own(u,'SEISMIC_GAUNTLET'))return;let p=P('SEISMIC_GAUNTLET');if((u.gauntletPunchUntil||0)<now()||(u.gauntletPunchCd||0)>now())return;u.gauntletPunchUntil=0;u.gauntletPunchCd=now()+p.punch_cd;m.deal(t,p.punch_base+p.punch_hp_pct*u.maxHp,u,'physical',{itemEffect:true,itemId:'SEISMIC_GAUNTLET',event:a.event,hitIndex:'gauntlet'});env.ring?.(t.x,t.y,55,'#ffb347',.3)}
 return {...base,afterDamage,modifyIncoming,basicHit};
};
// 推荐出装：三位英雄把专属装备放在第一件传说装备
const I=window.ItemSystem;if(I?.recommended&&!I.recommended.v21){const rec=I.recommended;I.recommended=function(hero){let list=[...(rec.apply(this,arguments)||[])],id=window.HERO_ITEMS_V21?.[hero];if(id&&!list.includes(id)){list.unshift(id);list.length=Math.min(list.length,6)}return list};I.recommended.v21=true}
})();
