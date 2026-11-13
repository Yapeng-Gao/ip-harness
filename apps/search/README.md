# apps/search · 检索服务（样机）

对照样机：关键词 / 语义 / 高级（字段行）三模式、结果过滤、同族折叠、详情抽屉、工作篮「送 Agent / 下游占位」、**语料/索引运维示意**（`/corpus`）、Agent JSON 同引擎形状。  
**默认样机 mock**；开 `VITE_SEARCH_API_URL` 可接 `:5190`（`backend: sqlite-fts`，仍非全球专利库）。用法对标智慧芽/Innojoy。

**不改** mid / workbench / agent / ops / iam / doc-harness / ai-infra / ai-data 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5182**）。  
**禁止**持有或写入 `PatentCase` / DomainCommand。

规格：`docs/architecture/search/`（已有 overview / human-ui / agent-api-shape / deep-demo；本 README 不替代架构篇。`corpus-ops.md` 待建）。

## 启动

在 **repo 根**：

```bash
# mock（默认）— 内存种子，backend: mock
npm run dev:search

# 旗标接 Search API :5190（需另开 npm run dev:search-api）
VITE_SEARCH_API_URL=http://localhost:5190 npm run dev:search
# 或：npm run dev:search:api
```

→ http://localhost:5182

| Env | 默认 | 行为 |
|-----|------|------|
| `VITE_SEARCH_API_URL` | **空** = mock | 非空如 `http://localhost:5190` → `POST /search` |
| `VITE_SEARCH_API_TIMEOUT_MS` | 3000 | 超时 / 非 2xx / 网络错误 → 回退 mock + toast |

失败 toast：`Search API 不可用，已回退样机 mock`。UI 展示返回的 `backend`（API 成功时为 `sqlite-fts`）。**不改** `APP_PORTS`。

```bash
npm run typecheck -w @ip/search
```

## 可点闭环（B1 / W0）

| # | 面 | 如何点通 |
|---|-----|----------|
| 1 | 三模式 | 顶栏切「关键词 / 语义 / 高级」；草稿保留；空查询或坏布尔 / 空高级行 → 输入下红色 `role=alert` |
| 2 | 检索 → 列表 | 点「检索」→ `idle→running→done|empty|error`；默认 `backend: mock`；旗标开且 API 在跑 → `sqlite-fts` + `tookMs` |
| 3 | 过滤 + 同族 | 改国家/IPC/申请人/日期/法律状态 →「应用过滤并重跑」；勾选同族折叠 → 代表件 +「同族 N 件」展开 |
| 4 | 详情抽屉 | 点命中行 → 右侧抽屉；Esc / 遮罩关闭；可加篮 / 收藏 |
| 5 | 工作篮 + 送 Agent | 加篮后点「送 Agent」→ 事件日志（样机·未真派发）；`/saved` 同能力 |
| 6 | Agent JSON | 右侧（或窄屏折叠）面板：SearchQuery + SearchResponse + commercial_patent_search / cluster_hits |
| 7 | 诚实横幅 | `role=status` 含「无真检索后台」 |

可选：勾「下次强制失败」验证 error → 关闭回 idle。同族深链 `/families/:familyId`。

## 可点闭环（W1 · C1 / C2）

| # | 面 | 如何点通 |
|---|-----|----------|
| C1-1 | 语料源入库 | 侧栏「语料 / 索引」→ `/corpus`；≥4 源点「入库」→ job `queued→running→done|fail` 假进度条；可选「下次强制失败」 |
| C1-2 | 发布索引 | 入库 **done** 后「发布索引」启用 → 追加不可变 `idx-v*`（tag / docs / checksum / fieldCoverage）；已发布不可改 |
| C1-3 | 字段覆盖 | 表：publicationNumber / title / applicant / date / ipc / abstract / claims / familyId；部分 &lt;100%（样机估算） |
| C1-4 | 诚实文案 | 页内：≠ ai-data；无真 ES / 倒排 / 对象存储；入库不写 PatentCase |
| C1-5 | Agent corpus | 面板 / 页内 JSON：`search.corpus.ingest` \| `search.corpus.publishIndex`，`backend: 'mock'` |
| C2-1 | 下游四键 | 工作篮非空时：送 FTO (:5183) / 挖掘 (:5184) / 全景 (:5186) / 文档 (:5178)；空篮禁用 |
| C2-2 | 事件 + 深链 | 点击追加 `sendDownstream` + toast「样机·跨口未共享 LS，已用共享种子」；深链标「已开壳 · 篮未跨口同步 · 请用共享种子/本壳导入」；**不**真派发 / **不**跨口 LS |

## 诚实边界

| 项 | 现状 |
|----|------|
| ES / 向量 / 商业库 | **无**；内存种子评分 |
| 同族 | 预置 `familyId`，非真 INPADOC |
| 语料 / 索引 | 假入库 + 假 index version；**≠** ai-data 训练湖 |
| Agent | 面板 JSON + 事件日志；**无**真派发 |
| 下游 FTO/挖掘/全景/文档 | 已开壳深链；篮未跨口同步（策略 A 共享种子公开号） |
| PatentCase | **禁止**写入 |
| APP_PORTS | **不改**；仅本壳 Vite `:5182` `strictPort` |

## 改动边界

只改 `apps/search/**` 与 `docs/search/**`；根 `package.json` 的 `dev:search` 已存在。禁止改五壳、doc-harness、ai-*、packages 行为与 e2e。


## 旗标接线（P4）+ 策略 A（P5）

- **P4**：`VITE_SEARCH_API_URL` 空 → mock；非空 → Search API；失败回退 mock + 诚实 toast。见 `docs/architecture/search/search-api-flag-5190.md`。
- **P5**：种子含共享公开号 `CN115123456A` / `US20230123456A1` / `EP4123456A1` / `CN118234567A`（id `h01`/`h02`/`h03`/`h15`，与 fto/mining 对齐）。送下游不写跨口 LS。
- **landscape**：全景壳可能仍缺 `CN118234567A`；本壳四号齐全，不改 `apps/landscape`。
- 可选 `.env.example`：复制为 `.env.local` 后重启 Vite。

## 非本波（留给后续）

- **W2+** FTO / 挖掘 / 全景 / 附图等独立壳（D1–D5）  
- 真 ES / 倒排 / 对象存储  
- `docs/architecture/search/corpus-ops.md`（architecture Owner）
