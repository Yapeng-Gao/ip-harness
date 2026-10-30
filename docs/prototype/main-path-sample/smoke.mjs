#!/usr/bin/env node
/**
 * Acceptance smoke for main-path-sample on :8769
 * Run: python3 -m http.server 8769   (in this folder)
 *      node smoke.mjs
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.env.SAMPLE_ACCEPT_OUT
  || path.resolve(__dirname, "../../../tools/_tmp_shots/sample-accept");
fs.mkdirSync(outDir, { recursive: true });

const require = createRequire(import.meta.url);
let chromium;
const candidates = [
  path.resolve(__dirname, "./node_modules/playwright"),
  path.resolve(__dirname, "../../../node_modules/playwright"),
  path.resolve(__dirname, "../../../apps/agent/node_modules/playwright"),
  "playwright",
];
for (const c of candidates) {
  try {
    ({ chromium } = require(c));
    break;
  } catch {}
}
if (!chromium) {
  console.error("playwright not found");
  process.exit(2);
}

const BASE = process.env.SAMPLE_URL || "http://127.0.0.1:8769/";
const checks = [];
function check(name, pass, detail = "") {
  checks.push({ name, pass: !!pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(BASE, { waitUntil: "networkidle" });

  const front = await page.locator('[data-testid="front-desk-card"]').count();
  const doors = await page.locator("#deptWall .dept-door").count();
  check("L1 shows 前台", front === 1);
  check("L1 shows 8 dept doors", doors === 8, `got ${doors}`);

  await page.click('[data-testid="open-front"]');
  await page.click('[data-testid="load-sample"]');
  await page.waitForSelector('[data-testid="analyzing"]', { timeout: 2000 }).catch(() => {});
  await page.waitForSelector('[data-testid="f2-analysis"]', { timeout: 5000 });
  check("sample/upload → F2 analysis", await page.locator('[data-testid="f2-analysis"]').count() === 1);

  await page.click('[data-testid="to-f3"]');
  await page.waitForSelector('[data-testid="f3-confirm"]');
  await page.click('[data-testid="try-enter-blocked"]');
  await sleep(400);
  const stillF3 = await page.locator('[data-testid="f3-confirm"]').count();
  const notD4yet = await page.locator('[data-testid="view-d4"].on').count();
  check("without F3 confirm cannot enter D4", stillF3 === 1 && notD4yet === 0);

  await page.click('[data-testid="confirm-dest"]');
  await page.waitForSelector('[data-testid="enter-d4"]');
  await page.click('[data-testid="enter-d4"]');
  await page.waitForSelector('[data-testid="view-d4"].on');
  const roster = await page.locator('[data-testid="roster"] .expert-chip').count();
  const main = await page.locator('[data-testid="d4-main"]').count();
  check("after confirm → D4 has 编制 + main产出", roster >= 3 && main === 1, `roster=${roster}`);

  const handDisabled = await page.locator('[data-testid="confirm-hand5"][disabled]').count();
  check("D4a hand5 disabled before gates", handDisabled === 1);
  await page.click('[data-testid="make-green"]');
  await sleep(200);
  const stillDisabled = await page.locator('[data-testid="confirm-hand5"][disabled]').count();
  check("D4a still blocked without fact confirm", stillDisabled === 1);
  await page.click('[data-testid="confirm-fact"]');
  await sleep(200);
  await page.click('[data-testid="confirm-hand5"]');
  await sleep(200);
  const openWo = await page.locator('[data-testid="open-wo"]').count();
  check("after gates → can open H45", openWo === 1);

  await page.click('[data-testid="open-wo"]');
  await page.waitForSelector('[data-testid="h45"]');
  check("H45 work order visible", await page.locator('[data-testid="h45"]').count() === 1);

  await page.evaluate(() => window.__SAMPLE__.openDrawer("materials"));
  await sleep(200);
  const tabs = ["materials", "checklist", "orders", "traces"];
  let tabOk = true;
  for (const t of tabs) {
    await page.click(`[data-dtab="${t}"]`);
    await sleep(100);
    const body = await page.locator("#drawerBody").innerText();
    if (!body || body.length < 2) tabOk = false;
  }
  check("DOC has 4 tabs with content", tabOk);

  await page.evaluate(() => {
    const s = window.__SAMPLE__;
    s.state.workOrderOpened = false;
    s.state.canHand5 = false;
    s.openDept("d5");
  });
  await sleep(200);
  check("B2 blocks ⑤ without 交底 path", await page.locator('[data-testid="b2-block"]').count() === 1);

  await page.screenshot({ path: path.join(outDir, "smoke-final.png"), fullPage: true });
} catch (e) {
  check("smoke threw", false, String(e));
  await page.screenshot({ path: path.join(outDir, "smoke-error.png"), fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

const report = {
  at: new Date().toISOString(),
  base: BASE,
  checks,
  pass: checks.every((c) => c.pass),
};
fs.writeFileSync(path.join(outDir, "smoke-report.json"), JSON.stringify(report, null, 2));
console.log("\nReport:", path.join(outDir, "smoke-report.json"));
console.log(report.pass ? "ALL PASS" : "HAS FAILURES");
process.exit(report.pass ? 0 : 1);
