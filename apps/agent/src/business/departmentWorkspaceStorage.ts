import type { ProjectThread } from '../projects/types';
export const DEPARTMENT_WORKSPACE_KEY = 'ip-agent-department-workspaces-v1';
export function mergeProjectThreads(existing: ProjectThread[], incoming: ProjectThread[]): ProjectThread[] {
    const keys = new Set(existing.map((t) => t.projectId + ':' + t.expertId));
    return [...existing, ...incoming.filter((t) => !keys.has(t.projectId + ':' + t.expertId))];
}
export function readDepartmentWorkspaces(): ProjectThread[] {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(DEPARTMENT_WORKSPACE_KEY) ?? 'null');
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter((t): t is ProjectThread => Boolean(t && typeof t === 'object' && typeof t.projectId === 'string' && typeof t.expertId === 'string' && Array.isArray(t.messages) && t.departmentBrief && typeof t.departmentBrief.goal === 'string' && typeof t.departmentBrief.context === 'string' && Array.isArray(t.departmentBrief.fileNames)));
    }
    catch {
        return [];
    }
}
export function persistDepartmentWorkspaces(threads: ProjectThread[]): void {
    try {
        localStorage.setItem(DEPARTMENT_WORKSPACE_KEY, JSON.stringify(threads.filter((t) => t.departmentBrief)));
    }
    catch { /* unavailable or quota */ }
}
