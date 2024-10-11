const app = getApp()
const utils = app.utils
Page({
  data: {
    name: '',
    phone: '',
    email: '',
    company: '',
    buyAmount: '',
    remark: ''
  },

  handleInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  handleSubmit: function() {
    const { name, phone, email, company, buyAmount, remark } = this.data;

    if (!name || !phone || !email || !company || !buyAmount || !remark) {
      wx.showToast({
        title: '请填写所有信息',
        icon: 'none'
      });
      return;
    }
    this.submitUserNeeds()
    
  },
  submitUserNeeds: function() {
    const that = this
    wx.request({ 
      url:
        app.globalData.CreateBuySignUp_url,
      header: {
        "Content-Type": "application/json-patch+json",
        'Authorization': 'Bearer ' + app.globalData.authUserToken
      },
      method: "POST",
      data: {
        name: that.data.name,
        phone: that.data.phone,
        email: that.data.email,
        company: that.data.company,
        buyAmount:that.data.buyAmount,
        remark: that.data.remark
      },
      success: function (res) {
        console.log('submitUserNeeds success:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          // 提示更新成功，返回
          wx.showToast({
            title: '提交成功',
            duration:1000,
          });
          setTimeout(function () {
            wx.navigateBack({
              delta: 1,
            })
          }, 1000);
                
        } else {
          console.log("submitUserNeeds fail")
        }
      },
      fail: function () {
        console.log("保存用户信息失败！")
      }
    })
  },
});
