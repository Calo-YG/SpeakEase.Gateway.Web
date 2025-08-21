<template>
  <div class="system-log">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">系统日志</h1>
        <p class="page-description">查看系统运行日志和操作记录</p>
      </div>
      <div class="header-right">
        <a-space>
          <a-button @click="handleRefresh">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
          <a-button @click="handleExport">
            <template #icon>
              <DownloadOutlined />
            </template>
            导出日志
          </a-button>
          <a-button type="primary" @click="handleClearLogs">
            <template #icon>
              <DeleteOutlined />
            </template>
            清空日志
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="日志级别">
          <a-select
            v-model:value="searchForm.level"
            placeholder="请选择日志级别"
            allow-clear
            style="width: 120px"
          >
            <a-select-option value="debug">Debug</a-select-option>
            <a-select-option value="info">Info</a-select-option>
            <a-select-option value="warn">Warning</a-select-option>
            <a-select-option value="error">Error</a-select-option>
            <a-select-option value="fatal">Fatal</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="日志类型">
          <a-select
            v-model:value="searchForm.type"
            placeholder="请选择日志类型"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="system">系统日志</a-select-option>
            <a-select-option value="access">访问日志</a-select-option>
            <a-select-option value="error">错误日志</a-select-option>
            <a-select-option value="security">安全日志</a-select-option>
            <a-select-option value="operation">操作日志</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="searchForm.timeRange"
            :show-time="true"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 300px"
          />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="请输入关键词"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            搜索
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">
            <template #icon>
              <ReloadOutlined />
            </template>
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 日志统计卡片 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon info-icon">
                <InfoCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ logStats.total }}</div>
                <div class="stat-label">总日志数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon error-icon">
                <ExclamationCircleOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ logStats.error }}</div>
                <div class="stat-label">错误日志</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon warn-icon">
                <WarningOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ logStats.warning }}</div>
                <div class="stat-label">警告日志</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon today-icon">
                <CalendarOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ logStats.today }}</div>
                <div class="stat-label">今日日志</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 日志列表 -->
    <a-card class="log-card">
      <a-table
        :columns="columns"
        :data-source="logList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="getLogLevelColor(record.level)">
              {{ getLogLevelText(record.level) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getLogTypeColor(record.type)">
              {{ getLogTypeText(record.type) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'message'">
            <div class="log-message">
              <span class="message-text">{{ record.message }}</span>
              <a-button 
                v-if="record.message.length > 50" 
                type="link" 
                size="small" 
                @click="handleViewDetail(record)"
              >
                查看详情
              </a-button>
            </div>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleViewDetail(record)">
                <template #icon>
                  <EyeOutlined />
                </template>
                详情
              </a-button>
              <a-button type="link" size="small" @click="handleCopyLog(record)">
                <template #icon>
                  <CopyOutlined />
                </template>
                复制
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 日志详情模态框 -->
    <a-modal
      v-model:open="showDetailModal"
      title="日志详情"
      :footer="null"
      width="800px"
    >
      <div v-if="selectedLog" class="log-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="日志ID">{{ selectedLog.id }}</a-descriptions-item>
          <a-descriptions-item label="时间">{{ selectedLog.timestamp }}</a-descriptions-item>
          <a-descriptions-item label="级别">
            <a-tag :color="getLogLevelColor(selectedLog.level)">
              {{ getLogLevelText(selectedLog.level) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="类型">
            <a-tag :color="getLogTypeColor(selectedLog.type)">
              {{ getLogTypeText(selectedLog.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="模块">{{ selectedLog.module }}</a-descriptions-item>
          <a-descriptions-item label="用户">{{ selectedLog.user || '系统' }}</a-descriptions-item>
          <a-descriptions-item label="IP地址">{{ selectedLog.ip || 'N/A' }}</a-descriptions-item>
          <a-descriptions-item label="用户代理">{{ selectedLog.userAgent || 'N/A' }}</a-descriptions-item>
          <a-descriptions-item label="消息" :span="2">
            <div class="detail-message">{{ selectedLog.message }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="堆栈信息" :span="2" v-if="selectedLog.stackTrace">
            <pre class="stack-trace">{{ selectedLog.stackTrace }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="额外数据" :span="2" v-if="selectedLog.extraData">
            <pre class="extra-data">{{ JSON.stringify(selectedLog.extraData, null, 2) }}</pre>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <!-- 清空日志确认对话框 -->
    <a-modal
      v-model:open="showClearModal"
      title="确认清空日志"
      @ok="confirmClearLogs"
      @cancel="showClearModal = false"
    >
      <p>确定要清空所有日志吗？此操作不可恢复。</p>
      <a-checkbox v-model:checked="clearConfirm">我确认要清空所有日志</a-checkbox>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CalendarOutlined
} from '@ant-design/icons-vue'

// 搜索表单
const searchForm = reactive({
  level: '',
  type: '',
  timeRange: [],
  keyword: ''
})

// 响应式数据
const loading = ref(false)
const showDetailModal = ref(false)
const showClearModal = ref(false)
const clearConfirm = ref(false)
const selectedLog = ref<any>(null)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 日志统计数据
const logStats = reactive({
  total: 12580,
  error: 156,
  warning: 89,
  today: 234
})

// 表格列定义
const columns = [
  {
    title: '时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: 180,
    sorter: true
  },
  {
    title: '级别',
    key: 'level',
    width: 100,
    filters: [
      { text: 'Debug', value: 'debug' },
      { text: 'Info', value: 'info' },
      { text: 'Warning', value: 'warn' },
      { text: 'Error', value: 'error' },
      { text: 'Fatal', value: 'fatal' }
    ]
  },
  {
    title: '类型',
    key: 'type',
    width: 120,
    filters: [
      { text: '系统日志', value: 'system' },
      { text: '访问日志', value: 'access' },
      { text: '错误日志', value: 'error' },
      { text: '安全日志', value: 'security' },
      { text: '操作日志', value: 'operation' }
    ]
  },
  {
    title: '模块',
    dataIndex: 'module',
    key: 'module',
    width: 120
  },
  {
    title: '消息',
    key: 'message',
    width: 300
  },
  {
    title: '用户',
    dataIndex: 'user',
    key: 'user',
    width: 100
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right'
  }
]

// 模拟日志数据
const logList = ref([
  {
    id: '1',
    timestamp: '2024-01-20 14:30:25',
    level: 'error',
    type: 'system',
    module: 'Gateway',
    message: '数据库连接失败: Connection timeout after 30 seconds',
    user: 'admin',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    stackTrace: 'Error: Connection timeout\n    at Database.connect (/app/db.js:45:12)\n    at Gateway.start (/app/gateway.js:23:8)',
    extraData: { retryCount: 3, timeout: 30000 }
  },
  {
    id: '2',
    timestamp: '2024-01-20 14:29:15',
    level: 'warn',
    type: 'security',
    module: 'Auth',
    message: '用户登录失败次数过多，IP已被临时封禁',
    user: 'unknown',
    ip: '203.208.60.1',
    userAgent: 'Mozilla/5.0 (compatible; Bot/1.0)',
    extraData: { failedAttempts: 10, banDuration: 3600 }
  },
  {
    id: '3',
    timestamp: '2024-01-20 14:28:45',
    level: 'info',
    type: 'access',
    module: 'API',
    message: 'API请求成功: GET /api/v1/users',
    user: 'user123',
    ip: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    extraData: { responseTime: 125, statusCode: 200 }
  },
  {
    id: '4',
    timestamp: '2024-01-20 14:27:30',
    level: 'info',
    type: 'operation',
    module: 'User',
    message: '用户创建成功: user@example.com',
    user: 'admin',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    extraData: { userId: 'user_456', email: 'user@example.com' }
  },
  {
    id: '5',
    timestamp: '2024-01-20 14:26:20',
    level: 'debug',
    type: 'system',
    module: 'Cache',
    message: '缓存更新: user_profile_123',
    user: 'system',
    ip: '127.0.0.1',
    extraData: { cacheKey: 'user_profile_123', ttl: 3600 }
  }
])

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  fetchLogList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    level: '',
    type: '',
    timeRange: [],
    keyword: ''
  })
  handleSearch()
}

// 表格变化处理
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchLogList()
}

// 查看日志详情
const handleViewDetail = (record: any) => {
  selectedLog.value = record
  showDetailModal.value = true
}

// 复制日志
const handleCopyLog = async (record: any) => {
  try {
    const logText = `[${record.timestamp}] [${record.level.toUpperCase()}] [${record.module}] ${record.message}`
    await navigator.clipboard.writeText(logText)
    message.success('日志已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

// 刷新日志
const handleRefresh = () => {
  fetchLogList()
  fetchLogStats()
}

// 导出日志
const handleExport = () => {
  message.info('日志导出功能开发中...')
}

// 清空日志
const handleClearLogs = () => {
  showClearModal.value = true
}

// 确认清空日志
const confirmClearLogs = async () => {
  if (!clearConfirm.value) {
    message.warning('请先确认清空操作')
    return
  }
  
  try {
    // 这里调用清空日志API
    // await clearAllLogs()
    message.success('日志清空成功')
    showClearModal.value = false
    clearConfirm.value = false
    fetchLogList()
    fetchLogStats()
  } catch (error) {
    message.error('清空日志失败')
  }
}

// 获取日志级别颜色
const getLogLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    debug: 'blue',
    info: 'green',
    warn: 'orange',
    error: 'red',
    fatal: 'red'
  }
  return colors[level] || 'default'
}

// 获取日志级别文本
const getLogLevelText = (level: string) => {
  const texts: Record<string, string> = {
    debug: 'Debug',
    info: 'Info',
    warn: 'Warning',
    error: 'Error',
    fatal: 'Fatal'
  }
  return texts[level] || level
}

// 获取日志类型颜色
const getLogTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    system: 'blue',
    access: 'green',
    error: 'red',
    security: 'orange',
    operation: 'purple'
  }
  return colors[type] || 'default'
}

// 获取日志类型文本
const getLogTypeText = (type: string) => {
  const texts: Record<string, string> = {
    system: '系统日志',
    access: '访问日志',
    error: '错误日志',
    security: '安全日志',
    operation: '操作日志'
  }
  return texts[type] || type
}

// 获取日志列表
const fetchLogList = async () => {
  loading.value = true
  try {
    // 这里调用获取日志列表API
    // const response = await getLogList({
    //   page: pagination.current,
    //   pageSize: pagination.pageSize,
    //   ...searchForm
    // })
    // logList.value = response.data.list
    // pagination.total = response.data.total
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    message.error('获取日志列表失败')
  } finally {
    loading.value = false
  }
}

// 获取日志统计
const fetchLogStats = async () => {
  try {
    // 这里调用获取日志统计API
    // const response = await getLogStats()
    // Object.assign(logStats, response.data)
  } catch (error) {
    message.error('获取日志统计失败')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchLogList()
  fetchLogStats()
})
</script>

<style scoped>
.system-log {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.search-card {
  margin-bottom: 24px;
  border-radius: 8px;
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

.info-icon {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.error-icon {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
}

.warn-icon {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
}

.today-icon {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
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

.log-card {
  border-radius: 8px;
}

.log-message {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-detail {
  padding: 16px 0;
}

.detail-message {
  word-break: break-all;
  white-space: pre-wrap;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
}

.stack-trace,
.extra-data {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    align-self: flex-start;
  }
  
  .search-card :deep(.ant-form-item) {
    margin-bottom: 12px;
  }
  
  .stats-cards .ant-col {
    margin-bottom: 16px;
  }
}
</style> 