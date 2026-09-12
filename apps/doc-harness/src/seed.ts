import type {
  Annotation,
  CaseBundle,
  DemoCase,
  Document,
  DocumentChapter,
  DocumentRevision,
} from './types'

/** 顶栏 / 左树 CaseSwitcher 用 · ≥3 案 */
export const CASES: DemoCase[] = [
  {
    id: 'c-draft-sensing',
    title: '撰写稿 · 智能传感装置',
    shortLabel: '撰写稿',
    stageId: 'drafting',
    blurb: '专利申请草稿 · 摘要 / 权利要求 / 实施例',
  },
  {
    id: 'c-oa-response',
    title: 'OA 答复 · 智能传感装置',
    shortLabel: 'OA 答复',
    stageId: 'prosecution',
    blurb: '审查意见答复 · 要点 / 策略 / 修改后权利要求',
  },
  {
    id: 'c-inventor-disclosure',
    title: '发明人交底 · 智能传感装置',
    shortLabel: '发明人交底',
    stageId: 'inventor',
    blurb: '技术交底 · 交底书 / 已有方案 / 附图（章级闸示意）',
  },
]

const mark = (id: string, text: string) =>
  `<mark data-annotation-id="${id}" class="annotation-mark">${text}</mark>`

/* ───────── Case 1 · 撰写稿 ───────── */

const DRAFT_DOC_ID = 'doc-patent-draft-1'
const DRAFT_AT = '2026-09-12T10:00:00.000Z'
const DRAFT_AT2 = '2026-09-12T14:30:00.000Z'

const draftAbstractV1 =
  '<h2>发明摘要</h2>' +
  '<p>本发明涉及一种智能传感装置，包括传感模块、处理单元与通信接口。</p>'

const draftAbstractV2 =
  '<h2>发明摘要</h2>' +
  '<p>本发明涉及一种智能传感装置，包括传感模块、处理单元与通信接口。该装置可在工业现场采集多源信号，并经边缘侧预处理后上报云端，提升监测实时性与可靠性。</p>' +
  '<p>传感模块支持振动、温度与压力等多物理量同步采集；处理单元在边缘侧完成滤波、特征提取与异常初判，降低无效上报与带宽占用。</p>' +
  `<p>通信接口兼容工业以太网与${mark('ann-draft-abs-1', '无线低功耗链路')}，可按部署场景切换。装置外壳满足防尘防水等级，适用于管道、机柜与开放厂区等现场环境。</p>`

const draftClaims =
  '<h2>独立权利要求</h2>' +
  '<p>1. 一种智能传感装置，其特征在于，包括：</p>' +
  '<ol>' +
  '<li><p>传感模块，用于采集现场物理量；</p></li>' +
  `<li><p>处理单元，与所述传感模块耦接，用于对采集信号进行${mark('ann-draft-cl-1', '滤波与特征提取')}；</p></li>` +
  '<li><p>通信接口，与所述处理单元耦接，用于将处理结果上报至上位系统。</p></li>' +
  '</ol>' +
  '<h3>从属权利要求</h3>' +
  `<p>2. 根据权利要求1所述的装置，其特征在于，所述处理单元还配置为在边缘侧执行${mark('ann-draft-cl-2', '异常检测')}。</p>` +
  '<p>3. 根据权利要求1或2所述的装置，其特征在于，所述传感模块包括多通道 ADC，采样率可配置。</p>' +
  '<p>4. 根据权利要求1所述的装置，其特征在于，所述通信接口支持工业以太网与无线低功耗双模切换。</p>'

const draftEmbodiment =
  '<h2>实施例一 · 管道监测</h2>' +
  '<p>在一个实施例中，传感模块采用多通道 ADC 采样，处理单元为低功耗 MCU，通信接口支持工业以太网。现场部署时可挂载于管道外侧，通过夹持结构固定。</p>' +
  `<p>异常检测可采用${mark('ann-draft-em-1', '滑动窗口统计阈值')}，超限时触发本地告警并缓存上报。</p>` +
  '<h2>实施例二 · 机柜环境监测</h2>' +
  '<p>另一实施例中，装置置于机柜内，同时采集温度与振动。处理单元按优先级调度特征提取任务；通信接口在有线不可用时自动降级至无线链路，保证监测连续性。</p>' +
  '<p>部署步骤：（1）固定夹持件；（2）校准零点；（3）配置上报周期；（4）联调上位系统。</p>'

