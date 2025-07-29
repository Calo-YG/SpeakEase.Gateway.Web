# 用户信息管理工具使用说明

## 概述

本项目提供了完整的用户信息管理工具，包括：

- `TokenStorage`: Token 存储管理
- `UserManager`: 用户信息管理
- `user.ts`: 用户相关 API 接口

## 使用方法

### 1. 用户登录

```typescript
import { login } from '@/api/user'
import { UserManager } from '@/utils/userManager'

const onLogin = async () => {
  try {
    const res = await login({ account: 'user', password: '123456' })
    
    const tokenData = {
      token: res.data.token,
      refreshToken: res.data.refreshToken || res.data.token
    }
    
    // 使用 UserManager 统一处理登录成功
    const userInfo = await UserManager.handleLoginSuccess(tokenData, res.data.userInfo)
    
    if (userInfo) {
      // 登录成功，跳转到目标页面
      router.push('/dashboard')
    }
  } catch (error) {
    // 处理登录失败
  }
}
```

### 2. 获取当前用户信息

```typescript
import { UserManager } from '@/utils/userManager'

// 获取本地缓存的用户信息
const userInfo = UserManager.getCurrentUser()

// 强制从服务器刷新用户信息
const freshUserInfo = await UserManager.getCurrentUser(true)
```

### 3. 检查登录状态

```typescript
import { UserManager } from '@/utils/userManager'

if (UserManager.isLoggedIn()) {
  // 用户已登录
} else {
  // 用户未登录，跳转到登录页
  router.push('/login')
}
```

### 4. 用户登出

```typescript
import { UserManager } from '@/utils/userManager'

const onLogout = () => {
  UserManager.logout()
  router.push('/login')
}
```

### 5. 获取用户基本信息

```typescript
import { UserManager } from '@/utils/userManager'

const basicInfo = UserManager.getBasicUserInfo()
if (basicInfo) {
  console.log('用户ID:', basicInfo.userId)
  console.log('用户名:', basicInfo.userName)
  console.log('账号:', basicInfo.account)
}
```

## API 接口

### TokenStorage

- `setToken(tokenData, expireHours)`: 存储 token
- `getToken()`: 获取 token
- `getAccessToken()`: 获取 access token
- `getRefreshToken()`: 获取 refresh token
- `isTokenValid()`: 检查 token 是否有效
- `clear()`: 清除所有存储

### UserManager

- `handleLoginSuccess(tokenData, loginUserInfo)`: 处理登录成功
- `getCurrentUser(forceRefresh)`: 获取当前用户信息
- `isLoggedIn()`: 检查是否已登录
- `logout()`: 登出处理
- `refreshUserInfo()`: 刷新用户信息
- `getBasicUserInfo()`: 获取基本信息

### user.ts API

- `login(data)`: 用户登录
- `register(data)`: 用户注册
- `getUserDetail()`: 获取用户详情
- `uploadAvatar(file)`: 上传头像
- `getUserInfo(loginUserInfo)`: 获取用户信息

## 最佳实践

1. **统一使用 UserManager**: 所有用户相关操作都通过 UserManager 进行
2. **错误处理**: 始终包含适当的错误处理
3. **类型安全**: 使用 TypeScript 类型确保类型安全
4. **缓存策略**: 合理使用本地缓存，避免频繁请求服务器
5. **状态同步**: 确保 TokenStorage 和 Pinia Store 状态同步

## 注意事项

- Token 会自动过期检查
- 用户信息会自动缓存到本地
- 登录状态会自动同步到全局状态管理
- 所有操作都有完整的错误处理 