/* V21 腕豪精细化模型：使用玩家提供的 Setti_Refined_Static.glb（红黑金设定，独立命名网格 + PBR 材质）替换游戏里的方块模型。
 * 资源为 Z 向上、面朝 -Y；换算成游戏模型坐标（y 向上、面朝 -z），缩放到游戏英雄身高。
 * 左右手臂（上臂/小臂/护腕/拳头）挂到游戏的手臂骨骼上，腿部挂到腿骨上，因此原有的普攻/技能动作仍然能带动新模型；其余部分挂在身体上。 */
(()=>{'use strict';
const S=16;let parsed=null;
function parse(){if(parsed||!window.SETT_MODEL_GLB)return parsed;let bin=atob(window.SETT_MODEL_GLB),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);let buf=u.buffer,dv=new DataView(buf),jl=dv.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl))),bo=20+jl+8;
 const acc=i=>{let a=json.accessors[i],bv=json.bufferViews[a.bufferView],off=bo+(bv.byteOffset||0)+(a.byteOffset||0),n=a.type==='VEC3'?3:1,T=a.componentType===5126?Float32Array:a.componentType===5125?Uint32Array:Uint16Array;return new T(buf.slice(off,off+a.count*n*T.BYTES_PER_ELEMENT))};
 parsed=[];for(let nd of json.nodes){if(nd.mesh==null)continue;for(let pr of json.meshes[nd.mesh].primitives){let m=json.materials?.[pr.material]||{},pbr=m.pbrMetallicRoughness||{};
  // Z-up/-Y 前 → y-up/-z 前：(x,y,z)→(x,z,y)
  let p=acc(pr.attributes.POSITION),q=new Float32Array(p.length);for(let i=0;i<p.length;i+=3){q[i]=p[i]*S;q[i+1]=p[i+2]*S;q[i+2]=p[i+1]*S}
  let idx=pr.indices!=null?Array.from(acc(pr.indices)):null;if(idx)for(let i=0;i<idx.length;i+=3){let t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t}
  parsed.push({name:nd.name||'',pos:q,idx,color:pbr.baseColorFactor||[1,1,1,1],metal:pbr.metallicFactor??.2,rough:pbr.roughnessFactor??.6,mat:m.name||''})}}return parsed}
const ARM=/^(L|R)_(upper_arm|bicep|elbow|forearm|forearm_muscle|bracer.*|fist|knuckle.*|thumb)$/,LEG=/^(L|R)_(trouser.*|fabric_fold.*|boot.*|shin.*|ankle_band)$/;
function build(b){if(b.settModel!==undefined)return b.settModel;let P=parse();if(!P||!b.body){return null}let proto=null;b.body.traverse?.(o=>{if(o.isMesh&&o.geometry?.type==='BoxGeometry'&&!proto)proto=o});if(!proto){b.settModel=null;return null}
 const Mesh=proto.constructor,BG=Object.getPrototypeOf(proto.geometry.constructor),Attr=proto.geometry.getAttribute('position').constructor;
 // 隐藏原方块模型
 let old=[];b.body.traverse(o=>{if(o.isMesh){o.visible=false;old.push(o)}});if(b.weapon)b.weapon.visible=false;
 let arms=b.arms||[],legs=b.legs||[],glow=[],mats={};
 const side=n=>n[0]==='L'?0:1;
 for(let p of P){let key=p.mat;let m=mats[key];if(!m){m=proto.material.clone();m.map=null;m.color?.setRGB(p.color[0],p.color[1],p.color[2]);if('metalness' in m)m.metalness=p.metal;if('roughness' in m)m.roughness=p.rough;if(m.emissive){m.emissive.set(/gold/.test(key)?'#a86410':'#000000');m.emissiveIntensity=/gold/.test(key)?.12:1;if(/gold/.test(key))glow.push(m)}m.side=2;mats[key]=m}
  let g=new BG(),pos=p.pos,parent=b.body,off=null;
  if(ARM.test(p.name)){let a=arms[side(p.name)];if(a){parent=a;off=a.position}}else if(LEG.test(p.name)){let l=legs[side(p.name)];if(l){parent=l;off=l.position}}
  if(off){pos=pos.slice();for(let i=0;i<pos.length;i+=3){pos[i]-=off.x;pos[i+1]-=off.y;pos[i+2]-=off.z}}
  g.setAttribute('position',new Attr(pos,3));if(p.idx)g.setIndex(p.idx);g.computeVertexNormals();let mesh=new Mesh(g,m);mesh.name='setti_'+p.name;mesh.castShadow=true;parent.add(mesh)}
 b.settModel={glow,old};b.settGlow=glow;b.settBuilt=true;return b.settModel}
window.SettModelV21={build};
})();
