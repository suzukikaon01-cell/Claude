/* V19 原创装备效果：山岳巨颚（生命转普攻伤害 + 扇形溅射）、熔铸心甲（额外生命转攻击力 + 低血量增伤）。
 * 数据（价格、属性、合成）在 balance-v19.js 注入 GAME_CONFIG.items。 */
(()=>{'use strict';
const create=window.createItemEffects;if(!create)return;
window.createItemEffects=function(env,m){
 const base=create(env,m),C=GAME_CONFIG,now=env.time,units=env.units,live=u=>u&&u.hp>0&&!(u.death>0),own=(u,id)=>(u.items||[]).some(v=>(typeof v==='string'?v:v.id)===id),P=id=>C.itemParams[id];
 const foe=(u,t)=>live(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0);
 function basicHit(u,t,a={}){base.basicHit(u,t,a);if(!own(u,'GIANT_MAW')||!live(t)||a.itemEffect)return;let p=P('GIANT_MAW'),ranged=!m.isMelee(u),dmg=u.maxHp*p.hit_maxhp_pct*(ranged?p.ranged_ratio:1)*(a.onHitEffectiveness??1),meta={itemEffect:true,itemId:'GIANT_MAW',event:a.event};
  m.deal(t,dmg,u,'physical',{...meta,hitIndex:'maw-main'});
  let ang=Math.atan2(t.y-u.y,t.x-u.x),half=p.cleave_degrees*Math.PI/360;
  for(let v of m.nearby(t,p.cleave_range+80,v=>foe(u,v)&&v!==t)){let dx=v.x-t.x,dy=v.y-t.y,d=Math.hypot(dx,dy);if(d>p.cleave_range+(v.radius||0))continue;let da=Math.atan2(dy,dx)-ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(d>(v.radius||20)&&Math.abs(da)>half)continue;m.deal(v,dmg,u,'physical',{...meta,hitIndex:'maw-cleave:'+v.id})}
  u.giantMawVisual={x:t.x,y:t.y,angle:ang,until:now()+.25}}
 function lowHpPct(u,ratio){let p=P('FORGED_HEART'),r=ratio??(u.maxHp>0?u.hp/u.maxHp:1);return r>=p.low_hp_threshold?0:p.low_hp_max_ad_pct*Math.min(1,(p.low_hp_threshold-r)/p.low_hp_threshold)}
 function deriveStats(u,s,ratio){base.deriveStats?.(u,s,ratio);if(own(u,'DIMENSION_BLADE')){u.attack+=P('DIMENSION_BLADE').ex_attack;if(u.dimState?.cured)u.crit=Math.min(1,(u.crit||0)+P('DIMENSION_BLADE').cure_crit)}if(!own(u,'FORGED_HEART'))return;let p=P('FORGED_HEART'),bonusHp=Math.max(0,s.bonusHp??(s.hp-(u.stats?.hp||0)-(u.stats?.growth?.hp||0)*Math.max(0,(u.level||1)-1))),add=bonusHp*p.bonus_hp_to_ad_pct;u.attack+=add;let low=lowHpPct(u,ratio);u.forgedHeartLowPct=low;if(low>0)u.attack*=1+low}
 let tick=function(dt){base.tick?.(dt);let T=now();
  for(let u of units()){if(u.type!=='hero')continue;if(!own(u,'DIMENSION_BLADE')||!live(u)){if(u.dimState){u.dimState=null;m.recalc(u)}continue}let p=P('DIMENSION_BLADE'),st=u.dimState??={eroded:false,cured:false,dealt:0,nextErosionAt:0,curedUntil:0},fight=(u.combatMarkAt??-1e9)>T-p.combat_timeout;
   if(fight&&!st.eroded&&!st.cured&&T>=(st.nextErosionAt||0)){st.eroded=true;st.dealt=0;st.nextErosionAt=T+p.erosion_cooldown}
   if(!fight&&st.eroded){st.eroded=false;st.dealt=0}
   if(st.cured&&T>=st.curedUntil){st.cured=false;m.recalc(u)}
   if(st.eroded){st.erodeNext??=T+.25;while(st.erodeNext<=T+1e-9){u.hp=Math.max(1,u.hp-u.maxHp*p.erosion_pct*.25);st.erodeNext+=.25}}else st.erodeNext=null}for(let u of units()){let g=u.gargoyleRegen;if(!g)continue;if(!live(u)){u.gargoyleRegen=null;continue}g.next??=g.until-5+.1;while(g.next<=T+1e-9&&g.next<=g.until+1e-9){m.heal(u,g.rate*.1,u,{itemEffect:true,itemId:'GARGOYLE_MASK'});g.next+=.1}if(T>=g.until)u.gargoyleRegen=null}for(let u of units()){let b=u.voidBurn;if(!b)continue;if(!live(u)){u.voidBurn=null;continue}b.next??=b.start+.25;while(b.next<=T+1e-9&&b.next<=b.until+1e-9){m.deal(u,b.dps*.25,live(b.source)?b.source:null,'magic',{itemEffect:true,dot:true,itemId:'VOID_SPEAR',hitIndex:'void-burn:'+b.next.toFixed(2)});b.next+=.25}if(T>=b.until)u.voidBurn=null}for(let u of units()){if(u.type!=='hero'||!live(u)||!own(u,'FORGED_HEART'))continue;let step=Math.round(lowHpPct(u)*200);if(step!==u.forgedHeartStep){u.forgedHeartStep=step;m.recalc(u)}}}
 function afterDamage(u,t,amount,type,a={}){base.afterDamage?.(u,t,amount,type,a);if(!u||!t||u.team===t.team||!(amount>0)||!['hero','minion','monster'].includes(t.type))return;
  bladeAfterDamage(u,t,amount,type,a);
  if(own(u,'CHOCO_ICE')&&live(t)&&!a.dot){let p=P('CHOCO_ICE');m.slow(t,p.slow_pct,p.slow_duration,u,null,'choco-ice:'+u.id)}
  if(own(u,'VOID_SPEAR')&&live(t)&&!a.itemEffect&&!a.basic&&!a.dot&&a.event&&Number.isInteger(a.event.index)){let p=P('VOID_SPEAR'),total=p.burn_base+p.burn_ap_ratio*(u.ap||0);t.voidBurn={source:u,start:now(),until:now()+p.burn_duration,dps:total/p.burn_duration}}}
 function gargoyleHealPct(u){let p=P('GARGOYLE_MASK'),r=u.maxHp>0?u.hp/u.maxHp:1;if(r>=p.heal_start_ratio)return 0;let k=Math.min(1,(p.heal_start_ratio-r)/(p.heal_start_ratio-p.heal_full_ratio));return p.heal_min_pct+(p.heal_max_pct-p.heal_min_pct)*k}
 const isAttackOrAbility=a=>!a.itemEffect&&!a.dot&&(a.basic||Number.isInteger(a.event?.index)&&a.event.index>=0&&a.event.index<=3);
 function bladeAfterDamage(u,t,amount,type,a){if(!u||!t||u.team===t.team||!(amount>0))return;let T=now();if(u.type==='hero'&&t.type==='hero'){u.combatMarkAt=T;t.combatMarkAt=T}
  if(!own(u,'DIMENSION_BLADE'))return;let p=P('DIMENSION_BLADE');
  if(t.type==='hero'&&u.dimState?.eroded&&!a.dimElement){let st=u.dimState;st.dealt+=amount;if(st.dealt>=p.cure_base+p.cure_per_level*(u.level||1)){st.eroded=false;st.cured=true;st.curedUntil=T+p.cure_duration;m.heal(u,Math.max(0,u.maxHp-u.hp)*p.cure_heal_missing_pct,u,{itemEffect:true,itemId:'DIMENSION_BLADE'});u.dimFx={kind:'cure',until:T+.8};m.recalc(u)}}
  if(isAttackOrAbility(a)&&live(t)&&['hero','minion','monster'].includes(t.type)){let k='dimIcd:'+u.id;if(!((t[k]||-1)>T)){t[k]=T+p.element_icd;let lv=Math.min(18,Math.max(1,u.level||1)),dmg=(p.element_min+(p.element_max-p.element_min)*(lv-1)/17)*(a.sourceType==='ABILITY_BASIC_ATTACK'?(C.heroParams[u.hero]?.Q?.on_hit_effectiveness_pct??1):1);m.deal(t,dmg,u,'magic',{itemEffect:true,dimElement:true,itemId:'DIMENSION_BLADE',hitIndex:'dim-element:'+T})}}}
 function healAmount(u,amount,source,meta){let v=base.healAmount?base.healAmount(u,amount,source,meta)??amount:amount;if(!(v>0))return v;let mul=1;if(own(u,'CHOCO_ICE'))mul+=P('CHOCO_ICE').heal_bonus_pct;if(own(u,'GARGOYLE_MASK'))mul+=gargoyleHealPct(u);return v*mul}
 function lethal(u,source,meta={}){if(base.lethal?.(u,source,meta))return true;
  if(u.type==='hero'&&own(u,'DIMENSION_BLADE')&&!((u.dimReviveReadyAt||0)>now())){let p=P('DIMENSION_BLADE');u.dimReviveReadyAt=now()+p.cooldown;u.hp=1;m.core.apply(u,'DAMAGE_IMMUNITY',p.revive_invuln,u,{tag:'DIM_REVIVE',tenacity:false});u.dimFx={kind:'revive',until:now()+p.revive_invuln};env.itemFeedback?.('DIMENSION_BLADE',u);return true}if(u.type!=='hero'||!own(u,'GARGOYLE_MASK')||(u.gargoyleReadyAt||0)>now())return false;let p=P('GARGOYLE_MASK');u.gargoyleReadyAt=now()+p.cooldown;u.hp=1;let total=(u.maxHp-1)*p.revive_missing_pct;u.gargoyleRegen={until:now()+p.revive_duration,next:now()+.1,rate:total/p.revive_duration};u.gargoyleFx={start:now(),until:now()+p.revive_duration};env.itemFeedback?.('GARGOYLE_MASK',u);return true}
 function onTakedown(u,t,a={}){base.onTakedown?.(u,t,a);if(t?.type!=='hero'||!['kill','assist'].includes(a.kind)||!own(u,'VOID_SPEAR')||!u.cd)return;u.cd[3]=Math.max(0,(u.cd[3]||0)*(1-P('VOID_SPEAR').kill_ult_cd_pct))}
 // 保命装备冷却：装备栏显示倒计时；冷却完毕时英雄身上显示特效（敌我可见，受战争迷雾限制）。
 const REVIVE_ITEMS={guardian:{color:'#ffd866',glow:'#fff3b0'},GARGOYLE_MASK:{color:'#ff5a46',glow:'#c9c9c0'},DIMENSION_BLADE:{color:'#b07cff',glow:'#efe2ff'}};
 function readyAt(u,id){if(id==='GARGOYLE_MASK')return u.gargoyleReadyAt||0;if(id==='DIMENSION_BLADE')return u.dimReviveReadyAt||0;return window.ItemSystem?.state?.(u)?.cooldowns?.[id]||0}
 function itemCooldownLeft(u,id){return Math.max(0,readyAt(u,id)-now())}
 let hudStamp=0;
 function updateHud(){let doc=typeof document!=='undefined'?document:null,box=doc?.getElementById?.('inventorySlots');if(!box?.children)return;let p=units().find(u=>u.player);if(!p)return;
  [...box.children].forEach((b,i)=>{let id=p.items?.[i],id2=typeof id==='string'?id:id?.id,left=REVIVE_ITEMS[id2]?itemCooldownLeft(p,id2):0,o=b.querySelector?.('.item-cd');
   if(left>0){if(!o){o=doc.createElement('span');o.className='item-cd';o.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;z-index:3;box-sizing:border-box;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.62);color:#fff;font:700 9px sans-serif;letter-spacing:-.5px;text-shadow:0 1px 2px #000;pointer-events:none;border-radius:inherit';if(b.style)b.style.position='relative';b.appendChild(o)}o.textContent=left>=60?Math.ceil(left/60)+'m':Math.ceil(left)+'';b.title=b.title.replace(/^(冷却 \S+ · )?/,'冷却 '+Math.ceil(left)+'秒 · ')}
   else if(o){o.remove();b.title=b.title.replace(/^冷却 \S+ · /,'')}})}
 const tick0=tick;tick=function(dt){tick0(dt);let T=now();if(T-hudStamp>=.2||T<hudStamp){hudStamp=T;try{updateHud()}catch{}}};
 function draw(ctx){base.draw?.(ctx);let T=now(),vis=env.visible||(()=>true);
  for(let u of units()){if(u.type!=='hero'||!live(u)||!vis(u))continue;let r0=(u.radius||28);
   let g=u.gargoyleFx;if(g&&T<g.until){let k=(T-g.start),burst=Math.min(1,k/.5);ctx.save();if(k<.6){ctx.globalAlpha=1-burst;ctx.strokeStyle='#ff3b2f';ctx.lineWidth=8;ctx.beginPath();ctx.arc(u.x,u.y,r0+20+burst*120,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=.35+.2*Math.sin(T*10);ctx.fillStyle='#ff2a1a';ctx.shadowColor='#ff5a46';ctx.shadowBlur=24;ctx.beginPath();ctx.arc(u.x,u.y,r0+8,0,Math.PI*2);ctx.fill();ctx.restore()}
   let d=u.dimFx;if(d&&T<d.until){ctx.save();if(d.kind==='revive'){ctx.globalAlpha=.55+.3*Math.sin(T*14);ctx.fillStyle='#fff6d8';ctx.shadowColor='#c9a2ff';ctx.shadowBlur=36;ctx.beginPath();ctx.arc(u.x,u.y,r0+14,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;ctx.strokeStyle='#b07cff';ctx.lineWidth=4;ctx.stroke()}else{ctx.globalAlpha=(d.until-T)/.8;ctx.strokeStyle='#e9d8ff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(u.x,u.y,r0+20+(.8-(d.until-T))*90,0,Math.PI*2);ctx.stroke()}ctx.restore()}
   if(u.dimState?.eroded){ctx.save();ctx.globalAlpha=.45;ctx.strokeStyle='#5a2a7a';ctx.lineWidth=3;ctx.setLineDash([4,6]);ctx.lineDashOffset=T*30;ctx.beginPath();ctx.arc(u.x,u.y,r0+6,0,Math.PI*2);ctx.stroke();ctx.restore()}}
  for(let u of units()){if(u.type!=='hero'||!live(u)||!vis(u))continue;let k=0;
   for(let id in REVIVE_ITEMS){if(!own(u,id)||itemCooldownLeft(u,id)>0)continue;let c=REVIVE_ITEMS[id],r=(u.radius||28)+14+k*9,ph=T*2+k;k++;
    ctx.save();ctx.globalAlpha=.8+.2*Math.sin(ph*2);ctx.strokeStyle=c.color;ctx.lineWidth=5;ctx.shadowColor=c.glow;ctx.shadowBlur=18;ctx.setLineDash([14,8]);ctx.lineDashOffset=-T*40;ctx.beginPath();ctx.arc(u.x,u.y,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    for(let j=0;j<3;j++){let a=ph+j*2.094;ctx.fillStyle=c.glow;ctx.beginPath();ctx.arc(u.x+Math.cos(a)*r,u.y+Math.sin(a)*r,7,0,Math.PI*2);ctx.fill()}ctx.restore()}}}
 // 太刀侠：只有普攻、登龙（兜割）和气刃解放斩可以暴击；其余技能不暴击。
 function modifyOutgoing(u,t,value,type,meta={}){let v=base.modifyOutgoing?base.modifyOutgoing(u,t,value,type,meta)??value:value;if(u?.hero==='longsword_hunter'&&!meta.basic&&!meta.critical&&!meta.itemEffect&&!meta.dot&&/^(helm|release):/.test(String(meta.hitIndex??''))&&(u.crit||0)>0&&v>0&&(env.random||Math.random)()<u.crit){meta.critical=true;v*=(C.baseCritMultiplier??1.75)+(u.critDamageBonus||0)}return v}
 return {...base,basicHit,deriveStats,tick,afterDamage,healAmount,onTakedown,lethal,draw,itemCooldownLeft,modifyOutgoing};
};
})();
// 推荐出装：肉装战士用新装备替换一件纯生命装。
(()=>{const I=window.ItemSystem;if(!I?.recommended)return;const rec=I.recommended,swap={garen:['warmog','GIANT_MAW'],sett:['warmog','FORGED_HEART'],darius:['warmog','GIANT_MAW']};
I.recommended=hero=>{let l=[...(rec(hero)||[])],s=swap[hero];if(s&&I.get(s[1])){let i=l.indexOf(s[0]);if(i>=0)l[i]=s[1]}return l}})();

// 复活类装备（守护天使、石像鬼面具、斩罪武具次元刀）只能持有其中一件。
(()=>{const I=window.ItemSystem;if(!I?.validatePurchase)return;const REVIVE=['GARGOYLE_MASK','DIMENSION_BLADE'],v=I.validatePurchase;
I.validatePurchase=(u,id,o={})=>{let r=v(u,id,o);if(!r?.ok||!REVIVE.includes(id))return r;let have=(u.items||[]).map(x=>typeof x==='string'?x:x?.id),consumed=new Set(I.quote?.(u,id)?.consumed||I.quote?.(u,id)?.uses||[]);if(have.some(k=>k!==id&&REVIVE.includes(k)&&!consumed.has(k)))return{ok:false,reason:'石像鬼面具、次元刀只能持有其中一件'};return r}})();
