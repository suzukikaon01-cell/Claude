'use strict';
const assert=require('assert'),make=require('./test-harness.cjs');let passed=0;
function test(name,fn){fn();passed++;console.log('PASS Darius repeat '+name)}
function fixture({runes=false,enemy='lux'}={}){let h=make();h.env.RIFT_TEST_RUNES_DISABLED=!runes;let u=h.reset('darius'),t=h.a.enemy(enemy,u.x+70,u.y);t.items=['heartsteel'];t.itemState.heartsteelHp=100000;h.a.m.recalc(t);t.hp=t.maxHp;t.armor=t.mr=0;t.hpRegen=0;return{h,u,t,m:h.a.m}}
function strike(f,t=f.t){let{h,u,m}=f;u.attackCd=0;u.attackRecovery=0;u.castRecovery=0;u.pendingAttack=null;assert(h.a.attack(u,t),'attack should start');m.tickAttack(u,1);}
function five(f){for(let i=0;i<5;i++){strike(f);f.h.step(.3)}assert.equal(f.t.dariusBleed[f.u.id].stacks,5);assert(f.u.v9State.rageUntil>f.h.a.time)}
function pull(f){let{h,u,t}=f;t.x=u.x+250;t.y=u.y;let before=t.x;h.ready(u,2);h.release(u,2,{x:t.x,y:t.y});h.step(.23);assert(t.x<before-100,'E should pull same living champion');assert(t.airborne>0||t.displacement,'E knocks up');h.step(.85);assert(t.slow>0,'E slows');h.step(1);t.x=u.x+70;t.y=u.y;}
for(let runes of [false,true])test('same living target can be bled and pulled after five full rage/expiry cycles, runes '+runes,()=>{let f=fixture({runes});for(let cycle=0;cycle<5;cycle++){five(f);f.h.step(5.2);assert(f.t.hp>0&&f.t.death===0);assert(!f.t.dariusBleed?.[f.u.id]);assert(!f.u.v9State.raging);strike(f);assert.equal(f.t.dariusBleed[f.u.id].stacks,1,'first attack should start a new bleed');pull(f);f.h.step(5.2)}});
test('an attack on the exact expiry frame starts fresh instead of reviving five expired stacks',()=>{
 let f=fixture();five(f);let until=Math.max(f.t.dariusBleed[f.u.id].until,f.u.v9State.rageUntil);
 f.h.a.clock(until);strike(f);
 assert.equal(f.t.dariusBleed[f.u.id].stacks,1);
 assert.equal(f.t.dariusBleed[f.u.id].next,until+.25);
 assert(!(f.u.v9State.rageUntil>f.h.a.time));
 let hp=f.t.hp;f.h.step(1.05);assert(f.t.hp<hp,'new bleed must continue dealing damage');
});
test('E works immediately when an immunity expires before the target update',()=>{
 let f=fixture();five(f);f.h.step(5.2);
 f.m.core.apply(f.t,'CC_IMMUNITY',.1,f.t);
 f.h.a.clock(f.h.a.time+.11);pull(f);
});
test('E still respects active crowd control immunity',()=>{
 let {h,u,t,m}=fixture();t.x=u.x+250;m.core.apply(t,'CC_IMMUNITY',2,t);
 h.ready(u,2);h.release(u,2,t);h.step(.25);
 assert(!t.displacement);assert(!t.airborne);assert.equal(t.x,u.x+250);
});
test('after rage, outer Q and empowered W restart stacking on every champion without a death',()=>{
 for(let enemy of Object.keys(make().C.heroes)){
  let f=fixture({runes:true,enemy}),{h,u,t,m}=f;five(f);h.step(5.2);
  t.x=u.x+240;h.ready(u,0);h.release(u,0,u);assert.equal(t.dariusBleed[u.id].stacks,1,enemy+' outer Q');
  h.step(.5);t.x=u.x+70;h.ready(u,1);h.release(u,1,u);strike(f);
  assert.equal(t.dariusBleed[u.id].stacks,2,enemy+' W');pull(f);
  assert(t.hp>0&&t.death===0,enemy+' remains alive');
 }
});
test('expired bleed does not amplify R even before the bleed cleanup tick',()=>{
 let {h,u,t,m}=fixture();h.ready(u,3);t.dariusBleed={[u.id]:{stacks:5,next:1,until:0}};
 let hp=t.hp;h.release(u,3,t);
 h.close(hp-t.hp,h.R.rank(h.C.heroParams.darius.R.base_true_damage,1)+h.R.rank(h.C.heroParams.darius.R.bonus_ad_ratio,1)*Math.max(0,u.attack-u.baseAttack));
 assert(!t.dariusBleed[u.id]);
});
console.log(`Darius repeat: ${passed} tests passed`);
