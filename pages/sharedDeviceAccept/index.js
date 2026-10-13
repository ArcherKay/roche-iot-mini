const API_BASE_URL = 'https://www.uvipwap.com/MesIOTApi';
const app = getApp();

const parsePayload = function (data) {
  if (typeof data !== 'string') return data || {};
  try {
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const getUserId = function (userInfo) {
  if (!userInfo) return '';
  const userId = userInfo.userId !== undefined ? userInfo.userId :
    (userInfo.UserId !== undefined ? userInfo.UserId :
      (userInfo.id !== undefined ? userInfo.id : userInfo.Id));
  return userId === null || userId === undefined ? '' : String(userId);
};

Page({
  data: {
    deviceId: '',
    isSubmitting: false,
    isAccepted: false,
    error: ''
  },

  onLoad: function (options) {
    const deviceId = options.deviceId || app.globalData.pendingSharedDeviceId || wx.getStorageSync('pendingSharedDeviceId') || '';
    this.setData({ deviceId: deviceId });
    if (!deviceId) {
      this.setData({ error: '分享链接无效，缺少设备编号' });
      return;
    }

    const accessToken = app.globalData.mesIotAccessToken || wx.getStorageSync('mesIotAccessToken');
    if (!accessToken) {
      app.globalData.pendingSharedDeviceId = deviceId;
      wx.setStorageSync('pendingSharedDeviceId', deviceId);
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    app.globalData.mesIotAccessToken = accessToken;
    app.globalData.pendingSharedDeviceId = '';
    wx.removeStorageSync('pendingSharedDeviceId');
  },

  acceptShare: function () {
    if (this.data.isSubmitting || this.data.isAccepted) return;
    if (!this.data.deviceId) {
      this.setData({ error: '分享链接无效，缺少设备编号' });
      return;
    }

    const accessToken = app.globalData.mesIotAccessToken || wx.getStorageSync('mesIotAccessToken');
    const userInfo = app.globalData.mesIotUserInfo || wx.getStorageSync('mesIotUserInfo');
    const targetUserId = getUserId(userInfo);
    if (!accessToken) {
      app.globalData.pendingSharedDeviceId = this.data.deviceId;
      wx.setStorageSync('pendingSharedDeviceId', this.data.deviceId);
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    if (!targetUserId) {
      this.setData({ error: '未获取到当前用户 ID，请重新登录后重试' });
      return;
    }

    app.globalData.mesIotAccessToken = accessToken;
    this.setData({ isSubmitting: true, error: '' });
    wx.request({
      url: API_BASE_URL + '/api/device/acceptShare',
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + accessToken,
        accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
        'request-from': 'swagger'
      },
      data: {
        deviceId: this.data.deviceId,
        targetUserId: targetUserId
      },
      success: (response) => {
        if (response.statusCode === 401) {
          this.handleUnauthorized();
          return;
        }
        const payload = parsePayload(response.data);
        const responseCode = payload.code === undefined ? null : Number(payload.code);
        const accepted = response.statusCode >= 200 && response.statusCode < 300 &&
          payload.isSuccess !== false && payload.success !== false &&
          (responseCode === null || responseCode === 0 || responseCode === 200);
        if (!accepted) {
          this.setData({ error: payload.message || '接受分享失败，请稍后重试' });
          return;
        }
        this.setData({ isAccepted: true });
        wx.showToast({ title: '设备分享已接受', icon: 'success' });
      },
      fail: function () {
        this.setData({ error: '请求失败，请检查网络后重试' });
      }.bind(this),
      complete: () => {
        this.setData({ isSubmitting: false });
      }
    });
  },

  handleUnauthorized: function () {
    app.globalData.mesIotAccessToken = '';
    app.globalData.mesIotUserInfo = null;
    wx.removeStorageSync('mesIotAccessToken');
    wx.removeStorageSync('mesIotUserInfo');
    app.globalData.pendingSharedDeviceId = this.data.deviceId;
    wx.setStorageSync('pendingSharedDeviceId', this.data.deviceId);
    wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
    wx.reLaunch({ url: '/pages/login/login' });
  }
});