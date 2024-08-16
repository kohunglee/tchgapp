// pages/store/store.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin : false
  },

  /* 入口 */
  onLoad(options) {
    const thisView = this;
    if(getApp().globalData.isLogin === 1) { thisView.setData({ isLogin : true }); }
    wx.$event.on("updataIslogin-2", this, (isLogin) => {  // 全局监听：更新 data 的 islogin
      thisView.setData({ isLogin : isLogin });
    })
  },

  testOpenImage : function(){
    getApp().testUpLoadFile();
  }
})


/*  // 底部导航栏使用，未来可以尝试改一下
Component({
  pageLifetimes: {  // 用于底部工具栏切换选中状态（不同页面，要注意修改 selected
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          selected: 1
        })
      }
    }
  }
})
*/