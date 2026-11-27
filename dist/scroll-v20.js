/* V20 滑动：页面（大厅、商店、符文、帮助等弹层）内任意位置上下滑动都能滚动。
 * 手指落点本身能滚就交给浏览器；不能滚（标题栏、按钮区、空白）时，带动该页面里可滚动范围最大的列表。 */
(()=>{'use strict';
const canScroll=e=>{if(!(e instanceof Element))return false;let s=getComputedStyle(e);return /(auto|scroll)/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+1};
function primary(overlay){let best=null,room=0;for(let e of [overlay,...overlay.querySelectorAll('*')]){if(!canScroll(e)||e.offsetParent===null&&e!==overlay)continue;let r=e.scrollHeight-e.clientHeight;if(r>room){room=r;best=e}}return best}
let drag=null;
document.addEventListener('touchstart',ev=>{drag=null;if(ev.touches.length!==1)return;let t=ev.target,overlay=t.closest?.('.overlay');if(!overlay||overlay.classList.contains('hidden'))return;if(t.closest('input[type=range],select,textarea,.no-swipe'))return;
 for(let e=t;e&&e!==overlay.parentElement;e=e.parentElement)if(canScroll(e))return; // 落点所在区域可滚，交给浏览器
 let s=primary(overlay);if(s)drag={s,y:ev.touches[0].clientY,moved:false}},{passive:true,capture:true});
document.addEventListener('touchmove',ev=>{if(!drag||ev.touches.length!==1)return;let y=ev.touches[0].clientY,dy=y-drag.y;if(!drag.moved&&Math.abs(dy)<6)return;drag.moved=true;drag.y=y;drag.s.scrollTop-=dy;if(ev.cancelable)ev.preventDefault()},{passive:false,capture:true});
document.addEventListener('touchend',()=>{if(drag?.moved){let eat=e=>{e.stopPropagation();e.preventDefault()};document.addEventListener('click',eat,{capture:true,once:true});setTimeout(()=>document.removeEventListener('click',eat,{capture:true}),350)}drag=null},{capture:true});
document.addEventListener('touchcancel',()=>{drag=null},{capture:true});
})();
