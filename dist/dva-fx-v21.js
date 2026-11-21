/* V21 D.Va 特效重做（原创绘制，参照"防御矩阵/推进器/自毁"的视觉方向）：
 * W 防御矩阵：机甲双臂前方的长方形能量场（长 range、宽 width），双臂发射器光束、流动的蜂窝网格、亮边、吸收弹道时的闪光。
 * E 推进器：机甲背后两道喷火（外焰橙红、内焰黄白，随机闪烁）+ 尾迹火星。
 * R 自毁：倒计时期间机甲逐渐收缩、红光越来越亮、频闪越来越快；地面核心光晕逐渐扩大，最后0.3秒白光闪爆。 */
(()=>{'use strict';
const TAU=Math.PI*2,hash=n=>{let x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
// 长方形矩阵：返回局部坐标判定（供拦截使用）
function inMatrix(u,angle,W,p,pad=0){let x=p.x-u.x,y=p.y-u.y,c=Math.cos(angle),s=Math.sin(angle),along=x*c+y*s,side=-x*s+y*c,start=W.start??18;return along>=start-pad-10&&along<=W.range+pad&&Math.abs(side)<=(W.width||240)/2+pad}
function matrix(ctx,u,z,W,T){let len=W.range,w=W.width||240,start=W.start??18,energy=Math.max(0,Math.min(1,(z.matrixEnergy??100)/(W.energy_max||100)));ctx.save();ctx.translate(u.x,u.y);ctx.rotate(z.matrixAngle);
 let g=ctx.createLinearGradient?ctx.createLinearGradient(start,0,len,0):null;if(g){g.addColorStop(0,'rgba(255,120,200,.30)');g.addColorStop(.5,'rgba(140,220,255,.18)');g.addColorStop(1,'rgba(140,255,210,.26)');ctx.fillStyle=g}else ctx.fillStyle='rgba(150,230,255,.2)';
 ctx.fillRect(start,-w/2,len-start,w);
 // 蜂窝网格（向前流动）
 ctx.save();ctx.beginPath();ctx.rect(start,-w/2,len-start,w);ctx.clip();ctx.strokeStyle='rgba(200,245,255,.28)';ctx.lineWidth=1.2;let h=14,dx=h*1.5,dy=h*Math.sqrt(3),off=(T*60)%dx;
 for(let X=start-dx;X<len+dx;X+=dx)for(let Y=-w/2-dy;Y<w/2+dy;Y+=dy){let cx=X+off,cy=Y+((Math.round((X-start)/dx))%2?dy/2:0);ctx.beginPath();for(let k=0;k<6;k++){let a=k*Math.PI/3;ctx.lineTo(cx+Math.cos(a)*h*.92,cy+Math.sin(a)*h*.92)}ctx.closePath();ctx.stroke()}ctx.restore();
 // 亮边 + 远端光带
 ctx.strokeStyle='rgba(255,150,215,'+(.6+.3*Math.sin(T*9))+')';ctx.lineWidth=3;ctx.strokeRect(start,-w/2,len-start,w);ctx.fillStyle='rgba(170,255,230,.55)';ctx.fillRect(len-5,-w/2,5,w);
 // 双臂发射器光束
 for(let sgn of [-1,1]){let ex=10,ey=sgn*26;ctx.strokeStyle='rgba(255,170,225,.9)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(start,sgn*w*.35);ctx.stroke();ctx.fillStyle='#ffe0f4';ctx.beginPath();ctx.arc(ex,ey,5+2*Math.sin(T*20),0,TAU);ctx.fill()}
 // 吸收闪光
 for(let f of (z.matrixFx||[]).filter(f=>T-f.t<.35)){let k=(T-f.t)/.35,c=Math.cos(-z.matrixAngle),s=Math.sin(-z.matrixAngle),lx=(f.x-u.x)*c-(f.y-u.y)*s,ly=(f.x-u.x)*s+(f.y-u.y)*c;ctx.globalAlpha=1-k;ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(lx,ly,8+26*k,0,TAU);ctx.stroke();ctx.globalAlpha=1}
 // 能量条
 ctx.rotate(-z.matrixAngle);ctx.fillStyle='rgba(10,14,22,.8)';ctx.fillRect(-30,40,60,6);ctx.fillStyle=energy>.3?'#8dffc5':'#ff8db5';ctx.fillRect(-30,40,60*energy,6);ctx.restore()}
function thrusters(ctx,u,z,T){let b=z.boost;if(!b)return;let a=b.angle??u.angle??0,back=a+Math.PI;ctx.save();ctx.translate(u.x,u.y);ctx.rotate(back);
 for(let sgn of [-1,1]){let ox=30,oy=sgn*20,L=70+22*hash(Math.floor(T*30)+sgn*7),W=18;let g=ctx.createLinearGradient?ctx.createLinearGradient(ox,0,ox+L,0):null;
  ctx.beginPath();ctx.moveTo(ox,oy-W/2);ctx.quadraticCurveTo(ox+L*.6,oy-W*.7,ox+L,oy);ctx.quadraticCurveTo(ox+L*.6,oy+W*.7,ox,oy+W/2);ctx.closePath();if(g){g.addColorStop(0,'rgba(255,240,170,.95)');g.addColorStop(.4,'rgba(255,150,60,.85)');g.addColorStop(1,'rgba(255,60,40,0)');ctx.fillStyle=g}else ctx.fillStyle='rgba(255,150,60,.8)';ctx.fill();
  ctx.beginPath();ctx.ellipse(ox+L*.25,oy,L*.25,W*.22,0,0,TAU);ctx.fillStyle='rgba(255,255,230,.9)';ctx.fill()}
 for(let i=0;i<8;i++){let ph=(T*3+hash(i))%1,x=40+ph*120,y=(hash(i+3)-.5)*40;ctx.fillStyle='rgba(255,'+Math.round(120+100*(1-ph))+',60,'+(1-ph)+')';ctx.beginPath();ctx.arc(x,y,2+2*(1-ph),0,TAU);ctx.fill()}ctx.restore()}
// 自毁进度（0→1）：供渲染器收缩机甲、加亮发光
function bombK(F,T){let o=F?.owner,b=o?.v11State?.bomb;if(!b||!b.at)return 0;let dur=b.delay||GAME_CONFIG.heroParams?.dva?.R?.delay||2.5;return Math.max(0,Math.min(1,1-(b.at-T)/dur))}
function bomb2D(ctx,b,T,dur){let k=Math.max(0,Math.min(1,1-(b.at-T)/dur)),flash=Math.abs(Math.sin(T*(6+30*k*k)));ctx.save();
 let r=60+120*k,g=ctx.createRadialGradient?ctx.createRadialGradient(b.x,b.y,4,b.x,b.y,r):null;if(g){g.addColorStop(0,'rgba(255,255,255,'+(.5+.5*k)+')');g.addColorStop(.35,'rgba(255,80,110,'+(.35+.45*k*flash)+')');g.addColorStop(1,'rgba(255,40,60,0)');ctx.fillStyle=g}else ctx.fillStyle='rgba(255,80,110,.4)';ctx.beginPath();ctx.arc(b.x,b.y,r,0,TAU);ctx.fill();
 if(b.at-T<.3){ctx.globalAlpha=1-(b.at-T)/.3;ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(b.x,b.y,r*1.6,0,TAU);ctx.fill()}ctx.restore()}
window.DvaFxV21={inMatrix,matrix,thrusters,bombK,bomb2D};
{let C=window.GAME_CONFIG,d=C?.heroParams?.dva;for(let p of new Set([d,C?.heroes?.dva?.params]))if(p?.W){p.W.width=240;p.W.start=18;p.W.range=Math.max(p.W.range||300,320)}let sk=C?.heroes?.dva?.skills?.[1];if(sk){sk.range=320;if(!/长方形/.test(sk.desc||''))sk.desc='在机甲前方展开长320、宽240的长方形防御矩阵。'+String(sk.desc||'')}}
})();
