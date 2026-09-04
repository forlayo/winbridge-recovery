export const schemes = [
  {
    id: "control-tower",
    code: "A",
    name: "经典布局",
    english: "Classic Layout",
    summary: "三栏均衡总览：左侧阶段、中央终端、右侧插件，底部决策进度一眼可读。",
    density: "balanced",
    geometry: "soft",
    fit: "默认推荐 · 日常诊断与决策最均衡",
  },
  {
    id: "report-first",
    code: "B",
    name: "报告布局",
    english: "Report Layout",
    summary: "先呈现问题、影响和拟动作，再下钻中央终端证据；适合先看结论。",
    density: "balanced",
    geometry: "soft",
    fit: "决策向 · 诊断报告权重最高",
  },
  {
    id: "terminal-command",
    code: "C",
    name: "终端布局",
    english: "Terminal Layout",
    summary: "中央终端占据最大工作面积，报告压缩为证据带，适合高级排障。",
    density: "compact",
    geometry: "soft",
    fit: "专家向 · 实时终端权重最高",
  },
  {
    id: "guided-repair",
    code: "D",
    name: "引导布局",
    english: "Guided Layout",
    summary: "强化 1–5 阶段和当前说明，中央以分步叙事衔接终端与用户决策。",
    density: "airy",
    geometry: "round",
    fit: "引导向 · 初次使用最清晰",
  },
  {
    id: "compact-workbench",
    code: "E",
    name: "紧凑布局",
    english: "Compact Layout",
    summary: "高密度矩阵把报告、终端和插件压进单屏，同时保持左侧阶段持续可见。",
    density: "compact",
    geometry: "square",
    fit: "小屏向 · 单屏信息密度最高",
  },
];

export const colorPresets = [
  {
    id: "obsidian",
    name: "黑曜",
    description: "近黑内容层配冷青强调，默认推荐",
    accent: "#58dcff",
    channels: ["#22e6ff", "#3478ff", "#d14cff"],
    pluginColors: ["#4de0a2", "#ffc05b", "#58b7ff"],
    swatches: ["#080b11", "#17212d", "#58dcff"],
  },
  {
    id: "purple-white",
    name: "紫白",
    description: "明亮底色与克制紫色操作强调",
    accent: "#7657e8",
    channels: ["#39d9ff", "#6f67ff", "#d94dcc"],
    pluginColors: ["#2fac7c", "#d68a2b", "#486fd0"],
    swatches: ["#f8f7fc", "#ebe8f6", "#7657e8"],
  },
  {
    id: "blue-white",
    name: "蓝白",
    description: "清晰技术文档感与海军蓝层级",
    accent: "#2467d6",
    channels: ["#20cde8", "#3678ee", "#8f54ef"],
    pluginColors: ["#199b76", "#d67b2f", "#2467d6"],
    swatches: ["#f5f9ff", "#e6eefb", "#2467d6"],
  },
  {
    id: "ice-cyan",
    name: "冰青",
    description: "深冷青底色与高辨识状态光",
    accent: "#35e4d2",
    channels: ["#34f1e0", "#2d9cff", "#9c64ff"],
    pluginColors: ["#35e4a0", "#f2bd4e", "#43a7ff"],
    swatches: ["#071516", "#133033", "#35e4d2"],
  },
  {
    id: "graphite",
    name: "石墨",
    description: "中性低饱和实体工具风格",
    accent: "#9fb6c9",
    channels: ["#5ad8e6", "#7396ff", "#c06bd8"],
    pluginColors: ["#65c99d", "#d9ad62", "#91aac0"],
    swatches: ["#101214", "#24282c", "#9fb6c9"],
  },
];

export const diagnosticStages = [
  { id: 1, title: "环境检测", detail: "系统与路径", state: "done" },
  { id: 2, title: "插件诊断", detail: "三插件独立扫描", state: "active" },
  { id: 3, title: "安全校验", detail: "备份与写入门槛", state: "waiting" },
  { id: 4, title: "准备修复", detail: "等待用户决定", state: "waiting" },
  { id: 5, title: "结果与核验", detail: "停留结果页", state: "waiting" },
];

export const pluginStates = [
  { id: "browser", name: "Browser", state: "可连接", risk: "低", tone: "ok", evidence: "注册项与包目录一致" },
  { id: "chrome", name: "Chrome", state: "发现偏差", risk: "中", tone: "warn", evidence: "本机桥接版本待复核" },
  { id: "computer-use", name: "Computer Use", state: "静态正常", risk: "待核验", tone: "info", evidence: "辅助传输尚未真实测试" },
];

