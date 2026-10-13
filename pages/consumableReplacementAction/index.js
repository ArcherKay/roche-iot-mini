Page({  
  data: {  
    isViewMode: false, // 是否为查看详情模式  
    replacementId: null, // 更换滤芯记录ID  
    equipmentId: '', // 设备ID  
    applyTime: '', // 申请时间  
    applicantId: '', // 申请人员ID  
    operatorId: '', // 操作人员ID  
    consumableType: '', // 耗材类型  
    quantity: 1, // 耗材数量  
    replaceReason: '', // 更换原因  
    beforePhotos: [], // 更换前照片  
    processStatus: '处理中', // 处理状态  
    completeTime: '', // 完成时间  
    afterPhotos: [], // 更换后照片  
  },  

  onLoad(options) {  
    // 根据页面用途设置模式  
    const mode = options.mode || 'edit'; // mode: 'view', 'add', 'edit'  
    const replacementId = options.id || null;  

    this.setData({  
      isViewMode: mode === 'view',  
      replacementId: replacementId,  
    });  

    if (mode === 'view' || mode === 'edit') {  
      // 模拟加载数据  
      this.setData({  
        equipmentId: 'E001',  
        applyTime: '2025-03-01 09:00',  
        applicantId: '张三',  
        operatorId: '李四',  
        consumableType: '电极片',  
        quantity: 2,  
        replaceReason: '耗材到期，需要更换。',  
        beforePhotos: ['/path/to/photo1.jpg', '/path/to/photo2.jpg'],  
        processStatus: '处理中',  
        completeTime: '',  
        afterPhotos: [],  
      });  
    }  
  },  

  // 输入设备编号  
  onEquipmentIdInput(e) {  
    this.setData({ equipmentId: e.detail.value });  
  },  

  // 输入申请人员  
  onApplicantIdInput(e) {  
    this.setData({ applicantId: e.detail.value });  
  },  

  // 输入耗材类型  
  onConsumableTypeInput(e) {  
    this.setData({ consumableType: e.detail.value });  
  },  

  // 输入耗材数量  
  onQuantityInput(e) {  
    this.setData({ quantity: e.detail.value });  
  },  

  // 输入更换原因  
  onReplaceReasonInput(e) {  
    this.setData({ replaceReason: e.detail.value });  
  },  

  // 改变处理状态  
  onProcessStatusChange(e) {  
    const status = e.detail.value;  
    this.setData({  
      processStatus: status,  
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

  // 添加更换前照片  
  onAddBeforePhoto() {  
    wx.chooseImage({  
      count: 6 - this.data.beforePhotos.length,  
      success: (res) => {  
        this.setData({ beforePhotos: [...this.data.beforePhotos, ...res.tempFilePaths] });  
      },  
    });  
  },  

  // 删除更换前照片  
  onDeleteBeforePhoto(e) {  
    const index = e.currentTarget.dataset.index;  
    const photos = [...this.data.beforePhotos];  
    photos.splice(index, 1);  
    this.setData({ beforePhotos: photos });  
  },  

  // 添加更换后照片  
  onAddAfterPhoto() {  
    wx.chooseImage({  
      count: 6 - this.data.afterPhotos.length,  
      success: (res) => {  
        this.setData({ afterPhotos: [...this.data.afterPhotos, ...res.tempFilePaths] });  
      },  
    });  
  },  

  // 删除更换后照片  
  onDeleteAfterPhoto(e) {  
    const index = e.currentTarget.dataset.index;  
    const photos = [...this.data.afterPhotos];  
    photos.splice(index, 1);  
    this.setData({ afterPhotos: photos });  
  },  

  // 提交表单  
  onSubmit() {  
    if (!this.data.equipmentId || !this.data.applicantId || !this.data.consumableType || !this.data.quantity || !this.data.replaceReason) {  
      wx.showToast({  
        title: '请填写完整信息',  
        icon: 'none',  
      });  
      return;  
    }  

    if (this.data.processStatus === '已完成' && (!this.data.completeTime || !this.data.operatorId || this.data.afterPhotos.length === 0)) {  
      wx.showToast({  
        title: '请填写完成时间、操作人员并上传更换后照片',  
        icon: 'none',  
      });  
      return;  
    }  

    wx.showToast({  
      title: this.data.replacementId ? '修改成功' : '新增成功',  
      icon: 'success',  
    });  

    setTimeout(() => {  
      wx.navigateBack();  
    }, 1000);  
  },  
});  