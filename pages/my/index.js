const app = getApp()
const utils = app.utils
import eventBus from '../../utils/eventBus';
Page({
  data: {
    userName: '用户名',
    phoneNumber: '',
    account: '',
    isLoggedIn: false,
    points: 0,
    avatar: '/static/img/avatar.jpg'
  },
  refreshMyPage: function() {
    this.syncUserState()
    // 获取image server token
    this.getImageServerToken()
    this.getUserToken()
  },
  syncUserState: function() {
    const mesIotUserInfo = app.globalData.mesIotUserInfo || wx.getStorageSync('mesIotUserInfo') || null
    const legacyUserInfo = app.globalData.userInfo || {}
    const isLoggedIn = !!app.globalData.mesIotAccessToken
    const account = isLoggedIn && mesIotUserInfo && mesIotUserInfo.account ? mesIotUserInfo.account : ''
    const phoneNumber = account || legacyUserInfo.phone || ''
    this.setData({
      isLoggedIn: isLoggedIn,
      account: account,
      userName: account || legacyUserInfo.name || legacyUserInfo.nickName || '用户名',
      phoneNumber: phoneNumber,
      avatar: legacyUserInfo.avatarUrl || this.data.avatar,
      points: legacyUserInfo.score || 0
    })
  },
  onUnload: function() {
    console.log('onUnload')
    // 移除事件监听
    eventBus.off('refreshMyPage', this.refreshMyPage);
    
  },
  onLoad(options) {
    eventBus.on('refreshMyPage', this.refreshMyPage);
    this.syncUserState()
    // 获取image server token fixme cp
    this.getImageServerToken()
    this.getUserToken()
   },

   onShow: function() {
    this.syncUserState()
   },

   onChooseAvatar: function(e) {
    const that = this;
	  const avatarUrl = e.detail.avatarUrl
	  console.log('onChooseAvatar file url:' + avatarUrl)
    
    wx.uploadFile({
      url: app.globalData.uploadFile_url, // 上传文件的接口地址
      filePath: avatarUrl, // 上传文件的临时路径
      name: 'files', // 文件对应的 key，即表单字段名
      header: {
        'accept': 'text/plain',
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + app.globalData.imageServerToken
      },
      formData: {
        'providerKey': 'miniprogram-avatar',
        'providerName': 'miniprogram-avatar',
        'BusinessId': '',
        'remark': ''
      },
      success(res) {
        console.log('上传成功', JSON.stringify(res));
        if (res.statusCode== 200) {
          const resp =  JSON.parse(res.data) 
          if (resp.result !== undefined && resp.result != null && resp.result != '') {
             const avatar_url = app.globalData.imageServerUrl + resp.result[0].id
             that.setData({avatar:avatar_url})
             // update user profile
             //  console.log('avatar_url', JSON.stringify(avatar_url));
            that.updateUserProfile()
          }
        }
        
      },
      fail(err) {
        console.log('上传失败', err);
      }
    });

  },

  updateUserProfile: function() {

    const that = this
    wx.request({ 
      url:
        app.globalData.uploadUserProfile_url,
      header: {
        "Content-Type": "application/json-patch+json",
        // 'accept': 'text/plain'
        'Authorization': 'Bearer ' + app.globalData.authUserToken
      },
      method: "PUT",
      data: {
        id: app.globalData.userInfo.userId,
        avatarUrl: that.data.avatar,
        name:'' // fixme cp
      },
      success: function (res) {
        console.log('updateUserProfile success:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          // 更新全局变量
          app.globalData.userInfo.avatarUrl = that.data.avatar
          console.log('avatar is :' + that.data.avatar)
          // 同步存储用户信息
          try {
            wx.setStorageSync('jzxj_userInfo', app.globalData.userInfo);
            console.log('User Info stored successfully');
          } catch (e) {
            console.error('Failed to store User Info:', e);
          }
        } else {
          console.log("updateUserProfile fail")
        }
      },
      fail: function () {
        console.log("保存用户信息失败！")
      }
    })
  },

  getImageServerToken: function() {
    const that = this
    wx.request({
      url: app.globalData.imageServerToken_url,
      method: 'POST',
      header: {
        'content-type': 'application/json-patch+json',
        'accept': 'text/plain'
      },
      data: {
        userNameOrEmailAddress: app.globalData.imgServerUser,
        password: app.globalData.imgServerPwd,
        rememberClient: true
      },
      success: function(res) {
        if (res.statusCode == 200) {
          if (res.data != null && res.data !== undefined && res.data != '') {
            app.globalData.imageServerToken = res.data.result.accessToken
            console.log('token Success:' + JSON.stringify(app.globalData.imageServerToken));
            return
          }
        }
        console.log('token fail')
        
      },
      fail: function(err) {
        console.log('Error:', err);
      }
    });
  
  },

  getUserToken: function() {
    const that = this
    wx.request({
      url: app.globalData.userToken_url,
      method: 'POST',
      header: {
        'content-type': 'application/json-patch+json',
        'accept': 'text/plain'
      },
      
      data: {
        userNameOrEmailAddress: app.globalData.authUser,
        password: app.globalData.authPwd,
        rememberClient: true
      },
      success: function(res) {
        if (res.statusCode == 200) {
          console.log('authuser token Success:' + JSON.stringify(res))
          if (res.data != null && res.data !== undefined && res.data != '') {
            app.globalData.authUserToken = res.data.result.accessToken
            console.log('authuser token Success:' + JSON.stringify(app.globalData.authUserToken));
            return
          }
        }
        console.log('token fail')
        
      },
      fail: function(err) {
        console.log('Error:', err);
      }
    });
  
  },

  editProfile: function() {
    wx.navigateTo({
      url: '/pages/setting/index'
    });
  },

  navigateToUserProfile: function() {
    // 判断是否已登录
    if (utils.isLogin() == false) {
      utils.navigateToLogin()  
      return
    }
    wx.navigateTo({
      url: '/pages/userProfile/index'
    });
  },

 
  navigateToPurchaseIntent: function() {
    wx.navigateToMiniProgram({
      appId: 'wx91d27dbf599dff74',
      path: '/pages/item/detail/detail?sku=10085917758969',
      envVersion: 'release',
      fail: function(error) {
        if (error && error.errMsg && error.errMsg.indexOf('cancel') !== -1) return;
        wx.showModal({
          title: '暂时无法打开京东商品',
          content: '请稍后重试，或在京东搜索商品编号 10085917758969。',
          showCancel: false
        });
      }
    });
  },
  navigateToPurifierStore: function() {
    this.navigateToJdStore();
  },
  navigateToJdStore: function() {
    wx.navigateToMiniProgram({
      appId: 'wx91d27dbf599dff74',
      path: '/pages/shop/index/index?shopId=10050767',
      envVersion: 'release',
      fail: function(error) {
        if (error && error.errMsg && error.errMsg.indexOf('cancel') !== -1) return;
        wx.showModal({
          title: '暂时无法打开京东',
          content: '请稍后重试，或在京东搜索净水器及滤芯。',
          showCancel: false
        });
      }
    });
  },
  navigateToDeviceMaintenance: function() {
    // fixme cp
    // if (utils.isLogin() == false) {
    //   utils.navigateToLogin()  
    //   return
    // }
    // 转到净水器维护界面
    wx.switchTab({
      url: '/pages/deviceMaintenance/index'
    });

   
  },
  logout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定退出当前账号并重新登录吗？',
      success: (result) => {
        if (!result.confirm) return;

        app.globalData.mesIotAccessToken = '';
        app.globalData.mesIotUserInfo = null;
        app.globalData.userInfo = null;
        app.globalData.phone = null;
        app.globalData.pendingSharedDeviceId = '';

        wx.removeStorageSync('mesIotAccessToken');
        wx.removeStorageSync('mesIotUserInfo');
        wx.removeStorageSync('jzxj_phone');
        wx.removeStorageSync('jzxj_userInfo');
        wx.removeStorageSync('pendingSharedDeviceId');

        wx.reLaunch({ url: '/pages/login/login' });
      }
    });
  },
  onLogin: function() { 
    utils.navigateToLogin()  
  }
});
