---
title: ADB 环境配置与常用安装参数
published: 2025-12-30
alias: adb
author: Rinhon
description: "记录 Windows 下 ADB 的基础环境配置、USB 调试开启方式，以及安装 APK 时常用参数的含义。"
# image: ""
tags:
  - Android
  - ADB
  - Windows
category: 学习技术
draft: false
pinned: false
lang: zh-CN
---

###  **PC端配置 ADB 环境**：
- 前往 Android 开发者官网下载 `SDK Platform-Tools`，解压并将路径添加到系统环境变量中（或者直接在解压后的文件夹内打开命令行窗口）。
### **手机端开启“USB 调试”**：
- 进入手机 `设置` -> `关于手机` -> 连续点击 `版本号` 7次，直到提示进入开发者模式。
- 返回 `设置` -> `系统` -> `开发者选项` -> 开启 **USB 调试**。
### **连接与授权**：
- 用数据线将手机连接至电脑。
- 打开电脑终端（CMD 或 PowerShell），输入以下命令检查连接：   
 ```powershell
adb devices
 ```
 **注意**：如果是首次连接，手机上会弹出“允许 USB 调试吗？”的弹窗，请勾选“一律允许”并点击**确定**。
 当终端显示 `device` 字样时（如 `List of devices attached: xxxxx device`），表示连接成功。

| **参数** | **作用**        | **适用场景**                                                           |
| ------ | ------------- | ------------------------------------------------------------------ |
| **-r** | Replace（替换）   | **更新 APP** 时使用，保留原有的数据和缓存。                                         |
| **-t** | Test（测试）      | 安装包含 `android:testOnly="true"` 属性的开发版 APK（常见于 Android Studio 调试包）。 |
| **-d** | Downgrade（降级） | 允许安装比当前版本更旧的版本（仅部分安卓版本支持，通常需要卸载重装）。                                |
| **-g** | Grant（授权）     | 安装时自动授予所有运行时权限（如果不加此项，打开 APP 时会询问权限）。                              |
| **-s** | Serial（序列号）   | 当连接了多台设备时，指定安装到某一台：`adb -s <设备序列号> install <apk>`                  |
