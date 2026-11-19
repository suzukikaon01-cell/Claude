const make=require('./test-harness.cjs'),assert=require('assert');const h=make();
const L18={};for(let id of Object.keys(h.C.heroes)){let u=h.reset(id);u.items=[];u.level=18;h.a.m.recalc(u);L18[id]={ar:u.armor,mr:u.mr}}
const G={mage:['lux','zero','herrscher_of_the_void','claude','ana'],adc:['ashe'],assassin:['yasuo','khazix','genji'],light:['masteryi','dio','longsword_hunter','xuefeng'],heavy:['garen','darius','sett','illaoi','great_sword','anvil'],tank:['dva','zarya']};
const mx=(g,k)=>Math.max(...G[g].map(i=>L18[i][k])),mn=(g,k)=>Math.min(...G[g].map(i=>L18[i][k]));
for(let [a,b] of [['mage','adc'],['adc','assassin'],['assassin','light'],['light','heavy'],['heavy','tank']])assert(mx(a,'ar')<mn(b,'ar'),'armor '+a+'<'+b);
for(let [a,b] of [['adc','mage'],['mage','assassin'],['assassin','light'],['light','heavy'],['heavy','tank']])assert(mx(a,'mr')<mn(b,'mr'),'mr '+a+'<'+b);
for(let id of ['lux','zero','herrscher_of_the_void','claude','zarya'])assert(L18[id].mr>L18[id].ar,id+' magic: mr>armor');
for(let id of ['ashe','yasuo','khazix','genji','masteryi','dio','longsword_hunter','xuefeng','garen','darius','sett','illaoi','great_sword','anvil'])assert(L18[id].ar>L18[id].mr,id+' physical: armor>mr');
for(let id of ['ana','dva'])assert(Math.abs(L18[id].ar-L18[id].mr)<1e-6,id+' mixed balanced');
assert(L18.genji.ar<L18.yasuo.ar&&L18.genji.mr<L18.yasuo.mr,'ranged assassin below melee');
console.log('PASS resist tiers: class ordering, damage-type skew, ranged lower');
