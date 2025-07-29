# 响应数据调试说明

## 问题分析

### 原始错误
```
TypeError: Cannot read properties of undefined (reading 'token')
at onLogin (Login.vue:108:1)
```

### 问题原因
1. **数据流不一致**: 响应拦截器返回 `response` 对象，但 `request.ts` 期望访问 `response.data.data`
2. **类型定义错误**: `login()` 方法没有正确的返回类型定义
3. **数据访问错误**: `Login.vue` 中访问 `res.data.token` 而不是 `res.token`

## 修复方案

### 1. 修复响应拦截器数据流
- 响应拦截器返回 `response` 对象
- `request.ts` 中访问 `response.data` (业务数据)
- 业务代码直接使用返回的数据

### 2. 修复类型定义
```typescript
// 修复前
export function login(data: { account: string; password: string }) {
  return request.post('/api/sysuser/login', data)
}

// 修复后
export function login(data: { account: string; password: string }) {
  return request.post<{ token: string; refreshToken: string; userInfo: UserState }>('/api/sysuser/login', data)
}
```

### 3. 修复数据访问
```typescript
// 修复前
const tokenData = {
  token: res.data.token,
  refreshToken: res.data.refreshToken
}

// 修复后
const tokenData = {
  token: res.token,
  refreshToken: res.refreshToken
}
```

## 数据流验证

### 期望的后端响应格式
```json
{
  "code": 200,
  "successed": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "userId": 1,
      "userName": "张三",
      "email": "zhangsan@example.com",
      "account": "zhangsan",
      "avatar": "http://example.com/avatar.jpg",
      "isAuthenticated": true
    }
  }
}
```

### 前端处理流程
1. **响应拦截器**: 返回 `response` 对象
2. **request.ts**: 提取 `response.data` (业务数据)
3. **Login.vue**: 直接使用 `res.token`, `res.refreshToken`, `res.userInfo`

## 调试建议

1. **检查网络请求**: 使用浏览器开发者工具查看实际的响应数据
2. **添加调试日志**: 在关键位置添加 `console.log` 查看数据流
3. **验证后端接口**: 确保后端返回的数据格式符合预期
4. **类型检查**: 使用 TypeScript 确保类型安全

## 测试步骤

1. 打开浏览器开发者工具
2. 尝试登录
3. 查看 Network 标签页中的请求响应
4. 查看 Console 标签页中的调试信息
5. 验证数据是否正确传递到 `UserManager.handleLoginSuccess()` 