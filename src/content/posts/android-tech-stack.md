---
title: Android 学习
published: 2025-12-29
alias: android-tech-stack
author: Rinhon
description: ""
image: ""
tags: ["Android","Kotlin"]
category: 学习技术
draft: false
pinned: false
lang: zh-CN
---
# Koin 与 Spring IOC
**宏观上来说，Koin 在 Android/Kotlin 开发中的角色，完全等同于 Spring 在 Java 后端开发中的 IoC（控制反转）容器的角色。**

它们的目的都是为了解决同一个问题：**依赖注入（Dependency Injection, DI）**，即解耦对象的创建和使用。

不过，虽然**目的**一样，但它们的**实现原理**和**使用哲学**有很大的不同。理解这些区别对于从 Spring 转到 Koin 非常有帮助。

### 1. 核心概念对应表

如果熟悉 Spring，可以这样直接对应 Koin 的概念：

| **概念**   | **Spring (后端)**                  | **Koin (Android/Kotlin)** | **说明**       |
| -------- | -------------------------------- | ------------------------- | ------------ |
| **容器**   | `ApplicationContext`             | `KoinApplication`         | 存放所有对象的地方    |
| **单例**   | `@Component` / `@Service` (默认单例) | `single { }`              | 全局只有一份实例     |
| **多例**   | `@Scope("prototype")`            | `factory { }`             | 每次求都创建一个新实例 |
| **获取依赖** | `@Autowired`                     | `get()` / `by inject()`   | 自动找到并注入需要的对象 |
| **配置**   | `@Configuration` + `@Bean`       | `module { }`              | 定义对象如何创建的地方  |
| **初始化**  | `SpringApplication.run(...)`     | `startKoin { ... }`       | 启动容器         |

---

### 2. 核心区别 (重要)

虽然角色一样，但 Koin 并不是“Spring 的微缩版”，它们的技术路线完全不同：
#### A. 实现原理：反射 vs DSL (Service Locator)
- **Spring IoC (魔法):** 极其依赖 **反射 (Reflection)** 和 **注解处理**。启动时，Spring 会扫描整个 ClassPath，解析 `@Autowired`，在运行时动态生成代理对象。
    - _优点_：写起来很爽，全自动。
    - _缺点_：启动慢，内存占用高（这对服务器不是问题，但对 Android 是大忌）。
- **Koin (朴素):** 几乎**不使用反射**（或者极少使用）。它本质上是一个 **Service Locator（服务定位器）** 模式，封装了一层漂亮的 Kotlin DSL。
    - 它的原理其实就是一个巨大的 `Map<Class, Function>`。当调用 `get()` 时，它只是去 Map 里找到对应的函数执行一下。
    - _优点_：启动极快，轻量级，没有代码生成。
    - _缺点_：需要手动写 `module` 配置，没有 Spring 那么“智能”。
#### B. 依赖解析时机：启动报错 vs 运行时报错
- **Spring:** 如果少注入了一个 Bean，Spring 通常在**启动时**就会崩溃报错 (`ApplicationContextException`)，告诉缺东西。
- **Koin:** 这是 Koin 最大的痛点。因为它是动态查找的，如果配置里忘写了某个 Bean，App 启动时可能不会报错，直到代码运行到 `get()` 那一行时，才会抛出运行时异常 (`NoBeanDefFoundException`) 导致 **Crash**。
    - _注：Koin 提供了 `checkModules` 测试工具来缓解这个问题，但不如 Spring 和 Dagger/Hilt 那样严格。_
#### C. 写法风格：注解 vs 代码
- **Spring:** 声明式。在类头上加 `@Service`，Spring 自动把它加入容器。
- **Koin:** 编程式。必须在一个 `module` 文件里显式地写出来 `single { MyService(get()) }`。这让对对象的创建过程有 100% 的控制权。
---
### 3. 代码对比
**Spring 的写法：**
```java
@Service // 1. 自动注册
class UserRepository {}

@Service
class UserViewModel {
    @Autowired // 2. 自动注入 (魔法)
    lateinit var repo: UserRepository
}
```

**Koin 的写法：**
```kotlin
class UserRepository // 普通类，无需注解

class UserViewModel(val repo: UserRepository) // 普通类

// 必须手动配置 Module
val appModule = module {
    single { UserRepository() } // 注册单例
    // 手动告诉 Koin 怎么构造 ViewModel，get() 会自动去找上面的 UserRepository
    viewModel { UserViewModel(get()) } 
}
```

### 总结

可以把 **Koin 看作是“手动挡”的 Spring IoC**。
- **Spring** 像是一个**全自动管家**：给东西贴上标签（注解），它自动帮扫描、整理、送货。
- **Koin** 像是一个**精准的配置清单**：用 Kotlin 代码写好清单（Module），告诉它谁依赖谁。虽然多写了一点点配置代码，但它换来了 Android 平台上极致的轻量和启动速度。

在 Android 上，Koin 是目前除了 Google 官方推荐的 Hilt (Dagger) 之外，最流行的依赖注入框架。

