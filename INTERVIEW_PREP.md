# 贝壳易书 — 字节跳动面试全面准备文档

> 作者注：这是一个大三学生（信息管理与信息系统专业）带领两人团队开发的微信小程序，用于北科大校园二手书籍交易。面试目标是字节跳动暑期实习。

---

## 一、项目概述（面试自我介绍用）

**一句话**：贝壳易书是一个面向北京科技大学校园的二手书交易微信小程序。

**技术栈**：微信小程序原生开发 + Vant Weapp UI + 微信云开发（NoSQL 数据库 + 云存储）

**功能矩阵**：

| 模块 | 功能 | 技术点 |
|------|------|--------|
| 用户系统 | 注册/登录/头像上传 | 云数据库 CRUD、本地 localStorage 持久化 |
| 发布管理 | 多图上传、图书信息录入、编辑、删除 | 云存储 uploadFile、Uploader 组件 |
| 搜索浏览 | 关键词模糊搜索、图片预览 | 正则匹配（db.RegExp）、swiper 轮播 |
| 收藏系统 | 收藏/取消收藏、收藏列表 | 数组操作、数据同步 |
| 即时通讯 | 买家卖家一对一私信 | 嵌套文档模型、实时更新 |

**团队分工**：你作为项目负责人，负责整体架构设计、数据库设计、核心功能（搜索、消息、上传）开发，带领两人完成 UI 适配和测试。

---

## 二、代码深度审查（面试官会追问的点）

### 🔴 严重问题（面试时你应主动指出并说明改进方案）

#### 1. 密码明文存储

**位置**：`pages/login/login.js:36-38`、`pages/register/register.js:53`

```js
// 注册时直接将密码明文写入数据库
db.collection('userInfo').add({
  data: { username: ..., password: that.data.passwordConfirm }
})

// 登录时明文比对
db.collection("userInfo").where({
  username: ..., password: ...
})
```

**问题**：这是最严重的安全问题。任何能访问数据库的人都能看到所有用户密码。

**面试时的正确回答**：
> "这是我早期作品，当时图方便直接存了明文。现在我会用 bcrypt 或至少用云函数做服务端哈希。更好的做法是用微信的 `wx.login()` 获取 code，走微信登录体系，完全避免自己维护密码。如果需要自建用户系统，应该：注册时用 bcrypt.hash(password, 10) → 存哈希值；登录时用 bcrypt.compare(password, hash) → 返回结果。并且这些逻辑必须在云函数中执行，不能放在客户端。"

#### 2. N+1 查询问题

**位置**：`pages/message/message.js:25-58`

```js
// 查到了 N 条对话，然后每条对话再做 2 次数据库查询
res.data.forEach((item) => {
  db.collection('userInfo').where({...}).get({...})    // 查用户
  db.collection('bookInfo').where({...}).get({...})    // 查书籍
})
```

**问题**：如果有 50 条对话，会产生 1 + 50×2 = 101 次数据库查询。

**面试时的正确回答**：
> "这里可以用 `db.command.in` 批量查询。先收集所有 hostname 和 bookID，用一次 in 查询取代 N 次 where 查询。或者用云开发提供的聚合查询（aggregate），通过 $lookup 直接在数据库层做关联。这样云端网络往返从 O(N) 降到 O(1)。"

#### 3. setTimeout 当 async/await 用的反模式

**位置**：`pages/dialog/dialog.js:98`、`pages/detail/detail.js:53-67`、`pages/message/message.js:98-102`

```js
// 用 setTimeout 等待异步回调完成——完全不靠谱
setTimeout(() => {
  that.setData({ dialogs: that.data.dialogs })
}, 2500)  // 为什么是 2500？没有任何依据
```

**问题**：setTimeout 的时间是拍脑袋定的，网络慢时不够，网络快时浪费等待。这是对异步编程不理解的表现。

