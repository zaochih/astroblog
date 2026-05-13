---
title: 介绍 Windows 11 检查点累积更新
description: 介绍 Windows 11 检查点累积更新如何通过更小的增量差异包改进更新交付效率。
date: "2024-08-06T08:56:13Z"
updated: "2024-08-06T08:56:14Z"
tags:
  - windows
  - windows-11
category: windows
canonicalUrl: https://blog.licaoz.com/post/introducing-windows-11-checkpoint-cumulative-updates/
---

\[\*\* 本文的原文是位于 Windows IT 专业人员博客的 [Introducing Windows 11 checkpoint cumulative updates](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/introducing-windows-11-checkpoint-cumulative-updates/ba-p/4182552?wt.mc_id=studentamb_203301) \*\*\]

我们很高兴能在 Windows 11 中通过新的检查点累积更新进一步优化持续创新的交付。[^1]最早在 2024 年底，运行 Windows 11 24H2 或更高版本的任何设备以及 Windows Server 2025 都将能够自动获得这一优化。更小、更快和更可持续的更新使您的组织保持最新与安全，而不需要您采取任何行动。阅读 [Windows 预览体验版本 26120.1252](https://blogs.windows.com/windows-insider/2024/07/15/announcing-windows-11-insider-preview-build-26120-1252-dev-channel/?wt.mc_id=studentamb_203301)（Dev 频道）以了解您可如何预览这一体验。

> **更新于 2024 年 7 月 31 日**：
> 
> 该优化的预览现已在 [Microsoft Update Catalog](https://www.catalog.update.microsoft.com/Search.aspx?q=KB5040543&wt.mc_id=studentamb_203301) 和 [Windows 11 预览体验版本 26120.1330 (Dev 频道)](https://support.microsoft.com/topic/july-29-2024-windows-insider-s-preview-dev-channel-kb5040543-os-build-26120-1330-bfea7e78-c78f-442e-b4c8-ec3b6b1d1300?wt.mc_id=studentamb_203301) 可用。

> **提示**：Windows 11 版本 24H2 将会在今年晚些时候以传统功能更新的形式对所有设备可用。

## 解释累积更新检查点

Windows 11 质量更新采用服务技术，并从新的 Windows 操作系统「正式发布」（released to manufacturing，RTM）时起进行累积构建。这些每月更新包含自 RTM 以来的所有变更，以初始版本二进制文件的差异形式呈现。

> **提示**：您可在 [解释 Windows 月度更新](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/windows-monthly-updates-explained/ba-p/3773544#:~:text=Monthly%20updates%20are%20cumulative%20and%20include%20all%20previously,the%20reliability%20and%20quality%20of%20the%20Windows%20platform.) 中了解质量更新如何工作。[^2]

在 Windows 11 24H2 版本中，我们引入了检查点累积更新这一全新概念。这将允许您通过最新的累积更新获取功能和安全增强，而这些更新是通过更小、增量式的差异文件实现的，仅包含自上一个检查点累积更新以来的变更。这意味着您可以节省时间、带宽和硬盘空间。

今后，Microsoft 可能会定期发布作为检查点的累积更新。后续的更新将包括：

-   与检查点相关的更新包文件
-   包含增量二进制差异的新更新包文件，这些差异是相对于上一个检查点中的二进制版本而言的

这个过程可能会重复多次，从而在特定 Windows 版本的生命周期内生成多个检查点。Windows 11 24H2 版本的服务堆栈能够合并所有检查点，并且只下载和安装设备上缺少的内容。

## 管理累积更新

如果您通过 Windows 更新、适用于企业的 Windows 更新、Windows Autopatch 或 Windows Server 更新服务（WSUS）管理更新，这些新变化不需要您进行任何改变或采取任何行动。它们将以正常月度更新的形式出现，只是得到了改进。您可以继续使用当前用于审批和部署更新的相同工具和流程。

值得注意的是，这适用于运行 Windows 11 24H2 或更高版本的设备，以及 Windows Server 2025。您现在就可以通过 [Windows 预览体验版本 26120.1252](https://blogs.windows.com/windows-insider/2024/07/15/announcing-windows-11-insider-preview-build-26120-1252-dev-channel/?wt.mc_id=studentamb_203301)（Dev 频道）预览这一体验。

如果您从 Microsoft Update Catalog 获取更新，您会注意到某个月度更新可能包含多个可供下载的更新包文件。每个检查点都会有一个文件，另外还有一个包含最新检查点累积负载的文件。您将能够使用现有的部署工具按顺序安装所有文件。

如果您运行的是其他版本的 Windows 10 或 Windows 11（24H2 版本之前的版本），更新过程将与之前的月度更新或年度 Windows 11 功能更新类似。

## 检查点累积更新的好处

现在，您的组织可以通过改进的方式及时获取最新的功能改进和安全提升。具体而言，您将享受以下优势：Windows 设备的更新下载量进一步减少、在您的基础设施内可持续地重新分发更新，以及获得更好的年度功能更新体验。

## 更小的客户端下载量

在此前的 Windows 11 21H2 版本中，我们通过执行范围读取来仅下载和安装设备上缺失的二进制差异，从而实现了 Windows 设备的更新下载量减少。这些二进制差异是相对于二进制文件的 RTM 版本计算得出的。当 Windows 11 24H2 累积更新作为检查点发布时，后续累积更新中的二进制差异是相对于最新检查点中的二进制版本生成的，而不是相对于 RTM 版本。因此，对于已经同步到最新检查点累积更新的设备来说，这些差异文件更小，应用速度也更快。

> **提示**：要回顾之前的改进，请参阅以下文章：
> 
> -   《[Windows 11 累积更新改进概述](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/windows-11-cumulative-update-improvements-an-overview/ba-p/2842961?wt.mc_id=studentamb_203301)》
> -   《[Windows 11 22H2 版本更新基础：更快、更小](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/faster-smaller-windows-11-version-22h2-update-fundamentals/ba-p/3631894?wt.mc_id=studentamb_203301)》

## 服务器端可持续重分发

迄今为止，Windows 更新都打包在一个随时间不断增大的单一文件中。无论是 Microsoft 前端服务器还是您的远程分支机构，这个文件都会被下载或缓存到分发点以便重分发。对于检查点之后的后续更新，您无需重新分发自 RTM 以来累积的所有内容。一旦下载了检查点文件，您可以使用文件级去重技术，仅下载后续更新中的增量文件。这样可以将宝贵的能源资源仅用于必要之处。

## 通过启用包优化和持续的功能更新交付

当年度功能更新通过服务技术和启用包交付时，这个新版本与前一个版本共享相同的核心操作系统。[^3]这意味着它们也共享相同的月度更新。结果是，单个更新文件随着每个具有自己服务生命周期的新版本发布而变得越来越大，影响也越来越大。

当引入的检查点与启用包功能更新的可用性保持一致时，这些版本的月度更新可以重新开始，且体积较小。这意味着 Microsoft 可以扩展更多用于功能更新的启用包，而您可以比传统功能更新更快、更容易、更高效地采用它们。

这些优化特别旨在帮助您的组织采用 Windows 11 的持续创新模式。通过基于启用包的年度功能更新，您可以确保设备始终运行最新的 Windows 11 版本，从而改善安全状况和合规性。

## 做好准备

我们鼓励您现在就在 [Windows 预览体验版本 26120.1252](https://blogs.windows.com/windows-insider/2024/07/15/announcing-windows-11-insider-preview-build-26120-1252-dev-channel/?wt.mc_id=studentamb_203301)（Dev 频道）中体验这一预览功能。

我们致力于保护您的设备并提高其生产力。作为每月为您带来 Windows 更新的团队，我们已经采用了持续创新交付模式，并定期进行改进。我们对这项累积更新的最新创新感到兴奋，希望您能尽快尝试 Windows 11 检查点累积更新！

[^1]: 请阅读 [在 Windows 11 中实现持续创新](https://support.microsoft.com/zh-cn/windows/%E5%9C%A8windows-11%E4%B8%AD%E5%AE%9E%E7%8E%B0%E6%8C%81%E7%BB%AD%E5%88%9B%E6%96%B0-b0aa0a27-ea9a-4365-9224-cb155e517f12?wt.mc_id=studentamb_203301)
[^2]: 「每月更新是累积性的，包含所有先前发布的修复程序，以确保操作系统版本的统一性。这有助于提高 Windows 平台的可靠性和质量。」
[^3]: 如需了解启用包如何工作，请参阅 [Windows 11 版本 23H2 中为 IT 专业人员准备的新东西](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/what-s-new-for-it-pros-in-windows-11-version-23h2/ba-p/3967814?wt.mc_id=studentamb_203301) 和 [KB5027397](https://support.microsoft.com/topic/kb5027397-feature-update-to-windows-11-version-23h2-by-using-an-enablement-package-b9e76726-3c94-40de-b40b-99decba3db9d?wt.mc_id=studentamb_203301).
