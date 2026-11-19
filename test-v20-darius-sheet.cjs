const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),m=h.a.m,P=h.C.heroParams.darius;const cost=(u,i)=>m.heroHooks.darius.cost(u,i,h.R.rank(u.skills[i].mana,u.skillRanks[i]||1));
let u=h.reset('darius');assert.equal(u.maxHp,652.24);assert.equal(u.attack,64);assert.equal(u.maxMana,263);
u.skillRanks[3]=1;assert.equal(cost(u,3),100,'R costs 100 at rank 1');
let t=h.a.enemy('lux',u.x+150,u.y);t.hp=50;h.ready(u,3,1);u.mp=u.maxMana;let mp=u.mp;assert(h.a.cast(u,3,t));h.a.tickCast(u,(u.skills[3].windup||0)+1e-5);assert(Math.abs(mp-u.mp-100)<1e-6,'paid 100');h.step(1);assert(t.hp<=0||t.death>0,'R kills');assert.equal(u.cd[3],0,'cd reset on kill');assert.equal(cost(u,3),0,'free recast within 20s');h.step(20.5);assert.equal(cost(u,3),100,'free window ends');
u.skillRanks[3]=3;assert.equal(cost(u,3),0,'rank 3 no mana');
// bleed vs monster 175%
let a=h.reset('darius'),mon=h.a.enemy('garen',a.x+100,a.y),hero=h.a.enemy('garen',a.x+100,a.y+50);mon.type='monster';mon.hero=null;mon.home={x:mon.x,y:mon.y};mon.leash=1e4;mon.stun=99;for(let v of [mon,hero]){v.hp=v.maxHp=1e5;v.armor=0;v.dariusBleed={[a.id]:{stacks:1,next:h.a.time,until:h.a.time+5,targetLife:v._life||0}}}h.step(1);let dm=1e5-mon.hp,dh=1e5-hero.hp;assert(Math.abs(dm/dh-1.75)<.02,'monster bleed 175% '+dm+'/'+dh);
assert.deepEqual(P.Q.cooldown,[9,8,7,6,5]);assert.deepEqual(P.W.total_ad_bonus_ratio,[.4,.45,.5,.55,.6]);assert.deepEqual(P.E.armor_penetration,[.15,.2,.25,.3,.35]);assert.deepEqual(P.R.cooldown,[120,100,80]);
console.log('PASS Darius sheet: stats, R mana/free recast/rank3, bleed 175% on monsters, skill numbers');
