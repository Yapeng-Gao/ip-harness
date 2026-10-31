/**
 * 全站空态文案 · Office 稿件语感（非工程 empty）
 * 机制统一；禁假官报 / 禁「无数据」工程师口吻。
 */
export type OfficeEmptyKind =
  | 'hall-todo'
  | 'hall-progress'
  | 'hall-relay'
  | 'hall-assets'
  | 'hall-cases-rail'
  | 'cases-list'
  | 'cases-filter'
  | 'company-pending'
  | 'company-other-cases'
  | 'wb-attachments'
  | 'wb-versions'
  | 'wb-body'
  | 'professional-missing'
  | 'billing-empty'
  | 'docket-empty'
  | 'sessions-empty'
  | 'sessions-filter'
  | 'case-room-empty'
  | 'case-process-empty'
  | 'pending-empty'
  | 'catalog-empty'
  | 'catalog-filter'
  | 'lab-empty'
  | 'lab-filter'
  | 'auth-demo'
  | 'generic'

export type OfficeEmptyCopy = {
  title: string
  body: string
  /** 可选弱提示 · 下一步 */
  next?: string
}

export const OFFICE_EMPTY: Record<OfficeEmptyKind, OfficeEmptyCopy> = {
  'hall-todo': {
    title: '暂无待你确认的稿件',
    body: '部门交卷后会停在这里，请你像批阅文件一样拍板。',
    next: '也可打开审计列表回看',
  },
  'hall-progress': {
    title: '暂无进行中的工单',
    body: '交底打包「现在做申请」或进入答复后，会出现在这里。',
  },
  'hall-relay': {
    title: '暂无待接力排期',
    body: '上方委托发出排期后，会写入本案进度供接力。',
  },
  'hall-assets': {
    title: '资料夹还是空的',
    body: '可点「上传」放入本地文件，或稍后再从资料夹选用。',
    next: '像往邮件里加附件一样',
  },
  'hall-cases-rail': {
    title: '还没有案子',
    body: '从上面委托开一个，案卷会出现在这里。',
  },
  'cases-list': {
    title: '案盘还是空的',
    body: '开一个案子，立一条可交卷的业务线。',
    next: '开新案子',
  },
  'cases-filter': {
    title: '没有匹配的案子',
    body: '换个关键词，或清空筛选再看全部案卷。',
  },
  'company-pending': {
    title: '暂无待你拍',
    body: '各部交卷后的硬请示会出现在这里。',
  },
  'company-other-cases': {
    title: '暂无其他案子',
    body: '本案之外的案卷切换会出现在这里。',
  },
  'wb-attachments': {
    title: '本站附件夹为空',
    body: '样机占位 · 正式上传与格式检查后置，不在此假装已齐套。',
    next: '可先写中栏正文 / 本稿零件',
  },
  'wb-versions': {
    title: '尚无另存版本',
    body: '可先看「差分示意」，或在右栏成果里另存一版稿件。',
  },
  'wb-body': {
    title: '本稿尚空',
    body: '点左栏零件或辅链写入种子，像打开一份 Word 草稿。',
  },
  'professional-missing': {
    title: '找不到这个案子',
    body: '专业编制须带案 · 请先开案子或从案盘进入。',
  },
  'billing-empty': {
    title: '尚未报价',
    body: '官费与服务费已分口袋列示 · 金额不以演示数冒充应付。',
    next: '报价/付款通道后置 · 可先回公司办主链',
  },
  'docket-empty': {
    title: '本案暂无期限事件',
    body: '递交或进入答复轮后会出现示意行；逾期不会静默。',
    next: '非真官报期限 · 可先回公司办主链',
  },
  'sessions-empty': {
    title: '暂无会话历史',
    body: '旁路函件夹：聚合通用单聊与专家线程。硬请示仍在部门工作台右栏，不在这里开第二套对话首页。',
    next: '可回大厅委托，或弱链新建会话；盯整案请用顶栏「项目」进公司案地图',
  },
  'sessions-filter': {
    title: '无匹配的会话历史',
    body: '当前筛选下没有条目 · 可切换来源或清除状态筛选。',
  },
  'case-room-empty': {
    title: '讨论组已卸',
    body: '组队/讨论组产品面已去掉；请回公司案首页从部门席继续。',
  },
  'case-process-empty': {
    title: '暂无过程行',
    body: '各部交卷、回流与确认后，过程会记在这里。',
  },
  'pending-empty': {
    title: '暂无需要你确认的事项',
    body: '部门交卷后的硬请示会停在这里，请你拍板。',
  },
  'catalog-empty': {
    title: '目录还是空的',
    body: '当前没有可列的助手条目。',
    next: '可回大厅继续委托办主链',
  },
  'catalog-filter': {
    title: '没有匹配的助手',
    body: '试试清空搜索，或换一层 / 阶段再看。',
  },
  'lab-empty': {
    title: '实验室暂无展品',
    body: '示意画廊 · 不进主链交卷，也不可在此作业/硬请示。',
    next: '回大厅或案盘继续办主链',
  },
  'lab-filter': {
    title: '没有匹配的展品',
    body: '试试清空搜索；实验室仍是旁路示意，不进主链交卷。',
    next: '回大厅办主链',
  },
  'auth-demo': {
    title: '还没有样机会话',
    body: '选角色进入只写入本地示意会话，不是真实账号登录。',
    next: '可先看宣传站货架，再进大厅',
  },
  generic: {
    title: '这里还是空的',
    body: '有稿件或排期后会显示在此。',
  },
}

export function officeEmpty(kind: OfficeEmptyKind): OfficeEmptyCopy {
  return OFFICE_EMPTY[kind] ?? OFFICE_EMPTY.generic
}
