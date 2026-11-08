// Cloudflare Worker 版本：Durable Object（SQLite）存储 + 静态资源（public/）
import { parseNotification } from '../lib/parser.js';
import { summarize } from '../lib/store.js';
import { parseCsv } from '../lib/school.js';
import { fetchZhirizhuIncome } from '../lib/zhirizhu.js';
import { parseAny, planImport } from '../lib/history.js';
import { DurableObject } from 'cloudflare:workers';

// 把 DO 的 ctx.storage.sql 包装成与 D1 相同的 prepare().bind().first()/all()/run() 接口
function sqlDb(storage) {
  const sql = storage.sql;
  const prep = (q, args = []) => ({
    bind: (...a) => prep(q, a),
    first: async () => sql.exec(q, ...args).toArray()[0] || null,
    all: async () => ({ results: sql.exec(q, ...args).toArray() }),
    runSync: () => sql.exec(q, ...args).toArray(),
    run: async () => { const c = sql.exec(q, ...args); c.toArray(); return { meta: { changes: c.rowsWritten } }; },
  });
  return { prepare: (q) => prep(q), batch: async (stmts) => storage.transactionSync(() => stmts.map((st) => st.runSync())) };
}

const COLS = ['id', 'amount', 'type', 'source', 'sourceName', 'merchant', 'category', 'date', 'raw'];
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
const curMonth = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 7); // 东京时间
const insert = (db, t) => db.prepare(`INSERT INTO transactions(${COLS}) VALUES(${COLS.map(() => '?')})`).bind(...COLS.map((c) => t[c] ?? ''));

async function add(db, tx) {
  const since = new Date(new Date(tx.date) - 120000).toISOString(), until = new Date(+new Date(tx.date) + 120000).toISOString();
  if (tx.raw) {
    const dup = await db.prepare('SELECT * FROM transactions WHERE raw=? AND amount=? AND date BETWEEN ? AND ?').bind(tx.raw, tx.amount, since, until).first();
    if (dup) return { tx: dup, duplicate: true };
  }
  const rec = { id: crypto.randomUUID(), ...tx };
  await insert(db, rec).run();
  return { tx: rec, duplicate: false };
}

async function replaceSchool(db, month, items) {
  await db.batch([
    db.prepare("DELETE FROM transactions WHERE source='school' AND date LIKE ?").bind(month + '%'),
    ...items.map((it) => insert(db, { id: crypto.randomUUID(), amount: it.amount, type: 'income', source: 'school', sourceName: '教务系统', merchant: it.title, category: '教务收入', date: it.date, raw: '' })),
  ]);
}

const SHORTCUTS = ['wallet', 'screenshot'];

