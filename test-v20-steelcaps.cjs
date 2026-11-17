const make=require('./test-harness.cjs'),assert=require('assert');
function run(src,boots,act){const h=make();let u=h.reset(src),m=h.a.m;u.skillRanks=[1,1,1,1];m.recalc(u);if(u.maxEnergy)u.energy=u.maxEnergy;let t=h.a.enemy('garen',u.x+150,u.y);if(boots)t.items=['B_3047'];m.recalc(t);t.armor=0;t.hp=t.maxHp=1e5;t.stun=99;let d=0;
 m.core.on('DamageApplied',e=>{if(e.targetId===t.id&&e.sourceId===u.id&&!e.itemEffect)d+=e.amount});if(act==='q'){h.ready(u,0,1);h.release(u,0,{x:t.x,y:t.y,target:t});h.step(1.5)}else{u.attackCd=0;h.a.attack(u,t);h.step(1)}return d}
for(let [s,a,r] of [['ashe','aa',.88],['dio','q',.88],['yasuo','q',.88],['lux','q',1]]){let k=run(s,true,a)/run(s,false,a);assert(Math.abs(k-r)<.005,s+' '+a+' '+k)}
console.log('PASS Plated Steelcaps reduce basic-attack damage (incl. on-hit abilities) by 12%, not ability damage');
