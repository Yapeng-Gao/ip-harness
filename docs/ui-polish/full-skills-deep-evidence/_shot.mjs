import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = '/workspace/ip-harness/docs/ui-polish/full-skills-deep-evidence';
fs.mkdirSync(OUT, { recursive: true });

/** @type {{shell:string, port:number, route:string, file:string}[]} */
const jobs = [
  // mid 5173
  ['mid',5173,'/','mid-5173-home.png'],
  ['mid',5173,'/pipeline','mid-5173-pipeline.png'],
  ['mid',5173,'/cases','mid-5173-cases.png'],
  ['mid',5173,'/docket','mid-5173-docket.png'],
  ['mid',5173,'/agencies','mid-5173-agencies.png'],
  ['mid',5173,'/insight/tracks','mid-5173-insight-tracks.png'],
  ['mid',5173,'/settings','mid-5173-settings.png'],
  // workbench 5174
  ['workbench',5174,'/workbench','workbench-5174-workbench.png'],
  ['workbench',5174,'/workbench/research','workbench-5174-research.png'],
  ['workbench',5174,'/workbench/intake','workbench-5174-intake.png'],
  ['workbench',5174,'/workbench/draft','workbench-5174-draft.png'],
  ['workbench',5174,'/workbench/prosecution','workbench-5174-prosecution.png'],
  ['workbench',5174,'/workbench/maintain','workbench-5174-maintain.png'],
  ['workbench',5174,'/workbench/monetize','workbench-5174-monetize.png'],
  ['workbench',5174,'/workbench/watch','workbench-5174-watch.png'],
  ['workbench',5174,'/workbench/layout','workbench-5174-layout.png'],
  // agent 5175
  ['agent',5175,'/agent','agent-5175-agent.png'],
  ['agent',5175,'/agent/sessions','agent-5175-sessions.png'],
  ['agent',5175,'/agent/agents','agent-5175-agents.png'],
  ['agent',5175,'/agent/harness','agent.5175-harness.png'],
  ['agent',5175,'/agent/sessions/sess-oa-1','agent-5175-session-oa.png'],
  // ops 5176
  ['ops',5176,'/','ops-5176-home.png'],
  ['ops',5176,'/logs','ops-5176-logs.png'],
  ['ops',5176,'/monitor','ops-5176-monitor.png'],
  ['ops',5176,'/models','ops-5176-models.png'],
  ['ops',5176,'/infra','ops-5176-infra.png'],
  ['ops',5176,'/config','ops-5176-config.png'],
  // iam 5177
  ['iam',5177,'/','iam-5177-home.png'],
  ['iam',5177,'/login','iam-5177-login.png'],
  // doc-harness 5178 (SPA home = editor)
  ['doc-harness',5178,'/','doc-harness-5178-home.png'],
  // ai-infra 5179
  ['ai-infra',5179,'/','ai-infra-5179-home.png'],
  ['ai-infra',5179,'/gpus','ai-infra-5179-gpus.png'],
  ['ai-infra',5179,'/jobs','ai-infra-5179-jobs.png'],
  ['ai-infra',5179,'/endpoints','ai-infra-5179-endpoints.png'],
  ['ai-infra',5179,'/models','ai-infra-5179-models.png'],
  ['ai-infra',5179,'/pipelines','ai-infra-5179-pipelines.png'],
  ['ai-infra',5179,'/loadtest','ai-infra-5179-loadtest.png'],
  ['ai-infra',5179,'/alerts','ai-infra-5179-alerts.png'],
  // ai-data 5181
  ['ai-data',5181,'/','ai-data-5181-home.png'],
  ['ai-data',5181,'/sources','ai-data-5181-sources.png'],
  ['ai-data',5181,'/pipelines','ai-data-5181-pipelines.png'],
  ['ai-data',5181,'/datasets','ai-data-5181-datasets.png'],
  ['ai-data',5181,'/recipes','ai-data-5181-recipes.png'],
  ['ai-data',5181,'/quality','ai-data-5181-quality.png'],
  ['ai-data',5181,'/lineage','ai-data-5181-lineage.png'],
  ['ai-data',5181,'/exports','ai-data-5181-exports.png'],
  // search 5182
  ['search',5182,'/','search-5182-home.png'],
  ['search',5182,'/saved','search-5182-saved.png'],
  ['search',5182,'/corpus','search-5182-corpus.png'],
  ['search',5182,'/families/fam-battery-solid','search-5182-families-fam-battery-solid.png'],
  // fto 5183
  ['fto',5183,'/','fto-5183-home.png'],
  ['fto',5183,'/features','fto-5183-features.png'],
  ['fto',5183,'/hits','fto-5183-hits.png'],
  ['fto',5183,'/matrix','fto-5183-matrix.png'],
  ['fto',5183,'/risk','fto-5183-risk.png'],
  ['fto',5183,'/report','fto-5183-report.png'],
  // mining 5184
  ['mining',5184,'/','mining-5184-home.png'],
  ['mining',5184,'/disclosure','mining-5184-disclosure.png'],
  ['mining',5184,'/candidates','mining-5184-candidates.png'],
  ['mining',5184,'/score','mining-5184-score.png'],
  ['mining',5184,'/send','mining-5184-send.png'],
  // inspire 5185
  ['inspire',5185,'/','inspire-5185-home.png'],
  ['inspire',5185,'/sparks','inspire-5185-sparks.png'],
  ['inspire',5185,'/favorites','inspire-5185-favorites.png'],
  ['inspire',5185,'/send','inspire-5185-send.png'],
  // landscape 5186
  ['landscape',5186,'/','landscape-5186-home.png'],
  ['landscape',5186,'/tree','landscape-5186-tree.png'],
  ['landscape',5186,'/insights','landscape-5186-insights.png'],
  ['landscape',5186,'/ingest','landscape-5186-ingest.png'],
  ['landscape',5186,'/nodes/edrive','landscape-5186-nodes-edrive.png'],
  ['landscape',5186,'/orgs/org-byd','landscape-5186-orgs-org-byd.png'],
  // figure 5187
  ['figure',5187,'/','figure-5187-home.png'],
  ['figure',5187,'/new','figure-5187-new.png'],
  ['figure',5187,'/edit/fig-seed-exploded','figure-5187-edit-fig-seed-exploded.png'],
  ['figure',5187,'/versions/fig-seed-exploded','figure-5187-versions-fig-seed-exploded.png'],
  ['figure',5187,'/attach/fig-seed-exploded','figure-5187-attach-fig-seed-exploded.png'],
].map(([shell,port,route,file]) => ({shell,port,route,file}));

