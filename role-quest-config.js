/* 五大分路专属任务配置（Role Quest System）。所有数值集中在这里，核心逻辑 role-quest-system.js 不写死数值。
 * 只在召唤师峡谷 5v5 生效（大乱斗、训练模式不启用）。时间单位：秒；距离单位：游戏码。 */
window.ROLE_QUEST_CONFIG={
 version:1,
 startTime:45,                 // 0:45 开始计算任务积分
 passive:{lane:2,other:.5,     // 指定线路 / 其他区域 被动积分每秒
  laneRadius:650,              // 离本路兵线路径多远算"在线路区域"
  baseExclude:1500,            // 己方泉水附近不算任何线路
  activeWindow:40},            // 防挂机：最近 N 秒内必须对敌方单位造成过伤害或击杀，才计算被动积分
 roam:{minLevel:3,fillSeconds:120,storeSeconds:90,max:90}, // 3级后在线路累计2分钟可存满90秒游走时间
 recallPause:8,                // 回城后被动积分暂停
 roleLane:{top:0,mid:1,adc:2,support:2}, // 分路 → 兵线编号（0上 1中 2下）
 meleeRange:250,               // 攻击距离 ≤ 此值视为近战英雄
 largeMonsters:['BLUE_SENTINEL','RED_BRAMBLEBACK','GROMP','GREATER_MURK_WOLF','CRIMSON_RAPTOR','ANCIENT_KRUG','RIFT_SCUTTLER'],
 contestMonsters:['RIFT_SCUTTLER'], // 资源争夺：河道迅捷蟹，以及敌方半场的大型野怪
 shareRadius:1400,             // 参与史诗野怪/推塔判定的距离
 damagePointCapPerSecond:30,   // 中路伤害积分每秒上限（防止持续伤害/特殊技能产生异常积分）
 ccCooldownPerTarget:1.5,      // 同一目标的控制积分间隔
 ccStatuses:['STUN','ROOT','SILENCE','AIRBORNE','SUPPRESSION','SLEEP','TAUNT','CHARM','FEAR','SLOW','KNOCKBACK','PULL'],
 quests:{
  top:{id:'TOP',name:'孤峰霸主',icon:'⛰',goal:850,
   points:{kill:20,laneMinion:3,plate:50,tower:70,epic:40},
   rewards:{maxLevel:20,xp:600,killXp:80,xpMult:.11,teleportShieldPct:.35,teleportShieldDuration:10},
   preview:['等级上限 18 → 20','立即获得 600 经验','击杀英雄额外 +80 经验，其他经验 +11%','解锁专属传送（已携带传送则强化）','传送落地获得 35% 最大生命护盾，持续 10 秒']},
  jungle:{id:'JUNGLE',name:'野区之王',icon:'🌲',goal:25,unit:'层',
   points:{small:.6,large:1.4,epic:5,takedown:2,contest:3},
   rewards:{jungleMs:.04,outOfCombatMs:.08,outOfCombatDelay:5,largeGold:10,largeXp:10,smiteMonsterMult:1.3,smiteEpicMult:1.5,smiteRechargeMult:.7},
   preview:['野区/河道 +4% 移速','脱战 +8% 移速','击杀大型野怪额外 +10 金币 +10 经验','解锁强化惩戒：对野怪伤害 ×1.3、对史诗野怪 ×1.5','强化惩戒充能速度 +43%（立即进化至最终阶段）']},
  mid:{id:'MID',name:'中枢统御',icon:'✦',goal:950,
   points:{kill:30,laneMinion:3,plate:50,tower:70,epic:40,damageMelee:.04,damageRanged:.02},
   rewards:{bonusAdPct:.08,bonusApPct:.08,freeBootsUpgrade:true},
   preview:['二级鞋免费升级为三级鞋（之后购买的二级鞋也会自动升级）','额外攻击力 +8%','法术强度 +8%']},
  adc:{id:'BOT',name:'火力核心',icon:'➶',goal:950,
   points:{kill:20,laneMinion:4,plate:50,tower:70,epic:40},
   rewards:{gold:300,minionGold:2,killGold:40,bootSlot:true,extraSlots:1},
   preview:['立即获得 300 金币','每击杀一个小兵额外 +2 金币','击杀英雄额外 +40 金币','鞋子移入专属任务栏','额外 +1 普通装备栏（最多 7 件普通装备 + 鞋子）']},
  support:{id:'SUPPORT',name:'同心守护',icon:'✚',goal:850,
   points:{assistArea:2.5,assist:25,kill:25,cc:8,healShieldPer100:2,towerAssist:40,epic:40},
   assistAreaRadius:1000,      // 下路区域内、附近有友方英雄时每秒积分
   rewards:{goldPerMinute:60,assistGold:30,epicGold:100,epicXp:100,extraSlots:1,
    choices:{hp:{label:'最大生命 +8%',hpPct:.08},haste:{label:'技能急速 +15',haste:15},speed:{label:'移动速度 +5%',msPct:.05},heal:{label:'治疗与护盾强度 +12%',healShield:.12}}},
   preview:['每分钟 +60 被动金币','助攻额外 +30 金币','参与史诗野怪击杀 +100 金币 +100 经验','解锁专属辅助装备栏（+1 栏，不占普通栏）','四选一属性强化：生命 / 技能急速 / 移速 / 治疗护盾强度']}
 }
};
