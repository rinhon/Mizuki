# Docker 私有仓库部署与故障排查总结

## 1. 核心概念：仓库 (Registry) vs 本地镜像
*   **Registry (私有仓库)**：运行在服务器 5000 端口的容器。它是一个**存储服务端**（类似网盘）。
*   **Docker Images (本地镜像)**：机器上已下载安装的镜像。
*   **误区**：`docker push` 成功后，镜像存在于“网盘”中，但在服务器本地运行 `docker images` 是看不到的，必须通过 `docker pull` 或 `docker run` 下载下来。

## 2. 遇到的坑与解决方案

### 问题 A：构建失败 (Build Failed)
*   **现象**：`git: not found` 或 `mkdir` 错误。
*   **原因**：
    1.  基础镜像 `node:lts-slim` 精简掉了 git，但同步脚本需要它。
    2.  `sync-content.js` 处理损坏的符号链接（Broken Symlinks）逻辑有误。
*   **解决**：
    *   **Dockerfile**：添加 `RUN apt-get update && apt-get install -y git`。
    *   **JS 脚本**：修复 `fs.unlinkSync` 逻辑，增加 `try-catch` 和 `lstatSync` 检查。

### 问题 B：HTTPS 协议报错 (HTTP response to HTTPS client)
*   **现象**：推送或拉取时报错 `http: server gave HTTP response to HTTPS client`。
*   **原因**：Docker 默认强制安全连接 (HTTPS)，而私有仓库搭建在 HTTP 上。
*   **解决**：**客户端（开发机）和服务器端都需要配置信任白名单。**

#### Windows 开发机配置
1.  Docker Desktop -> Settings -> Docker Engine。
2.  添加配置：
    ```json
    "insecure-registries": ["8.137.34.60:5000"]
    ```

#### Linux 服务器配置
1.  编辑文件：`nano /etc/docker/daemon.json`
2.  添加配置：
    ```json
    {
      "insecure-registries": ["8.137.34.60:5000"]
    }
    ```
3.  重启服务：`systemctl restart docker`

---

## 3. 标准部署流程 (Cheat Sheet)

### 第一步：本地构建与推送 (Windows)
```powershell
# 1. 构建镜像
docker build -t mizuki:v1.0.0 .

# 2. 打标签 (指向远程仓库)
docker tag mizuki:v1.0.0 8.137.34.60:5000/mizuki:v1.0.0

# 3. 推送至私有仓库
docker push 8.137.34.60:5000/mizuki:v1.0.0
```

### 第二步：服务器运行 (Linux)
*首次部署需要手动运行，之后可用 Watchtower 自动更新。*

```bash
# 运行应用 (自动拉取)
docker run -d --name mizuki -p 80:80 8.137.34.60:5000/mizuki:v1.0.0

# (可选) 启动自动更新守护进程 Watchtower
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --cleanup \
  --interval 60 \
  mizuki
```

## 4. 常用验证命令
*   **查看私有仓库里的镜像**：
    `curl http://8.137.34.60:5000/v2/_catalog`
*   **查看镜像的具体标签**：
    `curl http://8.137.34.60:5000/v2/mizuki/tags/list`

```