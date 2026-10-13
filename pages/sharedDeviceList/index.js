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

const getFirstValue = function (source, keys) {
  for (let index = 0; index < keys.length; index += 1) {
    const value = source[keys[index]];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
};

const formatShareTime = function (value) {
  if (value === undefined || value === null || value === '') return '--';
  return String(value).replace('T', ' ').replace(/\.\d+/, '').replace(/([+-]\d{2}:\d{2})$/, '');
};

Page({
  data: {
    deviceId: '',
    deviceName: '',
    shareRecords: [],
    total: 0,
    isLoading: false,
    updatingUserId: '',
    error: ''
  },

  onLoad: function (options) {
    let deviceName = options.deviceName || '净水设备';
    try {
      deviceName = decodeURIComponent(deviceName);
    } catch (error) {}
    this.setData({
      deviceId: options.deviceId || '',
      deviceName: deviceName
    });
    this.loadShareRecords(options.deviceId || '');
  },

  onPullDownRefresh: function () {
    this.loadShareRecords(this.data.deviceId);
  },

  onRetry: function () {
    this.loadShareRecords(this.data.deviceId);
  },

  onSetAdmin: function (event) {
    const targetUserId = event.currentTarget.dataset.userId;
    if (!targetUserId || this.data.updatingUserId) return;
    wx.showModal({
      title: '设置管理员',
      content: '确定将该用户设置为此设备的管理员吗？',
      success: (result) => {
        if (result.confirm) this.sendShareAction('/api/device/updaterole', targetUserId, 'Admin', '已设置为管理员');
      }
    });
  },

  onRemoveShare: function (event) {
    const targetUserId = event.currentTarget.dataset.userId;
    if (!targetUserId || this.data.updatingUserId) return;
    wx.showModal({
      title: '取消分享',
      content: '确定取消该用户的设备访问权限吗？',
      confirmColor: '#b64d4d',
      success: (result) => {
        if (result.confirm) this.sendShareAction('/api/device/removeshare', targetUserId, '', '已取消分享');
      }
    });
  },

  sendShareAction: function (endpoint, targetUserId, role, successMessage) {
    const accessToken = app.globalData.mesIotAccessToken || wx.getStorageSync('mesIotAccessToken');
    if (!accessToken) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    const requestData = {
      deviceId: this.data.deviceId,
      targetUserId: targetUserId
    };
    if (role) requestData.role = role;

    this.setData({ updatingUserId: String(targetUserId) });
    wx.request({
      url: API_BASE_URL + endpoint,
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + accessToken,
        accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
        'request-from': 'swagger'
      },
      data: requestData,
      success: (response) => {
        if (response.statusCode === 401) {
          this.handleUnauthorized();
          return;
        }
        const payload = parsePayload(response.data);
        const responseCode = payload.code === undefined ? null : Number(payload.code);
        const succeeded = response.statusCode >= 200 && response.statusCode < 300 &&
          payload.isSuccess !== false && payload.success !== false &&
          (responseCode === null || responseCode === 0 || responseCode === 200);
        if (!succeeded) {
          wx.showToast({ title: payload.message || '操作失败，请重试', icon: 'none' });
          return;
        }
        wx.showToast({ title: successMessage, icon: 'success' });
        this.loadShareRecords(this.data.deviceId);
      },
      fail: function () {
        wx.showToast({ title: '请求失败，请检查网络', icon: 'none' });
      },
      complete: () => {
        this.setData({ updatingUserId: '' });
      }
    });
  },

  onShareAppMessage: function () {
    return {
      title: '邀请你查看' + (this.data.deviceName || '净水设备'),
      path: '/pages/sharedDeviceAccept/index?deviceId=' + encodeURIComponent(this.data.deviceId)
    };
  },

  loadShareRecords: function (deviceId) {
    if (!deviceId) {
      this.setData({ error: '缺少设备编号，无法查询分享记录', isLoading: false });
      wx.stopPullDownRefresh();
      return;
    }

    const accessToken = app.globalData.mesIotAccessToken || wx.getStorageSync('mesIotAccessToken');
    if (!accessToken) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }

    app.globalData.mesIotAccessToken = accessToken;
    this.setData({ isLoading: true, error: '', shareRecords: [], total: 0 });
    wx.request({
      url: API_BASE_URL + '/api/device/readdevicesharelist?deviceid=' + encodeURIComponent(deviceId),
      method: 'POST',
      header: {
        Authorization: 'Bearer ' + accessToken,
        accept: 'text/plain',
        'request-from': 'swagger'
      },
      data: '',
      success: (response) => {
        if (response.statusCode === 401) {
          this.handleUnauthorized();
          return;
        }
        const payload = parsePayload(response.data);
        const shareData = payload.data || {};
        if (response.statusCode !== 200 || payload.code !== 200 || payload.isSuccess === false) {
          this.setData({ error: payload.message || '分享记录获取失败' });
          this.finishLoading();
          return;
        }
        const rows = Array.isArray(shareData.rows) ? shareData.rows : [];
        const shareRecords = rows.map(function (row, index) {
          const userId = getFirstValue(row, ['targetUserId', 'TargetUserId', 'userId', 'userID', 'UserId']);
          const role = getFirstValue(row, ['role', 'Role']);
          const normalizedRole = String(role).toLowerCase();
          return Object.assign({}, row, {
            recordKey: row.id || row.Id || userId || index,
            targetUserId: userId,
            displayName: getFirstValue(row, ['userName', 'UserName', 'name', 'Name', 'nickName', 'NickName', 'nickname', 'Nickname']) || '微信用户',
            shareTimeText: formatShareTime(getFirstValue(row, [
              'shareTime', 'ShareTime', 'sharedAt', 'SharedAt', 'createTime', 'CreateTime', 'createdTime', 'CreatedTime'
            ])),
            avatarText: (getFirstValue(row, ['userName', 'UserName', 'name', 'Name', 'nickName', 'NickName', 'nickname', 'Nickname']) || '微').charAt(0),
            roleName: normalizedRole === 'admin' || normalizedRole === 'administrator' ? '管理员' :
              (normalizedRole === 'member' ? '普通成员' : role),
            isAdmin: normalizedRole === 'admin' || normalizedRole === 'administrator'
          });
        });
        const reportedTotal = Number(shareData.total);
        this.setData({
          shareRecords: shareRecords,
          total: Number.isFinite(reportedTotal) ? reportedTotal : shareRecords.length
        });
        this.finishLoading();
      },
      fail: () => {
        this.setData({ error: '分享记录请求失败，请检查网络' });
        this.finishLoading();
      }
    });
  },

  handleUnauthorized: function () {
    app.globalData.mesIotAccessToken = '';
    app.globalData.mesIotUserInfo = null;
    wx.removeStorageSync('mesIotAccessToken');
    wx.removeStorageSync('mesIotUserInfo');
    this.finishLoading();
    wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
    wx.reLaunch({ url: '/pages/login/login' });
  },

  finishLoading: function () {
    this.setData({ isLoading: false });
    wx.stopPullDownRefresh();
  }
});