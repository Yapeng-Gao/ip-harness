/* Demo Happy Path — static sample for main-path-sample */
window.DEMO = {
  brand: "Novada Team",
  tagline: "团队协作 · 关键处你来确认",
  depts: [
    { id: "d1", num: "①", name: "立项部", desc: "要不要立这个方向", thin: true, line: "项目状态已确认" },
    { id: "d2", num: "②", name: "创新激发部", desc: "问题卡点 → 路径 → 方案", thin: true, line: "选题/去向已拍（可跳过）" },
    { id: "d3", num: "③", name: "专利挖掘部", desc: "研发资料 → 创新点 + 拆案", thin: true, line: "点包可交④" },
    { id: "d4", num: "④", name: "交底部", desc: "技术事实 → 交底书全绿", thin: false, line: "交底质检全绿" },
    { id: "d5", num: "⑤", name: "申请部", desc: "合格交底 → 申请文件 → 递交", thin: false, line: "申请文件可递交（过线）" },
    { id: "d6", num: "⑥", name: "答复部", desc: "通知书 → 策略 → 答复", thin: false, line: "本轮答复可递交（D 过线）" },
    { id: "d7", num: "⑦", name: "维护部", desc: "确权后期限 · 年费 · 台账", thin: true, line: "期限/年费已确认" },
    { id: "d8", num: "⑧", name: "复盘部", desc: "年末/阶段复盘报告", thin: true, line: "报告已交（只读可不拍）" }
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
      { h: "技术领域", t: "本实用新型/发明涉及电机散热领域，尤其是带水道与鳍片组合的冷却结构。" },
      { h: "背景技术", t: "现有风冷在高功率密度下温升偏高；纯水冷结构复杂、泄漏风险大。" },
      { h: "发明内容 · 技术问题", t: "在不显著增加体积的前提下，提高散热效率并降低泄漏风险。" },
      { h: "技术方案", t: "壳体设螺旋水道；转子端盖集成散热鳍片；进水口与出水口错位布置。关键连接处采用双密封圈。" },
      { h: "有益效果", t: "同功率温升下降约 12℃（样机测）；装配工时可减 15%。" },
      { h: "具体实施方式", t: "实施例一：铝合金壳体 + 尼龙端盖鳍片……（演示稿，可点专家追问修改）" }
    ],
    qc: [
      { id: "q1", name: "技术领域清晰", status: "green" },
      { id: "q2", name: "技术问题可验证", status: "green" },
      { id: "q3", name: "方案要素齐全", status: "green" },
      { id: "q4", name: "效果有数据/依据", status: "yellow" },
      { id: "q5", name: "实施方式可复现", status: "green" }
    ],
    roster: [
      { id: "lead", name: "交底部负责人", role: "主持分活 / 打包工单", av: "负", kind: "lead" },
      { id: "writer", name: "交底专家", role: "成稿 · 润色", av: "交", kind: "writer", busy: "成稿中" },
      { id: "qc", name: "质检席", role: "检测循环 · 不可与成稿糊", av: "质", kind: "qc", busy: "复检中" }
    ],
    feed: [
      { who: "交底部负责人", text: "材料够开写。已请交底专家出草案，质检席单独盯红项。" },
      { who: "交底专家", text: "草案已落主栏。效果数据标了「样机测」——若要硬数字请你补测报告。" },
      { who: "质检席", text: "q4 暂黄：效果依据偏弱。可认风险过，或补数据后再绿。" }
    ]
  },
  apply: {
    understand: "本案核心：螺旋水道 + 端盖鳍片 + 双密封，解决高功率密度温升与泄漏。",
    claimsHint: "独权草案：一种电机冷却结构，包括壳体水道……（示意）",
    specHint: "说明书章节已按交底展开（示意帧）。"
  },
  reply: {
    deadline: "2026-11-12（剩余约 14 天）",
    issues: ["对比文件 D1 公开螺旋水道", "创造性：鳍片与水道组合是否显而易见"]
  }
};
