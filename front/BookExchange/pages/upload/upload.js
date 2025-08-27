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
    let imgname = new Date().getTime() + "_" + Math.floor(Math.random()*1000) + ".jpg"
    wx.cloud.uploadFile({
      cloudPath: 'bookImage/' + imgname,
      filePath:event.detail.file.tempFilePath,
      success(res) {
        console.log("上传成功，正确路径：", res.fileID) // 云存储
        that.data.imageList.push({ url: res.fileID }) 
        setTimeout(() => {
          that.setData({
            imageList: that.data.imageList
          })
        }, 1000)
      },
    });
  },
  //8月26日-处理图片删除
  onDelete(event) {
      //得到删除的图片
    const { index } = event.detail; 
    // 去掉删除的图片
    const newImageList = this.data.imageList.filter((_, i) => i !== index);
    this.setData({
      imageList: newImageList
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
    // 很重要，不要删掉
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
      imageHead : that.data.imageList[0].url,
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
        // 上传成功后清空所有输入内容
        that.setData({
          title: null,
          press: null,
          author: null,
          ISBN: null,
          price: null,
          detail: null,
          imageList: [],
          // 同步清空输入框绑定的变量（因为wxml中用的是xxxInput）
          titleInput: '',
          pressInput: '',
          authorInput: '',
          ISBNInput: '',
          priceInput: '',
          detailInput: ''
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