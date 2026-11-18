/* V20 阵亡回放：玩家阵亡后可查看
 *  · 阵亡前10秒受到的伤害：来源 → 技能、命中次数、伤害、伤害类型、占比；击杀者与致命一击；
 *  · 同一时间段内自己造成的伤害（按目标与技能汇总）。
 * 只记录玩家自己英雄相关的伤害事件（事件驱动，不遍历全部单位）。 */
(()=>{'use strict';
const doc=document,WINDOW=10;
const COLOR={physical:'#ff9a3c',magic:'#5aa9ff',true:'#ffffff'},TYPE={physical:'物理',magic:'魔法',true:'真实'};
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const n0=v=>Math.round(v).toLocaleString();
let core=null,taken=[],dealt=[],recap=null,offs=[];
const P=()=>window.RiftArena?.panel?.();
function unitLabel(d,u){if(!u)return{name:'未知来源',kind:'other'};if(u.type==='hero')return{name:(d.heroes[u.hero]?.name||u.hero),kind:'hero',hero:u.hero,team:u.team};if(u.type==='tower')return{name:'防御塔',kind:'tower'};if(u.type==='nexus')return{name:'水晶枢纽',kind:'tower'};if(u.type==='minion')return{name:u.superMinion?'超级兵':'小兵',kind:'minion'};if(u.type==='monster')return{name:u.name||'野怪',kind:'monster'};return{name:u.name||u.type,kind:'other'}}
function skillName(d,src,e){if(e.itemId){let it=d.items(e.itemId);return (it?.name||e.itemId)+'（装备）'}if(e.runeProc)return '符文';let a=e.abilityId;if(typeof a==='string'&&a.startsWith('summoner'))return (d.summoners[a.split(':')[1]]?.name||'召唤师技能');if(e.basic||e.sourceType==='BASIC_ATTACK')return e.critical?'普攻（暴击）':'普攻';if(Number.isInteger(a)&&src?.skills?.[a])return src.skills[a].key+' '+src.skills[a].name;if(e.sourceType==='DAMAGE_OVER_TIME'||e.dot)return '持续伤害';return src?.type==='hero'?'技能':'攻击'}
function record(e){let d=P();if(!d?.player)return;let me=d.player;if(e.targetId!==me.id&&e.sourceId!==me.id)return;let amount=(e.amount||0)+(e.absorbed||0);if(!(amount>0))return;
 let src=d.units.find(u=>u.id===e.sourceId),tgt=d.units.find(u=>u.id===e.targetId);
 let row={at:e.time??d.time,amount,hp:e.amount||0,shield:e.absorbed||0,type:COLOR[e.damageType]?e.damageType:'physical',skill:skillName(d,src,e),src:unitLabel(d,src),tgt:unitLabel(d,tgt),srcId:e.sourceId,tgtId:e.targetId};
 if(e.targetId===me.id&&e.sourceId!==me.id)taken.push(row);if(e.sourceId===me.id&&e.targetId!==me.id)dealt.push(row);
 let cut=row.at-WINDOW-2;if(taken.length>400||taken[0]?.at<cut)taken=taken.filter(r=>r.at>=cut);if(dealt.length>400||dealt[0]?.at<cut)dealt=dealt.filter(r=>r.at>=cut)}
function onKilled(e){let d=P();if(!d?.player||e.targetId!==d.player.id)return;let at=e.time??d.time,from=at-WINDOW,tk=taken.filter(r=>r.at>=from),dl=dealt.filter(r=>r.at>=from);
 let killer=d.units.find(u=>u.id===e.sourceId),last=[...tk].reverse().find(r=>r.srcId===e.sourceId)||tk.at(-1);
 recap={at,killer:unitLabel(d,killer),killerHero:killer?.hero,blow:last?{skill:last.skill,amount:last.amount,type:last.type}:null,taken:tk,dealt:dl};btn.classList.remove('hidden')}
function attach(){let d=P();if(!d?.core||d.core===core)return;offs.forEach(f=>f?.());core=d.core;taken=[];dealt=[];offs=[core.on('DamageApplied',record),core.on('TemporalDamageAmplified',e=>record({...e,absorbed:0,temporalBonus:true})),core.on('UnitKilled',onKilled)]}
setInterval(attach,500);
function group(rows,keyOf){let m=new Map;for(let r of rows){let k=keyOf(r),g=m.get(k)||{key:k,total:0,rows:new Map,by:{physical:0,magic:0,true:0},sample:r};g.total+=r.amount;g.by[r.type]+=r.amount;let s=g.rows.get(r.skill+'|'+r.type)||{skill:r.skill,type:r.type,hits:0,total:0};s.hits++;s.total+=r.amount;g.rows.set(r.skill+'|'+r.type,s);m.set(k,g)}return [...m.values()].sort((a,b)=>b.total-a.total)}
function typeBar(by,total){if(!(total>0))return '';return '<div class="dr-bar">'+['physical','magic','true'].filter(t=>by[t]>0).map(t=>'<span style="width:'+(by[t]/total*100).toFixed(1)+'%;background:'+COLOR[t]+'" title="'+TYPE[t]+' '+n0(by[t])+'"></span>').join('')+'</div><div class="dr-legend">'+['physical','magic','true'].filter(t=>by[t]>0).map(t=>'<span style="color:'+COLOR[t]+'">'+TYPE[t]+' '+n0(by[t])+'（'+(by[t]/total*100).toFixed(0)+'%）</span>').join('')+'</div>'}
function section(title,rows,whoKey,whoLabel,total){let groups=group(rows,whoKey),by={physical:0,magic:0,true:0};for(let r of rows)by[r.type]+=r.amount;
 return '<div class="dr-sec"><div class="dr-sec-h">'+esc(title)+'<b>'+n0(total)+'</b></div>'+typeBar(by,total)+(groups.length?groups.map(g=>'<div class="dr-src"><div class="dr-src-h"><span>'+esc(whoLabel(g.sample))+'</span><b>'+n0(g.total)+'<small>（'+(g.total/total*100).toFixed(0)+'%）</small></b></div>'+[...g.rows.values()].sort((a,b)=>b.total-a.total).map(s=>'<div class="dr-row"><span class="dr-sk">'+esc(s.skill)+(s.hits>1?' ×'+s.hits:'')+'</span><span style="color:'+COLOR[s.type]+'">'+TYPE[s.type]+'伤害 '+n0(s.total)+'</span><span class="dr-pct">'+(s.total/total*100).toFixed(0)+'%</span></div>').join('')+'</div>').join(''):'<div class="dr-empty">无</div>')+'</div>'}
function render(){if(!recap){panel.innerHTML='';return}let r=recap,d=P(),tTot=r.taken.reduce((n,x)=>n+x.amount,0),dTot=r.dealt.reduce((n,x)=>n+x.amount,0);
 let face=r.killerHero&&d?.portrait?'<div class="dr-face">'+d.portrait(r.killerHero)+'</div>':'';
 panel.innerHTML='<div class="dr-card"><div class="dr-head">'+face+'<div class="dr-kill"><div class="dr-title">阵亡回放 <small>阵亡前'+WINDOW+'秒</small></div><div>击杀者：<b>'+esc(r.killer.name)+'</b></div>'+(r.blow?'<div>致命一击：<b>'+esc(r.blow.skill)+'</b> <span style="color:'+COLOR[r.blow.type]+'">'+TYPE[r.blow.type]+'伤害 '+n0(r.blow.amount)+'</span></div>':'')+'</div><button class="dr-close" aria-label="关闭">✕</button></div>'
  +section('受到的伤害',r.taken,x=>x.srcId,x=>x.src.name+(x.src.kind==='hero'?'':''),tTot)
  +section('你造成的伤害',r.dealt,x=>x.tgtId,x=>'→ '+x.tgt.name,dTot)+'</div>';
 panel.querySelector('.dr-close').onclick=close}
function open(){if(!recap)return;render();panel.classList.remove('hidden')}
function close(){panel.classList.add('hidden')}
const css=`#deathRecap{position:absolute;inset:0;z-index:13;display:flex;align-items:flex-start;justify-content:center;padding:10px;background:#050b12b8;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y}#deathRecap.hidden{display:none}
.dr-card{margin:auto;width:min(720px,100%);background:linear-gradient(180deg,#1a1216f5,#0c0f15f7);border:1px solid #ff6b6b66;border-top:2px solid #ff6b6baa;border-radius:8px;color:#dfe8ee;font-size:13px;box-shadow:0 18px 60px #000a}
.dr-head{display:flex;gap:12px;align-items:center;padding:12px 14px;border-bottom:1px solid #ff6b6b33}.dr-face{width:56px;height:56px;border-radius:50%;overflow:hidden;border:2px solid #ff6b6b;flex:none}.dr-face>*{width:100%!important;height:100%!important;display:block;object-fit:cover}
.dr-kill{flex:1;line-height:1.6}.dr-title{font-size:16px;font-weight:800;color:#ffd0d0}.dr-title small{font-size:11px;color:#9fb2bd;font-weight:500}.dr-close{width:36px;height:36px;border:1px solid #ff6b6b88;border-radius:6px;background:#160c0e;color:#ffd0d0;font-size:18px}
.dr-sec{padding:10px 14px;border-bottom:1px solid #ffffff10}.dr-sec-h{display:flex;justify-content:space-between;font-weight:800;color:#f3e7c4;margin-bottom:6px}.dr-bar{display:flex;height:8px;border-radius:4px;overflow:hidden;background:#ffffff10}.dr-bar span{display:block}.dr-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;margin:4px 0 6px}
.dr-src{margin:6px 0;padding:6px 8px;border-radius:5px;background:#ffffff08}.dr-src-h{display:flex;justify-content:space-between;font-weight:700;color:#f3e7c4}.dr-src-h small{color:#9fb2bd;font-weight:500;margin-left:4px}
.dr-row{display:grid;grid-template-columns:1fr auto 40px;gap:8px;font-size:12px;padding:2px 0 2px 10px;color:#c9d6de}.dr-pct{text-align:right;color:#9fb2bd}.dr-empty{color:#9fb2bd;font-size:12px}
#recapBtn{position:absolute;left:50%;bottom:150px;transform:translateX(-50%);z-index:9;padding:8px 16px;border-radius:6px;border:1px solid #ff6b6baa;background:#1a0f12e6;color:#ffd0d0;font-weight:700}#recapBtn.hidden{display:none}
@media(max-height:480px){#recapBtn{bottom:96px;padding:5px 12px;font-size:12px}.dr-card{font-size:12px}}`;
let st=doc.createElement('style');st.textContent=css;doc.head.appendChild(st);
const host=doc.getElementById('arena')||doc.body;
const panel=doc.createElement('div');panel.id='deathRecap';panel.className='hidden';host.appendChild(panel);
const btn=doc.createElement('button');btn.id='recapBtn';btn.className='hidden';btn.textContent='查看死亡回放';host.appendChild(btn);
btn.addEventListener('click',open);panel.addEventListener('click',e=>{if(e.target===panel)close()});
// 复活后隐藏按钮（回放保留，可在下次阵亡前从战绩面板以外再次打开时使用 window.DeathRecapV20.open）
setInterval(()=>{let d=P();if(d?.player&&!(d.player.death>0))btn.classList.add('hidden')},500);
window.DeathRecapV20={open,close,last:()=>recap,_record:record,_killed:onKilled,_attach:attach};
})();
