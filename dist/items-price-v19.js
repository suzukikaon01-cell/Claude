/* V19 装备价格按属性重新平衡 + 合成路径平滑 + 百分比穿甲唯一规则。
 * 价格 = 属性金币价值折算（传说装备额外计入被动价值），全部取整到 50 的倍数；三相之力固定 3333。
 * 合成约束：配件全部买齐后，最终合成补差价不超过 1100，也不低于 50。
 * 计算自底向上：先定基础配件，再定进阶配件，最后传说装备；鞋子与特殊/叠层装备只取整到 50。
 */
(()=>{'use strict';
const C=window.GAME_CONFIG;if(!C?.items)return;
const UNIT=50,MAX_COMBINE=1100,MIN_COMBINE=50,FIXED={trinity:3333};
const GOLD={attack:35,ap:20,hp:2.67,mana:1.4,armor:20,mr:18,bonusAS:2500,crit:4000,lifesteal:3750,omnivamp:4000,movePct:3950,abilityHaste:26.67,armorPenPct:6000,magicPenPct:6000,magicPenFlat:31,armorPenFlat:30,baseHpRegenPct:300,healShieldPower:3000,tenacity:2000,slowResistance:1500,speed:12,baseManaRegenPct:200};
// 不计入面板、但属于属性的隐藏加成（按属性计价）。
const HIDDEN={DIMENSION_BLADE:{attack:C.items.find(i=>i.id==='DIMENSION_BLADE')?.params?.ex_attack??42}};
// 不参与按属性定价：叠层/特殊装备、三级鞋（升级本身不花钱）、无属性功能件、消耗品。
const KEEP=new Set(['SWORD_OF_THE_OCCULT','MEJAIS_SOULSTEALER','seraph','B_2422']);
const r50=v=>Math.max(UNIT,Math.round(v/UNIT)*UNIT);
const byId=new Map(C.items.map(i=>[i.id,i]));
function statValue(it){let v=0;for(let [k,x] of Object.entries({...(it.stats||{}),...(HIDDEN[it.id]||{})}))if(x&&GOLD[k])v+=GOLD[k]*x;return v}
const tierOf=it=>it.tier||it.params?.tier,recipeOf=it=>{if(Array.isArray(it.recipe))return it.recipe;try{return JSON.parse(it.params?.recipe||'[]')}catch{return[]}},legendary=it=>tierOf(it)==='LEGENDARY',isBoots=it=>it.boots||/^BOOTS/.test(tierOf(it)||'')||it.category==='boots';
function target(it){let sv=statValue(it);if(legendary(it))return Math.min(3500,Math.max(2400,sv*.8+600));if(isBoots(it))return it.cost;if(sv<=0)return it.cost;return sv*.95}
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
