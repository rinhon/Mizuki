---
title: 文件夹设置图片封面
published: 2025-12-29
alias: set-folder-picture-cover
author: Rinhon
description: ""
image: ""
tags: ["powershell","ImageMagick"]
category: 漫画
draft: false
pinned: false
lang: zh-CN
---
    个人需求，没啥好用的漫画阅读器，有个叫`Rulia`的我还蛮喜欢，但是作者创业去了，好久没更新了，读取文件夹图片的功能一直没有，有个连`kavita`的插件，试了下，压根连不上。就想直接改文件夹图标不就直接当书架了吗。有个能改压缩包封面的工具，不太符合我喜欢解压看的需求.
    所以决定自己写个脚本替换文件夹封面，集成到右键,使用 PowerShell 结合 ImageMagick 处理此类任务，因为 ImageMagick 的命令行处理图片能力极强，而 PowerShell 能很好地与 Windows 系统交互。

### 前置准备

1. **安装 ImageMagick**: 脚本依赖 `magick` 命令。
    - 前往 [ImageMagick官网](https://www.google.com/search?q=https://imagemagick.org/script/download.php%23windows) 下载 Windows 版本（建议下载 `ImageMagick-x.x.x-Q16-HDRI-x64-dll.exe` [点击下载](https://imagemagick.org/archive/binaries/ "版本 ImageMagick-7.1.2-11-Q16-HDRI-x64-dll.exe")。
    - **关键步骤**：安装时务必勾选 **"Install legacy utilities (e.g. convert)"** 和 **"Add application directory to your system path"**，确保在终端能直接运行 `magick`。

---

### 第一步：主逻辑脚本 (`Set-FolderCover.ps1`)

在任意位置（建议固定目录，如 `C:\Scripts\FolderCover`）创建一个名为 `Set-FolderCover.ps1` 的文件，并粘贴以下代码。
这个脚本实现了：
1. 自动判断输入是文件夹还是图片。
2. 调用 ImageMagick 进行 **中心 1:1 剪切**（保留最大尺寸）。
3. 生成隐藏的 `folder.jpg` 并设置文件夹属性。
4. 错误捕获并记录到文档文件夹。
```powershell
param (
    [string]$TargetItem
)

# --- 配置部分 ---
$ErrorLogPath = [System.IO.Path]::Combine([Environment]::GetFolderPath("MyDocuments"), "FolderCover_ErrorLog.txt")
$ImageExtensions = @(".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff")

# --- 函数定义 ---

function Write-Log {
    param ([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] $Message"
    Add-Content -Path $ErrorLogPath -Value $LogEntry -Encoding UTF8
}

function Set-CoverImage {
    param (
        [string]$FolderPath,
        [string]$SourceImagePath
    )

    try {
        if (-not (Test-Path $SourceImagePath)) { return }

        $DestPath = Join-Path -Path $FolderPath -ChildPath "folder.jpg"

        # 1. 移除旧封面属性（如果存在），以便覆盖
        if (Test-Path $DestPath) {
            Set-ItemProperty -Path $DestPath -Name Attributes -Value "Normal" -ErrorAction SilentlyContinue
            Remove-Item -Path $DestPath -Force -ErrorAction SilentlyContinue
        }

        # 2. 使用 ImageMagick 处理图片
        # 逻辑：-gravity center 居中
        # -extent "%[fx:w<h?w:h]x%[fx:w<h?w:h]"  设置画布大小为宽和高中较小的那一边（即生成正方形），多余部分自动被剪切
        $magickCmd = "magick"
        $argsList = @(
            "`"$SourceImagePath`"", 
            "-gravity", "center", 
            "-extent", "`"%[fx:w<h?w:h]x%[fx:w<h?w:h]`"", 
            "`"$DestPath`""
        )
        
        # 执行命令
        $process = Start-Process -FilePath $magickCmd -ArgumentList $argsList -WindowStyle Hidden -Wait -PassThru
        
        if ($process.ExitCode -ne 0) {
            throw "ImageMagick处理失败，退出代码: $($process.ExitCode)"
        }

        # 3. 设置系统属性
        # folder.jpg 设为 隐藏 + 系统
        $file = Get-Item $DestPath
        $file.Attributes = "Hidden, System"

        # 文件夹设为 只读 (触发 Windows 渲染 folder.jpg 的必要条件)
        $folder = Get-Item $FolderPath
        $folder.Attributes = "ReadOnly"

        # 4. 创建/更新 desktop.ini 以刷新缓存 (可选，增强稳定性)
        $iniPath = Join-Path -Path $FolderPath -ChildPath "desktop.ini"
        if (Test-Path $iniPath) {
            Set-ItemProperty -Path $iniPath -Name Attributes -Value "Normal" -ErrorAction SilentlyContinue
        }
        # 写入简单的 Logo 配置
        "[.ShellClassInfo]`r`nLogo=folder.jpg" | Out-File $iniPath -Encoding ascii -Force
        Set-ItemProperty -Path $iniPath -Name Attributes -Value "Hidden, System"

    }
    catch {
        Write-Log "处理错误 [$FolderPath]: $_"
    }
}

