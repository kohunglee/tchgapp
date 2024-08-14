// pages/zz-inpage/setting/setting.js
Page({

  /* 页面的初始数据 */
  data: {
    appUserName : '',  // 用户名
  },

  /* 入口 */
  onLoad(options) {
    const thisView = this;
    const eventChannel = thisView.getOpenerEventChannel();  // 通信通道
    eventChannel.on('dataTransform', function(data) {  // 获取到信息后，构建「设置」页
      thisView.initSetting(data);
    })
  },

  /* 根据通信通道得到的信息，来初始化 设置 页面 */
  initSetting : function(data) {
    const thisView = this;
    console.log('用户名为：' + data.appUserName);
    thisView.setData({
      appUserName : data.appUserName,
    });
  },
  
  /* 单击退出登录后 */
  quitLogin : function() {
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

  /* 在内页点击修改用户昵称 */
  modUserNameInZPage : function(e) {
    const thisView = this;
    const inputName = e.detail.value;
    if(inputName === thisView.data.appUserName) { console.log('名字一样，离开'); return 0;}
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