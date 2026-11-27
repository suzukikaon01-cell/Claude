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
const DRAGON_IMG=typeof Image!=='undefined'?Object.assign(new Image(),{src:'assets/fx/sett-dragon.png'}):{};
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
function crescentTrail(ctx,f,k){let u=find(f.id);if(!u)return;ctx.save();ctx.translate(u.x,u.y-30);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';let e=ease(Math.min(1,k*2)),fade=1-k;ctx.globalAlpha=fade;
 for(let i=0;i<6;i++){let y=(hash(i+f.seed)-.5)*26*f.side,l=60+80*hash(i*3+f.seed);ctx.strokeStyle=A(i%2?G:W,.7);ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(10+e*40,y);ctx.lineTo(10+e*40-l,y);ctx.stroke()}
 let x=60+e*60;ctx.fillStyle=lg(ctx,x-30,0,x+20,0,[[0,A(G,0)],[.7,A(G,.85)],[1,A(W,1)]]);ctx.beginPath();ctx.moveTo(x-10,-60);ctx.quadraticCurveTo(x+50,0,x-10,60);ctx.quadraticCurveTo(x+18,0,x-10,-60);ctx.fill();ctx.restore()}
function punch(ctx,f,k){{let u=find(f.tid);if(u&&u.hp>0){f.x=u.x;f.y=u.y}}ctx.save();ctx.translate(f.x,f.y-32);ctx.globalCompositeOperation='lighter';let e=ease(Math.min(1,k*2.5)),fade=1-k;if(!f.big)ctx.scale(.5,.5);
 ctx.fillStyle=rg(ctx,70,[[0,A(W,fade)],[.25,A('255,236,120',.95*fade)],[.6,A(G,.5*fade)],[1,A(AM,0)]]);ctx.beginPath();ctx.arc(0,0,(30+40*e),0,TAU);ctx.fill();
 ctx.rotate(f.seed);for(let i=0;i<12;i++){ctx.rotate(TAU/12);let l=(i%2?40:70)*(0.6+.6*e);ctx.fillStyle=A(W,.8*fade);ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(l,0);ctx.lineTo(0,3);ctx.closePath();ctx.fill()}
 ctx.restore()}
