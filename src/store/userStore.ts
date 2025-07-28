// src/store/user.ts
import { defineStore } from 'pinia'
import { TokenStorage } from '@/utils/tokenStorage'
import type { TokenDto } from '@/http/response'
import type { UserState } from '@/store/user'
import { notification } from 'ant-design-vue'

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userId: 0,
    userName: '',
    email: '',
    account: '',
    avatar: '',
    isAuthenticated: false
  }),

  getters: {
    // 获取用户完整信息
    getUserInfo: (state): UserState => state,
    
    // 检查是否已登录
    isLoggedIn: (state): boolean => state.isAuthenticated
  },

  actions: {
    // 设置token
    setToken(data: TokenDto) {
      try {
        TokenStorage.setToken(data)
        this.isAuthenticated = true
      } catch (error) {
        console.error('设置token失败:', error)
        notification.error({
          message: '错误',
          description: '设置token失败，请重试',
          duration: 2
        })
      }
    },

    // 设置用户信息
    setUserInfo(payload: Partial<UserState>) {
      try {
        // 更新store状态
        this.$patch({
          ...payload,
          isAuthenticated: true
        })

        // 更新本地存储
        TokenStorage.setUserInfo({
          userId: payload.userId || 0,
          userName: payload.userName || '',
          email: payload.email || '',
          account: payload.account || '',
          avatar: payload.avatar || '',
          isAuthenticated: true
        })
      } catch (error) {
        console.error('设置用户信息失败:', error)
        notification.error({
          message: '错误',
          description: '设置用户信息失败，请重试',
          duration: 2
        })
      }
    },

    // 清空用户信息（登出）
    clearUserInfo() {
      try {
        this.$reset()
        TokenStorage.clear()
        notification.success({
          message: '提示',
          description: '已成功退出登录',
          duration: 1
        })
      } catch (error) {
        console.error('清除用户信息失败:', error)
        notification.error({
          message: '错误',
          description: '退出登录失败，请重试',
          duration: 2
        })
      }
    }
  }
})
