# 原型演示剧本（search→篮→FTO）

> 样机口播短剧本：检索 → 工作篮 → 送 FTO → 策略 A 导入。  
> 闭环规格：[`architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md`](./architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md)

## 端口

| 壳 / 服务 | 端口 | 必开 |
|-----------|------|------|
| mid | 5173 | 可选 |
| search | **5182** | **是** |
| fto | **5183** | **是** |
| search-api | **5190** | 可选（旗标接线时） |

## 启动

```bash
# 必开
npm run dev:search    # :5182
npm run dev:fto       # :5183

# 可选：旗标接 sqlite-fts（另开一终端）
npm run dev:search-api   # :5190
npm run dev:search:api   # search 带 VITE_SEARCH_API_URL=http://localhost:5190
```

可选 mid：`npm run dev:mid`（:5173，本剧本不依赖）。

## 口播步骤

1. **检索**：打开 `http://localhost:5182/`，输入关键词（如「固态电池」）执行检索，确认结果列表可见。  
2. **入篮**：勾选若干 Hit → 加入工作篮；可到「已保存 / 工作篮」核对。  
3. **送 FTO**：工作篮「送下游」→ FTO（深链打开 `:5183`）。口播：**已开壳 · 篮未跨口同步**。  
4. **FTO 导入（策略 A）**：在 FTO 点「从 Search 工作篮导入」→ 应出现 toast：  
   **`样机·跨口未共享 LS，已用共享种子`**  
   列表出现共享公开号种子（如 `CN115123456A` 等），**不是**跨口读了 5182 的 localStorage。

## 诚实口径（必说）

- **无真 ES / 全球库**：默认是壳内 mock 检索；接 `:5190` 时是 **sqlite-fts 样机索引**，仍非生产检索。  
- **无跨口 localStorage**：不同 Vite 端口 LS 不互通；策略 A = **共享种子公开号 + 诚实 toast**。  
- **mock vs 旗标**：空 `VITE_SEARCH_API_URL` → mock；`npm run dev:search:api` → 打 `:5190`，失败可回退 mock。

## Hunt 核对

演示前后可用猎虫 CasePack 自检（壳需已起）：

```bash
npm run hunt:basket-strategy-a   # search→fto 策略 A toast
npm run hunt:fto-five            # fto:5183 五步主路径
```

详见 [`AGENTIC_CLOSED_LOOP.md`](./architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md)（白名单含策略 A toast；≠ L0/L1 Playwright）。
