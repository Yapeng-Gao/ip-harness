/* Demo Happy Path — static sample for main-path-sample */
window.DEMO = {
  brand: "Novada Team",
  tagline: "团队协作 · 关键处你来确认",
  depts: [
    { id: "d1", num: "①", name: "立项部", leadPhoto: "12.jpg", desc: "要不要立这个方向", thin: true, line: "项目已创建 + 方向一句话 + 状态 + 用户确认", ban: "勿把建项说成完整论证报告；≠③保护去向；≠⑤申不申" },
    { id: "d2", num: "②", name: "创新激发部", leadPhoto: "10.jpg", desc: "问题卡点 → 路径 → 方案", thin: true, line: "问题→路径→用户选题+收藏（或跳过留痕）", ban: "报告/三图≠本部主交付；无授权承诺；可整段跳过" },
    { id: "d3", num: "③", name: "专利挖掘部", leadPhoto: "03.jpg", desc: "研发资料 → 创新点 + 拆案", thin: true, line: "报告路径或交④点包路径择一确认", ban: "不代替④交底 / ⑤申不申；不承诺可授权" },
    { id: "d4", num: "④", name: "交底部", desc: "技术事实 → 交底书全绿", thin: false, line: "交底质检全绿" },
    { id: "d5", num: "⑤", name: "申请部", desc: "合格交底 → 申请文件 → 递交", thin: false, line: "申请文件可递交（过线）" },
    { id: "d6", num: "⑥", name: "答复部", desc: "通知书 → 策略 → 答复", thin: false, line: "本轮答复可递交（D 过线）" },
    { id: "d7", num: "⑦", name: "维护部", leadPhoto: "09.jpg", desc: "确权后期限 · 年费 · 台账", thin: true, line: "台账可核 + 期限提醒 +（有费）缴费经用户确认", ban: "台账有≠看板已交付；系统内提醒≠短信邮件已通" },
    { id: "d8", num: "⑧", name: "复盘部", leadPhoto: "01.jpg", desc: "年末/阶段复盘报告", thin: true, line: "复盘报告已交 + 维持/放弃已拍或只读不拍留痕", ban: "⑧≠情报官≠检索；只读不拍不得回写⑦" }
  ],
  sampleFiles: [
    { name: "电机冷却结构技术说明.docx", type: "技术说明·灵感草稿", summary: "描述水道布局与散热鳍片组合", conf: "high" },
    { name: "装配示意-侧视.png", type: "图纸照片", summary: "侧视剖面，标出进水口", conf: "mid" },
    { name: "口述补充.txt", type: "其他杂件", summary: "「先把技术写成交底」", conf: "high" }
  ],
  intents: [
    "你可能想先把现有技术整理成一份可交申请的交底书",
    "若已有合格交底，也可能是直接进申请部撰写",
    "材料偏单点方案，不太像多案挖掘"
  ],
  suggest: {
    main: { dept: "d4", reason: "无合格交底成稿，仅有技术说明与图纸；用户原话偏「写交底」。" },
    alts: [
      { dept: "d5", reason: "若你坚持已有交底要递交——进部后门槛会再检。" },
      { dept: "d3", reason: "若还要拆多案再写——可先挖点（备选）。" }
    ],
    gaps: ["尚无交底书成稿", "可选查新报告未做（可备注）"]
  },
  handoff: [
    { item: "技术说明正文", status: "ok", note: "已入案卷" },
    { item: "图纸/照片", status: "ok", note: "已入案卷" },
    { item: "交底书成稿", status: "gap", note: "缺口 · 交底部成稿" },
    { item: "发明人/申请人信息", status: "warn", note: "粗全 · 进部可补" }
  ],
  disclosure: {
    title: "一种电机冷却结构的发明交底书（草案）",
    sections: [
      { id: "sec-field", h: "技术领域", t: "本实用新型/发明涉及电机散热领域，尤其是带水道与鳍片组合的冷却结构。" },
      { id: "sec-bg", h: "背景技术", t: "现有风冷在高功率密度下温升偏高；纯水冷结构复杂、泄漏风险大。" },
      { id: "sec-problem", h: "发明内容 · 技术问题", t: "在不显著增加体积的前提下，提高散热效率并降低泄漏风险。" },
      { id: "sec-tech", h: "技术方案", t: "壳体设螺旋水道；转子端盖集成散热鳍片；进水口与出水口错位布置。关键连接处采用双密封圈。" },
      { id: "sec-effect", h: "有益效果", t: "同功率温升下降约 12℃（样机测）；装配工时可减 15%。" },
      { id: "sec-mode", h: "具体实施方式", t: "实施例一：铝合金壳体 + 尼龙端盖鳍片……（演示稿，可点专家追问修改）" }
    ],
    qc: [
      { id: "q1", name: "技术领域清晰", status: "green" },
      { id: "q2", name: "技术问题可验证", status: "green" },
      { id: "q3", name: "方案要素齐全", status: "green" },
      { id: "q4", name: "效果有数据/依据", status: "yellow" },
      { id: "q5", name: "实施方式可复现", status: "green" }
    ],
    roster: [
      { id: "lead", name: "交底部负责人", role: "主持分活 / 打包工单", av: "负", photo: "04.jpg", kind: "lead", tag: "主", status: "doing", busy: "汇总中", outputAnchor: "doc-top", blurb: "主持分活与硬请示打包", style: "收敛·打包口" },
      { id: "writer", name: "成稿专家", role: "材料 · 提纲 · 起草", av: "成", photo: "07.jpg", kind: "writer", tag: "主", status: "doing", busy: "成稿中", outputAnchor: "sec-tech", blurb: "主笔技术方案与实施方式", style: "偏结构、少形容词" },
      { id: "polish", name: "润色专家", role: "改表述不改技术含义", av: "润", photo: "11.jpg", kind: "polish", tag: "协", status: "wait", busy: "待审", outputAnchor: "sec-effect", blurb: "润色效果表述，待审", style: "改表述不改技术含义" },
      { id: "search", name: "检索专家", role: "交底向查新（选做）", av: "检", photo: "02.jpg", kind: "search", tag: "协", status: "idle", busy: "未请来", outputAnchor: "sec-bg", blurb: "选做查新 · 未请来", style: "证据优先" },
      { id: "qc", name: "质检专家", role: "检测循环 · 不可与成稿糊", av: "质", photo: "08.jpg", kind: "qc", tag: "主", status: "doing", busy: "复检中", outputAnchor: "qc-card", blurb: "质检分卡 · 盯红黄项", style: "对照图纸+规则检", method: "对照图纸+规则检 q4" },
      { id: "advisor", name: "代理顾问", role: "成色视角（选做）", av: "顾", photo: "09.jpg", kind: "advisor", tag: "协", status: "idle", busy: "未请来", outputAnchor: "sec-problem", blurb: "成色视角 · 未请来", style: "成色视角" }
    ],
    feed: [
      { who: "交底部负责人", expertId: "lead", text: "材料够开写。已请成稿专家出草案；润色待命；质检席单独盯红项。", tools: ["分活", "组编制"] },
      { who: "成稿专家", expertId: "writer", text: "草案已落主栏。效果数据标了「样机测」——若要硬数字请你补测报告。", tools: ["读材料", "写 · 技术方案"] },
      { who: "质检专家", expertId: "qc", text: "q4 暂黄：效果依据偏弱。去相关：对照图纸+规则检 q4。可认风险过，或补数据后再绿。", tools: ["检 · q4", "对照图纸", "规则检"] },
      { who: "成稿专家", expertId: "writer", text: "对照图纸补了进水口错位描述。", tools: ["对照图纸", "改段"] }
    ],
    factAsk: {
      conclusion: "技术方案与「样机测」效果描述与本案材料一致，可据当前稿确认交底事实。",
      anchor: "sec-tech",
      label: "依据摘录 · 技术方案",
      text: "壳体设螺旋水道；转子端盖集成散热鳍片；进水口与出水口错位布置。关键连接处采用双密封圈。",
      source: "电机冷却结构技术说明.docx · 装配示意-侧视.png",
      reasoning: "材料写水道/鳍片/密封 → 对照图纸侧视剖面 → 与主栏技术方案段一一对应，无矛盾。",
      compare: "备选「单密封」表述与图纸双密封圈不符；当前稿取双密封+错位进出口。",
      confidence: "mid",
      confidenceNote: "效果数据标「样机测」· 存疑可认风险"
    },
    hand5Ask: {
      conclusion: "交底质检全绿且事实已确认后，可交申请部撰写——本确认 ≠ 已开工单。",
      anchor: "qc-card",
      label: "依据摘录 · 质检分卡",
      text: "全绿项齐 · q4 效果依据已处理。过线 ≠ 已交⑤。",
      source: "质检分卡 q1–q5 · 结束检查表",
      reasoning: "五项质检均绿 → 事实已确认 → 满足交⑤输入契约；本拍板只授权开写，不开工单。",
      compare: "「全绿」≠「已交⑤」；未拍本钮不得开④→⑤工单。",
      confidence: "high",
      confidenceNote: "契约齐 · 高置信"
    }
  },
  lobbySeed: [
    { id: "seed-fact", kind: "a", tag: "技术事实", text: "交底部 · 电机冷却案：待确认交底事实", sub: "电机冷却结构 · 今日 14:30", go: "d4-fact", cover: "fact", cta: "核对依据" },
    { id: "seed-hand", kind: "a", tag: "节点交付", text: "交底部 · 全绿后待拍「可交⑤」", sub: "交底质检 · 今日 17:00", go: "d4-hand", cover: "hand", cta: "去拍板" },
    { id: "seed-reply", kind: "c", tag: "期限", text: "答复部 · 审查意见剩余约 14 天", sub: "电机冷却 · 截止 2026-11-12", go: "d6", cover: "reply", cta: "进答复部" }
  ],
  progressCases: [
    {
      id: "pc1", title: "电机冷却结构 · 交底案", dept: "④ 交底部", status: "待你确认事实", go: "d4-fact",
      view: "dept", summary: "成稿已落 · 质检黄项补齐中 · 待你确认事实",
      traces: [
        { who: "成稿专家", act: "写 · 技术方案", at: "13:42" },
        { who: "质检专家", act: "检 · q4 标黄", at: "14:05" },
        { who: "交底部负责人", act: "打包硬请示「确认事实」", at: "14:18" }
      ]
    },
    {
      id: "pc2", title: "模块化热管理 · 申请撰写", dept: "⑤ 申请部", status: "质检中", go: "d5",
      view: "apply", summary: "理解已确认 · 独权草案质检循环",
      traces: [
        { who: "申请部负责人", act: "开案理解确认", at: "昨日" },
        { who: "权项专家", act: "写 · 独权 1–3", at: "10:20" },
        { who: "质检专家", act: "对照交底差分", at: "11:02" }
      ]
    },
    {
      id: "pc3", title: "低功耗膜分离 · 首通 OA", dept: "⑥ 答复部", status: "剩余 18 天", go: "d6",
      view: "reply", summary: "争点复述已出 · 待你确认策略",
      traces: [
        { who: "答复部负责人", act: "读通知书 · 拆争点", at: "09:10" },
        { who: "争点专家", act: "中立复述 D1 组合", at: "09:40" },
        { who: "策略专家", act: "拟缩限方案 A/B", at: "10:15" }
      ]
    }
  ],
  scheduleItems: [
    { id: "sch1", kind: "催办", title: "交底事实确认仍未拍", when: "今日 14:30", case: "电机冷却结构", go: "d4-fact" },
    { id: "sch2", kind: "定时", title: "答复截止提醒 · 剩余 14 天", when: "每日 09:00", case: "低功耗膜分离", go: "d6" },
    { id: "sch3", kind: "催办", title: "⑤ 独权质检黄项未关", when: "明日 10:00", case: "模块化热管理", go: "d5" },
    { id: "sch4", kind: "定时", title: "年费窗口预告（演示）", when: "11-08", case: "台账样例", go: null }
  ],
  searchHits: [
    { kind: "案卷", title: "电机冷却结构 · 交底案", sub: "④ 交底部 · 待确认事实", go: "d4-fact",
      snippet: "技术方案与样机测效果描述一致 · 待你确认事实", match: "确认事实" },
    { kind: "专家", title: "成稿专家 · 交底部", sub: "主笔技术方案", go: "d4-fact",
      snippet: "主笔 · 技术方案段 · 风格偏结构", match: "成稿" },
    { kind: "请示", title: "确认交底事实", sub: "硬请示 · 今日", go: "d4-fact",
      summary: "结论：技术方案与样机测效果描述与本案材料一致，可确认事实。",
      snippet: "螺旋水道 + 双密封 · 可确认事实", match: "确认交底事实" },
    { kind: "案卷", title: "低功耗膜分离 · OA", sub: "⑥ 答复部", go: "d6",
      snippet: "审查意见答复 · 剩余 14 天", match: "膜分离" },
    { kind: "检索", title: "D1 · 壳体螺旋水道（示意）", sub: "最接近现有技术 · 点开看对照", go: "d5-diff",
      snippet: "公开螺旋水道 · 未披露鳍片+双密封", match: "螺旋水道" }
  ],
  caseSwitch: [
    { id: "pc1", title: "电机冷却结构", dept: "④" },
    { id: "pc2", title: "模块化热管理", dept: "⑤" },
    { id: "pc3", title: "低功耗膜分离", dept: "⑥" }
  ],
  frontTrajectory: [
    { t: "收件", d: "已接收 3 份材料入案卷暂存" },
    { t: "分类", d: "技术说明 · 图纸 · 口述补充" },
    { t: "意图", d: "主假设：先写成交底再申请" },
    { t: "建议", d: "主推 ④ 交底部 · 备选 ⑤ / ③" }
  ],
  apply: {
    roster: [
      { id: "a-lead", name: "申请部负责人", role: "主持 A/B/C", av: "申", photo: "05.jpg", kind: "lead", tag: "主", status: "doing", busy: "开案中", style: "打包口" },
      { id: "a-claim", name: "权项专家", role: "独权/从权", av: "权", photo: "07.jpg", kind: "writer", tag: "主", status: "doing", busy: "写独权", outputAnchor: "claim-c1", style: "偏结构" },
      { id: "a-qc", name: "质检专家", role: "过线检测", av: "质", photo: "08.jpg", kind: "qc", tag: "主", status: "doing", busy: "对照交底", outputAnchor: "d5-qc", style: "对照交底+规则", method: "对照交底差分+形式检" }
    ],
    qc: [
      { id: "aq1", name: "权项与交底一致", status: "green" },
      { id: "aq2", name: "说明书支撑权项", status: "green" },
      { id: "aq3", name: "形式要件齐全", status: "yellow" }
    ],
    understand: "本案核心：螺旋水道 + 端盖鳍片 + 双密封，解决高功率密度温升与泄漏。",
    understandAsk: {
      conclusion: "本案核心：螺旋水道 + 端盖鳍片 + 双密封，解决高功率密度温升与泄漏。",
      source: "交底技术方案 · 附图 · 口述补充",
      reasoning: "开案理解对齐交底三点组合；后续查新/权项以此为共同事实基础。",
      compare: "交底主张三点组合 vs 开案复述三点组合 · 无遗漏关键区别点",
      confidence: "high",
      confidenceNote: "与交底一致 · 高置信",
      anchor: "block-a",
      label: "开案理解摘录",
      text: "螺旋水道 + 端盖鳍片 + 双密封 · 温升与泄漏"
    },
    noveltyHint: "申请向查新摘要（示意）：最接近 D1 公开螺旋水道；区别＝端盖鳍片+双密封组合。",
    applyOrNotAsk: {
      conclusion: "相对最接近 D1，本案区别点足够支撑先走申请；建议「申请」。",
      source: "申请向查新摘要 · 交底技术方案",
      reasoning: "D1 公开螺旋水道 → 本案另有端盖鳍片+双密封组合 → 区别可写进独权。",
      compare: "D1：仅螺旋水道。本案：水道 + 鳍片 + 双密封 + 错位进出口。",
      confidence: "high",
      confidenceNote: "查新对比清晰 · 高置信",
      anchor: "sp-bg"
    },
    submitAsk: {
      conclusion: "申请文件已过线，可确认向官方递交。",
      source: "权项 · 说明书 · 过线质检",
      reasoning: "过线证明文件集齐可递交 → 本拍板承担递交法律责任。",
      compare: "过线 ≠ 已递交；未拍本钮不得视为已递交。",
      confidence: "high",
      confidenceNote: "签字级 · 高置信",
      files: [
        { name: "权利要求书.pdf", ok: true },
        { name: "说明书.pdf", ok: true },
        { name: "说明书附图.pdf", ok: true },
        { name: "申请书/著录项目", ok: true }
      ],
      risk: "递交后权要以官方受理文本为准；演示样机不产生真实官费。"
    },
    claimsHint: "独权草案：一种电机冷却结构，包括壳体水道……（示意）",
    specHint: "说明书章节已按交底展开（示意帧）。",
    claims: [
      { id: "c1", no: "1", kind: "独权", text: "一种电机冷却结构，包括壳体、设于所述壳体内的螺旋水道、设于转子端盖的散热鳍片，以及分别设于壳体两端的进水口与出水口；所述进水口与出水口沿轴向错位布置；所述水道与端盖连接处设置双密封圈。" },
      { id: "c2", no: "2", kind: "从权", text: "根据权利要求1所述的电机冷却结构，其特征在于，所述螺旋水道的螺距沿轴向渐变，靠近出水口一侧螺距减小。" },
      { id: "c3", no: "3", kind: "从权", text: "根据权利要求1所述的电机冷却结构，其特征在于，所述散热鳍片与端盖一体成型，鳍片高度为端盖外径的 8%～15%。" },
      { id: "c4", no: "4", kind: "从权", text: "根据权利要求1所述的电机冷却结构，其特征在于，所述双密封圈包括内侧弹性密封圈与外侧防尘密封圈。" }
    ],
    specSections: [
      { id: "sp-field", h: "技术领域", t: "本发明涉及电机散热领域，尤其是带水道与鳍片组合的冷却结构。" },
      { id: "sp-bg", h: "背景技术", t: "现有风冷在高功率密度下温升偏高；纯水冷结构复杂、泄漏风险大。D1 公开了壳体螺旋水道，但未披露端盖鳍片与双密封的组合。" },
      { id: "sp-sum", h: "发明内容", t: "本发明要解决的技术问题是：在不显著增加体积的前提下提高散热效率并降低泄漏风险。技术方案包括螺旋水道、端盖鳍片与双密封圈，以及进水口与出水口的错位布置。" },
      { id: "sp-fig", h: "附图说明", t: "图1 为冷却结构侧视剖面；图2 为水道展开示意；图3 为双密封局部放大。" },
      { id: "sp-mode", h: "具体实施方式", t: "实施例一：铝合金壳体 + 尼龙端盖鳍片；水道截面为矩形；双密封圈过盈量 0.15～0.25 mm……（演示分页稿）" }
    ],
    diffs: [
      {
        id: "ad1", change: "改", leftLabel: "交底", rightLabel: "权项", go: "claim-c1",
        left: "进水口与出水口错位布置。关键连接处采用双密封圈。",
        right: "所述进水口与出水口沿轴向错位布置；所述水道与端盖连接处设置双密封圈。",
        markLeft: ["错位布置", "双密封圈"],
        markRight: ["沿轴向错位布置", "双密封圈"]
      },
      {
        id: "ad2", change: "增", leftLabel: "交底", rightLabel: "说明书", go: "sp-sum",
        left: "同功率温升下降约 12℃（样机测）",
        right: "有益效果：同功率温升下降约 12℃（样机测）；装配工时可减 15%。",
        markLeft: ["12℃"],
        markRight: ["12℃", "装配工时可减 15%"]
      }
    ],
    priorArtHits: [
      { id: "pa1", tag: "D1", title: "壳体螺旋水道冷却结构", meta: "最接近 · CN××××",
        snippet: "公开螺旋水道；未披露端盖鳍片与双密封组合", match: "螺旋水道", go: "sp-bg" },
      { id: "pa2", tag: "D2", title: "端盖散热鳍片（示意）", meta: "次近 · 组合教导弱",
        snippet: "单独鳍片散热 · 无水道+双密封教导", match: "鳍片", go: "sp-sum" },
      { id: "pa3", tag: "内部", title: "本案交底 · 效果段", meta: "本案材料",
        snippet: "温升下降约 12℃（样机测）", match: "12℃", go: "sp-mode" }
    ]
  },
  /* 纪律一 · 闸表抽数据（样机对照一期节点） */
  gateTable: [
    { id: "front-dest", grade: "P1", label: "确认去向", dept: "前台" },
    { id: "d4-fact", grade: "P0", label: "确认交底事实", dept: "④" },
    { id: "d4-hand5", grade: "P0", label: "可否交⑤", dept: "④" },
    { id: "d5-understand", grade: "P1", label: "理解确认", dept: "⑤" },
    { id: "d5-apply", grade: "P0", label: "申不申", dept: "⑤" },
    { id: "d5-submit", grade: "P0", label: "确认递交", dept: "⑤" },
    { id: "d6-contention", grade: "P1", label: "争点理解", dept: "⑥" },
    { id: "d6-strategy", grade: "P0", label: "策略/缩限", dept: "⑥" },
    { id: "d6-submit", grade: "P0", label: "本轮递交", dept: "⑥" }
  ],
  /* T12 跨案偏好示意 */
  preferences: [
    { id: "pref-effect", caseId: "pc1", text: "你上次要求：效果必须标测法（样机测 / 仿真 / 文献）", from: "电机冷却 · 交底案", precipitable: true, saved: false }
  ],
  agencyLobbySeed: [
    { id: "seed-agency", kind: "a", tag: "陪同⑤", text: "陪同客户 · 模块化热管理案：待拍「申不申」", sub: "代理武装 · 今日", go: "d5", cover: "agency", cta: "陪同进⑤" }
  ],
  reply: {
    roster: [
      { id: "r-lead", name: "答复部负责人", role: "主持闸", av: "答", photo: "06.jpg", kind: "lead", tag: "主", status: "doing", busy: "盯期限", style: "打包口" },
      { id: "r-cont", name: "争点专家", role: "中立复述", av: "争", photo: "02.jpg", kind: "writer", tag: "主", status: "doing", busy: "复述中", outputAnchor: "rp-cont", style: "中立·不争辩" },
      { id: "r-strat", name: "策略专家", role: "缩限/争辩选项", av: "策", photo: "11.jpg", kind: "writer", tag: "主", status: "doing", busy: "拟 A/B", outputAnchor: "rp-amend", style: "权衡影响" }
    ],
    upgraded: false,
    deadline: "2026-11-12（剩余约 14 天）",
    issues: ["对比文件 D1 公开螺旋水道", "创造性：鳍片与水道组合是否显而易见"],
    contention: "争点中立复述：审查员认为鳍片与水道组合相对 D1 显而易见；本案拟主张双密封+错位进出口带来的非显而易见效果。",
    strategyOptions: [
      {
        id: "A",
        title: "缩限：独权写入双密封+轴向错位",
        impact: "保护范围变窄；授权概率升高；放弃「纯鳍片宽保护」。",
        recommend: true
      },
      {
        id: "B",
        title: "争辩不缩限：坚持组合非显而易见",
        impact: "范围更宽；驳回/二通风险升高；需更强效果证据。",
        recommend: false
      }
    ],
    strategyAsk: {
      conclusion: "建议采纳方案 A（缩限），在期限前稳住授权路径。",
      source: "通知书摘录 · 争点复述 · 效果数据",
      reasoning: "D1 未教双密封+错位 → 写入独权可避开「鳍片显而易见」主攻；代价是放弃宽保护。",
      compare: "A 弃宽求稳；B 保宽担风险。",
      confidence: "mid",
      confidenceNote: "策略权衡 · 中置信（效果数据仍弱）"
    },
    submitAsk: {
      conclusion: "本轮答复文件可递交。",
      source: "意见陈述 · 修改说明 · 权要修订页",
      reasoning: "争点已确认 + 策略已拍 → 文件集齐 → 本拍板递交本轮答复。",
      compare: "确认递交 ≠ 已授权；未拍不得视为已答复。",
      confidence: "high",
      confidenceNote: "签字级",
      files: [
        { name: "意见陈述书.pdf", ok: true },
        { name: "修改后的权利要求书.pdf", ok: true },
        { name: "修改说明页", ok: true }
      ],
      risk: "递交后以官方收文为准；超期未递交须升级催办（不可静默）。"
    },
    replySections: [
      { id: "rp-issue", h: "审查意见要点", t: "1）D1 公开螺旋水道；2）认为鳍片与水道组合相对于 D1 显而易见。" },
      { id: "rp-cont", h: "争点中立复述", t: "审查员认为鳍片与水道组合相对 D1 显而易见；本案拟主张双密封+错位进出口带来的非显而易见效果。" },
      { id: "rp-arg", h: "意见陈述 · 创造性", t: "D1 未披露端盖鳍片与双密封的组合，也未给出错位进出口以降低泄漏的教导。本申请效果数据表明温升与装配工时同步改善，非简单叠加。" },
      { id: "rp-amend", h: "修改说明（示意）", t: "权利要求1补入「双密封圈」与「轴向错位」限定；说明书同步补实施例数据引用。" }
    ],
    oaExcerpt: "……本领域技术人员在 D1 螺旋水道基础上，容易想到在端盖增设散热鳍片，因此权利要求1不具备创造性……",
    diffs: [
      {
        id: "rd1", change: "改", leftLabel: "通知书", rightLabel: "答复", go: "rp-arg",
        left: "鳍片与水道组合相对于 D1 显而易见",
        right: "主张双密封+错位进出口带来的非显而易见效果，并补入权要限定",
        markLeft: ["显而易见"],
        markRight: ["双密封+错位进出口", "非显而易见"]
      },
      {
        id: "rd2", change: "改", leftLabel: "原权要", rightLabel: "拟改", go: "rp-amend",
        left: "一种电机冷却结构，包括壳体水道与端盖鳍片……",
        right: "……进一步包括双密封圈，且进水口与出水口沿轴向错位布置。",
        markLeft: ["端盖鳍片"],
        markRight: ["双密封圈", "轴向错位"]
      }
    ]
  }
};