export const logSeed = [
  { time: "10:31:02", type: "INFO", category: "启动", message: "进入只读诊断协议；写入锁定。" },
  { time: "10:31:03", type: "EVID", category: "路径", message: "允许根路径已标准化；未发现越界目标。" },
  { time: "10:31:04", type: "OK", category: "Browser", message: "注册项、清单与文件哈希可对应。" },
  { time: "10:31:05", type: "WARN", category: "Chrome", message: "桥接版本存在 1 项偏差；影响：连接可能超时。" },
  { time: "10:31:06", type: "MAP", category: "GitHub", message: "映射到已知问题候选；仅展示，不自动套用修复。" },
  { time: "10:31:07", type: "INFO", category: "Computer Use", message: "静态注册正常；运行时辅助传输尚未核验。" },
  { time: "10:31:08", type: "SAFE", category: "备份", message: "若用户选择修复，将先创建可验证备份。" },
  { time: "10:31:09", type: "PLAN", category: "动作", message: "预计动作：备份 → 替换 → 注册 → 顺序核验。" },
  { time: "10:31:10", type: "WAIT", category: "决策", message: "诊断完成；等待用户选择修复或直接打开 GPT。" },
];

export const settingCategories = [
  { id: "general", label: "常规" },
  { id: "appearance", label: "外观与主题" },
  { id: "progress", label: "进度与动效" },
  { id: "diagnostics", label: "诊断与日志" },
  { id: "safety", label: "安全与路径" },
  { id: "backup", label: "备份与回滚" },
  { id: "plugins", label: "插件" },
  { id: "social", label: "社交动态" },
  { id: "games", label: "小游戏" },
  { id: "performance", label: "性能与无障碍" },
  { id: "about", label: "关于" },
];

export const preservationRows = [
  { id: "gear", label: "左下角齿轮入口", evidence: "固定在主窗口左下角，不被顶栏设置替代" },
  { id: "gear-menu", label: "齿轮四项紧凑一级菜单", evidence: "小游戏、主题、看看他、更多设置保持原字样与顺序" },
  { id: "terminal", label: "中央实时终端 / 日志", evidence: "主工作区中央，结构化且有上限" },
  { id: "stages", label: "左侧 1–5 阶段", mode: "core-exact / layout-adaptive", evidence: "数字造型、环绕/旋转、等待/进行中/完成三态与状态驱动关系高保真；位置、间距、文案排版随壳层适配" },
  { id: "plugins", label: "三插件独立状态区", evidence: "Browser、Chrome、Computer Use 不聚合" },
  { id: "games", label: "Snake 与 Minesweeper", evidence: "同一小游戏选择窗口并列展示" },
  { id: "themes", label: "现有主题切换", evidence: "齿轮菜单保留主题入口，设置中心提供完整选项" },
  { id: "safety-core", label: "3.1.1 安全能力语义", evidence: "诊断、修复说明、备份、回滚、路径门槛、直接打开 GPT 均可见" },
  { id: "result-page", label: "修复后停留结果页", evidence: "诊断前后、问题、动作、结果、未解决项、日志入口齐全" },
  { id: "auto-close", label: "自动关闭默认关闭", evidence: "设置存在，但默认与导出值固定为 false" },
  { id: "new-defaults", label: "新增设置不代替用户开启", evidence: "全部新增布尔项默认 false" },
];

export const recoveryStates = [
  { id: "Diagnosing", label: "只读诊断", write: false },
  { id: "ReportReady", label: "报告就绪", write: false },
  { id: "AwaitingDecision", label: "等待决定", write: false },
  { id: "Repairing", label: "顺序修复", write: true },
  { id: "ResultReady", label: "结果就绪", write: false },
];

export const upstreamConstraints = [
  { source: "Issues", decision: "DiagnoseOnly → ShowReport → AwaitDecision", surface: "主窗口状态接口、只读诊断按钮、修复说明报告", behavior: "报告完成后停在 AwaitingDecision；不自动修改", frozen: "新插件写入 / 注册 / 备份 / 更新逻辑" },
  { source: "Issues", decision: "修复前七字段说明", surface: "查看修复说明对话框", behavior: "code、证据、影响、拟动作、风险、写入范围、可跳过性逐项可见", frozen: "不得用一个总风险分替代单项说明" },
  { source: "Issues", decision: "修复后停留结果页", surface: "ResultReady 结果页", behavior: "诊断前后、问题、动作、结果、未解决项、日志入口持续保留", frozen: "默认自动退出" },
  { source: "性能", decision: "设置窗口立即构造", surface: "设置标题栏、插件 / 诊断设置行", behavior: "窗口先显示；网络能力在后台只读更新，不阻塞首帧", frozen: "构造期间串行网络探测" },
  { source: "性能", decision: "UI 日志有界队列与批渲染", surface: "中央实时终端", behavior: "80 行上限、批次指示、筛选、暂停自动跟随；完整日志仍在文件", frozen: "无界输入队列、逐行 WPF 对象和逐行 ScrollToEnd" },
  { source: "性能", decision: "只读状态进度", surface: "1–5 阶段与流体进度条", behavior: "进度表达诊断 / 报告准备，不隐式承诺写入完成", frozen: "磁盘日志协议与设置写入时序变更" },
];

