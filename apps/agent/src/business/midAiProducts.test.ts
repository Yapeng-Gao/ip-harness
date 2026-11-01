/**
 * §133 中栏 AI 产物同源
 * 跑：node --import tsx --test apps/agent/src/business/midAiProducts.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  applyAssistantFillToMid,
  aiProductsFromMessages,
  composeMidDeliverableBody,
  focusMidAiProductBody,
  MID_AI_SYNC_HONEST,
  seatAiProgressExcerpt,
} from './midAiProducts'
import { deliverableForExpert } from '../projects/patentDeliverables'
import { getProjectExpert } from '../projects/experts'

describe('midAiProducts', () => {
  it('prefers artifactMarkdown override', () => {
    const body = composeMidDeliverableBody({
      artifactMarkdown: '## 手改交底\n\n水道',
      officeMainBody: '【交底成稿】',
      handoffDeliverable: '交接',
    })
    assert.equal(body, '## 手改交底\n\n水道')
  })

  it('office mainBody alone when seat not advanced', () => {
    const dual = deliverableForExpert('expert-disclosure')
    const steps = getProjectExpert('expert-disclosure').steps
    const body = composeMidDeliverableBody({
      officeMainBody: '【交底成稿 · 本步】\n\n技术领域：电机散热',
      dual,
      expertSteps: steps,
      seatStepIndex: 0,
    })
    assert.match(body, /交底成稿/)
    assert.doesNotMatch(body, new RegExp(MID_AI_SYNC_HONEST))
  })

  it('appends seat AI progress after office when seat advanced', () => {
    const dual = deliverableForExpert('expert-disclosure')
    const steps = getProjectExpert('expert-disclosure').steps
    const body = composeMidDeliverableBody({
      officeMainBody: '【交底成稿 · 本步】\n\n技术领域：电机散热',
      dual,
      expertSteps: steps,
      seatStepIndex: 2,
    })
    assert.match(body, /交底成稿/)
    assert.match(body, new RegExp(MID_AI_SYNC_HONEST))
    assert.match(body, /本席推进记录/)
  })

  it('draft seat surfaces 特征表 progressive in mid when no office body', () => {
    const dual = deliverableForExpert('expert-draft')
    const steps = getProjectExpert('expert-draft').steps
    const body = composeMidDeliverableBody({
      dual,
      expertSteps: steps,
      seatStepIndex: 0,
    })
    assert.match(body, /特征|权要|撰写|交底/)
  })

  it('seatAiProgressExcerpt keeps 推进记录', () => {
    const raw = '# 样机\n\n## 摘要\nx\n\n## 本席推进记录（随步更新）\n\n### 1. 特征表\n表'
    assert.match(seatAiProgressExcerpt(raw), /^## 本席推进记录/)
  })

  it('focusMidAiProductBody merges into office paper', () => {
    const body = focusMidAiProductBody({
      officeMainBody: '【交底】正文',
      title: '特征表',
      body: '| # | 特征 |\n| 1 | 水道 |',
    })
    assert.match(body, /交底/)
    assert.match(body, /特征表/)
    assert.match(body, /水道/)
  })

  it('surfaces right-rail chat AI products into mid even when seatIndex=0', () => {
    const body = composeMidDeliverableBody({
      officeMainBody: '【交底成稿 · 本步】\n\n技术领域：电机散热',
      seatStepIndex: 0,
      messages: [
        {
          role: 'assistant',
          content: '【交底】六段表已齐：螺旋水道、端盖鳍片、双密封。实施例×2 已结构化。',
          meta: { stepId: 'tech' },
        },
      ],
    })
    assert.match(body, /交底成稿/)
    assert.match(body, new RegExp(MID_AI_SYNC_HONEST))
    assert.match(body, /六段表已齐/)
  })

  it('aiProductsFromMessages skips short/user bubbles', () => {
    const list = aiProductsFromMessages([
      { role: 'user', content: '请干活吧请干活吧请干活吧请干活吧' },
      { role: 'assistant', content: '短' },
      { role: 'tool', content: '特征表 8 条 · 独权候选 3 · 已写入成果面板旁路', meta: { toolName: '特征表' } },
    ])
    assert.equal(list.length, 1)
    assert.equal(list[0]!.title, '特征表')
  })

  it('applyAssistantFillToMid writes 技术领域 into mid', () => {
    const body = applyAssistantFillToMid({
      officeMainBody: '【交底成稿 · 本步】\n\n技术领域：旧\n技术问题：温升',
      fieldKey: 'field',
      fieldLabel: '技术领域',
      fieldValue: '电机散热 / 水道与鳍片',
    })
    assert.match(body, /技术领域：电机散热/)
    assert.doesNotMatch(body, /技术领域：旧/)
  })
})
