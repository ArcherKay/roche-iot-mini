Page({
  data: {
    errorMessage: ''
  },
  
  onLoad: function(options) {
    // 从传递过来的参数中获取错误信息
    const errorData = decodeURIComponent(options.errorMessage || '无错误信息');
    this.setData({
      errorMessage: errorData
    });
  },
  
  // 返回首页按钮事件
  backToHome: function() {
    wx.navigateBack({
      delta: 1
    });
  }
});
