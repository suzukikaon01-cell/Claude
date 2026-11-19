const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),m=h.a.m,C=h.C;
let it=C.items.find(i=>i.id==='DRAGON_EDGE');assert(it&&it.name==='神龙之刃');assert(it.cost>=3600&&it.cost<=3800,'price '+it.cost);assert.deepEqual(it.recipe,['C_1038','C_1018','C_3134']);
let u=h.reset('genji');u.level=11;u.items=[];m.recalc(u);let a0=u.attack,as0=u.attackSpeed,p0=u.armorPenFlat||0;u.items=['DRAGON_EDGE'];m.recalc(u);assert(Math.abs(u.attack-a0-65)<1e-6);assert(u.crit>=.25-1e-9);assert(Math.abs(u.attackSpeed-as0)<1e-9,'no AS');assert((u.armorPenFlat||0)>p0,'lethality');
let t=h.a.enemy('garen',u.x+150,u.y);t.hp=t.maxHp=1e5;t.armor=0;
const hit=()=>{let hp=t.hp;m.itemEffects.basicHit(u,t,{event:m.event(u,-1)});return hp-t.hp};
assert.equal(hit(),0,'no bonus without dash');
// 拔刀疾斩：Genji E（自身发出 DisplacementStarted）
h.ready(u,2);let tt=h.a.enemy('lux',u.x+300,u.y);assert(h.a.cast(u,2,tt));h.a.tickCast(u,(u.skills[2].windup||0)+1e-5);h.step(.02);assert.equal(u.dragonEdgeCharges,3);
let bonus=35+.35*(u.attack-u.baseAttack);for(let i=0;i<3;i++)assert(Math.abs(hit()-bonus)<.5,'empowered hit '+i);assert.equal(hit(),0,'only 3 hits');
m.core.startDisplacement(u,{x:u.x+50,y:u.y},{type:'DASH',duration:.1,source:u,abilityId:2});h.a.clock(h.a.time+4.1);assert.equal(hit(),0,'expires after 4s');
// 无击杀刷新被动（源氏自带 E 刷新）
u.cd=[5,6,7,60];m.itemEffects.onTakedown?.(u,t,{kind:'assist'});assert.deepEqual(u.cd,[5,6,7,60]);
// 龙神之剑
u.items=['DRAGON_EDGE'];m.recalc(u);let ad=u.attack;m.core.emit('AbilityCommitted',u,u,{abilityId:3,castId:'r'});h.step(.02);assert(Math.abs(u.attack-ad*1.15)<1e-6,'R +15% AD');h.a.clock(h.a.time+8.1);h.step(.02);assert(Math.abs(u.attack-ad)<1e-6,'expires');
let g=h.reset('garen');g.items=['DRAGON_EDGE'];m.recalc(g);assert(g.attack>0,'universal');
console.log('PASS 神龙之刃: 3700 price, dash-empowered 3 hits, R +15% AD for 8s');
