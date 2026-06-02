# 贝壳易书 — 微信云开发恢复指南

## 背景
原项目使用的云开发环境 ID 是 `cloud1-8g4ft87ldab47757`，AppID 是 `wx9963ad0255a41038`。如果环境已过期被回收，需要按以下步骤重建。

---

## 步骤一：在微信开发者工具中重新开通云开发

1. 打开微信开发者工具，载入本项目
2. 点击工具栏的「云开发」按钮（一朵云图标）
3. 如果提示环境已失效，点击「新建环境」
4. 环境名称随意（如 `bookex-cloud`），**付费方式选择「免费版」**（配额对于演示足够）
5. 创建完成后，你会得到一个新的环境 ID

---

## 步骤二：创建数据库集合

在云开发控制台 → 数据库 → 添加集合，创建以下 3 个集合：

### 集合 1: `userInfo`
权限设置：`所有用户可读，仅创建者可写`

### 集合 2: `bookInfo`
权限设置：`所有用户可读，仅创建者可写`

### 集合 3: `dialogInfo`
权限设置：`仅创建者可读写`（对话是私密的）

> 💡 **面试加分点**：如果你被问到"为什么选 NoSQL"，答案是：云开发底层是 MongoDB 文档数据库。`userInfo.favor` 是一个数组存收藏 ID，`dialogInfo.dialogs` 是一个数组存消息记录——这些嵌套文档天然适合 NoSQL 的文档模型，避免了关系型数据库的 JOIN 操作。

---

## 步骤三：更新 app.js 中的环境 ID

将代码第 41 行的环境 ID 替换为你的新环境 ID：

```js
wx.cloud.init({
  env: '你的新环境ID', // ← 改这里
  traceUser: true,
})
```

---

## 步骤四：初始化云存储目录

在云开发控制台 → 存储 → 新建文件夹：
- `bookImage/` — 图书图片
- `userHead/` — 用户头像
- `appInfo/` — 应用 Logo（login.wxml 中引用了）

---

## 步骤五：修复 login.wxml 中的云存储引用

`pages/login/login.wxml` 第 6 行的 Logo 图片路径是从旧云存储引用的：
```html
<image class="logo-image" src="cloud://cloud1-8g4ft87ldab47757.636c-cloud1-8g4ft87ldab47757-1373796402/appInfo/..."/>
```
如果 Logo 显示不出来，可以换成本地图片或新的云存储链接。

---

## 备选方案（如果云开发实在开不了）

可以在 `app.js` 顶层加一层 Mock 拦截：

```js
// app.js — 云开发不可用时的本地 Mock
const MOCK_DB = {
  userInfo: [
    { _id: 'u1', username: 'test', password: '123456', favor: [], userHead: null }
  ],
  bookInfo: [
    { _id: 'b1', title: 'JavaScript高级程序设计', press: '人民邮电出版社', 
      author: 'Nicholas C. Zakas', price: '25', detail: '九成新，无笔记',
      imageList: [{url: '/images/icon/cart.png'}], imageHead: '/images/icon/cart.png',
      uploadUser: 'test' }
  ],
  dialogInfo: []
};

// 拦截 wx.cloud.database() 的调用
const origCloudInit = wx.cloud.init;
wx.cloud.init = (cfg) => console.log('[Mock] Cloud init:', cfg);

if (typeof wx.cloud.database !== 'function') {
  wx.cloud.database = () => ({
    collection: (name) => ({
      where: (q) => ({ get: (opts) => opts.success({data: MOCK_DB[name] || []}) }),
      add: (opts) => opts.success({_id: 'mock_' + Date.now()}),
      update: (opts) => opts.success({stats: {updated: 1}}),
      doc: (id) => ({ get: (opts) => opts.success({data: {...}}), update: (opts) => opts.success({}), remove: (opts) => opts.success({}) }),
      get: (opts) => opts.success({data: MOCK_DB[name] || []}),
    })
  });
}
```

这样就可以脱离云环境独立运行。
