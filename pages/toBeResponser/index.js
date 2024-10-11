const app = getApp();
const utils = app.utils
Page({
  data: {
    // 其他数据属性保持不变
    name: '',
    contactNumber: '',
    ahaTypeOptions: ['AHA急救员', '其他类型'],
    ahaTypeIndex: 0,
    certificateCategoryOptions: ['AHA急救员证书', '其他证书类型'],
    certificateCategoryIndex: 0,
    isMedicalStaffOptions: ['否', '是'],
    isMedicalStaffIndex: 0,
    latitude: 0,
    longitude: 0,
    // 地址相关数据
    selectedProvince: '',
    selectedCity: '',
    selectedCounty: '',
    detailAddress: '',
    // 证书附件上传相关数据
    maxCertificateImages: 6,
    certificateImages: [],
    // 身份证附件上传相关数据
    // maxIdCardImages: 6,
    // idCardImages: [],
  },

  onLoad: function () {
    const that = this;
    
  },

  handleInputChange: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value,
    });
  },

  handlePickerChange: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value,
    });
  },

  // 处理地区选择变化
  onAreaChange: function (e) {
    const value = e.detail.value;
    this.setData({
      selectedProvince: value[0],
      selectedCity: value[1],
      selectedCounty: value[2],
    });
  },

  // 上传图片到服务器
  uploadToImageServer: function (localPath,  successCallback, errorCallback) {
    const that = this;
	  const localUrl = localPath
	  console.log('uploadToImageServer local url:' + localUrl)
    
    wx.uploadFile({
      url: app.globalData.uploadFile_url, // 上传文件的接口地址
      filePath: localUrl, // 上传文件的临时路径
      name: 'files', // 文件对应的 key，即表单字段名
      header: {
        'accept': 'text/plain',
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + app.globalData.imageServerToken
      },
      formData: {
        'providerKey': 'miniprogram-avatar',
        'providerName': 'miniprogram-avatar',
        'BusinessId': '',
        'remark': ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 上传成功，执行成功回调
          typeof successCallback === 'function' && successCallback(res);
        } else {
          // 上传失败，执行失败回调
          typeof errorCallback === 'function' && errorCallback(res);
        }
      },
      fail: (err) => {
        // 请求失败，执行失败回调
        typeof errorCallback === 'function' && errorCallback(err);
      }
    });
  },

  

  // 上传证书附件图片
  chooseCertificateImages: function () {
    const that = this;
    const remaining = 1;//that.data.maxCertificateImages - that.data.certificateImages.length;
    wx.chooseImage({
      count: remaining,
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        console.log('图片路径：'+ JSON.stringify(tempFilePaths))
        that.uploadToImageServer(tempFilePaths[0],(res) => {
          // console.log('上传成功:', res);
          const resp =  JSON.parse(res.data) 
          console.log('上传成功,res.data=', JSON.stringify(resp));
          if (resp.result !== undefined && resp.result != null && resp.result != '') {
            const image_url = app.globalData.imageServerUrl + resp.result[0].id
            console.log('图片url：' + image_url)
            const newImages = [{
                url: image_url,
              }];
            
            that.setData({
              certificateImages: that.data.certificateImages.concat(newImages),
            }, ()=> {
              console.log('certificateImages：'+ JSON.stringify(that.data.certificateImages))
            });

          }
          
        },
        (err) => {
          console.log('上传失败:', err);
        })
        

      },
    });
  },

  // 删除已上传的证书附件图片
  removeCertificateImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.certificateImages;
    images.splice(index, 1);
    this.setData({
      certificateImages: images,
    });
  },

  // 上传身份证附件图片
  /*
  chooseIdCardImages: function () {
    const that = this;
    const remaining = 1;//that.data.maxIdCardImages - that.data.idCardImages.length;
    wx.chooseImage({
      count: remaining,
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        console.log('IdCardImages图片路径：'+ JSON.stringify(tempFilePaths))
        that.uploadToImageServer(tempFilePaths[0],(res) => {
          // console.log('上传成功:', res);
          const resp =  JSON.parse(res.data) 
          console.log('上传成功,res.data=', JSON.stringify(resp));
          if (resp.result !== undefined && resp.result != null && resp.result != '') {
            const image_url = app.globalData.imageServerUrl + resp.result[0].id
            console.log('图片url：' + image_url)
            const newImages = [{
                url: image_url,
              }];
            that.setData({
              idCardImages: that.data.idCardImages.concat(newImages),
            }, ()=> {
              console.log('idCardImages：'+ JSON.stringify(that.data.idCardImages))
            });
          }
        },
        (err) => {
          console.log('上传失败:', err);
        })
      },
    });
  },

  // 删除已上传的身份证附件图片
  removeIdCardImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.idCardImages;
    images.splice(index, 1);
    this.setData({
      idCardImages: images,
    });
  },
  */
  handleSubmit: function () {
    const that = this
    const {
      name,
      contactNumber,
      ahaTypeOptions,
      ahaTypeIndex,
      certificateCategoryOptions,
      certificateCategoryIndex,
      isMedicalStaffOptions,
      isMedicalStaffIndex,
      latitude,
      longitude,
      selectedProvince,
      selectedCity,
      selectedCounty,
      detailAddress,
      certificateImages,
      // idCardImages,
    } = this.data;

    if (
      !name ||
      !contactNumber ||
      certificateImages.length === 0 ||
      // idCardImages.length === 0 ||
      !selectedProvince ||
      !selectedCity ||
      !selectedCounty ||
      !detailAddress
    ) {
      wx.showToast({
        title: '请填写所有必填信息并上传附件',
        icon: 'none',
      });
      return;
    }

    // 拼接完整的地址
    const address =
      selectedProvince + selectedCity + selectedCounty + detailAddress;

    // 图片上传到服务器，获取图片URL列表
    // 这里假设已经完成上传，并获得图片的服务器URL列表
    const certificateImageUrls = certificateImages.map((item) => item.url);
    // const idCardImageUrls = idCardImages.map((item) => item.url);

    const certificateImageUrlsJoined = certificateImageUrls.join(';');
    // const idCardImageUrlsJoined = idCardImageUrls.join(';');

    // 准备提交的数据
    const dataToSubmit = {
      name: name,
      contactNumber: contactNumber,
      address: address,
      latitude: latitude,
      longitude: longitude,
      ahaType: ahaTypeOptions[ahaTypeIndex],
      certificateCategory: certificateCategoryOptions[certificateCategoryIndex],
      isMedicalStaff: isMedicalStaffOptions[isMedicalStaffIndex],
      certificateAttachment: certificateImageUrlsJoined, // 证书附件图片URL列表
      idCardAttachment: idCardImageUrlsJoined, // 身份证附件图片URL列表
    };

    console.log('数据：'+JSON.stringify(dataToSubmit))
    // 获取经纬度数据
    that.getCoordinatesForAddress(dataToSubmit);
  },
  getCoordinatesForAddress(dataToSubmit) {
    const address = dataToSubmit.address;
    const apiKey = app.globalData.map_key;
    const that = this
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(address)}&key=${apiKey}`,
      method: 'GET',
      success: (res) => {
        console.log('getCoordinatesForAddress:' + JSON.stringify(res.data))
        if (res.data.status === 0) {
          const { lat, lng } = res.data.result.location;
          dataToSubmit.latitude = lat;
          dataToSubmit.longitude = lng;
          // 补充用户信息
          dataToSubmit.userId = app.globalData.userInfo.userId;
          dataToSubmit.openId = app.globalData.userInfo.open_id;
          //提交服务器
          that.submitResponserData(dataToSubmit)

        } else {
          utils.showTip("请求失败，请重新尝试！")
          console.log('未找到对应的经纬度');
        }
      },
      fail: (error) => {
        utils.showTip("请求失败，请重新尝试！")
        // console.error('API请求失败', error);
      }
    });
  },
  submitResponserData(dataToSubmit) {
    console.log('submitResponserData:' + JSON.stringify(dataToSubmit))
    const that = this
    wx.request({ 
      url:
        app.globalData.emergencyResponderRegister_url, 
      header: {
        "Content-Type": "application/json-patch+json",
        'Authorization': 'Bearer ' + app.globalData.authUserToken
      },
      method: "POST",
      data: dataToSubmit,
      success: function (res) {
        console.log('submitResponserData success:' + JSON.stringify(res))
        if (res.statusCode == 200) {
          // 提示更新成功，返回
          wx.showToast({
            title: '提交成功',
            duration:1000,
          });
          setTimeout(function () {
            wx.navigateBack({
              delta: 1,
            })
          }, 1000);
        } else {
          wx.showToast({
            title: '提交失败，请稍后重试',
            icon: 'none',
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: '提交失败，请稍后重试',
          icon: 'none',
        });
        console.log("提交信息失败！")
      }
    })
  }


});
