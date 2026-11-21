/* V19 原创英雄「大剑侠」：重装大剑战士（蓄力斩 / 肩撞 / 相杀斩 / 格挡 / 弱点锁定）。
 * 按键：Q 蓄力斩（按住蓄力、松开挥砍，Q1→Q2→Q3 派生）；W 相杀斩；E 肩撞；R 真蓄力奥义；
 *       G 按住格挡（起手0.15秒为精准防御）；V 开关弱点锁定；T 弱点突刺（需在锁定模式下）。
 * 所有时间都使用游戏时钟（env.time），字段名以 start/at/until/end 结尾，DIO 时停会整体平移。
 * 数值默认值写在下方 DEFAULTS；Excel「英雄」表中 GREAT_SWORD_HERO 的同名参数会覆盖默认值。
 */
(()=>{'use strict';
const ID='great_sword',XID='GREAT_SWORD_HERO',C=window.GAME_CONFIG;if(!C||!C.heroes)return;
const lv=(a,b,n=5)=>Array.from({length:n},(_,i)=>+(a+(b-a)*i/(n-1)).toFixed(3));
const DEFAULTS={
 BASE:{hp_base:720,hp_growth:115,ad_base:68,ad_growth:4.5,armor_base:38,armor_growth:5,mr_base:32,mr_growth:2,mana_base:350,mana_growth:40,as_base:.58,as_ratio:.58,as_growth:.02,hp_regen_base:9,hp_regen_growth:.8,mana_regen_base:6,mana_regen_growth:.5,attack_range:175,move_speed:215},
 P:{charge_level_1_time:.55,charge_level_2_time:1.1,charge_level_3_time:1.75,charge_multipliers:[1,1.45,2.1],overcharge_time:.65,overcharge_multiplier:1.65,overcharge_auto_release:1,turn_speed_deg:120,input_buffer:.2,hit_root_ratio:.75,hit_mid_ratio:.9,hit_tip_ratio:1,hit_root_end:.35,hit_mid_end:.7},
 Q:{cooldown:lv(12,8),interrupt_cooldown:4},
 Q1:{damage:lv(80,200),bonus_ad_ratio:1,attack_range:250,attack_width:105,impact:.22,recovery:.35,input_window:1},
 Q2:{damage:lv(110,270),bonus_ad_ratio:1.25,attack_range:275,attack_width:120,impact:.28,recovery:.4,input_window:1},
 Q3:{damage:lv(150,390),bonus_ad_ratio:1.75,attack_range:300,attack_width:150,first_impact:.18,second_impact:.55,recovery:.55,first_hit_ratio:.2,second_hit_ratio:.8,power_hit_bonus:.2},
 W:{damage:lv(80,220),bonus_ad_ratio:1,ready_duration:.65,offset_window_start:.15,offset_window_end_grace:.1,attack_range:225,attack_width:110,offset_bonus_damage:lv(50,150),offset_bonus_ad_ratio:.5,offset_range:450,offset_arc_deg:120,offset_knockback:50,offset_hyper_armor:.6,offset_followup_window:.8,offset_cd_reduction:3,min_cooldown:1,recovery:.3,
    cross_slash_damage:lv(75,175),cross_slash_ratio:.75,cross_slash_damage_2:lv(125,225),cross_slash_ratio_2:1,cross_range:250,cross_width:140,cross_first_impact:.2,cross_second_impact:.45,cross_recovery:.3,cross_slow:.4,cross_slow_duration:1,cross_to_q_window:.5,cooldown:lv(20,16),mana:70},
 E:{damage:lv(35,95),bonus_ad_ratio:.45,dash_distance:75,duration:.35,hit_at:.15,hit_radius:175,hit_arc_deg:120,damage_reduction:.35,hyper_armor_duration:.35,precision_window:.15,precision_charge_cut:.3,precision_speed:.1,precision_speed_duration:1,followup_window:.5,cooldown:lv(16,12),mana:60},
 R:{damage:[250,400,550],bonus_ad_ratio:2,charge_duration:1.25,q_link_charge_cut:.25,full_charge_bonus:.5,max_hp_damage:.05,large_monster_cap:300,offset_link_bonus:.1,offset_link_window:6,attack_range:350,attack_width:180,impact:.2,recovery:.5,cooldown:[110,90,70],mana:100},
 GUARD:{physical_reduction:.45,magic_reduction:.3,mana_per_hit:15,precision_window:.15,precision_charge_cut:.35,quick_counter_window:.5,perfect_cc_shield:.25},
 FOCUS:{turn_speed_bonus:.3,strike_damage:lv(100,260),strike_bonus_ad_ratio:1,strike_range:300,strike_width:80,strike_impact:.15,strike_recovery:.2,strike_cooldown:18,strike_mana:65,q3_window:1}
};
// Excel 覆盖：CONFIG_SNAPSHOT.config.params.英雄.GREAT_SWORD_HERO.<组>.<键>
const P=JSON.parse(JSON.stringify(DEFAULTS));
try{let x=window.CONFIG_SNAPSHOT?.config?.params?.['英雄']?.[XID];if(x)for(let g of Object.keys(P))for(let k of Object.keys(P[g]))if(x[g]?.[k]!==undefined)P[g][k]=Array.isArray(P[g][k])&&!Array.isArray(x[g][k])?P[g][k].map(()=>x[g][k]):x[g][k];}catch(e){}
const skill=o=>({maxRank:5,windup:0,recovery:.05,damageType:'physical',heroOnly:false,...o});
const B=P.BASE;
C.heroes[ID]={name:'大剑侠',title:'重剑蓄势',role:'重装战士 / 战士',resource:'mana',color:'#d8b25a',
 stats:{hp:B.hp_base,mana:B.mana_base,attack:B.ad_base,ap:0,armor:B.armor_base,mr:B.mr_base,baseAS:B.as_base,asRatio:B.as_ratio,speed:B.move_speed,range:B.attack_range,hpRegen:B.hp_regen_base,manaRegen:B.mana_regen_base,
  growth:{hp:B.hp_growth,mana:B.mana_growth,attack:B.ad_growth,armor:B.armor_growth,mr:B.mr_growth,as:B.as_growth,hpRegen:B.hp_regen_growth,manaRegen:B.mana_regen_growth}},
 passive:{name:'蓄力精通',desc:'Q 按住蓄力：0.55秒一级（100%）、1.10秒二级（145%）、1.75秒三级（210%）。三级后再按住0.65秒进入过蓄，倍率降为165%；过蓄后1秒自动挥砍。蓄力期间可转向，每秒最多120°（弱点锁定时+30%）。松手过早时会等蓄满一级才挥砍，快速连按不能跳过蓄力与挥砍。G 按住格挡：物理-45%、魔法-30%，每次受击消耗15法力；格挡起手0.15秒内挡下敌方英雄攻击触发精准防御（本次伤害为0、抵消附带普通控制），下一次Q蓄力时间-35%，0.5秒内按Q快速反击。V 开关弱点锁定（显示附近敌方英雄的头/躯干/背/侧面受击区，仅辅助瞄准）；锁定中按 T 弱点突刺。',params:P.P},
 skills:[
  skill({key:'Q',name:'蓄力斩',icon:'斩',target:'direction',range:300,width:150,cd:P.Q.cooldown,mana:0,damage:P.Q1.damage,
   desc:'按住蓄力、松开挥砍，三段派生：Q1 蓄力斩（250码×105码，80/110/140/170/200+100%额外AD）→ 结束后1秒内再按Q → Q2 强蓄力斩（275×120，110/150/190/230/270+125%额外AD）→ 1秒内再按Q → Q3 真蓄力斩（300×150，150/210/270/330/390+175%额外AD，分两段：前置斩20%、终结斩80%；前置斩命中英雄时终结斩+20%）。伤害×蓄力倍率；剑根/剑身/剑尖命中分别为75%/90%/100%。动作结束前0.2秒内按Q会缓存一次输入。整套连招结束（或超时、被打断）后才进入12/11/10/9/8秒冷却；Q1被硬控打断进入4秒短冷却。'}),
  skill({key:'W',name:'相杀斩',icon:'杀',target:'direction',range:225,width:110,cd:P.W.cooldown,mana:P.W.mana,damage:P.W.damage,
   desc:'举剑进入0.65秒相杀准备，随后上挑斩击（225×110，80/115/150/185/220+100%额外AD）。准备开始0.15秒后到上挑为止，正面120°内敌方英雄的普攻或技能命中你时相杀成功：该次攻击伤害被抵消，对出手者额外造成原伤害+50/75/100/125/150+50%额外AD并击退，自身霸体0.6秒，W冷却-3秒（最低1秒），并在0.8秒内可按Q使出十字斩（75/100/125/150/175+75%额外AD 与 125/150/175/200/225+100%额外AD 两段，第二段命中英雄减速40%持续1秒），十字斩后0.5秒内按Q衔接Q2。持续伤害、装备与召唤师技能伤害不会触发相杀。'}),
  skill({key:'E',name:'肩撞',icon:'撞',target:'direction',range:75,cd:P.E.cooldown,mana:P.E.mana,damage:P.E.damage,
   desc:'向前肩撞75码（0.35秒），对前方扇形敌人造成35/50/65/80/95+45%额外AD物理伤害。期间霸体并减伤35%（不减真实伤害）。可在Q蓄力中使用：结束后保留已蓄力时间继续蓄力；在Q派生窗口中使用：结束后0.5秒内可按Q衔接下一段（窗口不会无限延长）。起手0.15秒内承受敌方英雄或大型野怪攻击触发精准肩撞：下一次Q蓄力时间-30%、移速+10%持续1秒。'}),
  skill({key:'R',name:'真蓄力奥义',icon:'奥',target:'direction',range:350,width:180,maxRank:3,cd:P.R.cooldown,mana:P.R.mana,damage:P.R.damage,
   desc:'原地举剑蓄力1.25秒（可转向、不能移动），随后落剑：前方350×180码造成(250/400/550+200%额外AD)×150%物理伤害，命中英雄额外造成其5%最大生命物理伤害（大型野怪最多300，史诗野怪不触发）。释放时Q已蓄到三级：蓄力时间-0.25秒；6秒内完成过十字斩：伤害+10%。每次R各最多触发一次。落点范围敌我双方可见。'})
 ],params:P};
C.heroParams??={};C.heroParams[ID]=P;
if(C.ultimateCooldowns)C.ultimateCooldowns[ID]=P.R.cooldown;
if(window.ChampionStats)ChampionStats[ID]=C.heroes[ID].stats;
if(window.ChampionAbilities)ChampionAbilities[ID]=C.heroes[ID].skills;

window.installGreatSword=function(m,env){
 const core=m.core,now=env.time,units=env.units,alive=t=>t&&t.hp>0&&!(t.death>0),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),eps=1e-6;
 const rk=(u,i)=>Math.max(1,u.skillRanks?.[i]||1),at=(arr,u,i)=>Array.isArray(arr)?arr[Math.min(arr.length,rk(u,i))-1]:arr;
 const bonusAD=u=>Math.max(0,u.attack-(u.baseAttack??u.attack));
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const S=u=>u.greatswordState??={charging:null,swing:null,combo:null,bufferQ:null,tackle:null,offset:null,guard:null,r:null,discount:0,crossUntil:0,quickUntil:0,followUntil:0,crossDoneAt:-99,lastL3At:-99,speedUntil:0,focusOn:false,strikeReadyAt:0,seq:0,visuals:[],stats:{swings:0,hits:0,offsets:0,events:0}};
 const foe=(u,t)=>alive(t)&&t.team!==u.team&&['hero','minion','monster'].includes(t.type)&&!(t.untargetable>0)&&!t.tentacle&&!t.spiritOwner;
 const champ=t=>t?.type==='hero'&&!t.clone&&!t.dvaBomb&&!t.spiritOwner;
 const epic=t=>t?.type==='monster'&&(t.epic||t.monsterType==='EPIC_MONSTER');
 const large=t=>t?.type==='monster'&&!epic(t)&&(t.monsterType==='LARGE_MONSTER'||t.large||t.monsterType==='RIFT_SCUTTLER');
 function overTime(meta={}){return !!(meta.dot||meta.sourceType==='DAMAGE_OVER_TIME'||meta.itemEffect||meta.itemId||meta.runeProc||meta.runeId||meta.mapDamage||String(meta.event?.index??meta.abilityId??'').startsWith('summoner'))}
 function legalAttack(t,source,meta,type){return source&&source.team!==t.team&&!overTime(meta)&&type!=='heal'}
 function event(u,index){let s=S(u);s.stats.events++;let e=core.instance?core.instance(u,index):{castId:'gs-'+u.id+'-'+(++s.seq),index,source:u,time:now()};e.entropy??=new Set;e.damageHits??=new Set;e.hitKeys??=new Set;return e}
 function fx(u,kind,p,data={}){let v=S(u).visuals;v.push({kind,x:p.x,y:p.y,started:now(),until:now()+(data.life||.45),...data});if(v.length>32)v.shift()}
 function times(c){let k=1-(c.discount||0);return [P.P.charge_level_1_time*k,P.P.charge_level_2_time*k,P.P.charge_level_3_time*k]}
 function elapsed(c){return c?(c.bank||0)+(c.paused?0:Math.max(0,now()-c.start)):0}
 function chargeLevel(c){if(!c)return 0;let e=elapsed(c)+eps,t=times(c);return e<t[0]?0:e<t[1]?1:e<t[2]?2:3}
 function overcharged(c){return !!c&&elapsed(c)+eps>=times(c)[2]+P.P.overcharge_time}
 function chargeMultiplier(c){let l=Math.max(1,chargeLevel(c));return overcharged(c)?P.P.overcharge_multiplier:P.P.charge_multipliers[l-1]}
 function busy(u){let s=S(u);return !!(s.swing||s.tackle||s.offset||s.r||s.guard)}
 function setQCooldown(u,value){u.cd[0]=Math.max(u.cd[0]||0,value)}
 function qCooldown(u){let v=at(P.Q.cooldown,u,0),h=m.abilityHaste?.(u);return h?v*100/(100+h):v}
 function endCombo(u,reason){let s=S(u);if(!s.combo&&!s.comboActive)return;s.combo=null;s.comboActive=false;s.crossUntil=0;setQCooldown(u,reason==='q1-interrupt'?P.Q.interrupt_cooldown:qCooldown(u))}

 // ---------- 蓄力 ----------
 function startCharge(u,stage){let s=S(u);s.charging={stage,start:now(),bank:0,paused:false,angle:u.angle||0,aim:u.angle||0,discount:s.discount,released:false,event:null};s.discount=0;s.combo=null;s.comboActive=true;s.quickUntil=0;s.followUntil=0;u.dest=null;return true}
 function canStartQ1(u){return alive(u)&&(u.skillRanks?.[0]||0)>0&&m.abilityCooldownRemaining(u,0)<=0&&!core.hardLocked?.(u)&&!(u.silence>0)}
 function qPress(u){let s=S(u);if(!alive(u)||s.r||s.offset&&!s.offset.success||s.guard)return false;if(s.offset?.success)s.offset=null;
  if(s.charging)return true;
  let swing=s.swing;if(swing||s.tackle){let end=swing?swing.end:s.tackle.end;if(s.tackle?.resume)return true;if(end-now()<=P.P.input_buffer+eps){if(!s.bufferQ)s.bufferQ={at:now(),released:false,event:null};return true}return false}
  if(now()<s.crossUntil)return startCross(u);
  if(s.combo&&now()<=s.combo.until+eps)return startCharge(u,s.combo.next);
  if(now()<s.quickUntil||now()<s.followUntil){if(s.combo)return startCharge(u,s.combo.next);if(canStartQ1(u))return startCharge(u,1)}
  if(canStartQ1(u))return startCharge(u,1);return false}
 function qRelease(u,point){let s=S(u),c=s.charging,a=point?Math.atan2(point.y-u.y,point.x-u.x):null;
  if(c){if(!c.released){c.released=true;c.event=event(u,0);if(a!=null&&Math.hypot(point.x-u.x,point.y-u.y)>5)c.aim=a}return true}
  if(s.bufferQ){s.bufferQ.released=true;s.bufferQ.aim=a;return true}
  if(s.swing?.kind==='CROSS'||s.swing)return false;
  if(qPress(u)){if(s.charging){s.charging.released=true;s.charging.event=event(u,0);if(a!=null)s.charging.aim=a}else if(s.swing?.kind==='CROSS'){}return true}return false}
 function steer(u,point){let s=S(u),c=s.charging||s.r||(s.offset&&!s.offset.swung?s.offset:null);if(!c||!point)return;if(Math.hypot(point.x-u.x,point.y-u.y)<5)return;c.aim=Math.atan2(point.y-u.y,point.x-u.x)}
 function turn(u,c,dt){if(c.aim==null)return;let rate=P.P.turn_speed_deg*Math.PI/180*(S(u).focusOn?1+P.FOCUS.turn_speed_bonus:1),d=wrap(c.aim-c.angle),step=Math.min(Math.abs(d),rate*dt);c.angle=wrap(c.angle+Math.sign(d)*step);u.angle=c.angle}
 function tickCharge(u,dt){let s=S(u),c=s.charging;if(!c||c.paused)return;turn(u,c,dt);let t=times(c),e=elapsed(c);
  if(c.released&&e+eps>=t[0])return swingQ(u);
  if(e>=t[2]+P.P.overcharge_time+P.P.overcharge_auto_release){c.released=true;c.event??=event(u,0);return swingQ(u)}}

 // ---------- 挥砍与碰撞 ----------
 function rectHits(u,origin,angle,range,width){let out=[],cos=Math.cos(angle),sin=Math.sin(angle);for(let t of m.nearby(origin,range+120,v=>foe(u,v))){let x=t.x-origin.x,y=t.y-origin.y,r=t.radius||20,along=x*cos+y*sin,side=-x*sin+y*cos;if(along<-r||along>range+r||Math.abs(side)>width/2+r)continue;out.push({t,frac:Math.max(0,Math.min(1,along/range))})}return out}
 function zone(frac){return frac<P.P.hit_root_end?P.P.hit_root_ratio:frac<P.P.hit_mid_end?P.P.hit_mid_ratio:P.P.hit_tip_ratio}
 function hit(u,t,amount,e,hitIndex,abilityId,extra={}){if(!(amount>0)||!Number.isFinite(amount))return false;let ok=m.deal(t,amount,u,'physical',{event:e,once:true,hitIndex,abilityId,greatSword:true,...extra});if(ok)S(u).stats.hits++;return ok}
 function swingQ(u){let s=S(u),c=s.charging;s.charging=null;let stage=c.stage,g=P['Q'+stage],level=Math.max(1,chargeLevel(c)),mult=chargeMultiplier(c),base=(at(g.damage,u,0)+g.bonus_ad_ratio*bonusAD(u))*mult,angle=c.angle;u.angle=angle;s.stats.swings++;
  if(level>=3)s.lastL3At=now();let hits=stage===3?[{at:now()+g.first_impact,ratio:g.first_hit_ratio,idx:'q3a'},{at:now()+g.second_impact,ratio:g.second_hit_ratio,idx:'q3b',power:true}]:[{at:now()+g.impact,ratio:1,idx:'q'+stage}];
  let last=hits[hits.length-1].at;s.swing={start:now(),kind:'Q',stage,level,over:overcharged(c),angle,base,range:g.attack_range,width:g.attack_width,hits,end:last+(g.recovery??P.Q3.recovery),event:c.event||event(u,0),heroFirst:false};
  fx(u,'charge-release',u,{angle,level,stage,life:.3})}
 function startCross(u){let s=S(u),w=P.W;s.crossUntil=0;s.comboActive=true;let e=event(u,0),angle=u.angle||0;
  s.swing={start:now(),kind:'CROSS',angle,range:w.cross_range,width:w.cross_width,hits:[{at:now()+w.cross_first_impact,amount:at(w.cross_slash_damage,u,1)+w.cross_slash_ratio*bonusAD(u),idx:'x1'},{at:now()+w.cross_second_impact,amount:at(w.cross_slash_damage_2,u,1)+w.cross_slash_ratio_2*bonusAD(u),idx:'x2',slow:true}],end:now()+w.cross_second_impact+w.cross_recovery,event:e};s.crossDoneAt=now();s.stats.swings++;return true}
 function resolveHit(u,sw,h){let s=S(u),origin={x:u.x-Math.cos(sw.angle)*15,y:u.y-Math.sin(sw.angle)*15},any=false,hero=false;
  for(let {t,frac} of rectHits(u,origin,sw.angle,sw.range,sw.width)){let amount;
   if(sw.kind==='Q'){amount=sw.base*h.ratio*zone(frac);if(h.power&&sw.heroFirst)amount*=1+P.Q3.power_hit_bonus}
   else if(sw.kind==='R'){amount=sw.base*zone(frac);}
   else amount=(h.amount??sw.base)*zone(frac);
   let abilityId=sw.kind==='R'?3:sw.kind==='W'?1:sw.kind==='FOCUS'?'focus':0;
   if(!hit(u,t,amount,sw.event,h.idx,abilityId))continue;any=true;if(champ(t))hero=true;
   if(sw.kind==='R'&&alive(t)){let extra=champ(t)?P.R.max_hp_damage*t.maxHp:large(t)?Math.min(P.R.large_monster_cap,P.R.max_hp_damage*t.maxHp):0;if(extra>0)hit(u,t,extra,sw.event,'r-maxhp',3,{maxHpDamage:true})}
   if(h.slow&&champ(t)&&alive(t))m.slow(t,P.W.cross_slow,P.W.cross_slow_duration,u,null,'gs-cross:'+u.id)}
  if(sw.kind==='Q'&&h.idx==='q3a')sw.heroFirst=hero;
  if(sw.kind==='FOCUS'&&hero){s.focusHit=true}
  fx(u,'slash',u,{angle:sw.angle,range:sw.range,width:sw.width,kind:sw.kind,level:sw.level||0,power:!!(h.power&&sw.heroFirst),life:.35});return any}
 function tickSwing(u){let s=S(u),sw=s.swing;if(!sw)return;for(let h of sw.hits)if(!h.done&&now()+eps>=h.at){h.done=true;resolveHit(u,sw,h)}if(now()+eps<sw.end)return;s.swing=null;finishSwing(u,sw)}
 function finishSwing(u,sw){let s=S(u);
  if(sw.kind==='Q'){if(sw.stage<3)s.combo={next:sw.stage+1,until:now()+P['Q'+sw.stage].input_window};else endCombo(u,'q3')}
  else if(sw.kind==='CROSS')s.combo={next:2,until:now()+P.W.cross_to_q_window};
  else if(sw.kind==='FOCUS'){if(s.focusHit)s.combo={next:3,until:now()+P.FOCUS.q3_window};s.focusHit=false}
  let b=s.bufferQ;s.bufferQ=null;if(b&&(sw.kind!=='R')){if(qPress(u)&&s.charging&&b.released){s.charging.released=true;s.charging.event=event(u,0);if(b.aim!=null)s.charging.aim=b.aim}}}

 // ---------- E 肩撞 ----------
 function startTackle(u,c,e){let s=S(u),g=P.E;let resume=null;if(s.charging){s.charging.bank=elapsed(s.charging);s.charging.paused=true;resume=s.charging}
  let angle=c?.angle??u.angle??0;u.angle=angle;let to=core.safePoint?core.safePoint(u,{x:u.x+Math.cos(angle)*g.dash_distance,y:u.y+Math.sin(angle)*g.dash_distance},u.radius||22):{x:u.x+Math.cos(angle)*g.dash_distance,y:u.y+Math.sin(angle)*g.dash_distance};
  core.startDisplacement(u,to,{type:'DASH',duration:g.duration,source:u,abilityId:2});core.apply(u,'CC_IMMUNITY',g.hyper_armor_duration,u,{uniqueKey:'gs-tackle:'+u.id,abilityId:2,tag:'GS_HYPER_ARMOR'});
  s.tackle={start:now(),end:now()+g.duration,hitAt:now()+g.hit_at,angle,event:e,resume,precise:false,hit:false};if(s.combo)s.combo.until=Math.max(s.combo.until,s.tackle.end+g.followup_window);fx(u,'tackle',u,{angle,life:g.duration})}
 function tickTackle(u){let s=S(u),k=s.tackle;if(!k)return;let g=P.E;if(!k.hit&&now()+eps>=k.hitAt){k.hit=true;let dmg=at(g.damage,u,2)+g.bonus_ad_ratio*bonusAD(u);for(let t of m.nearby(u,g.hit_radius+80,v=>foe(u,v))){let d=dist(u,t),a=Math.abs(wrap(Math.atan2(t.y-u.y,t.x-u.x)-k.angle));if(d>g.hit_radius+(t.radius||0))continue;if(d>(t.radius||20)+25&&a>g.hit_arc_deg*Math.PI/360)continue;hit(u,t,dmg,k.event,'tackle',2)}}
  if(now()+eps<k.end)return;s.tackle=null;if(k.resume&&s.charging===k.resume){k.resume.paused=false;k.resume.start=now()}else s.followUntil=now()+g.followup_window;
  if(s.bufferQ&&!s.charging){let b=s.bufferQ;s.bufferQ=null;if(qPress(u)&&s.charging&&b.released){s.charging.released=true;s.charging.event=event(u,0)}}}

 // ---------- W 相杀 ----------
 function startOffset(u,c,e){let s=S(u),g=P.W;if(s.charging){s.charging=null;s.comboActive=false;endCombo(u,'w')}let angle=c?.angle??u.angle??0;u.angle=angle;
  s.offset={start:now(),windowStart:now()+g.offset_window_start,readyEnd:now()+g.ready_duration,angle,aim:angle,event:e,success:false,swung:false,end:now()+g.ready_duration+g.recovery};u.dest=null}
 function offsetActive(t,source){let o=S(t).offset;if(!o||o.success||o.swung)return false;if(now()+eps<o.windowStart||now()>o.readyEnd+P.W.offset_window_end_grace)return false;if(!champ(source)||dist(t,source)>P.W.offset_range)return false;return Math.abs(wrap(Math.atan2(source.y-t.y,source.x-t.x)-o.angle))<=P.W.offset_arc_deg*Math.PI/360}
 function offsetSuccess(u,source){let s=S(u),o=s.offset,g=P.W;o.success=true;s.stats.offsets++;core.apply(u,'CC_IMMUNITY',g.offset_hyper_armor,u,{uniqueKey:'gs-offset:'+u.id,abilityId:1,tag:'GS_HYPER_ARMOR'});
  let dmg=at(g.damage,u,1)+g.bonus_ad_ratio*bonusAD(u)+at(g.offset_bonus_damage,u,1)+g.offset_bonus_ad_ratio*bonusAD(u);
  // 伤害在下一刻结算，避免在对方伤害结算途中递归。
  s.pendingOffset={target:source,damage:dmg,at:now(),event:o.event,life:source._life||0};
  u.cd[1]=Math.max(Math.min(u.cd[1]||0,g.min_cooldown),(u.cd[1]||0)-g.offset_cd_reduction);s.crossUntil=now()+g.offset_followup_window;o.end=now()+.15;o.swung=true;fx(u,'offset',u,{angle:o.angle,life:.5});env.ring?.(u.x,u.y,60,'#ffcf8a',.3)}
 function tickOffset(u,dt){let s=S(u),o=s.offset;if(s.pendingOffset){let q=s.pendingOffset;s.pendingOffset=null;let t=q.target;if(alive(t)&&(t._life||0)===q.life){if(hit(u,t,q.damage,q.event,'offset',1)&&alive(t)){let a=Math.atan2(t.y-u.y,t.x-u.x),to={x:t.x+Math.cos(a)*P.W.offset_knockback,y:t.y+Math.sin(a)*P.W.offset_knockback};core.startDisplacement(t,core.safePoint?core.safePoint(t,to,t.radius||22):to,{type:'KNOCKBACK',duration:.2,source:u,abilityId:1})}}}
  if(!o)return;if(!o.swung){turn(u,o,dt);if(now()+eps>=o.readyEnd){o.swung=true;let g=P.W;s.swing={start:now(),kind:'W',angle:o.angle,range:g.attack_range,width:g.attack_width,base:at(g.damage,u,1)+g.bonus_ad_ratio*bonusAD(u),hits:[{at:now(),idx:'w'}],end:now()+g.recovery,event:o.event};s.offset=null;return}}
  if(o.success&&now()>=o.end)s.offset=null}

 // ---------- R ----------
 function startR(u,c,e){let s=S(u),g=P.R,cut=0;let ch=s.charging;if(ch&&chargeLevel(ch)>=3||now()-s.lastL3At<.5){cut=g.q_link_charge_cut;s.lastL3At=-99}if(ch){s.charging=null;endCombo(u,'r')}
  let link=now()-s.crossDoneAt<=g.offset_link_window;if(link)s.crossDoneAt=-99;let angle=c?.angle??u.angle??0;u.angle=angle;u.dest=null;
  s.r={start:now(),chargeEnd:now()+g.charge_duration-cut,angle,aim:angle,event:e,qLink:cut>0,offsetLink:link}}
 function tickR(u,dt){let s=S(u),r=s.r;if(!r)return;turn(u,r,dt);if(now()+eps<r.chargeEnd)return;s.r=null;let g=P.R,base=(at(g.damage,u,3)+g.bonus_ad_ratio*bonusAD(u))*(1+g.full_charge_bonus)*(r.offsetLink?1+g.offset_link_bonus:1);
  s.swing={start:now(),kind:'R',angle:r.angle,range:g.attack_range,width:g.attack_width,base,hits:[{at:now()+g.impact,idx:'r'}],end:now()+g.impact+g.recovery,event:r.event};fx(u,'r-drop',u,{angle:r.angle,life:.6})}

 // ---------- 格挡 / 弱点 ----------
 function guardStart(u){let s=S(u);if(!alive(u)||s.swing||s.tackle||s.offset||s.r||s.guard||core.hardLocked?.(u))return false;if((u.mp||0)<P.GUARD.mana_per_hit)return false;if(s.charging){let st=s.charging.stage;s.charging=null;s.combo={next:st,until:now()+1}}s.guard={start:now(),perfectUsed:false};u.dest=null;return true}
 function guardEnd(u){S(u).guard=null}
 function focusToggle(u){let s=S(u);s.focusOn=!s.focusOn;return s.focusOn}
 function focusStrike(u){let s=S(u),g=P.FOCUS;if(!alive(u)||!s.focusOn||busy(u)||s.charging||now()<s.strikeReadyAt||(u.mp||0)<g.strike_mana||core.hardLocked?.(u)||u.silence>0||(u.skillRanks?.[0]||0)<1)return false;u.mp-=g.strike_mana;s.strikeReadyAt=now()+g.strike_cooldown;
  s.swing={start:now(),kind:'FOCUS',angle:u.angle||0,range:g.strike_range,width:g.strike_width,base:at(g.strike_damage,u,0)+g.strike_bonus_ad_ratio*bonusAD(u),hits:[{at:now()+g.strike_impact,idx:'focus'}],end:now()+g.strike_impact+g.strike_recovery,event:event(u,'focus')};return true}
 function weakPoints(u,t){let face=t.angle||0,from=Math.atan2(u.y-t.y,u.x-t.x),rel=Math.abs(wrap(from-face));return rel<Math.PI/4?'头部/正面':rel>Math.PI*3/4?'背部':'侧面'}

 m.registerBehavior(ID,(u,c,skill,e)=>{if(c.i===1)startOffset(u,c,e);else if(c.i===2)startTackle(u,c,e);else if(c.i===3)startR(u,c,e)},{attackTiming:{windup:.3,recovery:.3}});

 m.heroHooks[ID]={
  isMelee:()=>true,
  recast(u,i,point){if(i!==0)return undefined;return qRelease(u,point)},
  cooldown(u,i,v){return i===0?0:v},
  validate(u,i){let s=S(u);if(i===0)return true;if(s.r||s.offset||s.guard)return false;
   if(i===2){if(s.tackle)return false;if(s.swing&&s.swing.hits.some(h=>!h.done))return false;if(s.swing){s.swing=null}return true}
   if(s.tackle||s.swing&&s.swing.hits.some(h=>!h.done))return false;if(s.swing)s.swing=null;return true},
  tick(u,dt){let s=S(u);if(!alive(u))return;tickCharge(u,dt);tickTackle(u);tickOffset(u,dt);tickR(u,dt);tickSwing(u);
   if(s.combo&&!s.charging&&!s.swing&&!s.tackle&&now()>s.combo.until+eps&&now()>s.followUntil)endCombo(u,'timeout');
   if(s.comboActive&&!s.combo&&!s.charging&&!s.swing&&!s.tackle&&now()>=s.crossUntil&&now()>=s.quickUntil&&now()>=s.followUntil)endCombo(u,'idle');
   if(s.guard&&(core.hardLocked?.(u)||(u.mp||0)<P.GUARD.mana_per_hit&&s.guard.drained))s.guard=null;
   if(s.visuals.length)s.visuals=s.visuals.filter(v=>v.until>now())},
  canMove(u){let s=S(u);return !(s.charging||s.swing||s.tackle||s.offset||s.r||s.guard)},
  beforeAttack(u){let s=S(u);return !(s.charging||s.swing||s.tackle||s.offset||s.r||s.guard)},
  derive(u){if(S(u).speedUntil>now())u.speed*=1+P.E.precision_speed},
  reduceDamage(t,value,source,type,meta={}){let s=S(t);if(!legalAttack(t,source,meta,type))return s.tackle&&type!=='true'?value*(1-P.E.damage_reduction):s.guard&&type!=='true'?value*(1-(type==='magic'?P.GUARD.magic_reduction:P.GUARD.physical_reduction)):value;
   if(offsetActive(t,source)){offsetSuccess(t,source);return 0}
   if(s.guard){let g=P.GUARD;if(!s.guard.perfectUsed&&champ(source)&&now()-s.guard.start<=g.precision_window+eps){s.guard.perfectUsed=true;s.discount=Math.max(s.discount,g.precision_charge_cut);s.quickUntil=now()+g.quick_counter_window;core.apply(t,'CC_IMMUNITY',g.perfect_cc_shield,t,{uniqueKey:'gs-perfect:'+t.id,tag:'GS_PERFECT_GUARD'});fx(t,'perfect',t,{life:.4});return 0}
    if(t.mp>=g.mana_per_hit)t.mp-=g.mana_per_hit;else s.guard.drained=true;if((t.mp||0)<g.mana_per_hit)s.guard.drained=true;if(type==='true')return value;return value*(1-(type==='magic'?g.magic_reduction:g.physical_reduction))}
   if(s.tackle){let k=s.tackle;if(!k.precise&&now()-k.start<=P.E.precision_window+eps&&(champ(source)||large(source)||epic(source))){k.precise=true;s.discount=Math.max(s.discount,P.E.precision_charge_cut);if(k.resume)k.resume.discount=Math.max(k.resume.discount||0,P.E.precision_charge_cut);s.speedUntil=now()+P.E.precision_speed_duration;m.recalc?.(t);fx(t,'precise',t,{life:.4})}
    return type==='true'?value:value*(1-P.E.damage_reduction)}
   return value},
  interrupt(u,reason){let s=S(u);if(s.tackle)return;let q1=s.charging?.stage===1||s.swing?.kind==='Q'&&s.swing.stage===1&&s.swing.hits.some(h=>!h.done);
   if(s.charging){s.charging=null}if(s.swing&&s.swing.hits.some(h=>!h.done))s.swing=null;s.offset=null;s.r=null;s.guard=null;s.bufferQ=null;
   if(s.comboActive||s.combo)endCombo(u,q1?'q1-interrupt':'interrupt')},
  reset(u){let s=u.greatswordState;if(s?.comboActive||s?.combo)setQCooldown(u,qCooldown(u));u.greatswordState=null}
 };

 // ---------- 绘制（敌我双方可见的命中区域与蓄力状态） ----------
 const levelColor=['#c9d3dc','#f4f8ff','#ffd15a','#fff1c0'];
 function rect(ctx,x,y,angle,range,width,fill,stroke,lw=2){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.rect(-15,-width/2,range+15,width);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}ctx.restore()}
 function sector(ctx,x,y,angle,radius,deg,fill,stroke,lw=3){let h=deg*Math.PI/360;ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,radius,angle-h,angle+h);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
 function draw(ctx,viewer){let t=now();for(let u of units())if(u.hero===ID&&alive(u)){let s=S(u),seen=!viewer||u.team===viewer.team||env.visibleTo?.(viewer,u)!==false;if(!seen)continue;
   let c=s.charging;if(c){let l=chargeLevel(c),ov=overcharged(c),g=P['Q'+c.stage],tt=times(c),e=elapsed(c),k=Math.min(1,e/tt[2]);
    rect(ctx,u.x,u.y,c.angle,g.attack_range,g.attack_width,ov?'#ff5d4a18':'#ffd15a14',ov?'#ff7a6a99':levelColor[l]+'aa',2);
    ctx.beginPath();ctx.arc(u.x,u.y,58,-Math.PI/2,-Math.PI/2+k*Math.PI*2);ctx.strokeStyle=ov?(Math.sin(t*30)>0?'#ff5d4a':'#7a2a22'):levelColor[l];ctx.lineWidth=6;ctx.stroke();
    for(let i=0;i<3;i++){let a=-Math.PI/2+tt[i]/tt[2]*Math.PI*2;ctx.beginPath();ctx.arc(u.x+Math.cos(a)*58,u.y+Math.sin(a)*58,4,0,Math.PI*2);ctx.fillStyle=l>i?levelColor[i+1]:'#33414b';ctx.fill()}
    ctx.save();ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillStyle=ov?'#ff8a7a':levelColor[l];ctx.fillText((c.paused?'⏸ ':'')+(ov?'过蓄':['蓄力','一级','二级','三级'][l])+' Q'+c.stage,u.x,u.y-78);ctx.restore()}
   if(s.r){let r=s.r,k=Math.min(1,(t-r.start)/Math.max(.01,r.chargeEnd-r.start));rect(ctx,u.x,u.y,r.angle,P.R.attack_range,P.R.attack_width,'#ffe08a18','#ffe08acc',3);ctx.save();ctx.translate(u.x,u.y);ctx.rotate(r.angle);ctx.fillStyle='#fff1c044';ctx.fillRect(0,-P.R.attack_width/2,P.R.attack_range*k,P.R.attack_width);ctx.restore()}
   if(s.offset&&!s.offset.swung){let o=s.offset,live=t>=o.windowStart;sector(ctx,u.x,u.y,o.angle,140,P.W.offset_arc_deg,live?'#ffb34733':'#ffb34714',live?'#ffcf8a':'#ffcf8a66',live?4:2)}
   if(s.guard){let ok=t-s.guard.start<=P.GUARD.precision_window;sector(ctx,u.x,u.y,u.angle||0,90,140,ok?'#fff6d855':'#9fc6e033',ok?'#fff6d8':'#9fc6e0',ok?5:3)}
   if(s.focusOn&&u===viewer){for(let v of m.nearby(u,700,x=>champ(x)&&x.team!==u.team&&alive(x))){if(env.visibleTo?.(viewer,v)===false)continue;let face=v.angle||0;ctx.save();ctx.translate(v.x,v.y);for(let [a,col] of [[0,'#ff6b6b'],[Math.PI,'#7bd88f'],[Math.PI/2,'#ffd15a'],[-Math.PI/2,'#ffd15a']]){ctx.beginPath();ctx.arc(0,0,(v.radius||22)+12,face+a-.5,face+a+.5);ctx.strokeStyle=col;ctx.lineWidth=4;ctx.stroke()}ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(weakPoints(u,v),0,-(v.radius||22)-20);ctx.restore()}}
   for(let v of s.visuals){let k=(t-v.started)/Math.max(.01,v.until-v.started);ctx.save();ctx.globalAlpha=Math.max(0,1-k);
    if(v.kind==='slash'){let col=v.kind==='R'?'#fff1c0':v.power?'#ffe08a':v.level>=3?'#fff1c0':v.level===2?'#ffd15a':'#f4f8ff';rect(ctx,v.x,v.y,v.angle,v.range,v.width,col+'44',col,4)}
    else if(v.kind==='r-drop'){rect(ctx,v.x,v.y,v.angle,P.R.attack_range*(.4+.6*k),P.R.attack_width,'#fff1c055','#ffe08a',6)}
    else if(v.kind==='offset'){ctx.translate(v.x,v.y);ctx.strokeStyle='#ffcf8a';ctx.lineWidth=5;for(let i=0;i<8;i++){let a=v.angle+i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*25,Math.sin(a)*25);ctx.lineTo(Math.cos(a)*(50+60*k),Math.sin(a)*(50+60*k));ctx.stroke()}}
    else if(v.kind==='perfect'||v.kind==='precise'){ctx.beginPath();ctx.arc(v.x,v.y,40+50*k,0,Math.PI*2);ctx.strokeStyle=v.kind==='perfect'?'#fff6d8':'#ffd15a';ctx.lineWidth=6;ctx.stroke()}
    else if(v.kind==='tackle'){sector(ctx,v.x,v.y,v.angle,P.E.hit_radius,P.E.hit_arc_deg,'#ffd15a22','#ffd15a88',2)}
    ctx.restore()}}}
 function aim(ctx,u,i,point){let a=Math.atan2(point.y-u.y,point.x-u.x),s=S(u);if(i===0){let st=s.combo?.next||1,g=P['Q'+st];rect(ctx,u.x,u.y,a,g.attack_range,g.attack_width,'#ffd15a22','#ffd15a',2);return true}
  if(i===1){sector(ctx,u.x,u.y,a,140,P.W.offset_arc_deg,'#ffb34722','#ffcf8a',2);rect(ctx,u.x,u.y,a,P.W.attack_range,P.W.attack_width,null,'#ffcf8a88',2);return true}
  if(i===2){sector(ctx,u.x+Math.cos(a)*P.E.dash_distance,u.y+Math.sin(a)*P.E.dash_distance,a,P.E.hit_radius,P.E.hit_arc_deg,'#ffd15a22','#ffd15a',2);return true}
  if(i===3){rect(ctx,u.x,u.y,a,P.R.attack_range,P.R.attack_width,'#ffe08a22','#ffe08a',2);return true}return false}
 function qIcon(u){let s=S(u);if(now()<s.crossUntil)return '十';let st=s.charging?.stage||s.combo?.next||1;return ['斩','强','真'][st-1]}

 // ---------- 人机 ----------
 function bot(u,t){let s=S(u);if(!t)return busy(u)||!!s.charging;let d=dist(u,t),ready=i=>u.skillRanks[i]&&m.abilityCooldownRemaining(u,i)<=0&&(u.mp??999)>=(i===1?P.W.mana:i===2?P.E.mana:P.R.mana);steer(u,t);
  if(s.charging){let want=s.botLevel||1,tt=times(s.charging);if(d>P['Q'+s.charging.stage].attack_range+150){qRelease(u,t);return true}if(elapsed(s.charging)>=tt[want-1]){qRelease(u,t);return true}return true}
  if(s.swing||s.tackle||s.offset||s.r||s.guard)return true;
  if(champ(t)&&ready(3)&&d<=P.R.attack_range*.8&&t.hp/t.maxHp<.6)return m.requestCast(u,3,{x:t.x,y:t.y,target:t});
  if(champ(t)&&ready(1)&&d<=220&&now()-(u.lastHit||-9)<.8&&Math.random()<.5)return m.requestCast(u,1,{x:t.x,y:t.y,target:t});
  if(now()<s.crossUntil){u.angle=Math.atan2(t.y-u.y,t.x-u.x);return qPress(u)}
  let stage=s.combo?.next||1;if(d<=P['Q'+stage].attack_range*.9&&(s.combo||m.abilityCooldownRemaining(u,0)<=0&&u.skillRanks[0])){s.botLevel=d<150?2:1+Math.floor(Math.random()*3);u.angle=Math.atan2(t.y-u.y,t.x-u.x);return qPress(u)}
  if(ready(2)&&s.combo&&d<=P['Q'+stage].attack_range+60)return m.requestCast(u,2,{x:t.x,y:t.y,target:t});return false}

 // ---------- 额外输入（G 格挡 / V 弱点锁定 / T 弱点突刺，及触屏按钮） ----------
 const player=()=>units().find(u=>u.player&&u.hero===ID),playing=()=>(env.state?.()??'playing')==='playing';
 if(typeof document!=='undefined'&&!window.__gsInput){window.__gsInput=true;
  const typing=e=>/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||'');
  document.addEventListener('keydown',e=>{let u=player();if(!u||!playing()||typing(e)||e.repeat)return;let k=e.key.toLowerCase();if(k==='g')guardStart(u);else if(k==='v'){let on=focusToggle(u);env.toast?.(on?'弱点锁定：开':'弱点锁定：关')}else if(k==='t'&&!focusStrike(u))env.toast?.(S(u).focusOn?'弱点突刺未就绪':'先按 V 开启弱点锁定')});
  document.addEventListener('keyup',e=>{let u=player();if(u&&e.key.toLowerCase()==='g')guardEnd(u)});}
 function ensureButtons(){if(typeof document==='undefined')return;let u=player(),box=document.getElementById('gsExtra');if(!u){box?.remove();return}if(box)return;let host=document.getElementById('abilityControls');if(!host)return;box=document.createElement('div');box.id='gsExtra';box.style.cssText='position:absolute;left:-74px;bottom:6px;display:flex;flex-direction:column;gap:8px;pointer-events:auto;z-index:7';
  for(let [id,label] of [['gsGuard','格挡'],['gsFocus','锁定'],['gsStrike','突刺']]){let b=document.createElement('button');b.id=id;b.textContent=label;b.style.cssText='width:58px;height:58px;border-radius:50%;border:2px solid #d8b25a99;background:#14232dd9;color:#f4e6c0;font:bold 14px sans-serif;touch-action:none';box.appendChild(b)}
  host.appendChild(box);let g=box.querySelector('#gsGuard');g.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();let p=player();if(p&&playing())guardStart(p)});for(let ev of ['pointerup','pointercancel','pointerleave'])g.addEventListener(ev,()=>{let p=player();if(p)guardEnd(p)});
  box.querySelector('#gsFocus').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();let p=player();if(p){let on=focusToggle(p);e.currentTarget.style.borderColor=on?'#ff6b6b':'#d8b25a99'}});
  box.querySelector('#gsStrike').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();let p=player();if(p&&playing()&&!focusStrike(p))env.toast?.(S(p).focusOn?'弱点突刺未就绪':'先开启弱点锁定')})}

 m.greatsword={now,state:S,params:P,beginCharge:qPress,qPress,qRelease,cancelCharge:u=>{let s=S(u);if(s.charging&&!s.charging.released){}},steer,draw:(ctx,viewer)=>{ensureButtons();draw(ctx,viewer)},aim,bot,qIcon,guardStart,guardEnd,focusToggle,focusStrike,chargeLevel,chargeMultiplier,elapsed,times,overcharged,zone,rectHits,endCombo,busy};
};
})();
