/* V21 专属技能特效（原创绘制，仅视觉）：腕豪（瑟提）、闪光、源氏、诺手（德莱厄斯）、太刀侠。
 * 腕豪：Q 金色拳套脉冲+冲刺气流；W 巨拳冲击（长400、远端宽375 的扇形拳风，中央金色真伤核心）；E 两侧冲击波对撞+尘土；R 扛人跃起残影+落地陨坑（裂纹、碎石、多重冲击环）。
 * 闪光：Q 双枪橙色时间环+弹壳火花；W 闪现蓝色残影链+时间碎片；E 回溯（原有特效）；R 脉冲炸弹蓝色电弧球、倒计时环、爆炸蓝白闪光+电弧。
 * 源氏：Q 旋转绿色飞镖光尾；W 正面半月形青色格挡屏障+反弹闪光；E 疾影斩绿色剑光直线+残影；R 拔刀龙魂缠绕、每刀180°绿色龙形月弧。
 * 诺手：Q 斧刃血色回旋（外圈刃光+内圈暗环），命中英雄飙血；W 下劈裂地；E 锥形血色锁链回拉；R 断头台巨斧从天而降+红金冲击；出血层数显示为目标头顶血滴。
 * 太刀侠：Q 每段不同角度的刀光（红/金刃色）；W 登龙上挑光柱；E 见切白色残影环；R 居合横向一闪（长325，取刃色）。 */
