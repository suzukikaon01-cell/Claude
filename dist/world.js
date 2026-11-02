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
 const ridges=[
  [[355,715],[410,790],[410,1010],[470,1070]],[[480,785],[610,800],[675,890],[675,1000]],
  [[460,1180],[485,1270],[640,1290],[730,1210]],[[360,1450],[440,1510],[545,1490],[590,1410]],
  [[800,1135],[890,1130],[965,1035]],[[740,660],[860,590],[1020,590],[1090,690]],
  [[1070,810],[1100,920],[1020,1000]],[[830,1750],[920,1690],[1060,1720],[1110,1820]],
  [[980,1950],[1130,1990],[1260,1920],[1280,1810]],[[1370,1940],[1490,1930],[1560,1830]],
  [[1270,1580],[1340,1630],[1480,1600]],[[1580,2050],[1690,2050],[1770,1990]],
  [[380,1870],[480,1800],[565,1780]],[[690,1970],[725,2060],[845,2110]]
 ];
 for(let ridge of ridges){wallLine(ridge);wallLine(mirror(ridge))}
 for(let ridge of [[[300,1770],[310,1650],[390,1570]],[[820,2040],[900,2100],[1020,2100]]]){wallLine(ridge,56,'base');wallLine(mirror(ridge),56,'base')}
 const pits=[{...point([735,850]),r:132*s,opening:.15,name:'上河道空坑'},{...point([1665,1550]),r:132*s,opening:Math.PI+.15,name:'下河道空坑'}];
 for(let p of pits){let pts=[];for(let j=0;j<=12;j++){let a=p.opening+.72+j*(Math.PI*2-1.44)/12;pts.push([(p.x+Math.cos(a)*p.r)/s,(p.y+Math.sin(a)*p.r)/s])}wallLine(pts,38,'pit')}
 const bushes=[[280,650,55,160],[280,1040,55,155],[280,1470,55,160],[600,300,170,55],[1060,280,150,55],[1520,280,155,55],[440,1120,100,60],[720,1340,130,65],[1000,1510,110,65],[1190,1810,110,65],[1650,1930,100,65],[920,850,95,65],[1030,1140,70,90],[570,590,65,100]];
 const brush=bushes.concat(bushes.map(([x,y,w,h])=>[2400-x,2400-y,w,h])),clearings=[[500,930],[570,1170],[500,1390],[970,1840],[1170,1880],[1500,2000],[900,700]];
 const trails=[[[300,1680],[500,1390],[570,1170],[500,930],[530,660],[390,400]],[[500,1390],[740,1340],[960,1160]],[[740,1340],[860,1550]],[[600,1940],[780,1830],[970,1840],[1170,1880],[1500,2000],[1870,2100]],[[1170,1880],[1200,1690],[1380,1500]],[[1500,2000],[1590,1780],[1700,1630]]];
 C.map={name:'裂境峡谷 · 端游布局',bases:bases.map(point),paths,river:river.map(point),riverWidth:150*s,walls,pits,camps:[],clearings:clearings.concat(mirror(clearings)).map(point),trails:trails.concat(trails.map(mirror)).map(p=>p.map(point)),bushes:brush.map(([x,y,w,h],id)=>({id,...point([x,y]),w:w*s,h:h*s}))};
 C.map.wallContains=(w,x,y,r=0)=>{let dx=x-w.x,dy=y-w.y,c=Math.cos(w.angle||0),sn=Math.sin(w.angle||0);return Math.abs(dx*c+dy*sn)<w.w/2+r&&Math.abs(-dx*sn+dy*c)<w.h/2+r};
 // Spatial bins accelerate terrain checks without changing collision geometry.
 const originalWalls=walls,cells=new Map,cellSize=400;
 for(let w of walls){let c=Math.abs(Math.cos(w.angle)),sn=Math.abs(Math.sin(w.angle)),rx=(w.w*c+w.h*sn)/2,ry=(w.w*sn+w.h*c)/2;for(let x=Math.floor((w.x-rx)/cellSize);x<=Math.floor((w.x+rx)/cellSize);x++)for(let y=Math.floor((w.y-ry)/cellSize);y<=Math.floor((w.y+ry)/cellSize);y++){let key=x+','+y;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(w)}}
 C.map.queryWalls=(x,y,r=0)=>{if(C.map.walls!==originalWalls)return C.map.walls;let result=new Set;for(let i=Math.floor((x-r)/cellSize);i<=Math.floor((x+r)/cellSize);i++)for(let j=Math.floor((y-r)/cellSize);j<=Math.floor((y+r)/cellSize);j++)for(let w of cells.get(i+','+j)||[])result.add(w);return [...result]};
})();
