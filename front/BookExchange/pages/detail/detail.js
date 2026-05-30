const db = wx.cloud.database();
const app = getApp()
const cm = db.command
Page({

  data: {
    image: "/images/imgTest/book3.jpg",
    title: "",
    press: "",
    price: "",
    detail: "",
    ID: null,
    isFavored: false,
    isSelf: false,
    uploader: null
  },

  //图片预览 本地图片无效
  seeImage(event) {
    console.log(event.currentTarget.dataset.src)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },
  onLoad(load) {
    const that = this
    console.log(load)
    this.setData({
      ID: load._id
    })

    const IDsetTemp = app.globalData.userInfo.favor
    IDsetTemp.filter(item => item !== this.data.ID)
    db.collection('bookInfo').where({
      _id: that.data.ID
    }).get({
      success(res) {
        console.log(res.data[0])
        that.setData({
          title: res.data[0].title,
          press: res.data[0].press,
          detail: res.data[0].detail,
          imageHead : res.data[0].imageList[0].url,
          imageList: res.data[0].imageList,
          price: res.data[0].price,
          uploader: res.data[0].uploadUser
        })
        
      }
      
    })
    if (app.globalData.userInfo.favor.indexOf(that.data.ID) > -1) {
      setTimeout(() => {
        that.setData({
          isFavored: true
        })
      }, 1500)
    }
      //判断是否是自己发布的商品
      setTimeout(() => {
      console.log(that.data.uploader)
      if (that.data.uploader == app.globalData.userInfo.username)
          that.setData({
            isSelf: true
          }) 
         console.log(this.data.isSelf)
        }, 700)
    

  },

  

  //收藏
  favor() {
    if (this.data.isFavored) {
      this.setData({
        isFavored: false,
      })
      //删除指定元素
      let IDsetTemp = app.globalData.userInfo.favor
      IDsetTemp = app.globalData.userInfo.favor.filter(item => item !== this.data.ID)
      console.log(IDsetTemp)
      db.collection('userInfo').where({
        username: app.globalData.userInfo.username
      }).update({
        data: {
          favor: IDsetTemp
        },
        success() {
          wx.showToast({
            icon: 'none',
            title: '取消收藏'
          })
        }
      })
    } else {
      this.setData({
        isFavored: true,
      })
      //favor数组添加指定元素
      db.collection('userInfo').where({
        username: app.globalData.userInfo.username
      }).update({
        data: {
          favor: db.command.push(this.data.ID)
        },
        success() {
          console.log(1234)
          wx.showToast({
            icon: 'none',
            title: '收藏成功'
          })
        }
      })
    }
  },
  dialog() {
    wx.navigateTo({
      url: '/pages/dialog/dialog?' + "bookid=" + this.data.ID + "&way=detail"
    })
  },
  edit() {
    wx.navigateTo({
      url: '/pages/edit/edit?' + "bookid=" + this.data.ID 
    })
  }
})