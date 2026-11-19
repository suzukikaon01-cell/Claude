const make=require('./test-harness.cjs'),assert=require('assert');
function run(id,i,deflect,pre){let h=make(),m=h.a.m,g=h.reset('genji');g.hp=g.maxHp=1e6;let c=h.a.enemy(id,g.x+300,g.y);c.stun=0;c.skillTimer=999;c.hp=c.maxHp=1e6;c.mp=c.maxMana=1e5;pre?.(c);
 let ev=[],vis=null;m.core.on('DamageApplied',e=>{if(e.targetId===(deflect?c.id:g.id)&&!e.itemEffect&&(deflect?e.sourceType==='REFLECTED_PROJECTILE':e.abilityId===i))ev.push(e)});
 if(deflect){let st=m.genji.state(g);st.deflectUntil=h.a.time+5;st.deflectAngle=0}
 h.ready(c,i,3);assert(h.a.cast(c,i,{x:g.x,y:g.y,target:g}));h.a.tickCast(c,(c.skills[i].windup||0)+1e-5);
 for(let t=0;t<1.5;t+=.05){c.attackCd=1e9;c.pendingAttack=null;h.step(.05);let s=h.a.shots.find(s=>s.reflectionCount);if(s&&!vis)vis=s.visualSource?.hero}
 c.attackCd=99;return {raw:ev.filter(e=>deflect?e.sourceType==='REFLECTED_PROJECTILE':true).reduce((a,e)=>a+e.rawAmount,0),n:ev.length,vis,c,g}}
for(let [id,i,pre] of [['lux',0],['yasuo',0,c=>c.championState={qStacks:2}],['ashe',1],['khazix',1]]){let a=run(id,i,false,pre),b=run(id,i,true,pre);
 assert(Math.abs(a.raw-b.raw)<1,id+' raw '+a.raw+' vs reflected '+b.raw);assert.equal(b.vis,id,id+' keeps model');assert.equal(b.g.hp,b.g.maxHp,'genji unhurt')}
console.log('PASS Genji reflection: same raw damage, effects and projectile model as the original');
