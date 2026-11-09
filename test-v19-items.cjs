// V19 原创装备：山岳巨颚、熔铸心甲。
const make=require('./test-harness.cjs'),assert=require('assert');let count=0;
const test=(name,f)=>{f();console.log('PASS V19I '+name);count++};
function scene(hero='garen'){let h=make();h.a.reset(hero,true);let p=h.a.p,m=h.a.m;p.level=13;let q=h.C.map.nearestLegal({x:7500,y:7500},30);p.x=q.x;p.y=q.y;for(let u of h.a.units)if(u.type==='hero'&&u!==p){u.x=200;u.y=200}return{h,p,m,q}}
test('items exist in shop with recipes and prices',()=>{let h=make();for(let [id,c] of [['GIANT_MAW',3300],['FORGED_HEART',3200]]){let it=h.C.items.find(i=>i.id===id);assert(it&&it.cost===c&&it.recipe.length)}});
test('GIANT_MAW adds 1.5% max HP on-hit and cleaves behind target',()=>{let r=[];for(let own of [false,true]){let {h,p,m,q}=scene();if(own)p.items=['GIANT_MAW'];m.recalc(p);let a=h.a.enemy('garen',q.x+150,q.y),b=h.a.enemy('garen',q.x+350,q.y),c=h.a.enemy('garen',q.x-150,q.y);for(let e of [a,b,c]){e.stun=0;e.hp=e.maxHp=1e5;e.armor=0}for(let i=0;i<60;i++){m.attack(p,a);h.step(1/60)}r.push([1e5-a.hp,1e5-b.hp,1e5-c.hp,p.maxHp])}
 let [o,w]=r;assert(w[0]-o[0]>=w[3]*.015*.9,'main bonus '+w[0]+' '+o[0]);assert(w[1]>=w[3]*.015*.9,'cleave '+w[1]);assert.equal(w[2],0,'no hit in front/behind attacker')});
test('FORGED_HEART: +2.5% bonus HP as AD, low HP up to +10%',()=>{let {h,p,m}=scene();m.recalc(p);let base=p.attack;p.items=['FORGED_HEART'];m.recalc(p);let full=p.attack;assert(Math.abs(full-(base+25+650*.025))<1,full+' vs '+base);p.hp=1;m.recalc(p);assert(Math.abs(p.attack-full*1.1)<1.5,'low '+p.attack);p.hp=p.maxHp*.25;h.step(.2);assert(Math.abs(p.attack-full*1.05)<1.5,'mid '+p.attack)});
console.log('V19 item tests passed: '+count);
