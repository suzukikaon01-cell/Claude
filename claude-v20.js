/* V20.3 原创英雄「Claude · 四模型」重做。
 *
 * 资源：上下文（0～100，取代法力）。技能/普攻命中积累，6秒未积累后衰减。满100时 R 变为终结技「总结陈词」。
 * R 模型切换：Haiku → Sonnet → Opus → Fable 轮换，冷却3秒。技能命中后0.5秒内切换=完美交接（下一个技能伤害+35%，R冷却减半，+10上下文）。
 * 四个形态各有独立的普攻与 Q，并通过标记接力：
 *  Haiku 俳句（近身速攻，射程250）：普攻叠「草稿」；Q 速答穿刺冲刺；W 0.4秒见切式闪避。
 *  Sonnet 十四行诗（中程连段，射程525）：Q 三段诗，第三段引爆草稿并留下「韵脚」；W 护盾。
 *  Opus 巨著（远程重炮，射程700）：Q 深度思考按住蓄力，命中韵脚目标眩晕并留下「论据区」；W 减伤霸体；E 架设。
 *  Fable 寓言（布局，射程525）：Q 放置「伏笔」；E 收束（传送并引爆全部伏笔）；W 隐身并留下伏笔。任何形态的技能打到伏笔旁的敌人都会引爆它。
 * 所有持续效果（标记、区域、伏笔、蓄力落点、闪避窗口）都画在世界里，敌我双方可见。
 */
