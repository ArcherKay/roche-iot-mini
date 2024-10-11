import eventBus from '../../utils/eventBus';
const app = getApp()
const utils = app.utils
Page({
  data: {
    cityNames: ["全部", "厦门", "福州", "莆田", "三明", "泉州", "漳州", "南平", "龙岩", "宁德", "北京", "上海", "广州", "深圳"],
    selectedCityIndex: 0,
    articles: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    filteredArticles: []
  },

  onLoad: function() {
    eventBus.on('refreshEventList', this.refreshEventList);
    
    this.refreshEventList()
    
      
    
    
  },
  onUnload: function() {
    console.log('onUnload')
    // 移除事件监听
    eventBus.off('refreshEventList', this.refreshEventList);
    
  },
  
  refreshEventList: function() {
    const that = this
    const t = Date.parse(new Date()) / 1000
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({ 
      url:
        app.globalData.GetFirstAidEventList_url + '?t=' + t,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "GET",
      success: function (res) {
        console.log('refreshEventList:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          
          if (res.data !== undefined && res.data != null && res.data != '')
          {
            // console.log('result:' + JSON.stringify(res.data.result))
            // 添加一条测试content
            const testitem = {
              id: "1",
              title: "急救知识普及",
              description: "这是一篇关于急救知识普及的文章，介绍了急救的基本步骤和注意事项。",
              author: "王五",
              publishDate: "2024-05-20T10:30:00Z",
              location: "北京, 中国",
              type: 0, // type为0，展示content中的html
              content: "<h1>急救知识普及</h1><p>在紧急情况下，正确的急救措施可以挽救生命。本文详细介绍了心肺复苏、创伤处理等急救方法，帮助读者掌握基本的急救技能。</p><h2>心肺复苏</h2><p>心肺复苏（CPR）是一种重要的急救措施，当心脏骤停时，及时进行CPR可以挽救生命。</p><h2>创伤处理</h2><p>创伤处理包括止血、包扎和固定伤肢，正确的处理方法可以减少伤害程度。</p>",
              url: null,
              category: "健康",
              image: "https://mmbiz.qpic.cn/mmbiz_jpg/icnvXSmJJE0unb6aeuILiaZHKfeNZyd0JNmGEibVQkjv3XcHDDPNq0OKh8zfv0UnlAgePIDG9iah9s3V5NL6TNcicvA/640?wx_fmt=jpeg&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1"
            }
            res.data.result.push(testitem)

            that.setData({
              articles: res.data.result,
              filteredArticles: res.data.result
            })
            
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
  onCityChange(e) {
    const selectedCityIndex = e.detail.value;
    const selectedCity = this.data.cityNames[selectedCityIndex];

    const filteredArticles = this.data.articles.filter(article => {
      return selectedCity === "全部" || article.location.includes(selectedCity);
    });

    this.setData({
      selectedCityIndex,
      filteredArticles
    });
  },

  goToArticle(e) {
    // console.log('goToArticle:')
    const article = e.currentTarget.dataset.article;
    console.log('goToArticle:' + JSON.stringify(article))
    wx.navigateTo({
      url: `/pages/aidEventDetail/index?title=${article.title}&type=${article.type}&content=${encodeURIComponent(article.content || '')}&url=${encodeURIComponent(article.url || '')}`
    });
  },
 

  onPullDownRefresh: function() {
    const that = this
    this.refreshEventList()
    
  },

  // onReachBottom: function() {
  //   this.loadVideos();
  // }
});
