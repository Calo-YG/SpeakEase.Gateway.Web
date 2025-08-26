# HTTP 客户端优化总结

## 原始代码问题分析

### 1. 类型安全问题
- **文件头注释错误**: 文件是 `.ts` 但注释写的是 `.js`
- **拼写错误**: `ApiResponse` 接口中 `successed` 应该是 `succeeded`
- **类型定义不够严格**: 一些 `any` 类型可以更具体

### 2. Token 刷新逻辑问题
- **Token 存储结构错误**: 刷新后存储的 token 结构不正确
- **缺少验证**: 刷新 token 时缺少必要的参数验证

### 3. 错误处理不够完善
- **错误分类不清晰**: 没有区分不同类型的错误
- **错误信息不够友好**: 缺少针对性的错误提示
- **缺少网络错误处理**: 没有处理网络连接失败的情况

### 4. 功能缺失
- **缺少请求取消功能**: 无法取消正在进行的请求
- **缺少请求重试机制**: 没有自动重试失败请求的功能
- **缺少请求超时处理**: 没有专门的超时错误处理

## 优化改进

### 1. 类型安全改进
```typescript
// 修复文件头注释
// axiosClient.ts

// 修复拼写错误
export interface ApiResponse<P = any> {
    succeeded: boolean; // 原来是 successed
    // ...
}

// 添加更严格的类型定义
interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _cancelToken?: any;
  metadata?: { startTime: Date };
}
```

### 2. 错误处理优化
```typescript
// 添加错误类型枚举
enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN'
}

// 统一的错误处理函数
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
    // ...
  };
  // ...
};
```

### 3. Token 刷新逻辑优化
```typescript
async function refreshToken(): Promise<string> {
  try {
    const refreshTokenValue = TokenStorage.getRefreshToken();
    const userInfo = TokenStorage.getUserInfo();
    
    // 添加参数验证
    if (!refreshTokenValue || !userInfo?.id) {
      throw new Error('缺少刷新token或用户信息');
    }
    
    const response = await instance.post<ApiResponse<RefreshTokenResponse>>('/api/sysuser/refreshToken', {
      refreshToken: refreshTokenValue,
      userId: userInfo.id,
    });
    
    // 验证响应
    if (!response.data.succeeded) {
      throw new Error(response.data.message || '刷新token失败');
    }
    
    return response.data.data.refreshToken;
  } catch (error) {
    console.error('刷新Token失败:', error);
    throw error;
  }
}
```

### 4. 新增功能

#### 请求取消功能
```typescript
// 创建请求取消令牌
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// 使用示例
const cancelToken = createCancelToken();
const response = await http.get('/api/data', {
  cancelToken: cancelToken.token
});
// 取消请求: cancelToken.cancel('用户取消请求');
```

#### 请求重试机制
```typescript
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
      
      // 等待后重试（指数退避）
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};
```

### 5. 代码结构优化
- **模块化**: 将功能分离到不同的函数中
- **可读性**: 添加详细的注释和文档
- **可维护性**: 使用枚举和常量提高代码可维护性
- **可扩展性**: 设计灵活的接口便于后续扩展

## 使用示例

### 基本使用
```typescript
import http from '@/http/index';
import { retryRequest, createCancelToken } from '@/http/index';

// 基本 GET 请求
const getData = async () => {
  try {
    const response = await http.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('请求失败:', error);
  }
};
```

### 带重试的请求
```typescript
const fetchDataWithRetry = async () => {
  try {
    const result = await retryRequest(
      () => http.get('/api/data'),
      3, // 最大重试次数
      1000 // 初始延迟时间（毫秒）
    );
    return result.data;
  } catch (error) {
    console.error('重试后仍然失败:', error);
  }
};
```

### 可取消的请求
```typescript
const fetchDataWithCancel = async () => {
  const cancelToken = createCancelToken();
  
  try {
    const response = await http.get('/api/data', {
      cancelToken: cancelToken.token
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('请求被取消');
    } else {
      console.error('请求失败:', error);
    }
  }
};
```

## 最佳实践建议

1. **使用类型定义**: 为 API 响应定义 TypeScript 接口
2. **错误处理**: 在业务代码中处理特定的业务错误
3. **请求取消**: 对于长时间运行的请求，提供取消功能
4. **重试机制**: 对于网络不稳定的情况，使用重试机制
5. **加载状态**: 在 UI 中显示请求的加载状态

## 总结

通过这次优化，HTTP 客户端具备了以下特性：

- ✅ 类型安全的 API 调用
- ✅ 自动 Token 管理（包括刷新机制）
- ✅ 统一的错误处理和用户友好的错误提示
- ✅ 请求重试机制（支持指数退避）
- ✅ 请求取消功能
- ✅ 完善的网络错误处理
- ✅ 良好的代码结构和可维护性

这些改进大大提升了 HTTP 客户端的健壮性、可用性和开发体验。
