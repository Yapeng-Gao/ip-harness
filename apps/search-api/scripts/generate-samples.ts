/**
 * Generate ≥100 patent JSON samples (+ quarantine bad docs) under data/samples/.
 * Themes expanded from apps/search seed (CN/EN mix).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(APP_ROOT, 'data', 'samples')

type Doc = {
  id: string
  publicationNumber?: string
  title?: string
  applicant?: string
  inventor?: string
  date?: string
  ipc?: string[]
  familyId?: string
  country?: string
  legalStatus?: string
  abstract?: string
  claims?: string
  snippet?: string
}

const THEMES: {
  key: string
  family: string
  applicants: [string, string]
  ipc: string[]
  titles: [string, string][]
  abstracts: [string, string][]
}[] = [
  {
    key: 'battery',
    family: 'fam-battery',
    applicants: ['宁德时代新能源科技股份有限公司', 'Contemporary Amperex Technology Co., Limited'],
    ipc: ['H01M10/0562', 'H01M10/052', 'H01M50/403'],
    titles: [
      ['一种固态电解质及其制备方法', 'Solid-state electrolyte and preparation thereof'],
      ['刀片电池模组热管理系统', 'Blade battery thermal management system'],
      ['锂离子电池隔膜涂覆浆料', 'Lithium-ion separator coating slurry'],
      ['硫化物固态电池正极材料', 'Sulfide solid-state cathode material'],
      ['硅碳负极复合材料', 'Silicon-carbon anode composite'],
    ],
    abstracts: [
      ['公开一种硫化物固态电解质，提升离子电导率与界面稳定性。', 'A sulfide solid-state electrolyte with improved ionic conductivity.'],
      ['刀片电池模组液冷板与热失控抑制结构。', 'Liquid cooling plate and thermal runaway suppression for blade cells.'],
      ['陶瓷涂覆隔膜浆料配方，改善热收缩。', 'Ceramic coating slurry improving separator thermal shrinkage.'],
      ['高镍正极与硫化物电解质界面改性方法。', 'Interface modification for high-Ni cathode and sulfide electrolyte.'],
      ['纳米硅分散于碳骨架的负极浆料体系。', 'Nano-silicon dispersed in a carbon scaffold anode slurry.'],
    ],
  },
  {
    key: 'semicon',
    family: 'fam-semicon',
    applicants: ['台湾积体电路制造股份有限公司', 'Taiwan Semiconductor Manufacturing Company, Ltd.'],
    ipc: ['H01L29/66', 'H01L29/78', 'H01L21/336'],
    titles: [
      ['具有环绕栅极的鳍式场效应晶体管', 'FinFET structure with gate-all-around channel'],
      ['环绕栅极鳍式场效晶体管结构', 'Gate-all-around FinFET device'],
      ['三维堆叠晶体管互连方法', '3D stacked transistor interconnect method'],
      ['高介电常数栅极介质沉积', 'High-k gate dielectric deposition'],
      ['极紫外光刻套刻校正', 'EUV lithography overlay correction'],
    ],
    abstracts: [
      ['公开环绕栅极通道结构及制造流程。', 'A FinFET device with wrapped gate and reduced short-channel effect.'],
      ['一种环绕栅极鳍式晶体管，改善短沟道效应。', 'GAA FinFET improving short-channel control.'],
      ['多层晶体管背面供电互连方案。', 'Backside power delivery for stacked transistors.'],
      ['原子层沉积高k介质以降低漏电。', 'ALD high-k dielectric reducing gate leakage.'],
      ['基于标记的极紫外套刻误差补偿。', 'Marker-based EUV overlay error compensation.'],
    ],
  },
  {
    key: 'pharma',
    family: 'fam-pharma',
    applicants: ['霍夫曼-拉罗奇有限公司', 'F. Hoffmann-La Roche AG'],
    ipc: ['A61K39/395', 'C07K16/28', 'A61P35/00'],
    titles: [
      ['用于肿瘤免疫治疗的双特异性抗体', 'Bispecific antibody for oncology immunotherapy'],
      ['靶向 PD-L1 的抗体药物偶联物', 'Antibody-drug conjugate targeting PD-L1'],
      ['实体瘤双抗给药方案', 'Methods of treating solid tumors with bispecific antibodies'],
      ['细胞因子融合蛋白组合物', 'Cytokine fusion protein composition'],
      ['肿瘤微环境调节性抗体', 'Tumor microenvironment modulating antibody'],
    ],
    abstracts: [
      ['靶向 PD-L1 与肿瘤抗原的双特异性抗体组合物。', 'Bispecific antibodies targeting PD-L1 and a tumor antigen.'],
      ['ADC 连接子与细胞毒素组合以提升治疗指数。', 'ADC linker-toxin combinations improving therapeutic index.'],
      ['实体瘤联合免疫检查点抑制方案。', 'Combination regimens with immune checkpoint blockade.'],
      ['IL-2 变体融合蛋白降低系统性毒性。', 'IL-2 variant fusion protein with reduced systemic toxicity.'],
      ['调节 Treg 浸润的抗体用途。', 'Antibodies modulating Treg infiltration in TME.'],
    ],
  },
  {
    key: 'comms',
    family: 'fam-comms',
    applicants: ['华为技术有限公司', 'Huawei Technologies Co., Ltd.'],
    ipc: ['H04W16/28', 'H04W72/04', 'H04L5/00'],
    titles: [
      ['5G NR 波束管理方法及终端', 'Beam management method and apparatus for NR'],
      ['毫米波测量报告配置', 'Terminal apparatus for beam measurement reporting'],
      ['上行控制信息复用方法', 'Uplink control information multiplexing for 5G'],
      ['MIMO 雷达感知波形设计', 'Wireless sensing with MIMO radar waveforms'],
      ['小区切换中的波束失败恢复', 'Beam failure recovery during handover'],
    ],
    abstracts: [
      ['一种用于毫米波频段的波束切换与测量报告方法。', 'Beam switching and measurement reporting for mmWave NR.'],
      ['终端侧波束测量报告配置。', 'Terminal-side beam measurement reporting configuration.'],
      ['NR 上行 PUSCH 上的 UCI 复用。', 'Multiplexing UCI on PUSCH for NR uplink.'],
      ['通感一体 MIMO 雷达波形。', 'Joint communication and sensing waveforms for MIMO radar.'],
      ['切换过程中的波束失败检测与恢复。', 'Beam failure detection and recovery during HO.'],
    ],
  },
  {
    key: 'materials',
    family: 'fam-materials',
    applicants: ['中国科学院化学研究所', 'Chinese Academy of Sciences'],
    ipc: ['C08L23/06', 'C08K3/04', 'C08L67/02'],
    titles: [
      ['一种聚合物复合材料及其制备方法', 'Polymer composite and preparation method'],
      ['石墨烯增强聚乙烯材料', 'Graphene-reinforced polyethylene material'],
      ['汽车外饰耐候聚合物共混物', 'Polymer blend for automotive exterior parts'],
      ['导热绝缘环氧灌封胶', 'Thermally conductive insulating epoxy encapsulant'],
      ['可回收聚酯弹性体', 'Recyclable polyester elastomer'],
    ],
    abstracts: [
      ['石墨烯增强聚乙烯复合材料，提升导热与力学强度。', 'Graphene-PE composite improving thermal and mechanical strength.'],
      ['少层石墨烯分散工艺与界面偶联。', 'Few-layer graphene dispersion and interfacial coupling.'],
      ['耐候聚合物共混用于外饰件。', 'Weather-resistant polymer blend for exterior trim.'],
      ['高导热填料填充环氧体系。', 'High-thermal-conductivity filler-filled epoxy system.'],
      ['动态共价键实现聚酯弹性体回收。', 'Dynamic covalent bonds enabling polyester elastomer recycling.'],
    ],
  },
  {
    key: 'ai',
    family: 'fam-ai',
    applicants: ['华为技术有限公司', 'Samsung Electronics Co., Ltd.'],
    ipc: ['G06N3/08', 'G06N3/063', 'G06F40/216'],
    titles: [
      ['基于大模型的专利摘要生成方法', 'Patent abstract generation with large language models'],
      ['稀疏注意力神经网络加速器', 'Neural network accelerator with sparse attention'],
      ['多模态检索重排序方法', 'Multimodal retrieval re-ranking method'],
      ['联邦学习差分隐私机制', 'Differential privacy mechanism for federated learning'],
      ['知识图谱辅助权利要求分析', 'Knowledge-graph assisted claim analysis'],
    ],
    abstracts: [
      ['利用预训练语言模型生成专利摘要的示意方法。', 'Generating patent abstracts with pretrained language models.'],
      ['稀疏 Transformer 注意力硬件加速器。', 'Hardware accelerator for sparse transformer attention.'],
      ['图文特征融合的检索重排。', 'Cross-modal feature fusion for retrieval re-ranking.'],
      ['本地更新噪声注入满足差分隐私。', 'Local update noise injection satisfying DP.'],
      ['基于图谱的权利要求要素抽取。', 'KG-based claim element extraction.'],
    ],
  },
  {
    key: 'display',
    family: 'fam-display',
    applicants: ['三星显示株式会社', 'Samsung Display Co., Ltd.'],
    ipc: ['H01L27/32', 'G09G3/3208', 'H01L51/50'],
    titles: [
      ['有机发光显示装置的像素电路', 'Pixel circuit of organic light-emitting display'],
      ['OLED 亮度补偿方法', 'OLED luminance compensation method'],
      ['柔性显示基板弯折区结构', 'Foldable display bending-area structure'],
      ['微型发光二极管转移方法', 'Micro-LED transfer method'],
      ['触控与显示驱动集成芯片', 'Touch and display driver integration IC'],
    ],
    abstracts: [
      ['OLED 画素补偿电路改善亮度均匀性。', 'OLED pixel compensation improving luminance uniformity.'],
      ['基于传感反馈的亮度漂移补偿。', 'Sensor-feedback based luminance drift compensation.'],
      ['弯折区走线应力释放结构。', 'Stress-relief routing in bending area.'],
      ['巨量转移对准与键合工艺。', 'Mass-transfer alignment and bonding process.'],
      ['TDDI 时序共享降低功耗。', 'TDDI timing sharing reducing power.'],
    ],
  },
  {
    key: 'auto',
    family: 'fam-auto',
    applicants: ['比亚迪股份有限公司', 'Toyota Motor Corporation'],
    ipc: ['B60L53/00', 'B60W30/06', 'H01M4/38'],
    titles: [
      ['电动汽车无线充电对准方法', 'Wireless charging alignment for EVs'],
      ['全固体电池用负极活物质', 'Anode active material for all-solid-state batteries'],
      ['自动泊车路径规划方法', 'Automated parking path planning method'],
      ['电驱总成噪声振动抑制', 'NVH suppression for e-drive assembly'],
      ['车载域控制器冗余架构', 'Redundant domain controller architecture'],
    ],
    abstracts: [
      ['基于线圈耦合系数的无线充电对准。', 'Wireless charging alignment based on coupling coefficient.'],
      ['全固体电池硅系负极活物质。', 'Silicon-based anode for all-solid-state batteries.'],
      ['狭窄车位多段路径规划。', 'Multi-segment path planning for tight parking.'],
      ['电驱齿轮啮合噪声主动抑制。', 'Active suppression of gear-mesh NVH.'],
      ['双域控制器故障切换机制。', 'Failover between dual domain controllers.'],
    ],
  },
]

const COUNTRIES = ['CN', 'US', 'EP', 'WO', 'JP', 'KR', 'TW'] as const
const STATUS = ['有效', '审查中', '失效'] as const

function pubNo(country: string, n: number, kind: 'A' | 'B' | 'A1' = 'A'): string {
  if (country === 'US') return `US${2020 + (n % 6)}${String(100000 + n).slice(-6)}${kind === 'B' ? 'B2' : 'A1'}`
  if (country === 'EP') return `EP${4000000 + n}${kind}`
  if (country === 'WO') return `WO${2020 + (n % 6)}${String(100000 + n).slice(-6)}${kind}`
  if (country === 'JP') return `JP${2020 + (n % 6)}${String(100000 + n).slice(-6)}${kind}`
  if (country === 'KR') return `KR${100000000 + n}B1`
  if (country === 'TW') return `TW${2020 + (n % 6)}${String(100000 + n).slice(-6)}${kind}`
  return `CN${110000000 + n}${kind}`
}

function dateFor(n: number): string {
  // Spread years independently of theme cycle (theme stride is 8).
  const y = 2018 + ((n * 5) % 8)
  const m = String(((n * 3) % 12) + 1).padStart(2, '0')
  const d = String(((n * 7) % 28) + 1).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildGoodDocs(target = 110): Doc[] {
  const docs: Doc[] = []
  let n = 1
  while (docs.length < target) {
    for (const theme of THEMES) {
      if (docs.length >= target) break
      const variant = (n - 1) % theme.titles.length
      const langCn = n % 2 === 1
      const country = COUNTRIES[(n - 1) % COUNTRIES.length]
      const [titleCn, titleEn] = theme.titles[variant]!
      const [absCn, absEn] = theme.abstracts[variant]!
      const applicant = langCn ? theme.applicants[0] : theme.applicants[1]
      const title = langCn ? titleCn : titleEn
      const abstract = langCn ? absCn : absEn
      const id = `p${String(n).padStart(3, '0')}`
      const ipc = theme.ipc.slice(0, 1 + (n % theme.ipc.length))
      docs.push({
        id,
        publicationNumber: pubNo(country, n),
        title: `${title}${n > 40 ? ` (#${n})` : ''}`,
        applicant,
        inventor: langCn ? `发明人${(n % 9) + 1}` : `Inventor ${(n % 9) + 1}`,
        date: dateFor(n),
        ipc,
        familyId: `${theme.family}-${(variant % 3) + 1}`,
        country,
        legalStatus: STATUS[n % STATUS.length],
        abstract: `【样本·非真库】 ${abstract}`,
        claims: langCn
          ? `1. 一种装置或方法，其特征在于…（样本 ${id}）`
          : `1. A device or method comprising… (sample ${id})`,
        snippet: langCn ? titleCn.slice(0, 24) : titleEn.slice(0, 40),
      })
      n += 1
    }
  }
  return docs
}

function buildQuarantineDocs(): Doc[] {
  return [
    {
      id: 'q-bad-01',
      // missing title AND publicationNumber
      applicant: '未知申请人 A',
      date: '2020-01-01',
      abstract: '故意缺必填：无 title 且无公开号',
      ipc: ['G06F'],
    },
    {
      id: 'q-bad-02',
      title: '',
      publicationNumber: '',
      applicant: 'Unknown Corp',
      abstract: 'empty strings for required fields',
    },
    {
      id: 'q-bad-03',
      // only whitespace
      title: '   ',
      publicationNumber: '  ',
      applicant: '空白必填测试',
      abstract: 'whitespace-only title and pub no',
    },
    {
      id: 'q-bad-04',
      inventor: '仅有发明人',
      country: 'CN',
      abstract: '无 title / publicationNumber',
    },
    {
      id: 'q-bad-05',
      familyId: 'fam-orphan',
      ipc: ['H01M'],
      abstract: 'quarantine sample 5',
    },
  ]
}

function main(): void {
  fs.mkdirSync(OUT, { recursive: true })
  for (const f of fs.readdirSync(OUT)) {
    if (f.endsWith('.json')) fs.unlinkSync(path.join(OUT, f))
  }
  const good = buildGoodDocs(110)
  const bad = buildQuarantineDocs()
  const all = [...good, ...bad]
  for (const doc of all) {
    const file = path.join(OUT, `${doc.id}.json`)
    fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n', 'utf8')
  }
  const manifest = {
    generatedAt: new Date().toISOString(),
    good: good.length,
    quarantineIntended: bad.length,
    total: all.length,
    note: 'Samples for search-api MVP ingest; not a real patent corpus.',
  }
  fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(`[generate-samples] wrote ${good.length} good + ${bad.length} quarantine → ${OUT}`)
}

main()
