const app = getApp()
const utils = app.utils
Page({
  data: {
    result: 0,
    finishQuestionAmount: 0,
    examinResultId: null,
    questions: []
  },
  onLoad: function(options) {
    
      const userId = options.userId;
      const examinResultId = options.examinResultId;
      
      console.log('userId:', userId);
      console.log('examinResultId:', examinResultId);
  
      this.setData({
        examinResultId: examinResultId
      })
      // 使用这些参数进行后续操作，比如获取问卷结果
      this.examinResultPage(examinResultId);
    
  },

  examinResultPage: function(examinResultId) {
    const that = this
    
    wx.request({ 
      url:
        app.globalData.examinResultPage_url + '?userId=' + app.globalData.userInfo.userId + '&examinId=' + examinResultId,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "POST",
      data: {
        userId: app.globalData.userInfo.userId,
        examinId: examinResultId
      },
      success: function (res) {
        console.log('examinResultPage:' + JSON.stringify(res))    
        if (res.statusCode == 200) {
          
          if (res.data !== undefined && res.data != null && res.data != '')
          {
            that.setData({
              result: res.data.result.result,
              // result: 70,
              finishQuestionAmount: res.data.result.finishQuestionAmount,
              questions: res.data.result.eqs
            });            
          }
          else {
            console.log("examinResultPage fail")  
          } 
        } else {
          console.log("examinResultPage fail")
        }
      },
      fail: function () {
        console.log("examinResultPage fail")
      },
      complete: function () {
        
      }
    })
  },


  showAnalysis: function(e) {
    const index = e.currentTarget.dataset.index;
    const question = this.data.questions[index];
    wx.showModal({
      title: '题目解析',
      content: question.answerRemark || '暂无解析',
      showCancel: false
    });
  }
});