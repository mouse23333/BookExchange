/* ========================================
   贝壳易书 - 静态 Web 版 JS v2
   本地Mock + OpenLibrary 联网搜书
   ======================================== */

// ===== 全局状态 =====
const STATE = {
  currentPage: 'login', currentTab: 'search', backStack: [], isLoggedIn: false,
  currentUser: { name: '贝壳书友', avatar: '📖', uploaded: [], favoriteIds: [] },
  currentBookId: null, currentChatId: null, editingBookId: null,
  webResults: [], searchingWeb: false,
};

// ===== Mock 书籍 =====
const GRADIENTS = ['#667eea,#764ba2','#f093fb,#f5576c','#4facfe,#00f2fe','#43e97b,#38f9d7','#fa709a,#fee140','#a18cd1,#fbc2eb','#fccb90,#d57eeb','#e0c3fc,#8ec5fc','#f5576c,#ff6f00','#667eea,#3498db','#11998e,#38ef7d','#fc4a1a,#f7b733'];

const MOCK_BOOKS = [
  { id:1, title:'高等数学（第七版）上册', press:'高等教育出版社', author:'同济大学数学系', price:'25.00', cover:GRADIENTS[0], desc:'9成新，少量笔记，无缺页。适用于大一高等数学课程。', owner:'admin' },
  { id:2, title:'线性代数', press:'清华大学出版社', author:'居余马', price:'18.00', cover:GRADIENTS[1], desc:'85成新，前两章有划线，其余干净。适合工科线性代数课程。', owner:'贝壳书友' },
  { id:3, title:'C程序设计语言（第2版）', press:'机械工业出版社', author:'Kernighan & Ritchie', price:'30.00', cover:GRADIENTS[2], desc:'经典C语言教材，几乎全新，只在扉页写了名字。程序员必读。', owner:'admin_2' },
  { id:4, title:'大学英语四级词汇', press:'外研社', author:'新东方', price:'12.00', cover:GRADIENTS[3], desc:'7成新，部分单词有标记，但不影响使用。适合备考四级。', owner:'贝壳书友' },
  { id:5, title:'数据结构（C语言版）', press:'清华大学出版社', author:'严蔚敏', price:'22.00', cover:GRADIENTS[4], desc:'考研必备！9成新，笔记工整，对理解算法很有帮助。', owner:'admin' },
  { id:6, title:'毛概（2023版）', press:'高等教育出版社', author:'编写组', price:'10.00', cover:GRADIENTS[5], desc:'公共课教材，几乎全新，期末开卷考试用完就出。', owner:'admin_3' },
  { id:7, title:'微观经济学（第九版）', press:'中国人民大学出版社', author:'曼昆', price:'35.00', cover:GRADIENTS[6], desc:'经典经济学入门教材，全英文影印版。95成新。', owner:'admin_2' },
  { id:8, title:'考研英语历年真题详解', press:'新东方大愚', author:'新东方考研组', price:'20.00', cover:GRADIENTS[7], desc:'2019-2024十年真题，附详细解析。部分页有做题痕迹。', owner:'贝壳书友' },
];

const MOCK_MESSAGES = [
  { id:1, bookId:1, otherUser:'admin', otherAvatar:'👤',
    msgs:[{from:'other',text:'你好，这本高等数学还有吗？'},{from:'me',text:'有的有的，你需要吗？'},{from:'other',text:'是的，什么时候方便交易？'}]},
  { id:2, bookId:3, otherUser:'admin_2', otherAvatar:'🧑',
    msgs:[{from:'other',text:'C语言这本书能便宜点吗？'},{from:'me',text:'已经是底价啦，书况很好的'},{from:'other',text:'好吧那我要了，明天中午？'},{from:'me',text:'没问题，篮球场门口见'}]},
  { id:3, bookId:5, otherUser:'admin', otherAvatar:'👤',
    msgs:[{from:'other',text:'这本数据结构是正版吗？'}]},
];

