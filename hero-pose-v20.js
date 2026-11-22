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
// 砧岳（铁拳）动作重做：拳击架势待机、左右交替刺拳普攻、Q 蓄力后仰/火箭冲拳前伸、W 双臂交叉格挡、E 跃起举拳→落地砸地、R 升空后隐藏模型（不在天上露出模型），坠落接近地面时才出现并呈下砸姿势。
function anvilPose(b,U,I){let S=U.anvilState||{},A=b.arms||[],L=A[0],R=A[1],body=b.body,root=b.root,lift=U.anvilLift,ease=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3);if(!body||!R)return;
 // R：升空/坠落阶段高度超过阈值时隐藏整个模型，只保留地面落点预警
 if(lift&&root){let h=0;if(lift.mode==='rise')h=lift.height*Math.min(1,Math.max(0,(I-lift.start)/lift.rise));else if(lift.mode==='fall'){let k=Math.max(0,Math.min(1,(I-lift.start)/Math.max(.01,lift.end-lift.start)));h=lift.height*(1-k*k)}if(lift.mode&&h>180){root.visible=false;return}
  if(lift.mode==='fall'){body.rotation.x=.35;R.rotation.x=-2.8;if(L)L.rotation.x=-2.8;return}}
 let fy=body.rotation.y;body.rotation.x=0;body.rotation.z=0;body.position.z=0;
 // 待机：拳击架势，双拳护在胸前，轻微起伏
 let bob=Math.sin(I*4)*.04;R.rotation.set(-.9+bob,0,-.25);if(L)L.rotation.set(-1.1-bob,0,.3);body.rotation.y=fy+(.12);
 if(S.block&&S.block.until>I){R.rotation.set(-1.5,0,.75);if(L)L.rotation.set(-1.5,0,-.75);body.rotation.x=.12;body.rotation.y=fy+(0);return}
 if(S.dash&&S.dash.until>I){R.rotation.set(-1.65,0,0);if(L)L.rotation.set(.6,0,.3);body.rotation.x=.42;body.position.z=-6;body.rotation.y=fy+(-.25);return}
 if(S.charging){let k=Math.min(1,(I-S.charging.start)/(GAME_CONFIG.heroParams.anvil?.Q.charge_max||1));R.rotation.set(1.1*k,0,-.35*k);if(L)L.rotation.set(-1.4,0,.4);body.rotation.x=-.2*k;body.rotation.y=fy+(.45*k);return}
 if(lift&&!lift.mode){let k=Math.max(0,Math.min(1,(I-lift.start)/Math.max(.05,lift.end-lift.start)));if(k<.65){let e=ease(k/.65);R.rotation.set(-2.9*e,0,-.2);if(L)L.rotation.set(-2.6*e,0,.2);body.rotation.x=-.25*e}else{let e=ease((k-.65)/.35);R.rotation.set(-2.9+3.1*e,0,-.2);if(L)L.rotation.set(-2.6+2.8*e,0,.2);body.rotation.x=-.25+.6*e}return}
 // 普攻：左右交替刺拳，重拳侧（右）出拳更重
 let tl=U.attackTimeline;if(tl&&tl.started!=null){let span=Math.max(.05,(tl.windup||.24)+(tl.recovery||.25)*.6),k=(I-tl.started)/span;if(k>=0&&k<1){if(U.anvilJabKey!==tl.started){U.anvilJabKey=tl.started;U.anvilJab=!U.anvilJab}let right=!!U.anvilJab,w=k<.45?ease(k/.45):1-ease((k-.45)/.55);if(right){R.rotation.x=-.9-.85*w;body.rotation.y=fy+(.12-.4*w);body.rotation.x=.12*w}else if(L){L.rotation.x=-1.1-.7*w;body.rotation.y=.12+.3*w}body.position.z=-4*w}}}
