// pages/order/order.js
const app = getApp()
var common = require("../../utils/Common.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    numberofshoppingCarts: 0, //购物车数量，
    num_left: 0,
    isTipTrue: false,
    sysheight: 0,
    currtab: 1,
    swipertab: [{
      name: '待付款',
      index: 0
    }, {
      name: '已付款',
      index: 1
    }, {
      name: '未完成',
      index: 2
    }],
    pageIndex: 1,
    alreadyOrder: [], //已完成订单数据
    waitPayOrder: [], //未付款订单
    nofinshOrderData: [] //未完成订单数据
  },
  //点击协议同意
  tipAgree: function() {
    //将协议框隐藏
    this.setData({
      isTipTrue: false
    })
    //存储
    wx.setStorage({
      key: "agreement",
      data: true
    })
    //重新加载页面
    this.onLoad()
  },
  //点击协议不同意
  tipNoAgree: function() {
    this.setData({
      isTipTrue: false
    })
  },
  //点击去文件上传时间
  toUploadFile:function(e){
//跳转到文件上传页面
wx.navigateTo({
  url: '/pages/fileUpload/fileUpload?orderNumber='+e.currentTarget.dataset.ordernumber,
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      numberofshoppingCarts: app.globalData.numberofshoppingCarts,
      num_left: app.globalData.ww / 2,
      alreadyOrder: [], //已完成订单数据
      waitPayOrder: [], //未付款订单
      nofinshOrderData: [] //未完成订单数据

    })
    console.log(this.data.alreadyOrder)
    app.changeTabBar();
    var that = this
    var flag = options.flag;
    if (flag == "frommy") {
      //到待支付页面
      that.setData({
        currtab: 0
      })
      that.waitPayShow()
    } else {
      that.alreadyShow()
    }

  },
  // 下拉刷新
  bindscrolltoupper: function() {
    
    this.setData({
      alreadyOrder: [],
      waitPayOrder: [],
      nofinshOrderData: [],
      pageIndex: 1,


    })
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var that = this;
    wx.getStorage({
      key: 'param',
      success(res) {
        //判断是否未支付订单还是已支付订单刷新
        if (that.data.currtab == 1) {
          //已支付订单

          //向后台请求查询订单
          that.selectOrder(res.data, that.data.swipertab[1].index)

        } else if (that.data.currtab == 0) {
          //未支付订单刷新

          //向后台请求查询订单
          that.selectOrder(res.data, that.data.swipertab[0].index)

        }else{
          //未完成
          that.getNoFinshOrder(res.data)
        }

      }
    })



    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this
    //页数+1
    this.setData({
      pageIndex: this.data.pageIndex + 1
    })
    wx.getStorage({
      key: 'param',
      success(res) {

        //判断是否未支付订单还是已支付订单刷新
        if (that.data.currtab == 1) {
          //已支付订单

          //向后台请求查询订单
          that.selectOrder(res.data, that.data.swipertab[1].index)

        } else if (that.data.currtab == 0) {
          //未支付订单刷新

          //向后台请求查询订单
          that.selectOrder(res.data, that.data.swipertab[0].index)

        }else{
          //未完成
          that.getNoFinshOrder(res.data)
        }

      }
    })



  },
  //点击支付
  topay: function(e) {
    var that = this
    common.showLoading("加载中");
    wx.getStorage({
      key: 'agreement',
      success: function(res) {
        var index = e.target.dataset.index;
        var orderId = that.data.alreadyOrder[index].id;
        var price = that.data.alreadyOrder[index].amount
        wx.getStorage({
          key: 'param',
          success: function(res) {
            //统一下单
            that.createUnifiedOrder(orderId, price, res.data);
          },
          fail: function() {
            common.hideLoading()
          }
        })

      },
      fail: function() {
        common.hideLoading()
        that.setData({
          isTipTrue: true
        })
      }
    })


  },
  //统一下单函数
  createUnifiedOrder: function(orderId, price, param) {
    var that = this
    wx.request({
      url: app.globalData.url + '/servlet/payment/createUnifiedOrder',
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // 当method 为POST 时 设置以下 的header 
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {

        openid: param,
        //订单id
        orderId: orderId,
        flag: "waitPay",
        amount: price

      },
      success: function(res) {
        common.hideLoading()
        if (res.data.paySign != '') {

          //这个applyId一定要大写 而且签名的参数和调用方法的参数值一定要统一
          wx.requestPayment({

            'timeStamp': res.data.obj.timeStamp,
            'nonceStr': res.data.obj.nonceStr,
            'package': res.data.obj.orderPackage,
            'signType': 'MD5',
            'paySign': res.data.obj.paySign,
            'success': function(paymentRes) {

              that.onLoad()
              console.log(paymentRes)
              //跳转到文件上传页面
              wx.navigateTo({
                url: '/pages/fileUpload/fileUpload?orderNumber=' + res.data.obj.orderNumber,
              })

            },
            'fail': function(error) {
              console.log(error)
              that.onLoad()
            }
          })
        } else {
          console.log('微信支付接口之前先生成签名失败')
        }



      }
    });
  },
  //查询订单函数
  selectOrder: function(param, flag) {
    var that = this
    wx.request({
      url: app.globalData.url + "/servlet/queryOrders",
      header: {
        'content-type': 'application/x-www-form-urlencoded '
      },
      data: {
        param: param,
        flag: flag,
        pageIndex: that.data.pageIndex


      },
      success: function(res) {
        if (res.data.obj.length > 0) {
          that.setData({
            alreadyOrder: that.data.alreadyOrder.concat(res.data.obj)
          })
        } else {
          wx.showToast({
            title: '没有更多数据了!~',
            icon: 'none'
          })
        }
      }


    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 页面渲染完成
    this.getDeviceInfo()
    //this.orderShow()
  },

  getDeviceInfo: function() {
    let that = this
    wx.getSystemInfo({
      success: function(res) {
        // 获取可使用窗口宽度
        var clientHeight = res.windowHeight;
        // 获取可使用窗口高度
        var clientWidth = res.windowWidth;
        // 算出比例
        //let ratio = 750 / clientWidth;
        // 算出高度(单位rpx)
        //let height = clientHeight * ratio;
        // 设置高度
        that.setData({
          sysheight: clientHeight -92
        });
      }
    });
  },

  /**
   * @Explain：选项卡点击切换
   */
  tabSwitch: function(e) {
   
    var that = this
    if (this.data.currtab === e.target.dataset.current) {
      return false
    } else {
      that.setData({
        currtab: e.target.dataset.current,
        pageIndex: 1,
        alreadyOrder: [],
        waitPayOrder: [],
        nofinshOrderData: [] //未完成订单数据
      })
    }
  },

  tabChange: function(e) {
    this.setData({
      currtab: e.detail.current
    })
    this.orderShow()
  },

  orderShow: function() {
    let that = this
    switch (this.data.currtab) {
      case 1:
        that.alreadyShow()
        break
      case 0:
        that.waitPayShow()
        break
      case 2:
        that.lostShow()
        break
    }
  },
  alreadyShow: function() {
    var that = this
    wx.getStorage({
      key: 'param',
      success(res) {
        that.setData({
          alreadyOrder: []
        })
        //向后台请求查询订单
        that.selectOrder(res.data, that.data.swipertab[1].index)

      }
    })
  },

  waitPayShow: function() {
    var that = this
    wx.getStorage({
      key: 'param',
      success(res) {
        that.setData({
          alreadyOrder: []
        })
        //向后台请求查询订单
        that.selectOrder(res.data, that.data.swipertab[0].index)

      }
    })
  },

  lostShow: function (pageIndex) {
    var that=this
    //向后台请求未完成的订单数据
    wx.getStorage({
      key: 'param',
      success(res) {
that.setData({
  nofinshOrderData:[]
})
        that.getNoFinshOrder(res.data);
      }
    })
  },
  //向后台请求未完成的订单数据
  getNoFinshOrder: function(param) {
    var that = this
    wx.request({
      url: app.globalData.url + '/servlet/getNoFinshOrder',
      data: {
        param: param,
        pageIndex: that.data.pageIndex
      },
      success: function(res) {
        if (res.data.status == "200") {
          if (res.data.obj.length > 0) {
            that.setData({
              nofinshOrderData: that.data.nofinshOrderData.concat(res.data.obj)
            })
          } else {
            wx.showToast({
              title: "~~~没有数据~~~",
              icon: 'none',
              duration: 1000
            })
          }
        } else {
          wx.showToast({
            title: res.data.obj,
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function() {

        wx.showToast({
          title: "服务器正在维护",
          icon: 'none',
          duration: 1000
        })

      }
    })
  }


})