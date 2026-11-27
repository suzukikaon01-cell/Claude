/* V18 全地图战争迷雾（Fog of War）
 *
 * 只负责「画面」层的迷雾：单位是否可被选中/攻击仍由 game.js 的 visibleTo 判定，
 * 这里不改变任何战斗结果。思路：
 *  1. 地图按 cell 码划分网格，地图版本变化时一次性烘焙「不透明墙体」与「草丛编号」两张网格；
 *  2. 每 0.12 秒，从我方视野源（英雄、小兵、防御塔、水晶、守卫）向四周发射射线，
 *     射线遇到不透明墙体即停止；射线进入别的草丛格子时该格不计为可见，但射线继续前进；
 *  3. 结果写入 visible（当前可见）与 explored（曾经探索过）两张网格，
 *     再转成一张 n×n 的小 ImageData，拉伸绘制到世界坐标和小地图上。
 * 所有网格都是 TypedArray，更新过程不分配新对象，移动端也可以稳定运行。
 */
(()=>{'use strict';
const SOURCE_RANGE={hero:1400,minion:850,tower:1200,nexus:1200,inhibitor:1000,ward:900};
const SHADE={visible:0,explored:110,hidden:170};

window.createFogOfWar=function(C,options={}){
  const cell=options.cell||100,interval=options.interval??.12;
  let n=0,opaque=null,brush=null,visible=null,explored=null,stamp=null,stampId=0,revision=null,last=-Infinity,team=0;
  let canvas=null,image=null,dirty=true;

  // 地图版本或尺寸变化时重新烘焙静态网格。
  function bake(){
    const M=C.map;n=Math.ceil(C.world/cell);opaque=new Uint8Array(n*n);brush=new Int16Array(n*n).fill(-1);
    visible=new Uint8Array(n*n);explored=new Uint8Array(n*n);stamp=new Uint32Array(n*n);stampId=0;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const x=(i+.5)*cell,y=(j+.5)*cell,k=j*n+i;
      if(M.queryWalls&&M.wallContains){for(const w of M.queryWalls(x,y))if(w.visionBlockType==='OPAQUE'&&M.wallContains(w,x,y)){opaque[k]=1;break}}
      for(let b=0;b<(M.bushes||[]).length;b++){const B=M.bushes[b];if(M.brushContains?M.brushContains(B,x,y):Math.abs(x-B.x)<B.w/2&&Math.abs(y-B.y)<B.h/2){brush[k]=b;break}}
    }
    revision=M.revision;dirty=true;
    if(typeof document!=='undefined'&&document.createElement){canvas=document.createElement('canvas');canvas.width=n;canvas.height=n;const g=canvas.getContext&&canvas.getContext('2d');image=g?.createImageData?g.createImageData(n,n):null}
  }
  const index=(x,y)=>{const i=Math.floor(x/cell),j=Math.floor(y/cell);return i<0||j<0||i>=n||j>=n?-1:j*n+i};

  function castFrom(s,range){
    const k0=index(s.x,s.y);if(k0<0)return;const ownBrush=brush[k0];
    const rays=Math.max(24,Math.ceil(2*Math.PI*range/(cell*.9))),step=cell*.5,steps=Math.ceil(range/step);
    if(stamp[k0]!==stampId){stamp[k0]=stampId;visible[k0]=1;explored[k0]=1}
    for(let r=0;r<rays;r++){
      const a=r/rays*Math.PI*2,dx=Math.cos(a)*step,dy=Math.sin(a)*step;let x=s.x,y=s.y;
      for(let t=1;t<=steps;t++){
        x+=dx;y+=dy;const k=index(x,y);if(k<0||opaque[k])break;
        // 进入其他草丛：本格不可见，但视线可以继续越过草丛。
        if(brush[k]>=0&&brush[k]!==ownBrush&&t*step>110)continue;
        if(stamp[k]!==stampId){stamp[k]=stampId;visible[k]=1;if(!explored[k]){explored[k]=1}dirty=true}
      }
    }
  }

  function update(units,viewerTeam,now,force=false){
    if(!opaque||revision!==C.map.revision||n!==Math.ceil(C.world/cell))bake();
    if(!force&&now-last<interval&&viewerTeam===team)return false;
    last=now;team=viewerTeam;stampId++;if(stampId>4e9){stamp.fill(0);stampId=1}
    visible.fill(0);
    for(const u of units){
      if(u.team!==viewerTeam||!(u.hp>0)||u.death>0)continue;const range=u.visionRange||SOURCE_RANGE[u.type];if(!range)continue;castFrom(u,range);
    }
    dirty=true;return true;
  }

  function refreshImage(){
    if(!dirty||!image||!canvas)return;const d=image.data;
    for(let k=0,p=0;k<n*n;k++,p+=4){d[p]=6;d[p+1]=12;d[p+2]=20;d[p+3]=visible[k]?SHADE.visible:explored[k]?SHADE.explored:SHADE.hidden}
    canvas.getContext('2d').putImageData(image,0,0);dirty=false;
  }
  function draw(ctx){if(!opaque)return;refreshImage();if(!canvas)return;ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(canvas,0,0,C.world,C.world);ctx.restore()}

  return{
    update,draw,drawMini:draw,
    // 供测试和 AI 查询：该世界坐标当前是否处于我方视野格内。
    isVisible:(x,y)=>{const k=index(x,y);return k>=0&&visible?.[k]===1},
    isExplored:(x,y)=>{const k=index(x,y);return k>=0&&explored?.[k]===1},
    isOpaque:(x,y)=>{const k=index(x,y);return k>=0&&opaque?.[k]===1},
    reset(){if(explored)explored.fill(0);if(visible)visible.fill(0);last=-Infinity;dirty=true},
    stats:()=>({cell,size:n,visible:visible?visible.reduce((a,b)=>a+b,0):0,explored:explored?explored.reduce((a,b)=>a+b,0):0})
  };
};
})();
