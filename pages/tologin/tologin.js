const app = getApp()
Page({
  data: {
    // 判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo') //获取用户信息是否在当前版本可用
  },
  onShow:function(){
    wx.getStorage({
      key: 'param',
      success: function (res) {
        //跳转到设备列表页
        wx.navigateTo({
          url: '/pages/index/index',
        })

      }
    })
  },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
      //向后台请求登录
      this.login(e.detail.userInfo);
    } else {
      //用户按了拒绝按钮
      this.setData({
        isHide: true
      });
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  login: function (userInfo) {
    var that = this;
    wx.login({
      success: res => {
        // 获取到用户的 code 之后：res.code
        console.log("用户的code:" + res.code);
        // 可以传给后台，再经过解析获取用户的 openid
        // 或者可以直接使用微信的提供的接口直接获取 openid ，方法如下：
        if (res.code) {
          console.log("code的值   " + res.code)
          //发起网络请求
          wx.request({
            url: app.globalData.url + '/servlet/login/wx',
            //url:"http://localhost:8080/xydServer/servlet/getopenid",
            data: {
              code: res.code
            },
            header: { //这里写你借口返回的数据是什么类型，这里就体现了微信小程序的强大，直接给你解析数据，再也不用去寻找各种方法去解析json，xml等数据了
              'Content-Type': 'application/json'
            },
            dataType: "json",
            success: function (res) {
              const self = this
              if (res.data.status == "200") {

                //获取到用户凭证 存儲 3rd_session 

                wx.setStorage({
                  key: "param",
                  data: res.data.obj
                })
                that.userInfoSetInSQL(userInfo);
              } else {

              }
            },
            fail: function (res) {
              console.log("======登录失败=======")
            }
          })
        }
      }
    });
  },

  userInfoSetInSQL: function (userInfo) {
    wx.getStorage({
      key: 'param',
      success: function (res) {
        wx.request({
          url: app.globalData.url + '/servlet/user/save',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            param: res.data,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            province: userInfo.province,
            city: userInfo.city,
            country: userInfo.country
          },
          success: function (res) {
//跳转到设备列表页
wx.navigateTo({
  url: '/pages/index/index',
})
          }
        })
      }
    })
  },
})