<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#87CEEB" />
            <path d="M12 16h24v2H12v-2zm0 6h24v2H12v-2zm0 6h16v2H12v-2z" fill="white" />
          </svg>
          <span v-show="!sidebarCollapsed" class="logo-text">SpeakEase</span>
        </div>
        <a-button
          type="text"
          class="collapse-btn"
          @click="toggleSidebar"
        >
          <template #icon>
            <MenuUnfoldOutlined v-if="sidebarCollapsed" />
            <MenuFoldOutlined v-else />
          </template>
        </a-button>
      </div>

      <div class="sidebar-menu">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          mode="inline"
          :inline-collapsed="sidebarCollapsed"
          class="menu"
        >
          <a-menu-item key="dashboard">
            <template #icon>
              <DashboardOutlined />
            </template>
            <router-link to="/dashboard">仪表板</router-link>
          </a-menu-item>

          <a-sub-menu key="user">
            <template #icon>
              <UserOutlined />
            </template>
            <template #title>用户管理</template>
            <a-menu-item key="user-list">
              <router-link to="/user/list">用户列表</router-link>
            </a-menu-item>
            <a-menu-item key="user-profile">
              <router-link to="/user/profile">个人资料</router-link>
            </a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="service">
            <template #icon>
              <ApiOutlined />
            </template>
            <template #title>服务管理</template>
            <a-menu-item key="service-list">
              <router-link to="/service/list">服务列表</router-link>
            </a-menu-item>
            <a-menu-item key="service-config">
              <router-link to="/service/config">服务配置</router-link>
            </a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="route">
            <template #icon>
              <ForkOutlined />
            </template>
            <template #title>路由管理</template>
            <a-menu-item key="route-list">
              <router-link to="/route/list">路由列表</router-link>
            </a-menu-item>
            <a-menu-item key="route-config">
              <router-link to="/route/config">路由配置</router-link>
            </a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="cluster">
            <template #icon>
              <ClusterOutlined />
            </template>
            <template #title>集群配置</template>
            <a-menu-item key="cluster-list">
              <router-link to="/cluster/list">集群列表</router-link>
            </a-menu-item>
            <a-menu-item key="cluster-monitor">
              <router-link to="/cluster/monitor">集群监控</router-link>
            </a-menu-item>
          </a-sub-menu>

          <a-sub-menu key="system">
            <template #icon>
              <SettingOutlined />
            </template>
            <template #title>系统设置</template>
            <a-menu-item key="system-config">
              <router-link to="/system/config">系统配置</router-link>
            </a-menu-item>
            <a-menu-item key="system-log">
              <router-link to="/system/log">系统日志</router-link>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content" :class="{ expanded: sidebarCollapsed }">
      <!-- 头部 -->
      <div class="header">
        <div class="header-left">
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
              <span v-else>{{ item.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <div class="header-actions">
            <!-- 通知 -->
            <a-badge :count="5" class="notification-badge">
              <a-button type="text" class="action-btn">
                <template #icon>
                  <BellOutlined />
                </template>
              </a-button>
            </a-badge>

            <!-- 用户信息 -->
            <a-dropdown class="user-dropdown" placement="bottomRight">
              <div class="user-info">
                <a-avatar :src="userInfo.avatar" :size="36" class="user-avatar">
                  <template #icon>
                    <UserOutlined />
                  </template>
                </a-avatar>
                <div class="user-details" v-show="!sidebarCollapsed">
                  <span class="username">{{ userInfo.userName }}</span>
                  <span class="user-role">管理员</span>
                </div>
                <DownOutlined class="dropdown-icon" />
              </div>
              <template #overlay>
                <a-menu class="user-dropdown-menu">
                  <div class="dropdown-header">
                    <a-avatar :src="userInfo.avatar" :size="48" class="header-avatar">
                      <template #icon>
                        <UserOutlined />
                      </template>
                    </a-avatar>
                    <div class="header-info">
                      <div class="header-name">{{ userInfo.userName }}</div>
                      <div class="header-email">{{ userInfo.email || 'user@example.com' }}</div>
                    </div>
                  </div>
                  <a-menu-divider />
                  <a-menu-item key="profile" class="dropdown-item">
                    <UserOutlined class="item-icon" />
                    <span>个人资料</span>
                  </a-menu-item>
                  <a-menu-item key="settings" class="dropdown-item">
                    <SettingOutlined class="item-icon" />
                    <span>账户设置</span>
                  </a-menu-item>
                  <a-menu-item key="help" class="dropdown-item">
                    <QuestionCircleOutlined class="item-icon" />
                    <span>帮助中心</span>
                  </a-menu-item>
                  <a-menu-divider />
                                     <a-menu-item key="logout" @click="handleLogout" class="dropdown-item logout-item" :disabled="logoutLoading">
                     <LogoutOutlined v-if="!logoutLoading" class="item-icon" />
                     <LoadingOutlined v-else class="item-icon" />
                     <span>{{ logoutLoading ? '退出中...' : '退出登录' }}</span>
                   </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ApiOutlined,
  ForkOutlined,
  ClusterOutlined,
  SettingOutlined,
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/store/userStore'
import { UserManager } from '@/utils/userManager'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 侧边栏状态
const sidebarCollapsed = ref(false)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// 退出登录加载状态
const logoutLoading = ref(false)

// 用户信息
const userInfo = computed(() => userStore.getUserInfo)

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    title: item.meta?.title as string,
    path: item.path
  }))
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 处理退出登录
const handleLogout = async () => {
  Modal.confirm({
    title: '确认退出登录',
    content: '您确定要退出登录吗？退出后需要重新登录才能访问系统。',
    okText: '确认退出',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      logoutLoading.value = true
      try {
        const success = await UserManager.logout()
        if (success) {
          message.success('已成功退出登录')
        } else {
          message.warning('本地状态已清除，但服务器端登出可能失败')
        }
        router.push('/login')
      } catch (error) {
        console.error('退出登录失败:', error)
        message.error('退出登录失败，请重试')
      } finally {
        logoutLoading.value = false
      }
    }
  })
}

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  (newPath) => {
    const pathSegments = newPath.split('/').filter(Boolean)
    if (pathSegments.length > 0) {
      selectedKeys.value = [pathSegments[0]]
      if (pathSegments.length > 1) {
        openKeys.value = [pathSegments[0]]
      }
    }
  },
  { immediate: true }
)

