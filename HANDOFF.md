# Codex 与 Claude 任务交接

更新：2026-11-26（日本时间）

## 使用方式

每次交接在此记录任务、接手人、进度、可复查的证据和下一步。先读取最新提交，再更新对应任务，保留仍需核实的信息。此仓库为公开仓库，请只记录可公开的资料。

## 当前任务：日本大学留学生入试资料

- **已核对**：4 所大学的 2027 年 4 月入学日程。下方 CSV 可供接手者直接保存。日期列的“未公布”表示未找到适用于该年度的具体日期，“不另设校内考试”表示要项明示无单独校内考试。
- **进行中**：已有 40 行公开统计和 1 行新设记录。仍需按下方院系清单逐校核对 2023～2026 年度学部外国人留学生选拔的受験者数、合格者数。若没有受験者数，可填志願者数并在备注标明。缺少公开数据时留空数字并说明原因。年度以入学年度为准。
- **接手顺序**：优先查看学校官方入试结果 PDF；缺项再查 JPSS 对应学部。已找到的官方入口列在下面。公开院系列表见文末；个别名称仍需按学校当年公告核对。
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

### 2023～2026 年报录数据（已核实部分）

表中有数据缺口。来源原表是横线时，合格者数保持空白；原表是 0 时保留 0。导入前应检查待补年份、学部名称与选拔类别。

