/**
 * 跑：node --import tsx --test apps/agent/src/business/homeContentPreview.test.ts
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertHomeChainAligned,
  assertHomeDutiesPresent,
  assertHomeExpertsBounded,
  HOME_CATEGORY_TITLE,
  HOME_CHAIN_STATIONS,
  HOME_CTA_PRIMARY,
  HOME_CTA_SECONDARY,
  HOME_DEMO_CASE,
  HOME_FOOTER,
  HOME_POSITIONING,
  HOME_SAMPLE_DELIVERABLES,
  HOME_SCENARIOS,
  HOME_SHOWCASE,
} from './homeContentPreview'
import { MAIN_CHAIN_DEPT_IDS } from '../departments/orgDepts'

/** §3.3 职责一句定稿（徽章副文） */
const EXPECTED_DUTY: Record<string, string> = {
  'dept-intake': '建项 · 方向确认',
  'dept-inspire': '问题 · 路径 · 选题',
  'dept-mining': '创新点 · 拆案',
  'dept-disclosure': '交底 · 事实核对',
  'dept-draft': '理解 · 申不申 · 递交',
  'dept-oa': '争点 · 策略 · 答复',
  'dept-annuity': '期限 · 年费 · 台账',
  'dept-monetize': '复盘报告 · 维持放弃',
}

describe('homeContentPreview (§4.0p / 批 A shelf narrative)', () => {
  it('eight stations align with MAIN_CHAIN_DEPT_IDS', () => {
    assert.equal(assertHomeChainAligned(), true)
    assert.equal(HOME_CHAIN_STATIONS.length, 8)
    assert.deepEqual(
      HOME_CHAIN_STATIONS.map((s) => s.deptId),
      [...MAIN_CHAIN_DEPT_IDS],
    )
  })

  it('each station exposes 1–3 expert post labels visible by default', () => {
    assert.equal(assertHomeExpertsBounded(), true)
    for (const s of HOME_CHAIN_STATIONS) {
      assert.ok(s.shortLabel.length > 0, s.deptId)
      assert.ok(s.experts.length >= 1 && s.experts.length <= 3, s.deptId)
    }
  })

  it('each station duty is the §3.3 responsibility sentence (not deliverable name)', () => {
    assert.equal(assertHomeDutiesPresent(), true)
    for (const s of HOME_CHAIN_STATIONS) {
      assert.ok(s.duty.length > 0, s.deptId)
      assert.equal(s.duty, EXPECTED_DUTY[s.deptId], s.deptId)
      // 兼容旧字段：deliverable 内容必须是职责句
      assert.equal(s.deliverable, s.duty, s.deptId)
    }
  })

  it('demo case highlights a main-chain station', () => {
    assert.ok(
      HOME_CHAIN_STATIONS.some((s) => s.deptId === HOME_DEMO_CASE.currentDeptId),
    )
    assert.ok(HOME_DEMO_CASE.title.length > 0)
    assert.ok(HOME_DEMO_CASE.currentDeptLabel.includes('部'))
  })

  it('sample deliverables are 2–3 patent artifacts with pending状态', () => {
    assert.ok(HOME_SAMPLE_DELIVERABLES.length >= 2)
    assert.ok(HOME_SAMPLE_DELIVERABLES.length <= 3)
    assert.ok(HOME_SAMPLE_DELIVERABLES.some((d) => d.status === '待确认'))
  })

  it('category title is a short shelf headline', () => {
    assert.ok(HOME_CATEGORY_TITLE.includes('Novada') || HOME_CATEGORY_TITLE.includes('Team'))
    assert.ok(HOME_CATEGORY_TITLE.length <= 20)
    assert.equal(HOME_CATEGORY_TITLE, 'Novada Team')
  })

  it('positioning and CTAs match Novada Team / 批 A copy', () => {
    assert.ok(HOME_POSITIONING.includes('Novada Team'))
    assert.ok(HOME_POSITIONING.includes('请示你拍') || HOME_POSITIONING.includes('你来拍板'))
    assert.equal(HOME_CTA_PRIMARY, '登录干活')
    assert.ok(HOME_CTA_SECONDARY.includes('货架'))
    assert.ok(HOME_FOOTER.includes('Novada Team') || HOME_FOOTER.includes('宣传站'))
    assert.ok(HOME_FOOTER.includes('无交卷'))
  })

  it('has 2–3 scenario cards with prototype bodies', () => {
    assert.ok(HOME_SCENARIOS.length >= 2)
    assert.ok(HOME_SCENARIOS.length <= 3)
    for (const s of HOME_SCENARIOS) {
      assert.ok(s.title.length > 0)
      assert.ok(s.body.length > 0)
    }
    assert.ok(HOME_SCENARIOS.some((s) => s.id === 'agency-multi'))
    assert.ok(HOME_SCENARIOS.some((s) => s.id === 'enterprise-chain'))
  })

  it('showcase copy explains交底包 and login-later footnote', () => {
    assert.ok(HOME_SHOWCASE.title.includes('交底'))
    assert.ok(HOME_SHOWCASE.body.includes('齐套才能交卷'))
    assert.ok(HOME_SHOWCASE.footnote.includes('登录后'))
  })
})
