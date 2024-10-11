import eventBus from '../../utils/eventBus';
const app = getApp()
const utils = app.utils
Page({
  data: {
    videos: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
  },

  onLoad: function() {
    eventBus.on('refreshVideoList', this.refreshVideoList);
    eventBus.on('saveLearnVideoProgress', this.saveLearnVideoProgress);
    if (app.globalData.userInfo != null) {
      this.refreshVideoList()
    }
    else {
      this.getVideoData()
    }
    
  },
  onUnload: function() {
    console.log('onUnload')
    // 移除事件监听
    eventBus.off('refreshVideoList', this.refreshVideoList);
    eventBus.off('saveLearnVideoProgress', this.saveLearnVideoProgress);
  },
  saveLearnVideoProgress: function(videoItem) {
    // console.log('saveLearnVideoProgress:' + JSON.stringify(videoItem))
    const that = this
    wx.request({ 
      url:
        app.globalData.saveVideoProgress_url,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "POST",
      data: {
        userId: app.globalData.userInfo.userId,
        videoId: videoItem.videoId,
        finishPercent: videoItem.finishPercent,
        videoName: videoItem.videoName
      },
      success: function (res) {
        // console.log('saveVideoProgress success:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          // 刷新列表
          that.refreshVideoList()
          
        } else {
          console.log("saveVideoProgress fail")
        }
      },
      fail: function () {
        console.log("保存进度失败！")
      },
      complete: function () {
        console.log("保存进度完成")
        
      }
    })
  },
  refreshVideoList: function() {
    const that = this
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({ 
      url:
        app.globalData.videoList_url_login + '?userId=' + app.globalData.userInfo.userId,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "POST",
      success: function (res) {
        console.log('refreshVideoList:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          
          if (res.data !== undefined && res.data != null && res.data != '')
          {

            const processedVideoArray = res.data.result.videoRecordArray.map(video => {
              return {
                  ...video,
                  finishPercentRounded: Math.floor(video.finishPercent) + '%' // 新增字段，finishPercent向下取整
              };
            });
  
            that.setData({
              videos: processedVideoArray,
            })
          }
          else {
            console.log("do not exist videos")  
          } 
        } else {
          console.log("do not exist videos")
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
  getVideoData: function() {
    const that = this
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({ 
      url:
        app.globalData.videoList_url,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "POST",
      success: function (res) {
        console.log('getVideoData:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          
          if (res.data !== undefined && res.data != null && res.data != '')
          {
            const processedVideoArray = res.data.result.videoRecordArray.map(video => {
              return {
                  ...video,
                  finishPercentRounded: Math.floor(video.finishPercent) + '%' // 新增字段，finishPercent向下取整
              };
            });
  
            that.setData({
              videos: processedVideoArray,
            })
          }
          else {
            console.log("do not exist videos")  
          } 
        } else {
          console.log("do not exist videos")
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

  goToDetail: function(e) {
    const videoItem = e.currentTarget.dataset.item;
    app.globalData.selectVideoItem = videoItem
    const videoId = videoItem.videoId
    console.log('goToDetail:' + JSON.stringify(videoItem))
    // 判断是否已登录
    if (utils.isLogin() == false) {
      utils.navigateToLogin()  
      return
    }
    wx.navigateTo({
      url: `/pages/videoDetail/index?id=${videoId}`
    });
    

  },
  onCityPickerTap: function() {
    // 判断用户是否登录
    if (utils.isLogin() == false) {
      utils.navigateToLogin()  
      return
    }
    //转到问卷
    console.log('onCityPickerTap111')
    wx.navigateTo({
      url: '/pages/questionnaire/index',
      success: function() {
        // 当页面成功打开后执行
        console.log('onCityPickerTap success')
      },
      fail: function(err) {
        console.log('err:' + JSON.stringify(err))

      }

    });
    console.log('onCityPickerTap222')
},

  onPullDownRefresh: function() {
    const that = this
    if (app.globalData.userInfo != null) {
      this.refreshVideoList()
    }
    else {
      this.getVideoData()
    }
  },

  // onReachBottom: function() {
  //   this.loadVideos();
  // }
});
