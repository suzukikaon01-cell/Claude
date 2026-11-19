/* V20 英雄施法/普攻动作层（仅视觉）：在原有动画之后叠加，按英雄与技能选择动作模板。
 * 施法分两段：前摇（随前摇进度蓄力）→ 出手（0.28 秒内快速完成，带缓动），让技能有明确的起手与释放感。
 * 普攻：近战身体前倾+小幅前冲，远程轻微后坐。已有独立动作骨骼的英雄（雪峰、迪奥、太刀侠、空之律者、砧岳、大剑侠、源氏、俄洛伊、查莉娅）不经过这里。 */
(()=>{'use strict';
const SPEC={
 garen:{0:'buff',1:'buff',3:'slam'},
 ashe:{0:'buff',1:'draw',2:'throw',3:'draw'},
 lux:{0:'raise',1:'throw',2:'throw',3:'raise'},
 zero:{0:'throw',1:'raise',2:'buff',3:'raise'},
 yasuo:{1:'throw',2:'slash',3:'slam'},
 masteryi:{0:'slash',1:'buff',2:'buff',3:'buff'},
 khazix:{0:'slash',1:'throw',2:'slam',3:'buff'},
 sett:{0:'buff',1:'punch',2:'pull',3:'slam'},
 darius:{1:'slam',2:'pull'},
 ana:{0:'raise',1:'draw',2:'throw',3:'draw'},
 dva:{0:'raise',1:'buff',2:'buff',3:'raise'},
 claude:{0:'raise',1:'buff',2:'throw',3:'buff'}};
const MELEE=new Set(['garen','yasuo','masteryi','khazix','sett','darius']);
const ease=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3),REL=.28;
function pose(b,kind,k,r,rel){let A=b.arms||[],L=A[0],R=A[1],W=b.weapon,body=b.body,e=ease(r);if(!R)return;
 switch(kind){
  case 'raise':if(!rel){R.rotation.x=-.6-1.6*k;R.rotation.z=-.15;body.rotation.x=-.12*k}else{R.rotation.x=-2.2+1.3*e;body.rotation.x=.18*(1-e)}if(W)W.rotation.x=rel?-.9+.6*e:-1.2*k;break;
  case 'draw':if(L)L.rotation.x=-1.5;R.rotation.x=-1.4;R.rotation.z=rel?-.6*(1-e)+.25*Math.sin(e*Math.PI):-.6*k;R.position.z=rel?0:6*k;break;
  case 'slash':if(W)W.rotation.set(-.35,rel?-1.5+3*e:-1.5*k,rel?-.4+.8*e:-.4*k);R.rotation.x=rel?-1.1+.6*e:-1.1*k;body.rotation.x=rel?.15*(1-e):-.08*k;break;
  case 'slam':if(W)W.rotation.x=rel?-2.3+3.2*e:-2.3*k;R.rotation.x=rel?-2.5+2.3*e:-2.5*k;if(L)L.rotation.x=rel?-2+1.8*e:-2*k;body.rotation.x=rel?.3*Math.sin(e*Math.PI):-.18*k;break;
  case 'pull':if(L){L.rotation.x=rel?-1.6+1.7*e:-1.6*k;L.position.z=rel?-14*(1-e):-14*k}R.rotation.x=rel?-1.6+1.7*e:-1.6*k;R.position.z=rel?-14*(1-e):-14*k;body.rotation.x=rel?-.22*Math.sin(e*Math.PI):.1*k;break;
  case 'buff':if(L){L.rotation.z=-(.3+1.1*(rel?1-.5*e:k));L.rotation.x=-.4*(rel?1-e:k)}R.rotation.z=.3+1.1*(rel?1-.5*e:k);R.rotation.x=-.4*(rel?1-e:k);body.position.y+=rel?3*Math.sin(e*Math.PI):1.5*k;break;
  case 'throw':R.rotation.x=rel?.9-2.5*e:.9*k;R.rotation.z=-.2;body.rotation.x=rel?.16*Math.sin(e*Math.PI):-.1*k;break;
  case 'punch':R.rotation.x=rel?-.3-1.4*e:.4*k;R.position.z=rel?-14*Math.sin(e*Math.PI):5*k;body.rotation.x=rel?.2*Math.sin(e*Math.PI):-.1*k;break}}
// 俄洛伊R：高高跃起砸向地面；源氏R：从背后拔刀、手中翻转后举起
function special(b,U,I){let H=U.hero;if(H==='illaoi'){let L=U.illaoiLeap;if(L&&I<L.end+.12&&b.body){let k=Math.max(0,Math.min(1,(I-L.start)/Math.max(.05,L.end-L.start)));if(I<=L.end){b.body.rotation.x=-.35*Math.sin(k*Math.PI);for(let a of b.arms||[])a.rotation.x=-2.6*Math.sin(Math.min(1,k*1.4)*Math.PI*.5)+(k>.7?(k-.7)/.3*2.4:0)}else{let r=(I-L.end)/.12;b.body.position.y-=6*(1-r);b.body.rotation.x=.25*(1-r)}}return}
 if(H==='genji'){let D=U.genjiDrawFx,W=b.weapon;if(D&&I<D.end&&W){let k=Math.max(0,Math.min(1,(I-D.start)/Math.max(.05,D.end-D.start))),e=ease(k);W.visible=true;if(b.backBlade)b.backBlade.visible=k<.35;W.position.set(-9+15*e,42+2*e+18*Math.sin(k*Math.PI),14-2*e);W.rotation.set(.35*e,-6.28*Math.max(0,(k-.35)/.65),-.5-.1*e+1.8*Math.sin(Math.min(1,k/.35)*Math.PI*.5)*(1-e));let R=b.arms?.[1];if(R)R.rotation.x=k<.35?-2.4*(k/.35):-2.4+1.4*((k-.35)/.65);if(b.body)b.body.rotation.x=-.1*Math.sin(k*Math.PI)}}}
function apply(b,U,I){let H=U.hero,spec=SPEC[H];if(H==='illaoi'||H==='genji'){if(b?.body)special(b,U,I);return}if(!spec||!b?.body)return;let st=b.pv20??={};if(!(H==='darius'&&U.dariusLeapVisual&&I<U.dariusLeapVisual.until)){b.body.rotation.x=0;b.body.position.z=0}
 // 普攻：身体前倾/前冲（近战）或后坐（远程）
 let tl=U.attackTimeline;if(tl&&!U.pendingCast&&tl.started!=null){let span=Math.max(.05,(tl.windup||.25)+(tl.recovery||.1)*.5),k=Math.max(0,Math.min(1,(I-tl.started)/span));let s=Math.sin(Math.min(1,k)*Math.PI);if(MELEE.has(H)){b.body.rotation.x+=.14*s;b.body.position.z=-6*s}else{b.body.rotation.x-=.06*s;b.body.position.z=2*s}}
 let pc=U.pendingCast,id=pc?.event?.castId??(pc?'p'+pc.i:null);
 if(pc&&spec[pc.i]!==undefined){if(st.id!==id){st.id=id;st.i=pc.i;st.wind=Math.max(.05,U.castWindup||.2);st.rel=null}st.rel=null;pose(b,spec[pc.i],1-Math.max(0,U.castWindup||0)/st.wind,0,false);return}
 let pcv=U.poseCastV20;if(!st.id&&pcv&&pcv.at!==st.seenAt&&I-pcv.at<REL&&spec[pcv.i]!==undefined){st.seenAt=pcv.at;st.id='instant';st.i=pcv.i;st.rel=pcv.at;st.relEnd=pcv.at+REL}
 if(st.id&&!st.rel){st.rel=I;st.relEnd=I+REL}
 if(st.rel&&I<st.relEnd){pose(b,spec[st.i],1,(I-st.rel)/REL,true);return}
 if(st.rel&&I>=st.relEnd){st.id=null;st.rel=null}}
window.HeroPoseV20=apply;window.HeroPoseV20.SPEC=SPEC;
})();
