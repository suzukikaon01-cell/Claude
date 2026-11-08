const test = require('node:test');
const assert = require('node:assert');
const { parseNotification } = require('../lib/parser');
const { summarize } = require('../lib/store');
const { parseCsv } = require('../lib/school');

test('PayPay 支付', () => {
  const t = parseNotification({ app: 'PayPay', text: 'セブン-イレブンで¥580を支払いました' });
  assert.equal(t.amount, 580); assert.equal(t.type, 'expense'); assert.equal(t.source, 'paypay'); assert.equal(t.category, '餐饮');
});
test('PayPay 收款', () => {
  const t = parseNotification({ app: 'PayPay', text: '田中さんから1,000円を受け取りました' });
  assert.equal(t.type, 'income'); assert.equal(t.amount, 1000);
});
test('PayPay 送金是转出', () => {
  assert.equal(parseNotification({ app: 'PayPay', text: '田中さんに2,000円を送金しました' }).type, 'transfer');
});
test('Suica 乘车与充值', () => {
  const ride = parseNotification({ app: 'Suica', text: 'JR東日本 新宿→渋谷 ¥170' });
  assert.equal(ride.category, '交通'); assert.equal(ride.type, 'expense');
  assert.equal(parseNotification({ app: 'モバイルSuica', text: '3,000円チャージしました' }).type, 'internal');
});
test('信用卡', () => {
  const t = parseNotification({ app: '三井住友カード', text: 'ご利用先：AMAZON.CO.JP ご利用金額：12,800円' });
  assert.equal(t.amount, 12800); assert.equal(t.source, 'credit'); assert.equal(t.merchant, 'AMAZON.CO.JP');
});
test('无金额则忽略', () => assert.equal(parseNotification({ text: '新しいお知らせがあります' }), null));
test('盈余计算', () => {
  const s = summarize([
    { type: 'income', amount: 200000, source: 'school', category: '教务收入', sourceName: '教务系统' },
    { type: 'expense', amount: 30000, category: '餐饮', sourceName: 'PayPay' },
    { type: 'transfer', amount: 10000, category: '其他', sourceName: 'PayPay' },
    { type: 'internal', amount: 3000, category: '交通', sourceName: '交通卡' },
  ]);
  assert.equal(s.outflow, 40000); assert.equal(s.surplus, 160000); assert.equal(s.schoolIncome, 200000);
});
test('教务 CSV', () => {
  const r = parseCsv('日期,金额,说明\n2026-11-05,"45,000",11月课时费\n');
  assert.equal(r.length, 1); assert.equal(r[0].amount, 45000);
});
