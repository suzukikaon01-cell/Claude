const make=require('./test-harness.cjs'),assert=require('assert');const h=make();let u=h.reset('yasuo'),m=h.a.m;
assert.deepEqual(h.C.heroes.yasuo.skills[3].cd,[60,45,30]);
for(let rank of [1,2,3]){u.skillRanks=[1,1,1,rank];let t=h.a.enemy('garen',u.x+100,u.y);t.level=11;m.recalc(t);let base=t.baseArmor;t.armor=base+300;t.hp=t.maxHp=1e6;u.armorPenPct=0;u.armorPenFlat=0;
 const hit=crit=>{let hp=t.hp;m.deal(t,1000,u,'physical',{critical:crit,event:m.event(u,-1)});return hp-t.hp};u.yasuoArmorPenUntil=h.a.time+15;
 assert(Math.abs(hit(true)-1000*100/(100+base+300*(1-[.3,.4,.5][rank-1])))<.5,'crit pierces only bonus armor');assert(Math.abs(hit(false)-1000*100/(100+base+300))<.5,'non-crit unaffected')}
console.log('PASS Yasuo R: 60/45/30 cooldown, crits pierce 30/40/50% bonus armor only');
