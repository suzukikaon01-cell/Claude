/* V20 原创英雄「Claude · 四模型」（V20.2 联动重做）与通用装备「长思之卷」的效果。
 *
 * 四种形态（R「模型切换」轮换）各有完全不同的普攻模式与 Q 形态：
 *  Haiku 俳句「短句连射」：射程450，攻速+40%，普攻是轻飞镖；每第3次普攻（5-7-5的收尾）额外向附近敌人连射2枚。
 *  Sonnet 十四行诗「格律」：射程525，攻速+10%；每第4次普攻（一节四行）在目标处爆开并减速。
 *  Opus 巨著「长篇论证」：射程650，普攻固定1.6秒一次（不吃攻速），每次都是重击并溅射。
 *  Fable 寓言「故事线」：射程525；普攻会弹射到第二个敌人，对带「寓意」的目标回复生命。
 * 联动：
 *  E→Q：工具调用后4秒内的Q变为「工具增强」版本。E→普攻：下一次普攻额外魔法伤害。
 *  Q→E：Q命中英雄使E冷却减少1.5秒。Q→普攻：每种形态的Q都会直接“预备”该形态的普攻招牌效果。
 *  W→普攻：对齐期间普攻计数翻倍（Haiku/Sonnet）、Opus溅射提升到100%、Fable回复翻倍。
 *  R→普攻：切换后3秒内的第一次普攻立即触发新形态的招牌效果，并重置普攻计时（交接）。
 *  P→R：上下文满10层时，R变为「上下文压缩」：爆发伤害×2，并刷新Q。
 */