// 键盘快捷键支持
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+Q 快速退出登录
  if (event.ctrlKey && event.key === 'q') {
    event.preventDefault()
    handleLogout()
  }
}

// 监听键盘事件
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #87CEEB 0%, #D8BFD8 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.collapse-btn {
  color: #333;
  border: none;
  background: transparent;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.menu {
  background: transparent;
  border: none;
}

.menu :deep(.ant-menu-item) {
  margin: 4px 8px;
  border-radius: 8px;
  color: #333;
}

.menu :deep(.ant-menu-item:hover) {
  background: rgba(255, 255, 255, 0.3);
  color: #333;
}

.menu :deep(.ant-menu-item-selected) {
  background: rgba(255, 255, 255, 0.5);
  color: #333;
}

.menu :deep(.ant-menu-submenu-title) {
  color: #333;
  margin: 4px 8px;
  border-radius: 8px;
}

.menu :deep(.ant-menu-submenu-title:hover) {
  background: rgba(255, 255, 255, 0.3);
  color: #333;
}

.menu :deep(.ant-menu-submenu-selected .ant-menu-submenu-title) {
  background: rgba(255, 255, 255, 0.5);
  color: #333;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.main-content.expanded {
  margin-left: 0;
}

/* 头部样式 */
.header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  margin-right: 8px;
}

.action-btn {
  color: #666;
  border: none;
  background: transparent;
  font-size: 16px;
}

.action-btn:hover {
  color: #87CEEB;
  background: rgba(135, 206, 235, 0.1);
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-info:hover {
  background: rgba(135, 206, 235, 0.1);
  border-color: rgba(135, 206, 235, 0.3);
}

.user-avatar {
  border: 2px solid rgba(135, 206, 235, 0.3);
  transition: all 0.3s ease;
}

.user-info:hover .user-avatar {
  border-color: rgba(135, 206, 235, 0.6);
  transform: scale(1.05);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.dropdown-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.3s ease;
  margin-left: 4px;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
  color: #87CEEB;
}

/* Dropdown菜单样式 */
.user-dropdown-menu {
  min-width: 280px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.dropdown-header {
  padding: 20px 16px;
  background: linear-gradient(135deg, #87CEEB 0%, #D8BFD8 100%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-avatar {
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-info {
  flex: 1;
}

.header-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.header-email {
  font-size: 13px;
  color: #666;
}

.dropdown-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(135, 206, 235, 0.1) 0%, transparent 100%);
  transition: width 0.3s ease;
}

.dropdown-item:hover::before {
  width: 100%;
}

.dropdown-item:hover {
  background: rgba(135, 206, 235, 0.08);
  transform: translateX(4px);
}

.item-icon {
  font-size: 16px;
  color: #666;
  width: 20px;
  text-align: center;
}

.dropdown-item:hover .item-icon {
  color: #87CEEB;
}

.logout-item {
  color: #ff4d4f;
}

.logout-item:hover {
  background: rgba(255, 77, 79, 0.08);
}

.logout-item .item-icon {
  color: #ff4d4f;
}

.logout-item:hover .item-icon {
  color: #ff7875;
}

.logout-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-item:disabled:hover {
  background: transparent;
  transform: none;
}

.logout-item:disabled .item-icon {
  color: #ff4d4f;
}

/* 内容区域样式 */
.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1001;
  }

  .sidebar.collapsed {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .header {
    padding: 0 16px;
  }

  .content {
    padding: 16px;
  }

  .username {
    display: none;
  }

  .user-details {
    display: none;
  }

  .user-info {
    padding: 6px 8px;
    gap: 8px;
  }

  .user-avatar {
    margin: 0;
  }

  .user-dropdown-menu {
    min-width: 240px;
  }

  .dropdown-header {
    padding: 16px 12px;
  }

  .header-avatar {
    width: 40px;
    height: 40px;
  }

  .header-name {
    font-size: 14px;
  }

  .header-email {
    font-size: 12px;
  }
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar,
.content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track,
.content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb,
.content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover,
.content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style> 