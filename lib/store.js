'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Store {
  constructor(file) {
    this.file = file;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { transactions: [] };
  }
  save() {
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2));
    fs.renameSync(tmp, this.file);
  }
  add(tx) {
    // 去重：同来源、同金额、同原文、2 分钟内视为同一通知
    const dup = this.db.transactions.find(
      (t) => t.raw && t.raw === tx.raw && t.amount === tx.amount &&
        Math.abs(new Date(t.date) - new Date(tx.date)) < 120000
    );
    if (dup) return { tx: dup, duplicate: true };
    const rec = { id: crypto.randomUUID(), ...tx };
    this.db.transactions.push(rec);
    this.save();
    return { tx: rec, duplicate: false };
  }
  remove(id) {
    const n = this.db.transactions.length;
    this.db.transactions = this.db.transactions.filter((t) => t.id !== id);
    if (this.db.transactions.length !== n) this.save();
    return n !== this.db.transactions.length;
  }
  replaceSchoolIncome(month, items) {
    this.db.transactions = this.db.transactions.filter((t) => !(t.source === 'school' && t.date.startsWith(month)));
    for (const it of items) {
      this.db.transactions.push({
        id: crypto.randomUUID(), amount: it.amount, type: 'income', source: 'school', sourceName: '教务系统',
        merchant: it.title, category: '教务收入', date: it.date, raw: '',
      });
    }
    this.save();
  }
  month(month) {
    return this.db.transactions.filter((t) => t.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date));
  }
}

function summarize(list) {
  const s = { income: 0, schoolIncome: 0, expense: 0, transfer: 0, byCategory: {}, bySource: {} };
  for (const t of list) {
    if (t.type === 'income') {
      s.income += t.amount;
      if (t.source === 'school') s.schoolIncome += t.amount;
    } else if (t.type === 'expense') {
      s.expense += t.amount;
      s.byCategory[t.category] = (s.byCategory[t.category] || 0) + t.amount;
      s.bySource[t.sourceName] = (s.bySource[t.sourceName] || 0) + t.amount;
    } else if (t.type === 'transfer') s.transfer += t.amount; // internal（如交通卡充值）不计入
  }
  s.outflow = s.expense + s.transfer; // 流出 = 消费 + 转出
  s.surplus = s.income - s.expense - s.transfer; // 盈余
  s.savingRate = s.income ? s.surplus / s.income : 0;
  return s;
}

module.exports = { Store, summarize };
