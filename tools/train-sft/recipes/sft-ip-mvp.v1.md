# Recipe: sft-ip-mvp.v1

## Pin

- **dataset:** `ds-ip-sft-mvp@v0.1.0`
- **manifest:** `docs/ai-data/mvp-sft/manifest.json`
- **data commit:** `d0a66f7ab23f879b506aaac38143917759b30387`
- **base_model:** `external/qwen2.5-0.5b-instruct` (not in-repo)
- **Job:** `tools/train-sft/job.train.sft.yaml`

## Mix (from AI Data Pass)

| Split | Rows | Notes |
|-------|------|-------|
| train | 48 | summary / rewrite / refuse slices |
| val | 14 | frozen before train |
| test | 14 | frozen before train |

Owned by AI Data under `docs/ai-data/mvp-sft/` (recipe.json). I2 数据切片正式 Pass（B席双过）.

## Hard bans

- **No** `PatentCase` / raw case / 未脱敏交底 as training rows
- **No** Search API bypass dump into train
- Checksums must match Job pin before run

## Hyperparams

See `../hyperparams.json` (lr, epochs, max_seq_len, batch_size, lora_r, seed).