(()=>{'use strict';
const ID='claude',C=window.GAME_CONFIG;if(!C||!C.heroes)return;
const lv=(a,b,n=5)=>Array.from({length:n},(_,i)=>+(a+(b-a)*i/(n-1)).toFixed(3));
const FORMS=['haiku','sonnet','opus','fable'];
const P={
 BASE:{resource_type:'ENERGY',max_energy:100,energy_regen:0,hp_base:610,hp_growth:100,mana_base:0,mana_growth:0,ad_base:56,ad_growth:3.3,armor_base:30,armor_growth:4.8,mr_base:30,mr_growth:1.4,as_base:.64,as_ratio:.64,as_growth:.02,move_speed:215,attack_range:525,is_ranged:1,hero_name:'Claude'},
 P:{start_form:'sonnet',context_skill_champion:8,context_skill_other:2,context_attack_champion:4,context_attack_other:1,context_parry:20,context_handoff:10,decay_delay:6,decay_per_second:4,
    handoff_window:.5,handoff_damage:.35,opener_window:3,draft_max:5,draft_duration:6,rhyme_duration:6,zone_duration:4,zone_bonus:.15,foreshadow_max:3,foreshadow_duration:8,foreshadow_radius:180},
 FORMS:{
  haiku:{name:'Haiku',label:'俳句',icon:'答',color:'#7fd6a8',range:250,bonus_as:.5,move_pct:.12,aa_ad:.85,aa_ap:.15},
  sonnet:{name:'Sonnet',label:'十四行诗',icon:'诗',color:'#e8a26a',range:525,bonus_as:.1,move_pct:0,aa_ad:1,aa_ap:.2,volta_every:4,volta_base:30,volta_per_level:8,volta_ap:.3,volta_radius:175,volta_slow:.3,volta_slow_duration:1},
  opus:{name:'Opus',label:'巨著',icon:'思',color:'#b28cff',range:700,bonus_as:0,move_pct:-.08,aa_ad:1.6,aa_ap:.45,fixed_interval:1.6,splash_radius:175,splash_factor:.6},
  fable:{name:'Fable',label:'寓言',icon:'伏',color:'#ffd56b',range:525,bonus_as:.1,move_pct:.05,aa_ad:1,aa_ap:.2,bounce_range:400,bounce_factor:.6}},
 Q:{energy_cost:0,
  haiku:{cooldown:lv(5,3),damage:[40,60,80,100,120],ad_ratio:.5,ap_ratio:.3,dash:300,width:90,refund:.7,drafts:2},
  sonnet:{cooldown:lv(9,7),stage_window:3,stage_gap:.4,line_damage:[50,75,100,125,150],line_ap:.4,line_length:600,line_width:70,cone_radius:400,cone_degrees:70,
          burst_damage:[70,105,140,175,210],burst_ap:.6,burst_radius:200,burst_range:600,burst_delay:.35,draft_bonus:.2},
  opus:{cooldown:lv(11,9),damage:[110,160,210,260,310],ap_ratio:.9,charge_max:2,deployed_charge_max:1.2,min_ratio:.5,range_min:500,range_max:800,radius_min:160,radius_max:300,land_delay:.35,self_slow:.3,stun_min:1,stun_max:1.5,bot_charge:.7},
  fable:{cooldown:lv(2.5,1.5),place_range:600,damage:[60,90,120,150,180],ap_ratio:.5,link_damage:[30,45,60,75,90],link_ap:.25,link_width:60}},
 W:{energy_cost:0,cooldown:lv(14,10),parry_window:.4,parry_refund:.5,shield:[70,100,130,160,190],shield_ap:.45,shield_duration:2.5,ally_range:650,
    fortify_duration:2,fortify_reduction:.4,stealth_duration:1.2,stealth_move_pct:.2},
 E:{energy_cost:0,cooldown:lv(10,7),haiku_dash:325,sonnet_blink:350,fable_blink:300,gather_range:900,bonus:[40,65,90,115,140],bonus_ap:.4,window:4,deploy_range:150,deploy_toggle_cd:1},
 R:{energy_cost:0,cooldown:3,finisher_damage:[60,100,140],finisher_ad:.3,finisher_ap:.35,finisher_range:700,finisher_steps:[0,.4,.8,1.25],finisher_radius:[90,400,300,350]}
};
const skill=o=>({maxRank:5,windup:0,recovery:.08,damageType:'magic',heroOnly:false,mana:0,...o});
C.heroes[ID]={name:'Claude',title:'四模型',role:'形态切换 / 连段法师',resource:'energy',color:'#e8a26a',
 stats:{hp:P.BASE.hp_base,mana:0,attack:P.BASE.ad_base,ap:0,armor:P.BASE.armor_base,mr:P.BASE.mr_base,baseAS:P.BASE.as_base,asRatio:P.BASE.as_ratio,speed:P.BASE.move_speed,range:P.BASE.attack_range,hpRegen:6.5,manaRegen:0,
  growth:{hp:P.BASE.hp_growth,mana:0,attack:P.BASE.ad_growth,armor:P.BASE.armor_growth,mr:P.BASE.mr_growth,as:P.BASE.as_growth,hpRegen:.6,manaRegen:0}},
 passive:{name:'上下文窗口',desc:'资源为上下文（0～100）：技能命中英雄+8、普攻命中英雄+4（非英雄+2/+1），6秒未积累后每秒−4。满100时R变为终结技。\n完美交接：技能命中后0.5秒内切换形态，下一个技能伤害+35%，R冷却减半，+10上下文。切换后3秒内第一次普攻触发新形态招牌效果。\nHaiku 俳句：射程250，攻速+50%，移速+12%；普攻85%AD+15%AP并给目标叠「草稿」（最多5层）。\nSonnet 十四行诗：射程525；普攻100%AD+20%AP，每第4次在目标处爆开（30+8×等级+30%AP，减速30%）并留下「韵脚」。\nOpus 巨著：射程700，普攻固定1.6秒一次，160%AD+45%AP并溅射175码（60%），移速−8%。\nFable 寓言：射程525；普攻弹射到第二个敌人（60%）。\n标记接力：Sonnet的Q第三段引爆草稿；Opus的Q命中带韵脚的目标造成眩晕并留下「论据区」（区内敌人受到Claude伤害+15%）；任何形态的技能命中伏笔180码内的敌人都会引爆伏笔。',params:P.P},
 skills:[
  skill({key:'Q',name:'生成',icon:'诗',target:'direction',range:700,width:70,cd:P.Q.sonnet.cooldown,damage:0,
   desc:'随形态变化。\nHaiku·速答：向前穿刺冲刺300码，造成40/60/80/100/120+50%AD+30%AP魔法伤害并叠2层草稿；命中英雄返还70%冷却。冷却5～3秒。\nSonnet·三段诗：3秒内可连放三段——直线600码、70°扇形400码（各50/75/100/125/150+40%AP），第三段在600码内落点爆破200码范围：70/105/140/175/210+60%AP，每层草稿+20%伤害并引爆草稿，留下6秒韵脚。冷却9～7秒。\nOpus·深度思考：按住蓄力最长2秒（期间移速−30%），松手轰击：伤害55%→100%的110/160/210/260/310+90%AP，射程500→800，范围160→300；命中带韵脚的目标眩晕1～1.5秒，落点留下4秒论据区。冷却11～9秒。\nFable·伏笔：在600码内放置一个伏笔（最多3个，持续8秒）。伏笔被引爆时对180码内敌人造成60/90/120/150/180+50%AP魔法伤害。冷却2.5～1.5秒。'}),
  skill({key:'W',name:'对齐',icon:'护',target:'self',range:0,cd:P.W.cooldown,damage:0,
   desc:'随形态变化。冷却14～10秒。\nHaiku·闪避：0.4秒内免疫伤害；成功躲掉伤害则刷新Q、返还W一半冷却并获得20上下文。\nSonnet·护盾：为自己和650码内生命比例最低的友方英雄提供70/100/130/160/190+45%AP护盾，持续2.5秒。\nOpus·立论：2秒内受到伤害−40%并免疫控制，可在蓄力时使用。\nFable·退场：隐身1.2秒、移速+20%，并在原地留下一个伏笔。'}),
  skill({key:'E',name:'工具调用',icon:'调',target:'direction',range:350,cd:P.E.cooldown,damage:0,
   desc:'随形态变化。冷却10～7秒。\nHaiku·冲刺325码 / Sonnet·闪现350码：4秒内下一次普攻额外造成40/65/90/115/140+40%AP魔法伤害。\nOpus·架设：原地架设（不能移动），普攻与Q射程+150、蓄力时间缩短到1.2秒；再次施放解除。\nFable·收束：传送到900码内离瞄准点最近的伏笔并引爆全部伏笔，伏笔之间的连线额外造成30/45/60/75/90+25%AP魔法伤害；没有伏笔时闪现300码。'}),
  skill({key:'R',name:'模型切换',icon:'模',target:'self',range:0,maxRank:3,cd:P.R.cooldown,damage:P.R.finisher_damage,
   desc:'切换到下一个形态（Haiku → Sonnet → Opus → Fable），冷却3秒，各形态的Q分别计算冷却。\n上下文满100时变为终结技「总结陈词」：消耗全部上下文，免疫控制，依次以四个形态各出一击（穿刺突进、扇形斩、落点轰炸、环形收束），每击60/100/140+30%AD+35%AP魔法伤害，结束后停在Fable形态。'})
 ],params:P};
C.heroParams??={};C.heroParams[ID]=P;
if(C.ultimateCooldowns)C.ultimateCooldowns[ID]=[P.R.cooldown,P.R.cooldown,P.R.cooldown];
if(window.ChampionStats)ChampionStats[ID]=C.heroes[ID].stats;
if(window.ChampionAbilities)ChampionAbilities[ID]=C.heroes[ID].skills;

// ===== 通用装备：多模态棱镜（数据在 claude-item-v20.js，需在 items-v6 之前载入）=====
const ITEM='MULTIMODAL_PRISM';
const createBase=window.createItemEffects;
if(createBase)window.createItemEffects=function(env,m){
 const base=createBase(env,m),now=env.time,units=env.units,own=(u,id)=>(u?.items||[]).some(v=>(typeof v==='string'?v:v.id)===id)&&!window.ItemPassivesV20?.suppressed?.(u,id),IP=()=>C.itemParams[ITEM];
 const stacks=u=>(u.prismUntil||0)>now()?(u.prismStacks||0):0;
 m.core.on?.('AbilityCastStarted',e=>{let u=units().find(v=>v.id===e.sourceId);if(!u||u.type!=='hero'||!own(u,ITEM)||!(e.abilityId>=0&&e.abilityId<=3))return;let p=IP();
  if(u.prismLast!==e.abilityId){u.prismStacks=Math.min(p.stack_max,stacks(u)+1);u.prismUntil=now()+p.stack_duration}u.prismLast=e.abilityId});
 function modifyOutgoing(u,t,value,type,meta={}){let v=base.modifyOutgoing?base.modifyOutgoing(u,t,value,type,meta)??value:value;
  if(u?.type==='hero'&&own(u,ITEM)&&!meta.itemEffect&&!meta.basic&&!meta.dot&&Number.isInteger(meta.event?.index)&&meta.event.index>=0&&meta.event.index<=3&&t?.team!==u.team){let p=IP(),n=stacks(u);v*=1+p.damage_per_stack*n;
   if(n>=p.stack_max&&t.type==='hero'){u.prismStacks=0;let bonus=p.resonance_base+p.resonance_ap*(u.ap||0)+p.resonance_bonus_ad*Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0));env.ring?.(t.x,t.y,90,'#9fe8ff',.35);m.deal(t,bonus,u,'magic',{itemEffect:true,itemId:ITEM})}}
  return v}
 return {...base,modifyOutgoing};
};

