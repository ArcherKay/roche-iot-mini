const API_BASE_URL = 'https://www.uvipwap.com/MesIOTApi';
let DEVICE_ID = '';
const WORK_STATUS_LABELS = {
  '00': '未制水',
  '01': '制水',
  '02': '水满',
  '03': '冲洗',
  '04': '缺水',
  '05': '溢水',
  '06': '检修'
};
const app = getApp();

Page({
  data: {
    deviceName: '萨奇净水器',
    deviceCode: '--',
    selectedDeviceId: '',
    deviceOptions: [],
    selectedDeviceIndex: 0,
    manufacturer: '--',
    firmwareVersion: '--',
    serialNumber: '--',
    imei: '--',
    signalStrength: '--',
    signalStatusText: '--',
    signalStatusClass: '',
    isOnline: false,
    isPowerOn: false,
    workStatusText: '--',
    workStatusClass: '',
    serviceDay: 0,
    totalLitres: '--',
    pureLitres: '--',
    cleanLitres: '--',
    lastUpdated: '--',
    waterQuality: {
      tds: '--',
      inlet: '--'
    },
    filters: [],
    isLoading: false,
    isSendingPower: false
  },

  onLoad: function () {
    const accessToken = app.globalData.mesIotAccessToken || wx.getStorageSync('mesIotAccessToken');
    if (!accessToken) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    app.globalData.mesIotAccessToken = accessToken;
    this.loadDevice();
  },

  onShow: function () {
    if (!app.globalData.mesIotAccessToken) return;
    const pendingDeviceId = app.globalData.pendingSelectedDeviceId;
    if (pendingDeviceId) {
      DEVICE_ID = pendingDeviceId;
      const selectedIndex = this.data.deviceOptions.findIndex(function (item) {
        return (item.deviceId || item.value) === pendingDeviceId;
      });
      this.setData({
        selectedDeviceId: pendingDeviceId,
        selectedDeviceIndex: selectedIndex >= 0 ? selectedIndex : 0
      });
      app.globalData.pendingSelectedDeviceId = '';
      this.fetchDevice(pendingDeviceId);
    }
    this.stopDeviceRefreshTimer();
    this.deviceRefreshTimer = setInterval(() => {
      if (!this.data.isLoading && this.data.selectedDeviceId) {
        this.fetchDevice(this.data.selectedDeviceId);
      }
    }, 60 * 1000);
  },

  onHide: function () {
    this.stopDeviceRefreshTimer();
  },

  onUnload: function () {
    this.stopDeviceRefreshTimer();
  },

  stopDeviceRefreshTimer: function () {
    if (this.deviceRefreshTimer) {
      clearInterval(this.deviceRefreshTimer);
      this.deviceRefreshTimer = null;
    }
  },

  loadDevice: function () {
    const that = this;
    that.setData({ isLoading: true });
    wx.request({
      url: API_BASE_URL + '/api/device/getdeviceids',
      method: 'GET',
      header: {
        Authorization: 'Bearer ' + app.globalData.mesIotAccessToken,
        accept: 'text/plain',
        'request-from': 'swagger'
      },
      success: function (response) {
        if (response.statusCode === 401) {
          that.handleUnauthorized();
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
        const devices = response.statusCode === 200 && payload.code === 200 && Array.isArray(payload.data)
          ? payload.data.filter(function (item) { return item && (item.deviceId || item.value); })
          : [];
        if (!devices.length) {
          DEVICE_ID = '';
          that.setData({
            deviceOptions: [],
            selectedDeviceIndex: 0,
            selectedDeviceId: '',
            deviceCode: '--',
            isLoading: false
          });
          wx.showToast({ title: '暂无可用设备', icon: 'none' });
          return;
        }
        const firstDeviceId = devices[0].deviceId || devices[0].value;
        DEVICE_ID = firstDeviceId;
        that.setData({
          deviceOptions: devices,
          selectedDeviceIndex: 0,
          selectedDeviceId: firstDeviceId
        });
        that.fetchDevice(firstDeviceId);
      },
      fail: function (error) {
        DEVICE_ID = '';
        that.setData({
          deviceOptions: [],
          selectedDeviceIndex: 0,
          selectedDeviceId: '',
          deviceCode: '--',
          isLoading: false
        });
        that.handleRequestError(error);
      }
    });
  },

  onDeviceChange: function (event) {
    const selectedIndex = Number(event.detail.value);
    const selectedDevice = this.data.deviceOptions[selectedIndex];
    if (!selectedDevice) return;
    const deviceId = selectedDevice.deviceId || selectedDevice.value;
    DEVICE_ID = deviceId;
    this.setData({ selectedDeviceIndex: selectedIndex, selectedDeviceId: deviceId });
    this.fetchDevice(deviceId);
  },

  openDeviceSelector: function () {
    app.globalData.deviceOptions = this.data.deviceOptions;
    app.globalData.currentDeviceId = this.data.selectedDeviceId;
    wx.navigateTo({ url: '/pages/deviceSelect/index' });
  },

  openFilterLife: function () {
    app.globalData.filterLifeDetail = {
      deviceId: this.data.selectedDeviceId,
      deviceName: this.data.deviceName,
      filters: this.data.filters
    };
    wx.navigateTo({ url: '/pages/filterLife/index' });
  },

  openSharedDeviceList: function () {
    if (this.data.isLoading) {
      wx.showToast({ title: '设备信息加载中，请稍后再试', icon: 'none' });
      return;
    }
    if (!this.data.selectedDeviceId) {
      wx.showToast({ title: '设备编号缺失，无法查询分享记录', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/sharedDeviceList/index?deviceId=' + encodeURIComponent(this.data.selectedDeviceId) +
        '&deviceName=' + encodeURIComponent(this.data.deviceName)
    });
  },

  onPowerSwitchChange: function (event) {
    const that = this;
    const previousPowerState = this.data.isPowerOn;
    const power = event.detail.value ? 1 : 0;
    this.setData({ isPowerOn: !!power, isSendingPower: true });
    wx.request({
      url: API_BASE_URL + '/api/device/sendCommand',
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + app.globalData.mesIotAccessToken,
        'Content-Type': 'application/json'
      },
      data: {
        g_device_id: this.data.selectedDeviceId,
        g_command: 'set_power',
        g_params: { power: power }
      },
      success: function (response) {
        if (response.statusCode === 401) {
          that.setData({ isPowerOn: previousPowerState });
          that.handleUnauthorized();
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
          that.setData({ isPowerOn: previousPowerState });
          wx.showToast({ title: payload.message || '设备控制失败', icon: 'none' });
          return;
        }
        wx.showToast({ title: power ? '开机指令已发送' : '关机指令已发送', icon: 'none' });
      },
      fail: function () {
        that.setData({ isPowerOn: previousPowerState });
        wx.showToast({ title: '设备控制请求失败，请检查网络', icon: 'none' });
      },
      complete: function () {
        that.setData({ isSendingPower: false });
      }
    });
  },

  fetchDevice: function (deviceId) {
    const that = this;
    that.setData({ isLoading: true });
    wx.request({
      url: API_BASE_URL + '/api/device/getdevice?deviceid=' + encodeURIComponent(deviceId),
      method: 'GET',
      header: { Authorization: 'Bearer ' + app.globalData.mesIotAccessToken },
      success: function (deviceResponse) {
        if (deviceResponse.statusCode === 401) {
          that.handleUnauthorized();
          return;
        }
        const devicePayload = deviceResponse.data || {};
        const result = devicePayload.data || {};
        const device = result.data;
        if (deviceResponse.statusCode !== 200 || devicePayload.code !== 200 || result.code !== 0 || !device) {
          that.handleRequestError({ message: devicePayload.message || '获取设备详情失败' });
          return;
        }
        that.bindDevice(device);
      },
      fail: function (error) {
        that.handleRequestError(error);
      },
      complete: function () {
        that.setData({ isLoading: false });
      }
    });
  },

  bindDevice: function (device) {    
    const normalizeStatus = function (source) {
      const normalized = {};
      Object.keys(source || {}).forEach(function (key) {
        normalized[key.charAt(0).toLowerCase() + key.slice(1)] = source[key];
      });
      return normalized;
    };
    let parsedStatus = {};
    if (typeof device.statusJson === 'string') {
      try {
        parsedStatus = normalizeStatus(JSON.parse(device.statusJson));
      } catch (error) {}
    }
    const status = Object.assign({}, parsedStatus, normalizeStatus(device), normalizeStatus(device.status));
    const lifeValue = function (value) {
      if (value === undefined || value === null || value === '') return '--';
      const hours = Number(value);
      return Number.isFinite(hours) ? Number((hours / 24).toFixed(2)) : '--';
    };
    const lifePercent = function (remain, total) {
      if (remain === undefined || remain === null || remain === '' || total === undefined || total === null || total === '') return 0;
      const remainHours = Number(remain);
      const totalHours = Number(total);
      return Number.isFinite(remainHours) && Number.isFinite(totalHours) && totalHours > 0
        ? Math.round(Math.max(0, Math.min(100, remainHours / totalHours * 100)))
        : 0;
    };
    const filters = [
      { name: 'Pac', shortName: 'Pac', total: lifeValue(status.pacTotalLife), remain: lifeValue(status.pacRemainLife), remainPercent: lifePercent(status.pacRemainLife, status.pacTotalLife), tone: 'teal' },
      { name: 'Ro', shortName: 'Ro', total: lifeValue(status.roTotalLife), remain: lifeValue(status.roRemainLife), remainPercent: lifePercent(status.roRemainLife, status.roTotalLife), tone: 'orange' },
      { name: 'C2', shortName: 'C2', total: lifeValue(status.c2TotalLife), remain: lifeValue(status.c2RemainLife), remainPercent: lifePercent(status.c2RemainLife, status.c2TotalLife), tone: 'teal' }
    ];
    const numberOrDash = function (value) {
      return typeof value === 'number' ? value : '--';
    };
    const rawSignalStrength = status.signalStrength;
    const parsedSignalStrength = rawSignalStrength === undefined || rawSignalStrength === null || rawSignalStrength === ''
      ? null
      : Number(rawSignalStrength);
    const hasSignalStrength = parsedSignalStrength !== null && !isNaN(parsedSignalStrength);
    const signalStatusText = !hasSignalStrength
      ? '--'
      : parsedSignalStrength === 0
        ? '断网'
        : parsedSignalStrength >= 30
          ? '良好'
          : '信号差';
    const signalStatusClass = !hasSignalStrength
      ? ''
      : parsedSignalStrength === 0
        ? 'signal-offline'
        : parsedSignalStrength >= 30
          ? 'signal-good'
          : 'signal-weak';
    const rawWorkStatus = status.workStatus;
    const workStatusCode = rawWorkStatus === undefined || rawWorkStatus === null
      ? ''
      : String(rawWorkStatus);
    const normalizedWorkStatusCode = workStatusCode.length === 1 ? '0' + workStatusCode : workStatusCode;
    const workStatusText = WORK_STATUS_LABELS[normalizedWorkStatusCode] ||
      (normalizedWorkStatusCode ? '未知状态（' + normalizedWorkStatusCode + '）' : '--');
    const workStatusClass = normalizedWorkStatusCode === '02' ? 'water-full' : '';
    const time = status.updatedTime || device.lastLoginAt;
    this.setData({
      deviceName: device.deviceModel ? '萨奇 ' + device.deviceModel + ' 净水器' : '',
      deviceCode: device.deviceId || this.data.selectedDeviceId || DEVICE_ID,
      manufacturer: device.manufacturer || '--',
      firmwareVersion: device.firmwareVer || '--',
      serialNumber: device.sn || '--',
      imei: device.imei || '--',
      signalStrength: numberOrDash(status.signalStrength),
      signalStatusText: signalStatusText,
      signalStatusClass: signalStatusClass,
      isOnline: status.online !== undefined ? status.online : !!device.online,
      isPowerOn: status.power === true || status.power === 1 || status.power === '1' || status.power === 'true',
      workStatusText: workStatusText,
      workStatusClass: workStatusClass,
      totalFilterVolume: this.formatVolume(status.totalFilterVolume),
      pureLitres: this.formatVolume(status.pureFilterVolume),
      cleanLitres: this.formatVolume(status.cleanFilterVolume),
      lastUpdated: this.formatTime(time),
      waterQuality: {
        tds: numberOrDash(status.waterTds),
        inlet: numberOrDash(status.rawTds)
      },
      filters: filters
    });
  },

  formatVolume: function (volume) {
    if (typeof volume !== 'number') return '--';
    return (volume / 1000).toFixed(1);
  },

  formatTime: function (value) {
    if (!value || value.indexOf('1900-01-01') === 0) return '--';
    return value.replace('T', ' ').replace(/\.\d+/, '').replace(/([+-]\d{2}:\d{2})$/, '');
  },

  handleRequestError: function (error) {
    this.setData({ isLoading: false });
    wx.showToast({ title: error && error.errMsg ? '请求失败，请检查网络' : (error.message || '获取设备数据失败'), icon: 'none' });
  },

  handleUnauthorized: function () {
    this.stopDeviceRefreshTimer();
    app.globalData.mesIotAccessToken = '';
    app.globalData.mesIotUserInfo = null;
    wx.removeStorageSync('mesIotAccessToken');
    wx.removeStorageSync('mesIotUserInfo');
    this.setData({ isLoading: false });
    wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
    wx.reLaunch({ url: '/pages/login/login' });
  },

});
