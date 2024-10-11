import eventBus from '../../utils/eventBus';
const app = getApp()
const utils = app.utils 
Page({
  data: {
    name: '',
    genders: ['男', '女'],
    genderIndex: 0,
    idCard: '',
    contact: ''
  },
  onLoad: function () {
    var that = this
    // 用全局变量初始化
    console.log('userProfile:' + JSON.stringify(app.globalData.userInfo))


    this.setData({
      name: app.globalData.userInfo.name,
      genderIndex: app.globalData.userInfo.sex,
      idCard: app.globalData.userInfo.idCard,
      contact:app.globalData.userInfo.contact
    })

  },
 
  updateUserProfile: function() {

    const that = this
    wx.request({ 
      url:
        app.globalData.uploadUserProfile_url,
      header: {
        "Content-Type": "application/json-patch+json",
        'Authorization': 'Bearer ' + app.globalData.authUserToken
      },
      method: "PUT",
      data: {
        id: app.globalData.userInfo.userId,
        sex: that.data.genderIndex,
        name: that.data.name,
        contact: that.data.contact,
        idCard: that.data.idCard
      },
      success: function (res) {
        console.log('updateUserProfile success:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          // 更新全局变量
          app.globalData.userInfo.name = that.data.name
          app.globalData.userInfo.sex = that.data.genderIndex
          app.globalData.userInfo.idCard = that.data.idCard
          app.globalData.userInfo.contact = that.data.contact
          
          // 同步存储用户信息
          try {
            wx.setStorageSync('jzxj_userInfo', app.globalData.userInfo);
            console.log('User Info stored successfully');
          } catch (e) {
            console.error('Failed to store User Info:', e);
          }
          // 提示更新成功，返回
          wx.showToast({
            title: '提交成功',
            duration:1000,
          });
          // 发送更新mypage
          eventBus.emit('refreshMyPage', {});
          setTimeout(function () {
            wx.navigateBack({
              delta: 1,
            })
          }, 1000);
                
        } else {
          console.log("updateUserProfile fail")
        }
      },
      fail: function () {
        console.log("保存用户信息失败！")
      }
    })
  },
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  onGenderChange(e) {
    this.setData({
      genderIndex: e.detail.value
    });
  },

  onIdNumberInput(e) {
    this.setData({
      idCard: e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      contact: e.detail.value
    });
  },

  onSubmit() {
    const { name, genderIndex, genders, idCard, contact } = this.data;
    console.log('提交信息:', {
      name,
      gender: genders[genderIndex],
      idCard,
      contact
    });
    
    this.updateUserProfile()




  }
});
