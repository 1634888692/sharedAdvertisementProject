//用户登陆
function userLogin() {
  wx.checkSession({
    success: function () {
      //存在登陆态
      console.log("========存在登录状态=========")
    },
    fail: function () {
      //不存在登陆态
      onLogin()
    }
  })
}

function onLogin() {
  wx.login({
    success: function (res) {
      if (res.code) {
        console.log("code的值   "+res.code)
        //发起网络请求 service.xyd999.net
        wx.request({
          url: 'https://service.xyd999.net/servlet/login/wx',
         
          data: {
            code: res.code
          },
          header: { //这里写你借口返回的数据是什么类型，这里就体现了微信小程序的强大，直接给你解析数据，再也不用去寻找各种方法去解析json，xml等数据了
            'Content-Type': 'application/json'
          },
          dataType:"json",
          success: function (res) {
            const self = this
            if (res.data.status=="200") {
              
              //获取到用户凭证 存儲 3rd_session 
            
              wx.setStorage({
                key: "param",
                data: res.data.obj
              })
              getUserInfo()
            }
            else {

            }
          },
          fail: function (res) {
            console.log("======登录失败=======")
          }
        })
      }
    },
    fail: function (res) {

    }
  })

}

function getUserInfo() {  
  wx.getUserInfo({
    success: function (res) {
      var userInfo = res.userInfo
      userInfoSetInSQL(userInfo)
    },
    fail: function () {
      userAccess()
    }
  })
}

function userInfoSetInSQL(userInfo) {
  wx.getStorage({
    key: 'param',
    success: function (res) {
      wx.request({
        url: 'https://service.xyd999.net/servlet/user/save',
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
         
        }
      })
    }
  })
}
function showLoading(message) {
  if (wx.showLoading) {
    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.showLoading({
      title: message,
      mask: true
    });
  } else {
    // 低版本采用Toast兼容处理并将时间设为20秒以免自动消失
    wx.showToast({
      title: message,
      icon: 'loading',
      mask: true,
      duration: 20000
    });
  }
}

function hideLoading() {
  if (wx.hideLoading) {
    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.hideLoading();
  } else {
    wx.hideToast();
  }
}


module.exports = {
  userLogin: userLogin,
  showLoading: showLoading,
  hideLoading: hideLoading
  
 
}