
App({
  globalData: {
    userInfo : {
      username : "",
      password : "",
    }
  },
  
})
wx.cloud.init({
  env: 'cloud1-8g4ft87ldab47757', 
  traceUser: true,
})
const db = wx.cloud.database()