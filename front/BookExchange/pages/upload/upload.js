const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    isInput : true
  },

  //切换业务模式
  outputMode(){
    this.setData({
      isInput : false
    })
    console.log(this.data.isInput)//
  },
  inputMode(){
    this.setData({
      isInput : true
    })
    console.log(this.data.isInput)//
  }
});