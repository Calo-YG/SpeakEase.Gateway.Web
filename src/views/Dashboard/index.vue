<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎回来，{{ userInfo.name }}！</h1>
        <p class="welcome-subtitle">今天是 {{ currentDate }}，祝您工作愉快！</p>
      </div>
      <div class="welcome-avatar">
        <a-avatar :src="userInfo.avatar" :size="80">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <a-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon user-icon">
            <UserOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </a-card>

      <a-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon service-icon">
            <ApiOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.serviceCount }}</div>
            <div class="stat-label">服务总数</div>
          </div>
        </div>
      </a-card>

      <a-card class="stat-card" hoverable>
        <div class="stat-content">
                      <div class="stat-icon route-icon">
              <ForkOutlined />
            </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.routeCount }}</div>
            <div class="stat-label">路由总数</div>
          </div>
        </div>
      </a-card>

      <a-card class="stat-card" hoverable>
        <div class="stat-content">
          <div class="stat-icon cluster-icon">
            <ClusterOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.clusterCount }}</div>
            <div class="stat-label">集群总数</div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <a-card title="系统访问统计" class="chart-card">
        <div class="chart-placeholder">
          <BarChartOutlined class="chart-icon" />
          <p>访问统计图表</p>
        </div>
      </a-card>

      <a-card title="服务状态监控" class="chart-card">
        <div class="chart-placeholder">
          <PieChartOutlined class="chart-icon" />
          <p>服务状态图表</p>
        </div>
      </a-card>
    </div>

    <!-- 最近活动 -->
    <a-card title="最近活动" class="activity-card">
      <a-timeline>
        <a-timeline-item v-for="activity in recentActivities" :key="activity.id">
          <template #dot>
            <component :is="activity.icon" :style="{ color: activity.color }" />
          </template>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  UserOutlined,
  ApiOutlined,
  GroupOutlined,
  ClusterOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LoginOutlined,
  UserAddOutlined,
  SettingOutlined,
  BellOutlined,
  ForkOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.getUserInfo)

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 统计数据
const stats = ref({
  userCount: 1250,
  serviceCount: 89,
  routeCount: 256,
  clusterCount: 12
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '新用户注册',
    time: '2分钟前',
    icon: UserAddOutlined,
    color: '#52c41a'
  },
  {
    id: 2,
    title: '系统配置更新',
    time: '5分钟前',
    icon: SettingOutlined,
    color: '#1890ff'
  },
  {
    id: 3,
    title: '服务重启',
    time: '10分钟前',
    icon: ApiOutlined,
    color: '#faad14'
  },
  {
    id: 4,
    title: '用户登录',
    time: '15分钟前',
    icon: LoginOutlined,
    color: '#722ed1'
  },
  {
    id: 5,
    title: '系统通知',
    time: '30分钟前',
    icon: BellOutlined,
    color: '#eb2f96'
  }
])

// 组件挂载时获取数据
onMounted(() => {
  // 这里可以调用API获取实际的统计数据
  console.log('Dashboard mounted')
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #87CEEB 0%, #D8BFD8 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(135, 206, 235, 0.2);
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.welcome-avatar {
  display: flex;
  align-items: center;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.user-icon {
  background: linear-gradient(135deg, #87CEEB, #5F9EA0);
}

.service-icon {
  background: linear-gradient(135deg, #D8BFD8, #DDA0DD);
}

.route-icon {
  background: linear-gradient(135deg, #98FB98, #90EE90);
}

.cluster-icon {
  background: linear-gradient(135deg, #F0E68C, #DAA520);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 图表区域 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  background: #fafafa;
  border-radius: 8px;
  margin: 16px 0;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
}

/* 活动卡片 */
.activity-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.activity-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-content {
    gap: 12px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .stat-number {
    font-size: 28px;
  }
}
</style> 