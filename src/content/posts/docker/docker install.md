---
title: docker
published: 2025-12-29
alias: docker
author: Rinhon
description: "docker 相关知识，方便查询"
image: "cover.svg"
tags:
  - Linux
  - docker
category:
draft: false
pinned: false
lang: zh-CN
---

## 安装docker

安装脚本：[官方脚本](https://get.docker.com/)


## docker 基础命令

### 镜像管理

- **拉取镜像**：`docker pull <镜像名>:<标签>`
- **查看本地镜像**：`docker images`
- **删除镜像**：`docker rmi <镜像ID>`
- **构建镜像**：`docker build -t <镜像名>:<标签> .`
- **导出镜像**：`docker save -o <文件名>.tar <镜像名>:<标签>`
- **载入镜像**：`docker load -i <文件名>.tar`
- **修改镜像标签**：`docker tag <源镜像>:<旧标签> <新镜像>:<新标签>`

### 容器生命周期管理

- **运行容器**：`docker run [选项] <镜像名>`
    - `-d`: 后台运行容器。
    - `-p <宿主机端口>:<容器端口>`: 端口映射。
    - `-v <宿主机路径>:<容器路径>`: 挂载数据卷。
    - `--network <网络名>`: 指定容器加入的网络。
    - `--name <容器名>`: 为容器指定名称。
    - `-it`: 以交互模式运行（通常用于进入 shell）。
- **查看正在运行的容器**：`docker ps`
- **查看所有容器**：`docker ps -a`
- **停止容器**：`docker stop <容器ID/名>`
- **启动容器**：`docker start <容器ID/名>`
- **重启容器**：`docker restart <容器ID/名>`
- **删除容器**：`docker rm <容器ID/名>`（运行中的容器需先停止或使用 `-f` 强制删除）。

### 运维常用命令

- **查看容器日志**：`docker logs -f <容器ID/名>`
- **进入容器内部**：`docker exec -it <容器ID/名> /bin/bash` (或 `sh`)
- **查看容器详细信息**：`docker inspect <容器ID/名>`
- **查看资源占用情况**：`docker stats`
- **清理无用的镜像/容器/网络**：`docker system prune`

### 网络管理

- **查看网络列表**：`docker network ls`
- **创建网络**：`docker network create <网络名>`
- **删除网络**：`docker network rm <网络ID/名>`
- **查看网络详情**：`docker network inspect <网络ID/名>`
- **将容器连接到网络**：`docker network connect <网络名> <容器名>`
- **将容器从网络断开**：`docker network disconnect <网络名> <容器名>`

## 如何删除镜像

>1. 首先查看镜像列表，确认名字或 ID：
>>```bash
>>docker images
>>```
>>在列表中找到那个想要卸载的镜像。
>2. 使用 `docker rmi` 命令删除：
>>可以通过 名字:标签 删除：
>>```bash
>>docker rmi amd64/eclipse-temurin:21-alpine-3.23
>>```
>>或者通过 IMAGE ID 删除（最准确）：
>>```bash
>>docker rmi <镜像ID>
>>```
