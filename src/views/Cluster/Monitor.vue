<template>
  <div class="cluster-monitor">
    <div class="page-header">
      <h1 class="page-title">集群监控</h1>
      <p class="page-description">实时监控集群状态和性能指标</p>
    </div>
    
    <div class="monitor-content">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon cpu-icon">
                  <DesktopOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ clusterStats.cpuUsage }}%</div>
                  <div class="stat-label">CPU使用率</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon memory-icon">
                  <DatabaseOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ clusterStats.memoryUsage }}%</div>
                  <div class="stat-label">内存使用率</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon disk-icon">
                  <HddOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ clusterStats.diskUsage }}%</div>
                  <div class="stat-label">磁盘使用率</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon network-icon">
                  <WifiOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ clusterStats.networkUsage }}%</div>
                  <div class="stat-label">网络使用率</div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-card title="CPU使用率趋势" class="chart-card">
              <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #666;">
                图表加载中...
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="内存使用率趋势" class="chart-card">
              <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #666;">
                图表加载中...
              </div>
            </a-card>
          </a-col>
        </a-row>
        
        <a-row :gutter="16" style="margin-top: 16px;">
          <a-col :span="12">
            <a-card title="网络流量趋势" class="chart-card">
              <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #666;">
                图表加载中...
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="请求响应时间" class="chart-card">
              <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #666;">
                图表加载中...
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 节点状态 -->
      <div class="nodes-section">
        <a-card title="节点状态" class="nodes-card">
          <a-table
            :columns="nodeColumns"
            :data-source="nodes"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getNodeStatusColor(record.status)">
                  {{ getNodeStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'cpu'">
                <a-progress
                  :percent="record.cpu"
                  :status="getProgressStatus(record.cpu)"
                  size="small"
                />
              </template>
              <template v-else-if="column.key === 'memory'">
                <a-progress
                  :percent="record.memory"
                  :status="getProgressStatus(record.memory)"
                  size="small"
                />
              </template>
              <template v-else-if="column.key === 'disk'">
                <a-progress
                  :percent="record.disk"
                  :status="getProgressStatus(record.disk)"
                  size="small"
                />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="viewNodeDetails(record)">
                    详情
                  </a-button>
                  <a-button type="link" size="small" @click="restartNode(record.id)">
                    重启
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </div>

      <!-- 服务状态 -->
      <div class="services-section">
        <a-card title="服务状态" class="services-card">
          <a-table
            :columns="serviceColumns"
            :data-source="services"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getServiceStatusColor(record.status)">
                  {{ getServiceStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'health'">
                <a-progress
                  :percent="record.health"
                  :status="getProgressStatus(record.health)"
                  size="small"
                />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="viewServiceDetails(record)">
                    详情
                  </a-button>
                  <a-button type="link" size="small" @click="restartService(record.id)">
                    重启
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </div>
    </div>

    <!-- 节点详情模态框 -->
    <a-modal
      v-model:open="nodeDetailVisible"
      title="节点详情"
      @cancel="nodeDetailVisible = false"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedNode" class="node-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="节点名称">{{ selectedNode.name }}</a-descriptions-item>
          <a-descriptions-item label="IP地址">{{ selectedNode.ip }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getNodeStatusColor(selectedNode.status)">
              {{ getNodeStatusText(selectedNode.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="角色">{{ selectedNode.role }}</a-descriptions-item>
          <a-descriptions-item label="CPU使用率">
            <a-progress :percent="selectedNode.cpu" :status="getProgressStatus(selectedNode.cpu)" />
          </a-descriptions-item>
          <a-descriptions-item label="内存使用率">
            <a-progress :percent="selectedNode.memory" :status="getProgressStatus(selectedNode.memory)" />
          </a-descriptions-item>
          <a-descriptions-item label="磁盘使用率">
            <a-progress :percent="selectedNode.disk" :status="getProgressStatus(selectedNode.disk)" />
          </a-descriptions-item>
          <a-descriptions-item label="网络使用率">
            <a-progress :percent="selectedNode.network" :status="getProgressStatus(selectedNode.network)" />
          </a-descriptions-item>
          <a-descriptions-item label="启动时间" :span="2">{{ selectedNode.startTime }}</a-descriptions-item>
          <a-descriptions-item label="运行时间" :span="2">{{ selectedNode.uptime }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <!-- 服务详情模态框 -->
    <a-modal
      v-model:open="serviceDetailVisible"
      title="服务详情"
      @cancel="serviceDetailVisible = false"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedService" class="service-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="服务名称">{{ selectedService.name }}</a-descriptions-item>
          <a-descriptions-item label="服务类型">{{ selectedService.type }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getServiceStatusColor(selectedService.status)">
              {{ getServiceStatusText(selectedService.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="健康度">
            <a-progress :percent="selectedService.health" :status="getProgressStatus(selectedService.health)" />
          </a-descriptions-item>
          <a-descriptions-item label="实例数量">{{ selectedService.instances }}</a-descriptions-item>
          <a-descriptions-item label="端口">{{ selectedService.port }}</a-descriptions-item>
          <a-descriptions-item label="响应时间">{{ selectedService.responseTime }}ms</a-descriptions-item>
          <a-descriptions-item label="错误率">{{ selectedService.errorRate }}%</a-descriptions-item>
          <a-descriptions-item label="启动时间" :span="2">{{ selectedService.startTime }}</a-descriptions-item>
          <a-descriptions-item label="运行时间" :span="2">{{ selectedService.uptime }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  DesktopOutlined, 
  DatabaseOutlined, 
  HddOutlined, 
  WifiOutlined 
} from '@ant-design/icons-vue'

// 节点接口定义
interface Node {
  id: string
  name: string
  ip: string
  status: string
  role: string
  cpu: number
  memory: number
  disk: number
  network: number
  startTime: string
  uptime: string
}

// 服务接口定义
interface Service {
  id: string
  name: string
  type: string
  status: string
  health: number
  instances: number
  port: number
  responseTime: number
  errorRate: number
  startTime: string
  uptime: string
}

// 响应式数据
const clusterStats = reactive({
  cpuUsage: 65,
  memoryUsage: 78,
  diskUsage: 45,
  networkUsage: 32
})

const nodes = ref<Node[]>([])
const services = ref<Service[]>([])
const nodeDetailVisible = ref(false)
const serviceDetailVisible = ref(false)
const selectedNode = ref<Node | null>(null)
const selectedService = ref<Service | null>(null)

// 图表数据占位符
const chartData = reactive({
  cpu: [45, 52, 48, 61, 65, 72, 68, 75, 70, 65, 58, 62],
  memory: [60, 65, 70, 75, 78, 82, 80, 85, 83, 79, 76, 78],
  network: [25, 30, 28, 35, 32, 40, 38, 45, 42, 38, 35, 32],
  responseTime: [120, 135, 128, 145, 138, 155, 148, 165, 158, 145, 138, 142]
})

// 表格列定义
const nodeColumns = [
  {
    title: '节点名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: 100
  },
  {
    title: 'CPU',
    dataIndex: 'cpu',
    key: 'cpu',
    width: 120
  },
  {
    title: '内存',
    dataIndex: 'memory',
    key: 'memory',
    width: 120
  },
  {
    title: '磁盘',
    dataIndex: 'disk',
    key: 'disk',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
]

const serviceColumns = [
  {
    title: '服务名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '健康度',
    dataIndex: 'health',
    key: 'health',
    width: 120
  },
  {
    title: '实例数',
    dataIndex: 'instances',
    key: 'instances',
    width: 100
  },
  {
    title: '响应时间',
    dataIndex: 'responseTime',
    key: 'responseTime',
    width: 120
  },
  {
    title: '错误率',
    dataIndex: 'errorRate',
    key: 'errorRate',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
]

// 方法
const getNodeStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    online: 'green',
    offline: 'red',
    maintenance: 'orange'
  }
  return colors[status] || 'default'
}

const getNodeStatusText = (status: string) => {
  const texts: Record<string, string> = {
    online: '在线',
    offline: '离线',
    maintenance: '维护中'
  }
  return texts[status] || status
}

const getServiceStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    running: 'green',
    stopped: 'red',
    starting: 'orange',
    error: 'red'
  }
  return colors[status] || 'default'
}

const getServiceStatusText = (status: string) => {
  const texts: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    starting: '启动中',
    error: '错误'
  }
  return texts[status] || status
}

const getProgressStatus = (value: number) => {
  if (value >= 80) return 'exception'
  if (value >= 60) return 'normal'
  return 'success'
}

const viewNodeDetails = (node: Node) => {
  selectedNode.value = node
  nodeDetailVisible.value = true
}

const viewServiceDetails = (service: Service) => {
  selectedService.value = service
  serviceDetailVisible.value = true
}

const restartNode = async (id: string) => {
  try {
    // 这里应该调用重启节点API
    message.success('节点重启命令已发送')
  } catch (error) {
    message.error('重启节点失败')
  }
}

const restartService = async (id: string) => {
  try {
    // 这里应该调用重启服务API
    message.success('服务重启命令已发送')
  } catch (error) {
    message.error('重启服务失败')
  }
}

const loadNodes = async () => {
  try {
    // 模拟API调用
    nodes.value = [
      {
        id: '1',
        name: 'node-01',
        ip: '192.168.1.100',
        status: 'online',
        role: 'master',
        cpu: 65,
        memory: 78,
        disk: 45,
        network: 32,
        startTime: '2024-01-15 08:00:00',
        uptime: '16小时30分钟'
      },
      {
        id: '2',
        name: 'node-02',
        ip: '192.168.1.101',
        status: 'online',
        role: 'worker',
        cpu: 58,
        memory: 72,
        disk: 52,
        network: 28,
        startTime: '2024-01-15 08:30:00',
        uptime: '16小时0分钟'
      },
      {
        id: '3',
        name: 'node-03',
        ip: '192.168.1.102',
        status: 'maintenance',
        role: 'worker',
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0,
        startTime: '2024-01-15 09:00:00',
        uptime: '15小时30分钟'
      }
    ]
  } catch (error) {
    message.error('加载节点信息失败')
  }
}

const loadServices = async () => {
  try {
    // 模拟API调用
    services.value = [
      {
        id: '1',
        name: '用户服务',
        type: 'http',
        status: 'running',
        health: 95,
        instances: 3,
        port: 8080,
        responseTime: 120,
        errorRate: 0.1,
        startTime: '2024-01-15 08:00:00',
        uptime: '16小时30分钟'
      },
      {
        id: '2',
        name: '订单服务',
        type: 'https',
        status: 'running',
        health: 88,
        instances: 2,
        port: 8443,
        responseTime: 145,
        errorRate: 0.2,
        startTime: '2024-01-15 08:30:00',
        uptime: '16小时0分钟'
      },
      {
        id: '3',
        name: '支付服务',
        type: 'grpc',
        status: 'error',
        health: 45,
        instances: 1,
        port: 9090,
        responseTime: 300,
        errorRate: 2.5,
        startTime: '2024-01-15 09:00:00',
        uptime: '15小时30分钟'
      }
    ]
  } catch (error) {
    message.error('加载服务信息失败')
  }
}

const updateStats = () => {
  // 模拟实时数据更新
  clusterStats.cpuUsage = Math.floor(Math.random() * 30) + 50
  clusterStats.memoryUsage = Math.floor(Math.random() * 20) + 70
  clusterStats.diskUsage = Math.floor(Math.random() * 20) + 40
  clusterStats.networkUsage = Math.floor(Math.random() * 30) + 20
}

let statsTimer: NodeJS.Timeout | null = null

// 生命周期
onMounted(() => {
  loadNodes()
  loadServices()
  
  // 启动定时器，每5秒更新一次统计数据
  statsTimer = setInterval(updateStats, 5000) as NodeJS.Timeout
})

onUnmounted(() => {
  if (statsTimer) {
    clearInterval(statsTimer)
  }
})
</script>

<style scoped>
.cluster-monitor {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.monitor-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.cpu-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.memory-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.disk-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.network-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
}

.nodes-section {
  margin-bottom: 24px;
}

.nodes-card {
  border-radius: 8px;
}

.services-section {
  margin-bottom: 24px;
}

.services-card {
  border-radius: 8px;
}

.node-detail,
.service-detail {
  padding: 16px 0;
}
</style> 