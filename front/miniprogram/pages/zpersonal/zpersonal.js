Page({
  data: {
    isLogin : false,  // 是否登录
    loginBtnText : '点击登录/注册',
    appUserName : '',
    consolelog : '123',
  },

  /* 入口 */
  onLoad: function(options) {
    const thisView = this;
    thisView.initData = {...thisView.data};
    console.log(thisView.initData);
    if(getApp().globalData.isLogin === 1) { thisView.setData({ isLogin : true }); }
    if(thisView.data.isLogin) { thisView.loginViewDataUpdata(); }
    if(!thisView.data.isLogin) { thisView.quitLoginViewDataUpdata(); }
    wx.$event.on("updataIslogin-4", this, (isLogin) => {  // 全局监听：更新 data 的 islogin 时动态激发
      thisView.setData({ isLogin : isLogin });
      if(isLogin) { thisView.loginViewDataUpdata(); }
      if(!isLogin) { thisView.quitLoginViewDataUpdata(); }
    })
  },

  /* 用于储存最初的 data，用于退出登录后的数据还原 */
  initData : {},

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
                getApp().loginCheck(openid, token, (err, data)=>{
                  if(err || data.msg !== 'ok') {
                      console.log(err); getApp().globalData.isLogin = -1;
                      getApp().getUserLoginInfo();getApp().tip('验证出错，请重试！');
                    } else {
                      getApp().tip('验证成功：' + openid);
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
          // --全局事件 islogin = false
          // ...
          
          getApp().saveIdTkone2Sto('', '', (err, message) => {  // 缓存到本地
            if (err) { console.error('storage 空值化 失败', err); } else {
              console.log('storage 信息空值化成功！' + message);
              getApp().getUserLoginInfo();
              getApp().globalData.isLogin = -1;
              getApp().syncEventBus4('updataIslogin', false);
            }
          })
        } else if (res.cancel) {}
      }
    })
  },

  /* 登录后，联网获取一些信息，以及其他操作 */
  loginViewDataUpdata : function() {
    const thisView = this;
    getApp().getUserName((err, data) => {  // 获取用户的姓名
      if(err || data.msg !== 'ok'){console.log(data.msg);getApp().tip(data.msg + '获取用户呢称失败');} else {
        thisView.setData({ appUserName : data.data.username });
      }
    });
  },

  /* 未登录，状态的数据清空或还原，以及其他操作 */
  quitLoginViewDataUpdata : function() {
    const thisView = this;
    thisView.setData( thisView.initData );  // 清空（还原）data
  },

  /* 修改用户昵称 */
  modUserName : function() {
    const thisView = this;
    if(thisView.data.appUserName){
      console.log('开始修改');
      wx.showModal({
        title: '请输入您的新昵称',
        editable: true,
        placeholderText: thisView.data.appUserName,
        success (res) {
          if (res.confirm) { // 用户点确定
            console.log(res.content);
            if(res.content === '') {  // 如果用户没有输入内容，则只获取昵称
              getApp().getUserName((err, data) => {
                if(err || data.msg !== 'ok'){getApp().tip('获取用户呢称失败，可能是登录信息失效');} else {
                  thisView.setData({ appUserName : data.data.username });
                  getApp().tip('貌似成功了');
                }
              });
            } else {  // 用户输入了内容，则上传昵称，并重新获取昵称
              getApp().modUserName(res.content, (err, data) => {
                if(err || data.msg !== 'ok'){getApp().tip('修改用户呢称失败，可能是登录信息失效');} else {
                  getApp().getUserName((err, data) => {
                    if(err || data.msg !== 'ok'){getApp().tip('获取用户呢称失败，可能是登录信息失效');} else {
                      thisView.setData({ appUserName : data.data.username });
                    }
                  });
                }
              });
            }
          } else if (res.cancel) { }
        }
      })
    }
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