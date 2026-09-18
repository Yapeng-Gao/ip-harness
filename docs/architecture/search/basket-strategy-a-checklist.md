# 工作篮样机策略 A · 落地核对清单

> **依据**：[cross-shell-basket.md](./cross-shell-basket.md) §3 **策略 A：共享种子 ID**。  
> **冻结**：用户本波 **不做** 真 basket API / 真 case-core / 真 GPU·SFT。  
> **目的**：列清各壳「要改 / 不改」，供实现与评审对照；本文不改 `apps/*`。

## 1. 策略 A 一句话

跨口 **不共享** `localStorage`；各壳用 **同一批 `publicationNumber`（优先）** 对齐演示故事；「从工作篮导入」= 加载**本壳种子篮** + 诚实 toast。  
主键 `id` 可壳内不同（如 `h01` / `fto-h01` / `mining-h01`），**对齐键以公开号为准**。

## 2. 已对齐的公开号（现状抽查）

| publicationNumber | search | fto | mining | landscape |
|-------------------|--------|-----|--------|-----------|
| `CN115123456A` | ✓ | ✓ | ✓ | ✓ |
| `US20230123456A1` | ✓ | ✓ | ✓ | ✓ |
| `EP4123456A1` | ✓ | ✓ | ✓ | ✓ |
| `CN118234567A` | ✓ | ✓ | ✓ | （可补） |

缺口：以公开号表为准做 diff；缺的壳只**加种子行**，不发明第二套 Hit schema。

## 3. 各壳要改 / 不改

| 壳 | 端口 | 要改（策略 A 最小） | 不改 |
|----|------|---------------------|------|
| **search** | 5182 | 保持种子含上表公开号；「送下游」仍事件+深链；可选 toast 提示跨口未共享 LS | 不写跨口 LS；不改 APP_PORTS；不做真 basket API |
| **fto** | 5183 | 「从 Search 工作篮导入」→ 合并/加载本壳 `SEED_HITS`；**必须** toast：`样机·跨口未共享 LS，已用共享种子` | 不读 5182 LS；不 dispatch case-core；不重造检索引擎 |
| **mining** | 5184 | 同上：导入=本壳种子；诚实 toast | 同上 |
| **landscape** | 5186 | 下钻 Hit / 加篮占位：种子公开号与上表交集；toast 诚实 | 不共享 LS；不写案 |
| **doc-harness** | 5178 | 「送文档」深链占位即可；若展示文献号用共享公开号 | 不接检索篮真同步 |
| **inspire** | 5185 | 可选挂假公开号；非篮主路径 | 无强制改动 |
| **figure / ai-*** | — | 无 | 与工作篮无关 |
| **五壳 mid…** | — | 无 | **禁止**用 mid bridge 扛检索篮 |

## 4. 明确不做（本波）

- 策略 B/C/D（URL 大包、反代同 origin、真 basket API）  
- 真 case-core / DomainCommand  
- 改 `packages/contracts` `APP_PORTS`  
- 文案声称「已跨口同步工作篮」  

## 5. 验收（策略 A）

- [ ] 上表至少 3 个公开号在 search+fto+mining 同时存在  
- [ ] fto/mining「导入工作篮」路径有诚实 toast  
- [ ] 无跨端口 LS 读写代码  
- [ ] 深链仍可打开下游壳（占位即可）  
