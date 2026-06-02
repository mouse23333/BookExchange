/**
 * =======================================================
 * 贝壳易书 — 重构示例（面试备用代码）
 *
 * 用途：当面试官追问你的代码问题时，你可以说
 * "我意识到这些问题了，下面是我的改进方案"
 * 然后直接展示这些重构后的代码。
 * =======================================================
 */

// ============================================================
// 重构 1：消息列表 — 消除 N+1 查询
// 原代码问题：查 N 条对话 → forEach 内部再查 2 次（user + book）
// → 共产生 1 + 2N 次数据库查询
// 改后：用 Promise.all + in 查询，3 次数据库调用完成
// ============================================================
async function loadDialogs(username) {
  const db = wx.cloud.database();

  // Step 1: 并行查询双向对话
  const [asHost, asCustom] = await Promise.all([
    db.collection('dialogInfo').where({ hostname: username }).get(),
    db.collection('dialogInfo').where({ customname: username }).get()
  ]);

  const allDialogs = [...asHost.data, ...asCustom.data];
  if (allDialogs.length === 0) return [];

  // Step 2: 收集所有需要关联查询的 ID
  const userIds = [...new Set(allDialogs.flatMap(d => [d.hostname, d.customname]).filter(Boolean))];
  const bookIds = [...new Set(allDialogs.map(d => d.bookID).filter(Boolean))];

  // Step 3: 批量查询（2 次 in 查询替代 N 次 where 查询）
  const [userRes, bookRes] = await Promise.all([
    userIds.length > 0
      ? db.collection('userInfo').where({ username: db.command.in(userIds) }).get()
      : { data: [] },
    bookIds.length > 0
      ? db.collection('bookInfo').where({ _id: db.command.in(bookIds) }).get()
      : { data: [] }
  ]);

  // Step 4: 构建索引 Map（O(1) 查找）
  const userMap = new Map(userRes.data.map(u => [u.username, u]));
  const bookMap = new Map(bookRes.data.map(b => [b._id, b]));

  // Step 5: 组装结果
  return allDialogs.map(dialog => ({
    dialogInfo: dialog,
    bookInfo: bookMap.get(dialog.bookID) || null,
    hostInfo: userMap.get(dialog.hostname) || null,
    customInfo: userMap.get(dialog.customname) || null,
    IamHost: dialog.hostname === username,
    image: bookMap.get(dialog.bookID)?.imageHead || null,
    title: bookMap.get(dialog.bookID)?.title || null,
    last: dialog.dialogs?.at(-1)?.text || '',
    userHead: userMap.get(
      dialog.hostname === username ? dialog.customname : dialog.hostname
    )?.userHead || null
  }));
}


// ============================================================
// 重构 2：防抖搜索（debounce）
// 原代码：每次 onChange 直接触发，没有防抖
// 改后：用户停止输入 300ms 后才真正搜索
// ============================================================
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 在 Page 中使用：
// Page({
//   onLoad() {
//     this.debouncedSearch = debounce(this.doSearch.bind(this), 300);
//   },
//   onChange(event) {
//     this.setData({ searchText: event.detail });
//     this.debouncedSearch();  // 防抖后的搜索
//   },
//   doSearch() { /* ... 原有搜索逻辑 */ }
// })


// ============================================================
// 重构 3：对话创建 — async/await 消除回调地狱
// 原代码：4 层嵌套回调 + setTimeout 延时 + setData 里写 success
// 改后：扁平化 async/await，逻辑清晰
// ============================================================
async function initDialog(bookID) {
  const db = wx.cloud.database();
  const username = getApp().globalData.userInfo.username;

  try {
    // 1. 查询是否已有对话
    const existing = await db.collection('dialogInfo').where({
      bookID,
      customname: username
    }).get();

    if (existing.data.length > 0) {
      // 已有对话，直接加载
      const dialog = existing.data[0];
      const hostUser = await db.collection('userInfo')
        .where({ username: dialog.hostname }).get();

      return {
        dialogInfo: dialog,
        dialogs: dialog.dialogs,
        rightID: username,
        leftID: dialog.hostname,
        rightHead: getApp().globalData.userInfo.userHead,
        leftHead: hostUser.data[0]?.userHead || null,
        last: dialog.dialogs.at(-1)?.text || ''
      };
    }

    // 2. 新建对话
    const bookRes = await db.collection('bookInfo').where({ _id: bookID }).get();
    const book = bookRes.data[0];

    const addRes = await db.collection('dialogInfo').add({
      data: {
        bookID,
        customname: username,
        hostname: book.uploadUser,
        dialogs: []
      }
    });

    // 3. 获取对方头像
    const hostUser = await db.collection('userInfo')
      .where({ username: book.uploadUser }).get();

    // 4. 创建成功后再次查询完整记录
    const newDialog = await db.collection('dialogInfo').doc(addRes._id).get();

    return {
      dialogInfo: newDialog.data,
      dialogs: [],
      rightID: username,
      leftID: book.uploadUser,
      rightHead: getApp().globalData.userInfo.userHead,
      leftHead: hostUser.data[0]?.userHead || null,
      last: null
    };

  } catch (err) {
    console.error('初始化对话失败:', err);
    wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    return null;
  }
}


