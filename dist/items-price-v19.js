/* V19 装备价格按属性重新平衡 + 合成路径平滑 + 百分比穿甲唯一规则。
 * 价格 = 属性金币价值×0.9 + 被动价值（传说，限制2200～3700）；配件 = 属性价值×0.95 + 被动价值；全部取整到 50；三相之力固定 3333。
 * 合成约束：配件全部买齐后，最终合成补差价不超过 1100，也不低于 50。
 * 计算自底向上：先定基础配件，再定进阶配件，最后传说装备；鞋子与特殊/叠层装备只取整到 50。
 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
const UNIT=50,MAX_COMBINE=1100,MIN_COMBINE=50,FIXED={trinity:3333};
const GOLD={attack:35,ap:20,hp:2.67,mana:1.4,armor:20,mr:18,bonusAS:2500,crit:4000,lifesteal:3750,omnivamp:4000,movePct:3950,abilityHaste:26.67,armorPenPct:4000,magicPenPct:4000,magicPenFlat:31,armorPenFlat:30,baseHpRegenPct:300,healShieldPower:3000,tenacity:2000,slowResistance:1500,speed:12,baseManaRegenPct:200};
// 不计入面板、但属于属性的隐藏加成（按属性计价）。
const HIDDEN={DIMENSION_BLADE:{attack:C.items.find(i=>i.id==='DIMENSION_BLADE')?.params?.ex_attack??42}};
// 不参与按属性定价：叠层/特殊装备、三级鞋（升级本身不花钱）、无属性功能件、消耗品。
const KEEP=new Set(['SWORD_OF_THE_OCCULT','MEJAIS_SOULSTEALER','seraph','B_2422']);
// 被动/主动效果的金币价值（按强度估算）：价格 = 属性价值×0.9 + 被动价值（传说）；配件 = 属性价值×0.95 + 被动价值。
const PASSIVE={infinity:400,bork:700,blood:350,cleaver:650,mortal:450,youmuu:300,deathdance:600,guardian:1250,phantom:450,deathcap:700,luden:500,liandry:800,orb:450,void:150,morello:400,archangel:600,riftmaker:500,rylai:450,lich:550,heartsteel:700,sunfire:650,thornmail:600,armor:450,frozen:600,nature:500,warmog:600,twinguard:500,deadman:500,kaenic:550,nashor:200,
 KRAKEN_SLAYER:600,THE_COLLECTOR:450,NAVORI_FLICKERBLADE:600,GUINSOOS_RAGEBLADE:700,RUNAANS_HURRICANE:600,LORD_DOMINIKS_REGARDS:350,SERYLDAS_GRUDGE:400,ECLIPSE:500,SPEAR_OF_SHOJIN:650,RAVENOUS_HYDRA:600,SHADOWFLAME:450,STORMSURGE:500,NASHORS_TOOTH:500,HORIZON_FOCUS:300,COSMIC_DRIVE:300,MALIGNANCE:450,CRYPTBLOOM:300,BANSHEES_VEIL:600,ZHONYAS_HOURGLASS:750,HEXTECH_ROCKETBELT:600,
 JAKSHO_THE_PROTEAN:600,UNENDING_DESPAIR:650,HOLLOW_RADIANCE:550,ICEBORN_GAUNTLET:600,SPIRIT_VISAGE:450,ABYSSAL_MASK:550,LOCKET_OF_THE_IRON_SOLARI:650,KNIGHTS_VOW:600,ZEKES_CONVERGENCE:550,WINTERS_APPROACH:500,GIANT_MAW:700,FORGED_HEART:650,CHOCO_ICE:500,VOID_SPEAR:550,GARGOYLE_MASK:1100,DIMENSION_BLADE:1300,
 C_3057:450,C_3123:150,C_3077:250,C_6690:150,C_3044:150,C_2508:250,C_3916:200,C_3070:100,C_3076:200,C_3082:150,C_3066:100,C_3211:50,C_4632:300,C_2420:150,C_1043:300,C_3134:100,C_6670:200,C_2021:100,C_3801:100,C_6660:300,C_3147:250,C_3114:400,C_3086:100,C_3051:150,C_3024:100,C_3105:100,C_3144:150,C_3113:150,C_3802:100,C_3108:100,C_1057:50,C_1031:50,C_3035:100};
const r50=v=>Math.max(UNIT,Math.round(v/UNIT)*UNIT);
const byId=new Map(C.items.map(i=>[i.id,i]));
function statValue(it){let v=0;for(let [k,x] of Object.entries({...(it.stats||{}),...(HIDDEN[it.id]||{})}))if(x&&GOLD[k])v+=GOLD[k]*x;return v}
const tierOf=it=>it.tier||it.params?.tier,recipeOf=it=>{if(Array.isArray(it.recipe))return it.recipe;try{return JSON.parse(it.params?.recipe||'[]')}catch{return[]}},legendary=it=>tierOf(it)==='LEGENDARY',isBoots=it=>it.boots||/^BOOTS/.test(tierOf(it)||'')||it.category==='boots';
function target(it){let sv=statValue(it),pv=PASSIVE[it.id];if(legendary(it))return Math.min(3700,Math.max(2200,sv*.9+(pv??400)));if(isBoots(it))return it.cost;if(sv<=0)return pv!=null?pv+(it.cost||0)*0:it.cost;return sv*.95+(pv||0)}
const done=new Map;
function price(id,stack=new Set){if(done.has(id))return done.get(id);let it=byId.get(id);if(!it)return 0;if(stack.has(id))return it.cost;stack.add(id);
 let parts=recipeOf(it).filter(p=>byId.has(p)),sum=parts.reduce((a,p)=>a+price(p,stack),0),v;
 if(FIXED[id]!=null)v=FIXED[id];
 else if(KEEP.has(id))v=r50(it.cost);
 else if(tierOf(it)==='BOOTS_T3')v=sum; // 三级鞋：与二级鞋同价（升级不额外花钱）
 else{v=r50(target(it));if(parts.length){v=Math.min(v,sum+MAX_COMBINE);v=Math.max(v,sum+MIN_COMBINE);v=Math.floor(v/UNIT)*UNIT;if(v<sum+MIN_COMBINE)v+=UNIT}}
 done.set(id,v);return v}
for(let it of C.items)price(it.id);
for(let it of C.items){let v=done.get(it.id);if(!Number.isFinite(v))continue;let parts=recipeOf(it).filter(p=>byId.has(p)),sum=parts.reduce((a,p)=>a+done.get(p),0);
 it.cost=v;if(it.params){it.params.price=v;it.params.combine_cost=Math.max(0,v-sum)}if(C.itemParams?.[it.id]){C.itemParams[it.id].price=v;C.itemParams[it.id].combine_cost=Math.max(0,v-sum)}}
C.itemPricingV19={unit:UNIT,maxCombine:MAX_COMBINE,fixed:FIXED};

// 百分比护甲穿透传说装备（含黑色切割者）只能持有一件。
const PCT_PEN=C.items.filter(i=>legendary(i)&&((i.stats?.armorPenPct||0)>0||i.id==='cleaver')).map(i=>i.id);
C.percentArmorPenItems=PCT_PEN;
const I=window.ItemSystem;if(I?.validatePurchase){const v=I.validatePurchase;I.validatePurchase=(u,id,o={})=>{let r=v(u,id,o);if(!r?.ok||!PCT_PEN.includes(id))return r;let have=(u.items||[]).map(x=>typeof x==='string'?x:x?.id),q=I.quote?.(u,id),consumed=new Set((q?.used||[]).map(i=>have[i]));if(have.some((k,i)=>k!==undefined&&PCT_PEN.includes(k)&&!(q?.used||[]).includes(i)))return{ok:false,reason:'百分比穿甲装备只能持有一件'};return r}}
})();