(()=>{'use strict';
const TAU=Math.PI*2,hash=n=>{let x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
const A=(c,a)=>'rgba('+c+','+Math.max(0,Math.min(1,a))+')';
const fx=[];const push=f=>{fx.push(f);if(fx.length>200)fx.splice(0,fx.length-200)};
const HEROES=new Set(['sett','tracer','genji','darius','longsword_hunter']);
let core=null,unitsFn=null,clock=()=>0,seed=1;const prev={};
const find=id=>unitsFn?.().find(u=>u.id===id);
const ease=k=>1-Math.pow(1-k,3);
function lingrad(ctx,x0,y0,x1,y1,stops){if(!ctx.createLinearGradient)return stops[1][1];let g=ctx.createLinearGradient(x0,y0,x1,y1);for(let s of stops)g.addColorStop(s[0],s[1]);return g}
function radgrad(ctx,r,stops){if(!ctx.createRadialGradient)return stops[1][1];let g=ctx.createRadialGradient(0,0,0,0,0,r);for(let s of stops)g.addColorStop(s[0],s[1]);return g}
function rings(ctx,R,e,c1,c2,w){for(let j=0;j<3;j++){let rr=R*(.25+.85*e)-j*12;if(rr<=0)continue;ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.strokeStyle=A(j?c2:c1,.9-j*.25);ctx.lineWidth=w-j*1.5;ctx.stroke()}}
function sparks(ctx,n,R,k,c,s0,grav=60,size=3){for(let i=0;i<n;i++){let a=hash(i+s0)*TAU,sp=R*(.5+.7*hash(i*3+s0)),e=ease(k);ctx.fillStyle=A(c,1-k);ctx.beginPath();ctx.arc(Math.cos(a)*sp*e,Math.sin(a)*sp*e*.7+grav*k*k,size*(1-k*.6),0,TAU);ctx.fill()}}
function crescent(ctx,R,a0,a1,w,c,glow){ctx.save();ctx.lineCap='round';if(glow){ctx.shadowColor=A(c,1);ctx.shadowBlur=glow}ctx.beginPath();ctx.arc(0,0,R,a0,a1);ctx.strokeStyle=A(c,.95);ctx.lineWidth=w;ctx.stroke();ctx.beginPath();ctx.arc(0,0,R,a0+(a1-a0)*.15,a1-(a1-a0)*.1);ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=Math.max(1.5,w*.28);ctx.stroke();ctx.restore()}

// ================= 腕豪 =================
const SG='255,205,110',SW='255,244,220',SR='255,120,80',DUST='196,170,130';
const sett={
 cast(u,i,T,f){if(i===0)push({h:'sett',k:'q',id:u.id,start:T,end:T+1.5});if(i===1)push({h:'sett',k:'w',x:u.x,y:u.y,a:u.angle||0,start:T,end:T+.55});if(i===2)push({h:'sett',k:'e',x:u.x,y:u.y,a:u.angle||0,start:T,end:T+.5});if(i===3)push({h:'sett',k:'rUp',id:u.id,start:T,end:T+.9})},
 hit(s,t,i,T){if(i===3)push({h:'sett',k:'rLand',x:t.x,y:t.y,start:T,end:T+.9,seed:seed++});else if(i===1)push({h:'sett',k:'wHit',x:t.x,y:t.y,start:T,end:T+.35,seed:seed++});else if(i===2)push({h:'sett',k:'eHit',x:t.x,y:t.y,start:T,end:T+.4,seed:seed++})},
 draw(ctx,f,k,u){let T=f.T;ctx.save();
  if(f.k==='q'&&u){ctx.translate(u.x,u.y);ctx.rotate(u.angle||0);for(let s of[-1,1]){let p=.5+.5*Math.sin(T*14+s);ctx.save();ctx.translate(14,s*18);ctx.fillStyle=radgrad(ctx,22,[[0,A(SW,.95)],[.4,A(SG,.7)],[1,A(SG,0)]]);ctx.beginPath();ctx.arc(0,0,14+6*p,0,TAU);ctx.fill();ctx.restore()}
   ctx.globalAlpha=(1-k)*.7;for(let i=0;i<5;i++){let y=(hash(i)-.5)*40,ph=(T*3+hash(i+3))%1;ctx.strokeStyle=A(SG,1-ph);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-20-ph*40,y);ctx.lineTo(-50-ph*40,y);ctx.stroke()}}
  else if(f.k==='w'){let e=ease(Math.min(1,k*2.2));ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalAlpha=1-k*k;let L=400*e,half=187*e;
   ctx.fillStyle=lingrad(ctx,0,0,L,0,[[0,A(SW,.55)],[.5,A(SG,.35)],[1,A(SG,.08)]]);ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(L,-half);ctx.quadraticCurveTo(L+40,0,L,half);ctx.lineTo(0,30);ctx.closePath();ctx.fill();
   ctx.fillStyle=lingrad(ctx,0,0,L,0,[[0,A(SW,1)],[1,A(SG,.6)]]);ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(L,-50*e);ctx.lineTo(L,50*e);ctx.lineTo(0,10);ctx.closePath();ctx.fill();
   for(let j=0;j<4;j++){let x=L*(.35+.2*j);ctx.beginPath();ctx.arc(x-80,0,80+j*25,-.5,.5);ctx.strokeStyle=A(SG,.85-j*.15);ctx.lineWidth=5-j;ctx.stroke()}
   ctx.translate(L,0);ctx.fillStyle=radgrad(ctx,60,[[0,A(SW,.95)],[.5,A(SG,.6)],[1,A(SG,0)]]);ctx.beginPath();ctx.arc(0,0,60*(1-k*.4),0,TAU);ctx.fill();
   ctx.fillStyle=A(SW,1);ctx.beginPath();ctx.ellipse(-20,0,26,20,0,0,TAU);ctx.fill()}
  else if(f.k==='e'){let e=ease(Math.min(1,k*2.5));ctx.translate(f.x,f.y);ctx.rotate(f.a+Math.PI/2);ctx.globalAlpha=1-k;
   for(let s of[-1,1]){let x=s*225*(1-e);ctx.save();ctx.translate(x,0);ctx.fillStyle=lingrad(ctx,s*60,0,0,0,[[0,A(DUST,0)],[1,A(SG,.6)]]);ctx.fillRect(s>0?0:-60,-87,60,175);ctx.strokeStyle=A(SW,.9);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-87);ctx.lineTo(0,87);ctx.stroke();ctx.restore()}
   if(e>.85){ctx.fillStyle=radgrad(ctx,120,[[0,A(SW,.9)],[.4,A(SG,.5)],[1,A(DUST,0)]]);ctx.beginPath();ctx.arc(0,0,120*(k),0,TAU);ctx.fill()}
   for(let i=0;i<10;i++){let a=hash(i+3)*TAU,r=(60+80*hash(i))*k;ctx.fillStyle=A(DUST,.7*(1-k));ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,8+6*hash(i+9),0,TAU);ctx.fill()}}
  else if(f.k==='rUp'&&u){ctx.translate(u.x,u.y);ctx.globalAlpha=(1-k)*.8;for(let i=1;i<=4;i++){ctx.fillStyle=A(SG,.18);ctx.beginPath();ctx.ellipse(-Math.cos(u.angle||0)*i*18,-Math.sin(u.angle||0)*i*18-10,28,40,0,0,TAU);ctx.fill()}
   ctx.strokeStyle=A(SG,.9);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,60+20*Math.sin(T*10),24,0,0,TAU);ctx.stroke()}
  else if(f.k==='rLand'){let e=ease(k);ctx.translate(f.x,f.y);ctx.globalAlpha=1-k;
   if(k<.2){ctx.fillStyle=radgrad(ctx,200,[[0,A(SW,.95)],[.4,A(SG,.6)],[1,A(SR,0)]]);ctx.beginPath();ctx.arc(0,0,200*(.5+k*2.5),0,TAU);ctx.fill()}
   ctx.fillStyle=A('60,40,25',.45*(1-k));ctx.beginPath();ctx.ellipse(0,0,150,90,0,0,TAU);ctx.fill();
   ctx.strokeStyle=A('40,25,15',.8*(1-k));ctx.lineWidth=4;for(let i=0;i<9;i++){let a=hash(i+f.seed)*TAU,r=110+60*hash(i*2+f.seed);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*.5,Math.sin(a)*r*.3+8);ctx.lineTo(Math.cos(a+.15)*r,Math.sin(a+.15)*r*.6);ctx.stroke()}
   ctx.scale(1,.6);rings(ctx,450,e,SG,SR,9);ctx.scale(1,1/.6);
   for(let i=0;i<14;i++){let a=hash(i*5+f.seed)*TAU,sp=120+140*hash(i+f.seed),x=Math.cos(a)*sp*e,y=Math.sin(a)*sp*e*.6-160*k+220*k*k;ctx.fillStyle=A(i%2?DUST:'120,95,70',1-k);ctx.fillRect(x-5,y-5,10+4*hash(i),10)}}
  else if(f.k==='wHit'||f.k==='eHit'){ctx.translate(f.x,f.y);ctx.globalAlpha=1-k;rings(ctx,f.k==='wHit'?70:55,ease(k),SW,SG,6);sparks(ctx,10,70,k,SG,f.seed)}
  ctx.restore()}};

