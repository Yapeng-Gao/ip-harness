# train.sft — I2 MVP Job (local / stub)

Honest SFT Job definition for **ip-harness** model-training MVP.  
**No** GPU cluster, **no** K8s, **no** PatentCase / raw case data in training.

## Dataset pin (frozen)

| Field | Value |
|-------|-------|
| `dataset.id` | `ds-ip-sft-mvp` |
| `dataset.version` | `v0.1.0` |
| `manifestPath` | `docs/ai-data/mvp-sft/manifest.json` |
| data commit SHA | `d0a66f7ab23f879b506aaac38143917759b30387` |
| train sha256 (48) | `0b580c46fab521d84b16e21d28b3916abedfd2f4063ff8d5a1d89cc88d99f79a` |
| val sha256 (14) | `dcf7be139e8b8e53058a778281cbf1b30aeb2ff140d941ad95a38f64d158b56b` |
| test sha256 (14) | `556b62b402fa7840c7990055698f99be0f575cd7fc309ad0bfd532551ec5eaa0` |

This is a **new** id (does not reuse the shell seed `ds-claims-sft`).  
Runner **prefers** the AI Data manifest; verifies sha256 when split files are present in-repo.

**Data landing path:** `docs/ai-data/mvp-sft/`

## How to run

```bash
# Schema check (must exit 0)
python3 tools/train-sft/scripts/validate_job.py

# Stub / hosted-equivalent run (default; no GPU)
python3 tools/train-sft/scripts/run_train_sft.py

# Optional: minimal torch path if installed
TRAIN_SFT_REAL=1 python3 tools/train-sft/scripts/run_train_sft.py
```

Optional override (skips manifest train split only if set):

```bash
DATA_PATH=/path/to/train.jsonl python3 tools/train-sft/scripts/run_train_sft.py
```

## Outputs

- `artifacts/checkpoints/<run_id>/checkpoint.stub.json` (or tiny `.pt` if `TRAIN_SFT_REAL=1`)
- `artifacts/checkpoints/<run_id>/metrics.json`
- Append to `registry/revisions.md`
- Fill `eval/go-no-go.md` once per acceptance run

Large binaries are gitignored; only stub JSON/metrics are committed.

## Deep-link (optional)

ai-infra shell (`apps/ai-infra:5179`) may later deep-link to this Job contract path  
`tools/train-sft/job.train.sft.yaml` — **no new UI pages/routes in this PR**.

## Forbidden

pretrain · DPO/RLHF full · real K8s · inventing PatentCase ids as training truth · large `apps/ai-infra` UI changes
