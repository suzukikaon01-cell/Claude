/* V20 技能说明：简洁显示 消耗 / 冷却 / 距离 / 伤害（基础 + 加成 = 当前总伤害）。
 * 伤害类型着色：物理橙色、魔法蓝色、真实白色。数值全部从当前参数和英雄实时属性计算。 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C)return;
const COLOR={physical:'#ff9a3c',magic:'#5aa9ff',true:'#ffffff'},TYPE={physical:'物理',magic:'魔法',true:'真实'};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const n=v=>{v=+v;return Number.isInteger(v)?String(v):String(+v.toFixed(v<10?2:1))};
const pct=v=>n(v*100)+'%';
const at=(v,r)=>Array.isArray(v)?v[Math.min(v.length,Math.max(1,r))-1]:v;
const list=v=>Array.isArray(v)?v.map(n).join('/'):n(v);
const bonus=u=>Math.max(0,(u.attack||0)-(u.baseAttack??u.attack??0));
const rk=(u,i)=>Math.max(1,u.skillRanks?.[i]||1);
const P=id=>C.heroParams?.[id]||{};
function dmg(type,text){return '<span style="color:'+(COLOR[type]||'#fff')+';font-weight:600">'+text+'</span>'}
function colorize(t){return esc(t).replace(/(物理伤害)/g,dmg('physical','$1')).replace(/(魔法伤害)/g,dmg('magic','$1')).replace(/(真实伤害)/g,dmg('true','$1'))}
// 一行伤害：label：base[ + x%额外AD][ + x%AD][ + x%AP][ + extra] = total 类型伤害 [×hits]
function line(u,o){let r=o.r,base=at(o.base,r)||0,total=base,parts=[list(o.base)];
 for(let [k,label,val] of [['bad','额外AD',bonus(u)],['ad','AD',u.attack||0],['ap','AP',u.ap||0]])if(o[k]){let c=at(o[k],r);parts.push(Array.isArray(o[k])?o[k].map(pct).join('/')+label:pct(c)+label);total+=c*val}
 if(o.extra)parts.push(o.extra);if(o.extraVal)total+=o.extraVal;if(o.mult)total*=o.mult;
 let tail=o.hits?' ×'+o.hits:'';return '<div class="tt-line"><span class="tt-k">'+esc(o.label)+'</span> '+esc(parts.join(' + '))+' = '+dmg(o.type,n(total)+' '+TYPE[o.type]+'伤害')+esc(tail)+(o.note?' <small>'+esc(o.note)+'</small>':'')+'</div>'}
const text=t=>'<div class="tt-text">'+colorize(t)+'</div>';
function header(u,i,cost,cdText){let s=u.skills[i],r=rk(u,i),cd=cdText??(s.cd==null?'—':(Array.isArray(s.cd)?n(at(s.cd,r)):n(s.cd))+' 秒'),range=s.range?n(s.range)+' 码':'';
 if(cost==null){let m=at(s.mana,r);cost=m>0?(u.resourceType==='ENERGY'?'能量 ':'法力 ')+n(m):'无消耗'}
 return '<div class="tt-head"><span>'+esc(cost)+'</span><span>冷却 '+esc(cd)+'</span>'+(range?'<span>距离 '+esc(range)+'</span>':'')+'<span>'+r+' 级</span></div>'}
const lvl=u=>Math.min(18,Math.max(1,u.level||1)),byLvl=(a,b,u)=>a+(b-a)*(lvl(u)-1)/17;

const SPECS={
 longsword_hunter:{
  P:u=>text('气刃槽0～100：普攻命中英雄/大型野怪+23，小兵+12，建筑+6。开刃等级决定攻击力：无刃95% · 白刃100% · 黄刃105% · 红刃110%。红刃持续50秒，W突刺时减伤50%并霸体。'),
  0:u=>{let p=P('longsword_hunter').Q,r=rk(u,0);return header(u,0,'气刃 '+list(p.stage_gauge_cost),'每段 0.5 秒')+[1,2,3,4,5].map(k=>line(u,{r,label:'Q'+k,base:p['stage'+k+'_damage'],bad:p.stage_bonus_ad_ratio_pct[k-1],type:'physical'})).join('')+text('每段朝摇杆方向移动25码；Q5命中升刃；空中按Q为兜割。')},
  1:u=>{let p=P('longsword_hunter').W,r=rk(u,1);return header(u,1)+line(u,{r,label:'突刺',base:p.thrust_damage,bad:p.thrust_bonus_ad_ratio_pct,type:'physical'})+line(u,{r,label:'兜割每段',base:p.helm_tick_base_damage,bad:p.helm_tick_bonus_ad_ratio_pct,type:'physical',hits:p.helm_tick_count,note:'消耗1层刃'})+line(u,{r,label:'普通下戳',base:0,ad:p.fallback_total_ad_ratio_pct,type:'physical',note:'3段合计'})+text('前摇'+n(p.thrust_windup||0)+'秒（先小后撤）后冲刺'+n(p.dash_distance)+'码，判定'+n(p.thrust_range)+'码；命中减速'+pct(p.slow_pct)+'并腾空。空中按Q兜割：0.1秒内摇杆定方向，只伤剑身范围内的敌方英雄；落地后摇'+n(p.helm_landing_recovery||0)+'秒。')},
  2:u=>{let p=P('longsword_hunter').E,r=rk(u,2);return header(u,2)+line(u,{r,label:'回砍',base:p.return_damage,bad:p.return_bonus_ad_ratio_pct,type:'physical'})+text('清空气刃并后撤'+n(p.backstep_distance)+'码（无敌、霸体），再回砍。成功规避敌方伤害且回砍命中：回满气刃，0.5秒内Q变为气刃派生。')},
  3:u=>{let p=P('longsword_hunter').R,q=P('longsword_hunter').RELEASE,r=rk(u,3);return header(u,3,'无消耗','成功 '+list(p.success_cooldown)+' 秒 / 失败 '+list(p.spirit_iai_cooldown)+' 秒')+line(u,{r,label:'完美居合',base:p.spirit_iai_base_damage,bad:p.spirit_iai_bonus_ad_ratio_pct,type:'physical'})+line(u,{r,label:'失败居合',base:p.spirit_iai_base_damage,bad:p.spirit_iai_bonus_ad_ratio_pct,mult:p.failed_counter_damage_pct,type:'physical',note:'半伤'})+line(u,{r,label:'小居合',base:0,ad:p.small_iai_total_ad_ratio_pct,type:'physical',note:'两刀合计'})+line(u,{r:rk(u,1),label:'解放斩每段',base:q.tick_base_damage,bad:q.tick_bonus_ad_ratio_pct,type:'physical',hits:q.damage_tick_count,note:'登龙落地后0.5秒内，消耗1层刃'})+text('收刀0.25秒，拔刀前后0.2秒内受到合法伤害=完美反击：眩晕0.5秒并升刃。红刃完美居合命中英雄/史诗野怪：回复8%已损失生命（每100额外AD +1%）。')}},
 dio:{
  P:u=>{let p=P('dio').P;return text('致命伤时倒地'+n(p.revive_delay)+'秒（免伤、不可选中），随后恢复'+pct(p.revive_hp_pct)+'最大生命，冷却'+n(p.cooldown)+'秒。普攻造成125%总AD物理伤害，攻速固定0.7。')},
  0:u=>{let p=P('dio').Q,r=rk(u,0);return header(u,0,'能量 '+n(p.energy_cost))+line(u,{r,label:'每拳',base:p.damage_per_punch,bad:p.bonus_ad_ratio_pct,type:'physical',hits:p.min_punch_count+'～'+p.max_punch_count})+text(n(p.cast_duration)+'秒内打完；范围'+n(p.range)+'×'+n(p.width)+'；对小兵和野怪×'+n(p.non_champion_damage_multiplier)+'。每拳命中英雄/大型野怪回复1%已损失生命。')},
  1:u=>{let p=P('dio').W,r=rk(u,1);return header(u,1,'能量 '+n(p.energy_cost))+line(u,{r,label:'每把飞刀',base:p.base_damage_per_knife,bad:p.bonus_ad_ratio_pct,type:'physical',hits:p.min_knife_count+'～'+p.max_knife_count})+text('环形飞刀0.75秒后射向圆心并穿过。时停结束后0.25秒内命中被冻结的敌人伤害×'+n(p.marked_damage_multiplier)+'。')},
  2:u=>{let p=P('dio').E;return header(u,2,'能量 '+n(p.energy_cost||0))+text('前摇'+n(p.windup)+'秒后瞬移最远'+n(p.teleport_range)+'码，可穿墙；之后'+n(p.move_speed_duration)+'秒移速+'+pct(p.move_speed_bonus_pct)+'。')},
  3:u=>{let p=P('dio').R,r=rk(u,3),base=at(p.damage_settlement_base_pct,r),m=base+bonus(u)*p.damage_settlement_pct_per_total_ad;return header(u,3,'能量 '+n(p.energy_cost))+'<div class="tt-line"><span class="tt-k">结算倍率</span> '+esc(list(Array.isArray(p.damage_settlement_base_pct)?p.damage_settlement_base_pct.map(v=>v*100):p.damage_settlement_base_pct*100))+'% + 每点额外AD 0.1% = <b>'+n(m*100)+'%</b></div>'+text('半径'+n(p.radius)+'领域内的敌人和飞行物时间停止，最长'+n(p.max_duration)+'秒（1秒后可再按R提前结束）。期间对其造成的伤害在结束时按倍率统一结算。')}},
 sett:{
  P:u=>{let p=P('sett').P;return text('左右拳交替，右拳出拳速度×'+n(p.right_punch_speed_multiplier)+'，右拳额外')+line(u,{r:1,label:'右拳额外',base:p.right_punch_damage_per_level*lvl(u),bad:p.right_punch_bonus_ad_ratio,type:'physical'})+text('生命越低回复越快。')},
  0:u=>{let p=P('sett').Q,r=rk(u,0);return header(u,0)+line(u,{r,label:'每拳',base:p.damage_flat,type:'physical',extra:pct(p.target_max_hp_pct)+'目标最大生命',hits:p.empowered_attacks})+text('冲向敌方英雄时移速+'+pct(p.bonus_ms)+'（'+n(p.duration)+'秒），强化接下来2次普攻。')},
  1:u=>{let p=P('sett').W,s=u.skills[1],r=rk(u,1),grit=u.settState?.grit??u.grit??0;return header(u,1)+line(u,{r,label:'轰拳',base:s.damage,type:'physical',extra:pct(p.center_damage_pct)+'豪意（每点额外AD +'+n(p.center_damage_bonus_ad_increment*100)+'%）',note:'中间窄条为'+'真实伤害'})+text('消耗全部豪意（当前'+n(grit)+'）转化为护盾（3秒），前方梯形区域长'+n(s.range)+'，中间造成真实伤害，两侧造成物理伤害。')},
  2:u=>{let p=P('sett').E,r=rk(u,2);return header(u,2)+line(u,{r,label:'伤害',base:p.damage,ad:p.total_ad_ratio,type:'physical'})+text('前摇0.25秒，双向拉拽两侧各225码（宽175）。两侧都拉到敌人：眩晕'+n(p.stun_duration)+'秒；否则减速'+pct(p.slow)+'。')},
  3:u=>{let p=P('sett').R,r=rk(u,3);return header(u,3)+line(u,{r,label:'落地伤害',base:p.damage,bad:p.bonus_ad_ratio,type:'physical',extra:list(p.victim_bonus_hp_ratio.map(v=>v*100))+'%被抓目标额外生命'})+text('压制敌方英雄并抱摔，落地范围伤害（边缘最低40%）并减速'+pct(p.slow)+'。')}},
 darius:{
  P:u=>{let p=P('darius').P;return line(u,{r:1,label:'出血（5秒）',base:+byLvl(p.bleed_base_min,p.bleed_base_max,u).toFixed(1),bad:p.bleed_bonus_ad_ratio,type:'physical',note:'每层，最多5层'})+text('叠满5层触发血怒：攻击力+'+n(byLvl(p.noxian_might_ad_min,p.noxian_might_ad_max,u))+'，持续'+n(p.noxian_might_duration)+'秒。')},
  0:u=>{let p=P('darius').Q,r=rk(u,0);return header(u,0)+line(u,{r,label:'外圈',base:p.outer_damage,ad:p.outer_ad_ratio,type:'physical'})+line(u,{r,label:'内圈',base:p.inner_damage,ad:p.inner_ad_ratio,type:'physical'})+text('前摇'+n(p.windup)+'秒。外圈每命中一名英雄回复'+pct(p.heal_missing_hp_per_target)+'已损失生命（最多'+pct(p.heal_missing_hp_cap)+'）。')},
  1:u=>{let p=P('darius').W,r=rk(u,1);return header(u,1)+line(u,{r,label:'强化普攻额外',base:0,ad:p.total_ad_bonus_ratio,type:'physical'})+text('下次普攻减速'+pct(p.slow)+'（'+n(p.slow_duration)+'秒）；击杀返还法力和一半冷却。')},
  2:u=>{let p=P('darius').E,r=rk(u,2);return header(u,2)+text('被动：护甲穿透'+list(p.armor_penetration.map(v=>+(v*100).toFixed(2)))+'%。主动：扇形拉拽到身前，击飞'+n(p.airborne_duration)+'秒，落地减速'+pct(p.landing_slow_pct)+'。')},
  3:u=>{let p=P('darius').R,r=rk(u,3),stacks=Math.min(p.max_bleed_stacks,0);return header(u,3)+line(u,{r,label:'断头台',base:p.base_true_damage,ad:p.total_ad_ratio,type:'true',note:'每层出血+20%，5层翻倍'})+text('击杀刷新R并触发血怒。')}},
 anvil:{
  0:u=>{let p=P('anvil').Q,r=rk(u,0),mx=u.maxHp||0;return header(u,0,'能量 '+list(p.energy_cost))+line(u,{r,label:'满蓄力',base:p.damage,bad:p.bonus_ad_ratio,type:'physical',extra:pct(p.maxhp_ratio)+'自身最大生命',extraVal:p.maxhp_ratio*mx})+line(u,{r,label:'强化Q',base:p.empowered_damage,bad:p.empowered_bonus_ad_ratio,type:'physical',extra:pct(p.empowered_maxhp_ratio)+'自身最大生命',extraVal:p.empowered_maxhp_ratio*mx})+text('按住蓄力最长1秒：距离、伤害（60%→100%）、击退随蓄力提高。另加目标已损失生命'+pct(p.missing_hp_base_pct)+'的伤害；撞墙/塔眩晕'+n(p.wall_stun)+'秒并再受一次同等伤害。')},
  1:u=>{let p=P('anvil').W;return header(u,1,'能量 '+list(p.energy_cost))+text('朝一个方向格挡'+n(p.duration)+'秒，正面'+n(p.arc_degrees)+'°伤害-'+pct(p.reduction)+'；格挡伤害累计达到阈值获得强化Q。')},
  2:u=>{let p=P('anvil').E,r=rk(u,2);return header(u,2,'能量 '+list(p.energy_cost))+line(u,{r,label:'落地扇形',base:p.damage,bad:p.bonus_ad_ratio,type:'physical'})+text('跃向目标点，前方90°扇形伤害并减速'+pct(p.slow)+'、击飞'+n(p.knockup)+'秒；落点周围扇形外的敌人受'+pct(p.impact_damage_ratio)+'伤害。')},
  3:u=>{let p=P('anvil').R,r=rk(u,3);return header(u,3,'能量 '+n(p.energy_cost))+line(u,{r,label:'中心伤害',base:p.damage,bad:p.bonus_ad_ratio,type:'physical',extra:pct(p.maxhp_ratio)+'自身最大生命',extraVal:p.maxhp_ratio*(u.maxHp||0)})+text('升空最多'+n(p.flight)+'秒（不可选中），坠落范围'+n(p.radius)+'；中心'+n(p.core_radius)+'码满伤并击飞，外圈随距离衰减到'+pct(p.min_falloff)+'。')}},
 great_sword:{
  0:u=>{let p=C.heroParams.great_sword,r=rk(u,0);return header(u,0,'无消耗','连招结束后 '+list(p.Q.cooldown)+' 秒')+[1,2,3].map(k=>line(u,{r,label:'Q'+k+'（一级蓄力）',base:p['Q'+k].damage,bad:p['Q'+k].bonus_ad_ratio,type:'physical'})).join('')+text('按住蓄力、松开挥砍；蓄力倍率 一级100% · 二级145% · 三级210%（过蓄165%）。Q3分两段（20%/80%），前段命中英雄则后段+20%。')},
  1:u=>{let p=C.heroParams.great_sword.W,r=rk(u,1);return header(u,1)+line(u,{r,label:'上挑',base:p.damage,bad:p.bonus_ad_ratio,type:'physical'})+line(u,{r,label:'相杀追加',base:p.offset_bonus_damage,bad:p.offset_bonus_ad_ratio,type:'physical'})+line(u,{r,label:'十字斩两段',base:p.cross_slash_damage,bad:p.cross_slash_ratio,type:'physical',extra:'第二段 '+list(p.cross_slash_damage_2)+'+'+pct(p.cross_slash_ratio_2)+'额外AD'})+text('准备0.65秒，期间正面挡下敌方英雄攻击即相杀：抵消伤害、反击、霸体0.6秒，0.8秒内按Q出十字斩。')},
  2:u=>{let p=C.heroParams.great_sword.E,r=rk(u,2);return header(u,2)+line(u,{r,label:'肩撞',base:p.damage,bad:p.bonus_ad_ratio,type:'physical'})+text('冲撞'+n(p.dash_distance)+'码，霸体并减伤'+pct(p.damage_reduction)+'；可在Q蓄力中使用并保留蓄力。')},
  3:u=>{let p=C.heroParams.great_sword.R,r=rk(u,3);return header(u,3)+line(u,{r,label:'落剑',base:p.damage,bad:p.bonus_ad_ratio,mult:1+p.full_charge_bonus,type:'physical',note:'已含满蓄力+50%'})+text('蓄力'+n(p.charge_duration)+'秒后落剑（350×180），命中英雄额外造成其'+pct(p.max_hp_damage)+'最大生命伤害。')}}
};

// 通用：其它英雄用技能对象上的 damage / adRatio / bonusAdRatio / apRatio 计算，说明取前两句。
function short(desc){let t=String(desc||'').split(/冷却 [\d./]+ ?秒 ·|\n/)[0].trim(),parts=t.split('。').filter(Boolean);return parts.slice(0,2).join('。')+(parts.length?'。':'')}
function generic(u,i){let s=u.skills[i],r=rk(u,i),html=header(u,i);
 if(Array.isArray(s.damage)||(typeof s.damage==='number'&&s.damage>0)){let type=s.damageType==='magic'?'magic':s.damageType==='true'?'true':'physical';html+=line(u,{r,label:'伤害',base:s.damage,ad:s.adRatio,bad:s.bonusAdRatio,ap:s.apRatio,type})}
 if(Array.isArray(s.shield)||s.shield>0)html+='<div class="tt-line"><span class="tt-k">护盾</span> '+esc(list(s.shield))+(s.apRatio&&!s.damage?' + '+pct(at(s.apRatio,r))+'AP':'')+'</div>';
 return html+text(short(s.desc))}

function html(u,i){if(!u?.skills?.[i])return null;let spec=SPECS[u.hero]?.[i];try{return '<b>'+esc(u.skills[i].name)+'</b>'+(spec?spec(u):generic(u,i))}catch(e){return null}}
function passive(u){let spec=SPECS[u.hero]?.P,h=C.heroes[u.hero];if(!h?.passive)return null;try{return '<b>被动 · '+esc(h.passive.name)+'</b>'+(spec?spec(u):text(short(h.passive.desc)))}catch{return null}}
window.SkillTooltipV20={html,passive,colorize};
if(typeof document!=='undefined'&&document.head&&!document.getElementById('ttV20Style')){let st=document.createElement('style');st.id='ttV20Style';st.textContent='#skillDescription .tt-head{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}#skillDescription .tt-head span{padding:2px 7px;border-radius:4px;background:#ffffff14;font-size:11px;color:#d9e6ee}#skillDescription .tt-line{margin:3px 0;line-height:1.45}#skillDescription .tt-k{color:#e9d49a;font-weight:600}#skillDescription .tt-line small{color:#9fb2bd}#skillDescription .tt-text{margin-top:6px;color:#c9d6de;line-height:1.5}';document.head.appendChild(st)}
})();
