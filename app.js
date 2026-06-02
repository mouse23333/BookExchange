// ✅ 真实云开发模式
// 上线/面试演示时使用。

wx.cloud.init({
  env: 'cloud1-d9gwxlght95ab5a3b',  // 🔧 替换为你的新环境ID
  traceUser: true,
});

App({
  globalData: {
    userInfo: {
      username: "",
      password: "",
      _id: "",
      favor: [],
      userHead: null
    }
  },

  onLaunch() {
    if (wx.getStorageSync('userInfo')) {
      this.globalData.userInfo = wx.getStorageSync('userInfo');
      // 从本地存储恢复登录状态
    }
  },

  navi(event) {
    const bookID = event.currentTarget.dataset.src._id;
    wx.navigateTo({
      url: '/pages/detail/detail?_id=' + bookID
    });
  },

  getAllInfo() {
    const app = getApp();
    wx.cloud.database().collection('userInfo').where({
      username: app.globalData.userInfo.username
    }).get({
      success(res) {
        if (res.data.length > 0) {
          app.globalData.userInfo._id = res.data[0]._id;
          app.globalData.userInfo.favor = res.data[0].favor;
        }
      },
      fail(err) {
        console.error('获取用户信息失败:', err);
      }
    });
  }
});
