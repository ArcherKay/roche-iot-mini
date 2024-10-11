Page({
  data: {
    title: '',
    type: 0,
    content: '',
    url: '',
    htmlContent: ''
  },

  onLoad(options) {
    // wx.setNavigationBarTitle({
    //   title: options.title.length > 20 ? options.title.substring(0, 20) + '...' : options.title
    // });
    wx.setNavigationBarTitle({
        title: options.title
      })
    this.setData({
      title: options.title,
      type: Number(options.type),
      content: decodeURIComponent(options.content || ''),
      url: decodeURIComponent(options.url || ''),
      htmlContent: options.type == 0 ? decodeURIComponent(options.content || '') : ''
    });
  }
});