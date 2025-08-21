//连接数据库
const db = wx.cloud.database();
//获取全局变量
const app = getApp()

Page({
  data: {
    username: "",
    password: ""
  },

  //userInfo非空，即存在先前登录的信息时，不需要进行登录注册，直接进入。这个方法需要修改
  onLoad() {
    //  db.collection("userInfo");
    // console.log(app.globalData.userInfo)
    //  if (app.globalData.userInfo.username == "") {
    //    wx.switchTab({
    //      url: '/pages/upload/upload',
    //    })
    //  }
  },

  //获取输入的账号密码
  getUserAccount(event) {
    this.setData({
      username: event.detail.value
    })
  },
  getUserPassword(event) {
    this.setData({
      password: event.detail.value
    })
  },
  login() {
    var that = this
    db.collection("userInfo").where({
      username: that.data.username,
      password: that.data.password
    }).get({
      success(res) {
        console.log(res.data[0])
        //判断登录是否成功  
        if (res.data.length > 0) {
          app.globalData.userInfo = res.data[0]
          wx.setStorageSync('userInfo', res.data[0])
          app.getAllInfo()
          wx.switchTab({
            url: '/pages/upload/upload',
            success(res) {
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              })
            }
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '账号或密码有误',
          })
        }
      }
    })
  },

  regis() {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },


})