**面试时的正确回答**：
> "这是典型的回调地狱问题。应该用 Promise 链或 async/await。云开发的 API 都返回 Promise，可以用 `await db.collection(...).get()` 替代回调。或者使用 `Promise.all()` 收集所有并行查询，在所有完成后统一 setData。我在 `pages/my/my.js` 里已经用 `Promise.all(tasks).then(...)` 改进了收藏列表的查询，但没有来得及统一改到所有页面。"

#### 4. 对话创建函数的结构性嵌套错误

**位置**：`pages/dialog/dialog.js:78-98`

```js
// 在 success 回调里又嵌套了一个 success 回调
that.setData({
  _id: res._id,
  dialogs: [],
  // ...
  success(res){  // ← 这里！在 setData 里写了 success 回调
    db.collection('userInfo').where({...}).get({...})
  }
})
```

**问题**：这是一个明显的复制粘贴错误。`setData` 的 `data` 对象被塞进了一个 `success` 函数，这个函数完全不会被调用。

**面试时的正确回答**：
> "这是一个复制粘贴造成的 bug。创建对话记录后应该继续查询对方头像信息，但我错误地把回调写进了 setData 的 data 参数里。正确的做法是把头像查询放在外面，或者在 add().then() 里链式调用。如果面试官现场让我修，我会把 78-98 行重构为 Promise 链。"

#### 5. register.js 变量命名不一致导致写入数据库的字段是 undefined

**位置**：`pages/register/register.js`

```js
data: {
  account: "",        // 数据字段叫 account
  password: "",
  passwordConfirm: ""
},

getUserAccount(event) {
  this.setData({
    username: event.detail.value  // 但这里赋值给了 username！
  })
  console.log(this.data.username.length)
}

regis() {
  // ...
  db.collection('userInfo').add({
    data: {
      username: that.data.username,  // 读的是 username
      password: that.data.passwordConfirm
    }
  })
}
```

**问题**：`data` 里定义的是 `account`，但 setData 赋给了不存在的 `username`，JavaScript 不报错但 `that.data.username` 是 `undefined`。实际写入数据库的用户名是 `undefined` → 这可能反而被"修复"了，因为输入框 bindinput 也在同时触发…等等，回顾 login.wxml：

```html
<input ... bindinput="getUserAccount"/>
```

bindinput 触发时传的是 `event.detail.value`，而不是通过 `model:value` 绑定。所以 `this.data.username` 确实会被赋值为输入值，即使 data 中没有预先声明这个 key。这在微信小程序的 this.data 中会动态创建。所以实际上 username 会被存下来，但 data 中的 account 字段从未被使用——这是字段冗余。

**面试时的正确回答**：
> "登录页的 getUserAccount 用 `this.setData({username: ...})` 赋值给了未声明的 username 字段，而 data 里定义的是 account。虽然在小程序中 setData 可以动态创建键值，但这是一个代码质量问题——应该统一字段名。如果面试官让我定位这个 bug，我会看 wxml 的 bindinput 绑定和对应的 JS setData 目标字段是否一致。"

---

### 🟡 中等问题

#### 6. search 的 db.RegExp 不做输入转义

**位置**：`pages/search/search.js:58-61`

```js
db.collection("bookInfo").where(cm.or([
  { title: db.RegExp({ regexp: keyword, options: 'i' }) },
  // ...
]))
```

**问题**：如果用户输入正则特殊字符（如 `.` `*` `+` `(` 等），可能触发意外的正则匹配行为或查询失败。

**改进**：对输入做转义，如 `keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`

#### 7. upload.js 客户端直接写数据库——无校验无防护

**位置**：`pages/upload/upload.js:124-168`

**问题**：
- 客户端代码直接 add 到 bookInfo 集合，任何人都能通过修改小程序代码注入脏数据
- 没有速率限制，可以被刷
- 图片上传和数据库写入不在同一个事务中——图片上传成功了但数据库写入失败了，就成了"孤儿文件"