// 麦克雷：用模型自带的网格构造器拼出牛仔帽和左轮（不依赖外部资源），并制作普攻/连发/翻滚/投掷/神枪手动作。
function cassidyBuild(b){if(b.cassidyBuilt||!b.body)return;let proto=null,cyl=null;b.body.traverse?.(o=>{if(o.isMesh&&o.geometry?.type==='BoxGeometry'&&!proto)proto=o;if(o.isMesh&&o.geometry?.type==='CylinderGeometry'&&!cyl)cyl=o});if(!proto)return;b.cassidyBuilt=true;
 const Mesh=proto.constructor,Box=proto.geometry.constructor,Cyl=cyl?.geometry.constructor,mat=c=>{let m=proto.material.clone();m.color?.set(c);if(m.emissive)m.emissive.set('#000000');return m},box=(w,h,d,c,x,y,z,parent)=>{let o=new Mesh(new Box(w,h,d),mat(c));o.position.set(x,y,z);parent.add(o);return o};
 let hat=new (b.body.constructor)();hat.position.set(0,72,0);b.body.add(hat);if(Cyl){let brim=new Mesh(new Cyl(22,22,2.5,24),mat('#5a3520'));hat.add(brim);let crown=new Mesh(new Cyl(11,12.5,12,20),mat('#6b4026'));crown.position.y=7;hat.add(crown)}else{box(42,3,42,'#5a3520',0,0,0,hat);box(22,12,22,'#6b4026',0,7,0,hat)}box(23,2.5,23,'#2a1a12',0,3,0,hat);
 let R=b.arms?.[1];if(R){let gun=new (b.body.constructor)();gun.position.set(0,-24,-4);R.add(gun);box(4,4,24,'#3a3f46',0,0,-12,gun);box(9,9,8,'#6d737c',0,0,-2,gun);box(5,11,5,'#5a3520',0,-7,3,gun);b.cassidyGun=gun}
 if(b.weapon)b.weapon.visible=false;
 let cape=b.body.children.find(o=>o.isMesh&&o.geometry?.parameters?.depth===3);if(cape)cape.material=mat('#7a3b22')}
// 神枪手：全身红色荧光（每个网格独立材质，避免影响其他单位）
function cassidyGlow(b,k){if(!b.root)return;if(!b.cassidyMats){b.cassidyMats=[];b.root.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive){o.material=o.material.clone();b.cassidyMats.push({m:o.material,e:o.material.emissive.clone(),i:o.material.emissiveIntensity??1})}})}if(k===b.cassidyGlowK)return;b.cassidyGlowK=k;for(let x of b.cassidyMats){if(k>0){x.m.emissive.setRGB(1,.12,.05);x.m.emissiveIntensity=x.i+1.6*k}else{x.m.emissive.copy(x.e);x.m.emissiveIntensity=x.i}}}
function cassidyPose(b,U,I){cassidyBuild(b);if(b.weapon)b.weapon.visible=false;let S=U.cassidyState||{},A=b.arms||[],L=A[0],R=A[1],body=b.body,ease=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3);if(!R||!body)return;
 let fy=body.rotation.y;body.rotation.x=0;body.rotation.z=0;body.position.set(0,body.position.y,0);R.rotation.set(-.35,0,0);if(L)L.rotation.set(-.1,0,.12);if(b.cassidyGun)b.cassidyGun.rotation.set(0,0,0);
 if(S.roll&&S.roll.until>I){let k=1-(S.roll.until-I)/.4;body.rotation.x=-Math.PI*2*ease(k);body.position.y=-10*Math.sin(k*Math.PI);R.rotation.x=-.2;if(b.cassidyGun)b.cassidyGun.rotation.z=k*Math.PI*4;return}
 cassidyGlow(b,S.dead?Math.min(1,(I-S.dead.start)/.25)*(.75+.25*Math.sin(I*10)):0);if(S.dead){let k=ease((I-S.dead.start)/.35);R.rotation.set(-1.75*k,0,.08*k);if(L)L.rotation.set(-1.55*k,0,-.55*k);if(b.cassidyGun)b.cassidyGun.rotation.x=.15*k;body.rotation.x=-.06*k;return}
 if(S.fan){let ph=(I*11)%1;R.rotation.x=-1.45+.08*Math.sin(ph*Math.PI*2);if(L)L.rotation.set(-1.2-.35*Math.sin(ph*Math.PI*2),0,-.6);body.rotation.y=fy+(-.15);return}
 let fl=(S.flash||[])[0];if(fl&&I-fl.start<.35){let k=(I-fl.start)/.35;if(L)L.rotation.x=k<.5?-2.2*(k/.5):-2.2+2.6*((k-.5)/.5);return}
 let tl=U.attackTimeline;if(tl&&tl.started!=null){let w=Math.max(.05,tl.windup||.2),k=(I-tl.started)/w;if(k>=0&&k<2.2){R.rotation.x=-1.45;if(k>1){let r=Math.min(1,(k-1)/.5);R.rotation.x=-1.45-.35*Math.sin(r*Math.PI);body.rotation.x=-.05*Math.sin(r*Math.PI)}}}
 if((S.reloadUntil||0)>I){let k=(I*5)%1;R.rotation.set(-.9,0,.6);if(L)L.rotation.set(-1,0,-.5+.2*Math.sin(k*Math.PI*2));if(b.cassidyGun)b.cassidyGun.rotation.z=Math.PI/2}}
