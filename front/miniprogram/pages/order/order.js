// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin : false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const thisView = this;
    if(getApp().globalData.isLogin === 1) { thisView.setData({ isLogin : true }); }
    wx.$event.on("updataIslogin-3", this, (isLogin) => {  // 全局监听：更新 data 的 islogin
      thisView.setData({ isLogin : isLogin });
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})


/*  // 底部导航栏使用，未来可以尝试改一下
Component({
  pageLifetimes: {  // 用于底部工具栏切换选中状态（不同页面，要注意修改 selected
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          selected: 2
        })
      }
    }
  }
})
*/