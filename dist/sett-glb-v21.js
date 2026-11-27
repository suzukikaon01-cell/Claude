/* V21 腕豪 3D 特效：加载玩家提供的 Setti 全技能 GLB 特效包（assets/fx/sett/*.glb），在 3D 场景里按技能播放。
 * 资源坐标：Z 向上、正前方 +X、相对单位；这里统一换算成游戏坐标（x/z 为地面，y 向上）。
 * 只用最简 GLB 解析（POSITION + 索引 + 材质颜色），不依赖额外的 three.js 加载器；网格挂在场景根节点上，每帧按腕豪当前位置摆放，被击退/闪现时会跟上。 */
(()=>{'use strict';
const FILES={P:'P',Q:'Q',W:'W',E:'E',R:'R'},data={};let loading=false;
function parseGLB(buf){let dv=new DataView(buf),jl=dv.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl))),bo=20+jl+8,out=[];
 const acc=i=>{let a=json.accessors[i],bv=json.bufferViews[a.bufferView],off=bo+(bv.byteOffset||0)+(a.byteOffset||0),n=a.type==='VEC3'?3:1,T=a.componentType===5126?Float32Array:a.componentType===5125?Uint32Array:Uint16Array;return new T(buf.slice(off,off+a.count*n*T.BYTES_PER_ELEMENT))};
 for(let nd of json.nodes){if(nd.mesh==null)continue;for(let pr of json.meshes[nd.mesh].primitives){let m=json.materials?.[pr.material]?.pbrMetallicRoughness?.baseColorFactor||[1,.7,.2,1];out.push({name:nd.name||'',pos:acc(pr.attributes.POSITION),idx:pr.indices!=null?acc(pr.indices):null,color:m})}}return out}
function load(){if(loading)return;let D=window.SETT_GLB_DATA;if(D){loading=true;for(let k in D){let bin=atob(D[k]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);data[k]=parseGLB(u.buffer)}return}if(typeof fetch==='undefined')return;loading=true;for(let k in FILES)fetch('assets/fx/sett/'+FILES[k]+'.glb').then(r=>r.ok?r.arrayBuffer():null).then(b=>{if(b)data[k]=parseGLB(b)}).catch(()=>{})}
// 用场景里已有网格的构造器生成新网格（renderer.js 内置的 three.js 未暴露到全局）
function build(b,key){let proto=null;b.body?.traverse?.(o=>{if(o.isMesh&&o.geometry?.type==='BoxGeometry'&&!proto)proto=o});if(!proto||!data[key])return null;
 const Mesh=proto.constructor,BG=Object.getPrototypeOf(proto.geometry.constructor),Attr=proto.geometry.getAttribute('position').constructor,G=b.body.constructor;
 let outer=new G(),inner=new G();inner.rotation.x=-Math.PI/2;outer.add(inner);let parts=[],mats=[];
 for(let p of data[key]){let g=new BG();g.setAttribute('position',new Attr(p.pos,3));if(p.idx)g.setIndex(Array.from(p.idx));g.computeVertexNormals();
  let m=proto.material.clone();m.map=null;let c=p.color;m.color?.setRGB(c[0],c[1],c[2]);if(m.emissive){m.emissive.setRGB(c[0]*.9,c[1]*.6,c[2]*.25);m.emissiveIntensity=1.1}m.transparent=true;m.depthWrite=false;m.opacity=.92;m.side=2;
  let mesh=new Mesh(g,m);mesh.name=p.name;inner.add(mesh);parts.push(mesh);mats.push(m)}
 let sc=b.root||b.body;while(sc.parent)sc=sc.parent;sc.add(outer);outer.visible=false;return {outer,inner,parts,mats}}
