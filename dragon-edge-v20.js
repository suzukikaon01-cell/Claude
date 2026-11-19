/* V20 「神龙之刃」效果：技能位移后强化接下来3次普攻；参与击杀英雄减少基础技能当前冷却。 */
(()=>{'use strict';
const create=window.createItemEffects;if(!create)return;
window.createItemEffects=function(env,m){
 const base=create(env,m),C=GAME_CONFIG,ID='DRAGON_EDGE',now=env.time,P=()=>C.itemParams[ID],live=u=>u&&u.hp>0&&!(u.death>0);
 const own=u=>(u?.items||[]).some(v=>(typeof v==='string'?v:v.id)===ID)&&!window.ItemPassivesV20?.suppressed?.(u,ID);
 const core=m.core,start=core?.startDisplacement;
 if(start&&!start.dragonEdge){core.startDisplacement=function(u,to,o={}){let ok=start.apply(this,arguments);if(ok&&own(u)&&(o.source??u)===u&&['DASH','BLINK','LEAP'].includes(o.type??'DASH')&&Number.isInteger(o.abilityId)){let p=P();u.dragonEdgeCharges=p.charges;u.dragonEdgeUntil=now()+p.window}return ok};core.startDisplacement.dragonEdge=true}
 if(core?.on&&!core.dragonEdgeListen){core.dragonEdgeListen=true;core.on('DisplacementStarted',e=>{if(e.sourceId!==e.targetId||!Number.isInteger(e.abilityId))return;let u=env.units().find(v=>v.id===e.sourceId);if(u&&own(u)){let p=P();u.dragonEdgeCharges=p.charges;u.dragonEdgeUntil=now()+p.window}})}
 function basicHit(u,t,a={}){base.basicHit?.(u,t,a);if(!u||!t||a.itemEffect||!live(t)||t.team===u.team||!own(u))return;if(!(u.dragonEdgeCharges>0)||now()>(u.dragonEdgeUntil||0)){u.dragonEdgeCharges=0;return}
  let p=P();u.dragonEdgeCharges--;let bonusAd=Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0));m.deal(t,p.bonus_base+p.bonus_ad_ratio*bonusAd,u,'physical',{itemEffect:true,itemId:ID,event:a.event,hitIndex:'dragon-edge-'+u.dragonEdgeCharges});env.ring?.(t.x,t.y,40,'#5fe0a0',.25)}
 function onTakedown(u,t,a={}){base.onTakedown?.(u,t,a);if(!own(u)||t?.type!=='hero'||!['kill','assist'].includes(a.kind)||!u.cd)return;let k=1-P().takedown_cd_pct;for(let i=0;i<3;i++)if(u.cd[i]>0)u.cd[i]*=k}
 return {...base,basicHit,onTakedown};
};
})();
