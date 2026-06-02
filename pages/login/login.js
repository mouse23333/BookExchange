const db = wx.cloud.database();
const app = getApp()

Page({
  data: {
    username: "",
    password: "",
    loggingIn: false
  },

  onLoad() {},

  getUserAccount(event) {
    this.setData({ username: event.detail.value });
  },

  getUserPassword(event) {
    this.setData({ password: event.detail.value });
  },

  login() {
    const that = this;
    if (that.data.loggingIn) return;
    that.setData({ loggingIn: true });
    wx.showLoading({ title: '登录中...' });

    db.collection("userInfo").where({
      username: that.data.username,
      password: that.data.password
    }).get({
      success(res) {
        wx.hideLoading();
        that.setData({ loggingIn: false });
        if (res.data.length > 0) {
          app.globalData.userInfo = res.data[0];
          wx.setStorageSync('userInfo', res.data[0]);
          app.getAllInfo();
          wx.switchTab({
            url: '/pages/upload/upload',
            success() {
              wx.showToast({ title: '登录成功', icon: 'success' });
            }
          });
        } else {
          wx.showToast({ icon: 'none', title: '账号或密码有误' });
        }
      },
      fail(err) {
        wx.hideLoading();
        that.setData({ loggingIn: false });
        console.error('登录失败:', err);
        wx.showToast({ icon: 'none', title: '登录失败，请检查网络' });
      }
    });
  },

  regis() {
    wx.navigateTo({ url: '/pages/register/register' });
  },
})