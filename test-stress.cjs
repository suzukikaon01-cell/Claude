// CPU-only simulation benchmark. This does not claim GPU FPS or mobile-device performance.
const {performance}=require('perf_hooks'),fs=require('fs');
const {a,C,env,reset,ready,assert}=require('./test-harness.cjs')();
let p=reset(),actors=[p],ids=['garen','lux','ashe','yasuo','masteryi','khazix','sett','genji'];
for(let [i,id] of ids.entries())actors.push(a.enemy(id,3500+(i%4)*70,3500+Math.floor(i/4)*170,i<3?0:1));
for(let u of actors){if(process.env.ACTIVE_RUNES==='1')a.m.runeEffects.init(u,env.RunePages.lockFor(u.hero));u.stun=0;u.level=18;u.skillRanks=[5,5,5,3];u.items=['infinity','bork','heartsteel','luden','deathdance','warmog'];a.recalc(u);u.hp=u.maxHp=1000000;u.mp=u.maxMana=100000;u.hpRegen=0;u.skillTimer=.1}
for(let i=0;i<200;i++)a.units.push({id:10000+i,type:'minion',team:i%2,lane:1,x:3300+i%20*30,y:3300+Math.floor(i/20)*30,hp:100000,maxHp:100000,armor:20,mr:20,range:210,attack:1,attackCd:0,interval:.5,speed:100,gold:1,waypoint:1,death:0,angle:0});
const core=a.m.core,times=[],memory=[],max={projectiles:0,statuses:0,shields:0,entities:0};
function burst(){for(let i=0;i<1000;i++){let source=actors[i%4],target=actors[4+i%4],event=core.instance(source,'attack');a.shots.push(core.pool.acquire({x:source.x,y:source.y,source,target,speed:1500,radius:3,life:3,blockable:true,basic:{damage:1,event},event}))}}
function inspect(){for(let u of a.units){assert(Number.isFinite(u.hp)&&u.hp>=0);assert(Number.isFinite(u.x)&&Number.isFinite(u.y));assert(u.x>=0&&u.x<=C.world&&u.y>=0&&u.y<=C.world)}max.projectiles=Math.max(max.projectiles,a.shots.length);max.entities=Math.max(max.entities,a.units.length);max.statuses=Math.max(max.statuses,actors.reduce((n,u)=>n+(u.statuses?.size||0),0));max.shields=Math.max(max.shields,actors.reduce((n,u)=>n+(u.shields?.length||0),0))}
for(let tick=0;tick<1200;tick++){
 if(tick%120===0)burst();
 if(tick%30===0)for(let u of actors){a.m.shield(u,100,2,u);core.apply(u,'SLOW',.2,actors[(actors.indexOf(u)+1)%8],{amount:.2});let i=tick/30%4;ready(u,i,Math.min(i===3?3:5,u.skillRanks[i]));a.cast(u,i,actors[u.team===0?4:0])}
 if(tick%90===0)for(let u of actors)core.startDisplacement(u,{x:3450+(tick%180),y:3450+actors.indexOf(u)*30},{type:'LEAP',duration:.15});
 inspect();let start=performance.now();a.update(1/60);times.push(performance.now()-start);
 if(tick===599||tick===1199){global.gc?.();memory.push({tick:tick+1,heapBytes:process.memoryUsage().heapUsed,retainedEvents:core.stats().events,freeProjectiles:core.pool.free.length})}
}
// Verify repeated death and revival clears every temporary action lock.
for(let cycle=0;cycle<10;cycle++){for(let u of actors){a.m.control(u,'stun',1,p);a.m.deal(u,999999999,p,'true');u.death=.02}for(let i=0;i<4;i++)a.update(1/60);for(let u of actors){assert(u.hp>0);assert(!u.pendingCast&&!u.pendingAttack&&!u.displacement);assert.equal(u.statuses.size,0)}}
times.sort((a,b)=>a-b);const pct=p=>times[Math.min(times.length-1,Math.floor(times.length*p))];
const report={mode:'Node CPU simulation, no rendering',activeRunePages:process.env.ACTIVE_RUNES==='1',node:process.version,logicHz:60,simulatedSeconds:20,uniqueChampions:new Set(actors.map(u=>u.hero)).size,championActors:actors.length,minionActors:200,ticks:times.length,meanMs:times.reduce((a,b)=>a+b,0)/times.length,p50Ms:pct(.5),p95Ms:pct(.95),p99Ms:pct(.99),maxMs:times.at(-1),peak:max,memory,heapChangeBytes:memory[1].heapBytes-memory[0].heapBytes,gcEnabled:!!global.gc,engine:core.stats(),deathRespawnCycles:10};
assert(core.stats().events<=2048);assert(core.pool.free.length<=1024);assert(max.statuses<200);assert(max.shields<200);assert.equal(core.stats().observerErrors,0);assert.equal(a.units.filter(u=>u.type==='monster').length,0);
fs.writeFileSync('engine-benchmark.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));console.log('STRESS TEST PASSED');
