const db = wx.cloud.database()
const cm = db.command
const app = getApp()

Page({
  data: {
    searchText: "",
    findings: [],
    isEmpty: false
  },

  // 图片预览
  seeImage(event) {
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },

  // 页面跳转
  navi(event) {
    app.navi(event)
  },

  // 回到顶部
  backToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  // 搜索输入
  onChange(event) {
    this.setData({
      searchText: event.detail,
    })
  },

  // 执行搜索
  doSearch() {
    const that = this
    const keyword = that.data.searchText.trim()

    if (!keyword) {
      // 空搜索则显示全部
      db.collection("bookInfo").get({
        success(res) {
          that.setData({
            findings: res.data,
            isEmpty: res.data.length === 0
          })
        }
      })
      return
    }

    wx.showLoading({ title: '搜索中...' })
    db.collection("bookInfo").where(cm.or([
      { title: db.RegExp({ regexp: keyword, options: 'i' }) },
      { press: db.RegExp({ regexp: keyword, options: 'i' }) },
      { detail: db.RegExp({ regexp: keyword, options: 'i' }) },
      { author: db.RegExp({ regexp: keyword, options: 'i' }) },
    ])).get({
      success(res) {
        that.setData({
          findings: res.data,
          isEmpty: res.data.length === 0
        })
        wx.hideLoading()
      },
      fail() {
        wx.hideLoading()
        wx.showToast({ title: '搜索失败，请重试', icon: 'none' })
      }
    })
  },

  // 进入页面展示所有商品
  onShow() {
    this.doSearch()
  }
})
