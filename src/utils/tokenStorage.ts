import type { TokenDto } from '@/http/response';
import type { UserState } from "@/store/user";

/** 本地存储键名常量 */
const TOKEN_KEY = 'user_token';
const USER_KEY = "user_info";

/**
 * Token 存储工具类
 * 提供 token 和用户信息的本地存储管理
 */
export const TokenStorage = {
  /**
   * 保存 token 到 localStorage
   * @param tokenInfo - token 信息对象
   */
  setToken(tokenInfo: TokenDto): void {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenInfo));
    } catch (error) {
      console.error('保存 token 失败:', error);
      throw new Error('保存 token 失败');
    }
  },

  /**
   * 从 localStorage 获取 token 信息
   * @returns token 信息对象或 null
   */
  getToken(): TokenDto | null {
    try {
      const tokenString = localStorage.getItem(TOKEN_KEY);
      return tokenString ? JSON.parse(tokenString) as TokenDto : null;
    } catch (error) {
      console.error('获取 token 失败:', error);
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
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('保存用户信息失败:', error);
      throw new Error('保存用户信息失败');
    }
  },

  /**
   * 从 localStorage 获取用户信息
   * @returns 用户信息对象或 null
   */
  getUserInfo(): UserState | null {
    try {
      const userString = localStorage.getItem(USER_KEY);
      return userString ? JSON.parse(userString) as UserState : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }
};
  