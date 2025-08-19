const db = wx.cloud.database();
const app = getApp()
Page({

  data: {
    image : "/images/imgTest/book3.jpg",
    title : "标题",
    press : "详细信息",
    price:  "价格",
    detail  : "我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述我是描述",
    ID : null

    },

    //图片预览 本地图片无效
  seeImage(event){
    console.log(event.currentTarget.dataset.src)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })

  },
  
  onLoad(load) {
    console.log(load)
    this.setData({
      ID : load._id
    })
    var that = this
    db.collection('bookInfo').where({
      _id : that.data.ID
    }).get({
      success(res){
        console.log(res)
        that.setData({
        title : res.data[0].title,
        press : res.data[0].press,
        detail : res.data[0].detail,
        image : res.data[0].imageHead,
        price : res.data[0].price,
    })
      }
      
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})