function inst(b,key){b.settGlb??={};if(!b.settGlb[key])b.settGlb[key]=build(b,key);return b.settGlb[key]}
function place(o,x,z,y,ang,sx,sy,sz,alpha){o.outer.visible=alpha>0.01;if(!o.outer.visible)return;o.outer.position.set(x,y,z);o.outer.rotation.set(0,-ang,0);o.inner.scale.set(sx,sy,sz);for(let m of o.mats)m.opacity=.92*alpha}
const ease=k=>1-Math.pow(1-k,3);
function update(b,U,I){if(U.hero!=='sett'||!b?.body)return;load();if(!Object.keys(data).length)return;let z=U.championState||{},alive=U.hp>0&&!(U.death>0);
 // 被动：豪意 ≥40% 时脚下光环与拳头光
 let P=inst(b,'P');if(P){let g=Math.min(1,(z.grit||0)/Math.max(1,(U.maxHp||1)*.5)),a=alive&&g>.4?Math.min(1,(g-.4)*2.5):0;place(P,U.x,U.y,2,(U.angle||0)+I*.6,30,30,30,a);if(a)for(let p of P.parts)if(/orbit/.test(p.name))p.parent&&(p.rotation.z=I*2)}
 // Q：强化拳命中瞬间的冲拳轨迹
 let Q=inst(b,'Q');if(Q){let t=I-(U._settQHitAt??-9),a=t>=0&&t<.35?1-t/.35:0;place(Q,U.x,U.y,0,U._settQHitAngle??U.angle??0,45*(1+.3*ease(t/.35)),45,45,a)}
 // W：龙首沿 W 方向冲出（蓄力 0.65 秒后），轨道/箭纹铺满 W 范围
 let W=inst(b,'W');if(W){let t=I-(U._settWAt??-9),ang=U._settWAngle??U.angle??0,range=U.skills?.[1]?.range||400;if(t>=0&&t<1.35){let s=range/5.9,charge=Math.min(1,t/.65),p=t<.65?0:(t-.65)/.7,fade=p<.6?1:1-(p-.6)/.4;place(W,U.x,U.y,0,ang,s,s,s,t<.65?.35*charge:fade);let off=t<.65?-2.6:-2.6+5.2*ease(Math.min(1,p/.5));for(let m of W.parts)if(/DragonHead/.test(m.name)){m.position.x=off+2.6;m.visible=t>=.65}else m.visible=true}else place(W,0,0,0,0,1,1,1,0)}
 // E：前后两侧各一组拉扯扇面与钩爪向腕豪合拢
 let E1=inst(b,'E'),E2=b.settGlb.E2||(b.settGlb.E2=build(b,'E'));if(E1&&E2){let t=I-(U._settEAt??-9),fx=U.settEFx,ang=fx?.angle??U.angle??0,range=U.skills?.[2]?.range||225,width=U.skills?.[2]?.width||175;if(t>=0&&t<.6){let a=1-Math.max(0,t-.35)/.25,k=ease(Math.min(1,t/.3)),sx=range/2.72*(1-.35*k),sy=width/2/2.16;place(E1,U.x,U.y,0,ang,sx,sy,60,a);place(E2,U.x,U.y,0,ang+Math.PI,sx,sy,60,a)}else{place(E1,0,0,0,0,1,1,1,0);place(E2,0,0,0,0,1,1,1,0)}}
 // R：落地冲击柱、环与碎石
 let R=inst(b,'R');if(R){let t=I-(U._settRAt??-9);if(t>=0&&t<1.2){let rad=U.skills?.[3]?.radius||450,s=rad/2.55,k=ease(Math.min(1,t/.35)),a=t<.7?1:1-(t-.7)/.5;place(R,U._settRX??U.x,U._settRY??U.y,0,0,s*(.6+.4*k),s*(.6+.4*k),70*(t<.25?t/.25:1)*(1-.3*Math.max(0,t-.5)),a);for(let m of R.parts)if(/debris/.test(m.name))m.position.z=Math.sin(Math.min(1,t/.8)*Math.PI)*.8}else place(R,0,0,0,0,1,1,1,0)}}
window.SettGlbV21={update,data,ready:()=>Object.keys(data).length>0};
})();
