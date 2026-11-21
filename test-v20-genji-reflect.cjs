const make=require('./test-harness.cjs'),assert=require('assert');
function run(id,i,deflect,pre){let h=make(),m=h.a.m,g=h.reset('genji');g.hp=g.maxHp=1e6;let c=h.a.enemy(id,g.x+300,g.y);c.stun=0;c.skillTimer=999;c.hp=c.maxHp=1e6;c.mp=c.maxMana=1e5;pre?.(c);
 let ev=[],vis=null;m.core.on('DamageApplied',e=>{if(e.targetId===(deflect?c.id:g.id)&&!e.itemEffect&&(deflect?e.sourceType==='REFLECTED_PROJECTILE':e.abilityId===i))ev.push(e)});
 if(deflect){let st=m.genji.state(g);st.deflectUntil=h.a.time+5;st.deflectAngle=0}
 h.ready(c,i,3);assert(h.a.cast(c,i,{x:g.x,y:g.y,target:g}));h.a.tickCast(c,(c.skills[i].windup||0)+1e-5);
 for(let t=0;t<1.5;t+=.05){c.attackCd=1e9;c.pendingAttack=null;h.step(.05);let s=h.a.shots.find(s=>s.reflectionCount);if(s&&!vis)vis=s.visualSource?.hero}
 c.attackCd=99;return {raw:ev.filter(e=>deflect?e.sourceType==='REFLECTED_PROJECTILE':true).reduce((a,e)=>a+e.rawAmount,0),n:ev.length,vis,c,g}}
for(let [id,i,pre] of [['lux',0],['yasuo',0,c=>c.championState={qStacks:2}],['ashe',1],['khazix',1]]){let a=run(id,i,false,pre),b=run(id,i,true,pre);
 assert(Math.abs(a.raw-b.raw)<1,id+' raw '+a.raw+' vs reflected '+b.raw);assert.equal(b.vis,id,id+' keeps model');assert.equal(b.g.hp,b.g.maxHp,'genji unhurt')}
console.log('PASS Genji reflection: same raw damage, effects and projectile model as the original');
{const h=make();let g=h.reset('genji'),calls=[],ctx=new Proxy({save(){},restore(){},arc(...a){calls.push(a)}},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});h.env.drawCombatProjectile(ctx,{x:0,y:0,dx:1,dy:0,life:1,source:g,visualSource:{type:'tower',team:1},reflectionCount:1,speed:800,radius:9},1);assert(calls.some(a=>a[2]===11),'reflected tower shot keeps tower bolt model');console.log('PASS reflected tower projectile keeps its model')}
{const h=make(),m=h.a.m;let g=h.reset('genji');g.hp=g.maxHp=1e6;let y=h.a.enemy('yasuo',g.x+300,g.y);y.stun=0;y.hp=y.maxHp=1e6;let a1=h.a.enemy('lux',g.x+450,g.y,1),a2=h.a.enemy('lux',g.x+550,g.y,1);for(let t of [a1,a2]){t.hp=t.maxHp=1e6;t.team=y.team}
 let st=m.genji.state(g);st.deflectUntil=h.a.time+5;st.deflectAngle=0;y.championState={qStacks:2};h.ready(y,0,3);h.a.cast(y,0,{x:g.x,y:g.y});h.a.tickCast(y,(y.skills[0].windup||0)+1e-5);
 // 反弹后朝 deflectAngle=0（向右）飞，路径上依次穿过亚索与两名队友
 for(let i=0;i<150;i++){y.attackCd=a1.attackCd=a2.attackCd=1e9;h.a.update(.01)}let hit=[y,a1,a2].filter(t=>t.hp<t.maxHp).length;assert(hit>=2,'reflected tornado keeps piercing, hit '+hit);console.log('PASS reflected Yasuo tornado keeps piercing ('+hit+' targets)')}
