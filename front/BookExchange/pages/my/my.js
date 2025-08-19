const db = wx.cloud.database();
const app = getApp()
Page({
  data: {
    userHead: '/images/icon/my.png',
    userName: 'default',
    favorList: [],
    uploadList: [],
    favorIDList: [],
    allArr: [1, 2, 3, 4, 5]

  },

  // 获取头像
  choosePhoto(event) {
    console.log(event)
    this.setData({
      userHead: event.detail.avatarUrl
    })
  },
  //图片预览 本地图片无效
  seeImage(event) {
    console.log(event.currentTarget.dataset.src)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })

  },
  //页面跳转
  navi(event){ 
    app.navi(event)
},
  navigate() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  onShow() {
    if (app.globalData.userInfo.username != null)
      this.setData({
        userName: app.globalData.userInfo.username
      })
    const that = this
    db.collection("bookInfo").where({
      uploadUser: that.data.userName
    }).get({
      success(res) {
        that.setData({
          uploadList: res.data
        })
        console.log(that.data.uploadList)
      }
    })
    //提取favor数组
    db.collection("userInfo").where({
      username: that.data.userName
    }).get({
      success(res) {
        that.setData({
          favorIDList: res.data[0].favor
        })
        console.log(that.data.favorIDList) //
        that.data.favorIDList.forEach((item) => {
          console.log(item)
          db.collection("bookInfo").where({
            _id: item
          }).get({
            success(res) {
              console.log(res.data[0])
              that.setData({
                favorList: that.data.favorList.concat(res.data[0])
              })
              console.log(that.data.favorList)
            }
          })
        })
      }
    })
  }
  
})