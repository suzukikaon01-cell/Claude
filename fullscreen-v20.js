/* V20 全屏：顶栏全屏按钮（支持的浏览器直接全屏并尽量锁定横屏）；iPhone Safari 不支持网页全屏时提示“添加到主屏幕”。 */
(()=>{'use strict';
const doc=document,root=doc.documentElement,bar=doc.querySelector('.header-actions');if(!bar||doc.getElementById('fullscreenBtn'))return;
const standalone=()=>matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const active=()=>doc.fullscreenElement||doc.webkitFullscreenElement;
const request=root.requestFullscreen||root.webkitRequestFullscreen,exit=doc.exitFullscreen||doc.webkitExitFullscreen;
const enabled=!!request&&(doc.fullscreenEnabled??doc.webkitFullscreenEnabled??true);
const ios=/iP(hone|od|ad)/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
if(standalone())root.classList.add('app-fullscreen');
if(standalone()&&!enabled)return; // 已经从主屏幕全屏打开，不需要按钮
const btn=doc.createElement('button');btn.id='fullscreenBtn';btn.setAttribute('aria-label','全屏');btn.textContent='⛶';bar.insertBefore(btn,bar.querySelector('#helpBtn')||null);
let tip;function hint(text){tip?.remove();tip=doc.createElement('div');tip.className='fullscreen-tip';tip.textContent=text;doc.body.appendChild(tip);setTimeout(()=>tip?.remove(),5000)}
const sync=()=>{let on=!!active();root.classList.toggle('app-fullscreen',on||standalone());btn.textContent=on?'🗗':'⛶';btn.setAttribute('aria-label',on?'退出全屏':'全屏')};
btn.addEventListener('click',async()=>{if(active()){try{await exit.call(doc)}catch{}return}
 if(!enabled){hint(ios?'iPhone 的 Safari 不支持网页全屏：点 分享 → 添加到主屏幕，再从主屏幕打开就是全屏':'当前页面不允许全屏，请在浏览器里直接打开游戏网址');return}
 try{await request.call(root,{navigationUI:'hide'});try{await screen.orientation?.lock?.('landscape')}catch{}}catch{hint('全屏失败，请在浏览器里直接打开游戏网址')}});
for(let ev of ['fullscreenchange','webkitfullscreenchange'])doc.addEventListener(ev,sync);
})();
