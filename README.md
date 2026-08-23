# WinBridge Recovery

**Windows GPT/Codex Desktop 插件修复与安全启动工具。**

它用于检查和恢复 Browser、Chrome 与 Computer Use 三个桌面插件在更新或重启后出现的 marketplace、缓存、`latest` 指针、运行时路径和注册状态不一致问题。

> 当前正式版：**[WinBridge Recovery 4.0.0（Latest Release）](https://github.com/zemeng5208/winbridge-recovery/releases/tag/v4.0.0)**。正式版提供 Windows x64 安装器和便携 ZIP；安装器当前未签名，Windows SmartScreen 可能显示未签名程序的常规警告。请始终使用 Release 页面上的 SHA-256 sidecar 校验下载文件。

> 本项目是学生独立开发的非商业社区测试项目，与 OpenAI 无隶属、赞助或认可关系。第三方名称仅用于说明兼容对象；项目不包含第三方品牌图标，也不重新分发官方应用或插件文件。

## 明确不支持：会话与任务断点恢复

WinBridge Recovery 恢复的是**插件/运行时基础设施状态**，不是 Computer Use、Browser 或 Agent 的任务执行现场。

本项目明确且有意地**不实现、不承诺**以下能力：

- 恢复 Computer Use 或 Browser 中断前最后点击、最后查看的页面；
- 重建完整点击轨迹、动作轨迹、截图轨迹或精确 UI 操作步骤；
- 判断或恢复某次 Agent 任务中究竟修改了哪些项目文件；
- 恢复编辑器尚未保存的缓冲区或应用自身的撤销状态；
- 读取、重建、重放或写回模型隐藏上下文、Agent 内部计划、Computer Use/CUA 内部 run state 或执行游标；
- 在插件修好后让原 Computer Use/Browser 任务从中断的精确步骤无缝继续；
- 通过后台录屏、键盘记录、活动记录或大范围“工作现场记录器”去近似实现上述能力。

如果某个文件在插件故障前已经保存到磁盘，它通常仍会保持当时已保存的状态；但 WinBridge 不把这视为任务状态恢复，也不会据此猜测 Agent 下一步原本准备做什么。

原因很明确：WinBridge Recovery 是独立的外部项目，目前没有一个受支持的接口可以可靠读取并写回官方 Desktop Computer Use/Browser 任务运行时的完整内部执行状态。只做外部活动记录也无法诚实保证“原任务从精确中断点继续”，同时会显著扩大隐私、权限、安全和维护成本。

因此，**任务/会话断点恢复目前明确不进入 WinBridge Recovery 路线图**。只有未来出现稳定、受支持的接口，并且能够在不破坏本项目隐私与安全边界的前提下实现可靠恢复时，才会重新评估这一决定。

完整说明见 [SCOPE-AND-LIMITATIONS.md](SCOPE-AND-LIMITATIONS.md)。

## 反馈与问题报告

**如果你已经尝试过 WinBridge Recovery，欢迎告诉我结果——即使成功了，也非常有价值。**

- [快速反馈：已解决 / 部分解决 / 没有解决](https://github.com/zemeng5208/winbridge-recovery/issues/new?template=quick_feedback.yml)
- [报告 Bug](https://github.com/zemeng5208/winbridge-recovery/issues/new?template=bug_report.yml)
- [提出功能建议](https://github.com/zemeng5208/winbridge-recovery/issues/new?template=feature_request.yml)
- [提问](https://github.com/zemeng5208/winbridge-recovery/issues/new?template=question.yml)

**只写一句话也可以。** 如果 WinBridge 成功解决了问题，你的成功反馈可以帮助确认当前修复路径是否可靠；如果没有解决，哪怕只描述一句现象，也能帮助我判断下一步该修哪里。如果这个项目对你有帮助，也欢迎留下一个 GitHub Star，让更多遇到同类问题的人更容易找到它。

请不要在 Issue 中提交密码、Cookie、Token、API Key、账号或会话数据、私人配置、未脱敏的私人路径或完整敏感日志。

## 项目沿革

WinBridge Recovery 是早期公开脚本项目 **[Codex Desktop Plugin Repair Safety Kit](https://github.com/zemeng5208/codex-desktop-plugin-repair-safety-kit)** 的当前维护实现。

早期 Safety Kit 主要针对 Windows Codex Desktop 插件运行时异常，提供保守的健康检查以及面向 `node_repl` 的定向修复。WinBridge Recovery 延续同一类恢复问题，并进一步扩展为完整工程化工具：加入版本感知的官方包识别、bundled marketplace / cache / `latest` 状态协调、运行时与注册状态恢复、经过校验的备份与回滚、GUI 启动器、安装器、免安装便携包，以及针对新版 Desktop 包结构的持续兼容工作。

旧仓库不会被合并或重写，而是作为项目早期公开阶段继续保留，从而保留原始 Git 历史。当前开发、版本发布和主要文档以本仓库为准。

## 主要功能

- 自动识别当前安装的官方 Codex Desktop 包及其当前资源版本。
- 从当前官方包的 `cua_node/manifest.json` 读取运行时布局，不再假设固定的 `bin` 目录结构。
- 使用完整包版本以及 bundled plugin、CLI、CUA 内容哈希识别更新，避免继续使用旧资源镜像。
- 启动前关闭 Chrome 与 Edge，降低 Native Host 文件锁导致缓存更新失败的概率。
- 只在检测到状态不一致时，从本机当前官方包重建缺失的 marketplace、缓存和注册信息。
- 对深层插件依赖使用长路径安全的备份清单与校验逻辑。
- 可由用户选择保留一、二或三份通过校验的恢复备份，普通卸载默认不删除备份。
- 启动 Desktop 后进行两次连续静态一致性检查。
- 提供布局、材质、颜色和无障碍回退控制，以及贪吃蛇和扫雷小游戏。
- 可选显示固定公开来源的社交动态；公共数据源不可达时自动隐藏，不尝试绕过网络限制。
- 4.0.0 普通演示启动默认关闭真实修复能力，真实修复仍受只读诊断报告和明确用户动作双重门禁约束。
- 提供诊断、回滚和自检。

### 4.0.0 正式版已验证的界面与动态功能

- 五种运行布局在窄窗口和普通桌面尺寸下都保持在可滚动窗口内；阶段、终端、进度和插件卡片不会互相遮挡。
- 社交动态入口只读展示固定来源，清理前端标记，显示来源标签并提供翻译控件。
- 无法确认的时间显示为 `Time unavailable`，不会用旧数据回填当前窗口。
- 官方 X 头像只通过受控来源读取，并存放在应用自己的有界本地缓存中；不会读取浏览器 Cookie，也不会把头像或官方插件文件重新分发。
- 普通演示启动默认不带 `--enable-real-repair`，可用于查看界面而不会启动真实修复。
- 诊断先行：只读预检/诊断报告必须是当前运行生成的有效报告，且用户必须明确选择后，才可能进入真实修复门禁。

## 安全边界

- 不接管或修改 `C:\Program Files\WindowsApps` 的所有权。
- 不携带账号、密码、Cookie、Token、API Key、会话数据库、用户日志或私钥。
- 不记录或恢复 Computer Use/Browser 的任务点击轨迹、工作现场、隐藏执行上下文或内部会话断点。
- 不绕过 Browser 的企业网络或安全策略决定。
- 修复来源仅为目标电脑当前安装的官方包；安装包本身不内置官方插件副本。
- 只写入文档中列明的安装目录、备份目录和修复操作所需的 Codex 用户状态位置。

## 安装与使用

### 4.0.0 Windows x64 安装器

- [下载安装器](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-Setup-v4.0.0.exe)
- [安装器 SHA-256 sidecar](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-Setup-v4.0.0.exe.sha256)

安装器会创建独立的 `WinBridge-Recovery-V4` 安装、桌面快捷方式和当前用户卸载注册，不覆盖旧的 3.x 安装。正式安装器目前未签名，SmartScreen 警告是预期现象；运行前请核对 `8D49B10F0ADB0E01F21A1D8B0B03D477AA58F3466B08BFD964A21F13B18ECF77`。

### 免安装便携 ZIP

- [下载便携 ZIP](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-v4.0.0-portable-win-x64.zip)
- [便携 ZIP SHA-256 sidecar](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-v4.0.0-portable-win-x64.zip.sha256)

将完整的 `WinBridge-Recovery-V4-win32-x64` 文件夹解压到普通、可写的用户目录，然后运行：

```text
WinBridge-Recovery-V4-win32-x64\WinBridge-Recovery-V4.exe
```

便携包不会安装系统服务或创建卸载注册项，也不包含官方 Desktop 或插件文件。请保持解压后的目录结构完整，不要直接在 ZIP 内运行脚本。首次启动会先显示只读诊断/预检界面；普通演示启动默认不会执行真实修复。

无论使用安装器还是便携 ZIP，运行前都应核对 Release 页面公布的 SHA-256。正式版安装器未签名，不要把 SmartScreen 警告当成签名通过的证据。

## 更新与公开动态

4.0.0 的公开更新入口是 [GitHub Latest Release](https://github.com/zemeng5208/winbridge-recovery/releases/latest)。下载新版本后，请重新核对安装器或便携 ZIP 的 SHA-256；不要把旧 3.x 安装器或 Preview 1 资产当作当前版本。

公开动态功能会先实际探测固定的公开来源，而不是根据 IP 或国家猜测。条目会清理前端标记、显示来源标签；时间缺失或无法确认时显示 `Time unavailable`，不会用旧条目回填当前时间窗。官方 X 头像通过受控主进程来源读取，并限制在应用自己的有界缓存内。数据源全部不可达时，设置项和入口会自动隐藏；翻译目标跟随界面语言。

## 验证标准

静态检查通过不等于三个插件完整可用。最终应分别验证：

- Browser：真实打开网页、读取内容并交互；
- Chrome：通过扩展连接真实标签页并交互；
- Computer Use：辅助传输正常，并完成一次真实 Windows UI 操作。

三个表面不能互相替代。若 Browser 明确返回企业网络或安全策略拒绝，应停止尝试，本工具不会绕过该策略。

这里的“验证通过”仅表示插件重新具备可用性，不表示之前中断的页面、点击轨迹、任务上下文或原 Computer Use 会话已经恢复。

## 从源码构建

需要 Windows PowerShell 5.1、Node/npm 和正式版锁定的 Electron 工具链。完整的 4.0.0 打包流程位于 `v4\runtime\scripts\Build-Release.ps1`：

```powershell
cd .\v4\design-lab
npm ci
npm run build
cd ..\runtime
npm ci
npm run sync:frontend
npm test
npm run verify:snapshot
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Build-Release.ps1
```

构建输出应通过脚本中的前端、测试和打包校验；公开安装器当前未签名，运行前仍必须核对 Release 页面公布的 SHA-256。

## 卸载

卸载器只删除自身清单确认拥有的 `WinBridge-Recovery` 程序目录、快捷方式和卸载注册项，不递归删除用户选择的父目录。默认保留恢复备份，也不会删除官方 Desktop、用户会话或其他 MCP 配置。

详见 [SCOPE-AND-LIMITATIONS.md](SCOPE-AND-LIMITATIONS.md)、[LEGAL-NOTICE.md](LEGAL-NOTICE.md)、[SECURITY.md](SECURITY.md) 和 [TESTING-NOTICE.md](TESTING-NOTICE.md)。
