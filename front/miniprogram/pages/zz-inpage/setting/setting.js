// pages/zz-inpage/setting/setting.js
Page({

  /* 页面的初始数据 */
  data: {

  },

  /* 入口 */
  onLoad(options) {

  },
  
  /* 单击退出登录后 */
  quitLogin : function(){
    const thisView = this;
    wx.showModal({
      title: '提示', content: '确认退出当前账户？',
      confirmText:'是', cancelText:'否',
      success (res) {
        if (res.confirm) {
          getApp().saveIdTkone2Sto('', '', (err, message) => {  // 缓存到本地
            if (err) { console.error('storage 空值化 失败', err); } else {
              console.log('storage 信息空值化成功！' + message);
              getApp().getUserLoginInfo();
              getApp().globalData.isLogin = -1;
              getApp().syncEventBus4('updataIslogin', false);
              wx.navigateBack({ delta: 10 ,success: function(){ getApp().tip('退出成功！');  }});  // 返回上一页（个人中心页）
            }
          })
        } else if (res.cancel) {}
      }
    })
  },
  
})