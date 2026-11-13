import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5175';
const OUT = '/workspace/ip-harness/docs/ui-polish/agent-entry-recheck';
fs.mkdirSync(OUT, { recursive: true });

const results = {};

async function shot(page, name) {
  const p = path.join(OUT, name);
  await page.screenshot({ path: p, fullPage: false });
  return name;
}

function btnLooksPrimary(cls, styles) {
  const c = (cls || '').toLowerCase();
  if (c.includes('cta-work') || c.includes('btn-primary') || c.includes('ui-btn-primary')) return true;
  // navy-ish background heuristic
  const bg = (styles.backgroundColor || '').replace(/\s/g, '');
  // common navy / work CTA colors
  if (/rgba?\(15,\s*23,\s*42/.test(styles.backgroundColor)) return true;
  if (/rgba?\(30,\s*41,\s*59/.test(styles.backgroundColor)) return true;
  if (/rgba?\(17,\s*24,\s*39/.test(styles.backgroundColor)) return true;
  if (bg.includes('15,23,42') || bg.includes('30,41,59')) return true;
  // solid dark fill + light text often primary
  const m = styles.backgroundColor?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const tm = styles.color?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (tm) {
      const [tr, tg, tb] = [+tm[1], +tm[2], +tm[3]];
      const tlum = 0.2126 * tr + 0.7152 * tg + 0.0722 * tb;
      if (lum < 80 && tlum > 180 && parseFloat(styles.opacity || '1') > 0.9) return true;
    }
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // ========== HOME ==========
  await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);

  const homeProbe = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity || '1') > 0.05;
    };
    const buttons = [...document.querySelectorAll('button, a[role="button"], a.ui-btn, .ui-btn, [class*="cta"]')].filter(visible).map((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        text: (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        cls: (el.className || '').toString().slice(0, 120),
        bg: s.backgroundColor,
        color: s.color,
        fontWeight: s.fontWeight,
        w: Math.round(r.width),
        h: Math.round(r.height),
        top: Math.round(r.top),
        left: Math.round(r.left),
        inSidebar: !!el.closest('aside, nav, [class*="sidebar"], [class*="Sidebar"]'),
      };
    });

    // session list items in sidebar on Home
    const sidebar = document.querySelector('aside, [class*="sidebar"], [class*="Sidebar"]') || document.querySelector('nav');
    let sidebarSessionRows = 0;
    let sidebarHasNeedsHumanList = false;
    let needsHumanChip = null;
    if (sidebar) {
      const links = [...sidebar.querySelectorAll('a, button, [role="link"]')].filter(visible);
      const sessionish = links.filter((el) => {
        const t = (el.innerText || '').replace(/\s+/g, ' ');
        const href = el.getAttribute('href') || '';
        return /sess-|待确认|needs_human|会话/.test(t + href) || href.includes('/agent/sessions/');
      });
      sidebarSessionRows = sessionish.length;
      // full inbox rows often have session titles
      const rowCandidates = [...sidebar.querySelectorAll('[class*="session"], li, a')].filter(visible).filter((el) => {
        const href = el.getAttribute('href') || '';
        return href.includes('/agent/sessions/sess-') || /sess-oa|OA|待确认/.test(el.innerText || '');
      });
      sidebarHasNeedsHumanList = rowCandidates.length >= 2;
      const chip = links.find((el) => {
        const t = (el.innerText || '').replace(/\s+/g, ' ');
        const href = el.getAttribute('href') || '';
        return /待确认|needs_human/.test(t) || href.includes('filter=needs_human');
      });
      if (chip) {
        needsHumanChip = {
          text: (chip.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
          href: chip.getAttribute('href') || '',
        };
      }
    }

    // case bind dual CTAs
    const allText = document.body.innerText;
    const hasCreateBind = /创建并绑定/.test(allText);
    const hasBindExisting = /绑定已有/.test(allText);
    const optionalCase = /关联案件（可选）|案件（可选）/.test(allText);
    const mustBind = /写回中台前须绑定|须绑定/.test(allText);
    const startCta = /开始办理/.test(allText);
    const moreMenu = /更多/.test(allText);
    const newSessionPrimary = [...document.querySelectorAll('button, a')].filter(visible).some((el) => {
      const t = (el.innerText || '').replace(/\s+/g, ' ').trim();
      return (t === '新建会话' || t === '+ 新建会话' || t.startsWith('+ 新建')) && !!el.closest('aside, nav, [class*="sidebar"]');
    });

    // compose primary in main
    const main = document.querySelector('main') || document.body;
    const mainPrimaryTexts = [...main.querySelectorAll('button')].filter(visible).map((b) => (b.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean);

    return {
      buttons,
      sidebarSessionRows,
      sidebarHasNeedsHumanList,
      needsHumanChip,
      hasCreateBind,
      hasBindExisting,
      optionalCase,
      mustBind,
      startCta,
      moreMenu,
      newSessionPrimary,
      mainPrimaryTexts: mainPrimaryTexts.slice(0, 20),
      bodySnippet: allText.slice(0, 1500),
    };
  });

  // classify primary CTAs related to "start work"
  const startKeywords = /开始办理|发送|新建会话|开聊|开工/;
  const primaryStart = [];
  for (const b of homeProbe.buttons) {
    if (!startKeywords.test(b.text)) continue;
    // skip tiny icons
    if (b.w < 40 || b.h < 24) continue;
    if (btnLooksPrimary(b.cls, { backgroundColor: b.bg, color: b.color })) {
      primaryStart.push(b);
    }
  }
  // also count cta-work explicitly
  const ctaWork = homeProbe.buttons.filter((b) => /cta-work|btn-primary|ui-btn-primary/.test(b.cls) && startKeywords.test(b.text));

  const homeShot = await shot(page, 'AFTER-01-home.png');

  // open 更多 if present
  let moreShot = null;
  try {
    const moreBtn = page.getByRole('button', { name: /更多/ }).first();
    if (await moreBtn.count()) {
      await moreBtn.click({ timeout: 3000 });
      await page.waitForTimeout(400);
      moreShot = await shot(page, 'AFTER-01c-home-more.png');
    }
  } catch {}

  // case bind closeup
  const caseBindShot = await shot(page, 'AFTER-01b-home-case-bind.png');

  results['P0-AE-1'] = {
    primaryStartCount: primaryStart.length,
    primaryStart,
    ctaWork,
    startCta: homeProbe.startCta,
    newSessionPrimary: homeProbe.newSessionPrimary,
    moreMenu: homeProbe.moreMenu,
    shot: homeShot,
    moreShot,
  };

  results['P0-AE-2'] = {
    sidebarHasNeedsHumanList: homeProbe.sidebarHasNeedsHumanList,
    sidebarSessionRows: homeProbe.sidebarSessionRows,
    needsHumanChip: homeProbe.needsHumanChip,
    shot: homeShot,
  };

  results['P1-AE-1'] = {
    hasCreateBind: homeProbe.hasCreateBind,
    hasBindExisting: homeProbe.hasBindExisting,
    optionalCase: homeProbe.optionalCase,
    shot: caseBindShot,
  };

  // click needs_human chip if present
  if (homeProbe.needsHumanChip?.href || homeProbe.needsHumanChip) {
    try {
      const chip = page.locator('a[href*="filter=needs_human"], a:has-text("待确认"), button:has-text("待确认")').first();
      if (await chip.count()) {
        await chip.click({ timeout: 3000 });
        await page.waitForTimeout(600);
        await shot(page, 'AFTER-02-sessions-filter.png');
        results['P0-AE-2'].filterUrl = page.url();
      }
    } catch (e) {
      results['P0-AE-2'].chipClickError = String(e);
    }
  }

  // ========== SESSION sess-oa-1 ==========
  await page.goto(`${BASE}/agent/sessions/sess-oa-1`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);

  const sessionProbe = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };

    // find HITL dock / confirm bar
    const all = [...document.querySelectorAll('*')];
    const dock = all.find((el) => {
      const c = (el.className || '').toString();
      return /hitl-dock|agent-hitl|confirm-bar|ConfirmBar/i.test(c);
    });
    const stickyEls = all.filter((el) => {
      const p = getComputedStyle(el).position;
      return (p === 'sticky' || p === 'fixed') && visible(el);
    }).map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        cls: (el.className || '').toString().slice(0, 100),
        pos: s.position,
        top: s.top,
        bottom: s.bottom,
        y: Math.round(r.top),
        bottomY: Math.round(r.bottom),
        h: Math.round(r.height),
        text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      };
    });

    const confirmText = [...document.querySelectorAll('button, [class*="confirm"], [class*="hitl"]')]
      .filter(visible)
      .map((el) => ({
        text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        cls: (el.className || '').toString().slice(0, 80),
        disabled: el.disabled || el.getAttribute('aria-disabled') === 'true',
      }))
      .filter((x) => /批准|确认|策略|拒绝|驳回/.test(x.text));

    const body = document.body.innerText;
    const hasDisabledReason = /原因|须|请|不可|禁用|尚未|缺少|绑定/.test(body) && /批准|策略/.test(body);
    const caseBindInMiddle = (() => {
      // look for case bind near composer vertically competing
      return null;
    })();

    const dockInfo = dock
      ? (() => {
          const s = getComputedStyle(dock);
          const r = dock.getBoundingClientRect();
          return {
            cls: (dock.className || '').toString().slice(0, 120),
            pos: s.position,
            top: s.top,
            bottom: s.bottom,
            y: Math.round(r.top),
            bottomY: Math.round(r.bottom),
            h: Math.round(r.height),
            text: (dock.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120),
          };
        })()
      : null;

    // case bind strip position vs confirm
    const caseBindEl = all.find((el) => /创建并绑定|绑定已有|案件/.test(el.innerText || '') && (el.className || '').toString().length < 200 && visible(el));
    let caseBindPos = null;
    if (caseBindEl) {
      const r = caseBindEl.getBoundingClientRect();
      caseBindPos = { y: Math.round(r.top), text: (caseBindEl.innerText || '').slice(0, 60) };
    }

    return {
      stickyEls: stickyEls.slice(0, 30),
      dockInfo,
      confirmText: confirmText.slice(0, 15),
      hasDisabledReason,
      caseBindPos,
      vh: window.innerHeight,
      bodyHasHitlDock: /agent-hitl-dock|hitl-dock/.test(document.documentElement.outerHTML),
    };
  });

  const sessionShot = await shot(page, 'AFTER-03-session-confirm.png');

  // scroll middle column if possible to test sticky
  await page.evaluate(() => {
    const scrollers = [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el);
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 40;
    });
    // prefer middle/main scroller
    const main = scrollers.sort((a, b) => b.clientHeight - a.clientHeight)[0];
    if (main) main.scrollTop = Math.min(main.scrollHeight, 400);
  });
  await page.waitForTimeout(400);
  const afterScroll = await page.evaluate(() => {
    const dock = [...document.querySelectorAll('*')].find((el) => /hitl-dock|agent-hitl/i.test((el.className || '').toString()));
    if (!dock) return null;
    const s = getComputedStyle(dock);
    const r = dock.getBoundingClientRect();
    return { pos: s.position, y: Math.round(r.top), bottomY: Math.round(r.bottom), vh: window.innerHeight, cls: (dock.className || '').toString().slice(0, 100) };
  });
  await shot(page, 'AFTER-03b-session-scrolled.png');

  results['P1-AE-2'] = {
    sessionProbe,
    afterScroll,
    shot: sessionShot,
  };

  // ========== PATENT project ==========
  await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(600);

  // find a patent project link
  const projectLinks = await page.evaluate(() => {
    return [...document.querySelectorAll('a')].map((a) => ({
      href: a.getAttribute('href') || '',
      text: (a.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    })).filter((x) => x.href.includes('/agent/projects/'));
  });

  // try create patent or open existing
  let patentUrl = projectLinks.find((p) => /专利|patent/i.test(p.text))?.href;
  if (!patentUrl) {
    // try create domain patent
    try {
      const createBtn = page.getByRole('button', { name: /新建|创建/ }).first();
      if (await createBtn.count()) await createBtn.click({ timeout: 2000 });
      await page.waitForTimeout(400);
      const patentOpt = page.getByText(/专利|patent/i).first();
      if (await patentOpt.count()) {
        await patentOpt.click({ timeout: 2000 });
        await page.waitForTimeout(300);
      }
      const submit = page.getByRole('button', { name: /创建|确定|提交/ }).first();
      if (await submit.count()) {
        await submit.click({ timeout: 2000 });
        await page.waitForTimeout(800);
        patentUrl = page.url();
      }
    } catch (e) {
      results['P1-AE-3'] = { error: String(e), projectLinks };
    }
  }

  if (patentUrl && !patentUrl.startsWith('http')) patentUrl = BASE + patentUrl;
  if (patentUrl) {
    await page.goto(patentUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);
  } else {
    // fallback: look in localStorage / seed for patent project ids via evaluate navigation from list cards
    await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const first = page.locator('a[href*="/agent/projects/"]').first();
    if (await first.count()) {
      await first.click();
      await page.waitForTimeout(800);
    }
  }

  // Prefer known patent workspace: scan page for 写回中台 or 可选
  // If current project is general, try to open/create patent
  let patentProbe = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      url: location.href,
      hasMustBind: /写回中台前须绑定/.test(t),
      hasOptional: /案件（可选）|关联案件（可选）/.test(t),
      hasCreateBind: /创建并绑定/.test(t),
      hasBindExisting: /绑定已有/.test(t),
      isPatent: /专利|patent|检索|撰稿|FTO|收目标/.test(t),
      isGeneral: /通用项目|无专利步骤条/.test(t),
      snippet: t.slice(0, 1200),
    };
  });

  // if general, try create patent project
  if (!patentProbe.isPatent || patentProbe.isGeneral) {
    await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    // click domain/patent radio if create form visible
    try {
      // open create
      const newProject = page.locator('button:has-text("新建项目"), button:has-text("创建项目"), a:has-text("新建项目")').first();
      if (await newProject.count()) await newProject.click({ timeout: 2000 });
      await page.waitForTimeout(400);
      // select patent type
      const patentRadio = page.locator('label:has-text("专利"), button:has-text("专利"), [value="patent"], text=专利领域').first();
      if (await patentRadio.count()) await patentRadio.click({ timeout: 2000 });
      else {
        // click text 专利
        await page.getByText('专利', { exact: false }).first().click({ timeout: 2000 }).catch(() => {});
      }
      await page.waitForTimeout(300);
      // fill name if needed
      const nameInput = page.locator('input[name="name"], input[placeholder*="名称"], input[placeholder*="名"]').first();
      if (await nameInput.count()) await nameInput.fill('复评专利包-' + Date.now());
      const submit = page.locator('button:has-text("创建"), button:has-text("确定")').first();
      if (await submit.count()) {
        await submit.click({ timeout: 3000 });
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      patentProbe.createError = String(e);
    }
    patentProbe = await page.evaluate(() => {
      const t = document.body.innerText;
      return {
        url: location.href,
        hasMustBind: /写回中台前须绑定/.test(t),
        hasOptional: /案件（可选）|关联案件（可选）/.test(t),
        hasCreateBind: /创建并绑定/.test(t),
        hasBindExisting: /绑定已有/.test(t),
        isPatent: /专利|patent|检索|撰稿|FTO|收目标/.test(t),
        isGeneral: /通用项目|无专利步骤条/.test(t),
        snippet: t.slice(0, 1500),
      };
    });
  }

  const patentShot = await shot(page, 'AFTER-05-patent-bind.png');
  results['P1-AE-3'] = { ...patentProbe, shot: patentShot, projectLinks };

  // also probe general soft wording quickly if we can find general
  await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const generalLink = page.locator('a[href*="/agent/projects/"]').filter({ hasText: /通用|general/i }).first();
  if (await generalLink.count()) {
    await generalLink.click();
    await page.waitForTimeout(600);
    const g = await page.evaluate(() => {
      const t = document.body.innerText;
      return { hasOptional: /案件（可选）|关联案件（可选）/.test(t), hasMustBind: /写回中台前须绑定/.test(t), url: location.href };
    });
    results['P1-AE-3'].generalSoft = g;
    await shot(page, 'AFTER-04-general-bind.png');
  }

  fs.writeFileSync(path.join(OUT, '_probe.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
