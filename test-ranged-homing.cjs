'use strict';
const assert=require('assert'),make=require('./test-harness.cjs');
function test(id){let h=make(),u=h.reset(id),t=h.a.enemy('lux',u.x+300,u.y);t.hp=t.maxHp=10000;t.armor=0;u.crit=0;assert(h.a.attack(u,t));h.step(.19);h.step(.08);t.x=u.x+1700;h.step(id==='genji'?3.5:1.6);assert(t.hp<10000,`${id} projectile missed a moving target`);if(id==='genji')assert(Math.abs((10000-t.hp)-u.attack*h.C.heroParams.genji.AA.damage_total_ad_ratio)<.2,`Genji burst was not fully delivered: ${10000-t.hp}`);console.log('PASS '+id+' released attack follows target beyond initial range')}
for(const id of ['ashe','lux','zero','genji'])test(id);
