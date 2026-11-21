// Shared arithmetic; combat and UI consume the same unrounded results.
window.ChampionRules={
 damageColor(type,critical=false){return type==='true'?'#ffffff':type==='magic'?'#67b8ff':critical?'#ffd154':'#ff6572'},
 cooldown(base,haste=0){return base*100/(100+Math.max(0,haste||0))},
 growthFactor(level){let n=Math.max(1,Math.min(18,Math.trunc(level)))-1;return n*(.7025+.0175*n)},
 rank(value,rank){return Array.isArray(value)?value[Math.max(0,rank-1)]:value},
 resistanceMultiplier(resist){return resist>=0?100/(100+resist):2-100/(100-resist)},
 derive(id,level,items=[],effects={}){
  const h=GAME_CONFIG.heroes[id],b=h.stats,g=b.growth,f=this.growthFactor(level),out={};
  for(let k of ['hp','mana','attack','armor','mr','hpRegen','manaRegen'])out[k]=b[k]+(g[k]||0)*f;
  Object.assign(out,{speed:b.speed,range:b.range,ap:b.ap,bonusAS:0,crit:0,critDamageBonus:0,lifesteal:0,bonusHp:0,bonusArmor:0,bonusMr:0});
  if(window.ItemStatsResolver)Object.assign(out,ItemStatsResolver.resolve(out,id,items,effects));else for(let value of items){const it=typeof value==='string'?GAME_CONFIG.items.find(v=>v.id===value):value;if(!it)continue;for(let k of ['attack','armor','mr','speed','ap','crit','critDamageBonus','lifesteal'])out[k]+=it[k]||0;out.hp+=it.hp||0;out.bonusHp+=it.hp||0;out.bonusArmor+=it.armor||0;out.bonusMr+=it.mr||0;out.bonusAS+=it.bonusAS||0}
  if(id==='garen'){let stacks=Math.min(150,effects.courageStacks||0),bonus=stacks*.2*(effects.itemState?.dynamic?.twinguardFull?1.3:1);out.armor+=bonus;out.mr+=bonus;out.bonusArmor+=bonus;out.bonusMr+=bonus;if(stacks>=150){let armor=out.bonusArmor*.1,mr=out.bonusMr*.1;out.armor+=armor;out.mr+=mr;out.bonusArmor+=armor;out.bonusMr+=mr}}
  if(!window.ItemStatsResolver){out.hpRegen*=GAME_CONFIG.regenerationMultiplier??1;out.manaRegen*=GAME_CONFIG.regenerationMultiplier??1}
  out.growthBonusAS=(g.as||0)*f;out.spinBonusAS=out.growthBonusAS+out.bonusAS;out.bonusAS+=effects.bonusAS||0;out.attackSpeed=Math.min(GAME_CONFIG.maxAttackSpeed,(b.baseAS+b.asRatio*(out.growthBonusAS+out.bonusAS))*(out.attackSpeedMultiplier??1));out.baseAttack=b.attack+(g.attack||0)*f;out.baseAS=b.baseAS;out.asRatio=b.asRatio;return out;
 },
 rawSkill(u,index){let a=u.skills[index],rank=u.skillRanks[index];return (this.rank(a.damage,rank)||0)+(this.rank(a.apRatio,rank)||0)*u.ap+(this.rank(a.adRatio,rank)||0)*u.attack+(this.rank(a.bonusAdRatio,rank)||0)*Math.max(0,u.attack-u.baseAttack)+(u.hero==='zero'?ZeroGrowth.stackDamage(u,index):Math.min((a.stackRatio||0)*(u.entropy||0),a.stackCap??Infinity))},
 spinCount(u){let s=u.skills[2];return s.baseSpins+Math.floor((u.spinBonusAS+1e-10)/s.asPerSpin)}
};
