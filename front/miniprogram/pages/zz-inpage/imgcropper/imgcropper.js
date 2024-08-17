Page({
  data: {
      cropper_src:''
  },
  onLoad: function (options) {
      this.cropper = this.selectComponent("#image-cropper");  // 获取到 image-croppe r实例
      this.setData({  // 开始裁剪
        cropper_src : options.imgsrc,
      });
      wx.hideLoading();
  },

  /*  */
  cropperload : function(e){ console.log("cropper 初始化完成", e.detail); },

  /* */
  loadimage : function(e){
      console.log("图片加载完成", e.detail);
      this.cropper.imgReset();  // 重置图片角度、缩放、位置
  },

  /* 上传我的图片 */
  submitMyImage : function(){
    // this.cropper.getImg((obj) => {
    //   console.log('当前图片的地址为：');
    //   console.log(obj.url);
    // });    
  }
})

// wx.cloud.init();
        // wx.cloud.uploadFile({
        //   cloudPath: 'example'+ imageSize +'.jpg',
        //   filePath: imageUrl,
        //   config: {env: 'prod-2g3ftnp7705efda4'},
        //   success: function(res) { appfunc.tip('成功！' + res.fileID, 4000) },
        //   fail: function(err) { appfunc.tip(err) }
        // })