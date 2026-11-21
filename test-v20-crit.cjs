const make=require('./test-harness.cjs'),assert=require('assert');
function ratio(hero,items){const h=make();let u=h.reset(hero),m=h.a.m;u.items=items;m.recalc(u);let t=h.a.enemy('garen',u.x+100,u.y);t.armor=0;t.hp=t.maxHp=1e6;t.stun=99;let d=[];m.core.on('DamageApplied',e=>{if(e.targetId===t.id&&e.basic&&!e.itemEffect)d.push(e.rawAmount)});
 const one=c=>{u.attackCd=0;u.castRecovery=0;u.pendingAttack=null;d.length=0;u.crit=c;h.a.attack(u,t);for(let k=0;k<40;k++){u.crit=c;h.step(1/30)}return d[0]};return one(1)/one(0)}
for(let [hero,items,want] of [['masteryi',[],1.75],['masteryi',['infinity'],2.1],['yasuo',[],1.65],['yasuo',['infinity'],2]])assert(Math.abs(ratio(hero,items)-want)<1e-6,hero+' '+items+' '+want);
console.log('PASS crit damage 175% base, +35% with Infinity Edge, Yasuo flat -10%');
