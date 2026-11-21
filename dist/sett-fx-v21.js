/* V21 腕豪（瑟提）专属技能特效——拳击手 / 地下拳王风格（原创绘制，仅视觉）。
 * 不用法阵、符文等魔法元素，全部是"肉搏"质感：白色冲击闪光、漫画式冲击线、地面尘土、碎石、裂地，以及代表"豪意"的琥珀色热浪。
 * 被动豪意：豪意越多，身上蒸腾的琥珀色热浪越明显。
 * Q 屈人之威：双拳烧红发热；奔跑时脚下扬尘；两记强化重拳左右交替，命中时白色闪爆+粗冲击线+地面尘圈。
 * W 蓄意轰拳：豪意向拳头收拢，然后一拳轰出：沿 400 长的锥形推进的气压波（多道弧形压缩波）、中央白热真伤拳芯、地面被吹起的尘土碎石。
 * E 强手裂颅：两侧掀起尘浪向中间猛合，中心"啪"的一声白色拍击闪光+冲击线。
 * R 叹为观止：扛起目标时地面出现落点阴影；落地砸出带裂纹的陨坑（残留约 1.5 秒），碎石飞溅、厚尘圈扩散、多重地面冲击波。 */
(()=>{'use strict';
const TAU=Math.PI*2,hash=n=>{let x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
const A=(c,a)=>'rgba('+c+','+Math.max(0,Math.min(1,a))+')',ease=k=>1-Math.pow(1-k,3);
const WHITE='255,252,244',AMBER='255,170,60',HOT='255,110,40',DUST='205,180,140',DIRT='120,92,62',DARK='58,40,26';
const fx=[];const push=f=>{fx.push(f);if(fx.length>160)fx.splice(0,fx.length-160)};
let core=null,unitsFn=null,clock=()=>0,seed=1;const find=id=>unitsFn?.().find(u=>u.id===id);
const S=u=>u?.championState||{};
function rg(ctx,r,stops){if(!ctx.createRadialGradient)return stops[1][1];let g=ctx.createRadialGradient(0,0,0,0,0,r);for(let s of stops)g.addColorStop(s[0],s[1]);return g}
function lg(ctx,x0,y0,x1,y1,stops){if(!ctx.createLinearGradient)return stops[1][1];let g=ctx.createLinearGradient(x0,y0,x1,y1);for(let s of stops)g.addColorStop(s[0],s[1]);return g}
function puff(ctx,x,y,r,c,a){ctx.fillStyle=rg(ctx,r,[[0,A(c,a)],[.6,A(c,a*.6)],[1,A(c,0)]]);ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.restore()}
// 漫画式冲击线（粗短的放射线，带白芯）
function impactLines(ctx,n,r0,r1,w,c,s0,spread=TAU,dir=0){for(let i=0;i<n;i++){let a=dir-spread/2+spread*(i+hash(i+s0)*.6)/n,l0=r0*(.8+.4*hash(i*3+s0)),l1=r1*(.7+.5*hash(i*7+s0));ctx.beginPath();ctx.moveTo(Math.cos(a)*l0,Math.sin(a)*l0);ctx.lineTo(Math.cos(a)*l1,Math.sin(a)*l1);ctx.strokeStyle=A(c,.95);ctx.lineWidth=w*(.6+.6*hash(i+s0*2));ctx.lineCap='round';ctx.stroke()}}
function flatRing(ctx,r,w,c,a){ctx.save();ctx.scale(1,.55);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.strokeStyle=A(c,a);ctx.lineWidth=w;ctx.stroke();ctx.restore()}
function rocks(ctx,n,R,k,s0,lift=140){for(let i=0;i<n;i++){let a=hash(i*5+s0)*TAU,sp=R*(.4+.8*hash(i+s0)),e=ease(k),x=Math.cos(a)*sp*e,y=Math.sin(a)*sp*e*.55-lift*Math.sin(Math.PI*Math.min(1,k*1.2))*(.5+hash(i*9+s0));ctx.save();ctx.translate(x,y);ctx.rotate(k*8*(hash(i)-.5));ctx.fillStyle=A(i%3?DIRT:DARK,1-k*k);let s=5+7*hash(i*11+s0);ctx.beginPath();ctx.moveTo(-s,-s*.4);ctx.lineTo(-s*.2,-s);ctx.lineTo(s,-s*.3);ctx.lineTo(s*.6,s*.7);ctx.lineTo(-s*.7,s*.6);ctx.closePath();ctx.fill();ctx.restore()}}
// ---------------- 绘制 ----------------
function punchHit(ctx,f,k){ctx.save();ctx.translate(f.x,f.y);let e=ease(k),R=f.big?70:52;
 ctx.globalAlpha=1-k;ctx.save();ctx.translate(0,8);flatRing(ctx,R*(.4+e),5*(1-k)+1,DUST,.8);ctx.restore();
 for(let i=0;i<5;i++){let a=f.a+Math.PI+(hash(i+f.seed)-.5)*1.6,r=R*.6*e*(.6+hash(i*3+f.seed));puff(ctx,Math.cos(a)*r,Math.sin(a)*r*.6+6,14+10*k,DUST,.45*(1-k))}
 if(k<.35){let p=k/.35;ctx.globalAlpha=1-p;ctx.fillStyle=A(WHITE,1);ctx.beginPath();for(let i=0;i<10;i++){let r=i%2?R*.25:R*(.55+.2*hash(i+f.seed)),a=f.a+i*TAU/10;ctx.lineTo(Math.cos(a)*r*(.6+p*.6),Math.sin(a)*r*(.6+p*.6))}ctx.closePath();ctx.fill();ctx.fillStyle=A(AMBER,.9);ctx.beginPath();ctx.arc(0,0,R*.2*(1-p),0,TAU);ctx.fill()}
 ctx.globalAlpha=1-k;impactLines(ctx,f.big?12:8,R*.5+R*.4*e,R*1.1+R*.6*e,f.big?6:4,WHITE,f.seed);
 ctx.restore()}
function haymaker(ctx,f,k,u){let T=f.T;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);let L=400,W=375,charge=.12;
 if(k<charge){let p=k/charge;for(let i=0;i<10;i++){let a=hash(i+f.seed)*TAU,r=70*(1-p);puff(ctx,40+Math.cos(a)*r,Math.sin(a)*r,6,AMBER,.8*p)}ctx.fillStyle=rg(ctx,40,[[0,A(WHITE,.9*p)],[.5,A(AMBER,.6*p)],[1,A(HOT,0)]]);ctx.beginPath();ctx.arc(40,0,40,0,TAU);ctx.fill();ctx.restore();return}
 let p=(k-charge)/(1-charge),e=ease(Math.min(1,p*1.6)),front=L*e,fade=p<.5?1:1-(p-.5)/.5;
 // 地面被吹起的尘带
 ctx.globalAlpha=fade*.8;for(let i=0;i<14;i++){let x=front*hash(i+f.seed),half=30+(W/2-30)*(x/L),y=(hash(i*3+f.seed)-.5)*2*half;puff(ctx,x,y,18+20*hash(i*7+f.seed)+20*p,DUST,.35)}
 // 锥形气压
 ctx.globalAlpha=fade;ctx.fillStyle=lg(ctx,0,0,front,0,[[0,A(WHITE,.0)],[.25,A(AMBER,.22)],[1,A(WHITE,.32)]]);let hw=30+(W/2-30)*e;ctx.beginPath();ctx.moveTo(20,-30);ctx.lineTo(front,-hw);ctx.quadraticCurveTo(front+50,0,front,hw);ctx.lineTo(20,30);ctx.closePath();ctx.fill();
 // 推进的压缩波（弧形）
 for(let j=0;j<5;j++){let d=front-j*55;if(d<40)continue;let hh=30+(W/2-30)*(d/L),ang=Math.atan2(hh,d)*.95;ctx.beginPath();ctx.arc(d-160,0,160,-ang*1.4,ang*1.4);ctx.strokeStyle=A(j?WHITE:WHITE,(.9-j*.16)*fade);ctx.lineWidth=(9-j*1.5);ctx.lineCap='round';ctx.stroke()}
 // 中央白热拳芯（真伤区）
 ctx.fillStyle=lg(ctx,0,-22,0,22,[[0,A(HOT,0)],[.3,A(AMBER,.85)],[.5,A(WHITE,1)],[.7,A(AMBER,.85)],[1,A(HOT,0)]]);let cw=44*(1-p*.5);ctx.fillRect(10,-cw/2,front,cw);
 // 拳头剪影 + 拳头处爆闪
 ctx.save();ctx.translate(Math.min(front,L*.35)+20,0);ctx.fillStyle=A(WHITE,fade);ctx.beginPath();ctx.ellipse(0,0,26,22,0,0,TAU);ctx.fill();ctx.fillStyle=A(AMBER,fade);for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(18,-15+i*10,6,0,TAU);ctx.fill()}ctx.restore();
 ctx.translate(front,0);ctx.globalAlpha=fade;impactLines(ctx,10,30,90+40*p,5,WHITE,f.seed,Math.PI*.9,0);
 ctx.restore()}
function facebreaker(ctx,f,k){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a+Math.PI/2);let close=.35,e=ease(Math.min(1,k/close));
 for(let s of[-1,1]){let x=s*225*(1-e);ctx.globalAlpha=k<close?1:Math.max(0,1-(k-close)/(1-close))*.8;for(let i=0;i<6;i++){let y=(i/5-.5)*175,r=26+10*hash(i+s*9+f.seed);puff(ctx,x+s*(10+r*.5),y,r,DUST,.6)}ctx.strokeStyle=A(WHITE,.85*ctx.globalAlpha);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,-87);ctx.quadraticCurveTo(x-s*20,0,x,87);ctx.stroke()}
 if(k>=close*.9){let p=(k-close*.9)/(1-close*.9);ctx.globalAlpha=1-p;if(p<.35){let q=p/.35;ctx.fillStyle=A(WHITE,1-q);ctx.beginPath();ctx.ellipse(0,0,40+60*q,90+40*q,0,0,TAU);ctx.fill()}impactLines(ctx,14,30+40*p,90+80*p,5,WHITE,f.seed);ctx.save();ctx.rotate(-Math.PI/2);flatRing(ctx,60+120*ease(p),6*(1-p)+1,DUST,.8);ctx.restore();for(let i=0;i<8;i++){let a=hash(i+f.seed)*TAU,r=(40+80*hash(i*5))*ease(p);puff(ctx,Math.cos(a)*r,Math.sin(a)*r,16+14*p,DUST,.4*(1-p))}}
 ctx.restore()}
