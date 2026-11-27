const fs=require('fs');function edit(f,fn){fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')))}
edit('dist/heroes-v11.js',s=>{
 let start=s.indexOf(' function explode(p){'),end=s.indexOf('\n m.v11Arrival=',start);
 let text=` function explode(p){let u=p.source,data=p.v11Data,pp=data.params,e=p.event,kind=data.kind,position={x:p.x,y:p.y};let impact=t=>m.deal(t,data.damage,u,'magic',{event:e,once:true,sourceType:p.reflectedPayload?'REFLECTED_PROJECTILE':'ABILITY'});
  if(kind==='ana-grenade'){for(let t of m.nearby(position,pp.radius,t=>live(t)&&['hero','minion','monster'].includes(t.type)&&!t.tentacle)){if(t.team===u.team){if(t.type==='hero')core.apply(t,'ANA_HEAL_AMP',pp.duration,u,{amount:pp.healing_amp,tenacity:false,uniqueKey:'ana-heal-amp'})}else{impact(t);core.apply(t,'HEAL_REDUCTION',pp.duration,u,{amount:1,tenacity:false,uniqueKey:'ana-antiheal'})}}}
  else if(kind==='zarya-q'){for(let t of foes(u,position,pp.radius))impact(t)}
  else if(kind==='zarya-r'){for(let t of foes(u,position,pp.radius))impact(t);u.v11Gravity={...position,started:now(),until:now()+pp.duration,next:now()+pp.tick_interval,ticks:0,event:e,params:pp,rank:data.rank}}
  env.ring(p.x,p.y,pp.radius,u.color,.5);
 }\n m.v11Reflected=(p,t)=>explode({...p,x:t.x,y:t.y,v11Data:p.reflectedPayload.v11});`;
 s=s.slice(0,start)+text+s.slice(end);
 let a=s.indexOf('let g=z.gravity;'),b=s.indexOf('},reset(u){u.v11State=null}};',a),gravity=s.slice(a,b);if(a<0||b<0)throw Error('gravity');
 s=s.slice(0,a)+s.slice(b);
 gravity=gravity.replace('let g=z.gravity;','let g=u.v11Gravity;').replaceAll('pp.R.','g.params.').replaceAll('z.gravity=null;return','u.v11Gravity=null;continue').replace("rank(u,3,'tick_damage')","R.rank(g.params.tick_damage,g.rank)");
 s=s.replace("m.v11WorldTick=()=>{for(let u of units()){if(u.hero!=='dva')continue;",`m.v11WorldTick=()=>{for(let u of units()){${gravity}if(u.hero!=='dva')continue;`);
 s=s.replace("if(z.gravity){ctx.fillStyle='#bc66e833';ctx.beginPath();ctx.arc(z.gravity.x,z.gravity.y,P(u).R.radius,0,Math.PI*2);ctx.fill()}","");
 s=s.replace("if(!z)continue;if(z.matrix)","let gravity=u.v11Gravity;if(gravity){ctx.fillStyle='#bc66e833';ctx.beginPath();ctx.arc(gravity.x,gravity.y,gravity.params.radius,0,Math.PI*2);ctx.fill()}if(!z)continue;if(z.matrix)");
 return s;
});
edit('dist/genji.js',s=>s.replace("return data}\n function intercept", "if(p.v11Data)data.v11=p.v11Data;if(p.anaSleep)data.effects.push({type:'SLEEP',duration:C.heroParams.ana.W.sleep_duration});return data}\n function intercept").replace("function reflectedImpact(p,t){let data=p.reflectedPayload,targets=", "function reflectedImpact(p,t){if(p.reflectedPayload.v11){m.v11Reflected?.(p,t);return}let data=p.reflectedPayload,targets="));
