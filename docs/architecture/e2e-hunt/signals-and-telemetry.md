# 信号与遥测

## 1. 廉价规则层（默认开）

| 源 | 捕获 | 默认处置 |
|----|------|----------|
| `console` error/warn（可配级别） | 文本 + 时间 + URL | error → finding；warn → 记日志可升级 |
| `pageerror` | 未捕获异常 | **fail_hard** finding |
| `requestfailed` | 失败请求 URL/方法/错误 | 4xx/5xx/网络错 → finding（adapter 可白名单） |
| DOM needle / 注入检查 | 约定错误地标、React overlay | finding |
| Adapter 检查点失败 | 阶段未达 | finding 或中止 Case |

**原则**：本层能定论的，**不调用 LLM**。

## 2. 增强遥测（默认关或抽查）

| CDP / 能力 | 用途 | 建议 |
|------------|------|------|
| Network | 瀑布、慢请求、失败关联 | 嫌疑步或抽样步开启 |
| Performance | 长任务、FPS | 性能 Case 才开 |
| heap snapshot | 泄漏嫌疑 | **默认关**；仅内存嫌疑 |

## 3. 给 LLM 的观察输入（每步）

| 输入 | 说明 |
|------|------|
| 截图 | 当前视口；敏感信息 adapter 可打码策略 |
| accessibility tree / snapshot | 角色与名；优先于裸 HTML |
| CheapSignals 摘要 | 本步新增错误列表 |
| Adapter 状态 | 当前检查点、允许动作集 |
| 历史步摘要 | 去重用（动作指纹） |

## 4. 样机白名单（ip-harness）

下列**默认不记缺陷**（Rule 写死，adapter 可追加）：

- 文案含「样机」「无真」「mock」「非法律意见」  
- API `backend: 'mock'`  
- 已知占位空态（ops 无真监控等）  
