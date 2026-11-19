const make=require('./test-harness.cjs'),assert=require('assert'),vm=require('vm'),fs=require('fs');const h=make(),m=h.a.m;vm.runInContext(fs.readFileSync('dist/skill-tooltips-v20.js','utf8'),h.env);
let u=h.reset('herrscher_of_the_void');u.skillRanks=[5,5,5,3];m.hov.state(u).fragments=520;
let t=h.a.enemy('garen',u.x+200,u.y);t.hp=t.maxHp=1000;
const hit=(i)=>{t.hp=80;t.death=0;let e=m.event(u,i);m.deal(t,1,u,'magic',{event:e,once:true,hitIndex:'x'+Math.random(),hovSkill:true,hovSkillIndex:i,hovAreaId:'a'});return t.hp};
assert(hit(3)>0,'R does not execute');assert(hit(0)>0,'Q does not execute');assert(hit(1)<=0,'W executes below threshold');
let W=h.env.SkillTooltipV20.html(u,1);assert(/生命低于 .*10%/.test(W)&&W.includes('#ffffff'),'execute % in W tooltip in white');
let R=h.env.SkillTooltipV20.html(u,3).replace(/<[^>]+>/g,'');assert(R.includes('本次 '+m.hov.hitCount(u)+' 波'),'live waves');assert(/= [0-9.]+ 魔法伤害/.test(R));
console.log('PASS HoV: execute only from W, W tooltip shows white execute %, R tooltip shows live waves + total');
