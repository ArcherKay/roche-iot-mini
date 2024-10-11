import * as CryptoJS from 'crypto-js';
class utils{

    constructor(app) {
      this.app = app
      this.navigating = false
    };
    wxRequest(options) {
    const that = this
    let needToken = true 
    if (options.needToken !== undefined) {
      needToken = options.needToken
    }  
    // 不需要带token请求的，需要needToken=false
    if (needToken) {
      if (that.app.globalData.phone == null || that.app.globalData.phone == '' || that.app.globalData.phone == 0) {
        console.log("No token found, stop requesting");
        // 通知调用者请求失败，因为没有 token
        if (options.fail) options.fail(new Error('No token found. User is not logged in.'));
        return;  // 终止执行
      }
    }
    // 暂时先用phone作为token，之后需要改成jwt
    // 为了兼容之前的接口，在post数据里需要加入openid
    // 当前版本token不会过期
    wx.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        ...options.header,
        'Authorization': 'Bearer ' + that.app.globalData.phone
      },
      dataType: options.dataType || "json",
      responseType: options.responseType || 'text',
      timeout: options.timeout || 0,
      success: function(res) {
        if (res.statusCode === 401) {
          // Token 过期或验证失败
          console.log("Token expired or invalid, redirecting to login page.");
          if (that.navigating === true) {
            return
          }
          that.navigating = true
          // 防止多次调用进入同一个页面
          let pages = getCurrentPages(); // 获取当前的页面栈
          let currentPage = pages[pages.length - 1]; // 当前页面
          let pageUrl = '/pages/login/login';
          let cp_pageUrl = 'pages/login/login';
          if (currentPage.route === cp_pageUrl) {
            that.navigating = false
            return
          }
          wx.navigateTo({
            url: pageUrl,
            success: function() {
              // 当页面成功打开后执行
              that.navigating = false
            }
          })
          if (options.fail) options.fail(new Error('Token expired or invalid'));
        } else {
          if (options.success) options.success(res);
        }
      },
      fail: function(err) {
        if (options.fail) options.fail(err);
      },
      complete: function(err) {
        if (options.complete) options.complete(err);
      }
    });
  };
  // 登入页
  navigateToLogin() {
    const that = this
    if (that.app.globalData.phone == null || that.app.globalData.phone == '' || that.app.globalData.phone == 0) {
      let pageUrl = '/pages/login/login';
      if (that.navigating === true) {
        return
      }
      that.navigating = true
      wx.navigateTo({
        url: pageUrl,
        success: function() {
          // 当页面成功打开后执行
          that.navigating = false
        }
      })
    }
  };
  isLogin() {
    const that = this
    if (that.app.globalData.phone == null || that.app.globalData.phone == '' || that.app.globalData.phone == 0) {
      return false
    }
    return true
  };
  decryptPhoneNumber(sessionKey, iv, encryptedData) {
    // base64 decode
    const key = CryptoJS.enc.Base64.parse(sessionKey);
    const ivData = CryptoJS.enc.Base64.parse(iv);
    const encryptedDataBytes = CryptoJS.enc.Base64.parse(encryptedData);

    // Decrypt data
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedDataBytes },
      key,
      { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedText);
  };
  showTip(msg) {
    wx.showToast({
      title: msg, 
      icon: 'none', 
      duration:1000, 
      success: function () {
        
      }
    })
  };
  // 百度转腾讯或高德
  BaiduMapTransTxMap(lng, lat) {
    let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
    let x = lng - 0.0065;
    let y = lat - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    let lngs = z * Math.cos(theta);
    let lats = z * Math.sin(theta);
    return {
        longitude: lngs,
        latitude: lats
    }
  };
  // 腾讯或高德转百度
  TxMapTransBaiduMap(lng, lat) {
    let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
    let x = lng;
    let y = lat;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let lngs = z * Math.cos(theta) + 0.0065;
    let lats = z * Math.sin(theta) + 0.006;
    return {
        longitude: lngs,
        latitude: lats
    }
  };
  convertCoordinates(data){
    const that = this
    data.map(item => {
      var coordinates = item.setUpGPS.split(" "); 
      let _lng=coordinates[0]||0;
      let _lat=coordinates[1]||0;
      if(item.aeDmanufacturer=='科曼'){
       let btt= that.BaiduMapTransTxMap(_lng,_lat);
       _lng= btt.longitude;
       _lat=btt.latitude;
      }
      item.longitude=_lng;
      item.latitude=_lat;
    })
  };
  computedAllRange (data, locate_latitude, locate_longitude) {
    
    const that = this
    data.map(item => {      
      item.Range = that.computedRange(  item.latitude,   item.longitude, locate_latitude, locate_longitude)
    })
    data.sort(
      function exchange (value1, value2) {
        return value1.Range - value2.Range// 替换为value2-value1可实现从大到小排序
      })
  };
  computedRange (lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0
    var radLat2 = lat2 * Math.PI / 180.0
    var a = radLat1 - radLat2
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
    s = s * 6378.137
    s = Math.round(s * 10000) / 10000
    return s
  };
  initMarkers(data){
    const that = this
    let counter = 1;
    data.map(item => {
      
      item.iconPath="/static/icon/aed.png"
      item.width = 30
      item.height = 42
      item.aedid = item.id
      item.id = counter

      // marker call out
      // item.callout = {
      //   content: `${item.setUpPosition} `,
      //   fontSize: 14,
      //   borderRadius: 10,
      //   padding: 10,
      //   display: 'ALWAYS',
      //   textAlign: 'left',
      //   bgColor: '#ffffff',
      //   borderColor: '#000000',
      //   borderWidth: 1
      // }


      counter ++
    })
  };
  initFirstAidMarkers(data){
    const that = this
    
    data.map(item => {  
      item.iconPath="/static/icon/aha.png"
      item.width = 30
      item.height = 42
      
      

      // marker call out
      // item.callout = {
      //   content: `${item.setUpPosition} `,
      //   fontSize: 14,
      //   borderRadius: 10,
      //   padding: 10,
      //   display: 'ALWAYS',
      //   textAlign: 'left',
      //   bgColor: '#ffffff',
      //   borderColor: '#000000',
      //   borderWidth: 1
      // }


    
    })
  };

}
export default utils;

