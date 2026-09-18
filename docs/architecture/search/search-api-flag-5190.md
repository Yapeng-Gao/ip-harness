# apps/search 旗标接 Search API `:5190` 边界

> **依据**：[search-data/MVP.md](../search-data/MVP.md) · `apps/search-api` README（sqlite-fts · **`backend: sqlite-fts`**）。  
> **冻结**：本波可写**旗标接线边界**；真 GPU/SFT/N4 case-core **不做**。  
> **诚实**：默认仍 mock；开旗标才打 `:5190`；失败须可回退。

## 1. 角色

| 进程 | 端口 | 职责 |
|------|------|------|
| `apps/search` | **5182** | 人机 UI +（默认）内存 mock 检索 |
| `apps/search-api` | **5190** | 检索数据面 MVP：入库/quarantine/FTS/Search HTTP |
| `apps/api-mock` | 5180 | 办案命令 mock；**≠** 检索 API |

**不改** `packages/contracts` `APP_PORTS` / `APP_DEV_URLS`（5190 仅 search-api 自管，与 doc-harness/ai-* 并行壳同策略）。

## 2. 旗标约定（建议名，实现可微调）

| 变量 | 含义 | 默认 |
|------|------|------|
| `VITE_SEARCH_API_URL` | 非空则检索走该基址（例 `http://localhost:5190`） | **空** = mock |
| （可选）`VITE_SEARCH_API_TIMEOUT_MS` | 超时 | 如 3000 |

行为：

1. 旗标空 → 现有内存检索；`SearchResponse.backend === 'mock'`。  
2. 旗标开 → `POST/GET` search-api；UI **必须展示**返回的 `backend`（应为 `sqlite-fts`）。  
3. 网络错误 / 非 2xx / 超时 → **回退 mock** + toast「Search API 不可用，已回退样机 mock」；禁止假成功空列表装成真库。  

## 3. 契约边界

| 做 | 不做 |
|----|------|
| 请求/响应形状对齐 [agent-api-shape](./agent-api-shape.md)（可子集） | 改 Hit schema 分叉 |
| 保留三模式 UI；高级/语义在 API 未支持时可禁用或降级 keyword | 假装语义已接真向量 |
| quarantine 文献不出现在默认命中（API 侧已保证） | 壳端再发明第二套质量门 |
| 健康检查可打 `/health` | 把 5190 写进 APP_PORTS |

## 4. 与工作篮 / case-core

- 工作篮仍策略 A（本壳内存）；**不**因接 5190 自动跨口同步篮。  
- **不**经 5190 写 case-core / DomainCommand。  

## 5. 验收

- [ ] 默认无旗标：行为与今日 mock 一致  
- [ ] 旗标开且 search-api 在跑：命中来自 FTS；UI 可见 `backend: sqlite-fts`  
- [ ] 停掉 5190：自动回退 mock + 诚实提示  
- [ ] 未改 APP_PORTS  
- [ ] 未接真 GPU / SFT / case-core  

## 6. 实现 Owner 提示

- 壳接线：检索服务助手（小 PR，仅 `apps/search`）  
- API：检索落地助手（`apps/search-api` 已有）  
- 本文：架构边界；交架构评审轻扫  
