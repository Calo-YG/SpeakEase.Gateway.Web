// axiosClient.js
import axios from 'axios';
import router from '@/router/index';
import { TokenStorage } from '@/utils/tokenStorage';
import { message, notification } from 'ant-design-vue';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@/http/response';

// 定义接口和类型
interface RefreshTokenResponse {
  refreshToken: string;
}

interface FailedRequest {
  resolve: (value?: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}

interface AxiosConfig extends AxiosRequestConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

// 创建 Axios 实例
const createAxiosInstance = (config: AxiosConfig) => {
  return axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });
};

// 全局配置
const defaultConfig: AxiosConfig = {
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5046',
  timeout: 10000,
};

// 创建实例
const instance = createAxiosInstance(defaultConfig);

// 刷新状态与队列
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// 处理队列：根据刷新结果依次重试或拒绝
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token || '');
  });
  failedQueue = [];
};

// 请求拦截：注入 Access Token
instance.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 刷新接口封装
/**
 * 刷新用户认证Token的异步函数
 * @returns {Promise<string>} 返回新的refresh token字符串
 * @throws {Error} 当刷新Token请求失败时抛出错误
 */
async function refreshToken(): Promise<string> {
  try {
    const response = await instance.post<ApiResponse<RefreshTokenResponse>>('/api/sysuser/refreshToken', {
      refreshToken: TokenStorage.getToken()?.refreshToken,
      userId: TokenStorage.getUserInfo()?.id,
    });
    return response.data.data.refreshToken;
  } catch (error) {
    console.error('刷新Token失败:', error);
    throw error;
  }
}

// 响应拦截：业务错误与 Token 刷新
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    
    // 如果响应成功，直接返回 response
    if (res.successed) {
      return response;
    }
    
    // 业务错误处理
    notification.error({
      message: '请求失败',
      description: res.message || '未知错误',
      duration: 3,
    });
    
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // 401: Access Token 失效，尝试刷新
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        TokenStorage.setToken({ token: newToken, refreshToken: newToken });
        instance.defaults.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        TokenStorage.clear();
        message.error('登录已过期，请重新登录');
        router.push('/login');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // 统一错误处理
    handleErrorStatus(status, error?.response?.data?.message);
    return Promise.reject(error);
  }
);

// 统一错误处理函数
const handleErrorStatus = (status: number | undefined, error: any): void => {
  const errorMessages: Record<number, { message: string; description: string }> = {
    400: { message: '请求参数错误', description: '请检查提交的数据是否正确' },
    401: { message: '未授权', description: '请先登录' },
    403: { message: '无权限', description: '你没有访问该资源的权限' },
    404: { message: '资源未找到', description: '请求的接口不存在' },
    500: { message: '服务器错误', description: '请稍后再试' },
    502: { message: '网关错误', description: '服务器暂时不可用' },
    503: { message: '服务不可用', description: '服务器维护中' },
    504: { message: '网关超时', description: '请求超时，请重试' },
    499: { message: '友好提示', description: error || '未知错误' },
  };

  const errorConfig = errorMessages[status as keyof typeof errorMessages] || {
    message: '请求异常',
    description: error?.response?.data?.message || error?.message || '未知错误',
  };

  notification.error({
    ...errorConfig,
    duration: 3,
  });
};

export default instance;
