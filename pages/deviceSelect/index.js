const app = getApp();

Page({
  data: {
    devices: [],
    currentDeviceId: ''
  },

  onLoad: function () {
    const devices = Array.isArray(app.globalData.deviceOptions) ? app.globalData.deviceOptions : [];
    this.setData({
      devices: devices,
      currentDeviceId: app.globalData.currentDeviceId || ''
    });
  },

  selectDevice: function (event) {
    const deviceId = event.currentTarget.dataset.deviceId;
    if (!deviceId) return;
    if (deviceId === this.data.currentDeviceId) {
      wx.navigateBack();
      return;
    }
    app.globalData.pendingSelectedDeviceId = deviceId;
    wx.navigateBack();
  }
});