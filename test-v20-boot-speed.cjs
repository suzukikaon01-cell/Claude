const make=require('./test-harness.cjs'),assert=require('assert');const h=make();
assert.equal(h.C.items.find(i=>i.id==='B_3006').stats.speed,29);assert.equal(h.C.items.find(i=>i.id==='B_3009').stats.speed,35);
let u=h.reset('ashe');u.level=18;u.items=['infinity','bork','blood','phantom','mortal','B_3006'];h.a.m.recalc(u);assert(u.speed<265,'ashe full build speed '+u.speed);
console.log('PASS flat item move speed scaled to project speed scale (boots 45→29)');