// ================= 闪光 =================
const TO='255,154,46',TB='120,210,255',TW='235,250,255';
const tracer={
 cast(u,i,T){if(i===0)push({h:'tracer',k:'q',id:u.id,start:T,end:T+2.5});if(i===1){let p=prev[u.id]||{x:u.x,y:u.y};push({h:'tracer',k:'blink',id:u.id,x0:p.x,y0:p.y,start:T,end:T+.5,seed:seed++,pending:true})}},
 hit(s,t,i,T){if(i===3)push({h:'tracer',k:'boom',x:t.x,y:t.y,start:T,end:T+.7,seed:seed++})},
 draw(ctx,f,k,u){let T=f.T;ctx.save();
  if(f.k==='q'&&u){ctx.translate(u.x,u.y);ctx.globalAlpha=Math.min(1,(1-k)*4);ctx.rotate(T*3);ctx.setLineDash?.([10,8]);ctx.beginPath();ctx.arc(0,0,(u.radius||22)+16,0,TAU);ctx.strokeStyle=A(TO,.85);ctx.lineWidth=3;ctx.stroke();ctx.setLineDash?.([]);ctx.rotate(-T*6);for(let i=0;i<12;i++){ctx.rotate(TAU/12);ctx.beginPath();ctx.moveTo((u.radius||22)+10,0);ctx.lineTo((u.radius||22)+16,0);ctx.strokeStyle=A(TB,.9);ctx.lineWidth=2;ctx.stroke()}
   ctx.rotate(T*3-(u.angle||0));for(let s of[-1,1]){if(Math.sin(T*40+s)>.3){ctx.fillStyle=A(TO,.9);ctx.beginPath();ctx.arc(36,s*12,6,0,TAU);ctx.fill()}}}
  else if(f.k==='blink'){if(f.pending&&u){f.x1=u.x;f.y1=u.y;f.pending=false}let x1=f.x1??f.x0,y1=f.y1??f.y0,dx=x1-f.x0,dy=y1-f.y0;ctx.globalAlpha=1-k;
   ctx.strokeStyle=lingrad(ctx,f.x0,f.y0,x1,y1,[[0,A(TB,0)],[1,A(TB,.9)]]);ctx.lineWidth=18*(1-k);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(f.x0,f.y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.strokeStyle=A(TW,.9);ctx.lineWidth=4*(1-k);ctx.stroke();
   for(let i=0;i<4;i++){let p=i/4;ctx.fillStyle=A(TB,.35*(1-k)*(1-p*.5));ctx.beginPath();ctx.ellipse(f.x0+dx*p,f.y0+dy*p-12,16,26,0,0,TAU);ctx.fill()}
   for(let i=0;i<10;i++){let p=hash(i+f.seed),x=f.x0+dx*p+(hash(i*3+f.seed)-.5)*40,y=f.y0+dy*p+(hash(i*7+f.seed)-.5)*40-k*30;ctx.save();ctx.translate(x,y);ctx.rotate(k*5+i);ctx.fillStyle=A(i%3?TB:TO,1-k);ctx.fillRect(-4,-4,8,8);ctx.restore()}
   ctx.translate(x1,y1);ctx.scale(1,.5);rings(ctx,60,ease(k),TW,TB,4)}
  else if(f.k==='boom'){let e=ease(k);ctx.translate(f.x,f.y);ctx.globalAlpha=1-k;if(k<.25){ctx.fillStyle=radgrad(ctx,300,[[0,A(TW,1)],[.35,A(TB,.7)],[1,A(TB,0)]]);ctx.beginPath();ctx.arc(0,0,300*(.3+.7*k/.25),0,TAU);ctx.fill()}
   ctx.scale(1,.7);rings(ctx,300,e,TW,TB,8);ctx.scale(1,1/.7);
   ctx.strokeStyle=A(TW,.9*(1-k));ctx.lineWidth=2.5;for(let i=0;i<12;i++){let a=i*TAU/12+f.seed,r=280*e;ctx.beginPath();ctx.moveTo(0,0);let x=0,y=0;for(let j=1;j<=5;j++){x=Math.cos(a)*r*j/5+(hash(i*9+j+f.seed)-.5)*30;y=Math.sin(a)*r*j/5*.7+(hash(i*5+j)-.5)*30;ctx.lineTo(x,y)}ctx.stroke()}
   sparks(ctx,18,260,k,TO,f.seed,30,4)}
  ctx.restore()},
 state(ctx,u,T){let b=u.tracerState?.bomb;if(!b)return;let t=b.target,x=t?t.x:b.x,y=t?t.y-(t.radius||22)-6:b.y;let left=b.state==='armed'&&b.fuseAt!=null?Math.max(0,Math.min(1,(b.fuseAt-T)/1)):null;ctx.save();ctx.translate(x,y);let p=.5+.5*Math.sin(T*(left!=null?20+30*(1-left):10));
  ctx.fillStyle=radgrad(ctx,30,[[0,A(TW,1)],[.4,A(TB,.8)],[1,A(TB,0)]]);ctx.beginPath();ctx.arc(0,0,16+10*p,0,TAU);ctx.fill();ctx.fillStyle=A('30,40,60',1);ctx.beginPath();ctx.arc(0,0,7,0,TAU);ctx.fill();ctx.fillStyle=A(TB,1);ctx.beginPath();ctx.arc(0,0,4,0,TAU);ctx.fill();
  ctx.strokeStyle=A(TW,.9);ctx.lineWidth=1.5;for(let i=0;i<3;i++){let a=T*9+i*TAU/3;ctx.beginPath();ctx.moveTo(Math.cos(a)*8,Math.sin(a)*8);ctx.lineTo(Math.cos(a+.4)*20,Math.sin(a+.4)*20);ctx.lineTo(Math.cos(a+.1)*28,Math.sin(a+.1)*28);ctx.stroke()}
  if(left!=null){ctx.beginPath();ctx.arc(0,0,34,-Math.PI/2,-Math.PI/2+TAU*left);ctx.strokeStyle=A(TO,.95);ctx.lineWidth=4;ctx.stroke()}ctx.restore();
  if(left!=null&&!t){ctx.save();ctx.translate(b.x,b.y);ctx.scale(1,.6);ctx.setLineDash?.([10,10]);ctx.lineDashOffset=T*40;ctx.beginPath();ctx.arc(0,0,300,0,TAU);ctx.strokeStyle=A(TB,.5);ctx.lineWidth=3;ctx.stroke();ctx.restore()}}};

// ================= 源氏 =================
const GG='120,255,170',GC='190,255,230',GW='240,255,248',GD='60,200,140';
const genji={
 cast(u,i,T){if(i===2)push({h:'genji',k:'dash',id:u.id,x0:u.x,y0:u.y,a:u.angle||0,start:T,end:T+.45,seed:seed++});if(i===3)push({h:'genji',k:'draw',id:u.id,start:T,end:T+.6})},
 hit(s,t,i,T){if(i===3)push({h:'genji',k:'swing',x:s.x,y:s.y,a:Math.atan2(t.y-s.y,t.x-s.x),start:T,end:T+.32,seed:seed++,key:s.id});else push({h:'genji',k:'cut',x:t.x,y:t.y,a:Math.atan2(t.y-s.y,t.x-s.x),start:T,end:T+.3,seed:seed++})},
 draw(ctx,f,k,u){let T=f.T;ctx.save();
  if(f.k==='dash'){let x1=u?u.x:f.x0+Math.cos(f.a)*375,y1=u?u.y:f.y0+Math.sin(f.a)*375;if(k>.3&&!f.x1){f.x1=x1;f.y1=y1}x1=f.x1??x1;y1=f.y1??y1;ctx.globalAlpha=1-k;
   ctx.strokeStyle=lingrad(ctx,f.x0,f.y0,x1,y1,[[0,A(GG,0)],[.6,A(GG,.8)],[1,A(GW,1)]]);ctx.lineCap='round';ctx.lineWidth=26*(1-k*.7);ctx.beginPath();ctx.moveTo(f.x0,f.y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.strokeStyle=A(GW,1);ctx.lineWidth=4;ctx.stroke();
   for(let i=1;i<4;i++){let p=i/4;ctx.fillStyle=A(GD,.3*(1-k));ctx.beginPath();ctx.ellipse(f.x0+(x1-f.x0)*p,f.y0+(y1-f.y0)*p-14,14,24,0,0,TAU);ctx.fill()}
   for(let i=0;i<8;i++){let p=hash(i+f.seed),x=f.x0+(x1-f.x0)*p,y=f.y0+(y1-f.y0)*p;ctx.save();ctx.translate(x+(hash(i*3)-.5)*30,y+(hash(i*5)-.5)*30-k*20);ctx.rotate(i+k*4);ctx.fillStyle=A(GC,1-k);ctx.beginPath();ctx.ellipse(0,0,7,3,0,0,TAU);ctx.fill();ctx.restore()}}
  else if(f.k==='draw'&&u){ctx.translate(u.x,u.y);ctx.globalAlpha=1-k;ctx.fillStyle=lingrad(ctx,0,0,0,-180,[[0,A(GG,.7)],[1,A(GG,0)]]);ctx.fillRect(-20,-180*ease(k),40,180*ease(k));ctx.scale(1,.5);rings(ctx,140,ease(k),GW,GG,5)}
  else if(f.k==='swing'){let s=find(f.key),x=s?.x??f.x,y=s?.y??f.y;ctx.translate(x,y);ctx.rotate(f.a);let e=ease(Math.min(1,k*1.8)),sw=Math.PI*e;ctx.globalAlpha=1-k*k;
   ctx.fillStyle=radgrad(ctx,225,[[0,A(GG,0)],[.6,A(GG,.18)],[1,A(GC,.4)]]);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,225,-Math.PI/2,-Math.PI/2+sw);ctx.closePath();ctx.fill();
   crescent(ctx,210,-Math.PI/2,-Math.PI/2+sw,16,GG,24);crescent(ctx,160,-Math.PI/2+.2,-Math.PI/2+sw*.9,7,GC,0);
   let ha=-Math.PI/2+sw;ctx.save();ctx.translate(Math.cos(ha)*215,Math.sin(ha)*215);ctx.rotate(ha+Math.PI/2);ctx.fillStyle=A(GW,1);ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(10,6);ctx.lineTo(-10,6);ctx.closePath();ctx.fill();ctx.fillStyle=A(GG,1);ctx.beginPath();ctx.arc(-6,-2,2.5,0,TAU);ctx.arc(6,-2,2.5,0,TAU);ctx.fill();ctx.restore()}
  else if(f.k==='cut'){ctx.translate(f.x,f.y);ctx.rotate(f.a+.6);ctx.globalAlpha=1-k;let L=40*ease(Math.min(1,k*3));ctx.strokeStyle=A(GG,1);ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(L,0);ctx.stroke();ctx.strokeStyle=A(GW,1);ctx.lineWidth=2;ctx.stroke();sparks(ctx,6,40,k,GC,f.seed,20,2.5)}
  ctx.restore()},
 state(ctx,u,T){let z=u.genjiState;if(!z)return;let now=T;
  if((z.deflectUntil||0)>now){let a=z.deflectAngle??u.angle??0;ctx.save();ctx.translate(u.x,u.y);ctx.rotate(a);let r=(u.radius||22)+25,p=.5+.5*Math.sin(T*16);ctx.fillStyle=radgrad(ctx,r+14,[[0,A(GG,0)],[.7,A(GG,.15)],[1,A(GC,.5)]]);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r+14,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.fill();
   crescent(ctx,r+8,-Math.PI/2,Math.PI/2,6+2*p,GG,18);for(let i=0;i<5;i++){let b=-Math.PI/2+(i+.5)*Math.PI/5;ctx.save();ctx.rotate(b);ctx.translate(r+8,0);ctx.rotate(T*8+i);ctx.fillStyle=A(GW,.9);ctx.fillRect(-3,-3,6,6);ctx.restore()}ctx.restore()}
  if((z.bladeUntil||0)>now){ctx.save();ctx.translate(u.x,u.y-10);for(let i=0;i<2;i++){ctx.beginPath();for(let j=0;j<=30;j++){let p=j/30,a=T*3+p*TAU*1.2+i*Math.PI,r=(u.radius||22)+14+6*Math.sin(p*12+T*6),x=Math.cos(a)*r,y=Math.sin(a)*r*.45-p*40;j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=A(i?GC:GG,.75);ctx.lineWidth=5-i*2;ctx.lineCap='round';ctx.shadowColor=A(GG,1);ctx.shadowBlur=14;ctx.stroke()}
   let a=T*3+TAU*1.2,hx=Math.cos(a)*((u.radius||22)+14),hy=Math.sin(a)*((u.radius||22)+14)*.45-40;ctx.fillStyle=A(GW,1);ctx.beginPath();ctx.arc(hx,hy,5,0,TAU);ctx.fill();ctx.restore()}},
 projectile(ctx,p,spin){ctx.save();ctx.shadowColor=A(GG,1);ctx.shadowBlur=14;ctx.strokeStyle=lingrad(ctx,-50,0,0,0,[[0,A(GG,0)],[1,A(GG,.8)]]);ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-50,0);ctx.lineTo(-6,0);ctx.stroke();
  ctx.rotate(spin*14);ctx.fillStyle=A(GW,1);ctx.beginPath();for(let i=0;i<8;i++){let r=i%2?3:11,a=i*Math.PI/4;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.strokeStyle=A(GG,1);ctx.lineWidth=1.5;ctx.stroke();ctx.restore();return true}};

// ================= 诺手 =================
const DR='210,40,50',DD='90,10,20',DG='255,200,120',DW='255,230,220';
const darius={
 cast(u,i,T){if(i===0)push({h:'darius',k:'q',id:u.id,a:u.angle||0,start:T,end:T+1.05,seed:seed++});if(i===2)push({h:'darius',k:'e',x:u.x,y:u.y,a:u.angle||0,start:T,end:T+.55,seed:seed++});if(i===3)push({h:'darius',k:'rAxe',tid:null,id:u.id,start:T,end:T+.35})},
 hit(s,t,i,T){if(i===0)push({h:'darius',k:'blood',x:t.x,y:t.y,a:Math.atan2(t.y-s.y,t.x-s.x),start:T,end:T+.5,seed:seed++});if(i===1)push({h:'darius',k:'chop',x:t.x,y:t.y,start:T,end:T+.45,seed:seed++});if(i===3)push({h:'darius',k:'guillotine',tid:t.id,x:t.x,y:t.y,start:T,end:T+.8,seed:seed++})},
 draw(ctx,f,k,u){let T=f.T;ctx.save();
  if(f.k==='q'&&u){ctx.translate(u.x,u.y);let wind=.75;if(k*1.05<wind){let p=k*1.05/wind;ctx.globalAlpha=.4+.5*p;ctx.scale(1,.6);ctx.setLineDash?.([12,10]);ctx.lineDashOffset=-T*60;ctx.beginPath();ctx.arc(0,0,260,0,TAU);ctx.strokeStyle=A(DR,.7);ctx.lineWidth=3;ctx.stroke();ctx.setLineDash?.([]);ctx.beginPath();ctx.arc(0,0,260*p,0,TAU);ctx.strokeStyle=A(DR,.4);ctx.lineWidth=2;ctx.stroke()}
   else{let p=(k*1.05-wind)/(1.05-wind),sw=TAU*ease(Math.min(1,p*1.6)),a0=f.a;ctx.globalAlpha=1-p*p;ctx.scale(1,.6);ctx.fillStyle=radgrad(ctx,270,[[0,A(DD,0)],[.5,A(DD,.25)],[.8,A(DR,.35)],[1,A(DR,0)]]);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,270,a0,a0+sw);ctx.closePath();ctx.fill();crescent(ctx,235,a0+sw-1.6,a0+sw,26,DR,26);crescent(ctx,235,a0,a0+sw,6,DG,0);
    ctx.beginPath();ctx.arc(0,0,120,0,TAU);ctx.strokeStyle=A(DD,.6);ctx.lineWidth=8;ctx.stroke()}}
  else if(f.k==='e'){ctx.translate(f.x,f.y);ctx.rotate(f.a);let e=ease(Math.min(1,k*2));ctx.globalAlpha=1-k;let R=330,h=Math.PI/4;ctx.fillStyle=radgrad(ctx,R,[[0,A(DR,.05)],[1,A(DR,.3)]]);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,-h,h);ctx.closePath();ctx.fill();
   for(let j=-2;j<=2;j++){let a=j*h/2.5,r=R*(1-e);ctx.save();ctx.rotate(a);for(let i=0;i<8;i++){let x=r+i*(R-r)/8;ctx.strokeStyle=A(i%2?DG:'200,200,210',.9);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,0,9,5,0,0,TAU);ctx.stroke()}ctx.restore()}
   ctx.beginPath();ctx.arc(0,0,R,-h,h);ctx.strokeStyle=A(DR,.9);ctx.lineWidth=4;ctx.stroke()}
  else if(f.k==='rAxe'&&u){ctx.translate(u.x,u.y-30-60*k);ctx.globalAlpha=.9;ctx.rotate(-1+k*2);ctx.fillStyle=A(DR,.6);ctx.beginPath();ctx.arc(0,0,40,0,TAU);ctx.fill()}
  else if(f.k==='guillotine'){let t=find(f.tid),x=t?.x??f.x,y=t?.y??f.y;ctx.translate(x,y);let drop=Math.min(1,k/.35),e=drop*drop;
   if(drop<1){ctx.save();ctx.translate(0,-260*(1-e));ctx.globalAlpha=.95;ctx.shadowColor=A(DR,1);ctx.shadowBlur=30;ctx.fillStyle=lingrad(ctx,0,-90,0,40,[[0,A(DD,.9)],[.6,A(DR,.95)],[1,A(DG,1)]]);ctx.beginPath();ctx.moveTo(-10,-150);ctx.lineTo(10,-150);ctx.lineTo(10,-50);ctx.quadraticCurveTo(90,-60,80,30);ctx.quadraticCurveTo(0,10,-80,30);ctx.quadraticCurveTo(-90,-60,-10,-50);ctx.closePath();ctx.fill();ctx.strokeStyle=A(DW,.9);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-80,30);ctx.quadraticCurveTo(0,10,80,30);ctx.stroke();ctx.restore()}
   else{let p=(k-.35)/.65;ctx.globalAlpha=1-p;if(p<.3){ctx.fillStyle=radgrad(ctx,160,[[0,A(DW,1)],[.4,A(DR,.7)],[1,A(DD,0)]]);ctx.beginPath();ctx.arc(0,0,160*(.4+p*2),0,TAU);ctx.fill()}ctx.scale(1,.6);rings(ctx,200,ease(p),DG,DR,8);ctx.scale(1,1/.6);
    ctx.strokeStyle=A(DD,.8);ctx.lineWidth=4;for(let i=0;i<7;i++){let a=hash(i+f.seed)*TAU;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*120,Math.sin(a)*70);ctx.stroke()}sparks(ctx,20,160,p,DR,f.seed,80,5)}}
  else if(f.k==='blood'){ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalAlpha=1-k;for(let i=0;i<10;i++){let a=(hash(i+f.seed)-.5)*1.4,sp=40+60*hash(i*3+f.seed),e=ease(k);ctx.fillStyle=A(i%3?DR:DD,1);ctx.beginPath();ctx.arc(Math.cos(a)*sp*e,Math.sin(a)*sp*e+40*k*k,4*(1-k*.5)+1,0,TAU);ctx.fill()}}
  else if(f.k==='chop'){ctx.translate(f.x,f.y);ctx.globalAlpha=1-k;let e=ease(Math.min(1,k*3));ctx.strokeStyle=A(DR,1);ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-10,-70+40*e);ctx.lineTo(10,10*e);ctx.stroke();ctx.strokeStyle=A(DW,1);ctx.lineWidth=3;ctx.stroke();ctx.scale(1,.5);rings(ctx,70,ease(k),DG,DR,5);
   ctx.strokeStyle=A('40,20,15',.8);ctx.lineWidth=3;for(let i=0;i<5;i++){let a=hash(i+f.seed)*TAU;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*60,Math.sin(a)*60);ctx.stroke()}}
  ctx.restore()},
 state(ctx,u,T){let bl=u.dariusBleed;if(!bl)return;let n=0;for(let id in bl){let b=bl[id];if(b&&b.until>T)n=Math.max(n,b.stacks||0)}if(!n)return;ctx.save();ctx.translate(u.x,u.y-(u.radius||22)-40);for(let i=0;i<n;i++){let x=(i-(n-1)/2)*12,bob=Math.sin(T*4+i)*2;ctx.fillStyle=A(n>=5?'255,40,40':DR,1);ctx.beginPath();ctx.moveTo(x,bob-8);ctx.quadraticCurveTo(x+6,bob,x,bob+5);ctx.quadraticCurveTo(x-6,bob,x,bob-8);ctx.fill()}if(n>=5){ctx.strokeStyle=A('255,60,60',.6+.4*Math.sin(T*10));ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-2,40,0,TAU);ctx.stroke()}ctx.restore()}};