```csv
大学,学部,学科(可空),年度,受験者数,合格者数,来源URL,来源类型(官方/JPSS/其他),备注
東京科学大学,環境・社会理工学院,建築学,2026,1,0,https://admissions.isct.ac.jp/ja/013/undergraduate/data,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔
東京科学大学,環境・社会理工学院,土木・環境工学,2026,2,1,https://admissions.isct.ac.jp/ja/013/undergraduate/data,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔
東京科学大学,環境・社会理工学院,融合理工学,2026,16,20,https://admissions.isct.ac.jp/ja/013/undergraduate/data,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔
東京科学大学,環境・社会理工学院,建築学,2025,6,1,https://admissions.isct.ac.jp/plugins/cms/component_download_file.php?contentsDataId=&contentsId=&fileName=%E4%BB%A4%E5%92%8C7%E5%B9%B4%E5%BA%A6%E5%AD%A6%E5%A3%AB%E8%AA%B2%E7%A8%8B%E5%85%A5%E5%AD%A6%E9%81%B8%E6%8A%9C%E5%AE%9F%E6%96%BD%E7%B5%90%E6%9E%9C&key=eca27c62e161e852034c633dc48b3074.pdf&pageId=3041&prevId=&type=1,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔
東京科学大学,環境・社会理工学院,土木・環境工学,2025,2,0,https://admissions.isct.ac.jp/plugins/cms/component_download_file.php?contentsDataId=&contentsId=&fileName=%E4%BB%A4%E5%92%8C7%E5%B9%B4%E5%BA%A6%E5%AD%A6%E5%A3%AB%E8%AA%B2%E7%A8%8B%E5%85%A5%E5%AD%A6%E9%81%B8%E6%8A%9C%E5%AE%9F%E6%96%BD%E7%B5%90%E6%9E%9C&key=eca27c62e161e852034c633dc48b3074.pdf&pageId=3041&prevId=&type=1,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔
東京科学大学,環境・社会理工学院,融合理工学,2025,20,20,https://admissions.isct.ac.jp/plugins/cms/component_download_file.php?contentsDataId=&contentsId=&fileName=%E4%BB%A4%E5%92%8C7%E5%B9%B4%E5%BA%A6%E5%AD%A6%E5%A3%AB%E8%AA%B2%E7%A8%8B%E5%85%A5%E5%AD%A6%E9%81%B8%E6%8A%9C%E5%AE%9F%E6%96%BD%E7%B5%90%E6%9E%9C&key=eca27c62e161e852034c633dc48b3074.pdf&pageId=3041&prevId=&type=1,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔
東京科学大学,環境・社会理工学院,建築学,2024,3,2,https://admissions.isct.ac.jp/plugins/cms/component_download_file.php?contentsDataId=&contentsId=&fileName=data-01&key=002a09d606e3b1ab1b931d2c1de354b4.pdf&pageId=3041&prevId=&type=1,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔；当年度为東京工業大学
東京科学大学,環境・社会理工学院,土木・環境工学,2024,0,0,https://admissions.isct.ac.jp/plugins/cms/component_download_file.php?contentsDataId=&contentsId=&fileName=data-01&key=002a09d606e3b1ab1b931d2c1de354b4.pdf&pageId=3041&prevId=&type=1,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔；当年度为東京工業大学
東京科学大学,環境・社会理工学院,融合理工学,2024,17,19,https://admissions.isct.ac.jp/plugins/cms/component_download_file.php?contentsDataId=&contentsId=&fileName=data-01&key=002a09d606e3b1ab1b931d2c1de354b4.pdf&pageId=3041&prevId=&type=1,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔；当年度为東京工業大学
東京科学大学,環境・社会理工学院,建築学,2023,4,2,https://admissions.titech.ac.jp/admissions/pdf/r5-3-record-gakushi7625389.pdf,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔；当年度为東京工業大学
東京科学大学,環境・社会理工学院,土木・環境工学,2023,3,2,https://admissions.titech.ac.jp/admissions/pdf/r5-3-record-gakushi7625389.pdf,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔；当年度为東京工業大学
東京科学大学,環境・社会理工学院,融合理工学,2023,12,16,https://admissions.titech.ac.jp/admissions/pdf/r5-3-record-gakushi7625389.pdf,官方,以第一志愿志願者数代替受験者数；合格为第2次选拔；当年度为東京工業大学
信州大学,サステナブル社会協創学環,,2023～2026,,,https://www.shinshu-u.ac.jp/school/sc/,官方,新设；2027年4月开设
山口大学,医学部,医学科,2026,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2026/04/r8jisshijokyo.pdf,官方,私費外国人選抜
山口大学,医学部,保健学科 看護学専攻,2026,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2026/04/r8jisshijokyo.pdf,官方,私費外国人選抜
山口大学,医学部,保健学科 検査技術科学専攻,2026,1,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2026/04/r8jisshijokyo.pdf,官方,私費外国人選抜
山口大学,教育学部,,2026,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2026/04/r8jisshijokyo.pdf,官方,私費外国人選抜；学部合计
山口大学,医学部,医学科,2025,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2025/04/r7jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,医学部,保健学科 看護学専攻,2025,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2025/04/r7jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,医学部,保健学科 検査技術科学専攻,2025,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2025/04/r7jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,教育学部,,2025,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2025/04/r7jitusijoukyou.pdf,官方,私費外国人選抜；学部合计
山口大学,医学部,医学科,2024,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2024/04/r6jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,医学部,保健学科 看護学専攻,2024,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2024/04/r6jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,医学部,保健学科 検査技術科学専攻,2024,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2024/04/r6jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,教育学部,,2024,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2024/04/r6jitusijoukyou.pdf,官方,私費外国人選抜；学部合计
山口大学,医学部,医学科,2023,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2023/04/R5jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,医学部,保健学科 看護学専攻,2023,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2023/04/R5jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,医学部,保健学科 検査技術科学専攻,2023,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2023/04/R5jitusijoukyou.pdf,官方,私費外国人選抜
山口大学,教育学部,,2023,0,0,https://www.yamaguchi-u.ac.jp/nyushi/wp-content/uploads/2023/04/R5jitusijoukyou.pdf,官方,私費外国人選抜；学部合计
京都女子大学,心理共生学部,心理共生学科,2026,2,2,https://www.kyoto-wu.ac.jp/nyushi/daigaku/kekka/2026/n0oio700000034lk-att/n0oio700000034og.pdf,官方,外国人留学生入学試験
京都女子大学,発達教育学部,教育学科,2026,1,0,https://www.kyoto-wu.ac.jp/nyushi/daigaku/kekka/2026/n0oio700000034lk-att/n0oio700000034og.pdf,官方,外国人留学生入学試験
京都女子大学,文学部,日本語日本文学科,2026,0,,https://www.kyoto-wu.ac.jp/nyushi/daigaku/kekka/2026/n0oio700000034lk-att/n0oio700000034og.pdf,官方,志願者数为0；受験者数和合格者数原表均为横线
京都女子大学,文学部,英語文化コミュニケーション学科,2026,0,,https://www.kyoto-wu.ac.jp/nyushi/daigaku/kekka/2026/n0oio700000034lk-att/n0oio700000034og.pdf,官方,志願者数为0；受験者数和合格者数原表均为横线
京都女子大学,文学部,歴史学科,2026,0,,https://www.kyoto-wu.ac.jp/nyushi/daigaku/kekka/2026/n0oio700000034lk-att/n0oio700000034og.pdf,官方,志願者数为0；受験者数和合格者数原表均为横线
京都女子大学,法学部,法学科,2026,0,,https://www.kyoto-wu.ac.jp/nyushi/daigaku/kekka/2026/n0oio700000034lk-att/n0oio700000034og.pdf,官方,志願者数为0；受験者数和合格者数原表均为横线
摂南大学,法学部,法律学科,2026,1,1,https://sakura-2.setsunan.ac.jp/admission/faculty/results/files/2026/2026_ryuugakusei.pdf,官方,外国人留学生入試
摂南大学,法学部,法律学科,2025,0,,https://sakura-2.setsunan.ac.jp/admission/faculty/results/files/2026/2026_ryuugakusei.pdf,官方,志願者数为0；受験者数和合格者数原表均为横线
摂南大学,現代社会学部,現代社会学科,2026,1,0,https://sakura-2.setsunan.ac.jp/admission/faculty/results/files/2026/2026_ryuugakusei.pdf,官方,外国人留学生入試
摂南大学,現代社会学部,現代社会学科,2025,2,1,https://sakura-2.setsunan.ac.jp/admission/faculty/results/files/2026/2026_ryuugakusei.pdf,官方,外国人留学生入試
摂南大学,看護学部,看護学科,2026,2,0,https://sakura-2.setsunan.ac.jp/admission/faculty/results/files/2026/2026_ryuugakusei.pdf,官方,外国人留学生入試
摂南大学,看護学部,看護学科,2025,1,1,https://sakura-2.setsunan.ac.jp/admission/faculty/results/files/2026/2026_ryuugakusei.pdf,官方,外国人留学生入試
```

