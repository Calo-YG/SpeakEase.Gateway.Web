# HTTP 客户端使用说明

## 概述

这是一个基于 Axios 的 HTTP 客户端，提供了以下功能：

- 自动 Token 管理（包括刷新机制）
- 统一的错误处理
- 请求重试机制
- 请求取消功能
- 类型安全的 API 调用

## 基本使用

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

// POST 请求
const createUser = async (userData: any) => {
  try {
    const response = await http.post('/api/users', userData);
    return response.data;
  } catch (error) {
    console.error('创建用户失败:', error);
  }
};
```

## 请求重试

```typescript
import { retryRequest } from '@/http/index';

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

## 请求取消

```typescript
import { createCancelToken } from '@/http/index';

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
  
  // 取消请求
  // cancelToken.cancel('用户取消请求');
};
```

## 错误处理

客户端会自动处理以下类型的错误：

- **网络错误**: 网络连接失败
- **超时错误**: 请求超时
- **服务器错误**: 5xx 状态码
- **客户端错误**: 4xx 状态码
- **认证错误**: 401 状态码

所有错误都会通过 Ant Design Vue 的 notification 组件显示给用户。

## Token 管理

客户端会自动：

1. 在请求头中添加 Authorization Bearer token
2. 当收到 401 错误时自动刷新 token
3. 刷新失败时清除本地存储并跳转到登录页

## 类型安全

```typescript
import type { ApiResponse } from '@/http/response';

interface User {
  id: number;
  name: string;
  email: string;
}

// 类型安全的 API 调用
const getUser = async (id: number): Promise<User> => {
  const response = await http.get<ApiResponse<User>>(`/api/users/${id}`);
  return response.data.data;
};
```

## 配置选项

可以通过环境变量配置：

```env
VITE_API_BASE=http://localhost:5046
```

默认配置：
- 超时时间: 10秒
- 基础URL: http://localhost:5046
- Content-Type: application/json

## 最佳实践

1. **使用类型定义**: 为 API 响应定义 TypeScript 接口
2. **错误处理**: 在业务代码中处理特定的业务错误
3. **请求取消**: 对于长时间运行的请求，提供取消功能
4. **重试机制**: 对于网络不稳定的情况，使用重试机制
5. **加载状态**: 在 UI 中显示请求的加载状态
