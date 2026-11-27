// 从截图 OCR 文本 / 账单 CSV 中批量提取交易（用于倒查本月记录、快捷指令截屏记账）
'use strict';
const { detectSource } = require('./parser');

const SKIP = /残高|合計ポイント|ポイント|利用可能|ご利用可能|限度額|お支払い予定|請求予定|累計|SF残額|balance/i;
const TOTAL = /合計|お支払(?:い)?金額|ご利用金額|お会計|支払金額|決済金額|total/i;
const AMT = /([+\-−－]?)\s*[¥￥]\s*([\d,]+)|([+\-−－]?)([\d,]{2,})\s*円/g;
const DATE_RES = [
  /(20\d{2})[\/\-.年]\s*(\d{1,2})[\/\-.月]\s*(\d{1,2})日?/,
  /(?<!\d)(\d{1,2})[\/月]\s*(\d{1,2})日?(?!\d)/,
];

function findDate(line, year) {
  let m = line.match(DATE_RES[0]);
  if (m) return { y: +m[1], mo: +m[2], d: +m[3], text: m[0] };
  m = line.match(DATE_RES[1]);
  if (m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= 31) return { y: year, mo: +m[1], d: +m[2], text: m[0] };
  return null;
}
const iso = (dt) => new Date(`${dt.y}-${String(dt.mo).padStart(2, '0')}-${String(dt.d).padStart(2, '0')}T12:00:00+09:00`).toISOString();
const clean = (s) => s.replace(/[¥￥]\s*[\d,]+|[\d,]+\s*円|[+\-−－]/g, ' ').replace(/\s+/g, ' ').trim();

function classify(line, ctx, sourceId, sign) {
  if (/チャージ|charge/i.test(line)) return 'internal';
  if (sign === '+' || /入金|受け取|受取|返金|払戻|払い戻し|refund|給与|給料/i.test(line)) return 'income';
  if (/送金|振込|振替/.test(line) && !/受/.test(line)) return 'transfer';
  return 'expense';
}

/**
 * 解析 OCR 出来的文本（支付成功页、收据、或交通卡/信用卡/PayPay 的历史列表截图）
 * @returns {Array<{amount,type,source,sourceName,merchant,category,date,raw}>}
 */
function parseHistoryText(text, opts = {}) {
  const now = opts.now ? new Date(opts.now) : new Date();
  const year = now.getFullYear();
  const src = detectSource(text, opts.app);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { guessCategory } = require('./parser');

  // 单笔：收据/支付完成页 —— 只有一个日期，并且有“合計/お支払金額”之类
  const dates = lines.map((l) => findDate(l, year)).filter(Boolean);
  const totalLine = lines.find((l) => TOTAL.test(l) && !SKIP.test(l) && /[¥￥]|円/.test(l));
  if (totalLine && new Set(dates.map((d) => `${d.mo}/${d.d}`)).size <= 1) {
    const m = [...totalLine.matchAll(AMT)][0];
    const amount = Number((m[2] || m[4]).replace(/,/g, ''));
    const merchant = clean(lines.find((l) => !/[\d¥￥]/.test(l) && l.length >= 2) || '');
    const dt = dates[0];
    return amount > 0 ? [{ amount, type: classify(text, text, src.id, m[1] || m[3]), source: src.id, sourceName: src.name, merchant, category: guessCategory(text, src.id), date: dt ? iso(dt) : now.toISOString(), raw: totalLine }] : [];
  }

  // 多笔：历史列表
  const out = [];
  let curDate = null, pending = '';
  for (const orig of lines) {
    // 去掉同一行里的余额列（交通卡历史常见：-¥170 残高 ¥2,830）
    const line = orig.replace(/(?:残高|残額|SF残額|balance)\s*[:：]?\s*[¥￥]?\s*[\d,]+\s*円?/gi, '').trim();
    const dt = findDate(line, year);
    if (dt) curDate = dt;
    if (SKIP.test(line)) continue;
    const ams = [...line.matchAll(AMT)];
    if (!ams.length) { const t = clean(dt ? line.replace(dt.text, '') : line); if (t.length >= 2) pending = t; continue; }
    if (!curDate) continue;
    const m = ams[0];
    const amount = Number((m[2] || m[4]).replace(/,/g, ''));
    if (!(amount > 0)) continue;
    const sign = (m[1] || m[3] || '').replace(/[−－]/, '-');
    let merchant = clean(dt ? line.replace(dt.text, '') : line) || pending;
    pending = '';
    const type = classify(line, text, src.id, sign);
    out.push({ amount, type, source: src.id, sourceName: src.name, merchant, category: type === 'income' ? '收入' : guessCategory(line + ' ' + merchant, src.id), date: iso(curDate), raw: line });
  }
  return out;
}

