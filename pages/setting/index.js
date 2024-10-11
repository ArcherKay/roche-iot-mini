const app = getApp()
const utils = app.utils
Page({
  data: {
    // 页面的初始数据
  },

  onLoad: function(options) {
    // 页面加载时执行的函数
  },

  navigateToServiceAgreement: function() {
    console.log('gododddk=====')
    wx.navigateTo({
      url: '/pages/userServiceAgreement/index'
    });
  },

  navigateToPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/userPrivacyAgreement/index'
    });
  },

  navigateToAboutCompany: function() {
    wx.navigateTo({
      url: '/pages/about/index'
    });
  },

  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出小程序吗？',
      success (res) {
        if (res.confirm) {
          console.log('用户确认退出')
          //重置全局变量
          app.globalData.userInfo = null
          app.globalData.phone = null
          // 清除本地数据
          wx.clearStorage()
          // 返回到登录页或首页
          wx.reLaunch({
            url: '/pages/index/index'
          })
        } else if (res.cancel) {
          console.log('用户取消退出')
        }
      }
    })
  }
})