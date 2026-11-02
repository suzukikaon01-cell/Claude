// Rendering-independent services. Champion behavior stays in champion-mechanics.js.
(()=>{'use strict';
 class CombatClock {
  constructor({hz=60,maxCatchUp=.25,maxSteps=15}={}){this.step=1/hz;this.maxCatchUp=maxCatchUp;this.maxSteps=maxSteps;this.reset()}
  reset(){this.tick=0;this.time=0;this.accumulator=0;this.droppedTime=0}
  advance(elapsed,update){if(!Number.isFinite(elapsed)||elapsed<0)return 0;let accepted=Math.min(elapsed,this.maxCatchUp);this.droppedTime+=elapsed-accepted;this.accumulator+=accepted;let count=0;while(this.accumulator+1e-10>=this.step&&count<this.maxSteps){this.tick++;this.time=this.tick*this.step;update(this.step,this.time);this.accumulator-=this.step;count++}if(this.accumulator>=this.step){let dropped=Math.floor(this.accumulator/this.step)*this.step;this.accumulator-=dropped;this.droppedTime+=dropped}return count}
 }
 class ObjectPool {
  constructor(limit=1024){this.limit=limit;this.free=[];this.created=0;this.reused=0}
  acquire(values){let o=this.free.pop();if(o)this.reused++;else{o={};this.created++}Object.assign(o,values);return o}
  release(o){for(let k of Object.keys(o))delete o[k];if(this.free.length<this.limit)this.free.push(o)}
 }
 class SpatialIndex {
  constructor(size=400){this.size=size;this.cells=new Map;this.locations=new WeakMap;this.freeCells=[];this.visited=0}
  rebuild(units){for(let list of this.cells.values()){list.length=0;this.freeCells.push(list)}this.cells.clear();for(let u of units){if(!(u.hp>0)||u.death>0){this.locations.delete(u);continue;}let key=Math.floor(u.x/this.size)+','+Math.floor(u.y/this.size);let list=this.cells.get(key);if(!list)this.cells.set(key,list=this.freeCells.pop()||[]);list.push(u);this.locations.set(u,key)}}
  update(u){let old=this.locations.get(u),key=Math.floor(u.x/this.size)+','+Math.floor(u.y/this.size);if(old===key)return;if(old){let list=this.cells.get(old),i=list?.indexOf(u);if(i>=0)list.splice(i,1)}if(!(u.hp>0)||u.death>0){this.locations.delete(u);return}let list=this.cells.get(key);if(!list)this.cells.set(key,list=[]);list.push(u);this.locations.set(u,key)}
  nearest(p,r,predicate=()=>true){let found=null,best=r*r;for(let x=Math.floor((p.x-r)/this.size);x<=Math.floor((p.x+r)/this.size);x++)for(let y=Math.floor((p.y-r)/this.size);y<=Math.floor((p.y+r)/this.size);y++)for(let u of this.cells.get(x+','+y)||[]){this.visited++;let dx=u.x-p.x,dy=u.y-p.y,d=dx*dx+dy*dy;if(d<best&&predicate(u)){found=u;best=d}}return found}
  circle(p,r,predicate=()=>true){let result=[];if(!Number.isFinite(r)||r<0)return result;for(let x=Math.floor((p.x-r)/this.size);x<=Math.floor((p.x+r)/this.size);x++)for(let y=Math.floor((p.y-r)/this.size);y<=Math.floor((p.y+r)/this.size);y++)for(let u of this.cells.get(x+','+y)||[]){this.visited++;if((u.x-p.x)*(u.x-p.x)+(u.y-p.y)*(u.y-p.y)<=r*r&&predicate(u))result.push(u)}return result}
 }
 const fields={SLEEP:'sleep',STUN:'stun',ROOT:'root',SILENCE:'silence',AIRBORNE:'airborne',SUPPRESSION:'suppression',STEALTH:'invisible',UNTARGETABLE:'untargetable',DAMAGE_IMMUNITY:'invulnerable',CC_IMMUNITY:'ccImmune',SLOW:'slow',HEAL_REDUCTION:'healReduction',MOVE_SPEED_BUFF:'boost',ATTACK_SPEED_BUFF:'asBuff'};
 const typeName=t=>Object.keys(fields).find(k=>fields[k]===t)||t.toUpperCase();
 window.CombatClock=CombatClock;window.CombatObjectPool=ObjectPool;window.CombatSpatialIndex=SpatialIndex;
 window.createCombatRuntime=function(env){
  const now=env.time,live=u=>u&&u.hp>0&&!(u.death>0);let id=0,cast=0,effect=0,queue=[],history=[],head=0,listeners=new Map,errors=0,inputs=new Map;
  const spatial=new SpatialIndex,pool=new ObjectPool,interceptors=new Map;
  function emit(type,source=null,target=null,details={}){let record=Object.freeze({id:++id,time:now(),type,sourceId:source?.id??null,targetId:target?.id??null,abilityInstanceId:details.castId??null,abilityId:details.abilityId??null,hitIndex:details.hitIndex??0,...details});if(queue.length-head>=4096){errors++;return record}queue.push(record);history.push(record);if(history.length>2048)history.splice(0,history.length-2048);return record}
  function flush(){let processed=0;while(head<queue.length&&processed++<4096){let e=queue[head++];for(let fn of listeners.get(e.type)||[]){try{fn(e)}catch{errors++}}}if(head<queue.length)errors++;queue=[];head=0}
  function on(type,fn){if(!listeners.has(type))listeners.set(type,new Set);listeners.get(type).add(fn);return()=>listeners.get(type)?.delete(fn)}
  function instance(source,index){return{id:++cast,castId:cast,source,index,time:now(),entropy:new Set,damageHits:new Set,hitKeys:new Set}}
  function claim(e,target,hitIndex=0){if(!e)return true;e.hitKeys??=new Set;let key=target.id+':'+hitIndex;if(e.hitKeys.has(key))return false;e.hitKeys.add(key);return true}
  function collection(u){return u.statuses??=new Map}
  function sync(u){let managed=u.managedStatusFields??=new Set;for(let k of managed)u[k]=0;let slows=[],buffs=[];for(let s of collection(u).values()){if(s.endTime<=now())continue;let k=fields[s.type];if(k){managed.add(k);u[k]=Math.max(u[k]||0,s.endTime-now())}if(s.type==='SLOW')slows.push(s);if(s.type==='MOVE_SPEED_BUFF')buffs.push(s)}u.slowAmount=slows.reduce((n,s)=>Math.max(n,s.decay?s.amount+(s.decay.to-s.amount)*Math.min(1,(now()-s.startTime)/s.decay.duration):s.amount||0),0);if(buffs.length)u.boostAmount=Math.max(...buffs.map(s=>s.amount||0));let z=[...collection(u).values()].filter(s=>s.tag==='ZERO_W_ROOT'&&s.endTime>now()).sort((a,b)=>b.endTime-a.endTime)[0];u.zeroRoot=z?{type:z.tag,source:z.source,until:z.endTime}:null}
  function remove(u,predicate,reason='expired'){for(let [key,s] of collection(u)){if(predicate(s)){collection(u).delete(key);emit('StatusExpired',s.source,u,{abilityId:s.sourceAbilityId,castId:s.castId,effectId:s.uniqueEffectId,status:s.type,reason})}}sync(u)}
  function statuses(u,type){return [...collection(u).values()].filter(s=>s.endTime>now()&&(!type||s.type===typeName(type)))}
  function apply(u,type,duration,source=null,options={}){
   if(!live(u)||!Number.isFinite(duration)||duration<=0)return null;type=typeName(type);if(source&&source!==u&&source.team!==u.team&&['SLEEP','STUN','ROOT','SILENCE','SLOW','AIRBORNE','SUPPRESSION','HEAL_REDUCTION'].includes(type)&&env.blockAbility?.(source,u,{event:source.activeCastEvent,abilityId:options.abilityId??source.activeCastEvent?.index}))return null;
   if(env.beforeControl?.(u,type,duration,source,options))return null;if(['SLEEP','STUN','ROOT','SILENCE','SLOW','AIRBORNE','SUPPRESSION'].includes(type)&&statuses(u,'CC_IMMUNITY').length)return null;
   if(['SLEEP','STUN','ROOT','SILENCE','SLOW'].includes(type)&&statuses(u,'CLEANSE_IMMUNITY').length)return null;
   if(type==='SLOW'&&u.hero==='masteryi'&&u.championState?.highlanderUntil>now())return null;
   if(type==='SLOW'&&u.slowResistance>0)options={...options,amount:(options.amount||0)*(1-Math.min(1,u.slowResistance))};
   let reduced=!['AIRBORNE','SUPPRESSION'].includes(type)&&options.tenacity!==false,durationActual=duration*(reduced&&u.tenacityTime>0?Math.max(0,1-u.tenacity):1)*(reduced?Math.max(0,1-(u.itemTenacity||0)):1);
   let sourceAbilityId=options.abilityId??source?.pendingCast?.i??null;
   let key=options.uniqueKey??type+':'+(source?.id??'world')+':'+(sourceAbilityId??'generic')+':'+(options.tag??'');
   let prior=collection(u).get(key),record={type,sourceId:source?.id??null,sourceAbilityId,targetId:u.id,startTime:prior?.startTime??now(),endTime:now()+durationActual,duration:durationActual,stacks:options.stacks??1,dispelCategory:options.dispelCategory??(type==='SUPPRESSION'?'suppression':type==='AIRBORNE'?'airborne':'normal'),priority:options.priority??0,uniqueEffectId:prior?.uniqueEffectId??++effect,source,...options};
   if(prior&&!options.refresh)record.endTime=Math.max(prior.endTime,record.endTime);collection(u).set(key,record);sync(u);if(!prior)emit('StatusApplied',source,u,{abilityId:sourceAbilityId,castId:record.castId,effectId:record.uniqueEffectId,status:type});
   if(['SLEEP','STUN','SILENCE','AIRBORNE','SUPPRESSION'].includes(type))env.interrupt?.(u,type);return record;
  }
  function tickStatuses(u){if(!u.statuses?.size){if(u.managedStatusFields?.size)sync(u);return}remove(u,s=>s.endTime<=now())}
  function cleanse(u,type=null,sourceId=null,{suppression=false,airborne=false}={}){let wanted=type&&typeName(type);remove(u,s=>(!wanted||s.type===wanted)&&(sourceId===null||s.sourceId===sourceId)&&(s.dispelCategory!=='suppression'||suppression)&&(s.dispelCategory!=='airborne'||airborne),'cleansed')}
  function has(u,type){return statuses(u,type).length>0}
  function hardLocked(u){return !!u._temporalStopId||u.sleep>0||u.stun>0||u.airborne>0||u.suppression>0}
  function canMove(u){return live(u)&&!hardLocked(u)&&!(u.root>0)}
  function buffer(u,command,ttl){inputs.set(u.id,{...command,expires:now()+ttl});return true}
  function cancelInput(u,kind=null){let c=inputs.get(u.id);if(!kind||c?.kind===kind)inputs.delete(u.id)}
  function drain(u,execute){let c=inputs.get(u.id);if(!c)return;if(c.expires+1e-9<now()||!live(u)){inputs.delete(u.id);return}if(execute(c))inputs.delete(u.id)}
  function safePoint(from,to,radius=22,{crossWalls=false}={}){if(!to||!Number.isFinite(to.x)||!Number.isFinite(to.y))return{x:from.x,y:from.y};let end={x:Math.max(radius,Math.min(GAME_CONFIG.world-radius,to.x)),y:Math.max(radius,Math.min(GAME_CONFIG.world-radius,to.y))},length=Math.hypot(end.x-from.x,end.y-from.y),steps=Math.max(1,Math.ceil(length/8)),last={x:from.x,y:from.y};if(crossWalls&&!env.blocked(end.x,end.y,radius))return end;for(let i=1;i<=steps;i++){let p={x:from.x+(end.x-from.x)*i/steps,y:from.y+(end.y-from.y)*i/steps};if(env.blocked(p.x,p.y,radius))break;last=p}return last}
  function intercept(projectile,a,b){if(projectile.blockable===false)return false;for(let [key,w] of interceptors){if(w.until<=now()){interceptors.delete(key);continue}if(w.team===projectile.source?.team)continue;let cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);if(cross(a,b,w.a)*cross(a,b,w.b)<=0&&cross(w.a,w.b,a)*cross(w.a,w.b,b)<=0&&Math.max(Math.min(a.x,b.x),Math.min(w.a.x,w.b.x))<=Math.min(Math.max(a.x,b.x),Math.max(w.a.x,w.b.x))&&Math.max(Math.min(a.y,b.y),Math.min(w.a.y,w.b.y))<=Math.min(Math.max(a.y,b.y),Math.max(w.a.y,w.b.y)))return true}return false}
  function startDisplacement(u,to,{type='DASH',duration=.2,source=u,abilityId=null}={}){
   if(!live(u)||!['DASH','BLINK','LEAP','KNOCKBACK','PULL','FORCED_MOVEMENT'].includes(type))return false;
   let voluntary=['DASH','BLINK','LEAP'].includes(type);if(!voluntary&&(u.hero==='longsword_hunter'||source!==u&&source?.team!==u.team)&&(statuses(u,'CC_IMMUNITY').length||u.ccImmune>0))return false;if(!voluntary&&source!==u&&source?.team!==u.team&&env.blockAbility?.(source,u,{event:source.activeCastEvent,abilityId}))return false;if(voluntary&&(hardLocked(u)||u.root>0))return false;
   let end=safePoint(u,to,22,{crossWalls:type==='BLINK'||type==='LEAP'});
   if(type==='BLINK'||duration<=0){u.x=end.x;u.y=end.y;spatial.update(u);return true}
   u.displacement={type,sourceId:source?.id,abilityId,startTime:now(),endTime:now()+duration,from:{x:u.x,y:u.y},to:end};return true;
  }
  function tickDisplacement(u){if(u._temporalStopId)return;let m=u.displacement;if(!m)return;if(!live(u)||['DASH','LEAP'].includes(m.type)&&(hardLocked(u)||u.root>0)){u.displacement=null;return}let f=Math.min(1,(now()-m.startTime)/(m.endTime-m.startTime)),p={x:m.from.x+(m.to.x-m.from.x)*f,y:m.from.y+(m.to.y-m.from.y)*f},safe=m.type==='LEAP'?p:safePoint(u,p);u.x=safe.x;u.y=safe.y;spatial.update(u);if(f>=1)u.displacement=null}
  function stats(){return{events:history.length,queuedEvents:queue.length-head,observerErrors:errors,bufferedInputs:inputs.size,spatialCells:spatial.cells.size,spatialVisited:spatial.visited,pooledProjectiles:pool.free.length,projectilesCreated:pool.created,projectilesReused:pool.reused}}
  return{exportState:()=>({eventId:id,castSequence:cast,effectSequence:effect}),restoreState(saved){id=saved.eventId||0;cast=saved.castSequence||0;effect=saved.effectSequence||0;inputs.clear();queue=[];head=0;history=[]},emit,flush,on,instance,claim,apply,remove,statuses,sync,tickStatuses,cleanse,has,hardLocked,canMove,buffer,cancelInput,drain,safePoint,startDisplacement,tickDisplacement,intercept,interceptors,spatial,pool,stats,history:()=>history.slice(),reset(){id=cast=effect=0;queue=[];history=[];head=0;errors=0;inputs.clear();interceptors.clear();spatial.cells.clear()},clear(u){remove(u,()=>true,'unit-reset');inputs.delete(u.id);u.displacement=null;u.statuses=new Map;u.managedStatusFields=new Set}};
 };
})();
