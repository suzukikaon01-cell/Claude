/* V21 全英雄技能特效（原创绘制，仅视觉，不影响判定）。参照拉克丝特效的层次：
 * 每个英雄一套配色（核心色/光晕色/点缀色）和主题图形（星芒/冰晶/风刃/火花/裂痕/符文/电路/虚空/墨刃/血雾）。
 * - 施法：脚下双层旋转法阵（虚线符文环 + 主题图形），大招额外光柱和冲击波；
 * - 技能命中：白色闪爆 → 多重冲击环 → 放射光束 → 带重力的主题粒子；
 * - 飞行物：渐变光尾 + 外发光 + 旋转主题图形（拉克丝/查莉娅/麦克雷用各自专属特效）；
 * - 控制状态：眩晕星环、减速寒霜、禁锢光环、击飞上升气流、沉默符印。
 * 拉克丝、查莉娅已有专属技能特效，这里只给她们补状态显示。 */
(()=>{'use strict';
const TH={
 ashe:['230,250,255','127,212,244','200,240,255','frost'],garen:['255,246,214','223,191,108','255,226,140','gold'],zero:['220,255,246','103,245,210','160,255,230','rune'],
 yasuo:['236,250,255','129,200,237','200,235,255','wind'],masteryi:['240,255,226','155,217,129','255,240,150','blade'],khazix:['246,232,255','179,148,239','120,255,170','void'],
 sett:['255,236,226','219,150,127','255,200,110','fire'],genji:['236,255,236','158,234,156','120,255,200','blade'],darius:['255,220,224','183,92,104','255,90,90','blood'],
 illaoi:['220,255,248','85,183,167','200,255,140','spirit'],ana:['232,244,255','138,187,228','255,230,150','rune'],dva:['255,236,248','239,157,204','140,220,255','tech'],
 zarya:['255,232,250','237,132,213','160,200,255','tech'],dio:['255,248,214','237,202,85','255,120,200','gold'],longsword_hunter:['255,244,222','231,180,93','255,120,90','blade'],
 herrscher_of_the_void:['255,246,220','221,182,86','170,120,255','void'],xuefeng:['230,255,236','113,223,131','190,240,255','frost'],anvil:['255,238,220','199,135,63','255,170,80','fire'],
 great_sword:['255,246,222','216,178,90','255,220,160','blade'],claude:['255,240,226','232,162,106','255,210,170','rune'],cassidy:['255,236,214','201,100,60','255,210,120','fire'],
 tracer:['230,246,255','255,154,46','120,210,255','tech'],lux:['255,252,232','255,226,122','190,140,255','star']};
const OWN=new Set(['lux','zarya','sett']);
const hash=n=>{let x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
const th=h=>TH[h]||['255,255,255','200,220,255','255,240,200','star'];
const rgba=(c,a)=>'rgba('+c+','+Math.max(0,Math.min(1,a))+')';
const fx=[];const push=f=>{fx.push(f);if(fx.length>220)fx.splice(0,fx.length-220)};
// ---------- 主题图形 ----------
function motif(ctx,m,x,y,r,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();
 if(m==='star'||m==='gold'){for(let i=0;i<8;i++){let rr=i%2?r*.38:r,an=i*Math.PI/4;ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}ctx.closePath();ctx.fill()}
 else if(m==='frost'){for(let i=0;i<3;i++){ctx.rotate(Math.PI/3);ctx.moveTo(-r,0);ctx.lineTo(r,0)}ctx.lineWidth=Math.max(1.2,r*.28);ctx.strokeStyle=ctx.fillStyle;ctx.stroke()}
 else if(m==='wind'){ctx.arc(0,0,r,0,Math.PI*1.3);ctx.lineWidth=Math.max(1.2,r*.3);ctx.strokeStyle=ctx.fillStyle;ctx.stroke()}
 else if(m==='blade'||m==='blood'){ctx.moveTo(-r,r*.15);ctx.quadraticCurveTo(0,-r*.5,r,-r*.15);ctx.quadraticCurveTo(0,-r*.1,-r,r*.15);ctx.fill()}
 else if(m==='fire'){ctx.moveTo(0,-r);ctx.quadraticCurveTo(r*.7,0,0,r*.6);ctx.quadraticCurveTo(-r*.7,0,0,-r);ctx.fill()}
 else if(m==='void'){ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(r*.35,-r*.2,r*.55,0,Math.PI*2);ctx.fill()}
 else if(m==='tech'){ctx.rect(-r*.6,-r*.6,r*1.2,r*1.2);ctx.lineWidth=Math.max(1.2,r*.25);ctx.strokeStyle=ctx.fillStyle;ctx.stroke();ctx.fillRect(-r*.2,-r*.2,r*.4,r*.4)}
 else if(m==='spirit'){ctx.ellipse(0,0,r,r*.45,0,0,Math.PI*2);ctx.fill()}
 else {ctx.moveTo(0,-r);ctx.lineTo(r*.6,0);ctx.lineTo(0,r);ctx.lineTo(-r*.6,0);ctx.closePath();ctx.fill()}
 ctx.restore()}
function radial(ctx,r0,r1,stops){if(!ctx.createRadialGradient)return stops[1][1];let g=ctx.createRadialGradient(0,0,r0,0,0,r1);for(let s of stops)g.addColorStop(s[0],s[1]);return g}
// ---------- 施法法阵 ----------
function drawCast(ctx,f,k,u){let [c0,c1,c2,m]=th(f.hero),x=u?.x??f.x,y=u?.y??f.y,R=(f.ult?110:62)*(.6+.4*Math.min(1,k*3)),fade=k<.7?1:1-(k-.7)/.3,T=f.T;
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=fade;ctx.scale(1,.6);
 ctx.fillStyle=radial(ctx,R*.1,R,[[0,rgba(c0,.35)],[.6,rgba(c1,.14)],[1,rgba(c1,0)]]);ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.strokeStyle=rgba(c1,.95);ctx.lineWidth=f.ult?5:3.5;ctx.stroke();
 ctx.setLineDash?.([8,9]);ctx.lineDashOffset=-T*40;ctx.beginPath();ctx.arc(0,0,R*.72,0,Math.PI*2);ctx.strokeStyle=rgba(c0,.8);ctx.lineWidth=2;ctx.stroke();ctx.setLineDash?.([]);
 let n=f.ult?10:6;ctx.fillStyle=rgba(c2,.9);for(let i=0;i<n;i++){let a=i*Math.PI*2/n+T*(f.ult?1.4:2.2);motif(ctx,m,Math.cos(a)*R*.86,Math.sin(a)*R*.86,f.ult?9:6,a+T*3)}
 ctx.restore();
 if(f.ult){ctx.save();ctx.translate(x,y);ctx.globalAlpha=fade*(1-k)*.9;let h=220*(.4+.6*Math.min(1,k*4)),w=34*(1-k*.6);ctx.fillStyle=ctx.createLinearGradient?(()=>{let g=ctx.createLinearGradient(0,0,0,-h);g.addColorStop(0,rgba(c0,.85));g.addColorStop(.5,rgba(c1,.45));g.addColorStop(1,rgba(c1,0));return g})():rgba(c1,.5);ctx.fillRect(-w/2,-h,w,h);
  ctx.globalAlpha=(1-k)*.8;ctx.beginPath();ctx.ellipse(0,0,R*(1+k*1.6),R*.6*(1+k*1.6),0,0,Math.PI*2);ctx.strokeStyle=rgba(c2,.9);ctx.lineWidth=6*(1-k)+1;ctx.stroke();ctx.restore()}
 // 上升光点
 ctx.save();ctx.translate(x,y);for(let i=0;i<(f.ult?18:9);i++){let ph=(k*1.3+hash(i+f.seed))%1,a=hash(i*7+f.seed)*Math.PI*2,r=R*.8*hash(i*3+f.seed);ctx.globalAlpha=fade*(1-ph);ctx.fillStyle=rgba(i%3?c1:c0,1);ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r*.6-ph*70,2+2.5*(1-ph),0,Math.PI*2);ctx.fill()}ctx.restore()}
// ---------- 技能命中 ----------
function drawHit(ctx,f,k){let [c0,c1,c2,m]=th(f.hero),e=1-Math.pow(1-k,3),R=f.big?78:46;ctx.save();ctx.translate(f.x,f.y);ctx.globalAlpha=1-k;
 if(k<.25){ctx.fillStyle=radial(ctx,0,R*.7,[[0,rgba('255,255,255',.95)],[.5,rgba(c0,.6)],[1,rgba(c1,0)]]);ctx.beginPath();ctx.arc(0,0,R*(.4+.6*k/.25),0,Math.PI*2);ctx.fill()}
 for(let j=0;j<3;j++){let rr=R*(.3+.8*e)-j*10;if(rr<=0)continue;ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.strokeStyle=rgba(j?c1:c0,.9-j*.25);ctx.lineWidth=(f.big?6:4)-j*1.2;ctx.stroke()}
 let n=f.big?14:9;for(let i=0;i<n;i++){let a=i*Math.PI*2/n+f.seed;ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.2*e,Math.sin(a)*R*.2*e);ctx.lineTo(Math.cos(a)*R*(.5+.7*e),Math.sin(a)*R*(.5+.7*e));ctx.strokeStyle=rgba(i%2?c2:c0,.8);ctx.lineWidth=2.5;ctx.stroke()}
 ctx.fillStyle=rgba(c2,1);for(let i=0;i<(f.big?12:7);i++){let a=hash(i+f.seed*9)*Math.PI*2,sp=(40+70*hash(i*5+f.seed))*(f.big?1.4:1),px=Math.cos(a)*sp*e,py=Math.sin(a)*sp*e*.7+60*k*k-20*e;motif(ctx,m,px,py,(f.big?7:5)*(1-k*.5),a+k*6)}
 ctx.restore()}
// ---------- 控制状态 ----------
function status(ctx,u,T){let st=u.statuses;if(!st||!st.values)return;let has=new Set();for(let s of st.values())if(!(s.until!=null&&s.until<T))has.add(s.type);let r=(u.radius||22);
 if(u.stun>0||has.has('STUN')){ctx.save();ctx.translate(u.x,u.y-r-34);for(let i=0;i<4;i++){let a=T*4+i*Math.PI/2;ctx.fillStyle=rgba('255,236,140',.95);motif(ctx,'star',Math.cos(a)*18,Math.sin(a)*6,6,T*5)}ctx.restore()}
 if(has.has('SLOW')){ctx.save();ctx.translate(u.x,u.y);ctx.globalAlpha=.55+.2*Math.sin(T*6);ctx.beginPath();ctx.ellipse(0,4,r+10,(r+10)*.4,0,0,Math.PI*2);ctx.strokeStyle='rgba(150,215,255,.9)';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='rgba(200,240,255,.9)';for(let i=0;i<5;i++){let a=i*Math.PI*2/5+T;motif(ctx,'frost',Math.cos(a)*(r+10),4+Math.sin(a)*(r+10)*.4,4,a)}ctx.restore()}
 if(has.has('ROOT')||has.has('SNARE')){ctx.save();ctx.translate(u.x,u.y);for(let j=0;j<2;j++){ctx.beginPath();ctx.ellipse(0,-4-j*16,(r+12)*(1-j*.15),(r+12)*.36,0,0,Math.PI*2);ctx.strokeStyle=rgba('255,214,120',.85);ctx.lineWidth=3;ctx.stroke()}ctx.restore()}
 if(has.has('SILENCE')){ctx.save();ctx.translate(u.x,u.y-r-30);ctx.rotate(T*1.5);ctx.strokeStyle='rgba(210,160,255,.9)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.moveTo(-8,-8);ctx.lineTo(8,8);ctx.stroke();ctx.restore()}
 if(u.airborne>0||u.displacement&&!u.displacement.voluntary||has.has('AIRBORNE')||has.has('KNOCKUP')){ctx.save();ctx.translate(u.x,u.y);for(let i=0;i<6;i++){let ph=(T*2.5+hash(i))%1;ctx.globalAlpha=1-ph;ctx.strokeStyle='rgba(230,245,255,.85)';ctx.lineWidth=2;let x=(hash(i+4)-.5)*r*2;ctx.beginPath();ctx.moveTo(x,10-ph*50);ctx.lineTo(x,-8-ph*50);ctx.stroke()}ctx.restore()}}
// ---------- 飞行物光尾 ----------
function trail(ctx,p,spin,hero){if(OWN.has(hero))return;let [c0,c1,c2,m]=th(hero),big=p.index===3||p.ult,L=big?90:60,W=big?16:10;ctx.save();
 if(ctx.createLinearGradient){let g=ctx.createLinearGradient(-L,0,0,0);g.addColorStop(0,rgba(c1,0));g.addColorStop(.7,rgba(c1,.55));g.addColorStop(1,rgba(c0,.9));ctx.strokeStyle=g}else ctx.strokeStyle=rgba(c1,.5);
 ctx.lineCap='round';ctx.lineWidth=W;ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(-4,0);ctx.stroke();
 ctx.shadowColor=rgba(c1,1);ctx.shadowBlur=big?24:16;ctx.fillStyle=rgba(c0,.85);ctx.beginPath();ctx.arc(0,0,W*.65,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle=rgba(c2,.9);for(let i=0;i<3;i++){let a=spin*3+i*Math.PI*2/3;motif(ctx,m,Math.cos(a)*W*1.1,Math.sin(a)*W*1.1,big?6:4,a)}
 for(let i=0;i<4;i++){let ph=(spin*.7+i/4)%1;ctx.globalAlpha=1-ph;ctx.fillStyle=rgba(c1,1);ctx.beginPath();ctx.arc(-L*ph,(hash(i)-.5)*W*1.4,2.5*(1-ph)+1,0,Math.PI*2);ctx.fill()}
 ctx.restore()}
// ---------- 事件 ----------
let core=null,unitsFn=null,clock=()=>0,seed=1;
function attach(c,units,now){if(!c||core===c)return;core=c;unitsFn=units;clock=now;
 c.on('AbilityCommitted',e=>{if(typeof e.abilityId!=='number'||e.abilityId<0)return;let s=unitsFn().find(u=>u.id===e.sourceId);if(!s||s.type!=='hero'||OWN.has(s.hero))return;let T=clock();push({kind:'cast',hero:s.hero,id:s.id,x:s.x,y:s.y,start:T,end:T+(e.abilityId===3?.75:.5),ult:e.abilityId===3,seed:seed++})});
 c.on('DamageApplied',e=>{if(e.basic||e.itemEffect||e.runeProc||e.deferred||typeof e.abilityId!=='number'||!(e.amount>0||e.absorbed>0))return;let us=unitsFn(),s=us.find(u=>u.id===e.sourceId),t=us.find(u=>u.id===e.targetId);if(!s||!t||s.type!=='hero'||OWN.has(s.hero))return;let T=clock();
  // 同一目标同一技能 0.12 秒内只播一次，避免持续伤害刷屏
  let key=s.id+':'+t.id+':'+e.abilityId;if((attach.last[key]||-1)>T-.12)return;attach.last[key]=T;push({kind:'hit',hero:s.hero,tid:t.id,x:t.x,y:t.y,start:T,end:T+(e.abilityId===3?.6:.45),big:e.abilityId===3,seed:seed++})})}
attach.last={};
function draw(ctx,player,units,T,seen){for(let u of units){if(!(u.hp>0)||u.death>0||u.type!=='hero')continue;if(seen&&!seen(u))continue;status(ctx,u,T)}
 for(let i=fx.length-1;i>=0;i--){let f=fx[i];if(T>=f.end||T<f.start-1){fx.splice(i,1);continue}let u=units.find(v=>v.id===(f.tid??f.id));if(seen&&u&&!seen(u))continue;let k=Math.max(0,Math.min(1,(T-f.start)/(f.end-f.start)));f.T=T;
  if(f.kind==='cast')drawCast(ctx,f,k,u);else drawHit(ctx,f,k)}}
window.SkillFxV21={attach,draw,trail,fx,TH};
})();
