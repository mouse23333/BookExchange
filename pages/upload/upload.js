const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    title: null,
    press: null,
    author: null,
    ISBN: null,
    price: null,
    detail: null,
    imageList: [],
    imgnum: 0,
    uploading: false
  },

  afterRead(event) {
    const imgname = new Date().getTime() + "_" + Math.floor(Math.random() * 1000) + ".jpg"
    wx.cloud.uploadFile({
      cloudPath: 'bookImage/' + imgname,
      filePath: event.detail.file.tempFilePath,
      success(res) {
        that.setData({
          imageList: [...that.data.imageList, { url: res.fileID }],
          imgnum: that.data.imgnum + 1
        })
      },
      fail(err) {
        console.error('图片上传失败:', err)
        wx.showToast({ icon: 'none', title: '图片上传失败' })
      }
    })
  },

  onDelete(event) {
    const { index } = event.detail
    const newImageList = this.data.imageList.filter((_, i) => i !== index)
    this.setData({ imageList: newImageList, imgnum: this.data.imgnum - 1 })
  },

  titleChange(event) {
    this.setData({ title: event.detail })
  },

  pressChange(event) {
    this.setData({ press: event.detail })
  },

  authorChange(event) {
    this.setData({ author: event.detail })
  },

  ISBNChange(event) {
    this.setData({ ISBN: event.detail })
  },

  priceChange(event) {
    this.setData({ price: event.detail })
  },

  describeChange(event) {
    this.setData({ detail: event.detail })
  },

  upload() {
    const that = this
    if (that.data.uploading) return
    const title = (that.data.title || '').trim()
    const price = (that.data.price || '').trim()

    if (!title) {
      wx.showToast({ title: '请填写标题', icon: 'none', duration: 2000 })
      return
    }
    if (!price) {
      wx.showToast({ title: '请填写价格', icon: 'none', duration: 2000 })
      return
    }
    if (that.data.imageList.length === 0) {
      wx.showToast({ title: '请至少上传一张图片', icon: 'none', duration: 2000 })
      return
    }

    that.setData({ uploading: true })
    wx.showLoading({ title: '发布中...' })

    db.collection("bookInfo").add({
      data: {
        imageList: that.data.imageList,
        imageHead: that.data.imageList[0].url,
        title: title,
        press: that.data.press,
        author: that.data.author,
        ISBN: that.data.ISBN,
        price: price,
        detail: that.data.detail,
        uploadUser: app.globalData.userInfo.username
      },
      success() {
        that.setData({ uploading: false })
        wx.hideLoading()
        wx.showToast({ title: '发布成功', icon: 'success', duration: 2000 })
        that.setData({
          title: null, press: null, author: null, ISBN: null, price: null,
          detail: null, imageList: [], imgnum: 0,
          titleInput: '', pressInput: '', authorInput: '',
          ISBNInput: '', priceInput: '', detailInput: ''
        })
      },
      fail(err) {
        that.setData({ uploading: false })
        wx.hideLoading()
        console.error('发布失败:', err)
        wx.showToast({ title: '发布失败', icon: 'none', duration: 2000 })
      }
    })
  }
})
