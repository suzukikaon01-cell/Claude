'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { parseNotification } = require('./lib/parser');
const { Store, summarize } = require('./lib/store');
const { fetchSchoolIncome, parseCsv } = require('./lib/school');
const { fetchZhirizhuIncome } = require('./lib/zhirizhu');
const { parseAny, planImport } = require('./lib/history');

const PORT = Number(process.env.PORT || 3000);
const TOKEN = process.env.INGEST_TOKEN || ''; // 手机推送通知时使用的密钥
const store = new Store(process.env.DB_FILE || path.join(__dirname, 'data', 'db.json'));
const PUB = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

const curMonth = () => new Date().toISOString().slice(0, 7);
const send = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};
const readBody = (req) => new Promise((ok, fail) => {
  let s = '';
  req.on('data', (c) => { s += c; if (s.length > 2e6) req.destroy(); });
  req.on('end', () => ok(s));
  req.on('error', fail);
});
const authed = (req, url) => !TOKEN || req.headers['x-token'] === TOKEN || url.searchParams.get('token') === TOKEN;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (p.startsWith('/api/') && !authed(req, url)) return send(res, 401, { error: 'token 无效' });

    // 手机自动化（MacroDroid/Tasker/iOS 快捷指令）推送通知
    if (p === '/api/ingest' && req.method === 'POST') {
      const raw = await readBody(req);
      let n; try { n = JSON.parse(raw); } catch { n = { text: raw }; }
      const tx = parseNotification(n);
      if (!tx) return send(res, 422, { error: '未识别到金额', text: n.text });
      return send(res, 200, store.add(tx));
    }
    // 截图 OCR 文本 / 账单 CSV 批量导入（快捷指令截屏、倒查本月记录）
    if ((p === '/api/import' || p === '/api/screenshot') && req.method === 'POST') {
      const raw = await readBody(req);
      let b; try { b = JSON.parse(raw); } catch { b = { text: raw }; }
      const rows = parseAny(String(b.text || ''), { app: b.app || url.searchParams.get('app') || '', source: b.source });
      const months = [...new Set(rows.map((r) => r.date.slice(0, 7)))];
      const { add, skipped } = planImport(months.flatMap((m) => store.month(m)), rows);
      const added = add.map((r) => store.add(r).tx);
      return send(res, rows.length ? 200 : 422, { added: added.length, skipped, items: added, ...(rows.length ? {} : { error: '没有识别到交易' }) });
    }
    if (p === '/api/transactions' && req.method === 'POST') {
      const b = JSON.parse(await readBody(req));
      const amount = Number(b.amount);
      if (!(amount > 0) || !['expense', 'income', 'transfer'].includes(b.type)) return send(res, 400, { error: '参数错误' });
      return send(res, 200, store.add({
        amount, type: b.type, source: 'manual', sourceName: '手动', merchant: b.merchant || '',
        category: b.category || (b.type === 'income' ? '收入' : '其他'),
        date: new Date(b.date || Date.now()).toISOString(), raw: '',
      }));
    }
    if (p.startsWith('/api/transactions/') && req.method === 'DELETE') {
      return send(res, 200, { ok: store.remove(decodeURIComponent(p.split('/').pop())) });
    }
    if (p === '/api/summary' && req.method === 'GET') {
      const month = url.searchParams.get('month') || curMonth();
      const list = store.month(month);
      return send(res, 200, { month, summary: summarize(list), transactions: list });
    }
    if (p === '/api/school/sync' && req.method === 'POST') {
      const month = url.searchParams.get('month') || curMonth();
      // 默认对接知日塾教务系统；配置了 SCHOOL_API_URL 时使用通用 JSON 接口
      if (process.env.SCHOOL_API_URL) {
        const items = (await fetchSchoolIncome(month)).filter((i) => i.date.startsWith(month));
        store.replaceSchoolIncome(month, items);
        return send(res, 200, { month, count: items.length });
      }
      const z = await fetchZhirizhuIncome(month);
      const items = z.items.filter((i) => i.date.startsWith(month));
      store.replaceSchoolIncome(month, items);
      return send(res, 200, { month, count: items.length, total: z.total, gross: z.gross, provisional: z.provisional });
    }
    if (p === '/api/school/csv' && req.method === 'POST') {
      const items = parseCsv(await readBody(req));
      const months = [...new Set(items.map((i) => i.date.slice(0, 7)))];
      for (const m of months) store.replaceSchoolIncome(m, items.filter((i) => i.date.startsWith(m)));
      return send(res, 200, { count: items.length, months });
    }
    if (p.startsWith('/api/')) return send(res, 404, { error: 'not found' });

    // 静态文件
    const file = path.join(PUB, p === '/' ? 'index.html' : path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(PUB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    send(res, 500, { error: e.message });
  }
});

if (require.main === module) server.listen(PORT, () => console.log(`记账 App 运行于 http://localhost:${PORT}`));
module.exports = server;
