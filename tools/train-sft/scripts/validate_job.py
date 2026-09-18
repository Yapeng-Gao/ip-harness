#!/usr/bin/env python3
"""Validate tools/train-sft Job contract + hyperparams pin (I2)."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
JOB_PATH = ROOT / "job.train.sft.yaml"
HP_PATH = ROOT / "hyperparams.json"

EXPECTED_DATASET_ID = "ds-ip-sft-mvp"
EXPECTED_DATASET_VERSION = "v0.1.0"
EXPECTED_MANIFEST = "docs/ai-data/mvp-sft/manifest.json"
EXPECTED_DATA_COMMIT = "d0a66f7ab23f879b506aaac38143917759b30387"
EXPECTED_CHECKSUMS = {
    "train": ("0b580c46fab521d84b16e21d28b3916abedfd2f4063ff8d5a1d89cc88d99f79a", 48),
    "val": ("dcf7be139e8b8e53058a778281cbf1b30aeb2ff140d941ad95a38f64d158b56b", 14),
    "test": ("556b62b402fa7840c7990055698f99be0f575cd7fc309ad0bfd532551ec5eaa0", 14),
}
REQUIRED_HP_KEYS = ("lr", "epochs", "max_seq_len", "batch_size", "lora_r", "seed")


def _fail(msg: str) -> None:
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(1)


def _coerce(v: str):
    if v.lower() in ("true", "false"):
        return v.lower() == "true"
    try:
        if "." in v or "e" in v.lower():
            return float(v)
        return int(v)
    except ValueError:
        return v


def _load_yaml_lite(text: str) -> dict:
    try:
        import yaml  # type: ignore

        data = yaml.safe_load(text)
        if not isinstance(data, dict):
            _fail("job yaml root must be a mapping")
        return data
    except ImportError:
        pass

    out: dict = {}
    section: str | None = None
    nested: str | None = None
    buckets = {
        "dataset": {},
        "hyperparams": {},
        "outputs": {},
        "gates": {},
        "forbidden": [],
        "checksums": {},
    }

    for raw in text.splitlines():
        line = raw.split("#", 1)[0].rstrip()
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip(" "))
        s = line.strip()
        if indent == 0 and ":" in s:
            k, v = s.split(":", 1)
            k, v = k.strip(), v.strip().strip('"').strip("'")
            nested = None
            if v == "":
                section = k
                if k == "forbidden":
                    out[k] = []
                else:
                    out.setdefault(k, {})
                continue
            out[k] = _coerce(v)
            section = None
            continue
        if section == "forbidden" and s.startswith("- "):
            out.setdefault("forbidden", []).append(s[2:].strip().strip('"').strip("'"))
            continue
        if section == "dataset" and indent == 2 and s.endswith(":") and s.count(":") == 1:
            nested = s[:-1].strip()
            if nested == "checksums":
                buckets["checksums"] = {}
                out.setdefault("dataset", {})["checksums"] = buckets["checksums"]
            continue
        if section == "dataset" and nested == "checksums" and indent == 4 and s.endswith(":"):
            role = s[:-1].strip()
            buckets["checksums"][role] = {}
            continue
        if section == "dataset" and nested == "checksums" and indent >= 6 and ":" in s:
            # find current role = last key in checksums being filled — track via last role
            role = list(buckets["checksums"].keys())[-1] if buckets["checksums"] else None
            if role:
                k, v = s.split(":", 1)
                buckets["checksums"][role][k.strip()] = _coerce(v.strip().strip('"').strip("'"))
            continue
        if section and indent >= 2 and ":" in s and not s.startswith("- ") and nested is None:
            k, v = s.split(":", 1)
            k, v = k.strip(), v.strip().strip('"').strip("'")
            if section in ("dataset", "hyperparams", "outputs", "gates"):
                out.setdefault(section, {})[k] = _coerce(v) if v else v
            continue
    return out


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


def main() -> int:
    if not JOB_PATH.is_file():
        _fail(f"missing {JOB_PATH}")
    if not HP_PATH.is_file():
        _fail(f"missing {HP_PATH}")

    job = _load_yaml_lite(JOB_PATH.read_text(encoding="utf-8"))
    hp = json.loads(HP_PATH.read_text(encoding="utf-8"))

    if job.get("type") != "train.sft":
        _fail(f"type must be train.sft, got {job.get('type')!r}")

    ds = job.get("dataset") or {}
    if ds.get("id") != EXPECTED_DATASET_ID:
        _fail(f"dataset.id must be {EXPECTED_DATASET_ID!r}, got {ds.get('id')!r}")
    if ds.get("version") != EXPECTED_DATASET_VERSION:
        _fail(
            f"dataset.version must be {EXPECTED_DATASET_VERSION!r}, got {ds.get('version')!r}"
        )

    manifest_rel = ds.get("manifest_path") or ds.get("manifestPath")
    if manifest_rel != EXPECTED_MANIFEST:
        _fail(f"dataset.manifest_path must be {EXPECTED_MANIFEST!r}, got {manifest_rel!r}")

    data_commit = ds.get("data_commit_sha") or ds.get("dataCommitSha")
    if data_commit != EXPECTED_DATA_COMMIT:
        _fail(f"dataset.data_commit_sha must be {EXPECTED_DATA_COMMIT!r}, got {data_commit!r}")

    if job.get("recipe") != "sft-ip-mvp.v1":
        _fail(f"recipe must be sft-ip-mvp.v1, got {job.get('recipe')!r}")
    if not job.get("base_model"):
        _fail("base_model required")

    jhp = job.get("hyperparams") or {}
    for k in REQUIRED_HP_KEYS:
        if k not in jhp and k not in hp:
            _fail(f"hyperparam {k!r} missing from job.yaml and hyperparams.json")

    hp_ds = hp.get("dataset") or {}
    if hp_ds.get("id") != EXPECTED_DATASET_ID or hp_ds.get("version") != EXPECTED_DATASET_VERSION:
        _fail(
            "hyperparams.json dataset pin must be "
            f"{EXPECTED_DATASET_ID}@{EXPECTED_DATASET_VERSION}"
        )

    for field in ("cluster", "gpu"):
        if field not in job:
            _fail(f"honesty field {field!r} required")
    if job.get("cluster") != "none":
        _fail("cluster must be 'none' for this MVP")

    outs = job.get("outputs") or {}
    for k in ("checkpoint_uri", "metrics_uri", "registry_revision"):
        if k not in outs:
            _fail(f"outputs.{k} required")

    gates = job.get("gates") or {}
    if "go_no_go" not in gates:
        _fail("gates.go_no_go required")
    go_path = ROOT / str(gates["go_no_go"])
    if not go_path.is_file():
        _fail(f"gates.go_no_go file missing: {go_path}")

    # Manifest + checksum verification when present in-repo
    manifest_path = REPO / EXPECTED_MANIFEST
    if not manifest_path.is_file():
        _fail(f"manifest missing: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("id") != EXPECTED_DATASET_ID or manifest.get("version") != EXPECTED_DATASET_VERSION:
        _fail("manifest id/version mismatch vs Job pin")

    for role, (exp_sha, exp_rows) in EXPECTED_CHECKSUMS.items():
        rel = f"docs/ai-data/mvp-sft/splits/{role}.jsonl"
        fpath = REPO / rel
        if not fpath.is_file():
            _fail(f"split file missing: {rel}")
        got = _sha256_file(fpath)
        if got != exp_sha:
            _fail(f"{role} sha256 mismatch: got {got}, expected {exp_sha}")
        n = _count_jsonl(fpath)
        if n != exp_rows:
            _fail(f"{role} row count {n} != {exp_rows}")
        # cross-check manifest files list
        mfile = next((x for x in manifest.get("files", []) if x.get("role") == role), None)
        if mfile and mfile.get("sha256") != exp_sha:
            _fail(f"manifest {role} sha256 disagrees with Job pin")

    print("OK: job.train.sft.yaml + hyperparams.json valid")
    print(f"  type={job['type']} recipe={job['recipe']}")
    print(f"  dataset={ds['id']}@{ds['version']}")
    print(f"  manifest={EXPECTED_MANIFEST}")
    print(f"  data_commit={EXPECTED_DATA_COMMIT[:12]}…")
    print(f"  checksums: train/val/test verified")
    print(f"  base_model={job['base_model']}")
    print(f"  cluster={job['cluster']} gpu={job['gpu']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