function dragon(ctx,S,T){// 竖立的金色龙头（侧面朝 +x）：渐变金身、流动火焰鬃毛、弯角、獠牙、飘动龙须、残影与金粉
 const flame=(x0,y0,len,ang,w,c1,c2,ph)=>{let ex=x0+Math.cos(ang)*len,ey=y0+Math.sin(ang)*len,nx=-Math.sin(ang)*w,ny=Math.cos(ang)*w,wob=Math.sin(T*14+ph)*len*.12;ctx.fillStyle=lg(ctx,x0,y0,ex,ey,[[0,A(c1,.95)],[.6,A(c2,.7)],[1,A(c2,0)]]);ctx.beginPath();ctx.moveTo(x0+nx,y0+ny);ctx.quadraticCurveTo((x0+ex)/2+nx*.6-ny*0+wob*Math.cos(ang+1.57),(y0+ey)/2+ny*.6+wob*Math.sin(ang+1.57),ex,ey);ctx.quadraticCurveTo((x0+ex)/2-nx*.6+wob,(y0+ey)/2-ny*.6,x0-nx,y0-ny);ctx.closePath();ctx.fill()};
 const headPath=()=>{ctx.beginPath();ctx.moveTo(-S*.55,-S*.05);ctx.bezierCurveTo(-S*.55,-S*.55,-S*.05,-S*.62,S*.25,-S*.45);ctx.bezierCurveTo(S*.55,-S*.38,S*.85,-S*.34,S*1.08,-S*.2);ctx.quadraticCurveTo(S*1.16,-S*.1,S*1.04,-S*.02);ctx.lineTo(S*.42,-S*.02);ctx.lineTo(S*.98,S*.16);ctx.quadraticCurveTo(S*1.02,S*.3,S*.86,S*.34);ctx.bezierCurveTo(S*.5,S*.36,S*.15,S*.48,-S*.12,S*.5);ctx.bezierCurveTo(-S*.4,S*.5,-S*.56,S*.3,-S*.55,-S*.05);ctx.closePath()};
 ctx.save();ctx.globalCompositeOperation='lighter';
 // 外层光晕
 ctx.fillStyle=rg(ctx,S*1.7,[[0,A(G,.22)],[.5,A(AM,.12)],[1,A(AM,0)]]);ctx.beginPath();ctx.arc(S*.1,0,S*1.7,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';
 // 残影（向后拖尾）
 for(let k=3;k>=1;k--){ctx.save();ctx.translate(-S*.35*k,0);ctx.globalAlpha*=.12*(4-k);headPath();ctx.fillStyle=A(G,1);ctx.fill();ctx.restore()}
 // 火焰鬃毛（两层）
 for(let i=0;i<11;i++){let a=Math.PI*(.5+.95*i/10);flame(-S*.25,S*.0,S*(1.0+.25*Math.sin(T*9+i)),a,S*.13,'255,200,80','255,90,20',i)}
 for(let i=0;i<9;i++){let a=Math.PI*(.58+.8*i/8);flame(-S*.2,0,S*(.7+.15*Math.sin(T*11+i*2)),a,S*.1,'255,220,120','255,150,30',i+5)}
 // 弯角
 for(let h of[0,1]){ctx.fillStyle=lg(ctx,-S*.1,-S*.45,-S*.95,-S*1.15,[[0,A('255,226,140',1)],[1,A(W,1)]]);ctx.beginPath();ctx.moveTo(-S*(.05+h*.12),-S*.45);ctx.bezierCurveTo(-S*(.35+h*.1),-S*(.9+h*.05),-S*(.7+h*.1),-S*(1.0+h*.1),-S*(1.0+h*.08),-S*(1.12+h*.14));ctx.bezierCurveTo(-S*(.6+h*.1),-S*(.82+h*.05),-S*(.4+h*.1),-S*.6,-S*(.25+h*.12),-S*.38);ctx.closePath();ctx.globalAlpha=h?.7:1;ctx.fill();ctx.globalAlpha=1}
 ctx.restore();
 // 头部主体：金色立体渐变
 ctx.save();ctx.shadowColor=A(AM,.8);ctx.shadowBlur=S*.18;headPath();ctx.fillStyle=lg(ctx,0,-S*.6,0,S*.5,[[0,A('255,240,170',1)],[.3,A('255,200,70',1)],[.7,A('235,140,30',1)],[1,A('170,80,15',1)]]);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle=A('120,55,10',.9);ctx.lineWidth=Math.max(1.5,S*.03);ctx.stroke();
 // 口腔
 ctx.fillStyle=lg(ctx,S*.4,0,S*1,0,[[0,A('120,20,0',1)],[1,A('255,90,20',1)]]);ctx.beginPath();ctx.moveTo(S*.42,-S*.02);ctx.lineTo(S*1.03,-S*.02);ctx.lineTo(S*.97,S*.15);ctx.closePath();ctx.fill();
 ctx.fillStyle=A(W,1);for(let i=0;i<5;i++){let x=S*(.5+i*.11);ctx.beginPath();ctx.moveTo(x,-S*.02);ctx.lineTo(x+S*.035,S*.07);ctx.lineTo(x+S*.07,-S*.02);ctx.fill();ctx.beginPath();ctx.moveTo(x+S*.01,S*(.14-i*.003)+S*.0);ctx.lineTo(x+S*.045,S*.05);ctx.lineTo(x+S*.08,S*(.15-i*.01));ctx.fill()}
 // 鳞纹与眉骨
 ctx.strokeStyle=A('180,90,15',.7);ctx.lineWidth=Math.max(1.5,S*.035);ctx.lineCap='round';for(let r=0;r<2;r++)for(let i=0;i<4;i++){let x=-S*.38+i*S*.17+r*S*.08,y=S*(.05+r*.2);ctx.beginPath();ctx.arc(x,y,S*.08,Math.PI*.1,Math.PI*.9);ctx.stroke()}
 ctx.strokeStyle=A('150,70,10',.9);ctx.lineWidth=Math.max(2,S*.05);ctx.beginPath();ctx.moveTo(S*.18,-S*.38);ctx.quadraticCurveTo(S*.42,-S*.48,S*.62,-S*.32);ctx.stroke();
 // 眼睛
 ctx.shadowColor='rgba(255,60,20,1)';ctx.shadowBlur=S*.2;ctx.fillStyle=A('255,70,30',1);ctx.beginPath();ctx.ellipse(S*.42,-S*.28,S*.1,S*.05,-.2,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle=A(W,1);ctx.beginPath();ctx.ellipse(S*.45,-S*.29,S*.035,S*.02,-.2,0,TAU);ctx.fill();
 // 鼻孔火星
 ctx.fillStyle=A('120,40,0',.9);ctx.beginPath();ctx.ellipse(S*.98,-S*.18,S*.04,S*.025,0,0,TAU);ctx.fill();
 ctx.restore();
 // 龙须
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(let w of[-1,1]){ctx.strokeStyle=lg(ctx,S*.9,0,S*1.6,0,[[0,A(W,1)],[1,A(G,0)]]);ctx.lineWidth=Math.max(2,S*.04);ctx.beginPath();ctx.moveTo(S*.92,-S*.12);ctx.bezierCurveTo(S*1.2,-S*.12+w*S*.15,S*1.3,w*S*.35+Math.sin(T*10+w)*S*.12,S*1.6,w*S*.45+Math.sin(T*8)*S*.1);ctx.stroke()}
 // 金粉
 for(let i=0;i<10;i++){let ph=(T*1.6+hash(i))%1,x=-S*.5-ph*S*1.4,y=(hash(i*3)-.5)*S*1.2+Math.sin(T*6+i)*S*.1;ctx.fillStyle=A(i%2?W:G,1-ph);ctx.beginPath();ctx.arc(x,y,S*.04*(1-ph)+1,0,TAU);ctx.fill()}
 ctx.restore()}
function beast(ctx,S,T,s0){// 朝 +x 的兽首：后方火焰鬃毛 + 头颅 + 张开的上下颚 + 暗色条纹
 ctx.save();ctx.fillStyle=rg(ctx,S*1.6,[[0,A(W,.55)],[.5,A(G,.35)],[1,A(AM,0)]]);ctx.beginPath();ctx.arc(-S*.2,0,S*1.5,0,TAU);ctx.fill();
 for(let i=0;i<9;i++){let a=Math.PI*(.55+.9*i/8),l=S*(1.0+.35*Math.sin(T*18+i*1.7));ctx.fillStyle=A(i%2?G:AM,.85);ctx.beginPath();ctx.moveTo(-S*.1+Math.cos(a)*S*.35,Math.sin(a)*S*.5);ctx.quadraticCurveTo(-S*.4+Math.cos(a)*l*.8,Math.sin(a)*l*.9,-S*.3+Math.cos(a)*l,Math.sin(a)*l*.75+S*.12);ctx.lineTo(-S*.1+Math.cos(a+.25)*S*.35,Math.sin(a+.25)*S*.5);ctx.closePath();ctx.fill()}
 ctx.fillStyle=A('255,214,90',.95);ctx.beginPath();ctx.moveTo(-S*.35,-S*.45);ctx.quadraticCurveTo(S*.35,-S*.6,S*.75,-S*.18);ctx.lineTo(S*.95,-S*.05);ctx.lineTo(S*.35,0);ctx.lineTo(S*.9,S*.12);ctx.lineTo(S*.7,S*.3);ctx.quadraticCurveTo(S*.2,S*.5,-S*.35,S*.45);ctx.closePath();ctx.fill();
 ctx.strokeStyle=A('170,80,20',.75);ctx.lineWidth=Math.max(2,S*.06);ctx.lineCap='round';for(let i=0;i<4;i++){let x=-S*.25+i*S*.2;ctx.beginPath();ctx.moveTo(x,-S*.38+i*S*.03);ctx.lineTo(x+S*.12,-S*.15);ctx.stroke();ctx.beginPath();ctx.moveTo(x,S*.38-i*S*.03);ctx.lineTo(x+S*.12,S*.18);ctx.stroke()}
 ctx.fillStyle=A(W,1);ctx.beginPath();ctx.ellipse(S*.38,-S*.25,S*.1,S*.05,-.3,0,TAU);ctx.fill();
 ctx.fillStyle=A(W,.95);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(S*(.45+i*.15),-S*.05);ctx.lineTo(S*(.5+i*.15),S*.06);ctx.lineTo(S*(.55+i*.15),-S*.05);ctx.fill()}
 ctx.restore()}
function haymaker(ctx,f,k){{let u=find(f.id);if(u&&u.hp>0){f.x=u.x;f.y=u.y}}const L=400,HW=187,ch=.5;
 if(k<ch){let q=k/ch,u=find(f.id);if(u){ctx.save();ctx.translate(u.x,u.y-38);ctx.globalCompositeOperation='lighter';ctx.scale(.75,1.25);glow(ctx,50+25*q,.5+.5*q);ctx.restore()}ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+.35*q;ctx.strokeStyle=A(G,.8);ctx.lineWidth=2;ctx.setLineDash?.([10,8]);ctx.beginPath();ctx.moveTo(0,-51);ctx.lineTo(L,-HW);ctx.lineTo(L,HW);ctx.lineTo(0,51);ctx.stroke();ctx.setLineDash?.([]);ctx.fillStyle=A(G,.08);ctx.fill();ctx.fillStyle=A(G,.5);ctx.fillRect(0,-2,L*q,4);ctx.restore();return}
 ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';
 let p=(k-ch)/(1-ch),e=ease(Math.min(1,p*2.2)),F=L*e,fade=p<.4?1:1-(p-.4)/.6,hw=40+(HW-40)*e;ctx.globalAlpha=fade;
 let cr=f.cr||.27,ch2=hw*cr,ch0=40*cr;
 ctx.fillStyle=lg(ctx,0,0,F,0,[[0,A(AM,.04)],[1,A(AM,.16)]]);ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(F,-hw);ctx.lineTo(F,hw);ctx.lineTo(0,40);ctx.closePath();ctx.fill();
 ctx.lineCap='round';for(let pass of [[12,AM,.45],[5,G,.9],[2,W,.9]]){ctx.strokeStyle=A(pass[1],pass[2]);ctx.lineWidth=pass[0];ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(F,-hw);ctx.moveTo(0,40);ctx.lineTo(F,hw);ctx.stroke()}
 ctx.fillStyle=lg(ctx,0,0,F,0,[[0,A('255,150,90',.35)],[1,A('255,110,70',.6)]]);ctx.beginPath();ctx.moveTo(0,-ch0);ctx.lineTo(F,-ch2);ctx.lineTo(F,ch2);ctx.lineTo(0,ch0);ctx.closePath();ctx.fill();
 for(let pass of [[8,'255,120,70',.8],[3,W,1]]){ctx.strokeStyle=A(pass[1],pass[2]);ctx.lineWidth=pass[0];ctx.beginPath();ctx.moveTo(0,-ch0);ctx.lineTo(F,-ch2);ctx.moveTo(0,ch0);ctx.lineTo(F,ch2);ctx.stroke()}
 for(let pass of [[ch2*.9,'255,200,120',.55],[10,W,1]]){ctx.strokeStyle=A(pass[1],pass[2]);ctx.lineWidth=pass[0]*(1-p*.4);ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(F,0);ctx.stroke()}
 if(p<.75){let bx=Math.min(F,L)*.95,bp=p/.75;ctx.save();ctx.translate(bx,0);ctx.rotate(-f.a);let dir=Math.cos(f.a)<0?-1:1;ctx.translate(0,-75);ctx.scale(dir,1);ctx.globalAlpha=fade*(1-bp*.6);if(window.SettGlbV21?.ready?.()){}else if(DRAGON_IMG.complete&&DRAGON_IMG.naturalWidth){let Wd=(210+90*e),Hd=Wd*DRAGON_IMG.naturalHeight/DRAGON_IMG.naturalWidth,bob=Math.sin((f.T||0)*14)*3;ctx.drawImage(DRAGON_IMG,-Wd*.72,-Hd/2+bob,Wd,Hd);ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=.35+.15*Math.sin((f.T||0)*20);ctx.drawImage(DRAGON_IMG,-Wd*.72,-Hd/2+bob,Wd,Hd)}else dragon(ctx,60+35*e,f.T||0);ctx.restore()}ctx.save();ctx.translate(F*.72,0);ctx.fillStyle=rg(ctx,80,[[0,A('255,110,90',.9*(1-p))],[.5,A('255,70,60',.5*(1-p))],[1,A('255,40,40',0)]]);ctx.beginPath();ctx.arc(0,0,80,0,TAU);ctx.fill();ctx.restore();
 // 真伤命中处的红色光柱（向屏幕上方）
 if(p<.5){ctx.save();ctx.translate(F*.72,0);ctx.rotate(-f.a);let h=260*(1-p*1.4),w=26*(1-p);ctx.fillStyle=lg(ctx,0,0,0,-h,[[0,A('255,120,100',.8)],[1,A('255,80,80',0)]]);ctx.fillRect(-w/2,-h,w,h);ctx.restore()}
 // 金色兽魂（原创：火焰鬃毛的咆哮兽首，沿中线冲出）
 
 ctx.restore()}
function facebreaker(ctx,f,k){{let u=find(f.id);if(u&&u.hp>0){f.x=u.x;f.y=u.y}}ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalCompositeOperation='lighter';const R=f.range||225,Wd=f.width||175,cl=.38;let e=ease(Math.min(1,k/cl));
 let fade=k<cl?1:Math.max(0,1-(k-cl)/(1-cl));ctx.globalAlpha=fade;ctx.fillStyle=A(G,.16);ctx.fillRect(-R,-Wd/2,R*2,Wd);ctx.strokeStyle=A(G,.55);ctx.lineWidth=2;ctx.strokeRect(-R,-Wd/2,R*2,Wd);
 for(let s of[-1,1]){let head=s*R*(1-e);ctx.fillStyle=lg(ctx,s*R,0,head,0,[[0,A(AM,0)],[.7,A(G,.35)],[1,A(W,.7)]]);let x0=Math.min(s*R,head),w=Math.abs(s*R-head);ctx.fillRect(x0,-Wd/2,w,Wd);ctx.fillStyle=A(W,.85);ctx.fillRect(head-s*6-3,-Wd/2,6,Wd);ctx.save();ctx.translate(head,0);ctx.scale(.5,Wd/100);glow(ctx,50,.8);ctx.restore()}
 if(k>=cl*.9){let p=(k-cl*.9)/(1-cl*.9),q=ease(p);ctx.save();ctx.rotate(-f.a);ctx.globalAlpha=1-p;ctx.fillStyle=lg(ctx,0,0,0,-220,[[0,A(W,.9)],[.4,A(G,.6)],[1,A(G,0)]]);ctx.fillRect(-14*(1-p),-220*q,28*(1-p),220*q);ctx.strokeStyle=A(G,.95);ctx.lineWidth=10*(1-p)+2;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-60,90,Math.PI*.15,Math.PI*.15+Math.PI*1.2*q,false);ctx.stroke();ctx.globalCompositeOperation='source-over';for(let r=0;r<8;r++){let a=hash(r+f.seed)*TAU,d=60+40*hash(r*3);ctx.fillStyle=A(r%2?'70,55,45':'110,90,70',1-p);ctx.beginPath();ctx.moveTo(Math.cos(a)*d-8,Math.sin(a)*d*.6);ctx.lineTo(Math.cos(a)*d,Math.sin(a)*d*.6-30*q);ctx.lineTo(Math.cos(a)*d+8,Math.sin(a)*d*.6);ctx.fill()}ctx.globalCompositeOperation='lighter';ctx.restore();ctx.globalAlpha=1-p;for(let a of[.6,-.6]){ctx.save();ctx.rotate(a);ctx.scale(1,.28);glow(ctx,90+80*q,1);ctx.restore()}glow(ctx,50+30*q,1);
  for(let i=0;i<14;i++){let a=hash(i+f.seed)*TAU,d=(30+110*hash(i*3+f.seed))*q;ctx.fillStyle=A(i%2?G:W,1);ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d*.6,2.5,0,TAU);ctx.fill()}}
 ctx.restore()}
