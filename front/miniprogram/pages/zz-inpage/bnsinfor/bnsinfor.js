// pages/zz-inpage/bnsinfor.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin : false,
    businessArray: [
      { uid : 32, name : '李记扁粉大酒店', operatingHours : '6:00 ~ 23:00', awayFrom : '1 km'},
      { uid : 41, name : '重庆火锅', operatingHours : '8:00 ~ 24:00', awayFrom : '0.7 km'},
      { uid : 42, name : '冯记淄博烧烤', operatingHours : '12:00 ~ 23:00', awayFrom : '0.2 km'},
      { uid : 43, name : '安阳大烩菜', operatingHours : '9:00 ~ 21:00', awayFrom : '4 km'},
    ],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(option) {
    console.log(option.query);
    const eventChannel = this.getOpenerEventChannel();  // 通信通道
    eventChannel.on('dataTransform', function(data) {
      console.log(data)
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