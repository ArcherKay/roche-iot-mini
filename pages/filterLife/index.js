const app = getApp();
const API_BASE_URL = 'https://www.uvipwap.com/MesIOTApi';
const FILTER_RESET_CODES = { Pac: 1,  Ro: 3, C2: 4 };

Page({
  data: {
    deviceId: '',
    deviceName: '',
    filters: [],
    isResetting: false,
    resettingFilterIndex: -1
  },

  onLoad: function () {
    const detail = app.globalData.filterLifeDetail || {};
    const filters = (detail.filters || []).map(function (filter) {
      const total = Number(filter.total);
      const remain = Number(filter.remain);
      const usedPercent = Number.isFinite(total) && total > 0 && Number.isFinite(remain)
        ? Math.round(Math.max(0, Math.min(100, (total - remain) / total * 100)))
        : 0;
      return Object.assign({}, filter, {
        total: Number.isFinite(total) ? total : '--',
        remain: Number.isFinite(remain) ? remain : '--',
        usedPercent: usedPercent
      });
    });
    this.setData({
      deviceId: detail.deviceId || '',
      deviceName: detail.deviceName || '滤芯使用情况',
      filters: filters
    });
  },

  onResetFilter: function (event) {
    if (this.data.isResetting) return;

    const filterIndex = Number(event.currentTarget.dataset.index);
    const filter = this.data.filters[filterIndex];
    const filterCode = filter && FILTER_RESET_CODES[filter.shortName];
    if (!filter || !filterCode) {
      wx.showToast({ title: '无法识别该滤芯', icon: 'none' });
      return;
    }

    const accessToken = app.globalData.mesIotAccessToken || wx.getStorageSync('mesIotAccessToken');
    if (!accessToken) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }

    wx.showModal({
      title: '确认复位',
      content: '确定复位 ' + filter.name + ' 滤芯寿命吗？',
      success: (modalResult) => {
        if (modalResult.confirm) {
          this.sendFilterReset(filterIndex, filterCode, accessToken);
        }
      }
    });
  },

  sendFilterReset: function (filterIndex, filterCode, accessToken) {
    this.setData({ isResetting: true, resettingFilterIndex: filterIndex });
    wx.request({
      url: API_BASE_URL + '/api/device/sendCommand',
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      data: {
        g_device_id: this.data.deviceId,
        g_command: 'set_filter_reset',
        g_params: { filter: filterCode }
      },
      success: (response) => {
        if (response.statusCode === 401) {
          app.globalData.mesIotAccessToken = '';
          app.globalData.mesIotUserInfo = null;
          wx.removeStorageSync('mesIotAccessToken');
          wx.removeStorageSync('mesIotUserInfo');
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
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
        const responseCode = payload.code === undefined ? null : Number(payload.code);
        const commandAccepted = response.statusCode >= 200 && response.statusCode < 300 &&
          payload.isSuccess !== false && payload.success !== false &&
          (responseCode === null || responseCode === 0 || responseCode === 200);
        if (!commandAccepted) {
          wx.showToast({ title: payload.message || '滤芯复位失败', icon: 'none' });
          return;
        }
        wx.showToast({ title: '复位指令已发送，请等待设备更新', icon: 'none' });
      },
      fail: function () {
        wx.showToast({ title: '复位请求失败，请检查网络', icon: 'none' });
      },
      complete: () => {
        this.setData({ isResetting: false, resettingFilterIndex: -1 });
      }
    });
  }
});