const make=require('./test-harness.cjs'),assert=require('assert');
function run(items,crit,amt){const h=make();let u=h.reset('ashe'),m=h.a.m;let t=h.a.enemy('garen',u.x+150,u.y);t.items=items;m.recalc(t);t.armor=0;t.hp=t.maxHp=3000;t.stun=99;let hp=t.hp;m.deal(t,amt,u,'physical',{basic:true,critical:crit,event:m.event(u,-1)});return hp-t.hp}
assert(Math.abs(run(['armor'],false,200)-(200-15.5))<1e-6);assert(Math.abs(run(['armor'],false,30)-18)<1e-6);assert(Math.abs(run(['armor'],true,400)-(400*.8-15.5))<1e-6);
let h=make(),it=h.C.items.find(i=>i.id==='armor');assert.equal(it.stats.armor,75);assert(!it.active);
console.log('PASS Randuin: 75 armor, no active, Rock Solid 5+0.35% max HP (cap 40%), crits -20%');
