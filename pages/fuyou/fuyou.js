Page({

  pay:function(){
    console.log("支付")
    wx.request({
      url: 'http://192.168.10.120:8080/xydServer/servlet/pay/openid',
      data:{},
      success:function(e){
console.log(e)
      }
    })
  }
})