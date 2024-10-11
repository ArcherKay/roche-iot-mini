const app = getApp()
const utils = app.utils
Page({
  data: {
    Questionnaire: [], // 问题答案
    QuestionnaireData: [], // 题目
    count: 0, //题目数
    hasCount:0,//答题数
  },

  onLoad(options) {
   this.getQuestionList()
    
  },
  getQuestionList: function() {
    const that = this
    const t = Date.parse(new Date()) / 1000
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({ 
      url:
        app.globalData.getQuestionList_url + '?t=' + t,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "GET",
      success: function (res) {
        console.log('getQuestionList:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          
          if (res.data !== undefined && res.data != null && res.data != '')
          {
            res.data.result.map(item => {
              // if (item.type === 2) {
              //   item.answer = item.answer.split('')
              //   item.items.map(Item => {
              //     Item.class = Item.itemflag + 'MultipleChoice'
              //   })
              // }
              // if (item.type===0) item.type = 2
            })
            // this.QuestionnaireData = res.data.result
            let cnt = 0
            const qts = []
            res.data.result.map(item => {
              cnt += 1
              qts.push({ userId: app.globalData.userInfo.userId, questionId: item.id, yourAnswer: undefined })
            })

            that.setData({
              QuestionnaireData: res.data.result,
              Questionnaire : qts,
              count: cnt
            })

            console.log('QuestionnaireData:' + JSON.stringify(that.data.QuestionnaireData))
            console.log('Questionnaire:' + JSON.stringify(that.data.Questionnaire))
            console.log('count:' + JSON.stringify(that.data.count))
            
          }
          else {
            console.log("do not exist eventList")  
          } 
        } else {
          console.log("do not exist eventList")
        }
      },
      fail: function () {
        console.log("获取视频数据失败！")
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },
onAnswerChange: function(e) {
    const questionId = e.currentTarget.dataset.id;
    const answer = e.detail.value;
    // 更新 Questionnaire 数组中对应问题的答案
    const index = this.data.Questionnaire.findIndex(q => q.questionId === questionId);
    if (index !== -1) {
      this.setData({
        [`Questionnaire[${index}].yourAnswer`]: answer
      });
    }
  },
  onMultiAnswerChange: function(e) {
    const questionId = e.currentTarget.dataset.id;
    const answers = e.detail.value; // 这是一个数组，包含所有被选中的选项
    // 更新 Questionnaire 数组中对应问题的答案
    const index = this.data.Questionnaire.findIndex(q => q.questionId === questionId);
    if (index !== -1) {
      this.setData({
        [`Questionnaire[${index}].yourAnswer`]: answers
      });
    }
  },
  submitQuestionnaire: function() {
    const that = this
    // 处理问卷提交逻辑
    console.log('提交的答案：' + JSON.stringify(this.data.Questionnaire) );
    // 统计答题数
    let cnt = 0
    this.data.Questionnaire.map(item => {
      // 答题数
      if (item.yourAnswer !== undefined) {
         cnt++
      }
    })
    this.setData({
      hasCount:cnt
     })
    // 提示是否要的提交
    let confirmSubmitPageContent = null
    if (this.data.hasCount === this.data.count) {
      confirmSubmitPageContent = `${this.data.count}道题目已全部答完，确认提交本次答题问卷？`
    } else {
      confirmSubmitPageContent = `${this.data.count}道题目已答${this.data.hasCount}道，确认提交本次答题问卷？`
    }

    wx.showModal({
      title: '确认提交',
      content: confirmSubmitPageContent,
      success (res) {
        if (res.confirm) {
          // 将答题结果，提交到服务器
          that.handleSubmit()
        } else if (res.cancel) {
          
        }
      }
    })

    
  },
  handleSubmit: function() { 
    const params = {}
    let result = 0
    this.data.Questionnaire.map(item => {
      
      const target = this.data.QuestionnaireData.find(ITEM => ITEM.id === item.questionId)
      if (target) {
        if ((target.type === 0 || target.type === 1) && target.answer === item.yourAnswer) {
          result += 5
        }
        if ((target.type === 2)) {
          const boolean = item.yourAnswer.length === target.answer.length && item.yourAnswer.every(a => target.answer.some(b => a === b)) && target.answer.every(_b => item.yourAnswer.some(_a => _a === _b))
          if (boolean) {
            result += 5
          }
          item.yourAnswer = item.yourAnswer.join(',')
        }
      }
    })
    params.eqs = this.data.Questionnaire
    params.userId = app.globalData.userInfo.userId
    params.finishQuestionAmount = this.data.hasCount
    params.result = result
    this.saveExaminResult(params)
    
  },
  saveExaminResult: function(params) {
    const that = this
    
    wx.request({ 
      url:
        app.globalData.saveExaminResult_url,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "POST",
      data: params,
      success: function (res) {
        
        if (res.statusCode == 200) {
          
          if (res.data !== undefined && res.data != null && res.data != '')
          {
            console.log('saveExaminResult:' + JSON.stringify(res.data.result))    
            // 转到得分与解析页面
            // 将对象转换为查询字符串
            const queryString = `userId=${res.data.result.userId}&examinResultId=${res.data.result.examinResultId}`;

            // 使用 wx.redirectTo 进行页面跳转
            wx.redirectTo({
              url: `/pages/questionnaireAnswer/index?${queryString}`,
              success: function(res) {
                // 跳转成功
                console.log('跳转到问卷答案页面成功');
              },
              fail: function(error) {
                // 跳转失败
                console.error('跳转失败:', error);
              }
            });


            
          }
          else {
            console.log("saveExaminResult fail")  
          } 
        } else {
          console.log("saveExaminResult fail")
        }
      },
      fail: function () {
        console.log("saveExaminResult失败！")
      },
      complete: function () {
        
      }
    })
  },



});