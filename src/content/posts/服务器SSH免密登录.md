---
title: 服务器SSH免密登录
published: 2025-12-29
description: ""
image: ""
tags: ["Linux","SSH"]
category: Linux
draft: false
pinned: false
lang: zh-CN
---
设置 SSH 免密登录（Key-based authentication）非常简单，分为两个步骤：**在 Windows 电脑上生成钥匙**，然后**把“公钥”放到服务器上**。

在Windows PowerShell中依次执行以下步骤：

### 第一步：在本地生成密钥对

1. 输入以下命令并按回车：
```powershell
ssh-keygen -t ed25519
```


2. **一路回车**即可：
* 遇到 `Enter file in which to save the key...`：直接回车（默认保存位置）。
* 遇到 `Enter passphrase...`（输入密码）：**直接回车**（留空表示不需要密码，这样才能免密）。
* 遇到 `Enter same passphrase again`：再次回车。


*成功后，电脑里就会有两个文件：`id_ed25519`（私钥，自己留着）和 `id_ed25519.pub`（公钥，给服务器）。*

### 第二步：把公钥上传到服务器

需要把刚才生成的**公钥**内容，写进服务器的 `~/.ssh/authorized_keys` 文件里。
在 PowerShell 中直接运行下面这行“魔法命令”即可（服务器 IP替换 自己的IP）：

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@服务器IP地址 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

* **解释**：这行命令会自动读取刚才生成的公钥，通过 SSH 登录服务器（这时还需要最后输一次密码），然后把公钥追加写入到服务器的授权列表中。

### 第三步：测试

现在，再次输入连接命令：

```powershell
ssh root@服务器IP地址
```

如果设置成功，这次应该**直接进去了**，不需要再输入密码。

---

### 如果上面的“魔法命令”报错（备用方案）

如果第二步命令执行失败，可以用**手动法**：

1. 在 PowerShell 里输入：`notepad $env:USERPROFILE\.ssh\id_ed25519.pub`
2. 记事本会打开，**复制**里面的所有内容（以 `ssh-ed25519` 开头的一长串）。
3. 用老方法登录服务器：`ssh root@服务器IP地址`
4. 在服务器里粘贴并运行这行命令（注意要在服务器里运行）：
```bash
mkdir -p ~/.ssh && echo "粘贴刚才复制的内容" >> ~/.ssh/authorized_keys
```


*(注意：保留引号，把中文部分替换成你复制的一长串字符)*