// 闪光：双枪 + 橙色护目镜；交替双枪射击、速射时双手平举、闪现时前冲、闪回时双臂张开。
function tracerBuild(b){if(b.tracerBuilt||!b.body)return;let proto=null;b.body.traverse?.(o=>{if(o.isMesh&&o.geometry?.type==='BoxGeometry'&&!proto)proto=o});if(!proto)return;b.tracerBuilt=true;const Mesh=proto.constructor,Box=proto.geometry.constructor,mat=c=>{let m=proto.material.clone();m.color?.set(c);if(m.emissive)m.emissive.set(c==='#5ec8ff'?'#1a6a9a':'#000000');return m},box=(w,h,d,c,x,y,z,parent)=>{let o=new Mesh(new Box(w,h,d),mat(c));o.position.set(x,y,z);parent.add(o);return o};
 box(26,5,6,'#ff9a2e',0,64,-9,b.body);box(8,4,2,'#2a1a12',-5,64,-12.5,b.body);box(8,4,2,'#2a1a12',5,64,-12.5,b.body);box(10,10,4,'#5ec8ff',0,36,-9,b.body);
 b.tracerGuns=[];for(let A of b.arms||[]){let g=new (b.body.constructor)();g.position.set(0,-24,-4);A.add(g);box(4,5,14,'#3a3f46',0,0,-6,g);box(4,8,4,'#2a2c31',0,-5,1,g);box(2,2,3,'#5ec8ff',0,1.5,-13,g);b.tracerGuns.push(g)}if(b.weapon)b.weapon.visible=false}
function tracerPose(b,U,I){tracerBuild(b);if(b.weapon)b.weapon.visible=false;let S=U.tracerState||{},A=b.arms||[],L=A[0],R=A[1],body=b.body;if(!body||!R)return;let fy=body.rotation.y;body.rotation.x=0;body.rotation.z=0;
 R.rotation.set(-.5,0,0);if(L)L.rotation.set(-.5,0,0);
 let blink=S.fx?.find(f=>f.kind==='blink'&&I-f.start<.18);if(blink){body.rotation.x=.45;R.rotation.x=.6;if(L)L.rotation.x=.6;return}
 if(S.rewind){if(b.root)b.root.visible=false;return}if(b.tracerFaded){b.root?.traverse?.(o=>{if(o.isMesh&&o.material){o.material.opacity=1}});b.tracerFaded=false}let rec=S.fx?.find(f=>f.kind==='recallTo'&&I-f.start<.4);if(rec){R.rotation.set(-1.2,0,-.9);if(L)L.rotation.set(-1.2,0,.9);body.rotation.y=fy+I*20;return}
 let tl=U.attackTimeline,q=(S.qUntil||0)>I;if(q||tl&&tl.started!=null&&I-tl.started<.35){let side=S.side?1:-1,k=tl?.started!=null?Math.min(1,(I-tl.started)/.12):1;R.rotation.x=-1.5+(side>0?.15*(1-k):0);if(L)L.rotation.x=-1.5+(side<0?.15*(1-k):0);body.rotation.x=-.05}}
