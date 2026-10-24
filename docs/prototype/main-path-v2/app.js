/* main-path-v2 · combine behavior (thin entry · delegation chain · tiers · G1–G3 · snapshot) */
(function () {
  const DEPTS = {
    disclosure: {
      id: 'disclosure', name: '交底部', code: '00', deliverable: '技术交底书 V3',
      pitch: '访谈与事实齐套后，交出可接力的技术交底书。',
      missing: '权属声明', check: ['技术方案完整', '技术效果可验证', '替代实施方式', '权属声明'],
      experts: ['技术访谈专家', '交底书撰写专家', '林岚 · 代理师'],
      pendingTitle: '确认交底书可接力',
      pendingFact: '权属是否归澄明科技，且无职务发明争议？',
      pendingDetail: '影响交底书是否可作为申请文件部输入；确认后形成交付快照。',
      confirmType: '技术事实', next: 'research'
    },
    research: {
      id: 'research', name: '查新部', code: '01', deliverable: '可专利性检索报告 R2',
      pitch: '检索、比对、结论稿齐套，再谈能不能申请。',
      missing: '结论稿', check: ['检索式与范围', '证据来源核验', '特征比对表', '结论稿'],
      experts: ['检索分析专家', 'FTO 对照专家', '林岚 · 代理师'],
      pendingTitle: '确认查新结论可立项',
      pendingFact: '结论稿是否覆盖拟申请核心特征组合？',
      pendingDetail: '确认后立项部可读取检索结论与证据表，不会自动对外递交。',
      confirmType: '专业复核', next: 'decision'
    },
    decision: {
      id: 'decision', name: '立项部', code: '02', deliverable: '立项决议与报价单',
      pitch: '策略、报价与决议齐套，值不值得推由你拍板。',
      missing: '决议签署', check: ['保护策略建议', '费用与周期', '申请类型建议', '决议签署'],
      experts: ['布局策略专家', '报价顾问', '顾言 · 知产负责人'],
      pendingTitle: '确认立项决议',
      pendingFact: '是否按发明申请推进，并接受当前报价与周期？',
      pendingDetail: '签署后撰写部接手；未签署不启动撰写任务。',
      confirmType: '商业与风险决策', next: 'draft'
    },
    draft: {
      id: 'draft', name: '撰写部', code: '03', deliverable: '权利要求草案 V1',
      pitch: '权利要求与说明书层次清楚，写成可递交的文本。',
      missing: '权项树', check: ['独立权利要求', '从属层次', '说明书同步', '权项树'],
      experts: ['权利要求专家', '说明书撰写专家', '林岚 · 代理师'],
      pendingTitle: '确认保护范围',
      pendingFact: '独权是否覆盖 MP-300 量产控制方案？',
      pendingDetail: '确认后附图部与质检可接力；不代表同意递交。',
      confirmType: '专业复核', next: 'figure'
    },
    figure: {
      id: 'figure', name: '附图部', code: '04', deliverable: '附图包 F2',
      pitch: '流程图、结构图与图号，和说明书对齐后交卷。',
      missing: '图号核对', check: ['流程图齐全', '结构图标注', '说明书引用一致', '图号核对'],
      experts: ['附图绘制专家', '一致性核查专家', '林岚 · 代理师'],
      pendingTitle: '确认附图可并入申请包',
      pendingFact: '图号与说明书引用是否一致？',
      pendingDetail: '确认后进入递交前齐套。',
      confirmType: '专业复核', next: 'filing'
    },
    filing: {
      id: 'filing', name: '递交与程序', code: '05', deliverable: '申请包与递交核查单',
      pitch: '申请包齐套；授权人确认后才对外递交。',
      missing: '授权人确认', check: ['申请文件齐套', '费用与期限', '递交清单', '授权人确认'],
      experts: ['流程事务专家', '期限监控专家', '林岚 · 代理师'],
      pendingTitle: '确认授权递交',
      pendingFact: '授权人是否确认以当前版本对外递交？',
      pendingDetail: '未获授权人前，系统不执行对外递交。',
      confirmType: '对外交付 / 递交', next: 'oa'
    },
    oa: {
      id: 'oa', name: '审查答复', code: '06', deliverable: '意见陈述书 V2',
      pitch: '策略与争辩齐套；企业确认后代理复核再递。',
      missing: '企业确认意见', check: ['通知书拆解', '修改对照', '创造性争辩', '企业确认意见'],
      experts: ['OA 策略专家', '创造性争辩专家', '林岚 · 代理师'],
      pendingTitle: '确认答复策略',
      pendingFact: '企业是否同意有限修改 + 创造性争辩？',
      pendingDetail: '确认后代理师复核再递交；不会自动递交。',
      confirmType: '商业与风险决策', next: null
    }
  };

  const DEPT_ORDER = ['disclosure','research','decision','draft','figure','filing','oa'];

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

  function renderExperts(names) {
    return (names || []).slice(0, 3).map((e, i) => {
      const m = expertMeta(e, i);
      return '<div class="expert-row">' +
        '<img class="avatar avatar-photo avatar-small" src="' + m.src + '" alt="" width="28" height="28">' +
        '<span><strong>' + m.name + '</strong><small>' + m.status + '</small></span></div>';
    }).join('');
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
  function role() {
    return qs('role') || localStorage.getItem('mpv2-role') || 'enterprise';
  }
  function mode() {
    return localStorage.getItem('mpv2-mode') || 'project';
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
      // Dual B: enterprise defaults left-tree folded (lite center focus);
      // agency keeps full 卷宗 three-col. No 文书/协同 dual views.
      if (document.body.dataset.page === 'dept') {
        const foldBtn = document.querySelector('[data-fold-left]');
        if (r === 'enterprise') {
          root.classList.add('fold-left');
          if (foldBtn) foldBtn.textContent = '展开';
        } else {
          root.classList.remove('fold-left');
          if (foldBtn) foldBtn.textContent = '收折';
        }
      }
      // no [data-view] dual-face tabs — ban 文书/协同 dual views
    });
  }
  function setRole(r) {
    localStorage.setItem('mpv2-role', r);
    const u = new URL(location.href);
    u.searchParams.set('role', r);
    history.replaceState(null, '', u.toString());
    applyRoleUI(r);
  }

  function tierCueLabel(m) {
    if (m === 'studio') return '专业';
    if (m === 'assistant') return '助手';
    return '项目';
  }
  function applyModeUI(m) {
    document.documentElement.dataset.mode = m;
    document.documentElement.dataset.tier = m; // alias for screenshots / CSS
    document.body.dataset.mode = m;
    document.querySelectorAll('.mode-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === m);
    });
    document.querySelectorAll('[data-tier-cue]').forEach(el => {
      // outward cue = 专业 (density only; not a separate product shell)
      if (m === 'studio') el.textContent = '专业';
      else if (el.classList.contains('inline')) el.textContent = tierCueLabel(m);
      else el.textContent = '';
    });
    // assistant: hide sidebar + dept map (CSS); project: everyday; studio: denser 卷宗/多案
    document.querySelectorAll('[data-show-mode]').forEach(el => {
      const allowed = el.dataset.showMode.split(/\s+/);
      el.classList.toggle('hidden', !allowed.includes(m));
    });
    // Dept: tier classes only — layout via CSS (assistant=slim tree, not hidden)
    document.querySelectorAll('[data-tier-workbench]').forEach(wb => {
      wb.classList.toggle('tier-assist', m === 'assistant');
      wb.classList.toggle('tier-studio', m === 'studio');
      // studio densifies 卷宗; do not fight enterprise fold-left (dual B)
      if (m === 'studio' && document.documentElement.dataset.role === 'agency') {
        wb.classList.remove('fold-left');
        const foldBtn = document.querySelector('[data-fold-left]');
        if (foldBtn) foldBtn.textContent = '收折';
      }
    });
  }
  function setMode(m) {
    localStorage.setItem('mpv2-mode', m);
    applyModeUI(m);
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

  function wireShell() {
    if (qs('role')) localStorage.setItem('mpv2-role', qs('role'));
    if (qs('nocase') === '1') localStorage.setItem('mpv2-has-case', '0');
    if (qs('hascase') === '1') localStorage.setItem('mpv2-has-case', '1');
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
        toast(hasCase() ? '演示：企业有案 → 主 CTA「进入本公司」' : '演示：企业无案 → 主 CTA「开案子」');
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
        location.href = withRole(a.getAttribute('href'));
      });
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
      const hint = document.querySelector('[data-next-hint]');
      if (hint) {
        if (all) {
          hint.innerHTML = '<strong>下一步：</strong>齐套已完成 — 点击右侧「交卷 · 送待你确认」，到确认页由你拍板。';
          hint.classList.add('is-ready');
        } else {
          hint.innerHTML = '<strong>下一步：</strong>在右侧勾选齐套清单（含' + (dept.missing || '缺项') + '）→ 启用交卷。拍板在确认页，不在本台自批。';
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
      location.href = withRole('pending.html?dept=' + dept.id);
    });
  }

  function wireChecklist(deptKey) {
    const dept = DEPTS[deptKey] || DEPTS.disclosure;
    document.querySelectorAll('[data-checklist]').forEach(box => wireOneChecklist(box, dept));
  }

  function wireDeptPage() {
    const key = qs('dept') || 'disclosure';
    const dept = DEPTS[key] || DEPTS.disclosure;
    document.querySelectorAll('[data-dept-name]').forEach(el => { el.textContent = dept.name; });
    document.querySelectorAll('[data-deliverable]').forEach(el => { el.textContent = dept.deliverable; });
    document.querySelectorAll('[data-missing]').forEach(el => { el.textContent = dept.missing; });
    document.querySelectorAll('[data-confirm-type]').forEach(el => { el.textContent = dept.confirmType; });
    document.querySelectorAll('[data-checklist]').forEach(list => {
      if (list.dataset.built) return;
      list.dataset.built = '1';
      list.innerHTML = dept.check.map((c, i) => {
        const last = i === dept.check.length - 1;
        return '<label><input type="checkbox"' + (last ? '' : ' checked') +
          '><span><strong>' + c + '</strong><small style="display:block;color:var(--ink-3);margin-top:3px">' +
          (last ? '当前缺项 · 勾选后可交卷（G1）' : '已齐') + '</small></span></label>';
      }).join('');
    });
    const expertHtml = renderExperts(dept.experts);
    document.querySelectorAll('[data-experts]').forEach(el => { el.innerHTML = expertHtml; });
    document.querySelectorAll('[data-current-task]').forEach(el => {
      el.textContent = '补齐「' + (dept.missing || '缺项') + '」后交卷';
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
      if (foot) foot.textContent = on ? '有未保存修改' : '内容已同步至项目事实库（演示）';
    }
    if (editor) {
      editor.addEventListener('input', () => setDirty(true));
    }
    const saveBtn = document.querySelector('[data-save-doc]');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        setDirty(false);
        toast('新版本已保存（演示）');
      });
    }

    // Tree / editor tab sync — title + body stub must match selected file
    const DOC_STUBS = {
      '交底书 V3': {
        title: '技术交底书 V3',
        meta: '交卷物 · 技术交底书 V3',
        html:
          '<p class="doc-lead">一种磁驱泵智能控制系统的技术交底。点此正文即可编辑；右侧对话与齐套闸同步本案。</p>' +
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
          '<p>发明人签署栏 · 法务复核栏 ·（演示可改）</p>' +
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
          '<h2>文献清单</h2><p>CN… / US… / 非专利文献 2 篇（演示）。</p>'
      },
      '确认记录': {
        title: '确认记录 · 技术事实',
        meta: '卷宗 · 确认记录',
        html:
          '<p class="doc-lead">已拍板与待拍板记录（演示）。</p>' +
          '<h2>已确认</h2><p>MP-300 三点校验为已确认技术事实。</p>' +
          '<h2>待确认</h2><p>权属是否归澄明科技。</p>'
      }
    };

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
        html: '<p class="doc-lead">' + name + '（演示正文，可编辑）。</p><p>与左侧目录当前项一致。</p>'
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
        bubble.innerHTML = '<strong>我 → 顾言</strong>' + text.replace(/</g, '&lt;');
        const experts = feed.querySelector('.experts-block');
        if (experts) feed.insertBefore(bubble, experts);
        else feed.appendChild(bubble);
        chatInput.value = '';
        toast('已纳入本节点指令（演示）');
      });
    }
  }

  function wirePending() {
    const key = qs('dept') || 'disclosure';
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

    const back = document.querySelector('[data-reject-link]');
    if (back) {
      back.addEventListener('click', (e) => {
        e.preventDefault();
        const d = getDelegation();
        if (d) { d.step = 'execute'; setDelegation(d); }
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
          next: dept.next
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
    if (/fto|查新|检索|可专利|现有技术/.test(lower)) deptId = 'research';
    else if (/审查|oa|意见陈述|答复/.test(lower)) deptId = 'oa';
    else if (/立项|报价|值不值得|申请类型/.test(lower)) deptId = 'decision';
    else if (/撰写|权利要求|说明书/.test(lower)) deptId = 'draft';
    else if (/附图|流程图/.test(lower)) deptId = 'figure';
    else if (/递交|官方|国知局/.test(lower)) deptId = 'filing';
    else if (/权属|交底|保护|成果|发明/.test(lower)) deptId = 'disclosure';

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
        // After login, land on plan step with goal already stored
        cont.href = 'login.html';
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
    const step = qs('step') || 'goal';
    document.querySelectorAll('[data-step]').forEach(el => {
      const s = el.dataset.step;
      el.classList.remove('done', 'current');
      const order = ['goal','plan','execute','confirm','relay'];
      const si = order.indexOf(s);
      const ci = order.indexOf(step);
      if (si < ci) el.classList.add('done');
      if (si === ci) el.classList.add('current');
    });
    document.querySelectorAll('[data-panel]').forEach(p => {
      p.classList.toggle('hidden', p.dataset.panel !== step);
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
      if (list) {
        list.innerHTML = plan.chain.map(function (node, i) {
          return '<li><span class="ord">' + (i + 1) + '</span><div><strong>' + node.name + '</strong>' +
            node.pitch + '<small>产出：' + node.deliverable + '；关口：' + node.confirmType + '</small></div></li>';
        }).join('');
      }
      if (go) {
        go.textContent = '确认计划，去' + plan.dept.name + '执行 →';
        go.dataset.dept = plan.deptId;
      }
      // execute panel
      const et = document.getElementById('exec-title');
      const ee = document.getElementById('exec-goal-echo');
      const eg = document.getElementById('exec-go-btn');
      if (et) et.textContent = plan.dept.name + '已接手';
      if (ee) ee.textContent = '目标：「' + plan.goal + '」· 已分派到本案';
      if (eg) {
        eg.href = withRole('dept.html?dept=' + plan.deptId);
        eg.textContent = '打开' + plan.dept.name + '工作台 →';
      }
      return plan;
    }

    if (step === 'plan' || step === 'execute') {
      fillPlanUI(goalText);
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
    const confirmPlan = document.querySelector('[data-to-execute]');
    if (confirmPlan) {
      confirmPlan.addEventListener('click', () => {
        const d = getDelegation() || {};
        const plan = planFromGoal(d.goal || goalText);
        d.step = 'execute';
        d.dept = plan.deptId;
        d.plan = plan.chain.map(n => n.name + ' · ' + n.deliverable);
        const noteEl = document.getElementById('plan-note');
        if (noteEl && noteEl.value.trim()) d.note = noteEl.value.trim();
        setDelegation(d);
        // Stay on execute briefly so user sees 分派反馈, then they click into dept
        location.href = withRole('delegate.html?step=execute');
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
      setDelegation({ goal: goal.trim(), step: 'plan', dept: 'disclosure' });
      location.href = withRole('delegate.html?step=plan');
    });
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
    DEPTS, DEPT_ORDER, role, setRole, mode, setMode, hasCase, setHasCase, qs, toast, withRole,
    getDelegation, setDelegation, getSnapshot, setSnapshot,
    wireShell, wireDeptPage, wirePending, wireChecklist, wireDelegate, wireHome, wireCompanyPage, wireCompanySnapshot, injectGuyanPresence,
    renderExperts, renderExpertFaces, wireWelcomeShelf, wireCompanyDeptFaces, planFromGoal, wireWelcomeGoalDemo
  };

  document.addEventListener('DOMContentLoaded', () => {
    wireShell();
    injectGuyanPresence();
    const page = document.body.dataset.page;
    if (page === 'welcome') { wireWelcomeShelf(); wireWelcomeGoalDemo(); }
    if (page === 'dept') wireDeptPage();
    if (page === 'pending') wirePending();
    if (page === 'delegate') wireDelegate();
    if (page === 'home') wireHome();
    if (page === 'company') wireCompanyPage();
  });
})();
