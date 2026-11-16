/* V20 原创英雄「Claude · 四模型」与通用装备「长思之卷」。
 *
 * Claude 是远程法师，用 R「模型切换」在四种形态之间轮换：
 *  - Haiku（俳句）：轻快、便宜。伤害 ×0.75，冷却 ×0.7，移速 +12%，攻速 +30%。Q 按 5-7-5 连发三枚短句。
 *  - Sonnet（十四行诗）：均衡、可靠。伤害 ×1，攻速 +10%。Q 单发并减速，W 额外解除减速。
 *  - Opus（巨著）：深思、厚重。伤害 ×1.45，冷却 ×1.3，移速 −8%。Q 先“思考”0.6 秒再大范围落下。
 *  - Fable（寓言）：会讲故事。伤害 ×1.1，移速 +5%。Q 命中后故事分岔，弹向附近另外 2 个敌人；W 同时治疗。
 * P 上下文窗口：技能命中敌方英雄叠一层上下文（最多 10 层，8 秒不叠则清空，切换形态保留），每层技能伤害 +2%。
 *
 * 装备「长思之卷」：任何英雄可用。每次施放技能获得一层思路（6 秒，最多 3 层）；
 * 满 3 层时下一次技能伤害 +15%，并返还该技能 20% 剩余冷却（每 3 次施放触发一次）。
 */
