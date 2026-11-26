# Codex 与 Claude 任务交接

更新：2026-11-26（日本时间）

## 使用方式

每次交接在此记录任务、接手人、进度、可复查的证据和下一步。先读取最新提交，再更新对应任务，保留仍需核实的信息。此仓库为公开仓库，请只记录可公开的资料。

## 当前任务：日本大学留学生入试资料

- **已核对**：4 所大学的 2027 年 4 月入学日程。下方 CSV 可供接手者直接保存。日期列的“未公布”表示未找到适用于该年度的具体日期，“不另设校内考试”表示要项明示无单独校内考试。
- **进行中**：按用户指定的院系清单，逐校核对 2023～2026 年度学部外国人留学生选拔的受験者数、合格者数。若没有受験者数，可填志願者数并在备注标明。缺少公开数据时留空数字并说明原因。年度以入学年度为准。
- **接手顺序**：优先查看学校官方入试结果 PDF；缺项再查 JPSS 对应学部。已找到的官方入口列在下面。需要使用用户指定的完整院系列表时，从当前任务的原始附件获取。
- **口径**：按单独公布的学科分行。保留不同留学生选拔方式的区别。合格者数使用最终合格人数。一般选拔、国费选拔、编入或入学人数只有在任务明确要求该口径时才纳入。

### 2027 年入试日程

```csv
大学,学部,期别,出愿开始,出愿截止,考试日,合格发表,来源URL,来源类型(官方/JPSS/其他)
大阪経済法科大学,全学部,前期A,2026-09-28,2026-10-09,不另设校内考试,2026-11-02,https://www.keiho-u.ac.jp/admission/exam/international/international.html,官方
大阪経済法科大学,全学部,前期B,2026-09-28,2026-10-09,不另设校内考试,2026-11-02,https://www.keiho-u.ac.jp/admission/exam/international/international.html,官方
大阪経済法科大学,全学部,後期A,2026-12-25,2027-01-20,不另设校内考试,2027-02-12,https://www.keiho-u.ac.jp/admission/exam/international/international.html,官方
大阪経済法科大学,全学部,後期B,2027-02-08,2027-02-24,不另设校内考试,2027-03-11,https://www.keiho-u.ac.jp/admission/exam/international/international.html,官方
大阪経済法科大学,全学部,留学生推薦・前期,2026-09-24,2026-10-02,2026-10-11,2026-11-02,https://www.keiho-u.ac.jp/admission/exam/international/international-recommendation.html,官方
大阪経済法科大学,全学部,留学生推薦・後期,2026-12-25,2027-01-20,2027-02-01,2027-02-12,https://www.keiho-u.ac.jp/admission/exam/international/international-recommendation.html,官方
島根大学,法文学部・人間科学部・総合理工学部・材料エネルギー学部・生物資源科学部,私費外国人留学生選抜,2026-08-24,2026-09-02,不另设校内考试,2026-10-01,https://www.shimane-u.ac.jp/_files/00431002/20260630_00.pdf,官方
活水女子大学（2027年度起：活水大学）,全学部,海外在住者,2026-09-01,2026-10-15,2026-11-21,2026-11-26,https://www.kwassui.ac.jp/university/lib/pdf/campuslife/kokusaikouryu/2027_ryugaku_1nen_bosyu.pdf,官方
活水女子大学（2027年度起：活水大学）,全学部,海外在住者（予備日）,2026-09-01,2026-10-15,2026-12-05,2026-12-24,https://www.kwassui.ac.jp/university/lib/pdf/campuslife/kokusaikouryu/2027_ryugaku_1nen_bosyu.pdf,官方
活水女子大学（2027年度起：活水大学）,全学部,日本国内在住者・第1回,2026-09-01,2026-10-15,2026-11-21,2026-11-26,https://www.kwassui.ac.jp/university/lib/pdf/campuslife/kokusaikouryu/2027_ryugaku_1nen_bosyu.pdf,官方
活水女子大学（2027年度起：活水大学）,全学部,日本国内在住者・第2回,2027-01-06,2027-01-30,2027-02-20,2027-02-25,https://www.kwassui.ac.jp/university/lib/pdf/campuslife/kokusaikouryu/2027_ryugaku_1nen_bosyu.pdf,官方
宇都宮共和大学,シティライフ学部,日本国内在住者・一般入試Ⅰ期,2027-01-12,2027-01-29,2027-02-06,2027-02-16,https://www.kyowa-u.ac.jp/admission/pdf/international_japan.pdf,官方
宇都宮共和大学,シティライフ学部,日本国内在住者・一般入試Ⅱ期,2027-02-05,2027-02-19,2027-02-27,2027-03-09,https://www.kyowa-u.ac.jp/admission/pdf/international_japan.pdf,官方
宇都宮共和大学,シティライフ学部,海外在住者・渡日前入学（年度未注明）,未公布,未公布,未公布,未公布,https://www.kyowa-u.ac.jp/admission/pdf/international_abroad.pdf,官方
```

### 历年数据的官方入口

- [東京科学大学理工学系入试数据](https://admissions.isct.ac.jp/ja/013/undergraduate/data)。已有 2024～2026 年官方结果，查看「私費外国人留学生特別選抜」。志願者按第一志愿归系，最终合格者可能来自其他志愿。
- [名古屋市立大学历年入试实施结果](https://www.nagoya-cu.ac.jp/admissions/application-status/result/)。历史年度同时查「総合生命理学部」。
- [大阪公立大学分年度入试资料](https://www.omu.ac.jp/admissions/ug/exam_info/summary/)。目标是看護学部的私費外国人留学生特別選抜。
- [神戸大学全日程入试结果](https://www.kobe-u.ac.jp/ja/admissions/undergraduate/results/)。核对農学部留学生选拔分项。
- [信州大学サステナブル社会協創学環入试信息](https://www.shinshu-u.ac.jp/school/sc/admission/)。先核对设立和招生年度，再查实绩。
- [山口大学历年入试数据](https://www.yamaguchi-u.ac.jp/nyushi/past/chousa/index.html)。按「私費外国人留学生」项核对医学部和教育学部，注意避开归国生徒分类。
- [立命館大学外国人留学生入试结果](https://admission.ritsumei.ac.jp/admission/international/result.html)、[徳島大学入試実施状況](https://www.tokushima-u.ac.jp/admission/admission/data.html)、[長崎大学過去の入試結果](https://www.nagasaki-u.ac.jp/nyugaku/admission/result/)、[愛知県立大学入試結果](https://www.aichi-pu.ac.jp/prospective/undergraduate/result/)、[京都女子大学入試結果](https://www.kyoto-wu.ac.jp/nyushi/daigaku/kekka/index.html)、[摂南大学入試結果](https://www.setsunan.ac.jp/admission/faculty/results/)。

```csv
大学,学部,学科(可空),年度,受験者数,合格者数,来源URL,来源类型(官方/JPSS/其他),备注
```
