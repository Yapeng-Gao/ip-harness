/* Demo Happy Path — static sample for main-path-sample */
window.DEMO = {
  brand: "Novada Team",
  tagline: "团队协作 · 关键处你来确认",
  depts: [
    { id: "d1", num: "①", name: "立项部", desc: "要不要立这个方向", thin: true, line: "项目已创建 + 方向一句话 + 状态 + 用户确认", ban: "勿把建项说成完整论证报告；≠③保护去向；≠⑤申不申" },
    { id: "d2", num: "②", name: "创新激发部", desc: "问题卡点 → 路径 → 方案", thin: true, line: "问题→路径→用户选题+收藏（或跳过留痕）", ban: "报告/三图≠本部主交付；无授权承诺；可整段跳过" },
    { id: "d3", num: "③", name: "专利挖掘部", desc: "研发资料 → 创新点 + 拆案", thin: true, line: "报告路径或交④点包路径择一确认", ban: "不代替④交底 / ⑤申不申；不承诺可授权" },
    { id: "d4", num: "④", name: "交底部", desc: "技术事实 → 交底书全绿", thin: false, line: "交底质检全绿" },
    { id: "d5", num: "⑤", name: "申请部", desc: "合格交底 → 申请文件 → 递交", thin: false, line: "申请文件可递交（过线）" },
    { id: "d6", num: "⑥", name: "答复部", desc: "通知书 → 策略 → 答复", thin: false, line: "本轮答复可递交（D 过线）" },
    { id: "d7", num: "⑦", name: "维护部", desc: "确权后期限 · 年费 · 台账", thin: true, line: "台账可核 + 期限提醒 +（有费）缴费经用户确认", ban: "台账有≠看板已交付；系统内提醒≠短信邮件已通" },
    { id: "d8", num: "⑧", name: "复盘部", desc: "年末/阶段复盘报告", thin: true, line: "复盘报告已交 + 维持/放弃已拍或只读不拍留痕", ban: "⑧≠情报官≠检索；只读不拍不得回写⑦" }
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
      { id: "lead", name: "交底部负责人", role: "主持分活 / 打包工单", av: "负", photo: "04.jpg", kind: "lead", tag: "主", status: "doing", busy: "汇总中", outputAnchor: "doc-top", blurb: "主持分活与硬请示打包" },
      { id: "writer", name: "成稿专家", role: "材料 · 提纲 · 起草", av: "成", photo: "07.jpg", kind: "writer", tag: "主", status: "doing", busy: "成稿中", outputAnchor: "sec-tech", blurb: "主笔技术方案与实施方式" },
      { id: "polish", name: "润色专家", role: "改表述不改技术含义", av: "润", photo: "11.jpg", kind: "polish", tag: "协", status: "wait", busy: "待审", outputAnchor: "sec-effect", blurb: "润色效果表述，待审" },
      { id: "search", name: "检索专家", role: "交底向查新（选做）", av: "检", photo: "02.jpg", kind: "search", tag: "协", status: "idle", busy: "未请来", outputAnchor: "sec-bg", blurb: "选做查新 · 未请来" },
      { id: "qc", name: "质检专家", role: "检测循环 · 不可与成稿糊", av: "质", photo: "08.jpg", kind: "qc", tag: "主", status: "doing", busy: "复检中", outputAnchor: "qc-card", blurb: "质检分卡 · 盯红黄项" },
      { id: "advisor", name: "代理顾问", role: "成色视角（选做）", av: "顾", photo: "09.jpg", kind: "advisor", tag: "协", status: "idle", busy: "未请来", outputAnchor: "sec-problem", blurb: "成色视角 · 未请来" }
    ],
    feed: [
      { who: "交底部负责人", expertId: "lead", text: "材料够开写。已请成稿专家出草案；润色待命；质检席单独盯红项。", tools: ["分活", "组编制"] },
      { who: "成稿专家", expertId: "writer", text: "草案已落主栏。效果数据标了「样机测」——若要硬数字请你补测报告。", tools: ["读材料", "写 · 技术方案"] },
      { who: "质检专家", expertId: "qc", text: "q4 暂黄：效果依据偏弱。可认风险过，或补数据后再绿。", tools: ["检 · q4", "标黄"] },
      { who: "成稿专家", expertId: "writer", text: "对照图纸补了进水口错位描述。", tools: ["对照图纸", "改段"] }
    ],
    factAsk: {
      conclusion: "技术方案与「样机测」效果描述与本案材料一致，可据当前稿确认交底事实。",
      anchor: "sec-tech",
      label: "依据摘录 · 技术方案",
      text: "壳体设螺旋水道；转子端盖集成散热鳍片；进水口与出水口错位布置。关键连接处采用双密封圈。"
    },
    hand5Ask: {
      conclusion: "交底质检全绿且事实已确认后，可交申请部撰写——本确认 ≠ 已开工单。",
      anchor: "qc-card",
      label: "依据摘录 · 质检分卡",
      text: "全绿项齐 · q4 效果依据已补（演示）。过线 ≠ 已交⑤。"
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
    { kind: "案卷", title: "电机冷却结构 · 交底案", sub: "④ 交底部 · 待确认事实", go: "d4-fact" },
    { kind: "专家", title: "成稿专家 · 交底部", sub: "主笔技术方案", go: "d4-fact" },
    { kind: "请示", title: "确认交底事实", sub: "硬请示 · 今日", go: "d4-fact" },
    { kind: "案卷", title: "低功耗膜分离 · OA", sub: "⑥ 答复部", go: "d6" }
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
    understand: "本案核心：螺旋水道 + 端盖鳍片 + 双密封，解决高功率密度温升与泄漏。",
    noveltyHint: "申请向查新摘要（示意）：最接近 D1 公开螺旋水道；区别＝端盖鳍片+双密封组合。",
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
      { side: "交底", text: "进水口与出水口错位布置。关键连接处采用双密封圈。" },
      { side: "权项", text: "所述进水口与出水口沿轴向错位布置；所述水道与端盖连接处设置双密封圈。" },
      { side: "交底", text: "同功率温升下降约 12℃（样机测）" },
      { side: "说明书", text: "有益效果：同功率温升下降约 12℃（样机测）；装配工时可减 15%。" }
    ]
  },
  reply: {
    deadline: "2026-11-12（剩余约 14 天）",
    issues: ["对比文件 D1 公开螺旋水道", "创造性：鳍片与水道组合是否显而易见"],
    contention: "争点中立复述：审查员认为鳍片与水道组合相对 D1 显而易见；本案拟主张双密封+错位进出口带来的非显而易见效果。",
    replySections: [
      { id: "rp-issue", h: "审查意见要点", t: "1）D1 公开螺旋水道；2）认为鳍片与水道组合相对于 D1 显而易见。" },
      { id: "rp-cont", h: "争点中立复述", t: "审查员认为鳍片与水道组合相对 D1 显而易见；本案拟主张双密封+错位进出口带来的非显而易见效果。" },
      { id: "rp-arg", h: "意见陈述 · 创造性", t: "D1 未披露端盖鳍片与双密封的组合，也未给出错位进出口以降低泄漏的教导。本申请效果数据表明温升与装配工时同步改善，非简单叠加。" },
      { id: "rp-amend", h: "修改说明（示意）", t: "权利要求1补入「双密封圈」与「轴向错位」限定；说明书同步补实施例数据引用。" }
    ],
    oaExcerpt: "……本领域技术人员在 D1 螺旋水道基础上，容易想到在端盖增设散热鳍片，因此权利要求1不具备创造性……",
    diffs: [
      { side: "通知书", text: "鳍片与水道组合相对于 D1 显而易见" },
      { side: "答复", text: "主张双密封+错位进出口带来的非显而易见效果，并补入权要限定" },
      { side: "原权要", text: "一种电机冷却结构，包括壳体水道与端盖鳍片……" },
      { side: "拟改", text: "……进一步包括双密封圈，且进水口与出水口沿轴向错位布置。" }
    ]
  }
};
