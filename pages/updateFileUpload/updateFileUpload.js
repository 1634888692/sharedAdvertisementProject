//获取应用实例
const app = getApp()
var common = require("../../utils/Common.js")
Page({
  data: {
    orderId: -1,
    eqList_data: [],
    src: "",
    hiddenVideo: true,
    time: "",
    fileHidden: true,
    videoUrl: "",
    qishuisHidden: true,
    dongshuisHidden: true,
    equipmentHidden: true,
    index: 0,
    startDate: '',
    endDate: '',
    fileId: -1,
    images: [],
    productId: -1,
    mac: "",
    index_equipment: 0,
    index_dongshu: 0,
    imageWidth: 500 / 4 - 10,
    we: "",
    orderNumber: ""//订单编号
  },



  //点击上传视频按钮
  addVideoTap: function () {

    var that = this;
    //选择上传视频
    wx.chooseVideo({
      sourceType: ['album', 'camera'], //视频选择的来源
      //sizeType: ['compressed'],
      compressed: false, //是否压缩上传视频
      camera: 'back', //默认拉起的是前置或者后置摄像头
      success: function (res) {

        //上传成功，设置选定视频的临时文件路径
        that.setData({
          src: res.tempFilePath,
          time: res.duration,
          hiddenVideo: false

        });
        common.showLoading("视频上传中")
        //上传视频   https://upload.xyd999.net
        wx.uploadFile({
          url: "https://upload.xyd999.net", //开发者服务器的 url
          filePath: res.tempFilePath, // 要上传文件资源的路径 String类型！！！
          name: 'file', // 文件对应的 key ,(后台接口规定的关于图片的请求参数)
          header: {
            'content-type': 'multipart/form-data'
          }, // 设置请求的 header
          formData: {

          }, // HTTP 请求中其他额外的参数
          success: function (res) {
            that.setData({
              fileId: JSON.parse(res.data).obj

            })
            //上传成功后隐藏加载框
            common.hideLoading()

          },
          fail: function (res) {
            console.log("图片上传失败" + res);
            wx.hideLoading();
          }
        })
      }
    })
  },

  /**
   * 开关
   */
  switchChange: function (e) {

    this.setData({
      fileHidden: e.detail.value,
      //清楚fileId
      fileId: -1
    })
    console.log('switch1 发生 change 事件，携带值为', e.detail.value)
  },





  //选中小区触发
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    //将期数的id设为null,栋数id设为null,设备mac地址设为null
    //栋数隐藏，设备隐藏

    this.setData({
      index: e.detail.value,
      mac: this.data.eqList_data[e.detail.value].mac,
      productId: this.data.eqList_data[e.detail.value].productId,
      orderId: this.data.eqList_data[e.detail.value].orderId

    })

  },


  initTime: function () {
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //获取年份  
    var Y = date.getFullYear();
    //获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var ed = D + 3;
    console.log("当前时间：" + Y + '年' + M + '月' + D + '日');

    this.setData({
      startDate: Y + "-" + M + "-" + D,
      endDate: Y + "-" + M + "-" + ed


    })
  },
  onLoad: function (options) {
    this.setData({
      eqList_data: [],
      fileId: [],
      mac: "",
      productId: -1,
      images: [],
      src: ""
    })
    //初始化时间
    this.initTime();
    //初始化订单编号、
    this.setData({
      orderNumber: options.orderNumber
    })

  },


  submit: function () { // 提交图片，事先遍历图集数组
    var that = this
    wx.getStorage({
      key: 'param',
      success: function (res) {
        that.insertData(res.data)
      },
    })



  },
  //提交表单函数
  insertData: function (param) {
    common.showLoading("添加中")
    var that = this;
    var fileId1 = that.data.fileId;
    var mac = that.data.mac;
    if (fileId1 == null || fileId1.length <= 0 || fileId1 == -1) {
      wx.showToast({
        title: "请选中设备或图片",
        icon: 'succes',
        duration: 1000

      })
      return;
    }


    wx.request({
      url: app.globalData.url + '/servlet/screem/update',
      data: {
        fileId: that.data.fileId,
        //startDate: that.data.startDate,
        param: param,
        orderNumber: that.data.orderNumber//订单编号

      },
      method: "get",
      success: function (e) {

        common.hideLoading()
        if (e.data.status == "200") {

          //跳转到订单页面
          wx.navigateTo({
            url: '/pages/order/order?flag=fileupload',
          })
        } else {
          wx.showToast({
            title: e.data.msg,
            icon: 'success',
            duration: 1000
          })
        }



      },
      fail: function () {
        common.hideLoading()
        wx.showToast({
          title: '添加失败',
          icon: 'success',
          duration: 1000
        })
      }

    })
  },
  delete: function (e) {
    var index = e.currentTarget.dataset.index;
    var images = this.data.images;
    var fileId = this.data.fileId;



    this.setData({
      images: [],
      fileId: -1

    });

  },
  chooseImage: function () { // 选择图片
    console.log("图片的张数===" + this.data.images.length)
    if (this.data.images.length >= 1) {
      wx.showToast({
        title: '只能上传一张',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return;
    }
    var that = this;
    wx.chooseImage({
      sizeType: ['compressed'],

      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有

      success: function (res) { // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

        var tempFilePaths = res.tempFilePaths[0];
        console.log(tempFilePaths);
        that.setData({
          images: that.data.images.concat(tempFilePaths)

        });
        common.showLoading("图片上传中")
        //小程序自带的上传图片接口
        wx.uploadFile({
          url: "https://upload.xyd999.net",
          filePath: tempFilePaths,
          name: 'file',

          header: {
            "Content-Type": "multipart/form-data"
          },
          success: function (res) {
            console.log("fileId===" + JSON.parse(res.data).obj)
            that.setData({
              fileId: JSON.parse(res.data).obj

            })
            common.hideLoading()
            console.log("[]fileId======" + that.data.fileId)
          },
          fail: function (err) {
            console.log()
          }
        })

      },
      complete: function () {
        var fileId1 = that.data.fileId;

      }

    });


  },
})