# 架构

## 1. 两层

```text
┌─────────────────────────────────────────────────────────────┐
│ 通用 Harness（跨系统复用）                                      │
│  Driver 语义 · CheapSignals · EnhancedTelemetry               │
│  Observer · AgentLoop（observe→decide→act→judge）· Reporter   │
│  报告契约 report.json / report.md                              │
│  Rule / Skill（通用口径；不写死某一产品选择器）                    │
└────────────────────────────┬────────────────────────────────┘
                             │ 加载
┌────────────────────────────▼────────────────────────────────┐
│ 应用适配器 AppAdapter（按产品替换）                             │
│  应用入口 URL · 登录策略 · 上传/材料选择器 · 阶段检查点           │
│  CasePack（材料夹）· 问题类/TC 映射                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. 模块职责

| 模块 | 职责 |
|------|------|
| **Driver** | 统一动作：goto / click(role\|testid) / fill / scroll / wait / snapshot |
| **CheapSignals** | console、pageerror、requestfailed、DOM needle/注入检查 |
| **EnhancedTelemetry** | CDP Network / Performance / heap（增强档） |
| **Observer** | 汇总：截图、a11y tree、信号、adapter 检查点状态 |
| **AgentLoop** | observe→decide→act→judge；中止/去重 |
| **Reporter** | 写 report.json + report.md |
| **Rule/Skill** | 通用判定口径（严重度、样机诚实、循环） |
| **AppAdapter** | URL、登录、选择器、CasePack、问题类映射 |

## 3. Driver 策略

| 阶段 | 默认 Driver | 用途 |
|------|-------------|------|
| **MVP** | Cursor 自带自动浏览器（cursor-ide-browser） | 同一观察/动作语义；快速迭代 |
| **后置** | Playwright（可接系统 Chrome） | 批跑 / 固化 / CI；语义与报告字段对齐 |

禁止两套互不相干的报告字段；第二 Driver 只是实现，契约不变。

## 4. 数据流

```text
CasePack + Adapter
  → Loop 步进
      → Driver.act
      → CheapSignals 持续订阅
      → （可选）EnhancedTelemetry 抽查
      → Observer：截图 + a11y + 信号摘要
      → LLM decide/judge（或规则短路）
  → Reporter 追加 finding / step evidence
→ 结束：summary + 分级 findings
```
