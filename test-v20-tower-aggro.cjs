const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),m=h.a.m;
let p=h.reset('garen',true),tw=h.a.units.find(u=>u.type==='tower'&&u.team===p.team);tw.hp=tw.maxHp=1e7;
for(let u of h.a.units)if(u.type==='minion')u.hp=0;h.a.units.splice(0,h.a.units.length,...h.a.units.filter(u=>u.type!=='minion'));
p.x=tw.x;p.y=tw.y+200;p.hp=p.maxHp=1e6;
const enemy=(id,dx)=>{let e=h.a.enemy(id,tw.x+dx,tw.y-150);e.hp=e.maxHp=1e6;return e};
let mn=enemy('lux',100);mn.type='minion';mn.hero=null;let e1=enemy('khazix',-150),e2=enemy('yasuo',200);
const tick=()=>{h.a.update(.02);return tw.aggro};
assert.equal(tick(),mn,'default targets minion');
m.deal(p,50,e1,'physical',{event:m.event(e1,0)});assert.equal(tick(),e1,'locks first enemy hero that hit our hero');
m.deal(p,50,e2,'physical',{event:m.event(e2,0)});for(let i=0;i<5;i++)tick();assert.equal(tw.aggro,e1,'keeps first attacker');
e1.x=tw.x+tw.range+400;assert.equal(tick(),mn,'reset when locked hero leaves range');
m.deal(p,50,e2,'physical',{event:m.event(e2,0)});assert.equal(tick(),e2,'new damage re-locks');
e2.hp=0;e2.death=10;assert.equal(tick(),mn,'reset on death');
// 塔外的敌方英雄伤害不触发
let e3=enemy('genji',0);e3.x=tw.x+tw.range+300;m.deal(p,50,e3,'physical',{event:m.event(e3,0)});assert.equal(tick(),mn,'out-of-range attacker ignored');
// 护盾吸收的伤害也算
e1.x=tw.x-150;e1.y=tw.y-150;p.shield=1000;m.shield?.(p,1000,5,p);m.deal(p,50,e1,'physical',{event:m.event(e1,0)});assert.equal(tick(),e1,'shield hit counts');
console.log('PASS tower aggro: minions by default, locks first enemy hero hitting ally in range until death/leave');
