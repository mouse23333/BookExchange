/* ========================================
   贝壳易书 - 静态 Web 版 JS
   页面路由 · Mock数据 · 交互逻辑
   ======================================== */

// ===== 全局状态 =====
const STATE = {
  currentPage: 'login',
  currentTab: 'search',
  backStack: [],
  isLoggedIn: false,
  currentUser: {
    name: '贝壳书友',
    avatar: '📖',
    uploaded: [],
    favoriteIds: [],
  },
  currentBookId: null,
  currentChatId: null,
  editingBookId: null,
};

// ===== Mock 数据 =====
const MOCK_BOOKS = [
  { id: 1, title: '高等数学（第七版）上册', press: '高等教育出版社', author: '同济大学数学系', price: '25.00', cover: '#3498DB', desc: '9成新，少量笔记，无缺页。适用于大一高等数学课程，附赠课后习题答案。', owner: 'admin' },
  { id: 2, title: '线性代数', press: '清华大学出版社', author: '居余马', price: '18.00', cover: '#2ECC71', desc: '85成新，前两章有划线，其余干净。适合工科线性代数课程。', owner: '贝壳书友' },
  { id: 3, title: 'C程序设计语言（第2版）', press: '机械工业出版社', author: 'Kernighan & Ritchie', price: '30.00', cover: '#E67E22', desc: '经典C语言教材，几乎全新，只在扉页写了名字。程序员必读。', owner: 'admin_2' },
  { id: 4, title: '大学英语四级词汇', press: '外研社', author: '新东方', price: '12.00', cover: '#9B59B6', desc: '7成新，部分单词有标记，但不影响使用。适合备考四级。', owner: '贝壳书友' },
  { id: 5, title: '数据结构（C语言版）', press: '清华大学出版社', author: '严蔚敏', price: '22.00', cover: '#1ABC9C', desc: '考研必备！9成新，笔记工整，对理解算法很有帮助。', owner: 'admin' },
  { id: 6, title: '毛泽东思想和中国特色社会主义理论体系概论', press: '高等教育出版社', author: '编写组', price: '10.00', cover: '#E74C3C', desc: '公共课教材，几乎全新，期末开卷考试用完就出。', owner: 'admin_3' },
  { id: 7, title: '微观经济学（第九版）', press: '中国人民大学出版社', author: '曼昆', price: '35.00', cover: '#F39C12', desc: '经典经济学入门教材，全英文影印版。95成新，保管完好。', owner: 'admin_2' },
  { id: 8, title: '考研英语历年真题详解', press: '新东方大愚', author: '新东方考研教研组', price: '20.00', cover: '#2980B9', desc: '2015-2024十年真题，附详细解析。部分页有做题痕迹。', owner: '贝壳书友' },
];

const MOCK_MESSAGES = [
  {
    id: 1, bookId: 1, otherUser: 'admin', otherAvatar: '👤',
    msgs: [
      { from: 'other', text: '你好，这本高等数学还有吗？' },
      { from: 'me', text: '有的有的，你需要吗？' },
      { from: 'other', text: '是的，什么时候方便交易？' },
    ],
  },
  {
    id: 2, bookId: 3, otherUser: 'admin_2', otherAvatar: '🧑',
    msgs: [
      { from: 'other', text: 'C语言这本书能便宜点吗？' },
      { from: 'me', text: '已经是底价啦，书况很好的' },
      { from: 'other', text: '好吧，那我要了，约个时间？' },
      { from: 'me', text: '明天中午12点篮球场门口吧' },
    ],
  },
  {
    id: 3, bookId: 5, otherUser: 'admin', otherAvatar: '👤',
    msgs: [
      { from: 'other', text: '这本数据结构是正版吗？' },
    ],
  },
];

// 当前用户关联
MOCK_BOOKS.forEach(b => {
  if (b.owner === '贝壳书友') STATE.currentUser.uploaded.push(b.id);
});
STATE.currentUser.favoriteIds = [2, 4, 7];

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  showPage('login', false);
  renderMyPage();
});

// ===== Toast =====
function toast(msg, duration = 1500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), duration);
}