// 盖伦Q强化普攻：跳起往下劈（前摇期间起跳举剑，命中时劈下）
function garenQ(b,U,I){let tl=U.attackTimeline,sn=U.pendingAttack?.snapshot;if(!tl||!(sn?.silence||sn?.empowered)||tl.started==null)return false;let w=Math.max(.05,tl.windup||.2),k=Math.max(0,Math.min(1,(I-tl.started)/w)),R=b.arms?.[1],W=b.weapon;if(R)R.rotation.x=k<.6?-2.6*(k/.6):-2.6+2.9*((k-.6)/.4);if(W)W.rotation.x=k<.6?-2.2*(k/.6):-2.2+3.2*((k-.6)/.4);if(b.arms?.[0])b.arms[0].rotation.x=-1.6*Math.sin(k*Math.PI);b.body.rotation.x=k<.6?-.2*(k/.6):-.2+.5*((k-.6)/.4);return true}
function apply(b,U,I){let H=U.hero,spec=SPEC[H];if(H==='sett'&&b?.body&&!b.settBuilt){try{settBuild(b)}catch(e){b.settBuilt=true}}if(H==='sett'){try{window.SettGlbV21?.update(b,U,I)}catch(e){}}if(H==='sett'&&b?.settGlow){let g=Math.min(1,(U.championState?.grit||0)/Math.max(1,(U.maxHp||1)*.5)),w=U._settWAt!=null&&I-U._settWAt<1.1?1:0,v=Math.max(w,g>.4?(g-.4)/.6:0);for(let m of b.settGlow)m.emissiveIntensity=.15+1.1*v}if(H==='sett'&&b?.body&&U._settWAt!=null&&I-U._settWAt<1.05&&I>=U._settWAt){settW(b,(I-U._settWAt)/1.05);return}if(H==='garen'&&b?.body){b.body.rotation.x=0;b.body.position.z=0;if(garenQ(b,U,I))return}if(H==='anvil'){anvilPose(b,U,I);return}if(H==='cassidy'){cassidyPose(b,U,I);return}if(H==='tracer'){tracerPose(b,U,I);return}if(H==='illaoi'||H==='genji'){if(b?.body)special(b,U,I);return}if(!spec||!b?.body)return;let st=b.pv20??={};if(!(H==='darius'&&U.dariusLeapVisual&&I<U.dariusLeapVisual.until)){b.body.rotation.x=0;b.body.position.z=0}
 // 普攻：身体前倾/前冲（近战）或后坐（远程）
 let tl=U.attackTimeline;if(tl&&!U.pendingCast&&tl.started!=null){let span=Math.max(.05,(tl.windup||.25)+(tl.recovery||.1)*.5),k=Math.max(0,Math.min(1,(I-tl.started)/span));let s=Math.sin(Math.min(1,k)*Math.PI);if(MELEE.has(H)){b.body.rotation.x+=.14*s;b.body.position.z=-6*s}else{b.body.rotation.x-=.06*s;b.body.position.z=2*s}}
 let pc=U.pendingCast,id=pc?.event?.castId??(pc?'p'+pc.i:null);
 if(pc&&spec[pc.i]!==undefined){if(st.id!==id){st.id=id;st.i=pc.i;st.wind=Math.max(.05,U.castWindup||.2);st.rel=null}st.rel=null;pose(b,spec[pc.i],1-Math.max(0,U.castWindup||0)/st.wind,0,false);return}
 let pcv=U.poseCastV20;if(!st.id&&pcv&&pcv.at!==st.seenAt&&I-pcv.at<REL&&spec[pcv.i]!==undefined){st.seenAt=pcv.at;st.id='instant';st.i=pcv.i;st.rel=pcv.at;st.relEnd=pcv.at+REL}
 if(st.id&&!st.rel){st.rel=I;st.relEnd=I+REL}
 if(st.rel&&I<st.relEnd){pose(b,spec[st.i],1,(I-st.rel)/REL,true);return}
 if(st.rel&&I>=st.relEnd){st.id=null;st.rel=null}}
