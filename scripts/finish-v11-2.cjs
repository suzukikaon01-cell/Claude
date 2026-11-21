const fs=require('fs');function edit(f,fn){fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')))}function replace(s,a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,80));return s.replace(a,b)}
edit('config/v11-definition.json',s=>{let d=JSON.parse(s);d.ana.P.idle_reload_delay=3;Object.assign(d.ana.skills[2].params,{radius:175,base_damage:[50,75,100,125,150],bonus_ad_ratio:0,healing:[50,75,100,125,150],heal_ap_ratio:.5});d.dva.P.pilot_r_auto_unlocked=1;d.zarya.P.idle_reload_delay=3;for(let i of [1,2])Object.assign(d.zarya.skills[i].params,{shield:[70,90,110,130,150],ap_ratio:.12,max_charges:3});return JSON.stringify(d,null,2)});
edit('scripts/config-model.cjs',s=>replace(s,"C.specVersion='V11.1'","C.heroes.dva.skills[1].cone=C.heroParams.dva.W.angle*Math.PI/180;C.specVersion='V11.2'"));
edit('scripts/config-loader.cjs',s=>replace(s,"if(errors.length){let e=", "for(let id of ['ANA','ZARYA'])positive(id,'P','idle_reload_delay');for(let g of ['W','E'])positive('ZARYA',g,'max_charges',true,10);if(errors.length){let e="));
edit('dist/heroes-v11.js',s=>replace(s,"i===3&&state(u).form==='pilot',cooldownRemaining", "i===3&&state(u).form==='pilot'&&!!P(u).P.pilot_r_auto_unlocked,cooldownRemaining"));
edit('dist/champion-mechanics.js',s=>replace(s,"(u.hero==='lux'?s.apRatio*u.ap:s.bonusHpRatio*u.bonusHp)","((s.apRatio||0)*u.ap+(s.bonusHpRatio||0)*u.bonusHp)"));
edit('dist/game.js',s=>{
 let start=s.indexOf(" document.querySelectorAll('.skill').forEach((b,i)=>{let rank="),end=s.indexOf(" document.querySelectorAll('[data-upgrade]')",start);if(start<0||end<0)throw Error('HUD boundary');
 let body=` document.querySelectorAll('.skill').forEach((b,i)=>{let rank=player.skillRanks[i],pilot=player.hero==='dva'&&player.v11State?.form==='pilot',call=pilot&&i===3,charges=player.hero==='zarya'&&(i===1||i===2)?mechanics.v11.shieldCharge(player,i):null;
 b.querySelector('.cd').textContent=call?(player.v11State.callUntil>time?'召唤中':player.v11State.charge>=C.heroParams.dva.P.charge_max?'呼叫机甲':Math.floor(player.v11State.charge)+'%'):rank===0?'未学':pilot?'机甲限定':player.hero==='ashe'&&i===2&&player.charges===0?'充能':mechanics.abilityCooldownRemaining(player,i)>0?Math.ceil(mechanics.abilityCooldownRemaining(player,i)):player.silence>0?'沉默':player.pendingCast?.i===i?'施法':'';
 b.classList.toggle('evolved',!!player.evolutions?.[i]);b.querySelector('.skill-rank').textContent=call?'自动开放':(player.evolutions?.[i]?'◆ ':'')+'•'.repeat(rank);
 if(charges&&rank)b.querySelector('.skill-rank').textContent='•'.repeat(rank)+' '+charges.available+'/'+C.heroParams.zarya['QWER'[i]].max_charges;
 b.querySelector('.skill-mana').textContent=charges&&rank?(charges.remaining>0?'充能 '+Math.ceil(charges.remaining)+'秒':''):skillValue(player,i,'mana');b.title=mechanics.describe(player,i);b.style.opacity=player.mp<skillValue(player,i,'mana')?'.45':'1';});
`;
 s=s.slice(0,start)+body+s.slice(end);
 s=replace(s,'function drawOverlay(u){',"function drawAntihealOutline(u,bw,top,height=9){if(u.type==='hero'&&mechanics.core.statuses(u,'HEAL_REDUCTION').some(s=>s.amount>=1)){ctx.strokeStyle='#bc65f0';ctx.lineWidth=2/view.scale;ctx.strokeRect(-bw/2-1,top-1,bw+2,height)}}\nfunction drawOverlay(u){");
 s=replace(s,"if(u.hero==='yasuo'&&(u.championState?.flow||0)>=100)","drawAntihealOutline(u,bw,top);if(u.hero==='yasuo'&&(u.championState?.flow||0)>=100)");
 s=replace(s,"let bw=u.type==='nexus'?105", "let bw=u.type==='nexus'?105");
 s=replace(s,"if(u.type==='hero'){ctx.fillStyle='#0005';", "drawAntihealOutline(u,bw,by,7);if(u.type==='hero'){ctx.fillStyle='#0005';");return s;
});
edit('dist/index.html',s=>s.replace('十四英雄 · V11.1','十四英雄 · V11.2'));