// ===== 页面导航 =====
function showPage(name, pushHistory = true) {
  // 处理覆盖层
  const overlays = ['detail','dialog','edit'];
  const isOverlay = overlays.includes(name);

  if (pushHistory && !isOverlay) {
    STATE.backStack.push(STATE.currentPage);
  }

  if (isOverlay) {
    // 显示覆盖层
    document.getElementById('page-' + name).classList.add('show');
  } else {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active', 'show');
    });
    document.getElementById('page-' + name).classList.add('active');

    // 更新导航栏
    const titles = {
      login: '贝壳易书', register: '贝壳易书',
      upload: '发布书籍', search: '贝壳易书',
      message: '消息', my: '我的',
    };
    document.getElementById('navTitle').textContent = titles[name] || '贝壳易书';

    // 登录/注册页隐藏 TabBar 和返回按钮
    const isAuth = (name === 'login' || name === 'register');
    document.getElementById('tab-bar').classList.toggle('hidden', isAuth);
    document.getElementById('nav-bar').classList.toggle('hidden', isAuth);

    // 返回按钮
    const canBack = (STATE.backStack.length > 0 && !isAuth);
    document.getElementById('navBack').classList.toggle('show', canBack);

    STATE.currentPage = name;
  }

  // 根据页面做特殊渲染
  if (name === 'search') renderSearchPage();
  if (name === 'message') renderMessagePage();
  if (name === 'my') renderMyPage();

  // 滚动到顶部
  window.scrollTo(0, 0);
}

function goBack() {
  if (STATE.currentPage === 'login' || STATE.currentPage === 'register') return;

  // 先检查覆盖层
  const overlays = ['detail','dialog','edit'];
  for (const o of overlays) {
    const el = document.getElementById('page-' + o);
    if (el.classList.contains('show')) {
      el.classList.remove('show');
      return;
    }
  }

  // 普通页面回退
  if (STATE.backStack.length > 0) {
    const prev = STATE.backStack.pop();
    showPage(prev, false);
  }
}

// ===== Tab 切换 =====
function switchTab(tab) {
  STATE.backStack = [];
  document.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  STATE.currentTab = tab;
  STATE.backStack = [];
  showPage(tab, false);
}

// ===== 登录逻辑 (简化：直接进) =====
function doLogin() {
  STATE.isLoggedIn = true;
  STATE.currentUser.name = document.getElementById('loginUser').value || '贝壳书友';
  STATE.backStack = ['login'];
  document.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.tab === 'search'));
  STATE.currentTab = 'search';
  showPage('search', false);
  document.getElementById('myName').textContent = STATE.currentUser.name;
  toast('登录成功 ✨');
}

// ===== 注册逻辑 =====
function doRegister() {
  const u = document.getElementById('regUser').value.trim();
  const p = document.getElementById('regPass').value;
  const p2 = document.getElementById('regPass2').value;
  if (!u) return toast('请输入账号');
  if (!p) return toast('请输入密码');
  if (p !== p2) return toast('两次密码不一致');
  STATE.currentUser.name = u;
  document.getElementById('loginUser').value = u;
  toast('注册成功，请登录');
  showPage('login');
}

// ===== 退出登录 =====
function doLogout() {
  STATE.isLoggedIn = false;
  STATE.backStack = [];
  showPage('login');
  toast('已退出登录');
}

// ===== 搜索渲染 =====
function doSearch() {
  renderSearchPage();
}

function renderSearchPage() {
  const keyword = (document.getElementById('searchKey')?.value || '').trim().toLowerCase();
  let books = MOCK_BOOKS;
  if (keyword) {
    books = MOCK_BOOKS.filter(b =>
      b.title.toLowerCase().includes(keyword) ||
      b.press.toLowerCase().includes(keyword) ||
      b.author.toLowerCase().includes(keyword)
    );
  }
  const grid = document.getElementById('bookGrid');
  const hint = document.getElementById('emptyHint');
  if (!grid) return;

  if (books.length === 0) {
    grid.innerHTML = '';
    hint.style.display = 'block';
  } else {
    hint.style.display = 'none';
    grid.innerHTML = books.map(b => `
      <div class="book-card" onclick="openDetail(${b.id})">
        <div class="book-cover" style="background:${b.cover}">📚</div>
        <div class="book-info">
          <div class="b-title">${b.title}</div>
          <div class="b-press">${b.press}</div>
          <div class="b-price">¥${b.price}</div>
        </div>
      </div>
    `).join('');
  }

  // 回到顶部按钮
  const bt = document.getElementById('backTop');
  if (bt) {
    window.addEventListener('scroll', () => {
      bt.classList.toggle('visible', window.scrollY > 400);
    });
  }
}

