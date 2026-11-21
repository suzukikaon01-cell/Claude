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
function punch(ctx,f,k){ctx.save();ctx.translate(f.x,f.y-30);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';let e=ease(k);ctx.globalAlpha=1-k;
 glow(ctx,(f.big?48:36)*(.6+.6*e),.9);ctx.lineCap='round';ctx.beginPath();ctx.arc(-10,0,(f.big?44:34)*(.7+.4*e),-1.1*f.side-.1,1.1*f.side+.1,f.side<0);ctx.strokeStyle=A(G,1);ctx.lineWidth=(f.big?10:7)*(1-k*.5);ctx.stroke();ctx.strokeStyle=A(W,1);ctx.lineWidth=2.5;ctx.stroke();
 sparks(ctx,f.big?8:5,60,k,f.seed);ctx.restore()}
function haymaker(ctx,f,k){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';const L=400,HW=187,ch=.14;
 if(k<ch){let p=k/ch;for(let i=0;i<10;i++){let a=hash(i+f.seed)*TAU,r=80*(1-p);ctx.fillStyle=A(G,p);ctx.beginPath();ctx.arc(30+Math.cos(a)*r,-30+Math.sin(a)*r,3,0,TAU);ctx.fill()}ctx.save();ctx.translate(30,-30);glow(ctx,30+20*p,.8*p);ctx.restore();ctx.restore();return}
 let p=(k-ch)/(1-ch),e=ease(Math.min(1,p*1.8)),F=L*e,fade=p<.45?1:1-(p-.45)/.55,hw=36+(HW-36)*e;ctx.globalAlpha=fade;
 ctx.fillStyle=lg(ctx,0,0,F,0,[[0,A(G,.05)],[.6,A(G,.28)],[1,A(W,.42)]]);ctx.beginPath();ctx.moveTo(20,-36);ctx.lineTo(F,-hw);ctx.quadraticCurveTo(F+30,0,F,hw);ctx.lineTo(20,36);ctx.closePath();ctx.fill();
 ctx.strokeStyle=A(G,.9);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(20,-36);ctx.lineTo(F,-hw);ctx.moveTo(20,36);ctx.lineTo(F,hw);ctx.stroke();
 let cw=34*(1-p*.4);ctx.fillStyle=lg(ctx,0,-cw/2,0,cw/2,[[0,A(G,0)],[.5,A(W,1)],[1,A(G,0)]]);ctx.fillRect(20,-cw/2,F-20,cw);
 ctx.save();ctx.translate(F-40,0);fist(ctx,70+40*e,.55*fade);ctx.restore();
 ctx.save();ctx.translate(F,0);glow(ctx,80,.7*(1-p));ctx.restore();ctx.restore()}
function facebreaker(ctx,f,k){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';const R=f.range||225,cl=.4;let e=ease(Math.min(1,k/cl));
 if(k<cl+.1){ctx.globalAlpha=k<cl?1:1-(k-cl)/.1;ctx.fillStyle=A(G,.12);ctx.fillRect(-R,-(f.width||175)/2,R*2,f.width||175);
  for(let s of[-1,1]){let x=s*R*(1-e)+s*20;ctx.save();ctx.translate(x,0);ctx.fillStyle=lg(ctx,s*80,0,0,0,[[0,A(G,0)],[1,A(G,.5)]]);ctx.fillRect(s>0?0:-80,-26,80,52);ctx.rotate(s>0?Math.PI:0);hand(ctx,62,.85);ctx.restore()}}
 if(k>=cl*.95){let p=(k-cl*.95)/(1-cl*.95);ctx.globalAlpha=1-p;ctx.save();ctx.translate(0,-30);glow(ctx,90*(.5+p),1-p);ctx.restore();ring(ctx,60+110*ease(p),8*(1-p)+1,G,1);ring(ctx,30+70*ease(p),3,W,1);sparks(ctx,10,110,p,f.seed)}
 ctx.restore()}
function landing(ctx,f,k){ctx.save();ctx.translate(f.x,f.y);const R=f.r||450;
 let crack=k<.6?1:1-(k-.6)/.4;for(let i=0;i<7;i++){let a=i*TAU/7+hash(i+f.seed)*.6,len=90+70*hash(i*3+f.seed),w=14+8*hash(i*5+f.seed);ctx.save();ctx.scale(1,.55);ctx.rotate(a);ctx.beginPath();ctx.moveTo(45,-w/2);ctx.lineTo(45+len*.55,-w*.25+(hash(i*9)-.5)*8);ctx.lineTo(45+len,0);ctx.lineTo(45+len*.5,w*.3);ctx.lineTo(45,w/2);ctx.closePath();ctx.fillStyle=A('70,48,28',.85*crack);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.beginPath();ctx.moveTo(48,0);ctx.lineTo(45+len*.55,0);ctx.lineTo(45+len*.9,0);ctx.strokeStyle=A(G,.8*crack*(k<.3?1:.6));ctx.lineWidth=3;ctx.stroke();ctx.restore()}ctx.save();ctx.scale(1,.55);ctx.fillStyle=rg(ctx,70,[[0,A('70,48,28',.7*crack)],[1,A('70,48,28',0)]]);ctx.beginPath();ctx.arc(0,0,70,0,TAU);ctx.fill();ctx.restore();ctx.globalCompositeOperation='lighter';
 let p=Math.min(1,k/.5),e=ease(p);ctx.globalAlpha=1-p;if(p<.25){ctx.save();ctx.scale(1,.6);glow(ctx,200*(.5+p*2),1-p*2);ctx.restore()}
 ring(ctx,R*(.1+.9*e),18*(1-p)+3,G,.95);ring(ctx,R*(.1+.9*e),5*(1-p)+1,W,1);ring(ctx,R*(.05+.55*e),8*(1-p)+1,AM,.7);
 ctx.globalCompositeOperation='source-over';ring(ctx,R*(.2+.6*e),26*(1-p),DUST,.35*(1-p));ctx.restore()}
