'use strict';
const errLog = [];
function showErr(msg) { errLog.push(msg); const s = document.getElementById('importStatus'); if (s) s.textContent = '出错：' + errLog.slice(-3).join(' | '); }
window.addEventListener('error', e => showErr(`${e.message} (第${e.lineno}行)`));
window.addEventListener('unhandledrejection', e => showErr(String(e.reason && (e.reason.message + (e.reason.line ? ' (第' + e.reason.line + '行)' : '')) || e.reason)));
// 全局状态集中声明在最前面，避免初始化顺序问题
let mediaList = [], viewIdx = 0, urls = [];
let picking = false;
const $ = s => document.querySelector(s);
const enc = new TextEncoder();
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const show = id => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); $(id).classList.add('active'); };


/* ---------- 页内对话框（替代 alert/confirm/prompt，App 内嵌也能用） ---------- */
function uiDialog(msg, { input = false, cancel = true } = {}) {
  return new Promise(res => {
    const d = $('#dialog'); $('#dlgMsg').textContent = msg;
    const inp = $('#dlgInput'); inp.value = ''; inp.classList.toggle('hidden', !input);
    $('#dlgCancel').classList.toggle('hidden', !cancel);
    d.classList.remove('hidden'); if (input) setTimeout(() => inp.focus(), 50);
    const done = v => { d.classList.add('hidden'); $('#dlgOk').onclick = $('#dlgCancel').onclick = null; res(v); };
    $('#dlgOk').onclick = () => done(input ? inp.value : true);
    $('#dlgCancel').onclick = () => done(input ? null : false);
  });
}
const uiAlert = m => uiDialog(m, { cancel: false });
const uiConfirm = m => uiDialog(m);
const uiPrompt = m => uiDialog(m, { input: true });

/* ---------- 存储：优先 IndexedDB，不可用时退回内存（本次打开有效） ---------- */
let memMode = false;
const mem = { books: new Map(), media: new Map() };
const dbp = new Promise((ok, no) => {
  try {
    const r = indexedDB.open('paper-reader', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('books', {keyPath:'id'}); r.result.createObjectStore('media', {keyPath:'id'}); };
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); r.onblocked = () => no(new Error('数据库被占用'));
    setTimeout(() => no(new Error('数据库超时')), 4000);
  } catch (e) { no(e); }
}).catch(e => { memMode = true; console.warn('IndexedDB 不可用，改用内存', e); return null; });
const tx = async (store, mode, fn) => { const db = await dbp; if (!db) throw new Error('nodb'); return new Promise((ok, no) => {
  const t = db.transaction(store, mode), req = fn(t.objectStore(store));
  t.oncomplete = () => ok(req && req.result); t.onerror = () => no(t.error); t.onabort = () => no(t.error || new Error('写入被中止（可能空间不足）')); }); };
const safe = (f, m) => async (...a) => { if (!memMode) { try { return await f(...a); } catch (e) { if (e.message !== 'nodb') throw e; } } return m(...a); };
const put = safe((s, v) => tx(s, 'readwrite', o => o.put(v)), (s, v) => { mem[s].set(v.id, v); });
const del = safe((s, k) => tx(s, 'readwrite', o => o.delete(k)), (s, k) => { mem[s].delete(k); });
const all = safe(s => tx(s, 'readonly', o => o.getAll()), s => [...mem[s].values()]);
const get = safe((s, k) => tx(s, 'readonly', o => o.get(k)), (s, k) => mem[s].get(k));

