const db = wx.cloud.database();
const app = getApp()

Page({
  data: {
    userHead: '/images/icon/my.png',
    userName: 'default',
    favorList: [],
    uploadList: [],
    favorIDList: []
  },

  // 获取头像
  choosePhoto(event) {
    const that = this
    const imgname = new Date().getTime() + "_" + Math.floor(Math.random() * 1000) + ".jpg"
    wx.cloud.uploadFile({
      cloudPath: 'userHead/' + imgname,
      filePath: event.detail.avatarUrl,
      success(res) {
        console.log("头像上传成功：", res.fileID)
        app.globalData.userInfo.userHead = res.fileID
        that.setData({
          userHead: res.fileID
        })
        db.collection('userInfo').where({
          username: app.globalData.userInfo.username
        }).update({
          data: { userHead: res.fileID }
        })
      }
    })
  },

  // 图片预览
  seeImage(event) {
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },

  // 页面跳转
  navi(event) {
    app.navi(event)
  },

  // 跳转登录
  navigate() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 加载数据
  loadData() {
    const that = this;
    const username = app.globalData.userInfo.username;

    // 重置数据
    that.setData({
      uploadList: [],
      favorList: [],
      favorIDList: [],
      userName: username || 'default',
      userHead: app.globalData.userInfo.userHead || '/images/icon/my.png'
    });

    if (!username) return;

    // 加载上传列表
    db.collection("bookInfo").where({
      uploadUser: username
    }).get({
      success(res) {
        that.setData({ uploadList: res.data })
      }
    });

    // 加载收藏列表
    db.collection("userInfo").where({
      username: username
    }).get({
      success(res) {
        if (res.data.length > 0) {
          const favIDs = res.data[0].favor || [];
          that.setData({ favorIDList: favIDs });
          if (favIDs.length > 0) {
            // 用 Promise.all 替代 forEach 嵌套回调
            const tasks = favIDs.map(id =>
              db.collection("bookInfo").where({ _id: id }).get()
            );
            Promise.all(tasks).then(results => {
              const books = results
                .filter(r => r.data && r.data.length > 0)
                .map(r => r.data[0]);
              that.setData({ favorList: books });
            });
          }
        }
      }
    });
  },

  onShow() {
    this.loadData();
  },
})
