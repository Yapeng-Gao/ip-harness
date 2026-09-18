# I2 · SFT 数据切片（MVP）

> **Version 契约（与 AI Infra `train.sft` 钉死同一 id）**  
> - `id`: `ds-ip-sft-mvp`  
> - `name`: `ip-sft-mvp`  
> - `version`: `v0.1.0`  
> - **完整引用**: `ds-ip-sft-mvp@v0.1.0`  
>
> 独立于样机种子 `claims-sft@v1.4`；本目录为 **MVP 真切片契约**（小样本合成示意，**非真训练语料仓**）。

## 用途

- 对照 `docs/architecture/model-training/MVP.md` 工作包 2：冻结一个 SFT `dataset@version` + Recipe + 许可清单 + 泄漏检查。  
- 供 ai-infra Job 类型 **`train.sft`** 只读引用；**禁止**口头改 id/version。  
- 任务族对齐 `sft.md`：摘要 / Query 改写 / 特征拆解 / 交底结构化 / 对比表草稿 / 拒答 / 工具调用。

## 目录

| 路径 | 说明 |
|------|------|
| `manifest.json` | 不可变发布清单（checksum / row counts / 指针） |
| `recipe.json` | 配比写死（本刀仅 SFT） |
| `licenses.md` | 许可与审查结论 |
| `leakage-check.md` | 文献号级泄漏检查记录 |
| `splits/train.jsonl` | 训练切分（48 行） |
| `splits/val.jsonl` | 验证切分（14 行） |
| `splits/test.jsonl` | 测试切分（14 行） |

样本字段：`id` · `task` · `input` · `output` · `doc_ids[]`（假公开号）。

## 禁项

- **无** PatentCase / 办案库直训  
- **无** 未脱敏交底 / 客户案卷  
- **无** 从 Search API 旁路灌数  
- **无** 预训练/CPT、偏好/DPO 配比（本 recipe `stagesExcluded`）  
- **不** 大改 `apps/ai-data` UI/store（壳接线另 PR）

## 怎么验（验收自检）

```bash
cd docs/ai-data/mvp-sft

# 1) checksum 与文件一致
sha256sum -c <(jq -r '.files[] | "\(.sha256)  \(.path)"' manifest.json)

# 2) 行数
wc -l splits/*.jsonl
jq -r '.rowCounts | "train=\(.train) val=\(.val) test=\(.test) total=\(.total)"' manifest.json

# 3) version id 契约
jq -r '"\(.id)@\(.version)"' manifest.json
# 期望：ds-ip-sft-mvp@v0.1.0

# 4) recipe 配比加总
jq '[.mix[].splitPreview | .train+.val+.test] | add' recipe.json
# 期望：76

# 5) 文献号泄漏为空（见 leakage-check.md 复验脚本）
```

## 与 ai-infra

`train.sft` Job 定义必须钉死：

```text
datasetId = ds-ip-sft-mvp
version   = v0.1.0
ref       = ds-ip-sft-mvp@v0.1.0
```

变更样本或切分 → **bump 新 version**，勿改本 tag 内容（manifest `immutable: true`）。
