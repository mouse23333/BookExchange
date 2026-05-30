
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
  onLaunch(){
    if(wx.getStorageSync('userInfo')){
      this.globalData.userInfo = wx.getStorageSync('userInfo')
      console.log('get storage')
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
    const app = getApp()
    wx.cloud.database().collection('userInfo').where({
      username : app.globalData.userInfo.username
    }).get({
      success(res){
        if (res.data.length > 0) {
          app.globalData.userInfo._id = res.data[0]._id
          app.globalData.userInfo.favor = res.data[0].favor
        }
      }
    })
  }
})

wx.cloud.init({
  env: 'cloud1-8g4ft87ldab47757',
  traceUser: true,
})