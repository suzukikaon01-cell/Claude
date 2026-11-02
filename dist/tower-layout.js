// Latest balance: opposing outer towers 2.5x the preceding river-bank layout.
(()=>{'use strict';const C=GAME_CONFIG,M=C.map;
function point(path,t){let lengths=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y)),left=t*lengths.reduce((a,b)=>a+b,0);for(let i=0;i<lengths.length;i++){if(left<=lengths[i])return{x:path[i].x+(path[i+1].x-path[i].x)*left/lengths[i],y:path[i].y+(path[i+1].y-path[i].y)*left/lengths[i]};left-=lengths[i]}return path.at(-1)}
function segment(p,a,b){let dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)}
function riverDistance(p){return Math.min(...M.river.slice(1).map((b,i)=>segment(p,M.river[i],b)))}
const clearance=M.riverWidth/2+45;
M.towerPositions=M.paths.map(path=>{let near=[];for(let n=0;n<=4000;n++)if(riverDistance(point(path,n/4000))<=clearance)near.push(n/4000);let blue=Math.max(.25,(near[0]??.47)-.00025),red=Math.min(.75,(near.at(-1)??.53)+.00025),high=.11;return[[blue,(blue+high)/2,high],[red,(red+1-high)/2,1-high]]});
M.outerTowerPreviousPositions=M.towerPositions.map(lane=>lane.map(team=>team[0]));
M.outerTowerDistanceMultiplier=2.5;
for(let [lane,positions] of M.towerPositions.entries()){let path=M.paths[lane],blue=positions[0][0],red=positions[1][0],distance=delta=>{let a=point(path,blue-delta),b=point(path,red+delta);return Math.hypot(a.x-b.x,a.y-b.y)},target=distance(0)*M.outerTowerDistanceMultiplier,lo=0,hi=Math.min(blue-positions[0][1]-.02,positions[1][1]-red-.02);for(let i=0;i<40;i++){let mid=(lo+hi)/2;if(distance(mid)<target)lo=mid;else hi=mid}let shift=(lo+hi)/2;positions[0][0]=blue-shift;positions[1][0]=red+shift}
M.towerPoint=(lane,team,tier)=>point(M.paths[lane],M.towerPositions[lane][team][tier]);
M.riverDistance=riverDistance;M.towerRiverClearance=clearance;
})();
