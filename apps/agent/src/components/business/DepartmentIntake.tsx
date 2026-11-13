import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssetLibrary } from '../../assets/AssetLibraryContext';
import { buildDepartmentBrief, DEPARTMENT_INTAKE } from '../../business/departmentBrief';
import { businessSeatDisplayName } from '../../business/businessSeats';
import type { ReceptionHandoff } from '../../business/receptionHandoff';
import type { OrgDept } from '../../departments/orgDepts';
import { deptSlug } from '../../departments/orgDepts';
import type { AgentProject, ProjectThread } from '../../projects/types';
import { ExpertAvatar } from '../departments/ExpertAvatar';
import { useProjectFolder } from '../../projects/ProjectFolderContext';
import { HALL_DEPT_DOORS } from '../../business/hallDepts';
import { BUSINESS_SEED_IDS } from '../../business/businessSeeds';
export function DepartmentIntake({ project, dept, handoff, initialBrief, onConfirm }: {
    project: AgentProject;
    dept: OrgDept;
    handoff: ReceptionHandoff | null;
    initialBrief?: ProjectThread['departmentBrief'];
    onConfirm: (brief: NonNullable<ProjectThread['departmentBrief']>) => void;
}) {
    const config = DEPARTMENT_INTAKE[deptSlug(dept.id)] ?? { question: '这次希望本部门帮你办成什么事？', materials: '与本次目标有关的材料', result: '确认范围后整理本案稿件，关键决定交你确认' };
    const [goal, setGoal] = useState(initialBrief?.goal || handoff?.goalText || project.summary || '');
    const [context, setContext] = useState(initialBrief?.context || '');
    const [files, setFiles] = useState<string[]>(initialBrief?.fileNames ?? handoff?.fileNames ?? []);
    const fileRef = useRef<HTMLInputElement>(null);
    const { upload, linkToProject } = useAssetLibrary();
    return <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 lg:px-8" data-testid="department-intake" data-case-id={project.id} data-dept-id={dept.id}>
    <div className="mx-auto max-w-4xl">
      <nav className="mb-4 flex gap-4 text-xs text-slate-500"><Link to="/agent" className="underline">回大厅</Link><Link to={'/agent/cases/' + project.id} className="underline">本案概况</Link><Link to="/agent/cases" className="underline">选择已有项目</Link></nav>
      <p className="text-xs text-slate-500" data-testid="dept-intake-case-title">本案：{project.title}</p>
      <h1 className="mt-1 text-xl font-semibold text-slate-900">{dept.label} · 先把任务接清楚</h1>
      <ol className="my-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500" aria-label="本部门办理流程"><li className="font-semibold text-slate-900">1 确认本次任务</li><li>2 补充材料与缺项</li><li>3 整理本案稿件</li><li>4 你确认后再交接</li></ol>
      <div className="grid items-start gap-4 md:grid-cols-[1fr_16rem]">
        <form className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={(e) => { e.preventDefault(); const brief = buildDepartmentBrief({ goal, context, fileNames: files }); if (brief)
        onConfirm(brief); }}>
          <div className="flex items-center gap-3"><ExpertAvatar name={businessSeatDisplayName(dept.leadSeatId)} seed={dept.leadSeatId} deptId={dept.id} size="md" kind="expert" presence="waiting"/><div><p className="text-sm font-semibold text-slate-900">{businessSeatDisplayName(dept.leadSeatId)} · 本部门负责人</p><p className="mt-1 text-xs text-slate-500">{handoff ? '这次来意已带到本案，确认或补充即可。' : '我先了解目标和材料，再与你确认下一步。'}</p></div></div>
          <label className="block text-sm font-medium text-slate-800">这次想办成什么事？<textarea required value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} placeholder={config.question} className="focus-ring mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal" data-testid="dept-intake-goal"/></label>
          <label className="block text-sm font-medium text-slate-800">{config.question}<textarea value={context} onChange={(e) => setContext(e.target.value)} rows={3} placeholder="知道多少说多少；还不确定的可以直接写“不确定”。" className="focus-ring mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal" data-testid="dept-intake-context"/></label>
          <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-medium text-slate-800">手头材料（可稍后补）</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">可提供：{config.materials}。没有材料也可以先描述。</p>
            <input ref={fileRef} type="file" multiple className="sr-only" aria-label="选择本案材料" onChange={(e) => { const chosen = Array.from(e.target.files ?? []); for (const file of chosen) {
        const doc = upload({ name: file.name, size: file.size });
        linkToProject(doc.id, project.id);
    } setFiles((prev) => [...new Set([...prev, ...chosen.map((f) => f.name)])]); e.target.value = ''; }}/><button type="button" className="focus-ring mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium" onClick={() => fileRef.current?.click()}>选择手头材料</button>
            {files.length ? <ul className="mt-3 space-y-1 text-xs text-slate-700">{files.map((name) => <li key={name} className="flex items-center justify-between gap-2"><span className="break-all">{name}</span><button type="button" className="focus-ring shrink-0 rounded p-1 underline" aria-label={'移除 ' + name} onClick={() => setFiles((prev) => prev.filter((f) => f !== name))}>移除</button></li>)}</ul> : null}
            <p className="mt-3 text-[11px] leading-relaxed text-amber-800">当前原型只登记文件名，正文尚未上传或读取；已选文件不代表材料已核验。</p>
          </section>
          <button type="submit" disabled={!goal.trim()} className="btn-press focus-ring w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40" data-testid="dept-intake-confirm">确认任务，进入本案工作区</button>
        </form>
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600"><div><h2 className="font-semibold text-slate-900">本次怎么推进</h2><p className="mt-2">{config.result}。</p></div><div><h2 className="font-semibold text-slate-900">谁来协作</h2><p className="mt-2">负责人统一接待并汇报，需要时再请协作岗位。</p><ul className="mt-2 space-y-2">{dept.peers.map((peer) => <li key={peer.id}>{peer.label}<span className="block text-[11px] text-slate-400">{peer.kind === 'session' ? '可单独对话 · 当前为样机会话' : '协作岗位预留 · 尚无独立处理能力'}</span></li>)}</ul></div><p className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">当前可记录任务、补充文字与编辑稿件；专业分析、正文识别和自动质检尚未接入。</p></aside>
      </div>
    </div>
  </div>;
}
export function CaseDraftPanel({ body, goal, context, onSave }: {
    body: string;
    goal: string;
    context: string;
    onSave: (body: string) => void;
}) {
    const [draft, setDraft] = useState(body);
    const [saved, setSaved] = useState(false);
    return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="case-draft-panel">
    <h2 className="text-base font-semibold text-slate-900">本案工作稿</h2>
    <div className="my-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600"><p>本次任务：{goal}</p>{context ? <p className="mt-2">已补充：{context}</p> : null}</div>
    <p className="mb-3 text-xs text-slate-500">{body.trim() ? '显示本案已保存的稿件。' : '暂无本案产出。可以先补充事实或粘贴已有草稿；专业分析服务尚未接入。'}</p>
    <label className="block text-xs font-medium text-slate-700">本案正文<textarea rows={18} value={draft} onChange={(e) => { setDraft(e.target.value); setSaved(false); }} placeholder="在这里整理本案稿件。没有依据的结论先留空。" className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] p-4 text-sm leading-relaxed" data-testid="dept-output-body"/></label>
    <div className="mt-3 flex items-center gap-3"><button type="button" disabled={!draft.trim() || draft === body} onClick={() => { onSave(draft); setSaved(true); }} className="focus-ring rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-40" data-testid="dept-mid-save">保存本案稿件</button>{saved ? <p role="status" className="text-xs text-emerald-700">已保存到本案</p> : null}</div>
  </section>;
}
export function UserDepartmentWorkspace({ project, dept, thread }: {
    project: AgentProject;
    dept: OrgDept;
    thread: ProjectThread;
}) {
    const { patchThread, appendMessage } = useProjectFolder();
    const [editingBrief, setEditingBrief] = useState(false);
    const [message, setMessage] = useState('');
    const [versionSaved, setVersionSaved] = useState(false);
    const brief = thread.departmentBrief!;
    const config = DEPARTMENT_INTAKE[deptSlug(dept.id)];
    const messages = thread.messages.filter((m) => m.meta?.stepId === 'department-intake');
    if (editingBrief)
        return <DepartmentIntake project={project} dept={dept} initialBrief={brief} handoff={null} onConfirm={(next) => { patchThread(project.id, dept.leadSeatId, { departmentBrief: next }); setEditingBrief(false); }}/>;
    return <div className="flex min-h-0 flex-1 flex-col bg-slate-50" data-testid="user-department-workspace" data-case-id={project.id}>
    <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-500">本案：{project.title}</p><h1 className="mt-1 text-base font-semibold text-slate-900">{dept.label} · 本案工作区</h1></div><nav className="flex gap-4 text-xs text-slate-600"><Link to="/agent/cases" className="underline">项目列表</Link><Link to="/agent" className="underline">大厅新办</Link><button type="button" className="underline" onClick={() => setEditingBrief(true)}>补充任务与材料</button></nav></div><p className="mt-2 text-xs text-slate-500">已确认任务，待补充材料与整理稿件。专业分析尚未接入，当前不会自动生成结论或判定通过。</p></header>
    <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[10rem_1fr_20rem]">
      <aside className="border-b border-slate-200 bg-white p-4 lg:border-b-0 lg:border-r"><h2 className="text-xs font-semibold text-slate-800">本案材料与版本</h2><p className="mt-3 text-[11px] text-slate-500">文件名称登记 · 正文未读取</p><ul className="mt-2 space-y-2 text-xs text-slate-600">{brief.fileNames.length ? brief.fileNames.map((f) => <li key={f} className="break-all">{f}</li>) : <li>尚未选择材料</li>}</ul><h3 className="mt-6 text-xs font-medium">已保存版本</h3>{thread.artifactVersions?.length ? <ul className="mt-2 space-y-2 text-[11px] text-slate-500">{thread.artifactVersions.map((v, i) => <li key={i}><details><summary className="cursor-pointer">版本 {i + 1} · {new Date(v.savedAt).toLocaleDateString()}</summary><pre className="mt-2 whitespace-pre-wrap break-all">{v.markdown}</pre></details></li>)}</ul> : <p className="mt-2 text-xs text-slate-400">暂无版本</p>}</aside>
      <main className="min-w-0 p-4 lg:p-5"><CaseDraftPanel key={project.id + ':' + dept.id} body={thread.artifactMarkdown ?? ''} goal={brief.goal} context={brief.context} onSave={(body) => patchThread(project.id, dept.leadSeatId, { artifactMarkdown: body })}/><div className="mt-3 flex items-center gap-3"><button type="button" disabled={!thread.artifactMarkdown?.trim()} className="focus-ring rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs disabled:opacity-40" onClick={() => { const versions = [...(thread.artifactVersions ?? []), { savedAt: new Date().toISOString(), markdown: thread.artifactMarkdown! }]; patchThread(project.id, dept.leadSeatId, { artifactVersions: versions }); setVersionSaved(true); }}>将已保存稿件另存版本</button>{versionSaved ? <span role="status" className="text-xs text-emerald-700">版本已保存</span> : null}</div><details className="mt-6 rounded-lg border border-slate-200 p-3 text-xs text-slate-600"><summary className="cursor-pointer">同一案子需要其他部门接续？</summary><p className="mt-2">选择后先与该部门确认任务；本部门记录和稿件继续保留。</p><div className="mt-3 flex flex-wrap gap-3">{HALL_DEPT_DOORS.filter((d) => d.deptId !== dept.id).map((d) => <Link key={d.slug} to={'/agent/cases/' + project.id + '/depts/' + d.slug} className="underline">{d.label}</Link>)}</div></details></main>
      <aside className="flex min-h-80 flex-col border-t border-slate-200 bg-white p-4 lg:border-l lg:border-t-0"><div className="flex items-center gap-3"><ExpertAvatar name={businessSeatDisplayName(dept.leadSeatId)} seed={dept.leadSeatId} deptId={dept.id} size="md" kind="expert" presence="waiting"/><div><h2 className="text-sm font-semibold">{businessSeatDisplayName(dept.leadSeatId)}</h2><p className="mt-1 text-xs text-slate-500">本部门负责人 · 样机接待</p></div></div><p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">任务已记下：{brief.goal}。{config?.question}</p><p className="mt-3 text-xs leading-relaxed text-slate-500">计划流程：{config?.result}。专业处理与确认交接服务尚未接入。</p><div className="my-4 space-y-3 text-xs leading-relaxed" aria-live="polite">{messages.map((m) => <p key={m.id} className={m.role === 'user' ? 'rounded-lg bg-slate-900 p-3 text-white' : 'rounded-lg bg-slate-50 p-3 text-slate-600'}>{m.content}</p>)}</div><form className="mt-auto space-y-2" onSubmit={(e) => { e.preventDefault(); const text = message.trim(); if (!text)
        return; appendMessage(project.id, dept.leadSeatId, { role: 'user', content: text, meta: { backend: 'mock', stepId: 'department-intake' } }); appendMessage(project.id, dept.leadSeatId, { role: 'assistant', content: '补充内容已记录在本案。当前只做记录，请把需要采用的事实整理进中栏稿件；尚未执行专业分析或材料核验。', meta: { backend: 'mock', stepId: 'department-intake' } }); setMessage(''); }}><label className="block text-xs text-slate-600">补充本次任务<textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="focus-ring mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm" placeholder="补充范围、时间、技术事实或你的疑问"/></label><button type="submit" disabled={!message.trim()} className="focus-ring rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-40">记录补充</button></form><Link className="mt-4 text-[11px] text-slate-500 underline" to={'/agent/cases/' + BUSINESS_SEED_IDS.A + '/depts/' + deptSlug(dept.id)}>查看独立演示案的完整流程</Link></aside>
    </div>
  </div>;
}
