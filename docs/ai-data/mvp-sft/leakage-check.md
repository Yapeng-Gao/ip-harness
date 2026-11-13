# 泄漏检查记录 · `ds-ip-sft-mvp@v0.1.0`

## 方法

- **粒度**：文献号（`doc_ids[]` 字段）级划分  
- **规则**：`train_docs ∩ (val_docs ∪ test_docs) = ∅`，且 `val_docs ∩ test_docs = ∅`  
- **实现**：对 `splits/*.jsonl` 逐行解析 `doc_ids`，求集合交  
- **禁止**：评测切分发布后并入训练 Recipe（本 recipe 已写死 excludes）

## 结果

| 集合 | 文献号数量 | 示意号段 |
|------|------------|----------|
| train | 46 | `CN2099001A`–`CN2099046A`（含对比表多文献） |
| val | 14 | `CN2099101A`–`CN2099114A` |
| test | 14 | `CN2099201A`–`CN2099214A` |

| 检查项 | 结果 |
|--------|------|
| `train ∩ (val ∪ test)` | **空集**（无交叉） |
| `val ∩ test` | **空集**（无交叉） |
| 行级 id 唯一 | Pass（`train-*` / `val-*` / `test-*`） |

## 元数据

- **检查时间**：2026-09-18T03:00:00Z（UTC+8 2026-09-18 11:00）  
- **checker**：I2 mvp-sft freeze script（sha256 + set intersection）  
- **dataset**：`ds-ip-sft-mvp@v0.1.0`  
- **结论**：**Pass** — 文献号级无泄漏  

## 复验命令

```bash
cd docs/ai-data/mvp-sft
python3 - <<'PY'
import json
from pathlib import Path

def docs(p):
    s=set()
    for line in Path(p).read_text().splitlines():
        if line.strip():
            s.update(json.loads(line)["doc_ids"])
    return s
tr,va,te=docs("splits/train.jsonl"),docs("splits/val.jsonl"),docs("splits/test.jsonl")
assert not (tr & (va|te)), tr&(va|te)
assert not (va & te), va&te
print("Pass: no doc_id leakage", len(tr), len(va), len(te))
PY
```
