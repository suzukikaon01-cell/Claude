// 教务系统收入联动
// 各学校/机构的教务系统接口不同，这里提供两种通用接入方式：
//  1) JSON API：配置 SCHOOL_API_URL（可带 {month} 占位符，格式 YYYY-MM）和 SCHOOL_API_TOKEN
//     期望返回 [{date, amount, title?}] 或 {items:[...]}，字段名可通过 SCHOOL_FIELD_* 映射
//  2) CSV 导入：从教务系统导出“课时费/工资统计”CSV，在网页上上传（列：日期,金额,说明）
'use strict';

function normalizeItems(list, map = {}) {
  const f = { date: map.date || 'date', amount: map.amount || 'amount', title: map.title || 'title' };
  return list
    .map((r) => ({
      date: new Date(r[f.date]).toISOString(),
      amount: Number(String(r[f.amount]).replace(/[,¥￥円]/g, '')),
      title: r[f.title] || '教务收入',
    }))
    .filter((r) => Number.isFinite(r.amount) && r.amount > 0 && r.date);
}

async function fetchSchoolIncome(month, env = process.env) {
  const url = env.SCHOOL_API_URL;
  if (!url) throw new Error('未配置 SCHOOL_API_URL');
  const res = await fetch(url.replace('{month}', month), {
    headers: env.SCHOOL_API_TOKEN ? { Authorization: `Bearer ${env.SCHOOL_API_TOKEN}` } : {},
  });
  if (!res.ok) throw new Error(`教务系统返回 ${res.status}`);
  const body = await res.json();
  const list = Array.isArray(body) ? body : body.items || body.data || [];
  return normalizeItems(list, {
    date: env.SCHOOL_FIELD_DATE,
    amount: env.SCHOOL_FIELD_AMOUNT,
    title: env.SCHOOL_FIELD_TITLE,
  });
}

function parseCsv(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const rows = lines.map((l) => (l.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || [])
    .map((c) => c.replace(/,$/, '').trim().replace(/^"|"$/g, '').replace(/""/g, '"')));
  if (rows.length && isNaN(Date.parse(rows[0][0]))) rows.shift(); // 跳过表头
  return normalizeItems(rows.map(([date, amount, title]) => ({ date, amount, title })));
}

module.exports = { fetchSchoolIncome, parseCsv, normalizeItems };