**面试时的正确回答**：
> "生产环境中应该有云函数做中间层：客户端调用云函数 → 云函数做参数校验、敏感词过滤 → 再写入数据库。云开发的客户端直接操作数据库适合原型阶段，但正式上线必须迁移到云函数。"

#### 8. 消息列表实时更新——不存在

**问题**：消息页面 (`message.js`) 只在 `onLoad` 中拉取一次，没有轮询、没有 WebSocket、没有云数据库的 watch 监听。用户在对话框中发了消息，返回消息列表页后除非重新 onLoad，否则看不到最新消息。

**代码中唯一的补救**：`dialog.js` 的 `onUnload` 中会触发上一页的 `onLoad` 重新执行（第 203-222 行），这是一种手动刷新策略。

**面试时的正确回答**：
> "实时性方面，当前方案需要用户返回消息列表页面时手动触发刷新。如果需要真正的实时推送，可以用云开发的数据库 watch 监听 `db.collection('dialogInfo').watch({onChange: ...})` 来订阅数据变更。更好的方案是接入 WebSocket，不过这需要专门的服务器。对于面试原型阶段，当前方案够用。"

---

### 🟢 小问题（但你应知道）

9. **图片没有压缩**：`upload.js` 直接上传原图，应该用 `wx.compressImage` 压缩后再上传（节省存储和加载流量）

10. **没有删除云存储文件**：删除图书时只删数据库记录，`bookImage/` 中的图片文件没有同步删除

11. **密码输入框 type 不对**：login.wxml 密码框用的是 `type="text"` 配合 `password="{{true}}"`，应该直接用 `type="password"`

12. **favor ID 同步不及时**：`detail.js` 的收藏状态可能在全局数据和数据库之间不同步——如果另一个页面改了收藏，detail 页不会自动更新

13. **app.js getAllInfo 不存 storage**：从数据库拉到完整用户信息后，没有 `wx.setStorageSync` 回写，下次启动又要重新查

14. **wxml 中 bundle 了过大的 Vant 组件库**：`miniprogram_npm/@vant/weapp/` 下包含了所有组件（日历、省市区选择器等），实际上只用到了一小部分

---

## 三、面试高频技术追问 + 准备答案

### Q1：「云开发的数据库权限你是怎么设计的？」

**推荐回答**：
> "我为不同的集合设了不同的权限策略：
> - `bookInfo`：所有用户可读，仅创建者可写——保证商品信息对所有人可见，但只有发布者能修改
> - `userInfo`：所有用户可读，仅创建者可写——保证用户的信息自己能改，但其他人的用户名之类能查到
> - `dialogInfo`：仅创建者可读写——对话内容是私密的，买卖双方各有一份独立的对话记录
>
> 这个设计的缺陷是 dialogInfo 对消息接收方不可见。如果要改进，可以用云函数做代理——客户端不直接访问数据库，而是调用云函数，由云函数判断当前用户是否有权限再执行操作。"

### Q2：「如果上线后有 10 万本书，你的搜索会崩吗？」

**推荐回答**：
> "会有性能问题。当前直接用 `db.RegExp` 做全表扫描模糊匹配，没有建索引。百万级数据时查询会很慢。
>
> 我考虑的改进方案：
> 1. **建索引**：在 title、author 字段上建数据库索引，正则匹配会更快
> 2. **分词搜索**：云开发不支持全文索引（MongoDB Atlas 才有），但可以自己实现简单的分词——上传时将 title 拆成单字数组，搜索时做交集匹配
> 3. **Elasticsearch 替代方案**：当数据量大到一定程度时，应该把搜索迁移到独立的搜索服务
> 4. **分页**：当前 `get()` 无分页参数，应该加 `.skip()` 和 `.limit()`"

### Q3：「微信小程序的性能优化你了解多少？」

