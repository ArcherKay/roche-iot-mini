import eventBus from '../../utils/eventBus';
const app = getApp()
const utils = app.utils
const API_BASE_URL = 'https://www.uvipwap.com/MesIOTApi';

Page({
  data: {
    account: '',
    password: '',
    showPassword: false,
    isLoading: false,
    mobileNum: null,
    disabled: false,
    countDown: "",
    webViewUrl:'',
    agreelog:false,
    jscode:null,
    jscodeTimestamp:0
  },

  startJscodeRefreshTimer: function() {
    const that = this;
    this.jscodeTimer = setInterval(function() {
      const currentTime = Date.now();
      const elapsedTime = currentTime - that.data.jscodeTimestamp;

      if (elapsedTime >= (4 * 60 - 10) * 1000) { // 4分钟后刷新 jscode
        console.log('4分钟时间到了，需要更新jscode')
        that.updateJscode();
      }
      else {
        console.log('120秒时间到了检查，还未到4分钟')
      }
    }, 120 * 1000); // 每十秒检查一次
  },

  stopJscodeRefreshTimer: function() {
    if (this.jscodeTimer) {
      clearInterval(this.jscodeTimer);
    }
  },
  updateJscode: function() {
    const that = this;
    wx.login({
      success(res) {
        if (res.code) {
          console.log('更新jscode成功，开始计时');
          that.setData({
            jscode: res.code,
            jscodeTimestamp: Date.now() // 保存获取 jscode 的时间戳
          });
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      }
    });
  },


  tips: function() {
    wx.showToast({
      title: '请仔细阅读并勾选《用户协议》与《隐私政策》', 
      icon: 'none', 
      duration:2000, 
      success: function () {
        
      }
    })
  },
  chagree: function() {
    this.setData({
      agreelog: true
    })
  },
  onUnload: function() {
    this.stopJscodeRefreshTimer();
    console.log('onUnload');
  },
  onLoad: function () {
    if (app.globalData.mesIotAccessToken) {
      wx.switchTab({ url: '/pages/purifier/index' });
    }
  },
  onAccountInput: function (event) {
    this.setData({ account: event.detail.value });
  },
  onPasswordInput: function (event) {
    this.setData({ password: event.detail.value });
  },
  togglePasswordVisibility: function () {
    this.setData({ showPassword: !this.data.showPassword });
  },
  submitLogin: function () {
    const account = this.data.account.trim();
    const password = this.data.password;
    if (!account || !password) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' });
      return;
    }
    if (!this.data.agreelog) {
      this.tips();
      return;
    }

    const that = this;
    let loadingUserInfo = false;
    this.setData({ isLoading: true });
    wx.request({
      url: API_BASE_URL + '/api/identity/token?culture=zh-CN',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { account: account, password: password, verifyCode: '' },
      success: function (response) {
        const payload = response.data || {};
        const accessToken = payload.data && payload.data.accessToken;
        if (response.statusCode !== 200 || payload.code !== 200 || !accessToken) {
          wx.showToast({ title: payload.message || '账号或密码错误', icon: 'none' });
          return;
        }

  loadingUserInfo = true;
        wx.request({
          url: API_BASE_URL + '/api/identity/getuserinfo?culture=zh-CN',
          method: 'GET',
          header: { Authorization: 'Bearer ' + accessToken },
          success: function (userResponse) {
            const userPayload = userResponse.data || {};
            const userInfo = userPayload.data;
            if (userResponse.statusCode !== 200 || userPayload.code !== 200 || !userInfo) {
              wx.showToast({ title: userPayload.message || '获取用户信息失败', icon: 'none' });
              return;
            }

            try {
              wx.setStorageSync('mesIotUserInfo', userInfo);
              wx.setStorageSync('mesIotAccessToken', accessToken);
            } catch (error) {
              wx.showToast({ title: '登录状态保存失败', icon: 'none' });
              return;
            }
            app.globalData.mesIotAccessToken = accessToken;
            app.globalData.mesIotUserInfo = userInfo;
            const pendingSharedDeviceId = app.globalData.pendingSharedDeviceId || wx.getStorageSync('pendingSharedDeviceId');
            if (pendingSharedDeviceId) {
              wx.redirectTo({
                url: '/pages/sharedDeviceAccept/index?deviceId=' + encodeURIComponent(pendingSharedDeviceId),
                success: function () {
                  app.globalData.pendingSharedDeviceId = '';
                  wx.removeStorageSync('pendingSharedDeviceId');
                }
              });
              return;
            }
            wx.switchTab({ url: '/pages/purifier/index' });
          },
          fail: function () {
            wx.showToast({ title: '获取用户信息失败，请检查网络', icon: 'none' });
          },
          complete: function () {
            that.setData({ isLoading: false });
          }
        });
      },
      fail: function () {
        wx.showToast({ title: '登录请求失败，请检查网络', icon: 'none' });
      },
      complete: function () {
        if (!loadingUserInfo) that.setData({ isLoading: false });
      }
    });
  },
  // 其它方式登入
  navigateToLogin:function () {
    var that = this
    let agreelog = !that.data.agreelog
    if(that.data.agreelog){
    var pageUrl = "/pages/verifylogin/verifylogin"
        wx.navigateTo({
          url: pageUrl,
        })
      }else{
        wx.showToast({
          title: '请仔细阅读并勾选《用户协议》与《隐私政策》', 
          icon: 'none', 
          duration:2000,
          success: function () {
            
          }
        })
      }
  },
  navigateUserprivacy:function () {    
    var pageUrl = "/pages/userServiceAgreement/index"
        wx.navigateTo({
          url: pageUrl,
        }) 
  },
  navigatePrivacy:function () {
    var pageUrl = "/pages/userPrivacyAgreement/index"
        wx.navigateTo({
          url: pageUrl,
        })
  },

  /**一键登入 */
  qetMobileNumber: function (e) {
    var that = this
    let jscode = that.data.jscode
    e.detail.code = jscode
    that.getNumberFromServer(e.detail)
  },
  getNumberFromServer: function (pdata) {
    var that = this
    console.log('qetMobileNumber:' + JSON.stringify(pdata))
    // {
    //   "errMsg": "getPhoneNumber:ok",
    //   "encryptedData": "iEy5Ka2Vh5NGUusYxXqSReWGrhhD92Ah3WkI5WEr1xOKUd1uBNMC8Na84ohgXh7qIiq/RPU5TA4Kn4gin5G4MMNwasod70oHxWffV4C7OtMeADvZ+Sq/QiT4MP6fOlTOTmwVOkARWsIvumCvkxY2muxEV9aQ/KtgNvoDviyPJv8x299ADejN/40egKFGwsvqGxsLV4sxbQ8kIQctER+XWg==",
    //   "iv": "1jFoxPE08F5WOVvKOvTLJw==",
    //   "cloudID": "81_iVC_MBncXNaZ3THWmMWC5eR_wLxO1x3J5LPufED1qnfrEunkhZ_ID-liXV0",
    //   "code": "0e1meKml2xCpDd4xrcll2IMUEl0meKmU"
    // }
    
    // 先用原来的接口来登入
    let jscode = pdata.code
    let encryptedData = pdata.encryptedData
    let iv = pdata.iv
    wx.request({
      url: app.globalData.url + 'GetOpenId4MiniApp' + '?code=' + jscode,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      data: {
        code : jscode
      },
      success:function(res){
        if (res.statusCode == 200) {
            const open_id = res.data.openid
            const session_key = res.data.session_key
            console.log('open_id======:' + open_id);
            console.log('session_key:' + session_key);
            // 试着客户端解密
            // 解密手机号
            const phoneNumberObject = utils.decryptPhoneNumber(session_key, iv, encryptedData);
            console.log('phone=' +  JSON.stringify(phoneNumberObject) );
            // {"phoneNumber":"18621394966","purePhoneNumber":"18621394966","countryCode":"86","watermark":{"timestamp":1718161693,"appid":"wx5b6b7fad0af0aaea"}}
            const phone = phoneNumberObject.phoneNumber
            that.userLogin(phone, open_id)

        }
        else {
          utils.showTip("手机号码获取失败，请重新尝试！")
        }
      },
      fail:function(){
        console.log('手机号码获取失败，请重新尝试！')
      }
    });

  },

  userLogin: function (phonenumber, open_id) {
    const that = this
    wx.request({ 
      url:
        app.globalData.login_url,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "POST",
      data: {
        phone: phonenumber,
        openId: open_id,
        // avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        // name:'微信用户',
        // nickName:'微信用户'
      },
      success: function (res) {
        // console.log('xcx_login======:' + JSON.stringify(res))
        // wx.navigateTo({
        //     url: '/pages/error/index?errorMessage=' + encodeURIComponent('phonenumber:' + phonenumber + 'open_id:' + open_id + 'res:' + JSON.stringify(res))
        //   });
        // 测试
        that.getUserInfo(phonenumber, open_id)  

      },
      fail: function () {
        utils.showTip("登录失败,请重新登入！")
      },
    })
    
  },
  getUserInfo: function (phonenumber, open_id) {
    const that = this
    // console.log('getUserInfo:' + app.globalData.userInfo_url + '?openId=' + open_id)
    // open_id = "okZP25Q8mrFKdhInrOjCUp2Lm0jo"
    wx.request({ 
      url:
        app.globalData.userInfo_url + '?openId=' + open_id,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "GET",
      success: function (res) {
        // console.log('getUserInfo res:' + JSON.stringify(res))
        // alert(open_id + 'JSON.stringify(res)')
        // res.statusCode = 201
        if (res.statusCode == 200) {
          // console.log('getUserInfo:' + JSON.stringify(res))
           const phone = phonenumber
           // 联系方式
           let contact = ''
           // 姓名
           let name = ''
           // 身份证号
           let idCard = ''
           // 性别
           let sex = 0
           // 昵称
           let nickName = '微信用户' 

           if (res.data.result.loginUserInfo.contact != '' && res.data.result.loginUserInfo.contact != null  && res.data.result.loginUserInfo.contact !== undefined) {
            contact = res.data.result.loginUserInfo.contact
           }
           if (res.data.result.loginUserInfo.name != '' && res.data.result.loginUserInfo.name != null  && res.data.result.loginUserInfo.name !== undefined) {
            name = res.data.result.loginUserInfo.name
           }
           if (res.data.result.loginUserInfo.idCard != '' && res.data.result.loginUserInfo.idCard != null  && res.data.result.loginUserInfo.idCard !== undefined) {
            idCard = res.data.result.loginUserInfo.idCard
           }

           if (res.data.result.loginUserInfo.sex != '' && res.data.result.loginUserInfo.sex != null  && res.data.result.loginUserInfo.sex !== undefined) {
            sex = res.data.result.loginUserInfo.sex
           }
           if (res.data.result.loginUserInfo.nickName != '' && res.data.result.loginUserInfo.nickName != null  && res.data.result.loginUserInfo.nickName !== undefined) {
            nickName = res.data.result.loginUserInfo.nickName
           }
            const userInfo = {
              open_id : open_id,
              phone: phonenumber,
              isLogin: res.data.result.isLogin,
              sceneId: res.data.result.loginUserInfo.sceneId,
              avatarUrl: res.data.result.loginUserInfo.avatarUrl,
              name: name,
              nickName: nickName,
              sex:sex,
              contact:contact,
              idCard: idCard,
              userId: res.data.result.loginUserInfo.userId,
              score: res.data.result.loginUserInfo.score,
            }

            // 保存本地
            
            try {
              wx.setStorageSync('jzxj_phone', phone);
              console.log('phone stored successfully');
            } catch (e) {
              console.error('Failed to store phone:', e);
            }
            // 同步存储用户信息
            try {
              wx.setStorageSync('jzxj_userInfo', userInfo);
              console.log('User Info stored successfully');
            } catch (e) {
              console.error('Failed to store User Info:', e);
            }
            //存到全局变量中  
            app.globalData.userInfo = userInfo
            app.globalData.phone = phone
            // 发送更新页面事件，通知其它页面更新
            console.log('eventBus.emit')
            // eventBus.emit('refresh', {})
            eventBus.emit('refreshVideoList', {});
            eventBus.emit('refreshMyPage', {});

            utils.showTip("登录成功")
            // 关闭登录界面
            setTimeout(function () {
              wx.navigateBack({
                delta: 1,
              })
            }, 1000)

        }
        else {
          utils.showTip("获取用户信息失败,请重新登入！")
          // console.log('error:' + JSON.stringify(res))
          // wx.navigateTo({
          //   url: '/pages/error/index?errorMessage=' + encodeURIComponent('openID:' + open_id + 'res:' + JSON.stringify(res))
          // });
        }
        // console.log('getUserInfo:' + JSON.stringify(res))
        
      },
      fail: function () {
        utils.showTip("登录失败,请重新登入！")
      },
    })
  },


})
