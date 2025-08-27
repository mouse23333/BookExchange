
App({
  globalData: {
    userInfo : {
      username : "",
      password : "",
      _id : "",
      favor :[],
      userHead : null
    }
  },
  navi(event){
    console.log("navi")//
    const bookID = event.currentTarget.dataset.src._id
    wx.navigateTo({
      url: '/pages/detail/detail?'+"_id="+bookID
    })
  },
  getAllInfo(){
    console.log("info")//
    wx.cloud.database().collection('userInfo').where({
      username : getApp().globalData.userInfo.username
    }).get({
      success(res){
        app.globalData._id = res.data[0]._id,
        app.globalData.favor = res.data[0].favor
      }
    })
  }
})
wx.cloud.init({
  env: 'cloud1-8g4ft87ldab47757', 
  traceUser: true,
})