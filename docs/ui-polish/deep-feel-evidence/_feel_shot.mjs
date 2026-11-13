import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = '/workspace/ip-harness/docs/ui-polish/deep-feel-evidence';
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const findings = [];

function note(id, shell, msg, extra = {}) {
  findings.push({ id, shell, msg, ...extra });
  console.log(`[FIND] ${id} · ${shell}: ${msg}`);
}

async function shot(page, name) {
  const p = path.join(OUT, name);
  await page.screenshot({ path: p, fullPage: false });
  log.push({ name, ok: true });
  console.log('SHOT', name);
  return p;
}

async function goto(page, port, route, wait = 700) {
  const url = `http://127.0.0.1:${port}${route}`;
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(wait);
  return resp?.status() ?? null;
}

/** Measure press scale of first matching selector */
async function measurePress(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const before = getComputedStyle(el).transform;
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    // force :active via class probe — check if btn-press present
    const hasBtnPress = el.classList.contains('btn-press') || !!el.closest('.btn-press');
    const cs = getComputedStyle(el);
    const activeRule = [...document.styleSheets].flatMap(s => {
      try { return [...s.cssRules]; } catch { return []; }
    }).some(r => r.selectorText && r.selectorText.includes('btn-press') && r.selectorText.includes('active'));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    const r = el.getBoundingClientRect();
    return {
      hasBtnPress,
      activeRule,
      w: Math.round(r.width),
      h: Math.round(r.height),
      tag: el.tagName,
      cls: el.className?.toString?.().slice(0, 120) || '',
      before,
    };
  }, selector);
}

/** Nested radius check for card-like nests */
async function measureNestRadii(page, outerSel, innerSel) {
  return page.evaluate(({ o, i }) => {
    const outer = document.querySelector(o);
    if (!outer) return null;
    const inner = outer.querySelector(i) || document.querySelector(i);
    if (!inner) return { outerOnly: true };
    const os = getComputedStyle(outer);
    const is = getComputedStyle(inner);
    const or = parseFloat(os.borderTopLeftRadius) || 0;
    const ir = parseFloat(is.borderTopLeftRadius) || 0;
    const pad = parseFloat(os.paddingTop) || 0;
    return {
      outerR: or, innerR: ir, pad,
      concentricOk: Math.abs(or - (ir + pad)) <= 2 || pad > 24,
      delta: or - (ir + pad),
    };
  }, { o: outerSel, i: innerSel });
}

/** Find small hit targets < 40px */
async function findSmallHits(page) {
  return page.evaluate(() => {
    const sels = 'button, a, [role="button"], input[type="checkbox"], input[type="radio"]';
    const out = [];
    for (const el of document.querySelectorAll(sels)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width < 40 || r.height < 40) {
        const label = (el.getAttribute('aria-label') || el.textContent || el.className || '').toString().trim().slice(0, 60);
        out.push({ w: Math.round(r.width), h: Math.round(r.height), label, tag: el.tagName });
      }
    }
    return out.slice(0, 12);
  });
}

/** Check tabular-nums on numeric-looking elements */
async function checkTabular(page) {
  return page.evaluate(() => {
    const candidates = [];
    const walk = document.querySelectorAll('[class*="kpi"], .tabular, [class*="count"], td, .dash-scan-chip-v, [class*="score"]');
    for (const el of walk) {
      const t = (el.textContent || '').trim();
      if (!/\d/.test(t)) continue;
      const fv = getComputedStyle(el).fontVariantNumeric;
      candidates.push({
        text: t.slice(0, 40),
        tabular: fv.includes('tabular'),
        cls: (el.className || '').toString().slice(0, 80),
      });
    }
    // also KPI-like big numbers
    for (const el of document.querySelectorAll('span, div, p, dd, strong')) {
      const t = (el.textContent || '').trim();
      if (/^\d{1,6}([.,]\d+)?%?$/.test(t) && el.children.length === 0) {
        const r = el.getBoundingClientRect();
        if (r.height >= 18) {
          const fv = getComputedStyle(el).fontVariantNumeric;
          candidates.push({
            text: t,
            tabular: fv.includes('tabular'),
            cls: (el.className || '').toString().slice(0, 80),
            big: true,
          });
        }
      }
    }
    return candidates.slice(0, 30);
  });
}

