const $ = (s) => document.querySelector(s);
const token = new URLSearchParams(location.search).get('token') || localStorage.getItem('token') || '';
try { if (token) localStorage.setItem('token', token); } catch {}
const api = (p, o = {}) => fetch(p, { ...o, headers: { 'x-token': token, ...(o.headers || {}) } }).then(async (r) => {
  const j = await r.json(); if (!r.ok) throw new Error(j.error || r.status); return j;
});
const yen = (n) => '¥' + Math.round(n).toLocaleString('ja-JP');
const TYPE = { expense: '支出', income: '收入', transfer: '转出', internal: '内部' };
$('#month').value = new Date().toISOString().slice(0, 7);
const msg = (t) => { $('#msg').textContent = t; };

function bars(el, obj) {
  const e = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  const max = e[0]?.[1] || 1;
  el.innerHTML = e.length ? e.map(([k, v]) => `<div><span>${k}</span><i style="width:${(v / max) * 100}%"></i><em>${yen(v)}</em></div>`).join('') : '<small>暂无</small>';
}

async function load() {
  const { summary: s, transactions } = await api('/api/summary?month=' + $('#month').value);
  $('#income').textContent = yen(s.income);
  $('#school').textContent = `其中教务 ${yen(s.schoolIncome)}`;
  $('#outflow').textContent = yen(s.outflow);
  $('#outDetail').textContent = `消费 ${yen(s.expense)} · 转出 ${yen(s.transfer)}`;
  $('#surplus').textContent = (s.surplus < 0 ? '-' : '') + yen(Math.abs(s.surplus));
  $('#surplus').className = s.surplus < 0 ? 'neg' : 'pos';
  $('#rate').textContent = s.income ? `储蓄率 ${(s.savingRate * 100).toFixed(1)}%` : '';
  bars($('#cats'), s.byCategory);
  bars($('#srcs'), s.bySource);
  $('#list').innerHTML = transactions.map((t) => `<li><div>${t.merchant || t.category}<small>${new Date(t.date).toLocaleString('zh-CN')} · ${t.sourceName} · ${t.category}</small></div>
    <div><b class="${t.type === 'income' ? 'pos' : t.type === 'internal' ? '' : 'neg'}">${t.type === 'income' ? '+' : t.type === 'internal' ? '' : '-'}${yen(t.amount)}</b> <small>${TYPE[t.type]}</small>
    <button data-id="${t.id}" title="删除">✕</button></div></li>`).join('') || '<small>本月暂无记录</small>';
}

$('#list').addEventListener('click', async (e) => {
  const id = e.target.dataset?.id; if (!id || !confirm('删除这笔记录？')) return;
  await api('/api/transactions/' + id, { method: 'DELETE' }); load();
});
$('#month').addEventListener('change', load);
$('#add').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  try { await api('/api/transactions', { method: 'POST', body: JSON.stringify(body) }); e.target.reset(); load(); } catch (err) { msg(err.message); }
});
$('#syncSchool').addEventListener('click', async () => {
  try { const r = await api('/api/school/sync?month=' + $('#month').value, { method: 'POST' }); msg(`已同步 ${r.count} 条教务收入`); load(); } catch (err) { msg('同步失败：' + err.message); }
});
$('#csv').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try { const r = await api('/api/school/csv', { method: 'POST', body: await f.text() }); msg(`已导入 ${r.count} 条（${r.months.join(', ')}）`); load(); } catch (err) { msg(err.message); }
});
load().catch((e) => msg(e.message));
setInterval(() => load().catch(() => {}), 30000);
