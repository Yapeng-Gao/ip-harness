import type { ProjectThread } from '../projects/types';
import { orgDeptByLeadSeat, deptSlug } from '../departments/orgDepts';
export function latestDepartmentSlug(caseId: string, threads: Pick<ProjectThread, 'projectId' | 'expertId' | 'updatedAt' | 'departmentBrief'>[]): string | undefined {
    const latest = threads.filter((t) => t.projectId === caseId && t.departmentBrief).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const dept = latest ? orgDeptByLeadSeat(latest.expertId) : undefined;
    return dept ? deptSlug(dept.id) : undefined;
}
export function buildDepartmentBrief(input: {
    goal: string;
    context: string;
    fileNames: string[];
}): ProjectThread['departmentBrief'] | null {
    const goal = input.goal.trim();
    if (!goal)
        return null;
    return { goal, context: input.context.trim(), fileNames: [...new Set(input.fileNames.filter(Boolean))], confirmedAt: new Date().toISOString() };
}
export const DEPARTMENT_INTAKE: Record<string, {
    question: string;
    materials: string;
    result: string;
}> = {
    intake: { question: '想判断哪个方向？希望解决什么问题，有什么时间或资源限制？', materials: '方向说明、需求背景、已有调研', result: '方向与范围建议，交你决定立项、调整或搁置' },
    inspire: { question: '具体卡在哪里？试过什么，希望达到什么效果？', materials: '问题描述、现有方案、实验记录', result: '可比较的改进路径，由你选择下一步' },
    mining: { question: '要从哪部分研发成果里找创新点？希望得到点包还是分析报告？', materials: '研发说明、图纸、实验记录', result: '创新点和拆案建议，确认后再交交底部' },
    disclosure: { question: '技术解决什么问题，关键结构或步骤是什么？已有草稿要改哪里？', materials: '技术说明、图纸、实验数据或交底草稿', result: '交底草稿 → 事实确认 → 缺项和质检 → 确认交给申请部' },
    draft: { question: '希望保护什么？有没有交底书，有什么特别希望保留的范围？', materials: '交底书、已有申请稿、申请人和发明人信息', result: '核对材料与理解 → 讨论保护范围 → 起草与审核 → 单独确认递交' },
    oa: { question: '收到哪次通知书？截止时间是什么，最担心哪个争点？', materials: '通知书、对比文件、原申请文本', result: '争点拆解 → 策略由你选 → 答复稿和审核 → 单独确认递交' },
    annuity: { question: '要管理哪些专利？本次是登记台账、核期限，还是讨论缴费？', materials: '申请号或授权号、台账、期限和缴费通知', result: '台账与待核期限，涉及费用和放弃时请你单独确认' },
    monetize: { question: '复盘哪个项目或专利组合、哪段时间？本轮只看总结，还是要讨论维持或放弃？', materials: '阶段目标、项目和专利台账、已有总结', result: '先确认复盘范围，再整理报告；维持或放弃另行拍板' },
};
