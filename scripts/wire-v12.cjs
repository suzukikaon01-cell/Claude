const fs=require('fs');if(fs.readFileSync('dist/game.js','utf8').includes('modeRuntime=createModeRuntime'))throw Error('V12已经接入；请直接编辑对应模块，不要重复运行一次性接线脚本');
function edit(p,fn){let s=fs.readFileSync(p,'utf8'),r=(a,b)=>{if(!s.includes(a)&&s.includes(b))return;if(!s.includes(a))throw Error(p+' missing '+a.slice(0,90));s=s.replace(a,b)};fn(r,()=>s,v=>s=v);fs.writeFileSync(p,s)}
edit('dist/index.html',r=>{r('<script src="tower-layout.js"></script>','<script src="tower-layout.js"></script><script src="modes-v12.js"></script>');r('<script src="items-v6.js"></script>','<script src="items-v6.js"></script><script src="items-v12.js"></script>');r('<div id="heroCards"></div>','<div class="mode-picker"><button id="modeSR" aria-pressed="true">召唤师峡谷 5v5</button><button id="modeARAM" aria-pressed="false">极地大乱斗 5v5</button><label><input id="aramFixed" type="checkbox">自选练习</label></div><div id="aramSelection" class="hidden"></div><div id="heroCards"></div>');r('<div id="v8Tools">','<div id="v8Tools"><button id="portalBtn" class="hidden">冰霜传送门</button><div id="itemActives"></div>');r('十四英雄 · V11.2','十四英雄 · V12')});
edit('dist/game.js',(r,get,set)=>{
 r("base=C.map.bases,teamColor=","teamColor=");r('const paths=C.map.paths;','let paths=C.map.paths,base=C.map.bases,selectedMode=\'SR\',modeRuntime;');r('const laneSamples=','let laneSamples=');
 r("function setup(){lastShopView=", "function setup(){activateModeMap();lastShopView=");
 r(" for(let team=0;team<2;team++){units.push(structure", " if(!GameModes.isARAM())for(let team=0;team<2;team++){units.push(structure");
 r(" mechanics.reset();runeEffects?.reset();player=hero", " if(GameModes.isARAM())spawnARAMStructures();modeRuntime?.reset();mechanics.reset();runeEffects?.reset();player=hero");
 r("for(let i=0;i<4;i++)hero(ids[(i+3)%ids.length],0,[0,1,2,2][i]);for(let i=0;i<5;i++)hero(Object.keys(C.heroes)[(i+3)%Object.keys(C.heroes).length],1,[0,1,2,0,2][i]);", "if(GameModes.isARAM()){let s=GameModes.selection||GameModes.prepare(rand,selected);for(let id of s.allies)hero(id,0,0);for(let id of s.enemies)hero(id,1,0)}else{for(let i=0;i<4;i++)hero(ids[(i+3)%ids.length],0,[0,1,2,2][i]);for(let i=0;i<5;i++)hero(Object.keys(C.heroes)[(i+3)%Object.keys(C.heroes).length],1,[0,1,2,0,2][i]);}");
 r(' spawnBuffs();cameraOffset=', ' if(!GameModes.isARAM())spawnBuffs();cameraOffset=');
 r('recalc(u);itemEffects?.sync(u);if(!isPlayer)autoLearn(u);', 'recalc(u);modeRuntime?.init(u);itemEffects?.sync(u);if(!isPlayer)autoLearn(u);');
 r("function towerProtected(u){return ","function towerProtected(u){if(GameModes.isARAM())return modeRuntime.structureProtected(u);return ");
 r("function nexusProtected(team){return ","function nexusProtected(team){if(GameModes.isARAM())return modeRuntime.structureProtected({type:'nexus',team});return ");
 r("function enemyStructures(u){return ","function enemyStructures(u){if(GameModes.isARAM())return units.filter(v=>v.team!==u.team&&alive(v)&&['tower','nexus','inhibitor'].includes(v.type)&&!modeRuntime.structureProtected(v)).sort((a,b)=>dist(u,a)-dist(u,b));return ");
 r("function recall(){if(","function recall(){if(GameModes.isARAM()){toast('极地大乱斗无法普通回城');return}if(");
 r('function canShop(){return ', 'function canShop(){if(GameModes.isARAM())return modeRuntime.canShop(player);return ');
 r('u.death=9+u.level*1.2;', 'u.death=GameModes.isARAM()?modeRuntime.deathTime():9+u.level*1.2;');
 r("}else if(u.type==='tower'){splitGold", "}else if(u.type==='inhibitor'){u.respawnAt=time+C.aram.inhibitor_respawn;toast('水晶兵营已被摧毁 · 敌方超级兵出动')}else if(u.type==='tower'){modeRuntime.rubble(u);splitGold");
 r('mechanics.clearTransient(u);u.hp=u.maxHp;', 'mechanics.clearTransient(u);if(GameModes.isARAM())modeRuntime.respawn(u);u.hp=u.maxHp;');
 r('u.gold+=C.passiveGold*dt;', 'u.gold+=(GameModes.isARAM()?(time>=C.aram.passive_gold_start?C.aram.passive_gold_per_second:0):C.passiveGold)*dt;');
 r("tickCast(u,dt);tickAttack(u,dt);", "modeRuntime.tickHero(u,dt);tickCast(u,dt);tickAttack(u,dt);");
 r('if(dist(u,base[u.team])<250)', 'if(!GameModes.isARAM()&&dist(u,base[u.team])<250)');
 r('u.xp+=xp*(C.experienceMultiplier||1);', 'u.xp+=xp*(C.experienceMultiplier||1)*(GameModes.isARAM()?C.aram.kill_xp_multiplier:1);');
 r("function spawnWave(){let n=", "function spawnWave(){if(GameModes.isARAM()){spawnARAMWave();return}let n=");
 r('function blocked(x,y,r=20){if(', 'function blocked(x,y,r=20){if(GameModes.blocked(x,y,r))return true;if(');
 r('itemEffects?.tick?.(dt);runeEffects', 'modeRuntime.worldTick();itemEffects?.tick?.(dt);runeEffects');
 r('drawAim();drawCombatV8();', 'modeRuntime.draw(ctx,time);drawAim();drawCombatV8();');
 r('mc.drawImage(mapCache,0,0,C.world,C.world);', 'mc.drawImage(mapCache,0,0,C.world,C.world);modeRuntime.minimap(mc);');
 r("return MatchCheckpoint.save({configVersion:","return MatchCheckpoint.save({modeId:selectedMode,modeState:modeRuntime.exportState(),configVersion:");
 r('selected=saved.selected;difficulty=',"selectedMode=saved.modeId||'SR';selected=saved.selected;difficulty=");
 r('mechanics.restoreState(saved.mechanics);', 'modeRuntime.restore(saved.modeState);mechanics.restoreState(saved.mechanics);');
 r("if(u.type==='tower')Object.assign(u,C.map.towerPoint(u.lane,u.team,u.tier));", "if(u.type==='tower')Object.assign(u,C.map.towerPoint(u.lane,u.team,u.tier));");
 r('initUI();initV8UI();drawMap();', 'modeRuntime=createModeRuntime({time:()=>time,units:()=>units,gainXp,blocked,line,ring},mechanics);initModeUI();initUI();initV8UI();drawMap();');
 r("$('startBtn').onclick=()=>start();", "$('startBtn').onclick=()=>{if(GameModes.isARAM()&&GameModes.selection)selected=GameModes.selection.chosen;start()};");
 r("selected=b.dataset.hero;initUI();setup();", "selected=b.dataset.hero;if(GameModes.isARAM()){GameModes.prepare(rand,selected);renderARAMSelection()}initUI();setup();");
 r('function drawMap(){mapCache=', 'function drawMap(){mapCache=');
 r("$('autoLabel').textContent=attackHeld?", "updateModeHUD();$('autoLabel').textContent=attackHeld?");
 r("function drawOverlay(u){", "function drawOverlay(u){");

 // The extra mode functions share the existing factories and fixed-step loop.
 let pos=get().indexOf('function setup()');set(get().slice(0,pos)+fs.readFileSync('scripts/v12-game-functions.txt','utf8')+'\n'+get().slice(pos));
});
edit('test-harness.cjs',r=>{r("'items-v6','runes-v8'","'items-v6','items-v12','runes-v8'");r("'world','tower-layout'","'world','tower-layout','modes-v12'");r("reset(id='zero',full=false){selected=id;", "get mode(){return modeRuntime},reset(id='zero',full=false,mode='SR'){selectedMode=mode;selected=id;");});
edit('dist/terrain.js',r=>r('window.createRiftGround=function(C){','window.createRiftGround=function(C){if(C.gameModeId===\'ARAM\')return createARAMGround(C);'));
edit('dist/champion-mechanics.js',r=>{r("'tower','nexus'].includes(t.type)","'tower','nexus','inhibitor'].includes(t.type)");r("amount*=1-Math.min(1,exhaustion);", "amount*=1-Math.min(1,exhaustion);if(window.GameModes&&source?.hero)amount*=GameModes.balance(source,'damage_dealt_multiplier');");r('let value=Math.max(0,amount)*',"let value=Math.max(0,amount)*");r("if(type!=='true'&&target.guard>0)", "if(window.GameModes&&target.hero)value*=GameModes.balance(target,'damage_taken_multiplier');if(type!=='true'&&target.guard>0)");r('amount*=1+Math.max(0,...core.statuses',"if(window.GameModes&&u.hero)amount*=GameModes.balance(u,'healing_multiplier');amount*=1+Math.max(0,...core.statuses");r('amount=api.itemEffects?.shieldAmount',"if(window.GameModes&&u.hero)amount*=GameModes.balance(u,'shield_multiplier');amount=api.itemEffects?.shieldAmount");r("return R.cooldown(base,skill.ignoreHaste?0:","return R.cooldown(base,skill.ignoreHaste?0:");r("??u.haste??0))*(u.blueBuffUntil", "??u.haste??0)+(api.itemEffects?.additionalHaste?.(u,i)||0)+(window.GameModes?GameModes.balance(u,'ability_haste_modifier'):0))*(u.blueBuffUntil");});
console.log('Wired V12 modules');