function buildDraftingBundle(): CaseBundle {
  const chapters: DocumentChapter[] = [
    {
      id: 'ch-draft-abstract',
      documentId: DRAFT_DOC_ID,
      key: 'abstract',
      title: '发明摘要',
      sort: 1,
      body: draftAbstractV2,
    },
    {
      id: 'ch-draft-claims',
      documentId: DRAFT_DOC_ID,
      key: 'claims',
      title: '权利要求',
      sort: 2,
      body: draftClaims,
    },
    {
      id: 'ch-draft-embodiment',
      documentId: DRAFT_DOC_ID,
      key: 'embodiment',
      title: '实施例',
      sort: 3,
      body: draftEmbodiment,
    },
  ]

  const revisions: DocumentRevision[] = [
    {
      id: 'rev-draft-abs-1',
      documentId: DRAFT_DOC_ID,
      chapterId: 'ch-draft-abstract',
      seq: 1,
      body: draftAbstractV1,
      actor: 'user',
      createdAt: DRAFT_AT,
      note: '种子稿 · 摘要初版',
    },
    {
      id: 'rev-draft-abs-2',
      documentId: DRAFT_DOC_ID,
      chapterId: 'ch-draft-abstract',
      seq: 2,
      body: draftAbstractV2,
      actor: 'user',
      commandType: 'saveDraft',
      parentRevisionId: 'rev-draft-abs-1',
      createdAt: DRAFT_AT2,
      note: '加厚摘要至三段',
    },
    {
      id: 'rev-draft-cl-1',
      documentId: DRAFT_DOC_ID,
      chapterId: 'ch-draft-claims',
      seq: 1,
      body: draftClaims,
      actor: 'user',
      createdAt: DRAFT_AT,
      note: '种子稿 · 权利要求',
    },
    {
      id: 'rev-draft-em-1',
      documentId: DRAFT_DOC_ID,
      chapterId: 'ch-draft-embodiment',
      seq: 1,
      body: draftEmbodiment,
      actor: 'user',
      createdAt: DRAFT_AT,
      note: '种子稿 · 实施例',
    },
  ]

  const annotations: Annotation[] = [
    {
      id: 'ann-draft-cl-1',
      chapterId: 'ch-draft-claims',
      quote: '滤波与特征提取',
      body: '建议写明滤波算法类型（如卡尔曼 / 滑动平均），便于审查意见答复。',
      author: '演示用户',
      createdAt: '2026-09-12T10:05:00.000Z',
      resolved: false,
      replies: [],
    },
    {
      id: 'ann-draft-cl-2',
      chapterId: 'ch-draft-claims',
      quote: '异常检测',
      body: '从属权利要求可补充检测阈值的可配置性。',
      author: '演示用户',
      createdAt: '2026-09-12T10:12:00.000Z',
      resolved: false,
      replies: [
        {
          id: 'reply-draft-1',
          body: '同意，实施例二已有上报周期配置，可交叉引用。',
          author: '演示用户',
          createdAt: '2026-09-12T11:00:00.000Z',
        },
      ],
    },
    {
      id: 'ann-draft-abs-1',
      chapterId: 'ch-draft-abstract',
      quote: '无线低功耗链路',
      body: '摘要中协议名可暂笼统，权利要求再具体化。',
      author: '演示用户',
      createdAt: '2026-09-12T14:40:00.000Z',
      resolved: false,
      replies: [],
    },
    {
      id: 'ann-draft-em-1',
      chapterId: 'ch-draft-embodiment',
      quote: '滑动窗口统计阈值',
      body: '已解决：实施例中补充了部署步骤，阈值表述可保留。',
      author: '演示用户',
      createdAt: '2026-09-12T15:00:00.000Z',
      resolved: true,
      replies: [],
    },
  ]

  const document: Document = {
    id: DRAFT_DOC_ID,
    caseId: 'c-draft-sensing',
    stageId: 'drafting',
    handoffKey: 'draft_claims',
    title: '专利申请草稿',
    chapterIds: chapters.map((c) => c.id),
    headRevisionId: 'rev-draft-cl-1',
    skuLabel: 'wb.stage.draft',
    authorized: true,
  }

  return {
    caseMeta: CASES[0],
    document,
    chapters,
    revisions,
    annotations,
    defaultChapterId: 'ch-draft-claims',
  }
}

