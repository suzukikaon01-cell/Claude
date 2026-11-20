const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),m=h.a.m,C=h.C;
// 俄洛伊R：0.25s 跃起，期间霸体（眩晕不打断）
{let u=h.reset('illaoi'),t=h.a.enemy('garen',u.x+150,u.y);t.hp=t.maxHp=1e5;h.ready(u,3,1);assert(h.a.cast(u,3,u));h.step(.05);m.control(u,'stun',1,t,{});assert(!(u.stun>0),'CC immune during leap');h.step(.3);assert(t.hp<t.maxHp,'R landed despite stun attempt');assert(u.illaoiLeap)}
// 源氏R：0.5s 拔刀，期间无法打断
{let u=h.reset('genji'),t=h.a.enemy('garen',u.x+150,u.y);h.ready(u,3,1);assert(h.a.cast(u,3,u));let x=u.x;h.a.walk(1,0);h.step(.2);h.a.walk(0,0);assert(u.x-x>30,'can move while drawing');h.ready(u,2);assert(!h.a.cast(u,2,{x:u.x+200,y:u.y}),'no skills while drawing');m.control(u,'stun',1,t,{});assert(!(u.stun>0),'CC immune during draw');h.step(.4);assert(m.genji.state(u).bladeUntil>h.a.time,'blade active after draw')}
// 艾希R：体积×15 → 半径约49.3
{let u=h.reset('ashe'),t=h.a.enemy('garen',u.x+600,u.y+45);t.radius=0;t.hp=t.maxHp=1e5;h.ready(u,3,1);assert(h.a.cast(u,3,{x:u.x+900,y:u.y}));h.a.tickCast(u,(u.skills[3].windup||0)+1e-5);let s=h.a.shots.find(s=>s.crystalArrow);assert(Math.abs(s.radius-20*Math.cbrt(15))<.01);h.step(1.5);assert(t.hp<t.maxHp,'hits target 45 off-line')}
assert.equal(C.heroes.sett.skills[2].windup,.15);
console.log('PASS Illaoi R leap & Genji R draw unstoppable, Ashe R arrow volume x15, Sett E windup 0.15');
