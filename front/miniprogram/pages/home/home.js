// pages/home/home.js
Page({

  
  data: {
    isLogin : false,
    businessArray: [
      { uid : 32, name : '李记扁粉大酒店', operatingHours : '6:00 ~ 23:00', awayFrom : '1 km'},
      { uid : 41, name : '重庆火锅', operatingHours : '8:00 ~ 24:00', awayFrom : '0.7 km'},
      { uid : 42, name : '李记淄博烧烤', operatingHours : '12:00 ~ 23:00', awayFrom : '0.2 km'},
      { uid : 43, name : '安阳大烩菜', operatingHours : '9:00 ~ 21:00', awayFrom : '4 km'},
      { uid : 54, name : '玉林脆皮狗', operatingHours : '6:00 ~ 21:00', awayFrom : '2 km'},
      { uid : 59, name : '潮汕海鲜火锅', operatingHours : '8:00 ~ 20:00', awayFrom : '1.8 km'},
      { uid : 61, name : '老北京铜锅火锅', operatingHours : '8:00 ~ 24:00', awayFrom : '0.7 km'},
      { uid : 62, name : '日本小寿司', operatingHours : '12:00 ~ 23:00', awayFrom : '0.2 km'},
      { uid : 63, name : '美国洛杉矶牛肉面', operatingHours : '9:00 ~ 21:00', awayFrom : '4 km'},
      { uid : 64, name : '枫叶刀削面', operatingHours : '6:00 ~ 21:00', awayFrom : '2 km'},
      { uid : 65, name : '曲沟大驴肉', operatingHours : '8:00 ~ 20:00', awayFrom : '1.8 km'},
      { uid : 66, name : '道口烧鸭', operatingHours : '8:00 ~ 24:00', awayFrom : '0.7 km'},
      { uid : 67, name : '沙县大吃', operatingHours : '12:00 ~ 23:00', awayFrom : '0.2 km'},
      { uid : 68, name : '意大利 gaga 西餐店', operatingHours : '9:00 ~ 21:00', awayFrom : '4 km'},
      { uid : 69, name : '韩国泡菜小酒店', operatingHours : '6:00 ~ 21:00', awayFrom : '2 km'},
      { uid : 70, name : '台湾烤大肠', operatingHours : '8:00 ~ 20:00', awayFrom : '1.8 km'},
    ],
  },

  /* 入口 */
  onLoad(options) {
    const thisView = this;
    if(getApp().globalData.isLogin === 1) { thisView.setData({ isLogin : true }); }
    wx.$event.on("updataIslogin-1", this, (isLogin) => {  // 全局监听：更新 data 的 islogin
      thisView.setData({ isLogin : isLogin });
    })
  },

  /* 打开商家详情页 */
  openBnsPage : function(e) {
    const thisView = this;
    var e_bnsuid = e.currentTarget.dataset.uid;  // 商家唯一识别ID
    wx.navigateTo({  
      url: '/pages/zz-inpage/bnsinfor/bnsinfor',
      success: function(res) {  // 将必要的数据传输给 商家详情页
        res.eventChannel.emit('dataTransform', { 
          bnsuid: e_bnsuid,
          isLogin : thisView.data.isLogin,
        })
      }
    })
  }
})

/*  // 底部导航栏使用，未来可以尝试改一下
Component({
  pageLifetimes: {  // 用于底部工具栏切换选中状态（不同页面，要注意修改 selected
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          selected: 0
        })
      }
    }
  }
})
*/