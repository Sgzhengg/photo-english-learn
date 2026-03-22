/**
 * 设备ID生成和管理工具
 * 用于匿名用户的设备识别
 */

const DEVICE_ID_KEY = 'photo_english_device_id';

/**
 * 生成设备ID
 * 使用 fingerprintjs 的思想，基于多个浏览器特征生成唯一ID
 */
function generateDeviceId(): string {
  // 收集浏览器特征
  const features = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.platform,
    navigator.hardwareConcurrency || 0,
  ];

  // 生成简单的hash
  const featureString = features.join('|');
  let hash = 0;
  for (let i = 0; i < featureString.length; i++) {
    const char = featureString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // 添加随机数保证唯一性
  const randomPart = Math.random().toString(36).substring(2, 15);

  return `device_${Math.abs(hash)}_${randomPart}`;
}

/**
 * 获取或创建设备ID
 * 设备ID会存储在 localStorage 中，确保同一设备的持久性
 */
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * 重置设备ID（用于测试或清除数据）
 */
export function resetDeviceId(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
}

/**
 * 获取当前设备ID（如果不存在则返回null）
 */
export function getDeviceId(): string | null {
  return localStorage.getItem(DEVICE_ID_KEY);
}
