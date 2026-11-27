// V19 召唤师峡谷：小兵移速125；普通野怪在上下路第一波兵线交汇时刷新；模拟时钟每帧最多补算4步。
const make=require('./test-harness.cjs'),assert=require('assert');let count=0;const test=(n,f)=>{f();console.log('PASS V19 '+n);count++};
test('minion base speed raised to 125',()=>{let h=make();h.a.reset('garen',true);assert.equal(h.C.minion.speed,125)});
test('jungle camps spawn when top and bottom first waves meet',()=>{let h=make();h.a.reset('garen',true);h.a.p.ai=true;h.a.p.player=false;let met={},first=null;
 const camp=u=>u.type==='monster'&&u.monsterId&&!/DRAKE|BARON|HERALD|VOID|SCUTTLER|COLOSSUS|ELDER|SHARD/.test(u.monsterId)&&u.hp>0;
 for(let i=0;i<1600&&first==null;i++){h.step(.1,.05);let t=(i+1)/10;for(let L of [0,2])if(met[L]==null){let b=h.a.units.filter(u=>u.type==='minion'&&u.lane===L&&u.team===0&&u.hp>0),r=h.a.units.filter(u=>u.type==='minion'&&u.lane===L&&u.team===1&&u.hp>0);if(b.some(x=>r.some(y=>Math.hypot(x.x-y.x,x.y-y.y)<500)))met[L]=t}if(h.a.units.some(camp))first=t}
 assert(met[0]!=null&&met[2]!=null,'both lanes met');assert(first!=null,'camps spawned');assert(first>=Math.max(met[0],met[2])-.11&&first<=Math.max(met[0],met[2])+.3,'spawn '+first+' meet '+JSON.stringify(met))});
console.log(count+' V19 SR pacing tests passed');
