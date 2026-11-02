// Shared ground atlas: world coordinates are scaled once, independently of texture resolution.
window.createRiftGround=function(C){if(C.gameModeId==='ARAM')return createARAMGround(C);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=C.mapTextureSize;
 const g=canvas.getContext('2d'),s=C.world/2400,TAU=Math.PI*2;g.scale(C.mapTextureSize/C.world,C.mapTextureSize/C.world);
 let seed=56,rand=()=>{seed=seed*16807%2147483647;return seed/2147483647};
 g.fillStyle='#173e32';g.fillRect(0,0,C.world,C.world);g.lineCap='round';g.lineJoin='round';
 function route(points,width,color){if(!points.length)return;g.beginPath();g.moveTo(points[0].x,points[0].y);for(let p of points.slice(1))g.lineTo(p.x,p.y);g.strokeStyle=color;g.lineWidth=width;g.stroke()}
 function disk(p,r,color){g.beginPath();g.arc(p.x,p.y,r,0,TAU);g.fillStyle=color;g.fill()}
 for(let i=0;i<12000;i++){g.globalAlpha=.15+rand()*.22;g.fillStyle=rand()>.5?'#47724c':'#081e22';g.fillRect(rand()*C.world,rand()*C.world,(2+rand()*9)*s,(2+rand()*9)*s)}g.globalAlpha=1;
 route(C.map.river,C.map.riverWidth+80*s,'#16332f');route(C.map.river,C.map.riverWidth+36*s,'#365b4d');route(C.map.river,C.map.riverWidth,'#245b61');route(C.map.river,C.map.riverWidth*.66,'#327780');route(C.map.river,C.map.riverWidth*.22,'#45888a44');
 for(let p of C.map.trails){route(p,65*s,'#264935');route(p,42*s,'#59644b');route(p,32*s,'#78806855')}
 for(let p of C.map.clearings){disk(p,85*s,'#203b32');disk(p,70*s,'#57634a');disk(p,50*s,'#6c6e5266')}
 for(let p of C.map.pits){disk(p,p.r,'#354f49');disk(p,p.r-16*s,'#1b343a');disk(p,p.r-31*s,'#2b5b62');g.strokeStyle='#72938566';g.lineWidth=3*s;g.beginPath();g.arc(p.x,p.y,p.r-24*s,0,TAU);g.stroke()}
 for(let path of C.map.paths){route(path,153*s,'#294d39');route(path,122*s,'#484f3b');route(path,101*s,'#7b7b5c');route(path,80*s,'#a29a7044');
  for(let j=1;j<path.length;j++){let a=path[j-1],b=path[j],d=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x);for(let k=20*s;k<d;k+=34*s){g.save();g.translate(a.x+(b.x-a.x)*k/d,a.y+(b.y-a.y)*k/d);g.rotate(angle);g.strokeStyle='#c2ba8d44';g.lineWidth=s;g.strokeRect(-10*s,-18*s,20*s,36*s);g.restore()}}
 }
 for(let [team,p] of C.map.bases.entries()){disk(p,218*s,'#334b42');disk(p,190*s,'#607264');disk(p,153*s,'#788375');g.beginPath();g.arc(p.x,p.y,165*s,0,TAU);g.strokeStyle=team?'#d4787955':'#70b9c455';g.lineWidth=12*s;g.stroke();for(let i=0;i<12;i++){g.save();g.translate(p.x,p.y);g.rotate(i*TAU/12);g.fillStyle='#b6b9a366';g.fillRect(172*s,-12*s,20*s,24*s);g.restore()}}
 for(let w of C.map.walls){if(w.polygonVertices){g.beginPath();w.polygonVertices.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.fillStyle=w.kind==='pit'?'#71837c':'#617864';g.fill();continue}g.save();g.translate(w.x,w.y);g.rotate(w.angle);g.fillStyle='#0d2728';g.fillRect(-w.w/2-8*s,-w.h/2-6*s,w.w+16*s,w.h+18*s);g.fillStyle=w.kind==='base'?'#7b8878':'#617864';g.fillRect(-w.w/2,-w.h/2,w.w,w.h);g.fillStyle='#3c613d';g.fillRect(-w.w/2,-w.h/2,w.w,w.h*.43);g.restore()}
 for(let b of C.map.bushes){g.save();if(b.polygonVertices){g.beginPath();b.polygonVertices.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.clip()}g.fillStyle='#4f8d5d77';g.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);g.strokeStyle='#8bb77c88';g.lineWidth=2*s;for(let i=0;i<b.w*b.h/(250*s*s);i++){let x=b.x+(rand()-.5)*b.w,y=b.y+(rand()-.5)*b.h;g.beginPath();g.moveTo(x-3*s,y+6*s);g.lineTo(x,y-8*s);g.lineTo(x+3*s,y+5*s);g.stroke()}g.restore()}
 return canvas;
};
