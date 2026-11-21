/* V21 腕豪（瑟提）技能特效（原创绘制，仅视觉；整体风格参考端游的金色拳风质感：干净的金白发光、实心形状、少量粒子）。
 * 所有发光层用叠加混合（lighter），金色为主、白色为高光、琥珀色为暗部。
 * 被动：豪意超过一半时身上淡金色光晕。
 * Q：双手金色拳光；强化重拳命中时金色月牙拳痕+白色爆点+少量火星。
 * W：金光向拳头汇聚 → 锥形金色拳风（边缘亮线）+ 中央白金真伤光带 + 锥形末端半透明巨拳。
 * E：沿施法方向（前后两端，与判定一致）各伸出一只金色巨手向腕豪合拢，合拢瞬间中心金白拍击闪光+冲击环。
 * R：扛人时落点金色预警圈；落地金白闪光 + 粗金色冲击环 + 发光裂地纹 + 淡尘环。 */
(()=>{'use strict';
const TAU=Math.PI*2,hash=n=>{let x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
const A=(c,a)=>'rgba('+c+','+Math.max(0,Math.min(1,a))+')',ease=k=>1-Math.pow(1-k,3);
const W='255,250,230',G='255,206,84',AM='240,140,40',DUST='190,170,135';
const fx=[];const push=f=>{fx.push(f);if(fx.length>120)fx.splice(0,fx.length-120)};
let core=null,unitsFn=null,clock=()=>0,seed=1;const find=id=>unitsFn?.().find(u=>u.id===id);const S=u=>u?.championState||{};
function rg(ctx,r,st){if(!ctx.createRadialGradient)return st[1][1];let g=ctx.createRadialGradient(0,0,0,0,0,r);for(let s of st)g.addColorStop(s[0],s[1]);return g}
function lg(ctx,x0,y0,x1,y1,st){if(!ctx.createLinearGradient)return st[1][1];let g=ctx.createLinearGradient(x0,y0,x1,y1);for(let s of st)g.addColorStop(s[0],s[1]);return g}
function glow(ctx,r,a){ctx.fillStyle=rg(ctx,r,[[0,A(W,a)],[.3,A(G,a*.8)],[1,A(AM,0)]]);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill()}
function ring(ctx,r,w,c,a,sy=.55){ctx.save();ctx.scale(1,sy);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.strokeStyle=A(c,a);ctx.lineWidth=w;ctx.stroke();ctx.restore()}
// 拳头剪影（朝 +x），s 为尺寸
function fist(ctx,s,a){ctx.fillStyle=A(G,a);ctx.beginPath();ctx.moveTo(-s*.9,-s*.55);ctx.lineTo(s*.35,-s*.6);ctx.quadraticCurveTo(s*.95,-s*.55,s*.95,0);ctx.quadraticCurveTo(s*.95,s*.55,s*.35,s*.6);ctx.lineTo(-s*.9,s*.55);ctx.closePath();ctx.fill();
 ctx.strokeStyle=A(W,a);ctx.lineWidth=Math.max(1.5,s*.07);for(let i=1;i<4;i++){let y=-s*.6+i*s*.3;ctx.beginPath();ctx.moveTo(s*.4,y);ctx.lineTo(s*.85,y);ctx.stroke()}}
// 张开的手（朝 +x）
function hand(ctx,s,a){ctx.fillStyle=A(G,a);ctx.beginPath();ctx.ellipse(0,0,s*.55,s*.5,0,0,TAU);ctx.fill();for(let i=0;i<4;i++){let y=(i-1.5)*s*.26;ctx.beginPath();ctx.ellipse(s*.65,y,s*.32,s*.1,0,0,TAU);ctx.fill()}ctx.beginPath();ctx.ellipse(s*.1,-s*.62,s*.28,s*.1,-.8,0,TAU);ctx.fill()}
function sparks(ctx,n,R,k,s0){for(let i=0;i<n;i++){let a=hash(i+s0)*TAU,d=R*(.4+.6*hash(i*3+s0))*ease(k);ctx.strokeStyle=A(i%2?G:W,1-k);ctx.lineWidth=2.5*(1-k)+.5;ctx.beginPath();ctx.moveTo(Math.cos(a)*d,Math.sin(a)*d*.7);ctx.lineTo(Math.cos(a)*(d+12),Math.sin(a)*(d+12)*.7);ctx.stroke()}}
// ---------------- 技能 ----------------
function punch(ctx,f,k){ctx.save();ctx.translate(f.x,f.y-32);ctx.globalCompositeOperation='lighter';let e=ease(Math.min(1,k*2.5)),fade=1-k;if(!f.big)ctx.scale(.5,.5);
 ctx.fillStyle=rg(ctx,70,[[0,A(W,fade)],[.25,A('255,236,120',.95*fade)],[.6,A(G,.5*fade)],[1,A(AM,0)]]);ctx.beginPath();ctx.arc(0,0,(30+40*e),0,TAU);ctx.fill();
 ctx.rotate(f.seed);for(let i=0;i<12;i++){ctx.rotate(TAU/12);let l=(i%2?40:70)*(0.6+.6*e);ctx.fillStyle=A(W,.8*fade);ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(l,0);ctx.lineTo(0,3);ctx.closePath();ctx.fill()}
 ctx.restore()}
function haymaker(ctx,f,k){const L=400,HW=187,ch=.16;
 if(k<ch){let u=find(f.id);if(u){ctx.save();ctx.translate(u.x,u.y-38);ctx.globalCompositeOperation='lighter';ctx.scale(.75,1.25);glow(ctx,60,.9*k/ch);ctx.restore()}return}
 ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';
 let p=(k-ch)/(1-ch),e=ease(Math.min(1,p*2.2)),F=L*e,fade=p<.4?1:1-(p-.4)/.6,hw=40+(HW-40)*e;ctx.globalAlpha=fade;
 let cr=f.cr||.27,ch2=hw*cr,ch0=40*cr;
 ctx.fillStyle=lg(ctx,0,0,F,0,[[0,A(AM,.04)],[1,A(AM,.16)]]);ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(F,-hw);ctx.lineTo(F,hw);ctx.lineTo(0,40);ctx.closePath();ctx.fill();
 ctx.lineCap='round';for(let pass of [[12,AM,.45],[5,G,.9],[2,W,.9]]){ctx.strokeStyle=A(pass[1],pass[2]);ctx.lineWidth=pass[0];ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(F,-hw);ctx.moveTo(0,40);ctx.lineTo(F,hw);ctx.stroke()}
 ctx.fillStyle=lg(ctx,0,0,F,0,[[0,A('255,150,90',.35)],[1,A('255,110,70',.6)]]);ctx.beginPath();ctx.moveTo(0,-ch0);ctx.lineTo(F,-ch2);ctx.lineTo(F,ch2);ctx.lineTo(0,ch0);ctx.closePath();ctx.fill();
 for(let pass of [[8,'255,120,70',.8],[3,W,1]]){ctx.strokeStyle=A(pass[1],pass[2]);ctx.lineWidth=pass[0];ctx.beginPath();ctx.moveTo(0,-ch0);ctx.lineTo(F,-ch2);ctx.moveTo(0,ch0);ctx.lineTo(F,ch2);ctx.stroke()}
 for(let pass of [[ch2*.9,'255,200,120',.55],[10,W,1]]){ctx.strokeStyle=A(pass[1],pass[2]);ctx.lineWidth=pass[0]*(1-p*.4);ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(F,0);ctx.stroke()}
 ctx.save();ctx.translate(F*.8,0);ctx.fillStyle=rg(ctx,70,[[0,A('255,120,90',.85*(1-p))],[1,A('255,60,40',0)]]);ctx.beginPath();ctx.arc(0,0,70,0,TAU);ctx.fill();ctx.restore();
 ctx.restore()}
function facebreaker(ctx,f,k){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';const R=f.range||225,Wd=f.width||175,cl=.38;let e=ease(Math.min(1,k/cl));
 let fade=k<cl?1:Math.max(0,1-(k-cl)/(1-cl));ctx.globalAlpha=fade;ctx.fillStyle=A(G,.16);ctx.fillRect(-R,-Wd/2,R*2,Wd);ctx.strokeStyle=A(G,.55);ctx.lineWidth=2;ctx.strokeRect(-R,-Wd/2,R*2,Wd);
 for(let s of[-1,1]){let head=s*R*(1-e);ctx.fillStyle=lg(ctx,s*R,0,head,0,[[0,A(AM,0)],[.7,A(G,.35)],[1,A(W,.7)]]);let x0=Math.min(s*R,head),w=Math.abs(s*R-head);ctx.fillRect(x0,-Wd/2,w,Wd);ctx.fillStyle=A(W,.85);ctx.fillRect(head-s*6-3,-Wd/2,6,Wd);ctx.save();ctx.translate(head,0);ctx.scale(.5,Wd/100);glow(ctx,50,.8);ctx.restore()}
 if(k>=cl*.9){let p=(k-cl*.9)/(1-cl*.9),q=ease(p);ctx.globalAlpha=1-p;for(let a of[.6,-.6]){ctx.save();ctx.rotate(a);ctx.scale(1,.28);glow(ctx,90+80*q,1);ctx.restore()}glow(ctx,50+30*q,1);
  for(let i=0;i<14;i++){let a=hash(i+f.seed)*TAU,d=(30+110*hash(i*3+f.seed))*q;ctx.fillStyle=A(i%2?G:W,1);ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d*.6,2.5,0,TAU);ctx.fill()}}
 ctx.restore()}
function landing(ctx,f,k){ctx.save();ctx.translate(f.x,f.y);const R=f.r||450;
 // 金色爆心（前 40%）
 let p=Math.min(1,k/.4),q=ease(p);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-p;ctx.save();ctx.fillStyle=rg(ctx,200,[[0,A(W,1)],[.25,A('255,226,110',.95)],[.6,A(G,.6)],[1,A(AM,0)]]);ctx.beginPath();ctx.arc(0,0,90+120*q,0,TAU);ctx.fill();ctx.restore();
 ring(ctx,R*(.2+.6*q),10*(1-p)+2,G,.9,1);ring(ctx,R*(.15+.5*q),3,W,1,1);
 for(let i=0;i<10;i++){let a=i*TAU/10+hash(i+f.seed)*.5;ctx.strokeStyle=A(AM,.9);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(Math.cos(a)*30,Math.sin(a)*30);ctx.lineTo(Math.cos(a)*(60+110*q),Math.sin(a)*(60+110*q));ctx.stroke()}
 // 裂坑暗圈
 ctx.globalCompositeOperation='source-over';let lin=k<.7?1:1-(k-.7)/.3;ctx.globalAlpha=lin;ring(ctx,150,14,'60,40,22',.55,1);ring(ctx,110,6,'90,62,34',.6,1);
 // 厚尘云（扩散后停留）
 let d=ease(Math.min(1,k/.5)),dust=k<.35?k/.35:1-(k-.35)/.65;for(let i=0;i<22;i++){let a=hash(i*7+f.seed)*TAU,r=(80+220*hash(i+f.seed))*d,sz=50+50*hash(i*3+f.seed)+40*d;ctx.globalAlpha=Math.max(0,dust)*.55;ctx.fillStyle=rg(ctx,sz,[[0,A('176,140,92',.8)],[1,A('150,118,78',0)]]);ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r);ctx.beginPath();ctx.arc(0,0,sz,0,TAU);ctx.fill();ctx.restore()}
 for(let i=0;i<14;i++){let a=hash(i*5+f.seed)*TAU,sp=(90+160*hash(i+f.seed))*ease(Math.min(1,k*1.4)),y=-120*Math.sin(Math.PI*Math.min(1,k*1.3));ctx.globalAlpha=Math.max(0,1-k*1.2);ctx.fillStyle=A('70,48,28',1);ctx.fillRect(Math.cos(a)*sp-4,Math.sin(a)*sp+y*hash(i*9)-4,6+5*hash(i),6+4*hash(i*2))}
 ctx.restore()}
// ---------------- 持续状态 ----------------
function stateFx(ctx,u,T){let z=S(u),r=u.radius||24;u._settQA=Math.max(u._settQA||0,z.qAttacks||0);if(!(z.qAttacks>0))u._settQA=0;ctx.save();ctx.globalCompositeOperation='lighter';
 let g=Math.min(1,(z.grit||0)/Math.max(1,(u.maxHp||1)*.5));if(g>.4){ctx.save();ctx.translate(u.x,u.y-38);ctx.globalAlpha=Math.min(1,(g-.4)*1.6)*(.7+.3*Math.sin(T*6));ctx.scale(.7,1.3);glow(ctx,r*2.2,.55);ctx.restore()}
 if((z.qAttacks||0)>0&&(z.qEnd||0)>T){let ca=Math.cos(u.angle||0),sa=Math.sin(u.angle||0);for(let s of[-1,1]){let x=u.x+ca*r*.8-sa*s*r*.85,y=u.y+sa*r*.8+ca*s*r*.85-38;ctx.save();ctx.translate(x,y);glow(ctx,15+3*Math.sin(T*10+s),.95);ctx.restore()}}
 let sl=z.slam;if(sl&&sl.end>T){let left=Math.max(0,Math.min(1,sl.end-T));ctx.save();ctx.translate(u.x,u.y);ctx.globalAlpha=.4+.5*(1-left);ring(ctx,u.skills?.[3]?.radius||450,3,G,.6,1);ring(ctx,(u.skills?.[3]?.radius||450)*(1-left),2,W,.7,1);ctx.restore()}
 ctx.restore()}
// ---------------- 事件 ----------------
function attach(c,units,now){if(!c||core===c)return;core=c;unitsFn=units;clock=now;
 c.on('AbilityCommitted',e=>{if(typeof e.abilityId!=='number')return;let s=find(e.sourceId);if(!s||s.hero!=='sett')return;let T=clock();
  if(e.abilityId===1)push({k:'w',cr:(s.skills?.[1]?.centerWidth||100)/(s.skills?.[1]?.width||375),id:s.id,x:s.x,y:s.y,a:s.angle||0,start:T,end:T+.9,seed:seed++});
  if(e.abilityId===2){let fxE=s.settEFx;push({k:'e',x:fxE?.x??s.x,y:fxE?.y??s.y,a:fxE?.angle??s.angle??0,range:fxE?.range||s.skills?.[2]?.range,width:fxE?.width||s.skills?.[2]?.width,start:T,end:T+.7,seed:seed++})}});
 c.on('DamageApplied',e=>{if(e.itemEffect||e.runeProc||e.deferred||!(e.amount>0||e.absorbed>0))return;let s=find(e.sourceId),t=find(e.targetId);if(!s||!t||s.hero!=='sett')return;let T=clock(),a=Math.atan2(t.y-s.y,t.x-s.x);
  if(e.basic){let z=S(s),big=e.empowered||(s._settQA||0)>(z.qAttacks||0);s._settSide=-(s._settSide||1);push({k:'p',x:t.x,y:t.y,a,side:s._settSide,big,start:T,end:T+(big?.28:.2),seed:seed++});s._settQA=z.qAttacks||0;return}
  if(e.abilityId===3){let key='r'+s.id;if((attach.last[key]||-1)>T-.3)return;attach.last[key]=T;push({k:'r',x:s.x,y:s.y,r:s.skills?.[3]?.radius,start:T,end:T+1.8,seed:seed++})}})}
attach.last={};
function draw(ctx,player,units,T,seen){for(let u of units){if(u.hero!=='sett'||!(u.hp>0)||u.death>0||seen&&!seen(u))continue;stateFx(ctx,u,T)}
 for(let i=fx.length-1;i>=0;i--){let f=fx[i];if(T>=f.end||T<f.start-1){fx.splice(i,1);continue}let k=Math.max(0,Math.min(1,(T-f.start)/(f.end-f.start)));
  if(f.k==='p')punch(ctx,f,k);else if(f.k==='w')haymaker(ctx,f,k);else if(f.k==='e')facebreaker(ctx,f,k);else if(f.k==='r')landing(ctx,f,k)}}
window.SettFxV21={attach,draw,fx};
})();