---
# Retrofit 与 OpenFeign
**Retrofit 在 Android/Kotlin 开发中的地位，相当于 Spring Cloud 中的 `OpenFeign`（或者 Spring 6 推出的 `@HttpExchange` 声明式客户端）。**
如果只看核心功能，它也相当于 Spring 中的 **`RestTemplate`** 或 **`WebClient`**，但 Retrofit 的**使用方式**（声明式接口）和 `OpenFeign` 几乎一模一样。

它是 Android 平台上**事实标准**的网络求库。
### 1. 核心概念对应表

| **概念**   | **Spring (后端)**                         | **Android (Retrofit)**                   | **说明**                     |
| -------- | --------------------------------------- | ---------------------------------------- | -------------------------- |
| **角色**   | HTTP 客户端                                | HTTP 客户端                                 | 用来发起网络求，调用后端 API          |
| **写法风格** | **OpenFeign** (声明式接口)                   | **Retrofit** (声明式接口)                     | 定义一个 Interface，不用写具体求代码   |
| **底层引擎** | Apache HttpClient / OkHttp / Netty      | **OkHttp**                               | 真正负责建立 TCP 连接、发数据的底层苦力     |
| **数据解析** | Jackson (默认)                            | Gson / Moshi / Jackson                   | 自动把 JSON 转成 Java/Kotlin 对象 |
| **异步处理** | CompletableFuture / Reactor (Mono/Flux) | **Kotlin Coroutines (suspend)** / RxJava | 处理网络求的耗时操作                |

---

### 2. 为什么说它像 OpenFeign？
在传统的 Java/Spring (如 `RestTemplate`) 中，可能这样写代码：
```java
// Spring RestTemplate (命令式写法，比较繁琐)
String url = "https://api.example.com/users/1";
User user = restTemplate.getForObject(url, User.class);
```

但在 **Retrofit** 和 **Spring Cloud OpenFeign** 中，只需要**定义接口**，不需要写实现类。
**Retrofit 的写法 (Kotlin):**
```kotlin
// 1. 定义接口
interface ApiService {
    @GET("users/{id}") // 声明 HTTP 方法和路径
    suspend fun getUser(@Path("id") id: String): User // 声明参数和返回值
}

// 2. 创建实例 (通常在 Koin Module 里做)
val api = retrofit.create(ApiService::class.java)

// 3. 调用 (像调用本地方法一样)
val user = api.getUser("123") 
```

**Spring Cloud OpenFeign 的写法:**
```java
// 1. 定义接口
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}") // 声明 HTTP 方法和路径
    User getUser(@PathVariable("id") String id);
}

// 2. 注入并调用
@Autowired
UserClient userClient;
// ...
userClient.getUser("123");
```

看到相似之处了吗？它们都是**把 HTTP API 映射成 Java/Kotlin 接口方法**。

---

### 3. Retrofit 的“三驾马车”

理解 Retrofit，要理解它背后的三个核心组件，这在的 `retrofitConfiguration` 代码中通常会看到：

1. **Retrofit (外壳/导演):**
    - 它本身**不发送网络求**。
    - 它的作用是利用**动态代理**，把定义的 `Interface` 方法翻译成 HTTP 求，然后交给底层去发。
2. **OkHttp (引擎/苦力):**
    - 这是 Retrofit 默认的底层核心。
    - 真正负责 DNS 解析、TCP 握手、TLS 加密、HTTP/2 连接池、重试逻辑的，都是 OkHttp。
    - _Spring 也可以配置使用 OkHttp 作为底层引擎。_
3. **Converter (翻译官):**
    - 服务器返回的是 JSON 字符串，的代码需要的是 `User` 对象。
    - Retrofit 需要配置 `ConverterFactory`（如 GsonConverterFactory 或 MoshiConverterFactory）来自动完成这个转换。
### 4. 配合 Kotlin 协程 (绝杀技)

Retrofit 之所以现在在 Android 上处于统治地位，很大程度上是因为它对 **Kotlin Coroutines (协程)** 的支持是原生的。
在以前（Java 时代），网络求是异步的，我们需要写回调地狱：

```java
// 旧时代的 Retrofit (Java Callbacks)
api.getUser("123").enqueue(new Callback<User>() {
    @Override
    public void onResponse(...) {
        // 成功
    }
    @Override
    public void onFailure(...) {
        // 失败
    }
});
```
现在（Kotlin 时代），只需要加一个 `suspend` 关键字，代码就变成了同步的写法（但实际上是非阻塞异步运行）：
Kotlin
```
// 现代 Retrofit + 协程
try {
    // 这行代码会挂起，直到网络求回来，但不会卡死 UI 线程
    val user = api.getUser("123") 
    textView.text = user.name // 直接更新 UI
} catch (e: Exception) {
    // 处理错误
}
```

### 总结