MOCK_BOOKS.forEach(b => { if(b.owner==='贝壳书友') STATE.currentUser.uploaded.push(b.id); });
STATE.currentUser.favoriteIds = [2,4,7];

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => { showPage('login', false); renderMyPage(); });

// ===== Toast =====
function toast(msg, d=1500){
  const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),d);
}

// ===== 页面导航 =====
function showPage(name, push=true){
  const overlays=['detail','dialog','edit'];
  if(push && !overlays.includes(name)) STATE.backStack.push(STATE.currentPage);
  if(overlays.includes(name)){
    document.getElementById('page-'+name).classList.add('show');
  }else{
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active','show'));
    document.getElementById('page-'+name).classList.add('active');
    const titles={login:'贝壳易书',register:'贝壳易书',upload:'发布书籍',search:'贝壳易书',message:'消息',my:'我的'};
    document.getElementById('navTitle').textContent=titles[name]||'贝壳易书';
    const isAuth=(name==='login'||name==='register');
    document.getElementById('tab-bar').classList.toggle('hidden',isAuth);
    document.getElementById('nav-bar').classList.toggle('hidden',isAuth);
    document.getElementById('navBack').classList.toggle('show',STATE.backStack.length>0&&!isAuth);
    STATE.currentPage=name;
  }
  if(name==='search') renderSearchPage();
  if(name==='message') renderMessagePage();
  if(name==='my') renderMyPage();
  window.scrollTo(0,0);
}

function goBack(){
  if(STATE.currentPage==='login'||STATE.currentPage==='register') return;
  for(const o of ['detail','dialog','edit']){
    if(document.getElementById('page-'+o).classList.contains('show')){document.getElementById('page-'+o).classList.remove('show');return;}
  }
  if(STATE.backStack.length>0){const prev=STATE.backStack.pop();showPage(prev,false);}
}

function switchTab(tab){
  STATE.backStack=[];
  document.querySelectorAll('.tab-item').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  STATE.currentTab=tab;showPage(tab,false);
}

// ===== 登录/注册 =====
function doLogin(){
  STATE.isLoggedIn=true;
  STATE.currentUser.name=document.getElementById('loginUser').value||'贝壳书友';
  STATE.backStack=['login'];
  switchTab('search');
  document.getElementById('myName').textContent=STATE.currentUser.name;
  toast('登录成功 ✨');
}
function doRegister(){
  const u=document.getElementById('regUser').value.trim(),p=document.getElementById('regPass').value,p2=document.getElementById('regPass2').value;
  if(!u) return toast('请输入账号');if(!p) return toast('请输入密码');if(p!==p2) return toast('两次密码不一致');
  STATE.currentUser.name=u;document.getElementById('loginUser').value=u;
  toast('注册成功，请登录');showPage('login');
}
function doLogout(){STATE.isLoggedIn=false;STATE.backStack=[];showPage('login');toast('已退出登录');}

// ===== 搜索（本地 + 联网） =====
function doSearch(){ renderSearchPage(); }

function renderSearchPage(){
  const keyword=(document.getElementById('searchKey')?.value||'').trim().toLowerCase();
  let localBooks=MOCK_BOOKS;
  if(keyword){ localBooks=MOCK_BOOKS.filter(b=>b.title.toLowerCase().includes(keyword)||b.press.toLowerCase().includes(keyword)||b.author.toLowerCase().includes(keyword)); }

  const grid=document.getElementById('bookGrid');
  if(!grid) return;

  let html='';

  // 本地结果
  if(localBooks.length>0){
    localBooks.forEach(b=>{ html+=bookCard(b,'本校'); });
  }

  // 联网结果
  if(STATE.webResults.length>0){
    html+='<div style="width:100%;padding:14px 16px 4px;font-size:13px;color:var(--text-hint);font-weight:600">🌐 网络搜索结果</div>';
    STATE.webResults.forEach((b,i)=>{ html+=bookCard(b,'网络',i+100); });
  }

  if(localBooks.length===0 && STATE.webResults.length===0 && !STATE.searchingWeb){
    html='<div class="empty-hint">🔍  没有找到相关书籍<br><span style="font-size:13px;color:var(--text-hint);margin-top:8px;display:inline-block">试试开启"联网搜索"获取更多资源</span></div>';
  }

  if(STATE.searchingWeb){
    html+='<div class="loading-spinner" style="width:100%;padding:30px;">正在搜索网络资源...</div>';
  }

  grid.innerHTML=html;

  document.getElementById('emptyHint').style.display='none';

  // 回到顶部
  const bt=document.getElementById('backTop');
  window.addEventListener('scroll',()=>{ bt.classList.toggle('visible',window.scrollY>400); });
}