// fix typo
for (const j of jobs) {
  if (j.file === 'agent.5175-harness.png') j.file = 'agent-5175-harness.png';
}

const browser = await chromium.launch({ headless: true });
const results = [];

async function shot(job) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const url = `http://127.0.0.1:${job.port}${job.route}`;
  let status = null;
  let err = null;
  let title = '';
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
    status = resp?.status() ?? null;
    await page.waitForTimeout(600);
    title = await page.title();
    const outPath = path.join(OUT, job.file);
    await page.screenshot({ path: outPath, fullPage: false });
    results.push({ ...job, url, status, title, ok: true, file: outPath });
    console.log('OK', job.file, status, title.slice(0,40));
  } catch (e) {
    err = String(e?.message || e);
    results.push({ ...job, url, status, title, ok: false, error: err });
    console.log('FAIL', job.file, err.slice(0,120));
  } finally {
    await context.close();
  }
}

// concurrency 4
const queue = [...jobs];
async function worker() {
  while (queue.length) {
    const job = queue.shift();
    if (!job) break;
    await shot(job);
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
await browser.close();

fs.writeFileSync(path.join(OUT, 'smoke.json'), JSON.stringify(results, null, 2));
const ok = results.filter(r => r.ok).length;
console.log(`DONE ${ok}/${results.length}`);
