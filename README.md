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

## 联动教务系统收入

各学校教务系统接口不同，提供两种方式：

1. **API 同步**：设置环境变量后点「同步教务系统收入」
   ```bash
   SCHOOL_API_URL="https://教务系统/api/salary?month={month}" SCHOOL_API_TOKEN=xxx npm start
   ```
   返回 `[{date, amount, title}]` 或 `{items:[...]}`；字段名不同时用 `SCHOOL_FIELD_DATE` / `SCHOOL_FIELD_AMOUNT` / `SCHOOL_FIELD_TITLE` 映射。同步会覆盖该月旧的教务记录，可重复执行。
2. **CSV 导入**：从教务系统导出课时费/工资统计，列为 `日期,金额,说明`，在页面上点「导入教务 CSV」。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/ingest` | 推送通知（JSON 或纯文本），自动解析 |
| POST | `/api/transactions` | 手动记账 `{type, amount, merchant, category, date}` |
| DELETE | `/api/transactions/:id` | 删除 |
| GET | `/api/summary?month=YYYY-MM` | 月度汇总与明细 |
| POST | `/api/school/sync?month=YYYY-MM` | 从教务 API 同步 |
| POST | `/api/school/csv` | 导入教务 CSV |

## 测试

```bash
npm test
```
