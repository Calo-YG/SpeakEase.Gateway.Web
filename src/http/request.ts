import axiosInstance from '@/http/index'
import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/http/response'

// 通用 request 方法
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.request(config)
}

// GET 封装
const get = <T = any>(url: string, params?: any): Promise<T> => {
  return request<T>({
    url,
    method: 'get',
    params,
  })
}

// POST 封装
const post = <T = any>(url: string, data?: any): Promise<T> => {
  return request<T>({
    url,
    method: 'post',
    data,
  })
}

/**
 * 文件上传封装
 * @param file 要上传的文件
 * @param uploadUrl 上传接口地址
 * @param extraData 可选的额外字段
 * @returns Promise<IResponseType<string>> 返回上传后的文件URL
 */
const uploadFile = async (
  file: File,
  uploadUrl: string,
  extraData?: Record<string, string>
): Promise<ApiResponse<string>> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const response = await axiosInstance.post<ApiResponse<string>>(
      import.meta.env.VITE_API_BASE + uploadUrl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

export default {
  request,
  get,
  post,
  uploadFile
}