/* ───────── Case 2 · OA 答复 ───────── */

const OA_DOC_ID = 'doc-oa-response-1'
const OA_AT = '2026-09-10T09:00:00.000Z'
const OA_AT2 = '2026-09-11T16:20:00.000Z'

const oaPoints =
  '<h2>审查意见要点</h2>' +
  '<p>审查员认为权利要求1中「处理单元」与对比文件 D1 公开的控制器实质相同，创造性不足。</p>' +
  `<p>此外，从属权利要求2的${mark('ann-oa-1', '异常检测')}特征被指出缺乏具体技术手段支持。</p>` +
  '<p>说明书实施例对边缘侧预处理的描述偏概括，建议补充算法步骤与效果数据。</p>'

const oaStrategy =
  '<h2>答复策略</h2>' +
  '<p>1. 将独立权利要求限定为「边缘侧滤波 + 特征提取 + 本地异常初判」组合，以区别 D1 仅做透传上报。</p>' +
  `<p>2. 在说明书补充${mark('ann-oa-2', '滑动窗口阈值')}与误报率对照表，支撑创造性论述。</p>` +
  '<p>3. 修改从属权利要求，明确异常检测的可配置参数与上报策略。</p>'

const oaAmendedV1 =
  '<h2>修改后权利要求（初稿）</h2>' +
  '<p>1. 一种智能传感装置……（待改）</p>'

const oaAmendedV2 =
  '<h2>修改后权利要求</h2>' +
  '<p>1. 一种智能传感装置，其特征在于，包括传感模块、处理单元与通信接口；所述处理单元配置为在边缘侧对采集信号依次执行滤波、特征提取与异常初判，并将初判结果经所述通信接口上报。</p>' +
  `<p>2. 根据权利要求1所述的装置，其特征在于，所述异常初判采用可配置的${mark('ann-oa-3', '滑动窗口统计阈值')}。</p>` +
  '<p>3. 根据权利要求1所述的装置，其特征在于，所述通信接口在有线链路不可用时降级至无线低功耗链路。</p>'