function landing(ctx,f,k){let T=f.T;ctx.save();ctx.translate(f.x,f.y);let R=450;
 // 陨坑残留（最后 40% 渐隐）
 let crater=k<.6?1:1-(k-.6)/.4;ctx.globalAlpha=crater;ctx.save();ctx.scale(1,.55);ctx.fillStyle=rg(ctx,130,[[0,A(DARK,.75)],[.6,A(DIRT,.5)],[1,A(DIRT,0)]]);ctx.beginPath();ctx.arc(0,0,130,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(0,0,95,0,TAU);ctx.strokeStyle=A(DUST,.7);ctx.lineWidth=6;ctx.stroke();ctx.restore();
 ctx.strokeStyle=A(DARK,.85*crater);ctx.lineCap='round';for(let i=0;i<10;i++){let a=hash(i+f.seed)*TAU,len=120+120*hash(i*3+f.seed),x=0,y=0;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(Math.cos(a)*60,Math.sin(a)*60*.55);for(let j=1;j<=4;j++){let aa=a+(hash(i*13+j+f.seed)-.5)*.5,r=60+len*j/4;x=Math.cos(aa)*r;y=Math.sin(aa)*r*.55;ctx.lineTo(x,y);ctx.lineWidth=5-j}ctx.stroke()}
 let p=Math.min(1,k/.55),e=ease(p);ctx.globalAlpha=1-p;
 if(p<.18){let q=p/.18;ctx.fillStyle=rg(ctx,220,[[0,A(WHITE,1-q*.5)],[.35,A(AMBER,.7*(1-q))],[1,A(HOT,0)]]);ctx.beginPath();ctx.arc(0,0,120+120*q,0,TAU);ctx.fill()}
 flatRing(ctx,R*(.15+.85*e),12*(1-p)+2,WHITE,.9);flatRing(ctx,R*(.1+.7*e),8*(1-p)+1,DUST,.8);flatRing(ctx,R*(.05+.5*e),6*(1-p)+1,AMBER,.7);
 for(let i=0;i<18;i++){let a=i*TAU/18+hash(i+f.seed)*.3,r=R*(.25+.7*e);puff(ctx,Math.cos(a)*r,Math.sin(a)*r*.55,30+30*p,DUST,.5*(1-p))}
 rocks(ctx,18,R*.6,p,f.seed,170);impactLines(ctx,16,90+80*e,180+160*e,7,WHITE,f.seed);
 ctx.restore()}
// ---------------- 持续状态 ----------------
function stateFx(ctx,u,T){let z=S(u),r=u.radius||24;
 // 豪意热浪
 let cap=(u.maxHp||1)*.5,g=Math.min(1,(z.grit||u.grit||0)/Math.max(1,cap));if(g>.1){ctx.save();ctx.translate(u.x,u.y);ctx.save();ctx.scale(1,.5);ctx.fillStyle=rg(ctx,r*2.4,[[0,A(AMBER,.35*g)],[1,A(HOT,0)]]);ctx.beginPath();ctx.arc(0,0,r*2.4,0,TAU);ctx.fill();ctx.restore();for(let i=0;i<Math.round(6+12*g);i++){let ph=(T*(.7+hash(i)*.6)+hash(i+5))%1,x=(hash(i+9)-.5)*r*2.4+Math.sin(T*4+i)*5,y=-10-ph*95;ctx.globalAlpha=Math.sin(Math.PI*ph)*(.45+.55*g);ctx.strokeStyle=A(i%3?AMBER:HOT,1);ctx.lineWidth=5*(1-ph)+1.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+8*Math.sin(T*6+i),y-12,x,y-24);ctx.stroke()}ctx.restore()}
 // Q：烧红的拳头 + 脚下扬尘
 if((z.qEnd||0)>T||(z.qAttacks||0)>0){{let ca=Math.cos(u.angle||0),sa=Math.sin(u.angle||0);for(let s of[-1,1]){let p=.5+.5*Math.sin(T*12+s*2),fx_=u.x+ca*r*.8-sa*s*r*.9,fy=u.y+sa*r*.8+ca*s*r*.9-40;ctx.save();ctx.translate(fx_,fy);ctx.fillStyle=rg(ctx,34,[[0,A(WHITE,1)],[.3,A(AMBER,.95)],[.7,A(HOT,.45)],[1,A(HOT,0)]]);ctx.beginPath();ctx.arc(0,0,22+7*p,0,TAU);ctx.fill();for(let i=0;i<4;i++){let ph=(T*2.4+i/4+s*.13)%1;ctx.globalAlpha=1-ph;ctx.fillStyle=A(i%2?AMBER:HOT,1);ctx.beginPath();ctx.moveTo(-5+i*3-5,-ph*26);ctx.quadraticCurveTo(i*3-5,-ph*26-14,5+i*3-5,-ph*26);ctx.fill()}ctx.restore()}}
  if((z.qSpeedEnd||0)>T){let last=u._settDust||0;if(T-last>.09){u._settDust=T;push({k:'step',x:u.x-Math.cos(u.angle||0)*r,y:u.y-Math.sin(u.angle||0)*r+6,start:T,end:T+.45,seed:seed++})}}}
 // R：扛人期间落点阴影
 let sl=z.slam;if(sl&&sl.end>T){let left=Math.max(0,sl.end-T);ctx.save();ctx.translate(u.x,u.y+8);ctx.globalAlpha=.35+.4*(1-Math.min(1,left));ctx.scale(1,.55);ctx.fillStyle=rg(ctx,90,[[0,A(DARK,.7)],[1,A(DARK,0)]]);ctx.beginPath();ctx.arc(0,0,60+40*(1-Math.min(1,left)),0,TAU);ctx.fill();ctx.restore()}}