- **Retrofit** 就是 Android 界的 **OpenFeign**。
- 它负责把的后端 API 变成简单的 Kotlin 接口。
- 它帮处理了 URL 拼接、参数编码、JSON 解析等繁琐工作。
- 它通常配合 **OkHttp** (底层) 和 **Koin** (依赖注入) 一起使用。
# Context
**`android.content.Context` 是 Android 开发中的“上帝对象”（God Object）。**

如果要用 Spring/后端开发的思维来理解它，它相当于 **Spring 的 `ApplicationContext` + Servlet 的 `ServletContext` + `HttpServletRequest` 的混合体**。
在 Android 中，几乎所有和**系统**打交道的操作，都必须通过 `Context`。

---

### 1. 核心概念对应表

| **概念**    | **Spring / Java Web (后端)**             | **Android (Context)**        | **说明**                 |
| --------- | -------------------------------------- | ---------------------------- | ---------------------- |
| **环境上下文** | `ServletContext` / `SpringApplication` | `Application Context`        | 全局的，伴随应用一生。            |
| **求上下文** | `HttpServletRequest`                   | `Activity Context`           | 局部的，只跟随当前页面（屏幕）存在。     |
| **资源获取**  | `ClassPathResource` / `ResourceLoader` | `Context.getResources()`     | 获取图片、字符串、颜色、布局文件。      |
| **系统服务**  | 无直接对应 (通常是 OS 级 API)                   | `Context.getSystemService()` | 获取 WiFi、蓝牙、定位、震动等硬件服务。 |
| **文件操作**  | `new File("path")`                     | `Context.getFilesDir()`      | 获取应用私有的沙盒文件路径。         |

---

### 2. 为什么它这么重要？

在纯 Java/Kotlin 后端代码中，想要创建一个对象，直接 `new` 就可以：
```kotlin
val file = File("path") // 后端可以直接访问文件系统
```

但在 Android 中，应用是运行在**沙盒（Sandbox）里的。的代码没有权限直接操作硬件或系统资源。`Context` 就是那个拥有权限的“中间人”或“句柄”。**

不能凭空做以下事情，必须通过 `Context`：
- **加载资源**：不能直接读 `res/values/strings.xml`，必须 `context.getString(R.string.app_name)`。
- **启动组件**：不能直接 `new Activity()`，必须 `context.startActivity(intent)`。
- **发送广播**：必须 `context.sendBroadcast(intent)`。
- **访问数据库**：SQLite 需要 `Context` 来定位数据库文件路径。

### 3. 最容易踩的坑：两种 Context 的区别
这是 Android 新手（尤其是后端转过来）最容易导致 **内存泄漏 (Memory Leak)** 的地方。
#### A. Application Context (全局)
- **生命周期**：极长。应用启动它就在，应用杀掉它才死。
- **获取方式**：`applicationContext` 或 `context.applicationContext`。
- **Spring 类比**：**Singleton Bean** 或 `ServletContext`。
- **适用场景**：全局单例工具类（如 `Retrofit` 管理类、`Database` 实例、`Koin` 初始化）。
#### B. Activity Context (局部)
- **生命周期**：很短。用户关掉页面、或者**旋转屏幕**，它就销毁了。
- **获取方式**：在 Activity 代码里直接用 `this`。
- **Spring 类比**：**Request Scope Bean** 或 `HttpServletRequest`。
- **适用场景**：**UI 操作**。比如弹出一个 `Dialog`，或者加载一个布局。
    - _原因：Activity Context 包含当前屏幕的主题（Theme）和样式信息，用它显示的 UI 才会好看。用 Application Context 弹窗可能会报错或样式丑陋。_

---
### 4.Context
回到之前的代码片段：
```kotlin
// 这里 this@MainActivity 就是一个 Activity Context
ShareService.bootstrap(this@MainActivity) 

// 这里 LocalContext.current 也是获取当前的 Activity Context
val context = LocalContext.current 
```

潜在风险分析：
如果 ShareService 是一个单例（Singleton）（看起来像，因为它有 bootstrap 方法），而把 this@MainActivity（Activity Context）传给了它，并且 ShareService 在内部用一个变量一直持有这个 Context。
那就发生了严重的内存泄漏！
因为 ShareService 是全局的，它抓着 MainActivity 不放。当关闭 MainActivity 时，垃圾回收器（GC）想回收这个 Activity，但发现 ShareService 还引用着它，导致内存无法释放。

修正建议：
如果 ShareService 需要 Context 来做网络配置或存文件，务必在内部转换成 Application Context：
```kotlin
object ShareService {
   private var appContext: Context? = null

   fun bootstrap(context: Context): ShareService {
	// ✅ 关键：只持有 applicationContext，它不怕泄漏，因为它本身就是全局的    
	this.appContext = context.applicationContext 
     return this
   }
}
```

### 总结

- **Context** 是 Android 系统的**大管家**。
- 要资源、要权限、要系统服务，都得找它。
- **后端思维转换**：把它当成当只有受限权限时，操作系统发给的**通行证**。
- **切记**：在单例或长生命周期对象中，只能存 `applicationContext`，绝对不能存 `Activity` 的 Context。