const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    isInput : true,
    title : null,
    press : null,
    author: null,
    ISBN: null,
    price: null,
    detail: null,
    imageList : [],
    cloudpath : "cloud://cloud1-8g4ft87ldab47757.636c-cloud1-8g4ft87ldab47757-1373796402/bookImage/"

  },
  afterRead(event) {
    let that = this
    console.log(event.detail.file.tempFilePath)
    let imgname = 'bookImage/' + new Date().getTime() + "_" +  Math.floor(Math.random()*1000) + ".jpg"
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.cloud.uploadFile({
      cloudPath:imgname,//使用时间戳加随机数给图片命名
      filePath:event.detail.file.tempFilePath,
      success(res) {
        console.log(imgname)
        // 上传完成需要更新 fileList
        
          let path = that.data.cloudpath + imgname
          console.log(that.data.imageList)
          that.data.imageList.push(path),
          setTimeout(() => {
        that.setData({
          imageList : that.data.imageList
        })}, 1000)
        console.log(that.data.imageList)
     
       
      },
    });
  },

//切换业务模式
  outputMode(){
    this.setData({
      isInput : false
    })
    console.log(this.data.isInput)//
  },
  inputMode(){
    this.setData({
      isInput : true
    })
    console.log(this.data.isInput)//
  },

//标题
  titleChange(event){
    console.log(event.detail)//
    this.setData({
      title : event.detail
    })
    console.log("title="+this.data.title)
  },
//出版社
  pressChange(event){
    console.log(event.detail)//
    this.setData({
      press : event.detail
    })
  },
//作者
  authorChange(event) {
    console.log(event.detail)
    this.setData({
      author: event.detail
    })
  },
// ISBN码
  ISBNChange(event) {
    console.log(event.detail)
    this.setData({
      ISBN: event.detail
    })
  },
// 价格
  priceChange(event) {
    console.log(event.detail)
    this.setData({
      price: event.detail
    })
  },
// 详细描述
describeChange(event) {
    console.log(event.detail)
    this.setData({
      detail: event.detail
    })
  },

//上传
  upload(){
    const that = this;
    // 获得输入值，去除首尾空格
    const title = that.data.title?.trim();
    const price = that.data.price?.trim();
    // 校验标题
    if (!title) {
      wx.showToast({
        title: '请填写标题',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 校验出价
    if (!price) {
      wx.showToast({
        title: '请填写出价',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    db.collection("bookInfo").add({
      data:{
      imageList : that.data.imageList,
      imageHead : that.data.imageList[0],
      title : that.data.title,
      press : that.data.press,
      author: that.data.author,
      ISBN: that.data.ISBN,
      price: that.data.price,
      detail: that.data.detail,
      uploadUser: app.globalData.userInfo.username
    },success(res) {
        console.log('上传成功', res)
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 2000
        });
      }, fail(err) {
        console.log('上传失败', err)
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  
  
});