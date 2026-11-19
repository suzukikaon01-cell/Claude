const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),m=h.a.m,C_=h.C;
let g=h.reset('genji');g.hp=g.maxHp=1e6;g.armor=0;g.mr=0;h.ready(g,1);g.angle=0;assert(h.a.cast(g,1,{x:g.x+200,y:g.y}));h.a.tickCast(g,(g.skills[1].windup||0)+1e-5);assert(m.genji.state(g).deflectUntil>h.a.time);
const foe=(id,dx=100)=>{let u=h.a.enemy(id,g.x+dx,g.y);return u};
const dmg=(src,i,meta={})=>{m.genji.state(g).deflectUntil=h.a.time+1;m.genji.state(g).deflectAngle=0;g.hp=g.maxHp;let hp=g.hp;m.deal(g,100,src,'physical',{event:m.event(src,i),...meta});return hp-g.hp};
// 真实施法：螳螂 Q 正面被挡，背后命中
let k=foe('khazix');k.stun=0;h.ready(k,0);let hp=g.hp;assert(h.a.cast(k,0,g));h.a.tickCast(k,(k.skills[0].windup||0)+1e-5);h.step(.05);assert.equal(hp-g.hp,0,'Kha Q blocked');
k.x=g.x-100;h.ready(k,0);hp=g.hp;h.a.cast(k,0,g);h.a.tickCast(k,(k.skills[0].windup||0)+1e-5);h.step(.05);assert(hp-g.hp>0,'Kha Q from behind hits');
// 可格挡：单体/近战技能
for(let [id,i] of [['khazix',0],['yasuo',2],['yasuo',3],['garen',3],['darius',3],['xuefeng',0],['great_sword',0],['masteryi',0],['dio',0],['illaoi',0],['darius',0],['garen',2],['illaoi',3]])assert.equal(dmg(foe(id),i),0,id+' '+i+' should be blocked');
// 不可格挡：范围/爆炸
for(let [id,i] of [['lux',3],['sett',1],['dva',0],['dva',3],['zarya',0],['zarya',3],['lux',2],['khazix',1],['khazix',2],['sett',3],['zero',1],['zero',3]])assert(dmg(foe(id),i)>0,id+' '+i+' should NOT be blocked');
// 不可格挡：持续伤害/装备/符文，以及背后
let kk=foe('khazix');assert(dmg(kk,0,{delayed:true})>0);assert(dmg(kk,0,{itemEffect:true})>0);assert(dmg(kk,0,{runeProc:true})>0);assert(dmg(foe('khazix',-100),0)>0,'behind');
// 近战普攻挡，远程普攻（非弹道伤害）不由此挡
assert.equal(dmg(foe('garen'),-1,{basic:true}),0);
// 飞行途中反弹：查莉娅 R、卡兹克 W
for(let [id,i] of [['zarya',3],['khazix',1]]){let g2=h.reset('genji');g2.hp=g2.maxHp=1e6;let z=h.a.enemy(id,g2.x+300,g2.y);z.stun=0;z.mp=z.maxMana=1e4;h.ready(g2,1);h.a.cast(g2,1,{x:g2.x+200,y:g2.y});h.a.tickCast(g2,(g2.skills[1].windup||0)+1e-5);h.ready(z,i);let zh=z.hp;assert(h.a.cast(z,i,{x:g2.x,y:g2.y,target:g2}));h.a.tickCast(z,(z.skills[i].windup||0)+1e-5);h.step(1);assert.equal(g2.hp,g2.maxHp,id+' reflected, genji unhurt');assert(z.hp<zh,id+' hit by own reflected projectile')}
// 迪奥 W 飞刀：正面的被反弹，背后的命中
{let g3=h.reset('genji');g3.hp=g3.maxHp=1e6;let d=h.a.enemy('dio',g3.x+300,g3.y);d.stun=0;d.hp=d.maxHp=1e6;let n=0,r=0;m.core.on('DamageApplied',e=>{if(e.targetId===g3.id)n++});m.core.on('ProjectileReflected',()=>r++);let st=m.genji.state(g3);st.deflectUntil=h.a.time+3;st.deflectAngle=0;h.ready(d,1);assert(h.a.cast(d,1,{x:g3.x,y:g3.y}));h.a.tickCast(d,(d.skills[1].windup||0)+1e-5);h.step(2.5);assert(r>=6,'front knives reflected '+r);assert(n>0&&n<8,'rear knives hit '+n)}
// 拔刀范围 225
{let g4=h.reset('genji');assert.equal(C_.genji.bladeRange,225);assert.equal(g4.skills[3].range,225);assert(g4.skills[3].desc.includes('225范围'));h.ready(g4,3);h.release(g4,3);assert.equal(m.heroHooks.genji.attackRange(g4),225);let t=h.a.enemy('lux',g4.x+220-15,g4.y);t.hp=t.maxHp=1e5;g4.castRecovery=0;g4.attackCd=0;assert(h.a.attack(g4,t));h.step(.6);assert(t.hp<t.maxHp,'blade hits at 220')}
{let g5=h.reset('genji');h.ready(g5,1);h.release(g5,1,{x:g5.x+100,y:g5.y});assert(m.genji.state(g5).deflectUntil>h.a.time);h.step(.2);h.ready(g5,2);assert(h.a.cast(g5,2,{x:g5.x+300,y:g5.y}),'E during W');h.a.tickCast(g5,(g5.skills[2].windup||0)+1e-5);assert(!(m.genji.state(g5).deflectUntil>h.a.time),'W cancelled');assert(m.genji.state(g5).dash,'dashing')}
console.log('PASS Genji deflect: blocks frontal melee/single-target abilities (Kha Q), not area/explosion/DoT/item damage');
{const h2=make(),m2=h2.a.m;let g=h2.reset('genji');h2.step(5);let z=m2.genji.state(g);assert(!z.reloadUntil,'full mag idle no reload');h2.ready(g,0);assert(h2.a.cast(g,0,{x:g.x+200,y:g.y}));h2.a.tickCast(g,(g.skills[0].windup||0)+1e-5);h2.step(.5);assert(!z.reloadUntil,'Q after long idle does not reload immediately');h2.step(3.2);assert(z.reloadUntil||z.ammo===h2.C.genji.ammoCapacity,'idle reload after 3s');console.log('PASS Genji Q after idle no instant reload')}
{const h3=make(),m3=h3.a.m;let g=h3.reset('genji'),t=h3.a.enemy('garen',g.x+200,g.y);t.hp=t.maxHp=1e5;h3.ready(g,1);h3.release(g,1,{x:t.x,y:t.y});assert(m3.genji.state(g).deflectUntil>h3.a.time);h3.step(.2);g.attackCd=0;g.player=true;g.manualAttackAt=-99;assert(!h3.a.attack(g,t),'auto attack does not cancel W');g.manualAttackAt=h3.a.time;assert(h3.a.attack(g,t),'manual attack during W');assert(!(m3.genji.state(g).deflectUntil>h3.a.time),'W cancelled by attack');h3.step(1);assert(t.hp<t.maxHp,'attack landed');console.log('PASS Genji basic attack cancels W')}
{const h4=make(),m4=h4.a.m;for(let both of [false,true]){let s=h4.reset('sett'),g=h4.a.enemy('genji',s.x+150,s.y);g.stun=0;g.hp=g.maxHp=1e5;if(both){let o=h4.a.enemy('lux',s.x-150,s.y);o.hp=o.maxHp=1e5}let z=m4.genji.state(g);z.deflectUntil=h4.a.time+1.5;z.deflectAngle=Math.PI;let x0=g.x;h4.ready(s,2);assert(h4.a.cast(s,2,{x:s.x+200,y:s.y}));h4.a.tickCast(s,(s.skills[2].windup||0)+1e-5);h4.step(.2);assert(x0-g.x>50,'pulled');
 if(both){assert(g.hp<g.maxHp&&g.stun>0&&!(z.deflectUntil>h4.a.time),'stun breaks W and deals damage')}else{assert.equal(g.hp,g.maxHp,'no damage');assert(z.deflectUntil>h4.a.time,'W kept');assert(!(g.stun>0))}}console.log('PASS Sett E vs Genji W: pull always; damage+break only with stun')}
