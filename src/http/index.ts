// axiosClient.ts
import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import router from '@/router/index';
import { TokenStorage } from '@/utils/tokenStorage';
import { message, notification } from 'ant-design-vue';
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

// 请求配置接口
interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _cancelToken?: any;
  metadata?: { startTime: Date };
}

// 错误类型枚举
enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN'
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

// 获取错误类型
const getErrorType = (error: AxiosError): ErrorType => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return ErrorType.TIMEOUT;
    }
    return ErrorType.NETWORK;
  }
  
  const status = error.response.status;
  if (status >= 500) return ErrorType.SERVER;
  if (status >= 400) return ErrorType.CLIENT;
  if (status === 401) return ErrorType.AUTH;
  
  return ErrorType.UNKNOWN;
};

// 请求拦截：注入 Access Token
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 刷新接口封装
/**
 * 刷新用户认证Token的异步函数
 * @returns {Promise<string>} 返回新的access token字符串
 * @throws {Error} 当刷新Token请求失败时抛出错误
 */
async function refreshToken(): Promise<string> {
  try {
    const refreshTokenValue = TokenStorage.getRefreshToken();
    const userInfo = TokenStorage.getUserInfo();
    
    if (!refreshTokenValue || !userInfo?.id) {
      throw new Error('缺少刷新token或用户信息');
    }
    
    const response = await instance.post<ApiResponse<RefreshTokenResponse>>('/api/sysuser/refreshToken', {
      refreshToken: refreshTokenValue,
      userId: userInfo.id,
    });
    
    if (!response.data.succeeded) {
      throw new Error(response.data.message || '刷新token失败');
    }
    
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
    if (res.succeeded) {
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
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfig;
    const status = error?.response?.status;
    const errorType = getErrorType(error);

    // 401: Access Token 失效，尝试刷新
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ 
            resolve: (value?: string | PromiseLike<string>) => resolve(value || ''), 
            reject 
          });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        // 正确存储token结构
        TokenStorage.setToken({ 
          token: newToken, 
          refreshToken: TokenStorage.getRefreshToken() || newToken 
        });
        
        if (instance.defaults.headers.common) {
          instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        }
        
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
    handleError(errorType, status, error);
    return Promise.reject(error);
  }
);

// 统一错误处理函数
const handleError = (errorType: ErrorType, status?: number, error?: AxiosError): void => {
  const errorMessages: Record<ErrorType, { message: string; description: string }> = {
    [ErrorType.NETWORK]: { 
      message: '网络连接失败', 
      description: '请检查网络连接后重试' 
    },
    [ErrorType.TIMEOUT]: { 
      message: '请求超时', 
      description: '服务器响应超时，请稍后重试' 
    },
    [ErrorType.SERVER]: { 
      message: '服务器错误', 
      description: '服务器内部错误，请稍后重试' 
    },
    [ErrorType.CLIENT]: { 
      message: '请求错误', 
      description: getClientErrorMessage(status) 
    },
    [ErrorType.AUTH]: { 
      message: '认证失败', 
      description: '请重新登录' 
    },
    [ErrorType.UNKNOWN]: { 
      message: '未知错误', 
      description: error?.message || '发生未知错误' 
    }
  };

  const errorConfig = errorMessages[errorType];

  notification.error({
    ...errorConfig,
    duration: 3,
  });
};

// 获取客户端错误信息
const getClientErrorMessage = (status?: number): string => {
  const statusMessages: Record<number, string> = {
    400: '请求参数错误，请检查提交的数据',
    403: '无权限访问该资源',
    404: '请求的资源不存在',
    405: '请求方法不被允许',
    409: '资源冲突',
    422: '请求数据验证失败',
    429: '请求过于频繁，请稍后重试',
    499: '请求被客户端取消'
  };
  
  return statusMessages[status || 0] || '客户端请求错误';
};

// 创建请求取消令牌
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// 请求重试函数
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // 如果是认证错误或客户端错误，不重试
      if (error instanceof axios.AxiosError) {
        const status = error.response?.status;
        if (status && (status >= 400 && status < 500 && status !== 408)) {
          throw error;
        }
      }
      
      // 最后一次重试失败，抛出错误
      if (i === maxRetries - 1) {
        throw lastError;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};

// 导出实例和工具函数
export default instance;
export { ErrorType };