/* ---------- 锁屏：密码 + 扫脸 ---------- */
const sec = JSON.parse(localStorage.getItem('sec') || '{}');
const saveSec = () => localStorage.setItem('sec', JSON.stringify(sec));
async function hashPwd(pwd, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pwd), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations:150000, hash:'SHA-256'}, key, 256));
}
let settingUp = !sec.hash, changing = false, firstPwd = null;
function lockUI() {
  firstPwd = null; $('#pwd').value = ''; $('#lockErr').textContent = '';
  $('#pwd').placeholder = '密码';
  $('#lockHint').textContent = settingUp ? (changing ? '设置新密码（至少4位）' : '首次使用，请设置密码（至少4位）') : '请输入密码或扫脸解锁';
  $('#pwdBtn').textContent = settingUp ? '下一步' : '解锁';
  $('#faceBtn').classList.toggle('hidden', settingUp || !sec.cred);
}
function fail(msg) { $('#lockErr').textContent = msg; const b = $('.lock-box'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
function unlock() { show('#home'); refreshAll(); }
function lock() { closeOverlays(); settingUp = !sec.hash; changing = false; lockUI(); show('#lock'); if (sec.cred && !settingUp) setTimeout(faceUnlock, 300); }

$('#pwdBtn').onclick = async () => {
  const p = $('#pwd').value;
  if (settingUp) {
    if (firstPwd === null) {
      if (p.length < 4) return fail('密码至少4位');
      firstPwd = p; $('#pwd').value = ''; $('#lockErr').textContent = '';
      $('#lockHint').textContent = '请再输入一次密码确认'; $('#pwd').placeholder = '再次输入密码';
      $('#pwdBtn').textContent = '确定'; $('#pwd').focus(); return;
    }
    if (p !== firstPwd) { lockUI(); return fail('两次输入不一致，请重新设置'); }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    sec.salt = b64(salt); sec.hash = await hashPwd(p, salt); saveSec();
    settingUp = changing = false; return unlock();
  }
  if (sec.until && Date.now() < sec.until) return fail(`尝试过多，请${Math.ceil((sec.until - Date.now())/1000)}秒后再试`);
  if (await hashPwd(p, unb64(sec.salt)) === sec.hash) { sec.fails = 0; saveSec(); unlock(); }
  else { sec.fails = (sec.fails || 0) + 1; if (sec.fails >= 5) { sec.until = Date.now() + 30000; sec.fails = 0; } saveSec(); fail('密码错误'); }
};
$('#pwd').onkeydown = e => { if (e.key === 'Enter') $('#pwdBtn').click(); };

// 扫脸：APP 内用原生 Face ID（Capacitor 插件）；网页版用 WebAuthn 平台认证器
let isNative = false; try { isNative = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()); } catch {}
// 不打包 @capacitor/core 时，原生桥只提供 Capacitor.Plugins / nativePromise，没有 registerPlugin
const nativeCall = (method, opts) => {
  const C = window.Capacitor || {};
  const p = C.Plugins && C.Plugins.NativeBiometric;
  if (p && typeof p[method] === 'function') return p[method](opts);
  if (typeof C.nativePromise === 'function') return C.nativePromise('NativeBiometric', method, opts);
  return Promise.reject(new Error('Face ID 插件不可用'));
};
const NativeBio = isNative ? { isAvailable: o => nativeCall('isAvailable', o), verifyIdentity: o => nativeCall('verifyIdentity', o) } : null;
async function nativeVerify() {
  const a = await NativeBio.isAvailable({ useFallback: false });
  if (!a.isAvailable) throw new Error('设备未开启 Face ID');
  await NativeBio.verifyIdentity({ reason: '验证身份以进入纸页', title: '纸页', useFallback: false });
}
async function enrollFace() {
  if (isNative) {
    try { await nativeVerify(); sec.cred = 'native'; saveSec(); uiAlert('扫脸解锁已开启'); settingsUI(); }
    catch (e) { uiAlert('开启失败：' + (e.message || e)); }
    return;
  }
  if (!window.PublicKeyCredential || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false)))
    return uiAlert('此设备/浏览器不支持人脸识别（需 HTTPS 且设备开启 Face ID/人脸解锁）');
  try {
    const c = await navigator.credentials.create({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: '纸页阅读器' },
      user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'reader', displayName: '读者' },
      pubKeyCredParams: [{type:'public-key', alg:-7}, {type:'public-key', alg:-257}],
      authenticatorSelection: { authenticatorAttachment:'platform', userVerification:'required', residentKey:'preferred' },
      timeout: 60000 }});
    sec.cred = b64(c.rawId); saveSec(); uiAlert('扫脸解锁已开启'); settingsUI();
  } catch (e) { uiAlert('开启失败：' + e.message); }
}
async function faceUnlock() {
  if (!sec.cred) return;
  try {
    if (sec.cred === 'native') { if (!isNative) throw 0; await nativeVerify(); }
    else await navigator.credentials.get({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type:'public-key', id: unb64(sec.cred), transports:['internal'] }],
      userVerification: 'required', timeout: 60000 }});
    unlock();
  } catch (e) { $('#lockErr').textContent = '扫脸未通过，可使用密码'; }
}
$('#faceBtn').onclick = faceUnlock;
document.addEventListener('visibilitychange', () => { if (document.hidden && !picking && sec.hash && !$('#lock').classList.contains('active')) { saveProgress(); lock(); } });

