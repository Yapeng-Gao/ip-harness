import type { ProjectExpertDef, ProjectExpertId } from './types'
import {
  RESEARCH_DEPTH_SHORTCUTS,
  RESEARCH_DEPTH_STEPS,
} from './pack/researchDepth'
import {
  INTAKE_DEPTH_SHORTCUTS,
  INTAKE_DEPTH_STEPS,
} from './pack/intakeDepth'
import {
  DRAFT_DEPTH_SHORTCUTS,
  DRAFT_DEPTH_STEPS,
} from './pack/draftDepth'
import {
  DISCLOSURE_DEPTH_SHORTCUTS,
  DISCLOSURE_DEPTH_STEPS,
} from './pack/disclosureDepth'
import {
  FIGURE_DEPTH_SHORTCUTS,
  FIGURE_DEPTH_STEPS,
} from './pack/figureDepth'
import {
  FILING_DEPTH_SHORTCUTS,
  FILING_DEPTH_STEPS,
} from './pack/filingDepth'
import {
  OA_DEPTH_SHORTCUTS,
  OA_DEPTH_STEPS,
} from './pack/oaDepth'
import {
  LANDSCAPE_DEPTH_SHORTCUTS,
  LANDSCAPE_DEPTH_STEPS,
} from './pack/landscapeDepth'
import {
  INSPIRE_DEPTH_SHORTCUTS,
  INSPIRE_DEPTH_STEPS,
} from './pack/inspireDepth'
import {
  COMPETITOR_DEPTH_SHORTCUTS,
  COMPETITOR_DEPTH_STEPS,
} from './pack/competitorDepth'
import {
  MINING_DEPTH_SHORTCUTS,
  MINING_DEPTH_STEPS,
} from './pack/miningDepth'
import {
  LAYOUT_DEPTH_SHORTCUTS,
  LAYOUT_DEPTH_STEPS,
} from './pack/layoutDepth'
import {
  FTO_DEPTH_SHORTCUTS,
  FTO_DEPTH_STEPS,
} from './pack/ftoDepth'
import {
  ANNUITY_DEPTH_SHORTCUTS,
  ANNUITY_DEPTH_STEPS,
} from './pack/annuityDepth'
import {
  VALUATION_DEPTH_SHORTCUTS,
  VALUATION_DEPTH_STEPS,
} from './pack/valuationDepth'
import {
  MONETIZE_DEPTH_SHORTCUTS,
  MONETIZE_DEPTH_STEPS,
} from './pack/monetizeDepth'
import {
  ENFORCEMENT_DEPTH_SHORTCUTS,
  ENFORCEMENT_DEPTH_STEPS,
} from './pack/enforcementDepth'

/**
 * Patent DomainPack · agent-patent-shell §4 (25475b4) + SEAT_ROSTER.
 * Do NOT import into general / L1 / L2.
 * 深度层：pack/*Depth.ts（agent-depth-reliability）
 */