async function api(req, env, url, db, storage) {
  const p = url.pathname;
  const sc = p.match(/^\/shortcuts\/(\w+)\.shortcut$/);
  if (sc && req.method === 'GET' && SHORTCUTS.includes(sc[1])) {
    const b64 = await storage.get('shortcut:' + sc[1]);
    if (!b64) return json({ error: '快捷指令尚未签名上传' }, 404);
    const names = { wallet: 'ApplePay自动记账', screenshot: '截图记账' };
    return new Response(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), { headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(names[sc[1]])}.shortcut` } });
  }
  if (p === '/api/shortcuts/status') {
    const st = {}; for (const n of SHORTCUTS) st[n] = !!(await storage.get('shortcut:' + n));
    return json(st);
  }
  if (!env.INGEST_TOKEN || (req.headers.get('x-token') !== env.INGEST_TOKEN && url.searchParams.get('token') !== env.INGEST_TOKEN)) return json({ error: 'token 无效' }, 401);
  const up = p.match(/^\/api\/shortcuts\/(\w+)$/);
  if (up && req.method === 'PUT' && SHORTCUTS.includes(up[1])) {
    const buf = new Uint8Array(await req.arrayBuffer());
    if (buf.length < 100 || buf.length > 1e6 || String.fromCharCode(...buf.slice(0, 4)) !== 'AEA1') return json({ error: '不是已签名的快捷指令' }, 400);
    let bin = ''; for (const b of buf) bin += String.fromCharCode(b);
    await storage.put('shortcut:' + up[1], btoa(bin));
    return json({ ok: true, bytes: buf.length });
  }
  if (p === '/api/ingest' && req.method === 'POST') {
    const raw = await req.text();
    let n; try { n = JSON.parse(raw); } catch { n = { text: raw }; }
    let tx = parseNotification(n);
    if (!tx && n.raw) tx = parseNotification({ app: n.app, text: `${n.raw}` });
    if (tx && url.searchParams.get('dry')) return json({ tx, dry: true });
    return tx ? json(await add(db, tx)) : json({ error: '未识别到金额', text: n.text }, 422);
  }
  if ((p === '/api/import' || p === '/api/screenshot') && req.method === 'POST') {
    const raw = await req.text();
    let b; try { b = JSON.parse(raw); } catch { b = { text: raw }; }
    const rows = parseAny(String(b.text || ''), { app: b.app || url.searchParams.get('app') || '', source: b.source });
    const months = [...new Set(rows.map((r) => r.date.slice(0, 7)))];
    const existing = [];
    for (const m of months) existing.push(...(await db.prepare('SELECT * FROM transactions WHERE date LIKE ?').bind(m + '%').all()).results);
    const { add, skipped } = planImport(existing, rows);
    const items = add.map((r) => ({ id: crypto.randomUUID(), ...r }));
    if (url.searchParams.get('dry')) return json({ added: items.length, skipped, items, dry: true }, rows.length ? 200 : 422);
    if (items.length) await db.batch(items.map((t) => insert(db, t)));
    return json({ added: items.length, skipped, items, ...(rows.length ? {} : { error: '没有识别到交易' }) }, rows.length ? 200 : 422);
  }
  if (p === '/api/transactions' && req.method === 'POST') {
    const b = await req.json(), amount = Number(b.amount);
    if (!(amount > 0) || !['expense', 'income', 'transfer'].includes(b.type)) return json({ error: '参数错误' }, 400);
    return json(await add(db, { amount, type: b.type, source: 'manual', sourceName: '手动', merchant: b.merchant || '', category: b.category || (b.type === 'income' ? '收入' : '其他'), date: new Date(b.date || Date.now()).toISOString(), raw: '' }));
  }
  if (p.startsWith('/api/transactions/') && req.method === 'DELETE') {
    const r = await db.prepare('DELETE FROM transactions WHERE id=?').bind(decodeURIComponent(p.split('/').pop())).run();
    return json({ ok: r.meta.changes > 0 });
  }
  if (p === '/api/summary' && req.method === 'GET') {
    const month = url.searchParams.get('month') || curMonth();
    const { results } = await db.prepare('SELECT * FROM transactions WHERE date LIKE ? ORDER BY date DESC').bind(month + '%').all();
    return json({ month, summary: summarize(results), transactions: results });
  }
  if (p === '/api/school/sync' && req.method === 'POST') {
    const month = url.searchParams.get('month') || curMonth();
    const z = await fetchZhirizhuIncome(month, env);
    const items = z.items.filter((i) => i.date.startsWith(month));
    await replaceSchool(db, month, items);
    return json({ month, count: items.length, total: z.total, gross: z.gross, provisional: z.provisional });
  }
  if (p === '/api/school/csv' && req.method === 'POST') {
    const items = parseCsv(await req.text());
    const months = [...new Set(items.map((i) => i.date.slice(0, 7)))];
    for (const m of months) await replaceSchool(db, m, items.filter((i) => i.date.startsWith(m)));
    return json({ count: items.length, months });
  }
  return json({ error: 'not found' }, 404);
}

export class Ledger extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, amount REAL NOT NULL, type TEXT NOT NULL, source TEXT NOT NULL, sourceName TEXT, merchant TEXT, category TEXT, date TEXT NOT NULL, raw TEXT);
      CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);`);
    this.db = sqlDb(ctx.storage);
  }
  async fetch(req) {
    const url = new URL(req.url);
    try { return await api(req, this.env, url, this.db, this.ctx.storage); } catch (e) { return json({ error: e.message }, 500); }
  }
  async syncSchool() {
    const month = curMonth();
    const z = await fetchZhirizhuIncome(month, this.env);
    await replaceSchool(this.db, month, z.items.filter((i) => i.date.startsWith(month)));
  }
}

const stub = (env) => env.LEDGER.get(env.LEDGER.idFromName('main'));

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/shortcuts/')) return env.ASSETS.fetch(req);
    return stub(env).fetch(req);
  },
  // 每天自动同步当月教务收入（东京 6:00）
  async scheduled(_e, env) { await stub(env).syncSchool(); },
};
