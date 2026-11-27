// Three reusable batches per hero, rather than a new mesh for each R impact.
const poses=[[.2,-.4,-.4],[-.8,.8,.6],[.8,-1.3,-.7],[-1.4,.3,.1],[-.6,0,1.1]];
export function voidAttackPose(stage){return poses[stage-1]||poses[0]}
export function createVoidPortals(THREE,body,material,capacity=10){
 const group=new THREE.Group(),dark=material('#140b25').clone();dark.side=THREE.DoubleSide;
 const rings=new THREE.InstancedMesh(new THREE.TorusGeometry(10,1.7,5,20),material('#d3a5ff',true),capacity),cores=new THREE.InstancedMesh(new THREE.CircleGeometry(8,20),dark,capacity),spears=new THREE.InstancedMesh(new THREE.ConeGeometry(3,30,4),material('#ffe69e',true),capacity);
 for(let mesh of[rings,cores,spears]){mesh.count=0;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);group.add(mesh)}body.add(group);
 return{group,rings,cores,spears,capacity,transform:new THREE.Object3D(),dispose(){dark.dispose()}};
}
export function animateVoidPortals(rig,time,start,count,judgement){
 count=Math.max(0,Math.min(rig.capacity,count));const t=rig.transform;
 for(let i=0;i<count;i++){let angle=i/rig.capacity*Math.PI*2;t.position.set(Math.cos(angle)*43,45+Math.sin(angle)*30,22);t.rotation.set(0,.15*Math.cos(angle),time*(i%2?-.7:.7));t.scale.setScalar(judgement?1.35:1);t.updateMatrix();rig.rings.setMatrixAt(i,t.matrix);rig.cores.setMatrixAt(i,t.matrix);t.rotation.x=Math.PI/2;t.position.z-=judgement?5+((time-start)*120+i*11)%70:12;t.updateMatrix();rig.spears.setMatrixAt(i,t.matrix)}
 for(let mesh of[rig.rings,rig.cores,rig.spears]){mesh.count=count;mesh.instanceMatrix.needsUpdate=true}return count;
}
