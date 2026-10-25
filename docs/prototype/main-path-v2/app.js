/* main-path-v2 · thin entry · delegation · tiers · snapshot */
(function () {
  const DEPTS = {
    disclosure: {
      id: 'disclosure', name: '交底部', code: '00', deliverable: '技术交底书 V3',
      pitch: '访谈与事实齐套后，交出可接力的技术交底书。',
      missing: '权属声明', check: ['技术方案完整', '技术效果可验证', '替代实施方式', '权属声明'],
      experts: ['技术访谈专家', '交底书撰写专家'],
      pendingTitle: '确认交底书可接力',
      pendingFact: '权属是否归澄明科技，且无职务发明争议？',
      pendingDetail: '影响交底书是否可作为申请文件部输入；确认后形成交付快照。',
      confirmType: '技术事实', next: 'research'
    },
    research: {
      id: 'research', name: '查新部', code: '01', deliverable: '可专利性检索报告 R2',
      pitch: '检索、比对、结论稿齐套，再谈能不能申请。',
      missing: '结论稿', check: ['检索式与范围', '证据来源核验', '特征比对表', '结论稿'],
      experts: ['检索分析专家'],
      pendingTitle: '确认查新结论可立项',
      pendingFact: '结论稿是否覆盖拟申请核心特征组合？',
      pendingDetail: '确认后立项部可读取检索结论与证据表，不会自动对外递交。',
      confirmType: '专业复核', next: 'intake'
    },
    intake: {
      // alias: decision → intake
      id: 'intake', name: '立项部', code: '02', deliverable: '立项决议与报价单',
      pitch: '策略、报价与决议齐套，值不值得推由你拍板。',
      missing: '决议签署', check: ['保护策略建议', '费用与周期', '申请类型建议', '决议签署'],
      experts: ['布局策略专家', '顾言 · 知产负责人'],
      pendingTitle: '确认立项决议',
      pendingFact: '是否按发明申请推进，并接受当前报价与周期？',
      pendingDetail: '签署后撰写部接手；未签署不启动撰写任务。',
      confirmType: '商业与风险决策', next: 'draft'
    },
    draft: {
      id: 'draft', name: '撰写部', code: '03', deliverable: '权利要求草案 V1',
      pitch: '权利要求与说明书层次清楚，写成可递交的文本。',
      missing: '权项树', check: ['独立权利要求', '从属层次', '说明书同步', '权项树'],
      experts: ['权利要求专家', '说明书撰写专家'],
      pendingTitle: '确认保护范围',
      pendingFact: '独权是否覆盖 MP-300 量产控制方案？',
      pendingDetail: '确认后附图部与质检可接力；不代表同意递交。',
      confirmType: '专业复核', next: 'figure'
    },
    figure: {
      id: 'figure', name: '附图部', code: '04', deliverable: '附图包 F2',
      pitch: '流程图、结构图与图号，和说明书对齐后交卷。',
      missing: '图号核对', check: ['流程图齐全', '结构图标注', '说明书引用一致', '图号核对'],
      experts: ['附图绘制专家'],
      pendingTitle: '确认附图可并入申请包',
      pendingFact: '图号与说明书引用是否一致？',
      pendingDetail: '确认后进入递交前齐套。',
      confirmType: '专业复核', next: 'filing'
    },
    filing: {
      id: 'filing', name: '递交与程序', code: '05', deliverable: '申请包与递交核查单',
      pitch: '申请包齐套；授权人确认后才对外递交。',
      missing: '授权人确认', check: ['申请文件齐套', '费用与期限', '递交清单', '授权人确认'],
      experts: ['流程事务专家', '期限监控专家'],
      pendingTitle: '确认授权递交',
      pendingFact: '授权人是否确认以当前版本对外递交？',
      pendingDetail: '未获授权人前，系统不执行对外递交。',
      confirmType: '对外交付 / 递交', next: 'oa'
    },
    oa: {
      id: 'oa', name: '审查答复', code: '06', deliverable: '意见陈述书 V2',
      pitch: '策略与争辩齐套；企业确认后代理复核再递。',
      missing: '企业确认意见', check: ['通知书拆解', '修改对照', '创造性争辩', '企业确认意见'],
      experts: ['OA 策略专家', '林岚 · 代理师'],
      pendingTitle: '确认答复策略',
      pendingFact: '企业是否同意有限修改 + 创造性争辩？',
      pendingDetail: '确认后代理师复核再递交；不会自动递交。',
      confirmType: '商业与风险决策', next: null
    },
    /* 更多 · 副线；≠查新部；不入 DEPT_ORDER 主七部 */
    fto: {
      id: 'fto', name: '自由实施部', code: '01b', deliverable: 'FTO 自由实施报告 V1',
      pitch: '上市前排查自由实施风险；副线护航，不挡申请主链。',
      missing: '障碍结论稿', check: ['目标市场与产品范围', '有效权项过滤', '逐要素比对表', '障碍结论稿'],
      experts: ['FTO 比对专家'],
      pendingTitle: '确认上市风险结论',
      pendingFact: '是否接受当前障碍结论与规避建议后再上市？',
      pendingDetail: '副线确认；不自动启动或阻断申请主链递交。',
      confirmType: '商业与风险决策', next: null, more: true
    }
  };

  const DEPT_ORDER = ['disclosure','research','intake','draft','figure','filing','oa'];

  /* Photo-style portraits (local assets) — no letter circles / robot art */
  const PORTRAIT = {
    guyan: 'assets/portraits/guyan.png',
    chen: 'assets/portraits/chen.png',
    expert1: 'assets/portraits/expert1.png',
    expert2: 'assets/portraits/expert2.png',
    expert3: 'assets/portraits/expert3.png',
    expert4: 'assets/portraits/expert4.png',
    expert5: 'assets/portraits/expert5.png',
    expert6: 'assets/portraits/expert6.png'
  };

  function expertMeta(name, idx) {
    const n = name || '';
    let key = 'expert' + ((idx % 6) + 1);
    if (/顾言/.test(n)) key = 'guyan';
    else if (/林岚|代理师/.test(n)) key = 'expert3';
    else if (/访谈/.test(n)) key = 'expert1';
    else if (/撰写|说明书|权利要求/.test(n)) key = 'expert2';
    else if (/检索|FTO|查新/.test(n)) key = 'expert4';
    else if (/布局|报价|策略/.test(n)) key = 'expert5';
    else if (/附图|流程|OA|期限/.test(n)) key = 'expert6';
    const human = /顾言|林岚|代理师/.test(n);
    const status = human ? '等待复核 · 建议稿≠确认' : '本节点任务进行中';
    return { name: n, key, src: PORTRAIT[key] || PORTRAIT.expert1, status, human };
  }

  /* One-line expert tip (建议稿) — not a private chat */
  function expertOneLine(name, dept) {
    const miss = (dept && dept.missing) ? dept.missing : '缺项';
    const n = name || '';
    if (/访谈/.test(n)) return '核对访谈事实是否已写入交卷物关键段。';
    if (/撰写|说明书|权利要求/.test(n)) return '缺「' + miss + '」时先补齐中栏——建议稿 ≠ 确认。';
    if (/检索|FTO|查新/.test(n)) return '结论须覆盖拟申请核心特征后再送下一部。';
    if (/布局|报价|策略/.test(n) && !/OA/.test(n)) return '策略与报价是建议稿，签署前可改。';
    if (/附图|一致性|绘制/.test(n)) return '图号与说明书引用一致后再交卷。';
    if (/流程|期限|事务/.test(n)) return '对外递交前须授权人确认。';
    if (/OA|争辩/.test(n)) return '答复策略须企业确认后再递。';
    if (/顾言/.test(n)) return '商业与风险节点由你拍板；专家只出建议。';
    if (/林岚|代理师/.test(n)) return '代理复核等你齐套；建议稿不能代替确认。';
    return '本岗出建议稿 · 主聊对象仍是本部门执行助手。';
  }

  /* Drawer / generic list: planned staffing; ≤3 upper cap; 0→空态; never pad */
  function renderExperts(names) {
    const list = (names || []).slice(0, 3);
    if (!list.length) return '<p class="experts-empty">本部门暂无专家岗</p>';
    return list.map((e, i) => {
      const m = expertMeta(e, i);
      return '<div class="expert-row">' +
        '<img class="avatar avatar-photo avatar-small" src="' + m.src + '" alt="" width="28" height="28">' +
        '<span><strong>' + m.name + '</strong><small>' + m.status + '</small></span></div>';
    }).join('');
  }

  /* Workbench right-rail experts: avatar+岗名 default; expand = one-line tip; not private chat.
     ≤3 = upper cap only — show planned staffing as-is (0→空态; never pad to 3). */
  function renderRailExperts(names, dept) {
    const list = (names || []).slice(0, 3);
    if (!list.length) {
      return '<p class="experts-empty">本部门暂无专家岗</p>';
    }
    return list.map((e, i) => {
      const m = expertMeta(e, i);
      const parts = m.name.split(/\s*·\s*/);
      const title = parts[0];
      const role = parts[1] || (m.human ? '在岗复核' : '专岗 · 建议稿');
      const tip = expertOneLine(e, dept);
      return '<details class="expert-rail-item">' +
        '<summary>' +
          '<img class="avatar avatar-photo avatar-small" src="' + m.src + '" alt="" width="28" height="28">' +
          '<span><strong>' + title + '</strong><small>' + role + '</small></span>' +
        '</summary>' +
        '<p class="expert-rail-tip">' + tip + '<em>建议稿 · 非私聊</em></p>' +
      '</details>';
    }).join('');
  }

  /* Per-gap next action: open center doc or ask 本部门执行助手 — never checkbox-only */
  function gapActionsFor(item, dept) {
    const primary = dept.deliverable;
    let openDoc = primary;
    let openLabel = '打开中栏文书「' + item + '」';
    let askLabel = '让助手起草「' + item + '」';
    let askText = '请起草「' + item + '」草稿，我好粘贴进中栏。';
    if (item === '权属声明') {
      openDoc = '权属声明';
      openLabel = '打开中栏权属声明补齐';
      askLabel = '让助手起草权属声明';
      askText = '请起草职务发明权属声明草稿，权属归澄明科技，发明人待填。';
    } else if (dept.id === 'disclosure' && /技术方案|技术效果|替代实施/.test(item)) {
      openDoc = '交底书 V3';
      openLabel = '打开中栏交底书「' + item + '」';
    } else if (item === dept.missing) {
      openLabel = '打开中栏文书「' + item + '」';
      askLabel = '让助手起草「' + item + '」';
    }
    return { openDoc: openDoc, openLabel: openLabel, askLabel: askLabel, askText: askText };
  }

  function checklistItemHtml(item, idx, dept) {
    const last = idx === dept.check.length - 1;
    const checked = !last; /* demo: last = current gap */
    const gap = gapActionsFor(item, dept);
    const status = checked ? '已齐' : '缺 · 点下方推进';
    /* Always emit actions so unchecking a done row can re-show 点哪推进 */
    const actions =
      '<span class="gap-actions" data-gap-actions' + (checked ? ' hidden' : '') + '>' +
        '<button type="button" class="gap-act" data-gap-open="' + gap.openDoc.replace(/"/g, '&quot;') + '">' + gap.openLabel + '</button>' +
        '<button type="button" class="gap-act gap-act-ask" data-gap-ask="' + gap.askText.replace(/"/g, '&quot;') + '">' + gap.askLabel + '</button>' +
      '</span>';
    /* div+label: buttons outside <label> so clicks don't toggle checkbox */
    return '<div class="check-row' + (checked ? ' is-done' : ' is-gap') + '">' +
      '<label class="check-main">' +
        '<input type="checkbox"' + (checked ? ' checked' : '') + '>' +
        '<span class="check-body">' +
          '<strong>' + item + '</strong>' +
          '<small class="check-status">' + status + '</small>' +
        '</span>' +
      '</label>' +
      actions +
    '</div>';
  }

  /* Compact ≤3 photo faces + 岗名 — welcome shelf / company dept cards */
  function renderExpertFaces(names) {
    return (names || []).slice(0, 3).map((e, i) => {
      const m = expertMeta(e, i);
      const short = m.name.replace(/\s*·.*$/, '');
      return '<span class="expert-face" title="' + m.name + '">' +
        '<img class="avatar-photo avatar-photo-sm" src="' + m.src + '" alt="" width="28" height="28">' +
        '<em>' + short + '</em></span>';
    }).join('');
  }

  /* Professional capability cards: avatar + name + one-line role */
  function renderProfExperts(names) {
    return (names || []).slice(0, 3).map((e, i) => {
      const m = expertMeta(e, i);
      const parts = m.name.split(/\s*·\s*/);
      const title = parts[0];
      const role = parts[1] || (m.human ? '在岗复核 · 建议稿≠确认' : '本节点专岗 · 出建议稿');
      return '<div class="prof-expert">' +
        '<img class="avatar avatar-photo avatar-small" src="' + m.src + '" alt="" width="32" height="32">' +
        '<span><strong>' + title + '</strong><small>' + role + '</small></span></div>';
    }).join('');
  }

  function wireWelcomeShelf() {
    const grid = document.getElementById('dept-shelf-grid');
    if (!grid) return;
    grid.innerHTML = DEPT_ORDER.map(key => {
      const d = DEPTS[key];
      return '<article class="shelf-card shelf-card-deliverable">' +
        '<span class="shelf-dept">' + d.code + ' · ' + d.name + '</span>' +
        '<h3>' + d.deliverable + '</h3>' +
        '<p>' + (d.pitch || '') + '</p>' +
        '<div class="shelf-experts" aria-label="' + d.name + '专家">' + renderExpertFaces(d.experts) + '</div>' +
        '</article>';
    }).join('');
  }

  function wireCompanyDeptFaces() {
    document.querySelectorAll('[data-dept-open]').forEach(card => {
      const key = card.dataset.deptOpen;
      const dept = DEPTS[key];
      if (!dept) return;
      let faces = card.querySelector('.dept-faces');
      if (!faces) {
        faces = document.createElement('div');
        faces.className = 'dept-faces';
        faces.setAttribute('aria-label', '本部门专家');
        card.appendChild(faces);
      }
      faces.innerHTML = renderExpertFaces(dept.experts);
    });
  }


  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }
  function normalizeDeptId(id) {
    // alias: decision → intake; freedom/fto → 自由实施部（更多）
    if (id === 'decision') return 'intake';
    if (id === 'freedom' || id === 'fto-freedom') return 'fto';
    return id || 'disclosure';
  }
  function deptFromQuery(fallback) {
    return normalizeDeptId(qs('dept') || fallback || 'disclosure');
  }
  function role() {
    return qs('role') || localStorage.getItem('mpv2-role') || 'enterprise';
  }
  function mode() {
    return localStorage.getItem('mpv2-mode') || 'project';
  }
  /* Work-surface pages: 专业 must land on capability page (换面), not densify in place */
  const WORK_PAGES = ['home', 'company', 'cases', 'dept', 'pending', 'delegate', 'case-new'];

  function pendingDeptForRole(r) {
    return (r || role()) === 'agency' ? 'oa' : 'disclosure';
  }
  function gateHref(deptId) {
    const id = normalizeDeptId(deptId || pendingDeptForRole());
    return 'dept.html?dept=' + id + '&gate=1';
  }
  function prevDeptId(deptId) {
    const i = DEPT_ORDER.indexOf(deptId);
    return i > 0 ? DEPT_ORDER[i - 1] : null;
  }
  function nextDeptId(deptId) {
    const d = DEPTS[deptId];
    if (d && d.next) return d.next;
    const i = DEPT_ORDER.indexOf(deptId);
    return i >= 0 && i < DEPT_ORDER.length - 1 ? DEPT_ORDER[i + 1] : null;
  }
  function getSubmitted(deptId) {
    try {
      const all = JSON.parse(sessionStorage.getItem('mpv2-submitted') || '{}');
      return !!all[deptId];
    } catch { return false; }
  }
  function setSubmitted(deptId, on) {
    let all = {};
    try { all = JSON.parse(sessionStorage.getItem('mpv2-submitted') || '{}'); } catch { all = {}; }
    if (on) all[deptId] = true; else delete all[deptId];
    sessionStorage.setItem('mpv2-submitted', JSON.stringify(all));
  }
  function centerDeliverableVisible() {
    const editor = document.getElementById('dept-editor');
    if (!editor) return false;
    const text = (editor.innerText || '').replace(/\s+/g, ' ').trim();
    if (text.length < 40) return false;
    const rect = editor.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 80) return false;
    // Must be in layout (not display:none ancestor)
    return !!(editor.offsetParent || editor.getClientRects().length);
  }
  function rememberLastWork() {
    const page = document.body.dataset.page || '';
    if (WORK_PAGES.indexOf(page) === -1) return;
    const rel = location.pathname.split('/').pop() + location.search;
    // strip role param noise but keep dept/step
    try {
      const u = new URL(rel, location.href);
      u.searchParams.delete('role');
      const clean = u.pathname.split('/').pop() + (u.search || '');
      localStorage.setItem('mpv2-last-work', clean || 'company.html');
    } catch {
      localStorage.setItem('mpv2-last-work', 'company.html');
    }
  }
  function lastWorkHref(fallback) {
    const raw = localStorage.getItem('mpv2-last-work') || '';
    const page = (raw.split('?')[0] || '').replace(/^.*\//, '');
    const base = page.replace('.html', '');
    if (!raw || WORK_PAGES.indexOf(base) === -1) return fallback || 'company.html';
    return raw;
  }
  function hasCase() {
    if (qs('nocase') === '1') return false;
    if (qs('hascase') === '1') return true;
    const v = localStorage.getItem('mpv2-has-case');
    return v === null ? true : v === '1';
  }
  function setHasCase(on) {
    localStorage.setItem('mpv2-has-case', on ? '1' : '0');
    applyHasCaseUI();
  }
  function applyHasCaseUI() {
    const on = hasCase();
    document.documentElement.dataset.hasCase = on ? '1' : '0';
    document.querySelectorAll('[data-home-case]').forEach(el => {
      const want = el.dataset.homeCase; // has | none
      el.classList.toggle('hidden', want === 'has' ? !on : on);
    });
  }
  function withRole(href) {
    const u = new URL(href, location.href);
    u.searchParams.set('role', role());
    return u.pathname.split('/').pop() + u.search + u.hash;
  }

  function applyRoleUI(r) {
    document.documentElement.dataset.role = r;
    document.querySelectorAll('[data-role-label]').forEach(el => {
      el.textContent = r === 'agency' ? '代理所' : '企业研发';
    });
    document.querySelectorAll('.role-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === r);
    });
    document.querySelectorAll('[data-show-role]').forEach(el => {
      el.classList.toggle('hidden', el.dataset.showRole !== r);
    });
    document.querySelectorAll('[data-hide-role]').forEach(el => {
      el.classList.toggle('hidden', el.dataset.hideRole === r);
    });
    document.querySelectorAll('[data-workbench]').forEach(root => {
      root.dataset.mode = r; // legacy alias
      root.classList.toggle('role-enterprise', r === 'enterprise');
      root.classList.toggle('role-agency', r === 'agency');
      // Workbench default = true 3-col (left open); user may fold manually.
      if (document.body.dataset.page === 'dept') syncDeptFold(root);
      // no [data-view] dual-face tabs — ban 文书/协同 dual views
    });
  }
  function setRole(r) {
    localStorage.setItem('mpv2-role', r);
    const u = new URL(location.href);
    u.searchParams.set('role', r);
    history.replaceState(null, '', u.toString());
    applyRoleUI(r);
    applyBellByRole(r);
    document.querySelectorAll('details.avatar-menu[open]').forEach(function (d) { d.open = false; });
  }

  function tierCueLabel(m) {
    if (m === 'studio') return '专业';
    if (m === 'assistant') return '助手';
    return '项目';
  }
  function syncDeptFold(root) {
    if (document.body.dataset.page !== 'dept') return;
    root = root || document.querySelector('[data-workbench]');
    if (!root) return;
    const foldBtn = document.querySelector('[data-fold-left]');
    // Enterprise / project / assistant: default true Cursor 3-col with left tree open.
    // Never auto fold-left; user may still collapse via「收折」.
    const shouldFold = false;
    root.classList.toggle('fold-left', shouldFold);
    if (foldBtn) foldBtn.textContent = shouldFold ? '展开' : '收折';
  }

  function applyModeUI(m) {
    document.documentElement.dataset.mode = m;
    document.documentElement.dataset.tier = m; // alias for screenshots / CSS
    document.body.dataset.mode = m;
    document.querySelectorAll('.mode-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === m);
    });
    document.querySelectorAll('[data-tier-cue]').forEach(el => {
      // outward cue = 专业 (capability page; not density-on-same-page)
      if (m === 'studio') el.textContent = '专业';
      else if (el.classList.contains('inline')) el.textContent = tierCueLabel(m);
      else el.textContent = '';
    });
    // assistant: hide sidebar + dept map (CSS); project: everyday; studio: lands on professional.html
    document.querySelectorAll('[data-show-mode]').forEach(el => {
      const allowed = el.dataset.showMode.split(/\s+/);
      el.classList.toggle('hidden', !allowed.includes(m));
    });
    // Dept: assistant slim tree via CSS; 专业换面不在此加密度
    document.querySelectorAll('[data-tier-workbench]').forEach(wb => {
      wb.classList.toggle('tier-assist', m === 'assistant');
      wb.classList.remove('tier-studio');
      if (document.body.dataset.page === 'dept') syncDeptFold(wb);
    });
  }
  function setMode(m) {
    const page = document.body.dataset.page || '';
    if (m === 'studio' && page !== 'professional') {
      rememberLastWork();
      localStorage.setItem('mpv2-mode', 'studio');
      location.href = withRole('professional.html');
      return;
    }
    if (m !== 'studio' && page === 'professional') {
      localStorage.setItem('mpv2-mode', m);
      if (m === 'assistant') {
        location.href = withRole('home.html');
        return;
      }
      // project: restore last work surface to avoid studio↔pro bounce
      location.href = withRole(lastWorkHref('company.html'));
      return;
    }
    localStorage.setItem('mpv2-mode', m);
    applyModeUI(m);
  }

  /* Leave capability page into project work — always clear studio first */
  function exitProfessional(href) {
    localStorage.setItem('mpv2-mode', 'project');
    location.href = withRole(href || lastWorkHref('company.html'));
  }

  function ensureProfessionalLanding() {
    const page = document.body.dataset.page || '';
    if (mode() === 'studio' && WORK_PAGES.indexOf(page) !== -1) {
      location.replace(withRole('professional.html'));
      return true;
    }
    return false;
  }

  function goWorkDept(deptId) {
    const target = 'dept.html?dept=' + encodeURIComponent(normalizeDeptId(deptId || 'disclosure'));
    localStorage.setItem('mpv2-last-work', target);
    localStorage.setItem('mpv2-mode', 'project');
    location.href = withRole(target);
  }

  function wireProfessionalPage() {
    const grid = document.getElementById('prof-capability-grid');
    if (!grid) return;
    grid.innerHTML = DEPT_ORDER.map(key => {
      const d = DEPTS[key];
      const faces = renderProfExperts(d.experts);
      return '<article class="prof-card" data-dept="' + d.id + '">' +
        '<div class="prof-card-head">' +
          '<span class="prof-code">' + d.code + '</span>' +
          '<h2>' + d.name + '</h2>' +
        '</div>' +
        '<p class="prof-deliverable">交卷物 · ' + d.deliverable + '</p>' +
        '<p class="prof-duty">' + (d.pitch || '') + '</p>' +
        '<div class="prof-experts" aria-label="' + d.name + '专家编制">' + faces + '</div>' +
        '<button type="button" class="btn btn-ink prof-go" data-go-dept="' + d.id + '">去该部干活 →</button>' +
        '</article>';
    }).join('');
    grid.querySelectorAll('[data-go-dept]').forEach(btn => {
      btn.addEventListener('click', () => goWorkDept(btn.dataset.goDept));
    });
    // Legal exits: must setMode(project) before navigating — no studio bounce
    document.querySelectorAll('[data-exit-pro]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const href = a.getAttribute('href') || lastWorkHref('company.html');
        exitProfessional(href);
      });
    });
    document.querySelectorAll('.brand[data-keep-role], .notice-button').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (a.classList.contains('notice-button')) {
          exitProfessional(gateHref(pendingDeptForRole()));
          return;
        }
        exitProfessional(a.getAttribute('href') || 'home.html');
      }, true);
    });
  }

  function toast(text) {
    let el = document.querySelector('.toast-fixed');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast-fixed';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* —— Delegation chain state —— */
  function getDelegation() {
    try { return JSON.parse(sessionStorage.getItem('mpv2-delegation') || 'null'); }
    catch { return null; }
  }
  function setDelegation(obj) {
    sessionStorage.setItem('mpv2-delegation', JSON.stringify(obj));
  }
  function clearDelegation() {
    sessionStorage.removeItem('mpv2-delegation');
  }

  function getSnapshot() {
    try { return JSON.parse(localStorage.getItem('mpv2-snapshot') || 'null'); }
    catch { return null; }
  }
  function setSnapshot(obj) {
    localStorage.setItem('mpv2-snapshot', JSON.stringify(obj));
  }

  function ensureBrandGoal() {
    document.querySelectorAll('a.brand').forEach(function (a) {
      if (a.querySelector('.brand-goal')) return;
      var g = document.createElement('span');
      g.className = 'brand-goal';
      g.textContent = '尽快把专利申下来';
      a.appendChild(g);
    });
  }

  function wireShell() {
    if (qs('role')) localStorage.setItem('mpv2-role', qs('role'));
    if (qs('nocase') === '1') localStorage.setItem('mpv2-has-case', '0');
    if (qs('hascase') === '1') localStorage.setItem('mpv2-has-case', '1');
    ensureBrandGoal();
    applyRoleUI(role());
    applyModeUI(mode());
    applyHasCaseUI();
    document.querySelectorAll('.role-switch button').forEach(btn => {
      btn.addEventListener('click', () => {
        setRole(btn.dataset.role);
        if (document.body.dataset.reloadOnRole === '1') location.reload();
      });
    });
    document.querySelectorAll('.mode-switch button').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    document.querySelectorAll('[data-toggle-has-case]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        setHasCase(!hasCase());
        toast(hasCase() ? '已切换为有进行中案子' : '已切换为暂无案子');
      });
    });
    document.querySelectorAll('[data-toast]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
        toast(el.dataset.toast);
      });
    });
    // rewrite internal links to keep role
    document.querySelectorAll('a[data-keep-role]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        // From capability page, any keep-role nav is a legal exit → project first
        if ((document.body.dataset.page || '') === 'professional') {
          exitProfessional(a.getAttribute('href'));
          return;
        }
        location.href = withRole(a.getAttribute('href'));
      });
    });
    applyBellByRole(role());
    rememberLastWork();
  }

  function applyBellByRole(r) {
    const dept = pendingDeptForRole(r);
    const href = gateHref(dept);
    document.querySelectorAll('a.notice-button').forEach(a => {
      a.setAttribute('href', href);
    });
    // Sidebar 「待你确认 / 客户确认」→ 工作台右栏闸（非独立确认页）
    document.querySelectorAll('nav.main-nav a').forEach(a => {
      const label = (a.textContent || '').trim();
      if (label === '待你确认' || label === '客户确认') {
        a.setAttribute('href', href);
      }
    });
  }

  function wireOneChecklist(box, dept) {
    const pane = box.closest('aside, .right-stack, .gate-box') || box.parentElement;
    let submit = pane ? pane.querySelector('[data-submit-gate]') : null;
    if (!submit) {
      const col = box.closest('.workbench > *, .pane');
      if (col) submit = col.querySelector('[data-submit-gate]');
    }
    if (!submit) submit = document.querySelector('[data-submit-gate]');
    if (!submit) return;
    const labels = () => box.querySelectorAll('input[type=checkbox]');
    function sync() {
      const list = [...labels()];
      const checked = list.filter(i => i.checked).length;
      const all = list.length > 0 && checked === list.length;
      if (all) {
        submit.removeAttribute('disabled');
        submit.classList.remove('is-disabled');
      } else {
        submit.setAttribute('disabled', 'disabled');
        submit.classList.add('is-disabled');
      }
      document.querySelectorAll('[data-check-count]').forEach(count => {
        count.textContent = checked + ' / ' + list.length;
      });
      document.querySelectorAll('[data-missing-live]').forEach(miss => {
        miss.textContent = all ? '齐套完成，可交卷' : ('缺项：' + (dept.missing || '未勾选项'));
      });
      /* Per-row: unchecked → show 点哪推进；checked → hide actions */
      list.forEach(inp => {
        const row = inp.closest('.check-row');
        if (!row) return;
        const actions = row.querySelector('[data-gap-actions]');
        const status = row.querySelector('.check-status');
        const on = inp.checked;
        row.classList.toggle('is-done', on);
        row.classList.toggle('is-gap', !on);
        if (actions) actions.hidden = !!on;
        if (status) status.textContent = on ? '已齐' : '缺 · 点下方推进';
      });
      const hint = document.querySelector('[data-next-hint]');
      if (hint) {
        if (all) {
          hint.innerHTML = '<strong>下一步：</strong>齐套已完成 — 点击右侧「交卷 · 待你确认」，同屏右栏通过/驳回。';
          hint.classList.add('is-ready');
        } else {
          hint.innerHTML = '<strong>下一步：</strong>点缺项下的「打开中栏… / 让助手…」推进，齐套后交卷。';
          hint.classList.remove('is-ready');
        }
      }
    }
    labels().forEach(i => i.addEventListener('change', sync));
    sync();
    submit.addEventListener('click', (e) => {
      e.preventDefault();
      if (submit.hasAttribute('disabled')) return;
      const d = getDelegation();
      if (d) {
        d.step = 'confirm';
        d.dept = dept.id;
        setDelegation(d);
      }
      setSubmitted(dept.id, true);
      revealConfirmRail(dept, { focus: true });
      toast('已交卷 · 请对照中栏交卷物在右栏拍板');
    });
  }

  function wireChecklist(deptKey) {
    const dept = DEPTS[deptKey] || DEPTS.disclosure;
    document.querySelectorAll('[data-checklist]').forEach(box => wireOneChecklist(box, dept));
  }

  function deliverableStubFor(dept) {
    const title = dept.deliverable;
    const bodies = {
      disclosure:
        '<p class="doc-lead">本关交卷物 · 可直接编辑技术方案与关键特征。</p>' +
        '<h2>一、技术领域</h2>' +
        '<p>一种磁驱泵智能控制系统，涉及流量—转速闭环与故障预判，适用于工业磁驱泵产线。</p>' +
        '<h2>二、背景问题</h2>' +
        '<p>现有方案在负载突变时超调明显，且缺少可验证的替代实施方式描述，影响交底齐套与后续查新。</p>' +
        '<h2>三、技术方案</h2>' +
        '<p>1. 双环控制：外环流量、内环转速；采样周期可配置。</p>' +
        '<p>2. 故障特征库：振动频谱阈值触发降功率保护。</p>' +
        '<p class="fact-highlight">3. 量产标定流程：MP-300 线体工装三点校验。<span>已确认事实 · 可编辑标注</span></p>' +
        '<h2>四、技术效果</h2>' +
        '<p>负载阶跃下超调降低；可复现实验记录见附件。权属声明齐套后可交卷送确认。</p>' +
        '<div class="doc-comment"><strong>专家批注 · 交底书撰写专家</strong><p>权属声明仍缺。建议由法务出具模板后你确认——建议稿 ≠ 确认。</p></div>',
      research:
        '<p class="doc-lead">可专利性检索报告草稿。中栏即本关交卷物，可直接改结论表述。</p>' +
        '<h2>一、检索范围</h2><p>关键词：磁驱泵 / 双环控制 / 故障预判；库：CNABS · DWPI。</p>' +
        '<h2>二、比对要点</h2><p>相近方案多偏开环调速；双环+频谱阈值组合较少见。</p>' +
        '<h2>三、结论稿（缺项）</h2><p class="fact-highlight">待补：核心特征组合是否具备可专利性的明确结论。<span>当前缺项</span></p>' +
        '<div class="doc-comment"><strong>检索分析专家</strong><p>结论稿齐套前勿送立项。</p></div>',
      intake:
        '<p class="doc-lead">立项决议与报价单草稿。确认策略与费用后才启动撰写。</p>' +
        '<h2>一、保护策略</h2><p>建议：发明申请 · 核心在双环控制与故障预判组合。</p>' +
        '<h2>二、费用与周期</h2><p>代理费与官费估算；周期约 18–24 月。</p>' +
        '<h2>三、决议签署（缺项）</h2><p class="fact-highlight">待负责人签署是否按发明推进。<span>当前缺项</span></p>',
      draft:
        '<p class="doc-lead">权利要求草案 V1。独权与从属层次可在此编辑。</p>' +
        '<h2>权利要求 1（独立）</h2><p>一种磁驱泵智能控制系统，其特征在于包括外环流量控制与内环转速控制……</p>' +
        '<h2>从属层次</h2><p>权 2–5：采样周期、频谱阈值、三点校验工装。</p>' +
        '<h2>权项树（缺项）</h2><p class="fact-highlight">树状依赖尚未闭合。<span>当前缺项</span></p>',
      figure:
        '<p class="doc-lead">附图包 F2 说明稿。图号需与说明书引用一致。</p>' +
        '<h2>图 1</h2><p>双环控制框图。</p>' +
        '<h2>图 2</h2><p>故障预判流程。</p>' +
        '<h2>图号核对（缺项）</h2><p class="fact-highlight">说明书引用与图号尚未逐条对齐。<span>当前缺项</span></p>',
      filing:
        '<p class="doc-lead">申请包与递交核查单。授权人确认前不对外递交。</p>' +
        '<h2>申请文件</h2><p>请求书 · 说明书 · 权项 · 附图 · 摘要。</p>' +
        '<h2>授权人确认（缺项）</h2><p class="fact-highlight">对外递交须授权人勾选确认。<span>当前缺项</span></p>',
      oa:
        '<p class="doc-lead">意见陈述书 V2。策略与争辩在此编辑；企业确认后再递。</p>' +
        '<h2>通知书要点</h2><p>创造性评述针对双环控制组合。</p>' +
        '<h2>争辩要点</h2><p>有限修改 + 技术效果对比。</p>' +
        '<h2>企业确认意见（缺项）</h2><p class="fact-highlight">企业是否同意当前答复策略。<span>当前缺项</span></p>'
    };
    return {
      title: title,
      meta: '交卷物 · ' + title,
      html: bodies[dept.id] || (
        '<p class="doc-lead">' + title + '（本关交卷物，可编辑）。</p>' +
        '<h2>正文</h2><p>' + (dept.pitch || '') + '</p>' +
        '<p class="fact-highlight">缺项：' + (dept.missing || '—') + '<span>齐套后可交卷</span></p>'
      )
    };
  }

  function applyGoalContext() {
    const d = getDelegation() || {};
    const goal = (d.goal || '').trim();
    const banner = document.getElementById('dept-goal-banner');
    const nodes = document.querySelectorAll('[data-goal-context]');
    if (!goal) {
      if (banner) banner.hidden = true;
      nodes.forEach(function (el) {
        el.hidden = true;
        el.textContent = '';
      });
      return;
    }
    const short = goal.length > 48 ? goal.slice(0, 48) + '…' : goal;
    if (banner) {
      banner.hidden = false;
      const label = banner.querySelector('.dept-goal-label');
      if (label) label.textContent = '为你的目标';
      const strong = banner.querySelector('[data-goal-context]');
      if (strong) strong.textContent = short;
    }
    nodes.forEach(function (el) {
      if (el.closest && el.closest('#dept-goal-banner')) return;
      el.hidden = false;
      el.textContent = '为你的目标：' + short;
    });
  }

  /** 交底→查新等接力落地：页头一句 + 中栏交卷物已展开（非空转） */
  function applyRelayHandoff(dept) {
    const banner = document.getElementById('dept-goal-banner');
    if (!banner || !dept) return;
    const d = getDelegation() || {};
    const want = qs('relay') === '1' || (d.step === 'relay' && d.next === dept.id);
    if (!want) return;
    const last = d.lastDept && DEPTS[d.lastDept] ? DEPTS[d.lastDept] : null;
    const label = banner.querySelector('.dept-goal-label');
    const strong = banner.querySelector('[data-goal-context]');
    banner.hidden = false;
    if (label) label.textContent = '接力接手';
    if (strong) {
      strong.textContent = (last ? last.name + '已通过 · ' : '') +
        '本台中栏已打开「' + dept.deliverable + '」';
    }
    const editor = document.getElementById('dept-editor');
    if (editor) {
      try { editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    }
    // strip relay=1 so refresh does not re-flash handoff
    try {
      const u = new URL(location.href);
      if (u.searchParams.get('relay') === '1') {
        u.searchParams.delete('relay');
        history.replaceState(null, '', u.toString());
      }
    } catch (e) {}
  }


  function revealConfirmRail(dept, opts) {
    opts = opts || {};
    const rail = document.querySelector('[data-confirm-rail]');
    const submit = document.querySelector('[data-submit-gate]');
    if (!rail) return;
    rail.hidden = false;
    rail.classList.add('is-open');
    document.querySelectorAll('[data-pending-title]').forEach(el => { el.textContent = dept.pendingTitle; });
    document.querySelectorAll('[data-pending-fact]').forEach(el => { el.textContent = dept.pendingFact; });
    document.querySelectorAll('[data-pending-detail]').forEach(el => { el.textContent = dept.pendingDetail; });
    document.querySelectorAll('[data-confirm-type]').forEach(el => { el.textContent = dept.confirmType; });
    if (submit) {
      submit.setAttribute('disabled', 'disabled');
      submit.classList.add('is-disabled', 'is-submitted');
      const strong = submit.querySelector('strong');
      const small = submit.querySelector('small');
      if (strong) strong.textContent = '已交卷 · 待你确认';
      if (small) small.textContent = '同屏右栏拍板 · 勿另开页';
    }
    const prevBtn = document.querySelector('[data-rail-prev]');
    if (prevBtn) {
      const prev = prevDeptId(dept.id);
      prevBtn.hidden = !prev;
      if (prev && DEPTS[prev]) prevBtn.textContent = '退回上一部 · ' + DEPTS[prev].name;
    }
    syncBlindConfirm();
    if (opts.focus) {
      try { rail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (_) {}
      const pane = document.querySelector('[data-gate-pane]');
      if (pane) pane.classList.add('gate-focus');
    }
  }

  function syncBlindConfirm() {
    const pass = document.querySelector('[data-rail-pass]');
    const hint = document.querySelector('[data-confirm-blind-hint]');
    if (!pass) return;
    const ok = centerDeliverableVisible();
    if (ok) {
      pass.removeAttribute('disabled');
      pass.classList.remove('is-disabled');
      if (hint) hint.hidden = true;
    } else {
      pass.setAttribute('disabled', 'disabled');
      pass.classList.add('is-disabled');
      if (hint) hint.hidden = false;
    }
  }

  function wireRailGate(dept) {
    const pass = document.querySelector('[data-rail-pass]');
    const reject = document.querySelector('[data-rail-reject]');
    const prevBtn = document.querySelector('[data-rail-prev]');
    if (pass) {
      pass.addEventListener('click', (e) => {
        e.preventDefault();
        if (pass.hasAttribute('disabled')) {
          toast('先看中栏交卷物');
          const editor = document.getElementById('dept-editor');
          if (editor) try { editor.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
          return;
        }
        if (!centerDeliverableVisible()) {
          syncBlindConfirm();
          toast('先看中栏交卷物');
          return;
        }
        const evidence = pendingEvidenceFor(dept);
        const snapshot = {
          dept: dept.id,
          deptName: dept.name,
          deliverable: dept.deliverable,
          fact: dept.pendingFact,
          confirmType: dept.confirmType,
          at: new Date().toISOString(),
          next: dept.next,
          bodyTitle: evidence.primary.title,
          bodyHtml: evidence.primary.html
        };
        setSnapshot(snapshot);
        setSubmitted(dept.id, false); // cleared after pass
        const d = getDelegation();
        if (d) {
          d.step = 'relay';
          d.lastDept = dept.id;
          d.next = dept.next;
          setDelegation(d);
        }
        const nxt = nextDeptId(dept.id);
        if (nxt) {
          toast('已通过 · 接力' + (DEPTS[nxt] ? DEPTS[nxt].name : '下一部'));
          localStorage.setItem('mpv2-mode', 'project');
          localStorage.setItem('mpv2-last-work', 'dept.html?dept=' + nxt);
          location.href = withRole('dept.html?dept=' + nxt + '&relay=1');
        } else {
          toast('已通过 · 本案主链收尾');
          location.href = withRole('company.html?snapshot=1');
        }
      });
    }
    if (reject) {
      reject.addEventListener('click', (e) => {
        e.preventDefault();
        setSubmitted(dept.id, false);
        const rail = document.querySelector('[data-confirm-rail]');
        if (rail) { rail.hidden = true; rail.classList.remove('is-open'); }
        const submit = document.querySelector('[data-submit-gate]');
        if (submit) {
          submit.classList.remove('is-submitted');
          const strong = submit.querySelector('strong');
          const small = submit.querySelector('small');
          if (strong) strong.textContent = '交卷 · 待你确认';
          if (small) small.textContent = '齐套后可点 · 同屏右栏拍板';
          // re-enable only if checklist still all checked
          const box = document.querySelector('[data-checklist]');
          if (box) {
            const list = [...box.querySelectorAll('input[type=checkbox]')];
            const all = list.length > 0 && list.every(i => i.checked);
            if (all) {
              submit.removeAttribute('disabled');
              submit.classList.remove('is-disabled');
            }
          }
        }
        const d = getDelegation();
        if (d) { d.step = 'workbench'; setDelegation(d); }
        clearGateQuery(); // 驳回后清 URL gate=1，避免刷新又进闸态
        toast('已驳回 · 请本台补齐后再交卷');
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const prev = prevDeptId(dept.id);
        if (!prev) { toast('已无上一部可退'); return; }
        setSubmitted(dept.id, false);
        toast('退回 · ' + (DEPTS[prev] ? DEPTS[prev].name : '上一部'));
        localStorage.setItem('mpv2-mode', 'project');
        location.href = withRole('dept.html?dept=' + prev);
      });
    }
    // Re-check blind confirm when editor mutates / resize
    const editor = document.getElementById('dept-editor');
    if (editor) {
      editor.addEventListener('input', syncBlindConfirm);
    }
    window.addEventListener('resize', syncBlindConfirm);
  }

  function clearGateQuery() {
    try {
      const u = new URL(location.href);
      if (u.searchParams.get('gate') !== '1') return;
      u.searchParams.delete('gate');
      history.replaceState(null, '', u.toString());
    } catch (e) {}
  }

  function ensureGateDeepLink(dept) {
    const want = qs('gate') === '1';
    const submitted = getSubmitted(dept.id);
    if (!want && !submitted) return;
    // Deep-link / 铃铛：强制项目档；仅已真实交卷才露通过/驳回（禁伪齐套破 G1）
    localStorage.setItem('mpv2-mode', 'project');
    applyModeUI('project');
    if (submitted) {
      revealConfirmRail(dept, { focus: true });
      return;
    }
    // gate=1 但未交卷：落齐套区，交卷仍按缺项禁用；禁止 auto-check / 伪 setSubmitted
    const box = document.querySelector('[data-checklist]');
    if (box) {
      try { box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
      const pane = box.closest('[data-gate-pane], .right-stack, aside') || box.parentElement;
      if (pane) pane.classList.add('gate-focus');
    }
    const submit = document.querySelector('[data-submit-gate]');
    if (submit) {
      submit.setAttribute('disabled', 'disabled');
      submit.classList.add('is-disabled');
      submit.classList.remove('is-submitted');
    }
  }

  function wireDeptPage() {
    const key = deptFromQuery('disclosure');
    const dept = DEPTS[key] || DEPTS.disclosure;
    // Landing from plan / goWorkDept should be project; if goal context present, snap to project
    try {
      const d = getDelegation();
      if (d && (d.goal || d.deliverable || d.step === 'execute' || d.step === 'workbench' || d.step === 'confirm' || d.step === 'relay' || qs('relay') === '1')) {
        if (mode() === 'assistant') {
          localStorage.setItem('mpv2-mode', 'project');
          applyModeUI('project');
        }
      }
    } catch (e) {}
    localStorage.setItem('mpv2-last-work', 'dept.html?dept=' + key);
    syncDeptFold();
    applyGoalContext();
    document.querySelectorAll('[data-dept-name]').forEach(el => { el.textContent = dept.name; });
    document.querySelectorAll('[data-dept-pitch]').forEach(el => { el.textContent = dept.pitch || ''; });
    document.querySelectorAll('[data-deliverable]').forEach(el => { el.textContent = dept.deliverable; });
    document.querySelectorAll('[data-missing]').forEach(el => { el.textContent = dept.missing; });
    document.querySelectorAll('[data-confirm-type]').forEach(el => { el.textContent = dept.confirmType; });
    document.querySelectorAll('[data-checklist]').forEach(list => {
      if (list.dataset.built) return;
      list.dataset.built = '1';
      list.innerHTML = dept.check.map((c, i) => checklistItemHtml(c, i, dept)).join('');
    });
    /* Rail: actual staffing — no pad / no hard ≤3 */
    const expertHtml = renderRailExperts(dept.experts, dept);
    document.querySelectorAll('[data-experts]').forEach(el => { el.innerHTML = expertHtml; });
    document.querySelectorAll('[data-current-task]').forEach(el => {
      el.textContent = '补齐「' + (dept.missing || '缺项') + '」后交卷';
    });
    document.querySelectorAll('[data-node-tip]').forEach(el => {
      el.textContent = '补齐「' + (dept.missing || '缺项') + '」后交卷 · 确认类型：' + (dept.confirmType || '');
    });
    document.querySelectorAll('[data-pending-fact]').forEach(el => { el.textContent = dept.pendingFact; });
    wireChecklist(key);

    // face tabs (legacy, if present)
    document.querySelectorAll('[data-face-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const face = btn.dataset.faceTab;
        document.querySelectorAll('[data-face-tab]').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('[data-face]').forEach(panel => {
          panel.classList.toggle('hidden', panel.dataset.face !== face);
        });
      });
    });

    const foldBtn = document.querySelector('[data-fold-left]');
    const wb = document.querySelector('[data-workbench]');
    if (foldBtn && wb) {
      foldBtn.addEventListener('click', () => {
        wb.classList.toggle('fold-left');
        foldBtn.textContent = wb.classList.contains('fold-left') ? '展开' : '收折';
      });
      // Keep three-column skeleton by default (Cursor-like); user may fold left
    }

    const focusGate = document.querySelector('[data-focus-gate]');
    if (focusGate) {
      focusGate.addEventListener('click', () => {
        const pane = document.querySelector('[data-gate-pane] .gate-box, #gate-box');
        if (pane) pane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    // Editable center: mark dirty on input
    const editor = document.getElementById('dept-editor');
    const saveState = document.querySelector('[data-save-state]');
    const unsavedDot = document.querySelector('[data-unsaved-dot]');
    const foot = document.querySelector('[data-editor-foot]');
    let dirty = false;
    function setDirty(on) {
      dirty = on;
      if (saveState) {
        saveState.textContent = on ? '编辑中' : '已保存';
        saveState.classList.toggle('is-editing', on);
      }
      if (unsavedDot) unsavedDot.hidden = !on;
      if (foot) foot.textContent = on ? '有未保存修改' : '已同步至项目事实库';
    }
    if (editor) {
      editor.addEventListener('input', () => setDirty(true));
    }
    const saveBtn = document.querySelector('[data-save-doc]');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        setDirty(false);
        toast('新版本已保存');
      });
    }

    // Tree / editor tab sync — title + body stub must match selected file
    const DOC_STUBS = {
      '交底书 V3': {
        title: '技术交底书 V3',
        meta: '交卷物 · 技术交底书 V3',
        html:
          '<p class="doc-lead">本关交卷物 · 可直接编辑技术方案与关键特征。</p>' +
          '<h2>一、技术领域</h2>' +
          '<p>一种磁驱泵智能控制系统，涉及流量—转速闭环与故障预判，适用于工业磁驱泵产线。</p>' +
          '<h2>二、背景问题</h2>' +
          '<p>现有方案在负载突变时超调明显，且缺少可验证的替代实施方式描述，影响交底齐套与后续查新。</p>' +
          '<h2>三、技术方案</h2>' +
          '<p>1. 双环控制：外环流量、内环转速；采样周期可配置。</p>' +
          '<p>2. 故障特征库：振动频谱阈值触发降功率保护。</p>' +
          '<p class="fact-highlight">3. 量产标定流程：MP-300 线体工装三点校验。<span>已确认事实 · 可编辑标注</span></p>' +
          '<h2>四、技术效果</h2>' +
          '<p>负载阶跃下超调降低；可复现实验记录见附件。权属声明齐套后可交卷送确认。</p>' +
          '<div class="doc-comment"><strong>专家批注 · 交底书撰写专家</strong><p>权属声明仍缺。建议由法务出具模板后你确认——建议稿 ≠ 确认。</p></div>'
      },
      '权属声明': {
        title: '权属声明（缺）',
        meta: '交卷物 · 权属声明',
        html:
          '<p class="doc-lead">职务发明权属声明草稿。补齐后才能与交底书一并送确认。</p>' +
          '<h2>一、发明人</h2>' +
          '<p>（待填）陈宇、……</p>' +
          '<h2>二、权属归属</h2>' +
          '<p>本申请相关技术成果归<strong>澄明科技有限公司</strong>所有，发明人确认无职务发明争议。</p>' +
          '<h2>三、签署</h2>' +
          '<p>发明人签署栏 · 法务复核栏 ·</p>' +
          '<div class="doc-comment"><strong>顾言</strong><p>本文件仍缺。齐套清单里勾上「权属声明」后，右栏才能交卷。</p></div>'
      },
      '访谈纪要': {
        title: '访谈纪要 10-20',
        meta: '材料 · 访谈纪要',
        html:
          '<p class="doc-lead">2026-10-20 技术访谈纪要 · 磁驱泵智能控制。</p>' +
          '<h2>参与人</h2><p>陈宇（研发）、交底书撰写专家、顾言。</p>' +
          '<h2>关键事实</h2>' +
          '<p>1. MP-300 三点校验已在产线验证。</p>' +
          '<p>2. 超调问题出现在负载阶跃场景。</p>' +
          '<p>3. 权属需法务出模板后由负责人确认。</p>'
      },
      '前序检索': {
        title: '前序检索摘要',
        meta: '材料 · 前序检索',
        html:
          '<p class="doc-lead">非正式检索摘要，供交底完善参考——正式查新在查新部。</p>' +
          '<h2>关键词</h2><p>磁驱泵 / 双环控制 / 故障预判</p>' +
          '<h2>初步观察</h2><p>相近方案多偏开环调速；双环+频谱阈值组合较少见（待查新部核验）。</p>'
      },
      '附图 F1': {
        title: '附图草图 F1',
        meta: '卷宗 · 附图草图',
        html:
          '<p class="doc-lead">附图草图占位 · 专业档可见。</p>' +
          '<h2>图 1</h2><p>双环控制框图（草）。</p>' +
          '<h2>图 2</h2><p>故障预判流程（草）。</p>'
      },
      '对比文献': {
        title: '对比文献包 R2',
        meta: '卷宗 · 对比文献',
        html:
          '<p class="doc-lead">对比文献包占位 · 专业档可见。</p>' +
          '<h2>文献清单</h2><p>CN… / US… / 非专利文献 2 篇。</p>'
      },
      '确认记录': {
        title: '确认记录 · 技术事实',
        meta: '卷宗 · 确认记录',
        html:
          '<p class="doc-lead">已拍板与待拍板记录。</p>' +
          '<h2>已确认</h2><p>MP-300 三点校验为已确认技术事实。</p>' +
          '<h2>待确认</h2><p>权属是否归澄明科技。</p>'
      }
    };


    // Ensure this dept's 交卷物 has a real body (not blank / not always 交底书)
    const primaryStub = deliverableStubFor(dept);
    const primaryKey = dept.deliverable;
    DOC_STUBS[primaryKey] = primaryStub;
    // Short aliases used by default HTML tabs
    if (dept.id === 'disclosure') {
      DOC_STUBS['交底书 V3'] = primaryStub;
    }

    function activateDoc(name) {
      if (!name) return;
      document.querySelectorAll('[data-doc-tab]').forEach(b => {
        b.classList.toggle('active', b.dataset.docTab === name);
      });
      document.querySelectorAll('[data-editor-tab]').forEach(b => {
        b.classList.toggle('active', b.dataset.editorTab === name);
      });
      // Keep / create matching editor tab label
      const tabs = document.querySelector('.editor-tabs');
      if (tabs) {
        let tab = tabs.querySelector('[data-editor-tab="' + name + '"]');
        if (!tab) {
          tab = document.createElement('button');
          tab.type = 'button';
          tab.dataset.editorTab = name;
          tab.innerHTML = name + '<span></span>';
          tab.addEventListener('click', () => activateDoc(name));
          tabs.appendChild(tab);
        }
        tabs.querySelectorAll('[data-editor-tab]').forEach(b => {
          b.classList.toggle('active', b.dataset.editorTab === name);
        });
      }
      const stub = DOC_STUBS[name] || {
        title: name,
        meta: '本案文件 · ' + name,
        html: '<p class="doc-lead">' + name + '（可编辑）。</p><p>与左侧目录当前项一致。</p>'
      };
      if (editor) {
        const metaSpan = editor.querySelector('.doc-meta span:first-child');
        if (metaSpan) metaSpan.innerHTML = stub.meta;
        const h1 = editor.querySelector('h1');
        if (h1) h1.textContent = stub.title;
        // Replace body after h1 while keeping doc-meta + h1
        const keep = [];
        const meta = editor.querySelector('.doc-meta');
        if (meta) keep.push(meta.outerHTML);
        keep.push('<h1 data-deliverable>' + stub.title + '</h1>');
        editor.innerHTML = keep.join('') + stub.html;
        setDirty(false);
      }
      document.querySelectorAll('[data-deliverable]').forEach(el => {
        if (el.tagName === 'H1' || el.closest('#dept-editor')) return;
        el.textContent = stub.title;
      });
    }
    document.querySelectorAll('[data-doc-tab]').forEach(b => {
      b.addEventListener('click', () => activateDoc(b.dataset.docTab));
    });
    document.querySelectorAll('[data-editor-tab]').forEach(b => {
      b.addEventListener('click', () => activateDoc(b.dataset.editorTab));
    });

    // Open this dept's 交卷物 in center by default (visible sample body)
    const primaryName = primaryKey;
    document.querySelectorAll('[data-primary-deliverable]').forEach(function (el) {
      if (el.hasAttribute('data-doc-tab')) {
        el.setAttribute('data-doc-tab', primaryName);
        el.dataset.docTab = primaryName;
        el.innerHTML = primaryName + '<span class="unsaved-dot" data-unsaved-dot hidden></span>';
      }
      if (el.hasAttribute('data-editor-tab')) {
        el.setAttribute('data-editor-tab', primaryName);
        el.dataset.editorTab = primaryName;
        el.innerHTML = primaryName + '<span></span>';
      }
    });
    activateDoc(primaryName);

    // Gap next-actions → open center doc / fill 本部门执行助手 (not private expert chat)
    document.querySelectorAll('[data-gap-open]').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const name = btn.getAttribute('data-gap-open');
        activateDoc(name);
        try {
          const ed = document.querySelector('.editor-pane, #dept-editor');
          if (ed) ed.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {}
        toast('已打开中栏 · ' + name);
      });
    });
    document.querySelectorAll('[data-gap-ask]').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const ask = btn.getAttribute('data-gap-ask') || '';
        const input = document.getElementById('dept-chat-input');
        if (input) {
          input.value = ask;
          input.focus();
        }
        toast('已填入助手指令 · 点发送');
      });
    });

    applyRelayHandoff(dept);
    const treeLabel = document.querySelector('.tree .tree-label');
    if (treeLabel) treeLabel.textContent = '交卷物 · ' + dept.name;

    // Right-pane chat compose → bubble + optional delegate
    const chatForm = document.getElementById('dept-chat-form');
    const chatInput = document.getElementById('dept-chat-input');
    const feed = document.querySelector('[data-chat-feed]');
    if (chatForm && chatInput && feed) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.innerHTML = '<strong>我 → 本部门执行助手</strong>' + text.replace(/</g, '&lt;');
        feed.appendChild(bubble);
        chatInput.value = '';
        toast('已纳入本节点指令');
      });
    }

    // Fill pending title/detail for rail
    document.querySelectorAll('[data-pending-title]').forEach(el => { el.textContent = dept.pendingTitle; });
    document.querySelectorAll('[data-pending-detail]').forEach(el => { el.textContent = dept.pendingDetail; });

    wireRailGate(dept);
    // Restore real submitted confirm-rail, or land gate=1 on checklist (no fake submit)
    if (getSubmitted(key) || qs('gate') === '1') {
      ensureGateDeepLink(dept);
    }
    // After center doc activated, re-check blind rule
    setTimeout(syncBlindConfirm, 50);
  }

  function pendingEvidenceFor(dept) {
    const primary = deliverableStubFor(dept);
    const chips = [
      { id: 'primary', label: dept.deliverable.replace(/^技术/, '') || dept.deliverable, title: primary.title, html: primary.html }
    ];
    if (dept.id === 'disclosure') {
      chips.push({
        id: 'ownership',
        label: '权属声明',
        title: '权属声明（与交底一并确认）',
        html:
          '<p class="doc-lead">职务发明权属声明 · 本关拍板依据之一。</p>' +
          '<h2>一、发明人</h2><p>陈宇等。</p>' +
          '<h2>二、权属归属</h2>' +
          '<p>本申请相关技术成果归<strong>澄明科技有限公司</strong>所有，发明人确认无职务发明争议。</p>' +
          '<h2>三、与交底书关系</h2>' +
          '<p>权属齐套后，交底书方可作为申请文件部输入。本页决策问句即针对本节。</p>'
      });
      chips.push({
        id: 'interview',
        label: '访谈纪要 10-20',
        title: '访谈纪要 10-20',
        html:
          '<p class="doc-lead">2026-10-20 技术访谈纪要 · 磁驱泵智能控制。</p>' +
          '<h2>参与人</h2><p>陈宇（研发）、交底书撰写专家、顾言。</p>' +
          '<h2>关键事实</h2>' +
          '<p>1. MP-300 三点校验已在产线验证。</p>' +
          '<p>2. 超调问题出现在负载阶跃场景。</p>' +
          '<p>3. 权属需法务出模板后由负责人确认。</p>'
      });
    } else {
      chips.push({
        id: 'checklist',
        label: '齐套已勾齐',
        title: dept.deliverable + ' · 齐套说明',
        html:
          '<p class="doc-lead">本关齐套项已齐，可对照中栏交卷物正文拍板。</p>' +
          '<h2>齐套项</h2><ul>' +
          (dept.check || []).map(function (c) { return '<li>' + c + '</li>'; }).join('') +
          '</ul>' +
          '<p class="fact-highlight">缺项曾标：' + (dept.missing || '—') + '<span>现已勾齐</span></p>'
      });
    }
    return { primary: primary, chips: chips };
  }

  function wirePending() {
    // Soft redirect: independent confirm page retired — deep-link workbench rail gate
    const key = deptFromQuery(pendingDeptForRole());
    location.replace(withRole(gateHref(key)));
    return;
    const dept = DEPTS[key] || DEPTS.disclosure;
    const fill = (sel, text) => {
      document.querySelectorAll(sel).forEach(el => { el.textContent = text; });
    };
    fill('[data-dept-name]', dept.name);
    fill('[data-deliverable]', dept.deliverable);
    fill('[data-missing]', dept.missing);
    fill('[data-pending-title]', dept.pendingTitle);
    fill('[data-pending-fact]', dept.pendingFact);
    fill('[data-pending-detail]', dept.pendingDetail);
    fill('[data-confirm-type]', dept.confirmType);

    const evidence = pendingEvidenceFor(dept);
    const preview = document.querySelector('[data-artifact-preview]');
    const previewTitle = document.querySelector('[data-preview-title]');
    const chipHost = document.querySelector('[data-evidence-chips]');
    let activeBody = evidence.primary.html;
    let activeTitle = evidence.primary.title;

    function showPreview(chip) {
      activeBody = chip.html;
      activeTitle = chip.title;
      if (previewTitle) previewTitle.textContent = chip.title;
      if (preview) {
        preview.innerHTML = '<h1>' + chip.title + '</h1>' + chip.html;
        preview.scrollTop = 0;
      }
      if (chipHost) {
        chipHost.querySelectorAll('.evidence-chip').forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-ev') === chip.id);
        });
      }
    }

    if (chipHost) {
      chipHost.innerHTML = '';
      evidence.chips.forEach(function (chip, idx) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'evidence-chip' + (idx === 0 ? ' active' : '');
        btn.setAttribute('data-ev', chip.id);
        btn.textContent = chip.label;
        btn.addEventListener('click', function () { showPreview(chip); });
        chipHost.appendChild(btn);
      });
      // Open in dept with this artifact
      const openDept = document.createElement('a');
      openDept.className = 'evidence-chip';
      openDept.setAttribute('data-kind', 'link');
      openDept.href = withRole('dept.html?dept=' + dept.id);
      openDept.textContent = '工作台全文 →';
      chipHost.appendChild(openDept);
    }
    showPreview(evidence.chips[0]);

    const openInDept = document.querySelector('[data-open-in-dept]');
    if (openInDept) openInDept.href = withRole('dept.html?dept=' + dept.id);

    const back = document.querySelector('[data-reject-link]');
    if (back) {
      back.addEventListener('click', (e) => {
        e.preventDefault();
        const d = getDelegation();
        if (d) { d.step = 'workbench'; setDelegation(d); }
        location.href = withRole('dept.html?dept=' + dept.id);
      });
    }

    const pass = document.querySelector('[data-pass-link]');
    const snap = document.querySelector('[data-success-snapshot]');
    const card = document.querySelector('[data-pending-card]');
    if (pass) {
      pass.addEventListener('click', (e) => {
        e.preventDefault();
        const snapshot = {
          dept: dept.id,
          deptName: dept.name,
          deliverable: dept.deliverable,
          fact: dept.pendingFact,
          confirmType: dept.confirmType,
          at: new Date().toISOString(),
          next: dept.next,
          bodyTitle: evidence.primary.title,
          bodyHtml: evidence.primary.html
        };
        setSnapshot(snapshot);
        const d = getDelegation();
        if (d) {
          d.step = 'relay';
          d.lastDept = dept.id;
          d.next = dept.next;
          setDelegation(d);
        }
        if (card) card.classList.add('hidden');
        if (snap) {
          snap.classList.add('show');
          const nextName = dept.next && DEPTS[dept.next] ? DEPTS[dept.next].name : '本案收尾';
          snap.querySelector('[data-snap-deliverable]').textContent = dept.deliverable;
          snap.querySelector('[data-snap-fact]').textContent = dept.pendingFact;
          snap.querySelector('[data-snap-next]').textContent = nextName;
          const snapTitle = snap.querySelector('[data-snap-preview-title]');
          const snapBody = snap.querySelector('[data-snap-body]');
          if (snapTitle) snapTitle.textContent = evidence.primary.title;
          if (snapBody) snapBody.innerHTML = '<h1>' + evidence.primary.title + '</h1>' + evidence.primary.html;
          const goNext = snap.querySelector('[data-relay-next]');
          if (goNext) {
            if (dept.next) {
              goNext.href = withRole('dept.html?dept=' + dept.next);
              goNext.textContent = '接力 → ' + nextName;
            } else {
              goNext.href = withRole('company.html');
              goNext.textContent = '回公司首页';
            }
          }
          try { snap.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
        } else {
          location.href = withRole('company.html?snapshot=1');
        }
      });
    }

    // self-approve disabled already in HTML
  }

  function wireCompanySnapshot() {
    const snap = getSnapshot();
    const slot = document.querySelector('[data-company-snapshot]');
    if (slot && snap) {
      slot.classList.remove('hidden');
      slot.querySelector('[data-snap-dept]').textContent = snap.deptName || '';
      slot.querySelector('[data-snap-deliverable]').textContent = snap.deliverable || '';
      slot.querySelector('[data-snap-fact]').textContent = snap.fact || '';
      const titleEl = slot.querySelector('[data-snap-preview-title]');
      const bodyEl = slot.querySelector('[data-snap-body]');
      const title = snap.bodyTitle || snap.deliverable || '';
      if (titleEl) titleEl.textContent = title;
      if (bodyEl) {
        if (snap.bodyHtml) {
          bodyEl.innerHTML = '<h1>' + title + '</h1>' + snap.bodyHtml;
        } else {
          const dept = DEPTS[snap.dept] || DEPTS.disclosure;
          const stub = deliverableStubFor(dept);
          bodyEl.innerHTML = '<h1>' + stub.title + '</h1>' + stub.html;
          if (titleEl) titleEl.textContent = stub.title;
        }
      }
      const link = slot.querySelector('[data-snap-pending-link]');
      if (link && snap.dept) link.href = withRole(gateHref(snap.dept));
    }
    wireCompanyDeptFaces();
    wireCompanyDrawer();
  }

  function wireCompanyDrawer() {
    const drawer = document.getElementById('dept-drawer');
    if (!drawer) return;
    const open = (key) => {
      const dept = DEPTS[key] || DEPTS.disclosure;
      drawer.querySelector('[data-drawer-name]').textContent = dept.name;
      drawer.querySelector('[data-drawer-deliverable]').textContent = dept.deliverable;
      const status = '交卷物就绪度视齐套；确认类型：' + dept.confirmType;
      drawer.querySelector('[data-drawer-status]').textContent = status;
      drawer.querySelector('[data-drawer-experts]').innerHTML = renderExperts(dept.experts);
      const go = drawer.querySelector('[data-drawer-go]');
      if (go) go.href = withRole('dept.html?dept=' + dept.id);
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    };
    const close = () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    };
    document.querySelectorAll('[data-dept-open]').forEach(a => {
      a.addEventListener('click', (e) => {
        // open drawer instead of navigating immediately
        e.preventDefault();
        e.stopImmediatePropagation();
        open(a.dataset.deptOpen);
      }, true);
    });
    drawer.querySelectorAll('[data-drawer-close]').forEach(el => {
      el.addEventListener('click', close);
    });
    const go = drawer.querySelector('[data-drawer-go]');
    if (go) {
      go.addEventListener('click', (e) => {
        e.preventDefault();
        location.href = go.getAttribute('href');
      });
    }
  }

  /* Leslie 暂隐：半身像浮层 / dock。改 true 即可重开（CSS kill switch 亦需放开） */
  const SHOW_GUYAN_HALF_DOCK = false;

  function injectGuyanPresence() {
    if (!SHOW_GUYAN_HALF_DOCK) return; // dock hidden · re-enable via flag + CSS
    if (!document.querySelector('.app-shell')) return;
    if (document.body.dataset.page === 'welcome' || document.body.dataset.page === 'login') return;
    if (document.querySelector('.guyan-presence')) return;
    const a = document.createElement('a');
    a.className = 'guyan-presence';
    a.href = withRole('delegate.html');
    a.setAttribute('data-keep-role', '');
    a.setAttribute('aria-label', '顾言 · 知产负责人 · 持续委托');
    a.title = '顾言 · 知产负责人';
    a.innerHTML =
      '<img src="assets/portraits/guyan-half.png" alt="" width="72" height="90">' +
      '<span class="guyan-meta"><strong>顾言</strong><small>知产负责人 · 持续委托</small></span>';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      location.href = withRole('delegate.html');
    });
    document.body.appendChild(a);
  }


  /* Map a free-text goal → first dept / checklist / confirm (fake but consistent) */
  function planFromGoal(goal) {
    const g = (goal || '').trim();
    const lower = g.toLowerCase();
    let deptId = 'disclosure';
    /* §0.3 四类：FTO/上市风险 → 自由实施部（更多），≠查新部 research */
    if (/fto|上市.?风险|自由实施|上市前/.test(lower)) deptId = 'fto';
    else if (/审查|oa|意见陈述|答复/.test(lower)) deptId = 'oa';
    else if (/查新|检索|可专利|现有技术/.test(lower)) deptId = 'research';
    else if (/立项|报价|值不值得|申请类型/.test(lower)) deptId = 'intake';
    else if (/撰写|权利要求|说明书/.test(lower)) deptId = 'draft';
    else if (/附图|流程图/.test(lower)) deptId = 'figure';
    else if (/递交|官方|国知局/.test(lower)) deptId = 'filing';
    else if (/权属|交底|保护|成果|发明|开案/.test(lower)) deptId = 'disclosure';

    const d = DEPTS[deptId];
    const chain = [];
    let cur = deptId;
    for (let i = 0; i < 3 && cur; i++) {
      const node = DEPTS[cur];
      if (!node) break;
      chain.push(node);
      cur = node.next;
    }
    const ownershipish = /权属/.test(g);
    const echo = ownershipish
      ? '「收到。先把权属声明齐套进交底，你确认归属后，我再接查新。」'
      : ('「收到：「' + (g.length > 36 ? g.slice(0, 36) + '…' : g) + '」。先由' + d.name + '接手，齐套后请你确认「' + d.confirmType + '」。」');
    return {
      goal: g,
      dept: d,
      deptId: d.id,
      echo: echo,
      checklist: ownershipish
        ? ['权属声明草稿', '发明人名单', '职务发明核对']
        : (d.check || []).slice(0, 3),
      assignDetail: ownershipish
        ? '本周内补齐权属声明，并入技术交底书'
        : d.pitch,
      confirmDetail: ownershipish
        ? '权属是否归澄明科技——确认后才接力查新'
        : d.pendingFact,
      chain: chain,
      notePlaceholder: ownershipish
        ? '例如：优先补权属，访谈安排在本周内'
        : ('例如：优先推进' + d.name + '齐套')
    };
  }

  function renderBreakdownHTML(plan) {
    const checks = (plan.checklist || []).map(function (c) {
      return '<li>' + c + '</li>';
    }).join('');
    return '' +
      '<article><span>交办</span><strong>' + plan.dept.name + '</strong><small>' + plan.assignDetail + '</small></article>' +
      '<article><span>齐套要点</span><ul class="plan-check-inline">' + checks + '</ul></article>' +
      '<article><span>下一步确认</span><strong>' + plan.dept.confirmType + '</strong><small>' + plan.confirmDetail + '</small></article>';
  }

  function wireWelcomeGoalDemo() {
    const rootEl = document.getElementById('goal-demo');
    if (!rootEl) return;
    const idle = rootEl.querySelector('[data-demo-view="idle"]');
    const result = rootEl.querySelector('[data-demo-view="result"]');
    const input = document.getElementById('welcome-goal-input');
    const form = document.getElementById('welcome-goal-form');
    const echo = document.getElementById('demo-echo');
    const breakdown = document.getElementById('demo-breakdown');
    const cont = document.getElementById('demo-continue');

    function showResult(goal) {
      const plan = planFromGoal(goal);
      if (!plan.goal) { toast('请先说一句目标'); return; }
      setDelegation({ goal: plan.goal, step: 'plan', dept: plan.deptId });
      if (echo) echo.textContent = plan.echo;
      if (breakdown) breakdown.innerHTML = renderBreakdownHTML(plan);
      if (cont) {
        // After login, land on plan step with goal already stored (session + URL)
        cont.href = 'login.html?afterGoal=1';
        cont.dataset.afterGoal = '1';
      }
      idle.classList.add('hidden');
      result.classList.remove('hidden');
      rootEl.classList.add('has-result');
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    rootEl.querySelectorAll('[data-demo-fill]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (input) input.value = b.dataset.demoFill;
        showResult(b.dataset.demoFill);
      });
    });
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        showResult((input && input.value) || '');
      });
    }
    rootEl.querySelectorAll('[data-demo-reset]').forEach(function (b) {
      b.addEventListener('click', function () {
        result.classList.add('hidden');
        idle.classList.remove('hidden');
        rootEl.classList.remove('has-result');
        if (input) { input.value = ''; input.focus(); }
      });
    });
  }

  function wireDelegate() {
    let step = qs('step') || 'goal';
    // Legacy aliases: execute/confirm never dwell on this page (head also redirects)
    if (step === 'execute' || step === 'confirm' || step === 'workbench') {
      const d = getDelegation() || {};
      const plan = planFromGoal(d.goal || '');
      const deptId = d.dept || plan.deptId || 'disclosure';
      localStorage.setItem('mpv2-mode', 'project');
      const gate = (step === 'confirm') ? '&gate=1' : '';
      location.replace(withRole('dept.html?dept=' + deptId + gate));
      return;
    }
    // Map workbench alias for step bar
    const stepForBar = (step === 'workbench') ? 'workbench' : step;
    document.querySelectorAll('[data-step]').forEach(el => {
      const s = el.dataset.step;
      el.classList.remove('done', 'current');
      const order = ['goal','plan','workbench','relay'];
      const si = order.indexOf(s);
      const ci = order.indexOf(stepForBar);
      if (si < ci) el.classList.add('done');
      if (si === ci) el.classList.add('current');
    });
    document.querySelectorAll('[data-panel]').forEach(p => {
      // workbench has no panel on delegate — hide all work panels except goal/plan/relay
      const show = p.dataset.panel === step;
      p.classList.toggle('hidden', !show);
    });

    const existing = getDelegation() || {};
    const goalText = existing.goal || '';
    if (goalText) {
      const inp = document.querySelector('#goal-input');
      if (inp && !inp.value) inp.value = goalText;
    }

    // Goal chips on delegate page
    document.querySelectorAll('.goal-panel [data-fill]').forEach(b => {
      b.addEventListener('click', () => {
        const inp = document.getElementById('goal-input');
        if (inp) inp.value = b.dataset.fill;
      });
    });

    function fillPlanUI(goal) {
      const plan = planFromGoal(goal || '整理一项研发成果，评估如何保护');
      const title = document.getElementById('plan-title');
      const echo = document.getElementById('plan-goal-echo');
      const bd = document.getElementById('plan-breakdown');
      const list = document.getElementById('plan-list');
      const go = document.getElementById('plan-go-btn');
      const note = document.getElementById('plan-note');
      if (title) title.textContent = '建议先由' + plan.dept.name + '接手';
      if (echo) echo.textContent = '你的目标：「' + plan.goal + '」';
      if (bd) bd.innerHTML = renderBreakdownHTML(plan);
      if (note && !note.value) note.placeholder = plan.notePlaceholder;
      // Big 产出 hero — not tiny muted
      const delName = document.getElementById('plan-deliverable-name');
      const delHint = document.getElementById('plan-deliverable-hint');
      if (delName) delName.textContent = plan.dept.deliverable;
      if (delHint) {
        delHint.textContent = '确认计划后立刻打开' + plan.dept.name + '工作台，中栏可见「' + plan.dept.deliverable + '」· 同屏右栏拍板';
      }
      if (list) {
        list.innerHTML = plan.chain.map(function (node, i) {
          const primary = i === 0
            ? ('<em class="plan-out-emph">产出：' + node.deliverable + '</em> · 关口：' + node.confirmType)
            : ('产出：' + node.deliverable + '；关口：' + node.confirmType);
          return '<li class="' + (i === 0 ? 'is-primary' : '') + '"><span class="ord">' + (i + 1) + '</span><div><strong>' + node.name + '</strong>' +
            node.pitch + '<small>' + primary + '</small></div></li>';
        }).join('');
      }
      if (go) {
        go.textContent = '确认并打开交卷物 · 去' + plan.dept.name + ' →';
        go.dataset.dept = plan.deptId;
      }
      return plan;
    }

    if (step === 'plan' || step === 'workbench' || step === 'relay') {
      const plan = fillPlanUI(goalText);
      // relay panel only (confirm dead panel removed — 拍板在工作台同屏右栏)
      if (step === 'relay') {
        const deptId = (getDelegation() || {}).dept || plan.deptId || 'disclosure';
        const dept = DEPTS[deptId] || DEPTS.disclosure;
        const relayCopy = document.getElementById('relay-copy');
        const relayGo = document.getElementById('relay-go-btn');
        if (relayCopy) {
          relayCopy.textContent = '「' + dept.confirmType + '」已通过。查看交付快照，并由' + dept.name + '接力下一站。';
        }
        if (relayGo) {
          relayGo.href = withRole('company.html');
          relayGo.textContent = '回公司看快照与接力 →';
        }
      }
    }

    const startBtn = document.querySelector('[data-to-plan]');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const goal = (document.querySelector('#goal-input') || {}).value || '';
        if (!goal.trim()) { toast('请先填写业务目标'); return; }
        const plan = planFromGoal(goal.trim());
        setDelegation({ goal: plan.goal, step: 'plan', dept: plan.deptId });
        location.href = withRole('delegate.html?step=plan');
      });
    }
    // Primary path: plan confirm → IMMEDIATE dept Cursor desk (zero execute splash)
    const confirmPlan = document.querySelector('[data-to-dept], [data-to-execute]');
    if (confirmPlan) {
      confirmPlan.addEventListener('click', () => {
        const d = getDelegation() || {};
        const plan = planFromGoal(d.goal || goalText);
        d.step = 'workbench';
        d.dept = plan.deptId;
        d.goal = plan.goal;
        d.deliverable = plan.dept.deliverable;
        d.plan = plan.chain.map(n => n.name + ' · ' + n.deliverable);
        const noteEl = document.getElementById('plan-note');
        if (noteEl && noteEl.value.trim()) d.note = noteEl.value.trim();
        setDelegation(d);
        localStorage.setItem('mpv2-mode', 'project');
        localStorage.setItem('mpv2-last-work', 'dept.html?dept=' + plan.deptId);
        location.replace(withRole('dept.html?dept=' + plan.deptId));
      });
    }
  }

  function wireGoalForm(formId, inputId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const goal = (document.getElementById(inputId) || {}).value || '';
      if (!goal.trim()) { toast('请先填写业务目标'); return; }
      const plan = planFromGoal(goal.trim());
      setDelegation({ goal: plan.goal, step: 'plan', dept: plan.deptId });
      location.href = withRole('delegate.html?step=plan');
    });
  }

  function wireFilterChips(rootSel, onChange) {
    const root = document.querySelector(rootSel);
    if (!root) return;
    root.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.filter-chip').forEach(b => b.classList.toggle('active', b === btn));
        onChange(btn.dataset.filter || 'all');
      });
    });
  }

  function wireDocketPage() {
    if ((document.body.dataset.page || '') !== 'docket') return;
    const list = document.querySelector('[data-docket-list]');
    const empty = document.querySelector('[data-docket-empty]');
    if (!list) return;
    const rows = () => [...list.querySelectorAll('.docket-row')];
    function apply(f) {
      let visible = 0;
      rows().forEach(row => {
        const st = row.dataset.status || 'all';
        let show = f === 'all' || st === f || (f === 'soon' && (st === 'soon' || row.classList.contains('is-today')));
        if (f === 'overdue') show = st === 'overdue' || row.classList.contains('is-overdue');
        row.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      if (empty) empty.classList.toggle('hidden', visible > 0);
      list.classList.toggle('hidden', visible === 0);
    }
    wireFilterChips('[data-docket-filter]', apply);
    // empty demo via ?empty=1
    if (qs('empty') === '1') {
      rows().forEach(r => r.classList.add('hidden'));
      list.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
    }
  }

  function wireCasesPage() {
    if ((document.body.dataset.page || '') !== 'cases') return;
    const list = document.querySelector('[data-cases-list]');
    const empty = document.querySelector('[data-cases-empty]');
    if (!list) return;
    const rows = () => [...list.querySelectorAll('a.row')];
    function apply(f) {
      let visible = 0;
      rows().forEach(row => {
        const st = row.dataset.caseStatus || '';
        const dl = row.dataset.caseDeadline || '';
        let show = true;
        if (f === 'soon') show = dl === 'soon' || dl === 'today' || dl === 'overdue';
        else if (f === 'pending') show = st === 'pending';
        else if (f === 'active') show = st === 'active';
        row.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      // head stays; empty when none
      const forceEmpty = qs('empty') === '1' || (!hasCase() && qs('nocase') === '1');
      if (forceEmpty) {
        rows().forEach(r => r.classList.add('hidden'));
        visible = 0;
      }
      if (empty) empty.classList.toggle('hidden', visible > 0);
      // keep table head visible when rows exist
      list.classList.toggle('is-filtered-empty', visible === 0);
      if (visible === 0) list.querySelectorAll('a.row').forEach(r => r.classList.add('hidden'));
    }
    wireFilterChips('[data-cases-filter]', apply);
    apply('all');
  }

  function wireBillingMembersEmpty() {
    const page = document.body.dataset.page || '';
    if (page === 'billing' && qs('empty') === '1') {
      document.querySelectorAll('.billing-summary, .pocket-grid, .billing-ledger').forEach(el => el.classList.add('hidden'));
      const empty = document.querySelector('[data-billing-empty]');
      if (empty) empty.classList.remove('hidden');
    }
    if (page === 'members' && qs('empty') === '1') {
      document.querySelectorAll('[data-members-list], .members-toolbar').forEach(el => el.classList.add('hidden'));
      const empty = document.querySelector('[data-members-empty]');
      if (empty) empty.classList.remove('hidden');
    }
  }

  function wireHome() {
    document.querySelectorAll('[data-fill]').forEach(b => {
      b.addEventListener('click', () => {
        const inp = document.getElementById('lead-input');
        if (inp) inp.value = b.dataset.fill;
      });
    });
    document.querySelectorAll('[data-fill-assist]').forEach(b => {
      b.addEventListener('click', () => {
        const inp = document.getElementById('lead-input-assist');
        if (inp) inp.value = b.dataset.fillAssist;
      });
    });
    wireGoalForm('lead-form', 'lead-input');
    wireGoalForm('lead-form-assist', 'lead-input-assist');
  }
  function wireCompanyPage() {
    document.querySelectorAll('[data-company-fill]').forEach(b => {
      b.addEventListener('click', () => {
        const inp = document.getElementById('company-lead-input');
        if (inp) inp.value = b.dataset.companyFill;
      });
    });
    wireGoalForm('company-lead-form', 'company-lead-input');
    wireCompanySnapshot();
  }

  window.MPV2 = {
    DEPTS, DEPT_ORDER, role, setRole, mode, setMode, hasCase, setHasCase, qs, normalizeDeptId, deptFromQuery, toast, withRole,
    getDelegation, setDelegation, getSnapshot, setSnapshot, goWorkDept, exitProfessional,
    pendingDeptForRole, gateHref, applyBellByRole, lastWorkHref,
    wireShell, wireDeptPage, wirePending, wireChecklist, wireDelegate, wireHome, wireCompanyPage, wireCompanySnapshot, wireProfessionalPage, injectGuyanPresence, syncDeptFold, applyRelayHandoff,
    renderExperts, renderRailExperts, renderExpertFaces, renderProfExperts, wireWelcomeShelf, wireCompanyDeptFaces, planFromGoal, wireWelcomeGoalDemo, gapActionsFor
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (ensureProfessionalLanding()) return;
    const page = document.body.dataset.page;
    // Capability page always owns 专业档（顶栏选中态）
    if (page === 'professional') localStorage.setItem('mpv2-mode', 'studio');
    wireShell();
    injectGuyanPresence();
    document.querySelectorAll('[data-go-professional]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('mpv2-mode', 'studio');
        location.href = withRole(a.getAttribute('href') || 'professional.html');
      });
    });
    if (page === 'welcome') { wireWelcomeShelf(); wireWelcomeGoalDemo(); }
    if (page === 'pending') { wirePending(); return; }
    if (page === 'dept') wireDeptPage();
    if (page === 'delegate') wireDelegate();
    if (page === 'home') wireHome();
    if (page === 'company') wireCompanyPage();
    if (page === 'professional') wireProfessionalPage();
    if (page === 'docket') wireDocketPage();
    if (page === 'cases') wireCasesPage();
    wireBillingMembersEmpty();
  });
})();
