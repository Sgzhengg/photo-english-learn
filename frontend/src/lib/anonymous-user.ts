// =============================================================================
// PhotoEnglish - Anonymous User Management
// =============================================================================

/**
 * 匿名用户管理
 *
 * 为未登录的用户提供唯一的身份标识，实现数据隔离。
 * 用户ID存储在 localStorage 中，跨会话持久化。
 */

const STORAGE_KEY = 'anonymous_user_id';
const STORAGE_KEY_BACKUP = 'anonymous_user_id_created_at';

/**
 * 生成新的匿名用户ID
 *
 * 格式: anon_{timestamp}_{random}
 * 示例: anon_1706208000000_a3f8k2
 */
function generateAnonymousUserId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `anon_${timestamp}_${random}`;
}

/**
 * 获取或创建匿名用户ID
 *
 * @returns 匿名用户ID
 *
 * 逻辑:
 * 1. 检查 localStorage 中是否已有ID
 * 2. 如果有，直接返回
 * 3. 如果没有，生成新的ID并保存
 * 4. 同时保存创建时间（用于调试和统计）
 */
export function getOrCreateAnonymousUserId(): string {
  try {
    // 检查是否已有ID
    let userId = localStorage.getItem(STORAGE_KEY);

    if (userId) {
      // 验证ID格式（基本验证）
      if (userId.startsWith('anon_') && userId.length > 10) {
        console.log('[AnonymousUser] Using existing ID:', userId);
        return userId;
      } else {
        // ID格式无效，重新生成
        console.warn('[AnonymousUser] Invalid ID format, regenerating...');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY_BACKUP);
      }
    }

    // 生成新ID
    userId = generateAnonymousUserId();

    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEY, userId);
    localStorage.setItem(STORAGE_KEY_BACKUP, new Date().toISOString());

    console.log('[AnonymousUser] Created new ID:', userId);
    return userId;
  } catch (error) {
    console.error('[AnonymousUser] Error accessing localStorage:', error);

    // localStorage 失败（如隐私模式），生成临时ID
    const tempId = generateAnonymousUserId();
    console.warn('[AnonymousUser] Using temporary ID (not persisted):', tempId);
    return tempId;
  }
}

/**
 * 获取匿名用户ID（只读，不创建）
 *
 * @returns 匿名用户ID，如果不存在则返回 null
 */
export function getAnonymousUserId(): string | null {
  try {
    const userId = localStorage.getItem(STORAGE_KEY);
    if (userId && userId.startsWith('anon_') && userId.length > 10) {
      return userId;
    }
    return null;
  } catch (error) {
    console.error('[AnonymousUser] Error reading localStorage:', error);
    return null;
  }
}

/**
 * 清除匿名用户ID
 *
 * ⚠️ 警告: 清除后，用户将被视为新用户，无法访问之前的数据
 *
 * 使用场景:
 * - 用户主动要求清除数据
 * - 测试环境重置
 */
export function clearAnonymousUserId(): void {
  try {
    const userId = localStorage.getItem(STORAGE_KEY);
    if (userId) {
      console.log('[AnonymousUser] Clearing ID:', userId);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_BACKUP);
    }
  } catch (error) {
    console.error('[AnonymousUser] Error clearing localStorage:', error);
  }
}

/**
 * 获取匿名用户信息（用于显示和调试）
 *
 * @returns 匿名用户信息对象
 */
export function getAnonymousUserInfo(): {
  userId: string | null;
  createdAt: string | null;
  isAnonymous: boolean;
} {
  try {
    const userId = localStorage.getItem(STORAGE_KEY);
    const createdAt = localStorage.getItem(STORAGE_KEY_BACKUP);

    return {
      userId,
      createdAt,
      isAnonymous: !!userId,
    };
  } catch (error) {
    console.error('[AnonymousUser] Error reading user info:', error);
    return {
      userId: null,
      createdAt: null,
      isAnonymous: false,
    };
  }
}

/**
 * 获取用于 API 请求的匿名用户头
 *
 * @returns 包含匿名用户ID的请求头对象
 */
export function getAnonymousUserHeaders(): Record<string, string> {
  const userId = getOrCreateAnonymousUserId();
  return {
    'X-Anonymous-User-ID': userId,
  };
}

/**
 * 导出匿名用户数据（用于迁移到正式账号）
 *
 * @returns 匿名用户数据，可用于后续迁移
 */
export function exportAnonymousUserData(): {
  userId: string;
  createdAt: string;
  exportDate: string;
} {
  const userId = getOrCreateAnonymousUserId();
  const createdAt = localStorage.getItem(STORAGE_KEY_BACKUP) || new Date().toISOString();

  return {
    userId,
    createdAt,
    exportDate: new Date().toISOString(),
  };
}
