const app = getApp()
const utils = app.utils
Page({
  data: {
    aidData:null,
    latitude: 24.492319,
    longitude: 118.137876,
    markers: [],
    showList: true,
    scrollIntoViewId: '' // 用于滚动到指定位置的ID
  },

  onLoad: function() {
    const that = this;
    

    wx.getSetting({
      success(res) {
        // console.log('getSetting success' + JSON.stringify(res.authSetting))
        if (res.authSetting['scope.userLocation'] === undefined || res.authSetting['scope.userLocation'] == '' || res.authSetting['scope.userLocation'] == false) {

          // 用户未授权地理位置权限，弹出授权窗口请求权限
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户同意授权，调用定位方法获取地址信息
              wx.showToast({
                title: '授权成功',
                icon: 'success',
                duration: 2000
              });
              that.getLocation();
            },
            fail() {
              // 用户拒绝授权，使用默认的初始经纬度24.492319,118.137876
              console.log('用户拒绝授权地理位置权限');
              
            }
          });
        } else {
          // 已经授权
          console.log('getLocation')
          that.getLocation();
        }
      }
    });  
  },

  getLocation: function() {
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        console.log('getLoaction:' + JSON.stringify(res))
        const latitude = res.latitude;
        const longitude = res.longitude;
        console.log('latitude=' + latitude + '  longitude' + longitude)
        that.setData({
          latitude,
          longitude
        });
        // 获取firstaid数据，经纬度暂时没有用到
        that.getFirstAidData(that.data.latitude, that.data.longitude);
        
      },
      fail(err) {
        console.log('getlocation fail:' + JSON.stringify(err))
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
        // 获取firstaid数据，经纬度暂时没有用到
        that.getFirstAidData(that.data.latitude, that.data.longitude);
      }
      
    });
  },

  getFirstAidData: function(central_latitude, central_longitude) {
    const that = this
    const t = Date.parse(new Date()) / 1000
    wx.request({ 
      url:
        app.globalData.firstaid_url + '?' + 'MaxResultCount=1000&t=' + t,
      header: {
        "Content-Type": "application/json",
        'custom-header': 'hello' 
      },
      method: "GET",
      success: function (res) {
        console.log('getFirstAidData:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          if (res.data !== undefined && res.data != null && res.data != '')
          {
            // 距离排序
            utils.computedAllRange(res.data.result.items, that.data.latitude, that.data.longitude)
            // 初始化maker
            utils.initFirstAidMarkers(res.data.result.items)
            that.setData({
              aidData: res.data.result.items,
              totalCount: res.data.result.totalCount,
              markers: res.data.result.items
            })
            
            console.log('aeddata length:' + res.data.result.totalCount)
            

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

  onMapTap(e) {
    
  },
  resetScroll() {
    this.setData({
      scrollIntoViewId: 'rescuer-0' // 滚动到第一个救援员位置
    });
  },
  preventClose(e) {
    // 阻止事件冒泡，防止点击信息框内容关闭信息框
    // e.stopPropagation();
  },

  onMarkerTap(e) {
    const markerId = e.markerId;
    const marker = this.data.markers.find(marker => marker.id === markerId);
    if (marker) {
      console.log('onMarkerTap:' + JSON.stringify(marker))
      const updatedMarkers = this.data.markers.map(marker => {
        if (marker.id === markerId) {
          return {
            ...marker,
            callout: {
              content: `${marker.name}\n${marker.address} `,
              fontSize: 14,
              borderRadius: 10,
              padding: 10,
              display: 'ALWAYS',
              textAlign: 'left',
            }
          };
        } else {
          return {
            ...marker,
            callout: {} // 清除其他 marker 的 callout
          };
        }
      });

    
      this.setData({
        markers: updatedMarkers,
        aidData: updatedMarkers
      });

       // 中心移到指定经纬度
       const mapContext = wx.createMapContext('map');
       mapContext.moveToLocation({
         latitude: marker.latitude,
         longitude: marker.longitude
       })
      
      
    }
    
  },


  toggleList: function() {
    this.setData({ showList: !this.data.showList });
  },
  test: function(e) {
    console.log('test:')
    wx.navigateTo({
      url: '/pages/test/index',
      success: function() {
        // 当页面成功打开后执行
        console.log('onCityPickerTap success')
      },
      fail: function(err) {
        console.log('err:' + JSON.stringify(err))

      }

    });
  },
  selectRescuer: function(e) {
    console.log('selectRescuer:' + JSON.stringify(e.currentTarget.dataset))
    const {aidid, latitude, longitude } = e.currentTarget.dataset;
    const markerId = aidid;
    const marker = this.data.markers.find(marker => marker.id === markerId);
    if (marker) {

      const updatedMarkers = this.data.markers.map(marker => {
        if (marker.id === markerId) {
          return {
            ...marker,
            callout: {
              content: `${marker.name}\n${marker.address} `,
              fontSize: 14,
              borderRadius: 10,
              padding: 10,
              display: 'ALWAYS',
              textAlign: 'left',
            }
          };
        } else {
          return {
            ...marker,
            callout: {} // 清除其他 marker 的 callout
          };
        }
      });

    
      this.setData({
        markers: updatedMarkers,
        aidData: updatedMarkers
      });

      //地图移动到目标地
      // 中心移到指定经纬度
    const mapContext = wx.createMapContext('map');
    mapContext.moveToLocation({
      latitude: latitude,
      longitude: longitude
    })
      
      
      
    }








  }
});
