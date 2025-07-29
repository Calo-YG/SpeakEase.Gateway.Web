import request from '@/http/request'
import type { UserState } from '@/store/user'
import type { ApiResponse } from '@/http/response'

/**
 * 用户登录
 * @param data 登录参数
 */
export function login(data: { account: string; password: string }) {
  return request.post<{ token: string; refreshToken: string }>('/api/sysuser/login', data)
}

/**
 * 用户注册
 * @param data 注册参数
 */
export function register(data: { account: string; password: string; name: string; email: string; avatar: string }) {
  return request.post('/api/user/register', data)
}

/**
 * 获取用户详细信息
 * @returns 用户信息
 */
export function getUserDetail() {
  return request.get<UserState>('/api/sysuser/getDetail')
}

/**
 * 上传用户头像
 * @param file 头像文件
 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.uploadFile('/api/upload/avatar', formData)
}

/**
 * 获取用户信息的统一方法
 * 优先使用登录返回的用户信息，如果没有则单独获取
 * @param loginUserInfo 登录时返回的用户信息（可选）
 * @returns 用户信息
 */
export async function getUserInfo(loginUserInfo?: UserState): Promise<UserState | null> {
  try {
    // 如果登录时已经返回了用户信息，直接使用
    if (loginUserInfo) {
      return loginUserInfo
    }
    
    // 否则单独获取用户详细信息
    const response = await getUserDetail()
    return response
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
} 