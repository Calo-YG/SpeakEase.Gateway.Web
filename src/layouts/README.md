# 布局组件说明

## MainLayout.vue

### 功能特性

1. **响应式侧边栏**
   - 可折叠/展开
   - 移动端自适应
   - 渐变背景设计

2. **顶部导航栏**
   - 面包屑导航
   - 通知中心
   - 用户信息下拉菜单

3. **主内容区域**
   - 自适应高度
   - 滚动条美化
   - 路由视图容器

### 组件结构

```
MainLayout.vue
├── 侧边栏 (Sidebar)
│   ├── Logo 区域
│   ├── 折叠按钮
│   └── 导航菜单
├── 主内容区域 (Main Content)
│   ├── 头部 (Header)
│   │   ├── 面包屑导航
│   │   └── 用户操作区
│   └── 内容区域 (Content)
│       └── <router-view />
```

### 菜单配置

| 模块 | 路径 | 功能 |
|------|------|------|
| 仪表板 | `/dashboard` | 系统概览 |
| 用户管理 | `/user/*` | 用户列表、个人资料 |
| 服务管理 | `/service/*` | 服务列表、服务配置 |
| 路由管理 | `/route/*` | 路由列表、路由配置 |
| 集群配置 | `/cluster/*` | 集群列表、集群监控 |
| 系统设置 | `/system/*` | 系统配置、系统日志 |

### 使用方法

1. **在路由中使用**
```typescript
{
  path: "/",
  component: () => import("@/layouts/MainLayout.vue"),
  children: [
    {
      path: "dashboard",
      component: () => import("@/views/Dashboard/index.vue")
    }
  ]
}
```

2. **在组件中访问用户信息**
```typescript
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()
const userInfo = userStore.getUserInfo
```

### 样式特点

1. **配色方案**
   - 主色：浅蓝色 (#87CEEB)
   - 辅色：淡紫色 (#D8BFD8)
   - 背景：白色 (#FFFFFF)

2. **交互效果**
   - 悬停动画
   - 平滑过渡
   - 阴影效果

3. **响应式设计**
   - 桌面端：侧边栏固定
   - 移动端：侧边栏可滑动

### 自定义配置

1. **修改菜单项**
```vue
<a-menu-item key="custom">
  <template #icon>
    <CustomIcon />
  </template>
  <router-link to="/custom">自定义页面</router-link>
</a-menu-item>
```

2. **添加新的统计卡片**
```vue
<a-card class="stat-card" hoverable>
  <div class="stat-content">
    <div class="stat-icon custom-icon">
      <CustomIcon />
    </div>
    <div class="stat-info">
      <div class="stat-number">{{ customCount }}</div>
      <div class="stat-label">自定义统计</div>
    </div>
  </div>
</a-card>
```

### 注意事项

1. **路由配置**
   - 确保子路由正确配置
   - 设置适当的 meta 信息

2. **权限控制**
   - 在路由守卫中检查用户权限
   - 根据权限显示/隐藏菜单项

3. **性能优化**
   - 使用懒加载组件
   - 避免不必要的重渲染

### 扩展功能

1. **主题切换**
   - 支持明暗主题
   - 自定义主题色

2. **国际化**
   - 支持多语言切换
   - 动态菜单文本

3. **权限管理**
   - 基于角色的菜单显示
   - 动态权限控制 