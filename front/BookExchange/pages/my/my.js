// pages/my/my.js
Page({
  data:{
  userHead:'/images/icon/my.png',
  userName:'default',
  infoList:[{
    "image" : "/images/imgTest/book1.jpg",
    "title" : "毛概九九新",
    "press" : "某某出版社",
    "price" : 17.15,
    "detail" : "这是一段描述文本，用于描述该商品。其图片、标题、出版社等信息应全部储存于数据库中。"
  },{
    "image" : "/images/imgTest/errorbook1.jpg",
    "title" : "互联网产品设计",
    "press" : "机械工业出版社",
    "price" : 17.35,
    "detail" : "这是一段描述文本，用于描述该商品。其图片、标题、出版社等信息应全部储存于数据库中。"
  },{
    "image" : "/images/imgTest/book2.jpg",
    "title" : "数学规划",
    "press" : "机械工业出版社",
    "price" : 13.15,
    "detail" : "这是一段描述文本，用于描述该商品。其图片、标题、出版社等信息应全部储存于数据库中。"
  },{
    "image" : "/images/imgTest/book3.jpg",
    "title" : "互联网产品设计思维",
    "press" : "黑马",
    "price" : 27.15,
    "detail" : "这是一段描述文本，用于描述该商品。其图片、标题、出版社等信息应全部储存于数据库中。"
  },{
    "image" : "/images/imgTest/book4.jpg",
    "title" : "111",
    "press" : "某某出版社",
    "price" : 17.34,
    "detail" : "这是一段描述文本，用于描述该商品。其图片、标题、出版社等信息应全部储存于数据库中。"
  },{
    "image" : "/images/imgTest/book5.jpg",
    "title" : "222",
    "press" : "某某出版社",
    "price" : 12.13,
    "detail" : "这是一段描述文本，用于描述该商品。其图片、标题、出版社等信息应全部储存于数据库中。"
  },
  ],

  }, 
  
  // 获取头像
  choosePhoto(event){
    console.log(event)
    this.setData({
      userHead:event.detail.avatarUrl
    })
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
    const imageStr = event.currentTarget.dataset.src.image
    const titleStr = event.currentTarget.dataset.src.title
    const pressStr = event.currentTarget.dataset.src.press
    const priceStr = event.currentTarget.dataset.src.price
    const detailStr = event.currentTarget.dataset.src.detail
    wx.navigateTo({
      url: '/pages/detail/detail?'+
      "image="+imageStr+
      "&title="+titleStr+
      "&press="+pressStr+
      "&price="+priceStr+
      "&detail="+detailStr
      ,
    })
    console.log(event)
  },
  //获取名称
  //待制作


})