// ===== 英雄机制 =====
window.installClaude=function(m,env){
 const core=m.core,now=env.time,units=env.units,alive=t=>t&&t.hp>0&&!(t.death>0),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),TAU=Math.PI*2;
 const rk=(u,i)=>Math.max(1,u.skillRanks?.[i]||1),at=(arr,u,i)=>Array.isArray(arr)?arr[Math.min(arr.length,rk(u,i))-1]:arr,lerp=(a,b,k)=>a+(b-a)*k;
 const S=u=>u.claudeState??={form:P.P.start_form,pending:[],zones:[],foreshadows:[],qReady:{},stage:0,stageUntil:0,charging:null,deployed:false,parryUntil:0,parryHit:false,fortifyUntil:0,eReady:0,primedUntil:0,empowered:false,lastSkillHit:-99,lastGain:-99,count:0,finisher:null,seq:0,flash:0};
 const F=u=>P.FORMS[S(u).form]||P.FORMS.sonnet,QP=u=>P.Q[S(u).form];
 const foe=(u,t)=>alive(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0)&&!t.tentacle&&!t.spiritOwner;
 const champ=t=>t?.type==='hero'&&!t.clone&&!t.dvaBomb;
 const bonusAD=u=>Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0));
 const angleOf=(u,c)=>c.angle??Math.atan2((c.p?.y??u.y)-u.y,(c.p?.x??u.x+1)-u.x);
 const safe=(u,p,r=22)=>core.safePoint?core.safePoint(u,p,r,{crossWalls:true}):p;
 function gain(u,n){u.energy=Math.min(u.maxEnergy||100,(u.energy||0)+n);S(u).lastGain=now()}
 function setCd(u,i,v){u.cd[i]=v;(S(u).cdFix??={})[i]={v,at:now()}}
 function inZone(u,t){return S(u).zones.some(z=>z.until>now()&&dist(z,t)<=z.radius+(t.radius||0))}
 function hit(u,t,amount,e,idx,o={}){if(inZone(u,t))amount*=1+P.P.zone_bonus;let ok=m.deal(t,amount,u,o.type||'magic',{event:e,once:true,hitIndex:idx});if(!ok)return false;let s=S(u),skill=o.skill!==false;
  gain(u,champ(t)?(skill?P.P.context_skill_champion:P.P.context_attack_champion):(skill?P.P.context_skill_other:P.P.context_attack_other));
  if(skill){s.lastSkillHit=now();if(!o.noTrigger)for(let f of s.foreshadows.slice())if(dist(f,t)<=P.P.foreshadow_radius+(t.radius||0))detonate(u,f,e)}return true}
 function emp(u){let s=S(u);if(!s.empowered)return 1;s.empowered=false;return 1+P.P.handoff_damage}
 function addDraft(u,t,n=1){if(!alive(t))return;let d=t.claudeDraft;if(!d||d.owner!==u.id||d.until<now())d=t.claudeDraft={owner:u.id,stacks:0,until:0};d.stacks=Math.min(P.P.draft_max,d.stacks+n);d.until=now()+P.P.draft_duration}
 const drafts=(u,t)=>t.claudeDraft?.owner===u.id&&t.claudeDraft.until>now()?t.claudeDraft.stacks:0;
 const rhymed=(u,t)=>t.claudeRhyme?.owner===u.id&&t.claudeRhyme.until>now();
 function lineHits(from,a,len,width,u){return m.nearby(from,len+80,t=>foe(u,t)).filter(t=>{let dx=t.x-from.x,dy=t.y-from.y,al=dx*Math.cos(a)+dy*Math.sin(a),sd=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a)),r=t.radius||20;return al>=-r&&al<=len+r&&sd<=width/2+r})}
 function coneHits(u,a,radius,deg){return m.nearby(u,radius+60,t=>foe(u,t)).filter(t=>{let d=dist(u,t);if(d>radius+(t.radius||0))return false;let da=Math.atan2(t.y-u.y,t.x-u.x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));return Math.abs(da)<=deg*Math.PI/360||d<60})}
 function circleHits(u,p,radius){return m.nearby(p,radius+60,t=>foe(u,t)).filter(t=>dist(p,t)<=radius+(t.radius||0))}
 // ---- 伏笔 ----
 function place(u,p){let s=S(u);s.foreshadows.push({id:++s.seq,x:p.x,y:p.y,until:now()+P.P.foreshadow_duration,born:now()});while(s.foreshadows.length>P.P.foreshadow_max)s.foreshadows.shift();env.ring?.(p.x,p.y,40,P.FORMS.fable.color,.3)}
 function detonate(u,f,e){let s=S(u),i=s.foreshadows.indexOf(f);if(i<0)return;s.foreshadows.splice(i,1);let q=P.Q.fable,amount=at(q.damage,u,0)+q.ap_ratio*(u.ap||0);env.ring?.(f.x,f.y,P.P.foreshadow_radius,P.FORMS.fable.color,.4);
  for(let t of circleHits(u,f,P.P.foreshadow_radius))hit(u,t,amount,e,'foreshadow:'+f.id+':'+t.id,{noTrigger:true})}
 // ---- Q ----
 function castQ(u,c,e){let s=S(u),f=s.form,a=angleOf(u,c),k=emp(u);
  if(f==='haiku'){let q=P.Q.haiku,from={x:u.x,y:u.y},to=safe(u,{x:u.x+Math.cos(a)*q.dash,y:u.y+Math.sin(a)*q.dash},u.radius||22),amount=(at(q.damage,u,0)+q.ad_ratio*u.attack+q.ap_ratio*(u.ap||0))*k,any=false;
   for(let t of lineHits(from,a,q.dash,q.width,u))if(hit(u,t,amount,e,'q:haiku:'+t.id)){addDraft(u,t,q.drafts);if(champ(t))any=true}
   env.line?.(from,to,P.FORMS.haiku.color,q.width*.5,.25);u.x=to.x;u.y=to.y;core.spatial?.update(u);u.dest=null;u.angle=a;if(any)setCd(u,0,m.abilityCooldown(u,0)*(1-q.refund))}
  else if(f==='sonnet'){let q=P.Q.sonnet;if(s.stage>0&&now()>s.stageUntil)s.stage=0;
   if(s.stage===0){let amount=(at(q.line_damage,u,0)+q.line_ap*(u.ap||0))*k;env.line?.(u,{x:u.x+Math.cos(a)*q.line_length,y:u.y+Math.sin(a)*q.line_length},P.FORMS.sonnet.color,q.line_width*.6,.3);for(let t of lineHits(u,a,q.line_length,q.line_width,u))hit(u,t,amount,e,'q:sonnet1:'+t.id);s.stage=1;s.stageUntil=now()+q.stage_window;setCd(u,0,q.stage_gap)}
   else if(s.stage===1){let amount=(at(q.line_damage,u,0)+q.line_ap*(u.ap||0))*k;s.fx={kind:'cone',x:u.x,y:u.y,angle:a,radius:q.cone_radius,deg:q.cone_degrees,until:now()+.3};for(let t of coneHits(u,a,q.cone_radius,q.cone_degrees))hit(u,t,amount,e,'q:sonnet2:'+t.id);s.stage=2;s.stageUntil=now()+q.stage_window;setCd(u,0,q.stage_gap)}
   else{let r=Math.min(q.burst_range,Math.max(80,dist(u,c.p||u))),p={x:u.x+Math.cos(a)*r,y:u.y+Math.sin(a)*r};s.pending.push({kind:'burst',x:p.x,y:p.y,at:now()+q.burst_delay,start:now(),radius:q.burst_radius,event:e,amount:(at(q.burst_damage,u,0)+q.burst_ap*(u.ap||0))*k,color:P.FORMS.sonnet.color});s.stage=0;setCd(u,0,m.abilityCooldown(u,0))}}
  else if(f==='opus'){let q=P.Q.opus,ratio=s.charging?chargeRatio(u):q.bot_charge;endCharge(u);let range=lerp(q.range_min,q.range_max,ratio)+(s.deployed?P.E.deploy_range:0),r=Math.min(range,Math.max(120,dist(u,c.p||u))),p={x:u.x+Math.cos(a)*r,y:u.y+Math.sin(a)*r};
   s.pending.push({kind:'opus',x:p.x,y:p.y,at:now()+q.land_delay,start:now(),radius:lerp(q.radius_min,q.radius_max,ratio),event:e,amount:(at(q.damage,u,0)+q.ap_ratio*(u.ap||0))*lerp(q.min_ratio,1,ratio)*k,stun:lerp(q.stun_min,q.stun_max,ratio),color:P.FORMS.opus.color});env.line?.(u,p,P.FORMS.opus.color,5,q.land_delay)}
  else{let q=P.Q.fable,r=Math.min(q.place_range,dist(u,c.p||u)),p=safe(u,{x:u.x+Math.cos(a)*r,y:u.y+Math.sin(a)*r},10);env.line?.(u,p,P.FORMS.fable.color,3,.2);place(u,p);s.empowered=s.empowered||k>1}}
 function chargeMax(u){return S(u).deployed?P.Q.opus.deployed_charge_max:P.Q.opus.charge_max}
 function chargeRatio(u){let c=S(u).charging;return c?Math.min(1,(now()-c.start)/chargeMax(u)):0}
 function beginCharge(u){let s=S(u);if(s.form!=='opus'||s.charging||s.finisher||!alive(u)||!(u.skillRanks?.[0]>0)||m.abilityCooldownRemaining(u,0)>0)return false;s.charging={start:now()};m.recalc(u);return true}
 function endCharge(u){let s=S(u);if(s.charging){s.charging=null;m.recalc(u)}}
 // ---- W ----
 function castW(u,e){let s=S(u),f=s.form,w=P.W;
  if(f==='haiku'){s.parryUntil=now()+w.parry_window;s.parryHit=false}
  else if(f==='sonnet'){let amount=at(w.shield,u,1)+w.shield_ap*(u.ap||0),ally=units().filter(v=>v!==u&&v.type==='hero'&&v.team===u.team&&alive(v)&&dist(u,v)<=w.ally_range).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];for(let t of [u,ally].filter(Boolean)){m.shield(t,amount,w.shield_duration,u,{tag:'CLAUDE_ALIGNMENT'});env.ring?.(t.x,t.y,(t.radius||22)+20,P.FORMS.sonnet.color,.45)}}
  else if(f==='opus'){s.fortifyUntil=now()+w.fortify_duration;core.apply(u,'CC_IMMUNITY',w.fortify_duration,u,{uniqueKey:'claude-fortify:'+u.id,abilityId:1})}
  else{place(u,{x:u.x,y:u.y});u.invisible=Math.max(u.invisible||0,w.stealth_duration);core.apply(u,'MOVE_SPEED_BUFF',w.stealth_duration,u,{amount:w.stealth_move_pct,uniqueKey:'claude-exit:'+u.id,tenacity:false});env.ring?.(u.x,u.y,60,P.FORMS.fable.color,.4)}}
 function parried(u){let s=S(u);if(s.parryHit)return;s.parryHit=true;s.flash=now()+.3;setCd(u,0,0);s.qReady.haiku=now();setCd(u,1,(u.cd[1]||0)*(1-P.W.parry_refund));gain(u,P.P.context_parry);env.ring?.(u.x,u.y,90,'#ffffff',.3);core.emit('ClaudeParry',u,u,{})}
 // ---- E ----
 function move(u,a,d){let from={x:u.x,y:u.y},p=safe(u,{x:u.x+Math.cos(a)*d,y:u.y+Math.sin(a)*d},u.radius||22);env.line?.(from,p,F(u).color,6,.25);u.x=p.x;u.y=p.y;core.spatial?.update(u);u.dest=null}
 function castE(u,c,e){let s=S(u),f=s.form,a=angleOf(u,c),E=P.E;
  if(f==='haiku'||f==='sonnet'){move(u,a,f==='haiku'?E.haiku_dash:E.sonnet_blink);s.eReady=now()+E.window;s.eEvent=e}
  else if(f==='opus'){s.deployed=!s.deployed;if(s.deployed)setCd(u,2,E.deploy_toggle_cd);else setCd(u,2,m.abilityCooldown(u,2));u.dest=null;m.recalc(u);env.ring?.(u.x,u.y,70,P.FORMS.opus.color,.4)}
  else{let aim=c.p||{x:u.x+Math.cos(a)*300,y:u.y+Math.sin(a)*300},list=s.foreshadows.filter(f=>dist(u,f)<=E.gather_range).sort((x,y)=>dist(aim,x)-dist(aim,y));
   if(!list.length){move(u,a,E.fable_blink);return}let dest=list[0],from={x:u.x,y:u.y},all=s.foreshadows.slice(),q=P.Q.fable,link=(at(q.link_damage,u,0)+q.link_ap*(u.ap||0))*emp(u);
   let p=safe(u,{x:dest.x,y:dest.y},u.radius||22);env.line?.(from,p,P.FORMS.fable.color,6,.3);u.x=p.x;u.y=p.y;core.spatial?.update(u);u.dest=null;
   for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){let A=all[i],B=all[j],ang=Math.atan2(B.y-A.y,B.x-A.x);env.line?.(A,B,P.FORMS.fable.color,q.link_width*.5,.35);for(let t of lineHits(A,ang,dist(A,B),q.link_width,u))hit(u,t,link,e,'link:'+A.id+'-'+B.id+':'+t.id,{noTrigger:true})}
   for(let f of all)detonate(u,f,e)}}
 // ---- R ----
 function switchTo(u,form){let s=S(u);s.qReady[s.form]=now()+(u.cd[0]||0);s.form=form;s.stage=0;s.count=0;if(s.charging)s.charging=null;s.deployed=false;u.cd[0]=Math.max(0,(s.qReady[form]||0)-now());delete s.cdFix?.[0];m.recalc(u)}
 function castR(u,e){let s=S(u);
  if((u.energy||0)>=(u.maxEnergy||100)){u.energy=0;let R=P.R,target=m.nearby(u,R.finisher_range,t=>foe(u,t)&&champ(t)).sort((a,b)=>dist(u,a)-dist(u,b))[0]||m.nearby(u,R.finisher_range,t=>foe(u,t)).sort((a,b)=>dist(u,a)-dist(u,b))[0];
   s.finisher={start:now(),step:0,target,angle:target?Math.atan2(target.y-u.y,target.x-u.x):(u.angle||0),event:e,amount:at(R.finisher_damage,u,3)+R.finisher_ad*u.attack+R.finisher_ap*(u.ap||0)};endCharge(u);s.deployed=false;
   core.apply(u,'CC_IMMUNITY',R.finisher_steps.at(-1)+.2,u,{uniqueKey:'claude-finisher:'+u.id,abilityId:3});if(u.player)env.toast?.('总结陈词');core.emit('ClaudeFinisher',u,u,{});return}
  let perfect=now()-s.lastSkillHit<=P.P.handoff_window,next=FORMS[(FORMS.indexOf(s.form)+1)%FORMS.length];switchTo(u,next);s.primedUntil=now()+P.P.opener_window;u.attackCd=0;
  if(perfect){s.empowered=true;s.flash=now()+.35;setCd(u,3,P.R.cooldown*.5);gain(u,P.P.context_handoff);env.ring?.(u.x,u.y,110,'#ffffff',.35)}
  env.ring?.(u.x,u.y,70,F(u).color,.45);core.emit('ClaudeFormChanged',u,u,{form:next,perfect});if(u.player)env.toast?.((perfect?'完美交接 · ':'')+F(u).name+'（'+F(u).label+'）')}
 function finisherTick(u){let s=S(u),f=s.finisher,R=P.R;if(!f)return;if(!alive(u)){s.finisher=null;return}let t=f.target&&alive(f.target)?f.target:null;if(t)f.angle=Math.atan2(t.y-u.y,t.x-u.x);let a=f.angle,e=f.event;
  while(f.step<4&&now()-f.start>=R.finisher_steps[f.step]){let k=f.step;switchTo(u,FORMS[k]);f.amount=at(R.finisher_damage,u,3)+R.finisher_ad*u.attack+R.finisher_ap*(u.ap||0);
   if(k===0){let d=t?Math.max(0,Math.min(350,dist(u,t)-80)):250,from={x:u.x,y:u.y},to=safe(u,{x:u.x+Math.cos(a)*d,y:u.y+Math.sin(a)*d},u.radius||22);for(let v of lineHits(from,a,d+60,R.finisher_radius[0],u))hit(u,v,f.amount,e,'fin0:'+v.id);env.line?.(from,to,P.FORMS.haiku.color,40,.3);u.x=to.x;u.y=to.y;core.spatial?.update(u);u.dest=null}
   if(k===1){s.fx={kind:'cone',x:u.x,y:u.y,angle:a,radius:R.finisher_radius[1],deg:100,until:now()+.35};for(let v of coneHits(u,a,R.finisher_radius[1],100))hit(u,v,f.amount,e,'fin1:'+v.id)}
   if(k===2){let p=t?{x:t.x,y:t.y}:{x:u.x+Math.cos(a)*300,y:u.y+Math.sin(a)*300};env.ring?.(p.x,p.y,R.finisher_radius[2],P.FORMS.opus.color,.45);for(let v of circleHits(u,p,R.finisher_radius[2]))hit(u,v,f.amount,e,'fin2:'+v.id)}
   if(k===3){env.ring?.(u.x,u.y,R.finisher_radius[3],P.FORMS.fable.color,.5);for(let v of circleHits(u,u,R.finisher_radius[3]))hit(u,v,f.amount,e,'fin3:'+v.id);u.energy=0;s.finisher=null;return}
   f.step++}}
 m.registerBehavior(ID,(u,c,skill,e)=>{if(c.i===0)castQ(u,c,e);else if(c.i===1)castW(u,e);else if(c.i===2)castE(u,c,e);else if(c.i===3)castR(u,e)},{attackTiming:{windup:.18,recovery:.12}});
 m.heroHooks[ID]={
  isMelee:()=>false,
  cooldown:(u,i,v)=>i===0?v*at(QP(u).cooldown,u,0)/at(P.Q.sonnet.cooldown,u,0):v,
  bonusAS:u=>F(u).bonus_as,
  attackRange:u=>F(u).range+(S(u).deployed?P.E.deploy_range:0),
  attackInterval:(u,v)=>F(u).fixed_interval||v,
  effectiveAS:u=>F(u).fixed_interval?1/F(u).fixed_interval:undefined,
  canMove:u=>!(S(u).deployed||S(u).finisher),
  validate(u,i){let s=S(u);if(s.finisher)return false;if(s.charging&&i!==0&&i!==1)return false},
  derive(u){let s=S(u);u.resourceType='ENERGY';u.maxEnergy=P.BASE.max_energy;u.energy=Math.min(u.maxEnergy,Math.max(0,u.energy??0));let mp=F(u).move_pct;if(mp&&Number.isFinite(u.speed))u.speed*=1+mp;if(s.charging&&Number.isFinite(u.speed))u.speed*=1-P.Q.opus.self_slow;u.color=F(u).color},
  reduceDamage(t,value,source){let s=S(t);if(s.parryUntil>now()){if(value>0&&source&&source.team!==t.team)parried(t);return 0}return s.fortifyUntil>now()?value*(1-P.W.fortify_reduction):value},
  attackPacket(u,t,p){let s=S(u),f=F(u),form=s.form,primed=s.primedUntil>now();s.count++;
   let sig=primed||(form==='sonnet'&&s.count>=f.volta_every);if(sig){s.primedUntil=0;if(form==='sonnet')s.count=0}
   p.damage=f.aa_ad*u.attack+f.aa_ap*(u.ap||0);if(inZone(u,t))p.damage*=1+P.P.zone_bonus;p.claudeForm=form;p.claudeSig=sig;p.claudeBase=p.damage;
   if(s.eReady>now()){s.eReady=0;p.claudeE=(at(P.E.bonus,u,2)+P.E.bonus_ap*(u.ap||0))}},
  attackHit(u,t,p){let s=S(u),f=P.FORMS[p.claudeForm]||F(u),e=p.event,base=p.claudeBase||u.attack,o={skill:false,noTrigger:true};
   gain(u,champ(t)?P.P.context_attack_champion:P.P.context_attack_other);
   if(p.claudeE>0)hit(u,t,p.claudeE,s.eEvent||e,'e-tool',o);
   if(p.claudeForm==='haiku'){addDraft(u,t,p.claudeSig?3:1)}
   if(p.claudeForm==='sonnet'&&p.claudeSig){let amt=f.volta_base+f.volta_per_level*(u.level||1)+f.volta_ap*(u.ap||0);env.ring?.(t.x,t.y,f.volta_radius,f.color,.35);for(let v of circleHits(u,t,f.volta_radius))if(hit(u,v,amt,e,'volta:'+v.id,o)){m.slow(v,f.volta_slow,f.volta_slow_duration,u);v.claudeRhyme={owner:u.id,until:now()+P.P.rhyme_duration}}}
   if(p.claudeForm==='opus'){let k=p.claudeSig?1:f.splash_factor;env.ring?.(t.x,t.y,f.splash_radius,f.color,.3);for(let v of circleHits(u,t,f.splash_radius))if(v!==t)hit(u,v,base*k,e,'splash:'+v.id,{...o,type:'physical'})}
   if(p.claudeForm==='fable'){let n=p.claudeSig?2:1,done=new Set([t.id]),from=t;for(let k=0;k<n;k++){let v=m.nearby(from,f.bounce_range,x=>foe(u,x)&&!done.has(x.id)).sort((a,b)=>dist(from,a)-dist(from,b))[0];if(!v)break;done.add(v.id);env.line?.(from,v,f.color,3,.2);hit(u,v,base*f.bounce_factor,e,'bounce:'+k,{...o,type:'physical'});from=v}}},
  tick(u,dt){let s=S(u);
   if(s.cdFix)for(let i in s.cdFix){let c=s.cdFix[i];if(now()-c.at<.12){if(u.cd[i]>c.v+.2)u.cd[i]=Math.max(0,c.v-(now()-c.at))}else delete s.cdFix[i]}
   if(now()-s.lastGain>P.P.decay_delay&&u.energy>0&&!s.finisher)u.energy=Math.max(0,u.energy-P.P.decay_per_second*(dt||1/60));
   if(s.stage>0&&now()>s.stageUntil){s.stage=0;if(s.form==='sonnet')u.cd[0]=m.abilityCooldown(u,0)*.6}
   if(s.charging&&(!alive(u)||s.form!=='opus'))endCharge(u);
   s.zones=s.zones.filter(z=>z.until>now());s.foreshadows=s.foreshadows.filter(f=>f.until>now());
   for(let q of s.pending.slice()){if(now()<q.at)continue;s.pending.splice(s.pending.indexOf(q),1);env.ring?.(q.x,q.y,q.radius,q.color,.35);
    for(let t of circleHits(u,q,q.radius)){if(q.kind==='burst'){let n=drafts(u,t);if(hit(u,t,q.amount*(1+P.Q.sonnet.draft_bonus*n),q.event,'q:sonnet3:'+t.id)){if(n)t.claudeDraft=null;t.claudeRhyme={owner:u.id,until:now()+P.P.rhyme_duration}}}
     else if(hit(u,t,q.amount,q.event,'q:opus:'+t.id)&&rhymed(u,t)){t.claudeRhyme=null;m.control(t,'STUN',q.stun,u,{abilityId:0,castId:q.event.castId})}}
    if(q.kind==='opus')s.zones.push({x:q.x,y:q.y,radius:q.radius,until:now()+P.P.zone_duration})}
   finisherTick(u)},
  describeExtra(u,i){let s=S(u),f=F(u);return i===3?'当前 '+f.name+'（'+f.label+'）· 上下文 '+Math.floor(u.energy||0)+'/100'+((u.energy||0)>=100?' · 终结技就绪':''):i===0&&s.form==='sonnet'?'当前第 '+(s.stage+1)+' 段':''},
  reset(u){u.claudeState=null;u.energy=0}
 };
 // ---- 绘制：全部在世界坐标里画，地面效果对双方始终可见 ----
 function draw(ctx,viewer){let t=now();for(let u of units()){if(u.hero!==ID||!u.claudeState)continue;let s=S(u),seen=!viewer||u.team===viewer.team||env.visibleTo?.(viewer,u)!==false;ctx.save();
   for(let z of s.zones){let k=Math.max(0,(z.until-t)/P.P.zone_duration);ctx.beginPath();ctx.arc(z.x,z.y,z.radius,0,TAU);ctx.fillStyle='rgba(178,140,255,'+(.10+.10*k)+')';ctx.fill();ctx.strokeStyle='#b28cffaa';ctx.lineWidth=3;ctx.setLineDash([14,10]);ctx.stroke();ctx.setLineDash([])}
   for(let f of s.foreshadows){let k=Math.max(0,(f.until-t)/P.P.foreshadow_duration),pulse=1+.08*Math.sin(t*6+f.id);ctx.beginPath();ctx.arc(f.x,f.y,P.P.foreshadow_radius,0,TAU);ctx.fillStyle='rgba(255,213,107,.07)';ctx.fill();ctx.strokeStyle='#ffd56b66';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(f.x,f.y,30,-Math.PI/2,-Math.PI/2+k*TAU);ctx.strokeStyle='#ffd56b';ctx.lineWidth=4;ctx.stroke();ctx.beginPath();ctx.moveTo(f.x,f.y-18*pulse);ctx.lineTo(f.x+13*pulse,f.y);ctx.lineTo(f.x,f.y+18*pulse);ctx.lineTo(f.x-13*pulse,f.y);ctx.closePath();ctx.fillStyle='#ffe9a8';ctx.fill();ctx.strokeStyle='#8a6a1c';ctx.lineWidth=2;ctx.stroke()}
   for(let q of s.pending){let k=Math.min(1,(t-q.start)/Math.max(.01,q.at-q.start));ctx.beginPath();ctx.arc(q.x,q.y,q.radius,0,TAU);ctx.strokeStyle=q.color;ctx.lineWidth=4;ctx.stroke();ctx.beginPath();ctx.arc(q.x,q.y,q.radius*k,0,TAU);ctx.fillStyle=q.color+'44';ctx.fill()}
   if(s.fx&&s.fx.until>t&&s.fx.kind==='cone'){let x=s.fx,h=x.deg*Math.PI/360;ctx.beginPath();ctx.moveTo(x.x,x.y);ctx.arc(x.x,x.y,x.radius,x.angle-h,x.angle+h);ctx.closePath();ctx.fillStyle=F(u).color+'55';ctx.fill();ctx.strokeStyle=F(u).color;ctx.lineWidth=3;ctx.stroke()}
   if(seen&&alive(u)){let col=F(u).color;ctx.beginPath();ctx.arc(u.x,u.y,36,0,TAU);ctx.strokeStyle=col+'cc';ctx.lineWidth=3;ctx.stroke();
    if(s.form==='sonnet'&&s.stage>0)for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(u.x-14+i*14,u.y+50,4,0,TAU);ctx.fillStyle=i<s.stage?col:'#ffffff33';ctx.fill()}
    if(s.charging){let k=chargeRatio(u),q=P.Q.opus,range=lerp(q.range_min,q.range_max,k)+(s.deployed?P.E.deploy_range:0);ctx.beginPath();ctx.arc(u.x,u.y,range,0,TAU);ctx.strokeStyle='#b28cff55';ctx.lineWidth=2;ctx.setLineDash([10,12]);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(u.x,u.y,56,-Math.PI/2,-Math.PI/2+k*TAU);ctx.strokeStyle=k>=1?'#ffffff':'#b28cff';ctx.lineWidth=7;ctx.stroke()}
    if(s.deployed){ctx.strokeStyle='#b28cff';ctx.lineWidth=4;ctx.strokeRect(u.x-48,u.y-48,96,96)}
    if(s.parryUntil>t){ctx.beginPath();ctx.arc(u.x,u.y,62,0,TAU);ctx.strokeStyle='#eafff4';ctx.lineWidth=6;ctx.stroke()}
    if(s.fortifyUntil>t){ctx.beginPath();ctx.arc(u.x,u.y,58,0,TAU);ctx.strokeStyle='#d7c6ff';ctx.lineWidth=5;ctx.setLineDash([6,6]);ctx.stroke();ctx.setLineDash([])}
    if(s.flash>t||s.empowered){ctx.beginPath();ctx.arc(u.x,u.y,46+6*Math.sin(t*14),0,TAU);ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.stroke()}
    if(s.eReady>t){ctx.beginPath();ctx.arc(u.x,u.y,28,0,TAU);ctx.strokeStyle='#9fe8ff';ctx.lineWidth=3;ctx.stroke()}}
   ctx.restore()}
  for(let v of units()){let d=v.claudeDraft,r=v.claudeRhyme;if(!d&&!r||!alive(v))continue;if(viewer&&v.team!==viewer.team&&env.visibleTo?.(viewer,v)===false)continue;ctx.save();
   if(d&&d.until>t)for(let i=0;i<d.stacks;i++){ctx.beginPath();ctx.arc(v.x-20+i*10,v.y-(v.radius||22)-34,4,0,TAU);ctx.fillStyle='#7fd6a8';ctx.fill();ctx.strokeStyle='#0c2a1c';ctx.lineWidth=1;ctx.stroke()}
   if(r&&r.until>t){ctx.beginPath();ctx.arc(v.x,v.y,(v.radius||22)+16,t*3,t*3+Math.PI*1.3);ctx.strokeStyle='#e8a26a';ctx.lineWidth=4;ctx.stroke()}ctx.restore()}}
 const NEXT={haiku:'诗',sonnet:'巨',opus:'寓',fable:'俳'};
 m.claude={state:S,form:u=>S(u).form,forms:FORMS,draw,beginCharge,cancelCharge:endCharge,chargeRatio,charging:u=>!!S(u).charging,
  qIcon:u=>{let s=S(u);return s.form==='sonnet'?['诗','承','合'][s.stage]||'诗':F(u).icon},rIcon:u=>(u.energy||0)>=(u.maxEnergy||100)?'终':NEXT[S(u).form],
  context:u=>u.energy||0,empowered:u=>S(u).empowered,drafts,rhymed,place,switchTo};
};
})();