// 瑟提W 轰拳：收拳蓄力后仰 → 跨步前冲、右拳完全伸直重击 → 收势
function settW(b,k){let A=b.arms||[],L=A[0],R=A[1],body=b.body;if(!R)return;let ch=.62;if(k<ch){let p=Math.sin(k/ch*Math.PI/2);R.rotation.x=1.0*p;R.position.z=8*p;if(L)L.rotation.x=-.8*p;body.rotation.x=-.22*p;body.position.z=6*p;body.rotation.y+=.0}else{let p=(k-ch)/(1-ch),hit=Math.min(1,p/.18),back=p<.6?0:(p-.6)/.4,e=1-Math.pow(1-hit,3);R.rotation.x=1.0-2.9*e+1.2*back;R.position.z=8-30*e+22*back;if(L)L.rotation.x=-.8+1.4*e-.6*back;body.rotation.x=-.22+.5*e-.28*back;body.position.z=6-22*e+16*back}}

// 瑟提W：3D 金色龙头（挂在英雄模型上，英雄被击退/闪现时一起移动）。出拳后沿面朝方向冲出到 W 范围末端再消散。
function settDragonBuild(b){if(b.settDragon||!b.body)return b.settDragon;let proto=null,cyl=null,sc0=b.root||b.body;while(sc0.parent)sc0=sc0.parent;b.body.traverse?.(o=>{if(o.isMesh&&o.geometry?.type==='BoxGeometry'&&!proto)proto=o});sc0.traverse?.(o=>{if(o.isMesh&&o.geometry?.type==='CylinderGeometry'&&!cyl)cyl=o});if(!proto)return null;
 const Mesh=proto.constructor,Box=proto.geometry.constructor,Cyl=cyl?.geometry.constructor,G=b.body.constructor,mats=[];
 const mat=(c,e,o=.95)=>{let m=proto.material.clone();m.map=null;m.color?.set(c);if(m.emissive){m.emissive.set(e);m.emissiveIntensity=1}m.transparent=true;m.opacity=o;m.depthWrite=false;mats.push([m,o]);return m};
 const gold=mat('#ffd04a','#ff9418'),gold2=mat('#ffe07a','#ffb030'),dark=mat('#b8661a','#6a2c06'),white=mat('#fffbe8','#ffeaa0'),red=mat('#ff3a1a','#ff2000'),mane=mat('#ffb02e','#ff6a00',.85),glow=mat('#fff2b0','#ffd060',.45),fire=mat('#ff8a20','#ff4a00',.7);
 const box=(w,h,d,m,x,y,z,par,rx=0,ry=0,rz=0)=>{let o=new Mesh(new Box(w,h,d),m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);par.add(o);return o};
 const cone=(r,h,m,x,y,z,par,rx=0,ry=0,rz=0,seg=6)=>{let o=Cyl?new Mesh(new Cyl(0,r,h,seg),m):new Mesh(new Box(r*1.4,h,r*1.4),m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);par.add(o);return o};
 const cyl2=(r1,r2,h,m,x,y,z,par,rx=0,ry=0,rz=0,seg=10)=>{let o=Cyl?new Mesh(new Cyl(r1,r2,h,seg),m):new Mesh(new Box(r2*1.8,h,r2*1.8),m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);par.add(o);return o};
 let root=new G();root.visible=false;sc0.add(root);let head=new G();root.add(head);
 // 头骨与长吻（锥台拼接，朝 -z）
 cyl2(15,19,30,gold,0,0,4,head,Math.PI/2);cyl2(11,15,22,gold,0,1,-20,head,Math.PI/2);cyl2(8,11,18,gold2,0,2,-39,head,Math.PI/2);
 box(20,6,16,gold2,0,11,-36,head,-.15);box(24,5,8,dark,0,10,-48,head);// 鼻梁、鼻头
 for(let sd of[-1,1]){box(4,3,4,red,sd*6,10,-52,head);// 鼻孔
  box(10,5,22,dark,sd*11,12,-6,head,-.25,sd*.15,0);// 眉骨
  let eye=box(7,5,5,red,sd*12,8,-14,head);box(3,3,2,white,sd*12.5,9,-16.6,head);// 眼
  // 后弯分节龙角
  let h=new G();h.position.set(sd*9,16,0);head.add(h);let px=0,py=0,pz=0;for(let k=0;k<5;k++){let a=-.5-k*.28;cyl2(4.2-k*.6,5-k*.6,12,k%2?gold2:dark,sd*k*1.8,py+Math.cos(a+1.57)*6,pz+k*10,h,a+1.57,0,sd*.18);py+=Math.sin(-a)*5;pz=k*10}
  cone(3,12,white,sd*9,py+20,pz+16,h,1.1,0,sd*.2);
  // 腮鳍
  for(let k=0;k<3;k++)cone(5-k,22-k*4,mane,sd*(17+k*2),-2+k*6,6+k*6,head,1.3,0,sd*(1.1+k*.2));
  // 分节龙须
  let w=new G();w.position.set(sd*9,-1,-46);head.add(w);for(let k=0;k<6;k++){let o=box(2,2,10,gold2,sd*k*3.5,-k*1.5,-k*8,w,-.12,sd*(.35+k*.08),0);o.userData.wh=k;}
  w.userData.sd=sd;(head.userData.wh??=[]).push(w)}
 // 头顶鳞片
 for(let k=0;k<5;k++)cone(5,10,gold2,0,19-k,-24+k*10,head,-.25,0,0,4);
 // 下颚（可张合）+ 牙
 let jaw=new G();jaw.position.set(0,-9,-6);head.add(jaw);cyl2(8,12,38,gold,0,-2,-18,jaw,Math.PI/2);box(14,3,30,dark,0,2,-22,jaw);
 for(let k=0;k<5;k++)for(let sd of[-1,1]){cone(1.8,7,white,sd*(6-k*.6),-7,-34+k*6,head,Math.PI,0,0,4);cone(1.6,6,white,sd*(5.5-k*.6),4,-32+k*6,jaw,0,0,0,4)}
 cone(2.5,10,white,0,-7,-46,head,Math.PI,0,0,4);
 // 口中火光
 let mouth=box(14,6,24,fire,0,-5,-30,head);
 // 鬃毛（层叠火焰锥）
 let maneG=new G();maneG.position.set(0,4,18);head.add(maneG);for(let ring=0;ring<2;ring++)for(let i=0;i<11;i++){let a=-1.5+i*.3,r=ring?22:16;cone(6-ring,30+ring*14-Math.abs(a)*4,ring?fire:mane,Math.sin(a)*r,Math.cos(a)*r*.9,8+ring*8,maneG,1.2+.3*Math.cos(a),0,-a*.9)}
 // 颈部：3 节蛇形躯干 + 背鳍，带鳞纹
 let neck=[];let prev=head;for(let k=0;k<4;k++){let n=new G();n.position.set(0,-2,30+k*0);(k?neck[k-1]:root).add(n);if(!k)n.position.set(0,-4,34);else n.position.set(0,0,22);cyl2(14-k*2.5,15-k*2.5,24,k%2?gold:gold2,0,0,0,n,Math.PI/2);cone(4,12-k*2,mane,0,13-k*2,0,n,-.4,0,0,4);for(let sd of[-1,1])box(2,8-k,14,dark,sd*(12-k*2.3),0,0,n);neck.push(n)}
 // 光晕外壳
 let halo=cyl2(26,30,70,glow,0,0,-6,head,Math.PI/2,0,0,12);
 b.settDragon={root,head,jaw,maneG,neck,mouth,halo,mats};return b.settDragon}
