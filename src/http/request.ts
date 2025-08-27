import axiosInstance from '@/http/index'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/http/response'

// 通用 request 方法
const request = <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return axiosInstance.request(config)
}

// GET 封装
const get = <T = any>(url: string, params?: any): Promise<T> => {
  return request<ApiResponse<T>>({
    url,
    method: 'get',
    params,
  }).then(response => {
    // 如果响应拦截器返回的是完整的响应对象，需要提取 data 字段
    const responseData = (response as any).data || response
    return responseData.data || responseData
  })
}

// POST 封装
const post = <T = any>(url: string, data?: any): Promise<T> => {
  return request<ApiResponse<T>>({
    url,
    method: 'post',
    data,
  }).then(response => {
    // 如果响应拦截器返回的是完整的响应对象，需要提取 data 字段
    const responseData = (response as any).data || response
    return responseData.data || responseData
  })
}

/// DELETE 封装
const del = <T = any>(url: string, data?: any): Promise<T> => {
  return request<ApiResponse<T>>({
    url,
    method: 'delete',
    data,
  }).then(response => {
    // 如果响应拦截器返回的是完整的响应对象，需要提取 data 字段
    const responseData = (response as any).data || response
    return responseData.data || responseData
  })
}


/**
 * 文件上传封装
 * @param uploadUrl 上传接口地址
 * @param formData FormData 对象
 * @returns Promise<string> 返回上传后的文件URL
 */
const uploadFile = async (
  uploadUrl: string,
  formData: FormData
): Promise<string> => {
  try {
    const response = await axiosInstance.post<ApiResponse<string>>(
      uploadUrl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data.data
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

export default {
  request,
  get,
  post,
  uploadFile,
  del
}
