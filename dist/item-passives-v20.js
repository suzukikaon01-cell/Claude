/* V20 装备说明：每个被动/主动单独一条并带名字；伤害类型着色（物理橙/魔法蓝/真实白），回复为绿色。
 * 同名被动只生效一个（见 ItemPassivesV20.activeNames / 购买提示）。 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
// 传说装备：被动名字 + 简洁说明（与实际效果一致）。
const NAMED={
 infinity:[['完美','暴击伤害+35%（默认175%，出无尽后210%）。']],
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
 KNIGHTS_VOW:[['献身（主动）','绑定1000码内的一名友方英雄。'],['牺牲','绑定的队友在附近时，替其承受14%伤害，并按其对英雄造成伤害的12%回复生命。']],
 ZEKES_CONVERGENCE:[['霜火风暴','施放大招后，周围产生5秒冰霜风暴，对附近英雄持续造成魔法伤害并减速30%。']],
 WINTERS_APPROACH:[['法力流','攻击和技能命中提高最大法力，叠满360层进化为末日寒冬。'],['末日寒冬','控制敌方英雄时获得基于法力的护盾。']],
 GIANT_MAW:[['巨颚','普攻额外造成自身最大生命1.5%的物理伤害，并对目标身后350码、90°扇形内的敌人造成同等伤害（远程60%）。']],
 FORGED_HEART:[['熔铸','获得额外生命2.5%的攻击力。'],['困兽','生命低于50%时，按已损失生命额外获得最多10%攻击力。']],
 CHOCO_ICE:[['冰冻','对敌人造成伤害后使其减速30%，持续1秒。'],['美味巧乐兹','受到的治疗效果提升25%。']],
 VOID_SPEAR:[['亚空裂隙','击杀或助攻敌方英雄后，当前大招剩余冷却减少20%。'],['亚空灼烧','技能命中附带3秒灼烧，共造成5+1%法强的魔法伤害（重复命中刷新）。'],['亚空汲能','每击杀3个小兵/野怪，或击杀/助攻敌方英雄，或击杀史诗野怪，获得1%攻击速度（最多+25%）。']],
 GARGOYLE_MASK:[['石像之躯','生命低于75%时受到的治疗效果提升，生命越低越高（30%生命时+25%）。'],['不屈','受到致命伤害时免疫这次死亡，并在5秒内回复35%已损失生命（冷却180秒）。']],
 DIMENSION_BLADE:[['属性激化','普攻和技能每次命中附带10～28（随等级）魔法伤害，无冷却（装备、召唤师技能伤害不触发）。'],['基础攻击强化EX','额外获得42攻击力（不计入面板）。'],['锋利度强化','30%护甲穿透（百分比穿甲装备只能持有一件）。'],['黑蚀龙之力','战斗中受侵蚀，每秒损失1%最大生命（不会致死）；对敌方英雄累计造成80+12×等级伤害后克服侵蚀，回复12%已损失生命，并获得25%暴击率，持续15秒。侵蚀冷却30秒。'],['霸主之魂','受到致命伤害时免疫这次死亡，1.5秒无敌（冷却180秒）。']]
};
// V20.4 全部装备被动写出具体数值（与实际生效参数一致）。
Object.assign(NAMED,{
 infinity:[['完美','暴击伤害+35%（默认175%，出无尽后210%）。']],
 bork:[['雾之锋','普攻附带目标当前生命8.5%（远程7%）的物理伤害，至少15点，对野怪最多100点。'],['虹吸','连续3次普攻命中英雄后，使其减速30%持续1.5秒（冷却30秒）。']],
 blood:[['灵液护盾','生命偷取溢出的治疗转化为护盾，护盾上限165～345（随等级）。']],
 trinity:[['咒刃','施放技能后10秒内，下一次普攻额外造成200%基础攻击力的物理伤害（冷却1.5秒）。'],['迅捷','普攻命中后获得20移动速度（远程10），持续2秒。']],
 cleaver:[['切割','对敌方英雄造成物理伤害时叠1层，每层削减6%护甲，最多5层（30%），持续6秒。'],['狂怒','造成物理伤害后获得20移动速度，叠满5层的目标在前方时改为40（远程减半），持续2秒。']],
 mortal:[['重伤','造成物理伤害时施加3秒重伤：目标生命高于60%时治疗效果−40%，低于40%时−60%，之间线性变化。']],
 youmuu:[['幽魂步伐','脱离英雄战斗3秒后获得30移动速度（远程20）。']],
 deathdance:[['无视痛苦','受到的物理/魔法伤害中30%（远程12%）延后，3秒后分12段以真实伤害结算。'],['蔑视','参与击杀英雄时清除剩余延后伤害，并在2秒内回复90%额外攻击力的生命。']],
 guardian:[['救主灵刃','受到致命伤害时进入4秒复活状态，随后回复50%基础生命和30%最大法力（冷却180秒）。']],
 phantom:[['幽影华尔兹','普攻命中英雄时叠1层，每层+6%攻击速度、+1%移动速度，最多5层，持续6秒。']],
 deathcap:[['魔法乐章','法术强度提高30%。']],
 luden:[['回声','技能命中时对主目标及最多5个附近敌人额外造成75+8%法强的魔法伤害；附近每少1个目标，主目标再+20+1.2%法强（冷却9秒）。']],
 liandry:[['折磨','技能使敌人灼烧3秒，每秒造成目标最大生命2%的魔法伤害。'],['苦难','与敌方英雄战斗中每秒造成的伤害+2%，最多+6%。']],
 orb:[['无限法则','对生命低于40%的敌人造成的魔法伤害+20%。']],
 void:[['虚空','获得40%法术穿透。']],
 morello:[['重伤','造成魔法伤害时施加3秒、50%的重伤。']],
 archangel:[['敬畏','获得相当于最大法力1%的法术强度。'],['法力增幅','技能命中时+14最大法力（每10秒最多3次），叠满700点进化为炽天使之拥。']],
 riftmaker:[['虚空腐蚀','与敌方英雄战斗中每秒造成的伤害+2%，最多+8%；叠满时获得10%全能吸血（远程6%）。'],['虚空注能','获得相当于额外生命2%的法术强度。']],
 rylai:[['冰霜','伤害型技能命中后使目标减速30%，持续0.75秒。']],
 lich:[['咒刃','施放技能后10秒内，下一次普攻额外造成75%基础攻击力+45%法强的魔法伤害（冷却1.5秒）。']],
 heartsteel:[['巨像之力','在700码内的敌方英雄附近停留2.5秒后，下一次对其普攻额外造成140+3.5%自身最大生命的物理伤害，并永久获得该伤害15%的最大生命（每名英雄冷却20秒）。']],
 sunfire:[['献祭','每秒对325码内敌人造成20+1.5%额外生命的魔法伤害（野怪×1.3，小兵×1.75～2.5）。']],
 thornmail:[['荆棘','被普攻命中时，对攻击者造成20+6%额外护甲+1%额外生命的魔法伤害，并施加3秒、50%的重伤。']],
 armor:[['坚如磐石','受到的普通攻击伤害降低5+0.35%最大生命点，至多为该次伤害的40%。'],['暴击抵抗','受到的暴击伤害降低30%。']],
 frozen:[['凛冬之抚','650码内的敌方英雄攻击速度降低25%。']],
 nature:[['坚毅','受到敌方英雄魔法伤害时叠1层，持续7秒；叠满4层时获得70魔抗和6%移动速度。']],
 warmog:[['狂徒之心','额外生命达到1250且5秒未受伤时，每秒回复3.5%最大生命；受到的治疗和护盾效果+30%。']],
 twinguard:[['坚忍','与英雄战斗中每秒叠1层，满5层时额外护甲和额外魔抗+30%、获得20%韧性，体型增大20%。']],
 deadman:[['动能','移动时积攒动能（每15码1层，最多100层），满层时+40移动速度，下一次普攻额外造成100魔法伤害（近战还减速50%，持续1秒）。']],
 kaenic:[['魔法护盾','12秒未受到魔法伤害时，获得50～150（随等级）+14%最大生命、只吸收魔法伤害的护盾。']],
 SWORD_OF_THE_OCCULT:[['荣耀','击杀英雄+4层，助攻+2层，最多25层，阵亡失去10层；每层+3攻击力。'],['激励','叠到10层以上时获得10%移动速度。']],
 MEJAIS_SOULSTEALER:[['荣耀','击杀英雄+4层，助攻+2层，最多25层，阵亡失去10层；每层+5法术强度。'],['激励','叠到10层以上时获得10%移动速度。']],
 nashor:[['兼容','无额外被动（旧版纳什之牙，仅提供属性）。']],
 seraph:[['敬畏','获得相当于最大法力3%的法术强度。'],['生命线','生命降到35%以下时，获得100+15%当前法力的护盾，持续3秒（冷却60秒）。']],
 KRAKEN_SLAYER:[['击沉','每第3次普攻额外造成120～160（随等级）物理伤害，目标已损失生命越多伤害越高（最多+50%）；远程为80%。']],
 THE_COLLECTOR:[['死亡与税','对生命低于5%的敌方英雄造成伤害时直接将其处决。'],['分赃','击杀英雄额外获得25金币。']],
 NAVORI_FLICKERBLADE:[['超越','普攻命中时，Q/W/E的剩余冷却减少15%（不影响大招）。']],
 GUINSOOS_RAGEBLADE:[['怒火','普攻额外造成30魔法伤害，并叠1层+8%攻击速度，最多4层，持续4秒。'],['幻影打击','叠满4层后，每第3次普攻额外触发一次攻击特效。']],
 RUNAANS_HURRICANE:[['风之怒','普攻时向450码内另外2个敌人发射弩箭，各造成55%攻击力的物理伤害（可暴击）。']],
 LORD_DOMINIKS_REGARDS:[['巨人杀手','目标额外生命比自己多时，每多1点造成的伤害提高，最多+15%（额外生命差达到1500时）。']],
 SERYLDAS_GRUDGE:[['苦楚','技能对生命低于50%的敌人造成伤害时，使其减速30%，持续1秒。']],
 ECLIPSE:[['永升月蚀','2秒内用两次不同的攻击或技能命中英雄时，获得160+40%额外攻击力的护盾，持续2秒（远程60%，冷却6秒）。']],
 SPEAR_OF_SHOJIN:[['龙之力','获得25基础技能急速。'],['专注意志','技能命中叠1层，每层技能伤害+3%，最多4层，持续6秒（不增强真实伤害）。']],
 RAVENOUS_HYDRA:[['顺劈','普攻对目标350码内的其他敌人造成40%攻击力的物理伤害。'],['饥渴斩击（主动）','对350码内敌人造成100%攻击力的物理伤害（冷却10秒）。']],
 SHADOWFLAME:[['煤渣绽放','对生命低于40%的敌人造成的魔法伤害×1.2。']],
 STORMSURGE:[['狂风','2.5秒内对一名敌方英雄造成其25%最大生命的伤害后，2秒后对其600码范围造成125+10%法强的魔法伤害（冷却30秒）。']],
 NASHORS_TOOTH:[['艾卡西亚之咬','普攻额外造成15+15%法强的魔法伤害。']],
 HORIZON_FOCUS:[['超视距','600码外的技能命中英雄后使其显形6秒，并使其1400码内的其他敌方英雄显形3秒。']],
 COSMIC_DRIVE:[['狂热','对英雄造成魔法或真实伤害后获得20移动速度，持续4秒。']],
 MALIGNANCE:[['憎恨之雾','获得20终极技能急速；大招对英雄造成伤害时，在其脚下生成250码灼烧区域3秒，每秒造成60+5%法强的魔法伤害并降低10魔抗（每名目标冷却3秒）。']],
 CRYPTBLOOM:[['生命绽放','3秒内参与击杀英雄时，为600码内的友方英雄回复100+25%法强的生命（冷却60秒）。']],
 BANSHEES_VEIL:[['废除','格挡下一个敌方技能（冷却40秒，与英雄战斗后重新计时）。']],
 ZHONYAS_HOURGLASS:[['凝滞（主动）','进入2.5秒无敌且无法行动的凝滞状态（冷却120秒）。']],
 HEXTECH_ROCKETBELT:[['超音速（主动）','向前冲刺275码，并发射7枚火箭，每枚造成100+10%法强的魔法伤害（冷却40秒）。']],
 JAKSHO_THE_PROTEAN:[['虚空坚韧','与英雄持续战斗5秒后，额外护甲和额外魔抗提高30%。']],
 UNENDING_DESPAIR:[['绝望','与英雄战斗中每0.25秒对650码内敌方英雄造成1.875+0.1875%额外生命的魔法伤害，并回复造成伤害250%的生命。']],
 HOLLOW_RADIANCE:[['献祭','受到或造成伤害后3秒内，每0.25秒对325码内敌人造成3.75+0.4375%额外生命的魔法伤害。'],['灭世','击杀敌人时对其周围造成20+3.5%最大生命的魔法伤害。']],
 ICEBORN_GAUNTLET:[['咒刃','施放技能后10秒内，下一次普攻额外造成150%基础攻击力的物理伤害，并在目标周围300码生成冰霜区域，减速30%持续2秒（冷却1.5秒）。']],
 SPIRIT_VISAGE:[['无拘活力','受到的治疗和护盾效果+25%。']],
 ABYSSAL_MASK:[['亵渎','700码内的敌方英雄受到的魔法伤害+12%。']],
 LOCKET_OF_THE_IRON_SOLARI:[['奉献（主动）','为600码内的友方英雄提供290～360（随等级）的护盾，持续2.5秒（冷却90秒）。']],
 KNIGHTS_VOW:[['献身（主动）','绑定1000码内的一名友方英雄。'],['牺牲','绑定的队友在1000码内时，替其承受14%伤害，并按其对英雄造成伤害的12%回复生命。']],
 ZEKES_CONVERGENCE:[['霜火风暴','施放大招后5秒内，自身周围350码形成风暴，每秒造成30魔法伤害并减速30%（冷却45秒）。']],
 WINTERS_APPROACH:[['法力流','普攻和技能命中+3最大法力（英雄×2），叠满360点进化为末日寒冬。'],['末日寒冬','控制敌方英雄时获得100+4.5%当前法力的护盾，持续3秒（冷却8秒）。']],
 GIANT_MAW:[['巨颚','普攻额外造成自身最大生命1.5%的物理伤害，并对目标身后350码、90°扇形内的敌人造成同等伤害（远程60%）。']],
 FORGED_HEART:[['熔铸','获得额外生命2.5%的攻击力。'],['困兽','生命低于50%时，按已损失生命额外获得最多10%攻击力。']],
});

// V20.4 鞋子：铁板靴受到的普通攻击伤害−12%（DIO/亚索Q等附带攻击特效的技能也算普攻，实际判定在 items-v139 incoming 的 meta.basic）。
// 修正鞋子说明里错写成 0 的数值。
{let it=id=>C.items.find(i=>i.id===id),pp=id=>C.itemParams?.[id];
 let st=it('B_3047');if(st&&pp('B_3047')){pp('B_3047').attack_reduction=.12;st.passive='25护甲；45移动速度；；镀板；受到的普通攻击伤害降低12%。'}
 let pl=it('B_3174'),pd=pp('B_3174');if(pl&&pd)pl.passive='35护甲；45移动速度；；镀板；受到的普通攻击伤害降低'+Math.round(pd.attack_reduction*100)+'%。；；诺克萨斯的耐久；受到敌方英雄的物理伤害后，获得'+pd.shield_min+'～'+pd.shield_max+'（随等级）+'+Math.round(pd.shield_bonus_hp_ratio*100)+'%额外生命的物理护盾，持续'+pd.shield_duration+'秒（冷却'+pd.shield_cooldown+'秒）。';
 let ch=it('B_3173'),cd=pp('B_3173');if(ch&&cd)ch.passive='25魔法抗性；45移动速度；30%韧性；；诺克萨斯的不懈；受到敌方英雄的魔法伤害后，获得'+cd.shield_min+'～'+cd.shield_max+'（随等级）+'+Math.round(cd.shield_bonus_hp_ratio*100)+'%额外生命的魔法护盾，持续'+cd.shield_duration+'秒（冷却'+cd.shield_cooldown+'秒）。';
 let cr=it('B_3171'),rd=pp('B_3171');if(cr&&rd)cr.passive='20技能急速；45移动速度；；艾欧尼亚的洞悉；获得20召唤师技能急速。；；诺克萨斯的急速；用技能增强或保护友军、用技能对敌军造成伤害或施放召唤师技能后，获得'+Math.round(rd.move_buff_melee*100)+'%移动速度（远程'+Math.round(rd.move_buff_ranged*100)+'%），持续'+rd.move_buff_duration+'秒。';
 for(let id of ['B_3047','B_3174','B_3173','B_3171'])if(it(id))it(id).desc=it(id).passive;}
// V20.4 组件说明补数值。
{let it=id=>C.items.find(i=>i.id===id),pp=id=>C.itemParams?.[id]||{},set=(id,t)=>{let x=it(id);if(x){x.passive=t;x.desc=t}};
 set('C_3057','10技能急速；；咒刃；施放技能后10秒内，下一次普攻额外造成'+Math.round((pp('C_3057').spellblade_base_ad_ratio||1)*100)+'%基础攻击力的物理伤害（冷却1.5秒）。');
 set('C_3145','45法术强度；；转速加快；对敌方英雄造成伤害时，额外造成'+(pp('C_3145').proc_min||50)+'～'+(pp('C_3145').proc_max||125)+'（随等级）魔法伤害（冷却'+(pp('C_3145').cooldown||40)+'秒）。');
 set('C_3082','40护甲；；坚如磐石；受到的普通攻击伤害降低'+(pp('C_3082').reduction_flat||5)+'+'+((pp('C_3082').reduction_per_max_hp||.0035)*100).toFixed(2).replace(/0+$/,'')+'%最大生命点，最多降低'+Math.round((pp('C_3082').reduction_cap||.2)*100)+'%。');
 set('C_3077','25攻击力；；顺劈；普攻对目标'+(pp('C_3077').cleave_radius||350)+'码内的其他敌人造成'+Math.round((pp('C_3077').cleave_ratio||.2)*100)+'%攻击力的物理伤害。；；新月；主动对'+(pp('C_3077').active_radius||450)+'码内敌人造成'+Math.round((pp('C_3077').active_ratio||1)*100)+'%攻击力的物理伤害（冷却'+(pp('C_3077').cooldown||10)+'秒）。');
 set('C_4632','40法术强度；25魔法抗性；；废除；格挡下一个敌方技能（冷却'+(pp('C_4632').spellshield_cd||40)+'秒）。');}
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
