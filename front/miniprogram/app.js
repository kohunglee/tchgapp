import './eventbus/eventbus'

App({
  onLaunch (options) {
    this.initLogConfig();  // 初始化用户登录的事宜
  },
  onShow (options) {},
  onHide () {},
  onError (msg) { console.log(msg) },
  globalData : {
    'user_openid' : '',
    'user_token' : '',
    'isLogin' : 0,   // -1：检查完发现不能自动登陆  0：默认值  1：已登录
    'appuserName' : null,
  },
  
  /* --------------------- */
  /* 下面都是自己构建的 函数库 */
  /* --------------------- */

  /* 向我的托管程序发送 post 请求 */ 
  postToserver: function(path, data){
    wx.cloud.init()
    return wx.cloud.callContainer({
      "config": { "env": "prod-2g3ftnp7705efda4" },
      "path": path,
      "header": { "X-WX-SERVICE": "thinkphp-nginx-jugv" },
      "method": "POST", "data": data
    })
  },

  /* 网络错误提示（应该会很常用） */ 
  netErrorTip : function(msg = '网络错误') {
    return wx.showToast({ title: msg, icon: 'error', mask: true, duration: 2000})
  },

  /* 小型蒙层弹窗，用作小提示 */
  tip : function(msg, time = 1200) {
    return wx.showToast({ title: msg, icon: 'none', mask: true, duration: time})
  },

  /* （太过干扰，最后再加）加载中弹窗 */
  loading : function(act = 'show') {
    if(act === 'show') { wx.showLoading({mask : true, title: '加载中'}) }
    if(act === 'hide') { wx.hideLoading() }
    return 0;
  },

  /* （目前，备而不用）随机数生成器 */
  getRandom : function(minNum, maxNum){
    switch(arguments.length){ 
      case 1:
        return parseInt(Math.random()*minNum+1,10); break;
      case 2:
        return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); break;
      default:
        return 0; break;
    } 
  },

  /* 启动小程序后，如果本地没存数据，就直接就获取用户 openid 信息，并存入 globaldata */
  getUserLoginInfo : function(){
    const appfunc = this;
    wx.login({ success (res) {
      if (res.code) {
        console.log('jscode: ' + res.code)
        appfunc.postToserver('/index/getWxOpenid', {'jscode' : res.code})
          .then(res => {
            if(res.data.openid == null) { appfunc.tip('无法连接服务器... 请重启小程序重试！'); return 0}
            console.log(res.data)
            appfunc.globalData.user_openid = res.data.openid;  // ↓ 先储存到 global data 中，后续用户点击登录时可以直接调用
            appfunc.globalData.user_token = res.data.session_key;
            console.log('...')
            appfunc.tip('auto:' + getApp().globalData.user_openid);
          }).catch(err => {  appfunc.netErrorTip(err) });
      } else { appfunc.netErrorTip() }
    }, fail (res) {
      console.log(res); appfunc.tip('连接服务器失败');
    }
  })
  },

  /* 验证本地的 token 是否有效 */
  checkSession : function(openid, token, callback){
    var t_openid = openid, t_token = token;
    console.log('上传验证的openid' + t_openid);
    this.postToserver('/index/checkSession', {'openid' : t_openid, 'sha_session' : t_token})
      .then(res => {
        console.log(res.data);
        if(res.data.errmsg === 'ok'){
          callback(null, res.data);
        } else {callback('err, 验证信息出错')}
      })
      .catch(err => { callback(err)});
  },

  /* 异步将 id 和 token 储存到微信本地缓存 */
  saveIdTkone2Sto : function(openid, token, callback) {
    console.log('开始储存 id 和 token');
    const appfunc = this;
    return wx.setStorage({
      key: "user_openid", data: openid, encrypt: true, 
      success() { 
        wx.setStorage({
          key: "user_token", data: token, encrypt: true,
          success: function() { callback(null, 'success'); }, fail: function(err) { callback(err); }
        })
      }, fail: function(err) { callback(err); appfunc.netErrorTip('未知错误！');  }
    })
  },

  /* 获取储存到本地的 id 和 token。（异步）  */
  getInStoIdToken : function(callback){
    var openid, token;
    return wx.getStorage({
      key: "user_openid", encrypt: true,
      success(res) { 
        openid = res.data;
        wx.getStorage({
          key: "user_token", encrypt: true,
          success(res) { token = res.data; callback((openid === '' || token === '') ? 'err0' : null, {openid : openid, token : token}); },
          fail: function() { callback('err1'); }
        })
      }, fail: function() { callback('err2'); }
    })
  },

  /* 初始化登录方面的事宜，如：检查是否有本地的登录信息等等... */
  initLogConfig : function(){
    const appfunc = this;
    appfunc.tip('读取登录信息中...');
    appfunc.getInStoIdToken((err, data) => {  // 第一步，读缓存盘，看看有缓存的 id 和 token 吗
      if(err){
        appfunc.tip('请先登录');
        console.log('缓存信息不存在，需要用户手动登录');
        appfunc.globalData.isLogin = -1;
        appfunc.getUserLoginInfo();
      } else {  // id 和 token 存在
        console.log('缓存信息存在');
        appfunc.checkSession(data.openid, data.token, (err, data)=>{
          console.log('检验数据有效性完成，回调数据如下：');
          console.log(data);
          if(err == null && data.errmsg !== 'undefined' && data.errmsg === 'ok'){
            console.log('在线核验通过！');
            appfunc.tip('登录成功！');
            getApp().syncEventBus4('updataIslogin', true);
            appfunc.globalData.isLogin = 1;
          } else {
            appfunc.tip('信息失效，请重新登陆');
            console.log('sorry，在线核验未通过');
            appfunc.globalData.isLogin = -1;
            appfunc.getUserLoginInfo();
          }
        });
      }
    });
  },

  /* 全局事件，四个页面同步发出 */
  syncEventBus4 : function(name, param){
    wx.$event.emit(name + "-1", param);
    wx.$event.emit(name + "-2", param);
    wx.$event.emit(name + "-3", param);
    wx.$event.emit(name + "-4", param);
  },

  /* 根据 token 向小程序服务器发送 post 指令，分为 正常 或 非正常登录状态 */
  userSendPostToCloud : function(type, path, postdata, callback) {  // type 分为 'global'（伪登录游客） 和 'storage'(登录)
    var openid, token;
    const appfunc = this;
    if(type === 'storage') {  // 正常登录
      appfunc.getInStoIdToken((err, data) => {
        if(err){appfunc.netErrorTip((err === 'err0') ? '未登录' : '未知错误！');callback(err)} else {
          console.log(data);
          openid = data.openid, token = data.token;
          var userInfoData = {'openid' : openid, 'token' : token, 'postType' : type};
          var sendData = {...postdata, ...userInfoData};
          appfunc.postToserver(path, sendData)
            .then(res => {
              callback(null, res.data);
            })
            .catch(err => { callback(err) });
        }
      });
    } else if(type === 'global') { /* 非正常登录，也叫 伪登录游客，先空着 */  }
  },

  /* 登录后，获取用户名 */
  getUserName : function(callback) {
    var appfunc = this;
    appfunc.userSendPostToCloud('storage', '/index/getUserName', {}, (err, data) => {
      callback(err, data);
    });
  },

  /* 登录后，修改用户名 */
  modUserName : function( newName, callback) {
    var appfunc = this;
    if(newName === '') {newName = 'empty'}
    appfunc.userSendPostToCloud('storage', '/index/modUserName', {'newName' : newName}, (err, data) => {
      callback(err, data);
    });
  },





})