function landing(ctx,f,k){{let u=find(f.id);if(u&&u.hp>0&&k<.5){f.x=u.x;f.y=u.y}}ctx.save();ctx.translate(f.x,f.y);const R=f.r||450;
 // 金色爆心（前 40%）
 let p=Math.min(1,k/.4),q=ease(p);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-p;ctx.save();ctx.fillStyle=rg(ctx,200,[[0,A(W,1)],[.25,A('255,226,110',.95)],[.6,A(G,.6)],[1,A(AM,0)]]);ctx.beginPath();ctx.arc(0,0,90+120*q,0,TAU);ctx.fill();ctx.restore();
 ring(ctx,R*(.2+.6*q),10*(1-p)+2,G,.9,1);ring(ctx,R*(.15+.5*q),3,W,1,1);
 for(let i=0;i<10;i++){let a=i*TAU/10+hash(i+f.seed)*.5;ctx.strokeStyle=A(AM,.9);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(Math.cos(a)*30,Math.sin(a)*30);ctx.lineTo(Math.cos(a)*(60+110*q),Math.sin(a)*(60+110*q));ctx.stroke()}
 // 岩刺与光柱
 ctx.globalCompositeOperation='source-over';{let rise=ease(Math.min(1,k/.15)),sink=k<.6?1:1-(k-.6)/.4;for(let i=0;i<14;i++){let a=i*TAU/14+hash(i+f.seed)*.3,d=110+90*hash(i*7+f.seed),h=(40+50*hash(i*3+f.seed))*rise*sink,x=Math.cos(a)*d,y=Math.sin(a)*d;ctx.fillStyle=A(i%2?'64,52,44':'98,82,66',1);ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x+(hash(i)-.5)*10,y-h);ctx.lineTo(x+12,y);ctx.closePath();ctx.fill();ctx.fillStyle=A(G,.6*sink);ctx.fillRect(x-1.5,y-h*.9,3,h*.8)}}
 ctx.globalCompositeOperation='lighter';if(k<.45){let q=k/.45;ctx.fillStyle=lg(ctx,0,0,0,-420,[[0,A(W,1-q)],[.4,A(G,.7*(1-q))],[1,A(G,0)]]);ctx.fillRect(-30*(1-q),-420,60*(1-q),420)}
 // 裂坑暗圈
 ctx.globalCompositeOperation='source-over';let lin=k<.7?1:1-(k-.7)/.3;ctx.globalAlpha=lin;ring(ctx,150,14,'60,40,22',.55,1);ring(ctx,110,6,'90,62,34',.6,1);
 // 厚尘云（扩散后停留）
 let d=ease(Math.min(1,k/.5)),dust=k<.35?k/.35:1-(k-.35)/.65;for(let i=0;i<22;i++){let a=hash(i*7+f.seed)*TAU,r=(80+220*hash(i+f.seed))*d,sz=50+50*hash(i*3+f.seed)+40*d;ctx.globalAlpha=Math.max(0,dust)*.55;ctx.fillStyle=rg(ctx,sz,[[0,A('176,140,92',.8)],[1,A('150,118,78',0)]]);ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r);ctx.beginPath();ctx.arc(0,0,sz,0,TAU);ctx.fill();ctx.restore()}
 for(let i=0;i<14;i++){let a=hash(i*5+f.seed)*TAU,sp=(90+160*hash(i+f.seed))*ease(Math.min(1,k*1.4)),y=-120*Math.sin(Math.PI*Math.min(1,k*1.3));ctx.globalAlpha=Math.max(0,1-k*1.2);ctx.fillStyle=A('70,48,28',1);ctx.fillRect(Math.cos(a)*sp-4,Math.sin(a)*sp+y*hash(i*9)-4,6+5*hash(i),6+4*hash(i*2))}
 ctx.restore()}