### 待核对的院系范围

以下为调查范围，用来定位资料。部分名称可能含原始录入误差或跨年度改组，导入前以当年官网为准。已录入的院系只需补缺失年度或分项。

- 東京科学大学：環境・社会理工学院
- 名古屋市立大学：理学部
- 大阪公立大学：看護学部
- 神戸大学：農学部
- 信州大学：サステナブル社会協創学環
- 山口大学：医学部、教育学部
- 岐阜大学：教育学部
- 立命館大学：デザイン・アート学部
- 立教大学：コミュニティ福祉学部
- 佐賀大学：医学部、教育学部、芸術地域デザイン学部
- 南山大学：経営学部
- 大阪教育大学：教育協働学科
- 宮崎大学：地域資源創成学部
- 富山大学：芸術文化学部、都市デザイン学部
- 岩手大学：獣医学部
- 弘前大学：教育学部
- 徳島大学：医学部、歯学部、薬学部
- 新潟大学：医学部
- 日本女子大学：建築デザイン学部、経済学部
- 東京学芸大学：学校教育教員養成課程、教育支援課程
- 東京都市大学：デザイン・データ科学部、創発デザイン工学環
- 東京電機大学：システムデザイン学部
- 東洋大学：環境イノベ―ション学部
- 福島大学：政経学部、食農学部
- 秋田大学：医学部
- 龍谷大学：情報学部、理工学部、環境サステナビリティ学部
- 茨城大学：地域未来共創学環
- 近畿大学：产能理工学部、情報学科
- 長崎大学：医学部、情報デ一夕科学部、薬学部
- 静岡大学：グローバル共創科学部、教育学部
- 駒澤大学：グローバル・メディア・スタディーズ学部、医療健康科学部
- 鳥取大学：医学部
- 鹿児島大学：医学部
- 名城大学：人間学部、外国語学部、都市情報学部
- 大東文化大学：スポーツ・ 健康科学部
- 宮城大学：看護学群、食産業学群
- 愛媛大学：医学部、教育学部
- 愛知大学：社会情報学部
- 愛知県立大学：教育福祉学部、看護学部
- 昭和女子大学：環境デザイン学部
- 東京農業大学：地城環境科学部
- 西南学院大学：外国語学部、神学部
- 長崎県立大学：国际社会学部、地域创造学部、情报システム学部、看护营养学部、经营学部
- 長野大学：共創情報科学部、地域経営学部
- 静岡県立大学：食品栄養科学部
- 香川大学：医学部
- 京都女子大学：心理共生学部、文学部、法学部、発達教育学部、食科学部
- 仙台白百合大学：人间学部
- 共立女子大学：建築・デザイン学部
- 北海道医療大学：医疗技术学部
- 北海道情報大学：情報メディア学部、総合情報学部
- 十文字学園女子大学：文学部
- 和洋女子大学：AIライフデザイン学部、家政学部
- 四国大学：デジタル创生学部、生活科学部、看护学部
- 四天王寺大学：教育学部、文学部、社会学部
- 大妻女子大学：データサイエンス学部、比較文化学部
- 大正大学：仏教学部、地域創生学部、情報科学部、表現学部
- 大阪工業大学：知的財産学部
- 大阪産業大学：建築・環境デザイン学部
- 大阪経済法科大学：経営学部
- 大阪電気通信大学：建築・デザイン学部
- 宮城学院女子大学：学艺学部、生活科学部
- 岡山理科大学：教育学部、理学部
- 帝京科学大学：医療科学部
- 愛知工業大学：情報科学部、経営学部
- 摂南大学：法学部、現代社会学部、看護学部
- 明星大学：データサイエンス学環
- 東北工業大学：建築学部
- 桜美林大学：グローバル‧コミュニケーション学群、教育探究科学群
- 沖縄大学：人文学部、经发商学部
- 活水女子大学：健康生活学部、国际文化学部
- 甲南女子大学：国際学部、文学部
- 白百合女子大学：文学部
- 目白大学：韓国学部
- 神戸女学院大学：心理学部、生命環境学部
- 神戸学院大学：法学部
- 福岡大学：スポーツ科学部、薬学部
- 福岡工業大学：デジタルメディア学部
- 追手門学院大学：地域創造学部、心理学部、文学部、法学部、社会学部、経済学部
- 関東学院大学：建築・環境学部
- 静岡理工科大学：建築・ 都市デザイン学部
- 鹿児島国際大学：国際文化学部、福祉社会学部、経済学部
- 麗沢大学：工学部
- 中部大学：応用生物学部、教育学部、理工学部
- 京都橘大学：デジタルメディア学部、国際学部
- 城西国際大学：原清单只备注海外出愿需先联系学校；待明确目标学部
- 大阪女学院大学：国際教養学部
- 敬愛大学：情報マネジメント学部
- 日本福祉大学：スポ一ツ科学部、健康科学部、教育·心理学部、総合政策学部
- 明海大学：ホスピタリティ·ツーリズム学部
- 長崎総合科学大学：先端工学部
- 開智国際大学：教育学部

### 回写

Claude 可从 `main` 读取最新交接内容。在 `claude/ok-j0k5er` 分支更新同名 `HANDOFF.md` 时，注明复核结果、实际导入的记录数量、尚待补查的院系和证据链接。若尚未导入，写明当前状态。
