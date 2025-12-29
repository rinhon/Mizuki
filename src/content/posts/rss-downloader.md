---
title: RSS下载器
published: 2025-12-29
alias: rss-downloader
author: Rinhon
description: ""
image: ""
tags: ["rss","python"]
category: 动画
draft: false
pinned: false
lang: zh-CN
---

一个基于 Python 编写的 RSS 自动追番/下载工具，专门设计用于配合 qBittorrent 使用。它主要针对动漫资源站（代码逻辑中针对 "Mikan Project" 做了特定处理）进行自动化订阅、下载和整理。

以下是该脚本的详细功能描述：

核心功能
多 RSS 源监控

支持配置多个 RSS URL（RSS_URLS 列表），脚本会循环轮询这些源。
首次运行时会处理源中的所有条目（倒序），后续只处理新增条目。
qBittorrent 深度集成

使用 qbittorrent-api 库连接 qBittorrent WebUI。
自动将解析到的资源添加为下载任务。
智能去重：在添加任务前，不仅检查本地的历史记录（downloaded_torrents.json），还会实时查询 qBittorrent 中是否已存在同名或相似标题的任务，防止重复下载。
自动化文件管理

自动分类路径：根据 RSS 的标题（自动去除 "Mikan Project - " 前缀）在设定的 BASE_PATH 下创建对应的文件夹（例如：I:/动画2/番剧名称/Season 1）。
种子文件缓存：将下载的 .torrent 文件保存在本地 torrentDownLoad 目录中。
集数解析与自动重命名 (Renaming)

智能匹配季度：RSS_URL=[{"https://mikanani.me/","SEASON 1","EPISODES 1"}]表示，创建文件夹为season 1,下载集数是从1开始，下载的集数会自动递增。S01E01, S01E02, S01E03, S01E04, S01E05, S01E06, S01E07, S01E08, S01E09, S01E10, S01E11, S01E12, S01E13, S01E14, S01E15, S01E16, S01E17, S01E18, S01E19
智能解析：内置多种正则表达式，从复杂的资源标题中提取集数（支持 [01], - 01, EP01, S01E01 等格式）。
文件重命名：任务添加成功后，脚本会自动获取该种子内最大的文件（通常是视频本体），并将其重命名为标准化的 SxxExx 格式。这对于配合 Emby、Plex 或 Jellyfin 等媒体服务器非常有用。
过滤机制

支持关键词过滤（FILTER_KEYWORDS），例如代码中配置了过滤包含 "720" 的资源，只下载 1080p 或其他清晰度。
磁力链与网页解析

如果 RSS 提供的是网页链接而非直接的种子/磁力链，脚本会尝试请求该网页并从中提取 magnet: 链接。
工作流程
初始化：登录 qBittorrent，加载本地下载历史。
轮询：每隔设定时间（默认 300秒）检查一次所有 RSS 源。
解析与过滤：获取 RSS 条目，过滤掉不符合关键词或已下载的条目。
下载：下载 .torrent 文件或获取磁力链。
添加任务：推送到 qBittorrent，指定保存路径。
后期处理：获取新任务的 Hash，调用 API 重命名内部视频文件为 S01E{集数}。
记录：更新本地 JSON 数据库，记录已下载的 GUID 和集数信息。
适用场景
适合需要自动追更动画，并且希望下载后的文件能自动整理目录结构、统一文件命名以便于媒体库刮削的用户。