function settDragon(b,U,I){let at=U._settWAt,D=b.settDragon;if(at==null||I<at||I-at>1.3){if(D)D.root.visible=false;return}D=settDragonBuild(b);if(!D)return;let t=I-at,ch=.65;
 if(t<ch){D.root.visible=false;return}let p=(t-ch)/.62;if(p>=1){D.root.visible=false;return}D.root.visible=true;let e=1-Math.pow(1-Math.min(1,p/.45),3);
 let range=U.skills?.[1]?.range||400,ang=U._settWAngle??U.angle??0,d=30+(range-60)*e;D.root.position.set(U.x+Math.cos(ang)*d,70+12*Math.sin(p*Math.PI),U.y+Math.sin(ang)*d);D.root.rotation.set(0,-ang-Math.PI/2,0);let sc=1+.6*e;D.root.scale.set(sc,sc,sc);
 D.jaw.rotation.x=.2+.45*Math.abs(Math.sin(t*12));D.maneG.rotation.z=Math.sin(t*20)*.12;D.maneG.scale.setScalar(1+.08*Math.sin(t*30));D.head.rotation.z=Math.sin(t*9)*.06;D.head.rotation.x=-.12*Math.sin(t*7);D.neck.forEach((n,k)=>{n.rotation.y=Math.sin(t*10-k*.9)*.35;n.rotation.x=Math.cos(t*8-k)*.12});(D.head.userData.wh||[]).forEach(w=>{w.rotation.y=w.userData.sd*(.2+.25*Math.sin(t*11));w.rotation.x=.15*Math.sin(t*9+w.userData.sd)});D.halo.scale.setScalar(1+.06*Math.sin(t*25));
 let fade=p<.55?1:1-(p-.55)/.45;for(let [m,o] of D.mats)m.opacity=o*fade}