**推荐回答**：
> "在贝壳易书中，我遇到了几个性能问题并做了针对性优化：
>
> 1. **setData 频率**：上传页的图片列表更新频繁，我用 setTimeout 做了防抖。更好的做法是用 `wx.nextTick` 或批量 setData。
> 2. **图片懒加载**：搜索结果列表很长时，图片应该用 `<image lazy-load="true">` 属性进行懒加载
> 3. **包体积**：Vant Weapp 引入了很多不用的组件（如日历、地址选择器），可以用按需引入减小包体积
> 4. **setData 数据量**：my 页面拉取所有收藏和发布数据一次性 setData，建议加分页、只 setData 可视区域
> 5. **CSS 动画 vs JS 动画**：页面过渡应该优先用 CSS transition/animation，小程序的 JS 线程和渲染线程是分开的，频繁的 JS 动画会卡顿"

### Q4：「为什么选择云开发而不是自建后端？」

**推荐回答**：
> "这个项目是校园内的小范围应用，当时的选择考量：
> - **开发效率**：云开发省去了服务器运维、域名备案、HTTPS 证书等流程，三人团队可以专注业务
> - **微信生态集成**：天然支持微信登录、用户身份识别
> - **成本**：免费额度对于校内几百到几千用户完全够用
> - **学习成本**：团队成员没有后端开发经验，云开发的 JS SDK 上手快
>
> 如果要升级为主流架构，我会选 Node.js + MySQL/PostgreSQL 自建后端，用 RESTful API 或 GraphQL 与前端通信。WebSocket 做实时消息。对象存储（OSS/S3）替代云存储。"

### Q5：「如果让你重构这个项目，你会怎么设计？」

**推荐回答**：
> "我会从几个层面重构：
>
> **代码层**：
> - 抽取 service 层，把所有数据库操作封装成独立的 API 模块
> - 使用 async/await 替代回调嵌套
> - 统一错误处理——每个数据库调用都要加 fail 回调
> - 用 TypeScript 替代 JavaScript（小程序已支持 TS）
>
> **数据层**：
> - 密码用 bcrypt 哈希存储
> - dialog 表拆分：每条消息一个 doc，而不是一个对话所有消息塞一个数组
> - 加索引优化查询
> - 加软删除字段（isDeleted）代替物理删除
>
> **架构层**：
> - 前后端分离：Node.js + Express/Koa 做 API 服务，MySQL/PostgreSQL 做持久化
> - 搜索用 Elasticsearch
> - 图片用 OSS + CDN
> - 消息用 WebSocket（Socket.io 或 ws）
> - 用户认证用微信 openid + JWT
> - 加 CI/CD 流程（GitHub Actions）
>
> **产品层**：
> - 加交易状态机（待确认 → 交易中 → 已完成/已取消）
> - 加用户评价体系
> - 加消息推送（小程序订阅消息）"

### Q6：「你能讲一下小程序的生命周期吗？」

**推荐回答**：
> "小程序有两层生命周期：
>
> **App 生命周期**：`onLaunch`（初始化）→ `onShow`（切前台）→ `onHide`（切后台）
> 我们在 `onLaunch` 中从 storage 恢复登录状态，这是合理的。
>
> **Page 生命周期**：`onLoad`（首次加载，只执行一次）→ `onShow`（每次显示）→ `onReady` → `onHide` → `onUnload`
> 关键区别：`onLoad` 只执行一次（页面栈中），而 `onShow` 每次从其他页面返回都会执行。
>
> 在 `pages/my/my.js` 中我在 `onShow` 而不是 `onLoad` 中加载数据——这是正确的，因为用户每次切到"我的"tab 都需要刷新。
>
> `pages/dialog/dialog.js` 的 `onUnload` 中我手动触发了上一页的刷新，这是处理跨页面数据同步的一种方式。"

---

## 四、项目中展示的技术亮点（面试中要强调）