async function tryClick(page, selectors, timeout = 2000) {
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count() && await loc.isVisible({ timeout: 500 })) {
        await loc.click({ timeout });
        await page.waitForTimeout(400);
        return sel;
      }
    } catch { /* continue */ }
  }
  return null;
}

async function tryFill(page, selectors, value) {
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count() && await loc.isVisible({ timeout: 500 })) {
        await loc.click({ timeout: 1500 });
        await loc.fill(value);
        await page.waitForTimeout(300);
        return sel;
      }
    } catch { /* continue */ }
  }
  return null;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

// ========== MID 5173 ==========
{
  const shell = 'mid';
  await goto(page, 5173, '/');
  await shot(page, 'mid-5173-dashboard-home.png');
  const press = await measurePress(page, '.dash-next-cta, .ui-btn-primary, .cta-work');
  const small = await findSmallHits(page);
  const tab = await checkTabular(page);
  const nest = await measureNestRadii(page, '.dash-inbox, .surface-card', '.dash-inbox-row, .dash-scan-chip');
  fs.writeFileSync(path.join(OUT, '_mid-metrics.json'), JSON.stringify({ press, small, tab, nest }, null, 2));
  if (small.filter(s => s.h < 32 && s.w < 32).length) {
    note('HIT-SMALL', shell, `dashboard has ${small.filter(s=>s.h<32).length} hits <32px`, { samples: small.slice(0,5) });
  }
  const missingTab = tab.filter(t => t.big && !t.tabular);
  if (missingTab.length) note('TABULAR', shell, `big numbers without tabular-nums: ${missingTab.map(t=>t.text).join(',')}`, { missingTab });

  // click inbox / 优先 row
  const clicked = await tryClick(page, [
    '.dash-inbox-row',
    'a.dash-inbox-row',
    '[data-testid="inbox-row"]',
    'text=办理',
    '.dash-next-cta',
  ]);
  await shot(page, 'mid-5173-inbox-or-next-click.png');
  if (clicked) console.log('mid clicked', clicked);

  await goto(page, 5173, '/pipeline');
  await shot(page, 'mid-5173-pipeline-stage.png');
  // try stage card click
  await tryClick(page, ['.mid-pipeline-card', '.pipeline-card', 'button', 'a[href*="cases"]']);
  await shot(page, 'mid-5173-pipeline-after-click.png');

  await goto(page, 5173, '/docket');
  await shot(page, 'mid-5173-docket-list.png');
  await tryClick(page, ['.mid-docket-row', 'tr', 'a[href*="cases"]', 'button']);
  await shot(page, 'mid-5173-docket-focus.png');

  await goto(page, 5173, '/cases');
  await shot(page, 'mid-5173-cases-list.png');
  await tryClick(page, ['a[href*="/cases/"]', '.list-row', 'tr a']);
  await page.waitForTimeout(600);
  await shot(page, 'mid-5173-case-detail.png');
}

// ========== WORKBENCH 5174 ==========
{
  const shell = 'wb';
  await goto(page, 5174, '/workbench');
  await shot(page, 'wb-5174-workbench-home.png');
  await goto(page, 5174, '/workbench/intake');
  await shot(page, 'wb-5174-intake-empty-or-step.png');
  // try step / fill
  await tryFill(page, ['textarea', 'input[type="text"]', '.ui-input', '.wb-draft-area'], '样机测试交底内容');
  await shot(page, 'wb-5174-intake-filled.png');
  await tryClick(page, ['button:has-text("下一步")', 'button:has-text("继续")', 'button:has-text("保存")', '.ui-btn-primary', 'button.btn-press']);
  await shot(page, 'wb-5174-intake-after-action.png');
  const nest = await measureNestRadii(page, '.surface-card, .wb-panel, [class*="rounded"]', '.wb-check-row, .wb-inset, .nest-inset');
  const press = await measurePress(page, '.ui-btn-primary, .btn-press, button');
  const small = await findSmallHits(page);
  fs.writeFileSync(path.join(OUT, '_wb-metrics.json'), JSON.stringify({ nest, press, small }, null, 2));
  if (nest && nest.concentricOk === false) note('RADIUS', shell, `non-concentric nest delta=${nest.delta}`, nest);

  await goto(page, 5174, '/workbench/research');
  await shot(page, 'wb-5174-research.png');
  await tryClick(page, ['button', '.wb-node-card', 'a']);
  await shot(page, 'wb-5174-research-interact.png');
}

