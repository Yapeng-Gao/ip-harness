/* main-path-v2 · combine behavior (thin entry · delegation chain · tiers · G1–G3 · snapshot) */
(function () {
  const DEPTS = {
    disclosure: {
      id: 'disclosure', name: '交底部', code: '00', deliverable: '技术交底书 V3',
      missing: '权属声明', check: ['技术方案完整', '技术效果可验证', '替代实施方式', '权属声明'],
      experts: ['技术访谈专家', '交底书撰写专家', '林岚 · 代理师'],
      pendingTitle: '确认交底书可接力',
      pendingFact: '权属是否归澄明科技，且无职务发明争议？',
      pendingDetail: '影响交底书是否可作为申请文件部输入；确认后形成交付快照。',
      confirmType: '技术事实', next: 'research'
    },
    research: {
      id: 'research', name: '查新部', code: '01', deliverable: '可专利性检索报告 R2',
      missing: '结论稿', check: ['检索式与范围', '证据来源核验', '特征比对表', '结论稿'],
      experts: ['检索分析专家', 'FTO 对照专家', '林岚 · 代理师'],
      pendingTitle: '确认查新结论可立项',
      pendingFact: '结论稿是否覆盖拟申请核心特征组合？',
      pendingDetail: '确认后立项部可读取检索结论与证据表，不会自动对外递交。',
      confirmType: '专业复核', next: 'decision'
    },
    decision: {
      id: 'decision', name: '立项部', code: '02', deliverable: '立项决议与报价单',
      missing: '决议签署', check: ['保护策略建议', '费用与周期', '申请类型建议', '决议签署'],
      experts: ['布局策略专家', '报价顾问', '顾言 · 知产负责人'],
      pendingTitle: '确认立项决议',
      pendingFact: '是否按发明申请推进，并接受当前报价与周期？',
      pendingDetail: '签署后撰写部接手；未签署不启动撰写任务。',
      confirmType: '商业与风险决策', next: 'draft'
    },
    draft: {
      id: 'draft', name: '撰写部', code: '03', deliverable: '权利要求草案 V1',
      missing: '权项树', check: ['独立权利要求', '从属层次', '说明书同步', '权项树'],
      experts: ['权利要求专家', '说明书撰写专家', '林岚 · 代理师'],
      pendingTitle: '确认保护范围',
      pendingFact: '独权是否覆盖 MP-300 量产控制方案？',
      pendingDetail: '确认后附图部与质检可接力；不代表同意递交。',
      confirmType: '专业复核', next: 'figure'
    },
    figure: {
      id: 'figure', name: '附图部', code: '04', deliverable: '附图包 F2',
      missing: '图号核对', check: ['流程图齐全', '结构图标注', '说明书引用一致', '图号核对'],
      experts: ['附图绘制专家', '一致性核查专家', '林岚 · 代理师'],
      pendingTitle: '确认附图可并入申请包',
      pendingFact: '图号与说明书引用是否一致？',
      pendingDetail: '确认后进入递交前齐套。',
      confirmType: '专业复核', next: 'filing'
    },
    filing: {
      id: 'filing', name: '递交与程序', code: '05', deliverable: '申请包与递交核查单',
      missing: '授权人确认', check: ['申请文件齐套', '费用与期限', '递交清单', '授权人确认'],
      experts: ['流程事务专家', '期限监控专家', '林岚 · 代理师'],
      pendingTitle: '确认授权递交',
      pendingFact: '授权人是否确认以当前版本对外递交？',
      pendingDetail: '未获授权人前，系统不执行对外递交。',
      confirmType: '对外交付 / 递交', next: 'oa'
    },
    oa: {
      id: 'oa', name: '审查答复', code: '06', deliverable: '意见陈述书 V2',
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
    return (names || []).map((e, i) => {
      const m = expertMeta(e, i);
      return '<div class="expert-row">' +
        '<img class="avatar avatar-photo avatar-small" src="' + m.src + '" alt="" width="28" height="28">' +
        '<span><strong>' + m.name + '</strong><small>' + m.status + '</small></span></div>';
    }).join('');
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
      root.dataset.mode = r;
      root.querySelectorAll('[data-view]').forEach(v => {
        v.classList.toggle('hidden', v.dataset.view !== r);
      });
    });
  }
  function setRole(r) {
    localStorage.setItem('mpv2-role', r);
    const u = new URL(location.href);
    u.searchParams.set('role', r);
    history.replaceState(null, '', u.toString());
    applyRoleUI(r);
  }

  function applyModeUI(m) {
    document.documentElement.dataset.mode = m;
    document.querySelectorAll('.mode-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === m);
    });
    // assistant: hide sidebar + dept map (CSS); project: normal; studio: placeholder
    document.querySelectorAll('[data-show-mode]').forEach(el => {
      const allowed = el.dataset.showMode.split(/\s+/);
      el.classList.toggle('hidden', !allowed.includes(m));
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
    applyRoleUI(role());
    applyModeUI(mode());
    document.querySelectorAll('.role-switch button').forEach(btn => {
      btn.addEventListener('click', () => {
        setRole(btn.dataset.role);
        if (document.body.dataset.reloadOnRole === '1') location.reload();
      });
    });
    document.querySelectorAll('.mode-switch button').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
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

    // 协同 ↔ 文书 tabs
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
        foldBtn.textContent = wb.classList.contains('fold-left') ? '展开目录' : '收折目录';
      });
      if (role() === 'enterprise') {
        wb.classList.add('fold-left');
        foldBtn.textContent = '展开目录';
      }
    }

    const focusGate = document.querySelector('[data-focus-gate]');
    if (focusGate) {
      focusGate.addEventListener('click', () => {
        const pane = document.querySelector('[data-gate-pane] .gate-box, #gate-box');
        if (pane) pane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // also ensure 文书 face is visible for gate
        const docTab = document.querySelector('[data-face-tab="doc"]');
        if (docTab) docTab.click();
      });
    }

    // mark delegation step
    const d = getDelegation();
    if (d && d.step === 'execute') {
      /* stay on execute until handoff */
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

  function injectGuyanPresence() {
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
    if (existing.goal) {
      const inp = document.querySelector('#goal-input');
      if (inp && !inp.value) inp.value = existing.goal;
    }

    const startBtn = document.querySelector('[data-to-plan]');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const goal = (document.querySelector('#goal-input') || {}).value || '';
        if (!goal.trim()) { toast('请先填写业务目标'); return; }
        setDelegation({ goal: goal.trim(), step: 'plan', dept: 'disclosure' });
        location.href = withRole('delegate.html?step=plan');
      });
    }
    const confirmPlan = document.querySelector('[data-to-execute]');
    if (confirmPlan) {
      confirmPlan.addEventListener('click', () => {
        const d = getDelegation() || {};
        d.step = 'execute';
        d.dept = 'disclosure';
        d.plan = ['交底部补齐事实', '查新部检索可专利性', '立项部出决议'];
        setDelegation(d);
        location.href = withRole('dept.html?dept=disclosure');
      });
    }
  }

  function wireHome() {
    document.querySelectorAll('[data-fill]').forEach(b => {
      b.addEventListener('click', () => {
        const inp = document.getElementById('lead-input');
        if (inp) inp.value = b.dataset.fill;
      });
    });
    const form = document.getElementById('lead-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const goal = (document.getElementById('lead-input') || {}).value || '';
        if (!goal.trim()) { toast('请先填写业务目标'); return; }
        setDelegation({ goal: goal.trim(), step: 'plan', dept: 'disclosure' });
        // walkable: go to plan step — not toast-only
        location.href = withRole('delegate.html?step=plan');
      });
    }
  }

  window.MPV2 = {
    DEPTS, DEPT_ORDER, role, setRole, mode, setMode, qs, toast, withRole,
    getDelegation, setDelegation, getSnapshot, setSnapshot,
    wireShell, wireDeptPage, wirePending, wireChecklist, wireDelegate, wireHome, wireCompanySnapshot, injectGuyanPresence, renderExperts
  };

  document.addEventListener('DOMContentLoaded', () => {
    wireShell();
    injectGuyanPresence();
    const page = document.body.dataset.page;
    if (page === 'dept') wireDeptPage();
    if (page === 'pending') wirePending();
    if (page === 'delegate') wireDelegate();
    if (page === 'home') wireHome();
    if (page === 'company') wireCompanySnapshot();
  });
})();