### ✅ 你做得好的地方

1. **Promise.all 优化批量查询**（`pages/my/my.js:89-97`）：
   ```js
   const tasks = favIDs.map(id => db.collection("bookInfo").where({ _id: id }).get());
   Promise.all(tasks).then(results => { ... });
   ```
   这说明你理解异步编程和性能优化。

2. **CSS 设计系统**（`app.wxss`）：使用 CSS 自定义属性（CSS Variables）定义了完整的设计令牌——这是大型项目中 UI 一致性的基础。

3. **搜索实现用了正则模糊匹配**：标题、出版社、详情、作者四字段同步搜索。

4. **对话模型设计的正确直觉**：用 `dialogInfo` 独立表存储对话，买卖双方各一份记录，避免了冲突——这是对领域模型的正确理解。

5. **localStorage 持久化登录状态**：App 启动时自动恢复，无需重复登录。

6. **组件化使用**：正确引入了 Vant Weapp 组件库，使用了 van-search、van-uploader、van-goods-action 等组件。

7. **WXML 条件渲染**：`wx:if="{{isSelf}}"` 区分"查看自己的商品"和"查看别人的商品"两种状态，展示不同操作按钮——这是正确的产品逻辑。

---

## 五、手撕代码高频题（结合项目特点）

字节面试官很可能让你现场写代码。以下是最可能与你的项目相关的题型：

### 题型 1：防抖/节流

**场景**：「你的搜索页输入框 onChange 每次键入都会触发，如果我要你加防抖怎么做？」

```js
// 防抖（debounce）：用户停止输入 300ms 后才执行搜索
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 在你的 search.js 中使用
onChange(event) {
  this.setData({ searchText: event.detail });
  // 使用防抖
  if (!this.debouncedSearch) {
    this.debouncedSearch = debounce(this.doSearch.bind(this), 300);
  }
  this.debouncedSearch();
}
```

**附——节流（throttle）**：
```js
function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

**追问**：「防抖和节流有什么区别？各自适用于什么场景？」
> 防抖：连续触发只执行最后一次。适合搜索输入、窗口 resize。
> 节流：固定时间间隔执行一次。适合滚动事件、按钮防连点。

### 题型 2：深拷贝/深比较

**场景**：「你的小程序中 setData 会触发视图更新，如果你拿到了一个嵌套对象，怎么判断数据是否真的变了以避免不必要的渲染？」

```js
// 浅比较（只比一层）
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

// 深拷贝
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (map.has(obj)) return map.get(obj);  // 处理循环引用
  
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map);
    }
  }
  return clone;
}
```

### 题型 3：Promise 相关

**场景**：「看你 my.js 里用了 Promise.all，那你能不能现场实现一个 Promise.all？」

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('promises must be an array'));
    }
    const results = [];
    let count = 0;
    if (promises.length === 0) resolve(results);
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(value => {
        results[index] = value;  // 用 index 保证顺序
        count++;
        if (count === promises.length) resolve(results);
      }, reject);
    });
  });
}
```

**追问**：「Promise.all 和 Promise.allSettled 有什么区别？」
> `Promise.all`：有一个失败就整体失败
> `Promise.allSettled`：等所有完成（无论成败），返回 `{status, value/reason}` 数组

### 题型 4：LRU 缓存

