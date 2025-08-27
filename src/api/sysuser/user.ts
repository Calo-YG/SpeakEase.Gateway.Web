import request from '@/http/request'
import type { UserState } from '@/store/user'
import type { ApiResponse } from '@/http/response'
import { UserPageDto, UserPageInput } from './sysuser';
import { PageResult } from '../common';

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
  return request.post('/api/sysuser/register', data)
}

/**
 * 创建用户
 * @param data 创建用户参数
 */
export function  createUser(data: { account: string; password: string; name: string; email: string; avatar: string }) {
  return request.post('/api/sysuser/create', data)
}

/**
 * 获取用户详细信息
 * @returns {Promise<UserState>} 返回一个包含用户详细信息的Promise对象
 */
export function getUserDetail() {
  return request.get<UserState>('/api/sysuser/getDetail')
}

/**
 * 上传用户头像
 * @param file - 用户选择的头像文件对象
 * @returns 返回上传请求的Promise对象
 */
export function uploadAvatar(file: File) {
  // 创建FormData对象，用于构建表单数据
  const formData = new FormData()
  // 将文件添加到FormData中，键名为'file'
  formData.append('file', file)
  // 调用上传文件接口，传入API路径和表单数据
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


/**
 * 用户登出函数
 * 该函数用于发送登出请求到后端API
 * @returns {Promise} 返回一个Promise对象，包含登出请求的响应结果
 */
export function logout() {
  return request.post('/api/sysuser/logout') // 发送POST请求到登出接口
}

/**
 * 获取用户列表的函数
 * 该函数通过调用API获取用户列表数据
 * @returns 返回一个Promise，解析为ApiResponse<UserPageDto>类型的数据
 */
export function getUserList(data:UserPageInput) {
  // 使用request发送GET请求到指定API端点
  // 请求路径为'/api/sysuser/getUserList'
  // 返回类型为ApiResponse<UserPageDto>
  return request.post<PageResult<UserPageDto>>('/api/sysuser/getList',data)
}
/**
 * 删除用户
 * @param id 用户ID
 * @returns 删除结果
 */
export function deleteUser(id: string) {
  return request.del(`/api/sysuser/delete/${id}`)
}