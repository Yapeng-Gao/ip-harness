/* main-path-v2 shared shell */
(function () {
  const DEPTS = {
    disclosure: {
      id: 'disclosure', name: '交底部', deliverable: '技术交底书 V3',
      missing: '权属声明', check: ['技术方案完整', '技术效果可验证', '替代实施方式', '权属声明'],
      experts: ['技术访谈专家', '交底书撰写专家', '林岚 · 代理师'],
      pendingTitle: '确认交底书可接力',
      pendingFact: '权属是否归澄明科技，且无职务发明争议？',
      pendingDetail: '影响交底书是否可作为申请文件部输入；确认后形成交付快照。'
    },
    research: {
      id: 'research', name: '查新部', deliverable: '可专利性检索报告 R2',
      missing: '结论稿', check: ['检索式与范围', '证据来源核验', '特征比对表', '结论稿'],
      experts: ['检索分析专家', 'FTO 对照专家', '林岚 · 代理师'],
      pendingTitle: '确认查新结论可立项',
      pendingFact: '结论稿是否覆盖拟申请核心特征组合？',
      pendingDetail: '确认后立项部可读取检索结论与证据表，不会自动对外递交。'
    },
    decision: {
      id: 'decision', name: '立项部', deliverable: '立项决议与报价单',
      missing: '决议签署', check: ['保护策略建议', '费用与周期', '申请类型建议', '决议签署'],
      experts: ['布局策略专家', '报价顾问', '顾言 · 知产负责人'],
      pendingTitle: '确认立项决议',
      pendingFact: '是否按发明申请推进，并接受当前报价与周期？',
      pendingDetail: '签署后撰写部接手；未签署不启动撰写任务。'
    },
    draft: {
      id: 'draft', name: '撰写部', deliverable: '权利要求草案 V1',
      missing: '权项树', check: ['独立权利要求', '从属层次', '说明书同步', '权项树'],
      experts: ['权利要求专家', '说明书撰写专家', '林岚 · 代理师'],
      pendingTitle: '确认保护范围',
      pendingFact: '独权是否覆盖 MP-300 量产控制方案？',
      pendingDetail: '确认后附图部与质检可接力；不代表同意递交。'
    },
    figure: {
      id: 'figure', name: '附图部', deliverable: '附图包 F2',
      missing: '图号核对', check: ['流程图齐全', '结构图标注', '说明书引用一致', '图号核对'],
      experts: ['附图绘制专家', '一致性核查专家', '林岚 · 代理师'],
      pendingTitle: '确认附图可并入申请包',
      pendingFact: '图号与说明书引用是否一致？',
      pendingDetail: '确认后进入递交前齐套。'
    },
    filing: {
      id: 'filing', name: '递交与程序', deliverable: '申请包与递交核查单',
      missing: '授权人确认', check: ['申请文件齐套', '费用与期限', '递交清单', '授权人确认'],
      experts: ['流程事务专家', '期限监控专家', '林岚 · 代理师'],
      pendingTitle: '确认授权递交',
      pendingFact: '授权人是否确认以当前版本对外递交？',
      pendingDetail: '未获授权人前，系统不执行对外递交。'
    },
    oa: {
      id: 'oa', name: '审查答复', deliverable: '意见陈述书 V2',
      missing: '企业确认意见', check: ['通知书拆解', '修改对照', '创造性争辩', '企业确认意见'],
      experts: ['OA 策略专家', '创造性争辩专家', '林岚 · 代理师'],
      pendingTitle: '确认答复策略',
      pendingFact: '企业是否同意有限修改 + 创造性争辩？',
      pendingDetail: '确认后代理师复核再递交；不会自动递交。'
    }
  };

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }
  function role() {
    return qs('role') || localStorage.getItem('mpv2-role') || 'enterprise';
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
  function mode() {
    return localStorage.getItem('mpv2-mode') || 'assistant';
  }
  function setMode(m) {
    localStorage.setItem('mpv2-mode', m);
    document.querySelectorAll('.mode-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === m);
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
    el._t = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function wireShell() {
    if (qs('role')) localStorage.setItem('mpv2-role', qs('role'));
    applyRoleUI(role());
    document.querySelectorAll('.role-switch button').forEach(btn => {
      btn.addEventListener('click', () => {
        setRole(btn.dataset.role);
        if (document.body.dataset.reloadOnRole === '1') location.reload();
      });
    });
    document.querySelectorAll('.mode-switch button').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    setMode(mode());
    document.querySelectorAll('[data-toast]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
        toast(el.dataset.toast);
      });
    });
  }

  function wireOneChecklist(box, dept) {
    const pane = box.closest('aside, .delivery-confirm-pane, .department-pane, .confirmation-flow') || box.parentElement;
    let submit = pane ? pane.querySelector('[data-submit-gate]') : null;
    if (!submit) {
      // climb to workbench column
      const col = box.closest('.workbench > *, .collaboration-workspace > *');
      if (col) submit = col.querySelector('[data-submit-gate]');
    }
    if (!submit) submit = box.parentElement && box.parentElement.parentElement
      ? box.parentElement.parentElement.querySelector('[data-submit-gate]') : null;
    if (!submit) return;
    const labels = () => box.querySelectorAll('input[type=checkbox]');
    function sync() {
      const list = [...labels()];
      const checked = list.filter(i => i.checked).length;
      const all = list.length > 0 && checked === list.length;
      if (all) {
        submit.removeAttribute('disabled');
        submit.classList.remove('is-disabled');
        submit.style.pointerEvents = '';
        submit.style.opacity = '';
      } else {
        submit.setAttribute('disabled', 'disabled');
        submit.classList.add('is-disabled');
        submit.style.pointerEvents = 'none';
        submit.style.opacity = '.45';
      }
      document.querySelectorAll('[data-check-count]').forEach(count => {
        count.textContent = checked + ' / ' + list.length;
      });
      document.querySelectorAll('[data-progress]').forEach(track => {
        track.style.width = ((checked / Math.max(list.length, 1)) * 100) + '%';
      });
    }
    labels().forEach(i => i.addEventListener('change', sync));
    sync();
    submit.addEventListener('click', (e) => {
      e.preventDefault();
      if (submit.hasAttribute('disabled')) return;
      location.href = 'pending.html?dept=' + dept.id + '&role=' + role();
    });
  }
  function wireChecklist(deptKey) {
    const dept = DEPTS[deptKey] || DEPTS.disclosure;
    document.querySelectorAll('[data-checklist]').forEach(box => wireOneChecklist(box, dept));
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
    const back = document.querySelector('[data-reject-link]');
    if (back) back.href = 'dept.html?dept=' + dept.id + '&role=' + role();
    const pass = document.querySelector('[data-pass-link]');
    if (pass) pass.href = 'company.html?role=' + role();
  }

  function wireDeptPage() {
    const key = qs('dept') || 'disclosure';
    const dept = DEPTS[key] || DEPTS.disclosure;
    document.querySelectorAll('[data-dept-name]').forEach(el => { el.textContent = dept.name; });
    document.querySelectorAll('[data-deliverable]').forEach(el => { el.textContent = dept.deliverable; });
    document.querySelectorAll('[data-missing]').forEach(el => { el.textContent = dept.missing; });
    document.querySelectorAll('[data-checklist]').forEach(list => {
      if (list.dataset.built) return;
      list.dataset.built = '1';
      list.innerHTML = dept.check.map((c, i) => {
        const last = i === dept.check.length - 1;
        return '<label><input type="checkbox"' + (last ? '' : ' checked') +
          '><span><strong>' + c + '</strong><small style="display:block;color:var(--ink-3);margin-top:3px">' +
          (last ? '当前缺项 · 勾选后可交卷' : '已齐') + '</small></span></label>';
      }).join('');
    });
    const experts = document.querySelector('[data-experts]');
    if (experts) {
      experts.innerHTML = dept.experts.map((e, i) =>
        '<div><span class="avatar avatar-small' + (i === 2 ? ' avatar-human' : '') + '">' +
        e.slice(0, 1) + '</span><span><strong>' + e + '</strong><small>' +
        (i === 2 ? '等待复核' : '本节点任务进行中') + '</small></span></div>'
      ).join('');
    }
    wireChecklist(key);
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
  }

  window.MPV2 = { DEPTS, role, setRole, qs, toast, wireShell, wireDeptPage, wirePending, wireChecklist };
  document.addEventListener('DOMContentLoaded', () => {
    wireShell();
    if (document.body.dataset.page === 'dept') wireDeptPage();
    if (document.body.dataset.page === 'pending') wirePending();
  });
})();
