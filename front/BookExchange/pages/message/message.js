const app = getApp()
const db = wx.cloud.database()
const cm = db.command

Page({
  data: {
    dialogs: []
  },
  everyDialog: {
    IamHost: null,
    bookImage: null,
    userImage: null,
    title: null,
    last: null
  },
  // onShow() {
  //   var that = this
  //   //取得访问我商品的对话
  //   db.collection('dialogInfo').where(
  //     cm.or([{
  //       hostname: app.globalData.userInfo.username
  //     }, {
  //       customname: app.globalData.userInfo.username
  //     }])).get({
  //     success(res) {
  //       that.setData({
  //         dialogs: res.data
  //       })
  //     }
  //   })
  // },
  test(){
    console.log(this.data.dialogs)
  },

onLoad() {
  const that = this
  //取得访问我商品的对话
  db.collection('dialogInfo').where({
    hostname: app.globalData.userInfo.username
  }).get({
    success(res) {
      //查询到对应商品后,对于每件商品,查询访问者信息
      res.data.forEach((item) => {
        db.collection('userInfo').where({
          username: item.customname
        }).get({
          success(resp) { 
            //再查询每本书的信息
            db.collection('bookInfo').where({
              _id: item.bookID
            }).get({
              success(respo) { console.log(resp)
                
                that.data.dialogs.push({
                  dialogInfo : item,
                   customInfo : resp.data[0],
                   hostInfo : app.globalData.userInfo,
                   bookInfo : respo.data[0],
                   IamHost : true,
                   image: respo.data[0].imageHead,
                   title: respo.data[0].title,
                   last: item.dialogs.at(-1).text,
                   userHead: resp.data[0].userHead
                })
                console.log(that.data.dialogs)
                  // IamHost = true,
                  // hostInfo = app.globalData.userInfo,
                  // customInfo = resp.data[0],
                  // bookInfo = respo.data[0],
                  // console.log(1234)
              }
            })
          }
        })
      })
    }
  })
  //取得我访问商品的对话
  db.collection('dialogInfo').where({
    customname: app.globalData.userInfo.username
  }).get({
    success(res) {
      //查询到对应商品后,对于每件商品,查询上传者信息
      res.data.forEach((item) => {console.log(item)
        db.collection('userInfo').where({
          username: item.hostname
        }).get({
          success(resp) {
            //再查询每本书的信息
            db.collection('bookInfo').where({
              _id: item.bookID
            }).get({
              success(respo) {
                
                that.data.dialogs.push({
                  dialogInfo : item,
                   bookInfo : respo.data[0],
                   IamHost : true,
                   image: respo.data[0].imageHead,
                   title: respo.data[0].title,
                   last: item.dialogs.at(-1).text,
                   userHead: resp.data[0].userHead,
                  customInfo : app.globalData.userInfo,
                  hostInfo : resp.data[0],
                })
                console.log(that.data.dialogs)
                // IamHost = false,
                //   hostInfo = resp.data[0],
                //   customInfo = app.globalData.userInfo,
                //   bookInfo = respo.data[0]
              }
            })
          }
        })
      })
      setTimeout(() => {
        that.setData({
          dialogs : that.data.dialogs
        })
      }, 1500)
      console.log(that.data.dialogs)
    }
  })
  },
  seeImage(event){
    console.log(event.currentTarget.dataset.src)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },
  dialog(event){
    const bookinfo = JSON.stringify(event.currentTarget.dataset.src.bookInfo) 
    const custominfo =  JSON.stringify(event.currentTarget.dataset.src.customInfo)
    const dialoginfo =  JSON.stringify(event.currentTarget.dataset.src.dialogInfo)
    const hostinfo =  JSON.stringify(event.currentTarget.dataset.src.hostInfo)
    wx.navigateTo({
      url: '/pages/dialog/dialog?' + 
      "bookinfo=" + bookinfo + 
      "&custominfo=" + custominfo +
      "&dialoginfo=" + dialoginfo +
      "&hostinfo=" + hostinfo +
      "&way=message"
    })
  }

})
// dataset() {
//   console.log("dataset1")
//   this.data.dialogs.concat({
//     image: bookInfo.imageHead,
//     title: bookInfo.title,
//     last: "聊天示例",
//     userHead: "/images/icon/search_sl.png"
//   })
// }