function splitCsvLine(l) {
  return (l.match(/("([^"]|"")*"|[^,\t]*)([,\t]|$)/g) || []).map((c) => c.replace(/[,\t]$/, '').trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
}

/** 信用卡/交通卡账单 CSV（楽天・三井住友・JCB・モバイルSuica 等）——自动识别日期、店名、金额列 */
function parseStatementCsv(text, opts = {}) {
  const src = detectSource(text, opts.app || '');
  const sourceId = opts.source || (src.id === 'other' ? 'credit' : src.id);
  const sourceName = { credit: '信用卡', transit: '交通卡', paypay: 'PayPay', bank: '银行' }[sourceId] || src.name;
  const { guessCategory } = require('./parser');
  const out = [];
  for (const line of text.replace(/^﻿/, '').split(/\r?\n/)) {
    const cells = splitCsvLine(line).filter((c) => c !== '');
    const di = cells.findIndex((c) => /^(20\d{2})[\/\-.年]\d{1,2}[\/\-.月]\d{1,2}日?$/.test(c));
    if (di < 0) continue;
    const [y, mo, d] = cells[di].match(/\d+/g).map(Number);
    const rest = cells.slice(di + 1);
    const ai = rest.findIndex((c) => /^[+\-−]?[¥￥]?[\d,]+円?$/.test(c) && Number(c.replace(/[^\d]/g, '')) > 0);
    if (ai < 0) continue;
    const rawAmt = rest[ai];
    const amount = Number(rawAmt.replace(/[^\d]/g, ''));
    const merchant = rest.slice(0, ai).find((c) => !/^[\d,¥￥\-]+$/.test(c)) || rest.find((c) => /\D{2,}/.test(c)) || '';
    let type = /^[-−]/.test(rawAmt) || /返品|取消|返金/.test(line) ? 'income' : 'expense';
    if (/チャージ/.test(line)) type = 'internal';
    out.push({ amount, type, source: sourceId, sourceName, merchant, category: type === 'income' ? '收入' : guessCategory(line, sourceId), date: iso({ y, mo, d }), raw: line.trim() });
  }
  return out;
}

/**
 * 与已有记录去重：同一天、同金额、同类型的笔数，导入时只补差额
 * （同一天两次 ¥170 乘车不会被误删，重复导入同一张截图也不会重复记账）
 */
function planImport(existing, rows) {
  const day = (d) => new Date(+new Date(d) + 9 * 3600e3).toISOString().slice(0, 10); // 东京日期
  const key = (t) => `${day(t.date)}|${t.amount}|${t.type}`;
  const have = new Map();
  for (const t of existing) have.set(key(t), (have.get(key(t)) || 0) + 1);
  const add = [];
  let skipped = 0;
  for (const r of rows) {
    const k = key(r), n = have.get(k) || 0;
    if (n > 0) { have.set(k, n - 1); skipped++; } else add.push(r);
  }
  return { add, skipped };
}

/** 修正常见 OCR 误识别：¥→\\ 或 Y、千位逗号→句点、日文字间空格、全角数字 */
function normalizeOcr(text) {
  const J = '\\u3040-\\u30ff\\u3400-\\u9fff\\uff66-\\uff9f';
  return text
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[，]/g, ',').replace(/[：]/g, ':').replace(/[／]/g, '/')
    .replace(/(^|[\s+\-−－(])[\\Y¥]\s?(?=\d)/g, '$1¥')
    .replace(/¥(\d{1,3})\.(\d{3})(?!\d)/g, '¥$1,$2')
    .replace(new RegExp(`([${J}]) +(?=[${J}])`, 'g'), '$1');
}

/** 自动判断是 CSV 还是 OCR 文本 */
function parseAny(text, opts = {}) {
  text = normalizeOcr(text);
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const csvLike = lines.filter((l) => /^"?20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}"?[,\t]/.test(l.trim())).length;
  return csvLike >= Math.max(1, lines.length / 3) ? parseStatementCsv(text, opts) : parseHistoryText(text, opts);
}

module.exports = { normalizeOcr, parseAny, parseHistoryText, parseStatementCsv, planImport };