/* ---------- 设置 ---------- */
function settingsUI() { $('#toggleFace').textContent = sec.cred ? '关闭扫脸解锁' : '开启扫脸解锁'; }
$('#settingsBtn').onclick = () => { settingsUI(); $('#settings').classList.remove('hidden'); };
$('#settingsClose').onclick = () => $('#settings').classList.add('hidden');
$('#toggleFace').onclick = () => { if (sec.cred) { delete sec.cred; saveSec(); settingsUI(); } else enrollFace(); };
$('#lockNow').onclick = lock;
$('#changePwd').onclick = async () => {
  const old = await uiPrompt('请输入当前密码'); if (old == null) return;
  if (await hashPwd(old, unb64(sec.salt)) !== sec.hash) return uiAlert('密码错误');
  closeOverlays(); settingUp = changing = true; lockUI(); show('#lock');
};
function closeOverlays() { $('#settings').classList.add('hidden'); closeViewer(); }

/* ---------- 底部标签 ---------- */
document.querySelectorAll('.tabbar button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tabbar button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + b.dataset.tab));
  $('#homeTitle').textContent = {books:'书架', photos:'图集', videos:'视频集'}[b.dataset.tab];
});

/* ---------- 书架 ---------- */
function decode(buf) {
  try { return new TextDecoder('utf-8', {fatal:true}).decode(buf); } catch {}
  for (const enc of ['gb18030', 'gbk', 'big5', 'utf-16le']) { try { return new TextDecoder(enc).decode(buf); } catch {} }
  return new TextDecoder().decode(buf);
}
const setStatus = t => { $('#importStatus').textContent = t; };
async function addBook(title, text) {
  text = text.replace(/\r\n?/g, '\n');
  if (!text.trim()) throw new Error('内容是空的');
  await put('books', { id: Date.now() + Math.random().toString(36).slice(2), title, text, added: Date.now() });
}
// 选文件期间不要自动锁屏；change/input 两个事件都监听（iOS 上有时只触发其一）
function bindFile(sel, fn) {
  const el = $(sel); let last = 0;
  el.addEventListener('click', () => { picking = true; setTimeout(() => picking = false, 120000); });
  const h = e => { picking = false; if (!el.files || !el.files.length) return; const now = Date.now(); if (now - last < 800) return; last = now; fn(e); };
  el.addEventListener('change', h); el.addEventListener('input', h);
}
const onBookFiles = async e => {
  const files = [...(e.target.files || [])]; e.target.value = ''; let ok = 0;
  if (!files.length) return setStatus('没有选中文件');
  for (const f of files) {
    try {
      setStatus(`正在读取《${f.name}》(${(f.size/1024).toFixed(0)}KB)…`);
      const buf = await (f.arrayBuffer ? f.arrayBuffer() : new Response(f).arrayBuffer());
      setStatus('正在识别编码…');
      const text = decode(buf);
      setStatus('正在保存…');
      await addBook(f.name.replace(/\.(txt|text)$/i, ''), text); ok++;
    } catch (err) { setStatus(''); uiAlert(`《${f.name}》导入失败：` + (err && (err.name + ' ' + err.message) || err)); }
  }
  setStatus(ok ? `已导入 ${ok} 本` + (memMode ? '（当前环境无法长期保存，关闭后会丢失）' : '') : '');
  renderBooks();
};
bindFile('#bookFile', onBookFiles);
$('#pasteBtn').onclick = async () => {
  const d = $('#pasteBox'); d.classList.remove('hidden'); $('#pasteText').value = ''; $('#pasteTitle').value = '';
};
$('#pasteCancel').onclick = () => $('#pasteBox').classList.add('hidden');
$('#pasteOk').onclick = async () => {
  try {
    await addBook($('#pasteTitle').value.trim() || '未命名', $('#pasteText').value);
    $('#pasteBox').classList.add('hidden'); setStatus('已导入 1 本' + (memMode ? '（当前环境无法长期保存）' : '')); renderBooks();
  } catch (err) { uiAlert('导入失败：' + (err.message || err)); }
};
async function renderBooks() {
  let books; try { books = await all('books'); } catch (e) { setStatus('读取书架失败：' + e.message); return; }
  books = books.sort((a, b) => b.added - a.added); const ul = $('#bookList');
  ul.innerHTML = books.length ? '' : '<p style="text-align:center;color:#a99">书架空空，导入一本 txt 小说吧</p>';
  for (const b of books) {
    const pr = JSON.parse(localStorage.getItem('prog_' + b.id) || 'null');
    const li = document.createElement('li');
    li.innerHTML = `<div class="cover">${esc(b.title[0] || '书')}</div><div class="meta">${esc(b.title)}<br><small>${pr ? '已读 ' + pr.pct + '%' : '未读'} · ${(b.text.length/10000).toFixed(1)}万字</small></div><button class="icon">🗑</button>`;
    li.onclick = () => openBook(b.id);
    li.querySelector('button').onclick = async ev => { ev.stopPropagation(); if (await uiConfirm(`删除《${b.title}》？`)) { await del('books', b.id); localStorage.removeItem('prog_' + b.id); renderBooks(); } };
    ul.appendChild(li);
  }
}

