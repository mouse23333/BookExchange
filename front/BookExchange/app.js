
App({
  globalData: {
    userInfo : {
      username : "",
      password : "",
    }
  },
  navi(event){
    console.log("navi")//
    const bookID = event.currentTarget.dataset.src._id
    wx.navigateTo({
      url: '/pages/detail/detail?'+"_id="+bookID
    })
  }
})
wx.cloud.init({
  env: 'cloud1-8g4ft87ldab47757', 
  traceUser: true,
})
const db = wx.cloud.database()