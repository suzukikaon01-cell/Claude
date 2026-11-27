const make=require('./test-harness.cjs'),assert=require('assert');
// 持续释放类技能每一段都按当时的属性实时计算：DIO Q 每拳、D.Va 导弹。
{const h=make();let d=h.reset('dio'),m=h.a.m;d.skillRanks=[5,1,1,1];m.recalc(d);d.energy=200;let t=h.a.enemy('garen',d.x+150,d.y);t.armor=0;t.hp=t.maxHp=1e6;t.stun=99;let log=[];
 m.core.on('DamageApplied',e=>{if(e.targetId===t.id&&e.abilityId===0&&!e.itemEffect)log.push(e.rawAmount)});h.ready(d,0,5);h.release(d,0,{x:t.x,y:t.y});h.step(.4);let n=log.length,a0=d.attack;d.attack+=200;h.step(.4);let m2=log.length;d.attack=a0-30;h.step(.6);
 assert(log[n]>log[n-1]+50,'DIO punch rises with AD');assert(log[m2]<log[0],'DIO punch drops when AD is reduced')}
{const h=make();let u=h.reset('dva'),m=h.a.m;u.skillRanks=[5,1,1,1];m.recalc(u);let t=h.a.enemy('garen',u.x+120,u.y);t.armor=0;t.hp=t.maxHp=1e6;t.stun=99;let log=[];
 m.core.on('DamageApplied',e=>{if(e.targetId===t.id&&e.sourceId===u.id&&!e.itemEffect)log.push(e.rawAmount)});h.ready(u,0,5);h.release(u,0,{x:t.x,y:t.y});h.step(.3);let n=log.length;u.attack+=300;h.step(1.2);assert(Math.max(...log.slice(n+2))>Math.max(...log.slice(0,n))+5,'D.Va missiles rise with AD')}
console.log('PASS channelled skills scale with live stats every hit');
