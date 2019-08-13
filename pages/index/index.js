//index.js
//获取应用实例
const app = getApp()
var plugin = requirePlugin("myPlugin");
var common = require("../../utils/Common.js")
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var param
var i = 0;

Page({
  data: {
    dropDownMenuTitle: ['地区', '行业', '价格', '排序'],
    dropDownMenuFourthData: [{ id: 1, title: '智能排序' }, { id: 2, title: '发布时间' }, { id: 3, title: '距离优先' }],
    dropDownMenuSecondData: [
    ],
    dropDownMenuThirdData: [
      { id: 1, title: '0-5' },
      { id: 2, title: '5-10' }, { id: 3, title: '10-15' }, { id: 4, title: '15-20' }],
    adcode: 0,//区划代码
    industryId: -1,//行业id
    price: "0-20",//价格
    //排序数据
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    city: app.globalData.defaultCity, //城市
    good_box_hidden: true,
    TotalNumber: 0,
    num_top: 0, //购物车数量显示位置
    num_left: 0, //购物车数量显示位置
    bus_x: 0,
    bus_y: 0,
    tabbar: {},
    page: 0,
    hide_good_box: true,
    /**
     * 图片url列表
     */
    imgArrUrl: [],
    list_data: [],
    inputVal: "",
    latitude: 0,
    longitude: 0,
    screenWidth: 0,
    screenHeight: 0,
    numberofshoppingCarts: 0, //购物车数量
    selectshow: true, //选中按钮是否隐藏
    inputVal: "", //关键字,
    bottomShow: true,
    totalCount: 0 //总的个数
  },
  //点击加入购物车
  addShop: function(e) {
    var that = this
    wx.getStorage({
      key: 'param',
      success: function(res) {
        //产品id
        var pid = e.currentTarget.dataset.pid;
        that.addShop1(pid, res.data);

      },
      fail: function() {
        //跳转到授权

        wx.navigateTo({
          url: '/pages/tologin/tologin',
        })
      }
    })

  },
  //加入购物车函数
  addShop1: function(pid, param) {
    var that = this
    wx.request({
      url: app.globalData.url + '/servlet/shoppingCart/add',
      method: "POST",
      data: {
        productId: pid,
        openId: param,
        flag: "addIndex"
      },
      success: function(res) {
        if (res.data.status == "200") {
          //购物车增加1
          that.setData({
            numberofshoppingCarts: that.data.numberofshoppingCarts + 1
          })

          app.globalData.numberofshoppingCarts = app.globalData.numberofshoppingCarts + 1
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 1000
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 1000
          })
        }


      },
      fail: function() {
        wx.showToast({
          title: '添加失败',
          icon: 'success',
          duration: 1000
        })
      }
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
  getUserLocation: function() {
    let vm = this;
    wx.getSetting({
      success: (res) => {
      
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function(dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      vm.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          vm.getLocation();
        } else {
          //调用wx.getLocation的API
          vm.getLocation();
        }
      }
    })
  },
  // 微信获得经纬度
  getLocation: function() {
    let vm = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy;
        app.globalData.lat = latitude;
        app.globalData.lng = longitude
        vm.getLocal(latitude, longitude)
      },
      fail: function(res) {
       
        vm.getLocal(0, 0)
      }
    })
  },
  // 获取当前地理位置
  getLocal: function(latitude, longitude) {
    let vm = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
       
        let province = res.result.ad_info.province
        let city = res.result.ad_info.city
        app.globalData.lat = latitude;
        app.globalData.lng = longitude
        app.globalData.defaultCity = city
        vm.setData({
          province: province,
          city: city,
          latitude: latitude,
          longitude: longitude
        })
        vm.getEquipmentList(0, null);

      },
      fail: function(res) {
       
        vm.getEquipmentList(0, null);
      },
      complete: function(res) {
       
      }
    });
  },


  onReady: function() {
    let vm = this;
    if (i == 1) {
      vm.getUserLocation();
    } else(
      this.setData({
        city: app.globalData.defaultCity
      }))
   

  },
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
     
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
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  


  
  //校验用户的信息
  verifyUserinformation: function(userInfo) {
    wx.getStorage({
      key: 'param',
      success: function(res) {
        wx.request({
          url: app.globalData.url + '/servlet/user/save',
          data: {
            param: res.data,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            province: userInfo.province,
            city: userInfo.city,
            country: userInfo.country
          },
          success: function(res) {

          }
        })
      }
    })
  },
  //页面显示
  onShow: function() {
    var that = this
   

    wx.getStorage({
      key: 'param',
      success: function(res) {
        wx.request({
          url: app.globalData.url + '/servlet/getNumberShoppingCarts',
          data: {
            param: res.data
          },
          success: function(res) {

            app.globalData.numberofshoppingCarts = res.data.obj
            console.log(app.globalData.numberofshoppingCarts)
            that.setData({
              numberofshoppingCarts: app.globalData.numberofshoppingCarts
            })

          }
        })
      }
    })

  },
  onLoad: function() {
    i = i + 1
    
    qqmapsdk = new QQMapWX({
      key: 'VOPBZ-VTJ32-CYJUT-CIGOC-IQUJT-XFF23' //这里自己的key秘钥进行填充
    });
    
    //this.getLocation();
    //向后台请求行业名称数据
    this.getIndustryData();
    
   
    this.setData({
      numberofshoppingCarts: app.globalData.numberofshoppingCarts
    })
    console.log(app.globalData.hh)
    this.setData({
      screenHeight: app.globalData.hh,
      screenWidth: app.globalData.ww
    })
   
  

    //common.userLogin();
    var that = this;
    app.changeTabBar();

    that.setData({

      num_left: app.globalData.ww / 2
    })
    if (i == 1) {
      this.getUserLocation()
    }else{
      this.getEquipmentList(0, null)
    }
   

  },
  //获取去后台设备列表数据函数
  getEquipmentList: function(page, searchKeywords) {
    var that = this;
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    // 页数+1

    this.setData({
      page: this.data.page + 1
    })
   
    wx.request({
      url: app.globalData.url + "/servlet/devices/list",
      method: "GET",
      data: {
        pageIndex: that.data.page,
        searchKeywords: searchKeywords,
        lng: app.globalData.lng,
        lat: app.globalData.lat,
        adcode:that.data.adcode,//区域代码
        industryId:that.data.industryId,//行业
        price:that.data.price//价格

      },

      success: function(res) {
        //没有数据
        if (res.data.obj.length <= 0) {
          // 停止下拉动作
          wx.stopPullDownRefresh();
          wx.showToast({
            title: '没有更多数据了!~',
            icon: 'none'
          })
          // 隐藏加载框
          wx.hideLoading();
          return;
        }
        if (that.data.inputVal.trim().length > 0) {
          that.setData({
            bottomShow: false,
            selectshow: false
          })
        }
        // 回调函数
        //新数据
        //老数据
        //将新书拼接到老数据中进行展示
        that.setData({

          list_data: that.data.list_data.concat(res.data.obj)
        })
        var imgArrUrl1 = that.data.imgArrUrl;
        //将图片路径放入到imgArrUrl数组中进行图片的放大
        for (var i = 0; i < res.data.obj.length; i++) {
          imgArrUrl1.push(res.data.obj[i].imgs);


        }
        that.setData({
          imgArrUrl: imgArrUrl1
        })


        // 隐藏加载框
        wx.hideLoading();
      }
    })

  },
  startAnimation: function(that, e) {
   
    var index = 0,
      bezier_points = that.linePos['bezier_points'];
    that.setData({
      good_box_hidden: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    var len = bezier_points.length;
    index = len
    that.timer = setInterval(function() {
      for (let i = index - 1; i > -1; i--) {
        that.setData({
          bus_x: bezier_points[i]['x'],
          bus_y: bezier_points[i]['y']
        })
        if (i < 1) {
          clearInterval(that.timer);
          that.addGoodToCartFn()
          that.setData({
            hide_good_box: true
          })
        }
      }
    }, 25);

  },
  addGoodToCartFn: function() {
    // 购物车一系列变化

    // 设置购物车角标
    // 这里只是demo，每次角标数量加1
    this.setData({
      good_box_hidden: true,
      TotalNumber: ++this.data.TotalNumber

    })

  },

  touchOnGoods: function(that, e) {

    that.finger = {};
    var topPoint = {};
    
    that.finger['x'] = e.touches["0"].clientX; //点击的位置
    that.finger['y'] = e.touches["0"].clientY;

    if (that.finger['y'] < that.busPos['y']) {
      topPoint['y'] = that.finger['y'] - 150
    } else {
      topPoint['y'] = that.busPos['y'] - 150;
    }
    topPoint['x'] = Math.abs(that.finger['x'] - that.busPos['x']) / 2;

    if (that.finger['x'] > that.busPos['x']) {
      topPoint['x'] = (that.finger['x'] - that.busPos['x']) / 2 + that.busPos['x'];
    } else { //
      topPoint['x'] = (that.busPos['x'] - that.finger['x']) / 2 + that.finger['x'];
    }
    that.linePos = app.bezier([that.busPos, topPoint, that.finger], 100);
    this.startAnimation(that, e);
  },


  // 下拉刷新
  bindscrolltoupper: function() {
    this.setData({

      isHide: false,
      list_data: [],
      page: 0,

    })
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var that = this;
    //如果有关键字（通过关键字查询刷新）
    if (that.data.inputVal.trim().length > 0) {
      that.setData({
        inputShowed: true
      })
      that.getEquipmentList(0, that.data.inputVal)
    } else {
      that.setData({
        inputShowed: false
      })
      that.getEquipmentList(0, null)
    }



    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  bindscrolltolower: function() {
   
    //请求后台数据，查询设备列表数据
    if (this.data.inputVal == "") {
      this.getEquipmentList(1, null);
    } else {
      this.getEquipmentList(0, this.data.inputVal)
    }


  },


  showInput: function() {
    this.setData({
      inputShowed: true
    });
  },
  //输入搜索值变化是激发的函数
  inputTyping: function(e) {
  
    this.setData({
      inputVal: e.detail.value,
      page: 0,
      list_data: []
    });
    this.getEquipmentList(0, this.data.inputVal)
  },
  //搜索点击取消
  hideInput: function() {
    this.setData({
      inputVal: "",
      isHide: false,
      list_data: [],
      page: 0,
      inputShowed: false,
      selectshow:true,
      bottomShow:true
    })
    this.getEquipmentList(0, null)
  },
  //清除搜索关键字
  clearInput: function() {
    this.setData({
      inputVal: "",
      isHide: false,
      list_data: [],
      page: 0,

    })
    this.getEquipmentList(0, null)
  },
  //选中事件
  selectList: function(e) {
    var index = e.currentTarget.dataset.index
   
    //判断是否选中，选中则清除选中，没有选中则选中
    if (this.data.list_data[index].selected) {
      //清除选中
      this.data.list_data[index].selected = false

    } else {
      //选中
      this.data.list_data[index].selected = true
    }
    var count = 0;
    //计算被选中的个数
    for (var i = 0; i < this.data.list_data.length; i++) {
      if (this.data.list_data[i].selected == true) {
        count = count + 1
      }

    }
    //如果全部选中则全选按钮变化
    if (count == this.data.list_data.length) {
      this.setData({
        selectAllStatus: true
      })
    } else {
      this.setData({
        selectAllStatus: false
      })
    }
    //修改数据
    this.setData({
      list_data: this.data.list_data,
      totalCount: count
    })
    console.log(this.data.list_data)
  },
  //全选事件
  selectAll: function() {
    for (var i = 0; i < this.data.list_data.length; i++) {
      this.data.list_data[i].selected = true
    }
    console.log(this.data.list_data)
    this.setData({
      list_data: this.data.list_data,
      selectAllStatus: true,
      totalCount: this.data.list_data.length
    })
  },
  //点击加入购物车
  toBuy:function(){
    var a=0;
    //校验是否有选中的商品
    for (var i = 0; i < this.data.list_data.length; i++){
      if(this.data.list_data[i].selected==true){
a=a+1
      }

}
if(a==0){
  wx.showToast({
    title: '请选中设备',
    icon: 'none',
    duration: 1000
  })
  return;
}
    var that=this
    //校验用户是否登录
    wx.getStorage({
      key: 'param',
      success: function (res) {
        common.showLoading("正在加入购物车")
        //向后台请求校验用户是否存在
        wx.request({
          url: app.globalData.url + '/servlet/login/verifyWx',
          data: {
            param: res.data
          },
          success: function (res1) {
            if (res1.data.status == "200") {
              //批量就加入购物车
              that.addbatchShop(res.data);

            }
            common.hideLoading()
          },
          fail: function () {
            common.hideLoading()
            wx.showToast({
              title: '添加购物车失败',
              icon: 'none',
              duration: 1000
            })
          }
        })
  }})},
  //批量加入购物车函数
  addbatchShop: function (param){
    var count=0;
    var str=""
    for(var i=0;i<this.data.list_data.length;i++){
      if(this.data.list_data[i].selected==true){
        var openId = param;
        var productId = this.data.list_data[i].products[0].id;
        var op=openId + "&" + productId;
        str=str+op+":"
        count=count+1


      }
    }
    
    //向后后台批量加入购物车
   this.addbatchShopFunction(str, count);
  },
  //向后后台批量加入购物车
  addbatchShopFunction: function (str, count){
    var that=this
    wx.request({
      url: app.globalData.url +'/servlet/addbatchShop',
      data:{
        para: str
      },
      method:"POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success:function(res){
        if(res.data.status=="200"){
        
            that.setData({
              numberofshoppingCarts: that.data.numberofshoppingCarts + res.data.obj
            })

          app.globalData.numberofshoppingCarts = app.globalData.numberofshoppingCarts + count

          wx.showToast({
            title: '加入购物车成功',
            icon: 'none',
            duration: 2000
          })
          common.hideLoading()
        }else{
          common.hideLoading()
          wx.showToast({
            title: '加入购物车失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '加入购物车失败',
          icon: 'none',
          duration: 2000
        })
      }

    })

  },
  //向后台请求行业数据函数
  getIndustryData: function () {
    var that = this
    wx.request({
      url: app.globalData.url + "/servlet/getIndustryData",
      method: "GET",
      data: {},
      success: function (res) {
        if (res.data.status == "200") {
          that.setData({
            dropDownMenuSecondData: that.data.dropDownMenuSecondData.concat(res.data.obj)
          })

        }

      }
    })
  },

  selectedFourth: function (e) {
    if (e.detail.index == 1) {
      if (e.detail.adcode){
      //区域
      this.setData({
        adcode: e.detail.adcode
      })
      }
    } else if (e.detail.index == 2) {
      //行业
      this.setData({
        industryId: e.detail.selectedId
      })
    }
    else if (e.detail.index == 3) {
      //价格
      this.setData({
        price: e.detail.selectedTitle
      })
    }

    //区划代码
   
    //向后台查询设备数据
    this.setData({
      page:0,
      list_data:[],
      selectshow:false,
      bottomShow:false
    })
    this.getEquipmentList(0, null);
  },
  showDialog: function (e) {

  },
  //取消事件
  _cancelEvent: function (e) {
   
    this.dialog.hideDialog();
  },
  //确认事件
  _confirmEvent: function (e) {
   
    this.dialog.hideDialog();
  }


})