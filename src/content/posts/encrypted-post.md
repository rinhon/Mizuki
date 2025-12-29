---
title: 加密文章
published: 2024-01-15
description: 这是一篇用于测试页面加密功能的文章
image: ""
tags: ["测试", "加密"]
category: "技术"
draft: false
pinned: false
lang: zh-CN
encrypted: true
password: "123456"
alias: "encrypted-example"
---

此博客模板基于 [Astro](https://astro.build/) 构建。对于本指南中未提及的内容，你可以在 [Astro 文档](https://docs.astro.build/)中找到答案。

## 文章的 Front-matter

```yaml
---
title: 我的第一篇博客文章
published: 2023-09-09
description: 这是我的新 Astro 博客的第一篇文章。
image: ./cover.jpg
tags: [Foo, Bar]
category: 前端
draft: false
---
```

| 属性 | 描述 |
|---|---|
| `title` | 文章标题。 |
| `published` | 文章发布日期。 |
| `pinned` | 是否将此文章固定在文章列表顶部。 |
| `description` | 文章简述。显示在首页。 |
| `image` | 文章封面图片路径。<br/>1. 以 `http://` 或 `https://` 开头：使用网络图片<br/>2. 以 `/` 开头：使用 `public` 目录下的图片<br/>3. 不带前缀：相对于 markdown 文件的路径 |
| `tags` | 文章标签。 |
| `category` | 文章分类。 |
| `alias` | 文章别名。文章将可以通过 `/posts/{alias}/` 访问。例如：`my-special-article` (将可以通过 `/posts/my-special-article/` 访问) |
| `licenseName` | 文章内容的许可证名称。 |
| `author` | 文章作者。 |
| `sourceLink` | 文章内容的来源链接或参考。 |
| `draft` | 如果此文章仍是草稿，则不会显示。 |

## 文章文件放置位置

你的文章文件应放置在 `src/content/posts/` 目录下。你也可以创建子目录来更好地组织文章和资源。

```
src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.png
    └── index.md
```

## 文章别名

你可以通过在 front-matter 中添加 `alias` 字段来为任何文章设置别名：

```yaml
---
title: 我的特别文章
published: 2024-01-15
alias: "my-special-article"
tags: ["示例"]
category: "技术"
---
```

设置别名后：
- 文章将可以通过自定义 URL 访问 (例如 `/posts/my-special-article/`)
- 默认的 `/posts/{slug}/` URL 仍然有效
- RSS/Atom 订阅源将使用自定义别名
- 所有内部链接将自动使用自定义别名

**重要提示：**
- 别名不应包含 `/posts/` 前缀 (会自动添加)
- 别名中避免使用特殊字符和空格
- 为了最佳 SEO 实践，请使用小写字母和连字符
- 确保别名在所有文章中是唯一的
- 不要包含前导或尾随斜杠

## 工作原理

```mermaid
graph LR
    A[用户密码] --> B[bcrypt 哈希]
    B --> C[密码哈希]
    C --> D[提取前 32 个字符]
    D --> E[加密密钥]
    E --> F[AES 加密]
    F --> G[加密内容]
```