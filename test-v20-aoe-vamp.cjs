const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),m=h.a.m;
const heal=(hero,i)=>{let u=h.reset(hero);u.omnivamp=.2;u.lifesteal=0;u.hp=u.maxHp/2;let t=h.a.enemy('garen',u.x+100,u.y);t.hp=t.maxHp=1e6;let hp=u.hp;m.deal(t,500,u,'true',{event:m.event(u,i),once:true});return u.hp-hp};
let aoe=heal('lux',0),single=heal('garen',3);assert(Math.abs(single-100)<1,'single-target full omnivamp '+single);assert(Math.abs(aoe-33)<1,'aoe 33% '+aoe);
{let u=h.reset('garen');u.omnivamp=.2;u.hp=u.maxHp/2;let t=h.a.enemy('lux',u.x+100,u.y);t.hp=t.maxHp=1e6;let hp=u.hp;m.deal(t,500,u,'true',{basic:true,event:m.event(u,-1)});assert(Math.abs(u.hp-hp-100)<1,'basic full')}
console.log('PASS non-single-target ability vamp at 33%, single-target and basics full');