/* ---------- 阅读器：分页 + 纸质翻页 ---------- */
const CHAP = /^\s*(第[零一二三四五六七八九十百千万0-9]+[章回节卷集部]|序章|楔子|尾声|番外)/;
let cur = { book:null, paras:[], pages:[], idx:0 };
let fontSize = +localStorage.getItem('font') || 20;
const pHTML = (t, chap) => chap ? `<p class="chap">${esc(t)}</p>` : `<p>${esc(t)}</p>`;

async function openBook(id) {
  try { await openBookInner(id); }
  catch (e) { show('#home'); uiAlert('打开失败：' + (e && e.message || e)); }
}
async function openBookInner(id) {
  const b = await get('books', id); if (!b) throw new Error('找不到这本书');
  cur.book = b;
  cur.paras = b.text.split('\n').map(s => s.trim()).filter(Boolean);
  $('#bookTitle').textContent = b.title;
  show('#reader'); $('#readerBar').classList.add('hidden');
  const pr = JSON.parse(localStorage.getItem('prog_' + id) || 'null');
  await paginate(pr ? pr.pos : [0, 0]);
}
// 每页记录起点 [段落号, 字符偏移]，换字号后能回到同一位置
// 快速分页：先按字宽/行高估算每页能放多少字，再每页用一次 DOM 校验，超出就回退
async function paginate(pos) {
  document.documentElement.style.setProperty('--font', fontSize + 'px');
  const m = $('#measure'), P = cur.paras, pages = [];
  $('#pageTop').innerHTML = '<p style="text-align:center;margin-top:40%">排版中…</p>';
  await new Promise(r => setTimeout(r));
  const cs = getComputedStyle(m);
  m.innerHTML = '<p style="text-indent:0"><span id="mz">国国国国国国国国国国国国国国国国国国国国</span></p>';
  const charW = $('#mz').getBoundingClientRect().width / 20;
  const lineH = parseFloat(cs.lineHeight) || fontSize * 1.8;
  const W = m.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const H = m.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const cols = Math.max(4, Math.floor(W / charW)), rows = Math.max(3, Math.floor(H / lineH));
  const fits = () => m.scrollHeight <= m.clientHeight + 1;
  const segHTML = segs => segs.map(([p, a, b]) => {
    const t = P[p].slice(a, b), chap = a === 0 && CHAP.test(P[p]);
    return chap ? `<p class="chap">${esc(t)}</p>` : `<p${a > 0 ? ' style="text-indent:0"' : ''}>${esc(t)}</p>`;
  }).join('');
  let p = 0, c = 0;
  while (p < P.length) {
    const start = [p, c], segs = []; let left = rows;
    while (p < P.length && left > 0) {
      const len = P[p].length - c, chap = c === 0 && CHAP.test(P[p]);
      const need = chap ? Math.ceil(len * 1.3 / cols) + 2 : Math.ceil((len + (c === 0 ? 2 : 0)) / cols);
      if (need <= left) { segs.push([p, c, P[p].length]); left -= need; p++; c = 0; continue; }
      if (chap) break;                                   // 章节标题不拆开
      const take = left * cols - (c === 0 ? 2 : 0);
      if (take > 0) { segs.push([p, c, c + take]); c += take; }
      left = 0;
    }
    // DOM 校验：放不下就每次退回一行字
    m.innerHTML = segHTML(segs);
    let guard = 0;
    while (!fits() && segs.length && guard++ < 50) {
      const last = segs[segs.length - 1], back = Math.min(cols, last[2] - last[1]);
      last[2] -= back; p = last[0]; c = last[2];
      if (last[2] <= last[1]) segs.pop();
      m.innerHTML = segHTML(segs);
    }
    if (!segs.length) { segs.push([p, c, P[p].length]); p++; c = 0; } // 防止死循环
    pages.push({ html: segHTML(segs), start });
    if (pages.length % 200 === 0) { $('#pageTop').innerHTML = `<p style="text-align:center;margin-top:40%">排版中… ${Math.round(p / P.length * 100)}%</p>`; await new Promise(r => setTimeout(r)); }
  }
  if (!pages.length) pages.push({ html:'<p>（空）</p>', start:[0,0] });
  cur.pages = pages;
  let k = pages.length - 1; while (k > 0 && cmp(pages[k].start, pos) > 0) k--;
  cur.idx = k; $('#progress').max = pages.length - 1; render();
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1];
const pageHTML = i => cur.pages[i] ? cur.pages[i].html + `<div class="pno">${i + 1} / ${cur.pages.length}</div>` : '';
function render() {
  $('#pageTop').innerHTML = pageHTML(cur.idx);
  $('#progress').value = cur.idx; $('#pageInfo').textContent = `${cur.idx + 1} / ${cur.pages.length}`;
  saveProgress();
}
function saveProgress() {
  if (!cur.book || !cur.pages.length) return;
  localStorage.setItem('prog_' + cur.book.id, JSON.stringify({ pos: cur.pages[cur.idx].start, pct: Math.round((cur.idx + 1) / cur.pages.length * 100) }));
}

