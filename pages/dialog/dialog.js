const app = getApp()
const db = wx.cloud.database()
const cm = db.command

Page({
  data: {
    bookID: null,
    dialogInfo: null,
    leftID: null,
    rightID: null,
    way: null,
    inputText: '',
    dialogs: [],
    rightHead: '',
    leftHead: '',
    scrollIntoView: '',
    sending: false
  },

  onLoad(load) {
    let that = this
    that.setData({ way: load.way })

    if (that.data.way === 'detail') {
      that.setData({ bookID: load.bookid })

      db.collection('dialogInfo').where({
        bookID: that.data.bookID,
        customname: app.globalData.userInfo.username
      }).get({
        success(res) {
          if (res.data.length > 0) {
            // 已有对话记录
            const dialog = res.data[0]
            that.setData({
              dialogInfo: dialog,
              rightID: app.globalData.userInfo.username,
              leftID: dialog.hostname,
              dialogs: dialog.dialogs || [],
              rightHead: app.globalData.userInfo.userHead || ''
            })
            // 查对方头像
            db.collection('userInfo').where({ username: dialog.hostname }).get({
              success(resp) {
                if (resp.data.length > 0) {
                  that.setData({ leftHead: resp.data[0].userHead || '' })
                }
              }
            })

          } else {
            // 新对话
            db.collection('bookInfo').where({ _id: that.data.bookID }).get({
              success(resp) {
                if (resp.data.length === 0) return
                const hostname = resp.data[0].uploadUser

                db.collection('dialogInfo').add({
                  data: {
                    bookID: that.data.bookID,
                    customname: app.globalData.userInfo.username,
                    hostname: hostname,
                    dialogs: []
                  },
                  success(addRes) {
                    that.setData({
                      dialogInfo: {
                        _id: addRes._id,
                        bookID: that.data.bookID,
                        customname: app.globalData.userInfo.username,
                        hostname: hostname,
                        dialogs: []
                      },
                      dialogs: [],
                      rightID: app.globalData.userInfo.username,
                      leftID: hostname,
                      rightHead: app.globalData.userInfo.userHead || ''
                    })
                    // 查对方头像
                    db.collection('userInfo').where({ username: hostname }).get({
                      success(userRes) {
                        if (userRes.data.length > 0) {
                          that.setData({ leftHead: userRes.data[0].userHead || '' })
                        }
                      }
                    })
                  }
                })
              }
            })
          }
        }
      })

    } else if (that.data.way === 'message') {
      const dialogInfo = JSON.parse(load.dialoginfo)
      const customInfo = JSON.parse(load.custominfo)
      const hostInfo = JSON.parse(load.hostinfo)

      that.setData({
        dialogInfo: dialogInfo,
        dialogs: dialogInfo.dialogs || [],
        rightID: app.globalData.userInfo.username === customInfo.username ? customInfo.username : hostInfo.username,
        leftID: app.globalData.userInfo.username === hostInfo.username ? customInfo.username : hostInfo.username,
        rightHead: app.globalData.userInfo.userHead || '',
        leftHead: app.globalData.userInfo.username === hostInfo.username
          ? (customInfo.userHead || '')
          : (hostInfo.userHead || '')
      })
    }
  },

  // 页面渲染完成后滚到底部
  onReady() {
    this.scrollToBottom()
  },

  scrollToBottom() {
    const that = this
    // 先更新 scrollIntoView 触发滚动
    if (that.data.dialogs && that.data.dialogs.length > 0) {
      const lastIndex = that.data.dialogs.length - 1
      that.setData({
        scrollIntoView: 'msg-' + lastIndex
      })
    }
  },

  input(event) {
    this.setData({ inputText: event.detail.value })
  },

  publish() {
    let that = this
    if (!that.data.inputText || that.data.inputText.trim() === '') {
      wx.showToast({ icon: 'none', title: '不可发送空白消息' })
      return
    }
    if (that.data.sending) return

    const text = that.data.inputText.trim()
    const newMsg = { name: that.data.rightID, text: text }
    const updatedDialogs = [...that.data.dialogs, newMsg]
    that.setData({
      dialogs: updatedDialogs,
      inputText: '',
      sending: true
    }, () => {
      that.scrollToBottom()
    })

    db.collection('dialogInfo').doc(that.data.dialogInfo._id).update({
      data: {
        dialogs: cm.push(newMsg)
      },
      success() {
        that.setData({ sending: false })
      },
      fail(err) {
        that.setData({ sending: false })
        console.error('消息发送失败:', err)
        wx.showToast({ icon: 'none', title: '发送失败' })
        that.setData({ dialogs: that.data.dialogs.slice(0, -1) })
      }
    })
  },

  onUnload() {
    // 回去后刷新消息列表——尝试找到 message 页面
    const pages = getCurrentPages()
    // pages 栈: [..., detail/message, dialog]，我们要找 message 页面
    for (let i = pages.length - 2; i >= 0; i--) {
      const page = pages[i]
      if (page && page.route === 'pages/message/message' && typeof page.onShow === 'function') {
        // 退出后 message 页会走 onShow 自动刷新，不需要手动调
        break
      }
    }
  }
})
