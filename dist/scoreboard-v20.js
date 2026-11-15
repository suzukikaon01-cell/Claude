/* V20 对局中面板：双方英雄的等级、KDA、补刀、经济、装备、召唤师技能、阵亡倒计时，
 * 以及双方击杀数、总经济和小龙/大龙刷新计时。按 Tab、点顶部比分条或顶栏「战绩」按钮打开，不暂停游戏。 */
(()=>{'use strict';
const doc=document,bar=doc.querySelector('.header-actions');if(!bar||doc.getElementById('scoreBtn'))return;
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mmss=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const kfmt=v=>v>=10000?(v/1000).toFixed(1)+'K':String(Math.round(v));
const css=`#scorePanel{position:absolute;inset:0;z-index:12;display:flex;align-items:flex-start;justify-content:center;padding:10px;background:#050b12b8;backdrop-filter:blur(3px);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y}
#scorePanel.hidden{display:none}
.sp-card{margin:auto;width:min(1180px,100%);background:linear-gradient(180deg,#101d29f5,#0a131cf7);border:1px solid #c9a24f66;border-top:2px solid #c9a24faa;border-radius:8px;box-shadow:0 18px 60px #000a;color:#dfe8ee;font-size:13px}
.sp-head{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:10px 14px;border-bottom:1px solid #c9a24f44}
.sp-timers{display:flex;flex-direction:column;gap:2px;font-weight:700;font-size:13px}.sp-timers .drag{color:#ffb15c}.sp-timers .baron{color:#c08cff}
.sp-score{text-align:center}.sp-score .nums{font:800 30px/1 Georgia,serif;letter-spacing:2px}.sp-score .blue{color:#5fb8ff}.sp-score .red{color:#ff5a5a}.sp-score .vs{color:#c9a24f;margin:0 14px;font-size:20px}
.sp-score .gold{display:flex;justify-content:center;gap:28px;margin-top:4px;font-size:13px;color:#e9d49a}
.sp-close{justify-self:end;width:38px;height:38px;border:1px solid #c9a24f88;border-radius:6px;background:#0d1a24;color:#f1e3bd;font-size:20px}
.sp-body{display:grid;grid-template-columns:1fr 1fr;gap:0}.sp-col{padding:6px}.sp-col.red{border-left:2px solid #ff5a5a55}.sp-col.blue{border-right:2px solid #5fb8ff55}
.sp-row{display:grid;grid-template-columns:auto 52px 1fr;gap:8px;align-items:center;padding:7px 8px;margin:4px 0;border-radius:6px;background:#ffffff07}
.sp-row.me{background:linear-gradient(90deg,#2f6f9a55,#ffffff07);outline:1px solid #5fb8ff66}
.sp-spells{display:flex;flex-direction:column;gap:4px}.sp-spells span{width:22px;height:22px;border-radius:4px;display:grid;place-items:center;background:#1c2d3b;border:1px solid #6d879a;font-size:12px;font-weight:700;color:#f3e7c4;position:relative}.sp-spells span i{position:absolute;inset:0;display:grid;place-items:center;background:#000a;font-style:normal;font-size:10px;color:#fff}
.sp-face{position:relative;width:52px;height:52px;border-radius:50%;overflow:visible;border:2px solid #5fb8ff;background:#152532}.sp-col.red .sp-face{border-color:#ff5a5a}.sp-face>:first-child{width:100%!important;height:100%!important;display:block;object-fit:cover;border-radius:50%;overflow:hidden}.sp-dead{border-radius:50%}
.sp-face svg{width:100%;height:100%}.sp-lv{position:absolute;left:-2px;bottom:-2px;min-width:20px;height:20px;padding:0 3px;border-radius:10px;background:#0b141d;border:1px solid #c9a24f;font-size:11px;font-weight:800;color:#f3e7c4;display:grid;place-items:center}
.sp-dead{position:absolute;inset:0;display:grid;place-items:center;background:#000b;color:#ff6b6b;font-weight:800;font-size:17px}
.sp-info{min-width:0}.sp-top{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.sp-name{font-weight:700;color:#f3e7c4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:9em}.sp-sub{color:#9fb2bd;font-size:12px}
.sp-kda{font-weight:800;font-size:15px;color:#fff;margin-left:auto}.sp-gold{color:#e9d49a;font-weight:700}.sp-cs{color:#9fb2bd;font-size:12px}
.sp-items{display:flex;gap:4px;margin-top:5px}.sp-items span{width:30px;height:30px;border-radius:4px;border:1px solid #33485a;background:#0c1720;display:grid;place-items:center;overflow:hidden;font-size:14px;color:#f3e7c4}.sp-items img{width:100%;height:100%;object-fit:cover}
@media(max-width:820px),(max-height:480px){.sp-card{font-size:11px}.sp-row{grid-template-columns:auto 40px 1fr;padding:5px;gap:6px;margin:3px 0}.sp-face{width:40px;height:40px}.sp-items span{width:22px;height:22px;font-size:11px}.sp-spells span{width:18px;height:18px}.sp-score .nums{font-size:22px}.sp-head{padding:6px 10px}.sp-kda{font-size:13px}.sp-name{max-width:6em}}
@media(max-width:560px){.sp-body{grid-template-columns:1fr}.sp-col.blue{border-right:0}.sp-col.red{border-left:0;border-top:2px solid #ff5a5a55}}
.scoreboard{pointer-events:auto!important;cursor:pointer}`;
let st=doc.createElement('style');st.textContent=css;doc.head.appendChild(st);
let panel=doc.createElement('div');panel.id='scorePanel';panel.className='hidden';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','对局面板');(doc.getElementById('arena')||doc.body).appendChild(panel);
let btn=doc.createElement('button');btn.id='scoreBtn';btn.textContent='战绩';btn.setAttribute('aria-label','对局面板');bar.insertBefore(btn,bar.querySelector('#helpBtn')||null);
let timer=null;
function itemCost(d,id){return d.items(id)?.cost||0}
function spells(d,u){return '<div class="sp-spells">'+(u.summoners||[]).slice(0,2).map(id=>{let s=d.summoners[id]||{},cd=u===d.player||u.team===d.player?.team?Math.max(0,id==='smite'?0:(u.summonerState?.cooldownEnds?.[id]||0)-d.time):0;return '<span title="'+esc(s.name||id)+'">'+esc(s.icon||'·')+(cd>0.5?'<i>'+Math.ceil(cd)+'</i>':'')+'</span>'}).join('')+'</div>'}
function row(d,u){let h=d.heroes[u.hero]||{},items=(u.items||[]).map(x=>typeof x==='string'?x:x?.id),worth=(u.gold||0)+items.reduce((n,id)=>n+itemCost(d,id),0),slots='';
 for(let i=0;i<6;i++){let id=items[i],it=id&&d.items(id);slots+='<span title="'+esc(it?.name||'')+'">'+(it?d.itemIcon(it):'')+'</span>'}
 let dead=u.death>0?'<div class="sp-dead">'+Math.ceil(u.death)+'</div>':'';
 return {worth,html:'<div class="sp-row'+(u===d.player?' me':'')+'">'+spells(d,u)+'<div class="sp-face">'+d.portrait(u.hero)+'<div class="sp-lv">'+(u.level||1)+'</div>'+dead+'</div><div class="sp-info"><div class="sp-top"><span class="sp-name">'+esc(h.name||u.hero)+(u===d.player?'（你）':'')+'</span><span class="sp-sub">'+esc(h.title||'')+'</span><span class="sp-kda">'+(u.k||0)+' / '+(u.d||0)+' / '+(u.a||0)+'</span></div><div class="sp-top"><span class="sp-gold">◈ '+kfmt(worth)+'</span><span class="sp-cs">补刀 '+(u.cs||0)+'</span></div><div class="sp-items">'+slots+'</div></div></div>'}}
function campTimer(d,kinds,label,cls){let c=d.camps.filter(c=>kinds.includes(c.kind));if(!c.length)return '';let alive=c.some(c=>c.alive),next=Math.min(...c.filter(c=>!c.alive).map(c=>c.nextSpawn??Infinity));return '<span class="'+cls+'">'+label+' '+(alive?'已刷新':Number.isFinite(next)?mmss(next-d.time):'—')+'</span>'}
function render(){let d=window.RiftArena?.panel?.();if(!d||!d.player){panel.innerHTML='';return}
 let me=d.player.team,heroes=d.units.filter(u=>u.type==='hero'&&u.team<2&&!u.clone&&!u.dvaBomb&&!u.spiritOwner),cols=[me,1-me].map(team=>{let rows=heroes.filter(u=>u.team===team).sort((a,b)=>(b===d.player)-(a===d.player)).map(u=>row(d,u));return {team,html:rows.map(r=>r.html).join(''),gold:rows.reduce((n,r)=>n+r.worth,0)}});
 let blue=cols[0],red=cols[1];
 panel.innerHTML='<div class="sp-card"><div class="sp-head"><div class="sp-timers">'+campTimer(d,['dragon'],'小龙','drag')+campTimer(d,['void'],'大龙','baron')+'</div><div class="sp-score"><div class="nums"><span class="blue">'+(d.kills[me]||0)+'</span><span class="vs">VS</span><span class="red">'+(d.kills[1-me]||0)+'</span></div><div class="gold"><span>◈ '+kfmt(blue.gold)+'</span><span>'+mmss(d.time)+'</span><span>◈ '+kfmt(red.gold)+'</span></div></div><button class="sp-close" aria-label="关闭">✕</button></div><div class="sp-body"><div class="sp-col blue">'+blue.html+'</div><div class="sp-col red">'+red.html+'</div></div></div>';
 panel.querySelector('.sp-close').onclick=close}
function open(){if(!window.RiftArena?.panel?.()?.player)return;panel.classList.remove('hidden');render();clearInterval(timer);timer=setInterval(render,500)}
function close(){panel.classList.add('hidden');clearInterval(timer);timer=null}
const toggle=()=>panel.classList.contains('hidden')?open():close();
btn.addEventListener('click',toggle);
doc.querySelector('.scoreboard')?.addEventListener('click',toggle);
panel.addEventListener('click',e=>{if(e.target===panel)close()});
doc.addEventListener('keydown',e=>{if(e.key==='Tab'&&!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||'')){e.preventDefault();if(!e.repeat)toggle()}else if(e.key==='Escape'&&!panel.classList.contains('hidden')){close();e.stopImmediatePropagation()}},true);
window.ScoreboardV20={open,close,render};
})();
