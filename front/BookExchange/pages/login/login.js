
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
     // 调用微信小程序的 wx.request 方法来发起网络请求
     //需要写一个方法，跟据用户输入的数据，进入后端的数据库进行查找
     wx.request({
      // 请求的 URL 地址
      url: 'https://applet-base-api-t.itheima.net/api/get',
      // 请求的方法，这里是 GET 方法
      method: 'GET',
      // 请求时携带的数据，这里传递了 name 和 age 两个参数
      data: {
          name: '张三', 
          age: 31     
      },
      // 请求成功的回调函数，res 是响应对象
      success: (res) => {
          // 在控制台打印响应的数据
          console.log(res.data)
          //这里的if条件可能需要修改。如何跟据res的内容判断登录的成功失败？
          if(res.data.length>0){
            wx.showToast({
              title: '登陆成功',
            })
        }
  else {
      wx.showToast({
        icon: 'none',
        title: '账号密码错误',
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