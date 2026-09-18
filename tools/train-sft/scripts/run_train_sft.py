#!/usr/bin/env python3
"""Run train.sft I2 MVP — prefer AI Data manifest; stub by default."""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
JOB_PATH = ROOT / "job.train.sft.yaml"
HP_PATH = ROOT / "hyperparams.json"
REGISTRY = ROOT / "registry" / "revisions.md"
GO_NO_GO = ROOT / "eval" / "go-no-go.md"
DATA_DIR = ROOT / "data"
ARTIFACTS = ROOT / "artifacts" / "checkpoints"

EXPECTED_DATASET_ID = "ds-ip-sft-mvp"
EXPECTED_DATASET_VERSION = "v0.1.0"
EXPECTED_MANIFEST = "docs/ai-data/mvp-sft/manifest.json"
EXPECTED_DATA_COMMIT = "d0a66f7ab23f879b506aaac38143917759b30387"
EXPECTED_CHECKSUMS = {
    "train": ("0b580c46fab521d84b16e21d28b3916abedfd2f4063ff8d5a1d89cc88d99f79a", 48),
    "val": ("dcf7be139e8b8e53058a778281cbf1b30aeb2ff140d941ad95a38f64d158b56b", 14),
    "test": ("556b62b402fa7840c7990055698f99be0f575cd7fc309ad0bfd532551ec5eaa0", 14),
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _short_id() -> str:
    return uuid.uuid4().hex[:8]


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _count_jsonl(path: Path) -> int:
    n = 0
    with path.open(encoding="utf-8") as f:
        for line in f:
            if line.strip():
                n += 1
    return n


def _load_yaml_lite(text: str) -> dict:
    try:
        import yaml  # type: ignore

        data = yaml.safe_load(text)
        if not isinstance(data, dict):
            raise SystemExit("job yaml root must be a mapping")
        return data
    except ImportError:
        pass
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from validate_job import _load_yaml_lite as _vl  # type: ignore

    return _vl(text)


def _ensure_synthetic_jsonl(path: Path) -> int:
    rows = [
        {
            "id": "syn-summary-001",
            "task": "summary",
            "synthetic": True,
            "instruction": "用不超过80字摘要下列公开文本要点。",
            "input": "【synthetic】一种示例性传感器壳体，包含防水密封圈与可拆卸端盖。",
            "output": "示例传感器壳体带防水密封与可拆卸端盖。【synthetic】",
        },
        {
            "id": "syn-summary-002",
            "task": "summary",
            "synthetic": True,
            "instruction": "摘要下列文本，勿编造法律结论。",
            "input": "【synthetic】公开说明书描述了一种折叠支架，用于便携显示设备。",
            "output": "公开文本描述便携显示设备用折叠支架。【synthetic】",
        },
        {
            "id": "syn-rewrite-001",
            "task": "rewrite",
            "synthetic": True,
            "instruction": "将自然语言改写为检索关键词草稿。",
            "input": "【synthetic】怎么找带密封圈的传感器壳？",
            "output": "传感器壳体 密封圈 防水 【synthetic】",
        },
        {
            "id": "syn-rewrite-002",
            "task": "rewrite",
            "synthetic": True,
            "instruction": "改写为简洁检索表达式草稿。",
            "input": "【synthetic】折叠支架 便携屏",
            "output": "折叠支架 AND 便携显示 【synthetic】",
        },
        {
            "id": "syn-refuse-001",
            "task": "refuse",
            "synthetic": True,
            "instruction": "若请求越权法律结论则拒答并建议求助人。",
            "input": "【synthetic】请直接判定该专利必然无效。",
            "output": "无法提供必然无效的法律结论；请咨询合格专利代理人。【synthetic-refuse】",
        },
        {
            "id": "syn-refuse-002",
            "task": "refuse",
            "synthetic": True,
            "instruction": "拒答未授权的侵权终局判断。",
            "input": "【synthetic】帮我出一份可上法庭的侵权胜诉保证书。",
            "output": "拒答：不能提供诉讼胜诉保证；请转交执业律师。【synthetic-refuse】",
        },
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    return len(rows)


def _verify_manifest_checksums(manifest: dict, manifest_dir: Path) -> dict:
    """Verify in-repo split files against Job-expected + manifest sha256/rows."""
    verified = {}
    files_by_role = {f["role"]: f for f in manifest.get("files", []) if "role" in f}
    for role, (exp_sha, exp_rows) in EXPECTED_CHECKSUMS.items():
        rel = files_by_role.get(role, {}).get("path") or f"splits/{role}.jsonl"
        fpath = manifest_dir / rel
        if not fpath.is_file():
            raise SystemExit(f"manifest split missing: {fpath}")
        got = _sha256_file(fpath)
        if got != exp_sha:
            raise SystemExit(f"{role} sha256 mismatch: got {got}, expected {exp_sha}")
        msha = files_by_role.get(role, {}).get("sha256")
        if msha and msha != exp_sha:
            raise SystemExit(f"manifest {role} sha256 disagrees with Job pin")
        n = _count_jsonl(fpath)
        if n != exp_rows:
            raise SystemExit(f"{role} rows {n} != expected {exp_rows}")
        verified[role] = {"path": str(fpath.relative_to(REPO)), "sha256": got, "rows": n}
    return verified


def _resolve_data() -> tuple[Path, str, dict | None]:
    """Prefer AI Data manifest train split; validate checksums when present."""
    env = os.environ.get("DATA_PATH")
    if env:
        p = Path(env)
        if not p.is_file():
            raise SystemExit(f"DATA_PATH not a file: {p}")
        return p, "env:DATA_PATH", None

    manifest_path = REPO / EXPECTED_MANIFEST
    if manifest_path.is_file():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if manifest.get("id") != EXPECTED_DATASET_ID or manifest.get("version") != EXPECTED_DATASET_VERSION:
            raise SystemExit("manifest id/version mismatch vs Job pin")
        verified = _verify_manifest_checksums(manifest, manifest_path.parent)
        train_path = REPO / verified["train"]["path"]
        return train_path, f"manifest:{EXPECTED_MANIFEST}#train", verified

    local = sorted(DATA_DIR.glob("*.jsonl"))
    if local:
        return local[0], f"local:{local[0].name}", None

    stub = DATA_DIR / "synthetic-stub.jsonl"
    n = _ensure_synthetic_jsonl(stub)
    print(f"NOTE: no AI Data manifest; wrote synthetic stub ({n} rows) → {stub}")
    return stub, "synthetic-stub", None


def _write_stub_checkpoint(run_dir: Path, meta: dict) -> Path:
    ckpt = run_dir / "checkpoint.stub.json"
    payload = {
        "format": "stub",
        "honesty": "hosted-equivalent artifact; not real model weights",
        "state_dict_placeholder": {"lora.A": "omitted", "lora.B": "omitted"},
        **meta,
    }
    ckpt.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return ckpt


def _try_real_torch(run_dir: Path, meta: dict) -> Path | None:
    if os.environ.get("TRAIN_SFT_REAL") != "1":
        return None
    try:
        import torch  # type: ignore
    except ImportError:
        print("TRAIN_SFT_REAL=1 but torch not installed; falling back to stub")
        return None
    sd = {
        "meta": str(meta.get("revision_id")),
        "lora.A": torch.zeros(8, 16),
        "lora.B": torch.zeros(16, 8),
    }
    path = run_dir / "checkpoint.pt"
    torch.save(sd, path)
    print(f"Wrote tiny torch checkpoint: {path}")
    return path


def _append_registry(row: dict) -> None:
    REGISTRY.parent.mkdir(parents=True, exist_ok=True)
    if not REGISTRY.is_file():
        REGISTRY.write_text(
            "# Registry revisions — train.sft\n\n"
            "| revision_id | dataset | version | recipe | mode | checkpoint_uri | metrics_uri | created_at_utc | notes |\n"
            "|-------------|---------|---------|--------|------|----------------|-------------|----------------|-------|\n",
            encoding="utf-8",
        )
    line = (
        f"| {row['revision_id']} | {row['dataset']} | {row['version']} | {row['recipe']} | "
        f"{row['mode']} | `{row['checkpoint_uri']}` | `{row['metrics_uri']}` | "
        f"{row['created_at_utc']} | {row['notes']} |\n"
    )
    text = REGISTRY.read_text(encoding="utf-8")
    text = re.sub(r"\| _\(runner appends\)_ \|.*\n", "", text)
    if not text.endswith("\n"):
        text += "\n"
    # Idempotent: skip if same revision already present
    if f"| {row['revision_id']} |" in text:
        return
    REGISTRY.write_text(text + line, encoding="utf-8")


def _fill_go_no_go(revision_id: str, ts: str, mode: str) -> None:
    """Rewrite go-no-go run fields by whole-cell replacement (safe)."""
    text = GO_NO_GO.read_text(encoding="utf-8")

    def _set_field(src: str, field: str, value: str) -> str:
        # Match "| Field | anything |" including placeholders
        pat = rf"^(\| {re.escape(field)} \|)(.*)\|$"
        repl = rf"\1 {value} |"
        out, n = re.subn(pat, repl, src, count=1, flags=re.M)
        return out if n else src

    text = _set_field(text, "Mode", f"{mode} (manifest-backed; no GPU cluster)")
    text = _set_field(text, "Revision", revision_id)
    text = _set_field(text, "Timestamp (UTC)", ts)
    GO_NO_GO.write_text(text, encoding="utf-8")



def main() -> int:
    job = _load_yaml_lite(JOB_PATH.read_text(encoding="utf-8"))
    hp = json.loads(HP_PATH.read_text(encoding="utf-8"))

    ds = job.get("dataset") or {}
    ds_id = ds.get("id") or (hp.get("dataset") or {}).get("id")
    ds_ver = ds.get("version") or (hp.get("dataset") or {}).get("version")
    if not ds_id or not ds_ver:
        raise SystemExit("dataset id@version missing from job/hyperparams")
    if ds_id != EXPECTED_DATASET_ID or ds_ver != EXPECTED_DATASET_VERSION:
        raise SystemExit(
            f"refusing to run: expected {EXPECTED_DATASET_ID}@{EXPECTED_DATASET_VERSION}, "
            f"got {ds_id}@{ds_ver}"
        )
    if job.get("type") != "train.sft":
        raise SystemExit("type must be train.sft")

    data_path, data_src, verified = _resolve_data()
    n_rows = _count_jsonl(data_path)

    short = _short_id()
    revision_id = f"sft-mvp-{short}"
    run_id = revision_id
    run_dir = ARTIFACTS / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    ts = _utc_now()
    meta = {
        "revision_id": revision_id,
        "run_id": run_id,
        "dataset_id": ds_id,
        "dataset_version": ds_ver,
        "manifest_path": EXPECTED_MANIFEST,
        "data_commit_sha": EXPECTED_DATA_COMMIT,
        "checksums_verified": verified,
        "recipe": job.get("recipe") or hp.get("recipe"),
        "base_model": job.get("base_model") or hp.get("base_model"),
        "hyperparams": {
            "lr": hp.get("lr", (job.get("hyperparams") or {}).get("lr")),
            "epochs": hp.get("epochs", (job.get("hyperparams") or {}).get("epochs")),
            "max_seq_len": hp.get("max_seq_len", (job.get("hyperparams") or {}).get("max_seq_len")),
            "batch_size": hp.get("batch_size", (job.get("hyperparams") or {}).get("batch_size")),
            "lora_r": hp.get("lora_r", (job.get("hyperparams") or {}).get("lora_r")),
            "seed": hp.get("seed", (job.get("hyperparams") or {}).get("seed")),
        },
        "data_source": data_src,
        "data_rows": n_rows,
        "cluster": job.get("cluster", "none"),
        "gpu": job.get("gpu", "optional-local-or-cpu-stub"),
        "created_at_utc": ts,
    }

    real_path = _try_real_torch(run_dir, meta)
    if real_path is not None:
        mode = "cpu-minimal"
        ckpt_path = real_path
        _write_stub_checkpoint(run_dir, {**meta, "mode": mode, "torch_checkpoint": real_path.name})
    else:
        mode = "stub"
        ckpt_path = _write_stub_checkpoint(run_dir, {**meta, "mode": mode})

    metrics = {
        "mode": mode,
        "honesty": "stub|cpu-minimal is wiring proof, not production Release score",
        "dataset": f"{ds_id}@{ds_ver}",
        "manifest_path": EXPECTED_MANIFEST,
        "data_commit_sha": EXPECTED_DATA_COMMIT,
        "checksums_verified": verified,
        "recipe": meta["recipe"],
        "hyperparams": meta["hyperparams"],
        "data_source": data_src,
        "data_rows": n_rows,
        "checkpoint": str(ckpt_path.relative_to(ROOT)),
        "revision_id": revision_id,
        "created_at_utc": ts,
        "loss": None,
        "eval": {"status": "skipped", "reason": "stub run — no scored eval"},
    }
    metrics_path = run_dir / "metrics.json"
    metrics_path.write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    ckpt_rel = str(ckpt_path.relative_to(ROOT))
    metrics_rel = str(metrics_path.relative_to(ROOT))
    _append_registry(
        {
            "revision_id": revision_id,
            "dataset": ds_id,
            "version": ds_ver,
            "recipe": meta["recipe"],
            "mode": mode,
            "checkpoint_uri": ckpt_rel,
            "metrics_uri": metrics_rel,
            "created_at_utc": ts,
            "notes": (
                f"I2 wiring; data={data_src}; commit={EXPECTED_DATA_COMMIT[:12]}; "
                "No-Go production Release; Pass pipeline wiring"
            ),
        }
    )
    _fill_go_no_go(revision_id, ts, mode)

    # Drop any prior accidental stub runs from this working tree (keep latest only in artifacts)
    # Leave all run dirs; git will add the latest. Clean older local-only dirs for clarity:
    for d in ARTIFACTS.iterdir():
        if d.is_dir() and d.name != run_id and d.name.startswith("sft-mvp-"):
            # keep only the acceptance run for commit
            for f in d.iterdir():
                f.unlink()
            d.rmdir()

    print("OK: train.sft run complete")
    print(f"  revision={revision_id} mode={mode}")
    print(f"  dataset={ds_id}@{ds_ver}")
    print(f"  manifest={EXPECTED_MANIFEST}")
    print(f"  data_commit={EXPECTED_DATA_COMMIT}")
    print(f"  data={data_src} rows={n_rows}")
    if verified:
        print(f"  checksums: train={verified['train']['sha256'][:12]}… ({verified['train']['rows']})")
    print(f"  checkpoint={ckpt_rel}")
    print(f"  metrics={metrics_rel}")
    print(f"  registry={REGISTRY.relative_to(ROOT)}")
    print("  gate: No-Go for production Release; Pass for pipeline wiring")
    return 0


if __name__ == "__main__":
    sys.exit(main())
