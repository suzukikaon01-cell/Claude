#!/usr/bin/env node
// 推荐出装优化器：每次新增/调整装备后运行，重新生成 dist/recommended-builds-v21.js（玩家推荐与 AI 预购共用）。
// 用法：node scripts/optimize-builds.cjs            （全部英雄，4 进程并行）
//       node scripts/optimize-builds.cjs --hero ashe （单个英雄，输出 JSON）
// 评分：13级英雄按固定技能循环（技能就绪即放、穿插普攻）打 12 秒木桩（3000生命/护甲80/魔抗60），
//       score = DPS^a × 有效生命^(1-a)（输出位 a=0.7、战士 0.5、坦克 0.35）。
// 选装：候选为英雄伤害类型的传说装备 + 防御装；每一步选择"单位金币带来的评分提升"最大的装备（前2件限伤害装，坦克除外），共6件；
//       结果不如原出装时保留原出装；英雄专属装备固定在第2件。
'use strict';
const path=require('path'),fs=require('fs'),cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const SIG={genji:'DRAGON_EDGE',anvil:'SEISMIC_GAUNTLET',dva:'DEFENSE_MATRIX',ana:'NANO_RIFLE',cassidy:'PEACEKEEPER',claude:'MULTIMODAL_PRISM',tracer:'CHRONO_PISTOLS'};
const args=process.argv.slice(2),hi=args.indexOf('--hero');
if(hi>=0){optimizeHero(args[hi+1]);return}
const make=require(path.join(ROOT,'test-harness.cjs'));const heroes=Object.keys(make().C.heroes);
let out={},queue=[...heroes],running=0;
function next(){if(!queue.length){if(!running)finish();return}let id=queue.shift();running++;cp.execFile(process.execPath,[__filename,'--hero',id],{maxBuffer:1<<20},(err,stdout)=>{running--;try{let line=stdout.trim().split('\n').filter(l=>l.startsWith('{')).pop();let d=JSON.parse(line);out[id]=d;console.log(id.padEnd(22),String(d.cur).padStart(6),'->',String(d.score).padStart(6),d.build.join(' '))}catch(e){console.error('failed',id,err?.message||e.message)}next()})}
for(let i=0;i<4;i++)next();
function finish(){let table={};for(let id of heroes)if(out[id])table[id]=out[id].build;
 let js="/* V21 推荐出装（玩家商店推荐与 AI 预购共用）。由 scripts/optimize-builds.cjs 生成，新增或调整装备后重新运行即可。\n * 评分 = DPS^a × 有效生命^(1-a)（输出位 0.7 / 战士 0.5 / 坦克 0.35），每一步选「单位金币评分提升」最大的装备；不优于原出装时保留原出装；专属装备固定第2件。 */\nwindow.RECOMMENDED_BUILDS_V21="+JSON.stringify(table)+";\n(function(){const I=window.ItemSystem;if(!I?.recommended||I.recommended.v21builds)return;const rec=I.recommended;I.recommended=function(hero){let b=window.RECOMMENDED_BUILDS_V21[hero];return b?b.filter(id=>I.get(id)):rec.apply(this,arguments)};I.recommended.v21builds=true})();\n";
 fs.writeFileSync(path.join(ROOT,'dist/recommended-builds-v21.js'),js);console.log('wrote dist/recommended-builds-v21.js for',Object.keys(table).length,'heroes')}

