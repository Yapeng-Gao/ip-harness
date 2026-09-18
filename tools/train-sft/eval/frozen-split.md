# Frozen val/test splits — sft-ip-mvp.v1

**Freeze predates train.** Do not reshuffle after Job run starts.

## Dataset pin

- **id@version:** `ds-ip-sft-mvp@v0.1.0`
- **manifest:** `docs/ai-data/mvp-sft/manifest.json`
- **data commit:** `d0a66f7ab23f879b506aaac38143917759b30387`
- **AI Data status:** I2 数据切片正式 Pass（B席双过）

## Slice names (frozen)

| Split | Slice id | File | sha256 | rows |
|-------|----------|------|--------|------|
| train | `train.*` | `splits/train.jsonl` | `0b580c46…f79a` | 48 |
| val | `val.summary` / `val.rewrite` / `val.refuse` | `splits/val.jsonl` | `dcf7be13…b56b` | 14 |
| test | `test.summary` / `test.rewrite` / `test.refuse` | `splits/test.jsonl` | `556b62b4…eaa0` | 14 |

Full digests are pinned in `job.train.sft.yaml` and verified by `validate_job.py` / `run_train_sft.py`.

## Leakage check

See AI Data `docs/ai-data/mvp-sft/leakage-check.md`. Literature-id intersection for this synthetic MVP corpus is documented there; Job does not re-mint splits.
