// pages/shoppingCart/shoppingCart.js
var app = getApp();
var common = require("../../utils/Common.js")
const orginalPrice = 0; //由于0.00在赋值时是0，用toFixed()取余
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list_data: [],
    selectTab: true,
    selectBook: true,
    selectThing: false,
    select_data: {}, //选中的设备
    carts: [], // 购物车列表
    hasList: false, // 列表是否有数据
    totalPrice: orginalPrice.toFixed(2), // 总价，初始为0
    selectAllStatus: false, // 全选状态，默认全选
    bookId: '',
    isMyCartShow: false,
    studentId: '',
    myCartBookLength: '5',
    bookPrice: 0,
    thingId: '',
    thingCarts: [], // 物品列表
    isThingCartShow: false,
    myCartThingLength: '5',
    thingPrice: 0,
    page: 0,
    index_list:[],
    isTipTrue: false,
  },
  //时长输入监听事件
  watchDuration: function (e) {
    //数组的下角标
    var index = e.currentTarget.dataset.index
    //设备mac
    var deviceId = this.data.list_data[index].deviceId
    console.log("====" + e.detail.value.trim());
    console.log("====" + e.detail.value.trim().length);
    if (e.detail.value.trim().length > 0) {

      if (!(/^\+?[1-9][0-9]*$/.test(e.detail.value))) {
        wx.showToast({
          title: '请输入正整数',
          duration: 2000,
          icon: 'none'
        });
        return;
      }
      if (e.detail.value < 10) {
        wx.showToast({
          title: '最短时间10秒',
          duration: 2000,
          icon: 'none'
        });
        return;
      }

    } else {
      wx.showToast({
        title: '请输入正整数',
        duration: 2000,
        icon: 'none'
      });
      return;
    }

    //校验不能低于10秒，不能长于设备展示的空闲时间
    //请求后台校验时间是否合理
    this.inspectionTime(e.detail.value, index, deviceId)
    console.log(e.detail.value);
  },
  //向后台校验时间函数
  inspectionTime: function (inputTime, index, deviceId) {
    var that = this
    wx.request({
      url: app.globalData.url + '/servlet/inspectionTime',
      data: {
        mac: deviceId,
        inputTime: inputTime
      },
      success: function (res) {
        
        if (res.data.status == "200") {
          //向后台请求修改购买时长数据
          that.updateTimeLong(that.data.list_data[index].id, inputTime,index);
         
        } else {
          wx.showToast({
            title: "还剩下" + res.data.msg + "秒",
            duration: 1000
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: '服务器繁忙',
          duration: 1000
        });
      }
    })
  },
  //向后台请求修改时长数据
  updateTimeLong: function (pid, inputTime,index){
    var that=this
    wx.request({
      url: app.globalData.url + '/servlet/updateTimeLong',
      method: "post",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        pid: pid,//购物车id
        timeLong: inputTime//购买天数
      }, success: function (res) {
        if(res.data.status=="200"){
          //投放时长除10*基价*购买数量
          var totalPrice = that.accMul(that.accMul(inputTime / 10, that.data.list_data[index].price), that.data.list_data[index].purchaseQuantity)
          //计算总金额
          var up = "list_data[" + index + "].totalAmount"
          //时长
          var time = "list_data[" + index + "].timeLong"
          //var totalPrice = this.accMul(this.data.basePrice, buy_num);
          that.setData({

            [up]: totalPrice,
            [time]: inputTime
          })
        }else{
          wx.showToast({
            title: '服务器繁忙',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '服务器繁忙',
          icon: 'none',
          duration: 1000
        })
      }
  })},
  // 减号 1
  bindMinus: function (e) {
    //数组的下角标
    var index = e.currentTarget.dataset.index
    if (this.data.list_data[index].purchaseQuantity > 1) {
      //向后台请求修改天数
      this.updatepurchaseQuantity(this.data.list_data[index].id, this.data.list_data[index].purchaseQuantity - 1, index, "sub");
    }
  },
  // 加号 1
  bindPlus: function (e) {
    //数组的下角标
    var index = e.currentTarget.dataset.index
    //向后台请求修改天数
    this.updatepurchaseQuantity(this.data.list_data[index].id, this.data.list_data[index].purchaseQuantity + 1,index,"add");
   
    
  },
  //向后请求修改天数函数
  updatepurchaseQuantity: function (pid, purchaseQuantity,index,flag){
    var that=this
    wx.request({
      url: app.globalData.url +'/servlet/updatepurchaseQuantity',
      method:"post",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data:{
        pid: pid,//购物车id
        purchaseQuantity: purchaseQuantity//购买天数
      },success:function(res){
        if(res.data.status=="200"){
          var up = "list_data[" + index + "].purchaseQuantity"
          if(flag=="add"){
         
            that.setData({
            //根据数组的index修改对象数组的buy_num
              [up]: that.data.list_data[index].purchaseQuantity + 1
          })
            that.pay_num(that.data.list_data[index].purchaseQuantity + 1, "add", index)
          }
          else{
          
            that.setData({
              //根据数组的index修改对象数组的buy_num
              [up]: that.data.list_data[index].purchaseQuantity - 1
            })
            that.pay_num(that.data.list_data[index].purchaseQuantity - 1, "sub", index)
          }
        }else{
          wx.showToast({
            title: '服务器繁忙',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '服务器繁忙',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  pay_num: function (e, y,index) {


    var that = this;
    var buy_num;
    if (e > 0) {
      buy_num = e
    }
    if (e.type == 'input') {
      //判断一定要是数字
      if (!(/^[1-9]*$/.test(e.detail.value))) {
        wx.showToast({
          title: '数量不是数字',
          duration: 1000
        });
        return;
      }
      //如果是input的change事件 buy_num 就赋值为用户手动输入的值
      buy_num = parseInt(e.detail.value);
    }
    if ("add" == y) {
     //投放时长除10*基价*购买数量
      
      var totalPrice = this.accMul(this.accMul(this.data.list_data[index].timeLong / 10, this.data.list_data[index].price), this.data.list_data[index].purchaseQuantity)

      var up = "list_data[" + index + "].totalAmount"
      //var totalPrice = this.accMul(this.data.basePrice, buy_num);
      this.setData({
       
        [up]: totalPrice
      })

     
    } else if ("sub" == y) {
      //
      var totalPrice = this.accMul(this.accMul(this.data.list_data[index].timeLong / 10, this.data.list_data[index].price), this.data.list_data[index].purchaseQuantity)

      var up = "list_data[" + index + "].totalAmount"
      //var totalPrice = this.accMul(this.data.basePrice, buy_num);
      this.setData({

        [up]: totalPrice
      })
    }



  },
  //两个浮点数相乘的计算方法
  accMul: function (arg1, arg2) {
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length
    } catch (e) { }
    try {
      m += s2.split(".")[1].length
    } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
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
    app.changeTabBar();

    
    this.setData({
      page:0,
      list_data:[],
      totalPrice:0,
      numberofshoppingCarts: app.globalData.numberofshoppingCarts,
      num_left: app.globalData.ww / 2,
      screenHeight: app.globalData.hh,
      screenWidth: app.globalData.ww
    })
    var that = this
    //校验用户是否登录
    wx.getStorage({
      key: 'param',
      success: function(res) {
        //向后台请求数据查询购物车
        that.findShopCartData(res.data);
      },
      fail: function() {
        wx.navigateTo({
          url: '/pages/index/index',
        })
      }
    })




  },
  //向后台请求数据
  findShopCartData: function(param) {
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    var that = this
    // 页数+1

    this.setData({
      page: this.data.page + 1
    })
    //通过param查询购物车信息
    wx: wx.request({
      url: app.globalData.url + '/servlet/shoppingCart/search',
      data: {
        param: param,
        pageIndex: that.data.page
      },

      method: 'GET',

      success: function(res) {
        //没有数据
        if (res.data.obj.length <= 0) {

          wx.showToast({
            title: '没有更多数据了!~',
            icon: 'none'
          })
          return;
        }
        if (res.data.status == "200" && res.data.obj.length > 0) {
          that.setData({
            list_data: that.data.list_data.concat(res.data.obj)
          })
          // 隐藏加载框
          wx.hideLoading();
        } else {
          //购物车中没有设备
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    var studentId = that.data.studentId;
    var hasList = that.data.hasList;
    try {
      var value = wx.getStorageSync('studentIdSync')
      if (value) {
        console.log(value); //同步得到studentId的值
        that.setData({
          studentId: value
        })
      }
    } catch (e) {
      console.log(0);
    }
    //this.getBookCartList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  bindscrolltoupper: function() {
    // 动态设置导航条标题
    wx.setNavigationBarTitle({
      title: '购物车'
    });
    wx.showNavigationBarLoading(); //在标题栏中显示加载图标
    setTimeout(function() {
      wx.stopPullDownRefresh(); //停止加载
      wx.hideNavigationBarLoading(); //隐藏加载icon
    }, 2000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  bindscrolltolower: function() {
    var that = this
    wx.getStorage({
      key: 'param',
      success: function(res) {
        //向后台请求数据查询购物车
        that.findShopCartData(res.data);
      },
      fail: function() {
        wx.navigateTo({
          url: '/pages/index.index',
        })
      }
    })

  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  //计量总价
  getTotalPrice() {
    let carts = this.data.carts; // 获取购物车列表
    let thingPrice = parseFloat(this.data.thingPrice);
    let bookPrice = parseFloat(this.data.bookPrice);
    let total = 0.00;
    for (let i = 0; i < carts.length; i++) { // 循环列表得到每个数据
      if (carts[i].selected) { // 判断选中才会计算价格

        total += parseFloat(carts[i].bprice); // 所有价格加起来
      }
    }
    this.setData({
      bookPrice: total.toFixed(2)
    })
    total += thingPrice;
    this.setData({ // 最后赋值到data中渲染到页面
      carts: carts,
      totalPrice: total.toFixed(2) //保留小数后面2两位
    });
  },
  //选择事件
  selectList(e) {
    let that = this;
    const index = e.currentTarget.dataset.index; // 获取data- 传进来的index
   

    let selectAllStatus = that.data.selectAllStatus; //是否已经全选
    let str = true; //用str与每一项进行状态判断
    let carts = that.data.list_data; // 获取购物车列表
    // for (var i = 0; i < carts.length; i++) {
    //   carts[i].selected = false;
    // }
    const selected = carts[index].selected; // 获取当前商品的选中状态
    carts[index].selected = !selected; // 改变状态
    that.setData({
      list_data: carts,
      select_data: carts[index]
    });
    that.getTotalPriceThing(); // 重新获取总价
    for (var i = 0; i < carts.length; i++) {
      str = str && carts[i].selected; //用str与每一项进行状态判断
    }

    if (str === true) {
      that.setData({
        selectAllStatus: true
      })
    } else {
      that.setData({
        selectAllStatus: false
      })
    }
  },
  //全选事件
  selectAll(e) {
    var that = this;
    let selectAllStatus = that.data.selectAllStatus; // 是否全选状态
    let carts = that.data.list_data;
    let thingCarts = that.data.thingCarts;
    var selectThing = that.data.selectThing;
    var selectBook = that.data.selectBook;
    if (selectBook) {
      selectAllStatus = !selectAllStatus;
      for (let i = 0; i < carts.length; i++) {
        carts[i].selected = selectAllStatus; // 改变所有商品状态
      }
      that.setData({
        selectAllStatus: selectAllStatus,
        list_data: carts
      });
      that.getTotalPriceThing(); // 重新获取总价
      if (carts.length === 0) { //当没有物品时，不能再点“全选”
        wx.showModal({
          title: '提示',
          content: '购物车空空如也~',
          success: function(res) { //模糊层成功出来后
            if (res.confirm) {
            
              that.setData({
                selectAllStatus: false
              })
            } else {
             
              that.setData({
                selectAllStatus: false
              })
            }
          },
        })
      }
    } else {
      selectAllStatus = !selectAllStatus;
      for (let i = 0; i < thingCarts.length; i++) {
        thingCarts[i].selected = selectAllStatus; // 改变所有商品状态
      }
      that.setData({
        selectAllStatus: selectAllStatus,
        thingCarts: thingCarts
      });

      that.getTotalPriceThing(); // 重新获取总价
      if (thingCarts.length === 0) { //当没有物品时，不能再点“全选”
        wx.showModal({
          title: '提示',
          content: '购物车空空如也~',
          success: function(res) { //模糊层成功出来后
            if (res.confirm) {
              
              that.setData({
                selectAllStatus: false
              })
            } else {
             
              that.setData({
                selectAllStatus: false
              })
            }
          },

        })

      }
    }
  },

  //删除商品
  deleteList(e) {
    const index_mac = e.currentTarget.dataset.mac;
    //将index和mac截取
    var index = index_mac.split("&")[0];
    var shopCartId = index_mac.split("&")[1];

    var selectAllStatus = this.data.selectAllStatus;
    let list_data = this.data.list_data;
    let totalPrice = this.data.totalPrice;
    wx.showModal({
      title: '提示',
      content: '将此产品移除购物车？',
      success: res => {
        if (res.confirm) {
          common.showLoading("正在删除")
          console.log('用户点击确定')
          //向后台请求删除数据
          this.deleteShopCart(index, shopCartId);


        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //删除购物车
  deleteShopCart: function(index, shopCartId) {
    var that = this
    var param;


    wx.getStorage({
      key: 'param',
      success: function(res) {
        param = res.data
        //删除购物车函数
        that.deleteCart(index, shopCartId, param);
      },
    })

  },
  //删除购物车函数
  deleteCart: function(index, shopCartId, param) {
    var list_data = this.data.list_data;
    var that = this
    wx.request({
      url: app.globalData.url + '/servlet/shoppingCart/delete',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        param: param,
        shopCartId: shopCartId
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == "200") {
          common.hideLoading()
          list_data.splice(index, 1); // 删除购物车列表里这个商品
          that.setData({
            list_data: list_data
          });
          if (list_data.length == 0) { // 如果购物车为空
            that.setData({
              isMyCartShow: true,
              hasList: false, // 修改标识为false，显示购物车为空页面
              selectAllStatus: false,
              // totalPrice: orginalPrice.toFixed(2)              //此时价格为0
            });
          } else { // 如果不为空
            // this.getTotalPrice();           // 重新计算总价格
          }
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })

  },

  // 物品
  //计量总价
  getTotalPriceThing:function() {
    let thingCarts = this.data.list_data; // 获取购物车列表
    let total = 0; //注意后台返回的是字符串数字。
    let thingPrice = parseFloat(this.data.thingPrice);
    let bookPrice = parseFloat(this.data.bookPrice);
    for (let i = 0; i < thingCarts.length; i++) { // 循环列表得到每个数据
      if (thingCarts[i].selected) { // 判断选中才会计算价格  
        total += parseFloat(thingCarts[i].totalAmount); // 所有价格加起来  
      }
    }
    this.setData({
      thingPrice: total
    })
    total += bookPrice;
    this.setData({ // 最后赋值到data中渲染到页面
      thingCarts: thingCarts,
      totalPrice: total.toFixed(2) //保留小数后面2两位
    });
  },
  //选择事件
  selectListThing(e) {
    let that = this;
    const index = e.currentTarget.dataset.index; // 获取data- 传进来的index
   

    let selectAllStatus = that.data.selectAllStatus; //是否已经全选
    let str = true; //用str与每一项进行状态判断
    let thingCarts = that.data.thingCarts; // 获取购物车列表
    that.setData({
      thingCarts: []
    });
    const selected = thingCarts[index].selected; // 获取当前商品的选中状态
    thingCarts[index].selected = !selected; // 改变状态
    that.setData({
      thingCarts: thingCarts
    });
    
  },


  
  
  chooseThingCart() {
    var that = this;
    var selectThing = that.data.selectThing;
    var selectBook = that.data.selectBook;
    var selectAllStatus = that.data.selectAllStatus;

    that.setData({
      selectBook: false,
      selectThing: true,

    })
    // 此时data中的数据改变，但是此时的属性值还未改变

    that.getThingCartList()

  },
  //向后台请求批量删除购物车
  batchDeleteCart(shopCartId){
    var that=this
    wx.getStorage({
      key: 'param',
      success: function (res) {
        wx.request({
          url: app.globalData.url+'/servlet/batchDelShopCart',
          method:"POST",
          data:{
            param:res.data,
            shopId: shopCartId
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success:function(e){
            if(e.data.status=="200"){
              that.onLoad();

            }else{
              wx.showToast({
                title: '删除购物车失败',
                icon: 'none',
                duration: 2000
              })
            }


          },
          fail:function(){
            wx.showToast({
              title: '删除购物车失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }})

  },
  //批量删除函数
  batchDel(){
var arr=[]
    console.log(this.data.thingCarts)
    for(var i=0;i<this.data.thingCarts.length;i++){
      if (this.data.thingCarts[i].selected){
        console.log("=======批量删除=======")
        //拼装购物车id
        arr.push(this.data.thingCarts[i].id)
      }

    }
    let pList = arr.join(',');
    this.batchDeleteCart(pList);


  },
  //批量删除
  toDel:function(){
    var that=this
    var a = this.data.totalPrice;
    if (a > 0) {
      console.log("======去结算======")
      wx.showModal({
        title: '确定删除吗？',
        
        success(res) {
          if (res.confirm) {
            //console.log('用户点击确定')
            that.batchDel();
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      common.hideLoading()
      wx.showToast({
        title: '请选中设备',
        icon: 'none',
        duration: 1000
      })
    }
  },
  toBuy() {
    common.showLoading("加载中");
    var that = this
    //从缓存在查找数据是否同意协议
    wx.getStorage({
      key: 'agreement',
      success: function (res) {
        var a = that.data.totalPrice;
        if (a > 0) {
         
          that.pay();
        } else {
          common.hideLoading()
          wx.showToast({
            title: '请选中设备',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function () {
        common.hideLoading()
        that.setData({
          isTipTrue: true
        })
      }
    })

    
    
    
    

    

  },
  //支付函数
  pay:function(){
    var that = this
    wx.getStorage({
      key: 'param',
      success: function (res) {
        //校验是否已经授权登录
        wx.request({
          url: app.globalData.url + '/servlet/login/verifyWx',
          data: {
            param: res.data
          },
          success: function (callres) {
            if (callres.data.status == "200") {
              //进行支付
            
              //支付统一下单
              that.createUnifiedOrder();

            } else {
              //跳转到首页进行登录授权
              wx.navigateTo({
                url: '/pages/index/index',
              })
            }

          }
        })
      },
      fail: function () {
        //跳转到首页进行登录授权
        wx.navigateTo({
          url: '/pages/index/index',
        })
      }
    })
  },
  //支付统一下单 
  createUnifiedOrder: function () {
    var that=this
    wx.getStorage({
      key: 'param',
      success(res) {
        var list=[]
        //遍历出选中购物车的id
        for(var i=0;i<that.data.list_data.length;i++){
          var a=that.data.list_data[i].selected;
          var index=
          console.log(a)
          if(a){
           
            list.push(that.data.list_data[i].id)

         
          }

        }
        console.log(list.join("-"))
        that.unifiedOrder(list.join("-"), that.data.totalPrice, res.data)
   
      }
    })
  },
  //统一下单函数
  unifiedOrder: function (shopCartId, amount, openid){
    var that=this
    
    //url: app.globalData.url + '/servlet/payment/createUnifiedOrder',
    wx.request({
      
      url:app.globalData.url +"/servlet/pay/fuyouPay",
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // 当method 为POST 时 设置以下 的header 
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        amount: amount,
        openid: openid,
        //购物车id
        shopCartId: shopCartId,
        flag: "shopcart"

      },
      success: function (res) {
        common.hideLoading()
        if (res.data.obj.sdk_paysign != '') {
         
         
          //这个applyId一定要大写 而且签名的参数和调用方法的参数值一定要统一
          wx.requestPayment({

            'timeStamp': res.data.obj.sdk_timestamp,
            'nonceStr': res.data.obj.sdk_noncestr,
            'package': res.data.obj.sdk_package,
            'signType': res.data.obj.sdk_signtype,
            'paySign': res.data.obj.sdk_paysign,
            'success': function (paymentRes) {
              for(var i=0;i<that.data.list_data.length;i++){
                var a = that.data.list_data[i].selected;
                if(a){
               
                  //调用删除购物车函数
                  that.deleteShopCart(1, that.data.list_data[i].id);
                 
                  
                    app.globalData.numberofshoppingCarts=app.globalData.numberofshoppingCarts-1
                  
                }

              }
              that.onLoad()
              console.log(paymentRes)
              //跳转到文件上传页面
              wx.navigateTo({
                url: '/pages/fileUpload/fileUpload?orderNumber=' + res.data.obj.reserved_addn_inf + "&" + res.data.obj.sdk_package,
              })
            
            },
            'fail': function (error) {
              console.log(error)
              that.onLoad()
            }
          })
        } else {
          console.log('微信支付接口之前先生成签名失败')
        }



      }
    });
  }

})