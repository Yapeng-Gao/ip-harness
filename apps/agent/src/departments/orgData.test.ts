/**
 * 部门样机数据 · orgData 纯函数
 * 跑：node --import tsx --test apps/agent/src/departments/orgData.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  levelFromXp,
  xpProgress,
  deptLoad,
  workerIds,
  relationsFor,
} from './orgData'
import { ORG_DEPTS } from './orgDepts'

describe('levelFromXp', () => {
  it('档位边界', () => {
    assert.equal(levelFromXp(0), 1)
    assert.equal(levelFromXp(39), 1)
    assert.equal(levelFromXp(40), 2)
    assert.equal(levelFromXp(99), 2)
    assert.equal(levelFromXp(100), 3)
    assert.equal(levelFromXp(199), 3)
    assert.equal(levelFromXp(200), 4)
    assert.equal(levelFromXp(359), 4)
    assert.equal(levelFromXp(360), 5)
    assert.equal(levelFromXp(1000), 5)
  })
})

describe('xpProgress', () => {
  it('中间档位内进度', () => {
    const p = xpProgress(60) // L2: 40..100 → current 20 / 60
    assert.equal(p.level, 2)
    assert.equal(p.current, 20)
    assert.equal(p.need, 60)
    assert.equal(p.pct, 33)
  })
  it('满档返回 100%', () => {
    const p = xpProgress(999)
    assert.equal(p.level, 5)
    assert.equal(p.pct, 100)
  })
  it('起点', () => {
    const p = xpProgress(0)
    assert.equal(p.level, 1)
    assert.equal(p.current, 0)
    assert.equal(p.pct, 0)
  })
})

describe('deptLoad', () => {
  it('有挂起即高负荷', () => {
    assert.equal(deptLoad(2, 0), '高负荷')
    assert.equal(deptLoad(0, 3), '运转中')
    assert.equal(deptLoad(0, 0), '待命')
  })
})

describe('workerIds', () => {
  it('生成 01 起编号', () => {
    assert.deepEqual(workerIds('w-draft', 3), ['w-draft-01', 'w-draft-02', 'w-draft-03'])
  })
})

describe('relationsFor', () => {
  it('中间节点有上下游', () => {
    const r = relationsFor('dept-research')
    assert.equal(r.upstream?.from, 'dept-disclosure')
    assert.equal(r.downstream?.to, 'dept-intake')
    assert.ok(Array.isArray(r.cross))
    assert.ok(r.cross.length > 0)
  })
  it('链首无上游，链尾无下游', () => {
    assert.equal(relationsFor('dept-disclosure').upstream, undefined)
    assert.equal(relationsFor('dept-oa').downstream, undefined)
  })
  it('未知部门返回空关系', () => {
    const r = relationsFor('dept-unknown' as 'dept-research')
    assert.equal(r.upstream, undefined)
    assert.equal(r.downstream, undefined)
    assert.equal(r.cross.length, 0)
  })
})

describe('ORG_DEPTS 覆盖', () => {
  it('relationsFor 的边引用的部门都已登记', () => {
    const ids = new Set(ORG_DEPTS.map((d) => d.id))
    for (const d of ORG_DEPTS) assert.ok(ids.has(d.id))
  })
})
