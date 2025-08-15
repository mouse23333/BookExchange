
//获取全局变量
const app = getApp()

Page({
  data: {
    account : null,
    password : null
  },

  //userInfo非空，即存在先前登录的信息时，不需要进行登录注册，直接进入
  onLoad() {
    console.log(app.globalData.userInfo)
    if (app.globalData.userInfo!=null){
      wx.switchTab({
        url: '/pages/upload/upload',
      })
    }
  },

  //获取输入的账号密码
  getUserAccount(event) {
    this.setData({
      account_id : event.detail.value
    })
  },
  getUserPassword(event) {
    this.setData({
      password : event.detail.value
    })
  },

  //登录
  login() {
    var that = this;
    //微信云开发下的数据库查找，需要修改
    // 微信小程序如何进行数据库的连接？如何从服务器的数据库处实现这一操作呢？
    wx.cloud.database().collection('chat_user').where({
      account_id: that.data.account,
      password: that.data.password
    }).get({
        success(res) {
            console.log(res)
            if(res.data.length>0){
                // 拿到 _id
                app.globalData.userInfo = res.data[0]
                wx.setStorageSync('userInfo', res.data[0])
                wx.switchTab({
                  url: '/pages/message/message',
                  success(res){
                      wx.showToast({
                        title: '登陆成功',
                      })
                  }
                })
            } else {
                wx.showToast({
                  icon: 'none',//这里可能需要改
                  title: '您的账号或密码输入错误',
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