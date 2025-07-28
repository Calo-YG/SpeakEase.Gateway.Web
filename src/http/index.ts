// axiosClient.js
import axios from 'axios';
import router from '@/router/index'; // 确保使用项目路由实例，而非 useRouter()  
import { TokenStorage } from '@/utils/tokenStorage';
import { message, notification } from 'ant-design-vue';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
// TODO: 请确保 '@/http/response' 路径正确，且已存在对应的类型声明文件
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
  baseURL: import.meta.env.VITE_API_BASE || 'https://api.example.com',
  timeout: 10000, // 增加超时时间到10秒
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
async function refreshToken(): Promise<string> {
  try {
    const response = await axios.post<ApiResponse<RefreshTokenResponse>>('api/auth/refresh', {
      refreshToken: TokenStorage.getToken()?.refreshToken,
      id: TokenStorage.getUserInfo()?.userId,
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
    const res = response.data
    console.log(response)
    if (!res.success) {
      notification.error({
        message: '请求失败',
        description: res.message || '未知错误',
        duration: 1,
      })
      return Promise.reject(new Error(res.message))
    }
    return res.data
  },
  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status

    // 401: Access Token 失效，尝试刷新
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return instance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true
      try {
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          'api/auth/refresh',
          {
            refreshToken: TokenStorage.getToken()?.refreshToken,
            id: TokenStorage.getUserInfo()?.userId,
          }
        )
        const newToken = response.data.data.refreshToken
        TokenStorage.setToken({ token: newToken, refreshToken: newToken })
        instance.defaults.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return instance(originalRequest)
      } catch (err) {
        processQueue(err, null)
        TokenStorage.clear()
        router.push('/login')
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // 统一错误处理
    handleErrorStatus(status, error)
    return Promise.reject(error)
  }
)

// 统一错误处理函数
const handleErrorStatus = (status: number | undefined, error: any): void => {
  const errorMessages = {
    400: { message: '请求参数错误', description: '请检查提交的数据是否正确' },
    403: { message: '无权限', description: '你没有访问该资源的权限' },
    404: { message: '资源未找到', description: '请求的接口不存在' },
    500: { message: '服务器错误', description: '请稍后再试' },
    999: { message: 'refresh token 过期', description: '请重新登录' },
    499: {message:'友好提示',describe:error?.message}
  };

  const errorConfig = errorMessages[status as keyof typeof errorMessages] || {
    message: '请求异常',
    description: error?.message || '未知错误',
  };

  notification.error({
    ...errorConfig,
    duration: 1,
  });
};

export default instance;