function Find-FirstImage {
    param ([string]$Path)
    try {
        $images = Get-ChildItem -Path $Path -File | Where-Object { 
            $ImageExtensions -contains $_.Extension.ToLower() -and $_.Name -ne "folder.jpg" 
        }
        if ($images) {
            # 如果有多张，返回第一张
            if ($images -is [array]) { return $images[0].FullName }
            return $images.FullName
        }
    }
    catch {
        Write-Log "寻找图片错误 [$Path]: $_"
    }
    return $null
}

# --- 主逻辑 ---

try {
    # 移除路径引号（如果由注册表传入包含引号）
    $TargetItem = $TargetItem.Trim('"')

    if (Test-Path $TargetItem -PathType Container) {
        # === 情况 1: 选中了文件夹 ===
        $img = Find-FirstImage -Path $TargetItem
        if ($img) {
            Set-CoverImage -FolderPath $TargetItem -SourceImagePath $img
        } else {
            Write-Log "警告: 文件夹中未找到图片 - $TargetItem"
        }
    }
    elseif (Test-Path $TargetItem -PathType Leaf) {
        # === 情况 2: 选中了文件 (判断是否为图片) ===
        $ext = [System.IO.Path]::GetExtension($TargetItem).ToLower()
        if ($ImageExtensions -contains $ext) {
            $parentDir = [System.IO.Path]::GetDirectoryName($TargetItem)
            Set-CoverImage -FolderPath $parentDir -SourceImagePath $TargetItem
        }
    }
}
catch {
    Write-Log "致命错误: $_"
}
```

---

### 第二步：注册脚本 (`Register-RightClick.ps1`)

将此脚本放在与 `Set-FolderCover.ps1` **相同的目录**下。右键运行它即可将功能添加到菜单。

这个脚本会自动获取当前路径，写入注册表。它会注册两个位置：
1. `Directory` (右键文件夹)
2. `SystemFileAssociations\image` (右键图片文件)
```powershell
# 必须以管理员身份运行
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    Exit
}

# 获取当前脚本所在目录作为基准
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$TargetScript = Join-Path -Path $ScriptDir -ChildPath "Set-FolderCover.ps1"

# 检查目标脚本是否存在
if (-not (Test-Path $TargetScript)) {
    Write-Host "错误：找不到 Set-FolderCover.ps1，确保两个脚本在同一目录下。" -ForegroundColor Red
    Pause
    Exit
}

# 检查 ImageMagick 是否安装
try {
    $ver = magick -version
    Write-Host "检测到 ImageMagick 已安装。" -ForegroundColor Green
} catch {
    Write-Host "警告：未检测到 'magick' 命令。确保安装了 ImageMagick 并添加到了系统环境变量 PATH 中。" -ForegroundColor Yellow
    Write-Host "脚本可能无法正常工作。" -ForegroundColor Yellow
    Pause
}