(()=>{'use strict';
const ID='claude',C=window.GAME_CONFIG;if(!C||!C.heroes)return;
const lv=(a,b,n=5)=>Array.from({length:n},(_,i)=>+(a+(b-a)*i/(n-1)).toFixed(3));
const FORMS=['haiku','sonnet','opus','fable'];
const P={
 BASE:{hp_base:600,hp_growth:98,mana_base:400,mana_growth:40,ad_base:54,ad_growth:3.2,armor_base:24,armor_growth:4.4,mr_base:30,mr_growth:1.3,as_base:.64,as_ratio:.64,as_growth:.02,move_speed:215,attack_range:525,is_ranged:1,hero_name:'Claude'},
 P:{context_max:10,context_damage_pct:.02,context_duration:8,start_form:'sonnet',opener_window:3,handoff_window:3},
 FORMS:{
  haiku:{name:'Haiku',label:'俳句',icon:'俳',damage:.8,cooldown:.7,move_pct:.12,bonus_as:.4,range:450,color:'#7fd6a8',
   aa_ad:.75,aa_ap:.15,volley_every:3,volley_darts:2,volley_factor:.5,volley_range:500},
  sonnet:{name:'Sonnet',label:'十四行诗',icon:'诗',damage:1,cooldown:1,move_pct:0,bonus_as:.1,range:525,color:'#e8a26a',
   aa_ad:1,aa_ap:.2,volta_every:4,volta_base:20,volta_per_level:8,volta_ap:.3,volta_radius:175,volta_slow:.3,volta_slow_duration:1},
  opus:{name:'Opus',label:'巨著',icon:'巨',damage:1.45,cooldown:1.3,move_pct:-.08,bonus_as:0,range:650,color:'#b28cff',
   aa_ad:1.6,aa_ap:.45,fixed_interval:1.6,splash_radius:175,splash_factor:.6,argument_bonus:.25,argument_duration:4},
  fable:{name:'Fable',label:'寓言',icon:'寓',damage:1.1,cooldown:1,move_pct:.05,bonus_as:.1,range:525,color:'#ffd56b',
   aa_ad:1,aa_ap:.2,bounce_range:400,bounce_factor:.6,moral_duration:5,moral_heal_missing:.03}},
 Q:{damage:[70,105,140,175,210],ap_ratio:.6,mana_cost:lv(50,70),cooldown:lv(7,5),range:900,projectile_speed:1400,e_refund:1.5,
    haiku_angles:[-.17,0,.17],haiku_factors:[.55,.75,.55],tool_haiku_angles:[-.34,-.17,0,.17,.34],tool_haiku_factors:[.4,.55,.75,.55,.4],
    sonnet_slow:.25,sonnet_slow_duration:1,
    opus_delay:.6,opus_radius:250,tool_opus_radius:325,opus_range:800,
    fable_bounces:2,tool_fable_bounces:4,fable_bounce_range:450,fable_bounce_factor:.7},
 W:{shield:[70,100,130,160,190],ap_ratio:.45,duration:2.5,ally_range:650,mana_cost:70,cooldown:lv(16,12),haiku_move_pct:.2,haiku_move_duration:2,fable_heal_ratio:.4},
 E:{distance:350,haiku_distance:475,opus_distance:250,bonus:[40,65,90,115,140],ap_ratio:.4,window:4,mana_cost:60,cooldown:lv(12,8)},
 R:{burst:[80,140,200],ap_ratio:.4,radius:300,cooldown:[6,5,4],mana_cost:0,compress_mult:2}
};
const skill=o=>({maxRank:5,windup:.15,recovery:.1,damageType:'magic',heroOnly:false,...o});
C.heroes[ID]={name:'Claude',title:'四模型',role:'远程法师 / 形态切换',resource:'mana',color:'#e8a26a',
 stats:{hp:P.BASE.hp_base,mana:P.BASE.mana_base,attack:P.BASE.ad_base,ap:0,armor:P.BASE.armor_base,mr:P.BASE.mr_base,baseAS:P.BASE.as_base,asRatio:P.BASE.as_ratio,speed:P.BASE.move_speed,range:P.BASE.attack_range,hpRegen:6,manaRegen:8,
  growth:{hp:P.BASE.hp_growth,mana:P.BASE.mana_growth,attack:P.BASE.ad_growth,armor:P.BASE.armor_growth,mr:P.BASE.mr_growth,as:P.BASE.as_growth,hpRegen:.6,manaRegen:.8}},
 passive:{name:'上下文窗口',desc:'技能或形态招牌普攻命中敌方英雄叠一层上下文（最多10层，8秒未叠层清空，切换形态保留），每层技能伤害+2%。满10层时R变为「上下文压缩」。\n形态普攻（R切换，初始Sonnet）：\nHaiku 短句连射：射程450，攻速+40%，普攻75%AD+15%AP；每第3次普攻再向附近敌人连射2枚（各50%）。伤害×0.8，冷却×0.7，移速+12%。\nSonnet 格律：射程525，攻速+10%，普攻100%AD+20%AP；每第4次普攻在目标处爆开，造成20+8×等级+30%AP魔法伤害并减速30%。伤害×1。\nOpus 长篇论证：射程650，普攻固定1.6秒一次，160%AD+45%AP，溅射175码内敌人60%；对「论据」区内的目标+25%。伤害×1.45，冷却×1.3，移速−8%。\nFable 故事线：射程525，普攻弹射到第二个敌人（60%）；命中带「寓意」的目标回复3%已损失生命。伤害×1.1，移速+5%。\n交接：切换形态后3秒内的第一次普攻立即触发新形态招牌效果并重置普攻计时。',params:P.P},
 skills:[
  skill({key:'Q',name:'生成',icon:'诗',target:'direction',range:900,width:60,projectileSpeed:1400,cd:P.Q.cooldown,mana:P.Q.mana_cost,damage:P.Q.damage,apRatio:P.Q.ap_ratio,
   desc:'70/105/140/175/210+60%AP魔法伤害（乘形态倍率），命中英雄使E冷却减少1.5秒，并预备当前形态的招牌普攻。\nHaiku：5-7-5三连发（55%/75%/55%），命中后下一次普攻直接触发连射。\nSonnet：单发减速25%，命中后下一次普攻直接爆开。\nOpus：思考0.6秒后在目标点落下250码巨著，落点留下4秒「论据」区（区内目标受普攻+25%）。\nFable：命中后弹向另外2个敌人（各70%），被命中者获得5秒「寓意」。\n工具增强（E后4秒内）：Haiku五连发；Sonnet穿透全部敌人且减速翻倍；Opus无需思考且范围325；Fable弹射4次。'}),
  skill({key:'W',name:'对齐',icon:'护',target:'self',range:0,cd:P.W.cooldown,mana:P.W.mana_cost,damage:0,shield:P.W.shield,apRatio:P.W.ap_ratio,
   desc:'为自己和650码内生命比例最低的一名友方英雄提供70/100/130/160/190+45%AP护盾（乘形态倍率），持续2.5秒。对齐期间：Haiku/Sonnet普攻计数翻倍，Opus溅射提高到100%，Fable寓意回复翻倍。形态附加：Haiku两人移速+20%；Sonnet解除两人减速；Fable同时回复护盾值40%的生命。'}),
  skill({key:'E',name:'工具调用',icon:'调',target:'direction',range:350,cd:P.E.cooldown,mana:P.E.mana_cost,damage:0,
   desc:'向指定方向闪现350码（Haiku 475码，Opus 250码）。4秒内：下一次普攻额外造成40/65/90/115/140+40%AP魔法伤害（乘形态倍率）；下一次Q变为工具增强版。'}),
  skill({key:'R',name:'模型切换',icon:'模',target:'self',range:0,radius:300,maxRank:3,cd:P.R.cooldown,mana:0,damage:P.R.burst,apRatio:P.R.ap_ratio,
   desc:'按 Haiku → Sonnet → Opus → Fable 的顺序切换形态，对周围300码敌人造成80/140/200+40%AP魔法伤害（按新形态倍率），并开启交接（3秒内第一次普攻触发新形态招牌效果）。上下文满10层时变为「上下文压缩」：消耗全部上下文，爆发伤害×2，并刷新Q。'})
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
 const S=u=>u.claudeState??={form:P.P.start_form,context:0,contextUntil:0,pending:[],zones:[],eReady:0,toolUntil:0,primedUntil:0,alignUntil:0,count:0,lastSwitch:-99,refunded:null};
 const F=u=>P.FORMS[S(u).form]||P.FORMS.sonnet;
 const foe=(u,t)=>alive(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0)&&!t.tentacle&&!t.spiritOwner;
 const champ=t=>t?.type==='hero'&&!t.clone&&!t.dvaBomb;
 function ctx(u){let s=S(u);if(now()>s.contextUntil)s.context=0;return s.context}
 function addContext(u,n=1){let s=S(u);ctx(u);s.context=Math.min(P.P.context_max,s.context+n);s.contextUntil=now()+P.P.context_duration}
 const scale=u=>F(u).damage*(1+P.P.context_damage_pct*ctx(u));
 function hit(u,t,amount,e,idx,type='magic',extra={}){let ok=m.deal(t,amount,u,type,{event:e,once:true,hitIndex:idx,...extra});if(ok&&champ(t))addContext(u);return ok}
 const qDamage=u=>(at(P.Q.damage,u,0)+P.Q.ap_ratio*(u.ap||0))*scale(u);
 const angleOf=(u,c)=>c.angle??Math.atan2((c.p?.y??u.y)-u.y,(c.p?.x??u.x+1)-u.x);
 function prime(u){S(u).primedUntil=now()+P.P.opener_window}
 function qLanded(u,t,e){if(!champ(t))return;let s=S(u);if(s.refunded!==e.castId){s.refunded=e.castId;if(u.cd[2]>0)u.cd[2]=Math.max(0,u.cd[2]-P.Q.e_refund)}prime(u)}
 function bolt(u,c,e,angle,factor,kind){m.launch(u,{...c,event:e},{championProjectile:true,claudeKind:kind,claudeFactor:factor,angle,speed:P.Q.projectile_speed,maxRange:P.Q.range,radius:10,color:F(u).color,blockable:true})}
 function lineHits(u,a,len,width){return m.nearby(u,len+80,t=>foe(u,t)).filter(t=>{let dx=t.x-u.x,dy=t.y-u.y,al=dx*Math.cos(a)+dy*Math.sin(a),sd=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a)),r=t.radius||20;return al>=-r&&al<=len+r&&sd<=width/2+r})}
 function fableChain(u,first,e,bounces){let done=new Set([first.id]),from=first;for(let k=0;k<bounces;k++){let next=m.nearby(from,P.Q.fable_bounce_range,v=>foe(u,v)&&!done.has(v.id)).sort((a,b)=>dist(from,a)-dist(from,b))[0];if(!next)break;done.add(next.id);env.line?.(from,next,P.FORMS.fable.color,4,.3);if(hit(u,next,qDamage(u)*P.Q.fable_bounce_factor,e,'q:fable:'+next.id)){next.claudeMoral={owner:u.id,until:now()+P.FORMS.fable.moral_duration};qLanded(u,next,e)}from=next}}
 function castQ(u,c,e){let s=S(u),f=s.form,a=angleOf(u,c),tool=s.toolUntil>now();s.toolUntil=0;
  if(f==='haiku'){let A=tool?P.Q.tool_haiku_angles:P.Q.haiku_angles,Fc=tool?P.Q.tool_haiku_factors:P.Q.haiku_factors;A.forEach((d,k)=>bolt(u,c,e,a+d,Fc[k],'haiku:'+k))}
  else if(f==='opus'){let r=Math.min(P.Q.opus_range,dist(u,c.p||u)),to={x:u.x+Math.cos(a)*r,y:u.y+Math.sin(a)*r},p=core.safePoint?core.safePoint(u,to,10,{crossWalls:true}):to,radius=tool?P.Q.tool_opus_radius:P.Q.opus_radius,delay=tool?0:P.Q.opus_delay;
   s.pending.push({kind:'opus',x:p.x,y:p.y,at:now()+delay,event:e,amount:qDamage(u),radius});env.ring?.(p.x,p.y,radius,P.FORMS.opus.color,Math.max(.25,delay))}
  else if(f==='sonnet'&&tool){let len=P.Q.range;env.line?.(u,{x:u.x+Math.cos(a)*len,y:u.y+Math.sin(a)*len},P.FORMS.sonnet.color,14,.3);for(let t of lineHits(u,a,len,70))if(hit(u,t,qDamage(u),e,'q:sonnet:'+t.id)){m.slow(t,P.Q.sonnet_slow*2,P.Q.sonnet_slow_duration,u);qLanded(u,t,e)}}
  else bolt(u,c,e,a,1,f==='fable'?(tool?'fable-tool':'fable'):'sonnet')}
 function castW(u,e){let s=S(u),f=s.form,amount=(at(P.W.shield,u,1)+P.W.ap_ratio*(u.ap||0))*F(u).damage;s.alignUntil=now()+P.W.duration;
  let ally=units().filter(v=>v!==u&&v.type==='hero'&&v.team===u.team&&alive(v)&&dist(u,v)<=P.W.ally_range).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  for(let t of [u,ally].filter(Boolean)){m.shield(t,amount,P.W.duration,u,{tag:'CLAUDE_ALIGNMENT'});
   if(f==='haiku')core.apply(t,'MOVE_SPEED_BUFF',P.W.haiku_move_duration,u,{amount:P.W.haiku_move_pct,uniqueKey:'claude-w-ms:'+t.id,tenacity:false});
   if(f==='sonnet')m.cleanse?.(t,'slow');
   if(f==='fable')m.heal(t,amount*P.W.fable_heal_ratio,u,{event:e,abilityId:1});
   env.ring?.(t.x,t.y,(t.radius||22)+18,F(u).color,.4)}}
 function castE(u,c,e){let s=S(u),f=s.form,d=f==='haiku'?P.E.haiku_distance:f==='opus'?P.E.opus_distance:P.E.distance,a=angleOf(u,c),to={x:u.x+Math.cos(a)*d,y:u.y+Math.sin(a)*d};
  let p=core.safePoint?core.safePoint(u,to,u.radius||22,{crossWalls:true}):to;env.line?.(u,p,F(u).color,6,.25);u.x=p.x;u.y=p.y;core.spatial?.update(u);u.dest=null;s.eReady=now()+P.E.window;s.toolUntil=now()+P.E.window;s.eEvent=e}
 function castR(u,e){let s=S(u),i=FORMS.indexOf(s.form),compress=ctx(u)>=P.P.context_max;s.form=FORMS[(i+1)%FORMS.length];s.lastSwitch=now();s.count=0;m.recalc(u);
  let amount=(at(P.R.burst,u,3)+P.R.ap_ratio*(u.ap||0))*scale(u)*(compress?P.R.compress_mult:1);
  if(compress){s.context=0;u.cd[0]=0}
  for(let t of m.nearby(u,P.R.radius+60,t=>foe(u,t)))if(dist(u,t)<=P.R.radius+(t.radius||0))hit(u,t,amount,e,'switch');
  prime(u);u.attackCd=0;env.ring?.(u.x,u.y,P.R.radius,F(u).color,compress?.8:.5);if(compress)env.ring?.(u.x,u.y,P.R.radius*.6,'#ffffff',.6);
  core.emit('ClaudeFormChanged',u,u,{form:s.form,compress});if(u.player)env.toast?.((compress?'上下文压缩 · ':'')+'切换为 '+F(u).name+'（'+F(u).label+'）')}
 m.registerBehavior(ID,(u,c,skill,e)=>{if(c.i===0)castQ(u,c,e);else if(c.i===1)castW(u,e);else if(c.i===2)castE(u,c,e);else if(c.i===3)castR(u,e)},{attackTiming:{windup:.2,recovery:.15}});
 function inZone(u,t){let s=S(u);s.zones=s.zones.filter(z=>z.until>now());return s.zones.some(z=>dist(z,t)<=z.radius+(t.radius||0))}
 m.heroHooks[ID]={
  isMelee:()=>false,
  cooldown:(u,i,v)=>i<3?v*F(u).cooldown:v,
  bonusAS:u=>F(u).bonus_as,
  attackRange:u=>F(u).range,
  attackInterval:(u,v)=>F(u).fixed_interval||v,
  effectiveAS:u=>F(u).fixed_interval?1/F(u).fixed_interval:undefined,
  derive(u){let mp=F(u).move_pct;if(mp&&Number.isFinite(u.speed))u.speed*=1+mp;u.color=F(u).color},
  projectileImpact(p,t){let u=p.source;if(!foe(u,t))return;let e=p.event,kind=p.claudeKind||'sonnet',amount=qDamage(u)*(p.claudeFactor||1);
   if(!hit(u,t,amount,e,'q:'+kind+':'+t.id))return;qLanded(u,t,e);
   if(kind==='sonnet')m.slow(t,P.Q.sonnet_slow,P.Q.sonnet_slow_duration,u);
   if(kind==='fable'||kind==='fable-tool'){t.claudeMoral={owner:u.id,until:now()+P.FORMS.fable.moral_duration};fableChain(u,t,e,kind==='fable-tool'?P.Q.tool_fable_bounces:P.Q.fable_bounces)}},
  attackPacket(u,t,p){let s=S(u),f=F(u),form=s.form,aligned=s.alignUntil>now(),primed=s.primedUntil>now();
   s.count+=aligned&&(form==='haiku'||form==='sonnet')?2:1;
   let sig=primed||(form==='haiku'&&s.count>=f.volley_every)||(form==='sonnet'&&s.count>=f.volta_every)||(form==='opus'&&aligned);
   if(sig){s.primedUntil=0;if(form==='haiku'||form==='sonnet')s.count=0}
   p.damage=f.aa_ad*u.attack+f.aa_ap*(u.ap||0);if(form==='opus'&&inZone(u,t))p.damage*=1+f.argument_bonus;
   p.claudeForm=form;p.claudeSig=sig;p.claudeAligned=aligned;p.claudeBase=p.damage;
   if(s.eReady>now()){s.eReady=0;p.claudeE=true;p.claudeEBonus=(at(P.E.bonus,u,2)+P.E.ap_ratio*(u.ap||0))*scale(u)}},
  attackHit(u,t,p){let s=S(u),f=P.FORMS[p.claudeForm]||F(u),e=p.event,base=p.claudeBase||u.attack;
   if(p.claudeE&&p.claudeEBonus>0)hit(u,t,p.claudeEBonus,s.eEvent||e,'e-tool');
   if(p.claudeForm==='haiku'&&p.claudeSig){let others=m.nearby(t,f.volley_range,v=>foe(u,v)&&v!==t).sort((a,b)=>dist(t,a)-dist(t,b));for(let k=0;k<f.volley_darts;k++){let v=others[k]||t;env.line?.(u,v,f.color,3,.15);hit(u,v,base*f.volley_factor,e,'haiku-volley:'+k,'physical')}if(champ(t))addContext(u)}
   if(p.claudeForm==='sonnet'&&p.claudeSig){let amt=(f.volta_base+f.volta_per_level*(u.level||1)+f.volta_ap*(u.ap||0))*scale(u);env.ring?.(t.x,t.y,f.volta_radius,f.color,.35);for(let v of m.nearby(t,f.volta_radius+60,v=>foe(u,v)))if(dist(t,v)<=f.volta_radius+(v.radius||0)&&hit(u,v,amt,e,'sonnet-volta:'+v.id))m.slow(v,f.volta_slow,f.volta_slow_duration,u)}
   if(p.claudeForm==='opus'){let k=(p.claudeSig||p.claudeAligned)?1:f.splash_factor;env.ring?.(t.x,t.y,f.splash_radius,f.color,.3);for(let v of m.nearby(t,f.splash_radius+60,v=>foe(u,v)&&v!==t))if(dist(t,v)<=f.splash_radius+(v.radius||0))hit(u,v,base*k,e,'opus-splash:'+v.id,'physical');if(p.claudeSig&&champ(t))addContext(u)}
   if(p.claudeForm==='fable'){let n=p.claudeSig?2:1,done=new Set([t.id]),from=t;for(let k=0;k<n;k++){let v=m.nearby(from,f.bounce_range,x=>foe(u,x)&&!done.has(x.id)).sort((a,b)=>dist(from,a)-dist(from,b))[0];if(!v)break;done.add(v.id);env.line?.(from,v,f.color,3,.2);hit(u,v,base*f.bounce_factor,e,'fable-bounce:'+k,'physical');from=v}
    if(t.claudeMoral?.owner===u.id&&t.claudeMoral.until>now()){m.heal(u,(u.maxHp-u.hp)*f.moral_heal_missing*(p.claudeAligned?2:1),u,{event:e});if(champ(t))addContext(u)}}},
  tick(u){let s=S(u);if(!s.pending.length)return;for(let q of s.pending.slice()){if(now()<q.at)continue;s.pending.splice(s.pending.indexOf(q),1);s.zones.push({x:q.x,y:q.y,radius:q.radius,until:now()+P.FORMS.opus.argument_duration});env.ring?.(q.x,q.y,q.radius,P.FORMS.opus.color,P.FORMS.opus.argument_duration);
   for(let t of m.nearby(q,q.radius+60,t=>foe(u,t)))if(dist(q,t)<=q.radius+(t.radius||0)&&hit(u,t,q.amount,q.event,'q:opus:'+t.id))qLanded(u,t,q.event)}},
  describeExtra(u,i){let s=S(u),f=F(u),next=P.FORMS[FORMS[(FORMS.indexOf(s.form)+1)%FORMS.length]];return i===3?'当前 '+f.name+'（'+f.label+'）→ 下一个 '+next.name+'；上下文 '+ctx(u)+'/'+P.P.context_max+(ctx(u)>=P.P.context_max?'（压缩就绪）':''):i===0?(s.toolUntil>now()?'工具增强已就绪':''):''},
  reset(u){u.claudeState=null}
 };
 m.claude={state:S,form:u=>S(u).form,forms:FORMS,qIcon:u=>F(u).icon,rIcon:u=>P.FORMS[FORMS[(FORMS.indexOf(S(u).form)+1)%FORMS.length]].icon,context:u=>ctx(u),primed:u=>S(u).primedUntil>now(),tool:u=>S(u).toolUntil>now()};
};
})();
