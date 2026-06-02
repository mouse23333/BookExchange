const app = getApp()
const db = wx.cloud.database()
const cm = db.command

Page({
  data: {
    dialogs: []
  },

  // onShow 确保每次切 tab 都刷新
  onShow() {
    this.loadDialogs()
  },

  loadDialogs() {
    const that = this
    const username = app.globalData.userInfo.username
    if (!username) return

    // 并行查询两个方向的对话
    Promise.all([
      db.collection('dialogInfo').where({ hostname: username }).get(),
      db.collection('dialogInfo').where({ customname: username }).get()
    ]).then(([hostRes, customRes]) => {
      // 合并去重
      const seen = new Set()
      const allDialogs = []
      const addDialog = (d, isHost) => {
        if (seen.has(d._id)) return
        seen.add(d._id)
        allDialogs.push({ dialog: d, isHost })
      }
      ;(hostRes.data || []).forEach(d => addDialog(d, true))
      ;(customRes.data || []).forEach(d => addDialog(d, false))

      if (allDialogs.length === 0) {
        // 没有任何对话，直接显示空
        that.setData({ dialogs: [] })
        return
      }

      // 收集所有需要的 user 和 book 查询
      const userIds = new Set()
      const bookIds = new Set()
      allDialogs.forEach(({ dialog, isHost }) => {
        userIds.add(isHost ? dialog.customname : dialog.hostname)
        bookIds.add(dialog.bookID)
      })

      Promise.all([
        userIds.size > 0
          ? db.collection('userInfo').where({ username: cm.in([...userIds]) }).get()
          : Promise.resolve({ data: [] }),
        bookIds.size > 0
          ? db.collection('bookInfo').where({ _id: cm.in([...bookIds]) }).get()
          : Promise.resolve({ data: [] })
      ]).then(([userRes, bookRes]) => {
        // 建索引
        const userMap = {}
        ;(userRes.data || []).forEach(u => { userMap[u.username] = u })
        const bookMap = {}
        ;(bookRes.data || []).forEach(b => { bookMap[b._id] = b })

        // 组装结果
        const dialogs = allDialogs.map(({ dialog, isHost }) => {
          const otherUser = isHost ? userMap[dialog.customname] : userMap[dialog.hostname]
          const book = bookMap[dialog.bookID]
          const msgs = dialog.dialogs || []
          return {
            dialogInfo: dialog,
            customInfo: isHost ? (otherUser || {}) : app.globalData.userInfo,
            hostInfo: isHost ? app.globalData.userInfo : (otherUser || {}),
            bookInfo: book || {},
            IamHost: isHost,
            image: (book && book.imageHead) || '',
            title: (book && book.title) || '',
            last: msgs.length > 0 ? msgs[msgs.length - 1].text : '',
            userHead: (otherUser && otherUser.userHead) || ''
          }
        })

        // 一次 setData，不存在闪烁
        that.setData({ dialogs })
      })
    }).catch(err => {
      console.error('加载消息列表失败:', err)
      wx.showToast({ icon: 'none', title: '加载失败' })
    })
  },

  seeImage(event) {
    wx.previewImage({ urls: [event.currentTarget.dataset.src] })
  },

  dialog(event) {
    const src = event.currentTarget.dataset.src
    const bookinfo = JSON.stringify(src.bookInfo)
    const custominfo = JSON.stringify(src.customInfo)
    const dialoginfo = JSON.stringify(src.dialogInfo)
    const hostinfo = JSON.stringify(src.hostInfo)
    wx.navigateTo({
      url: '/pages/dialog/dialog?' +
        "bookinfo=" + bookinfo +
        "&custominfo=" + custominfo +
        "&dialoginfo=" + dialoginfo +
        "&hostinfo=" + hostinfo +
        "&way=message"
    })
  },

  goSearch() {
    wx.switchTab({ url: '/pages/search/search' })
  }
})
