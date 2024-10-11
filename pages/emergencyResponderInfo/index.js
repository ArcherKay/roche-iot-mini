Page({
  data: {
    registrationInfo: null, // 存储注册信息
    auditStatusMap: {
      1: '待审核',
      2: '已通过',
      3: '未通过'
    }
  },
 
  onLoad: function (options) {
    const that = this;

    if (options.data) {
      const data = JSON.parse(decodeURIComponent(options.data));
      that.setData({
        registrationInfo: data
      });
    }

    // 使用您提供的示例数据
    // const data = {
    //   userId: 175,
    //   openId: "oT2r-56yWdjvXdszopEmkaptFXKg",
    //   ahaType: "AHA急救员",
    //   isMedicalStaff: "否",
    //   name: "张三",
    //   certificateCategory: "AHA急救员证书",
    //   contactNumber: "189****011",
    //   address: "某市某区某街道",
    //   currentUnit: null,
    //   latitude: 24.4933109,
    //   longitude: 118.1953105,
    //   online: false,
    //   lastModificationTime: "2022-04-02T09:31:11.0114613",
    //   lastModifierUserId: 1,
    //   creationTime: "2021-11-16T17:12:00",
    //   creatorUserId: 1,
    //   certificateAttachment: ["https://www.uvipwap.com/UWPV2API/api/File/FileDownload?fileId=a7e6dde7-0d9b-4140-9837-08dce030b0ee","https://www.uvipwap.com/UWPV2API/api/File/FileDownload?fileId=a7e6dde7-0d9b-4140-9837-08dce030b0ee","https://www.uvipwap.com/UWPV2API/api/File/FileDownload?fileId=a7e6dde7-0d9b-4140-9837-08dce030b0ee","https://www.uvipwap.com/UWPV2API/api/File/FileDownload?fileId=a7e6dde7-0d9b-4140-9837-08dce030b0ee"],
    //   idCardAttachment: ["https://www.uvipwap.com/UWPV2API/api/File/FileDownload?fileId=a7e6dde7-0d9b-4140-9837-08dce030b0ee","https://www.uvipwap.com/UWPV2API/api/File/FileDownload?fileId=a7e6dde7-0d9b-4140-9837-08dce030b0ee"],
    //   auditStatus: 2, 
    //   auditFailureReason: "您的证书信息不完整，请提供完整的证书附件，并确保证书的有效期在一年以上。如有疑问，请联系管理员。"
    // };
   

    
  },

  // 保持之前的方法，如 handleResubmit 等
  handleResubmit: function () {
    wx.navigateTo({
      url: '/pages/toBeResponser/index' // 请替换为实际的提交页面路径
    });
  },

  // 新增方法，预览图片
  previewImage: function (e) {
    const currentUrl = e.currentTarget.dataset.url;
    const type = e.currentTarget.dataset.type;

    let imageUrls = [];
    if (type === 'certificate') {
      imageUrls = this.data.registrationInfo.certificateAttachment;
    } else if (type === 'idCard') {
      imageUrls = this.data.registrationInfo.idCardAttachment;
    }

    wx.previewImage({
      current: currentUrl, // 当前显示图片的链接
      urls: imageUrls // 需要预览的图片列表
    });
  }
});





