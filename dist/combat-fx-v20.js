/* V20 战斗反馈特效（仅视觉，不影响判定）：
 * - 普攻命中：按英雄武器风格绘制（刀光/爪痕/拳风/斧弧/弹着点），颜色取英雄主色；
 * - 技能施放：施法者脚下短促的施法环 + 朝向闪光，提升释放手感；
 * - 防御塔：锁定英雄时从塔顶连到目标的锁定光束和目标脚下准星（目标是我方时红色，否则金色），塔弹命中爆闪。
 * 事件驱动，只保存短生命周期的特效条目。 */
(()=>{'use strict';
const STYLE={garen:'blade',yasuo:'blade',masteryi:'blade',genji:'blade',xuefeng:'blade',longsword_hunter:'blade',great_sword:'heavy',khazix:'claw',darius:'axe',illaoi:'heavy',sett:'fist',anvil:'fist',dio:'fist',dva:'shot',zarya:'shot',ashe:'arrow',ana:'shot',lux:'magic',zero:'magic',claude:'magic',herrscher_of_the_void:'magic'};
const fx=[];let core=null,unitsFn=null,clock=()=>0;
const push=f=>{fx.push(f);if(fx.length>160)fx.splice(0,fx.length-160)};
function attach(c,units,now){if(!c||core===c)return;core=c;unitsFn=units;clock=now;
 c.on('DamageApplied',e=>{if(!(e.amount>0||e.absorbed>0)||e.itemEffect||e.runeProc||e.deferred)return;let us=unitsFn(),s=us.find(u=>u.id===e.sourceId),t=us.find(u=>u.id===e.targetId);if(!s||!t)return;let T=clock();
  if(s.type==='tower'||s.type==='nexus'){push({kind:'towerHit',tid:t.id,x:t.x,y:t.y,start:T,end:T+.35,team:s.team});return}
  if(s.type!=='hero'||!e.basic)return;let st=STYLE[s.hero]||(s.range>200?'shot':'blade'),a=Math.atan2(t.y-s.y,t.x-s.x);
  push({kind:'hit',tid:t.id,style:st,x:t.x,y:t.y,angle:a,start:T,end:T+(st==='heavy'||st==='axe'?.32:.24),color:s.color||'#e8f4ff',crit:!!e.critical,flip:((s.fxFlip=!s.fxFlip))?1:-1})});
 c.on('AbilityCommitted',e=>{if(typeof e.abilityId!=='number'||e.abilityId<0)return;let s=unitsFn().find(u=>u.id===e.sourceId);if(!s||s.type!=='hero')return;let T=clock();s.poseCastV20={i:e.abilityId,at:T};push({kind:'cast',id:s.id,x:s.x,y:s.y,angle:s.angle||0,start:T,end:T+.3,color:s.color||'#e8f4ff',ult:e.abilityId===3})})}
function arc(ctx,r,a0,a1,w,c){ctx.beginPath();ctx.arc(0,0,r,a0,a1);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke()}
function drawHit(ctx,f,k){let fade=1-k,c=f.color,size=f.crit?1.35:1;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.globalAlpha=fade;ctx.lineCap='round';
 if(f.style==='blade'||f.style==='heavy'||f.style==='axe'){let r=(f.style==='blade'?34:46)*size,sweep=(f.style==='axe'?2.2:1.7)*(.4+.6*Math.min(1,k*3)),mid=f.flip*.15;arc(ctx,r,mid-sweep/2,mid+sweep/2,f.style==='blade'?7:11,c);arc(ctx,r,mid-sweep/2,mid+sweep/2,2.5,'#ffffff');if(f.crit){ctx.rotate(Math.PI/2);arc(ctx,r*.8,-.7,.7,5,c)}}
 else if(f.style==='claw'){for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-20*size,i*10-12*f.flip);ctx.lineTo(20*size*Math.min(1,k*4),i*10+12*f.flip);ctx.strokeStyle=c;ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#f3e8ff';ctx.lineWidth=1.8;ctx.stroke()}}
 else if(f.style==='fist'){let r=(10+k*30)*size;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.strokeStyle=c;ctx.lineWidth=6*(1-k)+1;ctx.stroke();for(let i=0;i<6;i++){let a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.6,Math.sin(a)*r*.6);ctx.lineTo(Math.cos(a)*r*1.25,Math.sin(a)*r*1.25);ctx.strokeStyle='#fff6e0';ctx.lineWidth=2.5;ctx.stroke()}}
 else{let r=(6+k*20)*size;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.strokeStyle=c;ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#ffffff';ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.arc(0,0,Math.max(1,5*(1-k)),0,Math.PI*2);ctx.fill();if(f.style==='magic'){ctx.rotate(k*2);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(r*.4,0);ctx.lineTo(r*1.1,0);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke()}}}
 ctx.restore()}
function drawCast(ctx,f,k,u){let x=u?.x??f.x,y=u?.y??f.y,r=(f.ult?70:46)*(.55+k*.6);ctx.save();ctx.translate(x,y);ctx.globalAlpha=(1-k)*.9;ctx.beginPath();ctx.ellipse(0,0,r,r*.55,0,0,Math.PI*2);ctx.strokeStyle=f.color;ctx.lineWidth=f.ult?6:4;ctx.stroke();ctx.rotate(u?.angle??f.angle);ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(18+30*(1-k),0);ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.lineCap='round';ctx.stroke();ctx.restore()}
function drawTowerLocks(ctx,player,units,T,seen){for(let tw of units){if(tw.type!=='tower'&&tw.type!=='nexus'||!(tw.hp>0))continue;let t=tw.aggro;if(!t||t.type!=='hero'||!(t.hp>0)||t.death>0||Math.hypot(t.x-tw.x,t.y-tw.y)>tw.range||seen&&!seen(t))continue;let mine=t.team===player?.team,c=mine?'255,70,70':'255,205,90',pulse=.5+.5*Math.sin(T*10),locked=tw.heroLock===t;
  ctx.save();ctx.setLineDash?.([14,10]);ctx.lineDashOffset=-T*60;ctx.beginPath();ctx.moveTo(tw.x,tw.y-60);ctx.lineTo(t.x,t.y);ctx.strokeStyle='rgba('+c+','+(.35+.35*pulse)+')';ctx.lineWidth=locked?5:3;ctx.stroke();ctx.setLineDash?.([]);
  ctx.translate(t.x,t.y);ctx.rotate(T*1.5);let r=(t.radius||22)+14+pulse*4;ctx.strokeStyle='rgba('+c+',.9)';ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(0,0,r,i*Math.PI/2+.25,i*Math.PI/2+Math.PI/2-.25);ctx.stroke()}if(locked){ctx.rotate(-T*3);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(r+4,0);ctx.lineTo(r+14,0);ctx.stroke()}}ctx.restore()}}
function draw(ctx,player,units,T,seen){drawTowerLocks(ctx,player,units,T,seen);for(let i=fx.length-1;i>=0;i--){let f=fx[i];if(T>=f.end||T<f.start-1){fx.splice(i,1);continue}if(seen){let u=units.find(v=>v.id===(f.tid??f.id));if(u&&!seen(u))continue}let k=Math.max(0,Math.min(1,(T-f.start)/(f.end-f.start)));
  if(f.kind==='hit')drawHit(ctx,f,k);else if(f.kind==='cast')drawCast(ctx,f,k,units.find(u=>u.id===f.id));else if(f.kind==='towerHit'){ctx.save();ctx.translate(f.x,f.y);ctx.globalAlpha=1-k;ctx.beginPath();ctx.arc(0,0,12+k*30,0,Math.PI*2);ctx.strokeStyle='#ffd27a';ctx.lineWidth=6;ctx.stroke();ctx.fillStyle='#fff3c8';ctx.beginPath();ctx.arc(0,0,10*(1-k),0,Math.PI*2);ctx.fill();ctx.restore()}}}
window.CombatFxV20={attach,draw,fx,STYLE};
})();
