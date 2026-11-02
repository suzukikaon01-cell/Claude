# DIO V13.2 交付与验证

在现有15英雄、62件成装、62符文与峡谷/极地大乱斗系统上新增迪奥。世界为跟随迪奥的3D替身模型，挥拳完成普攻与Q动作，没有独立单位、英雄血条或击杀奖励。所有正常伤害归属迪奥。

## 修改文件

- [dio.js](C:/Users/HLT/Documents/Codex/2026-10-25/ban/work/rift-arena/dist/dio.js)：P倒地复起、Q逐拳、W真实飞刀、E瞬移、R与R2，动态技能说明。
- [temporal-state.js](C:/Users/HLT/Documents/Codex/2026-10-25/ban/work/rift-arena/dist/temporal-state.js)：TemporalStateSystem、TemporalDamageLedger、唯一时停ID、局部时间暂停与伤害统一结算。
- [champion-mechanics.js](C:/Users/HLT/Documents/Codex/2026-10-25/ban/work/rift-arena/dist/champion-mechanics.js)与[combat-core.js](C:/Users/HLT/Documents/Codex/2026-10-25/ban/work/rift-arena/dist/combat-core.js)：伤害/治疗/护盾事务入口、暂停动作、弹道边界、死亡结算接口；保留已有装备符文结算链。
- [game.js](C:/Users/HLT/Documents/Codex/2026-10-25/ban/work/rift-arena/dist/game.js)：选人、AI、技能学习、二段R按钮、暂存伤害计数、页面离开/对局结束清理、存档恢复。
- [renderer.js](C:/Users/HLT/Documents/Codex/2026-10-25/ban/work/rift-arena/src/renderer.js)：迪奥与世界的程序生成3D模型、双拳动画、倒地/起身、冻结动画。
- heroes-v9.js、heroes-v11.js、items-v6.js、items-v12.js、runes-v8.js、summoner-spells.js：既有技能/装备/符文/持续效果的局部计时接入；诺手延迟处决刷新、俄洛伊灵魂传导、源氏连镖、D.Va自毁兼容。
- config/v13-dio.json、scripts/config-model.cjs、scripts/config-loader.cjs：英雄结构、Excel映射、数值校验。
- test-dio-v13.cjs、test-harness.cjs、test-item-fixture.cjs、test-v9.cjs、test.cjs：新增专项并接入完整回归。

## 暂存与统一结算

每次R有唯一timeStopId和独立ACTIVE状态。被冻结目标按ID建立独立账本，保存命中顺序、来源、伤害类型、攻击ID、原始伤害、防御快照、虚拟生命与虚拟护盾。合法命中执行原有伤害链，在事务内使用虚拟HP/护盾进行正常护甲、魔抗、减伤、增伤及吸收计算；事务退出立即恢复可见真实HP和护盾。护盾已经被前一击消耗的部分不会被后续命中重复使用。

外部合法治疗、护盾按同一虚拟时间线处理。治疗只保留当时合法的有效回复，禁疗与治疗强化执行一次；先前满血时的超额治疗不会保留。局部状态的剩余时间暂停，R结束只移除时停标记，保留其他尚未结束的控制与技能。

结束R时先从ACTIVE切换SETTLING并锁住全部账本，再读取一次迪奥当前总AD。敌方倍率为1+总AD×0.001；400AD对应1.4。每个目标最终HP=初始HP+合法治疗及资源成长−累计待扣生命伤害×倍率，友方倍率为1。这里直接使用已经经过防御与护盾的生命伤害，不再走一遍护甲魔抗。所有目标HP先更新，再进行死亡、金币和击杀后续事件，避免击杀改变AD导致不同目标倍率不同。

每次R仅允许一次ACTIVE→SETTLING转换；重复R2、超时回调或同帧竞态安全忽略。原始命中附伤只执行一次，最终倍率不重新触发普通攻击/技能附伤。合法吸血与全能吸血的回复在结算阶段执行一次。诺手R处决刷新与源氏击杀参与刷新在真正死亡后处理；D.Va致命伤只在结算后弹出机甲；DIO的P倒地不增加死亡、金币或复活倒计时。

## 飞刀与局部时间