// ================= 太刀侠 =================
const LR='255,90,70',LY='255,214,110',LW='255,250,240',LS='200,225,255';
const bladeColor=u=>{let z=u?.longswordState;if(!z)return LS;return (z.redUntil||0)>clock()?LR:z.level>=3?LR:z.level===2?LY:z.level===1?'240,240,255':LS};
const longsword={
 cast(u,i,T){let c=bladeColor(u);if(i===0){let z=u.longswordState,n=(z?.combo||1);push({h:'longsword_hunter',k:'q',id:u.id,a:u.angle||0,c,n,start:T,end:T+.3})}
  if(i===1)push({h:'longsword_hunter',k:'rise',id:u.id,a:u.angle||0,c,start:T,end:T+.55});if(i===2)push({h:'longsword_hunter',k:'mikiri',x:u.x,y:u.y,c,start:T,end:T+.6});if(i===3)push({h:'longsword_hunter',k:'iai',x:u.x,y:u.y,a:u.angle||0,c,start:T,end:T+.5,seed:seed++})},
 hit(s,t,i,T){push({h:'longsword_hunter',k:'slash',x:t.x,y:t.y,a:Math.atan2(t.y-s.y,t.x-s.x),c:bladeColor(s),start:T,end:T+.28,seed:seed++})},
 draw(ctx,f,k,u){ctx.save();
  if(f.k==='q'&&u){ctx.translate(u.x,u.y);ctx.rotate(f.a);let n=f.n%5,base=[[-1.2,1.1],[1.2,-1.1],[-1.6,1.6],[0,TAU],[-1.4,1.4]][n],e=ease(Math.min(1,k*2.5));ctx.globalAlpha=1-k*k;crescent(ctx,n===3?150:120,base[0],base[0]+(base[1]-base[0])*e,n===4?18:12,f.c,22)}
  else if(f.k==='rise'&&u){ctx.translate(u.x,u.y);ctx.globalAlpha=1-k;let e=ease(Math.min(1,k*2));ctx.fillStyle=lingrad(ctx,0,0,0,-220,[[0,A(f.c,.8)],[1,A(f.c,0)]]);ctx.fillRect(-12,-220*e,24,220*e);ctx.rotate(f.a);crescent(ctx,110,-1.6,-1.6+2.6*e,12,f.c,20)}
  else if(f.k==='mikiri'){ctx.translate(f.x,f.y);ctx.globalAlpha=1-k;ctx.fillStyle=radgrad(ctx,90,[[0,A(LW,.8)],[1,A(LS,0)]]);ctx.beginPath();ctx.arc(0,0,90*ease(k),0,TAU);ctx.fill();ctx.scale(1,.55);rings(ctx,120,ease(k),LW,LS,4);for(let i=0;i<3;i++){ctx.fillStyle=A(LW,.25*(1-k));ctx.beginPath();ctx.ellipse(0,-20-i*6,18,34,0,0,TAU);ctx.fill()}}
  else if(f.k==='iai'){ctx.translate(f.x,f.y);ctx.rotate(f.a);let e=ease(Math.min(1,k*4)),L=325*e;ctx.globalAlpha=1-k;ctx.shadowColor=A(f.c,1);ctx.shadowBlur=30;ctx.fillStyle=lingrad(ctx,0,-22,0,22,[[0,A(f.c,0)],[.5,A(LW,1)],[1,A(f.c,0)]]);ctx.fillRect(0,-22*(1-k*.7),L,44*(1-k*.7));ctx.shadowBlur=0;
   ctx.strokeStyle=A(LW,1);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(L+40,0);ctx.stroke();for(let i=0;i<10;i++){let x=hash(i+f.seed)*L,y=(hash(i*3+f.seed)-.5)*50;ctx.fillStyle=A(f.c,1-k);ctx.fillRect(x,y-1,20*(1-k),2)}}
  else if(f.k==='slash'){ctx.translate(f.x,f.y);ctx.rotate(f.a+(hash(f.seed)-.5)*1.6);ctx.globalAlpha=1-k;let L=46*ease(Math.min(1,k*3));ctx.strokeStyle=A(f.c,1);ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(L,0);ctx.stroke();ctx.strokeStyle=A(LW,1);ctx.lineWidth=2.5;ctx.stroke();sparks(ctx,6,45,k,f.c,f.seed,25,2.5)}
  ctx.restore()},
 state(ctx,u,T){let z=u.longswordState;if(!z||!(z.level>0))return;let c=bladeColor(u);ctx.save();ctx.translate(u.x,u.y);ctx.rotate((u.angle||0)+Math.PI*.8);ctx.globalAlpha=.55+.25*Math.sin(T*6);ctx.shadowColor=A(c,1);ctx.shadowBlur=16;ctx.strokeStyle=A(c,.9);ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(60,0);ctx.stroke();ctx.restore()}};

