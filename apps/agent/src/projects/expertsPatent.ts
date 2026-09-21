import type { ProjectExpertDef, ProjectExpertId } from './types'

/**
 * Patent DomainPack · agent-patent-shell §4 (25475b4) + SEAT_ROSTER.
 * Do NOT import into general / L1 / L2.
 */

export const PATENT_EXPERTS: Record<string, ProjectExpertDef> = {
  "orchestrator": {
    "id": "orchestrator",
    "name": "专利全链路总控",
    "role": "orchestrator",
    "specialty": "分派 · 双文件验收 · 闸门",
    "description": "编排专班：拆派、验收成果+worklog、闸门与迭代。禁止直接改 handoff；OA 仅在递交 file 后由本席派发。",
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
        "script": "【总控】已记下项目目标。请组队或分派；验收须双文件（成果+worklog）齐。"
      },
      {
        "id": "dispatch",
        "label": "拆派",
        "script": "【总控】拆派卡片就绪。点快捷分派写入专家私聊与时间线。"
      },
      {
        "id": "accept",
        "label": "双文件验收",
        "script": "【总控】验收：成果 NN_*.md + worklog（步骤表+关键取舍）。缺过程=打回，不派下家。"
      },
      {
        "id": "summarize",
        "label": "汇总",
        "script": "【总控】已汇总各席回执。写库仍须对应专家 Confirm。"
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
      "禁止直接改 handoff",
      "缺 worklog 不派下家",
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
    "specialty": "赛道全景 · landscape_report",
    "description": "赛道全景支撑是否立项。产出 01_landscape_report + worklog（提案键，不写 packages）。",
    "tools": [
      "map_landscape",
      "segment_market",
      "draft_landscape_report"
    ],
    "shortcuts": [
      {
        "id": "map",
        "label": "画全景",
        "action": "jump",
        "stepId": "map"
      },
      {
        "id": "report",
        "label": "出报告",
        "action": "jump",
        "stepId": "report"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "scope",
        "label": "定赛道",
        "script": "【全景】已定赛道边界：边缘计算调度。",
        "tool": {
          "name": "map_landscape",
          "preview": "theme=边缘调度"
        }
      },
      {
        "id": "map",
        "label": "全景图",
        "script": "【全景】假全景：玩家分层 · 技术轨迹 · 政策。",
        "tool": {
          "name": "segment_market",
          "preview": "segments=4"
        }
      },
      {
        "id": "report",
        "label": "报告确认",
        "script": "【全景】01_landscape_report 待确认。过程见 worklog。",
        "tool": {
          "name": "draft_landscape_report",
          "preview": "file=01_landscape_report.md"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案键·不写库",
        "note": "01 键未进 contracts"
      }
    ],
    "guardrails": [
      "提案键勿假装 contracts",
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
    "specialty": "可专利方向 · inspire_brief",
    "description": "收敛可专利方向。产出 02_inspire_brief + worklog。",
    "tools": [
      "brainstorm_directions",
      "score_patentability",
      "draft_inspire_brief"
    ],
    "shortcuts": [
      {
        "id": "pool",
        "label": "方向池",
        "action": "jump",
        "stepId": "pool"
      },
      {
        "id": "brief",
        "label": "出 brief",
        "action": "jump",
        "stepId": "brief"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "pool",
        "label": "方向池",
        "script": "【激发】方向池 8→收敛 3。",
        "tool": {
          "name": "brainstorm_directions",
          "preview": "pool=8→3"
        }
      },
      {
        "id": "score",
        "label": "可专利性",
        "script": "【激发】评分占位。",
        "tool": {
          "name": "score_patentability",
          "preview": "top=负载预测调度"
        }
      },
      {
        "id": "brief",
        "label": "brief确认",
        "script": "【激发】02_inspire_brief 待确认。",
        "tool": {
          "name": "draft_inspire_brief",
          "preview": "file=02_inspire_brief.md"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案键·不写库",
        "note": "02 键未进 contracts"
      }
    ],
    "guardrails": [
      "提案键勿假装 contracts"
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
    "specialty": "对手威胁 · competitor_watch",
    "description": "对手威胁分级。产出 03_competitor_watch + worklog。",
    "tools": [
      "list_competitors",
      "grade_threat",
      "draft_competitor_watch"
    ],
    "shortcuts": [
      {
        "id": "list",
        "label": "对手名单",
        "action": "jump",
        "stepId": "list"
      },
      {
        "id": "grade",
        "label": "威胁分级",
        "action": "jump",
        "stepId": "grade"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "list",
        "label": "名单",
        "script": "【竞品】Top 对手 5 家。",
        "tool": {
          "name": "list_competitors",
          "preview": "n=5"
        }
      },
      {
        "id": "grade",
        "label": "分级",
        "script": "【竞品】威胁：2 高 / 2 中 / 1 低。",
        "tool": {
          "name": "grade_threat",
          "preview": "high=2"
        }
      },
      {
        "id": "pack",
        "label": "报告确认",
        "script": "【竞品】03_competitor_watch 待确认。",
        "tool": {
          "name": "draft_competitor_watch",
          "preview": "file=03_competitor_watch.md"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案键·不写库",
        "note": "03 键未进 contracts"
      }
    ],
    "guardrails": [
      "提案键勿假装 contracts"
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
    "specialty": "可申请提案 · mining_pack",
    "description": "拆可申请提案/特征。产出 04_mining_pack + worklog。≠立项决策。",
    "tools": [
      "parse_tech_points",
      "extract_invention_points",
      "score_invention",
      "pack_mining"
    ],
    "shortcuts": [
      {
        "id": "tech",
        "label": "收技术点",
        "action": "jump",
        "stepId": "tech"
      },
      {
        "id": "pack",
        "label": "打包提案",
        "action": "jump",
        "stepId": "pack"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "tech",
        "label": "技术点",
        "script": "【挖掘】边缘调度 · 动态频率 · 能耗约束。",
        "tool": {
          "name": "parse_tech_points",
          "preview": "points=3"
        }
      },
      {
        "id": "directions",
        "label": "可申报提案",
        "script": "【挖掘】提案 3 条骨架。",
        "tool": {
          "name": "extract_invention_points",
          "preview": "candidates=3"
        }
      },
      {
        "id": "score",
        "label": "评分",
        "script": "【挖掘】新颖性 0.78 · 可专利性 0.71。",
        "tool": {
          "name": "score_invention",
          "preview": "novelty=0.78"
        }
      },
      {
        "id": "pack",
        "label": "提案确认",
        "script": "【挖掘】04_mining_pack 待确认。≠立项 Go。",
        "tool": {
          "name": "pack_mining",
          "preview": "file=04_mining_pack.md"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案键·不写库",
        "note": "mining_pack 未进 contracts"
      }
    ],
    "guardrails": [
      "挖掘≠立项",
      "提案键勿假装 contracts"
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
    "specialty": "主从案保护网 · layout_plan",
    "description": "主从案与保护网。产出 05_layout_plan + worklog。【HITL①】布局拍板。",
    "tools": [
      "plan_family",
      "map_protection_net",
      "draft_layout_plan"
    ],
    "shortcuts": [
      {
        "id": "family",
        "label": "主从案",
        "action": "jump",
        "stepId": "family"
      },
      {
        "id": "plan",
        "label": "出布局",
        "action": "jump",
        "stepId": "plan"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "family",
        "label": "主从案",
        "script": "【布局】主案 1 + 从案 2。",
        "tool": {
          "name": "plan_family",
          "preview": "main=1 · child=2"
        }
      },
      {
        "id": "net",
        "label": "保护网",
        "script": "【布局】特征×族成员矩阵。",
        "tool": {
          "name": "map_protection_net",
          "preview": "cells=12"
        }
      },
      {
        "id": "plan",
        "label": "布局确认",
        "script": "【布局】05_layout_plan 待确认。",
        "tool": {
          "name": "draft_layout_plan",
          "preview": "file=05_layout_plan.md"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "提案键",
        "note": "05 默认可内存"
      }
    ],
    "guardrails": [
      "提案键勿假装已写死 contracts"
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
    "specialty": "查新+三性 · research_report",
    "description": "查新暨三性意见书。产出 06_research_report + worklog。handoff=research_report。",
    "tools": [
      "commercial_patent_search",
      "cluster_hits",
      "draft_research_report",
      "bind_novelty"
    ],
    "shortcuts": [
      {
        "id": "run-query",
        "label": "跑检索式",
        "action": "jump",
        "stepId": "query"
      },
      {
        "id": "open-hits",
        "label": "看命中",
        "action": "jump",
        "stepId": "hits"
      },
      {
        "id": "basket",
        "label": "入工作篮",
        "action": "jump",
        "stepId": "basket"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "query",
        "label": "检索式",
        "script": "【检索】关键词：边缘调度 / 负载预测 / 能耗约束。过程见 worklog §3。",
        "tool": {
          "name": "commercial_patent_search",
          "preview": "query=(边缘 OR edge) AND 调度 · limit=20"
        }
      },
      {
        "id": "hits",
        "label": "命中筛选",
        "script": "【检索】命中 12。Top3：CN114882901A · US20230123456A1 · CN115001234A。",
        "tool": {
          "name": "cluster_hits",
          "preview": "clusters=3"
        }
      },
      {
        "id": "basket",
        "label": "工作篮/三性",
        "script": "【检索】Top5 入篮；三性意见草稿：X/Y/A 占位。",
        "tool": {
          "name": "bind_novelty",
          "preview": "basket=5"
        }
      },
      {
        "id": "strategy",
        "label": "报告确认",
        "script": "【检索】06_research_report + worklog 待确认。",
        "tool": {
          "name": "draft_research_report",
          "preview": "handoff=research_report"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
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
        "note": "Confirm 后 · research_report"
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
    "specialty": "Go/范围 · intake_quote",
    "description": "Go/范围（报价附属）。吃 01–06。产出 07_intake_quote + worklog。须 go_nogo HITL。",
    "tools": [
      "ingest_upstream",
      "draft_intake_quote",
      "propose_go_nogo"
    ],
    "shortcuts": [
      {
        "id": "ingest",
        "label": "吃上游",
        "action": "jump",
        "stepId": "ingest"
      },
      {
        "id": "quote",
        "label": "范围/报价",
        "action": "jump",
        "stepId": "quote"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "ingest",
        "label": "吃上游",
        "script": "【立项】已吃查新/挖掘等上游要点。",
        "tool": {
          "name": "ingest_upstream",
          "preview": "sources=01–06"
        }
      },
      {
        "id": "quote",
        "label": "范围草案",
        "script": "【立项】范围：CN 发明先申 · 报价档占位。",
        "tool": {
          "name": "draft_intake_quote",
          "preview": "handoff=intake_quote"
        }
      },
      {
        "id": "go",
        "label": "Go/No-Go",
        "script": "【立项】请 go_nogo。Go 后方可派交底。",
        "tool": {
          "name": "propose_go_nogo",
          "preview": "gate=go_nogo"
        },
        "triggersHitl": true,
        "hitlGate": "go_nogo"
      }
    ],
    "hitlGates": [
      "go_nogo"
    ],
    "domainCommandCandidates": [
      {
        "command": "submitHandoff",
        "label": "提交立项交接",
        "note": "go_nogo 后 · intake_quote"
      },
      {
        "command": "createCaseFromInsight",
        "label": "洞察建案",
        "note": "HITL 后 · 样机内存"
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
    "specialty": "可实施交底 · disclosure_pack",
    "description": "可实施交底书。产出 08_disclosure_pack + worklog。≠撰写权要。",
    "tools": [
      "gather_tech_points",
      "structure_disclosure",
      "outline_embodiments",
      "pack_disclosure"
    ],
    "shortcuts": [
      {
        "id": "tech",
        "label": "收技术点",
        "action": "jump",
        "stepId": "tech"
      },
      {
        "id": "structure",
        "label": "交底结构",
        "action": "jump",
        "stepId": "structure"
      },
      {
        "id": "pack",
        "label": "打包交底",
        "action": "jump",
        "stepId": "pack"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "tech",
        "label": "技术点",
        "script": "【交底】汇集：边缘节点调度 · 负载预测 · 能耗约束。",
        "tool": {
          "name": "gather_tech_points",
          "preview": "points=3"
        }
      },
      {
        "id": "structure",
        "label": "交底结构",
        "script": "【交底】背景→方案→效果→实施例提纲。",
        "tool": {
          "name": "structure_disclosure",
          "preview": "handoff=disclosure_pack"
        }
      },
      {
        "id": "embodiments",
        "label": "实施例",
        "script": "【交底】例1 单节点；例2 热迁移。",
        "tool": {
          "name": "outline_embodiments",
          "preview": "embodiments=2"
        }
      },
      {
        "id": "pack",
        "label": "交底确认",
        "script": "【交底】08_disclosure_pack + worklog 待确认。",
        "tool": {
          "name": "pack_disclosure",
          "preview": "file=08_disclosure_pack.md"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": "saveDraft",
        "label": "保存交底草稿",
        "note": "disclosure_pack"
      },
      {
        "command": "submitHandoff",
        "label": "提交交底交接",
        "note": "HITL 后"
      }
    ],
    "guardrails": [
      "交底≠权要撰写",
      "未 Confirm 不写库"
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
    "specialty": "权要+说明书 · draft_claims",
    "description": "特征→规划→权要+说明书。产出 09_draft_claims + worklog。",
    "tools": [
      "draft_claims",
      "expand_dependent",
      "check_support",
      "draft_abstract"
    ],
    "shortcuts": [
      {
        "id": "draft-ch",
        "label": "生成权项",
        "action": "jump",
        "stepId": "claims"
      },
      {
        "id": "revise",
        "label": "修订建议",
        "action": "jump",
        "stepId": "revise"
      },
      {
        "id": "confirm-sub",
        "label": "提请确认",
        "action": "jump",
        "stepId": "confirm"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "claims",
        "label": "权利要求",
        "script": "【撰写】独权 1 + 从权 3 骨架。过程见 worklog。",
        "tool": {
          "name": "draft_claims",
          "preview": "handoff=draft_claims"
        }
      },
      {
        "id": "abstract",
        "label": "摘要",
        "script": "【撰写】假摘要已出。",
        "tool": {
          "name": "draft_abstract",
          "preview": "words≈120"
        }
      },
      {
        "id": "revise",
        "label": "修订建议",
        "script": "【撰写】缩限「动态频率」；补实施例对照。",
        "tool": {
          "name": "check_support",
          "preview": "support_gaps=2"
        }
      },
      {
        "id": "confirm",
        "label": "策略批准",
        "script": "【撰写】09_draft_claims + worklog 待批准。",
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": "saveDraft",
        "label": "保存草稿",
        "note": "draft_claims"
      },
      {
        "command": "submitClaims",
        "label": "提交权利要求",
        "note": "HITL 后"
      },
      {
        "command": "submitHandoff",
        "label": "提交交接",
        "note": "HITL 后"
      }
    ],
    "guardrails": [
      "撰写≠交底",
      "未 Confirm 不写库"
    ],
    "catalogAgentId": "agent-claims",
    "accent": "violet",
    "catalogGroup": "core",
    "defaultTeam": true,
    "ownerLabel": "客户/质检"
  },
  "expert-figure": {
    "id": "expert-figure",
    "name": "制图对接",
    "role": "expert",
    "specialty": "附图任务 · figure_list",
    "description": "附图任务与冻图号。产出 10_figure_list + worklog。辅席·无独立 handoff key。",
    "tools": [
      "gather_figure_context",
      "list_needed_figures",
      "mock_sketch",
      "attach_chapter_event"
    ],
    "shortcuts": [
      {
        "id": "context",
        "label": "收上下文",
        "action": "jump",
        "stepId": "context"
      },
      {
        "id": "list",
        "label": "示意图清单",
        "action": "jump",
        "stepId": "list"
      },
      {
        "id": "attach",
        "label": "冻图号",
        "action": "jump",
        "stepId": "attach"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "context",
        "label": "上下文",
        "script": "【制图】图号需求：系统架构 · 调度时序 · 能耗曲线。",
        "tool": {
          "name": "gather_figure_context",
          "preview": "linked=draft_claims"
        }
      },
      {
        "id": "list",
        "label": "清单",
        "script": "【制图】图1 框图 · 图2 流程 · 图3 曲线。",
        "tool": {
          "name": "list_needed_figures",
          "preview": "figures=3"
        }
      },
      {
        "id": "sketch",
        "label": "草图占位",
        "script": "【制图】fig-mock-01 SVG 占位。",
        "tool": {
          "name": "mock_sketch",
          "preview": "assetId=fig-mock-01"
        }
      },
      {
        "id": "attach",
        "label": "冻图号确认",
        "script": "【制图】10_figure_list 冻图号待确认。",
        "tool": {
          "name": "attach_chapter_event",
          "preview": "file=10_figure_list.md"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "事件挂章",
        "note": "无独立 handoff key"
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
    "specialty": "自由实施 · fto_memo",
    "description": "自由实施+claim chart。产出 11_fto_memo + worklog。辅席·≠三性查新；≠ Pack 无效维权顾问（expert-enforcement）。",
    "tools": [
      "extract_fto_features",
      "fto_hit_scan",
      "build_risk_matrix",
      "draft_fto_report"
    ],
    "shortcuts": [
      {
        "id": "features",
        "label": "抽特征",
        "action": "jump",
        "stepId": "features"
      },
      {
        "id": "matrix",
        "label": "风险矩阵",
        "action": "jump",
        "stepId": "matrix"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "features",
        "label": "特征",
        "script": "【FTO】产品特征 6 项。聚焦自由实施，非新颖性。",
        "tool": {
          "name": "extract_fto_features",
          "preview": "features=6"
        }
      },
      {
        "id": "hits",
        "label": "障碍专利",
        "script": "【FTO】障碍候选 4；高相关 CN114882901A。",
        "tool": {
          "name": "fto_hit_scan",
          "preview": "obstacle=4"
        }
      },
      {
        "id": "matrix",
        "label": "矩阵",
        "script": "【FTO】2 红 / 1 黄 / 3 绿；claim chart≥2。",
        "tool": {
          "name": "build_risk_matrix",
          "preview": "red=2"
        }
      },
      {
        "id": "report",
        "label": "备忘确认",
        "script": "【FTO】11_fto_memo 待确认；默认不写案。",
        "tool": {
          "name": "draft_fto_report",
          "preview": "file=11_fto_memo.md"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": null,
        "label": "默认不写案",
        "note": "无独立 handoff key"
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
    "specialty": "齐套→authorize→file",
    "description": "齐套清单。产出 12_filing_checklist + worklog。禁真递交；回执后仅总控派 OA。",
    "tools": [
      "check_jurisdiction",
      "filing_checklist",
      "formality_scan",
      "propose_authorize_file"
    ],
    "shortcuts": [
      {
        "id": "country",
        "label": "国别齐套",
        "action": "jump",
        "stepId": "jurisdiction"
      },
      {
        "id": "checklist",
        "label": "递交清单",
        "action": "jump",
        "stepId": "checklist"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "jurisdiction",
        "label": "国别",
        "script": "【递交】CN 发明先递 · US provisional 占位。",
        "tool": {
          "name": "check_jurisdiction",
          "preview": "CN=first-file"
        }
      },
      {
        "id": "checklist",
        "label": "齐套",
        "script": "【递交】齐套 4/5（附图待挂）。",
        "tool": {
          "name": "filing_checklist",
          "preview": "ready=4/5"
        }
      },
      {
        "id": "formality",
        "label": "形式点",
        "script": "【递交】形式点 2（warn）。",
        "tool": {
          "name": "formality_scan",
          "preview": "issues=2"
        }
      },
      {
        "id": "authorize",
        "label": "授权递交",
        "script": "【递交】authorize→file 闸示意；禁真递交。",
        "tool": {
          "name": "propose_authorize_file",
          "preview": "gate=authorize_file · real=false"
        },
        "triggersHitl": true,
        "hitlGate": "authorize_file"
      }
    ],
    "hitlGates": [
      "authorize_file"
    ],
    "domainCommandCandidates": [
      {
        "command": "authorizeFile",
        "label": "授权递交提案",
        "note": "HITL · 禁真递交"
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
    "specialty": "OA策略 · prosecution_response",
    "description": "OA 策略与陈述。产出 13_prosecution_response + worklog。仅已 file 后由总控派。",
    "tools": [
      "parse_oa_notice",
      "oa_strategy",
      "draft_amendments",
      "draft_oa_response"
    ],
    "shortcuts": [
      {
        "id": "notice",
        "label": "读审查意见",
        "action": "jump",
        "stepId": "notice"
      },
      {
        "id": "strategy",
        "label": "答复策略",
        "action": "jump",
        "stepId": "strategy"
      },
      {
        "id": "draft",
        "label": "起草答复",
        "action": "jump",
        "stepId": "draft"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "notice",
        "label": "审查意见",
        "script": "【OA】假一通：权1 创造性；权3 不清楚。",
        "tool": {
          "name": "parse_oa_notice",
          "preview": "type=一通"
        }
      },
      {
        "id": "strategy",
        "label": "答复策略",
        "script": "【OA】争辩+修改+证据提纲。",
        "tool": {
          "name": "oa_strategy",
          "preview": "argue+amend"
        }
      },
      {
        "id": "draft",
        "label": "答复草稿",
        "script": "【OA】假答复草稿 · prosecution_response。",
        "tool": {
          "name": "draft_oa_response",
          "preview": "handoff=prosecution_response"
        }
      },
      {
        "id": "confirm",
        "label": "答复确认",
        "script": "【OA】13_prosecution_response + worklog 待确认。",
        "tool": {
          "name": "draft_amendments",
          "preview": "real_file=false"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
    "hitlGates": [
      "approve_strategy"
    ],
    "domainCommandCandidates": [
      {
        "command": "saveDraft",
        "label": "保存答复草稿",
        "note": "prosecution_response"
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
      "未 Confirm 不写库"
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
    "specialty": "年费/放弃 · maintain_annuity",
    "description": "F7 授权后管理 · 期限+滞纳金表联动价值分级。【HITL⑦】年费/放弃。后置业务可跑样机（非灰显死胡同）。",
    "tools": ["list_annuity_due", "compute_surcharge", "propose_pay_or_abandon"],
    "shortcuts": [
      {"id": "due", "label": "到期清单", "action": "jump", "stepId": "due"},
      {"id": "grade", "label": "价值联动", "action": "jump", "stepId": "grade"},
      {"id": "decide", "label": "缴费/放弃", "action": "jump", "stepId": "decide"},
      {"id": "report-orch", "label": "回报总控", "action": "report"}
    ],
    "steps": [
      {
        "id": "due",
        "label": "到期台账",
        "script": "【年费】到期清单：CN114882901B 第 3 年 · 截止 2026-11-30 · 官费 ¥2,000（假数据）。过程见 worklog §3。",
        "tool": {"name": "list_annuity_due", "preview": "due=1 · window=90d"}
      },
      {
        "id": "grade",
        "label": "价值联动",
        "script": "【年费】联动价值评估：核心案建议缴；外围案可议放弃。滞纳金表 mock。",
        "tool": {"name": "compute_surcharge", "preview": "grace=6m · surcharge=tier2"}
      },
      {
        "id": "decide",
        "label": "缴费/放弃闸",
        "script": "【年费】14_maintain_annuity + worklog 待 Confirm（HITL⑦ · pay_unlock 心智 · 禁真缴费）。",
        "tool": {"name": "propose_pay_or_abandon", "preview": "recommend=pay · hitl=⑦"},
        "triggersHitl": true,
        "hitlGate": "pay_unlock"
      }
    ],
    "hitlGates": ["pay_unlock"],
    "domainCommandCandidates": [
      {"command": null, "label": "样机示意 · 不写真缴费", "note": "maintain_annuity 心智 · 内存 Confirm"}
    ],
    "guardrails": ["后置业务可跑", "禁真缴费", "未 Confirm 不写库"],
    "catalogAgentId": "agent-annuity",
    "accent": "yellow",
    "catalogGroup": "phase",
    "defaultTeam": false,
    "ownerLabel": "IP 运营",
    "phase": true,
    "emptyStateNote": "F7 年费管家为后置业务席：样机可跑完全程（步骤+双文件+validator+HITL⑦ Confirm），无真沙箱/真缴费。"
  },
  "expert-valuation": {
    "id": "expert-valuation",
    "name": "价值评估师",
    "role": "expert",
    "specialty": "核心/外围/放弃 · valuation",
    "description": "F7 价值评分：引用/同族/许可/产品映射。联动年费建议。后置业务可跑样机。",
    "tools": ["score_portfolio", "grade_core_periphery", "draft_valuation_card"],
    "shortcuts": [
      {"id": "evidence", "label": "抽证据", "action": "jump", "stepId": "evidence"},
      {"id": "score", "label": "评分卡", "action": "jump", "stepId": "score"},
      {"id": "grade", "label": "分级建议", "action": "jump", "stepId": "grade"},
      {"id": "report-orch", "label": "回报总控", "action": "report"}
    ],
    "steps": [
      {
        "id": "evidence",
        "label": "抽证据",
        "script": "【价值】已抽：引用 12 · 同族 3 · 许可线索 1 · 产品映射 2（mock）。",
        "tool": {"name": "score_portfolio", "preview": "cite=12 · family=3"}
      },
      {
        "id": "score",
        "label": "评分卡",
        "script": "【价值】综合分 78 · 商业 0.72 · 可执行 0.81。产出键提案 valuation_card（不写 packages）。",
        "tool": {"name": "draft_valuation_card", "preview": "score=78 · proposal=valuation_card"}
      },
      {
        "id": "grade",
        "label": "分级建议",
        "script": "【价值】15_valuation_card + worklog：核心保留 / 外围观察 / 1 件建议放弃 → 交年费管家。",
        "tool": {"name": "grade_core_periphery", "preview": "core=1 · periphery=2 · abandon=1"}
      }
    ],
    "hitlGates": [],
    "domainCommandCandidates": [
      {"command": null, "label": "提案键 · 不写 packages", "note": "valuation_card · 服务 HITL⑦"}
    ],
    "guardrails": ["后置业务可跑", "联动年费仅建议", "提案键勿写 packages"],
    "catalogAgentId": null,
    "accent": "purple",
    "catalogGroup": "phase",
    "defaultTeam": false,
    "ownerLabel": "IP 决策",
    "phase": true,
    "emptyStateNote": "F7 价值评估师为后置业务席：样机可跑评分剧本与双文件；无独立 HITL（服务 HITL⑦）。"
  },
  "expert-monetize": {
    "id": "expert-monetize",
    "name": "转化顾问",
    "role": "expert",
    "specialty": "许可/转让 · monetize_terms",
    "description": "F8 转化变现 · 估值与合同必备条款。【HITL⑧】交易签约。后置业务可跑样机。",
    "tools": ["estimate_deal", "draft_term_sheet", "validate_contract_clauses"],
    "shortcuts": [
      {"id": "value", "label": "估值区间", "action": "jump", "stepId": "value"},
      {"id": "terms", "label": "条款草案", "action": "jump", "stepId": "terms"},
      {"id": "validate", "label": "条款校验", "action": "jump", "stepId": "validate"},
      {"id": "report-orch", "label": "回报总控", "action": "report"}
    ],
    "steps": [
      {
        "id": "value",
        "label": "估值区间",
        "script": "【转化】许可估值区间 ¥80–120 万（mock 公式 · 非真报价）。",
        "tool": {"name": "estimate_deal", "preview": "low=80w · high=120w"}
      },
      {
        "id": "terms",
        "label": "条款草案",
        "script": "【转化】Term sheet：独占区域 / 里程碑款 / 审计权 · 必备条款骨架。",
        "tool": {"name": "draft_term_sheet", "preview": "exclusive=CN · milestones=3"}
      },
      {
        "id": "validate",
        "label": "签约闸",
        "script": "【转化】16_monetize_terms + worklog 待 Confirm（HITL⑧ · confirm_quote 心智 · 禁真签约）。",
        "tool": {"name": "validate_contract_clauses", "preview": "clauses=ok · hitl=⑧"},
        "triggersHitl": true,
        "hitlGate": "confirm_quote"
      }
    ],
    "hitlGates": ["confirm_quote"],
    "domainCommandCandidates": [
      {"command": null, "label": "样机示意 · 不写真签约", "note": "monetize_terms 心智 · 内存 Confirm"}
    ],
    "guardrails": ["后置业务可跑", "禁真签约", "未 Confirm 不写库"],
    "catalogAgentId": "agent-monetize",
    "accent": "emerald",
    "catalogGroup": "phase",
    "defaultTeam": false,
    "ownerLabel": "商务/IP",
    "phase": true,
    "emptyStateNote": "F8 转化顾问为后置业务席：样机可跑估值→条款→HITL⑧ Confirm；无真签约。"
  },
  "expert-enforcement": {
    "id": "expert-enforcement",
    "name": "无效维权顾问",
    "role": "expert",
    "specialty": "无效/维权 · enforcement_brief",
    "description": "F9 维权防御 · 全面覆盖比对；飞轮回流 F3。≠ FTO（expert-fto）；≠ watch。后置业务可跑样机。",
    "tools": ["claim_chart_compare", "stability_score", "draft_enforcement_brief"],
    "shortcuts": [
      {"id": "map", "label": "特征映射", "action": "jump", "stepId": "map"},
      {"id": "compare", "label": "覆盖比对", "action": "jump", "stepId": "compare"},
      {"id": "flywheel", "label": "回流 F3", "action": "jump", "stepId": "flywheel"},
      {"id": "report-orch", "label": "回报总控", "action": "report"}
    ],
    "steps": [
      {
        "id": "map",
        "label": "特征映射",
        "script": "【维权】权要特征 6 项已映射到被控产品（mock）。≠ FTO 自由实施分析。",
        "tool": {"name": "claim_chart_compare", "preview": "features=6 · ≠fto"}
      },
      {
        "id": "compare",
        "label": "覆盖比对",
        "script": "【维权】全面覆盖 4/6 · 稳定性 0.64 · 建议补强从权。提案键 enforcement_brief。",
        "tool": {"name": "stability_score", "preview": "cover=4/6 · stability=0.64"}
      },
      {
        "id": "flywheel",
        "label": "回流布局",
        "script": "【维权】17_enforcement_brief + worklog：漏洞信封 → 回流 F3 布局策略师（飞轮）。勿借 watch_alert。",
        "tool": {"name": "draft_enforcement_brief", "preview": "flywheel→expert-layout · ≠watch"}
      }
    ],
    "hitlGates": [],
    "domainCommandCandidates": [
      {"command": null, "label": "提案键 · 不写 packages", "note": "enforcement_brief · ≠fto · ≠watch_alert"}
    ],
    "guardrails": ["≠ expert-fto", "≠ STAGE watch", "后置业务可跑"],
    "catalogAgentId": null,
    "accent": "zinc",
    "catalogGroup": "phase",
    "defaultTeam": false,
    "ownerLabel": "法务/诉讼",
    "phase": true,
    "emptyStateNote": "F9 无效维权顾问为后置业务席：样机可跑比对+回流信封；id 独立于 expert-fto。"
  },

  "expert-search": {
    "id": "expert-search",
    "name": "检索员（查新暨三性）",
    "role": "expert",
    "specialty": "查新+三性 · research_report",
    "description": "查新暨三性意见书。产出 06_research_report + worklog。handoff=research_report。",
    "tools": [
      "commercial_patent_search",
      "cluster_hits",
      "draft_research_report",
      "bind_novelty"
    ],
    "shortcuts": [
      {
        "id": "run-query",
        "label": "跑检索式",
        "action": "jump",
        "stepId": "query"
      },
      {
        "id": "open-hits",
        "label": "看命中",
        "action": "jump",
        "stepId": "hits"
      },
      {
        "id": "basket",
        "label": "入工作篮",
        "action": "jump",
        "stepId": "basket"
      },
      {
        "id": "report-orch",
        "label": "回报总控",
        "action": "report"
      }
    ],
    "steps": [
      {
        "id": "query",
        "label": "检索式",
        "script": "【检索】关键词：边缘调度 / 负载预测 / 能耗约束。过程见 worklog §3。",
        "tool": {
          "name": "commercial_patent_search",
          "preview": "query=(边缘 OR edge) AND 调度 · limit=20"
        }
      },
      {
        "id": "hits",
        "label": "命中筛选",
        "script": "【检索】命中 12。Top3：CN114882901A · US20230123456A1 · CN115001234A。",
        "tool": {
          "name": "cluster_hits",
          "preview": "clusters=3"
        }
      },
      {
        "id": "basket",
        "label": "工作篮/三性",
        "script": "【检索】Top5 入篮；三性意见草稿：X/Y/A 占位。",
        "tool": {
          "name": "bind_novelty",
          "preview": "basket=5"
        }
      },
      {
        "id": "strategy",
        "label": "报告确认",
        "script": "【检索】06_research_report + worklog 待确认。",
        "tool": {
          "name": "draft_research_report",
          "preview": "handoff=research_report"
        },
        "triggersHitl": true,
        "hitlGate": "approve_strategy"
      }
    ],
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
        "note": "Confirm 后 · research_report"
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
  }
}

export const PATENT_CATALOG_IDS: ProjectExpertId[] = ["orchestrator","expert-landscape","expert-inspire","expert-competitor","expert-mining","expert-layout","expert-research","expert-intake","expert-disclosure","expert-draft","expert-figure","expert-fto","expert-filing","expert-oa","expert-annuity","expert-valuation","expert-monetize","expert-enforcement"]

export const PATENT_PROJECT_EXPERT_IDS: ProjectExpertId[] = PATENT_CATALOG_IDS.filter(
  (id) => PATENT_EXPERTS[id]?.defaultTeam,
)

export type PatentExpertId = (typeof PATENT_CATALOG_IDS)[number] | 'expert-search'