// ===== 书籍详情 =====
function openDetail(bookId) {
  STATE.currentBookId = bookId;
  const b = MOCK_BOOKS.find(x => x.id === bookId);
  if (!b) return;
  document.getElementById('detailSwiper').innerHTML = `<div style="font-size:64px">📚</div>`;
  document.getElementById('detailTitle').textContent = b.title;
  document.getElementById('detailPress').textContent = `${b.press} / ${b.author}`;
  document.getElementById('detailDesc').textContent = b.desc;
  document.getElementById('detailPrice').textContent = b.price;

  const isFav = STATE.currentUser.favoriteIds.includes(bookId);
  const favBtn = document.getElementById('detailFavBtn');
  favBtn.textContent = isFav ? '★ 已收藏' : '☆ 收藏';
  favBtn.classList.toggle('liked', isFav);

  // 自己的书显示编辑入口
  const isMine = b.owner === STATE.currentUser.name;
  document.getElementById('detailFavBtn').style.display = isMine ? 'none' : '';
  const contactBtn = document.querySelector('.btn-contact');
  if (contactBtn) {
    contactBtn.textContent = isMine ? '编辑' : '联系卖家';
    contactBtn.onclick = isMine ? () => openEdit(bookId) : openChat;
  }

  showPage('detail');
}

function toggleFav() {
  const id = STATE.currentBookId;
  const idx = STATE.currentUser.favoriteIds.indexOf(id);
  if (idx > -1) {
    STATE.currentUser.favoriteIds.splice(idx, 1);
    document.getElementById('detailFavBtn').textContent = '☆ 收藏';
    document.getElementById('detailFavBtn').classList.remove('liked');
    toast('已取消收藏');
  } else {
    STATE.currentUser.favoriteIds.push(id);
    document.getElementById('detailFavBtn').textContent = '★ 已收藏';
    document.getElementById('detailFavBtn').classList.add('liked');
    toast('收藏成功 ★');
  }
  renderMyPage();
}

// ===== 上传模拟 =====
let uploadedImg = null;
function simulateUpload() {
  uploadedImg = '📚';
  document.getElementById('uploadPreview').innerHTML = '<div style="font-size:64px;padding:30px;">📚</div><div style="font-size:12px;color:#999;">图片已选择</div>';
  toast('图片已选择（模拟）');
}

function doUpload() {
  const title = document.getElementById('upTitle').value.trim();
  const price = document.getElementById('upPrice').value.trim();
  if (!title) return toast('请填写书名');
  if (!price) return toast('请填写售价');
  toast('发布成功！✨');
  // 清空
  ['upTitle','upPress','upAuthor','upISBN','upPrice','upDetail'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('uploadPreview').innerHTML = '<div class="upload-placeholder" onclick="simulateUpload()">📷<br>点击上传图片</div>';
}

// ===== 消息列表 =====
function renderMessagePage() {
  const list = document.getElementById('msgList');
  const empty = document.getElementById('msgEmpty');
  if (MOCK_MESSAGES.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = MOCK_MESSAGES.map(m => {
    const b = MOCK_BOOKS.find(x => x.id === m.bookId);
    const lastMsg = m.msgs[m.msgs.length - 1];
    return `
      <div class="msg-item" onclick="openChat(${m.id})">
        <div class="msg-cover" style="background:${b ? b.cover : '#ccc'}">📚</div>
        <div class="msg-body">
          <div class="msg-title">${b ? b.title : '未知书籍'}</div>
          <div class="msg-last">${lastMsg ? lastMsg.text : ''}</div>
        </div>
        <div class="msg-avatar">${m.otherAvatar}</div>
      </div>
    `;
  }).join('');
}

// ===== 聊天 =====
let activeChat = null;
function openChat(msgId) {
  // 关闭详情层
  document.getElementById('page-detail').classList.remove('show');
  document.getElementById('page-edit').classList.remove('show');

  STATE.currentChatId = msgId;
  activeChat = MOCK_MESSAGES.find(m => m.id === msgId);
  if (!activeChat) {
    // 从详情页进来，没有历史消息
    const b = MOCK_BOOKS.find(x => x.id === STATE.currentBookId);
    const owner = b ? b.owner : '未知用户';
    activeChat = {
      id: Date.now(), bookId: STATE.currentBookId,
      otherUser: owner, otherAvatar: '👤',
      msgs: [],
    };
    MOCK_MESSAGES.push(activeChat);
    STATE.currentChatId = activeChat.id;
  }
  document.getElementById('navTitle').textContent = activeChat.otherUser;
  renderChat();
  showPage('dialog');
}

function renderChat() {
  if (!activeChat) return;
  const list = document.getElementById('chatList');
  list.innerHTML = activeChat.msgs.map(m => {
    const isMe = m.from === 'me';
    const cls = isMe ? 'me' : 'other';
    const avatar = isMe ? STATE.currentUser.avatar : activeChat.otherAvatar;
    return `
      <div class="chat-msg ${cls}">
        <div class="chat-avatar">${avatar}</div>
        <div class="chat-bubble">${m.text}</div>
      </div>
    `;
  }).join('');
  // 滚动到底部
  setTimeout(() => {
    list.parentElement.scrollTop = list.parentElement.scrollHeight;
  }, 50);
}

function sendMsg() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  if (!activeChat) {
    activeChat = { msgs: [] };
  }
  activeChat.msgs.push({ from: 'me', text });
  input.value = '';
  renderChat();
  renderMessagePage();
}

// ===== 我的页面 =====
function renderMyPage() {
  document.getElementById('myName').textContent = STATE.currentUser.name;

  // 上传列表
  const upIds = STATE.currentUser.uploaded;
  const upBooks = MOCK_BOOKS.filter(b => upIds.includes(b.id));
  document.getElementById('myUploadCount').textContent = `共 ${upBooks.length} 本`;
  document.getElementById('myUploadGrid').innerHTML = upBooks.map(b => `
    <div class="book-card" onclick="openDetailFromMy(${b.id})">
      <div class="book-cover" style="background:${b.cover}">📚</div>
      <div class="book-info">
        <div class="b-title">${b.title}</div>
        <div class="b-price">¥${b.price}</div>
      </div>
    </div>
  `).join('') || '<div class="empty-hint" style="padding:20px">暂无发布</div>';

  // 收藏列表
  const favBooks = MOCK_BOOKS.filter(b => STATE.currentUser.favoriteIds.includes(b.id));
  document.getElementById('myFavCount').textContent = `共 ${favBooks.length} 本`;
  document.getElementById('myFavGrid').innerHTML = favBooks.map(b => `
    <div class="book-card" onclick="openDetailFromMy(${b.id})">
      <div class="book-cover" style="background:${b.cover}">📚</div>
      <div class="book-info">
        <div class="b-title">${b.title}</div>
        <div class="b-price">¥${b.price}</div>
      </div>
    </div>
  `).join('') || '<div class="empty-hint" style="padding:20px">暂无收藏</div>';
}

function openDetailFromMy(bookId) {
  document.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.tab === 'search'));
  STATE.currentTab = 'search';
  document.getElementById('navBar')?.classList.remove('hidden');
  document.getElementById('tab-bar')?.classList.remove('hidden');
  showPage('search', false);
  setTimeout(() => openDetail(bookId), 100);
}

