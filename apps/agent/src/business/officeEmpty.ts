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
  generic: {
    title: '这里还是空的',
    body: '有稿件或排期后会显示在此。',
  },
}

export function officeEmpty(kind: OfficeEmptyKind): OfficeEmptyCopy {
  return OFFICE_EMPTY[kind] ?? OFFICE_EMPTY.generic
}
