const make=require('./test-harness.cjs'),assert=require('assert');const h=make();let u=h.reset('garen'),m=h.a.m,R=h.R;
let t=h.a.enemy('lux',u.x+100,u.y);t.hp=t.maxHp=1e6;u.armorPenPct=0;u.armorPenFlat=0;u.magicPenPct=0;u.magicPenFlat=0;
const dmg=(type,x)=>{let hp=t.hp;m.deal(t,1000,u,type,{event:m.event(u,-1)});return hp-t.hp},near=(a,b)=>assert(Math.abs(a-b)<.5,a+' != '+b);
t.armor=100;t.armorReductionFlat=20;t.itemArmorReductionPct=.3;near(dmg('physical'),1000*R.resistanceMultiplier((100-20)*.7));
t.armor=10;t.armorReductionFlat=30;near(dmg('physical'),1000*(2-100/(100+20)));
t.armor=100;t.armorReductionFlat=0;t.itemArmorReductionPct=0;u.armorPenPct=.4;u.armorPenFlat=10;near(dmg('physical'),1000*100/(100+50));
u.armorPenFlat=100;near(dmg('physical'),1000);
t.mr=100;t.mrReductionFlat=20;t.mrReductionPct=.5;near(dmg('magic'),1000*100/(100+40));
console.log('PASS armor/MR order: flat reduction -> % reduction -> % pen -> flat pen, negative armor formula');
