/* V20 查莉娅技能特效重做（原创绘制，参照"粒子屏障/投射屏障/重力喷涌/粒子炮"的视觉方向，不使用任何官方素材）：
 * - 粒子屏障/投射屏障：粉色半透明能量泡，渐变+蜂窝纹+高光弧+亮边，弹出动画，吸收伤害时闪烁，结束前淡出；
 * - 重力喷涌：飞行中为暗紫核心+品红旋带；落地形成引力漩涡（旋转螺旋臂、向心粒子、暗色脉动核心、外圈旋转虚线）；
 * - 粒子榴弹（普攻）：带拖尾的粉色能量球，命中时粉色闪光、冲击环与放射火花。 */
(()=>{'use strict';
const PINK='255,110,214',LIGHT='255,205,245',DEEP='120,40,170';
const hash=n=>{let x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
function bubble(ctx,u,T){let list=(u.shields||[]).filter(s=>s.zaryaOwner&&(s.amount??s.value??1)>0);if(!list.length)return;let b=u.zaryaBubble||{start:T-1},amt=list.reduce((a,s)=>a+(s.amount??s.value??0),0),hit=0;if(u._zbLast!=null&&amt<u._zbLast-.5)u._zbHitAt=T;u._zbLast=amt;if(u._zbHitAt)hit=Math.max(0,1-(T-u._zbHitAt)/.18);
 let left=Math.min(...list.map(s=>(s.until??s.expires??T+1)-T)),fade=left<.4?.45+.55*Math.abs(Math.sin(T*22)):1,pop=Math.min(1,(T-b.start)/.18),R=((u.radius||22)+30)*(.6+.4*(1-Math.pow(1-pop,3)))*(1+.08*Math.max(0,1-(T-b.start)/.3));
 ctx.save();ctx.translate(u.x,u.y-18);ctx.globalAlpha=fade;
 let g=ctx.createRadialGradient?ctx.createRadialGradient(-R*.25,-R*.3,R*.1,0,0,R):null;if(g){g.addColorStop(0,'rgba('+LIGHT+',.06)');g.addColorStop(.7,'rgba('+PINK+','+(.16+.25*hit)+')');g.addColorStop(1,'rgba('+PINK+','+(.42+.4*hit)+')');ctx.fillStyle=g}else ctx.fillStyle='rgba('+PINK+',.2)';
 ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.clip();ctx.strokeStyle='rgba('+LIGHT+','+(.14+.2*hit)+')';ctx.lineWidth=1.2;let h=11,dy=h*1.5,dx=h*Math.sqrt(3),off=(T*8)%dy;for(let y=-R-dy;y<R+dy;y+=dy)for(let x=-R-dx;x<R+dx;x+=dx){let cx=x+((Math.round((y+R)/dy))%2?dx/2:0),cy=y+off;ctx.beginPath();for(let k=0;k<6;k++){let a=Math.PI/6+k*Math.PI/3;ctx.lineTo(cx+Math.cos(a)*h*.95,cy+Math.sin(a)*h*.95)}ctx.closePath();ctx.stroke()}ctx.restore();
 ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.strokeStyle='rgba('+LIGHT+','+(.75+.25*hit)+')';ctx.lineWidth=2.5+3*hit;ctx.stroke();
 ctx.beginPath();ctx.arc(0,0,R*.78,Math.PI*1.08,Math.PI*1.42);ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=4;ctx.lineCap='round';ctx.stroke();ctx.restore()}
function gravity(ctx,u,T){let g=u.v11Gravity;if(!g||T>g.until+.25)return;let R=g.params?.radius||270,life=Math.max(0,Math.min(1,(g.until-T)/Math.max(.1,g.until-g.started))),appear=Math.min(1,(T-g.started)/.2),end=T>g.until?1-(T-g.until)/.25:1,a=appear*end;
 ctx.save();ctx.translate(g.x,g.y);ctx.globalAlpha=Math.max(0,a);
 let bg=ctx.createRadialGradient?ctx.createRadialGradient(0,0,R*.05,0,0,R):null;if(bg){bg.addColorStop(0,'rgba(20,0,35,.75)');bg.addColorStop(.35,'rgba('+DEEP+',.35)');bg.addColorStop(1,'rgba('+PINK+',.05)');ctx.fillStyle=bg}else ctx.fillStyle='rgba('+DEEP+',.25)';ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.fill();
 ctx.setLineDash?.([18,12]);ctx.lineDashOffset=-T*60;ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.strokeStyle='rgba('+PINK+',.6)';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash?.([]);
 ctx.lineCap='round';for(let arm=0;arm<3;arm++){ctx.beginPath();for(let s=0;s<=40;s++){let f=s/40,ang=arm*Math.PI*2/3+T*2.6+f*4.2,r=R*(1-f)*.95+6;ctx.lineTo(Math.cos(ang)*r,Math.sin(ang)*r)}ctx.strokeStyle='rgba('+PINK+',.55)';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle='rgba('+LIGHT+',.8)';ctx.lineWidth=2;ctx.stroke()}
 for(let i=0;i<26;i++){let ph=(T*.9+hash(i))%1,ang=hash(i+7)*Math.PI*2+T*1.5*(1-ph),r=R*(1-ph);ctx.fillStyle='rgba('+LIGHT+','+(.3+.6*ph)+')';ctx.beginPath();ctx.arc(Math.cos(ang)*r,Math.sin(ang)*r,1.5+2.5*ph,0,Math.PI*2);ctx.fill()}
 let pulse=1+.12*Math.sin(T*14),core=ctx.createRadialGradient?ctx.createRadialGradient(0,0,0,0,0,R*.22*pulse):null;if(core){core.addColorStop(0,'rgba(10,0,20,.95)');core.addColorStop(.6,'rgba('+DEEP+',.85)');core.addColorStop(1,'rgba('+PINK+',0)');ctx.fillStyle=core}ctx.beginPath();ctx.arc(0,0,R*.22*pulse,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(0,0,R*.14*pulse,0,Math.PI*2);ctx.strokeStyle='rgba('+LIGHT+',.9)';ctx.lineWidth=2;ctx.stroke();ctx.restore()}
function blasts(ctx,u,T){let L=u.zaryaBlasts;if(!L?.length)return;u.zaryaBlasts=L.filter(b=>T-b.start<.45);for(let b of u.zaryaBlasts){let k=(T-b.start)/.45,e=1-Math.pow(1-k,3);ctx.save();ctx.translate(b.x,b.y);ctx.globalAlpha=1-k;
 if(k<.25){ctx.beginPath();ctx.arc(0,0,b.r*.55*(1-k*2),0,Math.PI*2);ctx.fillStyle='rgba(255,240,252,.85)';ctx.fill()}
 ctx.beginPath();ctx.arc(0,0,b.r*(.35+.65*e),0,Math.PI*2);ctx.fillStyle='rgba('+PINK+','+(.22*(1-k))+')';ctx.fill();ctx.strokeStyle='rgba('+LIGHT+',.9)';ctx.lineWidth=5*(1-k)+1;ctx.stroke();
 for(let i=0;i<12;i++){let a=i*Math.PI/6+hash(b.start*10+i),r0=b.r*.25*e,r1=b.r*(.55+.5*e)*(.7+.3*hash(i+b.start));ctx.beginPath();ctx.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);ctx.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);ctx.strokeStyle='rgba('+PINK+',.85)';ctx.lineWidth=2.5;ctx.stroke()}ctx.restore()}}
function draw(ctx,player,units,T,seen){for(let u of units){if(!(u.hp>0)||u.death>0)continue;let vis=!seen||seen(u);if(vis)bubble(ctx,u,T);if(u.hero!=='zarya')continue;gravity(ctx,u,T);blasts(ctx,u,T)}}
// 飞行道具：重力弹（暗紫核心+品红旋带）、粒子榴弹（带拖尾的粉色能量球）
function projectile(ctx,p,spin){if(p.v11Ground==='zarya-r'){ctx.shadowColor='rgba('+PINK+',1)';ctx.shadowBlur=20;let r=18;let g=ctx.createRadialGradient?ctx.createRadialGradient(0,0,2,0,0,r):null;if(g){g.addColorStop(0,'rgba(10,0,20,1)');g.addColorStop(.7,'rgba('+DEEP+',1)');g.addColorStop(1,'rgba('+PINK+',.6)');ctx.fillStyle=g}ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,r*1.7,r*.55,spin*2+i*Math.PI/3,0,Math.PI*2);ctx.strokeStyle='rgba('+PINK+',.75)';ctx.lineWidth=2;ctx.stroke()}return true}
 if(p.v11Ground==='zarya-aa'){ctx.shadowColor='rgba('+PINK+',1)';ctx.shadowBlur=16;for(let i=1;i<=5;i++){ctx.fillStyle='rgba('+PINK+','+(.45-.08*i)+')';ctx.beginPath();ctx.arc(-i*9,Math.sin(spin*3+i)*2,8-i,0,Math.PI*2);ctx.fill()}ctx.fillStyle='rgba(255,236,250,1)';ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba('+PINK+',1)';ctx.lineWidth=3;ctx.stroke();return true}return false}
window.ZaryaFxV20={draw,projectile,bubble,gravity};
})();
