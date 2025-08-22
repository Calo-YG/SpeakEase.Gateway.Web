import { TokenStorage } from './tokenStorage'
import { getUserInfo, logout } from '@/api/sysuser/user'
import { useUserStore } from '@/store/userStore'
import type { UserState } from '@/store/user'
import type { TokenDto } from '@/http/response'

/**
 * 用户信息管理工具类
 * 提供统一的用户信息获取、存储和管理功能
 */
export class UserManager {
  /**
   * 登录后处理用户信息
   * @param tokenData token 数据
   * @param loginUserInfo 登录时返回的用户信息（可选）
   * @returns 处理后的用户信息
   */
  static async handleLoginSuccess(tokenData: TokenDto, loginUserInfo?: UserState): Promise<UserState | null> {
    try {
      // 存储 token
      TokenStorage.setToken(tokenData)
      
      // 获取用户信息
      const userInfo = await getUserInfo(loginUserInfo)
      
      if (userInfo) {
        // 存储用户信息
        TokenStorage.setUserInfo(userInfo)
        
        // 更新 store 状态
        const userStore = useUserStore()
        userStore.setToken(tokenData)
        userStore.setUserInfo(userInfo)
        
        return userInfo
      }
      
      return null
    } catch (error) {
      console.error('处理登录成功失败:', error)
      return null
    }
  }

  /**
   * 获取当前用户信息
   * @param forceRefresh 是否强制刷新
   * @returns 用户信息
   */
  static async getCurrentUser(forceRefresh: boolean = false): Promise<UserState | null> {
    try {
      // 检查 token 是否有效
      if (!TokenStorage.isTokenValid()) {
        return null
      }
      
      // 如果不需要强制刷新，先尝试从本地获取
      if (!forceRefresh) {
        const localUserInfo = TokenStorage.getUserInfo()
        if (localUserInfo) {
          return localUserInfo
        }
      }
      
      // 从服务器获取最新用户信息
      const userInfo = await getUserInfo()
      
      if (userInfo) {
        // 更新本地存储
        TokenStorage.setUserInfo(userInfo)
        
        // 更新 store 状态
        const userStore = useUserStore()
        userStore.setUserInfo(userInfo)
        
        return userInfo
      }
      
      return null
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      return null
    }
  }

  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  static isLoggedIn(): boolean {
    return TokenStorage.isTokenValid() && TokenStorage.hasUserInfo()
  }

  /**
   * 登出处理
   */
  static async logout(): Promise<boolean> {
    try {
      // 调用服务器端登出API
      await logout()
      
      // 清除本地存储
      TokenStorage.clear()
      
      // 重置 store 状态
      const userStore = useUserStore()
      userStore.clearUserInfo()
      
      console.log('用户已登出')
      return true
    } catch (error) {
      console.error('登出处理失败:', error)
      // 即使服务器端登出失败，也要清除本地状态
      try {
        TokenStorage.clear()
        const userStore = useUserStore()
        userStore.clearUserInfo()
      } catch (localError) {
        console.error('清除本地状态失败:', localError)
      }
      return false
    }
  }

  /**
   * 刷新用户信息
   * @returns 刷新后的用户信息
   */
  static async refreshUserInfo(): Promise<UserState | null> {
    return this.getCurrentUser(true)
  }

  /**
   * 获取用户基本信息（不包含敏感信息）
   * @returns 用户基本信息
   */
  static getBasicUserInfo(): { userId: string | null; userName: string; account: string } | null {
    const userInfo = TokenStorage.getUserInfo()
    if (!userInfo) return null
    
    return {
      userId: userInfo.id,
      userName: userInfo.userName,
      account: userInfo.account
    }
  }
} 