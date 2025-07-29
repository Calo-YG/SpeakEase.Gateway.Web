# 响应数据修复说明

## 修复的问题

### 1. 响应拦截器问题
**问题**: 响应拦截器返回的是整个 `response` 对象，但业务代码需要的是 `response.data.data`

**修复**: 
- 响应拦截器继续返回 `response` 对象
- 在 `request.ts` 中的 `get` 和 `post` 方法中提取 `response.data.data`

### 2. 类型定义问题
**问题**: API 方法返回类型不一致

**修复**:
- `get<T>()` 返回 `Promise<T>` (直接是业务数据)
- `post<T>()` 返回 `Promise<T>` (直接是业务数据)
- `uploadFile()` 返回 `Promise<string>` (直接是文件URL)

### 3. 数据访问问题
**问题**: 业务代码中需要手动访问 `response.data.data`

**修复**:
- 现在业务代码直接使用返回的数据，无需额外访问

## 修复后的数据流

### 登录流程
```typescript
// 1. 发送请求
const res = await login(form.value)
// res 现在是: { token: "xxx", refreshToken: "yyy", userInfo: {...} }

// 2. 使用数据
const tokenData = {
  token: res.token,           // 直接访问
  refreshToken: res.refreshToken
}
```

### 获取用户信息
```typescript
// 1. 发送请求
const userInfo = await getUserDetail()
// userInfo 现在是: { userId: 1, userName: "xxx", ... }

// 2. 直接使用
console.log(userInfo.userName)
```

### 文件上传
```typescript
// 1. 上传文件
const avatarUrl = await uploadAvatar(file)
// avatarUrl 现在是: "http://example.com/avatar.jpg"

// 2. 直接使用
form.value.avatar = avatarUrl
```

## 测试建议

1. **登录测试**: 检查 `res.data` 是否包含正确的 token 和用户信息
2. **用户信息测试**: 检查 `getUserDetail()` 返回的数据结构
3. **文件上传测试**: 检查 `uploadAvatar()` 返回的 URL 格式
4. **错误处理测试**: 检查网络错误和业务错误的处理

## 注意事项

- 所有 API 方法现在都直接返回业务数据
- 错误处理仍然通过 Promise.reject 进行
- 类型安全得到保证
- 向后兼容现有代码 