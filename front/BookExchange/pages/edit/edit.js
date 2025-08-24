const app = getApp()
const db = wx.cloud.database()
const cm = db.command
Page({
  data: {
    bookID: null,
    fileList: [],
    titleInput: '',
    pressInput: '',
    authorInput: '',
    ISBNInput: '',
    priceInput: '',
    detailInput: '',
    imageHead: ''
  },

  onLoad(load) {
    const that = this
    const bookID = load.bookid
    that.setData({ bookID })
    
    // 加载书籍数据
    db.collection('bookInfo').doc(bookID).get({
      success(res) {
        const bookData = res.data
        that.setData({
          titleInput: bookData.title || '',
          pressInput: bookData.press || '',
          authorInput: bookData.author || '',
          ISBNInput: bookData.ISBN || '',
          priceInput: bookData.price || '',
          detailInput: bookData.detail || '',
          imageHead: bookData.imageHead || '',
          fileList: bookData.imageHead ? [{ url: bookData.imageHead }] : []
        })
      },
      fail(err) {
        console.error('加载书籍数据失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      }
    })
  },

  // 图片上传处理
  afterRead(event) {
    const that = this
    const { file } = event.detail
    // 上传到云存储
    wx.cloud.uploadFile({
      cloudPath: `bookImages/${Date.now()}-${Math.random()}.png`,
      fileContent: file.path,
      success(res) {
        that.setData({
          imageHead: res.fileID,
          fileList: [{ url: res.fileID }]
        })
      },
      fail(err) {
        console.error('图片上传失败', err)
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
      }
    })
  },

  // 表单变更事件
  titleChange(e) {
    this.setData({ titleInput: e.detail })
  },
  pressChange(e) {
    this.setData({ pressInput: e.detail })
  },
  authorChange(e) {
    this.setData({ authorInput: e.detail })
  },
  ISBNChange(e) {
    this.setData({ ISBNInput: e.detail })
  },
  priceChange(e) {
    this.setData({ priceInput: e.detail })
  },
  describeChange(e) {
    this.setData({ detailInput: e.detail })
  },

  // 保存修改
  upload() {
    const that = this
    const { bookID, titleInput, priceInput, imageHead } = this.data

    // 验证必填项
    if (!titleInput.trim()) {
      return wx.showToast({ title: '请填写标题', icon: 'none' })
    }
    if (!priceInput.trim()) {
      return wx.showToast({ title: '请填写价格', icon: 'none' })
    }

    // 更新数据库
    db.collection('bookInfo').doc(bookID).update({
      data: {
        title: titleInput.trim(),
        press: that.data.pressInput.trim(),
        author: that.data.authorInput.trim(),
        ISBN: that.data.ISBNInput.trim(),
        price: that.data.priceInput.trim(),
        detail: that.data.detailInput.trim(),
        imageHead: imageHead,
        updateTime: new Date()
      },
      success() {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000,
          success() {
            // 返回详情页并刷新
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          }
        })
      },
      fail(err) {
        console.error('修改失败', err)
        wx.showToast({
          title: '修改失败',
          icon: 'none'
        })
      }
    })
  }
})