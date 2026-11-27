const fs=require('fs');function edit(f,fn){fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')))}
edit('dist/heroes-v11.js',s=>{
 let start=s.indexOf('   let b=z.bomb;if(b){'),end=s.indexOf('\n  },interrupt',start),bomb=s.slice(start,end);if(start<0||end<0)throw Error('bomb block');s=s.slice(0,start)+s.slice(end);s=s.replace(' m.v11Resource=',` m.v11WorldTick=()=>{for(let u of units()){if(u.hero!=='dva')continue;let z=state(u),pp=P(u);${bomb}}};\n m.v11Resource=`);
 s=s.replace("form:'mech',charge:0", "form:'mech',charge:0");
 s=s.replace("m.heroHooks.ana={isMelee:","m.heroHooks.ana={derive(u){u.attackSpeed=P(u).P.fixed_attack_speed},isMelee:");
 s=s.replace("event:e};eject(u,true)","event:e,damage:R.rawSkill(u,3)};eject(u,true)");
 s=s.replace("if(clear)hit(u,t,3,b.event,0,Math.max", "if(clear)m.deal(t,b.damage*Math.max");
 s=s.replace("dist(b,t)/pp.R.radius))}env.ring", "dist(b,t)/pp.R.radius),u,'magic',{event:b.event,once:true})}env.ring");
 // Missiles that reach their maximum range still detonate exactly once.
 s=s.replace("m.v11Arrival=explode;", "m.v11Arrival=explode;m.v11Expired=p=>{if(p.dvaMissile){let u=p.source;for(let t of foes(u,p,P(u).Q.radius))hit(u,t,0,p.event,'missile:'+p.missileIndex);env.ring(p.x,p.y,P(u).Q.radius,u.color,.2)}};");
 return s;
});
edit('dist/champion-mechanics.js',s=>s.replace('function tickAreas(){','function tickAreas(){api.v11WorldTick?.();').replace('if(p.distance>=p.maxRange)p.life=0;', 'if(p.distance>=p.maxRange){api.v11Expired?.(p);p.life=0;}'));
edit('dist/game.js',s=>s.replace("player.hero==='ashe'&&i===2&&player.charges===0?'充能':", "player.hero==='dva'&&player.v11State?.form==='pilot'?i===3?(player.v11State.charge>=100?'呼叫机甲':Math.floor(player.v11State.charge)+'%'):'机甲限定':player.hero==='ashe'&&i===2&&player.charges===0?'充能':"));
edit('src/renderer.js',s=>s.replace('living.clear();for(let u of units)',"let displayed=[...units];for(let u of units){let b=u.v11State?.bomb;if(b)displayed.push({id:'bomb:'+u.id,type:'hero',hero:'dva',team:u.team,hp:1,x:b.x,y:b.y,angle:u.angle,color:u.color,visualScale:u.visualScale,v11State:{form:'mech'},bombVisual:true})}living.clear();for(let u of displayed)"));
edit('scripts/config-loader.cjs',s=>s.replace("if(errors.length){let e=",`for(let [key,d] of Object.entries(require('../config/v11-definition.json'))){let id=key.toUpperCase();for(let [g,values]of [['BASE',d.stats],['P',d.P],...d.skills.map((s,i)=>['QWER'[i],s.params])])for(let k of Object.keys(values))if(params.英雄?.[id]?.[g]?.[k]===undefined)errors.push({file,sheet:'英雄',row:0,parameter:[id,g,k].join('.'),message:'缺少V11.1配置'});for(let [g,k,integer]of [['BASE','hp_base'],['BASE','as_base'],['P','ammo_capacity',true],['P','reload_duration'],['P','beam_interval'],['P','absorb_per_energy'],['P','pilot_ammo',true],['P','pilot_reload'],['P','fixed_attack_speed'],['P','enemy_magic_tick_count',true],['P','enemy_magic_tick_interval'],['Q','missiles',true],['W','energy_max'],['W','energy_drain']])positive(id,g,k,integer)}
 if(errors.length){let e=`));
edit('test-skill-adjust.cjs',s=>s.replace('[2,1.7],[3,2.3]','[2,1.6],[3,2]'));
edit('test-matches-v9.cjs',s=>s.replace("'darius','illaoi'","'darius','illaoi','ana','dva','zarya'"));
edit('test-v9.cjs',s=>s.replaceAll('eleven','fourteen').replace('length,11','length,14').replace('400/1400','400/2800').replace("if(id==='ashe')u.focusStacks=4;", "if(u.skills[i].ally)t=h.a.enemy('lux',u.x+70,u.y,0);if(id==='ashe')u.focusStacks=4;"));
edit('test.cjs',s=>s+"\nrequire('./test-v11.cjs');\n");
