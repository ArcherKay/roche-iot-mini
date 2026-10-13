const API_BASE_URL = 'https://www.uvipwap.com/MesIOTApi';
const app = getApp();

Page({  
  data: {  
    activeTab: 0, // 当前选中的 Tab 索引  
    linePosition: 0, // 小短线的位置（以百分比表示）  
    deviceList: [],
    deviceTotal: 0,
    isDeviceListLoading: false,
    deviceListError: '',
    inspectionList: [],
    replacementList: [], 
  },  

  // 点击 Tab 切换  
  onTabClick(e) {  
    const index = parseInt(e.currentTarget.dataset.index, 10);  
    this.setData({  
      activeTab: index,  
      linePosition: index * 50, // 两个选项卡各占 50%  
    });  
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    if (index === 0) {
      this.loadDeviceList();
    }
  },  

  // 页面加载时设置默认小短线位置  
  onLoad() {  
    const accessToken = app.globalData.mesIotAccessToken || wx.getStorageSync('mesIotAccessToken');
    if (!accessToken) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    app.globalData.mesIotAccessToken = accessToken;
    this.setData({  
      linePosition: this.data.activeTab * 50,  
    });  
    this.loadDeviceList();
  },  
  loadDeviceList() {
    this.setData({ isDeviceListLoading: true, deviceListError: '' });
    wx.request({
      url: API_BASE_URL + '/api/device/read',
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + app.globalData.mesIotAccessToken,
        'Content-Type': 'application/json',
      },
      data: {
        PageIndex: 1,
        PageSize: 20,
        FilterRules: [],
        FilterGroups: [],
        SortConditions: [],
        Total: 22,
      },
      success: (response) => {
        if (response.statusCode === 401) {
          wx.reLaunch({ url: '/pages/login/login' });
          return;
        }
        let payload = response.data || {};
        if (typeof payload === 'string') {
          try {
            payload = JSON.parse(payload);
          } catch (error) {
            payload = {};
          }
        }
        const rows = payload.data && Array.isArray(payload.data.rows) ? payload.data.rows : [];
        if (response.statusCode === 200 && payload.code === 200 && payload.isSuccess !== false) {
          this.setData({ deviceList: rows, deviceTotal: payload.data.total || 0 });
        } else {
          this.setData({ deviceListError: payload.message || '设备列表获取失败' });
        }
      },
      fail: () => {
        this.setData({ deviceListError: '设备列表请求失败，请检查网络' });
      },
      complete: () => {
        this.setData({ isDeviceListLoading: false });
        wx.stopPullDownRefresh();
      },
    });
  },
  // 下拉刷新事件  
  onPullDownRefresh() {  
    this.loadDeviceList();
  },  
  // 点击新建巡防按钮  
  onCreateInspection() {  
    wx.showToast({  
      title: '新建巡防功能待开发',  
      icon: 'none',  
    });  
    // 这里可以跳转到新建巡防的页面，例如：  
    // wx.navigateTo({ url: '/pages/createInspection/index' });  
    wx.navigateTo({  
      url: '/pages/deviceInspectionAction/index?mode=add', // 跳转到详情页面，并传递 mode 参数  
    });  
  },  
  // 修改按钮点击事件  
  onEditItem(e) {  
    const id = e.currentTarget.dataset.id; // 获取当前项的 ID  
    // wx.showToast({  
    //   title: `修改功能待开发，ID: ${id}`,  
    //   icon: 'none',  
    // });  
    // 这里可以跳转到修改页面，例如：  
    // wx.navigateTo({ url: `/pages/editInspection/index?id=${id}` });  
    // 跳转到编辑模式  
    wx.navigateTo({  
      url: '/pages/deviceInspectionAction/index?mode=edit',  
    }); 
  },  

  // 删除按钮点击事件  
  onDeleteItem(e) {  
    const id = e.currentTarget.dataset.id; // 获取当前项的 ID  
    wx.showModal({  
      title: '确认删除',  
      content: '确定要删除这条巡检记录吗？',  
      success: (res) => {  
        if (res.confirm) {  
          // 删除逻辑  
          const newList = this.data.inspectionList.filter((item) => item.id !== id);  
          this.setData({  
            inspectionList: newList,  
          });  
          wx.showToast({  
            title: '删除成功',  
            icon: 'success',  
          });  
        }  
      },  
    });  
  },  
   // 查看详情  
   onViewDetails(e) {  
    // const id = e.currentTarget.dataset.id; // 获取当前项的 ID  
    // wx.navigateTo({  
    //   url: `/pages/inspectionDetails/index?id=${id}`, // 跳转到详情页  
    // }); 
    // wx.showToast({  
    //   title: '查看详情',  
    //   icon: 'success',  
    // }); 
    // 跳转到查看模式  
    wx.navigateTo({  
      url: '/pages/deviceInspectionAction/index?mode=view',  
    });  
  }, 
  // 跳转到新增更换滤芯页面  
  onAddReplacement() {  
    wx.navigateTo({  
      url: "/pages/consumableReplacementAction/index?mode=add",  
    });  
  },  

  // 跳转到修改更换滤芯页面  
  onEditReplacement(e) {  
    const id = e.currentTarget.dataset.id;  
    wx.navigateTo({  
      url: `/pages/consumableReplacementAction/index?mode=edit&id=${id}`,  
    });  
  },  

  // 删除更换滤芯记录  
  onDeleteReplacement(e) {  
    const id = e.currentTarget.dataset.id;  
    wx.showModal({  
      title: "确认删除",  
      content: "确定要删除这条耗材更换记录吗？",  
      success: (res) => {  
        if (res.confirm) {  
          const newList = this.data.replacementList.filter((item) => item.id !== id);  
          this.setData({  
            replacementList: newList,  
          });  
          wx.showToast({  
            title: "删除成功",  
            icon: "success",  
          });  
        }  
      },  
    });  
  }, 

});  