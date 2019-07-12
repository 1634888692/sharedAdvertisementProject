//获取应用实例
const app = getApp()

Page({
  data: {
    isTipTrue: false,
    id: 0, //产品的id
    num_top: 0, //购物车数量显示位置
    num_left: 0, //购物车数量显示位置
    // input默认是1  
    buy_num: 1,
    // 使用data数据对象设置样式名  
    minusStatus: 'disabled',
    parameter: [], //投放时长
    products: [], //产品表
    ellipsis: true, // 文字是否收起，默认收起
    equipmentIntroductionpicture: [], //设备图片
    eqName: "", //设备名称
    address: "", //设备地址
    price: 0, //价格
    totalPrice: 10, //总价
    basePrice: 10,
    screenSize: 1, //屏幕尺寸
    launchCycle: "", //投放周期
    affiliatedBusinesses: "", //所属商家
    details: "", //详情介绍
    productId: -1,
    detaultphone: "13873376022", //默认客服电话
    phone: [], //客服电话

    indicatorDots: true, //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔,3s
    duration: 1000, //  滑动动画时长1s,
    mac: "",
    numberofshoppingCarts: 0, //购物车数量，
    timeLong: 10 //投放时长
  },
  /**
  * 收起/展开按钮点击事件
  */
  ellipsis: function () {
    var value = !this.data.ellipsis;
    this.setData({
      ellipsis: value
    })
  },
  //时长输入监听事件
  watchDuration: function(e) {
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
    this.inspectionTime(e.detail.value)
    console.log(e.detail.value);
  },
  //向后台校验时间函数
  inspectionTime: function(inputTime) {
    var that = this
    wx.request({
      url: app.globalData.url + '/servlet/inspectionTime',
      data: {
        mac: that.data.mac,
        inputTime: inputTime
      },
      success: function(res) {
        if (res.data.status == "200") {
          console.log("++=" + that.data.buy_num)
          console.log("++=" + inputTime / 10)

          //计算总金额
          that.setData({
            totalPrice: that.accMul(that.accMul(inputTime / 10, that.data.basePrice), that.data.buy_num),
            timeLong: inputTime
          })
        } else {
          wx.showToast({
            title: "还剩下" + res.data.msg + "秒",
            duration: 1000
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '服务器繁忙',
          duration: 1000
        });
      }
    })
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
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  //点击协议不同意
  tipNoAgree: function() {
    this.setData({
      isTipTrue: false
    })
  },
  // 减号 1
  bindMinus: function(e) {
    if (this.data.buy_num > 1) {
      this.setData({
        buy_num: this.data.buy_num - 1
      })
      this.pay_num(this.data.buy_num, "sub")
    }
  },
  pay_num: function(e, y) {


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
      console.log("总价格=====" + this.data.basePrice)
      console.log("购买天数=====" + buy_num)
      //投放时长除10*基价*购买数量
      
      console.log(this.data.timeLong/10)
      var totalPrice =this.accMul(this.accMul(this.data.timeLong / 10, this.data.basePrice), buy_num)


      //var totalPrice = this.accMul(this.data.basePrice, buy_num);
      this.setData({
        buy_num: buy_num,
        totalPrice: totalPrice
      })

      console.log("======总价====" + this.data.totalPrice)
    } else if ("sub" == y) {
      //
      var totalPrice = this.accMul(this.accMul(this.data.timeLong / 10, this.data.basePrice), buy_num);
      this.setData({
        buy_num: buy_num,
        totalPrice: totalPrice
      })
    }



  },
  division: function(arg1, arg2) {
    var t1 = 0,
      t2 = 0,
      r1, r2;
    try {
      t1 = new String(arg1).split(".")[1].length;
    } catch (e) {}
    try {
      t2 = arg2.toString().split(".")[1].length;
    } catch (e) {}
    r1 = Number(new String(arg1).replace(".", ""));
    r2 = Number(arg2.toString().replace(".", ""));
    //放大倍数后两个数相除 后，乘以两个小数位数长度相减后的10的次幂 
    var money = this.accMul((r1 / r2), Math.pow(10, t2 - t1));
    //保留2个小数位数 
    return money.toFixed(2);
  },
  //两个浮点数相乘的计算方法
  accMul: function(arg1, arg2) {
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length
    } catch (e) {}
    try {
      m += s2.split(".")[1].length
    } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  },
  //2个数字相加函数
  numAdd: function(num1, num2, flag) {
    var baseNum, baseNum1, baseNum2;
    try {
      baseNum1 = num1.toString().split(".")[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = num2.toString().split(".")[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    var precision = (baseNum1 >= baseNum2) ? baseNum1 : baseNum2; //精度
    if (flag == "-") {
      return ((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision)
    } else if (flag == "*") {
      return ((num1 * baseNum * num2 * baseNum) / baseNum).toFixed(precision)
    } else if (flag == "/") {
      return ((num1 * baseNum / num2 * baseNum) / baseNum).toFixed(precision)
    } else {
      return ((num1 * baseNum + num2 * baseNum) / baseNum).toFixed(precision)
    }

  },


  // 加号 1
  bindPlus: function(e) {
    this.setData({
      buy_num: this.data.buy_num + 1
    })
    this.pay_num(this.data.buy_num, "add")
  },

  // 投放时长点击响应事件
  parameterTap: function(e) { //e是获取e.currentTarget.dataset.id所以是必备的，跟前端的data-id获取的方式差不多
    var that = this
    var this_checked = e.currentTarget.dataset.id
    var parameterList = this.data.parameter //获取Json数组
    for (var i = 0; i < parameterList.length; i++) {
      if (parameterList[i].id == this_checked) {
        parameterList[i].checked = true; //当前点击的位置为true即选中
        that.setData({
          id: parameterList[i].id,
          basePrice: parameterList[i].price, //改变基础价格
          totalPrice: parameterList[i].price * that.data.buy_num //总价=基价*数量
        })


      } else {
        parameterList[i].checked = false; //其他的位置为false
      }
    }
    that.setData({
      parameter: parameterList
    })

  },
  //拨打电话
  totel: function() {
    var tel
    if (this.data.phone.length > 0) {
      //随机取一个电话
      var index = Math.floor(Math.random() * this.data.phone.length)

      tel = this.data.phone[index]

    } else {
      //默认电话
      tel = this.data.detaultphone

    }
    wx.makePhoneCall({
      phoneNumber: tel,
    })
  },
  onLoad: function(option) {
    var mac = option.mac
    this.set
    app.changeTabBar();
    this.setData({
      numberofshoppingCarts: app.globalData.numberofshoppingCarts
    })

    //通过设备的mac向后台请求查询详细数据
    var that = this
    app.changeTabBar();
    that.setData({

      num_left: app.globalData.ww / 2
    })
    //购物车在页面上的位置
    //创建节点选择器
    // var query = wx.createSelectorQuery();
    // //选择id
    // query.select('.tabbar_icon1').boundingClientRect()
    // query.exec(function(res) {


    //   that.busPos = {};
    //   that.busPos['x'] = (res[0].left + 20); //购物车的位置
    //   that.busPos['y'] = (res[0].top)


    // })
    wx.request({
      url: app.globalData.url + '/servlet/devices/details',
      data: {
        mac: mac
      },
      method: "get",
      success: function(res) {
        that.setData({
          equipmentIntroductionpicture: res.data.obj.imgs,
          price: res.data.obj.products[0].price,
          launchCycle: res.data.obj.products[0].launchCycle,
          screenSize: res.data.obj.screenType,
          eqName: res.data.obj.deviceName,
          address: res.data.obj.address,
          phone: res.data.obj.phone,
          affiliatedBusinesses: res.data.obj.fromUser,
          details: res.data.obj.detailsImg,
          parameter: that.data.parameter.concat(res.data.obj.products),
          productId: res.data.obj.products[0].id,
          totalPrice: res.data.obj.products[0].price,
          basePrice: res.data.obj.price,
          products: res.data.obj.products, //产品,
          basePrice: res.data.obj.products[0].price,
          mac: res.data.obj.deviceId


        })

        that.data.parameter[0].checked = true;
        that.setData({
          parameter: that.data.parameter,
          id: that.data.parameter[0].id
        }) //默认parameter数组的第一个对象是选中的
        console.log(that.data.parameter)
      }
    })
  },
  //支付统一下单 
  createUnifiedOrder: function() {
    var that = this
    wx.getStorage({
      key: 'param',
      success(res) {
        wx.request({
          url: app.globalData.url + '/servlet/pay/fuyouPay',
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // 当method 为POST 时 设置以下 的header 
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            amount: that.data.totalPrice,
            openid: res.data,
            flag: "detail",
            shopCartId: that.data.productId,
            buy_num: that.data.buy_num,
            timeLong: that.data.timeLong //投放时长

      


          },
          success: function(res) {
            if(res.data.obj==null){
              wx.showToast({
                title: '失败',
                icon: 'none',
                duration: 1000
              })
            }
            if (res.data.obj.paySign != '') {
              console.log('微信支付接口之前先生成签名成功')
              console.log('签名：' + res.data.obj.paySign)
              console.log('随机串：' + res.data.obj.nonceStr)
              console.log('时间戳：' + res.data.obj.timeStamp)
              //这个applyId一定要大写 而且签名的参数和调用方法的参数值一定要统一
              wx.requestPayment({

                'timeStamp': res.data.obj.timeStamp,
                'nonceStr': res.data.obj.nonceStr,
                'package': res.data.obj.orderPackage,
                'signType': 'MD5',
                'paySign': res.data.obj.paySign,
                'success': function(paymentRes) {
                  console.log(paymentRes)
                  //跳转到文件上传页面
                  wx.navigateTo({
                    url: '/pages/fileUpload/fileUpload?orderNumber=' + res.data.obj.orderNumber,
                  })
                },
                'fail': function(error) {
                  console.log(error)
                }
              })
            } else {
              console.log('微信支付接口之前先生成签名失败')
            }



          }
        });
      }
    })
  },

  //点击购买
  immeBuy: function() {
    var that = this
    //从缓存在查找数据是否同意协议
    wx.getStorage({
      key: 'agreement',
      success: function(res) {
        that.buy()
      },
      fail: function() {
        that.setData({
          isTipTrue: true
        })
      }
    })


  },
  //
  buy: function() {
    var that = this
    wx.getStorage({
      key: 'param',
      success: function(res) {


        //校验是否已经授权登录
        wx.request({
          url: app.globalData.url + '/servlet/login/verifyWx',
          data: {
            param: res.data
          },
          success: function(callres) {
            if (callres.data.status == "200") {
              //进行支付
              console.log("=======进行支付操作========")
              //支付统一下单

              that.createUnifiedOrder();

            } else {
              //跳转到首页进行登录授权
              wx.navigateTo({
                url: '/pages/tologin/tologin',
              })
            }

          }
        })
      },
      fail: function() {
        //跳转到首页进行登录授权
        wx.navigateTo({
          url: '/pages/index/index',
        })
      }
    })
  },
  //加入购物车
  addCar: function() {
    var that = this
    //校验用户是否登录
    wx.getStorage({
      key: 'param',
      success: function(res) {
        //向后台请求校验用户是否存在
        wx.request({
          url: app.globalData.url + '/servlet/login/verifyWx',
          data: {
            param: res.data
          },
          success: function(res1) {
            if (res1.data.status == "200") {
              //校验时间是否合理
              that.checkTime(res);
             
            }
          },
          fail: function() {
            wx.showToast({
              title: '添加购物车失败',
              icon: 'success',
              duration: 1000
            })
          }
        })

      },
      fail: function() {
        //跳到首页进行授权
        wx.navigateTo({
          url: '/pages/tologin/tologin',
        })
      }
    })

  },
  //向后台校验时间是否合理函数
  checkTime:function(res){
    if (this.data.timeLong.trim().length > 0) {

      if (!(/^\+?[1-9][0-9]*$/.test(this.data.timeLong))) {
        wx.showToast({
          title: '请输入正整数',
          duration: 2000,
          icon: 'none'
        });
        return;
      }
      if (this.data.timeLong < 10) {
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
    //校验时间
    this.checkTimeFunction(res);

  },
  //校验时间
  checkTimeFunction:function(e){
    var that = this
    wx.request({
      url: app.globalData.url + '/servlet/inspectionTime',
      data: {
        mac: that.data.mac,
        inputTime: that.data.timeLong
      },
      success: function (res) {
        if (res.data.status == "200") {
          //添加购物车
          that.addShopCart(e);
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


  //加入购物车函数
  addShopCart: function(res) {
    var that = this
    //获取订单的id
    var productId = this.data.id;
    //用户唯一表示
    var param = res.data;
    //购买数量

    var num = this.data.buy_num;
    //总金额
    var totalPrice = this.data.totalPrice;
    //向后台添加购物车
    wx.request({
      url: app.globalData.url + '/servlet/shoppingCart/add',
      method: "POST",
      data: {
        openId: param,
        productId: productId,
        purchaseQuantity: num,//购买天数
        totalAmount: totalPrice * 100,//金额
        timeLong:that.data.timeLong//购买播放时长
      },
      success: function(res1) {
        if (res1.data.status == "200") {
          //购物车增加1
          that.setData({
            numberofshoppingCarts: that.data.numberofshoppingCarts + 1
          })

          app.globalData.numberofshoppingCarts = app.globalData.numberofshoppingCarts + 1
          wx.showToast({
            title: '加入成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '添加失败',
            icon: 'success',
            duration: 1000
          })
        }

      },
      fail: function() {
        wx.showToast({
          title: '加入失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }







})