const H={sett,tracer,genji,darius,longsword_hunter:longsword};
function attach(c,units,now){if(!c||core===c)return;core=c;unitsFn=units;clock=now;
 c.on('AbilityCommitted',e=>{if(typeof e.abilityId!=='number')return;let s=find(e.sourceId);if(!s||!H[s.hero])return;H[s.hero].cast(s,e.abilityId,clock())});
 c.on('DamageApplied',e=>{if(e.basic||e.itemEffect||e.runeProc||e.deferred||typeof e.abilityId!=='number'||!(e.amount>0||e.absorbed>0))return;let s=find(e.sourceId),t=find(e.targetId);if(!s||!t||!H[s.hero])return;let T=clock(),key=s.id+':'+t.id+':'+e.abilityId;if((attach.last[key]||-1)>T-.12)return;attach.last[key]=T;H[s.hero].hit(s,t,e.abilityId,T)})}
attach.last={};
function draw(ctx,player,units,T,seen){for(let u of units){if(!(u.hp>0)||u.death>0)continue;if(seen&&!seen(u)){continue}for(let h in H)H[h].state?.(ctx,u,T);if(H[u.hero])prev[u.id]={x:u.x,y:u.y}}
 for(let i=fx.length-1;i>=0;i--){let f=fx[i];if(T>=f.end||T<f.start-1){fx.splice(i,1);continue}let u=f.id!=null?units.find(v=>v.id===f.id):null;if(seen&&u&&!seen(u))continue;f.T=T;H[f.h].draw(ctx,f,Math.max(0,Math.min(1,(T-f.start)/(f.end-f.start))),u)}}
function projectile(ctx,p,spin,hero){return hero==='genji'&&p.index===0?genji.projectile(ctx,p,spin):false}
window.HeroFxV21={attach,draw,projectile,HEROES};
})();
