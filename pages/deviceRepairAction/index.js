Page({  
  data: {  
    isViewMode: false, // 是否为查看详情模式  
    isEditMode: false, // 是否为编辑模式  
    repairId: null, // 当前报修记录ID  
    equipmentId: '', // 设备ID  
    repairTime: '', // 报修时间  
    reporterId: '', // 报修人员  
    faultDescription: '', // 故障描述  
    photos: [], // 现场照片  
    repairStatus: '处理中', // 维修状态  
    operatorId: '', // 操作人员  
    repairResult: '', // 维修结果  
    completeTime: '', // 完成时间  
  },  

  onLoad(options) {  
    // 获取页面模式：view, add, edit  
    const mode = options.mode || 'edit';  
    const repairId = options.id || null;  

    this.setData({  
      isViewMode: mode === 'view',  
      isEditMode: mode === 'edit',  
      repairId: repairId,  
    });  

    if (mode === 'view' || mode === 'edit') {  
      // 模拟加载数据  
      this.setData({  
        equipmentId: 'E001',  
        repairTime: '2025-03-01 08:30',  
        reporterId: '张三',  
        faultDescription: '设备无法启动，电源指示灯不亮。',  
        photos: ['/path/to/photo1.jpg', '/path/to/photo2.jpg'],  
        repairStatus: '处理中',  
        operatorId: '',  
        repairResult: '',  
        completeTime: '',  
      });  
    }  
  },  

  // 输入设备ID  
  onEquipmentIdInput(e) {  
    this.setData({ equipmentId: e.detail.value });  
  },  

  // 输入报修人员  
  onReporterIdInput(e) {  
    this.setData({ reporterId: e.detail.value });  
  },  

  // 输入故障描述  
  onFaultDescriptionInput(e) {  
    this.setData({ faultDescription: e.detail.value });  
  },  

  // 改变维修状态  
  onRepairStatusChange(e) {  
    const status = e.detail.value;  
    this.setData({  
      repairStatus: status,  
      completeTime: status === '已完成' ? this.data.completeTime : '', // 清空完成时间  
    });  
  },  

  // 输入操作人员  
  onOperatorIdInput(e) {  
    this.setData({ operatorId: e.detail.value });  
  },  

  // 输入维修结果  
  onRepairResultInput(e) {  
    this.setData({ repairResult: e.detail.value });  
  },  

  // 输入完成时间  
  onCompleteTimeInput(e) {  
    this.setData({ completeTime: e.detail.value });  
  },  

  // 添加照片  
  onAddPhoto() {  
    wx.chooseImage({  
      count: 6 - this.data.photos.length,  
      success: (res) => {  
        this.setData({ photos: [...this.data.photos, ...res.tempFilePaths] });  
      },  
    });  
  },  

  // 删除照片  
  onDeletePhoto(e) {  
    const index = e.currentTarget.dataset.index;  
    const photos = [...this.data.photos];  
    photos.splice(index, 1);  
    this.setData({ photos });  
  },  

  // 提交表单  
  onSubmit() {  
    if (!this.data.equipmentId || !this.data.reporterId || !this.data.faultDescription) {  
      wx.showToast({  
        title: '请填写完整信息',  
        icon: 'none',  
      });  
      return;  
    }  

    if (this.data.repairStatus === '已完成' && (!this.data.repairResult || !this.data.completeTime)) {  
      wx.showToast({  
        title: '请填写维修结果和完成时间',  
        icon: 'none',  
      });  
      return;  
    }  

    wx.showToast({  
      title: this.data.isEditMode ? '修改成功' : '新增成功',  
      icon: 'success',  
    });  

    // 模拟提交逻辑  
    setTimeout(() => {  
      wx.navigateBack();  
    }, 1000);  
  },  

  // 删除报修  
  onDelete() {  
    wx.showModal({  
      title: '确认删除',  
      content: '确定要删除这条报修记录吗？',  
      success: (res) => {  
        if (res.confirm) {  
          wx.showToast({  
            title: '删除成功',  
            icon: 'success',  
          });  

          // 模拟删除逻辑  
          setTimeout(() => {  
            wx.navigateBack();  
          }, 1000);  
        }  
      },  
    });  
  },  
});  