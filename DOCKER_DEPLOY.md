# Docker 镜像构建与推送指南

本文档记录了如何将本项目构建为 Docker 镜像并推送到指定的私有仓库。

## 目标仓库地址
`8.137.34.60:5000`

## 推送步骤

在项目根目录下执行以下命令：

### 1. 构建本地镜像
```powershell
docker build -t mizuki:latest .
```

### 2. 标记远程仓库标签
```powershell
docker tag mizuki:latest 8.137.34.60:5000/mizuki:latest
```

### 3. 推送到仓库
```powershell
docker push 8.137.34.60:5000/mizuki:latest
```

---

## 常见问题排查

### 1. 解决 HTTP/HTTPS 协议错误
如果推送时出现 `http: server gave HTTP response to HTTPS client`，请将该仓库地址添加到 Docker 的 `insecure-registries` 列表中：

1. 打开 **Docker Desktop** 设置。
2. 导航至 **Docker Engine**。
3. 在 JSON 配置中添加以下内容：
   ```json
   {
     "insecure-registries": ["8.137.34.60:5000"]
   }
   ```
4. 点击 **Apply & Restart**。

### 2. 验证推送结果
推送成功后，可以通过访问仓库的 API 来验证：
```bash
curl http://8.137.34.60:5000/v2/_catalog
```

---

## 自动部署 (Watchtower)

使用 Watchtower 可以监听私有仓库的更新，并自动拉取新镜像重启容器。

### 1. 服务器端配置
在**部署服务器**上，确保 Docker 允许不安全仓库连接。编辑 `/etc/docker/daemon.json`：
```json
{
  "insecure-registries": ["8.137.34.60:5000"]
}
```
重启 Docker: `sudo systemctl restart docker`

### 2. 启动应用
```bash
docker run -d --name mizuki -p 80:80 8.137.34.60:5000/mizuki:latest
```

### 3. 启动 Watchtower
```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --cleanup \
  --interval 60 \
  mizuki
```
* `--cleanup`: 更新后删除旧镜像
* `--interval 60`: 每 60 秒检查一次
* `mizuki`: 仅监听名为 mizuki 的容器