// ========== AGENT 5175 ==========
{
  const shell = 'agent';
  await goto(page, 5175, '/agent');
  await shot(page, 'agent-5175-home.png');
  await goto(page, 5175, '/agent/sessions/sess-oa-1');
  await shot(page, 'agent-5175-session-confirm.png');
  // focus composer
  await tryClick(page, ['textarea', '[contenteditable="true"]', '.agent-composer textarea', 'input']);
  await shot(page, 'agent-5175-composer-focus.png');
  await tryFill(page, ['textarea', '[contenteditable="true"]'], '请核对 OA 答复要点');
  await shot(page, 'agent-5175-composer-filled.png');
  // Confirm bar
  await tryClick(page, [
    'button:has-text("确认")',
    'button:has-text("批准")',
    'button:has-text("同意")',
    '.agent-confirm-cta',
    '.confirm-hitl button',
  ]);
  await shot(page, 'agent-5175-confirm-interact.png');
  const press = await measurePress(page, '.agent-confirm-cta, .ui-btn-success, .btn-press');
  const small = await findSmallHits(page);
  fs.writeFileSync(path.join(OUT, '_agent-metrics.json'), JSON.stringify({ press, small }, null, 2));
  const tiny = small.filter(s => s.h < 28);
  if (tiny.length) note('HIT-SMALL', shell, `session has tiny hits`, { tiny: tiny.slice(0,5) });
}

// ========== OPS 5176 ==========
{
  const shell = 'ops';
  await goto(page, 5176, '/logs');
  await shot(page, 'ops-5176-logs.png');
  await tryFill(page, ['input[type="search"]', 'input[placeholder*="搜"]', 'input.ui-input', 'input'], 'error');
  await shot(page, 'ops-5176-logs-filtered.png');
  await tryClick(page, ['[role="tab"]', 'button:has-text("ERROR")', 'button:has-text("Warn")', '.segmented-item']);
  await shot(page, 'ops-5176-logs-tab.png');
  await goto(page, 5176, '/models');
  await shot(page, 'ops-5176-models.png');
  await goto(page, 5176, '/config');
  await shot(page, 'ops-5176-config.png');
  await tryClick(page, ['input[type="checkbox"]', 'button[role="switch"]', '[role="switch"]', 'label']);
  await shot(page, 'ops-5176-config-toggle.png');
  const small = await findSmallHits(page);
  fs.writeFileSync(path.join(OUT, '_ops-metrics.json'), JSON.stringify({ small }, null, 2));
  if (small.filter(s => s.h < 32).length >= 3) note('HIT-SMALL', shell, 'config/logs many small controls', { n: small.length });
}

// ========== IAM 5177 ==========
{
  const shell = 'iam';
  await goto(page, 5177, '/');
  await shot(page, 'iam-5177-home-persona.png');
  await tryClick(page, ['button', '[role="radio"]', 'label', '.segmented-item', 'a']);
  await shot(page, 'iam-5177-persona-interact.png');
  await goto(page, 5177, '/login');
  await shot(page, 'iam-5177-login.png');
  await tryClick(page, ['input[type="email"]', 'input[type="text"]', 'input[name="username"]', 'input']);
  await shot(page, 'iam-5177-login-focus.png');
  await tryFill(page, ['input[type="email"]', 'input[type="text"]', 'input[name="username"]', 'input'], 'demo@example.com');
  await tryFill(page, ['input[type="password"]'], '••••••••');
  await shot(page, 'iam-5177-login-filled.png');
}

// ========== DOC-HARNESS 5178 ==========
{
  const shell = 'doc';
  await goto(page, 5178, '/', 1200);
  await shot(page, 'doc-5178-editor.png');
  await tryClick(page, ['.ProseMirror', '[contenteditable="true"]', '.tiptap']);
  await page.keyboard.type('深评插入句：手感债检测。');
  await page.waitForTimeout(400);
  await shot(page, 'doc-5178-editor-typed.png');
  await tryClick(page, ['button:has-text("修订")', 'button:has-text("批注")', 'button:has-text("Diff")', 'button:has-text("历史")', '[aria-label*="修订"]', '[aria-label*="批注"]']);
  await shot(page, 'doc-5178-revision-or-anno.png');
  const nest = await measureNestRadii(page, '.rounded-xl', '.rounded-xl, .rounded-lg');
  fs.writeFileSync(path.join(OUT, '_doc-metrics.json'), JSON.stringify({ nest }, null, 2));
  if (nest && nest.outerR && nest.innerR && Math.abs(nest.outerR - nest.innerR) < 1 && nest.pad > 0 && nest.pad <= 24) {
    note('RADIUS', shell, `same radius nested outer=${nest.outerR} inner=${nest.innerR} pad=${nest.pad}`, nest);
  }
}

