# 部门·专家·团队 Implementation Plan

> **For agentic workers:** Implement task-by-task with TDD (`node --import tsx --test`).  
> **Spec:** [agent-dept-expert-team.md](../../architecture/product-apps/agent-dept-expert-team.md)

**Goal:** 样机 1：默认 7 部门树 + 副席占位；样机 2a：勾选组队进群聊。待确认仍走现部门主责闸。

**Architecture:** 新 `deptRoster.ts` 描述部门/主责/副席；侧栏按部门展开；`CaseProgress.teamMemberIds` 存本案团队；群聊按团队过滤。

**Tech Stack:** React + 现 businessSeats / BusinessCaseContext；node:test。

---

### Task 1: deptRoster 数据 + 测试

**Files:** Create `apps/agent/src/business/deptRoster.ts` + `.test.ts`

- [ ] 默认 7 部、主责=现 expert id、副席占位、departmentLabel、peersForLead、recommendTeamForStage

### Task 2: 侧栏部门树

**Files:** Modify `BusinessCaseSidebar.tsx`；可选更新 `preparedBy` 为「×部」

- [ ] 「本案部门」一级；展开主责可点 + 副席灰占位

### Task 3: 本案团队勾选 + 持久化

**Files:** Modify `BusinessCaseContext` (`teamMemberIds`)；Create `CaseTeamPanel.tsx`；Modify room page

- [ ] setCaseTeam / 按阶段推荐；群聊成员=团队（空则提示组队）