// ===== 编辑 =====
function openEdit(bookId) {
  STATE.editingBookId = bookId;
  const b = MOCK_BOOKS.find(x => x.id === bookId);
  if (!b) return;
  document.getElementById('edTitle').value = b.title;
  document.getElementById('edPress').value = b.press;
  document.getElementById('edAuthor').value = b.author;
  document.getElementById('edISBN').value = '';
  document.getElementById('edPrice').value = b.price;
  document.getElementById('edDetail').value = b.desc;
  showPage('edit');
}

function saveEdit() {
  const id = STATE.editingBookId;
  const b = MOCK_BOOKS.find(x => x.id === id);
  if (!b) return;
  b.title = document.getElementById('edTitle').value.trim() || b.title;
  b.press = document.getElementById('edPress').value.trim() || b.press;
  b.author = document.getElementById('edAuthor').value.trim() || b.author;
  b.price = document.getElementById('edPrice').value.trim() || b.price;
  b.desc = document.getElementById('edDetail').value.trim() || b.desc;
  toast('修改成功 ✅');
  document.getElementById('page-edit').classList.remove('show');
  document.getElementById('page-detail').classList.remove('show');
  renderSearchPage();
  renderMyPage();
}

function deleteBook() {
  const id = STATE.editingBookId;
  const idx = MOCK_BOOKS.findIndex(x => x.id === id);
  if (idx > -1 && confirm('确定删除《' + MOCK_BOOKS[idx].title + '》吗？此操作不可恢复。')) {
    MOCK_BOOKS.splice(idx, 1);
    STATE.currentUser.uploaded = STATE.currentUser.uploaded.filter(x => x !== id);
    STATE.currentUser.favoriteIds = STATE.currentUser.favoriteIds.filter(x => x !== id);
    toast('已删除');
    document.getElementById('page-edit').classList.remove('show');
    document.getElementById('page-detail').classList.remove('show');
    renderSearchPage();
    renderMyPage();
  }
}

// ===== 键盘事件 =====
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.id === 'chatInput') {
      sendMsg();
    } else if (activeEl && activeEl.id === 'searchKey') {
      doSearch();
    }
  }
});