// ---------------- 事件 ----------------
function attach(c,units,now){if(!c||core===c)return;core=c;unitsFn=units;clock=now;
 c.on('AbilityCommitted',e=>{if(typeof e.abilityId!=='number')return;let s=find(e.sourceId);if(!s||s.hero!=='sett')return;let T=clock();
  if(e.abilityId===1)push({k:'w',x:s.x,y:s.y,a:s.angle||0,start:T,end:T+.75,seed:seed++});
  if(e.abilityId===2)push({k:'e',x:s.x,y:s.y,a:s.angle||0,start:T,end:T+.6,seed:seed++})});
 c.on('DamageApplied',e=>{if(e.itemEffect||e.runeProc||e.deferred||!(e.amount>0||e.absorbed>0))return;let s=find(e.sourceId),t=find(e.targetId);if(!s||!t||s.hero!=='sett')return;let T=clock(),z=S(s),a=Math.atan2(t.y-s.y,t.x-s.x);
  if(e.basic){let empowered=(z.qEnd||0)>T-.05||e.empowered;if(empowered)push({k:'punch',x:t.x,y:t.y,a,big:true,start:T,end:T+.4,seed:seed++});return}
  if(e.abilityId===3){let key='r'+s.id;if((attach.last[key]||-1)>T-.3)return;attach.last[key]=T;push({k:'r',x:s.x,y:s.y,start:T,end:T+1.6,seed:seed++});return}
  if(e.abilityId===1||e.abilityId===2){let key=s.id+':'+t.id+':'+e.abilityId;if((attach.last[key]||-1)>T-.2)return;attach.last[key]=T;push({k:'punch',x:t.x,y:t.y,a,big:e.abilityId===1,start:T,end:T+.35,seed:seed++})}})}
attach.last={};
function draw(ctx,player,units,T,seen){for(let u of units){if(u.hero!=='sett'||!(u.hp>0)||u.death>0||seen&&!seen(u))continue;stateFx(ctx,u,T)}
 for(let i=fx.length-1;i>=0;i--){let f=fx[i];if(T>=f.end||T<f.start-1){fx.splice(i,1);continue}let k=Math.max(0,Math.min(1,(T-f.start)/(f.end-f.start)));f.T=T;
  if(f.k==='punch')punchHit(ctx,f,k);else if(f.k==='w')haymaker(ctx,f,k);else if(f.k==='e')facebreaker(ctx,f,k);else if(f.k==='r')landing(ctx,f,k);
  else if(f.k==='step'){ctx.save();ctx.globalAlpha=1-k;puff(ctx,f.x+(hash(f.seed)-.5)*10,f.y-k*8,8+14*k,DUST,.5);ctx.restore()}}}
window.SettFxV21={attach,draw};
})();