// ---------------- 持续状态 ----------------
function stateFx(ctx,u,T){let z=S(u),r=u.radius||24;u._settQA=Math.max(u._settQA||0,z.qAttacks||0);if(!(z.qAttacks>0))u._settQA=0;ctx.save();ctx.globalCompositeOperation='lighter';
 let g=Math.min(1,(z.grit||0)/Math.max(1,(u.maxHp||1)*.5));if(g>.4){ctx.save();ctx.translate(u.x,u.y);ctx.globalAlpha=Math.min(1,(g-.4)*1.6);for(let j=0;j<3;j++){ctx.save();ctx.rotate(T*(j%2?-1.6:2.2)+j);ctx.strokeStyle=A(j?G:W,.8);ctx.lineWidth=3-j*.6;for(let q=0;q<3;q++){ctx.beginPath();ctx.arc(0,0,r+14+j*9,q*TAU/3,q*TAU/3+1.3);ctx.stroke()}ctx.restore()}ctx.restore();ctx.save();ctx.translate(u.x,u.y-38);ctx.globalAlpha=Math.min(1,(g-.4)*1.6)*(.7+.3*Math.sin(T*6));ctx.scale(.7,1.3);glow(ctx,r*2.2,.55);ctx.restore()}
 if((z.qAttacks||0)>0&&(z.qEnd||0)>T){let ca=Math.cos(u.angle||0),sa=Math.sin(u.angle||0);for(let s of[-1,1]){let x=u.x+ca*r*.8-sa*s*r*.85,y=u.y+sa*r*.8+ca*s*r*.85-38;ctx.save();ctx.translate(x,y);glow(ctx,15+3*Math.sin(T*10+s),.95);ctx.restore()}}
 let sl=z.slam;if(sl&&sl.end>T){let left=Math.max(0,Math.min(1,sl.end-T));ctx.save();ctx.translate(u.x,u.y);ctx.globalAlpha=.4+.5*(1-left);ring(ctx,u.skills?.[3]?.radius||450,3,G,.6,1);ring(ctx,(u.skills?.[3]?.radius||450)*(1-left),2,W,.7,1);ctx.restore()}
 ctx.restore()}

