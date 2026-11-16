// 解析手机通知文本 → 交易记录
// 支持：PayPay、交通卡（Suica/PASMO/ICOCA）、信用卡（楽天/三井住友/JCB/AMEX 等）、银行转账
'use strict';

const SOURCES = [
  { id: 'paypay', name: 'PayPay', match: /paypay/i },
  { id: 'transit', name: '交通卡', match: /suica|pasmo|icoca|manaca|nimoca|kitaca|交通系|モバイルsuica/i },
  { id: 'credit', name: '信用卡', match: /カード|card|楽天|三井住友|vpass|jcb|amex|アメックス|エポス|イオン|セゾン|信用卡/i },
  { id: 'bank', name: '银行', match: /銀行|bank|振込|振替|ゆうちょ|入金|出金/i },
];

// 金额：¥1,234 / 1,234円 / ￥1234 / 1234 日元
const AMOUNT_RE = /(?:[¥￥]\s*([\d,]+(?:\.\d+)?))|(?:([\d,]+(?:\.\d+)?)\s*(?:円|日元|元|yen|JPY))/i;

const INCOME_WORDS = /受け取|受取|入金|チャージされ|返金|払い戻し|払戻|送金を受|振込.*(?:あり|され)|收到|到账|退款|refund|received/i;
const TRANSFER_WORDS = /送金|送った|振込|振替|转账|transfer/i;
const CHARGE_WORDS = /チャージ|charge|充值/i;

function detectSource(text, app) {
  const hay = `${app || ''} ${text}`;
  for (const s of SOURCES) if (s.match.test(hay)) return s;
  return { id: 'other', name: '其他' };
}

function parseAmount(text) {
  const m = text.match(AMOUNT_RE);
  if (!m) return null;
  const n = Number((m[1] || m[2]).replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function detectMerchant(text) {
  const patterns = [
    /(?:ご利用先|利用先|加盟店|店舗|支払先|お店)[:：\s]*([^\s,，。\n]+)/,
    /([^\s「」]+?)(?:で|にて)[\d,¥￥]+.*?(?:支払|決済|利用)/,
    /「([^」]+)」/,
    /(\S+?)さん(?:に|から)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) return m[1].trim();
  }
  return '';
}

function guessCategory(text, sourceId) {
  const rules = [
    ['交通', /suica|pasmo|icoca|電車|バス|jr|駅|地下鉄|タクシー|運賃|乗車/i],
    ['餐饮', /セブン|ローソン|ファミ|コンビニ|マクド|すき家|吉野家|松屋|スタバ|カフェ|レストラン|食|ラーメン|ミニストップ/i],
    ['购物', /amazon|アマゾン|楽天市場|ユニクロ|ドン・キホーテ|ドンキ|イオン|ビック|ヨドバシ/i],
    ['订阅/通讯', /netflix|spotify|apple|google|docomo|au|softbank|ソフトバンク|楽天モバイル/i],
    ['水电燃气', /電気|ガス|水道|東京電力|東京ガス/i],
  ];
  for (const [cat, re] of rules) if (re.test(text)) return cat;
  if (sourceId === 'transit') return '交通';
  return '其他';
}

/**
 * @param {{text:string, app?:string, title?:string, time?:string}} n
 * @returns {null | {amount:number, type:'expense'|'income'|'transfer'|'internal', source:string, sourceName:string, merchant:string, category:string, date:string, raw:string}}
 */
function parseNotification(n) {
  const text = [n.title, n.text].filter(Boolean).join(' ').trim();
  if (!text) return null;
  const amount = parseAmount(text);
  if (amount == null) return null;
  const source = detectSource(text, n.app);

  let type = 'expense';
  if (INCOME_WORDS.test(text) && !(source.id === 'transit' && CHARGE_WORDS.test(text))) type = 'income';
  else if (TRANSFER_WORDS.test(text) && !/受け取|受取|から/.test(text)) type = 'transfer';
  // 交通卡充值：资金从钱包转入交通卡，不算支出（乘车扣款才算），避免重复计算
  if (source.id === 'transit' && CHARGE_WORDS.test(text)) type = 'internal';

  const d = n.time ? new Date(n.time) : new Date();
  return {
    amount,
    type,
    source: source.id,
    sourceName: source.name,
    merchant: detectMerchant(text),
    category: type === 'income' ? '收入' : guessCategory(text, source.id),
    date: (isNaN(d) ? new Date() : d).toISOString(),
    raw: text,
  };
}

module.exports = { parseNotification, parseAmount, detectSource, guessCategory };
