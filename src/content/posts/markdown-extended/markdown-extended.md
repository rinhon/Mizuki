---
title: Markdown 扩展功能
published: 2024-05-01
description: '阅读更多关于 Mizuki 中的 Markdown 功能'
image: ''
tags: [演示, 示例, Markdown, mizuki]
category: '示例'
draft: false
pinned: false
lang: zh-CN
updated: 2024-11-29
---

## GitHub 仓库卡片
你可以添加链接到 GitHub 仓库的动态卡片，页面加载时，仓库信息会从 GitHub API 拉取。

::github{repo="matsuzaka-yuki/Mizuki"}

使用代码 `::github{repo="matsuzaka-yuki/Mizuki"}` 创建一个 GitHub 仓库卡片。

```markdown
::github{repo="matsuzaka-yuki/Mizuki"}
```

## 提示框 (Admonitions)

支持以下类型的提示框：`note` (笔记)、`tip` (提示)、`important` (重要)、`warning` (警告)、`caution` (注意)。

:::note
高亮用户应该注意的信息，即便是略读时。
:::

:::tip
帮助用户更成功的可选信息。
:::

:::important
用户成功所必须的关键信息。
:::

:::warning
需要用户立即注意的关键内容，因为存在潜在风险。
:::

:::caution
操作的潜在负面后果。
:::

### 基础语法

```markdown
:::note
高亮用户应该注意的信息，即便是略读时。
:::

:::tip
帮助用户更成功的可选信息。
:::
```

### 自定义标题

提示框的标题可以自定义。

:::note[我的自定义标题]
这是一个带有自定义标题的笔记。
:::

```markdown
:::note[MY CUSTOM TITLE]
This is a note with a custom title.
```

### GitHub 语法

> [!TIP]
> [GitHub 语法](https://github.com/orgs/community/discussions/16925) 也同样支持。

```
> [!NOTE]
> The GitHub syntax is also supported.

> [!TIP]
> The GitHub syntax is also supported.
```

### 剧透 (Spoiler)

你可以在文本中添加防剧透遮罩。文本也支持 **Markdown** 语法。

内容 :spoiler[被隐藏了 **ayyy**]!

```markdown
The content :spoiler[is hidden **ayyy**]!
