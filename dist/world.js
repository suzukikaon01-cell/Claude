// Original PC Rift inspired terrain; shared by physics, minimap and 3D rendering.
(()=>{
 const C=GAME_CONFIG,s=C.world/2400,point=([x,y])=>({x:x*s,y:y*s});
 C.rewardRadius=900;C.plateThresholds=[.95,.85,.70,.50,.25];C.plateGold=150;C.towerKillGold=600;C.outerTowerBonus=300;C.firstBloodBonus=100;
 C.towerTiers=[{name:'外塔',hp:7500,armor:150,mr:150,position:.36,attack:C.tower.attack},{name:'二塔',hp:4500,armor:200,mr:200,position:.22,attack:C.tower.attack},{name:'高地塔',hp:8000,armor:200,mr:200,position:.10,attack:C.tower.attack}];C.nexus={...C.nexus,hp:13500,armor:200,mr:200};
 const bases=[[240,2160],[2160,240]],top=[bases[0],[205,1830],[190,1330],[195,840],[230,510],[360,300],[620,220],[1080,190],[1570,195],[1910,210],bases[1]];
 const bottom=top.map(([x,y])=>[2400-y,2400-x]),mid=[bases[0],[520,1880],[850,1550],[1200,1200],[1550,850],[1880,520],bases[1]];
 const river=[[230,310],[460,530],[700,770],[940,1000],[1200,1200],[1460,1400],[1700,1630],[1940,1870],[2170,2090]],paths=[top,mid,bottom].map(p=>p.map(point)),walls=[];
 function wallLine(points,width=48,kind='jungle'){for(let i=1;i<points.length;i++){let a=point(points[i-1]),b=point(points[i]);walls.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2,w:Math.hypot(b.x-a.x,b.y-a.y)+12*s,h:width*s,angle:Math.atan2(b.y-a.y,b.x-a.x),kind})}}
 const mirror=points=>points.map(([x,y])=>[2400-x,2400-y]);
 // V20 原创野区：大块凸多边形墙体 + 清晰通道。只设计蓝方上半野区（A 区），其余三个野区由对称生成：
 //  沿中路轴镜像 (x,y)→(2400-y,2400-x) 得到蓝方下半野区，再中心对称 (x,y)→(2400-x,2400-y) 得到红方两片野区。
 const reflectMid=([x,y])=>[2400-y,2400-x];
 // 车道半宽（与地面贴图的土路宽度一致）。路边墙紧贴车道内侧；上/下路外侧到地图边缘整片为边界墙，不可走出、不可位移出去。
 const LW=62,laneX=y=>{for(let i=1;i<top.length;i++){let [x0,y0]=top[i-1],[x1,y1]=top[i];if((y-y0)*(y-y1)<=0&&y0!==y1)return x0+(x1-x0)*(y-y0)/(y1-y0)}return top[1][0]};
 const hug=(y0,y1,t)=>{let ys=[y0,(2*y0+y1)/3,(y0+2*y1)/3,y1],inner=ys.map(y=>[laneX(y)+LW+2,y]),outer=ys.map(y=>[laneX(y)+LW+2+t,y]);outer[0][1]+=t*.4;outer[3][1]-=t*.4;return inner.concat(outer.reverse())};
 const shrink=(poly,k=.72)=>{let cx=poly.reduce((a,p)=>a+p[0],0)/poly.length,cy=poly.reduce((a,p)=>a+p[1],0)/poly.length;return poly.map(([x,y])=>[cx+(x-cx)*k,cy+(y-cy)*k])};
 const blocksA=[
  hug(565,985,48),                                                        // 边路侧上墙（紧贴车道）
  hug(1095,1525,48),                                                      // 边路侧下墙（紧贴车道）
  shrink([[545,1040],[700,1000],[800,1095],[790,1285],[660,1350],[535,1255]]),   // 中央岩块
  shrink([[865,1115],[930,1090],[990,1150],[985,1200],[950,1225],[875,1205]],.8),
  shrink([[565,1500],[655,1455],[735,1470],[750,1495],[690,1550],[575,1555]],.8),
  shrink([[440,1640],[520,1610],[560,1650],[540,1700],[470,1720],[430,1690]],.8)
 ];
 function inside(pts,x,y){let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){let a=pts[i],b=pts[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c}return c}
 // 墙的 x/y 取多边形内部的点（细长弯墙的外接矩形中心可能落在墙外）。
 function block(poly,kind='jungle'){let pts=poly.map(point),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),cx=(x0+x1)/2,cy=(y0+y1)/2;
  if(!inside(pts,cx,cy)){let best=null;for(let i=1;i<20&&!best;i++)for(let j=1;j<20;j++){let x=x0+(x1-x0)*i/20,y=y0+(y1-y0)*j/20;if(inside(pts,x,y)){let d=Math.hypot(x-cx,y-cy);if(!best||d<best.d)best={x,y,d}}}if(best){cx=best.x;cy=best.y}}
  walls.push({x:cx,y:cy,w:x1-x0,h:y1-y0,angle:0,kind,poly:pts})}
 for(let poly of blocksA){let b=poly.map(reflectMid).reverse();for(let q of [poly,b]){block(q);block(mirror(q))}}
 const clip=([x,y])=>[Math.max(-20,Math.min(2420,x)),Math.max(-20,Math.min(2420,y))],FAR=420;
 function boundary(path){let n=[];for(let i=1;i<path.length;i++){let [ax,ay]=path[i-1],[bx,by]=path[i],dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,mx=(ax+bx)/2-1200,my=(ay+by)/2-1200;if(nx*mx+ny*my<0){nx=-nx;ny=-ny}n.push([nx,ny,dx/l,dy/l]);
   let q=[[ax+nx*LW,ay+ny*LW],[(ax+bx)/2+nx*LW,(ay+by)/2+ny*LW],[bx+nx*LW,by+ny*LW],[bx+nx*FAR,by+ny*FAR],[(ax+bx)/2+nx*FAR,(ay+by)/2+ny*FAR],[ax+nx*FAR,ay+ny*FAR]].map(clip);block(q,'boundary')}
  for(let i=1;i<n.length;i++){let [x,y]=path[i],[n1x,n1y]=n[i-1],[n2x,n2y]=n[i],mx=(n1x+n2x)/2,my=(n1y+n2y)/2,ml=Math.hypot(mx,my)||1;mx/=ml;my/=ml;
   block([[x+n1x*LW,y+n1y*LW],[x+mx*LW,y+my*LW],[x+n2x*LW,y+n2y*LW],[x+n2x*FAR,y+n2y*FAR],[x+mx*FAR,y+my*FAR],[x+n1x*FAR,y+n1y*FAR]].map(clip),'boundary')}
  for(let [k,sign] of [[0,-1],[n.length-1,1]]){let [x,y]=path[k===0?0:path.length-1],[nx,ny,dx,dy]=n[k];dx*=sign;dy*=sign;
   block([[x+nx*LW,y+ny*LW],[x+nx*LW+dx*FAR*.5,y+ny*LW+dy*FAR*.5],[x+nx*LW+dx*FAR,y+ny*LW+dy*FAR],[x+nx*FAR+dx*FAR,y+ny*FAR+dy*FAR],[x+nx*FAR+dx*FAR*.5,y+ny*FAR+dy*FAR*.5],[x+nx*FAR,y+ny*FAR]].map(clip),'boundary')}}
 boundary(top);boundary(bottom);
 // 左上/右下地图角落：车道拐角外侧剩余的空地也封为边界墙（顶点保持在车道外缘之外）。
 {let seg=(p,a,b)=>{let dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t)},far=p=>Math.min(...top.slice(1).map((b,i)=>seg(p,top[i],b)));
  let corner=[];for(let k=0;k<=8;k++){let a=k/8*Math.PI/2,lo=0,hi=900;for(let it=0;it<30;it++){let r=(lo+hi)/2,p=[Math.cos(a)*r,Math.sin(a)*r];if(far(p)>LW+4)lo=r;else hi=r}corner.push([Math.cos(a)*lo,Math.sin(a)*lo])}
  let poly=[[-20,-20],...corner.reverse().map(clip)];block(poly,'boundary');block(mirror(poly),'boundary')}
 const pits=[{...point([735,850]),r:132*s,opening:.15,name:'上河道空坑'},{...point([1665,1550]),r:132*s,opening:Math.PI+.15,name:'下河道空坑'}];
 for(let p of pits){let pts=[];for(let j=0;j<=12;j++){let a=p.opening+.72+j*(Math.PI*2-1.44)/12;pts.push([(p.x+Math.cos(a)*p.r)/s,(p.y+Math.sin(a)*p.r)/s])}wallLine(pts,38,'pit')}
 const laneBush=[[226,650,46,160],[222,1040,46,155],[226,1470,46,160]],jungleBushA=[[470,560,80,60],[478,1235,60,120],[840,1340,95,60],[880,985,90,60],[640,1430,90,50]];
 const bushes=[...laneBush,...jungleBushA].flatMap(([x,y,w,h])=>{let [rx,ry]=reflectMid([x,y]);return[[x,y,w,h],[rx,ry,h,w]]});
 const campsA=[[470,740],[478,930],[478,1390]],clearings=campsA.flatMap(c=>[c,reflectMid(c)]);
 const trailA=[[[478,560],[478,930],[478,1390],[440,1580]],[[478,1100],[700,1395],[850,1310],[1010,1260]],[[478,700],[620,900]]];
 const trails=trailA.flatMap(t=>[t,t.map(reflectMid)]);
 const brush=bushes.concat(bushes.map(([x,y,w,h])=>[2400-x,2400-y,w,h]));
 C.map={name:'裂境峡谷 · 端游布局',bases:bases.map(point),paths,river:river.map(point),riverWidth:150*s,walls,pits,camps:[],clearings:clearings.concat(mirror(clearings)).map(point),trails:trails.concat(trails.map(mirror)).map(p=>p.map(point)),bushes:brush.map(([x,y,w,h],id)=>({id,...point([x,y]),w:w*s,h:h*s}))};
 C.map.wallContains=(w,x,y,r=0)=>{let dx=x-w.x,dy=y-w.y,c=Math.cos(w.angle||0),sn=Math.sin(w.angle||0);return Math.abs(dx*c+dy*sn)<w.w/2+r&&Math.abs(-dx*sn+dy*c)<w.h/2+r};
 // Spatial bins accelerate terrain checks without changing collision geometry.
 const originalWalls=walls,cells=new Map,cellSize=400;
 for(let w of walls){let c=Math.abs(Math.cos(w.angle)),sn=Math.abs(Math.sin(w.angle)),rx=(w.w*c+w.h*sn)/2,ry=(w.w*sn+w.h*c)/2;for(let x=Math.floor((w.x-rx)/cellSize);x<=Math.floor((w.x+rx)/cellSize);x++)for(let y=Math.floor((w.y-ry)/cellSize);y<=Math.floor((w.y+ry)/cellSize);y++){let key=x+','+y;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(w)}}
 C.map.queryWalls=(x,y,r=0)=>{if(C.map.walls!==originalWalls)return C.map.walls;let result=new Set;for(let i=Math.floor((x-r)/cellSize);i<=Math.floor((x+r)/cellSize);i++)for(let j=Math.floor((y-r)/cellSize);j<=Math.floor((y+r)/cellSize);j++)for(let w of cells.get(i+','+j)||[])result.add(w);return [...result]};
})();