**场景**：「你的小程序要从云存储加载图片，每次都要网络请求，很慢。怎么设计一个本地缓存机制？」

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();  // Map 保证插入顺序
  }
  
  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    // 访问后移到末尾（最近使用）
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      // 删除最久未使用的（第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
```

### 题型 5：树形结构 / 递归

**场景**：「消息列表需要支持多级分类，如果你有数据 [{id:1, parentId:null}, {id:2, parentId:1}] 怎么转成树？」

```js
function arrayToTree(items) {
  const map = {};
  const roots = [];
  
  // 先建立索引
  items.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });
  
  // 构建父子关系
  items.forEach(item => {
    if (item.parentId === null) {
      roots.push(map[item.id]);
    } else if (map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    }
  });
  
  return roots;
}
```

---

## 六、简历关联——如何把项目故事讲好

### 开场（30秒电梯演讲）
> "我主导开发了贝壳易书——一个面向北科大校园的二手书交易小程序。使用微信原生开发 + Vant UI 组件库，后端基于微信云开发（NoSQL + 云存储）。实现了用户系统、图书发布与搜索（正则模糊匹配）、收藏、买家和卖家的一对一即时通讯。作为三人小团队的负责人，我负责整体架构设计、数据库设计和核心功能开发。"

### 技术深度的故事
> "这个项目让我深入理解了异步编程和数据库设计。比如在消息列表页面，我最初用了嵌套回调去关联查询用户、图书和对话三张表，后来发现这是一个经典的 N+1 查询问题。我用 Promise.all 进行了优化，查询次数从 O(N) 降到了 O(1)。还有就是数据的实时性问题，小程序页面切回时生命周期涉及 onLoad 和 onShow 的区别，我踩过坑之后深刻理解了这些机制。"

### 如果面试官问「你遇到的最大挑战是什么」
> "最大的挑战是对话系统的设计。我需要支持买家发起对话、卖家回复，而且两个人看到的应该是同一个聊天记录。我最初的方案是把对话存在某一方下面，但发现权限不好控制。最后的设计是：对话入口在图书详情页，由访问者触发创建，dialogInfo 记录关联的 bookID、发起人、接收人和消息数组。虽然解决了基本需求，但我也意识到这个设计的局限性——比如消息不能实时推送、大量消息时数据膨胀——如果有机会重构我会把每条消息独立存储并接入 WebSocket。"

### 如果面试官问「你怎么评价这个项目的技术含量」
（这是一个陷阱题，回答要既诚实又体现思考）
> "这个项目在技术选型上偏实用主义——用云开发快速搭建原型。它不是一个技术上多么前沿的项目，但让我练就了几个核心能力：一是从零到一搭建完整产品的全栈思维；二是异步编程和数据库查询优化的实操经验；三是团队协作和项目推进的能力。现在我回头看，最想改进的是把单体式的小程序重构为前后端分离架构，这也是我希望在字节这样的大厂学习的方向。"

---

## 七、面试检查清单

在周四面试前，确保你能：

- [ ] 不看代码画出项目的页面跳转关系图
- [ ] 讲清楚 3 个数据库集合的字段结构和关系
- [ ] 不看代码写出 Promise.all 和 debounce 的实现
- [ ] 解释小程序 App/Page 生命周期，尤其是 onLoad 和 onShow 的区别
- [ ] 解释 setData 的工作原理和性能注意事项
- [ ] 解释为什么 NoSQL 适合你的场景
- [ ] 能说出至少 3 个你想改进的设计决策
- [ ] 准备好「如果给你一周重构，你会做什么」的答案
- [ ] 准备 1-2 个你在项目中遇到的技术难题和解决方案（用 STAR 法则）

---

## 八、云开发恢复步骤

详见项目根目录的 `CLOUD_RECOVERY_GUIDE.md`，核心步骤：

1. 微信开发者工具 → 云开发 → 新建环境 → 获得新环境 ID
2. 创建 3 个集合：`userInfo`、`bookInfo`、`dialogInfo`
3. 创建 3 个存储目录：`bookImage/`、`userHead/`、`appInfo/`
4. 修改 `app.js` 第 41 行的环境 ID
5. 修复 `login.wxml` 中 Logo 的云存储引用

如果云开发实在无法恢复，我在 `CLOUD_RECOVERY_GUIDE.md` 中也写了 Mock 层的代码，可以在不依赖云开发的情况下运行小程序。

---

*祝面试顺利！北科大到字节，这是一个非常好的起点。*
