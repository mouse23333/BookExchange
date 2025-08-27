const app = getApp()
const db = wx.cloud.database()
const cm = db.command

Page({
  data: {
    bookID: null,
    dialogInfo: null,
    last: null,
    leftID: null,
    rightID: null,
    way: null,
    inputText: null,
    dialogs: null,
    test : 111,
    scrollTop : 0
  },
  onLoad(load) {
    console.log(load)
    let that = this
    //拿到进入该页面的方式
    that.setData({
      way: load.way
    })

    //1：其他人访问我的商品，其他人作为cus，其他人在右此时正常；
    //2：我访问其他人商品，我作为cus，我在右此时正常；
    //3：我访问自己的商品和其他人的对话，其他人是cus，这种情况只有可能在message里已存在的对话发生，因此只要判定是否是从detail点进去的就好，从message点进去的直接携带会话id。


    if (that.data.way == 'detail') {
      that.setData({
        bookID: load.bookid
      })
      //拿到dialog对象
      console.log(that.data.bookID)
      db.collection('dialogInfo').where({
        bookID: that.data.bookID,
        customname: app.globalData.userInfo.username
      }).get({
        success(res) {
          if (res.data.length > 0) {
            console.log(res.data)
            //成功拿到，证明之前有记录，取得更多信息
            setTimeout(() => {
              that.setData({
                dialogInfo: res.data[0],
                last: res.data[0].dialogs.at(-1).text,
                rightID: app.globalData.userInfo.username,
                leftID: res.data[0].hostname,
                dialogs: res.data[0].dialogs,
                rightHead : app.globalData.userInfo.userHead,
              })
            }, 500)
            db.collection('userInfo').where({
              username : res.data[0].hostname
            }).get({
              success(resp){console.log(resp)
                that.setData({
                  leftHead : resp.data[0].userHead
                })
              }
            })
            console.log(res)
          } else {
            //没有成功拿到，创建一个新的记录
            db.collection('bookInfo').where({
              _id: that.data.bookID
            }).get({
              success(resp) {
                console.log(resp)
                db.collection('dialogInfo').add({
                  data: {
                    bookID: that.data.bookID,
                    customname: app.globalData.userInfo.username,
                    hostname: resp.data[0].uploadUser,
                    dialogs: [],
                  },
                  success(res) {
                    console.log(res)
                    that.setData({
                      _id: res._id,
                      dialogs: [],
                      last: null,
                      rightID: app.globalData.userInfo.username,
                      leftID: resp.data[0].uploadUser,
                      rightHead : app.globalData.userInfo.userHead,
                success(res){
                  db.collection('userInfo').where({
                    username : res.data[0].hostname
                  }).get({
                    success(res){
                      that.setData({
                        leftHead : res.data[0].userHead
                      })
                    }
                  })
                }
                    })
                    setTimeout(() => {
                      db.collection('dialogInfo').where({
                        bookID: that.data.bookID,
                        customname: app.globalData.userInfo.username
                      }).get({
                        success(res) {
                          that.setData({
                            dialogInfo: res.data[0]
                          })
                        }
                      }, 500)
                    })
                  }
                })
              }
            })
          }
        },
      })
      //从消息页面来
    } else if (that.data.way == 'message') {
      setTimeout(() => {
        const dialogInfo = JSON.parse(load.dialoginfo)
        const customInfo =JSON.parse(load.custominfo)
        const hostInfo =JSON.parse(load.hostinfo)
        const bookInfo =JSON.parse(load.bookinfo)
        console.log(dialogInfo)
        that.setData({
          dialogInfo: dialogInfo,
          last: dialogInfo.dialogs.at(-1).text,
          rightID: app.globalData.userInfo.username == customInfo.username ? customInfo.username : hostInfo.username,
          leftID:app.globalData.userInfo.username == hostInfo.username ?
            customInfo.username : hostInfo.username,
          dialogs: dialogInfo.dialogs,
          rightHead : app.globalData.userInfo.userHead,
          leftHead :app.globalData.userInfo.username == hostInfo.username ?
          customInfo.userHead : hostInfo.userHead,
        })
      }, 500)
    }

  },
  onShow(){
    let that = this;
    wx.createSelectorQuery().select('#viewCommunicationBody').boundingClientRect(function (rect) {
      wx.pageScrollTo({
        scrollTop: rect.height,
        duration: 100 
      })
      that.setData({
        scrollTop: rect.height - that.data.scrollTop
      });
    }).exec();
    
  },
  input(event) {
    this.setData({
      inputText: event.detail.value
    })
    console.log(this.data.inputText)
  },
  publish() {
    let that = this
    if (that.data.inputText == null) {
      wx.showToast({
        icon: 'none',
        title: '不可发送空白消息',
      })
      return
    } else {
      console.log(that.data.leftID)
      db.collection('dialogInfo').where({
        _id: that.data.dialogInfo._id
      }).update({
        data: {
          dialogs: cm.push({
            name: that.data.rightID,
            text: that.data.inputText
          })
        }
      })

      that.addDialogs()
      
      setTimeout(() => {
      this.setData({
        inputText: ''
      });
    }, 500)

    }
  },
  addDialogs(){
    let that = this
    setTimeout(() => {
    that.setData({
      dialogs: [...that.data.dialogs,{
        name: that.data.rightID,
        text: that.data.inputText
    }]
  })
}, 500)
},
onUnload(){
  let pages = getCurrentPages();
  console.log(pages.length)
  
    let prevPage = null; //上一个页面

    if (pages.length >= 2) {
      prevPage = pages[pages.length - 2]; //上一个页面
      if (prevPage) {
        prevPage.setData({
          dialogs : []
        })
        prevPage.onLoad()
      }
      // //给当前页面赋值 
      // this.setData({
      //   index: e.detail.value
      // })
}
}
})