// ========== AI-INFRA 5179 ==========
{
  const shell = 'ai-infra';
  await goto(page, 5179, '/loadtest');
  await shot(page, 'ai-infra-5179-loadtest.png');
  // disabled reason
  const disabledInfo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button[disabled], [aria-disabled="true"]')];
    return btns.slice(0, 5).map(b => ({
      text: (b.textContent||'').trim().slice(0,40),
      title: b.getAttribute('title'),
      describedby: b.getAttribute('aria-describedby'),
      near: (b.parentElement?.textContent||'').trim().slice(0,120),
    }));
  });
  fs.writeFileSync(path.join(OUT, '_ai-infra-disabled.json'), JSON.stringify(disabledInfo, null, 2));
  await goto(page, 5179, '/jobs');
  await shot(page, 'ai-infra-5179-jobs.png');
  await tryClick(page, ['button', 'a', 'tr']);
  await shot(page, 'ai-infra-5179-jobs-interact.png');
  await goto(page, 5179, '/endpoints');
  await shot(page, 'ai-infra-5179-endpoints.png');
}

// ========== AI-DATA 5181 ==========
{
  const shell = 'ai-data';
  await goto(page, 5181, '/datasets');
  await shot(page, 'ai-data-5181-datasets.png');
  await tryClick(page, ['button:has-text("发布")', 'button:has-text("Publish")', 'button[disabled]', '.ui-btn']);
  await shot(page, 'ai-data-5181-datasets-publish-gate.png');
  await goto(page, 5181, '/sources');
  await shot(page, 'ai-data-5181-sources.png');
  await tryClick(page, ['button:has-text("拉取")', 'button']);
  await shot(page, 'ai-data-5181-sources-pull.png');
  await goto(page, 5181, '/exports');
  await shot(page, 'ai-data-5181-exports.png');
  await tryClick(page, ['a:has-text("回总览")', 'button:has-text("回总览")', 'a', 'button']);
  await shot(page, 'ai-data-5181-exports-cta.png');
}

// ========== SEARCH 5182 ==========
{
  const shell = 'search';
  await goto(page, 5182, '/');
  await shot(page, 'search-5182-home-empty.png');
  await tryFill(page, ['input[type="search"]', 'input[placeholder*="检索"]', 'input[placeholder*="搜"]', 'textarea', 'input'], '固态电池 正极');
  await shot(page, 'search-5182-query-filled.png');
  await tryClick(page, ['button:has-text("检索")', 'button:has-text("搜索")', 'button[type="submit"]', '.ui-btn-primary', 'button.btn-press']);
  await page.waitForTimeout(800);
  await shot(page, 'search-5182-results.png');
  await tryClick(page, ['button:has-text("收藏")', 'a[href*="families"]', '.result', 'article', 'li a']);
  await shot(page, 'search-5182-result-interact.png');
  await goto(page, 5182, '/saved');
  await shot(page, 'search-5182-saved.png');
  await goto(page, 5182, '/corpus');
  await shot(page, 'search-5182-corpus.png');
}

// ========== FTO 5183 ==========
{
  const shell = 'fto';
  await goto(page, 5183, '/features');
  await shot(page, 'fto-5183-features.png');
  await tryFill(page, ['textarea', 'input[type="text"]', '.ui-input'], '电极结构特征A');
  await tryClick(page, ['button:has-text("添加")', 'button:has-text("新增")', 'button:has-text("保存")', '.ui-btn-primary']);
  await shot(page, 'fto-5183-features-filled.png');
  await goto(page, 5183, '/hits');
  await shot(page, 'fto-5183-hits.png');
  await tryClick(page, ['button', 'input[type="checkbox"]', 'label']);
  await shot(page, 'fto-5183-hits-select.png');
  await goto(page, 5183, '/matrix');
  await shot(page, 'fto-5183-matrix.png');
  await tryClick(page, ['select', 'td button', 'button', '[role="combobox"]']);
  await shot(page, 'fto-5183-matrix-interact.png');
}

