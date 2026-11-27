/* V20 草丛避开防御塔：任何草丛（含边缘）都不得进入防御塔/水晶枢纽的攻击范围（再留 60 码余量）。
 * 做法：对每个与塔范围重叠的草丛，沿草丛长边方向远离该塔平移（每步 20 码），直到对所有塔都安全且不压到墙体；
 * 召唤师峡谷与极地大乱斗地图都处理。只改坐标，不改草丛大小与形状。 */
(()=>{'use strict';
const C=window.GAME_CONFIG,M=C?.map;if(!M?.bushes)return;
const MARGIN=60,STEP=20,MAX_SHIFT=1600;
const polyOf=b=>b.polygonVertices?.length?b.polygonVertices:[{x:b.x-b.w/2,y:b.y-b.h/2},{x:b.x+b.w/2,y:b.y-b.h/2},{x:b.x+b.w/2,y:b.y+b.h/2},{x:b.x-b.w/2,y:b.y+b.h/2}];
function inside(poly,p){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c}return c}
function segDist(p,a,b){let dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)}
function polyDist(poly,p){if(inside(poly,p))return 0;let d=Infinity;for(let i=0;i<poly.length;i++)d=Math.min(d,segDist(p,poly[i],poly[(i+1)%poly.length]));return d}
function shift(b,dx,dy){b.x+=dx;b.y+=dy;for(let v of b.polygonVertices||[]){v.x+=dx;v.y+=dy}}
function hitsWall(b,walls){if(!walls?.length)return false;let poly=polyOf(b);for(let w of walls){let wp=w.poly||[{x:w.x-w.w/2,y:w.y-w.h/2},{x:w.x+w.w/2,y:w.y-w.h/2},{x:w.x+w.w/2,y:w.y+w.h/2},{x:w.x-w.w/2,y:w.y+w.h/2}];if(poly.some(p=>inside(wp,p))||wp.some(p=>inside(poly,p)))return true}return false}
const violation=(b,towers)=>{let poly=polyOf(b),worst=null;for(let t of towers){let need=t.range+MARGIN-polyDist(poly,t);if(need>0&&(!worst||need>worst.need))worst={t,need}}return worst};
// 地图中心对称（(x,y)→(S-x,S-y)）：成对处理镜像草丛，镜像草丛做镜像位移，保证双方地形公平。
function partnerOf(b,bushes,S){return bushes.find(o=>o!==b&&Math.abs(o.x-(S-b.x))<40&&Math.abs(o.y-(S-b.y))<40)}
function fixSym(bushes,towers,walls,bounds,S){let moved=[],seen=new Set;const ok=x=>!violation(x,towers)&&!hitsWall(x,walls)&&(!bounds||x.x>=bounds.min&&x.x<=bounds.max&&x.y>=bounds.min&&x.y<=bounds.max);
 for(let b of bushes){if(seen.has(b))continue;let q=partnerOf(b,bushes,S);seen.add(b);if(q)seen.add(q);if(!violation(b,towers)&&(!q||!violation(q,towers)))continue;
  let best=null,long=(b.h||0)>(b.w||0),axes=long?[[0,1],[1,0]]:[[1,0],[0,1]];
  for(let [ax,ay] of axes){for(let sign of [1,-1]){for(let d=STEP;d<=MAX_SHIFT;d+=STEP){let dx=ax*sign*d,dy=ay*sign*d;shift(b,dx,dy);if(q)shift(q,-dx,-dy);let good=ok(b)&&(!q||ok(q));shift(b,-dx,-dy);if(q)shift(q,dx,dy);if(good){if(!best||d<best.d)best={d,dx,dy};break}}}if(best)break}
  if(best){shift(b,best.dx,best.dy);if(q)shift(q,-best.dx,-best.dy);moved.push({id:b.id,dx:best.dx,dy:best.dy});if(q)moved.push({id:q.id,dx:-best.dx,dy:-best.dy})}}
 return moved.concat(fix(bushes,towers,walls,bounds))}
function fix(bushes,towers,walls,bounds){let moved=[];for(let b of bushes){let v=violation(b,towers);if(!v)continue;let long=(b.h||0)>(b.w||0),axes=long?[[0,1],[1,0]]:[[1,0],[0,1]],done=false,ox=b.x,oy=b.y;
  for(let [ax,ay] of axes){for(let sign of [Math.sign((b.x-v.t.x)*ax+(b.y-v.t.y)*ay)||1,-(Math.sign((b.x-v.t.x)*ax+(b.y-v.t.y)*ay)||1)]){let total=0;while(total<MAX_SHIFT){shift(b,ax*sign*STEP,ay*sign*STEP);total+=STEP;if(bounds&&(b.x<bounds.min||b.x>bounds.max||b.y<bounds.min||b.y>bounds.max))break;if(!violation(b,towers)&&!hitsWall(b,walls)){done=true;break}}if(done)break;shift(b,ox-b.x,oy-b.y)}if(done)break}
  if(done)moved.push({id:b.id,dx:Math.round(b.x-ox),dy:Math.round(b.y-oy)})}return moved}
function srTowers(){let out=[];if(typeof M.towerPoint!=='function')return out;for(let lane=0;lane<3;lane++)for(let team=0;team<2;team++)for(let tier=0;tier<3;tier++){let p=M.towerPoint(lane,team,tier);if(!p)continue;let v={...C.tower,...(C.towerTiers?.[tier]||{})};out.push({x:p.x,y:p.y,range:v.range})}
 for(let b of M.bases||[])if(b&&Number.isFinite(b.x))out.push({x:b.x,y:b.y,range:(C.nexus?.range||0)*2.5});return out}
let srMoved=fixSym(M.bushes,srTowers(),M.walls,{min:200,max:14800},15000);
let aramMoved=[];if(C.aram?.bushes&&C.aram.tower_positions){let r=C.tower.range*(C.aram.tower_range_multiplier||1),towers=C.aram.tower_positions.flat().map(p=>({x:p.x,y:p.y,range:r}));for(let [i,p] of (C.aram.nexus_positions||[]).entries())if(p)towers.push({x:p.x,y:p.y,range:(C.nexus?.range||0)*2.5});aramMoved=fix(C.aram.bushes,towers,null,null)}
if(srMoved.length){M.revision=(M.revision||0)+1;try{M.rebuildTerrainIndex?.()}catch(e){}}
C.bushTowerFixV20={srMoved,aramMoved,violation:(b,t)=>violation(b,t),srTowers,polyDist,polyOf};
})();
