const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    account: "",
    password: "",
    passwordConfirm: ""
  },
  onLoad() {},
  getUserAccount(event) {
    this.setData({
      username: event.detail.value
    })
    console.log(this.data.username.length) //
  },
  getUserPassword(event) {
    this.setData({
      password: event.detail.value
    })
    console.log(this.data.password) //
  },
  confirmUserPassword(event) {
    this.setData({
      passwordConfirm: event.detail.value
    })
    console.log(this.data.passwordConfirm) //
  },

  regis() {
    var that = this;
    //检查输入
    if (!this.registerCheck()) return

    db.collection("userInfo").where({
      username: this.data.username
    }).get({
      success(res) {
        if (res.data.length > 0) {
          wx.showToast({
            icon: 'error',
            title: '用户名已被使用',
          })
          return
        }

        //通过检查
        console.log("pass") //
        db.collection('userInfo').add({
          data: {
            // avatarUrl: that.data.userInfo.avatarUrl,
            username: that.data.username,
            password: that.data.passwordConfirm,
            favor : [],
            
            // messengers: []
          },
          success(res) {
            console.log(res)
            // 将用户名和密码保存到全局变量中
            app.globalData.userInfo.username = that.data.username;
            app.globalData.userInfo.password = that.data.password;
            app.getAllInfo()
            wx.switchTab({
              url: '/pages/upload/upload',
              success(res) {
                wx.showToast({
                  title: '注册成功',
                  icon: 'success'
                })

              }

            })
          }
        })
      }



    })
  },

  registerCheck() {
    if (this.data.password != this.data.passwordConfirm) {
      wx.showToast({
        icon: 'error',
        title: '输入的密码不同',
      })
      return false
    } else if (this.data.password.length > 20) {
      wx.showToast({
        icon: 'error',
        title: '密码过长',
      })
      return false
    } else if (this.data.username.length > 10) {
      wx.showToast({
        icon: 'error',
        title: '用户名过长',
      })
      return false
    } else if (this.data.username.length == 0) {
      wx.showToast({
        icon: 'error',
        title: '用户名不能为空',
      })
      return false
    } else if (this.data.password.length == 0) {
      wx.showToast({
        icon: 'error',
        title: '密码不能为空',
      })
      return false
    } else {
      console.log(123)
      return true
    }

  }
})