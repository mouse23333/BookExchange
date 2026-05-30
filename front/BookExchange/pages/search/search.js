const db = wx.cloud.database()
const cm = db.command
const app = getApp()

Page({
  data: {
  defaultInfo:{
      "image" : "cloud://cloud1-8g4ft87ldab47757.636c-cloud1-8g4ft87ldab47757-1373796402/bookImage(test)/book1.jpg",
      "title" : "null",
      "press" : "null",
      "price" : 99.99,
      "detail" : "null，描述文本"
  },
    infoList:[],
    searchText : "",
    findings:[],
    isEmpty:false
  },

  //图片预览 本地图片无效
  seeImage(event){
    console.log(event.currentTarget.dataset.src)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })

  },
  
  //页面跳转 
  navi(event){ 
       app.navi(event)
  },
  //回到顶端
  backToTop(){
    console.log(2)
    wx.pageScrollTo({
      scrollTop: 0
  })
  },
  
//  上拉刷新 接入云开发后这个尚不清楚 先不启用
  onReachBottom() {
    // 添加16个对象 这个需要改
    // for (let index = 0; index < 16; index++) {
    //   this.setData({
    //   infoList:[...this.data.infoList,this.data.defaultInfo]
    //   })
    // }
    // console.log(1)
  },

  //点击右上角分享
  //onShareAppMessage() {}

  //搜索事件
  onChange(event) {
    this.setData({
      searchText: event.detail,
    })
    console.log(this.data.searchText)
  },
  onClick(){
    const that = this
    db.collection("bookInfo").where(cm.or([
      {title:db.RegExp({
        regexp: that.data.searchText,  // 匹配包含该字符串的任意位置
        options: 'i'  
      })},
      {press:db.RegExp({
        regexp: that.data.searchText,  // 匹配包含该字符串的任意位置
        options: 'i'  
      })},
      {detail:db.RegExp({
        regexp: that.data.searchText,  // 匹配包含该字符串的任意位置
        options: 'i'  
      })},
    ]
    )).get({
      success(res){
        that.setData({
          findings : res.data
        })
        console.log(that.data.findings)//
        if(that.data.findings.length == 0)
        that.setData({
          isEmpty : true
        })
      }
    })
  },

  //进入页面展示所有商品
  onShow(){
    this.onClick()
  }
})