/* V19：符文页云端保存。在 claude.ai 上打开时，把每位玩家自己保存的符文页存到该玩家的私有数据区
 * （data/users/<id>/settings/runes），刷新或换设备后自动恢复；其他环境仍使用浏览器 localStorage。 */
(()=>{'use strict';
const P=window.RunePages;if(!P||typeof window.claude?.use!=='function')return;
let ref=null,pending=null,writing=false;
const snapshot=()=>({revision:1,pages:JSON.parse(JSON.stringify(P.pages||[])),defaults:{...(P.defaults||{})},seq:P.seq||0,savedAt:Date.now()});
async function push(){if(!ref||writing)return;writing=true;try{while(pending){let data=pending;pending=null;await ref.set(data)}}catch(e){console.warn('[rune-sync] 云端保存失败',e?.code||e)}finally{writing=false}}
const save=P.saveStore.bind(P);P.saveStore=function(...a){let r=save(...a);pending=snapshot();push();return r};
(async()=>{try{const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);if(!db||!user)return;const id=await user.id();if(!id)return;
 ref=db.doc('data/users/'+id+'/settings/runes');const snap=await ref.get();
 if(snap.exists){let d=snap.data()||{},pages=Array.isArray(d.pages)?d.pages:[];let ok=pages.filter(p=>p&&typeof p==='object'&&p.id&&p.primary&&p.secondary);
  if(ok.length||Object.keys(d.defaults||{}).length){P.pages=ok;P.defaults=d.defaults||{};P.seq=Math.max(P.seq||0,d.seq||0);save()}}
 else if((P.pages||[]).length){pending=snapshot();push()}
}catch(e){console.warn('[rune-sync] 无法读取云端符文页',e?.code||e)}})();
})();
