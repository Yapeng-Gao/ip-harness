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
    reply: { contentionOk: false, limitOk: false, submit: false },
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
      const pill = d.thin
        ? `<span class="pill thin-p">薄 · 合格线</span>`
        : `<span class="pill thick">主链</span>`;
      return `<button class="dept-door ${d.thin ? "thin" : ""} ${has ? "has-todo" : ""}" data-dept="${d.id}" type="button">
          <span class="dot"></span>
          <div class="num">${d.num}</div>
          <strong>${escapeHtml(d.name)}</strong>
          <div class="desc">${escapeHtml(d.desc)}</div>
          <div class="door-foot">${pill}<span>${d.thin ? "进得去" : "可协同"}</span></div>
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

    const lead = DEMO.disclosure.roster.find((e) => e.kind === "lead") || DEMO.disclosure.roster[0];
    const leadBar = $("#leadBar");
    if (leadBar && lead) {
      leadBar.innerHTML = `${avatarHtml(lead.photo, lead.av, "avatar")}
        <div>
          <strong>${escapeHtml(lead.name)}</strong>
          <div class="tiny muted">主持分活与汇报 · 不是前台。专家向你（领导）请示关键结论。</div>
        </div>`;
    }
    $("#roster").innerHTML = DEMO.disclosure.roster.map((e) => {
      const active = state.activeExpert === e.id ? "active" : "";
      const qcCls = e.kind === "qc" ? "qc" : "";
      const idleCls = e.status === "idle" ? "idle" : "";
      const tagCls = e.tag === "协" ? "tag-role sub" : "tag-role";
      const st = e.status || "doing";
      return `<button type="button" class="expert-chip ${qcCls} ${idleCls} ${active}" data-expert="${e.id}" title="${escapeHtml(e.role)}">
          ${avatarHtml(e.photo, e.av)}
          <span class="meta">
            <span class="name-row"><strong>${escapeHtml(e.name)}</strong><span class="${tagCls}">${escapeHtml(e.tag || "")}</span></span>
            <span class="status-pill ${st}">${escapeHtml(statusLabel(st))}</span>
            <span class="st">${escapeHtml(e.busy || e.role)}</span>
          </span>
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
    const segA = a.understand ? "done" : "now";
    const segB = !a.understand ? "todo" : (a.applyOrNot ? "done" : "now");
    const segC = a.applyOrNot !== "yes" ? "todo" : (a.submit ? "done" : "now");
    const segCls = (s) => s === "done" ? "seg done" : (s === "now" ? "seg now" : "seg");
    $("#applyBody").innerHTML = `
      <div class="dept-top">
        <button type="button" class="ghost" id="btnApplyBack">← 工作台</button>
        <h1>⑤ 申请部</h1>
        <span class="line-status ${a.overLine ? "ok" : ""}">${a.overLine ? "申请文件可递交（过线）" : "未过线 / 进行中"}</span>
        <div class="shell-spacer"></div>
        <button type="button" id="btnApplyDoc">案卷抽屉</button>
      </div>
      <div class="lead-bar">
        <span class="avatar"><img src="./avatars/05.jpg" alt="" width="40" height="40" /></span>
        <div>
          <strong>申请部负责人</strong>
          <div class="tiny muted">向你汇报 A 理解 → B 申不申 → C 撰写递交；过线 ≠ 确认递交。</div>
        </div>
      </div>
      <div class="apply-layout">
        <div class="main-pane">
          <div class="pane-head"><strong>主产出 · 申请文件（示意）</strong><span class="pane-tag">权项 / 说明书</span></div>
          <div class="pane-body">
            <div class="doc-body">
              <h3>发明专利申请文件（草案）</h3>
              <p class="tiny muted">主栏持有成稿；侧栏分段硬请示驾驭。</p>
              <div class="sec"><strong>独权示意</strong><p>${escapeHtml(DEMO.apply.claimsHint)}</p></div>
              <div class="sec"><strong>说明书示意</strong><p>${escapeHtml(DEMO.apply.specHint)}</p></div>
              <div class="sec"><strong>查新摘要</strong><p>${escapeHtml(DEMO.apply.noveltyHint)}</p></div>
            </div>
            <div class="qc-card" style="margin-top:12px">
              <strong>C 段 · 质检过线</strong>
              <div class="tiny muted" style="margin:4px 0 8px">过线只证明「文件可递交」，须另点确认递交。</div>
              ${!a.overLine
                ? `<button type="button" id="btnOver" data-testid="make-overline" ${a.applyOrNot === "yes" && a.understand ? "" : "disabled"}>演示：质检过线</button>`
                : `<span class="tag ok">已过线</span> <span class="tiny muted">过线 ≠ 确认递交</span>`}
            </div>
          </div>
        </div>
        <div class="side-pane">
          <div class="pane-head"><strong>关键闸 · A / B / C</strong><span class="pane-tag">硬请示</span></div>
          <div class="pane-body">
            <div data-testid="d5-gates">
              <div class="abc-strip" data-testid="d5-abc">
                <div class="${segCls(segA)}" data-testid="seg-a"><span class="seg-k">A</span>理解${a.understand ? " · 已确认" : " · 待你确认"}</div>
                <div class="${segCls(segB)}" data-testid="seg-b"><span class="seg-k">B</span>查新·申不申${a.applyOrNot === "yes" ? " · 要申" : a.applyOrNot === "no" ? " · 不申" : a.understand ? " · 待你拍" : ""}</div>
                <div class="${segCls(segC)}" data-testid="seg-c"><span class="seg-k">C</span>撰写递交${a.submit ? " · 已递交确认" : a.overLine ? " · 过线待递交" : a.applyOrNot === "yes" ? " · 撰写中" : ""}</div>
              </div>

              <div class="seg-block" data-testid="block-a">
                <div class="seg-title">A · 理解</div>
                <div class="hard-ask ${a.understand ? "done" : ""}" data-testid="ask-understand">
                  <div class="label">【硬请示】</div>
                  <h3>确认开案理解</h3>
                  <p class="tiny">${escapeHtml(DEMO.apply.understand)}</p>
                  <div class="acts">${a.understand ? "<span class='tag ok'>已确认理解</span>" : `<button type="button" class="ask-confirm" id="btnUnd" data-testid="confirm-understand">确认理解</button>`}</div>
                </div>
              </div>

              <div class="seg-block ${!a.understand ? "dim" : ""}" data-testid="block-b">
                <div class="seg-title">B · 查新·申不申</div>
                <div class="hard-ask ${a.applyOrNot ? "done" : ""} ${!a.understand ? "blocked-hint" : ""}" data-testid="ask-apply-or-not">
                  <div class="label">【硬请示】</div>
                  <h3>申不申？</h3>
                  <p class="tiny">A 未确认前本钮不可用。</p>
                  <div class="acts">${a.applyOrNot ? `<span class="tag ok">已拍：${a.applyOrNot === "yes" ? "申请" : "不申结案"}</span>` : `<button type="button" class="ask-confirm" id="btnYes" data-testid="confirm-apply-yes" ${a.understand ? "" : "disabled"}>申请</button><button type="button" id="btnNo" data-testid="confirm-apply-no" ${a.understand ? "" : "disabled"}>不申（B5）</button>`}</div>
                </div>
              </div>

              <div class="seg-block ${a.applyOrNot !== "yes" ? "dim" : ""}" data-testid="block-c">
                <div class="seg-title">C · 撰写递交</div>
                <div class="hard-ask ${a.submit ? "done" : ""} ${!a.overLine ? "blocked-hint" : ""}" data-testid="ask-submit5">
                  <div class="label">【硬请示】</div>
                  <h3>确认递交</h3>
                  <p class="tiny">须先过线；本钮与过线分离。</p>
                  <div class="acts">${a.submit ? `<span class="tag ok">已确认递交（演示）</span>` : `<button type="button" class="ask-confirm" id="btnSubmit" data-testid="confirm-submit5" ${a.overLine ? "" : "disabled"}>确认递交</button>`}</div>
                </div>
              </div>

              <div class="row-actions"><button type="button" id="btnToReply" data-testid="to-reply">有 OA 时 → ⑥答复</button></div>
            </div>
          </div>
        </div>
      </div>`;
    $("#btnApplyBack").addEventListener("click", goLobby);
    $("#btnApplyDoc").addEventListener("click", () => openDrawer());
    const u = $("#btnUnd"); if (u) u.addEventListener("click", () => { state.apply.understand = true; addTrace("硬请示·理解确认", "⑤ A"); render(); });
    const y = $("#btnYes"); if (y) y.addEventListener("click", () => {
      if (!state.apply.understand) return;
      state.apply.applyOrNot = "yes"; addTrace("硬请示·申不申", "申请"); render();
    });
    const n = $("#btnNo"); if (n) n.addEventListener("click", () => {
      if (!state.apply.understand) return;
      state.apply.applyOrNot = "no"; addTrace("硬请示·申不申", "不申结案 · 不出申请号"); toast("不申结案（B5）· 不生成申请号"); render();
    });
    const o = $("#btnOver"); if (o) o.addEventListener("click", () => {
      if (!(state.apply.applyOrNot === "yes" && state.apply.understand)) return;
      state.apply.overLine = true; addTrace("⑤过线", "申请文件可递交（过线）≠ 已确认递交"); render();
    });
    const s = $("#btnSubmit"); if (s) s.addEventListener("click", () => {
      if (!state.apply.overLine) return;
      state.apply.submit = true; addTrace("硬请示·确认递交", "⑤ C"); toast("已确认递交（演示·非 Toast 代替硬请示）"); render();
    });
    $("#btnToReply").addEventListener("click", () => { state.view = "reply"; render(); });
  }

  function renderReply() {
    const r = state.reply;
    $("#replyBody").innerHTML = `
      <div class="dept-top">
        <button type="button" class="ghost" id="btnReplyBack">← 工作台</button>
        <h1>⑥ 答复部</h1>
        <span class="line-status">本轮答复进行中</span>
        <div class="shell-spacer"></div>
        <button type="button" id="btnReplyDoc">案卷抽屉</button>
      </div>
      <div class="lead-bar">
        <span class="avatar"><img src="./avatars/06.jpg" alt="" width="40" height="40" /></span>
        <div>
          <strong>答复部负责人</strong>
          <div class="tiny muted">争点理解 → 策略/缩限 → 本轮递交；期限醒目，不可静默超期。</div>
        </div>
      </div>
      <div class="reply-layout">
        <div class="main-pane">
          <div class="pane-head"><strong>主产出 · 答复稿（示意）</strong><span class="pane-tag">本轮 D</span></div>
          <div class="pane-body">
            <div class="deadline-banner">
              <strong>答复截止：${escapeHtml(DEMO.reply.deadline)}</strong>
              <div class="tiny">超期须升级可见，不可静默。</div>
            </div>
            <div class="doc-body">
              <h3>审查意见答复书（草案）</h3>
              <p class="tiny muted">主栏持有答复成稿；侧栏硬请示分步确认。</p>
              <div class="sec"><strong>争点中立复述</strong><p>${escapeHtml(DEMO.reply.contention)}</p></div>
              <div class="sec"><strong>审查员意见要点</strong><ul>${DEMO.reply.issues.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></div>
            </div>
          </div>
        </div>
        <div class="side-pane">
          <div class="pane-head"><strong>关键闸</strong><span class="pane-tag">硬请示</span></div>
          <div class="pane-body">
            <div data-testid="d6-gates">
              <div class="seg-block" data-testid="block-a6">
                <div class="seg-title">A · 争点（中立）</div>
                <div class="hard-ask ${r.contentionOk ? "done" : ""}" data-testid="ask-contention">
                  <div class="label">【硬请示】</div>
                  <h3>审查意见理解是否如此？</h3>
                  <p class="tiny">${escapeHtml(DEMO.reply.contention)}</p>
                  <div class="acts">${r.contentionOk ? `<span class="tag ok">争点理解已确认</span>` : `<button type="button" class="ask-confirm" id="btnContention" data-testid="confirm-contention">确认争点理解</button>`}</div>
                </div>
              </div>
              <div class="seg-block ${!r.contentionOk ? "dim" : ""}" data-testid="block-b6">
                <div class="seg-title">B · 策略 / 重大缩限</div>
                <div class="hard-ask ${r.limitOk ? "done" : ""} ${!r.contentionOk ? "blocked-hint" : ""}" data-testid="ask-limit">
                  <div class="label">【硬请示】</div>
                  <h3>重大缩限是否接受？</h3>
                  <p class="tiny">A 未确认前不可定调策略。</p>
                  <div class="acts">${r.limitOk ? `<span class="tag ok">已确认策略/缩限</span>` : `<button type="button" class="ask-confirm" id="btnLimit" data-testid="confirm-limit" ${r.contentionOk ? "" : "disabled"}>确认策略</button>`}</div>
                </div>
              </div>
              <div class="seg-block ${!r.limitOk ? "dim" : ""}">
                <div class="seg-title">C/D · 起草与本轮递交</div>
                <div class="hard-ask ${r.submit ? "done" : ""} ${!r.limitOk ? "blocked-hint" : ""}" data-testid="ask-reply-submit">
                  <div class="label">【硬请示】</div>
                  <h3>确认本轮递交</h3>
                  <div class="acts">${r.submit ? `<span class="tag ok">已确认本轮递交</span>` : `<button type="button" class="ask-confirm" id="btnReplySubmit" data-testid="confirm-reply-submit" ${r.limitOk ? "" : "disabled"}>确认递交</button>`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    $("#btnReplyBack").addEventListener("click", goLobby);
    $("#btnReplyDoc").addEventListener("click", () => openDrawer());
    const bc = $("#btnContention"); if (bc) bc.addEventListener("click", () => { state.reply.contentionOk = true; addTrace("硬请示·争点理解", "⑥ A"); render(); });
    const bl = $("#btnLimit"); if (bl) bl.addEventListener("click", () => {
      if (!state.reply.contentionOk) return;
      state.reply.limitOk = true; addTrace("硬请示·重大缩限", "⑥ B"); render();
    });
    const bs = $("#btnReplySubmit"); if (bs) bs.addEventListener("click", () => {
      if (!state.reply.limitOk) return;
      state.reply.submit = true; addTrace("硬请示·确认本轮递交", "⑥"); render();
    });
  }

  function renderThin() {
    const d = deptById(state.thinDept);
    $("#thinBody").innerHTML = `
      <div class="thin-panel" data-testid="thin-dept">
        <div class="avatar" style="margin:0 auto 8px;width:48px;height:48px;font-size:16px">${d.num}</div>
        <h2>${escapeHtml(d.name)}</h2>
        <p class="muted">${escapeHtml(d.desc)}</p>
        <div class="sep"></div>
        <p style="text-align:left"><strong>进得去：</strong>本部门门可从大厅点入（样机薄占位）。</p>
        <p style="text-align:left"><strong>本部门合格线：</strong>${escapeHtml(d.line)}</p>
        <p class="ban-line" data-testid="thin-ban"><strong>禁超卖：</strong>${escapeHtml(d.ban || "一期不做细作业；勿超卖能力")}</p>
        <p class="tiny muted">一期薄部：进得去 + 合格线一句话 + 禁超卖；不做细作业。</p>
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
    const ld4 = $("#btnLobbyD4"); if (ld4) ld4.addEventListener("click", () => openDept("d4", { direct: true }));
    $$("[data-goal]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.goal;
      if (id === "d4") openDept("d4", { direct: true });
      else if (id === "d5") openDept("d5");
      else if (id === "d6") { state.view = "reply"; render(); }
    }));
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
