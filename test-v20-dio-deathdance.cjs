const make=require('./test-harness.cjs'),assert=require('assert');
function run(items,armor){const h=make();let d=h.reset('dio'),m=h.a.m;d.skillRanks=[1,1,1,3];let t=h.a.enemy('lux',d.x+150,d.y);t.items=items;m.recalc(t);t.hp=t.maxHp=5000;t.armor=armor;t.stun=99;t.hpRegen=0;t.shield=0;t.shields=[];
 let stop=m.temporal.begin(d,t,m.event(d,3)),f=m.temporal.multiplier(d);for(let k=0;k<5;k++)m.deal(t,400,d,'physical',{event:m.event(d,0)});m.temporal.end(stop.id);let settle=5000-t.hp;h.step(8);return {settle,total:5000-t.hp,f}}
for(let armor of [0,100]){let a=run([],armor),b=run(['deathdance'],armor),exp=2000*100/(100+armor)*a.f;
 assert(Math.abs(a.total-exp)<1,'plain '+a.total);assert(Math.abs(b.total-exp)<1,'deathdance total '+b.total+' vs '+exp);assert(Math.abs(b.settle-exp*(1-.1))<1,'deathdance defers 10% of the settled damage once')}
console.log('PASS DIO time-stop damage is mitigated once and Death\'s Dance only delays the amplified settlement');
