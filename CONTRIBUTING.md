# 贡献指南

仓：[Yapeng-Gao/ip-harness](https://github.com/Yapeng-Gao/ip-harness) · 单 monorepo（多壳 + 共享内核样机）

## 分支

| 分支 | 用途 |
|------|------|
| `dev` | 日常开发 / 联调集成 |
| `main` | 可演示 / 生产候选；只收来自 `dev`（或 hotfix）的 PR |
| `feat/<域>-<简述>` | 功能（例 `feat/ops-alerts`） |
| `fix/<简述>` | 修演示阻塞 |

流程：`feat/*` → PR → **`dev`** → 发布时 PR → **`main`** → tag（可选 `demo-YYYYMMDD` / `v0.x.y`）。

热修：从 `main` 拉 `fix/*` → 合 `main` 后 **必须回合并 `dev`**。

## Owner（谁改哪里）

见 [`docs/TEAM_CHARTER.md`](./docs/TEAM_CHARTER.md)。跨 `packages/contracts` 的改动 PR 里写清影响面。

## 本地

```bash
git clone git@github.com:Yapeng-Gao/ip-harness.git
cd ip-harness
git checkout dev
npm install
npm run dev:mid          # :5173
# 需要联调时再开
npm run dev:workbench    # :5174
npm run dev:agent        # :5175
npm run dev:ops          # :5176
npm run dev:iam          # :5177
npm run dev:api          # :5180
```

## 提交前自检

```bash
npm run typecheck -w @ip/contracts
npm run typecheck -w @ip/mid   # 或你改动的 workspace
# 多壳已起时：
npm run test:e2e
```

## PR 要求

- 用仓库 PR 模板填完整
- 说明：改了什么 / 留档路径 / 怎么验 / 是否动 contracts
- 样机口径：不假装真 SSO / 真可观测 / 真后端

## 设计留档

架构与数据流：[`docs/architecture/`](./docs/architecture/)  
代码架构地图：[`docs/architecture/codebase.md`](./docs/architecture/codebase.md)  
文档索引 / 归档：[`docs/README.md`](./docs/README.md)  
仓库策略：[`docs/architecture/repos-and-vcs.md`](./docs/architecture/repos-and-vcs.md)
