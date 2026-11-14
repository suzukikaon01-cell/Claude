// Latest user overrides take precedence over the supplied V4/V5 references.
(()=>{
 const C=GAME_CONFIG;
 C.world=15000;
 C.specVersion='EIGHT-HEROES-V6';
 C.baseCritMultiplier=2;C.maxAttackSpeed=3;
 Object.assign(C.tower,{modelScale:1.5,radius:45,range:465,projectileSpeed:900});
 C.minionHeroDamageMultiplier=.30;
 C.regenerationMultiplier=2;
 C.mageTowerApRatio=.30;
 const z=C.heroes.zero;
 z.stats.range=393.75;z.range=393.75;
 for(const s of z.skills)for(const k of ['range','radius'])if(Number.isFinite(s[k]))s[k]*=.5;
 for(const s of z.skills)if(Number.isFinite(s.range))s.range*=1.5;z.skills[3].radius*=1.5;
 C.zeroEvolution.thresholds=[25,65,95,125];C.zeroEvolution.qSplashRadius=100;
 const cds=[[5,4.5,4,3.5,3],[12,11,10,9,8],[20,18,16,14,12],[70,55,40]];
 z.skills.forEach((s,i)=>s.cd=cds[i]);C.ultimateCooldowns.zero=cds[3];
 z.passive.desc='仅Q命中敌方英雄叠层：同次Q对每名英雄最多+1（包含溅射）；普攻及W/E/R命中不叠层。击杀小兵+1、击杀英雄+5、助攻+3，死亡保留。25/65/95/125层进化Q/W/E/R。';
 z.skills[0].desc='锁定英雄或小兵，距离450、弹速1300；55/85/115/145/175 + 0.40AP + 熵增软上限魔法伤害。减速1.5秒；命中自身W禁锢目标主要伤害×1.25。25层进化：半径100内最多3个其他敌人承受25%未联动伤害，不减速、不递归。';
 z.skills[1].desc='距离525内放置半径130故障区；0.9秒后造成55/80/105/130/155 + 0.35AP + 熵增伤害，禁锢1.5秒。65层进化：预定禁锢期结束后留下1秒25%减速磁场，不重复伤害。';
 z.skills[2].desc='前摇0.25秒，隐身免伤min(0.5,0.25+0.001熵增)秒；可移动，不能攻击施法，不免控制。正常结束治疗30/45/60/75/90 + 0.15AP + 熵增治疗，受重伤影响。95层进化：正常结束12%移速1.2秒。';
 z.skills[3].desc='前摇0.65秒，半径562.5内英雄承受75/130/185 + 0.45AP + 熵增伤害，沉默1.5秒；自身W禁锢逐目标增伤25%。125层进化：3秒过载标记，下一次Q主弹额外30+0.10AP魔法伤害，独立于W倍率与溅射。';
 // Reduce by 5% of rank-one cost per rank, including formerly increasing costs.
 for(const h of Object.values(C.heroes))if(h.stats.mana>0)for(const s of h.skills){let cost=Array.isArray(s.mana)?s.mana[0]:s.mana||0;s.mana=Array.from({length:s.maxRank},(_,i)=>Math.round(cost*(1-.05*i)*100)/100)}
 for(const h of Object.values(C.heroes))h.skills.forEach(s=>s.desc+=' 蓝耗与冷却以当前等级动态数值为准。');
 window.ChampionStats=Object.fromEntries(Object.entries(C.heroes).map(([id,h])=>[id,h.stats]));
 window.ChampionAbilities=Object.fromEntries(Object.entries(C.heroes).map(([id,h])=>[id,h.skills]));
})();
