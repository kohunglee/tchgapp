Page({
  data: {
    message1 : '',
    message2 : '',
    message3 : '',
    isLogin : false,  // 是否登录
    loginBtnText : '点击登录/注册',
    appuserName : '',
  },

  onLoad: function(options) {
    const thisView = this;
    if(getApp().globalData.isLogin === 1) { thisView.setData({ isLogin : true }); }
    wx.$event.on("updataIslogin-4", this, (isLogin) => {  // 全局监听：更新 data 的 islogin
      thisView.setData({ isLogin : isLogin });
      if(isLogin) {  // 登录后的数据更新操作
        thisView.loginViewDataUpdata();  // 其他的界面数据更新操作
      }
    })
  },

  /* 全局事件测试 */
  onGlobalEvent: function(data) {
    console.log("接收到全局事件的数据：", data);
  },

  /* 单击 登录 按钮后 */
  loginByWx: function() {
    const thisView = this;
    wx.showActionSheet({  
      itemList: ['微信一键登录', '通过手机号码登录'],
      success: function(res) {  
        if (res.tapIndex === 0) {  // 使用微信登录
          wx.showModal({
            title: '登录授权提示', content: '授权小程序使用当前微信登录？\n（未注册用户将自动注册）',
            confirmText:'是', cancelText:'否',
            success (res) {
              if (res.confirm) {
                
                var openid = getApp().globalData.user_openid;
                var token = getApp().globalData.user_token;

                getApp().checkSession(openid, token, (err, data)=>{  // 必须再验证一遍，否则太危险了...
                  if(err || data.errmsg !== 'ok') {
                      console.log('err'); getApp().globalData.isLogin = -1;
                      getApp().getUserLoginInfo();getApp().tip('验证出错，请重试！');
                    } else {
                      getApp().tip('验证成功：' + openid);

                      // --将 globaldata 里 openid 和 token 存入 storage
                      // --删除 globaldata 里 openid 和 token
                      // --globaldata 里的 isLogin = 1
                      // --全局事件，通知其他页面也修正 data : islogin，以及一些其他的信息

                      getApp().saveIdTkone2Sto(openid, token, (err, message) => {  // 缓存到本地
                        if (err) { console.error('储存失败', err); } else {
                          console.log('信息储存到本地成功！' + message);
                          getApp().globalData.user_openid = null;  // 清除临时变量里的登录数据
                          getApp().globalData.user_token = null;
                          getApp().globalData.isLogin = 1;
                          getApp().syncEventBus4('updataIslogin', true);
                        }
                      })
                  }
                });

                

                
                
              } else if (res.cancel) {}
            }
          })
        } else if (res.tapIndex === 1) {  // 使用手机号登录 
          getApp().tip('暂未开放该功能');
        }
      }
    });  
       
  },

  /* （废弃）创建定时器，等待登录信息传来 */
  waitLoginInfo : function() {
    const thisView = this;
    if(getApp().globalData.isLogin === 0){
      var interID = setInterval(() => {
        if(getApp().globalData.isLogin === 0) {
          console.log('循环获取「是否登录」的信息中...');
        } else {
          console.log('循环完毕，现在修改 data 的值');
          clearInterval(interID); 
          interID = null;
          if(getApp().globalData.isLogin === 1) { thisView.setData({ isLogin : true }); }
        }
      }, 200);
    }
    if(getApp().globalData.isLogin === 1) { thisView.setData({ isLogin : true }); }
  },

  /* 单击退出登录后 */
  quitLogin : function(){
    const thisView = this;
    wx.showModal({
      title: '提示', content: '确认退出当前账户？',
      confirmText:'是', cancelText:'否',
      success (res) {
        if (res.confirm) {
          // --删除（空值化） storage 里的 openid 和 token
          // --重新获取一遍 openid 和 token
          // 用户在线的 data 都 一切清除和还原
          // --global Login = -1
          // 全局事件 islogin = false
          // ...
          
          getApp().saveIdTkone2Sto('', '', (err, message) => {  // 缓存到本地
            if (err) { console.error('空值化 失败', err); } else {
              console.log('信息空值化成功！' + message);
              getApp().getUserLoginInfo();
              getApp().globalData.isLogin = -1;
              getApp().syncEventBus4('updataIslogin', false);
            }
          })
        } else if (res.cancel) {}
      }
    })
  },

  /* 登录后，联网获取一些信息 */
  loginViewDataUpdata : function() {
    getApp().getUserName();  // 获取用户的姓名

  }
})





/*  // 底部导航栏使用，未来可以尝试改一下
Component({
  pageLifetimes: {  // 用于底部工具栏切换选中状态（不同页面，要注意修改 selected
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          selected: 3
        })
      }
    }
  }
})
*/