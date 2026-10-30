import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const require = createRequire(import.meta.url);
let chromium;
for (const c of [
  path.resolve(__dirname, "../node_modules/playwright"),
  path.resolve(__dirname, "../../node_modules/playwright"),
  path.resolve(__dirname, "../../../../node_modules/playwright"),
  path.resolve(__dirname, "../../../../apps/agent/node_modules/playwright"),
  "playwright",
]) {
  try { ({ chromium } = require(c)); break; } catch {}
}
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ channel: "chrome", headless: true }); }
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:8769/?v=" + Date.now(), { waitUntil: "networkidle" });
await page.click('[data-testid="gate-enter"]');
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "01-lobby.png"), fullPage: false });
const metrics = await page.evaluate(() => {
  const attn = document.querySelector(".lobby-attn-strip, #lobby-attn-strip, [data-testid='lobby-attn-strip']");
  const sched = document.querySelector('[data-testid="btn-schedule"], #btn-schedule');
  const body = document.body.innerText || "";
  return {
    hasAttnStrip: !!(attn && attn.offsetHeight > 0 && getComputedStyle(attn).display !== "none"),
    scheduleText: sched ? (sched.textContent || "").trim() : null,
    greetHasCounts: /待拍|推进/.test(body.slice(0, 800)),
    bodyTextHasKimi: body.includes("对照 Kimi"),
    bodyTextHasScaffold: body.includes("文书面板") || body.includes("非聊天气泡"),
    has定时: body.includes("定时"),
  };
});
await page.click('[data-testid="dept-4"], [data-dept="4"]');
await page.waitForTimeout(500);
// try common selectors
const clicked = await page.evaluate(() => {
  const el = document.querySelector('[data-testid="dept-card-4"], [data-dept="4"], .dept-tile[data-id="4"]');
  if (el) { el.click(); return el.getAttribute("data-testid") || el.className; }
  const cards = [...document.querySelectorAll("[data-testid], .dept-card, .dept-tile, button")];
  const hit = cards.find(c => /交底|④|dept-4/.test((c.textContent||"")+(c.getAttribute("data-testid")||"")));
  if (hit) { hit.click(); return "text:"+ (hit.getAttribute("data-testid")||hit.textContent.slice(0,40)); }
  return null;
});
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(OUT, "02-d4.png"), fullPage: false });
const d4m = await page.evaluate(() => {
  const composer = document.querySelector('[data-testid="composer"], .composer, #composer');
  const cr = composer?.getBoundingClientRect();
  const shell = document.querySelector(".dept-shell, .workbench, [data-testid='view-dept']");
  const body = document.body.innerText || "";
  return {
    view: document.querySelector(".view.on")?.getAttribute("data-testid") || document.querySelector(".view.on")?.id,
    composerVisible: !!(cr && cr.top < window.innerHeight && cr.bottom > 0 && cr.height > 20),
    composerTop: cr ? Math.round(cr.top) : null,
    composerBottom: cr ? Math.round(cr.bottom) : null,
    scrollH: document.documentElement.scrollHeight,
    vh: window.innerHeight,
    hasDiff: /差分/.test(body),
    has检索: /检索/.test(body),
    shellClass: shell?.className?.slice(0, 120) || null,
  };
});
// light density
await page.evaluate(() => {
  const b = document.querySelector('[data-testid="density-light"]');
  if (b) b.click();
});
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "03-d4-light.png"), fullPage: false });
const lightM = await page.evaluate(() => {
  const shell = document.querySelector(".dept-shell, .workbench");
  const roster = document.querySelector(".who-block, .roster, [data-testid='roster']");
  const task = document.querySelector(".task-strip, [data-testid='task-strip']");
  const lead = document.querySelector(".lead-bar");
  const isLight = shell?.classList.contains("density-light");
  return {
    isLight,
    rosterH: roster ? roster.offsetHeight : 0,
    taskH: task ? task.offsetHeight : 0,
    leadH: lead ? lead.offsetHeight : 0,
    rosterDisplay: roster ? getComputedStyle(roster).display : null,
    taskDisplay: task ? getComputedStyle(task).display : null,
  };
});
// go apply and open diff
await page.evaluate(() => {
  const home = document.querySelector('[data-testid="nav-home"], [data-nav="lobby"], .logo, [data-testid="btn-home"]');
  if (home) home.click();
});
await page.waitForTimeout(300);
fs.writeFileSync(path.join(OUT, "selfcheck.json"), JSON.stringify({ clicked, metrics, d4m, lightM }, null, 2));
console.log(JSON.stringify({ clicked, metrics, d4m, lightM }, null, 2));
await browser.close();