// 翻页动画：一张纸以左边为轴翻起，背面略透出字迹，带阴影
const flipper = $('#flipper'), front = flipper.querySelector('.front'), back = flipper.querySelector('.back');
let drag = null, animating = false;
function setAngle(a) { flipper.style.transform = `rotateY(${a}deg)`; front.style.setProperty('--shade', Math.min(1, -a / 90)); }
function prepare(dir) {
  const target = cur.idx + dir; if (target < 0 || target >= cur.pages.length) return false;
  const turning = dir > 0 ? cur.idx : target;           // 被翻动的那一页
  front.innerHTML = `<div class="page">${pageHTML(turning)}</div>`;
  back.innerHTML = `<div class="page">${pageHTML(turning)}</div>`;
  if (dir > 0) $('#pageTop').innerHTML = pageHTML(target);
  flipper.classList.remove('hidden');
  return true;
}
function finish(dir, angle, commit) {
  animating = true;
  const to = dir > 0 ? (commit ? -180 : 0) : (commit ? 0 : -180);
  const dur = 450 * Math.abs(to - angle) / 180 + 80;
  const anim = flipper.animate([{ transform:`rotateY(${angle}deg)` }, { transform:`rotateY(${to}deg)` }], { duration: dur, easing:'cubic-bezier(.3,.6,.4,1)' });
  anim.onfinish = () => {
    if (commit) cur.idx += dir;
    flipper.classList.add('hidden'); setAngle(0); render(); animating = false;
  };
}
function turn(dir) { if (animating || !prepare(dir)) return; finish(dir, dir > 0 ? 0 : -180, true); }

