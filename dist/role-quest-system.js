/* 五大分路专属任务系统（RoleQuestManager）
 * - 只在召唤师峡谷 5v5 生效；数值全部来自 role-quest-config.js。
 * - 任务状态保存在英雄单位的 u.roleQuest 上，随对局存档（断线重连/读档后恢复），死亡/回城/换线都不会重置。
 * - 本地对局里游戏逻辑本身就是权威端：所有积分只在模拟步（updateStep）和战斗事件里结算，UI 只读取状态。
 * 模块：TopQuest / JungleQuest / MidQuest / BotQuest / SupportQuest（任务定义），
 *       QuestProgressManager（被动积分、事件积分、去重），QuestRewardManager（一次性发放与持续效果），QuestUIManager（状态栏图标与详情）。 */
(()=>{'use strict';
const CFG=()=>window.ROLE_QUEST_CONFIG,GC=()=>window.GAME_CONFIG,H=()=>window.RoleQuestHost;
const alive=u=>u&&u.hp>0&&!(u.death>0),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const now=()=>H()?.time??0;
function segDist(p,a,b){let dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)}
function pathDist(p,path){let best=Infinity;for(let i=1;i<path.length;i++)best=Math.min(best,segDist(p,path[i-1],path[i]));return best}
function enabled(){let h=H();return !!h&&h.isSR()}
function isMelee(u){return (u.range??u.stats?.range??500)<=CFG().meleeRange}
function monsterClass(t){if(t.epic)return 'epic';return CFG().largeMonsters.includes(t.monsterId)?'large':'small'}

/* ---------- 任务定义（每个分路一个模块，统一接口） ---------- */
function makeQuest(role){const def=()=>CFG().quests[role];return{
 role,
 Initialize(u){u.roleQuest={role,points:0,done:false,rewarded:false,store:0,laneTime:0,pauseUntil:0,lastActive:-99,log:{},completedAt:null,choice:null};return u.roleQuest},
 AddProgress(u,amount,reason){let q=u.roleQuest;if(!q||q.done||!(amount>0)||!Number.isFinite(amount))return 0;if(now()<CFG().startTime)return 0;q.points=Math.min(def().goal,q.points+amount);q.log[reason]=(q.log[reason]||0)+amount;this.CheckCompletion(u);return amount},
 CalculateProgress(u){let q=u.roleQuest;return q?Math.min(1,q.points/def().goal):0},
 CheckCompletion(u){let q=u.roleQuest;if(q&&!q.done&&q.points>=def().goal-1e-6){q.done=true;q.completedAt=now();this.ApplyRewards(u);return true}return false},
 ApplyRewards(u){QuestRewardManager.grant(u,role)},
 GetQuestStatus(u){let q=u.roleQuest,d=def();if(!q)return null;return{role,id:d.id,name:d.name,icon:d.icon,unit:d.unit||'积分',points:q.points,goal:d.goal,pct:Math.min(100,q.points/d.goal*100),remaining:Math.max(0,d.goal-q.points),done:q.done,completedAt:q.completedAt,preview:d.preview,choice:q.choice,store:q.store,log:{...q.log}}},
 ResetQuest(u){delete u.roleQuest;return this.Initialize(u)}}}
const TopQuest=makeQuest('top'),JungleQuest=makeQuest('jungle'),MidQuest=makeQuest('mid'),BotQuest=makeQuest('adc'),SupportQuest=makeQuest('support');
const QUESTS={top:TopQuest,jungle:JungleQuest,mid:MidQuest,adc:BotQuest,support:SupportQuest};
const questOf=u=>u?.type==='hero'&&u.role&&QUESTS[u.role]&&u.roleQuest?QUESTS[u.role]:null;
const add=(u,amount,reason)=>questOf(u)?.AddProgress(u,amount,reason)||0;

/* ---------- 积分：被动 + 事件（含去重） ---------- */
const QuestProgressManager={
 seen:new Set(),core:null,dmgWindow:new Map(),ccSeen:new Map(),
 inLane(u,role){let c=CFG(),g=GC(),lane=c.roleLane[role];if(lane==null)return false;let base=g.map.bases[u.team];if(base&&dist(u,base)<c.passive.baseExclude)return false;let path=g.map.paths[lane];return !!path&&pathDist(u,path)<=c.passive.laneRadius},
 tickPassive(u,dt){let q=u.roleQuest,c=CFG(),t=now();if(q.done||t<c.startTime||!alive(u))return;let role=u.role;
  if(role==='jungle')return; // 打野只按野区成长层数计算
  if(role==='support'){let s=c.quests.support;if(this.inLane(u,'support')&&H().units.some(v=>v!==u&&v.type==='hero'&&v.team===u.team&&alive(v)&&dist(v,u)<=s.assistAreaRadius)&&t>=q.pauseUntil)add(u,s.points.assistArea*dt,'assistArea');return}
  let lane=this.inLane(u,role);
  if(lane&&u.level>=c.roam.minLevel){q.laneTime+=dt;q.store=Math.min(c.roam.max,q.store+dt*c.roam.storeSeconds/c.roam.fillSeconds)}
  if(t<q.pauseUntil||t-q.lastActive>c.passive.activeWindow)return;
  let rate=c.passive.other;if(lane)rate=c.passive.lane;else if(q.store>0){q.store=Math.max(0,q.store-dt);rate=c.passive.lane}
  add(u,rate*dt,lane?'lane':'roam')},
 once(key){if(this.seen.has(key))return false;this.seen.add(key);if(this.seen.size>20000)this.seen=new Set([...this.seen].slice(-10000));return true},
 attach(core){if(!core||this.core===core)return;this.core=core;this.seen=new Set();
  const unit=id=>H().units.find(v=>v.id===id);
  core.on('DamageApplied',e=>{if(!enabled()||!(e.amount>0))return;let s=unit(e.sourceId),t=unit(e.targetId);if(!s||!t||s.type!=='hero'||s.team===t.team||t.team>1&&t.type!=='monster')return;if(t.trainingDummy||t.invulnerable>0)return;
   if(s.roleQuest)s.roleQuest.lastActive=now();if(t.type==='hero'&&t.roleQuest)t.roleQuest.lastCombat=now();if(s.roleQuest)s.roleQuest.lastCombat=now();
   if(s.role==='mid'&&t.type==='hero'&&s.roleQuest&&!s.roleQuest.done){let m=CFG().quests.mid.points,cap=CFG().damagePointCapPerSecond,sec=Math.floor(now()),w=this.dmgWindow.get(s.id);if(!w||w.sec!==sec){w={sec,pts:0};this.dmgWindow.set(s.id,w)}let pts=Math.min(cap-w.pts,Math.min(e.amount,t.maxHp||e.amount)*(isMelee(s)?m.damageMelee:m.damageRanged));if(pts>0){w.pts+=pts;add(s,pts,'damage')}}});
  core.on('UnitKilled',e=>{if(!enabled())return;let s=unit(e.sourceId),t=unit(e.targetId);if(!t||!this.once('kill:'+t.id+':'+(t._life||0)+':'+Math.round(now()*10)))return;QuestProgressManager.onKill(s,t)});
  core.on('ChampionTakedown',e=>{if(!enabled())return;let s=unit(e.sourceId),t=unit(e.targetId);if(!s||!t||s.team===t.team||!this.once('td:'+e.killId+':'+s.id))return;QuestProgressManager.onTakedown(s,t,e.kind)});
  core.on('HealingApplied',e=>{if(!enabled())return;let s=unit(e.sourceId),t=unit(e.targetId);if(s?.role!=='support'||!t||t===s||t.type!=='hero'||t.team!==s.team)return;QuestProgressManager.healShield(s,e.amount)});
  core.on('ShieldApplied',e=>{if(!enabled())return;let s=unit(e.sourceId),t=unit(e.targetId);if(s?.role!=='support'||!t||t.type!=='hero'||t.team!==s.team)return;QuestProgressManager.healShield(s,e.amount)});
  core.on('StatusApplied',e=>{if(!enabled()||!CFG().ccStatuses.includes(e.status))return;let s=unit(e.sourceId),t=unit(e.targetId);if(s?.role!=='support'||t?.type!=='hero'||t.team===s.team||!alive(t))return;let key=s.id+':'+t.id,last=this.ccSeen.get(key)??-99;if(now()-last<CFG().ccCooldownPerTarget)return;this.ccSeen.set(key,now());s.roleQuest.lastActive=now();add(s,CFG().quests.support.points.cc,'cc')});
  core.on('SummonerTeleportCompleted',e=>{let u=unit(e.sourceId);if(u?.roleQuest?.done&&u.role==='top')QuestRewardManager.teleportShield(u)})},
 healShield(s,amount){let q=s.roleQuest;if(!q||q.done||!(amount>0))return;q.lastActive=now();q.healBank=(q.healBank||0)+amount;let per=CFG().quests.support.points.healShieldPer100;while(q.healBank>=100){q.healBank-=100;add(s,per,'healShield')}},
 onKill(s,t){let c=CFG(),q=c.quests,heroes=H().units.filter(v=>v.type==='hero'&&v.roleQuest);
  if(t.type==='minion'&&s?.type==='hero'&&s.team!==t.team){if(s.roleQuest)s.roleQuest.lastActive=now();let role=s.role,lane=c.roleLane[role];if(['top','mid','adc'].includes(role)&&t.lane===lane)add(s,q[role].points.laneMinion,'minion');if(role==='adc'&&s.roleQuest?.done)s.gold+=q.adc.rewards.minionGold}
  if(t.type==='monster'){let cls=monsterClass(t);
   if(s?.type==='hero'){if(s.roleQuest)s.roleQuest.lastActive=now();if(s.role==='jungle'){let enemyHalf=t.campId&&GC().map.bases?dist(t,GC().map.bases[1-s.team])<dist(t,GC().map.bases[s.team]):false,contest=c.contestMonsters.includes(t.monsterId)||cls==='large'&&enemyHalf;add(s,contest?q.jungle.points.contest:q.jungle.points[cls],contest?'contest':cls)}
    if(s.role==='jungle'&&s.roleQuest?.done&&cls!=='small'){s.gold+=q.jungle.rewards.largeGold;H().gainXp(s,q.jungle.rewards.largeXp)}}
   if(cls==='epic'){let team=s?.team;if(team==null||team>1)return;for(let h of heroes.filter(v=>v.team===team&&alive(v)&&dist(v,t)<=c.shareRadius)){let pts=h.role==='jungle'?0:q[h.role]?.points.epic||0;if(pts)add(h,pts,'epic');if(h.role==='support'&&h.roleQuest.done){h.gold+=q.support.rewards.epicGold;H().gainXp(h,q.support.rewards.epicXp)}}}}
  if(t.type==='tower'){for(let h of heroes.filter(v=>v.team!==t.team&&alive(v)&&dist(v,t)<=c.shareRadius)){let p=q[h.role]?.points;if(!p)continue;if(p.tower)add(h,p.tower,'tower');else if(p.towerAssist)add(h,p.towerAssist,'tower')}}},
 onPlate(t){if(!enabled())return;let c=CFG();for(let h of H().units.filter(v=>v.type==='hero'&&v.roleQuest&&v.team!==t.team&&alive(v)&&dist(v,t)<=(GC().rewardRadius||c.shareRadius))){let p=c.quests[h.role]?.points;if(p?.plate)add(h,p.plate,'plate')}},
 onTakedown(s,t,kind){if(t.type!=='hero')return;let q=CFG().quests,role=s.role;if(!s.roleQuest)return;s.roleQuest.lastActive=now();
  if(role==='jungle')add(s,q.jungle.points.takedown,'takedown');else if(role==='support')add(s,kind==='kill'?q.support.points.kill:q.support.points.assist,kind);else if(kind==='kill'&&q[role]?.points.kill)add(s,q[role].points.kill,'kill');
  if(s.roleQuest.done){if(role==='top'&&kind==='kill')H().gainXp(s,q.top.rewards.killXp/((s.questXpMult||1)));if(role==='adc'&&kind==='kill')s.gold+=q.adc.rewards.killGold;if(role==='support'&&kind==='assist')s.gold+=q.support.rewards.assistGold}}
};

/* ---------- 奖励：一次性发放 + 持续效果 ---------- */
const QuestRewardManager={
 grant(u,role){let q=u.roleQuest;if(!q||q.rewarded)return false;q.rewarded=true;let r=CFG().quests[role].rewards,h=H();
  if(role==='top'){u.maxLevel=r.maxLevel;u.questXpMult=1+r.xpMult;h.gainXp(u,r.xp/u.questXpMult);if(u.summoners?.includes('teleport'))u.questTeleportEmpowered=true;else{u.summoners=[...(u.summoners||[]),'teleport'];u.questTeleportGranted=true;u.questTeleportEmpowered=true}}
  if(role==='jungle'){u.questSmite={monster:r.smiteMonsterMult,epic:r.smiteEpicMult,recharge:r.smiteRechargeMult};if(u.summoners?.includes('smite')){let s=u.summonerState?.smite;if(s&&s.ecology<20){s.ecology=20;h.m?.core.emit('SummonerSmiteEvolved',u,u,{ecology:20})}}}
  if(role==='mid'){u.midQuestCompleted=true;u.questBonusAdPct=r.bonusAdPct;u.questBonusApPct=r.bonusApPct;this.upgradeBoots(u)}
  if(role==='adc'){u.gold+=r.gold;u.questBootSlot=true;u.questExtraSlots=(u.questExtraSlots||0)+r.extraSlots}
  if(role==='support'){u.questExtraSlots=(u.questExtraSlots||0)+r.extraSlots;u.questSupportGoldAt=now();if(!u.player)this.choose(u,['hp','haste','speed','heal'][u.id%4])}
  h.recalc(u);UI.completed(u);return true},
 choose(u,key){let q=u.roleQuest,ch=CFG().quests.support.rewards.choices[key];if(u.role!=='support'||!q?.done||q.choice||!ch)return false;q.choice=key;u.questHealShieldBonus=ch.healShield||0;H().recalc(u);return true},
 upgradeBoots(u){let I=window.ItemSystem;if(!I||!u.items)return false;let changed=false;u.items=u.items.map(id=>{let it=I.get(id);if(it?.boots&&it.tier==='BOOTS_T2'){let t3=GC().items.find(v=>v.tier==='BOOTS_T3'&&(v.components||v.recipe||[]).includes(id));if(t3){changed=true;return t3.id}}return id});if(changed){H().recalc(u);if(u.player)H().toast('中路任务奖励：鞋子已免费升级为三级鞋')}return changed},
 teleportShield(u){let r=CFG().quests.top.rewards;if(!u.questTeleportEmpowered)return;H().m?.shield(u,u.maxHp*r.teleportShieldPct,r.teleportShieldDuration,u,{questTeleport:true})},
 tickOngoing(u,dt){let q=u.roleQuest;if(!q?.done)return;let c=CFG().quests,t=now();
  if(u.role==='support'){let r=c.support.rewards;if(alive(u)||u.death>0){u.gold+=r.goldPerMinute/60*dt}}
  if(u.role==='mid'&&u.items?.some(id=>window.ItemSystem?.get(id)?.tier==='BOOTS_T2'))this.upgradeBoots(u);
  if(u.role==='jungle'&&alive(u)){let r=c.jungle.rewards,core=H().m?.core,ms=0;if(H().inJungle?.(u))ms+=r.jungleMs;if(t-(q.lastCombat??-99)>=r.outOfCombatDelay)ms+=r.outOfCombatMs;if(ms>0&&core)core.apply(u,'MOVE_SPEED_BUFF',.25,u,{amount:ms,tenacity:false,refresh:true,uniqueKey:'role-quest-jungle'})}},
 // 属性加成：在 recalc 的派生属性上叠加（不改基础数据，可与装备/符文正确叠加）
 applyStats(u,s,baseOf){let q=u.roleQuest;if(!q?.done)return;
  if(u.role==='mid'){let b=baseOf?.();let bonusAd=Math.max(0,s.attack-(b?.attack??s.attack)),bonusAp=Math.max(0,s.ap-(b?.ap??0));s.attack+=bonusAd*(u.questBonusAdPct||0);s.ap+=bonusAp*(u.questBonusApPct||0)}
  if(u.role==='support'&&q.choice){let ch=CFG().quests.support.rewards.choices[q.choice];if(ch.hpPct)s.hp*=1+ch.hpPct;if(ch.haste)s.haste=(s.haste||0)+ch.haste;if(ch.msPct)s.speed*=1+ch.msPct}}
};

/* ---------- UI：状态栏上方图标 + 点击查看详情 ---------- */
const UI={el:null,panel:null,open:false,sig:'',flash:0,
 ensure(){if(typeof document==='undefined'||!document.body)return false;if(this.el)return true;let hud=document.getElementById('hud');if(!hud)return false;
  if(!document.getElementById('rqStyle')){let st=document.createElement('style');st.id='rqStyle';st.textContent=`#rqIcon{position:absolute;left:8px;top:-50px;width:42px;height:42px;border-radius:50%;border:1px solid #c9aa5e88;background:radial-gradient(circle at 50% 40%,#22324a,#0b121c);color:#f1d690;font:20px/40px "Microsoft YaHei",sans-serif;text-align:center;cursor:pointer;padding:0;z-index:31;box-shadow:0 2px 8px #0008}#rqIcon svg{position:absolute;inset:-3px;width:48px;height:48px;pointer-events:none}#rqIcon .rq-pct{position:absolute;right:-6px;bottom:-4px;font:bold 10px/14px Arial;background:#0b121c;border:1px solid #c9aa5e88;border-radius:7px;padding:0 3px;color:#f1d690}#rqIcon.done{border-color:#7fe08a;color:#9ff0a8;animation:rqGlow 2s infinite}#rqIcon.burst{animation:rqBurst .9s 3}@keyframes rqGlow{50%{box-shadow:0 0 14px #7fe08aaa}}@keyframes rqBurst{0%{transform:scale(1)}40%{transform:scale(1.35);box-shadow:0 0 26px #ffe08a}100%{transform:scale(1)}}#rqPanel{position:absolute;left:0;bottom:calc(100% + 58px);width:260px;background:rgba(10,14,22,.94);border:1px solid #c9aa5e77;border-radius:8px;padding:10px 12px;color:#e8e2cf;font:12px/1.55 "Microsoft YaHei",sans-serif;z-index:45;box-shadow:0 6px 20px #000a}#rqPanel.hidden{display:none}#rqPanel h4{margin:0 0 4px;color:#f1d690;font-size:13px}#rqPanel .bar{height:6px;background:#ffffff14;border-radius:3px;overflow:hidden;margin:4px 0}#rqPanel .bar i{display:block;height:100%;background:linear-gradient(90deg,#c9aa5e,#f6df9a)}#rqPanel ul{margin:4px 0 0;padding-left:16px}#rqPanel .ok{color:#7fe08a}#rqPanel .dim{color:#9aa4b2}#rqPanel button.rq-choice{display:block;width:100%;margin-top:4px;padding:4px;background:#1b2636;border:1px solid #c9aa5e66;color:#f1d690;border-radius:4px;cursor:pointer}#rqBanner{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:60;padding:14px 26px;border:1px solid #f1d690;border-radius:10px;background:linear-gradient(180deg,#1d2a3fee,#0b121cee);color:#f6df9a;font:bold 20px "Microsoft YaHei",sans-serif;text-align:center;pointer-events:none;animation:rqBanner 3.2s forwards}#rqBanner small{display:block;font:12px "Microsoft YaHei",sans-serif;color:#e8e2cf;margin-top:4px}@keyframes rqBanner{0%{opacity:0;transform:translate(-50%,10px) scale(.9)}12%{opacity:1;transform:translate(-50%,0) scale(1.04)}20%{transform:translate(-50%,0) scale(1)}85%{opacity:1}100%{opacity:0}}`;document.head.appendChild(st)}
  if(getComputedStyle(hud).position==='static')hud.style.position='relative';
  let b=document.createElement('button');b.id='rqIcon';b.type='button';b.setAttribute('aria-label','分路任务');b.onclick=e=>{e.stopPropagation();this.open=!this.open;this.sig=''};b.onpointerdown=e=>e.stopPropagation();hud.appendChild(b);this.el=b;
  let p=document.createElement('div');p.id='rqPanel';p.className='hidden';p.onpointerdown=e=>e.stopPropagation();hud.appendChild(p);this.panel=p;return true},
 render(){let h=H(),u=h?.player;let show=enabled()&&u?.roleQuest&&(h.state==='playing'||h.state==='paused');if(!show){if(this.el){this.el.style.display='none';this.panel.classList.add('hidden')}return}if(!this.ensure())return;
  let st=QUESTS[u.role].GetQuestStatus(u),pct=st.pct,R=21,C2=2*Math.PI*R,off=C2*(1-pct/100);this.el.style.display='';this.el.classList.toggle('done',st.done);
  let sig=[Math.floor(st.points),st.done,st.choice,this.open].join('|');if(sig===this.sig)return;this.sig=sig;
  this.el.title=st.name+' '+Math.floor(st.points)+'/'+st.goal;
  this.el.innerHTML=st.icon+'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="'+R+'" fill="none" stroke="#ffffff18" stroke-width="3"/><circle cx="24" cy="24" r="'+R+'" fill="none" stroke="'+(st.done?'#7fe08a':'#f1d690')+'" stroke-width="3" stroke-linecap="round" stroke-dasharray="'+C2.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 24 24)"/></svg><span class="rq-pct">'+(st.done?'✓':Math.floor(pct)+'%')+'</span>';
  this.panel.classList.toggle('hidden',!this.open);if(!this.open)return;
  let fmt=v=>Number.isInteger(v)?v:v.toFixed(0),list=st.preview.map(x=>'<li>'+x+'</li>').join('');
  let html='<h4>'+st.icon+' '+st.id+' QUEST · '+st.name+'</h4>';
  if(!st.done){html+='<div>任务进度：'+fmt(Math.floor(st.points))+' / '+st.goal+' '+st.unit+'</div><div class="bar"><i style="width:'+pct.toFixed(1)+'%"></i></div><div>完成度：'+pct.toFixed(1)+'%</div><div>距离完成：'+fmt(Math.ceil(st.remaining))+' '+st.unit+'</div>'+(u.role!=='jungle'&&u.role!=='support'?'<div class="dim">游走储存：'+Math.floor(st.store)+' 秒</div>':'')+'<div class="dim" style="margin-top:6px">完成奖励</div><ul>'+list+'</ul>'}
  else{html+='<div class="ok">✔ 任务已完成（'+Math.floor(st.completedAt/60)+':'+String(Math.floor(st.completedAt%60)).padStart(2,'0')+'），奖励持续到本局结束</div><ul class="ok">'+list+'</ul>';
   if(u.role==='support'){let chs=CFG().quests.support.rewards.choices;if(!st.choice)html+='<div style="margin-top:6px;color:#f1d690">选择一项属性强化：</div>'+Object.entries(chs).map(([k,v])=>'<button class="rq-choice" data-rq-choice="'+k+'">'+v.label+'</button>').join('');else html+='<div class="ok">已选择：'+chs[st.choice].label+'</div>'}
   if(u.questTeleportGranted)html+='<div class="dim">专属传送：点击任务图标旁的「传」按钮，再点选友方目标</div>'}
  this.panel.innerHTML=html;this.panel.querySelectorAll('[data-rq-choice]').forEach(b=>b.onclick=()=>{QuestRewardManager.choose(u,b.dataset.rqChoice);this.sig=''});
  if(u.questTeleportGranted)this.ensureTeleport(u)},
 ensureTeleport(u){if(document.getElementById('rqTeleport'))return;let b=document.createElement('button');b.id='rqTeleport';b.type='button';b.textContent='传';b.title='分路任务：专属传送';b.style.cssText='position:absolute;left:56px;top:-44px;width:32px;height:32px;border-radius:50%;border:1px solid #7bc9ed;background:#0f2232;color:#bfe9ff;font:bold 14px "Microsoft YaHei";z-index:31;cursor:pointer';b.onpointerdown=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();H().useSummoner(u.summoners.indexOf('teleport'))};document.getElementById('hud').appendChild(b)},
 completed(u){if(!u.player)return;let h=H(),d=CFG().quests[u.role];h.toast?.('分路任务完成「'+d.name+'」！');try{h.beep?.(660,.12);setTimeout(()=>h.beep?.(880,.12),130);setTimeout(()=>h.beep?.(1175,.25),260)}catch(e){}
  if(typeof document==='undefined'||!document.body)return;let old=document.getElementById('rqBanner');old?.remove();let bn=document.createElement('div');bn.id='rqBanner';bn.innerHTML=d.icon+' '+d.id+' QUEST 完成 · '+d.name+'<small>'+d.preview.join(' · ')+'</small>';document.body.appendChild(bn);setTimeout(()=>bn.remove(),3300);this.ensure();this.el?.classList.add('burst');setTimeout(()=>this.el?.classList.remove('burst'),2800);this.open=true;this.sig=''}
};

