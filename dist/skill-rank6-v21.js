/* V21 小技能（Q/W/E）新增第 6 级：所有 5 段数值数组按原本 4→5 级的增量再延伸一级（冷却等递减数值同样延续，且不低于 5 级的一半）。
 * 只有完成上单分路任务（等级上限 20）的英雄才能把小技能升到 6 级；其他英雄仍为 5 级上限。 */
(function(){let C=window.GAME_CONFIG;if(!C||C._rank6)return;C._rank6=true;
 const next=a=>{let d=a[4]-a[3],v=a[4]+d;if(d<0)v=Math.max(a[4]*.5,v);return Math.round(v*1000)/1000},ok=a=>Array.isArray(a)&&a.length===5&&a.every(v=>typeof v==='number'&&Number.isFinite(v)),fail=[];
 const walk=(o,depth=0)=>{if(!o||typeof o!=='object'||depth>2)return;for(let k of Object.keys(o)){let v=o[k];if(ok(v)){try{o[k]=[...v,next(v)]}catch(e){}if(o[k]?.length!==6)fail.push(k)}else if(v&&typeof v==='object'&&!Array.isArray(v))walk(v,depth+1)}};
 for(let [id,h] of Object.entries(C.heroes||{})){for(let i=0;i<3;i++){let s=h.skills?.[i];if(!s)continue;walk(s);s.maxRank=6}
  let seen=new Set();for(let p of [C.heroParams?.[id],h.params])if(p&&!seen.has(p)){seen.add(p);for(let g of ['Q','W','E'])walk(p[g])}}
 window.SKILL_RANK6={canRank6:u=>!!u?.questRank6,failed:fail};
})();
