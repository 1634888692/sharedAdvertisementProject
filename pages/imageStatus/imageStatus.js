// pages/order/order.js
const app = getApp()
var common = require("../../utils/Common.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    numberofshoppingCarts: 0,//购物车数量，
    num_left: 0,
    isTipTrue: false,
    sysheight: 0,
    currtab: 0,
    swipertab: [{ name: '已审核', index: 0 }, { name: '未审核', index: 1 }, { name: '审核未通过', index: 3 }],
    checkpageIndex: 1,
    nocheckpageIndex:1,
    check_data_list: [],//审核数据
    nocheck_data_list:[]//未审核数据
    
  },
  //点击协议同意
  tipAgree: function () {
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
  tipNoAgree: function () {
    this.setData({
      isTipTrue: false
    })
  },
  //点击修改事件
  toUpdate:function(e){
    console.log("修改订单===" + e.currentTarget.dataset.ordernumber)
    //跳转到修改文件页面
    wx.navigateTo({
      url: '/pages/updateFileUpload/updateFileUpload?orderNumber=' + e.currentTarget.dataset.ordernumber,
    })
  },
  //分享
  onShareAppMessage: function () {

    return {
      title: '全民广告',
      desc: '全民广告',
      path: '/pages/index/index' // 路径，传递参数到指定页面。
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      numberofshoppingCarts: app.globalData.numberofshoppingCarts,
      num_left: app.globalData.ww / 2,
      check_data_list: [],//审核数据
      nocheck_data_list: []//未审核数据

    })
    app.changeTabBar();
    var that = this
    var flag = options.flag;
    if (flag == "nocheck") {
      //到未审核页面
      that.setData({
        currtab: 1
      })
      //that.nocheck()
    }else{
      that.check(1)
    }

  },
  // 下拉刷新
  bindscrolltoupper: function () {
    this.setData({
      check_data_list: [],//审核数据
      nocheck_data_list: [],//未审核数据

      
      nocheckpageIndex: 1,
      checkpageIndex:1


    })
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var that = this;
    wx.getStorage({
      key: 'param',
      success(res) {
       //判断是已审核还是未审核刷新
        if (that.data.currtab == 0) {
          //已审核

          //向后台请求
          that.check(1)

        } else if (that.data.currtab == 1) {
          //未支付订单刷新

          //向后台
          that.nocheck(1)

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
  onReachBottom: function () {
    var that = this
    
    wx.getStorage({
      key: 'param',
      success(res) {

        //判断是已审核还是未审核刷新
        if (that.data.currtab == 0) {
          //已审核
          var pageIndex=that.data.checkpageIndex+1

          //向后台请求
          that.check(pageIndex)

        } else if (that.data.currtab == 1) {
          //未审核
          var pageIndex=that.data.nocheckpageIndex+1
          //向后台请求
          that.nocheck(pageIndex)

        }

      }
    })



  },
  
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 页面渲染完成
    this.getDeviceInfo()
    
  },

  getDeviceInfo: function () {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        // 获取可使用窗口宽度
        let clientHeight = res.windowHeight;
        // 获取可使用窗口高度
        let clientWidth = res.windowWidth;
        // 算出比例
        //let ratio = 750 / clientWidth;
        // 算出高度(单位rpx)
        //let height = clientHeight * ratio;
        // 设置高度
        that.setData({
          sysheight: clientHeight-92
        });
      }
    });
  },

  /**
  * @Explain：选项卡点击切换
  */
  tabSwitch: function (e) {
   
    var that = this
    if (this.data.currtab == e.target.dataset.current) {
      return false
    } else {
      that.setData({
        currtab: e.target.dataset.current,
        pageIndex: 1,
        check_data_list: [],//审核数据
        nocheck_data_list: []//未审核数据
      })
    }
  },

  tabChange: function (e) {
    this.setData({ currtab: e.detail.current })
    this.orderShow()
  },

  orderShow: function () {
    let that = this
    switch (this.data.currtab) {
      case 1:
        that.nocheck(1)
        break
      case 0:
        that.check(1)
        break
      case 2:
        that.lostShow()
        break
    }
  },
  check: function (pageIndex) {
    var that = this
    
    console.log("审核")
    var that = this
    wx.getStorage({
      key: 'param',
      success(res) {
        that.setData({
          nocheck_data_list: [],
          nocheckpageIndex:1
        })
        //向后查询数据
        that.getData(res.data, "check", pageIndex)
      }
    })
  },

  nocheck: function (pageIndex) {
    var that=this
    
    console.log("未审核")
    var that = this
    wx.getStorage({
      key: 'param',
      success(res) {
        that.setData({
          check_data_list: [],
          checkpageIndex:1

        })
        //向后查询数据
        that.getData(res.data, "nocheck", pageIndex)
       
      }
    })
  },
  //向后台请求函数
  getData:function(param,flag,pageIndex){
    var that=this
    wx.request({
      url: app.globalData.url+'/servlet/getAdvertisingStatus',
      method:"get",
      data:{
        param:param,
        flag:flag,//flag为check为审核数据，为nocheck为未审核数据
        pageIndex:pageIndex//页数
      },
      success:function(e){
        if(e.data.status=="200"){
          if(e.data.obj.length<=0){
            wx.showToast({
              title: "数据已加载完",
              icon: 'none',
              duration: 1000
            })
          }
          if (flag=="check"){
          //拼装数据
          that.setData({
            check_data_list: that.data.check_data_list.concat(e.data.obj)
          })}else{
            //拼装数据
            that.setData({
              nocheck_data_list: that.data.nocheck_data_list.concat(e.data.obj)
            })
          }
          


        }else{
          wx.showToast({
            title: e.data.msg,
            icon: 'success',
            duration: 1000
          })
        }
      },
      fail(){
        wx.showToast({
          title: "服务器正在维护",
          icon: 'none',
          duration: 1000
        })
      }
    })
  },

  lostShow: function () {
    this.setData({
      lostOrder: [{ name: "跃动体育运动俱乐部(圆明园店)", state: "已取消", time: "2018-10-4 10:00-12:00", status: "未开始", url: "../../images/bad1.jpg", money: "122" }],
    })
  },


})