W生成10～16个实体弹道，半径150，等待0.75秒，以1800速度朝圆心移动。每把刀独立碰撞、不穿透；同次W对各目标分别计数衰减。投射物进入半径135时停领域时裁剪至边界停止，保留速度、位置、飞行距离、剩余寿命和发射等待；恢复后从原处继续。未命中飞刀不进账，R结束后的新命中按正常后续伤害处理。

英雄、召唤物、持续技能、控制、位移、护盾与已有动作的时钟暂停。共享动画对象每个模拟步只调整一次，避免亚索等双角色动作被重复暂停。DIO真正死亡、实体移除、页面离开、存档恢复与实际水晶胜负结束均有清理路径。

## Excel

交付文件outputs/v13-2/MOBA_Config_V13_2.xlsx；同步原config/MOBA_Config_V9_1.xlsx及桌面MOBA_Config_V9_1.xlsx。保留英雄、符文、装备3张表，新增101条DIO记录。与发布前版本逐行比较，其他英雄1622行、符文598行、装备1317行的数据完全保留（行数含标题）。

百分比在Excel中存储用户约定的百分点数，例如damage_settlement_pct_per_total_ad单元格为0.1，单位为%，编译后为0.001；damage_settlement_base_pct为100，编译后为1。所有伤害与结算公式读取编译后的Excel参数。

文档未指定蓝耗，沿用技能升级减少蓝耗的项目约定，采用可调整默认：Q60/58/56/54/52，W70/67/64/61/58，E50/48/46/44/42，R100/95/90；W前摇0.15秒、后摇0.1秒、飞刀碰撞半径8也标为项目默认。DIO基础回复按本版本7HP/5秒、8MP/5秒实现，其余英雄原有回复倍率不变。

| Excel参数 | 原始值 |
| --- | --- |
| DIO.BASE.hp_base | 640 |
| DIO.BASE.hp_growth | 105 |
| DIO.BASE.ad_base | 63 |
| DIO.BASE.ad_growth | 3.7 |
| DIO.BASE.armor_base | 33 |
| DIO.BASE.armor_growth | 4.5 |
| DIO.BASE.mr_base | 32 |
| DIO.BASE.mr_growth | 2 |
| DIO.BASE.mana_base | 400 |
| DIO.BASE.mana_growth | 45 |
| DIO.BASE.as_base | 0.67 |
| DIO.BASE.as_ratio | 0.67 |
| DIO.BASE.as_growth | 2.5 |
| DIO.BASE.move_speed | 218 |
| DIO.BASE.attack_range | 150 |
| DIO.BASE.hp_regen_base | 7 |
| DIO.BASE.hp_regen_growth | 0 |
| DIO.BASE.mana_regen_base | 8 |
| DIO.BASE.mana_regen_growth | 0 |
| DIO.BASE.ap_base | 0 |
| DIO.BASE.regeneration_multiplier | 1 |
| DIO.P.revive_delay | 2.5 |
| DIO.P.revive_hp_pct | 40 |
| DIO.P.revive_mana_pct | 100 |
| DIO.P.cooldown | 180 |
| DIO.Q.cast_duration | 1.5 |
| DIO.Q.range | 275 |
| DIO.Q.width | 110 |
| DIO.Q.min_punch_count | 10 |
| DIO.Q.max_punch_count | 16 |
| DIO.Q.base_total_damage | 100 / 150 / 200 / 250 / 300 |
| DIO.Q.bonus_ad_ratio_pct | 175 |
| DIO.Q.move_speed_multiplier_pct | 60 |
| DIO.Q.cooldown | 12 / 11 / 10 / 9 / 8 |
| DIO.Q.mana_cost | 60 / 58 / 56 / 54 / 52 |
| DIO.Q.windup | 0 |
| DIO.Q.backswing | 0 |
| DIO.W.cast_range | 300 |
| DIO.W.ring_radius | 150 |
| DIO.W.min_knife_count | 10 |
| DIO.W.max_knife_count | 16 |
| DIO.W.launch_delay | 0.75 |
| DIO.W.projectile_speed | 1800 |
| DIO.W.projectile_radius | 8 |
| DIO.W.base_damage_per_knife | 15 / 25 / 40 / 55 / 70 |
| DIO.W.bonus_ad_ratio_pct | 15 |
| DIO.W.min_full_damage_hits | 1 |
| DIO.W.max_full_damage_hits | 6 |
| DIO.W.damage_decay_per_hit_pct | 10 |
| DIO.W.minimum_damage_multiplier_pct | 10 |
| DIO.W.cooldown | 15 / 14 / 13 / 12 / 11 |
| DIO.W.mana_cost | 70 / 67 / 64 / 61 / 58 |
| DIO.W.windup | 0.15 |
| DIO.W.backswing | 0.1 |
| DIO.E.windup | 0.25 |
| DIO.E.teleport_range | 350 |
| DIO.E.move_speed_bonus_pct | 25 |
| DIO.E.move_speed_duration | 1.5 |
| DIO.E.cooldown | 18 / 16.5 / 15 / 13.5 / 12 |
| DIO.E.mana_cost | 50 / 48 / 46 / 44 / 42 |
| DIO.E.backswing | 0 |
| DIO.R.cast_range | 375 |
| DIO.R.radius | 135 |
| DIO.R.max_duration | 2.5 |
| DIO.R.cooldown | 120 / 100 / 80 |
| DIO.R.mana_cost | 100 / 95 / 90 |
| DIO.R.windup | 0 |
| DIO.R.backswing | 0 |
| DIO.R.manual_end_enabled | true |
| DIO.R.second_cast_enabled | true |
| DIO.R.second_cast_mana_cost | 0 |
| DIO.R.second_cast_cooldown_reset | false |
| DIO.R.auto_settle_on_timeout | true |
| DIO.R.defer_damage | true |
| DIO.R.defer_death | true |
| DIO.R.damage_settlement_enabled | true |
| DIO.R.damage_settlement_base_pct | 100 |
| DIO.R.damage_settlement_pct_per_total_ad | 0.1 |
| DIO.R.damage_settlement_uses_total_ad | true |
| DIO.R.damage_settlement_ad_snapshot | SETTLEMENT_TIME |
| DIO.R.damage_settlement_enemy_only_bonus | true |
| DIO.R.damage_settlement_once | true |
| DIO.R.freeze_allies | true |
| DIO.R.freeze_enemies | true |
| DIO.R.caster_immune | true |
| DIO.R.freeze_projectiles | true |
| DIO.R.freeze_own_w_projectiles | true |
| DIO.R.resume_projectiles_after_end | true |
| DIO.R.interrupt_casts | false |

