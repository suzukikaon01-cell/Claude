// Project-specific V5 balance, not official Wild Rift values.
window.ZeroGrowth={
 soft(stacks,rate,knee,tail){let s=Math.max(0,stacks||0);return Math.min(s,knee)*rate+Math.max(0,s-knee)*tail},
 sync(u,notify=()=>{}){if(u.hero!=='zero')return;u.entropy=Math.max(0,u.entropy||0);u.evolutions??=[false,false,false,false];for(let i=0;i<4;i++)if(!u.evolutions[i]&&u.entropy>=GAME_CONFIG.zeroEvolution.thresholds[i]){u.evolutions[i]=true;notify(i)}},
 set(u,stacks,notify){u.entropy=Math.max(0,stacks);this.sync(u,notify)},
 evolved(u,i){return !!u.evolutions?.[i]},
 stackDamage(u,i){let s=u.skills[i];return this.soft(u.entropy,s.stackRatio||0,s.stackSoftCap??Infinity,s.stackAfterCap||0)},
 healing(u){let s=u.skills[2];return ChampionRules.rank(s.heal,u.skillRanks[2])+s.healApRatio*u.ap+this.soft(u.entropy,s.healStackRatio,s.healStackSoftCap,s.healStackAfterCap)},
 duration(u){let s=u.skills[2];return Math.min(s.durationCap,s.durationBase+s.durationPerStack*u.entropy)},
 next(u){let i=GAME_CONFIG.zeroEvolution.thresholds.findIndex((n,i)=>!u.evolutions?.[i]);return i<0?null:{skill:'QWER'[i],threshold:GAME_CONFIG.zeroEvolution.thresholds[i]}},
 snapshot(u){return{entropy:u.entropy,evolutions:[...(u.evolutions||[false,false,false,false])]}},
 restore(u,saved){u.evolutions=[false,false,false,false];this.set(u,Number.isFinite(saved.entropy)?saved.entropy:0);return this.snapshot(u)}
};
