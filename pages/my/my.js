// pages/mine/mine.js
var app = getApp()
Page({
  data: {
    numberofshoppingCarts: 0,//购物车数量
    url: "",
    userName: "",
    motto: 'Hello World',

    // orderItems
    orderItems: [{
        typeId: 0,
        name: '待付款',
        url: 'bill',
        imageurl: '../../utils/img/personal_pay.png',
      },
      {
        typeId: 1,
        name: '文件上传',
        url: 'bill',
        imageurl: '../../utils/img/fileUpload.png',
      },
      {
        typeId: 2,
        name: '已审核',
        url: 'bill',
        imageurl: '../../utils/img/ischeck.png'
      },
      {
        typeId: 3,
        name: '未审核',
        url: 'bill',
        imageurl: '../../utils/img/nocheck.png'
      }
    ],
  },
  //点击未审核事件
  nocheck:function(){
    //跳转到未审核页面
    wx.navigateTo({
      url: '/pages/imageStatus/imageStatus?flag=nocheck',
    })
  },
  //点击已审核事件
  ischeck:function(){
//跳转到已审核页面
wx.navigateTo({
  url: '/pages/imageStatus/imageStatus?flag=check',
})
  },
  //待付款点击事件
  towatipay:function(){
    //跳转到待支付页面
    wx.navigateTo({
      url: '/pages/order/order?flag=frommy',
    })
  },
  //分享
  onShareAppMessage: function() {

    return {
      title: '全民广告',
      desc: '全民广告',
      path: '/pages/index/index' // 路径，传递参数到指定页面。
    }

  },
  //事件处理函数
  toOrder: function() {
    wx.navigateTo({
      url: '../order/order'
    })
  },
  //页面显示
  onShow:function(){
    this.setData({
      numberofshoppingCarts: app.globalData.numberofshoppingCarts,
      num_left: app.globalData.ww / 2

    })
  },
  onLoad: function() {
    app.changeTabBar();
   
    this.setData({
      numberofshoppingCarts: app.globalData.numberofshoppingCarts,
      num_left: app.globalData.ww / 2

    })
    var that = this
    //获取用户信息
    wx.getStorage({
      key: 'param',
      success(res) {
        //向后台请求查询订单
        that.getUserInfo(res.data);
      }
    })


  },
  //获取用户信息函数
  getUserInfo: function(data) {
    var that = this
    wx.request({
      url: app.globalData.url + '/servlet/login/verifyWx',
      data: {
        param: data
      },
      success: function(res) {
        if (res.data.status == "200") {
          that.setData({
            url: res.data.obj.avatarUrl,
            userName: res.data.obj.nickName

          })
        }
      }
    })

  },
  //点击文件上传激发事件
  toFileUpload:function(){
    wx.getStorage({
      key: 'param',
      success: function (res) {
        wx.navigateTo({
          url: '/pages/fileUpload/fileUpload',
        })
      },
      fail:function(){
        wx.navigateTo({
          url: '/pages/index/index',
        })
      }
    })
   
  }
})