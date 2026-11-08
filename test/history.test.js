const test = require('node:test');
const assert = require('node:assert');
const { parseAny, planImport } = require('../lib/history');
const now = '2026-11-08T10:00:00+09:00';

test('Suica 历史截图（含残高、往返同价）', () => {
  const ocr = `モバイルSuica 利用履歴
11/02 入 新宿 出 渋谷 -¥170 残高 ¥2,830
11/02 入 渋谷 出 新宿 -¥170 残高 ¥2,660
11/03 物販 セブン-イレブン -¥320 残高 ¥2,340
11/05 チャージ +¥3,000 残高 ¥5,340`;
  const r = parseAny(ocr, { now });
  assert.equal(r.length, 4);
  assert.deepEqual(r.map((x) => x.amount), [170, 170, 320, 3000]);
  assert.equal(r[0].source, 'transit'); assert.equal(r[0].category, '交通');
  assert.equal(r[2].category, '餐饮'); assert.equal(r[3].type, 'internal');
  assert.ok(r[0].date.startsWith('2026-11-02'));
});

test('信用卡 App 列表：日期、店名、金额分行', () => {
  const ocr = `楽天カード ご利用明細
2026/11/01
AMAZON.CO.JP
¥3,980
2026/11/04
スターバックス
¥650
ご利用可能額 ¥250,000`;
  const r = parseAny(ocr, { now });
  assert.equal(r.length, 2);
  assert.equal(r[0].merchant, 'AMAZON.CO.JP'); assert.equal(r[0].category, '购物');
  assert.equal(r[1].amount, 650); assert.equal(r[1].source, 'credit');
});

test('单笔收据/支付完成页取合計', () => {
  const ocr = `ローソン 新宿店
2026年11月07日 12:34
おにぎり ¥150
お茶 ¥140
小計 ¥290
消費税 ¥23
合計 ¥313`;
  const r = parseAny(ocr, { now });
  assert.equal(r.length, 1); assert.equal(r[0].amount, 313); assert.match(r[0].merchant, /ローソン/);
});

test('楽天カード CSV', () => {
  const csv = `"利用日","利用店名・商品名","利用者","支払方法","利用金額","支払手数料","支払総額"
"2026/11/01","AMAZON.CO.JP","本人","1回払い","3980","0","3980"
"2026/11/06","JR東日本 モバイルSUICA","本人","1回払い","3000","0","3000"`;
  const r = parseAny(csv, { app: '楽天カード' });
  assert.equal(r.length, 2); assert.equal(r[0].amount, 3980); assert.equal(r[0].merchant, 'AMAZON.CO.JP');
});

test('导入去重：只补差额', () => {
  const existing = [{ date: '2026-11-02T03:00:00.000Z', amount: 170, type: 'expense' }];
  const rows = parseAny(`11/02 新宿→渋谷 -¥170\n11/02 渋谷→新宿 -¥170`, { now, app: 'Suica' });
  const { add, skipped } = planImport(existing, rows);
  assert.equal(add.length, 1); assert.equal(skipped, 1);
});

test('真实 OCR 输出（¥ 误识为 \\、逗号误识为句点、字间空格）', () => {
  const ocr = "モバ イル Suica 利用 履歴\n\n11/02 新宿 - 渋谷 -\\170 残高 \\2.830\n\n11/03 物販 セブ ン - イ レブ ン -\\320 残高 \\2.510\n11/05 F チャ ー ジ +¥3,000 残高 \\5,510\n";
  const r = parseAny(ocr, { now });
  assert.deepEqual(r.map((x) => [x.amount, x.type]), [[170, 'expense'], [320, 'expense'], [3000, 'internal']]);
  assert.equal(r[1].category, '餐饮');
});
