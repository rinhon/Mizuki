---
title: MarkDown基本语法
published: 2025-12-29
alias: markdown-basic-syntax
author: Rinhon
description: ""
image: ""
tags: []
category: Uncategorized
draft: false
pinned: false
lang: zh-CN
---
# 一级标题 (#)
## 二级标题 (##)
### 三级标题 (###)
#### 四级标题 (####)
##### 五级标题 (#####)
###### 六级标题 (######)

**这是加粗文本** **(两个星号)**
*这是斜体文本* **(一个星号)**
***这是加粗并斜体*** **(三个星号)**
~~这是删除线文本~~**(三个波浪号)**
==这是高亮文本== (部分编辑器支持，如Typora/Obsidian) **(两个等号)**

## 无序列表

- 项目 A 
- 项目 B 
- 子项目 B-1 
- 子项目 B-2 
* 项目 C 
## 有序列表 
1. 第一步 
2. 第二步
	1. 第二步的细节 
	2. 第二步的细节
3. 第三步

## 任务
- [x] 已完成任务
- [ ] 未完成任务 
```markdown
- [x] 已完成任务
- [ ] 未完成任务
```
## 引用
> 这是一段引用文本用`>`。
> > 这是嵌套引用。
>
> 引用内的空行需要加 >。

```markdown
> 这是一段引用文本用`>`。
> > 这是嵌套引用。
>
> 引用内的空行需要加 >。
```
## 链接
[点击跳转到 Google](https://www.google.com)
```markdown
[文字](想要跳转的链接)
```

![这是一张图片的描述/Alt文本](https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png)
```markdown
![这是一张图片的描述/Alt文本](https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png)
```

带提示的链接：[把鼠标悬停这里](https://www.google.com "这是Title属性")
```markdown
[把鼠标悬停这里](https://www.google.com "这是Title属性")
```