// 技能指示器（金色风格）：W 箭头+中心真伤通道+人字形箭纹；E 前后双向长条+中心拳印
function aimFx(ctx,i,range,width,skill,T){if(i!==1&&i!==2)return false;ctx.save();ctx.lineJoin='round';
 if(i===1){let N=(skill.nearWidth||102)/2,F=width/2,c=(skill.centerWidth||104)/width;ctx.fillStyle=lg(ctx,0,0,range,0,[[0,A(G,.08)],[1,A(G,.22)]]);ctx.beginPath();ctx.moveTo(0,-N);ctx.lineTo(range,-F);ctx.lineTo(range,F);ctx.lineTo(0,N);ctx.closePath();ctx.fill();ctx.strokeStyle=A(G,.9);ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle=A('255,150,80',.28);ctx.beginPath();ctx.moveTo(0,-N*c);ctx.lineTo(range,-F*c);ctx.lineTo(range,F*c);ctx.lineTo(0,N*c);ctx.closePath();ctx.fill();ctx.strokeStyle=A('255,170,90',.8);ctx.lineWidth=2;ctx.stroke();
  for(let k=0;k<4;k++){let x=range*(.3+k*.15)+((T*120)%(range*.15)),h=18;ctx.strokeStyle=A(W,.85-k*.12);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-14,-h);ctx.lineTo(x,0);ctx.lineTo(x-14,h);ctx.stroke()}}
 else{let H=width/2;ctx.fillStyle=A(G,.14);ctx.fillRect(-range,-H,range*2,H*2);ctx.strokeStyle=A(G,.9);ctx.lineWidth=3;ctx.strokeRect(-range,-H,range*2,H*2);
  for(let sd of[-1,1])for(let k=0;k<3;k++){let x=sd*(range-30-k*26)-sd*((T*90)%26);ctx.strokeStyle=A(W,.8-k*.2);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+sd*12,-H*.45);ctx.lineTo(x-sd*4,0);ctx.lineTo(x+sd*12,H*.45);ctx.stroke()}
  ctx.strokeStyle=A(G,.95);ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,26,0,TAU);ctx.stroke()}
 ctx.restore();return true}
