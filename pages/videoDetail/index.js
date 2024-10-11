import eventBus from '../../utils/eventBus';
const app = getApp()
const utils = app.utils
Page({
  data: {
    videoName: '检查反应',
    videoDuration: '2:10',
    learningProgress: 16.51,
    videoId: null,
    videoItem: null,
    isFinish: false,
  },
  
  onLoad: function(options) {
    this.videoContext = wx.createVideoContext('myVideo', this);  // 创建视频上下文
    this.setData({
      videoName:app.globalData.selectVideoItem.videoName,
      videoDuration:app.globalData.selectVideoItem.duration,
      learningProgress:app.globalData.selectVideoItem.finishPercent,
      videoId: options.id,
      videoItem: app.globalData.selectVideoItem
    });
    // title
    wx.setNavigationBarTitle({
      title: this.data.videoItem.videoName // 设置你想要的标题
    });
    // 加载video，列表已提供足够信息，无须再加载
    // this.loadVideo(this.data.videoId)
  },
  onUnload: function() {
    // 播放结束，参数回传
    // console.log('videoDetail onunload')
    this.saveProgress()
    
  },
  saveProgress() {
    if (this.data.videoItem.isFinish == false) {
      // console.log('videoDetail isFinished')
      const returnVideoItem = {
        videoId: this.data.videoItem.videoId,
        videoName : this.data.videoItem.videoName,
        describe : this.data.videoItem.describe,
        duration : this.data.videoItem.duration,
        finishPercent : this.data.learningProgress,
        isFinish : this.data.isFinish
     }
      eventBus.emit('saveLearnVideoProgress', returnVideoItem);
    }
  },

  onVideoPlay() {
    console.log('视频开始播放');
  },

  onVideoPause() {
    console.log('视频暂停');
    this.saveProgress()
  },
  durationToSeconds(duration) {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  },
  onReady() {
    console.log('onReady----------')
    // 在视频准备好后跳转到上次播放的位置
    if (this.data.videoItem.isFinish == false) {
      
      const durationint = this.durationToSeconds(this.data.videoItem.duration)
      const seekstart = parseFloat((durationint * this.data.videoItem.finishPercent/100.0).toFixed(2))
      
      if (this.data.videoItem.finishPercent > 0) {
        // console.log('onReady----------=' + durationint + 'seekstart：' + seekstart)
        this.videoContext.seek(seekstart);
      }
    }
    else {
      // 已播放完成，从开头位置起播
      this.videoContext.seek(0);
    }
    
  },
  onVideoEnded() {
    console.log('视频播放结束');
    this.setData({
      isFinish: true
    })

    this.saveProgress()

    // 视频播放结束时清除存储的进度
    // wx.removeStorageSync('lastProgress');
  },
  onTimeUpdate(event) {
    if (this.data.videoItem.isFinish == true) {
      return
    }

    const currentTime = event.detail.currentTime;
    const duration = event.detail.duration;
    const progress = (currentTime / duration) * 100;
    this.setData({
      learningProgress: progress.toFixed(2)
    });
    // console.log(`当前播放时间：${currentTime}s，总时长：${duration}s`);
  },

  
  saveVideoProgress: function(videoId) {
    const that = this
    
    wx.request({ 
      url:
        app.globalData.saveVideoProgress_url + '?userId=' + app.globalData.userInfo.userId + '&videoId=' + videoId,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "POST",
      data: {
        userId: app.globalData.userInfo.userId,
        videoId: videoId,
        finishPercent:that.data.learningProgress + '',
        videoName: that.data.videoName
      },
      success: function (res) {
        console.log('saveVideoProgress:' + JSON.stringify(res))
        if (res.statusCode == 200) {
         
        } else {
          console.log("saveVideoProgress fail")
        }

      },
      fail: function () {
        console.log("保存进度失败！")
      },
    })
  },
  loadVideo: function(videoId) {
    const that = this
    
    wx.request({ 
      url:
        app.globalData.learnVideoPage_url + '?userId=' + app.globalData.userInfo.userId + '&videoId=' + videoId,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "POST",
      data: {
        userId: app.globalData.userInfo.userId,
        videoId: videoId
      },
      success: function (res) {
        console.log('loadVideo:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          
        } else {
          console.log("do not exist video")
        }

      },
      fail: function () {
        console.log("获取video数据失败！")
      },
    })
  },

});