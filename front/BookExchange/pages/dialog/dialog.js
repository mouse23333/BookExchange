const app = getApp()
const db = wx.cloud.database()
const cm = db.command

Page({
  data: {
    bookID : null,
    dialogInfo : null,
    last : null,
    leftID : null,
    rightID : null,
    way : null
  },
  onLoad(load){
    let that = this
    //拿到书id和进入该页面的方式
    that.setData({
      bookID : load.bookid,
      way : load.way
    })

    //1：其他人访问我的商品，其他人作为cus，其他人在右此时正常；
    //2：我访问其他人商品，我作为cus，我在右此时正常；
    //3：我访问自己的商品和其他人的对话，其他人是cus，这种情况只有可能在message里已存在的对话发生，因此只要判定是否是从detail点进去的就好，从message点进去的直接携带会话id。
    

    if(that.data.way=='detail'){
    //拿到dialog对象
    db.collection('dialogInfo').where({
      bookID : that.data.bookID,
      customname : app.globalData.userInfo.username
    }).get({
      //成功拿到，证明之前有记录，取得更多信息
      success(res){
        that.setData({
          dialogInfo : res.data[0],
          last : res.data[0].dialogs.at(-1),
          rightID : app.globalData.userInfo.username,
          leftID : res.data[0].hostname
        })
        console.log(res)
      },
      //没有成功拿到，创建一个新的记录
      fail(res){
        db.collection('bookInfo').where({
          _id : that.data.bookID
        }).get({
          success(resp){
            db.collection('dialogInfo').add({
              data : {
                bookID : that.data.bookID,
                customname : app.globalData.userInfo.username,
                hostname : resp.data[0].uploadUser,
                dialogs : []
              }
            })
          }
        })
      }
    })
  }
  console.log(that.data.leftID)
}
})