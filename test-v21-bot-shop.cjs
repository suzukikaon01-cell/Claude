// V21 AI 出装：按推荐出装合成传说装备，鞋子升级为二级鞋，不会被廉价组件塞满装备栏。
const make=require('./test-harness.cjs'),assert=require('assert');let count=0;const test=(n,f)=>{f();console.log('PASS BotShop '+n);count++};
for(let hero of ['ashe','lux','garen','dva','genji']){test(hero+' builds legendaries and T2 boots',()=>{let h=make();h.a.reset('garen',true,'SR');let I=h.env.ItemSystem,b=h.a.units.find(v=>v.type==='hero'&&!v.player);b.hero=hero;b.items=[];b.gold=0;for(let i=0;i<10;i++){b.gold+=1500;h.env.RiftArena.botShop(b)}let legend=b.items.filter(id=>I.get(id)?.tier==='LEGENDARY'&&!I.get(id)?.boots).length,t2=b.items.some(id=>I.get(id)?.boots&&id!=='boots');assert(legend>=3,hero+' legendaries '+b.items.join());assert(t2,hero+' T2 boots '+b.items.join())})}
console.log(count+' bot shop tests passed');
