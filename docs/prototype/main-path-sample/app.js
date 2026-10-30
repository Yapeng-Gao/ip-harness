(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const state = {
    rosterFolded: false,
    view: "gate",
    gateDone: false,
    role: "ent", /* ent | agency */
    demoMode: "existing", /* existing | first */
    fdStep: "f1",
    files: [],
    analyzing: false,
    destinationConfirmed: false,
    confirmedDept: null,
    caseOpen: false,
    caseName: null,
    factConfirmed: false,
    canHand5: false,
    allGreen: false,
    workOrderOpened: false,
    enteredD4: false,
    disclosureReady: false,
    apply: { understand: false, applyOrNot: null, submit: false, overLine: false },
    reply: { contentionOk: false, limitOk: false, submit: false },
    drawerOpen: false,
    drawerTab: "materials",
    activeExpert: "writer",
    sideMode: "team", /* team | 1to1 */
    highlightAnchor: null,
    feedExtra: [],
    traces: [], /* 操作记录 */
    judgments: [], /* 判断档案 T10 */
    strategyChoice: null, /* ⑥ A|B */
    yellowRiskAccepted: false,
    toastTimer: null,
    thinDept: null,
    blockReason: null,
    sideComposeExtra: [],
    activeCaseId: "pc1",
    shellPanel: null, /* search | notify | schedule | cases | null */
    applyDocTab: "claims", /* claims | spec | diff */
    replyDocTab: "reply", /* reply | oa | diff */
    densityMode: "author", /* light=老板轻量 | author=主笔 */
    mentorDismissed: false,
    docVersion: "current", /* current | prev */
    atOpen: false,
    firstTipDismissed: false,
    applyDensity: "author",
    replyDensity: "author",
    applyClaimHighlight: null,
    replySecHighlight: null,
    applyYellowRisk: false,
    woChecks: { in1: false, in2: false, in3: false },
    thinLineConfirmed: {},
    searchPinAsk: null,
    invitedExperts: {},
    taskStripOpen: false, /* 轨迹飞层；进行中 chip 轨始终单行可见 */
    searchFilter: "全部" /* 壳搜索筛选 */
  };

  function deptById(id) { return DEMO.depts.find((d) => d.id === id); }

  function toast(msg, opts) {
    const el = $("#toast");
    if (!el) return;
    const soft = opts && opts.soft;
    el.textContent = msg;
    el.classList.toggle("soft", !!soft);
    el.classList.add("on");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      el.classList.remove("on");
      el.classList.remove("soft");
    }, soft ? 1100 : 2200);
  }

  function nowStamp() {
    return new Date().toLocaleString("zh-CN", { hour12: false });
  }

  function addTrace(title, detail) {
    state.traces.unshift({
      at: nowStamp(),
      title,
      detail
    });
  }

  /** T10 判断档案：结论/选项/理由/依据锚/置信 */
  function addJudgment(j) {
    state.judgments.unshift({
      at: nowStamp(),
      gate: j.gate || "",
      conclusion: j.conclusion || "",
      option: j.option || "",
      reason: j.reason || "",
      evidenceAnchor: j.evidenceAnchor || "",
      source: j.source || "",
      confidence: j.confidence || "",
      compare: j.compare || ""
    });
  }

  function confLabel(c) {
    if (c === "high") return "高";
    if (c === "mid") return "中·存疑可进部";
    if (c === "low") return "低·存疑";
    return c || "—";
  }

  function confClass(c) {
    return c === "high" ? "high" : c === "mid" ? "mid" : "low";
  }


  function gateGrade(id) {
    const g = (DEMO.gateTable || []).find((x) => x.id === id);
    return g ? g.grade : "P0";
  }
  function gradeBadge(id) {
    const g = gateGrade(id);
    return `<span class="grade-badge" data-testid="gate-grade">${escapeHtml(g)} 签字级</span>`;
  }


  /** Agent 汇报气泡：结论在上、依据可展、行动在消息内（Kimi/GPT 式） */
  function agentReportBubble({ testid, gradeId, title, lead, bodyHtml, actsHtml, done, doneLabel }) {
    const L = lead || { name: "负责人", av: "负", photo: null };
    const grade = gradeId ? gradeBadge(gradeId) : "";
    if (done) {
      return `<div class="bubble report done" data-testid="${testid}">
        <div class="bubble-head">${avatarHtml(L.photo, L.av)}<div class="who">${escapeHtml(L.name)}<span class="rpt-tag">已确认</span></div>${grade}</div>
        <div class="bubble-text"><div class="rpt-q">${escapeHtml(doneLabel || title)}</div></div>
        ${actsHtml ? `<div class="acts report-acts">${actsHtml}</div>` : ""}
      </div>`;
    }
    return `<div class="bubble report" data-testid="${testid}">
      <div class="bubble-head">${avatarHtml(L.photo, L.av)}<div class="who">${escapeHtml(L.name)}<span class="rpt-tag">向你汇报</span></div>${grade}</div>
      <div class="bubble-text report-body">
        <div class="rpt-q">${escapeHtml(title)}</div>
        ${bodyHtml || ""}
      </div>
      ${actsHtml ? `<div class="acts report-acts">${actsHtml}</div>` : ""}
    </div>`;
  }

  function evidenceDetailsHtml(ev, testid) {
    if (!ev) return "";
    const chain = evidenceChainHtml(ev, testid || "evidence-chain");
    return `<details class="rpt-ev" open data-testid="${(testid || "evidence")}-details">
      <summary>依据（来源 · 推演 · 对比 · 置信）</summary>
      ${chain}
    </details>`;
  }

  function askExcerptHtml(ask, chainTestId) {
    if (!ask) return "";
    return `<p class="ask-conclusion"><strong>结论</strong> ${escapeHtml(ask.conclusion || "")}</p>
      ${ask.label || ask.text ? `<button type="button" class="ask-excerpt" data-excerpt-anchor="${escapeHtml(ask.anchor || "")}" data-testid="ask-excerpt">
        <span class="ex-label">${escapeHtml(ask.label || "依据摘录")}</span>
        <span class="ex-text">${escapeHtml(ask.text || "")}</span>
      </button>` : ""}
      ${evidenceDetailsHtml(ask, chainTestId || "ask-evidence")}`;
  }

  function deptMetaHtml({ caseTitle, deadline, upgraded, prefShort }) {
    const bits = [];
    if (caseTitle) bits.push(`<span class="dm-case" data-testid="dept-case">${escapeHtml(caseTitle)}</span>`);
    if (deadline) bits.push(`<span class="deadline-chip" data-testid="deadline-chip" title="期限不落主产出">截止 ${escapeHtml(deadline)}${upgraded ? " · 已升级" : ""}</span>`);
    if (prefShort) bits.push(`<span class="pref-chip" data-testid="pref-chip" title="跨案偏好">${escapeHtml(prefShort)}</span>`);
    return bits.length ? `<div class="dept-meta" data-testid="dept-meta">${bits.join("")}</div>` : "";
  }

  function prefBannerHtml() {
    /* 偏好不落主产出顶；壳顶 chip / AI 折层用 */
    return "";
  }
  function prefShortText() {
    const prefs = DEMO.preferences || [];
    if (!prefs.length) return "";
    const t = prefs[0].text || "";
    return t.length > 28 ? t.slice(0, 28) + "…" : t;
  }
  function inviteExpert(id) {
    const e = expertById(id);
    if (!e) return;
    state.invitedExperts[id] = true;
    e.status = "doing";
    e.busy = "已请来 · 工作中";
    addTrace("请来专家", e.name);
    toast(`已请来 ${e.name}（演示）`);
    render();
  }


  /** T4 四件套：来源 / 推演 / 对比 / 置信 */
  function evidenceChainHtml(ev, testid) {
    if (!ev) return "";
    const tid = testid || "evidence-chain";
    const conf = ev.confidence || "";
    return `<div class="evidence-chain" data-testid="${tid}">
      <div class="ec-row" data-testid="ec-source"><span class="ec-k">来源</span><span class="ec-v">${escapeHtml(ev.source || "—")}</span></div>
      <div class="ec-row" data-testid="ec-reasoning"><span class="ec-k">推演</span><span class="ec-v">${escapeHtml(ev.reasoning || "—")}</span></div>
      <div class="ec-row" data-testid="ec-compare"><span class="ec-k">对比</span><span class="ec-v">${escapeHtml(ev.compare || "—")}</span></div>
      <div class="ec-row" data-testid="ec-confidence"><span class="ec-k">置信</span><span class="ec-v"><span class="conf ${confClass(conf)}" data-testid="ec-conf-badge">${escapeHtml(confLabel(conf))}</span>${ev.confidenceNote ? ` <span class="tiny muted">${escapeHtml(ev.confidenceNote)}</span>` : ""}</span></div>
    </div>`;
  }

  function judgmentReasonHtml(gateId, preset) {
    const pre = preset || "接受结论";
    return `<div class="jr-box" data-testid="jr-box-${gateId}">
      <label class="jr-label tiny">拍板理由（写入判断档案）</label>
      <textarea class="jr-input" data-jr="${gateId}" data-testid="jr-${gateId}" rows="2" placeholder="为何接受 / 修改点 / 认风险…">${escapeHtml(pre)}</textarea>
    </div>`;
  }

  function readJudgmentReason(gateId) {
    const el = document.querySelector(`[data-jr="${gateId}"]`);
    const v = el && el.value ? el.value.trim() : "";
    return v || "接受结论";
  }

  function fileConfHtml(f) {
    const c = f.conf || "mid";
    return `<span class="conf ${confClass(c)}" data-testid="file-conf">${escapeHtml(confLabel(c))}</span>`;
  }

  function submitManifestHtml(ask, testid) {
    if (!ask) return "";
    const files = (ask.files || []).map((f) =>
      `<li data-testid="submit-file"><span class="tag ${f.ok ? "ok" : "ask"}">${f.ok ? "齐" : "缺"}</span> ${escapeHtml(f.name)}</li>`
    ).join("");
    return `<div class="submit-manifest" data-testid="${testid || "submit-manifest"}">
      <div class="tiny" style="font-weight:700;margin-bottom:4px">交付物清单</div>
      <ul class="submit-files">${files}</ul>
      <p class="risk-line" data-testid="submit-risk"><strong>容错/风险</strong> ${escapeHtml(ask.risk || "")}</p>
    </div>`;
  }


  function markPhrase(text, marks) {
    let out = escapeHtml(text || "");
    (marks || []).forEach((m) => {
      if (!m) return;
      const esc = escapeHtml(m);
      out = out.split(esc).join(`<mark class="diff-mark">${esc}</mark>`);
    });
    return out;
  }

  function normalizeDiffPairs(diffs) {
    if (!diffs || !diffs.length) return [];
    if (diffs[0] && diffs[0].left != null) return diffs;
    const pairs = [];
    for (let i = 0; i < diffs.length; i += 2) {
      const a = diffs[i] || {};
      const b = diffs[i + 1] || {};
      pairs.push({
        id: `legacy-${i}`,
        change: "改",
        leftLabel: a.side || "源",
        rightLabel: b.side || "目标",
        left: a.text || "",
        right: b.text || "",
        markLeft: [],
        markRight: []
      });
    }
    return pairs;
  }

  function renderDiffBoard(diffs, opts = {}) {
    const pairs = normalizeDiffPairs(diffs);
    const tid = opts.testid || "diff-board";
    if (!pairs.length) {
      return `<div class="diff-board empty" data-testid="${tid}"><div class="empty-state">暂无差分条目</div></div>`;
    }
    const rows = pairs.map((d, i) => {
      const ch = d.change || "改";
      const chCls = ch === "增" ? "add" : ch === "删" ? "del" : "chg";
      const go = d.go ? ` data-diff-go="${escapeHtml(d.go)}"` : "";
      return `<button type="button" class="diff-pair" data-testid="diff-pair" data-diff-id="${escapeHtml(d.id || String(i))}"${go}>
        <div class="diff-pair-meta"><span class="diff-chg ${chCls}">${escapeHtml(ch)}</span><span class="tiny muted">点行可定位相关段</span></div>
        <div class="diff-cols">
          <div class="diff-side from">
            <div class="ds">${escapeHtml(d.leftLabel || "源")}</div>
            <div class="diff-text">${markPhrase(d.left, d.markLeft)}</div>
          </div>
          <div class="diff-side to">
            <div class="ds">${escapeHtml(d.rightLabel || "目标")}</div>
            <div class="diff-text">${markPhrase(d.right, d.markRight)}</div>
          </div>
        </div>
      </button>`;
    }).join("");
    return `<div class="diff-board" data-testid="${tid}">
      <div class="diff-hint tiny" data-testid="diff-hint">示意·非可批 diff · 左右对照 + 行级高亮（非真算法）</div>
      ${rows}
    </div>`;
  }

  function renderPriorArtHits(hits, testid) {
    const list = hits || [];
    if (!list.length) return "";
    return `<div class="prior-hits" data-testid="${testid || "prior-hits"}">
      <div class="prior-head"><strong>检索命中</strong><span class="tiny muted">示意 · 可点定位</span></div>
      ${list.map((h) => {
        const snip = h.match
          ? escapeHtml(h.snippet || "").split(escapeHtml(h.match)).join(`<em class="hit-em">${escapeHtml(h.match)}</em>`)
          : escapeHtml(h.snippet || "");
        return `<button type="button" class="prior-hit" data-testid="prior-hit" data-prior-go="${escapeHtml(h.go || "")}">
          <span class="ph-tag">${escapeHtml(h.tag || "命中")}</span>
          <div class="ph-body"><strong>${escapeHtml(h.title)}</strong>
            <div class="fm">${escapeHtml(h.meta || "")}</div>
            <div class="ph-snip">${snip}</div>
          </div>
          <span class="ph-go">↗</span>
        </button>`;
      }).join("")}
    </div>`;
  }

  function bindDiffBoard(root) {
    function flashEl(el) {
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      el.classList.add("anchor-flash");
      setTimeout(() => el.classList.remove("anchor-flash"), 1600);
    }
    function resolveGo(go) {
      if (!go) return null;
      return document.getElementById(go)
        || document.getElementById("claim-" + go)
        || document.querySelector('[data-testid="claim-' + go + '"]');
    }
    (root || document).querySelectorAll("[data-diff-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const go = btn.dataset.diffGo;
        if (!go) return;
        let el = resolveGo(go);
        if (el) { flashEl(el); toast("已定位差分相关段"); return; }
        /* 差分 tab 上目标可能在权项/说明书 — 切过去再定位 */
        if (go.startsWith("claim") || go.startsWith("c")) {
          state.applyDocTab = "claims";
          state.applyClaimHighlight = go.replace(/^claim-/, "");
          render();
          requestAnimationFrame(() => flashEl(resolveGo(go) || resolveGo(go.replace(/^claim-/, ""))));
          toast("已切权项并定位差分");
          return;
        }
        if (go.startsWith("sp-") || go.startsWith("rp-")) {
          if (go.startsWith("rp-")) {
            state.replyDocTab = "reply";
            state.replySecHighlight = go;
            render();
          } else {
            state.applyDocTab = "spec";
            render();
          }
          requestAnimationFrame(() => flashEl(document.getElementById(go)));
          toast("已定位差分相关段");
          return;
        }
        state.highlightAnchor = go;
        scrollToAnchor(go);
        toast("已定位差分相关段");
      });
    });
    (root || document).querySelectorAll("[data-prior-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const go = btn.dataset.priorGo;
        if (!go) return;
        if (go.startsWith("sp-")) {
          state.applyDocTab = "spec";
          render();
          requestAnimationFrame(() => flashEl(document.getElementById(go)));
          toast("已定位说明书段（检索命中）");
          return;
        }
        flashEl(resolveGo(go));
        toast("已定位检索命中段");
      });
    });
  }


  function goLobby() {
    if (!state.gateDone) { state.view = "gate"; render(); return; }
    state.view = "lobby";
    render();
  }

  function enterFromGate() {
    state.gateDone = true;
    state.view = "lobby";
    addTrace("进入工作台", state.role === "agency" ? "代理所演示" : "企业研发演示");
    toast(state.demoMode === "first" ? "已进大厅 · 可跳过带教" : "已进入 · 顶栏有待拍", { soft: true });
    render();
  }

  function openFront() {
    state.view = "front";
    if (!state.files.length && !state.destinationConfirmed) state.fdStep = "f1";
    render();
  }

  function openDept(id, opts = {}) {
    const d = deptById(id);
    if (!d) return;

    if (id === "d5") {
      if (opts.fromWorkOrder || (state.workOrderOpened && state.canHand5)) {
        state.view = "apply";
        if (!opts.keepCase) state.activeCaseId = "pc2";
        render();
        return;
      }
      state.view = "block";
      state.blockReason = "b2";
      render();
      return;
    }

    if (id === "d6") { state.view = "reply"; if (!opts.keepCase) state.activeCaseId = "pc3"; render(); return; }

    if (d.thin) {
      state.view = "thin";
      state.thinDept = id;
      render();
      return;
    }

    if (id === "d4") {
      if (!opts.direct && !state.destinationConfirmed && !state.enteredD4) {
        toast("请先经前台确认去向，或从大厅「直达交底部」进入（B1）");
        return;
      }
      if (opts.direct && !state.destinationConfirmed) {
        addTrace("操作·直达交底部", "大厅/目标入口直达（B1）");
        addJudgment({
          gate: "大厅·路径选择",
          conclusion: "直达④交底部开写",
          option: "直达④（跳过前台确认）",
          reason: opts.light
            ? "从「要你拍的」进部核对事实；路径选交底部"
            : "用户选择直达交底部；未走前台确认去向",
          evidenceAnchor: "lobby",
          source: "大厅目标入口 / 直达",
          confidence: "mid",
          compare: "备选：经前台分析再确认去向"
        });
      }
      state.enteredD4 = true;
      state.caseOpen = true;
      state.caseName = state.caseName || "电机冷却结构 · 交底案";
      if (!opts.keepCase) state.activeCaseId = "pc1";
      /* A 类待办进部 → 默认老板轻量；直达/前台领进 → 主笔 */
      if (opts.light) state.densityMode = "light";
      else if (opts.fromFront || opts.direct) state.densityMode = state.densityMode || "author";
      if (!state.disclosureReady) {
        state.disclosureReady = true;
        DEMO.disclosure.qc.forEach((q) => {
          if (q.id === "q4") q.status = "yellow";
          else q.status = "green";
        });
        state.allGreen = false;
      }
      state.view = "dept";
      render();
    }
  }

  function loadSample() {
    state.files = DEMO.sampleFiles.map((f) => ({ ...f }));
    state.analyzing = true;
    state.fdStep = "f1";
    state.destinationConfirmed = false;
    state.confirmedDept = null;
    render();
    setTimeout(() => {
      state.analyzing = false;
      state.fdStep = "f2";
      state.caseOpen = true;
      state.caseName = "电机冷却结构 · 待接待";
      addTrace("前台分析", "样例材料已分析，建议交底部");
      render();
    }, 900);
  }

  function onFilesDropped(fileList) {
    const arr = [...fileList].map((f) => ({
      name: f.name,
      type: "其他杂件",
      summary: "用户上传（演示：按技术说明处理）",
      conf: "mid"
    }));
    if (!arr.length) return;
    state.files = arr;
    state.analyzing = true;
    state.fdStep = "f1";
    state.destinationConfirmed = false;
    render();
    setTimeout(() => {
      state.analyzing = false;
      state.fdStep = "f2";
      state.caseOpen = true;
      state.caseName = state.caseName || "用户上传材料 · 待接待";
      addTrace("前台分析", "用户上传材料已分析");
      render();
    }, 900);
  }

  function confirmDestination(deptId) {
    state.destinationConfirmed = true;
    state.confirmedDept = deptId;
    state.fdStep = "f4";
    state.caseName = "电机冷却结构 · 交底案";
    const d = deptById(deptId);
    const reason = readJudgmentReason("dest") || (
      `选${d.num}因：${DEMO.suggest.main.reason}；不选⑤因：${DEMO.suggest.alts[0].reason}`
    );
    addTrace("操作·确认去向", `用户确认先去 ${d.name}`);
    addJudgment({
      gate: "前台·确认去向",
      conclusion: `这次先去${d.num} ${d.name}`,
      option: `主推${d.num}`,
      reason,
      evidenceAnchor: "f3-confirm",
      source: "前台分析结果 · 材料清单",
      confidence: "high",
      compare: `放弃⑤：${DEMO.suggest.alts[0].reason}；放弃③：${DEMO.suggest.alts[1].reason}`
    });
    render();
  }

  function enterConfirmedDept() {
    if (!state.destinationConfirmed) {
      toast("未确认去向，不能领进部门");
      return;
    }
    openDept(state.confirmedDept || "d4", { fromFront: true });
  }

  /** 禁一键全绿：打开黄项 → 补数据或认风险 */
  function resolveYellowQc(mode) {
    const yellows = DEMO.disclosure.qc.filter((q) => q.status === "yellow" || q.status === "red");
    if (!yellows.length) {
      state.allGreen = DEMO.disclosure.qc.every((q) => q.status === "green");
      render();
      return;
    }
    yellows.forEach((q) => { q.status = "green"; });
    state.allGreen = true;
    state.yellowRiskAccepted = mode === "risk";
    const opt = mode === "risk" ? "认风险过线" : "补数据转绿";
    const reason = mode === "risk"
      ? "接受 q4 效果依据偏弱风险，允许全绿并继续事实/可交⑤拍板"
      : "已按黄项补测报告/标测法数据，q4 转绿";
    addTrace("操作·质检黄项处理", opt);
    addJudgment({
      gate: "④质检·黄项处理",
      conclusion: "黄项已关闭，交底质检全绿",
      option: opt,
      reason,
      evidenceAnchor: "qc-card",
      source: yellows.map((q) => q.name).join("、"),
      confidence: mode === "risk" ? "mid" : "high",
      compare: "禁止闷头一键全绿；须对黄项显式补数据或认风险"
    });
    toast(mode === "risk" ? "已认风险 · 质检全绿（仍须确认事实/可交⑤）" : "已补数据 · 质检全绿（仍须确认事实/可交⑤）");
    render();
  }

  function makeAllGreen() {
    /* 兼容旧调用：等价「补数据」路径，不再作为屏上一键钮 */
    resolveYellowQc("data");
  }

  function confirmFact() {
    const ask = DEMO.disclosure.factAsk;
    const reason = readJudgmentReason("fact");
    state.factConfirmed = true;
    addTrace("操作·事实确认", "用户确认交底事实无误");
    addJudgment({
      gate: "④事实确认",
      conclusion: ask.conclusion,
      option: "接受结论",
      reason,
      evidenceAnchor: ask.anchor,
      source: ask.source,
      confidence: ask.confidence,
      compare: ask.compare
    });
    toast("事实已确认 · 已写入判断档案");
    render();
  }

  function confirmCanHand5() {
    if (!state.allGreen) { toast("交底尚未全绿，不能确认可交⑤"); return; }
    if (!state.factConfirmed) { toast("请先完成事实确认"); return; }
    const ask = DEMO.disclosure.hand5Ask;
    const reason = readJudgmentReason("hand5");
    state.canHand5 = true;
    addTrace("操作·可交⑤", "用户确认可交申请部（全绿 ≠ 已交⑤）");
    addJudgment({
      gate: "④可交⑤",
      conclusion: ask.conclusion,
      option: "确认可交⑤",
      reason,
      evidenceAnchor: ask.anchor,
      source: ask.source,
      confidence: ask.confidence,
      compare: ask.compare
    });
    toast("已确认可交⑤ · 已写入判断档案");
    render();
  }

  function openWorkOrder() {
    if (!state.canHand5) { toast("须先完成「可交⑤」硬请示"); return; }
    state.workOrderOpened = true;
    state.view = "workorder";
    addTrace("工单④→⑤", "交底部负责人打包 · 申请部负责人接单");
    render();
  }

  function openDrawer(tab) {
    state.drawerOpen = true;
    if (tab) state.drawerTab = tab;
    render();
  }
  function closeDrawer() { state.drawerOpen = false; render(); }

  function escapeHtml(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function avatarHtml(photo, fallback, cls) {
    const c = cls || "av";
    if (photo) {
      return `<span class="${c}"><img src="./avatars/${photo}" alt="" width="36" height="36" /></span>`;
    }
    return `<span class="${c}">${fallback || "?"}</span>`;
  }

  function statusLabel(st) {
    return ({ doing: "进行中", done: "已完成", wait: "待审", idle: "未请来" })[st] || st || "";
  }

  function expertById(id) {
    return DEMO.disclosure.roster.find((e) => e.id === id);
  }

  function focusExpert(id) {
    const e = expertById(id);
    if (!e) return;
    state.activeExpert = id;
    state.sideMode = "1to1";
    toast(`已切到与「${e.name}」1:1`);
    render();
  }

  function revealExpertOutput(id) {
    const e = expertById(id);
    if (!e) return;
    state.activeExpert = id;
    state.highlightAnchor = e.outputAnchor || "doc-top";
    if (state.view !== "dept") {
      openDept("d4", { direct: true });
      return;
    }
    render();
    requestAnimationFrame(() => scrollToAnchor(state.highlightAnchor));
  }

  function scrollToAnchor(anchor) {
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("anchor-flash");
    setTimeout(() => el.classList.remove("anchor-flash"), 1800);
  }

  function bindExcerptClicks(root) {
    (root || document).querySelectorAll("[data-excerpt-anchor]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const a = btn.dataset.excerptAnchor;
        state.highlightAnchor = a;
        scrollToAnchor(a);
        toast("已定位主栏依据段");
      });
    });
  }

  function sendComposerDemo() {
    const input = $("#composerInput");
    const text0 = (input && input.value || "").trim();
    if (!text0) { toast("先打一句再说（演示）"); return; }
    const e = expertById(state.activeExpert) || expertById("lead");
    const toName = state.sideMode === "1to1" && e ? e.name : "交底部负责人";
    state.feedExtra.unshift({
      who: `你 → ${toName}`,
      text: text0,
      you: true,
      expertId: null
    });
    if (input) input.value = "";
    addTrace("侧栏驾驭（演示）", `对 ${toName}：${text0.slice(0, 80)}`);
    toast("已发送（演示 · 不调后端）");
    render();
  }

  function goLobbyTodo(go) {
    if (go === "front") { openFront(); return; }
    if (go === "d4-fact" || go === "d4-hand") {
      openDept("d4", { direct: true, light: true });
      if (go === "d4-hand") {
        requestAnimationFrame(() => {
          const el = document.querySelector('[data-testid="ask-hand5"]');
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      } else {
        requestAnimationFrame(() => {
          const el = document.querySelector('[data-testid="ask-fact"]');
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      return;
    }
    if (go === "d6") { state.view = "reply"; render(); return; }
    if (go === "d5-diff") {
      state.applyDocTab = "diff";
      const agencyBypass = state.role === "agency";
      const woBypass = !!state.workOrderOpened;
      openDept("d5", { fromWorkOrder: agencyBypass || woBypass, agencyEscort: agencyBypass && !woBypass });
      return;
    }
    if (go === "d5") {
      /* N-P1-2：仅代理陪同可绕 B2；企业须工单/接单路径，否则挡板 */
      const agencyBypass = state.role === "agency";
      const woBypass = !!state.workOrderOpened;
      if (agencyBypass || woBypass) {
        openDept("d5", { fromWorkOrder: true, agencyEscort: agencyBypass && !woBypass });
      } else {
        openDept("d5"); /* 企业无工单 → B2 */
      }
      return;
    }
    if (go === "h45") { if (state.canHand5) openWorkOrder(); else openDept("d4", { direct: true }); }
  }


  function caseById(id) {
    return (DEMO.progressCases || []).find((c) => c.id === id);
  }

  function closeShellPanel() {
    state.shellPanel = null;
    const fly = $("#shellFly");
    if (fly) fly.hidden = true;
  }

  function toggleShellPanel(name) {
    if (!state.gateDone) return;
    if (state.shellPanel === name) { closeShellPanel(); renderShellTop(); return; }
    state.shellPanel = name;
    renderShellPanel();
  }

  function switchParallelCase(id, navigate = true) {
    const c = caseById(id);
    if (!c) return;
    state.activeCaseId = id;
    closeShellPanel();
    if (!navigate) { render(); return; }
    if (c.go === "d4-fact" || c.go === "d4-hand") {
      openDept("d4", { direct: true, keepCase: true, light: true });
      requestAnimationFrame(() => {
        const el = document.querySelector(c.go === "d4-hand" ? '[data-testid="ask-hand5"]' : '[data-testid="ask-fact"]');
        if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } else if (c.go === "d5") {
      /* 并行演示：进行中案可进⑤台（不走 B2 挡），真实门槛仍由 smoke 的 openDept 直调覆盖 */
      openDept("d5", { fromWorkOrder: true, keepCase: true });
    } else if (c.go === "d6") {
      state.view = "reply";
      render();
    } else {
      render();
    }
    toast(`已切到「${c.title}」`);
  }

  function taskStripHtml(preferId) {
    const cases = DEMO.progressCases || [];
    if (!cases.length) return "";
    const active = preferId || state.activeCaseId || cases[0].id;
    const cur = caseById(active) || cases[0];
    const open = !!state.taskStripOpen;
    const chips = cases.map((c) => {
      const on = c.id === active ? "on" : "";
      const short = String(c.title || "").split(" · ")[0];
      const dept = String(c.dept || "").replace(/\s+/g, "");
      return `<button type="button" class="task-chip ${on}" data-task-case="${escapeHtml(c.id)}" data-testid="task-chip" title="${escapeHtml((c.title || "") + " · " + (c.status || ""))}">
        <span class="tc-dept">${escapeHtml(dept)}</span>
        <span class="tc-title">${escapeHtml(short)}</span>
        <span class="tc-st">${escapeHtml(c.status || "")}</span>
      </button>`;
    }).join("");
    const traces = (cur.traces || []).map((t) =>
      `<div class="ttr-row"><span class="at">${escapeHtml(t.at)}</span><span><b>${escapeHtml(t.who)}</b> · ${escapeHtml(t.act)}</span></div>`
    ).join("");
    const pop = open
      ? `<div class="task-trace-pop" data-testid="task-trace" role="dialog">
        <div class="ttr-h">轨迹 · ${escapeHtml(cur.title)}</div>
        ${traces || `<div class="tiny muted">暂无轨迹</div>`}
        <div class="tiny muted ttr-sum">${escapeHtml(cur.summary || "")}</div>
      </div>`
      : "";
    return `<span class="task-strip-label">进行中</span>
      <div class="task-chip-rail" data-testid="task-chip-rail">${chips}</div>
      <button type="button" class="task-strip-toggle ${open ? "on" : ""}" data-testid="task-strip-toggle" id="btnTaskStripToggle" aria-expanded="${open ? "true" : "false"}">轨迹</button>
      ${pop}`;
  }

  function bindTaskStrip(root) {
    const r = root || document;
    r.querySelectorAll("[data-task-case]").forEach((b) => {
      b.addEventListener("click", () => {
        state.taskStripOpen = false;
        switchParallelCase(b.dataset.taskCase, true);
      });
    });
    const tog = r.querySelector("[data-testid='task-strip-toggle'], #btnTaskStripToggle");
    if (tog) tog.addEventListener("click", (ev) => {
      ev.stopPropagation();
      state.taskStripOpen = !state.taskStripOpen;
      render();
    });
  }

  function renderShellPanel() {
    const fly = $("#shellFly");
    const card = $("#shellFlyCard");
    if (!fly || !card) return;
    if (!state.shellPanel) { fly.hidden = true; return; }
    fly.hidden = false;
    const closeBtn = `<button type="button" class="ghost" id="btnFlyClose" data-testid="fly-close">关闭</button>`;
    if (state.shellPanel === "search") {
      const allHits = DEMO.searchHits || [];
      const filters = ["全部", "案卷", "专家", "请示", "检索"];
      const filt = state.searchFilter || "全部";
      const hits = filt === "全部" ? allHits : allHits.filter((h) => h.kind === filt);
      const filtHtml = filters.map((f) => {
        const n = f === "全部" ? allHits.length : allHits.filter((h) => h.kind === f).length;
        return `<button type="button" class="fly-filter ${filt === f ? "on" : ""}" data-sfilter="${f}" data-testid="fly-filter">${escapeHtml(f)}<span class="fn">${n}</span></button>`;
      }).join("");
      card.innerHTML = `
        <div class="fly-head"><strong>搜索</strong>${closeBtn}</div>
        <input class="fly-search-input" id="flySearchInput" data-testid="fly-search-input" placeholder="案卷 / 专家 / 请示 / 检索…" value="" />
        <div class="fly-filters" data-testid="fly-filters">${filtHtml}</div>
        <p class="fly-hint">演示命中 · 点条进入 · 高亮为匹配词</p>
        ${hits.length ? hits.map((h) => {
          const raw = h.snippet || h.summary || h.sub || "";
          const snip = h.match
            ? escapeHtml(raw).split(escapeHtml(h.match)).join(`<em class="hit-em">${escapeHtml(h.match)}</em>`)
            : escapeHtml(raw);
          return `<button type="button" class="fly-item fly-hit-bar" data-fly-go="${escapeHtml(h.go || "")}" data-testid="fly-hit">
          <span class="fk">${escapeHtml(h.kind)}</span>
          <div class="fh-main"><strong>${escapeHtml(h.title)}</strong>
            <div class="fm">${escapeHtml(h.sub || "")}</div>
            ${snip ? `<div class="fh-snip" data-testid="fly-hit-summary">${snip}</div>` : ""}
          </div>
          <span class="fh-go" aria-hidden="true">进入</span>
        </button>`;
        }).join("") : `<div class="empty-state" data-testid="fly-empty">此筛选下暂无命中</div>`}`;
    } else if (state.shellPanel === "notify") {
      const seeds = buildLobbyTodos();
      const rows = seeds.length ? seeds : [{ kind: "c", text: "各部门暂无要你拍的事", go: "", tag: "空" }];
      card.innerHTML = `
        <div class="fly-head"><strong>要你拍的</strong>${closeBtn}</div>
        <p class="fly-hint" data-testid="notify-merge-hint">「要你拍的」＝原通知铃合并入口 · 非拍类催办在「定时」</p>
        ${rows.map((s) => `<button type="button" class="fly-item" data-fly-go="${escapeHtml(s.go || "")}" data-testid="fly-notify">
          <span class="fk urge">${escapeHtml(s.tag || (s.kind === "a" ? "待你拍" : "进行中"))}</span>
          <div><strong>${escapeHtml(s.text)}</strong><div class="fm">${escapeHtml(s.sub || s.cta || "")}</div></div>
        </button>`).join("")}`;
    } else if (state.shellPanel === "schedule") {
      const items = DEMO.scheduleItems || [];
      card.innerHTML = `
        <div class="fly-head"><strong>定时 / 催办</strong>${closeBtn}</div>
        <p class="fly-hint">能力 port 上屏 · 假数据 · 不写真后端</p>
        ${items.map((s) => `<button type="button" class="fly-item" data-fly-go="${escapeHtml(s.go || "")}" data-testid="fly-schedule">
          <span class="fk ${s.kind === "催办" ? "urge" : "timer"}">${escapeHtml(s.kind)}</span>
          <div><strong>${escapeHtml(s.title)}</strong><div class="fm">${escapeHtml(s.when)} · ${escapeHtml(s.case)}</div></div>
        </button>`).join("")}`;
    } else if (state.shellPanel === "cases") {
      const cases = DEMO.caseSwitch || DEMO.progressCases || [];
      card.innerHTML = `
        <div class="fly-head"><strong>公司正在推进</strong>${closeBtn}</div>
        <p class="fly-hint">顶栏「公司正在推进」· 切案时主栏/请示跟着变</p>
        ${cases.map((c) => {
          const full = caseById(c.id) || c;
          const on = c.id === state.activeCaseId ? " · 当前" : "";
          return `<button type="button" class="fly-item" data-case-id="${escapeHtml(c.id)}" data-testid="fly-case">
            <span class="fk">${escapeHtml(full.dept || c.dept || "案")}</span>
            <div><strong>${escapeHtml(full.title || c.title)}${on}</strong><div class="fm">${escapeHtml((full.status || "") + (full.summary ? " · " + full.summary : ""))}</div></div>
          </button>`;
        }).join("")}`;
    }
    const bc = $("#btnFlyClose");
    if (bc) bc.addEventListener("click", () => { closeShellPanel(); });
    card.querySelectorAll("[data-sfilter]").forEach((b) => {
      b.addEventListener("click", () => {
        state.searchFilter = b.dataset.sfilter || "全部";
        renderShellPanel();
      });
    });
    const fin = $("#flySearchInput");
    if (fin) {
      fin.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const q = (fin.value || "").trim();
          if (!q) return;
          toast(`演示检索「${q.slice(0, 24)}」· 下列为假命中`);
        }
      });
    }
    card.querySelectorAll("[data-fly-go]").forEach((b) => {
      b.addEventListener("click", () => {
        const go = b.dataset.flyGo;
        const isUrge = (b.querySelector(".fk") || {}).textContent === "催办"
          || (b.innerText || "").includes("催办");
        closeShellPanel();
        if (!go) { toast("演示项 · 无跳转"); return; }
        const hit = (DEMO.progressCases || []).find((c) => c.go === go);
        if (hit) state.activeCaseId = hit.id;
        if (isUrge || go === "d4-fact" || go === "d4-hand") state.searchPinAsk = go;
        goLobbyTodo(go);
      });
    });
    card.querySelectorAll("[data-case-id]").forEach((b) => {
      b.addEventListener("click", () => switchParallelCase(b.dataset.caseId, true));
    });
  }


  function renderShellTop() {
    document.body.classList.toggle("gate-mode-on", state.view === "gate" || !state.gateDone);
    const app = $(".app");
    if (app) app.classList.toggle("gate-mode-on", state.view === "gate" || !state.gateDone);
    const chip = $("#caseChip");
    if (!chip) return;
    if (state.caseOpen && state.caseName) {
      chip.classList.remove("empty");
      chip.innerHTML = `<strong>案卷</strong><span>${escapeHtml(state.caseName)}</span>`;
    } else {
      chip.classList.add("empty");
      chip.innerHTML = `<span>暂无打开案卷</span>`;
    }
    const dot = $("#notifyDot");
    if (dot) {
      const n = buildLobbyTodos().filter((t) => t.go).length;
      dot.textContent = String(n);
      dot.style.display = n ? "" : "none";
    }
    $$(".role-toggle .role").forEach((b) => b.classList.toggle("on", b.dataset.role === state.role));
    const nl = $("#navLobby");
    if (nl) nl.classList.toggle("on", state.view === "lobby");
    const csl = $("#caseSwitchLabel");
    if (csl) {
      const ac = caseById(state.activeCaseId);
      csl.textContent = ac ? (ac.title.length > 10 ? ac.title.slice(0, 10) + "…" : ac.title) : "公司正在推进";
    }
    const sdot = $("#scheduleDot");
    if (sdot) {
      const n = (DEMO.scheduleItems || []).length;
      sdot.textContent = String(n);
      sdot.style.display = n ? "" : "none";
    }
    if (state.shellPanel) renderShellPanel();
    else {
      const fly = $("#shellFly");
      if (fly) fly.hidden = true;
    }
  }

  function renderGate() {
    $$("#gateIds .gate-id").forEach((b) => b.classList.toggle("on", b.dataset.role === state.role));
    $$("#gate-mode .gm, .gate-mode .gm").forEach((b) => b.classList.toggle("on", b.dataset.mode === state.demoMode));
    const hint = $("#gateModeHint");
    if (hint) {
      hint.textContent = state.demoMode === "first"
        ? "首次：带教可跳过 · 仍进八部大厅，不另造经营首页。"
        : "已有工作：进厅见摘要计数 · 列表在顶栏「要你拍的 / 正在推进」。";
    }
    const enter = $("#btnGateEnter");
    if (enter) {
      enter.textContent = state.role === "agency" ? "进入代理所工作区 →" : "进入企业研发工作区 →";
    }
  }

  function buildLobbyTodos() {
    const todos = [];
    if (state.destinationConfirmed && !state.enteredD4) {
      todos.push({ kind: "a", text: "前台：去向已确认，待领进交底部", go: "front" });
    }
    if (state.enteredD4 && !state.factConfirmed) {
      todos.push({ kind: "a", text: "交底部：待你确认交底事实", go: "d4-fact" });
    } else if (state.enteredD4 && state.allGreen && !state.canHand5) {
      todos.push({ kind: "a", text: "交底部：全绿后待你拍「可交⑤」", go: "d4-hand" });
    } else if (state.canHand5 && !state.workOrderOpened) {
      todos.push({ kind: "c", text: "进行中：可开④→⑤工单", go: "h45" });
    }
    if (state.apply.understand && state.apply.applyOrNot === null) {
      todos.push({ kind: "a", text: "申请部：理解已确认 · 待拍申不申", go: "d5" });
    }
    /* 样例 A/C 回流；被 live 覆盖则跳过 —— 列表只在顶栏飞层展示 */
    const covered = new Set();
    if (state.factConfirmed) covered.add("fact");
    if (state.canHand5) covered.add("hand");
    if (state.reply && state.reply.submit) covered.add("reply");
    if (state.enteredD4 && !state.factConfirmed) covered.add("fact");
    if (state.enteredD4 && state.allGreen && !state.canHand5) covered.add("hand");
    const seeds = [...(DEMO.lobbySeed || [])];
    if (state.role === "agency") {
      (DEMO.agencyLobbySeed || []).forEach((s) => {
        if (!seeds.some((x) => x.id === s.id)) seeds.unshift(s);
      });
    }
    seeds.forEach((s) => {
      if (covered.has(s.cover)) return;
      if (todos.some((t) => t.text === s.text)) return;
      todos.push({ kind: s.kind, text: s.text, tag: s.tag, sub: s.sub, cta: s.cta, go: s.go, seed: true });
    });
    return todos;
  }

  function renderLobby() {
    const todos = buildLobbyTodos();
    const actionable = todos.filter((x) => x.go);
    const nTodo = actionable.length;
    const nProg = (DEMO.progressCases || []).length;

    const greetN = $("#lobbyTodoCount");
    if (greetN) greetN.textContent = String(nTodo);
    const sub = $("#lobbyGreetSub");
    if (sub) {
      const agencyNote = state.role === "agency" ? " · 代理视角含陪同⑤" : "";
      /* 计数只留问候一处主述；列表入口唯一＝顶栏 */
      sub.innerHTML = nTodo
        ? `今天待拍 <strong id="lobbyTodoCount">${nTodo}</strong> · 推进中 <strong>${nProg}</strong>${agencyNote}。点顶栏「要你拍的」处理。`
        : `各部门暂无硬请示 · 可交给前台开新案，或点八部进厅。`;
    }

    /* G-哲2 首次带教三入口 */
    let firstTip = "";
    if (state.demoMode === "first" && !state.firstTipDismissed) {
      firstTip = `<div class="first-tip" data-testid="first-tip">
        <strong>今天先认大厅三入口</strong>：①委托前台 · ②顶栏「要你拍的 / 推进」· ③八部进厅。
        <button type="button" class="ghost" id="btnFirstTipOk" data-testid="first-tip-dismiss">知道了</button>
      </div>`;
    }

    $("#deptWall").innerHTML = DEMO.depts.map((d) => {
      const has = (d.id === "d4" && state.enteredD4 && (!state.factConfirmed || (state.allGreen && !state.canHand5)))
        || (d.id === "d5" && state.canHand5 && !state.apply.submit)
        || (d.id === "d5" && state.role === "agency" && !state.apply.submit)
        || (d.id === "d6" && state.reply && !state.reply.submit);
      const main = !d.thin;
      const pill = d.thin
        ? `<span class="pill thin-p">薄 · 合格线</span>`
        : `<span class="pill thick">主链</span>`;
      return `<button class="dept-door ${d.thin ? "thin" : "main-chain"} ${has ? "has-todo" : ""}" data-dept="${d.id}" type="button" data-testid="dept-door-${d.id}">
          <span class="dot"></span>
          <div class="num">${d.num}</div>
          <strong>${escapeHtml(d.name)}</strong>
          <div class="desc">${escapeHtml(d.desc)}</div>
          <div class="door-foot">${pill}<span>${d.thin ? "进得去" : "可协同"}</span></div>
        </button>`;
    }).join("");

    const wallCard = document.querySelector('[data-testid="dept-home-card"]');
    const greet = document.querySelector('[data-testid="lobby-greet"]');
    if (greet && firstTip) {
      let tipEl = document.querySelector('[data-testid="first-tip"]');
      if (!tipEl) {
        greet.insertAdjacentHTML("afterend", firstTip);
      } else {
        tipEl.outerHTML = firstTip;
      }
    } else {
      const tipEl = document.querySelector('[data-testid="first-tip"]');
      if (tipEl && state.firstTipDismissed) tipEl.remove();
    }
    const ft = $("#btnFirstTipOk");
    if (ft) ft.onclick = () => { state.firstTipDismissed = true; render(); };

    $$("#deptWall [data-dept]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.dept;
        if (id === "d4") openDept("d4", { direct: true });
        else openDept(id);
      });
    });

    const bar = $("#caseBarText");
    const barStrong = document.querySelector(".case-bar strong");
    if (barStrong) barStrong.textContent = "当前案";
    /* L-UX2：与顶栏案卷 chip 同步，避免「暂无」vs「当前案」矛盾 */
    if (bar) {
      if (state.caseOpen && state.caseName) {
        bar.textContent = `${state.caseName} · ${state.canHand5 ? "可交⑤已确认" : state.enteredD4 ? "交底进行中" : "待领进"}`;
        bar.classList.remove("muted");
      } else {
        bar.textContent = "尚无打开案卷 · 与顶栏一致";
        bar.classList.add("muted");
      }
    }
    const barOpen = $("#btnCaseBarOpen");
    if (barOpen) barOpen.onclick = () => {
      if (state.caseOpen) openDrawer("materials");
      else toggleShellPanel("cases");
    };
  }

  function renderFront() {
    const steps = [["f1","F1 收件"],["f2","F2 分析"],["f3","F3 确认去向"],["f4","F4 交办领进"]];
    const order = { f1: 0, f2: 1, f3: 2, f4: 3 };
    const cur = order[state.fdStep] ?? 0;
    $("#fdSteps").innerHTML = steps.map(([id, label], i) => {
      let cls = "step";
      if (i < cur) cls += " done";
      if (i === cur) cls += " on";
      return `<span class="${cls}">${label}</span>`;
    }).join("");

    const pane = $("#fdPane");
    if (state.fdStep === "f1") {
      pane.innerHTML = `
        <div class="card">
          <h2>前台 · 收件</h2>
          <p class="muted">上传资料后系统自动分析，再建议去哪一部——由你确认后领进。</p>
          <div class="upload-zone" id="uploadZone">
            <h3>拖入文件到此处</h3>
            <p class="muted">或选择本地文件 · 演示也可用样例</p>
            <div class="row-actions" style="justify-content:center">
              <label class="primary" style="display:inline-block;padding:8px 14px;border-radius:8px;background:var(--brand);color:#fff;font-weight:600;cursor:pointer">
                选择文件
                <input type="file" id="fileInput" multiple hidden />
              </label>
              <button type="button" id="btnSample" class="primary" data-testid="load-sample">加载样例材料</button>
            </div>
            ${state.analyzing ? `<div style="margin-top:14px" data-testid="analyzing">
              <p style="color:var(--brand);font-weight:600;margin:0 0 8px">前台 agent 正在分析…</p>
              <div class="agent-steps">${(DEMO.frontTrajectory || []).map((s, i) =>
                `<div class="agent-step ${i < 2 ? "done" : "on"}"><span class="as-t">${escapeHtml(s.t)}</span><span>${escapeHtml(s.d)}</span></div>`
              ).join("")}</div>
            </div>` : ""}
            ${state.files.length ? `<div class="file-list">${state.files.map((f) => `<div class="file-row"><span class="fico">件</span><div><strong>${escapeHtml(f.name)}</strong><div class="tiny muted">${escapeHtml(f.type)}</div></div></div>`).join("")}</div>` : ""}
          </div>
        </div>`;
      $("#btnSample").addEventListener("click", loadSample);
      $("#fileInput").addEventListener("change", (e) => onFilesDropped(e.target.files));
      const zone = $("#uploadZone");
      zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
      zone.addEventListener("drop", (e) => { e.preventDefault(); zone.classList.remove("drag"); onFilesDropped(e.dataTransfer.files); });
    } else if (state.fdStep === "f2") {
      const main = deptById(DEMO.suggest.main.dept);
      pane.innerHTML = `
        <div data-testid="f2-analysis">
        <div class="card" style="margin-bottom:12px" data-testid="front-traj">
          <div class="card-head"><h2>前台执行轨迹</h2><span class="tiny muted">对标 agent 工具步骤</span></div>
          <div class="agent-steps">${(DEMO.frontTrajectory || []).map((s) =>
            `<div class="agent-step done"><span class="as-t">${escapeHtml(s.t)}</span><span>${escapeHtml(s.d)}</span></div>`
          ).join("")}</div>
        </div>
        <div class="analysis-grid">
          <div class="card">
            <h2>分析结果</h2>
            <p class="tiny muted">材料清单 · 置信可见</p>
            <div class="file-list" data-testid="front-file-conf-list">
              ${state.files.map((f) => `<div class="file-row" data-testid="front-file-row">
                  <div><strong>${escapeHtml(f.name)}</strong><div class="tiny muted">${escapeHtml(f.type)} · ${escapeHtml(f.summary)}</div></div>
                  ${fileConfHtml(f)}
                </div>`).join("")}
            </div>
            <div class="sep"></div>
            <h3 style="margin:0 0 6px;font-size:14px">意图假设</h3>
            <ul class="intent-list">${DEMO.intents.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
          </div>
          <div class="card">
            <h2>建议部门</h2>
            <div class="suggest-main">
              <div class="tiny" style="font-weight:700;color:var(--brand)">主推</div>
              <strong style="font-size:16px">${main.num} ${escapeHtml(main.name)}</strong>
              <p class="tiny" style="margin:8px 0 0">${escapeHtml(DEMO.suggest.main.reason)}</p>
            </div>
            ${DEMO.suggest.alts.map((a) => {
              const d = deptById(a.dept);
              return `<div class="suggest-alt"><strong>备选 · ${d.num} ${escapeHtml(d.name)}</strong><div class="tiny muted">${escapeHtml(a.reason)}</div></div>`;
            }).join("")}
            <div class="sep"></div>
            <div class="tiny muted">粗缺口：${DEMO.suggest.gaps.map(escapeHtml).join("；")}</div>
            <div class="row-actions">
              <button type="button" class="primary" id="btnToConfirm" data-testid="to-f3">进入确认去向</button>
            </div>
          </div>
        </div>
        </div>`;
      $("#btnToConfirm").addEventListener("click", () => { state.fdStep = "f3"; render(); });
    } else if (state.fdStep === "f3") {
      const main = deptById(DEMO.suggest.main.dept);
      const blocked = !state.destinationConfirmed;
      pane.innerHTML = `
        <div class="card" data-testid="f3-confirm">
          <h2>确认去向</h2>
          <p class="muted">系统建议先去 <strong>${main.num} ${escapeHtml(main.name)}</strong>。未确认前不能领进部门。</p>
          <div class="hard-ask" id="destAsk" data-testid="ask-dest">
            <div class="label">【硬请示】</div>
            <h3>这次先去交底部，对吗？</h3>
            <p class="ask-conclusion"><strong>结论</strong> 主推④交底部开写交底。</p>
            ${evidenceChainHtml({
              source: "材料清单 · 意图假设",
              reasoning: DEMO.suggest.main.reason,
              compare: `不选⑤：${DEMO.suggest.alts[0].reason}；不选③：${DEMO.suggest.alts[1].reason}`,
              confidence: "high",
              confidenceNote: "无合格交底成稿"
            }, "dest-evidence")}
            ${judgmentReasonHtml("dest", `选④因：${DEMO.suggest.main.reason}；不选⑤因：${DEMO.suggest.alts[0].reason}`)}
            <div class="acts">
              <button type="button" class="ask-confirm" id="btnConfirmDest" data-testid="confirm-dest">确认 · 去交底部</button>
              <button type="button" id="btnAlt5" data-testid="alt-dest-5">改去申请部（真切·领进可 B2）</button>
              <button type="button" class="ghost" id="btnPauseDest">暂停</button>
            </div>
          </div>
          <div class="row-actions">
            <button type="button" id="btnTryEnterEarly" data-testid="try-enter-blocked">尝试进入交底部（应被拦住）</button>
            <button type="button" class="ghost" id="btnBackF2">返回分析结果</button>
          </div>
        </div>`;
      $("#btnConfirmDest").addEventListener("click", () => confirmDestination("d4"));
      $("#btnAlt5").addEventListener("click", () => {
        confirmDestination("d5");
        toast("已确认去向⑤ · 领进时若无合格交底会 B2 挡回（真切备选）");
      });
      const a3 = $("#btnAlt3");
      if (a3) a3.addEventListener("click", () => {
        toast("备选③演示仍落主推路径示意 · 真切请走前台另案");
      });
      $("#btnPauseDest").addEventListener("click", () => toast("已暂停，去向未确认"));
      $("#btnTryEnterEarly").addEventListener("click", () => { if (!state.destinationConfirmed) toast("未确认去向，不能领进交底部"); });
      $("#btnBackF2").addEventListener("click", () => { state.fdStep = "f2"; render(); });
    } else if (state.fdStep === "f4") {
      const d = deptById(state.confirmedDept || "d4");
      pane.innerHTML = `
        <div class="card" data-testid="f4-handoff">
          <h2>交办领进</h2>
          <p>去向已确认：<strong>${d.num} ${escapeHtml(d.name)}</strong></p>
          <div class="hard-ask done"><div class="label">【已确认】</div><h3>本次先去${escapeHtml(d.name)}</h3></div>
          <h3 style="font-size:14px;margin:0 0 8px">交办清单</h3>
          <ul class="handoff-list">
            ${DEMO.handoff.map((h) => {
              const tag = h.status === "ok" ? '<span class="tag ok">已有</span>' : h.status === "gap" ? '<span class="tag ask">缺口</span>' : '<span class="tag warn">待补</span>';
              return `<li><div><strong>${escapeHtml(h.item)}</strong><div class="tiny muted">${escapeHtml(h.note)}</div></div>${tag}</li>`;
            }).join("")}
          </ul>
          <p class="tiny muted" data-testid="f4-checklist-link">交接缺口见案卷检查表 · <button type="button" class="linkish" id="btnF4Check" data-testid="f4-open-checklist">打开检查表</button></p>
          <div class="row-actions">
            <button type="button" class="primary" id="btnEnterDept" data-testid="enter-d4">进入${escapeHtml(d.name)}</button>
            <button type="button" class="ghost" id="btnBackLobby">回工作台</button>
          </div>
        </div>`;
      $("#btnEnterDept").addEventListener("click", enterConfirmedDept);
      $("#btnBackLobby").addEventListener("click", goLobby);
      const f4c = $("#btnF4Check"); if (f4c) f4c.addEventListener("click", () => openDrawer("checklist"));
    }
  }


  function setDensityMode(mode) {
    state.densityMode = mode === "light" ? "light" : "author";
    if (state.densityMode === "author") state.sideMode = state.sideMode || "team";
    toast(state.densityMode === "light" ? "老板轻量" : "主笔", { soft: true });
    const mh = $("#d4ModeHint");
    if (mh) { mh.hidden = false; mh.textContent = state.densityMode === "light" ? "轻量 · 请示钉顶" : "主笔"; setTimeout(() => { if (mh) mh.hidden = true; }, 1400); }
    render();
  }

  function dismissMentor() {
    state.mentorDismissed = true;
    toast("部门说明已收起 · 设置里可重开（演示）");
    render();
  }

  function insertAtMaterial(name) {
    const input = $("#composerInput");
    if (!input) return;
    const tag = "@" + name + " ";
    const start = input.selectionStart || input.value.length;
    const end = input.selectionEnd || start;
    input.value = input.value.slice(0, start) + tag + input.value.slice(end);
    state.atOpen = false;
    input.focus();
    toast("已 @ " + name);
    /* 不整页 render，只关 @ 浮层 */
    const pop = $("#atPicker");
    if (pop) pop.hidden = true;
  }

  function renderDept() {
    const qc = DEMO.disclosure.qc;
    state.allGreen = qc.every((q) => q.status === "green");
    const lineEl = $("#deptLineStatus");
    lineEl.textContent = state.allGreen ? "交底质检全绿" : "未过线 / 质检进行中";
    lineEl.className = "line-status" + (state.allGreen ? " ok" : "");

    const strip = $("#d4TaskStrip");
    if (strip) {
      if (!state.activeCaseId || !caseById(state.activeCaseId)) state.activeCaseId = "pc1";
      strip.innerHTML = taskStripHtml(state.activeCaseId);
      bindTaskStrip(strip);
    }

    const lead = DEMO.disclosure.roster.find((e) => e.kind === "lead") || DEMO.disclosure.roster[0];
    const isLight = state.densityMode === "light";
    const shell = document.querySelector("#viewDept .dept-shell");
    if (shell) shell.classList.toggle("density-light", isLight);
    if (shell) shell.classList.toggle("density-author", !isLight);

    /* 无顶栏密度三钮：进部默认轻量/直达主笔；点编制展开或主产出 → 主笔 */
    const metaEl = $("#d4DeptMeta");
    if (metaEl) {
      const c = caseById(state.activeCaseId) || caseById("pc1");
      metaEl.innerHTML = deptMetaHtml({
        caseTitle: (c && c.title) || state.caseName || "当前案",
        prefShort: prefShortText()
      });
    }
    const mh = $("#d4ModeHint");
    if (mh) {
      mh.hidden = false;
      mh.textContent = isLight ? "轻量" : "主笔";
      mh.title = "点编制展开或主产出即切主笔；无密度切换钮";
      mh.style.cursor = "pointer";
      mh.onclick = () => setDensityMode(isLight ? "author" : "light");
    }

    /* 带教淡出 · 大纲 §7 */
    const mentor = $("#mentorTip");
    if (mentor) {
      if (!state.mentorDismissed) {
        mentor.hidden = false;
        mentor.innerHTML = `
          <div class="mentor-body" data-testid="mentor-tip">
            <strong>本部门办完的标志</strong>是交底质检<strong>全绿</strong>；要你拍的是<strong>事实确认</strong>与<strong>可否交⑤</strong>（分钮，不糊）。
            <button type="button" class="ghost" id="btnMentorOk" data-testid="mentor-dismiss">知道了</button>
          </div>`;
        const mo = $("#btnMentorOk");
        if (mo) mo.addEventListener("click", dismissMentor);
      } else {
        mentor.hidden = true;
        mentor.innerHTML = "";
      }
    }

    const leadBar = $("#leadBar");
    if (leadBar) leadBar.hidden = true; /* 负责人只在编制横滑席出现一次，不另起身份条 */

    const whoBlock = document.querySelector("#viewDept .who-block");
    if (whoBlock) {
      whoBlock.classList.toggle("collapsed", isLight);
      const folded = isLight || !!state.rosterFolded;
      whoBlock.classList.toggle("roster-folded", folded);
      const foldBtnEarly = $("#btnRosterFold");
      if (foldBtnEarly) {
        foldBtnEarly.textContent = folded ? "展开编制" : "收起";
        foldBtnEarly.onclick = () => {
          state.rosterFolded = !state.rosterFolded;
          if (!state.rosterFolded && state.densityMode === "light") setDensityMode("author");
          else render();
        };
      }
    }
    const stageBarEl = $("#stageBar");
    if (stageBarEl) stageBarEl.style.display = isLight ? "none" : "";
    const chrome = $("#d4Chrome");
    if (chrome) chrome.classList.toggle("chrome-light-collapsed", false); /* 薄轨保留 */
    const stripEl = $("#d4TaskStrip");
    if (stripEl) {
      /* 进行中薄轨始终在壳顶，不进 AI 区、轻量也不藏 */
      stripEl.style.display = "";
    }

    $("#roster").innerHTML = DEMO.disclosure.roster.map((e) => {
      const st0 = state.invitedExperts[e.id] ? "doing" : (e.status || "doing");
      const active = state.activeExpert === e.id ? "active" : "";
      const qcCls = e.kind === "qc" ? "qc" : "";
      const idleCls = st0 === "idle" ? "idle" : "";
      const tagCls = e.tag === "协" ? "tag-role sub" : "tag-role";
      const pulse = st0 === "doing" ? "doing-pulse" : "";
      const style = e.style ? `<span class="style-tag" data-testid="expert-style">${escapeHtml(e.style)}</span>` : "";
      const invite = st0 === "idle" ? `<span class="invite-hint" data-invite="${e.id}" data-testid="invite-${e.id}">请来</span>` : "";
      return `<button type="button" class="expert-chip ${qcCls} ${idleCls} ${active} ${pulse}" data-expert="${e.id}" data-testid="expert-${e.id}" title="${escapeHtml(e.role)}">
          ${avatarHtml(e.photo, e.av)}
          <span class="meta">
            <span class="name-row"><strong>${escapeHtml(e.name)}</strong><span class="${tagCls}">${escapeHtml(e.tag || "")}</span>${invite}</span>
            <span class="status-pill ${st0}">${escapeHtml(statusLabel(st0))}</span>
            <span class="st">${escapeHtml(state.invitedExperts[e.id] ? "已请来 · 工作中" : (e.busy || e.role))}</span>
            ${style}
          </span>
        </button>`;
    }).join("");
    $$("#roster [data-expert]").forEach((b) => b.addEventListener("click", (ev) => {
      const inv = ev.target.closest("[data-invite]");
      if (inv) { ev.preventDefault(); ev.stopPropagation(); inviteExpert(inv.dataset.invite); return; }
      focusExpert(b.dataset.expert);
    }));

    /* 四步可读时间线（非 pill 堆） */
    const stages = [
      { id: "draft", label: "成稿", hint: "草案已落主栏", done: true, on: false, wait: false },
      { id: "qc", label: "质检循环", hint: state.allGreen ? "已全绿" : "复检红黄项", done: state.allGreen, on: !state.allGreen, wait: false },
      { id: "fact", label: "事实确认", hint: state.factConfirmed ? "你已拍板" : "待你确认", done: state.factConfirmed, on: false, wait: state.allGreen && !state.factConfirmed },
      { id: "hand", label: "可交⑤", hint: state.canHand5 ? "可开④→⑤工单" : "硬请示未关", done: state.canHand5, on: false, wait: state.allGreen && state.factConfirmed && !state.canHand5 }
    ];
    $("#stageBar").innerHTML = `<div class="timeline" data-testid="d4-timeline-inner">
      <div class="tl-track">
        ${stages.map((s, i) => {
          let cls = "tl-step";
          if (s.done) cls += " done";
          else if (s.wait) cls += " wait";
          else if (s.on) cls += " on";
          const mark = s.done ? "✓" : String(i + 1);
          const line = i < stages.length - 1
            ? `<div class="tl-line ${s.done ? "done" : ""}"></div>` : "";
          return `<div class="${cls}" data-testid="tl-${s.id}">
              <div class="tl-dot">${mark}</div>
              <div class="tl-meta"><strong>${escapeHtml(s.label)}</strong><span>${escapeHtml(s.hint)}</span></div>
            </div>${line}`;
        }).join("")}
      </div>
    </div>`;

    const flashId = state.highlightAnchor;
    const ver = state.docVersion || "current";
    const verBar = `<div class="doc-ver" data-testid="doc-version">
        <button type="button" class="ver-tab ${ver === "current" ? "on" : ""}" data-ver="current" data-testid="ver-current">当前稿</button>
        <button type="button" class="ver-tab ${ver === "prev" ? "on" : ""}" data-ver="prev" data-testid="ver-prev">上一确认稿</button>
        ${isLight ? `<span class="tiny muted ver-note">轻量 · 只读批注为主</span>` : `<span class="tiny muted ver-note">主笔 · 可改全文</span>`}
      </div>`;
    const lightBanner = isLight && !state.factConfirmed
      ? `<div class="light-conclusion" data-testid="light-conclusion">
          <div class="lc-k">要你拍什么</div>
          <strong>确认交底事实是否与材料一致</strong>
          <p class="tiny muted">一两句依据摘要：螺旋水道 + 双密封 · 点侧栏摘录可定位主栏。</p>
        </div>` : "";
    const sections = ver === "prev"
      ? DEMO.disclosure.sections.map((s, i) => ({
          ...s,
          t: i === 3 ? "（上一确认稿）壳体设螺旋水道；端盖鳍片；单密封圈——尚未改为双密封。" : s.t
        }))
      : DEMO.disclosure.sections;
    const d4Diff = ver === "prev" ? `<div class="d4-ver-diff" data-testid="d4-ver-diff">${renderDiffBoard([
        {
          id: "d4v1", change: "改", leftLabel: "上一确认稿", rightLabel: "当前稿", go: "sec-tech",
          left: "关键连接处采用单密封圈",
          right: "关键连接处采用双密封圈",
          markLeft: ["单密封圈"], markRight: ["双密封圈"]
        }
      ], { testid: "d4-diff-board" })}</div>` : "";
    $("#docMain").innerHTML = `
      ${verBar}
      ${lightBanner}
      ${d4Diff}
      <div class="doc-body ${isLight ? "readonly" : ""}" data-testid="d4-main" id="doc-top">
        <h3>${escapeHtml(DEMO.disclosure.title)}${ver === "prev" ? " · 上一确认稿" : ""}</h3>
        <p class="tiny muted">点编制「看产出」或侧栏依据可定位段落</p>
        ${sections.map((s) => {
          const flash = flashId === s.id ? " anchor-flash" : "";
          return `<div class="sec${flash}" id="${escapeHtml(s.id)}"><strong>${escapeHtml(s.h)}</strong><p>${escapeHtml(s.t)}</p></div>`;
        }).join("")}
        <div class="qc-progress-line${flashId === "qc-card" ? " anchor-flash" : ""}" data-testid="qc-card" id="qc-card">
          <strong>质检</strong>
          <span class="tiny muted" data-testid="qc-method">权威在侧栏锚点 · 全绿≠交⑤</span>
          ${qc.map((q) => {
            const tag = q.status === "green" ? '<span class="tag ok">绿</span>' : q.status === "yellow" ? '<span class="tag warn">黄</span>' : '<span class="tag ask">红</span>';
            return `<span class="qc-fix-row" data-testid="${q.status !== "green" ? "qc-yellow-item" : "qc-green-item"}">${escapeHtml(q.name)} ${tag}</span>`;
          }).join("")}
          ${!state.allGreen
            ? `<span class="qc-yellow-fix" data-testid="qc-yellow-fix">
                <button type="button" class="primary qc-fix-btn" id="btnQcData" data-testid="qc-fix-data">补数据转绿</button>
                <button type="button" class="qc-fix-btn ghost-risk" id="btnQcRisk" data-testid="qc-fix-risk">认风险</button>
              </span>`
            : `<span class="tag ok" data-testid="qc-all-green">已全绿${state.yellowRiskAccepted ? "（含认风险）" : ""}</span>`}
        </div>
      </div>`;
    const bd = $("#btnQcData"); if (bd) bd.addEventListener("click", () => resolveYellowQc("data"));
    const br = $("#btnQcRisk"); if (br) br.addEventListener("click", () => resolveYellowQc("risk"));
    const docMainEl = $("#docMain");
    if (docMainEl && state.densityMode === "light") {
      docMainEl.addEventListener("click", () => setDensityMode("author"), { once: true });
    }
    $$("[data-ver]").forEach((b) => b.addEventListener("click", () => {
      if (state.densityMode === "light") state.densityMode = "author";
      state.docVersion = b.dataset.ver;
      render();
    }));

    /* 侧栏聚焦条：1:1 / 看产出 */
    const ae = expertById(state.activeExpert) || lead;
    const focusEl = $("#sideFocus");
    if (focusEl) {
      if (state.sideMode === "1to1" && ae) {
        focusEl.innerHTML = `<div class="focus-card" data-testid="side-1to1">
          <div class="focus-row">
            ${avatarHtml(ae.photo, ae.av)}
            <div>
              <strong>1:1 · ${escapeHtml(ae.name)}</strong>
              <div class="tiny muted">${escapeHtml(ae.blurb || ae.role)}</div>
              <div class="tiny contract-line" data-testid="1to1-contract">本岗交付：${escapeHtml(ae.kind === "qc" ? "质检分卡红黄项" : ae.kind === "writer" ? "技术方案段" : ae.role)}</div>
              ${ae.style ? `<div class="tiny muted">风格 · ${escapeHtml(ae.style)}</div>` : ""}
            </div>
          </div>
          <p class="tiny muted" data-testid="1to1-no-replace">1:1 只驾驭 · 不替代侧栏硬请示打包口（负责人）</p>
          <div class="focus-acts">
            <button type="button" class="primary" data-testid="btn-see-output" id="btnSeeOutput">看产出</button>
            <button type="button" class="ghost" id="btnBackTeam" data-testid="btn-back-team">回团队</button>
          </div>
        </div>`;
        const so = $("#btnSeeOutput");
        if (so) so.addEventListener("click", () => revealExpertOutput(ae.id));
        const bt = $("#btnBackTeam");
        if (bt) bt.addEventListener("click", () => { state.sideMode = "team"; render(); });
      } else {
        focusEl.innerHTML = `<div class="focus-hint tiny muted" data-testid="side-team">点编制名片 → 切 1:1；再点「看产出」锚主栏段</div>`;
      }
    }

    const sideTag = $("#sideHeadTag");
    if (sideTag) {
      sideTag.textContent = state.sideMode === "1to1" && ae
        ? `1:1 · ${ae.name}`
        : "要你拍";
    }
    const hasYellowOpen = !(DEMO.disclosure.qc.every((q) => q.status === "green"));
    const reportBubbles = [];
    if (!state.factConfirmed) {
      const body = `${askExcerptHtml(DEMO.disclosure.factAsk, "fact-evidence")}
          ${hasYellowOpen ? `<div class="doubt-bar" data-testid="doubt-bar"><strong>拿不准</strong> · 黄项未关闭（q4 效果依据）· 可认风险后仍拍，或先补数据</div>` : ""}
          ${judgmentReasonHtml("fact", hasYellowOpen ? "接受结论 · 已知 q4 存疑" : "接受结论 · 技术方案与材料一致")}`;
      const acts = `<button type="button" class="ask-confirm" id="btnFact" data-testid="confirm-fact">确认事实</button>
            <button type="button">还要改</button>
            <button type="button" class="ghost">暂停</button>`;
      reportBubbles.push(agentReportBubble({
        testid: "ask-fact", gradeId: "d4-fact", title: "确认交底事实",
        lead, bodyHtml: body, actsHtml: acts
      }));
    } else {
      reportBubbles.push(agentReportBubble({
        testid: "ask-fact", gradeId: "d4-fact", title: "交底事实已确认",
        lead, done: true, doneLabel: "交底事实已确认"
      }));
    }
    if (!state.canHand5) {
      const blocked = !state.allGreen || !state.factConfirmed;
      const endCheck = `<div class="end-check" data-testid="end-checklist">
            <div class="tiny" style="font-weight:700">结束检查表摘要（可交⑤前）</div>
            <div class="ec-check ${state.allGreen ? "ok" : ""}">全绿 ${state.allGreen ? "✓" : "…"}</div>
            <div class="ec-check ${state.factConfirmed ? "ok" : ""}">事实确认 ${state.factConfirmed ? "✓" : "…"}</div>
            <div class="ec-check">输入契约齐（材料入卷）✓</div>
          </div>`;
      const body = `${askExcerptHtml(DEMO.disclosure.hand5Ask, "hand5-evidence")}
          ${endCheck}
          <p class="tiny">前置：交底质检全绿 + 事实确认。黄项处理不能代替本确认。</p>
          ${!blocked ? judgmentReasonHtml("hand5", "全绿+事实已确认 · 授权交⑤开写") : ""}
          ${blocked ? `<p class="tiny" style="margin-top:8px;color:var(--ask)">尚未满足：${!state.allGreen ? "未全绿 " : ""}${!state.factConfirmed ? "未事实确认" : ""}</p>` : ""}`;
      const acts = `<button type="button" class="ask-confirm" id="btnHand5" data-testid="confirm-hand5" ${blocked ? "disabled" : ""}>确认可交⑤</button>
            <button type="button" class="ghost">暂不交</button>`;
      reportBubbles.push(agentReportBubble({
        testid: "ask-hand5", gradeId: "d4-hand5", title: "可否交申请部（⑤）？",
        lead, bodyHtml: body, actsHtml: acts
      }));
    } else {
      reportBubbles.push(agentReportBubble({
        testid: "ask-hand5", gradeId: "d4-hand5", title: "可交⑤",
        lead, done: true, doneLabel: "可交⑤ — 尚未等于已开工单",
        actsHtml: `<button type="button" class="primary" id="btnOpenWO" data-testid="open-wo">开④→⑤工单</button>`
      }));
    }
    /* 侧栏表单区不再钉硬请示；占位清空（test id 保留兼容） */
    const sideAsksEl = $("#sideAsks");
    if (sideAsksEl) sideAsksEl.innerHTML = "";
    /* 绑定延后到 feed 渲染后 */

    bindDiffBoard(document);

    /* 侧栏层2 · 依据/结构旁路（大纲 §4.4.4） */
    const ev = $("#sideEvidence");
    if (ev) {
      const yellowFix = !state.allGreen
        ? `<div class="qc-yellow-fix" data-testid="side-qc-yellow" style="margin-top:8px">
            <p class="tiny" style="margin:0 0 6px">黄项处理（侧栏权威）：</p>
            <div class="row-actions">
              <button type="button" class="primary qc-fix-btn" id="btnQcDataSide" data-testid="qc-fix-data-side">补数据转绿</button>
              <button type="button" class="qc-fix-btn ghost-risk" id="btnQcRiskSide" data-testid="qc-fix-risk-side">认风险</button>
            </div>
          </div>` : "";
      ev.innerHTML = `<div class="evidence-layer" data-testid="side-evidence">
        <div class="ev-h">依据 / 质检（权威）</div>
        ${qc.map((q) => {
          const st = q.status === "green" ? "ok" : q.status === "yellow" ? "warn" : "ask";
          const anchor = q.id === "q4" ? "sec-effect" : "qc-card";
          return `<button type="button" class="ev-row ${st}" data-excerpt-anchor="${anchor}" data-testid="ev-row">
            <span>${escapeHtml(q.name)}</span><span class="tag ${st}">${q.status === "green" ? "绿" : q.status === "yellow" ? "黄" : "红"}</span>
          </button>`;
        }).join("")}
        ${yellowFix}
      </div>`;
      bindExcerptClicks(ev);
      const bds = $("#btnQcDataSide"); if (bds) bds.addEventListener("click", () => resolveYellowQc("data"));
      const brs = $("#btnQcRiskSide"); if (brs) brs.addEventListener("click", () => resolveYellowQc("risk"));
    }

    /* 对话流：硬请示/拿不准/重要节点 = 汇报气泡在上；团队动态在下 */
    const baseFeed = DEMO.disclosure.feed.map((b) => ({ ...b }));
    let feedItems = [...state.feedExtra, ...baseFeed];
    if (state.sideMode === "1to1" && ae) {
      const filtered = feedItems.filter((b) => b.you || b.expertId === ae.id || b.who === ae.name);
      if (filtered.length) feedItems = filtered;
    }
    const chatHtml = feedItems.map((b) => {
      const ex = b.expertId ? expertById(b.expertId) : DEMO.disclosure.roster.find((r) => r.name === b.who);
      const av = b.you
        ? `<span class="av you">你</span>`
        : avatarHtml(ex && ex.photo, (ex && ex.av) || (b.who || "?").slice(0, 1));
      const tools = (b.tools || []).map((x) => `<span class="tool-chip">${escapeHtml(x)}</span>`).join("");
      return `<div class="bubble ${b.you ? "you" : ""}" data-testid="feed-bubble">
        <div class="bubble-head">${av}<div class="who">${escapeHtml(b.who)}</div></div>
        <div class="bubble-text">${escapeHtml(b.text)}</div>
        ${tools ? `<div class="tool-chips" data-testid="tool-chips">${tools}</div>` : ""}
      </div>`;
    }).join("");
    $("#feed").innerHTML = reportBubbles.join("") + chatHtml;
    const bf = $("#btnFact"); if (bf) bf.addEventListener("click", confirmFact);
    const bh = $("#btnHand5"); if (bh) bh.addEventListener("click", confirmCanHand5);
    const wo = $("#btnOpenWO"); if (wo) wo.addEventListener("click", openWorkOrder);
    bindExcerptClicks($("#feed"));

    /* 汇报流常显；轻量不收对话（请示在对话里） */
    const feedWrap = $("#feedWrap");
    if (feedWrap) {
      feedWrap.classList.remove("collapsed");
    }

    /* composer 指向 + @材料 */
    const cTo = $("#composerTo");
    if (cTo) {
      cTo.textContent = state.sideMode === "1to1" && ae
        ? `对：${ae.name} · 1:1`
        : `对：${lead ? lead.name : "交底部负责人"} · 团队`;
    }
    const atRow = $("#atChips");
    if (atRow) {
      const mats = (state.files.length ? state.files : DEMO.sampleFiles).slice(0, 4);
      atRow.innerHTML = `
        <button type="button" class="at-toggle" id="btnAtToggle" data-testid="at-toggle">@材料</button>
        <div class="at-picker" id="atPicker" data-testid="at-picker" ${state.atOpen ? "" : "hidden"}>
          ${mats.map((f) => `<button type="button" class="at-chip" data-at="${escapeHtml(f.name)}" data-testid="at-chip">${escapeHtml(f.name)}</button>`).join("")}
        </div>`;
      const tog = $("#btnAtToggle");
      if (tog) tog.addEventListener("click", () => {
        state.atOpen = !state.atOpen;
        const pop = $("#atPicker");
        if (pop) pop.hidden = !state.atOpen;
      });
      atRow.querySelectorAll("[data-at]").forEach((b) => {
        b.addEventListener("click", () => insertAtMaterial(b.dataset.at));
      });
    }
    if (flashId) {
      requestAnimationFrame(() => scrollToAnchor(flashId));
      state.highlightAnchor = null;
    }
  }

  function renderWorkOrder() {
    const ck = state.woChecks;
    const allCk = ck.in1 && ck.in2 && ck.in3;
    $("#woBody").innerHTML = `
      <div class="wo-card" data-testid="h45">
        <span class="tag ask">工单 · 现在做⑤</span>
        <h2>④ → ⑤ 交办工单</h2>
        <p class="muted">打包方交产出，接单方开新线程；旁注三线分词。</p>
        <div class="wo-agents">
          <div class="wo-agent">${avatarHtml("04.jpg", "负")}<div><strong>交底部负责人</strong><div class="tiny muted">打包 · 结束检查表</div></div></div>
          <div class="wo-agent">${avatarHtml("05.jpg", "申")}<div><strong>申请部负责人</strong><div class="tiny muted">接单 · 开 A/B/C</div></div></div>
        </div>
        <div class="wo-meta">
          <div><label>打包方</label>交底部负责人</div>
          <div><label>接单方</label>申请部负责人</div>
          <div><label>④ 合格线</label><span class="tag ok">交底已全绿</span></div>
          <div><label>⑤ 合格线</label><span class="tag warn">申请尚未过线</span></div>
        </div>
        <div class="contract-table" data-testid="wo-contracts">
          <div class="ct-row"><span class="ct-k">输入契约</span><span>合格交底全绿 + 事实确认 + 材料包</span></div>
          <div class="ct-row"><span class="ct-k">输出契约</span><span>申请文件可递交（过线）+ 申不申结论</span></div>
          <div class="ct-row"><span class="ct-k">质量契约</span><span>权项-交底一致 · 形式要件 · 过线≠递交</span></div>
        </div>
        <div class="wo-accept-checks" data-testid="wo-accept-checks">
          <div class="tiny" style="font-weight:700;margin-bottom:6px">接单前勾结束检查表三项</div>
          <label class="wo-ck"><input type="checkbox" data-wock="in1" ${ck.in1 ? "checked" : ""} data-testid="wo-ck-1"/> 交底全绿已核</label>
          <label class="wo-ck"><input type="checkbox" data-wock="in2" ${ck.in2 ? "checked" : ""} data-testid="wo-ck-2"/> 事实确认已核</label>
          <label class="wo-ck"><input type="checkbox" data-wock="in3" ${ck.in3 ? "checked" : ""} data-testid="wo-ck-3"/> 材料包齐全</label>
        </div>
        <div class="agent-steps">
          <div class="agent-step done"><span class="as-t">过线</span><span>交底全绿 + 事实 + 可交⑤</span></div>
          <div class="agent-step done"><span class="as-t">打包</span><span>材料包 / 结束检查表摘要已列</span></div>
          <div class="agent-step on"><span class="as-t">接单</span><span>勾三项后申请部接单进入⑤</span></div>
        </div>
        <div class="row-actions">
          <button type="button" class="primary" id="btnAcceptWO" data-testid="accept-wo" ${allCk ? "" : "disabled"}>申请部接单进入</button>
          <button type="button" id="btnBackD4">返回交底部</button>
          <button type="button" class="ghost" id="btnWoLobby">回工作台</button>
        </div>
        ${!allCk ? `<p class="tiny muted" data-testid="wo-need-check">请先勾选结束检查表三项再接单</p>` : ""}
      </div>`;
    $$("[data-wock]").forEach((inp) => inp.addEventListener("change", () => {
      state.woChecks[inp.dataset.wock] = !!inp.checked;
      render();
    }));
    $("#btnAcceptWO").addEventListener("click", () => {
      if (!(state.woChecks.in1 && state.woChecks.in2 && state.woChecks.in3)) {
        toast("请先勾结束检查表三项");
        return;
      }
      openDept("d5", { fromWorkOrder: true });
    });
    $("#btnBackD4").addEventListener("click", () => openDept("d4", { direct: true }));
    $("#btnWoLobby").addEventListener("click", goLobby);
  }

  function renderApply() {
    const a = state.apply;
    const segA = a.understand ? "done" : "now";
    const segB = !a.understand ? "todo" : (a.applyOrNot ? "done" : "now");
    const segC = a.applyOrNot !== "yes" ? "todo" : (a.submit ? "done" : "now");
    const segCls = (s) => s === "done" ? "seg done" : (s === "now" ? "seg now" : "seg");
    const tab = state.applyDocTab || "claims";
    const claims = DEMO.apply.claims || [];
    const specs = DEMO.apply.specSections || [];
    const diffs = DEMO.apply.diffs || [];
    let docInner = "";
    if (tab === "claims") {
      docInner = `<div class="doc-page" data-testid="d5-doc-claims">
        <div class="page-kicker">权利要求书 · 第 1 页（示意分页）</div>
        <h3 style="margin:0 0 10px;font-family:var(--font-doc)">权利要求书</h3>
        ${claims.map((c) => {
          const hi = state.applyClaimHighlight === c.id ? " claim-hi" : "";
          return `<div class="claim-row${hi}" id="claim-${escapeHtml(c.id)}" data-testid="claim-${escapeHtml(c.id)}">
          <div class="claim-no">${escapeHtml(c.no)}<span class="ck">${escapeHtml(c.kind)}</span></div>
          <p>${escapeHtml(c.text)}</p>
        </div>`;
        }).join("")}
      </div>`;
    } else if (tab === "spec") {
      docInner = `<div class="doc-page" data-testid="d5-doc-spec">
        <div class="page-kicker">说明书 · 分页稿（示意）</div>
        <h3 style="margin:0 0 10px;font-family:var(--font-doc)">说明书</h3>
        ${specs.map((s) => `<div class="sec" id="${escapeHtml(s.id)}"><strong>${escapeHtml(s.h)}</strong><p>${escapeHtml(s.t)}</p></div>`).join("")}
        <div class="sec"><strong>查新摘要</strong><p>${escapeHtml(DEMO.apply.noveltyHint)}</p></div>
      </div>`;
    } else {
      docInner = `<div class="doc-page" data-testid="d5-doc-diff">
        <div class="page-kicker">交底 ↔ 申请 · 对照差分</div>
        <h3 style="margin:0 0 10px">一眼对照</h3>
        ${renderDiffBoard(diffs, { testid: "d5-diff-board" })}
        ${renderPriorArtHits(DEMO.apply.priorArtHits || [], "d5-prior-hits")}
      </div>`;
    }
    const tabBtn = (id, label) => `<button type="button" class="doc-tab ${tab === id ? "on" : ""}" data-apply-tab="${id}" data-testid="d5-tab-${id}">${label}</button>`;

    const aDens = state.applyDensity === "light";
    const aRoster = DEMO.apply.roster || [];
    const aQc = DEMO.apply.qc || [];
    const aAllGreen = aQc.length ? aQc.every((q) => q.status === "green") : a.overLine;

    const aLead = aRoster.find((e) => e.kind === "lead") || aRoster[0] || { name: "申请部负责人", av: "申", photo: "05.jpg" };
    const d5Reports = [];
    /* A 理解 */
    if (!a.understand) {
      d5Reports.push(agentReportBubble({
        testid: "ask-understand", gradeId: "d5-understand", title: "确认开案理解",
        lead: aLead,
        bodyHtml: `<p class="ask-conclusion"><strong>结论</strong> ${escapeHtml((DEMO.apply.understandAsk || {}).conclusion || DEMO.apply.understand)}</p>
          ${evidenceDetailsHtml(DEMO.apply.understandAsk || { source: "交底技术方案", reasoning: DEMO.apply.understand, compare: "开案复述 vs 交底要点", confidence: "high", confidenceNote: "与交底一致" }, "understand-evidence")}
          ${judgmentReasonHtml("understand", "接受开案理解 · 三点组合无遗漏")}`,
        actsHtml: `<button type="button" class="ask-confirm" id="btnUnd" data-testid="confirm-understand">确认理解</button>`
      }));
    } else {
      d5Reports.push(agentReportBubble({ testid: "ask-understand", gradeId: "d5-understand", title: "已确认理解", lead: aLead, done: true, doneLabel: "已确认开案理解" }));
    }
    /* B 申不申 */
    if (!a.applyOrNot) {
      d5Reports.push(agentReportBubble({
        testid: "ask-apply-or-not", gradeId: "d5-apply", title: "申不申？",
        lead: aLead,
        bodyHtml: `${!a.understand ? `<p class="tiny">A 未确认前本钮不可用。</p>` : `<p class="ask-conclusion"><strong>结论</strong> ${escapeHtml((DEMO.apply.applyOrNotAsk || {}).conclusion || DEMO.apply.noveltyHint)}</p>
          ${evidenceDetailsHtml(DEMO.apply.applyOrNotAsk, "apply-evidence")}
          ${judgmentReasonHtml("apply", "建议申请 · 接受查新对比风险")}`}`,
        actsHtml: `<button type="button" class="ask-confirm" id="btnYes" data-testid="confirm-apply-yes" ${a.understand ? "" : "disabled"}>申请</button>
             <button type="button" class="ghost" id="btnNo" data-testid="confirm-apply-no" ${a.understand ? "" : "disabled"}>不申结案</button>`
      }));
    } else {
      d5Reports.push(agentReportBubble({
        testid: "ask-apply-or-not", gradeId: "d5-apply", title: "申不申",
        lead: aLead, done: true,
        doneLabel: a.applyOrNot === "yes" ? "已拍：申请" : "已拍：不申结案"
      }));
    }
    /* C 递交 — 关键关常显；未过线/未申则 disabled */
    if (!a.submit) {
      const cBody = a.applyOrNot !== "yes"
        ? `<p class="tiny">须先拍「申不申」且过线。过线 ≠ 递交。</p>`
        : (!a.overLine
          ? `<p class="tiny">须先过线（主栏黄项）。过线 ≠ 递交。</p>`
          : `${evidenceDetailsHtml(DEMO.apply.submitAsk, "submit5-evidence")}
            ${submitManifestHtml(DEMO.apply.submitAsk, "submit5-manifest")}
            ${judgmentReasonHtml("submit5", "文件齐 · 确认递交")}`);
      d5Reports.push(agentReportBubble({
        testid: "ask-submit5", gradeId: "d5-submit", title: "确认递交申请？",
        lead: aLead, bodyHtml: cBody,
        actsHtml: `<button type="button" class="ask-confirm" id="btnSubmit5" data-testid="confirm-submit5" ${a.overLine && a.applyOrNot === "yes" ? "" : "disabled"}>确认递交</button>`
      }));
    } else {
      d5Reports.push(agentReportBubble({ testid: "ask-submit5", gradeId: "d5-submit", title: "已确认递交", lead: aLead, done: true, doneLabel: "已确认递交申请" }));
    }
    const d5ReportHtml = d5Reports.join("");
    const d5ChatHtml = `<div class="bubble" data-testid="feed-bubble"><div class="bubble-head">${avatarHtml(aLead.photo, aLead.av)}<div class="who">${escapeHtml(aLead.name)}</div></div><div class="bubble-text">撰写与查新进行中 · 关键关我放在上面向你汇报。</div></div>`;

        $("#applyBody").innerHTML = `
      <div class="dept-top">
        <button type="button" class="ghost" id="btnApplyBack">← 工作台</button>
        <h1>⑤ 申请部</h1>
        <span class="line-status ${a.overLine ? "ok" : ""}">${a.overLine ? "申请文件可递交（过线）" : "未过线 / 进行中"}</span>
        ${deptMetaHtml({ caseTitle: (caseById(state.activeCaseId || "pc2") || {}).title || "申请撰写", prefShort: prefShortText() })}
        <div class="task-strip in-top" id="d5TaskStrip" data-testid="task-strip">${taskStripHtml(state.activeCaseId || "pc2")}</div>
        <span class="mode-hint tiny" id="d5ModeHint" data-testid="d5-mode-hint">${aDens ? "轻量" : "主笔"}</span>
      </div>
      <div class="wb-chrome" data-testid="d5-chrome" hidden></div>
<div class="apply-layout ${aDens ? "density-light" : ""}" data-testid="d5-layout">
        <div class="main-pane">
          <div class="pane-head"><strong>主产出 · 申请文件</strong><span class="pane-tag">权项 | 说明书 | 差分</span></div>
          ${aDens ? `<div class="light-fold-hint" data-testid="d5-light-fold">轻量 · 主栏收拢 · 请示在对话</div>` : ""}
          <div class="pane-body ${aDens ? "light-folded" : ""}">
            <div class="doc-tabs" data-testid="d5-doc-tabs">
              ${tabBtn("claims", "权项")}
              ${tabBtn("spec", "说明书")}
              ${tabBtn("diff", "差分对照")}
            </div>
            ${docInner}
            <div class="qc-progress-line" style="margin-top:12px" id="d5-qc" data-testid="d5-qc-card">
              <strong>C · 过线</strong>
              <span class="tiny muted">过线≠递交 · 侧栏确认</span>
              ${aQc.map((q) => {
                const tag = q.status === "green" ? '<span class="tag ok">绿</span>' : '<span class="tag warn">黄</span>';
                return `<span class="qc-fix-row">${escapeHtml(q.name)} ${tag}</span>`;
              }).join("")}
              ${!a.overLine
                ? `<span class="qc-yellow-fix" data-testid="d5-qc-yellow-fix">
                    <button type="button" class="primary qc-fix-btn" id="btnOver" data-testid="make-overline" ${a.applyOrNot === "yes" && a.understand ? "" : "disabled"}>补数据过线</button>
                    <button type="button" class="qc-fix-btn ghost-risk" id="btnOverRisk" data-testid="d5-qc-risk" ${a.applyOrNot === "yes" && a.understand ? "" : "disabled"}>认风险过线</button>
                  </span>`
                : `<span class="tag ok" data-testid="d5-overlined">已过线${state.applyYellowRisk ? "（含认风险）" : ""}</span>`}
            </div>
          </div>
        </div>
        <div class="side-pane" data-testid="ai-pane-d5">
          <div class="ai-id-zone" data-testid="ai-id-zone-d5">
            <div class="who-block ai-roster single-rail ${aDens ? "collapsed roster-folded" : ""}" data-testid="d5-roster-wrap">
              <div class="who-head"><strong>编制</strong><button type="button" class="ghost tiny" id="btnD5RosterFold" data-testid="d5-roster-fold">${aDens ? "展开编制" : "收起"}</button></div>
              <div class="roster" data-testid="d5-roster">${aRoster.map((e) => `
                <button type="button" class="expert-chip" data-testid="d5-expert-${escapeHtml(e.id)}">
                  ${avatarHtml(e.photo, e.av)}
                  <span class="meta"><span class="name-row"><strong>${escapeHtml(e.name)}</strong><span class="tag-role">${escapeHtml(e.tag || "")}</span></span>
                  <span class="status-pill ${e.status}">${escapeHtml(statusLabel(e.status))}</span>
                  ${e.style ? `<span class="style-tag">${escapeHtml(e.style)}</span>` : ""}</span>
                </button>`).join("")}</div>
            </div>
          </div>
          <div class="pane-body" data-testid="d5-side-body">
            <div class="abc-strip" data-testid="d5-abc">
              <div class="${segCls(segA)}" data-testid="seg-a"><span class="seg-k">A</span>理解${a.understand ? " · 已确认" : " · 待你确认"}</div>
              <div class="${segCls(segB)}" data-testid="seg-b"><span class="seg-k">B</span>申不申${a.applyOrNot === "yes" ? " · 要申" : a.applyOrNot === "no" ? " · 不申" : a.understand ? " · 待你拍" : ""}</div>
              <div class="${segCls(segC)}" data-testid="seg-c"><span class="seg-k">C</span>递交${a.submit ? " · 已确认" : a.overLine ? " · 过线待递交" : ""}</div>
            </div>
            <div class="feed-wrap feed-primary" data-testid="feed-wrap-d5">
              <div class="feed-h"><strong>对话</strong><span class="pane-tag">汇报 · 要你拍</span></div>
              <div class="feed" data-testid="d5-feed" data-testid-gates="d5-gates">${d5ReportHtml}${d5ChatHtml}</div>
            </div>
            <div hidden data-testid="d5-gates"></div>
            <div hidden data-testid="ai-ask-zone-d5"></div>
          </div>
          <div class="composer" data-testid="d5-composer">
            <div class="composer-to">对：申请部负责人 · 团队</div>
            <div class="composer-row">
              <textarea id="applyComposerInput" rows="1" placeholder="驾驭一句（演示）· 如收紧独权" data-testid="d5-composer-input"></textarea>
              <button type="button" class="primary" id="btnApplyCompose" data-testid="d5-composer-send">发送</button>
            </div>
          </div>
        </div>
      </div>`;
    const d5s = $("#d5TaskStrip");
    if (d5s) bindTaskStrip(d5s);
    const applyShell = $("#applyBody");
    if (applyShell) applyShell.classList.toggle("density-light-shell", !!aDens);
    /* 轻量时隐藏 chrome 内条 */
    const d5ch = document.querySelector('[data-testid="d5-chrome"]');
    if (d5ch) d5ch.hidden = true;
    $$("[data-apply-tab]").forEach((b) => b.addEventListener("click", () => {
      state.applyDocTab = b.dataset.applyTab;
      render();
    }));
    $("#btnApplyBack").addEventListener("click", goLobby);
    const u = $("#btnUnd"); if (u) u.addEventListener("click", () => {
      const uAsk = DEMO.apply.understandAsk || {};
      const reason = readJudgmentReason("understand");
      state.apply.understand = true;
      addTrace("操作·理解确认", "⑤ A");
      addJudgment({
        gate: "⑤理解确认",
        conclusion: uAsk.conclusion || DEMO.apply.understand,
        option: "确认理解",
        reason: reason,
        evidenceAnchor: uAsk.anchor || "block-a",
        source: uAsk.source || "交底核心要点",
        compare: uAsk.compare || "",
        confidence: uAsk.confidence || "high"
      });
      render();
    });
    const y = $("#btnYes"); if (y) y.addEventListener("click", () => {
      if (!state.apply.understand) return;
      const ask = DEMO.apply.applyOrNotAsk || {};
      const reason = readJudgmentReason("apply");
      state.apply.applyOrNot = "yes";
      addTrace("操作·申不申", "申请");
      addJudgment({
        gate: "⑤申不申",
        conclusion: ask.conclusion || "申请",
        option: "申请",
        reason,
        evidenceAnchor: ask.anchor || "sp-bg",
        source: ask.source,
        confidence: ask.confidence,
        compare: ask.compare
      });
      render();
    });
    const n = $("#btnNo"); if (n) n.addEventListener("click", () => {
      if (!state.apply.understand) return;
      const ask = DEMO.apply.applyOrNotAsk || {};
      const reason = readJudgmentReason("apply");
      state.apply.applyOrNot = "no";
      addTrace("操作·申不申", "不申结案 · 不出申请号");
      addJudgment({
        gate: "⑤申不申",
        conclusion: ask.conclusion || "不申",
        option: "不申结案",
        reason: reason || "选择不申 · B5 不出申请号",
        evidenceAnchor: ask.anchor || "sp-bg",
        source: ask.source,
        confidence: ask.confidence,
        compare: ask.compare
      });
      toast("不申结案（B5）· 不生成申请号");
      render();
    });
    const d5mh = $("#d5ModeHint");
    if (d5mh) d5mh.onclick = () => { state.applyDensity = state.applyDensity === "light" ? "author" : "light"; toast(state.applyDensity === "light" ? "轻量" : "主笔", { soft: true }); render(); };
    const d5rf = $("#btnD5RosterFold");
    if (d5rf) d5rf.onclick = () => { state.applyDensity = "author"; render(); };
    /* density toggle buttons removed */
    const o = $("#btnOver"); if (o) o.addEventListener("click", () => {
      if (!(state.apply.applyOrNot === "yes" && state.apply.understand)) return;
      (DEMO.apply.qc || []).forEach((q) => { q.status = "green"; });
      state.apply.overLine = true;
      state.applyYellowRisk = false;
      addTrace("操作·⑤过线", "补数据转绿 · 过线 ≠ 已确认递交");
      addJudgment({ gate: "⑤质检过线", conclusion: "黄项补数据转绿过线", option: "补数据转绿", reason: "形式要件补齐", confidence: "high" });
      render();
    });
    const orisk = $("#btnOverRisk"); if (orisk) orisk.addEventListener("click", () => {
      if (!(state.apply.applyOrNot === "yes" && state.apply.understand)) return;
      (DEMO.apply.qc || []).forEach((q) => { q.status = "green"; });
      state.apply.overLine = true;
      state.applyYellowRisk = true;
      addTrace("操作·⑤过线", "认风险过线 ≠ 已确认递交");
      addJudgment({ gate: "⑤质检过线", conclusion: "认风险过线", option: "认风险过线", reason: "接受形式黄项风险", confidence: "mid" });
      render();
    });
    const s = $("#btnSubmit5"); if (s) s.addEventListener("click", () => {
      if (!state.apply.overLine) return;
      const ask = DEMO.apply.submitAsk || {};
      const reason = readJudgmentReason("submit5");
      state.apply.submit = true;
      addTrace("操作·确认递交", "⑤ C");
      addJudgment({
        gate: "⑤确认递交",
        conclusion: ask.conclusion || "确认递交",
        option: "确认递交",
        reason,
        evidenceAnchor: "ask-submit5",
        source: ask.source,
        confidence: ask.confidence,
        compare: ask.compare
      });
      toast("已确认递交 · 已写入判断档案");
      render();
    });
    const btr = $("#btnToReply"); if (btr) btr.addEventListener("click", () => { state.view = "reply"; state.activeCaseId = "pc3"; render(); });
    const acs = $("#btnApplyCompose");
    if (acs) acs.addEventListener("click", () => {
      const v = ($("#applyComposerInput") && $("#applyComposerInput").value || "").trim();
      if (!v) { toast("先打一句再说（演示）"); return; }
      state.applyDocTab = "claims";
      state.applyClaimHighlight = "c1";
      if (DEMO.apply.claims && DEMO.apply.claims[0]) {
        const tip = "【已按驾驭高亮】";
        if (!DEMO.apply.claims[0].text.includes("【已按驾驭高亮】")) {
          DEMO.apply.claims[0].text = tip + DEMO.apply.claims[0].text;
        }
      }
      addTrace("⑤侧栏驾驭（演示）", v.slice(0, 80) + " → 独权高亮");
      toast("已落主栏 · 独权 1 高亮（演示）");
      if ($("#applyComposerInput")) $("#applyComposerInput").value = "";
      render();
      requestAnimationFrame(() => {
        const el = document.getElementById("claim-c1");
        if (el) { el.classList.add("claim-hi"); el.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
      });
    });
    bindDiffBoard($("#applyBody") || document); /* diff-bind-apply */
  }

  function renderReply() {
    const r = state.reply;
    const tab = state.replyDocTab || "reply";
    const sections = DEMO.reply.replySections || [];
    const diffs = DEMO.reply.diffs || [];
    let docInner = "";
    if (tab === "reply") {
      docInner = `<div class="doc-page" data-testid="d6-doc-reply">
        <div class="page-kicker">答复书 · 分页稿（示意）</div>
        <h3 style="margin:0 0 10px;font-family:var(--font-doc)">审查意见答复书（草案）</h3>
        ${sections.map((s) => {
          const hi = state.replySecHighlight === s.id ? " anchor-flash" : "";
          return `<div class="sec${hi}" id="${escapeHtml(s.id)}" data-testid="reply-sec-${escapeHtml(s.id)}"><strong>${escapeHtml(s.h)}</strong><p>${escapeHtml(s.t)}</p></div>`;
        }).join("")}
      </div>`;
    } else if (tab === "oa") {
      docInner = `<div class="doc-page" data-testid="d6-doc-oa">
        <div class="page-kicker">通知书摘录</div>
        <h3 style="margin:0 0 10px">审查意见通知书（摘）</h3>
        <div class="sec"><strong>期限</strong><p>${escapeHtml(DEMO.reply.deadline)}</p></div>
        <div class="sec"><strong>意见正文摘录</strong><p>${escapeHtml(DEMO.reply.oaExcerpt || "")}</p></div>
        <div class="sec"><strong>争点列表</strong><ul>${DEMO.reply.issues.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></div>
      </div>`;
    } else {
      docInner = `<div class="doc-page" data-testid="d6-doc-diff">
        <div class="page-kicker">通知书 ↔ 答复 · 对照</div>
        <h3 style="margin:0 0 10px">一眼对照</h3>
        ${renderDiffBoard(diffs, { testid: "d6-diff-board" })}
      </div>`;
    }
    const tabBtn = (id, label) => `<button type="button" class="doc-tab ${tab === id ? "on" : ""}" data-reply-tab="${id}" data-testid="d6-tab-${id}">${label}</button>`;

    const rDens = state.replyDensity === "light";
    const rRoster = DEMO.reply.roster || [];

    const rLead = rRoster.find((e) => e.kind === "lead") || rRoster[0] || { name: "答复部负责人", av: "答", photo: "06.jpg" };
    const d6Reports = [];
    /* A 争点 */
    if (!r.contentionOk) {
      d6Reports.push(agentReportBubble({
        testid: "ask-contention", gradeId: "d6-contention", title: "审查意见理解是否如此？",
        lead: rLead,
        bodyHtml: `<p class="ask-conclusion"><strong>结论</strong> ${escapeHtml(DEMO.reply.contention)}</p>
          ${evidenceDetailsHtml({ source: "通知书摘录", reasoning: DEMO.reply.contention, compare: "中立复述 vs 通知书争点", confidence: "high", confidenceNote: "争点理解" }, "contention-evidence")}
          ${judgmentReasonHtml("contention", "接受中立复述")}`,
        actsHtml: `<button type="button" class="ask-confirm" id="btnContention" data-testid="confirm-contention">确认争点理解</button>
          <button type="button" class="ghost">还要改</button>`
      }));
    } else {
      d6Reports.push(agentReportBubble({ testid: "ask-contention", gradeId: "d6-contention", title: "争点理解", lead: rLead, done: true, doneLabel: "争点理解已确认" }));
    }
    /* B 策略 */
    if (!r.limitOk) {
      const stratBody = !r.contentionOk
        ? `<p class="tiny">A 未确认前不可定调策略。</p>`
        : `<p class="ask-conclusion"><strong>结论</strong> ${escapeHtml((DEMO.reply.strategyAsk || {}).conclusion || "")}</p>
          ${evidenceDetailsHtml(DEMO.reply.strategyAsk, "strategy-evidence")}
          <div class="strategy-opts" data-testid="strategy-opts">
            ${(DEMO.reply.strategyOptions || []).map((opt) => {
              const on = state.strategyChoice === opt.id ? "on" : "";
              return `<button type="button" class="strat-opt ${on}" data-strat="${escapeHtml(opt.id)}" data-testid="strat-${escapeHtml(opt.id)}">
                <strong>方案 ${escapeHtml(opt.id)}${opt.recommend ? " · 建议" : ""}</strong>
                <div>${escapeHtml(opt.title)}</div>
                <div class="tiny muted">影响：${escapeHtml(opt.impact)}</div>
              </button>`;
            }).join("")}
          </div>
          ${judgmentReasonHtml("strategy", "采纳建议方案 · 接受放弃范围影响")}`;
      d6Reports.push(agentReportBubble({
        testid: "ask-limit", gradeId: "d6-strategy", title: "重大缩限是否接受？",
        lead: rLead, bodyHtml: stratBody,
        actsHtml: `<button type="button" class="ask-confirm" id="btnLimit" data-testid="confirm-limit" ${r.contentionOk ? "" : "disabled"}>确认策略</button>`
      }));
    } else {
      d6Reports.push(agentReportBubble({
        testid: "ask-limit", gradeId: "d6-strategy", title: "策略",
        lead: rLead, done: true,
        doneLabel: `已确认策略/缩限 · 方案 ${escapeHtml(state.strategyChoice || "A")}`
      }));
    }
    /* C 递交 */
    if (!r.submit) {
      d6Reports.push(agentReportBubble({
        testid: "ask-reply-submit", gradeId: "d6-submit", title: "确认本轮递交",
        lead: rLead,
        bodyHtml: !r.limitOk
          ? `<p class="tiny">须先确认策略。</p>`
          : `${evidenceDetailsHtml(DEMO.reply.submitAsk, "reply-submit-evidence")}
            ${submitManifestHtml(DEMO.reply.submitAsk, "reply-submit-manifest")}
            ${judgmentReasonHtml("replySubmit", "文件齐·接受超期升级与收文风险")}`,
        actsHtml: `<button type="button" class="ask-confirm" id="btnReplySubmit" data-testid="confirm-reply-submit" ${r.limitOk ? "" : "disabled"}>确认递交</button>`
      }));
    } else {
      d6Reports.push(agentReportBubble({ testid: "ask-reply-submit", gradeId: "d6-submit", title: "本轮递交", lead: rLead, done: true, doneLabel: "已确认本轮递交" }));
    }
    const d6ReportHtml = d6Reports.join("");
    const d6ChatHtml = `<div class="bubble" data-testid="feed-bubble"><div class="bubble-head">${avatarHtml(rLead.photo, rLead.av)}<div class="who">${escapeHtml(rLead.name)}</div></div><div class="bubble-text">本轮答复进行中 · 期限与策略拿不准的地方，我都放在对话里向你汇报。</div></div>`;

        $("#replyBody").innerHTML = `
      <div class="dept-top">
        <button type="button" class="ghost" id="btnReplyBack">← 工作台</button>
        <h1>⑥ 答复部</h1>
        <span class="line-status">本轮答复进行中</span>
        ${deptMetaHtml({
          caseTitle: (caseById("pc3") || {}).title || "低功耗膜分离 · 首通 OA",
          deadline: DEMO.reply.deadline,
          upgraded: DEMO.reply.upgraded,
          prefShort: prefShortText()
        })}
        <div class="task-strip in-top" id="d6TaskStrip" data-testid="task-strip">${taskStripHtml("pc3")}</div>
        ${!DEMO.reply.upgraded ? `<button type="button" class="ghost tiny" id="btnUpgrade" data-testid="btn-upgrade">升级催办</button>` : `<span class="tag ask" data-testid="upgrade-badge">已升级催办</span>`}
        <span class="mode-hint tiny" id="d6ModeHint" data-testid="d6-mode-hint">${rDens ? "轻量" : "主笔"}</span>
      </div>
      <div class="wb-chrome" data-testid="d6-chrome" hidden></div>
      <div class="reply-layout ${rDens ? "density-light" : ""}" data-testid="d6-layout">
        <div class="main-pane">
          <div class="pane-head"><strong>主产出 · 答复稿</strong><span class="pane-tag">答复 | 通知书 | 差分</span></div>
          ${rDens ? `<div class="light-fold-hint" data-testid="d6-light-fold">轻量 · 主栏收拢 · 请示在对话</div>` : ""}
          <div class="pane-body ${rDens ? "light-folded" : ""}">
            <div class="doc-tabs" data-testid="d6-doc-tabs">
              ${tabBtn("reply", "答复书")}
              ${tabBtn("oa", "通知书")}
              ${tabBtn("diff", "差分对照")}
            </div>
            ${docInner}
          </div>
        </div>
        <div class="side-pane" data-testid="ai-pane-d6">
          <div class="ai-id-zone" data-testid="ai-id-zone-d6">
            <div class="who-block ai-roster single-rail ${rDens ? "collapsed roster-folded" : ""}" data-testid="d6-roster-wrap">
              <div class="who-head"><strong>编制</strong><button type="button" class="ghost tiny" id="btnD6RosterFold" data-testid="d6-roster-fold">${rDens ? "展开编制" : "收起"}</button></div>
              <div class="roster" data-testid="d6-roster">${rRoster.map((e) => `
                <button type="button" class="expert-chip" data-testid="d6-expert-${escapeHtml(e.id)}">
                  ${avatarHtml(e.photo, e.av)}
                  <span class="meta"><span class="name-row"><strong>${escapeHtml(e.name)}</strong><span class="tag-role">${escapeHtml(e.tag || "")}</span></span>
                  <span class="status-pill ${e.status}">${escapeHtml(statusLabel(e.status))}</span>
                  ${e.style ? `<span class="style-tag">${escapeHtml(e.style)}</span>` : ""}</span>
                </button>`).join("")}</div>
            </div>
          </div>
          <div class="pane-body" data-testid="d6-side-body">
            <div class="feed-wrap feed-primary" data-testid="feed-wrap-d6">
              <div class="feed-h"><strong>对话</strong><span class="pane-tag">汇报 · 要你拍</span></div>
              <div class="feed" data-testid="d6-feed">${d6ReportHtml}${d6ChatHtml}</div>
            </div>
            <div hidden data-testid="d6-gates"></div>
            <div hidden data-testid="ai-ask-zone-d6"></div>
          </div>
          <div class="composer" data-testid="d6-composer">
            <div class="composer-to">对：答复部负责人 · 团队</div>
            <div class="composer-row">
              <textarea id="replyComposerInput" rows="1" placeholder="驾驭一句（演示）· 如坚持双密封争点" data-testid="d6-composer-input"></textarea>
              <button type="button" class="primary" id="btnReplyCompose" data-testid="d6-composer-send">发送</button>
            </div>
          </div>
        </div>
      </div>`;
    const d6s = $("#d6TaskStrip");
    if (d6s) {
      /* ensure active highlight pc3 when in reply */
      if (state.activeCaseId !== "pc3") {
        /* keep user's choice but strip defaults visual via taskStripHtml arg */
      }
      bindTaskStrip(d6s);
    }
    const replyShell = $("#replyBody");
    if (replyShell) replyShell.classList.toggle("density-light-shell", !!rDens);
    const d6ch = document.querySelector('[data-testid="d6-chrome"]');
    if (d6ch) d6ch.hidden = true;
    $$("[data-reply-tab]").forEach((b) => b.addEventListener("click", () => {
      state.replyDocTab = b.dataset.replyTab;
      render();
    }));
    $("#btnReplyBack").addEventListener("click", goLobby);
    const d6mh = $("#d6ModeHint");
    if (d6mh) d6mh.onclick = () => { state.replyDensity = state.replyDensity === "light" ? "author" : "light"; toast(state.replyDensity === "light" ? "轻量" : "主笔", { soft: true }); render(); };
    const d6rf = $("#btnD6RosterFold");
    if (d6rf) d6rf.onclick = () => { state.replyDensity = "author"; render(); };
    /* density toggle removed */
    const bup = $("#btnUpgrade"); if (bup) bup.addEventListener("click", () => {
      DEMO.reply.upgraded = true;
      addTrace("升级催办", "超期风险 · 已升级可见");
      toast("已升级催办（演示）");
      render();
    });
    $$("[data-strat]").forEach((b) => b.addEventListener("click", () => {
      if (state.reply.limitOk) return;
      state.strategyChoice = b.dataset.strat;
      render();
    }));
    const bc = $("#btnContention"); if (bc) bc.addEventListener("click", () => {
      state.reply.contentionOk = true;
      addTrace("操作·争点理解", "⑥ A");
      addJudgment({
        gate: "⑥争点理解",
        conclusion: DEMO.reply.contention,
        option: "确认争点理解",
        reason: "接受中立复述",
        evidenceAnchor: "rp-cont",
        source: "通知书摘录",
        confidence: "high"
      });
      render();
    });
    const bl = $("#btnLimit"); if (bl) bl.addEventListener("click", () => {
      if (!state.reply.contentionOk) return;
      if (!state.strategyChoice) { toast("请先点选方案 A 或 B"); return; }
      const opt = (DEMO.reply.strategyOptions || []).find((o) => o.id === state.strategyChoice);
      const ask = DEMO.reply.strategyAsk || {};
      const reason = readJudgmentReason("strategy");
      state.reply.limitOk = true;
      addTrace("操作·重大缩限", `⑥ B · 方案 ${state.strategyChoice}`);
      addJudgment({
        gate: "⑥策略/缩限",
        conclusion: ask.conclusion || (opt && opt.title) || "确认策略",
        option: `方案 ${state.strategyChoice}${opt ? " · " + opt.title : ""}`,
        reason: reason + (opt ? `；影响：${opt.impact}` : ""),
        evidenceAnchor: "ask-limit",
        source: ask.source,
        confidence: ask.confidence,
        compare: ask.compare
      });
      render();
    });
    const bs = $("#btnReplySubmit"); if (bs) bs.addEventListener("click", () => {
      if (!state.reply.limitOk) return;
      const ask = DEMO.reply.submitAsk || {};
      const reason = readJudgmentReason("replySubmit");
      state.reply.submit = true;
      addTrace("操作·确认本轮递交", "⑥");
      addJudgment({
        gate: "⑥确认本轮递交",
        conclusion: ask.conclusion || "确认本轮递交",
        option: "确认递交",
        reason,
        evidenceAnchor: "ask-reply-submit",
        source: ask.source,
        confidence: ask.confidence,
        compare: ask.compare
      });
      toast("本轮递交已确认 · 已写入判断档案");
      render();
    });
    const rcs = $("#btnReplyCompose");
    if (rcs) rcs.addEventListener("click", () => {
      const v = ($("#replyComposerInput") && $("#replyComposerInput").value || "").trim();
      if (!v) { toast("先打一句再说（演示）"); return; }
      state.replyDocTab = "reply";
      state.replySecHighlight = "rp-arg";
      const sec = (DEMO.reply.replySections || []).find((s) => s.id === "rp-arg");
      if (sec && !sec.t.includes("【驾驭补强】")) sec.t = "【驾驭补强】" + sec.t;
      addTrace("⑥侧栏驾驭（演示）", v.slice(0, 80) + " → 创造性段高亮");
      toast("已落主栏 · 创造性段高亮（演示）");
      if ($("#replyComposerInput")) $("#replyComposerInput").value = "";
      render();
      requestAnimationFrame(() => {
        const el = document.getElementById("rp-arg");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
    bindDiffBoard($("#replyBody") || document); /* diff-bind-reply */
  }

  function renderThin() {
    const d = deptById(state.thinDept);
    const confirmed = !!(state.thinLineConfirmed[d.id]);
    const photo = d.leadPhoto || "01.jpg";
    $("#thinBody").innerHTML = `
      <div class="thin-shell">
        <div class="dept-top">
          <button type="button" class="ghost" id="btnThinLobby">← 工作台</button>
          <h1>${escapeHtml(d.num)} ${escapeHtml(d.name)}</h1>
          <span class="line-status">薄占位 · 合格线示意</span>
        </div>
        <div class="lead-bar">
          ${avatarHtml(photo, d.num, "avatar")}
          <div>
            <strong>${escapeHtml(d.name)}负责人</strong>
            <div class="tiny muted">${escapeHtml(d.desc)} · 一期薄部，不造细作业台。</div>
          </div>
        </div>
        <div class="thin-panel" data-testid="thin-dept">
          <div class="mini-wb">
            <div class="mw-card">
              <strong>本部门合格线</strong>
              <p class="tiny" style="margin:6px 0 0">${escapeHtml(d.line)}</p>
            </div>
            <div class="mw-card">
              <strong>agent 状态</strong>
              <p class="tiny" style="margin:6px 0 0">编制薄占位 · 进得去 · 可回大厅派别的部</p>
            </div>
          </div>
          <div class="hard-ask ${confirmed ? "done" : ""}" data-testid="thin-line-ask">
            <div class="label">【示意硬请示】P2</div>
            <h3>合格线确认（薄部示意）</h3>
            <p class="tiny">一期不做细台；若本部门有产出，请确认是否达到合格线表述。</p>
            <div class="acts">${confirmed
              ? `<span class="tag ok">已确认合格线示意</span>`
              : `<button type="button" class="ask-confirm" id="btnThinLine" data-testid="thin-confirm-line">确认合格线</button>`}</div>
          </div>
          <p class="ban-line" data-testid="thin-ban"><strong>禁超卖：</strong>${escapeHtml(d.ban || "一期不做细作业；勿超卖能力")}</p>
          <div class="side-composer-stub" data-testid="thin-composer">
            <div class="composer-to">对：${escapeHtml(d.name)}负责人（薄部示意）</div>
            <div class="composer-row">
              <textarea rows="1" disabled placeholder="薄部暂不开放细驾驭 · 请回大厅或进④⑤⑥"></textarea>
              <button type="button" disabled>发送</button>
            </div>
          </div>
        </div>
      </div>`;
    $("#btnThinLobby").addEventListener("click", goLobby);
    const bt = $("#btnThinLine");
    if (bt) bt.addEventListener("click", () => {
      state.thinLineConfirmed[d.id] = true;
      addJudgment({ gate: `${d.num}合格线确认`, conclusion: d.line, option: "确认合格线示意", reason: "薄部示意拍板", confidence: "mid" });
      toast("薄部合格线已确认（示意）");
      render();
    });
  }

  function renderBlock() {
    $("#blockBody").innerHTML = `
      <div class="block-shell">
        <div class="dept-top">
          <button type="button" class="ghost" id="btnBlockLobby">← 工作台</button>
          <h1>⑤ 申请部 · 进不去</h1>
          <span class="line-status">门槛未过</span>
        </div>
        <div class="block-panel" data-testid="b2-block">
          <h2>进入门槛未过（B2）</h2>
          <p>要进申请部，需要合格交底（④全绿）并完成「可交⑤」与工单接单——agent 不会越权开写。</p>
          <div class="gap-list" data-testid="b2-gaps">
            <div class="tiny" style="font-weight:700;margin-bottom:4px">缺什么</div>
            <ul>
              <li>尚无交底书成稿 / ④未全绿</li>
              <li>未确认「可交⑤」</li>
              <li>未开④→⑤工单接单</li>
            </ul>
          </div>
          <div class="agent-steps" style="margin:12px 0;text-align:left">
            <div class="agent-step"><span class="as-t">检</span><span>无④全绿交底路径</span></div>
            <div class="agent-step"><span class="as-t">挡</span><span>B2 回退 · 请先走交底部或前台</span></div>
          </div>
          <div class="row-actions">
            <button type="button" class="primary" id="btnBlockTo4" data-testid="b2-to-d4">去交底部补缺口</button>
            <button type="button" class="ghost" id="btnBlockFront" data-testid="b2-to-front">回前台</button>
          </div>
        </div>
      </div>`;
    $("#btnBlockTo4").addEventListener("click", () => openDept("d4", { direct: true }));
    $("#btnBlockLobby").addEventListener("click", goLobby);
    $("#btnBlockFront").addEventListener("click", openFront);
  }

  function renderDrawer() {
    const backdrop = $("#drawerBackdrop");
    const drawer = $("#drawer");
    if (state.drawerOpen) { backdrop.classList.add("on"); drawer.classList.add("on"); }
    else { backdrop.classList.remove("on"); drawer.classList.remove("on"); }
    /* 兼容旧 traces tab → 操作记录 */
    if (state.drawerTab === "traces") state.drawerTab = "ops";
    $$("[data-dtab]").forEach((b) => b.classList.toggle("on", b.dataset.dtab === state.drawerTab));
    const body = $("#drawerBody");
    if (state.drawerTab === "materials") {
      const files = state.files.length ? state.files : DEMO.sampleFiles;
      body.innerHTML = `<h3 style="margin-top:0">材料</h3>
        <div data-testid="drawer-materials">
        ${files.map((f) => `<div class="trace-item file-row" data-testid="drawer-file-row" style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
          <div><strong>${escapeHtml(f.name)}</strong><div class="tiny muted">${escapeHtml(f.type)} · ${escapeHtml(f.summary || "")}</div></div>
          ${fileConfHtml(f)}
        </div>`).join("")}
        <div class="trace-item"><strong>缺口</strong><div class="tiny muted">${DEMO.suggest.gaps.map(escapeHtml).join("；")}</div></div>
        </div>`;
    } else if (state.drawerTab === "checklist") {
      body.innerHTML = `<h3 style="margin-top:0">检查表</h3>
        <div class="trace-item"><strong>进入检查表（④）</strong><div class="tiny">技术说明 ✓ · 图纸 ✓ · 目标写交底 ✓</div></div>
        <div class="trace-item"><strong>结束检查表（④）</strong>
          <button type="button" class="linkish checklist-jump" data-ck-jump="qc-card" data-testid="ck-jump-qc">全绿 ${state.allGreen ? "✓" : "…"} · 点回质检分卡</button>
          <button type="button" class="linkish checklist-jump" data-ck-jump="ask-fact" data-testid="ck-jump-fact">事实 ${state.factConfirmed ? "✓" : "…"} · 点回硬请示</button>
          <div class="tiny">可交⑤ ${state.canHand5 ? "✓" : "…"}</div>
        </div>
        <p class="tiny muted" data-testid="sample-scope-note">样机范围 · 无 API/字典；合入主干前再套成本审计（E-3）</p>`;
    } else if (state.drawerTab === "orders") {
      body.innerHTML = `<h3 style="margin-top:0">工单</h3>
        <div class="trace-item"><strong>前台领进</strong><div class="tiny muted">接待专家交办材料 → 交底部负责人</div></div>
        ${state.workOrderOpened
          ? `<div class="trace-item"><strong>现在做⑤</strong><div class="tiny">打包方：交底部负责人 · 接单：申请部负责人</div></div>`
          : `<div class="trace-item muted"><strong>④→⑤</strong><div class="tiny">尚未开单</div></div>`}`;
    } else if (state.drawerTab === "ops") {
      body.innerHTML = `<h3 style="margin-top:0" data-testid="ops-log-title">操作记录</h3>
        <p class="tiny muted">考勤/动作流水 · 非判断档案</p>
        <div data-testid="ops-log">
        ${state.traces.length
          ? state.traces.map((t) => `<div class="trace-item" data-testid="ops-item"><strong>${escapeHtml(t.title)}</strong><div class="tiny muted">${escapeHtml(t.at)} · ${escapeHtml(t.detail)}</div></div>`).join("")
          : `<p class="muted tiny">尚无操作记录</p>`}
        </div>`;
    } else if (state.drawerTab === "judgments") {
      const prefs = DEMO.preferences || [];
      const savedPrefs = prefs.filter((p) => p.saved);
      const pendPrefs = prefs.filter((p) => p.precipitable !== false && !p.saved);
      body.innerHTML = `<h3 style="margin-top:0" data-testid="judgment-archive-title">判断档案</h3>
        <p class="tiny muted">T10 · 结论 / 选项 / 理由 / 依据锚 / 置信</p>
        <div data-testid="pref-list">
        ${savedPrefs.length ? `<div class="tiny" style="font-weight:700;margin:6px 0 4px">已沉淀偏好 · ${savedPrefs.length}</div>` : ""}
        ${savedPrefs.map((pr) => `<div class="trace-item pref-precip pref-saved" data-testid="pref-saved">
          <strong>已沉淀</strong>
          <div class="tiny">${escapeHtml(pr.text)}</div>
          <div class="tiny muted">来自 ${escapeHtml(pr.from || "")}${pr.savedAt ? " · " + escapeHtml(pr.savedAt) : ""}</div>
        </div>`).join("")}
        ${pendPrefs.map((pr) => `<div class="trace-item pref-precip" data-testid="pref-precip">
          <strong>可沉淀为偏好</strong>
          <div class="tiny">${escapeHtml(pr.text)}</div>
          <div class="tiny muted">来自 ${escapeHtml(pr.from || "")}</div>
          <button type="button" class="ghost" data-testid="btn-precip-pref" data-pref-id="${escapeHtml(pr.id)}">写入偏好列表</button>
        </div>`).join("")}
        </div>
        <div data-testid="judgment-archive">
        ${state.judgments.length
          ? state.judgments.map((j) => `<div class="trace-item judgment-item" data-testid="judgment-item">
              <strong>${escapeHtml(j.gate)}</strong>
              <div class="tiny">${escapeHtml(j.at)}</div>
              <div class="tiny"><span class="ec-k">结论</span> ${escapeHtml(j.conclusion)}</div>
              <div class="tiny"><span class="ec-k">选项</span> ${escapeHtml(j.option)}</div>
              <div class="tiny"><span class="ec-k">理由</span> ${escapeHtml(j.reason)}</div>
              ${j.source ? `<div class="tiny"><span class="ec-k">来源</span> ${escapeHtml(j.source)}</div>` : ""}
              ${j.compare ? `<div class="tiny"><span class="ec-k">对比</span> ${escapeHtml(j.compare)}</div>` : ""}
              ${j.confidence ? `<div class="tiny"><span class="ec-k">置信</span> <span class="conf ${confClass(j.confidence)}">${escapeHtml(confLabel(j.confidence))}</span></div>` : ""}
              ${j.evidenceAnchor ? `<div class="tiny muted">依据锚 · ${escapeHtml(j.evidenceAnchor)}</div>` : ""}
              <button type="button" class="linkish" data-testid="judgment-precip" data-j-gate="${escapeHtml(j.gate)}" data-j-conclusion="${escapeHtml((j.conclusion || "").slice(0, 80))}">写入为跨案偏好</button>
            </div>`).join("")
          : `<p class="muted tiny">尚无判断档案 · 硬请示确认后写入</p>`}
        </div>`;
      body.querySelectorAll('[data-testid="btn-precip-pref"]').forEach((b) => {
        b.addEventListener("click", () => {
          const id = b.dataset.prefId;
          const list = DEMO.preferences || (DEMO.preferences = []);
          const pr = list.find((p) => p.id === id);
          if (pr) {
            pr.saved = true;
            pr.precipitable = false;
            pr.savedAt = new Date().toLocaleString("zh-CN", { hour12: false });
          }
          toast("已写入跨案偏好列表（演示）");
          openDrawer("judgments");
        });
      });
      body.querySelectorAll('[data-testid="judgment-precip"]').forEach((b) => {
        b.addEventListener("click", () => {
          const gate = b.dataset.jGate || "判断";
          const conclusion = b.dataset.jConclusion || "";
          const list = DEMO.preferences || (DEMO.preferences = []);
          const nid = "pref-" + Date.now();
          list.unshift({
            id: nid,
            text: `跨案偏好：${gate} · ${conclusion}`.slice(0, 120),
            from: "本次判断档案",
            precipitable: false,
            saved: true,
            savedAt: new Date().toLocaleString("zh-CN", { hour12: false })
          });
          toast("已写入跨案偏好列表（演示）");
          openDrawer("judgments");
        });
      });
    } else {
      body.innerHTML = `<p class="muted tiny">未知页签</p>`;
    }
    body.querySelectorAll("[data-ck-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        const jump = b.dataset.ckJump;
        closeDrawer();
        if (!state.enteredD4) openDept("d4", { direct: true });
        else { state.view = "dept"; render(); }
        requestAnimationFrame(() => {
          const el = document.querySelector(`[data-testid="${jump}"], #${jump}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });
    });
  }

  function render() {
    renderShellTop();
    $$(".view").forEach((v) => v.classList.remove("on"));
    const map = {
      gate: "#viewGate", lobby: "#viewLobby", front: "#viewFront", dept: "#viewDept", workorder: "#viewWO",
      apply: "#viewApply", reply: "#viewReply", thin: "#viewThin", block: "#viewBlock"
    };
    const sel = map[state.view] || (state.gateDone ? "#viewLobby" : "#viewGate");
    $(sel).classList.add("on");
    if (state.view === "gate") renderGate();
    if (state.view === "lobby") renderLobby();
    if (state.view === "front") renderFront();
    if (state.view === "dept") renderDept();
    if (state.view === "workorder") renderWorkOrder();
    if (state.view === "apply") renderApply();
    if (state.view === "reply") renderReply();
    if (state.view === "thin") renderThin();
    if (state.view === "block") renderBlock();
    renderDrawer();
  }

  function bindGlobal() {
    $("#btnBrand").addEventListener("click", () => { if (state.gateDone) goLobby(); });
    const navL = $("#navLobby"); if (navL) navL.addEventListener("click", () => { if (state.gateDone) goLobby(); });
    const navC = $("#navCases"); if (navC) navC.addEventListener("click", () => { if (state.gateDone) openDrawer("materials"); });
    const nfy = $("#btnNotify"); if (nfy) nfy.addEventListener("click", () => toggleShellPanel("notify"));
    const bsch = $("#btnSchedule"); if (bsch) bsch.addEventListener("click", () => toggleShellPanel("schedule"));
    const bss = $("#btnShellSearch"); if (bss) bss.addEventListener("click", () => toggleShellPanel("search"));
    const bcs = $("#btnCaseSwitch"); if (bcs) bcs.addEventListener("click", () => toggleShellPanel("cases"));
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (!state.gateDone) return;
        e.preventDefault();
        toggleShellPanel("search");
      }
      if (e.key === "Escape") closeShellPanel();
    });
    $$(".role-toggle .role").forEach((b) => b.addEventListener("click", () => {
      state.role = b.dataset.role; renderShellTop(); toast(state.role === "agency" ? "已切代理所视角（演示）" : "已切企业研发视角（演示）");
    }));
    $$("#gateIds .gate-id").forEach((b) => b.addEventListener("click", () => { state.role = b.dataset.role; renderGate(); }));
    $$(".gate-mode .gm").forEach((b) => b.addEventListener("click", () => { state.demoMode = b.dataset.mode; renderGate(); }));
    const ge = $("#btnGateEnter"); if (ge) ge.addEventListener("click", enterFromGate);
    $("#caseChip").addEventListener("click", () => openDrawer("materials"));
    $("#btnFront").addEventListener("click", () => {
      const ei = $("#entrustInput");
      if (ei && ei.value.trim()) addTrace("委托前台", ei.value.trim().slice(0, 80));
      openFront();
    });
    const fl = $("#btnFrontLobby"); if (fl) fl.addEventListener("click", goLobby);
    const ld4 = $("#btnLobbyD4"); if (ld4) ld4.addEventListener("click", () => openDept("d4", { direct: true }));
    $$("[data-goal]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.goal;
      if (id === "d4") openDept("d4", { direct: true });
      else if (id === "d5") openDept("d5");
      else if (id === "d6") { state.view = "reply"; render(); }
    }));
    $("#btnDeptLobby").addEventListener("click", goLobby);
    const cs = $("#btnComposerSend");
    if (cs) cs.addEventListener("click", sendComposerDemo);
    const ci = $("#composerInput");
    if (ci) ci.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendComposerDemo(); }
    });
    $("#drawerClose").addEventListener("click", closeDrawer);
    $("#drawerBackdrop").addEventListener("click", closeDrawer);
    $$("[data-dtab]").forEach((b) => b.addEventListener("click", () => { state.drawerTab = b.dataset.dtab; renderDrawer(); }));
    window.__SAMPLE__ = {
      state, loadSample, confirmDestination, enterConfirmedDept, makeAllGreen, resolveYellowQc,
      confirmFact, confirmCanHand5, openWorkOrder, openDept, openDrawer, goLobby, openFront, render, closeDrawer,
      focusExpert, revealExpertOutput, sendComposerDemo, goLobbyTodo, enterFromGate,
      switchParallelCase, toggleShellPanel, closeShellPanel, setDensityMode, dismissMentor, insertAtMaterial, inviteExpert, gateGrade
    };
  }

  bindGlobal();
  render();
})();
