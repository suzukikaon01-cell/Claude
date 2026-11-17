const make=require('./test-harness.cjs'),assert=require('assert');
for(let ts of [false,true]){const h=make();let d=h.reset('dio'),m=h.a.m;d.items=['cleaver'];d.skillRanks=[5,1,1,3];d.level=11;m.recalc(d);d.energy=200;let t=h.a.enemy('garen',d.x+150,d.y);m.recalc(t);t.hp=t.maxHp=1e5;t.stun=999;
 let stop=ts?m.temporal.begin(d,t,m.event(d,3)):null,stacks=[],dmg=[];m.core.on('DamageApplied',e=>{if(e.targetId===t.id&&e.abilityId===0&&!e.itemEffect){stacks.push(d.itemState.targets.cleaver[t.id].count);dmg.push(e.amount)}});
 h.ready(d,0,5);h.release(d,0,{x:t.x,y:t.y});h.step(1.4);if(stop)m.temporal.end(stop.id);
 assert.deepEqual(stacks.slice(0,5),[1,2,3,4,5],'every punch adds a Black Cleaver stack');assert(Math.abs(t.itemArmorReductionPct-.3)<1e-9);assert(dmg.at(-1)>dmg[0]*1.05,'later punches hit harder after shred')}
console.log('PASS DIO Q stacks Black Cleaver every punch, in and out of time stop');
