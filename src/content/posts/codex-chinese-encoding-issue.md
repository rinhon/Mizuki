---
title: Codex 中文乱码问题
published: 2025-12-29
alias: codex-chinese-encoding-issue
author: Rinhon
description: ""
image: ""
tags: []
category: Uncategorized
draft: false
pinned: false
lang: zh-CN
---

## 解决 Codex 修改文件后中文乱码问题：根源在终端编码！

> **关键词**：Codex、中文乱码、VS Code、PowerShell、UTF-8、终端编码、无 BOM

---

### 问题现象

使用 GitHub Copilot（或 Codex）修改包含中文的文件时，保存后打开发现**中文变成乱码**，比如：

```undefined
æˆ‘çˆ±ä¸­æ–‡ → 实际应为 “我爱中文”
```
**傻杯codex!!**

---

### 真正的根源

Codex 是通过**终端（Terminal）执行命令**（如 `echo`、`sed`、`PowerShell` 脚本等）来修改文件内容。

流程如下：

1. Codex 生成修改命令（例如 `Set-Content file.txt "你好"`）
2. 命令在 **终端中执行**
3. 终端以**当前编码**将字节写入文件
4. VS Code 读取文件 → 如果编码不匹配 → **乱码**

所以，**乱码的根本原因是：终端编码 ≠ 编辑器编码**。

---

### 解决方案：双端统一为 UTF-8

要彻底解决，必须同时配置：

1. **VS Code 使用 UTF-8**
2. **终端（PowerShell/CMD）默认使用 UTF-8**

---

### 第一步：配置 VS Code 为 UTF-8

打开 VS Code 设置（`Ctrl + ,`），切换到 `settings.json`，添加：

```json
{
"files.encoding": "utf8",
"files.autoGuessEncoding": true
}
```

- `"files.encoding": "utf8"`：默认以 UTF-8 保存文件
- `"files.autoGuessEncoding": true`：打开文件时自动检测编码（尤其对带 BOM 的文件友好）

> 确保 VS Code **读写一致**。

---

### 第二步：配置 PowerShell 终端为 UTF-8（重点！）

#### PowerShell升级最新版本

在终端运行：

```powershell
$PSVersionTable.PSVersion
```

- **5.x** → Windows 自带的 **Windows PowerShell**（旧版）
- **7.x** → **PowerShell 7+**（推荐升级）

> 强烈建议升级到 [PowerShell 7](https://aka.ms/powershell-release?tag=stable)，对 UTF-8 支持更好。

#### 找到 Profile 文件路径

```powershell
$PROFILE
```

常见路径：

- **Windows PowerShell 5.1**：  
    `C:\Users\<用户名>\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
- **PowerShell 7+**：  
    `C:\Users\<用户名>\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

#### 使用安全脚本配置 UTF-8（无 BOM）

> 注意：**不要用 `Add-Content -Encoding UTF8`**，它会写入 **带 BOM 的 UTF-8**，可能引发其他工具兼容问题。  
> 我们需要的是 **UTF-8 无 BOM**。

运行以下完整脚本（支持幂等、避免重复、兼容 Win7/10/11）：

```powershell
# Setup-UTF8PowerShellProfile.ps1
$utf8Config = @'
# 设置控制台使用 UTF-8 编码（无 BOM）
chcp 65001 | Out-Null
[Console]::InputEncoding  = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
# 设置默认文件操作编码为 UTF-8（无 BOM）
$PSDefaultParameterValues['Out-File:Encoding']    = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'utf8'
'@
# 创建目录（如果不存在）
$profileDir = Split-Path -Parent $PROFILE
if (-not (Test-Path $profileDir)) {
New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}
# 读取现有内容
$existing = if (Test-Path $PROFILE) { Get-Content $PROFILE -Raw } else { "" }
# 检查是否已配置（避免重复）
$hasConfig = $existing -match 'Console::OutputEncoding' -and
$existing -match '\$OutputEncoding' -and
$existing -match "PSDefaultParameterValues.*Out-File:Encoding"
if (-not $hasConfig) {
$newContent = if ($existing) { "$existing`r`n$utf8Config" } else { $utf8Config }
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)  # $false = 无 BOM
[System.IO.File]::WriteAllText($PROFILE, $newContent, $utf8NoBom)
Write-Host "✅ UTF-8 配置已写入 Profile！路径: $PROFILE" -ForegroundColor Green
} else {
Write-Host "ℹ️ UTF-8 已配置，跳过。" -ForegroundColor Cyan
}
# 立即生效
. $PROFILE
```

#### 4️⃣ 验证是否生效

```powershell
'中文测试' | Set-Content .\test.txt
Get-Content .\test.txt
```

如果输出 **“中文测试”** 而非乱码，说明配置成功！

---

### 第三步：其他终端的 UTF-8 配置（可选）

#### ️ Windows CMD

临时切换：

```cmd
chcp 65001
```

> ⚠️ 仅对当前窗口有效。不建议长期使用 CMD 处理中文，推荐改用 PowerShell。

#### Git Bash

编辑 `~/.bashrc`，添加：

```bash
export LANG="zh_CN.UTF-8"
export LC_ALL="zh_CN.UTF-8"
```

然后执行：

```bash
source ~/.bashrc
```

---

### 总结：乱码问题的终极解法

|组件|配置项|目的|
|---|---|---|
|**VS Code**|`"files.encoding": "utf8"`|编辑器读写统一为 UTF-8|
|**PowerShell**|Profile 中设置 Console + `$OutputEncoding` + `$PSDefaultParameterValues`|终端命令输出 UTF-8 无 BOM|
|**CMD**|`chcp 65001`（临时）|切换代码页为 UTF-8|
|**Git Bash**|`export LANG=zh_CN.UTF-8`|环境变量强制 UTF-8|

> ✅ 只要 **终端写入** 和 **编辑器读取** 都用 **UTF-8（无 BOM）**，Codex 修改中文文件就再也不会乱码！

---

### 附：为什么推荐 UTF-8 无 BOM？

- BOM（Byte Order Mark）在 Windows 记事本中常见，但 Linux/macOS 工具（如 `cat`、`grep`、Python）可能将其视为普通字符，导致解析错误。
- VS Code、Git、Node.js、Python 等现代工具**默认期望无 BOM 的 UTF-8**。
- 作为开发者，**统一使用 UTF-8 无 BOM 是最佳实践**。

https://www.cnblogs.com/gccbuaa/p/19227315