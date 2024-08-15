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
    if(inputName == ''){console.log('输入为空，离开'); return 0;}
    if(inputName === thisView.data.appUserName) { console.log('名字一样，离开'); return 0;}
    if(thisView.data.appUserName){
      console.log('开始修改');
      getApp().modUserName(inputName, (err, data) => {  // 向服务器发送修改请求
        if(err || data.msg !== 'ok'){getApp().tip('修改用户呢称失败，可能是登录信息失效');} else {
          getApp().getUserName((err, data) => {  // 向服务器请求获取最新的昵称
            if(err || data.msg !== 'ok'){getApp().tip('获取用户呢称失败，可能是登录信息失效');} else {
              const onLineUserName = data.data.username;
              thisView.setData({ appUserName : onLineUserName });
              wx.$event.emit('updataData', { appUserName : onLineUserName });  // 向「个人中心」页面，发送新修改的昵称
              wx.showToast({ title: '修改昵称成功', icon: 'success', duration: 1000 });
            }
          });
        }
      });
    }
  }
})