// 腕豪模型重做（参考玩家设计图）：红色后梳刺发、白色毛领披肩、裸露胸膛、金色拳套（带指节钉）、红色腰带、深色长裤；豪意越多拳套越亮
function settBuild(b){if(b.settBuilt||!b.body)return;let proto=null;b.body.traverse?.(o=>{if(o.isMesh&&o.geometry?.type==='BoxGeometry'&&!proto)proto=o});if(!proto)return;b.settBuilt=true;
 const Mesh=proto.constructor,Box=proto.geometry.constructor,G=b.body.constructor,glow=[];
 const mat=(c,e)=>{let m=proto.material.clone();m.map=null;m.color?.set(c);if(m.emissive){m.emissive.set(e||'#000000');m.emissiveIntensity=e?.15:1}if(e)glow.push(m);return m};
 const box=(w,h,d,c,x,y,z,par,rx=0,ry=0,rz=0,e)=>{let o=new Mesh(new Box(w,h,d),mat(c,e));o.position.set(x,y,z);o.rotation.set(rx,ry,rz);par.add(o);return o};
 // 身体底色：上身肤色、裤子深色
 b.body.children.forEach(o=>{if(!o.isMesh)return;let y=o.position.y;if(y>28&&y<56)o.material=mat('#c98d66');else if(y<=28)o.material=mat('#3a2a2e')});
 // 胸肌与腹肌线
 box(22,10,2,'#d79a72',0,46,-11.5,b.body);for(let k=0;k<3;k++)box(12,2,1.5,'#b0714f',0,34+k*4,-12,b.body);
 // 红色腰带 + 金扣
 box(30,6,26,'#9b2433',0,27,0,b.body);box(8,6,2,'#f0c04a',0,27,-13.5,b.body,0,0,0,'#a06010');
 // 白色毛领披肩（一圈参差毛束）
 for(let i=0;i<16;i++){let a=i/16*Math.PI*2,r=15+(i%2)*2.5;box(7,9+(i%3)*2,7,i%2?'#f4efe6':'#ffffff',Math.sin(a)*r,56+(i%2)*2,Math.cos(a)*r,b.body,0,a,(i%2?.3:-.3))}
 box(30,6,10,'#e9e2d6',0,58,8,b.body);
 // 红色后梳刺发
 for(let i=0;i<9;i++){let x=(i%3-1)*5,z=-2+Math.floor(i/3)*5;box(5,9+(i%2)*4,8,i%2?'#a52a46':'#7c1f38',x,77+(i%2),z,b.body,-.9-.15*Math.floor(i/3),0,(i%3-1)*.25)}
 // 金色拳套
 for(let arm of (b.arms||[])){let g=new G();g.position.set(0,-24,0);arm.add(g);box(13,12,14,'#e8b030',0,0,0,g,0,0,0,'#ff9a10');box(14,4,15,'#a8701a',0,6,0,g);for(let k=0;k<4;k++)box(2.6,2.6,3,'#fff0b0',-4.5+k*3,-2,-7.8,g,0,0,0,'#ffd060');box(15,3,3,'#c98d66',0,9,0,g)}
 if(b.weapon)b.weapon.visible=false;b.settGlow=glow}
window.HeroPoseV20=apply;window.HeroPoseV20.SPEC=SPEC;
})();
