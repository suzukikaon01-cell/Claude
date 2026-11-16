// 知日塾教务系统（lesson-desk Workers）收入联动
// 用教师密码登录 /api/login 拿到会话 cookie（sidx，remember=400 天），
// 再读 GET /api/income/month?month=YYYY-MM —— 与教务系统“收入”页同一个算法：
// 普通 1v1 3000/h、1v1 面试 3000/h、模拟面试 750/30min、通勤 356/次，按周/月上限结转后的“当月结算”金额。
'use strict';

const DEFAULT_URL = 'https://app.lesson-desk.workers.dev';
let cachedCookie = '';
let http = (u, o) => fetch(u, o);

async function login(base, password) {
  const res = await http(base + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, remember: true }),
  });
  if (!res.ok) throw new Error(`知日塾登录失败（${res.status}）`);
  const set = res.headers.get('set-cookie') || '';
  const m = set.match(/sidx=([a-f0-9]{64})/);
  if (!m) throw new Error('知日塾登录未返回会话');
  return 'sidx=' + m[1];
}

async function getMonth(base, month, cookie) {
  return http(`${base}/api/income/month?month=${encodeURIComponent(month)}`, { headers: { cookie } });
}

/** 把 /api/income/month 的返回转换为记账收入条目（按结算日，每天一条） */
function toItems(report) {
  const items = [];
  for (const d of report.days || []) {
    if (!(d.total_yen > 0)) continue;
    const parts = [];
    if (d.one_to_one_yen) parts.push(`1v1 ${d.one_to_one_minutes / 60}h`);
    if (d.interview_yen) parts.push(`面试 ${d.interview_minutes / 60}h`);
    if (d.commute_yen) parts.push(`通勤×${d.commute_trips}`);
    items.push({
      date: new Date(`${d.day}T12:00:00+09:00`).toISOString(),
      amount: d.total_yen,
      title: `知日塾 ${parts.join(' · ') || '课时'}`,
    });
  }
  return items;
}

async function fetchZhirizhuIncome(month, env = process.env) {
  // Cloudflare 上通过 service binding（EDU）直连教务 Worker
  if (env.EDU) http = (u, o) => env.EDU.fetch(u, o);
  const base = (env.ZHIRIZHU_URL || DEFAULT_URL).replace(/\/$/, '');
  let cookie = cachedCookie || (env.ZHIRIZHU_SESSION ? 'sidx=' + env.ZHIRIZHU_SESSION : '');
  if (!cookie && !env.ZHIRIZHU_PASSWORD) throw new Error('未配置 ZHIRIZHU_PASSWORD（教师登录密码）');
  if (!cookie) cookie = await login(base, env.ZHIRIZHU_PASSWORD);
  let res = await getMonth(base, month, cookie);
  if (res.status === 401 && env.ZHIRIZHU_PASSWORD) {
    cookie = await login(base, env.ZHIRIZHU_PASSWORD);
    res = await getMonth(base, month, cookie);
  }
  if (!res.ok) throw new Error(`知日塾收入接口返回 ${res.status}`);
  cachedCookie = cookie;
  const report = await res.json();
  return {
    items: toItems(report),
    total: report.totals?.total_yen || 0,
    gross: report.gross_totals?.total_yen || 0,
    provisional: !!report.payroll?.provisional,
  };
}

module.exports = { fetchZhirizhuIncome, toItems };
