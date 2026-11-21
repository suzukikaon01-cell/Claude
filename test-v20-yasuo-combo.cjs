const make=require('./test-harness.cjs'),assert=require('assert');
const fresh=id=>{let h=make();return {h,m:h.a.m,u:h.reset(id||'yasuo')}};
// E 贴脸也位移275
{let {h,m,u}=fresh(),t=h.a.enemy('garen',u.x+40,u.y);t.hp=t.maxHp=1e5;let x=u.x;h.ready(u,2);assert(h.a.cast(u,2,t));h.a.tickCast(u,.1);h.step(.4);assert(Math.abs((u.x-x)-275)<15,'E point-blank dash 275, got '+(u.x-x))}
// E 优先未锁定目标
{let {h,m,u}=fresh(),a=h.a.enemy('garen',u.x+150,u.y),b=h.a.enemy('lux',u.x+200,u.y+40);for(let t of [a,b])t.hp=t.maxHp=1e5;m.heroHooks.yasuo&&(u.championState||(u.championState={}));let z=u.championState;z.eTargets={[a.id]:h.a.time+5};let sel=m.heroHooks.yasuo.selectTarget(u,2,{target:a,x:a.x,y:a.y});assert.equal(sel,b,'locked target swapped to unlocked')}
// EQ 只在E位移期间
{let {h,m,u}=fresh(),t=h.a.enemy('garen',u.x+200,u.y);t.hp=t.maxHp=1e5;h.ready(u,2);h.a.cast(u,2,t);h.a.tickCast(u,.1);h.step(.4);h.ready(u,0);h.a.cast(u,0,{x:u.x+200,y:u.y});h.a.tickCast(u,.3);assert(!(u.championState.eqPending||[]).length,'Q after dash is normal Q')}
// 双风：EQ 期间按R缓存，EQ击飞后自动释放；EQ 之后结算仍叠层
{let {h,m,u}=fresh(),t=h.a.enemy('garen',u.x+200,u.y);t.hp=t.maxHp=1e5;t.stun=0;u.skillRanks=[1,1,1,1];let z=u.championState||(u.championState={});z.qStacks=2;z.qExpires=h.a.time+6;
 h.ready(u,2);h.a.cast(u,2,t);h.a.tickCast(u,.05);h.step(.05);h.ready(u,0);h.a.cast(u,0,{x:t.x,y:t.y});h.a.tickCast(u,(u.skills[0].windup||0)+1e-5);assert((z.eqPending||[]).length,'EQ pending');h.ready(u,3);h.a.cast(u,3,{x:t.x,y:t.y});h.step(.4);assert(z.yasuoUlt||u.yasuoUltLockUntil>0,'buffered R fired after EQ knockup')}
// R 期间（E 冲刺中放R）不滑动
{let {h,m,u}=fresh(),t=h.a.enemy('garen',u.x+260,u.y);t.hp=t.maxHp=1e5;m.control(t,'airborne',1,u,{});h.ready(u,2);h.a.cast(u,2,{x:u.x+100,y:u.y+150,target:h.a.enemy('lux',u.x+100,u.y+150)});h.a.tickCast(u,.05);h.step(.05);h.ready(u,3);assert(h.a.cast(u,3,t));h.a.tickCast(u,(u.skills[3].windup||0)+1e-5);let x=u.x,y=u.y;h.step(.5);assert(Math.hypot(u.x-x,u.y-y)<5,'no sliding during R')}
console.log('PASS Yasuo: E 275 dash, unlocked-target priority, EQ only during dash, buffered R double-wind, no slide in R');
