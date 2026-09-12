# 作业中台 Owner 现状（apps/mid :5173）

## 完成

- `dev:mid`
- MidLayout/Sidebar 跨口绝对链
- `agent/*` RedirectExternal 保留 path/search/hash
- CaseDetail `?tab=overview|handoff|billing|audit` 读写（可叠 `from=agent`）
- `VITE_MULTI_APP` 下 Dashboard/CaseDetail/Docket 走 `APP_DEV_URLS`
- 无 mid.css，跟根字体
- 手验 `tab=audit` 通过
- `tsc -w @ip/mid` 绿

## 路由清单

- `/` `/pipeline` `/cases` `/cases/:id` `/docket` `/billing` `/settings/org` `/insight/*`
- `/stage/:stageId` → :5174
- 深链：`/cases/c1?tab=audit`

## 怎么验

```bash
npm run dev:mid
npm run typecheck -w @ip/mid
```

打开 http://localhost:5173/cases/c1?tab=audit

## 边界

- 只改 `apps/mid`
- 页本体仍 `@shared`
- 不改 workbench / agent / ops / iam

## 已知非阻塞

- 盒内 CJK 字体跟根栈（Noto Sans SC）；环境匹配问题归根 css / 总控排期
- tsc 曾红在 `src/data/agents|persona`，已止血

## 下一步建议

- 盯 e2e L0 中台路由
- README 与本页同步
- 无新 P0 则待命盯回归
