const make=require('./test-harness.cjs'),assert=require('assert');const h=make(),C=h.C,F=C.bushTowerFixV20;
let p=h.reset('garen',true),tw=h.a.units.filter(u=>u.type==='tower'||u.type==='nexus');
for(let b of C.map.bushes)for(let t of tw)assert(F.polyDist(F.polyOf(b),t)>t.range,'bush '+b.id+' inside '+t.type+' range');
for(let b of C.map.bushes)assert(C.map.bushes.some(o=>Math.abs(o.x-(15000-b.x))<2&&Math.abs(o.y-(15000-b.y))<2),'bush '+b.id+' keeps point symmetry');
const inside=(poly,q)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a.y>q.y)!==(b.y>q.y)&&q.x<(b.x-a.x)*(q.y-a.y)/(b.y-a.y)+a.x)c=!c}return c};
for(let a of C.map.bushes)for(let b of C.map.bushes)if(a!==b)assert(!F.polyOf(a).some(v=>inside(F.polyOf(b),v)),'bushes '+a.id+'/'+b.id+' overlap');
for(let b of C.map.bushes)assert(!F.polyOf(b).some(v=>C.map.wallContains(v)),'bush '+b.id+' in wall');
assert(F.srMoved.length===6);
// ARAM
let r=C.tower.range*(C.aram.tower_range_multiplier||1);for(let b of C.aram.bushes)for(let t of C.aram.tower_positions.flat())assert(F.polyDist(F.polyOf(b),t)>r,'aram bush '+b.id);
console.log('PASS bushes: none inside tower/nexus range (SR + ARAM), symmetric, no overlap/walls');
