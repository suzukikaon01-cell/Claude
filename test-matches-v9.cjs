'use strict';
const assert=require('assert'),make=require('./test-harness.cjs');
for(const id of ['ashe','garen','lux','zero','yasuo','masteryi','khazix','sett','genji','darius','illaoi','ana','dva','zarya']){
 const h=make(),u=h.reset(id,true);h.step(12,.1);
 assert(Number.isFinite(u.hp)&&Number.isFinite(u.attack),id+' invalid stats');
 for(const v of h.a.units.filter(v=>v.type==='hero'))assert(Number.isFinite(v.hp)&&Number.isFinite(v.attack)&&Number.isFinite(v.x)&&Number.isFinite(v.y),id+' non-finite hero');
 assert.equal(h.a.m.core.stats().observerErrors,0,id+' observer errors');console.log('PASS 12-second full match',id);
}