function buildProsecutionBundle(): CaseBundle {
  const chapters: DocumentChapter[] = [
    {
      id: 'ch-oa-points',
      documentId: OA_DOC_ID,
      key: 'oa_points',
      title: '审查意见要点',
      sort: 1,
      body: oaPoints,
    },
    {
      id: 'ch-oa-strategy',
      documentId: OA_DOC_ID,
      key: 'response_strategy',
      title: '答复策略',
      sort: 2,
      body: oaStrategy,
    },
    {
      id: 'ch-oa-amended',
      documentId: OA_DOC_ID,
      key: 'amended_claims',
      title: '修改后权利要求',
      sort: 3,
      body: oaAmendedV2,
    },
  ]

  const revisions: DocumentRevision[] = [
    {
      id: 'rev-oa-pt-1',
      documentId: OA_DOC_ID,
      chapterId: 'ch-oa-points',
      seq: 1,
      body: oaPoints,
      actor: 'user',
      createdAt: OA_AT,
      note: '种子 · 审查意见摘录',
    },
    {
      id: 'rev-oa-st-1',
      documentId: OA_DOC_ID,
      chapterId: 'ch-oa-strategy',
      seq: 1,
      body: oaStrategy,
      actor: 'user',
      createdAt: OA_AT,
      note: '种子 · 答复策略',
    },
    {
      id: 'rev-oa-am-1',
      documentId: OA_DOC_ID,
      chapterId: 'ch-oa-amended',
      seq: 1,
      body: oaAmendedV1,
      actor: 'user',
      createdAt: OA_AT,
      note: '修改后权利要求初稿',
    },
    {
      id: 'rev-oa-am-2',
      documentId: OA_DOC_ID,
      chapterId: 'ch-oa-amended',
      seq: 2,
      body: oaAmendedV2,
      actor: 'agent',
      commandType: 'submitClaims',
      parentRevisionId: 'rev-oa-am-1',
      createdAt: OA_AT2,
      note: '历史 · mock Agent 加厚修改稿',
    },
  ]

  const annotations: Annotation[] = [
    {
      id: 'ann-oa-1',
      chapterId: 'ch-oa-points',
      quote: '异常检测',
      body: '需在答复意见书中逐条回应缺乏具体手段的指摘。',
      author: '演示用户',
      createdAt: '2026-09-10T09:30:00.000Z',
      resolved: false,
      replies: [],
    },
    {
      id: 'ann-oa-2',
      chapterId: 'ch-oa-strategy',
      quote: '滑动窗口阈值',
      body: '对照表数据用示意即可，样机不接真实验数据。',
      author: '演示用户',
      createdAt: '2026-09-10T10:00:00.000Z',
      resolved: false,
      replies: [],
    },
    {
      id: 'ann-oa-3',
      chapterId: 'ch-oa-amended',
      quote: '滑动窗口统计阈值',
      body: '与策略章用词保持一致。',
      author: '演示用户',
      createdAt: '2026-09-11T16:30:00.000Z',
      resolved: false,
      replies: [],
    },
  ]

  const document: Document = {
    id: OA_DOC_ID,
    caseId: 'c-oa-response',
    stageId: 'prosecution',
    handoffKey: 'oa_response',
    title: '审查意见答复稿',
    chapterIds: chapters.map((c) => c.id),
    headRevisionId: 'rev-oa-am-2',
    skuLabel: 'wb.stage.prosecution',
    authorized: true,
  }

  return {
    caseMeta: CASES[1],
    document,
    chapters,
    revisions,
    annotations,
    defaultChapterId: 'ch-oa-amended',
  }
}

/* ───────── Case 3 · 发明人交底 ───────── */

const INV_DOC_ID = 'doc-inventor-1'
const INV_AT = '2026-09-08T08:00:00.000Z'
const INV_AT2 = '2026-09-09T11:15:00.000Z'

const invDisclosure =
  '<h2>技术交底书</h2>' +
  '<p>本发明人对现有工业现场监测痛点：多源信号分散、云端延迟高、误报多。</p>' +
  `<p>提出在边缘侧完成${mark('ann-inv-1', '预处理与异常初判')}，再按策略上报，以降低带宽与误报。</p>` +
  '<p>期望保护范围覆盖传感采集、边缘处理与双模通信的组合方案。</p>'

const invPriorV1 =
  '<h2>已有方案</h2>' +
  '<p>（待发明人补充）</p>'

const invPriorV2 =
  '<h2>已有方案</h2>' +
  '<p>公司现有产品仅做数据采集透传，无边缘特征提取；竞品 D1 公开了控制器上报，但未披露边缘异常初判与双模降级。</p>' +
  `<p>内部试验表明边缘初判可将无效上报降低约 ${mark('ann-inv-2', '30%')}（示意数据，非实测背书）。</p>`

const invFigures =
  '<h2>附图说明</h2>' +
  '<p>图1：装置模块框图（传感 / 处理 / 通信）。</p>' +
  '<p>图2：边缘处理流程图（滤波 → 特征 → 初判 → 上报）。</p>' +
  '<p>图3：现场夹持部署示意图。</p>'

