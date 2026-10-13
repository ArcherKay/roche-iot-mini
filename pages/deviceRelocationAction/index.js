Page({  
  data: {  
    isViewMode: false, // 是否为查看详情模式  
    relocationId: null, // 移机记录ID  
    equipmentId: '', // 设备ID  
    applyTime: '', // 申请时间  
    applicantId: '', // 申请人员  
    operatorId: '', // 操作人员  
    originalLocation: '', // 原位置  
    targetLocation: '', // 目标位置  
    relocationReason: '', // 移机原因  
    beforePhotos: [], // 移机前照片  
    relocationStatus: '处理中', // 移机状态  
    completeTime: '', // 完成时间  
    afterPhotos: [], // 移机后照片  
  },  

  onLoad(options) {  
    // 获取页面模式：view, add, edit  
    const mode = options.mode || 'edit';  
    const relocationId = options.id || null;  

    this.setData({  
      isViewMode: mode === 'view',  
      relocationId: relocationId,  
    });  

    if (mode === 'view' || mode === 'edit') {  
      // 模拟加载数据  
      this.setData({  
        equipmentId: 'E001',  
        applyTime: '2025-03-01 09:00',  
        applicantId: '张三',  
        operatorId: '李四',  
        originalLocation: '仓库A区',  
        targetLocation: '生产线B区',  
        relocationReason: '设备需要迁移至生产线以满足生产需求。',  
        beforePhotos: ['/path/to/photo1.jpg', '/path/to/photo2.jpg'],  
        relocationStatus: '处理中',  
        completeTime: '',  
        afterPhotos: [],  
      });  
    }  
  },  

  // 输入设备ID  
  onEquipmentIdInput(e) {  
    this.setData({ equipmentId: e.detail.value });  
  },  

  // 输入申请人员  
  onApplicantIdInput(e) {  
    this.setData({ applicantId: e.detail.value });  
  },  

  // 输入原位置  
  onOriginalLocationInput(e) {  
    this.setData({ originalLocation: e.detail.value });  
  },  

  // 输入目标位置  
  onTargetLocationInput(e) {  
    this.setData({ targetLocation: e.detail.value });  
  },  

  // 输入移机原因  
  onRelocationReasonInput(e) {  
    this.setData({ relocationReason: e.detail.value });  
  },  

  // 改变移机状态  
  onRelocationStatusChange(e) {  
    const status = e.detail.value;  
    this.setData({  
      relocationStatus: status,  
      completeTime: status === '已完成' ? this.data.completeTime : '', // 清空完成时间  
    });  
  },  

  // 输入完成时间  
  onCompleteTimeInput(e) {  
    this.setData({ completeTime: e.detail.value });  
  },  

  // 输入操作人员  
  onOperatorIdInput(e) {  
    this.setData({ operatorId: e.detail.value });  
  },  

  // 添加移机前照片  
  onAddBeforePhoto() {  
    wx.chooseImage({  
      count: 6 - this.data.beforePhotos.length,  
      success: (res) => {  
        this.setData({ beforePhotos: [...this.data.beforePhotos, ...res.tempFilePaths] });  
      },  
    });  
  },  

  // 删除移机前照片  
  onDeleteBeforePhoto(e) {  
    const index = e.currentTarget.dataset.index;  
    const photos = [...this.data.beforePhotos];  
    photos.splice(index, 1);  
    this.setData({ beforePhotos: photos });  
  },  

  // 添加移机后照片  
  onAddAfterPhoto() {  
    wx.chooseImage({  
      count: 6 - this.data.afterPhotos.length,  
      success: (res) => {  
        this.setData({ afterPhotos: [...this.data.afterPhotos, ...res.tempFilePaths] });  
      },  
    });  
  },  

  // 删除移机后照片  
  onDeleteAfterPhoto(e) {  
    const index = e.currentTarget.dataset.index;  
    const photos = [...this.data.afterPhotos];  
    photos.splice(index, 1);  
    this.setData({ afterPhotos: photos });  
  },  

  // 提交表单  
  onSubmit() {  
    if (!this.data.equipmentId || !this.data.applicantId || !this.data.originalLocation || !this.data.targetLocation || !this.data.relocationReason) {  
      wx.showToast({  
        title: '请填写完整信息',  
        icon: 'none',  
      });  
      return;  
    }  

    if (this.data.relocationStatus === '已完成' && (!this.data.completeTime || !this.data.operatorId || this.data.afterPhotos.length === 0)) {  
      wx.showToast({  
        title: '请填写完成时间、操作人员并上传移机后照片',  
        icon: 'none',  
      });  
      return;  
    }  

    wx.showToast({  
      title: this.data.relocationId ? '修改成功' : '新增成功',  
      icon: 'success',  
    });  

    // 模拟提交逻辑  
    setTimeout(() => {  
      wx.navigateBack();  
    }, 1000);  
  },  
});  