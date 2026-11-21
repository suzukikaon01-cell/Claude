const make=require('./test-harness.cjs'),assert=require('assert');const h=make();
let p=h.reset('garen',true),heroes=h.a.units.filter(u=>u.type==='hero');
const at=(min,lv)=>{h.a.clock(min*60);for(let u of heroes)u.level=lv;return h.a.minionStats()};
let a=at(0,1),b=at(10,1),c=at(10,9),d=at(30,16);
for(let k of ['hp','attack','armor','mr'])assert(a[k]<b[k]&&b[k]<c[k]&&c[k]<d[k],k+' grows with time and level');
assert.equal(a.hp,h.C.minion.hp);assert.equal(a.attack,h.C.minion.attack);
for(let u of heroes)u.level=heroes.indexOf(u)%2?18:2;h.a.clock(600);let m=h.a.minionStats();assert(Math.abs(m.avgLevel-10)<1e-9,'average of both teams');
console.log('PASS minion growth by time and average hero level',JSON.stringify({start:a,min10lv1:b,min10lv9:c,min30lv16:d},(k,v)=>typeof v==='number'?Math.round(v*10)/10:v));
