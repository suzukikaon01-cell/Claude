// V21 全英雄生命值按定位统一档位（1级 / 18级）。麦克雷保持用户指定的 2800。
(function(){const C=window.GAME_CONFIG;if(!C?.heroes)return;
const T={tank:[720,2950],bruiser:[660,2700],skirmisher:[620,2450],ranged:[580,2250]};
const R={garen:'tank',dva:'tank',zarya:'tank',darius:'bruiser',illaoi:'bruiser',sett:'bruiser',anvil:'bruiser',great_sword:'bruiser',dio:'bruiser',
 yasuo:'skirmisher',khazix:'skirmisher',genji:'skirmisher',masteryi:'skirmisher',longsword_hunter:'skirmisher',xuefeng:'skirmisher',
 ashe:'ranged',lux:'ranged',zero:'ranged',ana:'ranged',herrscher_of_the_void:'ranged',claude:'ranged'};
const X={dva:[700,2950],zarya:[700,2950],tracer:[560,2150]};
for(const id of Object.keys(C.heroes)){let v=X[id]||T[R[id]];if(!v)continue;let g=(v[1]-v[0])/17,h=C.heroes[id],s=h.stats;if(!s)continue;s.hp=v[0];(s.growth||(s.growth={})).hp=g;
 for(const b of new Set([C.heroParams?.[id]?.BASE,h.params?.BASE]))if(b){b.hp_base=v[0];b.hp_growth=g}}
C.hpTiers={T,R,X}})();