function bookCard(b, source, idx){
  const id=idx||b.id; const cover=b.cover||GRADIENTS[idx%GRADIENTS.length];
  return `
    <div class="book-card" onclick="openDetail(${id},'${source}')">
      <div class="book-cover" style="background:linear-gradient(135deg,${cover})">📚</div>
      <div class="book-info">
        <div class="b-title">${b.title||'未知书名'}</div>
        <div class="b-press">${b.author||b.press||'未知出版社'}</div>
        <div class="b-price-row"><span class="b-price">¥${b.price||'??'}</span><span class="b-source">${source}</span></div>
      </div>
    </div>`;
}

// 联网搜索（OpenLibrary 免费 API）
async function searchWeb(){
  const keyword=(document.getElementById('searchKey')?.value||'').trim();
  if(!keyword) return toast('请先输入搜索关键词');
  STATE.searchingWeb=true;STATE.webResults=[];renderSearchPage();
  try{
    const resp=await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(keyword)}&limit=8`);
    const data=await resp.json();
    STATE.webResults=(data.docs||[]).filter(d=>d.title).slice(0,8).map(d=>({
      id:Date.now()+Math.random(),title:d.title,author:d.author_name?d.author_name[0]:'未知作者',
      press:d.publisher?d.publisher[0]:'未知出版社',price:d.first_publish_year?d.first_publish_year.toString().slice(-2)+'.00':'??',
      cover:GRADIENTS[Math.floor(Math.random()*GRADIENTS.length)],
      desc:(d.first_publish_year?'出版年份: '+d.first_publish_year+' | ':'')+'ISBN: '+(d.isbn?d.isbn[0]:'未知'),
      owner:'网络来源',_web:true,
    }));
  }catch(e){ toast('联网搜索失败，请检查网络');STATE.webResults=[]; }
  STATE.searchingWeb=false;renderSearchPage();
}

// ===== 书籍详情 =====
function openDetail(bookId, source){
  STATE.currentBookId=bookId;
  let b=MOCK_BOOKS.find(x=>x.id===bookId);
  if(!b){const wb=STATE.webResults.find(x=>x.id===bookId);if(wb) b=wb;}
  if(!b) return;
  document.getElementById('detailSwiper').innerHTML=`<div style="font-size:72px">📚</div>`;
  document.getElementById('detailTitle').textContent=b.title;
  document.getElementById('detailPress').innerHTML=`<span class="detail-tag">${source||'本校'}</span> ${b.press||''} / ${b.author||''}`;
  document.getElementById('detailDesc').textContent=b.desc||'暂无详细描述';
  document.getElementById('detailPrice').textContent=b.price;

  const isFav=STATE.currentUser.favoriteIds.includes(bookId);
  const favBtn=document.getElementById('detailFavBtn');
  favBtn.textContent=isFav?'★ 已收藏':'☆ 收藏';
  favBtn.classList.toggle('liked',isFav);

  const isMine=(!b._web)&&b.owner===STATE.currentUser.name;
  favBtn.style.display=isMine||b._web?'none':'';
  const cb=document.querySelector('.btn-contact');
  if(cb){
    if(b._web){cb.textContent='查看来源';cb.onclick=()=>{window.open('https://openlibrary.org/search?q='+encodeURIComponent(b.title),'_blank');};}
    else if(isMine){cb.textContent='编辑';cb.onclick=()=>openEdit(bookId);}
    else{cb.textContent='联系卖家';cb.onclick=openChat;}
  }
  showPage('detail');
}

function toggleFav(){
  const id=STATE.currentBookId;
  const b=MOCK_BOOKS.find(x=>x.id===id);
  if(!b||b._web) return;
  const idx=STATE.currentUser.favoriteIds.indexOf(id);
  if(idx>-1){STATE.currentUser.favoriteIds.splice(idx,1);document.getElementById('detailFavBtn').textContent='☆ 收藏';document.getElementById('detailFavBtn').classList.remove('liked');toast('已取消收藏');}
  else{STATE.currentUser.favoriteIds.push(id);document.getElementById('detailFavBtn').textContent='★ 已收藏';document.getElementById('detailFavBtn').classList.add('liked');toast('收藏成功 ★');}
  renderMyPage();
}

// ===== 上传 =====
function simulateUpload(){
  document.getElementById('uploadPreview').innerHTML='<div style="font-size:64px;padding:24px;">📚</div><div style="font-size:12px;color:#999">图片已选择（模拟）</div>';
  toast('图片已选择（模拟）');
}
function doUpload(){
  const title=document.getElementById('upTitle').value.trim(),price=document.getElementById('upPrice').value.trim();
  if(!title) return toast('请填写书名');if(!price) return toast('请填写售价');
  toast('发布成功！✨');
  ['upTitle','upPress','upAuthor','upISBN','upPrice','upDetail'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('uploadPreview').innerHTML='<div class="upload-placeholder" onclick="simulateUpload()">📷<br>点击上传图片</div>';
}

// ===== 消息 =====
function renderMessagePage(){
  const list=document.getElementById('msgList');
  if(MOCK_MESSAGES.length===0){list.innerHTML='';document.getElementById('msgEmpty').style.display='block';return;}
  document.getElementById('msgEmpty').style.display='none';
  list.innerHTML=MOCK_MESSAGES.map(m=>{
    const b=MOCK_BOOKS.find(x=>x.id===m.bookId);
    const last=m.msgs[m.msgs.length-1];
    return `<div class="msg-item" onclick="openChat(${m.id})">
      <div class="msg-cover" style="background:linear-gradient(135deg,${b?b.cover:'#ccc'})">📚</div>
      <div class="msg-body"><div class="msg-title">${b?b.title:'未知'}</div><div class="msg-last">${last?last.text:''}</div></div>
      <div class="msg-avatar">${m.otherAvatar}</div></div>`;
  }).join('');
}

// ===== 聊天 =====
let activeChat=null;
function openChat(msgId){
  document.getElementById('page-detail').classList.remove('show');
  document.getElementById('page-edit').classList.remove('show');
  STATE.currentChatId=msgId;
  activeChat=MOCK_MESSAGES.find(m=>m.id===msgId);
  if(!activeChat){
    const b=MOCK_BOOKS.find(x=>x.id===STATE.currentBookId);
    activeChat={id:Date.now(),bookId:STATE.currentBookId,otherUser:b?b.owner:'未知用户',otherAvatar:'👤',msgs:[]};
    MOCK_MESSAGES.push(activeChat);STATE.currentChatId=activeChat.id;
  }
  document.getElementById('navTitle').textContent=activeChat.otherUser;
  renderChat();
  showPage('dialog');
}

function renderChat(){
  if(!activeChat) return;
  const list=document.getElementById('chatList');
  list.innerHTML=activeChat.msgs.map(m=>{
    const isMe=m.from==='me',cls=isMe?'me':'other';
    const avatar=isMe?STATE.currentUser.avatar:activeChat.otherAvatar;
    return isMe?`<div class="chat-msg ${cls}"><div class="chat-bubble">${m.text}</div><div class="chat-avatar">${avatar}</div></div>`
      :`<div class="chat-msg ${cls}"><div class="chat-avatar">${avatar}</div><div class="chat-bubble">${m.text}</div></div>`;
  }).join('');
  setTimeout(()=>{const el=document.getElementById('page-dialog');if(el) el.scrollTop=el.scrollHeight;},60);
}

function sendMsg(){
  const input=document.getElementById('chatInput'),text=input.value.trim();
  if(!text) return;
  if(!activeChat) activeChat={msgs:[]};
  activeChat.msgs.push({from:'me',text});
  input.value='';renderChat();renderMessagePage();
}

// ===== 我的 =====
function renderMyPage(){
  document.getElementById('myName').textContent=STATE.currentUser.name;
  const upBooks=MOCK_BOOKS.filter(b=>STATE.currentUser.uploaded.includes(b.id));
  document.getElementById('myUploadCount').textContent=`共 ${upBooks.length} 本`;
  document.getElementById('myUploadGrid').innerHTML=upBooks.map(b=>bookCard(b,'本校')).join('')||'<div class="empty-hint" style="padding:20px">暂无发布</div>';
  const favBooks=MOCK_BOOKS.filter(b=>STATE.currentUser.favoriteIds.includes(b.id));
  document.getElementById('myFavCount').textContent=`共 ${favBooks.length} 本`;
  document.getElementById('myFavGrid').innerHTML=favBooks.map(b=>bookCard(b,'本校')).join('')||'<div class="empty-hint" style="padding:20px">暂无收藏</div>';
}
function openDetailFromMy(bookId){
  switchTab('search');
  setTimeout(()=>openDetail(bookId,'本校'),120);
}

// ===== 编辑 =====
function openEdit(bookId){
  STATE.editingBookId=bookId;
  const b=MOCK_BOOKS.find(x=>x.id===bookId);if(!b) return;
  document.getElementById('edTitle').value=b.title;document.getElementById('edPress').value=b.press;
  document.getElementById('edAuthor').value=b.author;document.getElementById('edPrice').value=b.price;
  document.getElementById('edDetail').value=b.desc;showPage('edit');
}
function saveEdit(){
  const id=STATE.editingBookId,b=MOCK_BOOKS.find(x=>x.id===id);if(!b) return;
  b.title=document.getElementById('edTitle').value.trim()||b.title;
  b.press=document.getElementById('edPress').value.trim()||b.press;
  b.author=document.getElementById('edAuthor').value.trim()||b.author;
  b.price=document.getElementById('edPrice').value.trim()||b.price;
  b.desc=document.getElementById('edDetail').value.trim()||b.desc;
  toast('修改成功 ✅');
  document.getElementById('page-edit').classList.remove('show');
  document.getElementById('page-detail').classList.remove('show');
  renderSearchPage();renderMyPage();
}
function deleteBook(){
  const id=STATE.editingBookId,idx=MOCK_BOOKS.findIndex(x=>x.id===id);
  if(idx>-1&&confirm('确定删除《'+MOCK_BOOKS[idx].title+'》吗？')){
    MOCK_BOOKS.splice(idx,1);STATE.currentUser.uploaded=STATE.currentUser.uploaded.filter(x=>x!==id);
    STATE.currentUser.favoriteIds=STATE.currentUser.favoriteIds.filter(x=>x!==id);
    toast('已删除');
    document.getElementById('page-edit').classList.remove('show');
    document.getElementById('page-detail').classList.remove('show');
    renderSearchPage();renderMyPage();
  }
}

// ===== 键盘 =====
document.addEventListener('keydown',function(e){
  if(e.key==='Enter'){
    const a=document.activeElement;
    if(a&&a.id==='chatInput') sendMsg();
    else if(a&&a.id==='searchKey') doSearch();
  }
});