## 实际验证

DIO专项55项通过：P不计死亡及复起，等级成长、10～16拳/刀、Q第一目标阻挡和60%移动、W衰减、E合法瞬移、R范围/时长/二段、500×1.4=700、多目标独立账本、物理/魔法/真实伤害、防御只算一次、护盾与治疗时间线、不提前击杀/发钱、吸血一次、飞刀边界暂停/恢复、0.8秒提前结束不结算未来拳击、Darius/Illaoi/Genji/D.Va/Yasuo联动、实体销毁与实际胜负清理、共享时钟和15/60/120渲染频率下固定模拟一致。

完整458项回归通过；其后追加2项DIO Excel编译/非法参数校验并通过。完整回归日志：outputs/v13-2/tests-full.log。DIO专项日志：outputs/v13-2/tests-dio.log。测试数量与退出状态以最终发布记录release.json为准。

网页实机验证：选择DIO并学习Q/W/E；观察独立世界模型和飞刀环；学习R后按钮显示“结束时停”、0额外蓝耗，再次按R后恢复冷却显示。实机未捕获控制台错误，观测23x FPS区间、60Hz模拟、平均逻辑约1.58ms（特定设备和场景的样本，不是全部设备帧率保证）。

## 实现边界

本项目继续使用浏览器本地人机战斗引擎，由同一60Hz模拟负责数值、界面和伤害结果；线上托管是静态站点。模型与动画为程序生成3D美术。V13.2核心英雄与时停结算功能已实现；没有把本次修改描述为新增联网权威服务器。

P倒地不视作真正死亡，因此不提前终止已有R；倒地时不能手动二段，原有R仍按2.5秒上限正常结算。真正死亡则立即提前结算并解除冻结。
