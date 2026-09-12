# A11Y 修复说明（web-design-guidelines 审计）

针对 Layout / Sidebar / Login / Dashboard / FlowChrome / 工作台页 / Docket / CaseDetail 的可访问性修复清单。

## 已修复

### 跳过链接与主内容地标
- Layout：新增 skip link「跳到主要内容」→ `#main`
- `<main id="main" tabIndex={-1}>`，支持跳转后聚焦
- Login：独立 skip link → `#login-main`（登录页不在 Layout 内）

### 图标按钮与装饰图标
- 所有 icon-only 按钮补充 `aria-label`（关闭对话框、删除权项、切换工作区等）
- 装饰性 Lucide 图标统一 `aria-hidden`

### 表单控件
- `Field` 以 `<label>` 包裹控件；必填项有可见 `*` 与 sr-only「（必填）」
- CasePicker：`htmlFor` + `name` + `autocomplete=off`
- 回执号 / 权项号 / 草稿代码类输入：`spellCheck={false}` + `name` + `autocomplete=off`
- Docket 生成对话框：`htmlFor` 关联 select/input

### 实时区域
- `ToastBanner` 容器常驻，`role="status"` + `aria-live="polite"` + `aria-atomic`
- Docket / CaseDetail 本地 toast 同样使用 live region

### 焦点可见性
- 新增 `.focus-ring` / `.focus-row`；按钮使用 `focus-visible:outline`
- `inputCls` 不再裸用 `outline-none`：改为 `focus:ring-2`（有替代环）
- Sidebar / Pipeline / Login / 交接按钮均有 focus-visible 环

### 模态与抽屉
- Docket「由事件生成」与 CaseDetail「派单」：
  - `role="dialog"` + `aria-modal`
  - Escape 关闭
  - 点击遮罩关闭
  - `overscroll-behavior: contain`
  - 关闭按钮 `aria-label`

### 导航语义
- 无 div-onClick 导航；案件卡 / KPI / 期限行使用 Link 或 button
- Login 工作区卡为原生 `<button>`（键盘可激活）

### 表格
- Docket 规则表：`<th scope="col">` 表头；行首 `<th scope="row">`

### 其他
- `.sr-only` 工具类
- `prefers-reduced-motion` 下关闭 KPI 渐入、btn-press、slider-pulse
- 标题 `text-balance`

## 未做（示意范围外）
- 真实屏幕阅读器全量回归脚本
- 颜色对比度自动化 CI
- 复杂虚拟列表键盘漫游
