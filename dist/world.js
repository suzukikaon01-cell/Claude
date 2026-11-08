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
 const blocksA=[
  [[300,600],[350,555],[410,600],[415,940],[365,995],[300,975]],          // 边路侧上墙
  [[300,1135],[355,1090],[415,1130],[420,1470],[370,1530],[300,1515]],    // 边路侧下墙
  [[545,1040],[700,1000],[800,1095],[790,1285],[660,1350],[535,1255]],    // 中央岩块
  [[865,1115],[930,1090],[990,1150],[985,1200],[950,1225],[875,1205]],    // 中路/河道拐角
  [[565,1500],[655,1455],[735,1470],[750,1495],[690,1550],[575,1555]],    // 中路侧下块
  [[440,1640],[520,1610],[560,1650],[540,1700],[470,1720],[430,1690]]     // 基地出口
 ];
 function block(poly,kind='jungle'){let pts=poly.map(point),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);walls.push({x:(x0+x1)/2,y:(y0+y1)/2,w:x1-x0,h:y1-y0,angle:0,kind,poly:pts})}
 for(let poly of blocksA){let b=poly.map(reflectMid).reverse();for(let q of [poly,b]){block(q);block(mirror(q))}}
 const pits=[{...point([735,850]),r:132*s,opening:.15,name:'上河道空坑'},{...point([1665,1550]),r:132*s,opening:Math.PI+.15,name:'下河道空坑'}];
 for(let p of pits){let pts=[];for(let j=0;j<=12;j++){let a=p.opening+.72+j*(Math.PI*2-1.44)/12;pts.push([(p.x+Math.cos(a)*p.r)/s,(p.y+Math.sin(a)*p.r)/s])}wallLine(pts,38,'pit')}
 const laneBush=[[280,650,55,160],[280,1040,55,155],[280,1470,55,160]],jungleBushA=[[470,560,80,60],[478,1235,60,120],[840,1340,95,60],[880,985,90,60],[640,1430,90,50]];
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
