import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
for (const c of [
  path.resolve(__dirname, "../../node_modules/playwright"),
  path.resolve(__dirname, "../../../../node_modules/playwright"),
  path.resolve(__dirname, "../../../../apps/agent/node_modules/playwright"),
  "playwright",
]) { try { ({ chromium } = require(c)); break; } catch {} }
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ channel: "chrome", headless: true }); }
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(8000);
await page.goto("http://127.0.0.1:8769/?v=" + Date.now(), { waitUntil: "domcontentloaded" });
await page.click('[data-testid="gate-enter"]');
await page.waitForSelector('[data-testid="view-lobby"].on');
await page.screenshot({ path: path.join(__dirname, "01-lobby.png") });
const lobby = await page.evaluate(() => {
  const attn = document.querySelector('[data-testid="lobby-attn-strip"], .lobby-attn-strip');
  const sched = document.querySelector('[data-testid="btn-schedule"]');
  const body = document.body.innerText;
  return {
    hasAttn: !!(attn && attn.offsetParent !== null && attn.offsetHeight > 4),
    scheduleText: (sched?.textContent || "").replace(/\s+/g, " ").trim(),
    has定时全文: /定时/.test(sched?.textContent || ""),
    hasKimi: body.includes("对照 Kimi"),
    hasScaffold: body.includes("非聊天气泡") || body.includes("文书面板 ·"),
    greet: (document.querySelector('[data-testid="lobby-greet"]')?.innerText || "").slice(0, 160),
  };
});
await page.click('[data-testid="dept-door-d4"]');
await page.waitForSelector('[data-testid="view-d4"].on');
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(__dirname, "02-d4.png") });
const d4 = await page.evaluate(() => {
  const c = document.querySelector('[data-testid="d4-composer"]');
  const r = c?.getBoundingClientRect();
  const chrome = document.querySelector('[data-testid="wb-chrome"]');
  return {
    composerVisible: !!(r && r.top < innerHeight - 4 && r.bottom > 0 && r.height > 20),
    composerTop: r ? Math.round(r.top) : null,
    composerBottom: r ? Math.round(r.bottom) : null,
    scrollH: document.documentElement.scrollHeight,
    vh: innerHeight,
    chromeH: chrome ? chrome.offsetHeight : 0,
    bodyScroll: document.documentElement.scrollHeight > innerHeight + 40,
  };
});
await page.click('[data-testid="density-light"]');
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(__dirname, "03-d4-light.png") });
const light = await page.evaluate(() => {
  const shell = document.querySelector(".dept-shell") || document.querySelector('[data-testid="view-d4"]');
  const roster = document.querySelector('[data-testid="roster"]');
  const task = document.querySelector('[data-testid="task-strip"]');
  const lead = document.querySelector('[data-testid="lead-bar"]');
  const c = document.querySelector('[data-testid="d4-composer"]')?.getBoundingClientRect();
  return {
    densityLight: document.querySelector(".dept-shell")?.classList.contains("density-light")
      || document.body.querySelector(".density-light") != null
      || !!document.querySelector('[data-testid="density-light"].on'),
    rosterH: roster?.offsetHeight || 0,
    taskH: task?.offsetHeight || 0,
    leadH: lead?.offsetHeight || 0,
    rosterDisplay: roster ? getComputedStyle(roster).display : null,
    composerVisible: !!(c && c.top < innerHeight && c.height > 20),
  };
});
// open search
await page.click('[data-testid="shell-search"]');
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(__dirname, "04-search.png") });
const search = await page.evaluate(() => ({
  hits: document.querySelectorAll('[data-testid="fly-hit"]').length,
  flyVisible: !document.querySelector('[data-testid="shell-fly"]')?.hidden,
}));
fs.writeFileSync(path.join(__dirname, "selfcheck.json"), JSON.stringify({ lobby, d4, light, search }, null, 2));
console.log(JSON.stringify({ lobby, d4, light, search }, null, 2));
await browser.close();