(()=>{'use strict';
const ID='claude',C=window.GAME_CONFIG;if(!C||!C.heroes)return;
const lv=(a,b,n=5)=>Array.from({length:n},(_,i)=>+(a+(b-a)*i/(n-1)).toFixed(3));
const FORMS=['haiku','sonnet','opus','fable'];
const P={
 BASE:{hp_base:600,hp_growth:98,mana_base:400,mana_growth:40,ad_base:52,ad_growth:3,armor_base:24,armor_growth:4.4,mr_base:30,mr_growth:1.3,as_base:.64,as_ratio:.64,as_growth:.02,move_speed:215,attack_range:525,is_ranged:1,hero_name:'Claude'},
 P:{context_max:10,context_damage_pct:.02,context_duration:8,start_form:'sonnet'},
 FORMS:{
  haiku:{name:'Haiku',label:'俳句',damage:.75,cooldown:.7,move_pct:.12,bonus_as:.3,color:'#7fd6a8'},
  sonnet:{name:'Sonnet',label:'十四行诗',damage:1,cooldown:1,move_pct:0,bonus_as:.1,color:'#e8a26a'},
  opus:{name:'Opus',label:'巨著',damage:1.45,cooldown:1.3,move_pct:-.08,bonus_as:0,color:'#b28cff'},
  fable:{name:'Fable',label:'寓言',damage:1.1,cooldown:1,move_pct:.05,bonus_as:0,color:'#ffd56b'}},
 Q:{damage:[70,105,140,175,210],ap_ratio:.6,mana_cost:lv(50,70),cooldown:lv(7,5),range:900,projectile_speed:1400,
    haiku_angles:[-.17,0,.17],haiku_factors:[.55,.75,.55],sonnet_slow:.25,sonnet_slow_duration:1,
    opus_delay:.6,opus_radius:250,opus_range:800,fable_bounces:2,fable_bounce_range:450,fable_bounce_factor:.7},
 W:{shield:[70,100,130,160,190],ap_ratio:.45,duration:2.5,ally_range:650,mana_cost:70,cooldown:lv(16,12),haiku_move_pct:.2,haiku_move_duration:2,fable_heal_ratio:.4},
 E:{distance:350,haiku_distance:475,opus_distance:250,bonus:[40,65,90,115,140],ap_ratio:.4,window:4,mana_cost:60,cooldown:lv(12,8)},
 R:{burst:[80,140,200],ap_ratio:.4,radius:300,cooldown:[6,5,4],mana_cost:0}
};
const skill=o=>({maxRank:5,windup:.15,recovery:.1,damageType:'magic',heroOnly:false,...o});
C.heroes[ID]={name:'Claude',title:'四模型',role:'远程法师 / 形态切换',resource:'mana',color:'#e8a26a',
 stats:{hp:P.BASE.hp_base,mana:P.BASE.mana_base,attack:P.BASE.ad_base,ap:0,armor:P.BASE.armor_base,mr:P.BASE.mr_base,baseAS:P.BASE.as_base,asRatio:P.BASE.as_ratio,speed:P.BASE.move_speed,range:P.BASE.attack_range,hpRegen:6,manaRegen:8,
  growth:{hp:P.BASE.hp_growth,mana:P.BASE.mana_growth,attack:P.BASE.ad_growth,armor:P.BASE.armor_growth,mr:P.BASE.mr_growth,as:P.BASE.as_growth,hpRegen:.6,manaRegen:.8}},
 passive:{name:'上下文窗口',desc:'技能命中敌方英雄时叠一层上下文（最多10层，8秒未叠层则清空，切换形态不清空），每层使技能伤害+2%。\n四种形态（R切换，初始为Sonnet）：\nHaiku 俳句：伤害×0.75，冷却×0.7，移速+12%，攻速+30%。\nSonnet 十四行诗：伤害×1，攻速+10%。\nOpus 巨著：伤害×1.45，冷却×1.3，移速−8%。\nFable 寓言：伤害×1.1，移速+5%。',params:P.P},
 skills:[
  skill({key:'Q',name:'生成',icon:'生',target:'direction',range:900,width:60,projectileSpeed:1400,cd:P.Q.cooldown,mana:P.Q.mana_cost,damage:P.Q.damage,apRatio:P.Q.ap_ratio,
   desc:'朝指定方向生成一段回答，造成70/105/140/175/210+60%AP魔法伤害（乘形态伤害倍率）。Haiku：按5-7-5连发三枚短句，分别造成55%/75%/55%伤害。Sonnet：单发命中并减速25%持续1秒。Opus：先思考0.6秒，再在800码内的目标点落下250码范围的巨著。Fable：命中后故事分岔，弹向450码内另外2个敌人，各造成70%伤害。'}),
  skill({key:'W',name:'对齐',icon:'护',target:'self',range:0,cd:P.W.cooldown,mana:P.W.mana_cost,damage:0,shield:P.W.shield,apRatio:P.W.ap_ratio,
   desc:'为自己和650码内生命比例最低的一名友方英雄提供70/100/130/160/190+45%AP护盾（乘形态伤害倍率），持续2.5秒。Haiku：两人移速+20%持续2秒。Sonnet：解除两人身上的减速。Opus：护盾更厚（倍率×1.45）。Fable：同时回复护盾值40%的生命。'}),
  skill({key:'E',name:'工具调用',icon:'调',target:'direction',range:350,cd:P.E.cooldown,mana:P.E.mana_cost,damage:0,
   desc:'向指定方向闪现350码（Haiku 475码，Opus 250码），4秒内下一次普攻额外造成40/65/90/115/140+40%AP魔法伤害（乘形态伤害倍率）。'}),
  skill({key:'R',name:'模型切换',icon:'模',target:'self',range:0,radius:300,maxRank:3,cd:P.R.cooldown,mana:0,damage:P.R.burst,apRatio:P.R.ap_ratio,
   desc:'按 Haiku → Sonnet → Opus → Fable 的顺序切换到下一个形态，并对周围300码敌人造成80/140/200+40%AP魔法伤害（按新形态的伤害倍率）。冷却6/5/4秒。'})
 ],params:P};
C.heroParams??={};C.heroParams[ID]=P;
if(C.ultimateCooldowns)C.ultimateCooldowns[ID]=P.R.cooldown;
if(window.ChampionStats)ChampionStats[ID]=C.heroes[ID].stats;
if(window.ChampionAbilities)ChampionAbilities[ID]=C.heroes[ID].skills;

// ===== 通用装备：长思之卷（数据在 claude-item-v20.js，需在 items-v6 之前载入）=====
const ITEM='LONG_THOUGHT_CODEX';
const createBase=window.createItemEffects;
if(createBase)window.createItemEffects=function(env,m){
 const base=createBase(env,m),now=env.time,units=env.units,own=(u,id)=>(u?.items||[]).some(v=>(typeof v==='string'?v:v.id)===id)&&!window.ItemPassivesV20?.suppressed?.(u,id),IP=()=>C.itemParams[ITEM];
 m.core.on?.('AbilityCastStarted',e=>{let u=units().find(v=>v.id===e.sourceId);if(!u||u.type!=='hero'||!own(u,ITEM))return;let p=IP();if(!(e.abilityId>=0&&e.abilityId<=3))return;
  if((u.cotUntil||0)<now())u.cotStacks=0;u.cotStacks=(u.cotStacks||0)+1;u.cotUntil=now()+p.stack_duration;if(u.cotStacks>=p.stack_max){u.cotStacks=0;u.cotReady=now()+p.ready_window}});
 function modifyOutgoing(u,t,value,type,meta={}){let v=base.modifyOutgoing?base.modifyOutgoing(u,t,value,type,meta)??value:value;
  if(u?.cotReady>now()&&own(u,ITEM)&&!meta.itemEffect&&!meta.basic&&!meta.dot&&Number.isInteger(meta.event?.index)&&meta.event.index>=0&&meta.event.index<=3&&t?.team!==u.team){let p=IP();v*=1+p.damage_bonus;u.cotReady=0;let i=meta.event.index;if(u.cd?.[i]>0)u.cd[i]*=1-p.refund_pct}
  return v}
 return {...base,modifyOutgoing};
};

// ===== 英雄机制 =====
window.installClaude=function(m,env){
 const core=m.core,now=env.time,units=env.units,alive=t=>t&&t.hp>0&&!(t.death>0),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const rk=(u,i)=>Math.max(1,u.skillRanks?.[i]||1),at=(arr,u,i)=>Array.isArray(arr)?arr[Math.min(arr.length,rk(u,i))-1]:arr;
 const S=u=>u.claudeState??={form:P.P.start_form,context:0,contextUntil:0,pending:[],eReady:0,lastSwitch:-99};
 const F=u=>P.FORMS[S(u).form]||P.FORMS.sonnet;
 const foe=(u,t)=>alive(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0)&&!t.tentacle&&!t.spiritOwner;
 const champ=t=>t?.type==='hero'&&!t.clone&&!t.dvaBomb;
 function ctxMult(u){let s=S(u);if(now()>s.contextUntil)s.context=0;return 1+P.P.context_damage_pct*s.context}
 function scale(u){return F(u).damage*ctxMult(u)}
 function hit(u,t,amount,e,idx,extra={}){let ok=m.deal(t,amount,u,'magic',{event:e,once:true,hitIndex:idx,...extra});if(ok&&champ(t)){let s=S(u);if(now()>s.contextUntil)s.context=0;s.context=Math.min(P.P.context_max,s.context+1);s.contextUntil=now()+P.P.context_duration}return ok}
 const qDamage=u=>(at(P.Q.damage,u,0)+P.Q.ap_ratio*(u.ap||0))*scale(u);
 function bolt(u,c,e,angle,factor,kind){m.launch(u,{...c,event:e},{championProjectile:true,claudeKind:kind,claudeFactor:factor,angle,speed:P.Q.projectile_speed,maxRange:P.Q.range,radius:10,color:F(u).color,blockable:true})}
 function castQ(u,c,e){let f=S(u).form,a=c.angle??Math.atan2((c.p?.y??u.y)-u.y,(c.p?.x??u.x+1)-u.x);
  if(f==='haiku')P.Q.haiku_angles.forEach((d,k)=>bolt(u,c,e,a+d,P.Q.haiku_factors[k],'haiku:'+k));
  else if(f==='opus'){let r=Math.min(P.Q.opus_range,dist(u,c.p||u)),p=core.safePoint?core.safePoint(u,{x:u.x+Math.cos(a)*r,y:u.y+Math.sin(a)*r},10,{crossWalls:true}):{x:u.x+Math.cos(a)*r,y:u.y+Math.sin(a)*r};S(u).pending.push({kind:'opus',x:p.x,y:p.y,at:now()+P.Q.opus_delay,event:e,amount:qDamage(u)});env.ring?.(p.x,p.y,P.Q.opus_radius,P.FORMS.opus.color,P.Q.opus_delay)}
  else bolt(u,c,e,a,1,f)}
 function castW(u,e){let f=S(u).form,amount=(at(P.W.shield,u,1)+P.W.ap_ratio*(u.ap||0))*F(u).damage;
  let ally=units().filter(v=>v!==u&&v.type==='hero'&&v.team===u.team&&alive(v)&&dist(u,v)<=P.W.ally_range).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  for(let t of [u,ally].filter(Boolean)){m.shield(t,amount,P.W.duration,u,{tag:'CLAUDE_ALIGNMENT'});
   if(f==='haiku')core.apply(t,'MOVE_SPEED_BUFF',P.W.haiku_move_duration,u,{amount:P.W.haiku_move_pct,uniqueKey:'claude-w-ms:'+t.id,tenacity:false});
   if(f==='sonnet')m.cleanse?.(t,'slow');
   if(f==='fable')m.heal(t,amount*P.W.fable_heal_ratio,u,{event:e,abilityId:1});
   env.ring?.(t.x,t.y,(t.radius||22)+18,F(u).color,.4)}}
 function castE(u,c,e){let f=S(u).form,d=f==='haiku'?P.E.haiku_distance:f==='opus'?P.E.opus_distance:P.E.distance,a=c.angle??Math.atan2((c.p?.y??u.y)-u.y,(c.p?.x??u.x+1)-u.x),to={x:u.x+Math.cos(a)*d,y:u.y+Math.sin(a)*d};
  let p=core.safePoint?core.safePoint(u,to,u.radius||22,{crossWalls:true}):to;env.line?.(u,p,F(u).color,6,.25);u.x=p.x;u.y=p.y;core.spatial?.update(u);u.dest=null;S(u).eReady=now()+P.E.window;S(u).eEvent=e}
 function castR(u,e){let s=S(u),i=FORMS.indexOf(s.form);s.form=FORMS[(i+1)%FORMS.length];s.lastSwitch=now();m.recalc(u);
  let amount=(at(P.R.burst,u,3)+P.R.ap_ratio*(u.ap||0))*scale(u);for(let t of m.nearby(u,P.R.radius+60,t=>foe(u,t)))if(dist(u,t)<=P.R.radius+(t.radius||0))hit(u,t,amount,e,'switch');
  env.ring?.(u.x,u.y,P.R.radius,F(u).color,.5);core.emit('ClaudeFormChanged',u,u,{form:s.form});if(u.player)env.toast?.('切换为 '+F(u).name+'（'+F(u).label+'）')}
 m.registerBehavior(ID,(u,c,skill,e)=>{if(c.i===0)castQ(u,c,e);else if(c.i===1)castW(u,e);else if(c.i===2)castE(u,c,e);else if(c.i===3)castR(u,e)},{attackTiming:{windup:.2,recovery:.15}});
 m.heroHooks[ID]={
  isMelee:()=>false,
  cooldown:(u,i,v)=>i<3?v*F(u).cooldown:v,
  bonusAS:u=>F(u).bonus_as,
  derive(u,s){let mp=F(u).move_pct;if(mp&&Number.isFinite(u.speed))u.speed*=1+mp},
  projectileImpact(p,t){let u=p.source;if(!foe(u,t))return;let e=p.event,kind=p.claudeKind||'sonnet',amount=qDamage(u)*(p.claudeFactor||1);
   if(!hit(u,t,amount,e,'q:'+kind+':'+t.id))return;
   if(kind==='sonnet')m.slow(t,P.Q.sonnet_slow,P.Q.sonnet_slow_duration,u);
   if(kind==='fable'){let done=new Set([t.id]),from=t;for(let k=0;k<P.Q.fable_bounces;k++){let next=m.nearby(from,P.Q.fable_bounce_range,v=>foe(u,v)&&!done.has(v.id)).sort((a,b)=>dist(from,a)-dist(from,b))[0];if(!next)break;done.add(next.id);env.line?.(from,next,P.FORMS.fable.color,4,.3);hit(u,next,qDamage(u)*P.Q.fable_bounce_factor,e,'q:fable:'+next.id);from=next}}},
  attackPacket(u,t,p){let s=S(u);if(s.eReady>now()){s.eReady=0;p.claudeE=true;p.claudeEBonus=(at(P.E.bonus,u,2)+P.E.ap_ratio*(u.ap||0))*scale(u)}},
  attackHit(u,t,p){if(p.claudeE&&p.claudeEBonus>0)hit(u,t,p.claudeEBonus,S(u).eEvent||p.event,'e-tool')},
  tick(u){let s=S(u);if(!s.pending.length)return;for(let q of s.pending.slice()){if(now()<q.at)continue;s.pending.splice(s.pending.indexOf(q),1);for(let t of m.nearby(q,P.Q.opus_radius+60,t=>foe(u,t)))if(dist(q,t)<=P.Q.opus_radius+(t.radius||0))hit(u,t,q.amount,q.event,'q:opus:'+t.id)}},
  describeExtra(u,i){let s=S(u),f=F(u);return i===3?'当前形态 '+f.name+'（'+f.label+'），上下文 '+(now()>s.contextUntil?0:s.context)+'/'+P.P.context_max:''},
  reset(u){u.claudeState=null}
 };
 m.claude={state:S,form:u=>S(u).form,forms:FORMS};
};
})();
