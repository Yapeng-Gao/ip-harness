import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5175/agent/sessions/sess-oa-1', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const data = await page.evaluate(() => {
  const bar =
    document.querySelector('#session-confirm-bar') ||
    document.querySelector('[data-confirm-bar]') ||
    document.querySelector('.confirm-hitl') ||
    document.querySelector('.agent-hitl-dock');

  const barHtml = bar ? bar.outerHTML.slice(0, 2500) : 'NO BAR';
  const allText = [...(bar || document).querySelectorAll('*')].map((el) => {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean);
    if (!own.length) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    return {
      own: own.join('|').slice(0, 40),
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 60),
      fs: parseFloat(getComputedStyle(el).fontSize),
      h: Math.round(r.height),
    };
  }).filter(Boolean);

  const want = ['待批准', '待授权', '逐步'];
  const chips = want.map((t) => {
    // find smallest element whose textContent includes t (prefer exact)
    const cands = [...document.querySelectorAll('*')].filter((el) => {
      const tx = (el.textContent || '').replace(/\s+/g, '');
      return tx.includes(t.replace(/\s+/g, '')) && el.getBoundingClientRect().width > 0;
    });
    cands.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
    const el = cands[0];
    if (!el) return { t, missing: true };
    return {
      t,
      text: (el.textContent || '').trim().slice(0, 40),
      fs: parseFloat(getComputedStyle(el).fontSize),
      h: Math.round(el.getBoundingClientRect().height),
      cls: (el.className || '').toString().slice(0, 60),
      tag: el.tagName,
    };
  });

  // also probe known class names from fix
  const byClass = ['.agent-confirm-chip', '.agent-step-chip', '[class*="confirm"] [class*="chip"]', '.agent-hitl-dock [class*="badge"]', '.agent-hitl-dock span']
    .flatMap((sel) => [...document.querySelectorAll(sel)])
    .slice(0, 30)
    .map((el) => ({
      t: (el.textContent || '').trim().slice(0, 24),
      fs: parseFloat(getComputedStyle(el).fontSize),
      h: Math.round(el.getBoundingClientRect().height),
      cls: (el.className || '').toString().slice(0, 50),
    }))
    .filter((x) => x.t && x.h > 0);

  return { barFound: !!bar, barTag: bar?.tagName, barCls: (bar?.className || '').toString().slice(0, 80), chips, allText: allText.slice(0, 40), byClass, barHtml };
});

fs.writeFileSync('docs/ui-polish/agent-feel-recheck/_afe-m3-fonts.json', JSON.stringify(data, null, 2));
console.log(JSON.stringify({ chips: data.chips, byClass: data.byClass.slice(0, 15), barFound: data.barFound }, null, 2));
await browser.close();