const book = $('#book');
book.addEventListener('pointerdown', e => { if (!animating) drag = { x: e.clientX, y: e.clientY, t: Date.now(), dir: 0 }; });
book.addEventListener('pointermove', e => {
  if (!drag) return; const dx = e.clientX - drag.x, W = book.clientWidth;
  if (!drag.dir && Math.abs(dx) > 10) { drag.dir = dx < 0 ? 1 : -1; if (!prepare(drag.dir)) { drag = null; return; } }
  if (drag.dir) { const a = drag.dir > 0 ? Math.max(-180, dx / W * 180) : Math.min(0, -180 + dx / W * 180); drag.a = a; setAngle(a); }
});
const endDrag = e => {
  if (!drag) return; const d = drag; drag = null;
  if (d.dir) { const moved = Math.abs(e.clientX - d.x); finish(d.dir, d.a ?? (d.dir > 0 ? 0 : -180), moved > book.clientWidth / 4 || (Date.now() - d.t < 250 && moved > 30)); return; }
  // 点击：左 1/3 上一页，右 1/3 下一页，中间呼出菜单
  const x = e.clientX / book.clientWidth;
  if (!$('#readerBar').classList.contains('hidden')) return $('#readerBar').classList.add('hidden');
  if (x < 1/3) turn(-1); else if (x > 2/3) turn(1); else $('#readerBar').classList.remove('hidden');
};
book.addEventListener('pointerup', endDrag);
book.addEventListener('pointercancel', e => { if (drag && drag.dir) finish(drag.dir, drag.a ?? 0, false); drag = null; });
document.addEventListener('keydown', e => { if (!$('#reader').classList.contains('active')) return; if (e.key === 'ArrowRight') turn(1); if (e.key === 'ArrowLeft') turn(-1); });

$('#progress').oninput = e => { cur.idx = +e.target.value; render(); };
$('#backBtn').onclick = () => { saveProgress(); cur.book = null; show('#home'); renderBooks(); };
const refont = d => { fontSize = Math.max(14, Math.min(32, fontSize + d)); localStorage.setItem('font', fontSize); paginate(cur.pages[cur.idx].start); };
$('#fontMinus').onclick = () => refont(-2); $('#fontPlus').onclick = () => refont(2);
let rt; window.addEventListener('resize', () => { clearTimeout(rt); if (cur.book) rt = setTimeout(() => paginate(cur.pages[cur.idx].start), 300); });

/* ---------- 图集 / 视频集 ---------- */
async function addMedia(e, type) {
  const files = [...e.target.files]; e.target.value = '';
  for (const f of files) await put('media', { id: Date.now() + Math.random().toString(36).slice(2), type, name: f.name, blob: f, added: Date.now() });
  renderMedia();
}
bindFile('#photoFile', e => addMedia(e, 'photo'));
bindFile('#videoFile', e => addMedia(e, 'video'));
async function renderMedia() {
  urls.forEach(URL.revokeObjectURL); urls = [];
  const items = (await all('media')).sort((a, b) => a.added - b.added);
  for (const type of ['photo', 'video']) {
    const grid = $(type === 'photo' ? '#photoGrid' : '#videoGrid'), list = items.filter(m => m.type === type);
    grid.innerHTML = '';
    list.forEach((m, i) => {
      const u = URL.createObjectURL(m.blob); urls.push(u); m.url = u;
      const cell = document.createElement('div'); cell.className = 'cell';
      cell.innerHTML = type === 'photo' ? `<img src="${u}" loading="lazy">` : `<video src="${u}#t=0.1" muted preload="metadata"></video><div class="play">▶</div>`;
      cell.onclick = () => openViewer(list, i);
      grid.appendChild(cell);
    });
  }
}
function openViewer(list, i) { mediaList = list; viewIdx = i; $('#viewer').classList.remove('hidden'); showMedia(); }
function showMedia() {
  const m = mediaList[viewIdx]; if (!m) return closeViewer();
  $('#viewerBody').innerHTML = m.type === 'photo' ? `<img src="${m.url}">` : `<video src="${m.url}" controls autoplay playsinline></video>`;
}
function closeViewer() { $('#viewer').classList.add('hidden'); $('#viewerBody').innerHTML = ''; }
$('#viewerClose').onclick = closeViewer;
$('#prevMedia').onclick = () => { viewIdx = (viewIdx - 1 + mediaList.length) % mediaList.length; showMedia(); };
$('#nextMedia').onclick = () => { viewIdx = (viewIdx + 1) % mediaList.length; showMedia(); };
$('#viewerDel').onclick = async () => { if (!(await uiConfirm('删除这一项？'))) return; await del('media', mediaList[viewIdx].id); closeViewer(); renderMedia(); };
let sx; $('#viewer').addEventListener('touchstart', e => sx = e.touches[0].clientX);
$('#viewer').addEventListener('touchend', e => { if (mediaList[viewIdx]?.type !== 'photo') return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) $(dx < 0 ? '#nextMedia' : '#prevMedia').click(); });

function refreshAll() { renderBooks(); renderMedia(); }

/* ---------- 启动 ---------- */
lock();
if (!isNative && 'serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
