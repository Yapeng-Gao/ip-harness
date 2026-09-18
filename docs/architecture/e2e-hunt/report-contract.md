# 报告契约

## 1. 文件

| 文件 | 用途 |
|------|------|
| `report.json` | 机器可读；CI/汇总 |
| `report.md` | 人读；含关键截图链接 |

## 2. report.json 最小 schema（示意）

```json
{
  "schemaVersion": "1.0",
  "runId": "uuid",
  "adapterId": "ip-harness",
  "driver": "cursor-browser | playwright",
  "startedAt": "ISO-8601",
  "finishedAt": "ISO-8601",
  "summary": {
    "status": "passed | failed | suspect | aborted",
    "steps": 0,
    "findings": { "fail_hard": 0, "suspect": 0 }
  },
  "casePackId": "string",
  "steps": [
    {
      "i": 1,
      "url": "https://...",
      "action": { "type": "click", "target": "..." },
      "signals": [],
      "screenshot": "artifacts/step-001.png",
      "judge": "pass_step"
    }
  ],
  "findings": [
    {
      "id": "F1",
      "severity": "fail_hard | suspect",
      "title": "短标题",
      "category": "adapter-mapped-or-generic",
      "evidence": {
        "steps": [3, 4],
        "screenshots": ["..."],
        "logs": ["console: ..."],
        "repro": ["goto ...", "click ..."]
      }
    }
  ]
}
```

## 3. summary 判定（§建议）

| status | 条件 |
|--------|------|
| `failed` | 任一 fail_hard |
| `suspect` | 无 fail_hard 但有 suspect |
| `passed` | 目标完成且无 finding |
| `aborted` | 中止条件触发（预算/循环） |

## 4. 严重度（人读）

| 级 | 映射 |
|----|------|
| P0 | fail_hard 且挡演示/数据损坏 |
| P1 | fail_hard 或高置信 suspect |
| P2 | 低置信 suspect / 体验 |

最终升格是否挡合并：**人审**；Hunt 默认不自动拦 PR。
