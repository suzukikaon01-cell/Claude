const make=require('./test-harness.cjs'),assert=require('assert');const h=make();
const L18={};for(let id of Object.keys(h.C.heroes)){let u=h.reset(id);u.items=[];u.level=18;h.a.m.recalc(u);L18[id]={ar:u.armor,mr:u.mr}}
const G={mage:['lux','zero','herrscher_of_the_void','claude','ana'],adc:['ashe'],assassin:['yasuo','khazix','genji'],light:['masteryi','dio','longsword_hunter','xuefeng'],heavy:['garen','darius','sett','illaoi','great_sword','anvil'],tank:['dva','zarya']};
const mx=(g,k)=>Math.max(...G[g].map(i=>L18[i][k])),mn=(g,k)=>Math.min(...G[g].map(i=>L18[i][k]));
for(let [a,b] of [['mage','adc'],['adc','assassin'],['assassin','light'],['light','heavy'],['heavy','tank']])assert(mx(a,'ar')<mn(b,'ar'),'armor '+a+'<'+b);
for(let [a,b] of [['adc','mage'],['mage','assassin'],['assassin','light'],['light','heavy'],['heavy','tank']])assert(mx(a,'mr')<mn(b,'mr'),'mr '+a+'<'+b);
for(let id in L18){assert(L18[id].ar>=108-1e-6,id+' armor>=108');assert(L18[id].mr>=60-1e-6,id+' mr>=60')}
const q=id=>L18[id].mr/L18[id].ar;for(let id of ['lux','zero','herrscher_of_the_void','claude'])assert(q(id)>q('ana')&&q('ana')>q('ashe'),id+' magic tilt > mixed > physical');assert(q('zarya')>q('dva'),'zarya magic tilt > dva mixed');
for(let id of ['ashe','yasuo','khazix','genji','masteryi','dio','longsword_hunter','xuefeng','garen','darius','sett','illaoi','great_sword','anvil'])assert(L18[id].ar>L18[id].mr,id+' physical: armor>mr');
assert(L18.genji.ar<L18.yasuo.ar&&L18.genji.mr<L18.yasuo.mr,'ranged assassin below melee');
console.log('PASS resist tiers: class ordering, min 108 armor/60 MR, damage-type tilt, ranged lower');