// ---------------- 事件 ----------------
function attach(c,units,now){if(!c||core===c)return;core=c;unitsFn=units;clock=now;
 c.on('AbilityCommitted',e=>{if(typeof e.abilityId!=='number')return;let s=find(e.sourceId);if(!s||s.hero!=='sett')return;let T=clock();
  if(e.abilityId===1){s._settWAt=T;s._settWAngle=s.angle||0}if(e.abilityId===1)push({k:'w',cr:(s.skills?.[1]?.centerWidth||100)/(s.skills?.[1]?.width||375),id:s.id,x:s.x,y:s.y,a:s.angle||0,start:T,end:T+1.3,seed:seed++});
  if(e.abilityId===2){s._settEAt=T;let fxE=s.settEFx;push({k:'e',id:s.id,x:fxE?.x??s.x,y:fxE?.y??s.y,a:fxE?.angle??s.angle??0,range:fxE?.range||s.skills?.[2]?.range,width:fxE?.width||s.skills?.[2]?.width,start:T,end:T+.7,seed:seed++})}});
 c.on('DamageApplied',e=>{if(e.itemEffect||e.runeProc||e.deferred||!(e.amount>0||e.absorbed>0))return;let s=find(e.sourceId),t=find(e.targetId);if(!s||!t||s.hero!=='sett')return;let T=clock(),a=Math.atan2(t.y-s.y,t.x-s.x);
  if(e.basic){let z=S(s),big=e.empowered||(s._settQA||0)>(z.qAttacks||0);s._settSide=-(s._settSide||1);if(big){s._settQHitAt=T;s._settQHitAngle=a}if(big)push({k:'qc',id:s.id,a,side:s._settSide,start:T,end:T+.3,seed:seed++});push({k:'p',tid:t.id,x:t.x,y:t.y,a,side:s._settSide,big,start:T,end:T+(big?.28:.2),seed:seed++});s._settQA=z.qAttacks||0;return}
  if(e.abilityId===3){let key='r'+s.id;if((attach.last[key]||-1)>T-.3)return;attach.last[key]=T;s._settRAt=T;s._settRX=s.x;s._settRY=s.y;push({k:'r',id:s.id,x:s.x,y:s.y,r:s.skills?.[3]?.radius,start:T,end:T+1.8,seed:seed++})}})}
attach.last={};
function draw(ctx,player,units,T,seen){for(let u of units){if(u.hero!=='sett'||!(u.hp>0)||u.death>0||seen&&!seen(u))continue;stateFx(ctx,u,T)}
 for(let i=fx.length-1;i>=0;i--){let f=fx[i];if(T>=f.end||T<f.start-1){fx.splice(i,1);continue}let k=Math.max(0,Math.min(1,(T-f.start)/(f.end-f.start)));f.T=T;
  if(f.k==='p')punch(ctx,f,k);else if(f.k==='qc')crescentTrail(ctx,f,k);else if(f.k==='w')haymaker(ctx,f,k);else if(f.k==='e')facebreaker(ctx,f,k);else if(f.k==='r')landing(ctx,f,k)}}
window.SettFxV21={attach,draw,fx,aim:aimFx};
})();
