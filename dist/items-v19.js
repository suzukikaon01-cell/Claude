/* V19 原创装备效果：山岳巨颚（生命转普攻伤害 + 扇形溅射）、熔铸心甲（额外生命转攻击力 + 低血量增伤）。
 * 数据（价格、属性、合成）在 balance-v19.js 注入 GAME_CONFIG.items。 */
(()=>{'use strict';
const create=window.createItemEffects;if(!create)return;
window.createItemEffects=function(env,m){
 const base=create(env,m),C=GAME_CONFIG,now=env.time,units=env.units,live=u=>u&&u.hp>0&&!(u.death>0),own=(u,id)=>(u.items||[]).some(v=>(typeof v==='string'?v:v.id)===id),P=id=>C.itemParams[id];
 const foe=(u,t)=>live(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0);
 function basicHit(u,t,a={}){base.basicHit(u,t,a);if(!own(u,'GIANT_MAW')||!live(t)||a.itemEffect)return;let p=P('GIANT_MAW'),ranged=!m.isMelee(u),dmg=u.maxHp*p.hit_maxhp_pct*(ranged?p.ranged_ratio:1),meta={itemEffect:true,itemId:'GIANT_MAW',event:a.event};
  m.deal(t,dmg,u,'physical',{...meta,hitIndex:'maw-main'});
  let ang=Math.atan2(t.y-u.y,t.x-u.x),half=p.cleave_degrees*Math.PI/360;
  for(let v of m.nearby(t,p.cleave_range+80,v=>foe(u,v)&&v!==t)){let dx=v.x-t.x,dy=v.y-t.y,d=Math.hypot(dx,dy);if(d>p.cleave_range+(v.radius||0))continue;let da=Math.atan2(dy,dx)-ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(d>(v.radius||20)&&Math.abs(da)>half)continue;m.deal(v,dmg,u,'physical',{...meta,hitIndex:'maw-cleave:'+v.id})}
  u.giantMawVisual={x:t.x,y:t.y,angle:ang,until:now()+.25}}
 function lowHpPct(u,ratio){let p=P('FORGED_HEART'),r=ratio??(u.maxHp>0?u.hp/u.maxHp:1);return r>=p.low_hp_threshold?0:p.low_hp_max_ad_pct*Math.min(1,(p.low_hp_threshold-r)/p.low_hp_threshold)}
 function deriveStats(u,s,ratio){base.deriveStats?.(u,s,ratio);if(!own(u,'FORGED_HEART'))return;let p=P('FORGED_HEART'),bonusHp=Math.max(0,s.bonusHp??(s.hp-(u.stats?.hp||0)-(u.stats?.growth?.hp||0)*Math.max(0,(u.level||1)-1))),add=bonusHp*p.bonus_hp_to_ad_pct;u.attack+=add;let low=lowHpPct(u,ratio);u.forgedHeartLowPct=low;if(low>0)u.attack*=1+low}
 function tick(dt){base.tick?.(dt);let T=now();for(let u of units()){let g=u.gargoyleRegen;if(!g)continue;if(!live(u)||T>=g.until){u.gargoyleRegen=null;continue}m.heal(u,Math.min(dt,g.until-T)*g.rate,u,{itemEffect:true,itemId:'GARGOYLE_MASK'})}for(let u of units()){let b=u.voidBurn;if(!b)continue;if(!live(u)||T>=b.until){u.voidBurn=null;continue}let d=Math.min(dt,b.until-T)*b.dps;if(d>0)m.deal(u,d,live(b.source)?b.source:null,'magic',{itemEffect:true,dot:true,itemId:'VOID_SPEAR',hitIndex:'void-burn'})}for(let u of units()){if(u.type!=='hero'||!live(u)||!own(u,'FORGED_HEART'))continue;let step=Math.round(lowHpPct(u)*200);if(step!==u.forgedHeartStep){u.forgedHeartStep=step;m.recalc(u)}}}
 function afterDamage(u,t,amount,type,a={}){base.afterDamage?.(u,t,amount,type,a);if(!u||!t||u.team===t.team||!(amount>0)||!['hero','minion','monster'].includes(t.type))return;
  if(own(u,'CHOCO_ICE')&&live(t)&&!a.dot){let p=P('CHOCO_ICE');m.slow(t,p.slow_pct,p.slow_duration,u,null,'choco-ice:'+u.id)}
  if(own(u,'VOID_SPEAR')&&live(t)&&!a.itemEffect&&!a.basic&&!a.dot&&a.event&&Number.isInteger(a.event.index)){let p=P('VOID_SPEAR'),total=p.burn_base+p.burn_ap_ratio*(u.ap||0);t.voidBurn={source:u,until:now()+p.burn_duration,dps:total/p.burn_duration}}}
 function gargoyleHealPct(u){let p=P('GARGOYLE_MASK'),r=u.maxHp>0?u.hp/u.maxHp:1;if(r>=p.heal_start_ratio)return 0;let k=Math.min(1,(p.heal_start_ratio-r)/(p.heal_start_ratio-p.heal_full_ratio));return p.heal_min_pct+(p.heal_max_pct-p.heal_min_pct)*k}
 function healAmount(u,amount,source,meta){let v=base.healAmount?base.healAmount(u,amount,source,meta)??amount:amount;if(!(v>0))return v;let mul=1;if(own(u,'CHOCO_ICE'))mul+=P('CHOCO_ICE').heal_bonus_pct;if(own(u,'GARGOYLE_MASK'))mul+=gargoyleHealPct(u);return v*mul}
 function lethal(u,source,meta={}){if(base.lethal?.(u,source,meta))return true;if(u.type!=='hero'||!own(u,'GARGOYLE_MASK')||(u.gargoyleReadyAt||0)>now())return false;let p=P('GARGOYLE_MASK');u.gargoyleReadyAt=now()+p.cooldown;u.hp=1;let total=(u.maxHp-1)*p.revive_missing_pct;u.gargoyleRegen={until:now()+p.revive_duration,rate:total/p.revive_duration};env.itemFeedback?.('GARGOYLE_MASK',u);return true}
 function onTakedown(u,t,a={}){base.onTakedown?.(u,t,a);if(t?.type!=='hero'||a.kind!=='kill'||!own(u,'VOID_SPEAR')||!u.cd)return;u.cd[3]=Math.max(0,(u.cd[3]||0)*(1-P('VOID_SPEAR').kill_ult_cd_pct))}
 return {...base,basicHit,deriveStats,tick,afterDamage,healAmount,onTakedown,lethal};
};
})();
// 推荐出装：肉装战士用新装备替换一件纯生命装。
(()=>{const I=window.ItemSystem;if(!I?.recommended)return;const rec=I.recommended,swap={garen:['warmog','GIANT_MAW'],sett:['warmog','FORGED_HEART'],darius:['warmog','GIANT_MAW']};
I.recommended=hero=>{let l=[...(rec(hero)||[])],s=swap[hero];if(s&&I.get(s[1])){let i=l.indexOf(s[0]);if(i>=0)l[i]=s[1]}return l}})();
