import type { ChapterKey, CommandLogEntry, DocumentRevision, MockCommandType } from './types'
import { stripHtml } from './htmlText'

let seqCounter = 0

export function nextId(prefix: string): string {
  seqCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${seqCounter}`
}

/**
 * mock dispatch 形状对齐 harness-loop：
 * { command: { type: 'submitClaims'|'saveDraft', caseId, note? }, meta: {...} }
 * 不写入 DomainCommand union；不调用 packages 执法。
 */
export function mockDispatch(args: {
  type: MockCommandType
  caseId: string
  documentId: string
  chapterId: string
  body: string
  seq: number
  parentRevisionId?: string
  actor: 'user' | 'agent'
  note?: string
}): { revision: DocumentRevision; log: CommandLogEntry } {
  const revisionId = nextId('rev')
  const at = new Date().toISOString()
  const revision: DocumentRevision = {
    id: revisionId,
    documentId: args.documentId,
    chapterId: args.chapterId,
    seq: args.seq,
    body: args.body,
    actor: args.actor,
    commandType: args.type,
    parentRevisionId: args.parentRevisionId,
    createdAt: at,
    note: args.note,
  }
  const log: CommandLogEntry = {
    id: nextId('cmd'),
    command: {
      type: args.type,
      caseId: args.caseId,
      note: args.note,
    },
    meta: {
      actor: args.actor,
      agentId: args.actor === 'agent' ? 'doc-harness-mock' : undefined,
      detail:
        args.type === 'submitClaims'
          ? `claims chapter revision seq=${args.seq}`
          : `saveDraft chapter=${args.chapterId} seq=${args.seq}`,
      internalHint: args.type === 'submitClaims' ? 'doc.apply_revision' : undefined,
    },
    at,
    revisionId,
    chapterId: args.chapterId,
  }
  return { revision, log }
}

/**
 * 按 chapter key 的结构化 mock 改写（禁止仅贴时间戳包装）。
 * 输出为干净 HTML（不含原 annotation Mark）——采纳时由 reattach 策略按 quote 重挂。
 */
export function mockRewriteChapter(
  key: ChapterKey | string,
  title: string,
  body: string,
): { proposedBody: string; summary: string } {
  const plain = stripHtml(body)
  const firstLine = plain.split(/\n+/).find((l) => l.trim())?.trim() ?? title

  switch (key) {
    case 'claims':
    case 'amended_claims':
      return {
        proposedBody:
          '<h2>独立权利要求</h2>' +
          `<p>1. ${escapeLite(firstLine.replace(/^\d+\.\s*/, ''))}（mock 重构：将技术特征拆为有序列表）</p>` +
          '<ol>' +
          '<li><p>传感模块，用于采集现场物理量；</p></li>' +
          '<li><p>处理单元，配置为边缘侧滤波、特征提取与异常初判；</p></li>' +
          '<li><p>通信接口，用于按策略上报处理结果。</p></li>' +
          '</ol>' +
          '<h3>从属权利要求</h3>' +
          '<p>2. 根据权利要求1所述的装置，其特征在于，所述异常初判采用可配置滑动窗口统计阈值。</p>' +
          '<p>3. 根据权利要求1所述的装置，其特征在于，所述通信接口支持有线 / 无线双模降级。</p>' +
          '<p>4. 根据权利要求2所述的装置，其特征在于，超限时触发本地告警并缓存上报。</p>',
        summary: `对「${title}」按权利要求结构模板重构（独立 + 从属 · mock）`,
      }

    case 'abstract':
      return {
        proposedBody:
          '<h2>发明摘要</h2>' +
          '<p>本发明提供一种智能传感装置，在工业现场采集多源信号，经边缘侧预处理后上报，兼顾实时性与带宽效率。</p>' +
          '<p>（mock 压缩）核心在于边缘滤波、特征提取与异常初判的组合，区别于单纯透传上报方案。</p>',
        summary: `对「${title}」压缩为两段摘要结构（mock）`,
      }

    case 'embodiment':
      return {
        proposedBody:
          '<h2>实施例 · 部署与处理步骤</h2>' +
          '<p>本实施例说明装置在管道监测场景的部署与边缘处理流程（mock 补步骤）。</p>' +
          '<ol>' +
          '<li><p>固定夹持结构并将传感模块贴合监测面；</p></li>' +
          '<li><p>校准零点并配置采样率；</p></li>' +
          '<li><p>处理单元执行滤波 → 特征提取 → 异常初判；</p></li>' +
          '<li><p>按上报策略经通信接口发送结果；有线不可用时降级无线。</p></li>' +
          '</ol>' +
          '<h3>效果说明</h3>' +
          '<p>相对透传方案，可降低无效上报并缩短本地告警时延（示意，非实测）。</p>',
        summary: `对「${title}」补全步骤化实施例（mock）`,
      }

    case 'oa_points':
      return {
        proposedBody:
          '<h2>审查意见要点（整理稿）</h2>' +
          '<ol>' +
          '<li><p>创造性：权利要求1与 D1 控制器特征被指实质相同；</p></li>' +
          '<li><p>充分公开：异常检测缺少具体技术手段；</p></li>' +
          '<li><p>说明书：边缘预处理描述偏概括，需补步骤与效果。</p></li>' +
          '</ol>',
        summary: `对「${title}」整理为条目化审查要点（mock）`,
      }

    case 'response_strategy':
      return {
        proposedBody:
          '<h2>答复策略（修订）</h2>' +
          '<p>一、独立权利要求增加「边缘侧滤波 + 特征提取 + 异常初判」限定，强调与 D1 透传差异。</p>' +
          '<p>二、说明书补充滑动窗口阈值与误报对照（示意表）。</p>' +
          '<p>三、从属权利要求明确可配置参数与双模降级。</p>',
        summary: `对「${title}」按三段答复策略模板改写（mock）`,
      }

    case 'disclosure':
      return {
        proposedBody:
          '<h2>技术交底书（整理）</h2>' +
          '<p>【背景】工业现场多源监测存在延迟与误报问题。</p>' +
          '<p>【方案】边缘侧预处理与异常初判 + 策略上报 + 双模通信。</p>' +
          '<p>【期望保护】采集、边缘处理与通信组合。</p>',
        summary: `对「${title}」整理为背景/方案/保护三段（mock）`,
      }

    case 'prior_art':
      return {
        proposedBody:
          '<h2>已有方案（对照表意）</h2>' +
          '<p>自有产品：采集透传，无边缘特征提取。</p>' +
          '<p>对比文件 D1：控制器上报，未披露边缘异常初判与双模降级。</p>' +
          '<p>差异点：边缘初判组合 + 链路降级策略（mock 整理）。</p>',
        summary: `对「${title}」整理已有方案对照（mock）`,
      }

    case 'figures':
      return {
        proposedBody:
          '<h2>附图说明（规范表述）</h2>' +
          '<p>图1示出装置模块框图，包括传感模块、处理单元与通信接口。</p>' +
          '<p>图2示出边缘处理流程：滤波、特征提取、异常初判与上报。</p>' +
          '<p>图3示出现场夹持部署示意。</p>',
        summary: `对「${title}」规范附图说明表述（mock）`,
      }

    default:
      return {
        proposedBody:
          `<h2>${escapeLite(title)}（润色稿）</h2>` +
          '<p>（mock 结构化润色 · 非时间戳包装）已重排段落层次，并统一术语：边缘侧 / 异常初判 / 双模降级。</p>' +
          `<p>${escapeLite(plain.slice(0, 280) || '（原章为空，已生成占位说明。）')}</p>` +
          '<p>请人工核对与前后章术语一致性。</p>',
        summary: `对「${title}」做通用结构化润色（mock）`,
      }
  }
}

function escapeLite(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