$MenuText = "设置纯图封面 (1:1)"
$IconPath = "imageres.dll,-68" # 使用系统图标，也可以换成具体的 .ico 路径

# 定义注册表操作函数
function Register-Menu {
    param (
        [string]$RegPath,
        [string]$MenuName
    )
    
    $KeyPath = "Registry::HKEY_CLASSES_ROOT\$RegPath\shell\SetFolderCover"
    $CommandPath = "$KeyPath\command"

    # 创建主键
    if (-not (Test-Path $KeyPath)) { New-Item -Path $KeyPath -Force | Out-Null }
    Set-ItemProperty -Path $KeyPath -Name "(default)" -Value $MenuName
    Set-ItemProperty -Path $KeyPath -Name "Icon" -Value $IconPath

    # 创建命令键
    if (-not (Test-Path $CommandPath)) { New-Item -Path $CommandPath -Force | Out-Null }
    
    # 命令逻辑：调用 PowerShell 运行脚本，-WindowStyle Hidden 隐藏黑框
    $Command = "pwsh.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$TargetScript``" `"%1`""
    
    # 如果没有 pwsh (PowerShell 7)，回退到 powershell (系统自带)
    if (-not (Get-Command pwsh -ErrorAction SilentlyContinue)) {
        $Command = "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$TargetScript``" `"%1`""
    }

    Set-ItemProperty -Path $CommandPath -Name "(default)" -Value $Command
}

try {
    Write-Host "正在注册右键菜单..."
    
    # 1. 注册到文件夹右键
    Register-Menu -RegPath "Directory" -MenuName $MenuText
    
    # 2. 注册到所有图片格式右键
    Register-Menu -RegPath "SystemFileAssociations\image" -MenuName "设为当前文件夹封面 (1:1)"

    Write-Host "注册成功！" -ForegroundColor Cyan
    Write-Host "现在你可以右键文件夹或图片使用了。"
}
catch {
    Write-Host "注册失败：$_" -ForegroundColor Red
}

Pause
```

### 使用指南

1. **准备环境**：
    - 确保已安装 **ImageMagick** 并添加到了 PATH。
    - 将上述两个脚本保存在同一文件夹中，例如 `D:\Tools\FolderCover\`。
2. **安装**：
    - 右键点击 `Register-RightClick.ps1`，选择 **"使用 PowerShell 运行"**。
    - 脚本会自动求管理员权限，确认即可。
3. **使用**：
    - **文件夹**：右键点击文件夹，选择“设置纯图封面 (1:1)”。
    - **图片**：进入文件夹，右键点击想要作为封面的图片，选择“设为当前文件夹封面 (1:1)”。
    - **批量操作**：选中多个文件夹，右键选择菜单，Windows 会自动逐个执行脚本。
4. **查看结果**：
    - 如果封面没有立即更新，按 `F5` 刷新，或等待几秒钟（Windows 缩略图缓存可能有延迟）。
5. **排查错误**：
    - 如果没反应，打开 `文档` 文件夹，查看 `FolderCover_ErrorLog.txt`。

### 关于 ImageMagick 命令的特别说明

脚本中使用的核心命令是：

```powershell
magick "input.jpg" -gravity center -extent "%[fx:w<h?w:h]x%[fx:w<h?w:h]" "folder.jpg"
```

- `%[fx:w<h?w:h]`：这是 ImageMagick 的内建计算功能。它比较宽 (`w`) 和高 (`h`)，取较小的一个值。
- `-extent`：将画布调整为计算出的正方形大小。
- `-gravity center`：配合 `extent`，确保保留图片最中心的部分，切除四周多余的部分。
- 这完美符合你要求的 **“图片中心剪切、长宽比 1:1、图片尽量大”**。