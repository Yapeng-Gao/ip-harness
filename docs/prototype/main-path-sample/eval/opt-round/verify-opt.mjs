import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
for (const c of [
  path.resolve(__dirname, "../../../../apps/agent/node_modules/playwright"),
  path.resolve(__dirname, "../../../../node_modules/playwright"),
  "playwright",
]) { try { ({ chromium } = require(c)); break; } catch {} }
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ channel: "chrome", headless: true }); }
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:8769/?v=" + Date.now(), { waitUntil: "domcontentloaded" });
await page.click('[data-testid="gate-enter"]');
await page.waitForSelector('[data-testid="view-lobby"].on');
await page.screenshot({ path: path.join(__dirname, "v-lobby.png") });

// search thickened
await page.click('[data-testid="shell-search"]');
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(__dirname, "v-search.png") });
const searchM = await page.evaluate(() => ({
  filters: document.querySelectorAll('[data-testid="fly-filter"]').length,
  hits: document.querySelectorAll('[data-testid="fly-hit"]').length,
  snips: document.querySelectorAll('.fh-snip, [data-testid="fly-hit-summary"]').length,
  goBtns: document.querySelectorAll('.fh-go').length,
}));
// filter 检索
await page.click('[data-testid="fly-filter"]:has-text("检索")');
await page.waitForTimeout(150);
await page.screenshot({ path: path.join(__dirname, "v-search-filter.png") });
const filtM = await page.evaluate(() => ({
  hits: [...document.querySelectorAll('[data-testid="fly-hit"]')].map(h => h.innerText.slice(0,40)),
}));

// d4 light + composer
await page.click('[data-testid="fly-close"]');
await page.click('[data-testid="dept-door-d4"]');
await page.waitForSelector('[data-testid="view-d4"].on');
await page.click('[data-testid="density-light"]');
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(__dirname, "v-d4-light.png") });
const d4 = await page.evaluate(() => {
  const c = document.querySelector('[data-testid="d4-composer"]')?.getBoundingClientRect();
  return { composerVisible: !!(c && c.top < innerHeight && c.height > 20), composerTop: Math.round(c?.top||0) };
});

// d5 diff via agency path
await page.evaluate(() => {
  window.__SAMPLE__.state.role = "agency";
  window.__SAMPLE__.state.applyDocTab = "diff";
  window.__SAMPLE__.openDept("d5", { fromWorkOrder: true, agencyEscort: true });
});
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(__dirname, "v-d5-diff.png") });
const d5 = await page.evaluate(() => ({
  board: !!document.querySelector('[data-testid="d5-diff-board"]'),
  pairs: document.querySelectorAll('[data-testid="diff-pair"]').length,
  marks: document.querySelectorAll("mark.diff-mark").length,
  prior: document.querySelectorAll('[data-testid="prior-hit"]').length,
  hint: !!document.querySelector('[data-testid="diff-hint"]'),
}));

// click a prior hit
await page.click('[data-testid="prior-hit"]');
await page.waitForTimeout(350);
await page.screenshot({ path: path.join(__dirname, "v-d5-prior-click.png") });

// d6 diff
await page.evaluate(() => {
  window.__SAMPLE__.state.replyDocTab = "diff";
  window.__SAMPLE__.state.view = "reply";
  window.__SAMPLE__.render();
});
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(__dirname, "v-d6-diff.png") });
const d6 = await page.evaluate(() => ({
  board: !!document.querySelector('[data-testid="d6-diff-board"]'),
  pairs: document.querySelectorAll('[data-testid="diff-pair"]').length,
}));

const out = { searchM, filtM, d4, d5, d6 };
fs.writeFileSync(path.join(__dirname, "verify-opt.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
