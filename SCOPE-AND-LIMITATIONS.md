# WinBridge Recovery — Scope and Limitations

The current formal release is [WinBridge Recovery 4.0.0](https://github.com/zemeng5208/winbridge-recovery/releases/tag/v4.0.0), published for Windows x64. The ordinary packaged demonstration is non-repairing by default. A current read-only preflight/diagnosis report plus an explicit user action are required before a real-repair request can pass its separate gates.

## What WinBridge Recovery does

WinBridge Recovery is a Windows recovery launcher for the Browser, Chrome, and Computer Use plugin infrastructure used by GPT/Codex Desktop. Its job is to detect and repair supported local state such as bundled marketplace data, plugin cache, `latest` pointers, runtime paths, native-host registration, and the launcher’s own verified backup/rollback state.

It is a **plugin/runtime recovery tool**, not a task-execution checkpoint system.

## Explicitly not supported

WinBridge Recovery intentionally does **not** implement or promise any of the following:

- restoring the last page that Computer Use or Browser clicked or viewed;
- reconstructing a click/action trail, screenshot trail, or exact UI step sequence;
- identifying or restoring the exact project files an agent changed as part of a previous task;
- recovering unsaved editor buffers or application-specific undo state;
- reading, reconstructing, replaying, or writing back hidden model context, agent plans, internal Computer Use/CUA run state, or an internal execution cursor;
- resuming the original Computer Use/Browser task from the exact interrupted step after plugin repair;
- running a background screen recorder, key logger, activity recorder, or broad work-context recorder as an approximation of the above.

A file that was already saved before a plugin failure may still exist on disk in its saved state. WinBridge does not treat that as task-state recovery and does not attempt to infer what the agent intended to do next.

## Why this is out of scope

WinBridge Recovery is an independent external project. It does not have a supported interface that can reliably read and write the complete internal execution state of the official Desktop Computer Use/Browser task runtime.

A partial external recorder could capture fragments such as active windows, file-system changes, or screenshots, but that would still not provide a reliable, complete, or truthful guarantee that the original task can resume from the exact interrupted step. It would also materially expand privacy exposure, permissions, storage, security review, and maintenance cost.

For those reasons, **task/session checkpoint recovery is intentionally not on the WinBridge Recovery roadmap**. This boundary may be reconsidered only if a stable, supported interface becomes available that makes reliable recovery possible without weakening the project’s privacy and safety model.

## What repair success means

A successful WinBridge repair means the relevant plugin/runtime surfaces have been restored to a consistent state and can be validated again. It does **not** mean that a previously interrupted Computer Use or Browser task, page, click history, or internal session state has been restored.

The 4.0.0 release records automated/build validation and a clean packaged smoke test. It does not claim universal Windows 10/11 repair compatibility or replace independent real-machine checks of Browser, Chrome, and Computer Use. The public installer is unsigned; use the Release page's SHA-256 sidecar before running it.

---

# WinBridge Recovery — 范围与限制

当前正式版是面向 Windows x64 发布的 [WinBridge Recovery 4.0.0](https://github.com/zemeng5208/winbridge-recovery/releases/tag/v4.0.0)。普通打包演示默认不会启动真实修复；只有当前有效的只读预检/诊断报告和用户明确动作同时满足，真实修复请求才可能通过独立门禁。

## WinBridge Recovery 做什么

WinBridge Recovery 是面向 Windows GPT/Codex Desktop 的 Browser、Chrome 和 Computer Use 插件基础设施恢复工具。它负责检查和修复 bundled marketplace、插件缓存、`latest` 指针、运行时路径、Native Host 注册以及 WinBridge 自身经过校验的备份/回滚状态。

它是一个**插件/运行时恢复工具**，不是任务执行断点系统。

## 明确不支持的功能

WinBridge Recovery 明确且有意地**不实现、不承诺**以下能力：

- 恢复 Computer Use 或 Browser 中断前最后点击、最后查看的页面；
- 重建完整点击轨迹、动作轨迹、截图轨迹或精确 UI 操作步骤；
- 判断并恢复某次 Agent 任务中究竟修改了哪些项目文件；
- 恢复编辑器尚未保存的缓冲区或应用自身的撤销状态；
- 读取、重建、重放或写回模型隐藏上下文、Agent 内部计划、Computer Use/CUA 内部 run state 或内部执行游标；
- 在插件修好后让原 Computer Use/Browser 任务从中断的精确步骤无缝继续；
- 通过后台录屏、键盘记录、活动记录或大范围“工作现场记录器”去近似实现上述能力。

如果某个文件在插件故障前已经保存到磁盘，它通常仍会保持当时已保存的状态。但这不属于 WinBridge 的任务状态恢复能力，WinBridge 也不会据此猜测 Agent 下一步原本准备做什么。

## 为什么不做

WinBridge Recovery 是独立的外部项目。目前项目没有一个受支持的接口，可以可靠读取并写回官方 Desktop Computer Use/Browser 任务运行时的完整内部执行状态。

外部程序可以尝试记录活动窗口、文件系统变化或截图等片段，但这些信息依然不足以可靠、完整、诚实地保证“原任务从精确中断点继续”；同时还会显著扩大隐私暴露面、权限范围、存储需求、安全审查和长期维护成本。

因此，**任务/会话断点恢复目前明确不进入 WinBridge Recovery 路线图**。只有未来出现稳定、受支持的接口，并且能够在不破坏本项目隐私与安全边界的前提下实现可靠恢复时，才会重新评估这一决定。

## “修复成功”代表什么

WinBridge 修复成功，代表相关插件/运行时基础设施已经恢复到一致状态，并可重新进行实际功能验证；它**不代表**之前中断的 Computer Use/Browser 任务、页面、点击历史或内部会话状态已经恢复。

4.0.0 Release 记录了自动化/构建校验和干净环境打包 smoke test，但不宣称所有 Windows 10/11 主机都具备完整修复兼容性；Browser、Chrome、Computer Use 仍需在真实目标机上分别验证。公开安装器当前未签名，运行前请使用 Release 页面提供的 SHA-256 sidecar 校验。
