const app = getApp()
const db = wx.cloud.database()
const cm = db.command
Page({
  data: {
    bookID : null
  },
  onLoad(load){
    const that = this
    that.setData({
      bookID : load.bookid
    })
  }

})