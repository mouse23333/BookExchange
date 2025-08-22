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
  onShow() {
    var that = this
    //取得访问我商品的对话
    db.collection('dialogInfo').where(
      cm.or([{
        hostname: app.globalData.userInfo.username
      }, {
        customname: app.globalData.userInfo.username
      }])).get({
      success(res) {
        that.setData({
          dialogs: res.data
        })
      }
    })
  },
  test(){
    console.log(this.data.dialogs)
  }
}) 
// onShow() {
//   const that = this
//   //取得访问我商品的对话
//   db.collection('dialogInfo').where({
//     hostname: app.globalData.userInfo.username
//   }).get({
//     success(res) {
//       //查询到对应商品后,对于每件商品,查询访问者信息
//       res.data.forEach((item) => {
//         db.collection('userInfo').where({
//           username: item.customname
//         }).get({
//           success(resp) {
//             //再查询每本书的信息
//             db.collection('bookInfo').where({
//               _id: item.bookID
//             }).get({
//               success(respo) {
//                 this.data.dialogs = [...that.data.dialogs,{
//                   customInfo : resp.data[0],
//                   hostInfo : app.globalData.userInfo,
//                   bookInfo : respo.data[0],
//                   IamHost : true,
//                   image: bookInfo.imageHead,
//                   title: respo.data[0].title,
//                   last: "聊天示例",
//                   userHead: "/images/icon/search_sl.png"
//                 }]
//                   // IamHost = true,
//                   // hostInfo = app.globalData.userInfo,
//                   // customInfo = resp.data[0],
//                   // bookInfo = respo.data[0],
//                   // console.log(1234)
//               }
//             })
//           }
//         })
//         // this.dataset()
//       })
//     }
//   })
//   //取得我访问商品的对话
//   db.collection('dialogInfo').where({
//     customname: app.globalData.userInfo.username
//   }).get({
//     success(res) {
//       //查询到对应商品后,对于每件商品,查询上传者信息
//       res.data.forEach((item) => {
//         db.collection('userInfo').where({
//           username: item.hostname
//         }).get({
//           success(resp) {
//             //再查询每本书的信息
//             db.collection('bookInfo').where({
//               _id: item.bookID
//             }).get({
//               success(respo) {
//                 this.data.dialogs.push({
//                   customInfo : app.globalData.userInfo,
//                   hostInfo : resp.data[0],
//                   bookInfo : respo.data[0],
//                   IamHost : false,
//                   image: bookInfo.imageHead,
//                   title: respo.data[0].title,
//                   last: "聊天示例",
//                   userHead: "/images/icon/search_sl.png"
//                 })
//                 // IamHost = false,
//                 //   hostInfo = resp.data[0],
//                 //   customInfo = app.globalData.userInfo,
//                 //   bookInfo = respo.data[0]
//               }
//             })
//           }
//         })
//         // this.dataset()
//       })
//     }
//   })
//   console.log(this.data.dialogs)
// },
// // dataset() {
// //   console.log("dataset1")
// //   this.data.dialogs.concat({
// //     image: bookInfo.imageHead,
// //     title: bookInfo.title,
// //     last: "聊天示例",
// //     userHead: "/images/icon/search_sl.png"
// //   })
// // }