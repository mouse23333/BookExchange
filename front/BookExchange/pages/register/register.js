const app = getApp()

Page({
  data: {
    account: null,
    ps1: 123,
    ps2: 123
  },
  onshow() {
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '展示信息',
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo
        })
        wx.showToast({
          title: '已授权',
          duration: 500
        })
        // 加入全局变量
        app.globalData.userInfo = res.userInfo
        console.log(app.globalData.userInfo)
      }
    })
  },

  onLoad(){
    console.log(app.globalData.userInfo);
    this.setData({
        userInfo: app.globalData.userInfo
    })
  },
  getUserAccount(event) {
    this.setData({
      account : event.detail.value
    })
  },
  getUserPassword(event) {
    this.setData({
      ps1 : event.detail.value
    })
    console.log(ps1)
  },
  confirmUserPassword(event) {
    this.setData({
      ps2 : event.detail.value
    })
    console.log(ps2)
  },

  regis() {
    var that = this;
    if (!this.registerCheck())return;

    wx.cloud.database().collection('chat_user').where({
      account_id: that.data.account_id
    }).get({
      success(res) {
        console.log(res)
        // 去除重复用户名
        if (res.data.length>0){
          wx.showToast({
            icon : 'error',
            title: '昵称重复',
          })
          return;
        }
        else {
          wx.cloud.database().collection('chat_user').add({
            data:{
              avatarUrl: that.data.userInfo.avatarUrl,
              userName : that.data.userInfo.userName,
              account: that.data.account,
              password: that.data.ps2,
              messengers: []
            },
            success(res){
              console.log(res)
              // 将用户名和密码保存到全局变量 app.globalData中
              app.globalData.userInfo.accoun = that.data.account;
              app.globalData.userInfo.password = that.data.password;
              wx.switchTab({
                url: '/pages/upload/upload',
              })
            }
          })
        }
      }
    })


  },

  registerCheck() {
    if (this.data.ps1 != this.data.ps2) {
      wx.showToast({
        icon :'error',
        title: '密码不相同',
      })
      return false
    } else if (this.data.ps1.length > 20) {
      wx.showToast({
        icon : 'error',
        title: '密码过长',
      })
      return false
    } else if (this.data.account.length > 10) {
      wx.showToast({
        icon : 'error',
        title: '昵称过长',
      })
      return false
    }
    return true
  }
})
