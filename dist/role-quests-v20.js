// V20 分路任务：峡谷 5v5 中每个分路有一个专属任务，完成后获得对应奖励。
// 上单：补刀 + 参与击杀；打野：击杀野怪；中单：补刀 + 参与击杀（解锁三级鞋）；AD：补刀；辅助：助攻。
(function(){
const ROLE_NAME={top:'上单',jungle:'打野',mid:'中单',adc:'AD',support:'辅助'};
const QUESTS={
 top:{name:'孤胆巨人',goals:[['cs',90,'补刀'],['ka',2,'参与击杀']],reward:'+350 金币 · 最大生命 +300 · 护甲/魔抗 +10',apply:u=>{u.gold+=350;u.baseStats.hp+=300;u.baseStats.armor+=10;u.baseStats.mr+=10}},
 jungle:{name:'野区之主',goals:[['monsters',30,'击杀野怪']],reward:'+350 金币 · 攻击力 +12 · 法术强度 +18 · 移速 +15',apply:u=>{u.gold+=350;u.baseStats.attack+=12;u.baseStats.ap+=18;u.baseStats.speed+=15}},
 mid:{name:'中路统御',goals:[['cs',100,'补刀'],['ka',2,'参与击杀']],reward:'+350 金币 · 解锁三级鞋 · 法术强度 +20',apply:u=>{u.gold+=350;u.midQuestCompleted=true;u.baseStats.ap+=20}},
 adc:{name:'火力核心',goals:[['cs',110,'补刀']],reward:'+400 金币 · 攻击力 +15',apply:u=>{u.gold+=400;u.baseStats.attack+=15}},
 support:{name:'守望者',goals:[['a',4,'助攻']],reward:'+400 金币 · 最大生命 +200 · 移速 +15',apply:u=>{u.gold+=400;u.baseStats.hp+=200;u.baseStats.speed+=15}}
};
let attached=null,lastUnits=null;
function val(u,k){return k==='cs'?(u.cs||0):k==='ka'?(u.k||0)+(u.a||0):k==='a'?(u.a||0):k==='monsters'?(u.roleMonsters||0):0}
function attach(core){if(!core||attached===core)return;attached=core;core.on('UnitKilled',e=>{let us=lastUnits||[],src=us.find(v=>v.id===e.sourceId),tgt=us.find(v=>v.id===e.targetId);if(tgt?.monsterId&&src?.type==='hero')src.roleMonsters=(src.roleMonsters||0)+1})}
function progress(u){let q=QUESTS[u.role];return q?q.goals.map(([k,n,l])=>({label:l,have:Math.min(n,val(u,k)),need:n})):[]}
function tick(d){if(!d?.units)return;lastUnits=d.units;attach(d.core);for(let u of d.units){if(u.type!=='hero'||!u.role||u.roleQuestDone)continue;let q=QUESTS[u.role];if(!q)continue;if(q.goals.every(([k,n])=>val(u,k)>=n)){u.roleQuestDone=true;q.apply(u);d.recalc?.(u);if(u.player)d.toast?.('分路任务完成「'+q.name+'」：'+q.reward)}}render(d)}
function render(d){let el=document.getElementById('roleQuest'),u=d.player;if(!u?.role||d.state!=='playing'&&d.state!=='paused'){if(el)el.style.display='none';return}
 if(!el){el=document.createElement('div');el.id='roleQuest';let mm=document.getElementById('minimap')?.getBoundingClientRect?.();el.style.cssText='position:fixed;left:'+Math.round(mm&&mm.width?mm.left:18)+'px;top:'+Math.round(mm&&mm.height?mm.bottom+6:296)+'px;z-index:30;background:rgba(10,14,22,.78);border:1px solid rgba(201,170,94,.5);border-radius:8px;padding:6px 10px;font:12px/1.5 sans-serif;color:#e8e2cf;pointer-events:none;max-width:220px';document.body?.appendChild(el)}
 let q=QUESTS[u.role];el.style.display='';el.innerHTML='<b style="color:#e8c46a">'+ROLE_NAME[u.role]+'任务 · '+q.name+'</b>'+(u.roleQuestDone?'<div style="color:#7fe08a">已完成：'+q.reward+'</div>':progress(u).map(p=>'<div>'+p.label+' '+p.have+'/'+p.need+'</div>').join('')+'<div style="color:#9aa4b2">奖励：'+q.reward+'</div>')}
function lobby(){let sel=document.getElementById('roleSelect'),lab=document.getElementById('roleLabel');if(!sel)return;try{let v=localStorage.getItem('rift.role');if(v&&QUESTS[v])sel.value=v}catch(e){}sel.onchange=()=>{try{localStorage.setItem('rift.role',sel.value)}catch(e){}};
 let upd=id=>lab.classList.toggle('hidden',id!=='SR');for(let [b,id] of [['modeSR','SR'],['modeARAM','ARAM'],['modeTRAINING','TRAINING']])document.getElementById(b)?.addEventListener('click',()=>upd(id))}
window.RoleQuestsV20={QUESTS,tick,progress,attach};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lobby);else lobby();if(typeof setInterval==='function')setInterval(()=>{try{tick(window.RiftArena?.panel?.())}catch(e){}},500)}
})();
