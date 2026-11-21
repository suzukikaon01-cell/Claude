const fs=require('fs');function edit(f,fn){fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')))}function sub(s,a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,90));return s.replace(a,b)}
edit('scripts/config-model.cjs',s=>sub(s,"ILLAOI:'illaoi'","ILLAOI:'illaoi',ANA:'ana',DVA:'dva',ZARYA:'zarya'"));
edit('dist/champion-mechanics.js',s=>{
 s=sub(s,'heroHooks[u.hero]?.derive?.(u);u.maxHp=s.hp','heroHooks[u.hero]?.derive?.(u,s);u.maxHp=s.hp');
 s=sub(s,'amount=api.itemEffects?.healAmount','amount*=1+Math.max(0,...core.statuses(u,\'ANA_HEAL_AMP\').map(s=>s.amount||0));amount=api.itemEffects?.healAmount');
 s=sub(s,'let entry={amount,until:now()+duration,source,','let entry={...meta,amount,until:now()+duration,source,');
 s=sub(s,"meta.sourceType??=meta.runeProc",'api.v11BeforeDamage?.(target,source,meta);meta.sourceType??=meta.runeProc');
 s=sub(s,'heroHooks[target.hero]?.beforeDamage?.(target,amount,source,type,meta);','amount=api.v11Damage?.(target,amount,source,type,meta)??amount;heroHooks[target.hero]?.beforeDamage?.(target,amount,source,type,meta);');
 s=sub(s,'entry.amount-=used;left-=used;','entry.amount-=used;left-=used;if(used>0)api.v11Absorb?.(entry,used,target);');
 s=sub(s,'if(target.hp<=0){if(api.itemEffects?.lethal','if(target.hp<=0){if(heroHooks[target.hero]?.lethal?.(target,source,meta))return true;if(api.itemEffects?.lethal');
 s=sub(s,"if(t.type==='ward')return api.runeEffects?.attackWard(u,t);let landed=deal(t,p.damage,u,'physical'","if(t.type==='ward')return api.runeEffects?.attackWard(u,t);let custom=heroHooks[u.hero]?.basicImpact?.(u,t,p);if(custom!==undefined)return custom;let landed=deal(t,p.damage,u,p.damageType||'physical'");
 s=sub(s,"function validTarget(u,t,s){return alive(t)","function validTarget(u,t,s){if(s.ally)return alive(t)&&t.type==='hero'&&t.team===u.team&&!(t.untargetable>0)&&!(u.hero==='zarya'&&t===u)&&d(u,t)<=s.range;return alive(t)");
 s=sub(s,"env.targetFor(u,s.range,s.heroOnly?'hero':'unit',p,p.dragged)","(s.ally?nearby(u,s.range,t=>validTarget(u,t,s)).sort((a,b)=>p.dragged?d(a,p)-d(b,p):a.hp/a.maxHp-b.hp/b.maxHp)[0]:env.targetFor(u,s.range,s.heroOnly?'hero':'unit',p,p.dragged))");
 s=s.replaceAll('if(api.genji?.intercept(p,old,p.target))','if(api.v11Intercept?.(p,old,p.target)||api.genji?.intercept(p,old,p.target))').replaceAll('if(api.genji?.intercept(p,old,p))','if(api.v11Intercept?.(p,old,p)||api.genji?.intercept(p,old,p))');
 s=sub(s,'if(p.luxOrb){','if(p.v11Ground){if(p.distance>=p.maxRange){api.v11Arrival?.(p);p.life=0}continue}\n   if(p.luxOrb){');
 s=sub(s,"(t.type==='hero'?20:15))+p.radius","(t.radius||(t.type==='hero'?20:15)))+p.radius");
 s=sub(s,'if(window.installV9Heroes)installV9Heroes(api,env);return api;','if(window.installV9Heroes)installV9Heroes(api,env);if(window.installV11Heroes)installV11Heroes(api,env);return api;');return s;
});
edit('dist/combat-core.js',s=>s.replace("const fields={STUN:","const fields={SLEEP:'sleep',STUN:").replaceAll("['STUN','ROOT','SILENCE','SLOW'","['SLEEP','STUN','ROOT','SILENCE','SLOW'").replace('return u.stun>0||','return u.sleep>0||u.stun>0||'));
edit('dist/new-heroes.js',s=>s.replace(/function isolationRadius\(source\)\{[^}]*\}/,"function isolationRadius(source){return C.heroParams.khazix.P.isolation_radius}"));
edit('dist/game.js',s=>{
 s=sub(s,"radius:kind==='tower'?C.tower.radius:55","radius:kind==='tower'?C.tower.radius:82*4");
 s=sub(s,"visualScale:C.minionVisualScale*(superMinion?2.5:1)","radius:superMinion?37.5:30,visualScale:C.minionVisualScale*(superMinion?1.25:1)");
 s=sub(s,"u.type==='nexus'?-150*(u.modelScale||1)","u.type==='nexus'?-110*(u.modelScale||1)");
 s=sub(s,"['garen','sett','darius','illaoi'].includes(id)","['garen','sett','darius','illaoi','dva','zarya'].includes(id)");
 s=sub(s,"function canBeTarget(u,v){","function canBeTarget(u,v){if(u.hero==='ana'&&v.type==='hero'&&v.team===u.team&&u!==v)return !(v.untargetable>0)&&alive(v);");
 s=sub(s,"function drawCombatV8(){","function drawCombatV8(){mechanics.v11Draw?.(ctx,player,time);if(player)for(let u of units){let v=u.genjiBladeVisual;if(v&&v.until>time){ctx.save();ctx.translate(u.x,u.y);ctx.rotate(v.angle);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,200,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.fillStyle='#c2ffe633';ctx.fill();ctx.strokeStyle='#d9fff0';ctx.lineWidth=5;ctx.stroke();ctx.restore()}}");
 s=sub(s,"ctx.textAlign='center';ctx.font='12px Microsoft YaHei';","if(['ana','dva','zarya'].includes(u.hero)){ctx.font='bold 12px Arial';ctx.fillStyle=u.color;ctx.fillText(mechanics.v11Resource?.(u)||'',bw/2+14,top+4)}ctx.textAlign='center';ctx.font='12px Microsoft YaHei';");
 s=s.replaceAll('十一英雄','十四英雄').replaceAll('11 名英雄','14 名英雄');return s;
});
for(let f of ['dist/index.html','test-harness.cjs'])edit(f,s=>s.replace(f.endsWith('html')?'<script src="heroes-v9.js"></script>':"'heroes-v9'",f.endsWith('html')?'<script src="heroes-v9.js"></script><script src="heroes-v11.js"></script>':"'heroes-v9','heroes-v11'"));
