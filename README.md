# 自动记账 App

手机上每出现一笔 **PayPay / 交通卡（Suica·PASMO·ICOCA）/ 信用卡 / 银行转账** 通知，自动计入收支；联动**教务系统**的收入统计，计算当月 **收入、流出、盈余、储蓄率**。

零依赖（Node.js ≥ 18），后端 + 可安装到手机主屏的 PWA。

## 运行

```bash
INGEST_TOKEN=换成你的密钥 npm start
```

打开 `http://<服务器IP>:3000/?token=你的密钥`，在手机浏览器中“添加到主屏幕”。数据保存在 `data/db.json`。

## 统计口径

| 项目 | 计算 |
|---|---|
| 收入 | 收款/退款/入金通知 + 教务系统收入 |
| 流出 | 消费（支付、乘车、刷卡）+ 转账转出 |
| 盈余 | 收入 − 流出 |
| 不计入 | 交通卡充值（钱包→交通卡的内部移动，乘车时才算支出，避免重复计算） |

同一通知 2 分钟内重复推送会自动去重。

## 让手机自动推送通知

普通 App 无法直接读取其他 App 的通知，需借助系统自动化工具把通知转发到 `POST /api/ingest`：

**Android（推荐，可全自动）** — MacroDroid / Tasker / Automate
1. 触发器：「通知已收到」，应用选 PayPay、モバイルSuica、各信用卡 App、银行 App
2. 动作：HTTP 请求 `POST http://<服务器>/api/ingest`，Header `x-token: 你的密钥`，Body：
   ```json
   {"app":"[notification_app_name]","title":"[notification_title]","text":"[notification]"}
   ```

**iPhone** — iOS 不允许读取通知内容，可用替代方式：
- 快捷指令 →「自动化」→「电子钱包」交易触发（Apple Pay 的 Suica/信用卡），动作「获取 URL 内容」POST 到 `/api/ingest`，Body 为 `{"app":"商家","text":"商家 ¥金额"}`
- 信用卡 / PayPay 开启“利用通知邮件”，用邮件规则或 Gmail 转发到上述接口

也可直接发送纯文本：`curl -X POST -H "x-token: 密钥" --data "ローソンで¥450を支払いました" http://<服务器>/api/ingest`

## 截图记账 / 倒查本月记录

**iPhone 快捷指令（截屏 → 自动识别 → 记账）**

新建快捷指令，依次添加：
1. 「截屏」（Take Screenshot）
2. 「从图像中提取文本」（Extract Text from Image，iPhone 本机识别，无需联网 OCR）
3. 「获取 URL 内容」：URL `https://ledger.lesson-desk.workers.dev/api/screenshot`，方法 POST，头部 `x-token: 你的密钥`，请求体选「文件」并选上一步的「文本」
4. 「从输入中获取词典值」键 `added` →「显示通知」：`已记账 [词典值] 笔`

之后在 设置 → 辅助功能 → 触控 → 轻点背面 → 轻点两下 选这个快捷指令：打开 PayPay 支付完成页、收据、或卡/Suica 的明细列表，敲两下手机背面即可记账。

- 一张截图可含多笔（明细列表），也可是单笔（收据取「合計」）
- 自动修正 OCR 常见误差（¥ 识别成 `\`、千位逗号识别成句点、日文字间空格）
- 余额（残高）、可用额度、积分会被忽略；交通卡充值记为内部转移，不算支出
- **去重**：同一天、同金额、同类型只补差额——重复截同一张图不会重复记账，同一天往返两次 ¥170 也不会被误删

**倒查本月信用卡/交通卡**：网页上「导入截图 / 账单」可选多张明细截图（在浏览器里识别），或卡公司网站下载的明细 CSV（楽天・三井住友・JCB 等，支持 Shift_JIS），也可直接粘贴文字。

## 联动教务系统收入（知日塾）

默认对接你自己的 **知日塾教务系统**（`app.lesson-desk.workers.dev`），直接复用其“收入”页的同一套算法：普通 1v1 3000/h、1v1 面试 3000/h、模拟面试 750/30 分钟、通勤 356/次，按周/月课时上限结转后的**当月结算金额**，每个结算日记一条收入。

```bash
ZHIRIZHU_PASSWORD=教师登录密码 INGEST_TOKEN=你的密钥 npm start
```

- 点页面上「同步教务系统收入」即可；重复同步会覆盖该月旧数据，不会重复记账。当月未结束时显示为暂定值，并同时显示授课应得（结转前）金额。
- 记账后台用 `/api/login`（remember，会话 400 天）登录，只调用只读接口 `GET /api/income/month`，**不修改教务系统任何数据**。会话失效时自动重新登录。
- 不想保存密码：可在浏览器登录教务系统后，把 `sidx` cookie 值设为 `ZHIRIZHU_SESSION`。
- 测试环境：`ZHIRIZHU_URL=https://app-staging.lesson-desk.workers.dev`。

其他教务系统可用通用方式：设置 `SCHOOL_API_URL`（可含 `{month}`）与 `SCHOOL_API_TOKEN`，返回 `[{date, amount, title}]`；或导出 CSV（`日期,金额,说明`）在页面上「导入教务 CSV」。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/ingest` | 推送通知（JSON 或纯文本），自动解析 |
| POST | `/api/screenshot` / `/api/import` | OCR 文本或账单 CSV 批量导入（自动去重） |
| POST | `/api/transactions` | 手动记账 `{type, amount, merchant, category, date}` |
| DELETE | `/api/transactions/:id` | 删除 |
| GET | `/api/summary?month=YYYY-MM` | 月度汇总与明细 |
| POST | `/api/school/sync?month=YYYY-MM` | 从教务 API 同步 |
| POST | `/api/school/csv` | 导入教务 CSV |

## 测试

```bash
npm test
```

## 部署（Cloudflare Workers）

正式站：https://ledger.lesson-desk.workers.dev （与知日塾同一 Cloudflare 账号，独立 Worker `ledger`，不影响教务 Worker `app`）

- 存储：Durable Object（SQLite），免费套餐可用
- 教务收入：通过 service binding 直连 `app` Worker；每天东京 6:00 自动同步当月收入
- 密钥：`npx wrangler secret put INGEST_TOKEN`、`npx wrangler secret put ZHIRIZHU_PASSWORD`
- 部署：`npx wrangler deploy`