export const PATENT_EXPERTS: Record<string, ProjectExpertDef> = {
  "orchestrator": {
    "id": "orchestrator",
    "name": "专利全链路总控",
    "role": "orchestrator",
    "specialty": "分派 · 双文件验收 · 闸门",
    "description": "编排专班：拆派、验收成果+办理摘记、闸门与迭代。禁止直接改交接点；OA 仅在递交后由本席派发。",
    "tools": [
      "dispatch_task",
      "summarize_timeline",
      "accept_dual_file",
      "open_expert_dm"
    ],
    "shortcuts": [
      {
        "id": "d-research",
        "label": "分派检索员",
        "action": "dispatch_hint",
        "hint": "expert-research"
      },
      {
        "id": "d-intake",
        "label": "分派立项",
        "action": "dispatch_hint",
        "hint": "expert-intake"
      },
      {
        "id": "d-disclosure",
        "label": "分派交底",
        "action": "dispatch_hint",
        "hint": "expert-disclosure"
      },
      {
        "id": "d-draft",
        "label": "分派撰写",
        "action": "dispatch_hint",
        "hint": "expert-draft"
      },
      {
        "id": "d-figure",
        "label": "分派制图",
        "action": "dispatch_hint",
        "hint": "expert-figure"
      },
      {
        "id": "d-fto",
        "label": "分派FTO",
        "action": "dispatch_hint",
        "hint": "expert-fto"
      },
      {
        "id": "d-filing",
        "label": "分派递交",
        "action": "dispatch_hint",
        "hint": "expert-filing"
      },
      {
        "id": "d-oa",
        "label": "分派OA（须已file）",
        "action": "dispatch_hint",
        "hint": "expert-oa"
      }
    ],
    "steps": [
      {
        "id": "brief",
        "label": "收目标",
        "script": "【总控】已记下项目目标。请组队或分派；验收须双文件（成果+办理摘记）齐。"
      },
      {
        "id": "dispatch",
        "label": "拆派",
        "script": "【总控】拆派卡片就绪。点快捷分派写入专家私聊与时间线。"
      },
      {
        "id": "accept",
        "label": "双文件验收",
        "script": "【总控】验收：成果 + 办理摘记（步骤表+关键取舍）。缺过程=打回，不派下家。"
      },
      {
        "id": "summarize",
        "label": "汇总",
        "script": "【总控】已汇总各席回执。写库仍须对应专家确认。"
      }
    ],
    "hitlGates": [],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "无写库权",
        "note": "仅拆派/验收"
      }
    ],
    "guardrails": [
      "禁止直接改交接点",
      "缺办理摘记不派下家",
      "OA 仅 file 后派"
    ],
    "catalogAgentId": null,
    "accent": "slate",
    "catalogGroup": "orch",
    "defaultTeam": true,
    "ownerLabel": "用户/平台"
  },
  "expert-landscape": {
    "id": "expert-landscape",
    "name": "产业全景",
    "role": "expert",
    "specialty": "赛道全景 · 全景报告",
    "description": "赛道全景支撑是否立项。产出全景报告 + 办理摘记（提案，不假装入库）。",
    "tools": [
      "map_landscape",
      "segment_market",
      "draft_landscape_report"
    ],
    "shortcuts": LANDSCAPE_DEPTH_SHORTCUTS,
    "steps": LANDSCAPE_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案 · 不假装入库",
        "note": "全景提案未进正式契约库"
      }
    ],
    "guardrails": [
      "提案键勿假装已入库",
      "输出非法律意见"
    ],
    "catalogAgentId": "agent-research",
    "accent": "teal",
    "catalogGroup": "pre",
    "defaultTeam": false,
    "ownerLabel": "战略/IP 决策"
  },
  "expert-inspire": {
    "id": "expert-inspire",
    "name": "创新激发",
    "role": "expert",
    "specialty": "可专利方向 · 激发简报",
    "description": "收敛可专利方向。产出激发简报 + 办理摘记。",
    "tools": [
      "brainstorm_directions",
      "score_patentability",
      "draft_inspire_brief"
    ],
    "shortcuts": INSPIRE_DEPTH_SHORTCUTS,
    "steps": INSPIRE_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案 · 不假装入库",
        "note": "激发提案未进正式契约库"
      }
    ],
    "guardrails": [
      "提案键勿假装已入库"
    ],
    "catalogAgentId": "agent-research",
    "accent": "fuchsia",
    "catalogGroup": "pre",
    "defaultTeam": false,
    "ownerLabel": "发明人/研发"
  },
  "expert-competitor": {
    "id": "expert-competitor",
    "name": "竞品监控",
    "role": "expert",
    "specialty": "对手威胁 · 竞品观察",
    "description": "对手威胁分级。产出竞品观察 + 办理摘记。",
    "tools": [
      "list_competitors",
      "grade_threat",
      "draft_competitor_watch"
    ],
    "shortcuts": COMPETITOR_DEPTH_SHORTCUTS,
    "steps": COMPETITOR_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案 · 不假装入库",
        "note": "竞品提案未进正式契约库"
      }
    ],
    "guardrails": [
      "提案键勿假装已入库"
    ],
    "catalogAgentId": "agent-watch",
    "accent": "red",
    "catalogGroup": "pre",
    "defaultTeam": false,
    "ownerLabel": "IP/法务"
  },
  "expert-mining": {
    "id": "expert-mining",
    "name": "专利挖掘",
    "role": "expert",
    "specialty": "可申请提案 · 挖掘包",
    "description": "拆可申请提案/特征。产出挖掘包 + 办理摘记。≠立项决策。",
    "tools": [
      "parse_tech_points",
      "extract_invention_points",
      "score_invention",
      "pack_mining"
    ],
    "shortcuts": MINING_DEPTH_SHORTCUTS,
    "steps": MINING_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案 · 不假装入库",
        "note": "挖掘包未进正式契约库"
      }
    ],
    "guardrails": [
      "挖掘≠立项",
      "提案键勿假装已入库"
    ],
    "catalogAgentId": "agent-research",
    "accent": "emerald",
    "catalogGroup": "pre",
    "defaultTeam": false,
    "ownerLabel": "IP/研发"
  },
  "expert-layout": {
    "id": "expert-layout",
    "name": "专利布局",
    "role": "expert",
    "specialty": "主从案保护网 · 布局方案",
    "description": "主从案与保护网。产出布局方案 + 办理摘记。【确认点】布局拍板。",
    "tools": [
      "plan_family",
      "map_protection_net",
      "draft_layout_plan"
    ],
    "shortcuts": LAYOUT_DEPTH_SHORTCUTS,
    "steps": LAYOUT_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案",
        "note": "布局提案默认可内存"
      }
    ],
    "guardrails": [
      "提案键勿假装已写死入库"
    ],
    "catalogAgentId": "agent-research",
    "accent": "lime",
    "catalogGroup": "pre",
    "defaultTeam": false,
    "ownerLabel": "IP 决策"
  },
  "expert-research": {
    "id": "expert-research",
    "name": "检索员（查新暨三性）",
    "role": "expert",
    "specialty": "查新+三性 · 查新报告",
    "description": "查新暨三性意见书。产出查新报告 + 办理摘记。交接点＝查新报告。",
    "tools": [
      "commercial_patent_search",
      "cluster_hits",
      "draft_research_report",
      "bind_novelty"
    ],
    "shortcuts": RESEARCH_DEPTH_SHORTCUTS,
    "steps": RESEARCH_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "通常只读",
        "note": "未绑案不写"
      },
      {
        "command": "submitResearch",
        "label": "提交调研",
        "note": "确认后 · 查新报告"
      }
    ],
    "guardrails": [
      "禁止空命中过闸",
      "命中须可核验",
      "输出非法律意见"
    ],
    "catalogAgentId": "agent-research",
    "accent": "sky",
    "catalogGroup": "core",
    "defaultTeam": true,
    "ownerLabel": "合伙人/撰写"
  },
  "expert-intake": {
    "id": "expert-intake",
    "name": "立项决策",
    "role": "expert",
    "specialty": "立不立项/范围 · 立项报价",
    "description": "立不立项与范围（报价附属）。吃 01–06。产出立项报价包 + 工作纪要。须确认立不立项。",
    "tools": [
      "ingest_upstream",
      "extract_evidence",
      "scoring_formula",
      "draft_intake_quote",
      "propose_go_nogo"
    ],
    "shortcuts": INTAKE_DEPTH_SHORTCUTS,
    "steps": INTAKE_DEPTH_STEPS,
    "hitlGates": [
      "go_nogo"
    ],
    "domainCommandCandidates": [
      {
        "command": "submitHandoff",
        "label": "提交立项交接",
        "note": "立不立项后 · 立项报价"
      },
      {
        "command": "createCaseFromInsight",
        "label": "洞察建案",
        "note": "确认后 · 样机内存"
      }
    ],
    "guardrails": [
      "No-Go 不派交底",
      "报价附属非主产出"
    ],
    "catalogAgentId": "agent-intake",
    "accent": "amber",
    "catalogGroup": "core",
    "defaultTeam": true,
    "ownerLabel": "客户/IP 负责人"
  },
  "expert-disclosure": {
    "id": "expert-disclosure",
    "name": "交底整理",
    "role": "expert",
    "specialty": "可实施交底 · 交底包",
    "description": "可实施交底书。产出交底包 + 办理摘记。≠撰写权要。",
    "tools": [
      "read_intake_conditions",
      "gather_tech_points",
      "ask_inventor",
      "structure_disclosure",
      "outline_embodiments",
      "pack_disclosure"
    ],
    "shortcuts": DISCLOSURE_DEPTH_SHORTCUTS,
    "steps": DISCLOSURE_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": "saveDraft",
        "label": "保存交底草稿",
        "note": "交底包"
      },
      {
        "command": "submitHandoff",
        "label": "提交交底交接",
        "note": "确认后"
      }
    ],
    "guardrails": [
      "交底≠权要撰写",
      "未确认不写库"
    ],
    "catalogAgentId": "agent-disclosure",
    "accent": "indigo",
    "catalogGroup": "core",
    "defaultTeam": true,
    "ownerLabel": "撰写代理师"
  },
  "expert-draft": {
    "id": "expert-draft",
    "name": "撰写代理师",
    "role": "expert",
    "specialty": "权要+说明书 · 权要稿",
    "description": "特征→规划→权要+说明书。产出权要稿 + 办理摘记。",
    "tools": [
      "build_feature_table",
      "plan_claim_tree",
      "draft_claims",
      "draft_specification_outline",
      "claim_validator",
      "submit_draft_for_hitl"
    ],
    "shortcuts": DRAFT_DEPTH_SHORTCUTS,
    "steps": DRAFT_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": "saveDraft",
        "label": "保存草稿",
        "note": "权要稿"
      },
      {
        "command": "submitClaims",
        "label": "提交权利要求",
        "note": "确认后"
      },
      {
        "command": "submitHandoff",
        "label": "提交交接",
        "note": "确认后"
      }
    ],
    "guardrails": [
      "撰写≠交底",
      "未确认不写库"
    ],
    "catalogAgentId": "agent-claims",
    "accent": "violet",
    "catalogGroup": "core",
    "defaultTeam": true,
    "ownerLabel": "客户/质检"
  },
  "expert-draft-spec": {
    "id": "expert-draft-spec",
    "name": "说明书撰写",
    "role": "expert",
    "specialty": "说明书专责 · 撰写节点",
    "description": "撰写节点里的说明书。交卷仍由权要这一席。",
    "tools": [
      "draft_specification_outline",
      "align_with_claims",
      "spec_consistency_check"
    ],
    "shortcuts": DRAFT_DEPTH_SHORTCUTS,
    "steps": DRAFT_DEPTH_STEPS,
    "hitlGates": [],
    "domainCommandCandidates": [
      {
        "command": "saveDraft",
        "label": "保存说明书草稿",
        "note": "副席 · 不单独挂确认点"
      }
    ],
    "guardrails": [
      "副席无独立 confirm",
      "权要闸仍归 expert-draft"
    ],
    "catalogAgentId": "agent-claims",
    "accent": "violet",
    "catalogGroup": "core",
    "defaultTeam": false,
    "ownerLabel": "撰写"
  },
  "expert-figure": {
    "id": "expert-figure",
    "name": "制图对接",
    "role": "expert",
    "specialty": "附图任务 · 附图清单",
    "description": "附图任务与冻图号。产出附图清单 + 办理摘记。辅席·无独立交接点。",
    "tools": [
      "gather_figure_context",
      "list_needed_figures",
      "mock_sketch",
      "ocr_term_check",
      "attach_chapter_event"
    ],
    "shortcuts": FIGURE_DEPTH_SHORTCUTS,
    "steps": FIGURE_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "事件挂章",
        "note": "无独立交接点"
      }
    ],
    "guardrails": [
      "辅席无独立 key",
      "草图为 mock"
    ],
    "catalogAgentId": "agent-claims",
    "accent": "rose",
    "catalogGroup": "assist",
    "defaultTeam": true,
    "ownerLabel": "撰写/递交"
  },
  "expert-fto": {
    "id": "expert-fto",
    "name": "FTO律师",
    "role": "expert",
    "specialty": "自由实施 · FTO 备忘",
    "description": "自由实施+claim chart。产出 FTO 备忘 + 办理摘记。辅席·≠三性查新；≠ 无效维权顾问席。",
    "tools": [
      "extract_fto_features",
      "fto_hit_scan",
      "build_risk_matrix",
      "draft_fto_report"
    ],
    "shortcuts": FTO_DEPTH_SHORTCUTS,
    "steps": FTO_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "默认不写案",
        "note": "无独立交接点"
      }
    ],
    "guardrails": [
      "≠三性查新",
      "禁假装法律入库"
    ],
    "catalogAgentId": "agent-research",
    "accent": "orange",
    "catalogGroup": "assist",
    "defaultTeam": true,
    "ownerLabel": "业务/法务"
  },
  "expert-filing": {
    "id": "expert-filing",
    "name": "递交流程员",
    "role": "expert",
    "specialty": "齐套→授权→递交示意",
    "description": "齐套清单。产出递交清单 + 办理摘记。禁真递交；回执后仅总控派 OA。",
    "tools": [
      "check_jurisdiction",
      "filing_checklist",
      "formality_scan",
      "deadline_hint",
      "propose_authorize_file"
    ],
    "shortcuts": FILING_DEPTH_SHORTCUTS,
    "steps": FILING_DEPTH_STEPS,
    "hitlGates": [
      "authorize_file"
    ],
    "domainCommandCandidates": [
      {
        "command": "authorizeFile",
        "label": "授权递交提案",
        "note": "确认点 · 禁真递交"
      },
      {
        "command": "fileResponse",
        "label": "递交归档示意",
        "note": "样机内存"
      }
    ],
    "guardrails": [
      "禁真递交",
      "禁直传 OA",
      "齐套未满禁用授权"
    ],
    "catalogAgentId": "agent-claims",
    "accent": "stone",
    "catalogGroup": "core",
    "defaultTeam": true,
    "ownerLabel": "代理师/总控"
  },
  "expert-oa": {
    "id": "expert-oa",
    "name": "OA答复代理师",
    "role": "expert",
    "specialty": "OA策略 · 答复稿",
    "description": "OA 策略与陈述。产出答复稿 + 办理摘记。仅已递交后由总控派。",
    "tools": [
      "parse_oa_notice",
      "oa_reason_classifier",
      "oa_strategy",
      "draft_amendments",
      "draft_oa_response",
      "submit_oa_for_hitl"
    ],
    "shortcuts": OA_DEPTH_SHORTCUTS,
    "steps": OA_DEPTH_STEPS,
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": "saveDraft",
        "label": "保存答复草稿",
        "note": "答复稿"
      },
      {
        "command": "submitHandoff",
        "label": "提交答复交接",
        "note": "禁真递交官方"
      }
    ],
    "guardrails": [
      "仅已 file",
      "无真 OA",
      "未确认不写库"
    ],
    "catalogAgentId": "agent-oa",
    "accent": "cyan",
    "catalogGroup": "core",
    "defaultTeam": true,
    "ownerLabel": "客户/发明人"
  },

  "expert-annuity": {
    "id": "expert-annuity",
    "name": "年费管家",
    "role": "expert",
    "specialty": "年费/放弃 · 年费台账",
    "description": "授权后管理 · 期限与滞纳金示意联动价值分级。【确认⑦】年费/放弃。后置样机可演示。",
    "tools": ["list_annuity_due", "compute_surcharge", "propose_pay_or_abandon"],
    "shortcuts": ANNUITY_DEPTH_SHORTCUTS,
    "steps": ANNUITY_DEPTH_STEPS,
    "hitlGates": ["pay_unlock"],
    "domainCommandCandidates": [
      {"command": null, "label": "样机示意 · 不写真缴费", "note": "年费台账心智 · 内存确认"}
    ],
    "guardrails": ["后置业务可跑", "禁真缴费", "未确认不写库"],
    "catalogAgentId": "agent-annuity",
    "accent": "yellow",
    "catalogGroup": "phase",
    "defaultTeam": false,
    "ownerLabel": "IP 运营",
    "phase": true,
    "emptyStateNote": "年费管家为后置业务席：样机可跑完全程（步骤+双文件+校验+确认⑦），无真沙箱/真缴费。"
  },
  "expert-valuation": {
    "id": "expert-valuation",
    "name": "价值评估师",
    "role": "expert",
    "specialty": "核心/外围/放弃 · valuation",
    "description": "价值评分示意：引用/同族/许可/产品映射。联动年费建议。后置样机可演示。",
    "tools": ["score_portfolio", "grade_core_periphery", "draft_valuation_card"],
    "shortcuts": VALUATION_DEPTH_SHORTCUTS,
    "steps": VALUATION_DEPTH_STEPS,
    "hitlGates": [],
    "domainCommandCandidates": [
      {"command": null, "label": "提案 · 不假装入库", "note": "评估卡 · 服务年费闸"}
    ],
    "guardrails": ["后置业务可跑", "联动年费仅建议", "提案勿假装入库"],
    "catalogAgentId": null,
    "accent": "purple",
    "catalogGroup": "phase",
    "defaultTeam": false,
    "ownerLabel": "IP 决策",
    "phase": true,
    "emptyStateNote": "价值评估师为后置业务席：样机可跑评分剧本与双文件；无独立确认闸（服务确认⑦）。"
  },
  "expert-monetize": {
    "id": "expert-monetize",
    "name": "转化顾问",
    "role": "expert",
    "specialty": "许可/转让 · 转化条款",
    "description": "转化变现示意 · 估值与合同必备条款。【确认⑧】交易签约。后置样机可演示。",
    "tools": ["estimate_deal", "draft_term_sheet", "validate_contract_clauses"],
    "shortcuts": MONETIZE_DEPTH_SHORTCUTS,
    "steps": MONETIZE_DEPTH_STEPS,
    "hitlGates": ["confirm_quote"],
    "domainCommandCandidates": [
      {"command": null, "label": "样机示意 · 不写真签约", "note": "转化条款心智 · 内存确认"}
    ],
    "guardrails": ["后置业务可跑", "禁真签约", "未确认不写库"],
    "catalogAgentId": "agent-monetize",
    "accent": "emerald",
    "catalogGroup": "phase",
    "defaultTeam": false,
    "ownerLabel": "商务/IP",
    "phase": true,
    "emptyStateNote": "转化顾问为后置业务席：样机可跑估值→条款→确认⑧；无真签约。"
  },
  "expert-enforcement": {
    "id": "expert-enforcement",
    "name": "无效维权顾问",
    "role": "expert",
    "specialty": "无效/维权 · 维权简报",
    "description": "维权防御示意 · 全面覆盖比对；可回流布局席待拍板。非正式 FTO；≠监测。后置样机可演示。",
    "tools": ["claim_chart_compare", "stability_score", "draft_enforcement_brief"],
    "shortcuts": ENFORCEMENT_DEPTH_SHORTCUTS,
    "steps": ENFORCEMENT_DEPTH_STEPS,
    "hitlGates": [],
    "domainCommandCandidates": [
      {"command": null, "label": "提案 · 不假装入库", "note": "维权简报 · ≠FTO · ≠监控告警"}
    ],
    "guardrails": ["≠ expert-fto", "≠ STAGE watch", "后置业务可跑"],
    "catalogAgentId": null,
    "accent": "zinc",
    "catalogGroup": "phase",
    "defaultTeam": false,
    "ownerLabel": "法务/诉讼",
    "phase": true,
    "emptyStateNote": "无效维权顾问为后置业务席：样机可跑比对+回流信封；与 FTO 辅席分开。"
  },
}

/** Legacy alias · 与 expert-research 同深度剧本 */
PATENT_EXPERTS['expert-search'] = {
  ...PATENT_EXPERTS['expert-research']!,
  id: 'expert-search',
}

export const PATENT_CATALOG_IDS: ProjectExpertId[] = ["orchestrator","expert-landscape","expert-inspire","expert-competitor","expert-mining","expert-layout","expert-research","expert-intake","expert-disclosure","expert-draft","expert-figure","expert-fto","expert-filing","expert-oa","expert-annuity","expert-valuation","expert-monetize","expert-enforcement"]

export const PATENT_PROJECT_EXPERT_IDS: ProjectExpertId[] = PATENT_CATALOG_IDS.filter(
  (id) => PATENT_EXPERTS[id]?.defaultTeam,
)

export type PatentExpertId = (typeof PATENT_CATALOG_IDS)[number] | 'expert-search'
