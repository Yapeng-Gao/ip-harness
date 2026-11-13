# AgentLoop

## 1. 循环

```text
observe → decide → act → judge
         ↑_________________|
```

| 阶段 | 输入 | 输出 |
|------|------|------|
| **observe** | 截图、a11y、信号、检查点 | Observation |
| **decide** | Observation + Case 目标 + 允许动作 | 下一步 Action 或 stop |
| **act** | Action | Driver 执行结果 |
| **judge** | 新 Observation + 信号 | pass_step / suspect / fail_hard / stop |

## 2. 判定三级

| 级别 | 含义 | 典型来源 |
|------|------|----------|
| **fail_hard** | 实锤缺陷 | pageerror、明确 5xx、检查点崩溃 |
| **suspect** | 需人看 | LLM 观感/流程疑虑；弱信号 |
| **pass_step** | 本步可继续 | 无新硬错误且目标未完成 |

## 3. 中止条件（必须实现）

| 条件 | 行为 |
|------|------|
| 步数 ≥ `maxSteps` | stop；summary=budget_exceeded |
| 连续 N 步无进度（检查点不变） | stop；stalled |
| 同一 action 指纹重复 ≥ K | 去重跳过或 stop；loop_detected |
| fail_hard 且策略=`abort_on_hard` | 立即 stop |
| Case 目标完成 | stop；success |

## 4. 去重指纹

建议指纹 = `hash(actionType + targetName + urlPath + checkpointId)`。  
同类 suspect 合并为一条 finding，证据列表 append。

## 5. Act 约束（防幻觉）

LLM **只能**输出 Driver 语义动作，例如：

- `goto(url)`  
- `click({ role, name })` / `click({ testId })`  
- `fill({ testId|role, value })`  
- `scroll(direction)`  
- `wait(ms|selector)`  
- `stop(reason)`  

禁止：任意 CSS 选择器幻想、执行脚本、越权打开外域（除非 adapter 允许）。
