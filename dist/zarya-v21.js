/* V21 查莉娅调整：
 * - 普攻榴弹的主目标走普攻结算（触发普攻特效与装备，如心之钢），其余为溅射伤害；榴弹与激光可以攻击防御塔/水晶/兵营。
 * - 普攻与 Q 基础伤害 -40%，能量增伤翻倍（每点能量 +2%，满 100 能量 ×3）。
 * - 能量衰减改为每秒 2 点（4 秒未吸收伤害后开始）。
 * - Q 激光宽度随能量实时变化（50 → 140）。
 * - Q 激光持续期间不能释放其他技能，也不能普攻。 */
(function(){let C=window.GAME_CONFIG,z=C?.heroParams?.zarya;if(!z||z._v21)return;z._v21=true;
 for(let p of new Set([z,C.heroes?.zarya?.params]))if(p){if(p.P){p.P.aa_base_min=Math.round(p.P.aa_base_min*.6);p.P.aa_base_max=Math.round(p.P.aa_base_max*.6);p.P.damage_per_energy=.02;p.P.decay_per_second=2}
  if(p.Q){p.Q.laser_dps=(p.Q.laser_dps||[]).map(v=>Math.round(v*.6));p.Q.laser_width_min=50;p.Q.laser_width_max=140}}
 {let ps=C.heroes?.zarya?.passive;if(ps?.desc)ps.desc=ps.desc.replace('40～160','24～96').replace('每点能量+1%','每点能量+2%').replace('每秒衰减1','每秒衰减2')}
 window.installZaryaV21=function(m){let h=m.heroHooks.zarya;if(!h||h._v21)return;h._v21=true;const laser=u=>!!u.v11State?.laser;
  let pb=h.prepare;h.prepare=function(u,i,p){if(laser(u)&&i!==0)return false;return pb?.call(this,u,i,p)};
  let ba=h.beforeAttack;h.beforeAttack=function(u,t){if(laser(u))return false;return ba?.call(this,u,t)}};
})();
