const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    account: "",
    password: "",
    passwordConfirm: "",
    registering: false
  },

  onLoad() {},

  getUserAccount(event) {
    this.setData({ account: event.detail.value });
  },

  getUserPassword(event) {
    this.setData({ password: event.detail.value });
  },

  confirmUserPassword(event) {
    this.setData({ passwordConfirm: event.detail.value });
  },

  regis() {
    const that = this;

    if (that.data.registering) return;
    if (!that.registerCheck()) return;

    that.setData({ registering: true });
    wx.showLoading({ title: '注册中...' });

    const account = (that.data.account || '').trim();

    db.collection("userInfo").where({
      username: account
    }).get({
      success(res) {
        if (res.data.length > 0) {
          that.setData({ registering: false });
          wx.hideLoading();
          wx.showToast({ icon: 'error', title: '用户名已被使用' });
          return;
        }

        db.collection('userInfo').add({
          data: {
            username: account,
            password: that.data.passwordConfirm,
            favor: []
          },
          success(addRes) {
            that.setData({ registering: false });
            wx.hideLoading();
            app.globalData.userInfo.username = account;
            app.globalData.userInfo.password = that.data.passwordConfirm;
            app.globalData.userInfo._id = addRes._id;
            app.globalData.userInfo.favor = [];
            wx.setStorageSync('userInfo', app.globalData.userInfo);
            wx.switchTab({
              url: '/pages/upload/upload',
              success() {
                wx.showToast({ title: '注册成功', icon: 'success' });
              }
            });
          },
          fail(err) {
            that.setData({ registering: false });
            wx.hideLoading();
            console.error('注册写入失败:', err);
            wx.showToast({ icon: 'error', title: '注册失败，请重试' });
          }
        });
      },
      fail(err) {
        that.setData({ registering: false });
        wx.hideLoading();
        console.error('注册查重失败:', err);
        wx.showToast({ icon: 'error', title: '网络异常，请重试' });
      }
    });
  },

  registerCheck() {
    const account = (this.data.account || '').trim();
    const pwd = this.data.password || '';
    const pwdConfirm = this.data.passwordConfirm || '';

    if (pwd !== pwdConfirm) {
      wx.showToast({ icon: 'error', title: '两次输入的密码不同' });
      return false;
    }
    if (pwd.length > 20) {
      wx.showToast({ icon: 'error', title: '密码过长（最多20位）' });
      return false;
    }
    if (account.length > 10) {
      wx.showToast({ icon: 'error', title: '用户名过长（最多10位）' });
      return false;
    }
    if (account.length === 0) {
      wx.showToast({ icon: 'error', title: '用户名不能为空' });
      return false;
    }
    if (pwd.length === 0) {
      wx.showToast({ icon: 'error', title: '密码不能为空' });
      return false;
    }
    return true;
  }
})