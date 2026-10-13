Page({  
  data: {  
    isViewMode: false, // 是否为查看详情模式  
    deviceId: '',  
    runningStatus: '正常',  
    electrodeStatus: '正常',  
    electrodePackaging: '完好',  
    outerPackaging: '完好',  
    inspectionContent: '',  
    photos: [], // 存放照片的数组  
  },  

  onLoad(options) {  
    // 根据页面用途设置模式  
    const mode = options.mode || 'edit'; // mode: 'view', 'add', 'edit'  
    this.setData({ isViewMode: mode === 'view' });  

    if (mode === 'view' || mode === 'edit') {  
      // 模拟加载数据  
      this.setData({  
        deviceId: 'D1234567890123',  
        runningStatus: '正常',  
        electrodeStatus: '异常',  
        electrodePackaging: '破损',  
        outerPackaging: '完好',  
        inspectionContent: '设备运行正常，需更换电极片。',  
        photos: ['/path/to/photo1.jpg', '/path/to/photo2.jpg'],  
      });  
    }  
  },  

  onDeviceIdInput(e) {  
    this.setData({ deviceId: e.detail.value });  
  },  

  onRunningStatusChange(e) {  
    this.setData({ runningStatus: e.detail.value });  
  },  

  onElectrodeStatusChange(e) {  
    this.setData({ electrodeStatus: e.detail.value });  
  },  

  onElectrodePackagingChange(e) {  
    this.setData({ electrodePackaging: e.detail.value });  
  },  

  onOuterPackagingChange(e) {  
    this.setData({ outerPackaging: e.detail.value });  
  },  

  onInspectionContentInput(e) {  
    this.setData({ inspectionContent: e.detail.value });  
  },  

  onAddPhoto() {  
    wx.chooseImage({  
      count: 6 - this.data.photos.length,  
      success: (res) => {  
        this.setData({ photos: [...this.data.photos, ...res.tempFilePaths] });  
      },  
    });  
  },  

  onDeletePhoto(e) {  
    const index = e.currentTarget.dataset.index;  
    const photos = [...this.data.photos];  
    photos.splice(index, 1);  
    this.setData({ photos });  
  },  

  onSubmit() {  
    wx.showToast({  
      title: '提交成功',  
      icon: 'success',  
    });  
    // 提交逻辑...  
  },  
});  