// ========== MINING 5184 ==========
{
  const shell = 'mining';
  await goto(page, 5184, '/disclosure');
  await shot(page, 'mining-5184-disclosure.png');
  await tryFill(page, ['textarea', 'input', '.ui-input'], '一种电池极片的制备方法');
  await shot(page, 'mining-5184-disclosure-filled.png');
  await goto(page, 5184, '/candidates');
  await shot(page, 'mining-5184-candidates.png');
  await tryClick(page, ['button', 'input[type="checkbox"]', 'label', 'a']);
  await shot(page, 'mining-5184-candidates-select.png');
  await goto(page, 5184, '/score');
  await shot(page, 'mining-5184-score.png');
  const tab = await checkTabular(page);
  fs.writeFileSync(path.join(OUT, '_mining-tabular.json'), JSON.stringify(tab, null, 2));
  const miss = tab.filter(t => !t.tabular && /\d/.test(t.text));
  if (miss.length >= 2) note('TABULAR', shell, `score numbers missing tabular`, { miss: miss.slice(0,6) });
}

// ========== INSPIRE 5185 ==========
{
  const shell = 'inspire';
  await goto(page, 5185, '/');
  await shot(page, 'inspire-5185-prompt.png');
  await tryFill(page, ['textarea', 'input', '.ui-input'], '绕开现有固态电解质专利的替代方案');
  await shot(page, 'inspire-5185-prompt-filled.png');
  await tryClick(page, ['button:has-text("生成")', 'button:has-text("火花")', 'button:has-text("提交")', '.ui-btn-primary', 'button']);
  await page.waitForTimeout(600);
  await shot(page, 'inspire-5185-after-submit.png');
  await goto(page, 5185, '/sparks');
  await shot(page, 'inspire-5185-sparks.png');
  await tryClick(page, ['button:has-text("收藏")', 'button', 'a']);
  await shot(page, 'inspire-5185-sparks-fav.png');
  await goto(page, 5185, '/favorites');
  await shot(page, 'inspire-5185-favorites.png');
}

// ========== LANDSCAPE 5186 ==========
{
  const shell = 'landscape';
  await goto(page, 5186, '/');
  await shot(page, 'landscape-5186-domain.png');
  await tryClick(page, ['button:has-text("汽车")', 'a:has-text("汽车")', 'button', 'a']);
  await shot(page, 'landscape-5186-domain-select.png');
  await goto(page, 5186, '/tree');
  await shot(page, 'landscape-5186-tree.png');
  await tryClick(page, ['button', '[role="treeitem"]', 'a[href*="nodes"]', '.tree-node']);
  await shot(page, 'landscape-5186-tree-expand.png');
  await goto(page, 5186, '/nodes/edrive');
  await shot(page, 'landscape-5186-node-edrive.png');
}

// ========== FIGURE 5187 ==========
{
  const shell = 'figure';
  await goto(page, 5187, '/');
  await shot(page, 'figure-5187-list.png');
  await goto(page, 5187, '/new');
  await shot(page, 'figure-5187-new.png');
  await tryFill(page, ['textarea', 'input[type="text"]', '.ui-input'], '爆炸图种子说明');
  await shot(page, 'figure-5187-new-filled.png');
  await goto(page, 5187, '/edit/fig-seed-exploded');
  await shot(page, 'figure-5187-edit-seed.png');
  await tryClick(page, ['button', 'canvas', '[role="toolbar"] button']);
  await shot(page, 'figure-5187-edit-interact.png');
  const small = await findSmallHits(page);
  fs.writeFileSync(path.join(OUT, '_figure-metrics.json'), JSON.stringify({ small }, null, 2));
  if (small.filter(s => s.h < 32).length >= 4) note('HIT-SMALL', shell, 'edit toolbar many sub-32 hits', { n: small.length, sample: small.slice(0,6) });
}

await browser.close();
fs.writeFileSync(path.join(OUT, '_findings.json'), JSON.stringify(findings, null, 2));
fs.writeFileSync(path.join(OUT, '_shot-log.json'), JSON.stringify(log, null, 2));
console.log('DONE shots', log.length, 'findings', findings.length);