function optimizeHero(id){
 const make=require(path.join(ROOT,'test-harness.cjs'));const h=make(),I=h.env.ItemSystem,C=h.C;
 // 原出装：跳过 V21 出装表，取更早的推荐
 const prev=window_prev(h);const cur=(prev(id)||[]).filter(x=>I.get(x)).slice(0,6);
 const role=String(C.heroes[id].role||''),tank=/坦克|重装|护盾|机甲/.test(role)||['dva','zarya'].includes(id),fighter=!tank&&/战士|斗士|先手/.test(role);
 const dmgType=(()=>{let n={physical:0,magic:0};for(let x of cur)if(n[I.get(x)?.category]!=null)n[I.get(x).category]++;return n.magic>n.physical?'magic':'physical'})();
 const A=tank?.35:fighter?.5:.7;
 const all=C.items.filter(i=>i.tier==='LEGENDARY'&&!i.boots&&!i.shopHidden&&(i.availableModes||['SR']).includes('SR')&&(i.category===dmgType||i.category==='defense')).map(i=>i.id);
 const group=x=>['mortal','LORD_DOMINIKS_REGARDS','SERYLDAS_GRUDGE'].includes(x)?'lastwhisper':['void','CRYPTBLOOM'].includes(x)?'voidpen':null;
 const ug=x=>(I.get(x)?.uniqueGroups||[]).filter(g=>g&&g!=='none'&&!['spellblade','tear'].includes(g));
 const pctPen=new Set(C.percentArmorPenItems||[]);
 const ok=(b,x)=>!b.includes(x)&&!(group(x)&&b.some(y=>group(y)===group(x)))&&!ug(x).some(g=>b.some(y=>ug(y).includes(g)))&&!(pctPen.has(x)&&b.some(y=>pctPen.has(y)));
 const f=I.get(cur[0]),boots=f?.category==='magic'?'B_3020':f?.category==='defense'?'B_3047':'B_3006';
 const evalB=b=>{let r=score(h,id,[boots,...b]);return Math.pow(Math.max(1,r.dps),A)*Math.pow(r.ehp,1-A)};
 let build=[],s0=evalB([]);
 for(let k=0;k<6;k++){let best=null,bv=-Infinity,bs=s0;for(let x of all){if(!ok(build,x))continue;if(!tank&&k<2&&I.get(x).category!==dmgType)continue;let v=evalB([...build,x]),eff=(v/s0-1)/(I.get(x).cost/1000);if(eff>bv){bv=eff;best=x;bs=v}}if(!best)break;build.push(best);s0=bs}
 let sc=evalB(build),cs=evalB(cur);if(sc<cs)build=cur.slice();
 let sig=SIG[id];if(sig&&I.get(sig)){let rest=build.filter(x=>x!==sig);build=[rest[0],sig,...rest.slice(1)].slice(0,6)}
 console.log(JSON.stringify({id,build,cur:Math.round(cs),score:Math.round(Math.max(sc,cs))}));
}
function window_prev(h){const I=h.env.ItemSystem;let rec=I.recommended;return id=>{let t=h.env.RECOMMENDED_BUILDS_V21;let saved=t?.[id];if(t)delete t[id];let r=rec(id);if(t&&saved)t[id]=saved;return r}}
function score(h,id,items,secs=12){
 let u=h.a.reset(id);u.level=13;u.skillRanks=[5,4,3,2];if((u.skills[3]?.maxRank||3)<2)u.skillRanks[3]=1;u.skillPoints=0;u.items=[...items];
 for(let i=0;i<4;i++)try{h.a.m.onLearn(u,i)}catch(e){}h.a.recalc(u);u.hp=u.maxHp;u.mp=u.maxMana;if(u.resourceType==='ENERGY')u.energy=u.maxEnergy;u.gold=0;
 let t=h.a.enemy('garen',u.x+200,u.y);t.hp=t.maxHp=3000;t.armor=80;t.mr=60;t.baseArmor=80;t.baseMr=60;
 let dealt=0;h.a.m.core.on('DamageApplied',e=>{if(e.sourceId===u.id&&e.targetId===t.id)dealt+=e.amount||0});
 for(let k=0;k<secs/.05;k++){if(t.hp<600)t.hp=3000;u.hp=u.maxHp;if(u.mp<u.maxMana*.5)u.mp=u.maxMana;
  for(let i of [3,0,2,1]){if(u.skillRanks[i]>0&&!u.pendingCast&&!(u.castWindup>0)){try{if((h.a.m.abilityCooldownRemaining?.(u,i)??u.cd?.[i]??0)<=0)h.a.cast(u,i,{x:t.x,y:t.y,target:t})}catch(e){}}}
  if(!u.pendingAttack&&u.attackCd<=0){try{h.a.attack(u,t)}catch(e){}}
  if(Math.hypot(u.x-t.x,u.y-t.y)>200){u.x=t.x-180;u.y=t.y}
  h.step(.05,.05)}
 return {dps:dealt/secs,ehp:u.maxHp*((1+Math.max(0,u.armor)/100)+(1+Math.max(0,u.mr)/100))/2};
}
