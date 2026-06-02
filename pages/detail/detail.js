const db = wx.cloud.database();
const app = getApp()
const cm = db.command

Page({

  data: {
    title: "",
    press: "",
    price: "",
    detail: "",
    ID: null,
    isFavored: false,
    isSelf: false,
    uploader: null
  },

  seeImage(event) {
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },

  onLoad(load) {
    const that = this
    this.setData({ ID: load._id })

    // 加载图书详情
    db.collection('bookInfo').where({ _id: that.data.ID }).get({
      success(res) {
        if (res.data.length > 0) {
          const book = res.data[0]
          that.setData({
            title: book.title,
            press: book.press,
            detail: book.detail,
            imageHead: book.imageHead,
            imageList: book.imageList,
            price: book.price,
            uploader: book.uploadUser,
            isSelf: book.uploadUser === app.globalData.userInfo.username
          })
        }
      }
    })

    // 检查收藏状态（从 globalData 读取，不是数据库）
    this.checkFavorState()
  },

  // onShow 每次显示时检查收藏状态——防止从其他页面回来时状态不同步
  onShow() {
    if (this.data.ID) {
      this.checkFavorState()
    }
  },

  checkFavorState() {
    const favors = app.globalData.userInfo.favor || []
    const isFavored = favors.indexOf(this.data.ID) > -1
    if (isFavored !== this.data.isFavored) {
      this.setData({ isFavored })
    }
  },

  favor() {
    if (this.data.isFavored) {
      // 取消收藏
      this.setData({ isFavored: false })
      const newFavor = (app.globalData.userInfo.favor || []).filter(item => item !== this.data.ID)
      app.globalData.userInfo.favor = newFavor
      wx.setStorageSync('userInfo', app.globalData.userInfo)

      db.collection('userInfo').where({
        username: app.globalData.userInfo.username
      }).update({
        data: { favor: newFavor },
        success() {
          wx.showToast({ icon: 'none', title: '取消收藏' })
        }
      })
    } else {
      // 添加收藏
      // 防止重复
      if ((app.globalData.userInfo.favor || []).indexOf(this.data.ID) > -1) {
        this.setData({ isFavored: true })
        wx.showToast({ icon: 'none', title: '已收藏' })
        return
      }

      this.setData({ isFavored: true })
      app.globalData.userInfo.favor = (app.globalData.userInfo.favor || []).concat(this.data.ID)
      wx.setStorageSync('userInfo', app.globalData.userInfo)

      db.collection('userInfo').where({
        username: app.globalData.userInfo.username
      }).update({
        data: { favor: cm.push(this.data.ID) },
        success() {
          wx.showToast({ icon: 'none', title: '收藏成功' })
        }
      })
    }
  },

  dialog() {
    wx.navigateTo({
      url: '/pages/dialog/dialog?' + "bookid=" + this.data.ID + "&way=detail"
    })
  },

  edit() {
    wx.navigateTo({
      url: '/pages/edit/edit?' + "bookid=" + this.data.ID
    })
  }
})
