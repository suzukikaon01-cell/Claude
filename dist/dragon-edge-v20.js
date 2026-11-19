/* V20 「神龙之刃」效果（参照源氏原著）：
 * 拔刀疾斩：技能位移后强化接下来3次普攻；龙神之剑：施放终极技能后8秒攻击力+15%。 */
(()=>{'use strict';
const create=window.createItemEffects;if(!create)return;
window.createItemEffects=function(env,m){
 const base=create(env,m),C=GAME_CONFIG,ID='DRAGON_EDGE',now=env.time,P=()=>C.itemParams[ID],live=u=>u&&u.hp>0&&!(u.death>0),awake=new Set;
 const own=u=>(u?.items||[]).some(v=>(typeof v==='string'?v:v.id)===ID)&&!window.ItemPassivesV20?.suppressed?.(u,ID);
 const dashed=(u,i)=>{if(!own(u))return;let p=P();u.dragonEdgeCharges=p.charges;u.dragonEdgeUntil=now()+p.window};
 const core=m.core,start=core?.startDisplacement;
 if(start&&!start.dragonEdge){core.startDisplacement=function(u,to,o={}){let ok=start.apply(this,arguments);if(ok&&(o.source??u)===u&&['DASH','BLINK','LEAP'].includes(o.type??'DASH')&&Number.isInteger(o.abilityId))dashed(u,o.abilityId);return ok};core.startDisplacement.dragonEdge=true}
 if(core?.on&&!core.dragonEdgeListen){core.dragonEdgeListen=true;
  core.on('DisplacementStarted',e=>{if(e.sourceId!==e.targetId||!Number.isInteger(e.abilityId))return;let u=env.units().find(v=>v.id===e.sourceId);if(u)dashed(u,e.abilityId)});
  core.on('AbilityCommitted',e=>{if(e.abilityId!==3)return;let u=env.units().find(v=>v.id===e.sourceId);if(u?.type==='hero'&&own(u)){u.dragonAwakenUntil=now()+P().awaken_duration;awake.add(u);m.recalc(u)}})}
 function deriveStats(u,s,ratio){base.deriveStats?.(u,s,ratio);if(own(u)&&(u.dragonAwakenUntil||0)>now())u.attack*=1+P().awaken_ad_pct}
 function tick(dt){base.tick?.(dt);for(let u of [...awake])if(!((u.dragonAwakenUntil||0)>now())||!own(u)){awake.delete(u);u.dragonAwakenUntil=0;m.recalc(u)}}
 function basicHit(u,t,a={}){base.basicHit?.(u,t,a);if(!u||!t||a.itemEffect||!live(t)||t.team===u.team||!own(u))return;if(!(u.dragonEdgeCharges>0)||now()>(u.dragonEdgeUntil||0)){u.dragonEdgeCharges=0;return}
  let p=P();u.dragonEdgeCharges--;let bonusAd=Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0));m.deal(t,p.bonus_base+p.bonus_ad_ratio*bonusAd,u,'physical',{itemEffect:true,itemId:ID,event:a.event,hitIndex:'dragon-edge-'+u.dragonEdgeCharges});env.ring?.(t.x,t.y,40,'#5fe0a0',.25)}
 return {...base,deriveStats,tick,basicHit};
};
})();
