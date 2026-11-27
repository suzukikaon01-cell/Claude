import {dioStandOnly} from './combat-contact.js';

// 肩关节始终固定在绑定位置；Q只让替身整体前移，不能平移手臂或生成长连接杆。
export function rememberDioJoints(m){
 m.dioJoints??=[...(m.arms||[]),...(m.standArms||[])];
 for(let arm of m.dioJoints)arm.userData.dioJointRest??=arm.position.clone();
 if(m.weapon)m.weapon.visible=false;
}
export function applyDioContact(m,u,time,v){
 if(u.hero!=='dio')return false;
 rememberDioJoints(m);
 if(m.contactObject&&m.contactRest)m.contactObject.position.copy(m.contactRest);
 m.contactObject=null;m.contactRest=null;
 if(m.contactLink)m.contactLink.visible=false;
 for(let arm of m.dioJoints)arm.position.copy(arm.userData.dioJointRest);
 if(u.dioState?.downUntil>time)return true;
 const standOnly=dioStandOnly(u,time);
 if(standOnly&&m.stand){
  let q=u.dioState?.q;
  for(let [i,arm]of m.standArms.entries()){
   let phase=q?(time-q.start)*q.count/Math.max(.01,q.end-q.start)*Math.PI*2+i*Math.PI:0;
   arm.rotation.x=.15+Math.max(0,Math.sin(phase))*Math.PI/2;
  }
  if(v?.reach>0){
   let index=(u.attackContact?.hand||'RIGHT')==='RIGHT'?1:0,arm=m.standArms[index],joint=arm.userData.dioJointRest;
   let scale=Math.max(.01,m.root.scale.x),range=GAME_CONFIG.heroParams.dio.Q.range/scale,d=Math.min(v.distance,range),a=v.angle-(u.angle||0),sn=Math.sin(a),cs=Math.cos(a),reach=v.reach;
   let x=sn*(d-34)-cs*joint.x,z=-cs*(d-34)-sn*joint.x;
   m.stand.position.set(32+(x-32)*reach,8+(Math.max(-10,Math.min(12,v.height-joint.y))-8)*reach,-16+(z+16)*reach);
   m.stand.rotation.y=-a;arm.rotation.x=Math.PI/2*reach;
  }
 }else if(v?.reach>0){
  let arm=m.arms[(u.attackContact?.hand||'RIGHT')==='RIGHT'?1:0];
  if(arm)arm.rotation.x=Math.PI/2*v.reach;
 }
 return true;
}
