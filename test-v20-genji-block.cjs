const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),m=h.a.m;
let g=h.reset('genji');g.hp=g.maxHp=1e6;g.armor=0;g.mr=0;h.ready(g,1);g.angle=0;assert(h.a.cast(g,1,{x:g.x+200,y:g.y}));h.a.tickCast(g,(g.skills[1].windup||0)+1e-5);assert(m.genji.state(g).deflectUntil>h.a.time);
const foe=(id,dx=100)=>{let u=h.a.enemy(id,g.x+dx,g.y);return u};
const dmg=(src,i,meta={})=>{m.genji.state(g).deflectUntil=h.a.time+1;m.genji.state(g).deflectAngle=0;g.hp=g.maxHp;let hp=g.hp;m.deal(g,100,src,'physical',{event:m.event(src,i),...meta});return hp-g.hp};
// 真实施法：螳螂 Q 正面被挡，背后命中
let k=foe('khazix');k.stun=0;h.ready(k,0);let hp=g.hp;assert(h.a.cast(k,0,g));h.a.tickCast(k,(k.skills[0].windup||0)+1e-5);h.step(.05);assert.equal(hp-g.hp,0,'Kha Q blocked');
k.x=g.x-100;h.ready(k,0);hp=g.hp;h.a.cast(k,0,g);h.a.tickCast(k,(k.skills[0].windup||0)+1e-5);h.step(.05);assert(hp-g.hp>0,'Kha Q from behind hits');
// 可格挡：单体/近战技能
for(let [id,i] of [['khazix',0],['yasuo',2],['yasuo',3],['garen',3],['darius',3],['xuefeng',0],['great_sword',0],['masteryi',0],['dio',0],['illaoi',0],['darius',0],['sett',1],['garen',2],['illaoi',3]])assert.equal(dmg(foe(id),i),0,id+' '+i+' should be blocked');
// 不可格挡：范围/爆炸
for(let [id,i] of [['dva',0],['dva',3],['zarya',0],['zarya',3],['lux',2],['lux',3],['khazix',1],['khazix',2],['sett',3],['zero',1],['zero',3]])assert(dmg(foe(id),i)>0,id+' '+i+' should NOT be blocked');
// 不可格挡：持续伤害/装备/符文，以及背后
let kk=foe('khazix');assert(dmg(kk,0,{delayed:true})>0);assert(dmg(kk,0,{itemEffect:true})>0);assert(dmg(kk,0,{runeProc:true})>0);assert(dmg(foe('khazix',-100),0)>0,'behind');
// 近战普攻挡，远程普攻（非弹道伤害）不由此挡
assert.equal(dmg(foe('garen'),-1,{basic:true}),0);
// 飞行途中反弹：查莉娅 R、卡兹克 W
for(let [id,i] of [['zarya',3],['khazix',1]]){let g2=h.reset('genji');g2.hp=g2.maxHp=1e6;let z=h.a.enemy(id,g2.x+300,g2.y);z.stun=0;z.mp=z.maxMana=1e4;h.ready(g2,1);h.a.cast(g2,1,{x:g2.x+200,y:g2.y});h.a.tickCast(g2,(g2.skills[1].windup||0)+1e-5);h.ready(z,i);let zh=z.hp;assert(h.a.cast(z,i,{x:g2.x,y:g2.y,target:g2}));h.a.tickCast(z,(z.skills[i].windup||0)+1e-5);h.step(1);assert.equal(g2.hp,g2.maxHp,id+' reflected, genji unhurt');assert(z.hp<zh,id+' hit by own reflected projectile')}
console.log('PASS Genji deflect: blocks frontal melee/single-target abilities (Kha Q), not area/explosion/DoT/item damage');
