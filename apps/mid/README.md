# apps/mid · 作业中台

启动：`npm run dev:mid` → http://localhost:5173

可访问路由：

- http://localhost:5173/ Dashboard
- /pipeline Pipeline
- /cases CaseLibrary
- /cases/:id CaseDetail（含节点进度只读树；`?tab=overview|handoff|billing|audit`）
- /cases/:id?tab=audit 审计 Tab 深链
- /docket Docket
- /billing 与 /billing/cases Billing
- /settings/org OrgSettings
- /insight/* Insight
- /stage/:stageId 跳转办理台 :5174
- /login → :5177（IAM）
- /agent/* → :5175（Agent）
