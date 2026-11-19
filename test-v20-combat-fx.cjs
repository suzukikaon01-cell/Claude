const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),m=h.a.m,F=h.env.CombatFxV20;assert(F,'module loaded');
let u=h.reset('khazix');F.attach(m.core,()=>h.a.units,()=>h.a.time);let t=h.a.enemy('garen',u.x+100,u.y);t.hp=t.maxHp=1e5;
assert(h.a.attack(u,t));h.step(1);let hit=F.fx.find(f=>f.kind==='hit');assert(hit&&hit.style==='claw','khazix claw hit fx');
h.ready(u,0);assert(h.a.cast(u,0,t));h.a.tickCast(u,(u.skills[0].windup||0)+1e-5);h.step(.05);assert(F.fx.some(f=>f.kind==='cast'),'cast flash');
// 绘制不抛错（含防御塔锁定）
let calls=0,ctx=new Proxy({},{get:(o,k)=>o[k]??(()=>{calls++}),set:(o,k,v)=>(o[k]=v,true)});F.draw(ctx,u,h.a.units,h.a.time,()=>true);assert(calls>0);
assert.equal(F.STYLE.garen,'blade');assert.equal(F.STYLE.sett,'fist');
console.log('PASS combat fx: per-hero basic hit style, cast flash, draw ok');
