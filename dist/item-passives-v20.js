/* V20 装备说明：每个被动/主动单独一条并带名字；伤害类型着色（物理橙/魔法蓝/真实白），回复为绿色。
 * 同名被动只生效一个（见 ItemPassivesV20.activeNames / 购买提示）。 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
// 传说装备：被动名字 + 简洁说明（与实际效果一致）。
const NAMED={
 infinity:[['完美','暴击伤害从200%提高到230%。']],
 bork:[['雾之锋','普攻附带目标当前生命一定比例的物理伤害（近战与远程比例不同）。'],['虹吸','连续3次命中英雄后减速目标。']],
 blood:[['灵液护盾','溢出的生命偷取转化为护盾，护盾上限随等级成长。']],
 trinity:[['咒刃','施放技能后，下一次普攻额外造成200%基础攻击力的物理伤害。'],['迅捷','普攻命中后短暂提高移速（远程减半）。']],
 cleaver:[['切割','物理伤害逐层削减敌方英雄护甲，最多30%。'],['狂怒','造成物理伤害后获得移速。']],
 mortal:[['重伤','造成物理伤害时施加3秒重伤：目标生命高于60%时治疗效果-40%，低于40%时-60%，之间线性变化。']],
 youmuu:[['幽魂步伐','脱离战斗时获得额外移速（近战更高）。']],
 deathdance:[['无视痛苦','受到的部分物理/魔法伤害延后，3秒内以真实伤害结算。'],['蔑视','参与击杀时清除延后伤害并回复生命。']],
 guardian:[['救主灵刃','受到致命伤害时进入4秒复活状态，随后回复部分基础生命和最大法力（有冷却）。']],
 phantom:[['幽影华尔兹','攻击英雄时逐层提高攻速和移速，最多5层。']],
 deathcap:[['魔法乐章','法术强度提高30%。']],
 luden:[['回声','技能命中时对主目标及最多5个附近敌人额外造成魔法伤害。']],
 liandry:[['折磨','技能使敌人灼烧，按其最大生命持续造成魔法伤害。'],['苦难','与英雄战斗时间越长，造成的伤害越高。']],
 orb:[['无限法则','对生命低于40%的敌人造成的魔法伤害提高。']],
 void:[['虚空','提供百分比法术穿透。']],
 morello:[['重伤','造成魔法伤害时施加3秒、50%的重伤。']],
 archangel:[['敬畏','最大法力的一部分转化为法术强度。'],['法力增幅','消耗法力叠加最多700法力，叠满进化为炽天使之拥。']],
 riftmaker:[['虚空腐蚀','与英雄战斗时每秒提高造成的伤害，满层获得全能吸血。'],['虚空注能','额外生命的一部分转化为法术强度。']],
 rylai:[['冰霜','伤害型技能和强化普攻命中后减速目标。']],
 lich:[['咒刃','施放技能后，下一次普攻额外造成基于基础攻击力和法强的魔法伤害。']],
 heartsteel:[['巨像之力','在敌方英雄附近停留一段时间后，下一次普攻额外造成基于自身最大生命的物理伤害，并永久获得部分最大生命。']],
 sunfire:[['献祭','对附近敌人持续造成魔法伤害（对小兵、野怪倍率不同）。']],
 thornmail:[['荆棘','被普攻命中时对攻击者造成魔法伤害并施加重伤。']],
 armor:[['坚韧','受到的暴击伤害降低。'],['冰冷','被暴击命中后获得移速和减速抗性，最多4层。']],
 frozen:[['凛冬之抚','半径650内的敌方英雄攻速降低25%。']],
 nature:[['坚毅','受到敌方英雄魔法伤害时叠层，满4层临时获得魔抗和移速。']],
 warmog:[['狂徒之心','额外生命达到1250并脱战5秒后，每秒回复3.5%最大生命。']],
 twinguard:[['坚忍','战斗中每秒获得1层，满5层提高额外双抗、韧性和体型。']],
 deadman:[['动能','移动时积攒动能，满额后下次普攻造成额外魔法伤害（近战还减速）。']],
 kaenic:[['魔法护盾','12秒未受到魔法伤害时获得只吸收魔法伤害的护盾。']],
 SWORD_OF_THE_OCCULT:[['荣耀','击杀+4层、助攻+2层，每层+3攻击力，最多25层；阵亡失去10层。'],['激励','10层以上时移速+10%。']],
 MEJAIS_SOULSTEALER:[['荣耀','击杀+4层、助攻+2层，每层+5法强，最多25层；阵亡失去10层。'],['激励','10层以上时移速+10%。']],
 nashor:[['兼容','旧版纳什之牙，无额外被动。']],
 seraph:[['敬畏','最大法力的一部分转化为法术强度。'],['生命线','受到伤害时获得护盾。']],
 KRAKEN_SLAYER:[['击沉','每第三次普攻额外造成物理伤害，目标已损失生命越多伤害越高。']],
 THE_COLLECTOR:[['死亡与税','造成伤害使敌方英雄生命低于5%时直接处决。'],['分赃','击杀英雄额外获得25金币。']],
 NAVORI_FLICKERBLADE:[['超越','普攻命中时，基础技能剩余冷却减少15%（不影响大招）。']],
 GUINSOOS_RAGEBLADE:[['怒火','普攻额外造成30魔法伤害，并叠加攻速。'],['幻影打击','叠满4层后，每第三次普攻额外触发一次攻击特效。']],
 RUNAANS_HURRICANE:[['风之怒','远程普攻对主目标附近最多2个敌人发射附带攻击特效的弹道。']],
 LORD_DOMINIKS_REGARDS:[['巨人杀手','对额外生命越高的敌方英雄伤害越高，最多+15%。']],
 SERYLDAS_GRUDGE:[['苦楚','技能伤害使生命低于50%的敌人减速30%，持续1秒。']],
 ECLIPSE:[['永升月蚀','2秒内用两次不同的攻击或技能命中英雄时，获得护盾。']],
 SPEAR_OF_SHOJIN:[['龙之力','获得25基础技能急速。'],['专注意志','技能命中叠层，提高技能伤害，最多4层（不增强真实伤害）。']],
 RAVENOUS_HYDRA:[['顺劈','普攻对周围敌人造成物理伤害。'],['饥渴斩击（主动）','对周围敌人造成物理伤害，享受生命偷取。']],
 SHADOWFLAME:[['煤渣绽放','对生命低于40%的敌人，魔法伤害和真实伤害提高20%。']],
 STORMSURGE:[['狂风','2.5秒内对英雄造成其25%最大生命的伤害后，2秒后召唤雷击造成魔法伤害。']],
 NASHORS_TOOTH:[['艾卡西亚之咬','普攻附带魔法伤害。']],
 HORIZON_FOCUS:[['超视距','600码外的技能命中英雄后使其显形6秒，并显形附近敌方英雄。']],
 COSMIC_DRIVE:[['狂热','对英雄造成魔法或真实伤害后获得短暂移速。']],
 MALIGNANCE:[['憎恨之雾','大招伤害在目标脚下生成3秒灼烧区域，造成魔法伤害并削减魔抗。']],
 CRYPTBLOOM:[['生命绽放','参与英雄击杀后，在目标处产生回复友军生命的新星。']],
 BANSHEES_VEIL:[['废除','格挡下一个敌方技能，英雄战斗后重新计时。']],
 ZHONYAS_HOURGLASS:[['凝滞（主动）','2.5秒内无法移动、攻击或施法，但不可选中且免疫伤害。']],
 HEXTECH_ROCKETBELT:[['超音速（主动）','向指定方向突进，并发射扇形弹体造成魔法伤害。']],
 JAKSHO_THE_PROTEAN:[['虚空坚韧','与英雄持续战斗5秒后，额外双抗提高30%。']],
 UNENDING_DESPAIR:[['绝望','英雄战斗中每4秒吸取附近敌方英雄，造成伤害并回复造成伤害250%的生命。']],
 HOLLOW_RADIANCE:[['献祭','受伤或造成伤害后，对附近敌人持续造成魔法伤害。'],['灭世','击杀单位时在其位置爆炸，造成魔法伤害。']],
 ICEBORN_GAUNTLET:[['咒刃','施放技能后，下一次普攻额外造成基础攻击力的物理伤害，并生成减速场。']],
 SPIRIT_VISAGE:[['无拘活力','自身获得的治疗和护盾效果提高25%。']],
 ABYSSAL_MASK:[['亵渎','附近敌方英雄受到的魔法伤害提高12%。']],
 LOCKET_OF_THE_IRON_SOLARI:[['奉献（主动）','为附近友方英雄提供随等级成长、会逐渐衰减的护盾。']],
 KNIGHTS_VOW:[['献身（主动）','绑定一名友方英雄。'],['牺牲','绑定的队友在附近时，替其承受14%伤害，并按其对英雄造成伤害的12%回复生命。']],
 ZEKES_CONVERGENCE:[['霜火风暴','施放大招后，周围产生5秒冰霜风暴，对附近英雄持续造成魔法伤害并减速30%。']],
 WINTERS_APPROACH:[['法力流','攻击和技能命中提高最大法力，叠满360层进化为末日寒冬。'],['末日寒冬','控制敌方英雄时获得基于法力的护盾。']],
 GIANT_MAW:[['巨颚','普攻额外造成自身最大生命1.5%的物理伤害，并对目标身后350码、90°扇形内的敌人造成同等伤害（远程60%）。']],
 FORGED_HEART:[['熔铸','获得额外生命2.5%的攻击力。'],['困兽','生命低于50%时，按已损失生命额外获得最多10%攻击力。']],
 CHOCO_ICE:[['冰冻','对敌人造成伤害后使其减速30%，持续1秒。'],['美味巧乐兹','受到的治疗效果提升25%。']],
 VOID_SPEAR:[['亚空裂隙','击杀或助攻敌方英雄后，当前大招剩余冷却减少20%。'],['亚空灼烧','技能命中附带3秒灼烧，共造成5+1%法强的魔法伤害（重复命中刷新）。'],['亚空汲能','每击杀3个小兵/野怪，或击杀/助攻敌方英雄，或击杀史诗野怪，获得1%攻击速度（最多+25%）。']],
 GARGOYLE_MASK:[['石像之躯','生命低于75%时受到的治疗效果提升，生命越低越高（30%生命时+25%）。'],['不屈','受到致命伤害时免疫这次死亡，并在5秒内回复35%已损失生命（冷却180秒）。']],
 DIMENSION_BLADE:[['属性激化','普攻和技能每次命中附带10～28（随等级）魔法伤害，无冷却（装备、召唤师技能伤害不触发）。'],['基础攻击强化EX','额外获得42攻击力（不计入面板）。'],['锋利度强化','30%护甲穿透（百分比穿甲装备只能持有一件）。'],['黑蚀龙之力','战斗中受侵蚀，每秒损失1%最大生命（不会致死）；对敌方英雄累计造成80+12×等级伤害后克服侵蚀，回复12%已损失生命，并获得25%暴击率，持续15秒。侵蚀冷却30秒。'],['霸主之魂','受到致命伤害时免疫这次死亡，1.5秒无敌（冷却180秒）。']]
};
const COLOR={physical:'#ff9a3c',magic:'#5aa9ff',true:'#ffffff',heal:'#6ee07a'};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const span=(c,t)=>'<span style="color:'+COLOR[c]+';font-weight:600">'+t+'</span>';
function colorize(t){return esc(t).replace(/(物理伤害)/g,span('physical','$1')).replace(/(魔法伤害)/g,span('magic','$1')).replace(/(真实伤害)/g,span('true','$1'))
 .replace(/((?:回复|恢复|治疗)[^，。；（）]*?(?:生命|法力)?(?:值)?)(?=[，。；（）]|$)/g,(m)=>span('heal',m))}
// 名字：说明 形式的文本（V19/V20 装备）；基础组件的“属性；；名字；说明”格式。
function parse(it){if(NAMED[it.id])return NAMED[it.id].map(([n,t])=>({name:n,text:t}));let p=String(it.passive||'').trim();if(!p||p==='无额外被动')return[];
 if(p.includes('；；')){let parts=p.split('；；').slice(1).map(x=>x.split('；').map(s=>s.trim()).filter(Boolean)).filter(a=>a.length);let out=[];for(let a of parts){if(a.length>=2)out.push({name:a[0],text:a.slice(1).join('；').replace(/[；;]+$/,'')});else if(out.length)out[out.length-1].text+=a[0]}return out}
 let re=/([^\s。；，：（）]{2,10})：/g,idx=[],m;while((m=re.exec(p)))if(m.index===0||/[。；]/.test(p[m.index-1]))idx.push({at:m.index,name:m[1],start:m.index+m[0].length});
 if(!idx.length)return[{name:'被动',text:p}];return idx.map((x,i)=>({name:x.name,text:p.slice(x.start,idx[i+1]?.at??p.length).trim()}))}
function html(it){let list=parse(it);if(!list.length)return '<p class="ip-none">无额外被动</p>';let me=window.RiftArena?.panel?.()?.player,warn=me&&suppressed(me,it.id)?'<p class="ip-warn">你已有提供同名唯一被动的装备，这件装备的被动不生效（属性照常生效）。</p>':'';
 return '<div class="ip-list">'+list.map(x=>{let active=/主动/.test(x.name);return '<div class="ip-item'+(active?' ip-active':'')+'"><div class="ip-name">'+esc(x.name.replace(/（主动）/,''))+'<em>'+(active?'主动':'唯一被动')+'</em></div><div class="ip-text">'+colorize(x.text)+'</div></div>'}).join('')+'</div>'}
function names(id){let it=C.items.find(i=>i.id===id);return it?parse(it).filter(x=>!/主动/.test(x.name)).map(x=>x.name):[]}
// 同名被动只生效一个：允许同时持有；拥有同名唯一被动的多件装备中，被动数量最多的那件生效（相同则装备栏靠前的生效），其余装备的被动不生效（属性照常）。
const SKIP=new Set(['被动','兼容']);const nameCache=new Map;
function namesOf(id){if(!nameCache.has(id))nameCache.set(id,names(id).filter(n=>!SKIP.has(n)));return nameCache.get(id)}
const supCache=new WeakMap;
function suppressedSet(u){let ids=(u?.items||[]).map(x=>typeof x==='string'?x:x?.id).filter(Boolean),sig=ids.join('|'),c=supCache.get(u);if(c&&c.sig===sig)return c.set;
 let out=new Set,byName=new Map;ids.forEach((id,slot)=>{for(let n of namesOf(id)){let a=byName.get(n)||[];a.push({id,slot,count:namesOf(id).length});byName.set(n,a)}});
 for(let list of byName.values()){let distinct=[...new Map(list.map(x=>[x.id,x])).values()];if(distinct.length<2)continue;distinct.sort((a,b)=>b.count-a.count||a.slot-b.slot);for(let x of distinct.slice(1))out.add(x.id)}
 supCache.set(u,{sig,set:out});return out}
function suppressed(u,id){return !!u&&suppressedSet(u).has(id)}
function conflict(u,id){let mine=new Set(namesOf(id));if(!mine.size)return null;for(let x of (u.items||[])){let h=typeof x==='string'?x:x?.id;if(!h||h===id)continue;for(let n of namesOf(h))if(mine.has(n))return n}return null}
window.ItemPassivesV20={html,parse,names,colorize,NAMED,conflict,suppressed,suppressedSet};
if(typeof document!=='undefined'&&document.head&&!document.getElementById('ipV20Style')){let st=document.createElement('style');st.id='ipV20Style';st.textContent='.ip-list{display:flex;flex-direction:column;gap:6px;margin:4px 0 8px}.ip-item{padding:6px 8px;border-radius:5px;background:#ffffff0a;border-left:3px solid #c9a24f}.ip-item.ip-active{border-left-color:#5aa9ff}.ip-name{font-weight:700;color:#f3e7c4;display:flex;align-items:center;gap:6px}.ip-name em{font-style:normal;font-size:10px;font-weight:600;color:#9fb2bd;border:1px solid #ffffff22;border-radius:3px;padding:0 4px}.ip-text{margin-top:2px;color:#c9d6de;line-height:1.5;font-size:12px}.ip-none{color:#9fb2bd}.ip-warn{color:#ffb15c;font-size:12px;margin:2px 0 6px}';document.head.appendChild(st)}
})();