// ============================================================
// 重构 4：密码安全 — 云函数内 bcrypt
// （假设在云函数中执行，不是客户端）
// ============================================================
/*
// 云函数 register/index.js
const cloud = require('wx-server-sdk');
const bcrypt = require('bcryptjs');  // bcryptjs 是纯 JS 实现，适合云函数

cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { username, password } = event;

  // 参数校验
  if (!username || !password) return { code: -1, msg: '参数不完整' };
  if (username.length > 10 || password.length > 20) return { code: -1, msg: '参数过长' };

  // 查重
  const exist = await db.collection('userInfo').where({ username }).get();
  if (exist.data.length > 0) return { code: -1, msg: '用户名已被使用' };

  // 哈希密码
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  // 写入
  const res = await db.collection('userInfo').add({
    data: { username, passwordHash, favor: [], createdAt: new Date() }
  });

  return { code: 0, data: { _id: res._id, username } };
};


// 云函数 login/index.js
exports.main = async (event) => {
  const { username, password } = event;

  const user = await db.collection('userInfo').where({ username }).get();
  if (user.data.length === 0) return { code: -1, msg: '用户不存在' };

  const valid = bcrypt.compareSync(password, user.data[0].passwordHash);
  if (!valid) return { code: -1, msg: '密码错误' };

  // 不返回 passwordHash
  const { passwordHash, ...safeUser } = user.data[0];
  return { code: 0, data: safeUser };
};
*/


// ============================================================
// 重构 5：Promise.all 实现（手撕代码高频题）
// ============================================================
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('argument must be an array'));
    }

    const results = new Array(promises.length);
    let resolvedCount = 0;

    if (promises.length === 0) return resolve(results);

    promises.forEach((p, index) => {
      // Promise.resolve 包装非 Promise 值
      Promise.resolve(p).then(
        value => {
          results[index] = value;  // 用 index 保证顺序
          resolvedCount++;
          if (resolvedCount === promises.length) {
            resolve(results);
          }
        },
        reject  // 任何一个失败都直接 reject
      );
    });
  });
}


// ============================================================
// 重构 6：简单的 LRU 图片缓存
// （面试官可能问：怎么优化云存储图片的重复加载）
// ============================================================
class ImageCache {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(url) {
    if (this.cache.has(url)) {
      // 命中，移到末尾（最近使用）
      const value = this.cache.get(url);
      this.cache.delete(url);
      this.cache.set(url, value);
      return value;
    }
    return null;
  }

  set(url, tempFilePath) {
    if (this.cache.has(url)) {
      this.cache.delete(url);
    } else if (this.cache.size >= this.maxSize) {
      // 淘汰最久未使用的
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(url, tempFilePath);
  }
}


// ============================================================
// 重构 7：正则表达式输入转义（防止正则注入）
// ============================================================
function escapeRegex(str) {
  // 转义所有正则特殊字符
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 在搜索中使用：
function safeSearch(keyword) {
  const db = wx.cloud.database();
  const escaped = escapeRegex(keyword);
  const pattern = db.RegExp({ regexp: escaped, options: 'i' });

  return db.collection("bookInfo").where(db.command.or([
    { title: pattern },
    { press: pattern },
    { detail: pattern },
    { author: pattern }
  ])).get();
}


// ============================================================
// 重构 8：批量 setData 工具函数
// ============================================================
/**
 * 合并多次 setData 调用为一次，减少视图渲染次数
 * 用法：const batch = createBatchSetter(this); batch('key1', val1); batch('key2', val2);
 */
function createBatchSetter(page) {
  const pending = {};

  return function batchSetData(key, value) {
    pending[key] = value;

    // 用 requestAnimationFrame 模拟 microtask
    if (!batchSetData._scheduled) {
      batchSetData._scheduled = true;
      wx.nextTick(() => {
        page.setData(pending);
        batchSetData._scheduled = false;
        // 清空 pending（用新对象，避免引用问题）
        Object.keys(pending).forEach(k => delete pending[k]);
      });
    }
  };
}


// ============================================================
// 导出（如果需要）
// ============================================================
export {
  loadDialogs,
  debounce,
  initDialog,
  myPromiseAll,
  ImageCache,
  escapeRegex,
  safeSearch,
  createBatchSetter
};
