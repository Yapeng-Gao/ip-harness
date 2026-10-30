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

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (e) {
  browser = await chromium.launch({ channel: "chrome", headless: true });
}
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(BASE, { waitUntil: "networkidle" });

  check("Gate shows", await page.locator('[data-testid="view-gate"].on').count() === 1);
  check("Gate card", await page.locator('[data-testid="gate-card"]').count() === 1);
  await page.click('[data-testid="gate-enter"]');
  await sleep(300);
  check("after gate → lobby", await page.locator('[data-testid="view-lobby"].on').count() === 1);

  const front = await page.locator('[data-testid="front-desk-card"]').count();
  const doors = await page.locator("#deptWall .dept-door").count();
  check("L1 shows 前台/委托", front === 1);
  check("L1 shows 8 dept doors", doors === 8, `got ${doors}`);
  check("L1 委托 composer", await page.locator('[data-testid="entrust-input"]').count() === 1);
  const entrustTxt = await page.locator('[data-testid="front-desk-card"]').innerText();
  check("L1 用语不用分诊", !entrustTxt.includes("分诊") && entrustTxt.includes("接待"), entrustTxt.slice(0, 40));
  check("L1 问候计数", await page.locator('[data-testid="lobby-greet"]').count() === 1);
  check("L1 摘要条（不展开列表）", await page.locator('[data-testid="lobby-attn-strip"]').count() === 1);
  check("L1 无首页待办墙", await page.locator('[data-testid="todo-item"]').count() === 0);
  check("L1 无首页推进轨", await page.locator('[data-testid="prog-card"]').count() === 0);
  check("L1 八部仍在", await page.locator('[data-testid="dept-wall"] .dept-door').count() === 8);
  check("Shell ⌘K densify", await page.locator('[data-testid="shell-search"]').count() === 1);
  check("Shell 定时/催办入口", await page.locator('[data-testid="btn-schedule"]').count() === 1);
  check("Shell 要你拍的入口", await page.locator('[data-testid="btn-notify"]').count() === 1);
  check("Shell 正在推进入口", await page.locator('[data-testid="btn-case-switch"]').count() === 1);
  check("Shell 案卷唯一入口", await page.locator('[data-testid="nav-cases"]').count() === 1);
  check("Shell 无重复案卷抽屉钮", await page.locator("#btnOpenDoc").count() === 0);

  // 壳级导航 · 搜索面板
  await page.click('[data-testid="shell-search"]');
  await sleep(200);
  check("搜索飞层可开", await page.locator('[data-testid="shell-fly"]:not([hidden])').count() === 1
    || await page.locator('[data-testid="fly-hit"]').count() >= 1);
  const hitN = await page.locator('[data-testid="fly-hit"]').count();
  check("搜索命中假数据", hitN >= 2, `hits=${hitN}`);
  await page.click('[data-testid="fly-close"]').catch(() => {});
  await sleep(150);

  // 定时/催办面板
  await page.click('[data-testid="btn-schedule"]');
  await sleep(200);
  const schN = await page.locator('[data-testid="fly-schedule"]').count();
  check("定时催办面板有货", schN >= 2, `sch=${schN}`);
  await page.click('[data-testid="fly-close"]').catch(() => {});
  await sleep(100);

  // 通知面板
  await page.click('[data-testid="btn-notify"]');
  await sleep(200);
  check("通知飞层有货", await page.locator('[data-testid="fly-notify"]').count() >= 1);
  await page.click('[data-testid="fly-close"]').catch(() => {});
  await sleep(100);

  // 首页摘要 → 顶栏飞层有货（列表不在首页）
  await page.click('[data-testid="lobby-todo-summary"]');
  await sleep(200);
  const flyTodoN = await page.locator('[data-testid="fly-notify"]').count();
  check("摘要点开要你拍的飞层", flyTodoN >= 2 && flyTodoN <= 6, `got ${flyTodoN}`);
  await page.click('[data-testid="fly-close"]').catch(() => {});
  await sleep(100);
  await page.click('[data-testid="lobby-prog-summary"]');
  await sleep(200);
  const flyCaseN = await page.locator('[data-testid="fly-case"]').count();
  check("摘要点开正在推进飞层", flyCaseN >= 2, `got ${flyCaseN}`);
  await page.click('[data-testid="fly-close"]').catch(() => {});
  await sleep(100);

  await page.click('[data-testid="open-front"]');
  await page.click('[data-testid="load-sample"]');
  await page.waitForSelector('[data-testid="analyzing"]', { timeout: 2000 }).catch(() => {});
  await page.waitForSelector('[data-testid="f2-analysis"]', { timeout: 5000 });
  check("sample/upload → F2 analysis", await page.locator('[data-testid="f2-analysis"]').count() === 1);
  const confN = await page.locator('[data-testid="file-conf"]').count();
  check("P0 R-哲2 前台材料置信可见", confN >= 3, `conf=${confN}`);
  const confTxt = await page.locator('[data-testid="front-file-conf-list"]').innerText();
  check("P0 R-哲2 mid 标存疑可进部", confTxt.includes("存疑") || confTxt.includes("中"), confTxt.slice(0, 60));

  await page.click('[data-testid="to-f3"]');
  await page.waitForSelector('[data-testid="f3-confirm"]');
  await page.click('[data-testid="try-enter-blocked"]');
  await sleep(400);
  const stillF3 = await page.locator('[data-testid="f3-confirm"]').count();
  const notD4yet = await page.locator('[data-testid="view-d4"].on').count();
  check("without F3 confirm cannot enter D4", stillF3 === 1 && notD4yet === 0);

  check("P0 去向卡有依据链", await page.locator('[data-testid="dest-evidence"]').count() === 1);
  check("P0 去向卡有拍板理由", await page.locator('[data-testid="jr-dest"]').count() === 1);
  await page.click('[data-testid="confirm-dest"]');
  await page.waitForSelector('[data-testid="enter-d4"]');
  const jAfterDest = await page.evaluate(() => window.__SAMPLE__.state.judgments.map(j => j.gate).join("|"));
  check("P0 R-哲3/L-哲3 确认去向写判断档案", jAfterDest.includes("确认去向"), jAfterDest);
  check("P0 去向理由含不选⑤", (await page.evaluate(() => (window.__SAMPLE__.state.judgments[0] || {}).compare || (window.__SAMPLE__.state.judgments[0] || {}).reason || "")).includes("⑤")
    || (await page.evaluate(() => (window.__SAMPLE__.state.judgments.find(j => j.gate.includes("去向")) || {}).reason || "")).length > 8);
  await page.click('[data-testid="enter-d4"]');
  await page.waitForSelector('[data-testid="view-d4"].on');
  const roster = await page.locator('[data-testid="roster"] .expert-chip').count();
  const photos = await page.locator('[data-testid="roster"] .expert-chip .av img').count();
  const main = await page.locator('[data-testid="d4-main"]').count();
  check("after confirm → D4 has 编制 + main产出", roster >= 5 && main === 1, `roster=${roster}`);
  check("D4 编制用照片头像岗", photos >= 5, `photos=${photos}`);

  const tl = await page.locator('[data-testid="d4-timeline-inner"] .tl-step').count();
  check("D4 四步时间线", tl === 4, `got ${tl}`);
  check("D4 并行任务条", await page.locator('[data-testid="task-strip"] .task-chip').count() >= 2);
  check("D4 轨迹回放", await page.locator('[data-testid="task-trace"]').count() === 1);
  check("D4 侧栏假 composer", await page.locator('[data-testid="d4-composer"]').count() === 1);
  check("D4 硬请示含依据摘录", await page.locator('[data-testid="ask-excerpt"]').count() >= 1);
  check("D4 feed 有工具轨迹芯片", await page.locator('[data-testid="tool-chips"]').count() >= 1);
  check("D4 密度态切换", await page.locator('[data-testid="density-toggle"]').count() === 1
    && await page.locator('[data-testid="density-author"]').count() === 1);
  check("D4 带教提示可关", await page.locator('[data-testid="mentor-tip"]').count() === 1);
  await page.click('[data-testid="mentor-dismiss"]');
  await sleep(150);
  check("带教已淡出", await page.locator('[data-testid="mentor-tip"]').count() === 0);
  check("D4 侧栏依据层", await page.locator('[data-testid="side-evidence"]').count() === 1);
  check("D4 @材料入口", await page.locator('[data-testid="at-toggle"]').count() === 1);
  await page.click('[data-testid="at-toggle"]');
  await sleep(120);
  check("@材料浮层", await page.locator('[data-testid="at-chip"]').count() >= 1);
  await page.click('[data-testid="at-chip"]');
  await sleep(120);
  const atVal = await page.locator('[data-testid="composer-input"]').inputValue();
  check("@材料写入 composer", atVal.includes("@"), atVal.slice(0, 40));
  check("D4 版本切换", await page.locator('[data-testid="doc-version"]').count() === 1);
  await page.click('[data-testid="ver-prev"]');
  await sleep(120);
  check("上一确认稿可切", (await page.locator('[data-testid="d4-main"]').innerText()).includes("上一确认稿"));
  await page.click('[data-testid="ver-current"]');
  await sleep(80);

  // 点编制 → 1:1 聚焦 + 看产出
  await page.click('[data-testid="expert-writer"]');
  await sleep(200);
  check("点编制切 1:1", await page.locator('[data-testid="side-1to1"]').count() === 1);
  await page.click('[data-testid="btn-see-output"]');
  await sleep(350);
  const flash = await page.locator("#sec-tech.anchor-flash, #sec-tech").count();
  check("看产出锚主栏段", flash >= 1, `sec-tech count=${flash}`);

  // composer 打一句
  await page.fill('[data-testid="composer-input"]', "请把双密封写进实施例");
  await page.click('[data-testid="composer-send"]');
  await sleep(200);
  const feedText = await page.locator('[data-testid="d4-feed"]').innerText();
  check("composer 演示进 feed", feedText.includes("双密封"), feedText.slice(0, 60));

  // 点依据摘录 → 主栏定位（回团队后硬请示仍在）
  await page.click('[data-testid="btn-back-team"]').catch(() => {});
  await sleep(150);
  const exCount = await page.locator('[data-testid="ask-excerpt"]').count();
  if (exCount) {
    await page.click('[data-testid="ask-excerpt"]');
    await sleep(300);
  }
  check("依据摘录可点", exCount >= 1);

  check("P0 D4-哲2 事实卡 T4 依据链", await page.locator('[data-testid="fact-evidence"]').count() === 1);
  check("P0 D4-哲2 四件套字段", await page.locator('[data-testid="ec-source"]').count() >= 1
    && await page.locator('[data-testid="ec-reasoning"]').count() >= 1
    && await page.locator('[data-testid="ec-compare"]').count() >= 1
    && await page.locator('[data-testid="ec-confidence"]').count() >= 1);
  check("P0 D4-哲3 无一对全绿钮", await page.locator('[data-testid="make-green"]').count() === 0);
  check("P0 D4-哲3 黄项处理入口", await page.locator('[data-testid="qc-yellow-fix"]').count() === 1);

  const handDisabled = await page.locator('[data-testid="confirm-hand5"][disabled]').count();
  check("D4a hand5 disabled before gates", handDisabled === 1);
  await page.click('[data-testid="qc-fix-data"]');
  await sleep(200);
  check("P0 D4-哲3 补数据后全绿", await page.locator('[data-testid="qc-all-green"]').count() === 1);
  const stillDisabled = await page.locator('[data-testid="confirm-hand5"][disabled]').count();
  check("D4a still blocked without fact confirm", stillDisabled === 1);
  await page.click('[data-testid="confirm-fact"]');
  await sleep(200);
  const jFact = await page.evaluate(() => window.__SAMPLE__.state.judgments.some(j => j.gate.includes("事实")));
  check("P0 D4-哲4/HA-哲4 事实确认写判断档案", jFact);
  await page.click('[data-testid="confirm-hand5"]');
  await sleep(200);
  const jHand = await page.evaluate(() => window.__SAMPLE__.state.judgments.some(j => j.gate.includes("可交")));
  check("P0 D4-哲4 可交⑤写判断档案", jHand);
  const openWo = await page.locator('[data-testid="open-wo"]').count();
  check("after gates → can open H45", openWo === 1);

  await page.click('[data-testid="open-wo"]');
  await page.waitForSelector('[data-testid="h45"]');
  check("H45 work order visible", await page.locator('[data-testid="h45"]').count() === 1);

  await page.evaluate(() => window.__SAMPLE__.openDrawer("materials"));
  await sleep(200);
  const tabs = ["materials", "checklist", "orders", "ops", "judgments"];
  let tabOk = true;
  for (const tb of tabs) {
    await page.click(`[data-dtab="${tb}"]`);
    await sleep(100);
    const body = await page.locator("#drawerBody").innerText();
    if (!body || body.length < 2) tabOk = false;
  }
  check("DOC has 5 tabs with content", tabOk);
  await page.click('[data-dtab="materials"]');
  await sleep(100);
  check("P0 R-哲2 案卷材料置信", await page.locator('[data-testid="drawer-materials"] [data-testid="file-conf"]').count() >= 1);
  await page.click('[data-dtab="ops"]');
  await sleep(100);
  check("P0 Doc-哲1 操作记录 tab", await page.locator('[data-testid="ops-log-title"]').count() === 1
    && (await page.locator("#drawerBody").innerText()).includes("操作记录"));
  await page.click('[data-dtab="judgments"]');
  await sleep(100);
  const jBody = await page.locator("#drawerBody").innerText();
  check("P0 Doc-哲1 判断档案 tab 名实分离", await page.locator('[data-testid="judgment-archive-title"]').count() === 1
    && jBody.includes("判断档案") && !jBody.startsWith("判断痕迹"));
  check("P0 Doc-哲1 判断档案有条目", await page.locator('[data-testid="judgment-item"]').count() >= 1, jBody.slice(0, 80));
  check("P0 无旧「判断痕迹」页签", await page.locator('[data-dtab="traces"]').count() === 0);

  await page.evaluate(() => {
    const s = window.__SAMPLE__;
    s.state.workOrderOpened = false;
    s.state.canHand5 = false;
    s.openDept("d5");
  });
  await sleep(200);
  check("B2 blocks ⑤ without 交底 path", await page.locator('[data-testid="b2-block"]').count() === 1);

  // ⑤ A/B/C 屏上闸 + 硬请示顺序（先关案卷抽屉，避免 backdrop 挡点击）
  await page.evaluate(() => {
    const s = window.__SAMPLE__;
    s.closeDrawer();
    s.state.workOrderOpened = true;
    s.state.canHand5 = true;
    s.state.factConfirmed = true;
    s.state.allGreen = true;
    s.state.apply = { understand: false, applyOrNot: null, submit: false, overLine: false };
    s.openDept("d5", { fromWorkOrder: true });
  });
  await sleep(250);
  check("D5 shows A/B/C strip", await page.locator('[data-testid="d5-abc"]').count() === 1);
  check("D5 侧栏 composer", await page.locator('[data-testid="d5-composer"]').count() === 1);
  check("D5 文书 tabs", await page.locator('[data-testid="d5-doc-tabs"]').count() === 1);
  check("D5 权项分页默认", await page.locator('[data-testid="d5-doc-claims"]').count() === 1);
  await page.click('[data-testid="d5-tab-spec"]');
  await sleep(150);
  check("D5 说明书分页可切", await page.locator('[data-testid="d5-doc-spec"]').count() === 1);
  await page.click('[data-testid="d5-tab-diff"]');
  await sleep(150);
  check("D5 差分对照可切", await page.locator('[data-testid="d5-doc-diff"]').count() === 1);
  await page.click('[data-testid="d5-tab-claims"]');
  await sleep(100);
  check("D5 seg A/B/C labels", (await page.locator('[data-testid="seg-a"]').count()) === 1
    && (await page.locator('[data-testid="seg-b"]').count()) === 1
    && (await page.locator('[data-testid="seg-c"]').count()) === 1);
  const bYesDisabled = await page.locator('[data-testid="confirm-apply-yes"][disabled]').count();
  check("B 申不申 disabled before A", bYesDisabled === 1);
  await page.click('[data-testid="confirm-understand"]');
  await sleep(150);
  const bYesEnabled = await page.locator('[data-testid="confirm-apply-yes"]:not([disabled])').count();
  check("B enabled after A confirm", bYesEnabled === 1);
  check("P0 HA-哲1 申不申依据链", await page.locator('[data-testid="apply-evidence"]').count() === 1);
  const submitBefore = await page.locator('[data-testid="confirm-submit5"][disabled]').count();
  check("C 确认递交 disabled before overline", submitBefore === 1);
  await page.click('[data-testid="confirm-apply-yes"]');
  await sleep(150);
  const jApply = await page.evaluate(() => window.__SAMPLE__.state.judgments.some(j => j.gate.includes("申不申") && j.option.includes("申请")));
  check("P0 HA-哲4 申不申写判断档案", jApply);
  await page.click('[data-testid="make-overline"]');
  await sleep(150);
  check("P0 HA-哲2 递交清单", await page.locator('[data-testid="submit5-manifest"]').count() === 1);
  check("P0 HA-哲2 风险声明", await page.locator('[data-testid="submit-risk"]').count() >= 1);
  const submitReady = await page.locator('[data-testid="confirm-submit5"]:not([disabled])').count();
  check("C 确认递交 enabled after overline", submitReady === 1);
  await page.click('[data-testid="confirm-submit5"]');
  await sleep(150);
  const traces = await page.evaluate(() => window.__SAMPLE__.state.traces.map(t => t.title).join("|"));
  check("hard asks recorded in traces", traces.includes("理解确认") && traces.includes("申不申") && traces.includes("确认递交"), traces);
  const jSub = await page.evaluate(() => window.__SAMPLE__.state.judgments.some(j => j.gate.includes("确认递交")));
  check("P0 HA-哲2/4 ⑤递交写判断档案", jSub);

  // 薄部：进得去 + 合格线 + 禁超卖
  await page.evaluate(() => window.__SAMPLE__.openDept("d1"));
  await sleep(200);
  check("thin dept enterable", await page.locator('[data-testid="thin-dept"]').count() === 1);
  const ban = await page.locator('[data-testid="thin-ban"]').innerText();
  check("thin shows 禁超卖", ban.includes("禁超卖") && ban.length > 8, ban.slice(0, 80));
  check("thin densify composer stub", await page.locator('[data-testid="thin-composer"]').count() === 1);

  // ⑥ 硬请示：争点 → 缩限 → 递交
  await page.evaluate(() => {
    window.__SAMPLE__.state.reply = { contentionOk: false, limitOk: false, submit: false };
    window.__SAMPLE__.state.strategyChoice = null;
    window.__SAMPLE__.state.view = "reply";
    window.__SAMPLE__.render();
  });
  await sleep(200);
  check("D6 gates visible", await page.locator('[data-testid="d6-gates"]').count() === 1);
  check("D6 侧栏 composer", await page.locator('[data-testid="d6-composer"]').count() === 1);
  check("D6 文书 tabs", await page.locator('[data-testid="d6-doc-tabs"]').count() === 1);
  await page.click('[data-testid="d6-tab-diff"]');
  await sleep(150);
  check("D6 差分对照可切", await page.locator('[data-testid="d6-doc-diff"]').count() === 1);
  await page.click('[data-testid="d6-tab-reply"]');
  await sleep(100);
  const limDisabled = await page.locator('[data-testid="confirm-limit"][disabled]').count();
  check("⑥ limit disabled before contention", limDisabled === 1);
  await page.click('[data-testid="confirm-contention"]');
  await sleep(150);
  check("P0 HA-哲3 策略双选项", await page.locator('[data-testid="strategy-opts"]').count() === 1
    && await page.locator('[data-testid="strat-A"]').count() === 1
    && await page.locator('[data-testid="strat-B"]').count() === 1);
  check("P0 HA-哲3 策略依据链", await page.locator('[data-testid="strategy-evidence"]').count() === 1);
  const impactTxt = await page.locator('[data-testid="strategy-opts"]').innerText();
  check("P0 HA-哲3 影响一句话", impactTxt.includes("影响"), impactTxt.slice(0, 60));
  await page.click('[data-testid="strat-A"]');
  await sleep(100);
  await page.click('[data-testid="confirm-limit"]');
  await sleep(150);
  const jStrat = await page.evaluate(() => window.__SAMPLE__.state.judgments.some(j => j.gate.includes("策略") && (j.option || "").includes("A")));
  check("P0 HA-哲3/4 策略写判断档案", jStrat);
  check("P0 HA-哲2 ⑥递交清单", await page.locator('[data-testid="reply-submit-manifest"]').count() === 1);
  await page.click('[data-testid="confirm-reply-submit"]');
  await sleep(150);
  const r = await page.evaluate(() => window.__SAMPLE__.state.reply);
  check("⑥ hard asks advance only after confirm", r.contentionOk && r.limitOk && r.submit);

  // 顶栏飞层回流：重置⑥痕迹后回大厅，飞层「答复」应可进⑥
  await page.evaluate(() => {
    window.__SAMPLE__.state.reply = { contentionOk: false, limitOk: false, submit: false };
    window.__SAMPLE__.state.strategyChoice = null;
    window.__SAMPLE__.goLobby();
  });
  await sleep(250);
  await page.click('[data-testid="btn-notify"]');
  await sleep(200);
  const flyItems = page.locator('[data-testid="fly-notify"]');
  const nFly = await flyItems.count();
  check("顶栏要你拍的仍有货", nFly >= 1, `fly=${nFly}`);
  let hitReply = false;
  for (let i = 0; i < nFly; i++) {
    const row = flyItems.nth(i);
    const t = await row.innerText();
    if (t.includes("答复")) {
      await row.click();
      await sleep(250);
      hitReply = (await page.locator("#viewReply.on").count()) === 1
        || (await page.locator('[data-testid="d6-gates"]').count()) === 1;
      break;
    }
  }
  check("顶栏待办可进⑥", hitReply);

  // A 类待办进④ → 默认老板轻量
  await page.evaluate(() => {
    window.__SAMPLE__.state.mentorDismissed = true;
    window.__SAMPLE__.state.factConfirmed = false;
    window.__SAMPLE__.state.enteredD4 = true;
    window.__SAMPLE__.goLobbyTodo("d4-fact");
  });
  await sleep(300);
  const lightOn = await page.locator('.density-light').count();
  const lightBtn = await page.locator('[data-testid="density-light"].on').count();
  check("A待办进④默认轻量态", lightOn >= 1 || lightBtn === 1, `shell=${lightOn} btn=${lightBtn}`);
  check("轻量有要你拍结论区或硬请示", await page.locator('[data-testid="ask-fact"]').count() >= 1
    || await page.locator('[data-testid="light-conclusion"]').count() >= 1);
  await page.click('[data-testid="density-author"]');
  await sleep(150);
  check("可切回主笔", await page.locator('[data-testid="density-author"].on').count() === 1);

  // 并行任务：顶栏「正在推进」切另一案 → 进部且任务条在
  await page.evaluate(() => window.__SAMPLE__.goLobby());
  await sleep(200);
  await page.click('[data-testid="btn-case-switch"]');
  await sleep(200);
  const cards = page.locator('[data-testid="fly-case"]');
  const nCards = await cards.count();
  check("顶栏推进案 ≥2", nCards >= 2, `cards=${nCards}`);
  if (nCards >= 2) {
    await cards.nth(1).click();
    await sleep(300);
    const onApply = await page.locator("#viewApply.on").count();
    const strip = await page.locator('[data-testid="task-strip"]').count();
    check("点推进案进部台", onApply === 1 || (await page.locator("#viewDept.on").count()) === 1 || (await page.locator("#viewReply.on").count()) === 1);
    check("进部后仍有任务条", strip >= 1);
  }

  // 案卷唯一壳入口可开抽屉
  await page.evaluate(() => window.__SAMPLE__.goLobby());
  await sleep(150);
  await page.click('[data-testid="nav-cases"]');
  await sleep(200);
  check("壳级案卷打开抽屉", await page.locator('[data-testid="doc-drawer"].on').count() === 1
    || await page.locator("#drawer.on").count() === 1);
  await page.evaluate(() => window.__SAMPLE__.closeDrawer());

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
