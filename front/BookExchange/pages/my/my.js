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
    let imgname = new Date().getTime() + "_" + Math.floor(Math.random()*1000) + ".jpg"
    wx.cloud.uploadFile({
      cloudPath: 'userHead/' + imgname,
      filePath:event.detail.avatarUrl,
      success(res) {
        console.log("上传成功，正确路径：", res.fileID)
      }
    })
    app.globalData.userInfo.userHead = res.fileID
    this.setData({
      userHead: app.globalData.userInfo.userHead
    })
    db.collection('userInfo').where({
      username : app.globalData.userInfo.username
    }).update({
    data :{
      userHead :app.globalData.userInfo.userHead}
    })
  },

  // 图片预览
  seeImage(event) {
    console.log(event.currentTarget.dataset.src)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },

  // 页面跳转
  navi(event){ 
    app.navi(event)
  },

  navigate() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 重新加载数据的方法
  loadData() {
    const that = this;
    // 先清空原有数据，避免重复
    that.setData({
      uploadList: [],
      favorList: [],
      favorIDList: []
    });

    // 加载用户名
    if (app.globalData.userInfo.username != null) {
      that.setData({
        userName: app.globalData.userInfo.username
      });
    }

    // 获取上传列表
    db.collection("bookInfo").where({
      uploadUser: that.data.userName
    }).get({
      success(res) {
        that.setData({
          uploadList: res.data
        });
        console.log("上传列表:", that.data.uploadList);
      }
    });

    //8月26日大改
    // 获取收藏列表
    db.collection("userInfo").where({
      username: that.data.userName
    }).get({
      success(res) {
        if (res.data.length > 0) {
            // 之前的提取favor数组
          that.setData({
            favorIDList: res.data[0].favor || []
          });
          console.log("收藏ID列表:", that.data.favorIDList);
          // 遍历获取收藏的商品详情
          that.data.favorIDList.forEach((item) => {
            db.collection("bookInfo").where({
              _id: item
            }).get({
              success(res) {
                if (res.data.length > 0) {
                  that.setData({
                    favorList: [...that.data.favorList, res.data[0]]
                  });
                  console.log("收藏列表:", that.data.favorList);
                }
              }
            });
          });
        }
      }
    });
  },
  // 页面显示时加载数据（每次显示都会执行）
  onShow() {
    this.loadData();
    this.setData({
      userHead : app.globalData.userInfo.userHead
    })
  },
})