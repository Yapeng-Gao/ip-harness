# @ip/search-api — 检索数据面 Search API MVP

> 依据：`docs/architecture/search-data/MVP.md` · `ops-quality.md` · `docs/architecture/search/agent-api-shape.md`  
> **本包是真检索切片（sqlite-fts）**，不是 `apps/search` mock 壳。壳接线另 PR，见下文「旗标接线」。

## 技术选型

| 层 | 选择 |
|----|------|
| 元数据 | SQLite（`better-sqlite3`） |
| 倒排 | SQLite FTS5（title / abstract / claims / applicant / publication_number / ipc） |
| 对象正文 | 本地目录 `data/objects/`（按 id 存 JSON） |
| HTTP | Hono + `@hono/node-server` + cors |
| 端口 | **5190**（避开 5182 search 壳、5180 api-mock） |
| `backend` | **`sqlite-fts`**（≠ `mock`） |

必填失败策略（冻结）：**无 title 且无 publicationNumber → quarantine**（不进热索引 / FTS）。

## 启动

```bash
# 根仓
npm install
npm run generate-samples -w @ip/search-api   # ≥100 样本 + 5 条 quarantine 种子
npm run ingest -w @ip/search-api             # normalize → objects + meta + FTS + indexVersion
npm run dev:search-api                       # 或 npm run start -w @ip/search-api
```

空库时 `dev`/`start` 也会自动 ingest（若已有 samples）。

数据文件（本地，默认不提交）：`data/search.db`、`data/objects/`。样本 JSON 在 `data/samples/`（可提交）。

## curl 示例

```bash
# 健康
curl -s http://localhost:5190/health | jq

# keyword
curl -s -X POST http://localhost:5190/search \
  -H 'content-type: application/json' \
  -d '{"mode":"keyword","text":"固态电解质","limit":5}' | jq

# GET 简写
curl -s 'http://localhost:5190/search?q=battery+electrolyte&limit=5' | jq

# filter：日期 + IPC
curl -s -X POST http://localhost:5190/search \
  -H 'content-type: application/json' \
  -d '{"mode":"keyword","text":"电池","limit":10,"filters":{"dateFrom":"2022-01-01","ipcPrefix":["H01M"]}}' | jq

# quarantine 列表（勿与热检索混淆）
curl -s http://localhost:5190/quarantine | jq '.count,.items[].id'

# 索引版本 + 别名
curl -s http://localhost:5190/index/versions | jq

# 别名回滚演练（需 ≥2 个 version；或指定 tag）
curl -s -X POST http://localhost:5190/index/rollback \
  -H 'content-type: application/json' \
  -d '{}' | jq
# CLI：npm run index:list -w @ip/search-api
#      npm run index:rollback -w @ip/search-api -- <tag>
```

**验收要点**：响应含 `backend: "sqlite-fts"`、`indexVersion`；quarantine id（如 `q-bad-*`）**不得**出现在 `/search` hits。

## 索引版本与别名

- 每次 ingest 发布 `indexVersion`：`tag`、`docs`、`publishedAt`、`checksum`、`note`、`analyzer`、`embedding`
- 别名 **`search_current`** 指向活跃 tag；回滚 = 改别名指回上一代（对象/库不删）
- HTTP：`GET /index/versions`、`POST /index/alias` `{tag}`、`POST /index/rollback`

## apps/search 旗标接线说明（**不改壳码**）

当前 `apps/search` 仍走壳内 mock（`backend: 'mock'`）。后端就绪后另开 PR，建议：

1. 环境变量 / 旗标，例如 `VITE_SEARCH_API_URL=http://localhost:5190` 或 `SEARCH_BACKEND=sqlite-fts`
2. 在 `searchEngine` / store 的 `runSearch` 分支：旗标开 → `POST ${API}/search`，关 → 现有 mock
3. 响应直接使用 `SearchResponse`（`@ip/contracts` 已 additive 导出）；UI 继续吃 `hits`
4. **不要**把 PatentCase / ai-data 训练桶混进检索热路径
5. 诚实条：切真 API 后去掉「无真检索后台」文案，改为标明 `sqlite-fts` + `indexVersion`

本 MVP **禁止**改 `apps/search` 壳与 `APP_PORTS` / `APP_DEV_URLS`。

## 已知缺口

- semantic / advanced：semantic 降级 keyword（响应 `warnings`）；advanced 仅把字段拼成 keyword
- 无全球库 / 真向量 / RRF / Iceberg / 训练导出
- FTS5 trigram（≥3 字）+ LIKE 短中文回退；非专业中文分词器
- 同族 collapse 仅为结果侧去重，无权威同族源
- 别名回滚只切 `search_current` 指针；单库 FTS 内容随最近一次 ingest（多版本全文并存未做）
- 未做鉴权 / 查询审计落库

## 端点一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康 + docs/quarantine 计数 |
| POST/GET | `/search` | SearchQuery → SearchResponse |
| GET | `/quarantine` | 隔离列表 |
| GET | `/index/versions` | 版本 + 当前别名 |
| POST | `/index/alias` | 设置 `search_current` |
| POST | `/index/rollback` | 回滚演练 |
| POST | `/ingest` | 重建 ingest |