function buildInventorBundle(): CaseBundle {
  const chapters: DocumentChapter[] = [
    {
      id: 'ch-inv-disclosure',
      documentId: INV_DOC_ID,
      key: 'disclosure',
      title: '技术交底书',
      sort: 1,
      body: invDisclosure,
    },
    {
      id: 'ch-inv-prior',
      documentId: INV_DOC_ID,
      key: 'prior_art',
      title: '已有方案',
      sort: 2,
      body: invPriorV2,
    },
    {
      id: 'ch-inv-figures',
      documentId: INV_DOC_ID,
      key: 'figures',
      title: '附图说明',
      sort: 3,
      body: invFigures,
      locked: true,
      lockReason:
        'SKU 未授权「附图模块」（mock 示意 wb.stage.inventor.figures）· 只读',
    },
  ]

  const revisions: DocumentRevision[] = [
    {
      id: 'rev-inv-di-1',
      documentId: INV_DOC_ID,
      chapterId: 'ch-inv-disclosure',
      seq: 1,
      body: invDisclosure,
      actor: 'user',
      createdAt: INV_AT,
      note: '种子 · 交底书',
    },
    {
      id: 'rev-inv-pr-1',
      documentId: INV_DOC_ID,
      chapterId: 'ch-inv-prior',
      seq: 1,
      body: invPriorV1,
      actor: 'user',
      createdAt: INV_AT,
      note: '已有方案占位',
    },
    {
      id: 'rev-inv-pr-2',
      documentId: INV_DOC_ID,
      chapterId: 'ch-inv-prior',
      seq: 2,
      body: invPriorV2,
      actor: 'user',
      commandType: 'saveDraft',
      parentRevisionId: 'rev-inv-pr-1',
      createdAt: INV_AT2,
      note: '发明人补充已有方案',
    },
    {
      id: 'rev-inv-fg-1',
      documentId: INV_DOC_ID,
      chapterId: 'ch-inv-figures',
      seq: 1,
      body: invFigures,
      actor: 'user',
      createdAt: INV_AT,
      note: '种子 · 附图说明',
    },
  ]

  const annotations: Annotation[] = [
    {
      id: 'ann-inv-1',
      chapterId: 'ch-inv-disclosure',
      quote: '预处理与异常初判',
      body: '交底用语偏口语，转入撰写稿时需术语化。',
      author: '演示用户',
      createdAt: '2026-09-08T08:20:00.000Z',
      resolved: false,
      replies: [],
    },
    {
      id: 'ann-inv-2',
      chapterId: 'ch-inv-prior',
      quote: '30%',
      body: '示意比例，勿当作真实实验结论对外引用。',
      author: '演示用户',
      createdAt: '2026-09-09T11:20:00.000Z',
      resolved: false,
      replies: [],
    },
  ]

  const document: Document = {
    id: INV_DOC_ID,
    caseId: 'c-inventor-disclosure',
    stageId: 'inventor',
    handoffKey: 'inventor_disclosure',
    title: '发明人技术交底',
    chapterIds: chapters.map((c) => c.id),
    headRevisionId: 'rev-inv-di-1',
    skuLabel: 'wb.stage.inventor',
    /** 整案仍可浏览；附图章 locked 演示章级闸。另：可用 authorized:false 演示整案闸 */
    authorized: true,
  }

  return {
    caseMeta: CASES[2],
    document,
    chapters,
    revisions,
    annotations,
    defaultChapterId: 'ch-inv-disclosure',
  }
}

const BUILDERS: Record<string, () => CaseBundle> = {
  'c-draft-sensing': buildDraftingBundle,
  'c-oa-response': buildProsecutionBundle,
  'c-inventor-disclosure': buildInventorBundle,
}

export function buildCaseBundle(caseId: string): CaseBundle {
  const build = BUILDERS[caseId]
  if (!build) {
    throw new Error(`未知 caseId: ${caseId}`)
  }
  return build()
}

export const DEFAULT_CASE_ID = CASES[0].id

/** @deprecated 使用 buildCaseBundle / CASES；保留别名以免外部误引用 */
export function buildSeed() {
  return buildCaseBundle(DEFAULT_CASE_ID)
}

export const DEMO_CASE = CASES[0]
export const DEFAULT_CHAPTER_ID = 'ch-draft-claims'
export const SEED_ANNOTATIONS = buildDraftingBundle().annotations
