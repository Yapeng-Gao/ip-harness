# Go / No-Go — train.sft I2 MVP

## Run under review

| Field | Value |
|-------|-------|
| Job | `tools/train-sft/job.train.sft.yaml` (`type: train.sft`) |
| Dataset pin | `ds-ip-sft-mvp@v0.1.0` |
| Manifest | `docs/ai-data/mvp-sft/manifest.json` |
| Data commit | `d0a66f7ab23f879b506aaac38143917759b30387` |
| Recipe | `sft-ip-mvp.v1` |
| Mode | stub (manifest-backed; no GPU cluster) |
| Revision | sft-mvp-29ff5e49 |
| Timestamp (UTC) | 2026-09-18T02:59:52Z |
| Timestamp (Asia/Shanghai) | 2026-09-18 10:59:52 CST |

## Checklist

| Gate | Result | Notes |
|------|--------|-------|
| Job contract present + validates | Pass | `validate_job.py` |
| Dataset id@version pinned | Pass | `ds-ip-sft-mvp` / `v0.1.0` |
| Manifest + sha256 verified | Pass | train/val/test checksums |
| AI Data slice Pass (B席双过) | Pass | upstream I2 data |
| Artifact path proven (checkpoint + metrics) | Pass | stub under `artifacts/checkpoints/` |
| Registry revision appended | Pass | `registry/revisions.md` |
| Eval freeze documented before train | Pass | `eval/frozen-split.md` |
| No PatentCase / raw case in train | Pass | AI Data synthetic MVP only |
| Metrics meet production Release thresholds | **No-Go** | stub/cpu-minimal is not a scored model Release |
| Red-team / high-risk refuse regression | N/A (stub) | deferred to scored run |

## Conclusion

- **No-Go for production Release** — stub (or cpu-minimal placeholder) does not constitute a scored model Release.
- **Pass for pipeline wiring** — Job contract, dataset pin, manifest checksums, artifact URIs, and Registry revision path are proven.

Signed-off by: I2 local runner (automated fill). Human 算法+架构会签 still required before any production Release.
