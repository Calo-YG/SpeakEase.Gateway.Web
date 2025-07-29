import type { TokenDto } from '@/http/response';
import type { UserState } from "@/store/user";

/** 本地存储键名常量 */
const TOKEN_KEY = 'user_token';
const USER_KEY = "user_info";

/** Token 过期时间（毫秒）- 24小时 */
const TOKEN_EXPIRE_TIME = 24 * 60 * 60 * 1000;

/**
 * 存储数据结构
 */
interface StoredTokenData extends TokenDto {
  /** 存储时间戳 */
  timestamp: number;
  /** 过期时间戳 */
  expireTime: number;
}

interface StoredUserData extends UserState {
  /** 存储时间戳 */
  timestamp: number;
}

/**
 * Token 存储工具类
 * 提供 token 和用户信息的本地存储管理
 */
export const TokenStorage = {
  /**
   * 保存 token 到 localStorage
   * @param tokenInfo - token 信息对象 {token: string, refreshToken: string}
   * @param expireHours - 过期时间（小时），默认24小时
   */
  setToken(tokenInfo: TokenDto, expireHours: number = 24): void {
    try {
      // 验证 token 数据结构 - 只要求 token 必须存在
      if (!tokenInfo.token) {
        console.error('Token 数据验证失败:', tokenInfo)
        throw new Error('Token 数据格式不正确：缺少 token');
      }

      // 如果 refreshToken 不存在，使用 token 作为 refreshToken
      const refreshToken = tokenInfo.refreshToken || tokenInfo.token;

      const now = Date.now();
      const expireTime = now + (expireHours * 60 * 60 * 1000);
      
      const storedData: StoredTokenData = {
        token: tokenInfo.token,
        refreshToken: refreshToken,
        timestamp: now,
        expireTime
      };
      
      localStorage.setItem(TOKEN_KEY, JSON.stringify(storedData));
    } catch (error) {
      console.error('保存 token 失败:', error);
      throw new Error('保存 token 失败，请检查浏览器存储权限');
    }
  },

  /**
   * 从 localStorage 获取 token 信息
   * @returns token 信息对象 {token: string, refreshToken: string} 或 null
   */
  getToken(): TokenDto | null {
    try {
      const tokenString = localStorage.getItem(TOKEN_KEY);
      if (!tokenString) return null;
      
      const storedData: StoredTokenData = JSON.parse(tokenString);
      
      // 验证数据结构 - 只要求 token 必须存在
      if (!storedData.token || !storedData.expireTime) {
        console.warn('Token 数据格式不正确，清除损坏数据');
        this.clear();
        return null;
      }
      
      // 检查是否过期
      if (Date.now() > storedData.expireTime) {
        console.info('Token 已过期，自动清理');
        this.clear();
        return null;
      }
      
      // 返回不包含时间戳的 token 信息
      const tokenInfo: TokenDto = {
        token: storedData.token,
        refreshToken: storedData.refreshToken
      };
      return tokenInfo;
    } catch (error) {
      console.error('获取 token 失败:', error);
      this.clear(); // 清除可能损坏的数据
      return null;
    }
  },

  /**
   * 获取 access token（常用于请求头）
   * @returns access token 字符串或 null
   */
  getAccessToken(): string | null {
    const tokenInfo = this.getToken();
    return tokenInfo?.token || null;
  },

  /**
   * 获取 refresh token
   * @returns refresh token 字符串或 null
   */
  getRefreshToken(): string | null {
    const tokenInfo = this.getToken();
    return tokenInfo?.refreshToken || null;
  },

  /**
   * 检查 token 是否有效（存在且未过期）
   * @returns boolean
   */
  isTokenValid(): boolean {
    return this.getToken() !== null;
  },

  /**
   * 获取 token 剩余有效时间（毫秒）
   * @returns 剩余时间或 0
   */
  getTokenRemainingTime(): number {
    try {
      const tokenString = localStorage.getItem(TOKEN_KEY);
      if (!tokenString) return 0;
      
      const storedData: StoredTokenData = JSON.parse(tokenString);
      if (!storedData.expireTime) return 0;
      
      const remaining = storedData.expireTime - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * 清除所有存储的用户信息
   */
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('清除存储失败:', error);
    }
  },

  /**
   * 保存用户信息到 localStorage
   * @param user - 用户信息对象
   */
  setUserInfo(user: UserState): void {
    console.log('保存用户信息:', user)
    try {
      // 验证用户数据结构
      if (user.id === undefined || user.id === null) {
        throw new Error('用户ID格式不正确');
      }

      const storedData: StoredUserData = {
        id: user.id,
        userName: user.userName || '',
        email: user.email || '',
        account: user.account || '',
        avatar: user.avatar || '',
        isAuthenticated: user.isAuthenticated || false,
        timestamp: Date.now()
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(storedData));
    } catch (error) {
      console.error('保存用户信息失败:', error);
      throw new Error('保存用户信息失败，请检查浏览器存储权限');
    }
  },

  /**
   * 从 localStorage 获取用户信息
   * @returns 用户信息对象或 null
   */
  getUserInfo(): UserState | null {
    try {
      const userString = localStorage.getItem(USER_KEY);
      if (!userString) return null;
      
      const storedData: StoredUserData = JSON.parse(userString);
      
      // 返回不包含时间戳的用户信息
      const userInfo: UserState = {
        id: storedData.id,
        userName: storedData.userName || '',
        email: storedData.email || '',
        account: storedData.account || '',
        avatar: storedData.avatar || '',
        isAuthenticated: storedData.isAuthenticated || false
      };
      return userInfo;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      localStorage.removeItem(USER_KEY); // 清除可能损坏的数据
      return null;
    }
  },

  /**
   * 检查用户信息是否存在
   * @returns boolean
   */
  hasUserInfo(): boolean {
    return this.getUserInfo() !== null;
  },

  /**
   * 获取存储大小信息（用于调试）
   * @returns 存储信息对象
   */
  getStorageInfo(): { tokenSize: number; userSize: number; totalSize: number } {
    try {
      const tokenString = localStorage.getItem(TOKEN_KEY) || '';
      const userString = localStorage.getItem(USER_KEY) || '';
      
      return {
        tokenSize: new Blob([tokenString]).size,
        userSize: new Blob([userString]).size,
        totalSize: new Blob([tokenString + userString]).size
      };
    } catch (error) {
      return { tokenSize: 0, userSize: 0, totalSize: 0 };
    }
  },

  /**
   * 清理过期的存储数据
   */
  cleanup(): void {
    try {
      // 检查并清理过期的 token
      const tokenString = localStorage.getItem(TOKEN_KEY);
      if (tokenString) {
        const storedData: StoredTokenData = JSON.parse(tokenString);
        if (storedData.expireTime && Date.now() > storedData.expireTime) {
          localStorage.removeItem(TOKEN_KEY);
          console.info('已清理过期的 token');
        }
      }
      
      // 可以在这里添加其他清理逻辑
    } catch (error) {
      console.error('清理存储失败:', error);
    }
  }
};

// 页面加载时自动清理过期数据
if (typeof window !== 'undefined') {
  TokenStorage.cleanup();
}
  