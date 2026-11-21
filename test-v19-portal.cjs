// V19 大乱斗传送门：靠近己方传送门时推塔键变为传送键，按下传送；远离或冷却时不误触发。
const make=require('./test-harness.cjs'),assert=require('assert');let count=0;
const test=(name,f)=>{f();console.log('PASS V19P '+name);count++};
function aram(){let h=make();h.a.reset('garen',true,'ARAM');return h}
test('near own portal: tower button becomes glowing teleport and teleports',()=>{let h=aram(),p=h.a.p,rt=h.a.modeRuntime,portal=rt.exportState().portals.find(v=>v.team===p.team);assert(portal,'portal exists');p.x=portal.x;p.y=portal.y;assert(rt.portalState(p).near&&rt.portalState(p).ready);h.a.updatePortalButton();let b=h.env.document.getElementById('towerAttack');assert(/传送/.test(b.innerHTML));assert(h.a.tryPortalButton());assert(p.aramPortal,'portal started')});
test('away from portal: tower button stays a tower-attack button and does not teleport',()=>{let h=aram(),p=h.a.p,rt=h.a.modeRuntime;let portal=rt.exportState().portals.find(v=>v.team===p.team);p.x=portal.x+2000;p.y=portal.y-2000;assert(!rt.portalState(p).near);h.a.updatePortalButton();assert(/推塔/.test(h.env.document.getElementById('towerAttack').innerHTML));assert(!h.a.tryPortalButton());assert(!p.aramPortal)});
test('summoners rift never shows the teleport button',()=>{let h=make();h.a.reset('garen',true);h.a.updatePortalButton();assert(/推塔/.test(h.env.document.getElementById('towerAttack').innerHTML));assert(!h.a.tryPortalButton())});
console.log('V19 portal tests passed: '+count);
