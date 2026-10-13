const app = getApp()
const utils = app.utils

Page({
  data: {
    selectedValues: [],
    aedData:null,
    totalCount: 0,
    currentSelectItem:null,
    latitude: 24.492319, //默认经纬度
    longitude: 118.137876,
    markers: [],
    selectedProvince: '福建省', // 默认显示福建省
    selectedCity: '厦门市', // 默认显示厦门市
    selectedCounty: '湖里区', // 默认显示湖里区
    selectedCityRecently: '厦门市',
    selectedProvinceRecently: '福建省',
    selectedCountyRecently: '湖里区',
    deviceRidum: Infinity, //设备半径500米
    deviceRidumDisplay:'半径：' + '全部',
    deviceRidumRecently: Infinity,//最近的半径
    deviceRidumArr: [500,1000,1500,2000,'全部'],
    showInfo: false,
    useAedInfoMask: false, 
    aedImage: '/static/img/aed-image.jpg', // 示例图片路径
    sn: 'CS224030178',
    aeDmanufacturer: '久心',
    electricStatus: '正常',
    setUpPosition: '福建省厦门市思明区展鸿路',
    Range: 9.69,
    detailPosition: '展鸿路789号',
    selectedMarkerLatitude: null,
    selectedMarkerLongitude: null,
    districts: ['全部'],
    districtsDetail: [],
    districtIndex: 0,
    multiArray: [['请选择省'], ['请选择市']],
    multiIndex: [0, 0],
    selectedCitylatitude:24.492319,
    selectedCitylongitude: 118.137876,
    polygons: [],  // 存储区域边界多边形数据
    ridumIndex: 4,
    isFirstOpen: true
  },
  
  onLoad: function(e) {
  
    const that = this;
    // 设置顶部省市区列表数据
    
    that.setData({
      multiArray: [app.provinces, app.provinceCities[that.data.selectedProvince]], // 初始显示
    }, () => {
      that.resetMutiIndex(that.data.selectedProvince, that.data.selectedCity);
    });

    wx.getSetting({
      success(res) {
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
              // 用户拒绝授权，使用默认的初始经纬度24.492319,118.137876，默认的省市区
              console.log('用户拒绝授权地理位置权限');
            }
          });
        } else {
          // 已经授权
          that.getLocation();
        }
      }
    });
    // 测试数据
    // this.getDistrictsFromRemote('350200');
  },
  onShareAppMessage: function (e) {
    var that = this;
    return {
      title: '救在心间',
      path: '/pages/index/index'
    }
  },
  resetMutiIndex: function(province, city) {
    // 默认值
    const newMultiIndex = [0, 0];
    // 设置省份索引
    for(let i = 0; i < app.provinces.length; i ++) {
      if (app.provinces[i] === province) {
        newMultiIndex[0] = i;
        break;
      }
    }
    // 设置成市索引
    let cities = app.provinceCities[app.provinces[newMultiIndex[0]]]
    for(let i = 0; i < cities.length; i ++) {
      if (cities[i] === city) {
        newMultiIndex[1] = i;
        break;
      }
    }
    // 更新
    this.setData({
      multiIndex:newMultiIndex
    })
    console.log('MutiIndex:'+ JSON.stringify(newMultiIndex));

  },
  // 获取当前的位置信息
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
          longitude,
          selectedCitylatitude:latitude,
          selectedCitylongitude:longitude
        },()=>{
          // 获取城市
          that.getCityName(that.data.latitude, that.data.longitude)
        });
        
        
      },
      fail(err) {
        console.log('getlocation fail:' + JSON.stringify(err))
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
        // 默认城市：厦门市
        that.moveToLocationAndUpdateDevice();
      }
      
    });
  },
  
  getCityName: function(latitude, longitude) {
    const that = this
    const key = app.globalData.map_key;
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${key}`,
      success: res => {
        
        if (res.data.status === 0) {
          console.log('getcityname:' + JSON.stringify(res.data))
          const province = res.data.result.address_component.province;
          const city = res.data.result.address_component.city;
          const district = res.data.result.address_component.district;
          // 测试 改成 西安
          // const city = '西安市'
          // latitude = 34.3416
          // longitude = 108.9398
          
          console.log('getCityName:' + province + '>' + city + '>' + district);
          that.setData({
            selectedCity: city,
            selectedProvince: province,
            selectedCounty: district
          }, ()=>{
            // 更新顶部区域数据
            that.resetMutiIndex(that.data.selectedProvince, that.data.selectedCity);
            // 取区县数据,并设置区县选择框
            that.getDistrictsFromRemote(app.cityCodes[that.data.selectedCity], ()=>{
               that.setCountyIndex(that.data.selectedCounty)
               console.log('detail:' + JSON.stringify(that.data.districtsDetail))
            });
            
            that.moveToLocationAndUpdateDevice();
          });
          
          
          
        } else {
          wx.showToast({
            title: '获取城市名称失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '获取城市名称失败',
          icon: 'none'
        });
      }
    });
  },


  getDeviceData: function(city) {
    const that = this
    if (city === undefined || city == '' || city == null) {
      city = '厦门市'
    }
    // 判断是否需要从服务器更新数据,城市数据已下载到本地，不需要再次更新
    if (that.data.aedData && that.data.selectedCityRecently == city) {
      // that.data.aedData 即是最新数据
      // 过滤数据
      console.log('do not need to update data and filterDeviceData then move to location');
      that.filterDeviceData();
      // 中心移到指定经纬度
      const mapContext = wx.createMapContext('map');
      mapContext.moveToLocation({
      latitude: that.data.latitude,
      longitude: that.data.longitude
      })
      
      return;
    }
    // 更新selectedCityRecently
    that.setData({
      selectedCityRecently:that.data.selectedCity
    })
    // 需要更新数据，更新半径
    wx.request({ 
      url:
        app.globalData.device_url + city,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'custom-header': 'hello' 
      },
      method: "GET",
      success: function (res) {
        if (res.statusCode == 200) {
          if (res.data !== undefined && res.data != null && res.data != '')
          {
            
            
            console.log('aedItemFromServerLength:=====', res.data.result.items.length)
            // 经纬度转换res.data.result.items
            utils.convertCoordinates(res.data.result.items)
            that.setData({
              aedData: res.data.result.items
            }, ()=>{
              that.filterDeviceData();
              // 中心移到指定经纬度
              const mapContext = wx.createMapContext('map');
              mapContext.moveToLocation({
              latitude: that.data.latitude,
              longitude: that.data.longitude
              })
            });
          }
        } else {
          console.log("do not exist devices")
        }
      },
      fail: function () {
        console.log("获取设备数据失败！")
      },
    })
  },
  // 根据距离来过滤数据，源数据aedData stop here
  filterDeviceData() {
    // 距离排序
    const that = this;
    utils.computedAllRange(that.data.aedData, that.data.latitude, that.data.longitude)
    // console.log('computedAllRange:' + JSON.stringify(that.data.aedData))
    // 根据距离进行过滤，生成新的数据filteredData
    const filteredData = [];
    // 最近用户
    // let nearestAedItem = null;
    // let distance = Infinity;
    for (let i = 0; i < that.data.aedData.length; i++) {
      const item = that.data.aedData[i];
      if (item.Range*1000 < that.data.deviceRidum) {
        // 创建新对象，使用浅拷贝
        // if (distance >= item.Range*1000) {
        //   distance = item.Range*1000
        //   nearestAedItem = item // 最小的
        //   nearestAedItem.iconPath="/static/icon/aed.png"
        //   nearestAedItem.width = 30
        //   nearestAedItem.height = 42
        //   nearestAedItem.aedid = item.id
          
        // }
        filteredData.push({
          ...item, // 浅拷贝 item 的属性
        });
      }
    }
    console.log('new filteredData: ' + filteredData.length);
    // 记录当前的半径
    that.setData({
      deviceRidumRecently : that.data.deviceRidum
    })
    // 初始化maker
    utils.initMarkers(filteredData)
    that.setData({
      totalCount: filteredData.length,
      markers: filteredData
    },()=>{
      // 判断是否是第一次打开小程序
      if (that.data.isFirstOpen) {
        // that.data.isFirstOpen = false // fixme cp
        that.setData({
          isFirstOpen: false
        })
        that.onMarkerTapNearestItem()
      }
    })
  },
  onLocateMeButtonTap: function() {
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        that.setData({
          latitude: latitude,
          longitude: longitude
        });
        // 更新地图中心位置
        const mapContext = wx.createMapContext('map');
        mapContext.moveToLocation({
          latitude: latitude,
          longitude: longitude
        })

      },
      fail(err) {
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
        console.log(err);
      }
    });

  },
  onRidumChange: function(e) {
    const index = e.detail.value;
    const that = this;
    let distance = Infinity;
    let radiumDisp = '';
    if (index != 4) {
      distance = that.data.deviceRidumArr[index]
      radiumDisp = '半径：' + distance + '米';
    } else {
      distance = Infinity;
      radiumDisp = '半径：' + '全部';
    }
    that.setData({
      ridumIndex: index,
      deviceRidum: distance,
      deviceRidumDisplay: radiumDisp
    }, ()=> {
      // 根据半径重新过滤数据
      // 更新半径数据
      if (that.data.deviceRidum != that.data.deviceRidumRecently) {
        console.log('do not need to update data and filterDeviceData then move to location');
        that.filterDeviceData();
      } 
      else {
        console.log('same distance');
      }

    })
    // console.log('onRidumChange:' + JSON.stringify(region))
  },
  onCityChange: function(e) {
    const region = e.detail.value;
    const province =  region[0];
    const city = region[1];
    const county = region[2];
    // 相同省、市、区
    if (this.data.selectedProvince == province  && this.data.selectedCity == city && this.data.selectedCounty == county ) {
      return
    }
    // 不同省、市、区
    this.setData({
      selectedProvince: province,
      selectedCity: city,
      selectedCounty: county
    }, ()=>{
      this.getCoordinatesForAddress(); // 选择后获取经纬度,区县默认用全部
    })
   



  }
  ,
  getCoordinatesForAddress() {
    const { selectedProvince, selectedCity, selectedCounty } = this.data;
    // 去掉区县selectedCounty
    const address = `${selectedProvince}${selectedCity}`;
    const apiKey = app.globalData.map_key;
    const that = this
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(address)}&key=${apiKey}`,
      method: 'GET',
      success: (res) => {
        console.log('getCoordinatesForAddress:' + JSON.stringify(res.data))
        if (res.data.status === 0) {
          const { lat, lng } = res.data.result.location;
          this.setData({
            latitude: lat, 
            longitude: lng,
            selectedCitylatitude: lat,
            selectedCitylongitude: lng
          }, ()=>{
            // 得到经纬度后动作
            that.moveToLocationAndUpdateDevice();
          });

        } else {
          console.log('未找到对应的经纬度');
          // 需要重新刷新？
        }
      },
      fail: (error) => {
        console.error('API请求失败', error);
      }
    });
  },
  // 远程获取区县信息
  getDistrictsFromRemote: function(cityId,successCallback) {
    const _this = this;
    const apiKey = app.globalData.map_key;
    wx.request({
      url: 'https://apis.map.qq.com/ws/district/v1/getchildren' + '?id=' + cityId + '&key=' + apiKey,
      method: 'GET',
      success(res) {
        if (res.data.status === 0) {
          console.log('区县信息：' + JSON.stringify(res.data))
          const districts = res.data.result[0];
          const details = {}
          const newDistricts = ['全部'];
          for (let i = 0; i< districts.length; i++) {
            newDistricts.push(districts[i].fullname)
            details[districts[i].fullname] = districts[i]
          }

          _this.setData({
            districts: newDistricts,  // 提取区县名称
            districtsDetail: details // hash表访问区县数据
          }, () => {
            typeof successCallback === 'function' && successCallback();
          });
          console.log('区县信息====：' + JSON.stringify(_this.data.districts))
        }
      },
      fail() {
        wx.showToast({
          title: '获取区县信息失败',
          icon: 'none'
        });
      }
    });
  },
  setCountyIndex: function(county) {
    let countyIndex  = 0;
    const that = this;
    for (let i = 0; i < that.data.districts.length; i++) {
      if (that.data.districts[i] == county) {
        console.log("setCountyIndex:" + i)
        countyIndex = i;  
        break;
      }
    }
    console.log("district value:" + that.data.districts[countyIndex])
    that.setData({
      districtIndex: countyIndex,
      selectedCounty: that.data.districts[countyIndex]
    })
  },
  // 城市列表、区县列表 fixme cp
  bindMultiPickerChange: function (e) {
    const that = this;
    const provinceIndex = e.detail.value[0];
    const cityIndex = e.detail.value[1];
    const province = this.data.multiArray[0][provinceIndex];
    const city = this.data.multiArray[1][cityIndex];

     // 相同省、市
     if (this.data.selectedProvince == province  && this.data.selectedCity == city) {
      return
    }
    // 不同省、市
    this.setData({
      selectedProvince: province,
      selectedCity: city
    }, ()=>{
      // 更新区县数据
      // 取区县数据,并设置区县选择框
      that.getDistrictsFromRemote(app.cityCodes[that.data.selectedCity], ()=>{
        that.setCountyIndex('全部')
     });

      // 设置半径为全部
      let distance = Infinity;
      let radiumDisp = '';
      radiumDisp = '半径：' + '全部';

      that.setData({     
        ridumIndex: 4,
        deviceRidum: distance,
        deviceRidumDisplay: radiumDisp
      }, ()=>{
        
      });


      that.getCoordinatesForAddress(); // 选择后获取经纬度
      // 选择区域边界信息
      // that.getBoundary('350200');
    })
   
  },
  // getBoundary: function(areaid) {
  //   const that = this;
  //   const key = app.globalData.map_key;
  //   wx.request({
  //     url: 'https://apis.map.qq.com/ws/district/v1/search',  // 腾讯地图行政区查询
  //     method: 'GET',  // 确保使用 GET 请求
  //     data: {
  //       key: key,
  //       keyword: areaid,
  //       get_polygon: 2,  // 获取精确的边界数据
  //       max_offset: 1000,
  //       output: 'json'
  //     },
  //     success(res) {
  //       if (res.data.status === 0) {
  //         console.log('good:' + JSON.stringify(res.data));
  //         const boundary = res.data.result[0][0].polygon;  // 获取边界数据
          
  //         const polygons = that.formatBoundary(boundary);
  //         that.setData({ polygons });
  //       }
  //     }
  //   });
  // },

  // formatBoundary: function(polygon) {
  //   const polygons = polygon.map(area => {
      
  //     const points = [];
  //     for (let i = 0; i < area.length; i += 2) {
  //       points.push({ longitude: area[i], latitude: area[i + 1] });
  //     }
  //     return {
  //       points,
  //       strokeWidth: 2,
  //       strokeColor: '#FF0000',
  //       fillColor: '#FFFFFF00'   // 透明填充
  //     };
  //   });
  //   return polygons;
  // },

  bindMultiPickerColumnChange: function (e) {
    const column = e.detail.column;
    const value = e.detail.value;
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[column] = value;

    if (column === 0) {
      // 当选择省时，更新市的数据
      const selectedProvince = this.data.multiArray[0][value];
      data.multiArray[1] = app.provinceCities[selectedProvince];
      data.multiIndex[1] = 0; // 重置市为第一个
    }
    this.setData(data);
  },
  bindPickerChange: function(e) {
    const that = this;
    const selectedIndex = e.detail.value;

    if (selectedIndex == 0) {
        // 选择全部区县，
        let distance = Infinity;
        let radiumDisp = '';
        radiumDisp = '半径：' + '全部';


        this.setData({
          latitude: that.data.selectedCitylatitude, 
          longitude: that.data.selectedCitylongitude,
          districtIndex: selectedIndex,
          selectedCounty: that.data.districts[selectedIndex],

          ridumIndex: 4,
          deviceRidum: distance,
          deviceRidumDisplay: radiumDisp


        }, ()=>{
          // 得到经纬度后动作
          that.moveToLocationAndUpdateDevice();
        });
    }
    else{

      let distance = Infinity;
        let radiumDisp = '';
        radiumDisp = '半径：' + '全部';
      const county = that.data.districts[selectedIndex];
      const countyInfo = that.data.districtsDetail[county];
      const { lat, lng } = countyInfo.location;
      // 默认改为全部 20241108
      // console.log('ridumIndex is =======' + that.data.ridumIndex)
        // 默认1000米范围
        // distance = that.data.deviceRidumArr[1]
        // radiumDisp = '半径：' + distance + '米';
        this.setData({
          latitude: lat, 
          longitude: lng,
          districtIndex: selectedIndex,
          selectedCounty: that.data.districts[selectedIndex],
          // 默认设置成1000米
          ridumIndex: 1,
          deviceRidum: distance,
          deviceRidumDisplay: radiumDisp
        }, ()=>{
          // 得到经纬度后动作
          that.moveToLocationAndUpdateDevice();
        });

      /*
      // 如果此时半径为全部，则设置默认值为1000米，改成默认为全部
      if (that.data.ridumIndex == 4) {
        console.log('ridumIndex is =======' + that.data.ridumIndex)
        // 默认1000米范围
        distance = that.data.deviceRidumArr[1]
        radiumDisp = '半径：' + distance + '米';
        this.setData({
          latitude: lat, 
          longitude: lng,
          districtIndex: selectedIndex,
          selectedCounty: that.data.districts[selectedIndex],
          // 默认设置成1000米
          ridumIndex: 1,
          deviceRidum: distance,
          deviceRidumDisplay: radiumDisp
        }, ()=>{
          // 得到经纬度后动作
          that.moveToLocationAndUpdateDevice();
        });
      } else {
        this.setData({
          latitude: lat, 
          longitude: lng,
          districtIndex: selectedIndex,
          selectedCounty: that.data.districts[selectedIndex]
        }, ()=>{
          // 得到经纬度后动作
          that.moveToLocationAndUpdateDevice();
        });
      }*/

      
    }
  },
  // 移到目标并更新数据
  moveToLocationAndUpdateDevice() {
    // 中心移到指定经纬度
    const mapContext = wx.createMapContext('map');
    mapContext.moveToLocation({
      latitude: this.data.latitude,
      longitude: this.data.longitude
    })
    // 更新地图数据
    this.getDeviceData(this.data.selectedCity);
  },
  onMarkerTap(e) {
    const markerId = e.markerId;
    const marker = this.data.markers.find(marker => marker.id === markerId);
    if (marker) {

      const updatedMarkers = this.data.markers.map(marker => {
        if (marker.id === markerId) {
          return {
            ...marker,
            callout: {
              content: `${marker.setUpPosition} `,
              fontSize: 14,
              borderRadius: 10,
              padding: 10,
              display: 'ALWAYS',
              textAlign: 'left',
              // bgColor: '#ffffff',
              // borderColor: '#000000',
              // borderWidth: 1
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
        showInfo: true,
        selectedMarkerLatitude: marker.latitude,
        selectedMarkerLongitude: marker.longitude,
        sn: marker.sn,
        aeDmanufacturer: marker.aeDmanufacturer,
        electricStatus: marker.electricStatus,
        setUpPosition: marker.setUpPosition,
        Range: marker.Range,
        detailPosition: marker.detailPosition
      });
      
       // 中心移到指定经纬度
      const mapContext = wx.createMapContext('map');
      mapContext.moveToLocation({
        latitude: marker.latitude,
        longitude: marker.longitude
      })
      

      
      
      
    }
    
  },

  onMarkerTapNearestItem() {

    const firstElement = this.data.markers[0]; // 获取第一个元素
// const lastElement = filteredData[filteredData.length - 1]; 
    const markerId = firstElement.id;
    const marker = firstElement;
    if (marker) {

      const updatedMarkers = this.data.markers.map(marker => {
        if (marker.id === markerId) {
          return {
            ...marker,
            callout: {
              content: `${marker.setUpPosition} `,
              fontSize: 14,
              borderRadius: 10,
              padding: 10,
              display: 'ALWAYS',
              textAlign: 'left',
              // bgColor: '#ffffff',
              // borderColor: '#000000',
              // borderWidth: 1
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
        showInfo: true,
        selectedMarkerLatitude: marker.latitude,
        selectedMarkerLongitude: marker.longitude,
        sn: marker.sn,
        aeDmanufacturer: marker.aeDmanufacturer,
        electricStatus: marker.electricStatus,
        setUpPosition: marker.setUpPosition,
        Range: marker.Range,
        detailPosition: marker.detailPosition
      });
      
       // 中心移到指定经纬度
      const mapContext = wx.createMapContext('map');
      mapContext.moveToLocation({
        latitude: marker.latitude,
        longitude: marker.longitude
      })
      

      
      
      
    }
    
  },




  onMapTap() {
    // if (this.data.showInfo == true) {
    //   console.log('onMapTap')
    //   this.setData({
    //     showInfo: false
    //   });
    // }
  },

  navigateTo() {
    // 导航按钮点击事件
    wx.openLocation({
      latitude: parseFloat(this.data.selectedMarkerLatitude),
      longitude: parseFloat(this.data.selectedMarkerLongitude),
      scale: 18,
      name: 'AED 设备',
      address: this.data.setUpPosition
    });
  },

  showDetails() {
    // 详情按钮点击事件
    wx.navigateTo({
      url: '/pages/details/details' // 详情页路径
    });
    
  },
  closeInfo() {
    // 关闭按钮点击事件
    const updatedMarkers = this.data.markers.map(marker => {
      return {
        ...marker,
        callout: {} 
      };
    });

    this.setData({
      markers: updatedMarkers,
      showInfo: false
    });
  },
  onContainerTap(e) {
    // 点击框外关闭信息框
    if (this.data.showInfo) {
      this.setData({
        showInfo: false
      });
    }
  },

  preventClose(e) {
    // 阻止事件冒泡，防止点击信息框内容关闭信息框
    // e.stopPropagation();
  },
  // onAddButtonTap: function() {
  //   wx.showToast({
  //     title: '添加按钮点击',
  //     icon: 'none'
  //   });
  // },

  onScanButtonTap: function() {
    wx.navigateTo({
      url: '/pages/aidEventList/index',
      success: function() {
        // 当页面成功打开后执行
        console.log('onCityPickerTap success')
      },
      fail: function(err) {
        console.log('err:' + JSON.stringify(err))

      }

    });
  }



});
