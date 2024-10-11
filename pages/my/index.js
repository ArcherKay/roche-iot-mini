const app = getApp()
const utils = app.utils
import eventBus from '../../utils/eventBus';
Page({
  data: {
    userName: '用户名',
    phoneNumber: '',
    points: 0,
    avatar: '/static/img/avatar.jpg'
  },
  refreshMyPage: function() {
    this.setData({
      userName: app.globalData.userInfo.name || app.globalData.userInfo.nickName,
      phoneNumber: app.globalData.userInfo.phone,
      avatar: app.globalData.userInfo.avatarUrl,
      points: app.globalData.userInfo.score
    })
    // 获取image server token
    this.getImageServerToken()
    this.getUserToken()
  },
  onUnload: function() {
    console.log('onUnload')
    // 移除事件监听
    eventBus.off('refreshMyPage', this.refreshMyPage);
    
  },
  onLoad(options) {
    eventBus.on('refreshMyPage', this.refreshMyPage);
    if (app.globalData.phone != null) {
      console.log('avatar:' + app.globalData.userInfo.avatarUrl)
      this.setData({
        userName: app.globalData.userInfo.name || app.globalData.userInfo.nickName,
        phoneNumber: app.globalData.userInfo.phone,
        avatar: app.globalData.userInfo.avatarUrl,
        points: app.globalData.userInfo.score
      })
    }
    // 获取image server token
    this.getImageServerToken()
    this.getUserToken()
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

  navigateToPointsDetail: function() {
    // 判断是否已登录
    if (utils.isLogin() == false) {
      utils.navigateToLogin()  
      return
    }
    wx.navigateTo({
      url: '/pages/pointsDetail/index'
    });
  },

  navigateToFirstAid: function() {
    wx.navigateTo({
      url: '/pages/learnFirstAid/index'
    });
  },

  navigateToPurchaseIntent: function() {
    wx.navigateTo({
      url: '/pages/purchaseIntentionRegistration/index'
    });
  },
  navigateToResponser: function() {
    // 判断是否已登录
    if (utils.isLogin() == false) {
      utils.navigateToLogin()  
      return
    }
    // 查询responser信息
    this.emergencyResponderInfo()
   
  },
  emergencyResponderInfo: function() {
    const that = this
    const t = Date.parse(new Date()) / 1000
    wx.request({ 
      url:
        app.globalData.emergencyResponderInfo_url + '?' + 'id=' + app.globalData.userInfo.open_id,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "GET",
      success: function (res) {
        console.log('getFirstAidData:' + JSON.stringify(res))
        // fixme cp 测试数据
        // res.data.result = null; // 还未注册responser
        // 待审核状态
      //   res = {
      //     data: {
      //         result: {
      //             userId: 175,
      //             openId: "oT2r-56yWdjvXdszopEmkaptFXKg",
      //             ahaType: "AHA急救员", 
      //             isMedicalStaff: "否", 
      //             name: "张三", 
      //             certificateCategory: "AHA急救员证书", 
      //             contactNumber: "189****011", 
      //             address: "某市某区某街道", 
      //             currentUnit: null,
      //             latitude: 24.4933109, 
      //             longitude: 118.1953105, 
      //             online: false,
      //             lastModificationTime: "2022-04-02T09:31:11.0114613",
      //             lastModifierUserId: 1,
      //             creationTime: "2021-11-16T17:12:00",
      //             creatorUserId: 1,
      //             certificateAttachment: "https://yourapi.com/uploads/certificate/123.jpg",
      //             idCardAttachment: "https://yourapi.com/uploads/idcard/456.jpg",
      //             auditStatus: "待审核",
      //             auditFailureReason: null
      //         },
      //         success: true,
      //     },
      //     statusCode: 200
      // };

        if (res.statusCode == 200) {
          if (res.data !== undefined && res.data != null && res.data != '')
          {
             if (res.data.result == null) {
                // 还未注册
                wx.navigateTo({
                  url: '/pages/toBeResponser/index'
                });
             }
             else {
              // 处理附件URL
              res.data.result.certificateAttachment = res.data.result.certificateAttachment.split(';');
              res.data.result.idCardAttachment = res.data.result.idCardAttachment.split(';');
              const pdata = '?data=' + encodeURIComponent(JSON.stringify(res.data.result))
              wx.navigateTo({
                url: '/pages/emergencyResponderInfo/index' + pdata
              });

             }
          } 
        } else {
          console.log("do not exist aid")
        }

      },
      fail: function () {
        console.log("获取firstaid数据失败！")
      },
    })
    
  
  },
  onLogin: function() { 
    utils.navigateToLogin()  
  }
});
