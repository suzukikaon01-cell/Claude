// V19 装备预约：整件可买就买整件，否则推荐买得起且价值最高的缺失组件；不在泉水时不推荐立刻购买。
const make=require('./test-harness.cjs'),assert=require('assert');let count=0;
const test=(name,f)=>{f();console.log('PASS V19R '+name);count++};
function setup(){let h=make();h.a.reset('garen',true);let p=h.a.p,I=h.env.ItemSystem;p.items=[];p.x=h.C.map.bases[p.team].x;p.y=h.C.map.bases[p.team].y;return{h,p,I}}
test('no reservation means no plan',()=>{let {h,p}=setup();p.reservedItem=null;assert.equal(h.a.reservePlan(p),null)});
test('full gold recommends the finished item at quoted cost',()=>{let {h,p,I}=setup();p.reservedItem='trinity';p.gold=99999;let plan=h.a.reservePlan(p);assert.equal(plan.next.id,'trinity');assert.equal(plan.next.cost,I.quote(p,'trinity').cost)});
test('partial gold recommends the most valuable affordable missing component',()=>{let {h,p,I}=setup();p.reservedItem='trinity';let parts=[];const walk=id=>{for(let c of I.get(id).components||[]){parts.push(c);walk(c)}};walk('trinity');let costs=parts.map(c=>I.get(c).cost).sort((a,b)=>a-b);p.gold=costs[Math.floor(costs.length/2)];let plan=h.a.reservePlan(p);assert(plan.next,'has suggestion');assert(plan.next.id!=='trinity');assert(plan.next.cost<=p.gold);let better=parts.filter(c=>I.quote(p,c).cost<=p.gold&&I.validatePurchase(p,c,{canShop:true}).ok).map(c=>I.quote(p,c).cost);assert.equal(plan.next.cost,Math.max(...better))});
test('owned components are discounted and removed from missing list',()=>{let {h,p,I}=setup();p.reservedItem='trinity';let first=I.get('trinity').components[0];p.items=[first];let plan=h.a.reservePlan(p);assert(!plan.direct.some(m=>m.id===first));assert(plan.progress>0);assert.equal(plan.remaining,I.quote(p,'trinity').cost)});
test('no gold gives no purchase suggestion',()=>{let {h,p}=setup();p.reservedItem='trinity';p.gold=0;assert.equal(h.a.reservePlan(p).next,null)});
test('following the plan repeatedly builds the reserved item',()=>{let {h,p}=setup();p.reservedItem='trinity';p.gold=99999;for(let i=0;i<8;i++){let plan=h.a.reservePlan(p);if(!plan||plan.done)break;h.a.buy(plan.next.id)}assert(p.items.includes('trinity'))});
test('panel renders without errors and clears when built',()=>{let {h,p}=setup();p.reservedItem='trinity';p.gold=99999;h.a.renderReserve();h.a.buy('trinity');h.a.renderReserve();assert.equal(p.reservedItem,null)});
console.log('V19 reserve tests passed: '+count);