/* ---------- 管理器 ---------- */
const RoleQuestManager={QUESTS,TopQuest,JungleQuest,MidQuest,BotQuest,SupportQuest,QuestProgressManager,QuestRewardManager,QuestUIManager:UI,
 tick(dt){let h=H();if(!h)return;if(!enabled()){return}QuestProgressManager.attach(h.m?.core);
  for(let u of h.units){if(u.type!=='hero'||!QUESTS[u.role])continue;if(!u.roleQuest)QUESTS[u.role].Initialize(u);
   if(u.questRecallAt!=null){u.roleQuest.pauseUntil=u.questRecallAt+CFG().recallPause;u.questRecallAt=null}
   QuestProgressManager.tickPassive(u,dt);QuestRewardManager.tickOngoing(u,dt)}},
 onPlate:t=>QuestProgressManager.onPlate(t),
 applyStats:(u,s,b)=>QuestRewardManager.applyStats(u,s,b),
 status:u=>questOf(u)?.GetQuestStatus(u)||null,
 choose:(u,k)=>QuestRewardManager.choose(u,k),
 smiteMult(u,t){let s=u?.questSmite;if(!s||t?.type!=='monster')return 1;return t.epic?s.epic:s.monster},
 render:()=>UI.render()};
window.RoleQuestSystem=RoleQuestManager;
if(typeof document!=='undefined'&&typeof setInterval==='function')setInterval(()=>{try{UI.render()}catch(e){}},250);
})();