export const fluidObservations = [
  { stamp: "01.2s", title: "低进度建立", observed: "近黑胶囊轨道保持稳定；百分比边界处出现窄而明亮的纵向不规则前沿，左侧仅轻度着色。", implementation: "独立暗场 + 进度坐标前沿；文字层固定在最上方，不参与形变。" },
  { stamp: "04.7–05.3s", title: "前沿挤压", observed: "实际百分比处是近似纵向的等离子前沿；3–5 个凸凹瓣在相邻帧中挤压、回弹，亮边比尾部雾更硬。", implementation: "同一进度坐标上的阴影、主体、亮边、热点四层同步变形；不使用普通渐变扫光、粒子或波浪线。" },
  { stamp: "08.6s", title: "融合过渡", observed: "青、蓝、洋红集中在前沿及其后方 28–45 px 内融合，左侧主体依旧克制，局部辉光不溢出胶囊。", implementation: "两层受限尾雾 + 三色前沿；轨道裁切限制辉光，避免把整段填充做成彩虹渐变。" },
  { stamp: "11.1s", title: "多通道显色", observed: "高进度时前沿仍保留清晰亮核、彩色主体与柔软尾雾，文字位置完全稳定。", implementation: "三色 CSS 变量只作用于前沿和邻近雾区；进度坐标采用单调缓动。" },
  { stamp: "13.0s", title: "接近完成", observed: "前沿抵近末端时横向体积被压缩，但纵向火焰/等离子轮廓仍在，背景与文本不抖动。", implementation: "88% 后逐步压缩前沿宽度；低动态冻结形变，低端模式退化为静态不规则亮边。" },
];

export const sourceEntries = [
  { name: "yizhe21803/nebula-capsules-guanyu-lab", url: "https://github.com/yizhe21803/nebula-capsules-guanyu-lab", license: "MIT · commit aef3f7d010a721e00404ec8dc69239714e38e77c", files: "progress-flow-renderer.js, progress-motion-data.js, progress-reference-atlases.js", use: "主进度流体的 WebGL2 渲染、运动数据与参考纹理；React 适配层负责状态绑定和安全进度门槛", kind: "open-source" },
  { name: "抖音公开视频：把进度条做成流体，有多上头？", url: "https://www.douyin.com/video/7670470019972791162", license: "视觉参考页面，不作为代码许可证", files: "无复制文件", use: "内部研究帧覆盖 01.2 / 04.7 / 05.3 / 08.6 / 11.1 / 13.0 秒；截图不进入发布资产", kind: "reference-only" },
  { name: "Javis603/token-monitor", url: "https://github.com/Javis603/token-monitor", license: "MIT", files: "src/electron/renderer/index.html, styles.css, dashboard.html, dashboard.css, themePresets.js", use: "研究设置分组、信息密度和主题组织；本概念站未复制代码或截图", kind: "open-source" },
  { name: "microsoft/PowerToys", url: "https://github.com/microsoft/PowerToys", license: "MIT", files: "src/settings-ui/Settings.UI/Views 与 ViewModels", use: "研究 Windows 工具的设置导航、状态分组和启停清晰度；未复制代码", kind: "open-source" },
  { name: "lepoco/wpfui", url: "https://github.com/lepoco/wpfui", license: "MIT", files: "samples/Wpf.Ui.Demo.Mvvm/Views/Pages/SettingsPage.xaml, src/Wpf.Ui/Controls/NavigationView/*", use: "研究未来 WPF 迁移的 Fluent 导航与主题切换边界；未复制代码", kind: "open-source" },
  { name: "microsoft/terminal", url: "https://github.com/microsoft/terminal", license: "MIT", files: "src/cascadia/TerminalApp/TerminalPage.xaml", use: "研究终端可读性、状态层级与密度；未复制代码", kind: "open-source" },
  { name: "DevToys-app/DevToys", url: "https://github.com/DevToys-app/DevToys", license: "MIT", files: "LICENSE.md 与设置 UI 组件体系（未来复用前需再次文件级核对）", use: "研究工具集合的清晰分组与设置持久化提示；未复制代码", kind: "open-source" },
];
