# FTO · Agent API 形状（可选）

> **样机诚实**：可为壳内函数；Agent 调用与人机同一 store 投影。  
> **非必须**本期接线；形状先冻，免人机分叉。

## 1. 只读 / 草稿操作

| 操作 | 含义 | 写案 |
|------|------|------|
| `fto.getProject()` | 当前特征/命中/风险摘要 | 否 |
| `fto.runMockMatrix()` | 触发假比对填矩阵 | 否 |
| `fto.getReportDraft()` | 取报告草稿 JSON/MD | 否 |
| `fto.confirmReport()` | 等同人机 Confirm（若开闸给 Agent，须产品批准） | **否**（仍不 dispatch） |

## 2. 报告草稿 shape（示意）

```ts
type FtoReportDraft = {
  projectId: string
  status: 'draft' | 'confirmed'
  features: { id: string; name: string }[]
  hits: { id: string; publicationNumber: string; title: string }[]
  overallRisk: 'low' | 'medium' | 'high' | 'unclear'
  matrixSummary: string
  disclaimer: '样机·非法律意见'
  backend: 'mock'
}
```

## 3. 禁止

- Agent 直接改 case handoff / `submitResearch` 冒充 FTO 结论入库。  
- 返回与人机不同的 risk 枚举。