// ---------------- 持续状态 ----------------
function stateFx(ctx,u,T){let z=S(u),r=u.radius||24;u._settQA=Math.max(u._settQA||0,z.qAttacks||0);if(!(z.qAttacks>0))u._settQA=0;ctx.save();ctx.globalCompositeOperation='lighter';
 let g=Math.min(1,(z.grit||0)/Math.max(1,(u.maxHp||1)*.5));if(g>.5){ctx.save();ctx.translate(u.x,u.y-36);ctx.globalAlpha=(g-.5)*1.2*(.75+.25*Math.sin(T*5));ctx.scale(.8,1.3);glow(ctx,r*1.9,.35);ctx.restore()}
 if((z.qAttacks||0)>0&&(z.qEnd||0)>T){let ca=Math.cos(u.angle||0),sa=Math.sin(u.angle||0);for(let s of[-1,1]){let x=u.x+ca*r*.8-sa*s*r*.85,y=u.y+sa*r*.8+ca*s*r*.85-38;ctx.save();ctx.translate(x,y);glow(ctx,15+3*Math.sin(T*10+s),.95);ctx.restore()}}
 let sl=z.slam;if(sl&&sl.end>T){let left=Math.max(0,Math.min(1,sl.end-T));ctx.save();ctx.translate(u.x,u.y);ctx.globalAlpha=.4+.5*(1-left);ring(ctx,u.skills?.[3]?.radius||450,3,G,.6);ring(ctx,(u.skills?.[3]?.radius||450)*(1-left),2,W,.7);ctx.restore()}
 ctx.restore()}
// ---------------- 事件 ----------------
function attach(c,units,now){if(!c||core===c)return;core=c;unitsFn=units;clock=now;
 c.on('AbilityCommitted',e=>{if(typeof e.abilityId!=='number')return;let s=find(e.sourceId);if(!s||s.hero!=='sett')return;let T=clock();
  if(e.abilityId===1)push({k:'w',x:s.x,y:s.y,a:s.angle||0,start:T,end:T+.9,seed:seed++});
  if(e.abilityId===2){let fxE=s.settEFx;push({k:'e',x:fxE?.x??s.x,y:fxE?.y??s.y,a:fxE?.angle??s.angle??0,range:fxE?.range||s.skills?.[2]?.range,width:fxE?.width||s.skills?.[2]?.width,start:T,end:T+.7,seed:seed++})}});
 c.on('DamageApplied',e=>{if(e.itemEffect||e.runeProc||e.deferred||!(e.amount>0||e.absorbed>0))return;let s=find(e.sourceId),t=find(e.targetId);if(!s||!t||s.hero!=='sett')return;let T=clock(),a=Math.atan2(t.y-s.y,t.x-s.x);
  if(e.basic){let z=S(s);if(e.empowered||(s._settQA||0)>(z.qAttacks||0)){s._settSide=-(s._settSide||1);push({k:'p',x:t.x,y:t.y,a,side:s._settSide,big:true,start:T,end:T+.35,seed:seed++})}s._settQA=z.qAttacks||0;return}
  if(e.abilityId===3){let key='r'+s.id;if((attach.last[key]||-1)>T-.3)return;attach.last[key]=T;push({k:'r',x:s.x,y:s.y,r:s.skills?.[3]?.radius,start:T,end:T+1.3,seed:seed++})}})}
attach.last={};
function draw(ctx,player,units,T,seen){for(let u of units){if(u.hero!=='sett'||!(u.hp>0)||u.death>0||seen&&!seen(u))continue;stateFx(ctx,u,T)}
 for(let i=fx.length-1;i>=0;i--){let f=fx[i];if(T>=f.end||T<f.start-1){fx.splice(i,1);continue}let k=Math.max(0,Math.min(1,(T-f.start)/(f.end-f.start)));
  if(f.k==='p')punch(ctx,f,k);else if(f.k==='w')haymaker(ctx,f,k);else if(f.k==='e')facebreaker(ctx,f,k);else if(f.k==='r')landing(ctx,f,k)}}
window.SettFxV21={attach,draw,fx};
})();
