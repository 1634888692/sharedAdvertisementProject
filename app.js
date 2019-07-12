//app.js
var QQMapWX = require('utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
App({



  tabbar: {
    color: "#242424",
    selectedColor: "#fa8582",
    backgroundColor: "#ffffff",
    borderStyle: "#d7d7d7",
    list: [{
        selectedIconPath: "../../utils/img/selectIndex.png",
        iconPath: "../../utils/img/noselectIndex.png",
        pagePath: "/pages/index/index",
        text: "首页",
        selected: true
      },
      {
        selectedIconPath: "../../utils/img/selectShop.png",
        iconPath: "../../utils/img/noSelectShop.png",
        pagePath: "/pages/shopcart/shopcart",
        text: "购物车",
        selected: false
      },
      {
        selectedIconPath: "../../utils/img/selectMy.png",
        iconPath: "../../utils/img/noSelectMy.png",
        pagePath: "/pages/my/my",
        text: "我的",
        selected: false
      }
    ],
    position: "bottom"
  },
  onLaunch: function () {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  },
  changeTabBar: function() {
    var _curPageArr = getCurrentPages();
    var _curPage = _curPageArr[_curPageArr.length - 1];
    var _pagePath = _curPage.__route__;
    if (_pagePath.indexOf('/') != 0) {
      _pagePath = '/' + _pagePath;
    }
    var tabBar = this.tabbar;
    for (var i = 0; i < tabBar.list.length; i++) {
      console.log(_pagePath + '--' + tabBar.list[i].pagePath)
      tabBar.list[i].selected = false;
      if (tabBar.list[i].pagePath == _pagePath) {
        tabBar.list[i].selected = true; //根据页面地址设置当前页面状态  
      }
    }
    _curPage.setData({
      tabbar: tabBar
    });
  },
  onLaunch: function() {
    let that = this;

   

    wx.getSystemInfo({ // 获取页面的有关信息
      success: function(res) {
        wx.setStorageSync('systemInfo', res)
        var ww = res.windowWidth;
        var hh = res.windowHeight;
        console.log("窗口的宽度" + ww);
        console.log("窗口的高度" + hh);
        console.log("屏幕宽度" + res.screenWidth);
        console.log("屏幕高度" + res.screenWidth);

        that.globalData.ww = ww;
        that.globalData.hh = hh;
      }
    });
  },
  bezier: function(pots, amount) {
    var pot;
    var lines;
    var ret = [];
    var points;
    for (var i = 0; i <= amount; i++) {
      points = pots.slice(0);
      lines = [];
      while (pot = points.shift()) {
        if (points.length) {
          lines.push(pointLine([pot, points[0]], i / amount));
        } else if (lines.length > 1) {
          points = lines;
          lines = [];
        } else {
          break;
        }
      }
      ret.push(lines[0]);
    }

    function pointLine(points, rate) {
      var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
      var ret = [];
      pointA = points[0]; //点击
      pointB = points[1]; //中间
      xDistance = pointB.x - pointA.x;
      yDistance = pointB.y - pointA.y;
      pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
      tan = yDistance / xDistance;
      radian = Math.atan(tan);
      tmpPointDistance = pointDistance * rate;
      ret = {
        x: pointA.x + tmpPointDistance * Math.cos(radian),
        y: pointA.y + tmpPointDistance * Math.sin(radian)
      };
      return ret;
    }
    return {
      'bezier_points': ret
    };
  },
  globalData: {
    userInfo: null,
    ww: 0,
    hh: 0,
    tel: '13975393397',
    //https://service.xyd999.net
    url: "http://localhost:8080/xydServer",
    defaultCity: "",
    lat: 0, //纬度
    lng: 0, //经度,
    numberofshoppingCarts: 0 //购物车数量


  }
})