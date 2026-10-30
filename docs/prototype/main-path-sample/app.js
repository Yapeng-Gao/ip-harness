(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const state = {
    view: "lobby",
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
    reply: { strategyOk: false, limitOk: false, submit: false },
    drawerOpen: false,
    drawerTab: "materials",
    activeExpert: "writer",
    traces: [],
    toastTimer: null,
    thinDept: null,
    blockReason: null
  };

  function deptById(id) { return DEMO.depts.find((d) => d.id === id); }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove("on"), 2200);
  }

  function addTrace(title, detail) {
    state.traces.unshift({
      at: new Date().toLocaleString("zh-CN", { hour12: false }),
      title,
      detail
    });
  }

  function goLobby() { state.view = "lobby"; render(); }

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
        render();
        return;
      }
      state.view = "block";
      state.blockReason = "b2";
      render();
      return;
    }

    if (id === "d6") { state.view = "reply"; render(); return; }

    if (d.thin) {
      state.view = "thin";
      state.thinDept = id;
      render();
      return;
    }

    if (id === "d4") {
      if (!opts.direct && !state.destinationConfirmed && !state.enteredD4) {
        toast("请先经前台确认去向，或从工作台「直达交底部」进入（B1）");
        return;
      }
      state.enteredD4 = true;
      state.caseOpen = true;
      state.caseName = state.caseName || "电机冷却结构 · 交底案";
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
      state.caseName = "电机冷却结构 · 待分诊";
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
      state.caseName = state.caseName || "用户上传材料 · 待分诊";
      addTrace("前台分析", "用户上传材料已分析");
      render();
    }, 900);
  }

  function confirmDestination(deptId) {
    state.destinationConfirmed = true;
    state.confirmedDept = deptId;
    state.fdStep = "f4";
    state.caseName = "电机冷却结构 · 交底案";
    addTrace("硬请示·确认去向", `用户确认先去 ${deptById(deptId).name}`);
    render();
  }

  function enterConfirmedDept() {
    if (!state.destinationConfirmed) {
      toast("未确认去向，不能领进部门");
      return;
    }
    openDept(state.confirmedDept || "d4", { fromFront: true });
  }

  function makeAllGreen() {
    DEMO.disclosure.qc.forEach((q) => (q.status = "green"));
    state.allGreen = true;
    toast("质检已全绿（仍须单独确认「可交⑤」）");
    render();
  }

  function confirmFact() {
    state.factConfirmed = true;
    addTrace("硬请示·事实确认", "用户确认交底事实无误");
    toast("事实已确认");
    render();
  }

  function confirmCanHand5() {
    if (!state.allGreen) { toast("交底尚未全绿，不能确认可交⑤"); return; }
    if (!state.factConfirmed) { toast("请先完成事实确认"); return; }
    state.canHand5 = true;
    addTrace("硬请示·可交⑤", "用户确认可交申请部（全绿 ≠ 已交⑤）");
    toast("已确认可交⑤ — 可开④→⑤工单");
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

  function renderShellTop() {
    const chip = $("#caseChip");
    if (state.caseOpen && state.caseName) {
      chip.classList.remove("empty");
      chip.innerHTML = `<strong>案卷</strong><span>${escapeHtml(state.caseName)}</span>`;
    } else {
      chip.classList.add("empty");
      chip.innerHTML = `<span>暂无打开案卷</span>`;
    }
  }

  function renderLobby() {
    const todos = [];
    if (state.destinationConfirmed && !state.enteredD4) {
      todos.push({ kind: "a", text: "前台：去向已确认，待领进交底部", action: () => openFront() });
    }
    if (state.enteredD4 && !state.factConfirmed) {
      todos.push({ kind: "a", text: "交底部：待你确认交底事实", action: () => openDept("d4", { direct: true }) });
    } else if (state.enteredD4 && state.allGreen && !state.canHand5) {
      todos.push({ kind: "a", text: "交底部：全绿后待你拍「可交⑤」", action: () => openDept("d4", { direct: true }) });
    } else if (state.canHand5 && !state.workOrderOpened) {
      todos.push({ kind: "c", text: "进行中：可开④→⑤工单", action: () => openDept("d4", { direct: true }) });
    }
    if (!todos.length) todos.push({ kind: "c", text: "暂无待确认事项", action: null });

    $("#todoList").innerHTML = todos.map((t, i) => `<li>
        <span class="badge ${t.kind}">${t.kind === "a" ? "待你拍" : t.kind === "b" ? "催办" : "进行中"}</span>
        <div><div>${escapeHtml(t.text)}</div>${t.action ? `<button class="ghost tiny" data-todo-go="${i}" style="margin-top:6px;padding:4px 8px">去处理</button>` : ""}</div>
      </li>`).join("");
    $$("[data-todo-go]").forEach((btn) => {
      btn.addEventListener("click", () => { const t = todos[+btn.dataset.todoGo]; if (t && t.action) t.action(); });
    });

    $("#deptWall").innerHTML = DEMO.depts.map((d) => {
      const has = (d.id === "d4" && state.enteredD4 && (!state.factConfirmed || (state.allGreen && !state.canHand5)))
        || (d.id === "d5" && state.canHand5 && !state.apply.submit);
      return `<button class="dept-door ${d.thin ? "thin" : ""} ${has ? "has-todo" : ""}" data-dept="${d.id}" type="button">
          <span class="dot"></span>
          <div class="num">${d.num}</div>
          <strong>${escapeHtml(d.name)}</strong>
          <div class="desc">${escapeHtml(d.desc)}</div>
        </button>`;
    }).join("");
    $$("[data-dept]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.dept;
        if (id === "d4") openDept("d4", { direct: true });
        else openDept(id);
      });
    });

    const bar = $("#caseBarText");
    if (state.caseOpen) {
      bar.textContent = `${state.caseName} · ${state.canHand5 ? "可交⑤已确认" : state.enteredD4 ? "交底进行中" : "待领进"}`;
    } else {
      bar.textContent = "尚无案卷 · 可从前台上传或加载样例";
    }
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
            ${state.analyzing ? `<p style="margin-top:14px;color:var(--brand);font-weight:600" data-testid="analyzing">正在分析材料…</p>` : ""}
            ${state.files.length ? `<div class="file-list">${state.files.map((f) => `<div class="file-row"><strong>${escapeHtml(f.name)}</strong><span class="muted tiny">${escapeHtml(f.type)}</span></div>`).join("")}</div>` : ""}
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
        <div class="analysis-grid" data-testid="f2-analysis">
          <div class="card">
            <h2>分析结果</h2>
            <p class="tiny muted">材料清单 · 置信可见</p>
            <div class="file-list">
              ${state.files.map((f) => `<div class="file-row">
                  <div><strong>${escapeHtml(f.name)}</strong><div class="tiny muted">${escapeHtml(f.type)} · ${escapeHtml(f.summary)}</div></div>
                  <span class="conf ${f.conf === "high" ? "high" : f.conf === "mid" ? "mid" : "low"}">${f.conf === "high" ? "高" : f.conf === "mid" ? "中" : "低"}</span>
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
        </div>`;
      $("#btnToConfirm").addEventListener("click", () => { state.fdStep = "f3"; render(); });
    } else if (state.fdStep === "f3") {
      const main = deptById(DEMO.suggest.main.dept);
      const blocked = !state.destinationConfirmed;
      pane.innerHTML = `
        <div class="card" data-testid="f3-confirm">
          <h2>确认去向</h2>
          <p class="muted">系统建议先去 <strong>${main.num} ${escapeHtml(main.name)}</strong>。未确认前不能领进部门。</p>
          <div class="hard-ask" id="destAsk">
            <div class="label">【硬请示】</div>
            <h3>这次先去交底部，对吗？</h3>
            <p class="tiny">主推理由：${escapeHtml(DEMO.suggest.main.reason)}</p>
            <div class="acts">
              <button type="button" class="ask-confirm" id="btnConfirmDest" data-testid="confirm-dest">确认 · 去交底部</button>
              <button type="button" id="btnAlt5">改去申请部</button>
              <button type="button" class="ghost" id="btnPauseDest">暂停</button>
            </div>
          </div>
          <div class="row-actions">
            <button type="button" id="btnTryEnterEarly" data-testid="try-enter-blocked">尝试进入交底部（应被拦住）</button>
            <button type="button" class="ghost" id="btnBackF2">返回分析结果</button>
          </div>
        </div>`;
      $("#btnConfirmDest").addEventListener("click", () => confirmDestination("d4"));
      $("#btnAlt5").addEventListener("click", () => { toast("已记下你要改去⑤——进部后门槛会挡开写并给退④选项（B3 示意）"); confirmDestination("d4"); });
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
          <div class="row-actions">
            <button type="button" class="primary" id="btnEnterDept" data-testid="enter-d4">进入${escapeHtml(d.name)}</button>
            <button type="button" class="ghost" id="btnBackLobby">回工作台</button>
          </div>
        </div>`;
      $("#btnEnterDept").addEventListener("click", enterConfirmedDept);
      $("#btnBackLobby").addEventListener("click", goLobby);
    }
  }

  function renderDept() {
    const qc = DEMO.disclosure.qc;
    state.allGreen = qc.every((q) => q.status === "green");
    const lineEl = $("#deptLineStatus");
    lineEl.textContent = state.allGreen ? "交底质检全绿" : "未过线 / 质检进行中";
    lineEl.className = "line-status" + (state.allGreen ? " ok" : "");

    $("#roster").innerHTML = DEMO.disclosure.roster.map((e) => {
      const active = state.activeExpert === e.id ? "active" : "";
      const qcCls = e.kind === "qc" ? "qc" : "";
      return `<button type="button" class="expert-chip ${qcCls} ${active}" data-expert="${e.id}">
          <span class="av">${e.av}</span>
          <span><strong>${escapeHtml(e.name)}</strong><div class="st">${escapeHtml(e.role)}${e.busy ? " · " + escapeHtml(e.busy) : ""}</div></span>
        </button>`;
    }).join("");
    $$("[data-expert]").forEach((b) => b.addEventListener("click", () => { state.activeExpert = b.dataset.expert; render(); }));

    const stages = [
      { id: "draft", label: "成稿", done: true },
      { id: "qc", label: "质检循环", done: state.allGreen, on: !state.allGreen },
      { id: "fact", label: "事实确认", done: state.factConfirmed, wait: state.allGreen && !state.factConfirmed },
      { id: "hand", label: "可交⑤", done: state.canHand5, wait: state.allGreen && state.factConfirmed && !state.canHand5 }
    ];
    $("#stageBar").innerHTML = stages.map((s) => {
      let cls = "stage";
      if (s.done) cls += " done";
      else if (s.wait) cls += " wait";
      else if (s.on) cls += " on";
      return `<span class="${cls}">${s.label}</span>`;
    }).join("");

    $("#docMain").innerHTML = `
      <div class="doc-body" data-testid="d4-main">
        <h3>${escapeHtml(DEMO.disclosure.title)}</h3>
        <p class="tiny muted">主产出全文区 · 非聊天碎片</p>
        ${DEMO.disclosure.sections.map((s) => `<div class="sec"><strong>${escapeHtml(s.h)}</strong><p>${escapeHtml(s.t)}</p></div>`).join("")}
        <div class="qc-card" data-testid="qc-card">
          <strong>质检分卡</strong>
          <div class="tiny muted" style="margin:4px 0 8px">与成稿分卡；全绿 ≠ 已交⑤</div>
          ${qc.map((q) => {
            const tag = q.status === "green" ? '<span class="tag ok">绿</span>' : q.status === "yellow" ? '<span class="tag warn">黄</span>' : '<span class="tag ask">红</span>';
            return `<div class="qc-row"><span>${escapeHtml(q.name)}</span>${tag}</div>`;
          }).join("")}
          ${!state.allGreen
            ? `<div class="row-actions"><button type="button" id="btnAllGreen" class="primary" data-testid="make-green">演示：补齐依据 → 全绿</button></div>`
            : `<div class="tiny" style="color:var(--ok);margin-top:8px;font-weight:600">已全绿 — 请在侧栏分别确认事实与可交⑤</div>`}
        </div>
      </div>`;
    const bg = $("#btnAllGreen");
    if (bg) bg.addEventListener("click", makeAllGreen);

    let asks = "";
    if (!state.factConfirmed) {
      asks += `
        <div class="hard-ask" data-testid="ask-fact">
          <div class="label">【硬请示】</div>
          <h3>确认交底事实</h3>
          <p class="tiny">技术方案与效果描述是否与你所知一致？</p>
          <div class="acts">
            <button type="button" class="ask-confirm" id="btnFact" data-testid="confirm-fact">确认事实</button>
            <button type="button">还要改</button>
            <button type="button" class="ghost">暂停</button>
          </div>
        </div>`;
    } else {
      asks += `<div class="hard-ask done"><div class="label">【已确认】</div><h3>交底事实已确认</h3></div>`;
    }
    if (!state.canHand5) {
      const blocked = !state.allGreen || !state.factConfirmed;
      asks += `
        <div class="hard-ask ${blocked ? "blocked-hint" : ""}" data-testid="ask-hand5">
          <div class="label">【硬请示】</div>
          <h3>可否交申请部（⑤）？</h3>
          <p class="tiny">前置：交底质检全绿 + 事实确认。全绿按钮不能代替本确认。</p>
          <div class="acts">
            <button type="button" class="ask-confirm" id="btnHand5" data-testid="confirm-hand5" ${blocked ? "disabled" : ""}>确认可交⑤</button>
            <button type="button" class="ghost">暂不交</button>
          </div>
          ${blocked ? `<p class="tiny" style="margin-top:8px;color:var(--ask)">尚未满足：${!state.allGreen ? "未全绿 " : ""}${!state.factConfirmed ? "未事实确认" : ""}</p>` : ""}
        </div>`;
    } else {
      asks += `<div class="hard-ask done"><div class="label">【已确认】</div><h3>可交⑤ — 尚未等于已开工单</h3>
        <div class="acts"><button type="button" class="primary" id="btnOpenWO" data-testid="open-wo">开④→⑤工单</button></div>
      </div>`;
    }
    $("#sideAsks").innerHTML = asks;
    const bf = $("#btnFact"); if (bf) bf.addEventListener("click", confirmFact);
    const bh = $("#btnHand5"); if (bh) bh.addEventListener("click", confirmCanHand5);
    const wo = $("#btnOpenWO"); if (wo) wo.addEventListener("click", openWorkOrder);
    $("#feed").innerHTML = DEMO.disclosure.feed.map((b) => `<div class="bubble"><div class="who">${escapeHtml(b.who)}</div>${escapeHtml(b.text)}</div>`).join("");
  }

  function renderWorkOrder() {
    $("#woBody").innerHTML = `
      <div class="wo-card" data-testid="h45">
        <span class="tag ask">工单 · 现在做⑤</span>
        <h2>④ → ⑤ 交办工单</h2>
        <p class="muted">打包方＝交底部负责人；接单方＝申请部负责人。旁注三线分词。</p>
        <div class="wo-meta">
          <div><label>打包方</label>交底部负责人</div>
          <div><label>接单方</label>申请部负责人</div>
          <div><label>④ 合格线</label><span class="tag ok">交底已全绿</span></div>
          <div><label>⑤ 合格线</label><span class="tag warn">申请尚未过线</span></div>
        </div>
        <p class="tiny">结束检查表摘要：事实已确认 · 可交⑤已确认 · 材料包已列。</p>
        <div class="row-actions">
          <button type="button" class="primary" id="btnAcceptWO" data-testid="accept-wo">申请部接单进入</button>
          <button type="button" id="btnBackD4">返回交底部</button>
          <button type="button" class="ghost" id="btnWoLobby">回工作台</button>
        </div>
      </div>`;
    $("#btnAcceptWO").addEventListener("click", () => openDept("d5", { fromWorkOrder: true }));
    $("#btnBackD4").addEventListener("click", () => openDept("d4", { direct: true }));
    $("#btnWoLobby").addEventListener("click", goLobby);
  }

  function renderApply() {
    const a = state.apply;
    $("#applyBody").innerHTML = `
      <div class="dept-top" style="margin:-20px -20px 16px;border-radius:0">
        <button type="button" class="ghost" id="btnApplyBack">← 工作台</button>
        <h1>⑤ 申请部</h1>
        <span class="line-status ${a.overLine ? "ok" : ""}">${a.overLine ? "申请文件可递交（过线）" : "未过线 / 进行中"}</span>
        <button type="button" id="btnApplyDoc">案卷</button>
      </div>
      <div class="card" data-testid="d5-gates">
        <h2>关键闸（样机）</h2>
        <p class="muted">撰写帧示意；硬请示与过线分离。</p>
        <div class="hard-ask ${a.understand ? "done" : ""}">
          <div class="label">【硬请示】</div>
          <h3>理解确认</h3>
          <p class="tiny">${escapeHtml(DEMO.apply.understand)}</p>
          <div class="acts">${a.understand ? "<span class='tag ok'>已确认理解</span>" : `<button type="button" class="ask-confirm" id="btnUnd">确认理解</button>`}</div>
        </div>
        <div class="hard-ask ${a.applyOrNot ? "done" : ""}">
          <div class="label">【硬请示】</div>
          <h3>申不申？</h3>
          <div class="acts">${a.applyOrNot ? `<span class="tag ok">已拍：${a.applyOrNot === "yes" ? "申请" : "不申结案"}</span>` : `<button type="button" class="ask-confirm" id="btnYes">申请</button><button type="button" id="btnNo">不申（B5）</button>`}</div>
        </div>
        <div class="qc-card">
          <strong>撰写示意</strong>
          <p class="tiny">${escapeHtml(DEMO.apply.claimsHint)}</p>
          <p class="tiny">${escapeHtml(DEMO.apply.specHint)}</p>
          ${!a.overLine ? `<button type="button" id="btnOver" ${a.applyOrNot === "yes" && a.understand ? "" : "disabled"}>演示：质检过线</button>` : `<span class="tag ok">已过线</span> <span class="tiny muted">过线 ≠ 确认递交</span>`}
        </div>
        <div class="hard-ask ${a.submit ? "done" : ""}">
          <div class="label">【硬请示】</div>
          <h3>确认递交</h3>
          <div class="acts">${a.submit ? `<span class="tag ok">已确认递交（演示）</span>` : `<button type="button" class="ask-confirm" id="btnSubmit" ${a.overLine ? "" : "disabled"}>确认递交</button>`}</div>
        </div>
        <div class="row-actions"><button type="button" id="btnToReply">有 OA 时 → ⑥答复</button></div>
      </div>`;
    $("#btnApplyBack").addEventListener("click", goLobby);
    $("#btnApplyDoc").addEventListener("click", () => openDrawer());
    const u = $("#btnUnd"); if (u) u.addEventListener("click", () => { state.apply.understand = true; addTrace("硬请示·理解确认", "⑤"); render(); });
    const y = $("#btnYes"); if (y) y.addEventListener("click", () => { state.apply.applyOrNot = "yes"; addTrace("硬请示·申不申", "申请"); render(); });
    const n = $("#btnNo"); if (n) n.addEventListener("click", () => { state.apply.applyOrNot = "no"; addTrace("硬请示·申不申", "不申结案 · 不出申请号"); toast("不申结案（B5）· 不生成申请号"); render(); });
    const o = $("#btnOver"); if (o) o.addEventListener("click", () => { state.apply.overLine = true; render(); });
    const s = $("#btnSubmit"); if (s) s.addEventListener("click", () => { state.apply.submit = true; addTrace("硬请示·确认递交", "⑤"); toast("已确认递交（演示）"); render(); });
    $("#btnToReply").addEventListener("click", () => { state.view = "reply"; render(); });
  }

  function renderReply() {
    const r = state.reply;
    $("#replyBody").innerHTML = `
      <div class="dept-top" style="margin:-20px -20px 16px;border-radius:0">
        <button type="button" class="ghost" id="btnReplyBack">← 工作台</button>
        <h1>⑥ 答复部</h1>
        <span class="line-status">期限醒目</span>
        <button type="button" id="btnReplyDoc">案卷</button>
      </div>
      <div class="card" data-testid="d6-gates">
        <div style="padding:10px 12px;border-radius:10px;background:var(--warn-soft);border:1px solid #e6c97a;margin-bottom:12px">
          <strong>答复截止：${escapeHtml(DEMO.reply.deadline)}</strong>
          <div class="tiny">超期须升级可见，不可静默。</div>
        </div>
        <h2>关键闸（样机）</h2>
        <p><strong>A 争点（中立）</strong></p>
        <ul>${DEMO.reply.issues.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
        <p class="tiny muted">A→B 不混步定调</p>
        <div class="hard-ask ${r.limitOk ? "done" : ""}">
          <div class="label">【硬请示】</div>
          <h3>重大缩限是否接受？</h3>
          <div class="acts">${r.limitOk ? `<span class="tag ok">已确认策略/缩限</span>` : `<button type="button" class="ask-confirm" id="btnLimit">确认策略</button>`}</div>
        </div>
        <div class="hard-ask ${r.submit ? "done" : ""}">
          <div class="label">【硬请示】</div>
          <h3>确认本轮递交</h3>
          <div class="acts">${r.submit ? `<span class="tag ok">已确认本轮递交</span>` : `<button type="button" class="ask-confirm" id="btnReplySubmit" ${r.limitOk ? "" : "disabled"}>确认递交</button>`}</div>
        </div>
      </div>`;
    $("#btnReplyBack").addEventListener("click", goLobby);
    $("#btnReplyDoc").addEventListener("click", () => openDrawer());
    const bl = $("#btnLimit"); if (bl) bl.addEventListener("click", () => { state.reply.limitOk = true; addTrace("硬请示·重大缩限", "⑥"); render(); });
    const bs = $("#btnReplySubmit"); if (bs) bs.addEventListener("click", () => { state.reply.submit = true; addTrace("硬请示·确认本轮递交", "⑥"); render(); });
  }

  function renderThin() {
    const d = deptById(state.thinDept);
    $("#thinBody").innerHTML = `
      <div class="thin-panel" data-testid="thin-dept">
        <div style="color:var(--brand);font-weight:700">${d.num}</div>
        <h2>${escapeHtml(d.name)}</h2>
        <p class="muted">${escapeHtml(d.desc)}</p>
        <div class="sep"></div>
        <p><strong>本部门合格线：</strong>${escapeHtml(d.line)}</p>
        <p class="tiny muted">样机薄部：进得去 + 合格线一句话；不做细作业。</p>
        <div class="row-actions" style="justify-content:center">
          <button type="button" class="primary" id="btnThinLobby">回工作台</button>
        </div>
      </div>`;
    $("#btnThinLobby").addEventListener("click", goLobby);
  }

  function renderBlock() {
    $("#blockBody").innerHTML = `
      <div class="block-panel" data-testid="b2-block">
        <h2>进入门槛未过</h2>
        <p>要进申请部，需要合格交底（④全绿）并完成「可交⑤」与工单接单。</p>
        <p class="tiny">当前：无交底冲⑤会被挡回（B2）。</p>
        <div class="row-actions" style="justify-content:center">
          <button type="button" class="primary" id="btnBlockTo4">去交底部</button>
          <button type="button" id="btnBlockLobby">回工作台</button>
          <button type="button" class="ghost" id="btnBlockFront">找前台</button>
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
    $$("[data-dtab]").forEach((b) => b.classList.toggle("on", b.dataset.dtab === state.drawerTab));
    const body = $("#drawerBody");
    if (state.drawerTab === "materials") {
      const files = state.files.length ? state.files : DEMO.sampleFiles;
      body.innerHTML = `<h3 style="margin-top:0">材料</h3>
        ${files.map((f) => `<div class="trace-item"><strong>${escapeHtml(f.name)}</strong><div class="tiny muted">${escapeHtml(f.type)} · ${escapeHtml(f.summary || "")}</div></div>`).join("")}
        <div class="trace-item"><strong>缺口</strong><div class="tiny muted">${DEMO.suggest.gaps.map(escapeHtml).join("；")}</div></div>`;
    } else if (state.drawerTab === "checklist") {
      body.innerHTML = `<h3 style="margin-top:0">检查表</h3>
        <div class="trace-item"><strong>进入检查表（④）</strong><div class="tiny">技术说明 ✓ · 图纸 ✓ · 目标写交底 ✓</div></div>
        <div class="trace-item"><strong>结束检查表（④）</strong><div class="tiny">全绿 ${state.allGreen ? "✓" : "…"} · 事实 ${state.factConfirmed ? "✓" : "…"} · 可交⑤ ${state.canHand5 ? "✓" : "…"}</div></div>`;
    } else if (state.drawerTab === "orders") {
      body.innerHTML = `<h3 style="margin-top:0">工单</h3>
        <div class="trace-item"><strong>前台领进</strong><div class="tiny muted">接待专家交办材料 → 交底部负责人</div></div>
        ${state.workOrderOpened
          ? `<div class="trace-item"><strong>现在做⑤</strong><div class="tiny">打包方：交底部负责人 · 接单：申请部负责人</div></div>`
          : `<div class="trace-item muted"><strong>④→⑤</strong><div class="tiny">尚未开单</div></div>`}`;
    } else {
      body.innerHTML = `<h3 style="margin-top:0">判断痕迹</h3>
        ${state.traces.length
          ? state.traces.map((t) => `<div class="trace-item"><strong>${escapeHtml(t.title)}</strong><div class="tiny muted">${escapeHtml(t.at)} · ${escapeHtml(t.detail)}</div></div>`).join("")
          : `<p class="muted tiny">尚无硬请示记录</p>`}`;
    }
  }

  function render() {
    renderShellTop();
    $$(".view").forEach((v) => v.classList.remove("on"));
    const map = {
      lobby: "#viewLobby", front: "#viewFront", dept: "#viewDept", workorder: "#viewWO",
      apply: "#viewApply", reply: "#viewReply", thin: "#viewThin", block: "#viewBlock"
    };
    $(map[state.view] || "#viewLobby").classList.add("on");
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
    $("#btnBrand").addEventListener("click", goLobby);
    $("#caseChip").addEventListener("click", () => openDrawer("materials"));
    $("#btnFront").addEventListener("click", openFront);
    const fl = $("#btnFrontLobby"); if (fl) fl.addEventListener("click", goLobby);
    $("#btnOpenDoc").addEventListener("click", () => openDrawer());
    $("#btnDeptLobby").addEventListener("click", goLobby);
    $("#btnDeptDoc").addEventListener("click", () => openDrawer());
    $("#drawerClose").addEventListener("click", closeDrawer);
    $("#drawerBackdrop").addEventListener("click", closeDrawer);
    $$("[data-dtab]").forEach((b) => b.addEventListener("click", () => { state.drawerTab = b.dataset.dtab; renderDrawer(); }));
    window.__SAMPLE__ = {
      state, loadSample, confirmDestination, enterConfirmedDept, makeAllGreen,
      confirmFact, confirmCanHand5, openWorkOrder, openDept, openDrawer, goLobby, openFront, render, closeDrawer
    };
  }

  bindGlobal();
  render();
})();
