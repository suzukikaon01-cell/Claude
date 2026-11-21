const fs=require('fs');
function edit(file,fn){fs.writeFileSync(file,fn(fs.readFileSync(file,'utf8')))}
function replace(s,a,b){if(!s.includes(a))throw Error('Missing anchor: '+a.slice(0,90));return s.replace(a,b)}
edit('dist/heroes-v9.js',s=>replace(s,'alive=t=>t&&t.hp>0&&!t.death','alive=t=>t&&t.hp>0&&!(t.death>0)'));
edit('dist/game.js',s=>replace(s,'if(u.death<=0){u.x=base[u.team].x','if(u.death<=0){u.death=0;u.x=base[u.team].x'));
edit('dist/champion-mechanics.js',s=>{
 s=replace(s,' function abilityCost(u,i)',` function abilityLearned(u,i){return u.skillRanks[i]>0||!!heroHooks[u.hero]?.canCastUnlearned?.(u,i)}
 function abilityCooldownRemaining(u,i){return heroHooks[u.hero]?.cooldownRemaining?.(u,i,u.cd[i])??u.cd[i]}
 function abilityCooldown(u,i){let skill=u.skills[i],base=heroHooks[u.hero]?.cooldown?.(u,i,rank(u,i,'cd')||0)??rank(u,i,'cd')??0;return R.cooldown(base,skill.ignoreHaste?0:(api.runeEffects?.abilityHaste?.(u,i)??u.abilityHaste??u.haste??0))*(u.blueBuffUntil>now()?.9:1)}
 function abilityCost(u,i)`);
 s=replace(s,'buffer&&u.player&&u.skillRanks[i]>0&&u.cd[i]<=.12','buffer&&u.player&&abilityLearned(u,i)&&abilityCooldownRemaining(u,i)<=.12');
 s=replace(s,"if(!u.skillRanks[i])return fail(u,'请先点 + 学习技能');if(u.cd[i]>0)","if(!abilityLearned(u,i))return fail(u,'请先点 + 学习技能');if(abilityCooldownRemaining(u,i)>0)");
 s=s.replaceAll('buffer&&u.player&&u.cd[i]<=.12','buffer&&u.player&&abilityCooldownRemaining(u,i)<=.12');
 s=replace(s,'u.mp<abilityCost(u,i)||u.cd[i]>1e-9','u.mp<abilityCost(u,i)||abilityCooldownRemaining(u,i)>1e-9');
 const old="u.cd[i]=R.cooldown(heroHooks[u.hero]?.cooldown?.(u,i,rank(u,i,'cd')||0)??rank(u,i,'cd')??0,s.ignoreHaste?0:(api.runeEffects?.abilityHaste?.(u,i)??u.abilityHaste??u.haste??0));if(u.blueBuffUntil>now())u.cd[i]*=.9;";
 s=replace(s,old,'e.previousCooldown=u.cd[i];u.cd[i]=abilityCooldown(u,i);');
 s=replace(s,'function describe(u,i){let s=',"function describe(u,i){let custom=heroHooks[u.hero]?.describe?.(u,i);if(custom)return custom;let s=");
 s=replace(s,"return lines.join('\\n')}","let extra=heroHooks[u.hero]?.describeExtra?.(u,i);if(extra)lines.push(extra);return lines.join('\\n')}");
 s=replace(s,'const api={heroHooks,','const api={abilityLearned,abilityCooldownRemaining,abilityCooldown,heroHooks,');return s;
});
edit('dist/heroes-v11.js',s=>{
 s=replace(s,"queue:[],lastAbsorb:now()","queue:[],lastAmmoUse:now(),lastAbsorb:now()");
 s=replace(s,"function reload(u,capacity,duration){let z=state(u);if(z.ammo<=0&&!z.reloadUntil)","function reload(u,capacity,duration,idleDelay=Infinity){let z=state(u);z.lastAmmoUse??=now();if((z.ammo<=0||z.ammo<capacity&&now()+1e-9>=z.lastAmmoUse+idleDelay&&!u.pendingAttack)&&!z.reloadUntil)");
 s=replace(s,"v11Data:{kind,params:pp,damage,rank:u.skillRanks[c.i]}","v11Data:{kind,params:pp,damage,healing:kind==='ana-grenade'?rank(u,2,'healing')+pp.heal_ap_ratio*u.ap:0,rank:u.skillRanks[c.i]}");
 s=replace(s,"if(kind==='ana-grenade'){for(let t of m.nearby(position,pp.radius,t=>live(t)&&['hero','minion','monster'].includes(t.type)&&!t.tentacle))", "if(kind==='ana-grenade'){for(let t of m.nearby(position,pp.radius,t=>live(t)&&t.type==='hero'))");
 s=replace(s,"if(t.type==='hero')core.apply(t,'ANA_HEAL_AMP',pp.duration,u,{amount:pp.healing_amp,tenacity:false,uniqueKey:'ana-heal-amp'})", "core.apply(t,'ANA_HEAL_AMP',pp.duration,u,{amount:pp.healing_amp,tenacity:false,uniqueKey:'ana-heal-amp'});m.heal(t,data.healing,u,{event:e,abilityId:2})");
 s=replace(s,"let z=state(u);z.ammo--;if(p.anaScope)","let z=state(u);z.ammo--;z.lastAmmoUse=now();if(p.anaScope)");
 s=replace(s,'reload(u,pp.ammo_capacity,pp.reload_duration);if(z.scopeUntil','reload(u,pp.ammo_capacity,pp.reload_duration,pp.idle_reload_delay);if(z.scopeUntil');
 s=replace(s,'u.cd[3]=z.savedRcd||0;z.callUntil','u.cd[3]=e.previousCooldown||0;z.callUntil');
 s=replace(s,'z.savedRcd=u.cd[3];u.cd[3]=0','');
 s=replace(s,"m.heroHooks.dva={isMelee:","m.heroHooks.dva={canCastUnlearned:(u,i)=>i===3&&state(u).form==='pilot',cooldownRemaining:(u,i,value)=>i===3&&state(u).form==='pilot'?0:value,describe(u,i){if(i===3&&state(u).form==='pilot')return '呼叫机甲：驾驶员形态自动开放，无需达到6级或学习R。充能 '+Math.floor(state(u).charge)+'/'+P(u).P.charge_max+'；满充能引导'+P(u).P.call_duration+'秒，恢复'+Math.round(P(u).P.call_hp_ratio*100)+'%机甲生命。自毁冷却独立保留。'},isMelee:");
 s=replace(s,' function barrier(u,t,i,e)',` function shieldCharge(u,i){let z=state(u);z.shieldCharges??={};return z.shieldCharges[i]??={available:rank(u,i,'max_charges'),remaining:0}}
 function spendShield(u,i){let c=shieldCharge(u,i);c.available--;if(c.remaining<=0)c.remaining=m.abilityCooldown(u,i);u.cd[i]=c.available>0?0:c.remaining;core.emit('AbilityChargeSpent',u,u,{abilityId:i,charges:c.available})}
 function tickShields(u,dt){for(let i of [1,2]){let c=shieldCharge(u,i),max=rank(u,i,'max_charges');if(c.available<max){c.remaining-=dt;while(c.remaining<=1e-9&&c.available<max){c.available++;if(c.available<max)c.remaining+=m.abilityCooldown(u,i);else c.remaining=0;core.emit('AbilityChargeRestored',u,u,{abilityId:i,charges:c.available})}}u.cd[i]=c.available>0?0:Math.max(0,c.remaining)}}
 function barrier(u,t,i,e)`);
 s=replace(s,"m.registerBehavior('zarya',(u,c,s,e)=>{if(c.i===0){state(u).ammo-=P(u).Q.ammo_cost;", "m.registerBehavior('zarya',(u,c,s,e)=>{if(c.i===1||c.i===2)spendShield(u,c.i);if(c.i===0){state(u).ammo-=P(u).Q.ammo_cost;state(u).lastAmmoUse=now();");
 s=replace(s,"m.heroHooks.zarya={isMelee:","m.heroHooks.zarya={cooldownRemaining:(u,i,value)=>i===1||i===2?(shieldCharge(u,i).available>0?0:Math.max(0,shieldCharge(u,i).remaining)):value,describeExtra(u,i){if(i===1||i===2){let c=shieldCharge(u,i);return '储存 '+c.available+'/'+rank(u,i,'max_charges')+' 次；'+(c.remaining>0?'下一次充能 '+c.remaining.toFixed(1)+' 秒':'充能已满')+'。W与E独立恢复，每次恢复一层。'}},isMelee:");
 s=replace(s,"z.ammo=Math.max(0,z.ammo-pp.ammo_per_second*pp.beam_interval);reload", "z.ammo=Math.max(0,z.ammo-pp.ammo_per_second*pp.beam_interval);z.lastAmmoUse=now();reload");
 s=replace(s,"validate(u,i,p){if(i===0&&(state(u).reloadUntil", "validate(u,i,p){if((i===1||i===2)&&shieldCharge(u,i).available<=0)return false;if(i===0&&(state(u).reloadUntil");
 s=replace(s,'reload(u,pp.P.ammo_capacity,pp.P.reload_duration);if(now()>z.lastAbsorb','reload(u,pp.P.ammo_capacity,pp.P.reload_duration,pp.P.idle_reload_delay);if(now()>z.lastAbsorb');
 s=replace(s,'reset(u){u.v11State=null}};\n core.on', 'reset(u){let charges=state(u).shieldCharges;u.v11State=null;state(u).shieldCharges=charges}};\n core.on');
 s=replace(s,'m.v11WorldTick=(dt=1/60)=>{for(let u of units()){','m.v11WorldTick=(dt=1/60)=>{for(let u of units()){if(u.hero===\'zarya\')tickShields(u,dt);');
 s=replace(s,'m.v11={state,eject,callMech,explode}','m.v11={state,eject,callMech,explode,shieldCharge}');return s;
});
