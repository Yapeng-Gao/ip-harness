import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDepartmentBrief, latestDepartmentSlug } from './departmentBrief';
test('resuming a case chooses its latest confirmed department rather than a default or another case', () => {
    const brief = { goal: '复盘', context: '', fileNames: [], confirmedAt: '2026-11-02T09:00:00Z' };
    assert.equal(latestDepartmentSlug('c1', [{ projectId: 'c1', expertId: 'expert-monetize', updatedAt: '2026-11-02T09:00:00Z', departmentBrief: brief }, { projectId: 'c2', expertId: 'expert-draft', updatedAt: '2026-11-02T10:00:00Z', departmentBrief: brief }]), 'monetize');
});
test('blank goals cannot be confirmed as a department task', () => {
    assert.equal(buildDepartmentBrief({ goal: '  ', context: '', fileNames: [] }), null);
});
test('department intake preserves user context and deduplicates selected filenames without claiming content was read', () => {
    const r = buildDepartmentBrief({ goal: '  复盘今年的研发项目 ', context: '仅统计一至三季度，暂不做维持决策', fileNames: ['台账.xlsx', '台账.xlsx'] });
    assert.equal(r?.goal, '复盘今年的研发项目');
    assert.equal(r?.context, '仅统计一至三季度，暂不做维持决策');
    assert.deepEqual(r?.fileNames, ['台账.xlsx']);
    assert.ok(r?.confirmedAt);
});
