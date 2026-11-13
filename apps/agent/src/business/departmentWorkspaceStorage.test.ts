import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mergeProjectThreads, persistDepartmentWorkspaces, readDepartmentWorkspaces } from './departmentWorkspaceStorage';
import type { ProjectThread } from '../projects/types';
const saved: ProjectThread = { id: 'saved-thread', projectId: 'user-case', expertId: 'expert-monetize', kind: 'expert', title: '复盘', messages: [], stepIndex: 0, updatedAt: '2026-11-02T09:00:00.000Z', departmentBrief: { goal: '复盘研发项目', context: '前三季度', fileNames: ['台账.xlsx'], confirmedAt: '2026-11-02T09:00:00.000Z' }, artifactMarkdown: '本案稿件', artifactVersions: [{ savedAt: '2026-11-02T09:00:00.000Z', markdown: '本案第一版' }] };
test('rebuilding a project preserves its restored department task and draft', () => {
    const empty = { ...saved, id: 'new-empty-thread', departmentBrief: undefined, artifactMarkdown: undefined, artifactVersions: undefined };
    const merged = mergeProjectThreads([saved], [empty]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.artifactMarkdown, '本案稿件');
    assert.equal(merged[0]?.departmentBrief?.context, '前三季度');
});
test('department tasks and manuscripts survive serialization without importing unrelated demo threads', () => {
    const memory = new Map<string, string>();
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => memory.set(k, v) } });
    try {
        persistDepartmentWorkspaces([saved, { ...saved, id: 'demo-thread', projectId: 'demo-case', departmentBrief: undefined }]);
        const restored = readDepartmentWorkspaces();
        assert.equal(restored.length, 1);
        assert.deepEqual(restored[0]?.departmentBrief?.fileNames, ['台账.xlsx']);
        assert.equal(restored[0]?.artifactVersions?.[0]?.markdown, '本案第一版');
    }
    finally {
        if (previous)
            Object.defineProperty(globalThis, 'localStorage', previous);
        else
            Reflect.deleteProperty(globalThis, 'localStorage');
    }
});
