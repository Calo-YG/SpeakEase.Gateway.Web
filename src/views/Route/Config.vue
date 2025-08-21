<template>
  <div class="route-config">
    <div class="page-header">
      <h1 class="page-title">路由配置</h1>
      <p class="page-description">配置路由规则和转发策略</p>
    </div>
    
    <div class="config-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <a-button type="primary" @click="showAddModal">
          <template #icon><PlusOutlined /></template>
          添加路由
        </a-button>
        <a-button @click="refreshRoutes">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button @click="batchEnable" :disabled="!hasSelected">
          <template #icon><CheckOutlined /></template>
          批量启用
        </a-button>
        <a-button @click="batchDisable" :disabled="!hasSelected">
          <template #icon><StopOutlined /></template>
          批量禁用
        </a-button>
      </div>

      <!-- 路由列表 -->
      <a-table
        :columns="columns"
        :data-source="routes"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'method'">
            <a-tag :color="getMethodColor(record.method)">
              {{ record.method }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-badge :count="record.priority" :number-style="{ backgroundColor: '#52c41a' }" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editRoute(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="viewDetails(record)">
                详情
              </a-button>
              <a-popconfirm
                title="确定要删除这个路由吗？"
                @confirm="deleteRoute(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 添加/编辑路由模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="700px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="路由名称" name="name">
              <a-input v-model:value="formData.name" placeholder="请输入路由名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="优先级" name="priority">
              <a-input-number
                v-model:value="formData.priority"
                :min="1"
                :max="1000"
                placeholder="请输入优先级"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="请求方法" name="method">
              <a-select v-model:value="formData.method" placeholder="请选择请求方法">
                <a-select-option value="GET">GET</a-select-option>
                <a-select-option value="POST">POST</a-select-option>
                <a-select-option value="PUT">PUT</a-select-option>
                <a-select-option value="DELETE">DELETE</a-select-option>
                <a-select-option value="PATCH">PATCH</a-select-option>
                <a-select-option value="*">ALL</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="18">
            <a-form-item label="路径模式" name="path">
              <a-input v-model:value="formData.path" placeholder="请输入路径模式，如: /api/users/*" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="目标服务" name="targetService">
          <a-select
            v-model:value="formData.targetService"
            placeholder="请选择目标服务"
            show-search
            :filter-option="filterService"
          >
            <a-select-option
              v-for="service in availableServices"
              :key="service.id"
              :value="service.id"
            >
              {{ service.name }} ({{ service.host }}:{{ service.port }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="转发路径" name="forwardPath">
          <a-input v-model:value="formData.forwardPath" placeholder="请输入转发路径，如: /users" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="超时时间(秒)" name="timeout">
              <a-input-number
                v-model:value="formData.timeout"
                :min="1"
                :max="300"
                placeholder="请输入超时时间"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="重试次数" name="retries">
              <a-input-number
                v-model:value="formData.retries"
                :min="0"
                :max="10"
                placeholder="请输入重试次数"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="中间件" name="middlewares">
          <a-select
            v-model:value="formData.middlewares"
            mode="multiple"
            placeholder="请选择中间件"
            style="width: 100%"
          >
            <a-select-option value="auth">认证</a-select-option>
            <a-select-option value="rate-limit">限流</a-select-option>
            <a-select-option value="cors">跨域</a-select-option>
            <a-select-option value="logging">日志</a-select-option>
            <a-select-option value="cache">缓存</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-switch v-model:checked="formData.status" />
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="3"
            placeholder="请输入路由描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 路由详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="路由详情"
      @cancel="detailModalVisible = false"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedRoute" class="route-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="路由名称">{{ selectedRoute.name }}</a-descriptions-item>
          <a-descriptions-item label="优先级">{{ selectedRoute.priority }}</a-descriptions-item>
          <a-descriptions-item label="请求方法">
            <a-tag :color="getMethodColor(selectedRoute.method)">
              {{ selectedRoute.method }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="路径模式">{{ selectedRoute.path }}</a-descriptions-item>
          <a-descriptions-item label="目标服务">{{ selectedRoute.targetServiceName }}</a-descriptions-item>
          <a-descriptions-item label="转发路径">{{ selectedRoute.forwardPath }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(selectedRoute.status)">
              {{ getStatusText(selectedRoute.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="超时时间">{{ selectedRoute.timeout }}秒</a-descriptions-item>
          <a-descriptions-item label="重试次数">{{ selectedRoute.retries }}</a-descriptions-item>
          <a-descriptions-item label="中间件" :span="2">
            <a-space>
              <a-tag v-for="middleware in selectedRoute.middlewares" :key="middleware">
                {{ getMiddlewareText(middleware) }}
              </a-tag>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">{{ selectedRoute.createTime }}</a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">{{ selectedRoute.description }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined, CheckOutlined, StopOutlined } from '@ant-design/icons-vue'

// 路由接口定义
interface Route {
  id: string
  name: string
  method: string
  path: string
  targetService: string
  targetServiceName: string
  forwardPath: string
  priority: number
  status: boolean
  timeout: number
  retries: number
  middlewares: string[]
  description: string
  createTime: string
}

// 服务接口定义
interface Service {
  id: string
  name: string
  host: string
  port: number
}

// 响应式数据
const loading = ref(false)
const routes = ref<Route[]>([])
const availableServices = ref<Service[]>([])
const modalVisible = ref(false)
const detailModalVisible = ref(false)
const selectedRoute = ref<Route | null>(null)
const isEdit = ref(false)
const selectedRowKeys = ref<string[]>([])

// 表单数据
const formRef = ref()
const formData = reactive({
  id: '',
  name: '',
  method: 'GET',
  path: '',
  targetService: '',
  forwardPath: '',
  priority: 100,
  status: true,
  timeout: 30,
  retries: 3,
  middlewares: [],
  description: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入路由名称' }],
  method: [{ required: true, message: '请选择请求方法' }],
  path: [{ required: true, message: '请输入路径模式' }],
  targetService: [{ required: true, message: '请选择目标服务' }],
  forwardPath: [{ required: true, message: '请输入转发路径' }],
  priority: [{ required: true, message: '请输入优先级' }],
  timeout: [{ required: true, message: '请输入超时时间' }],
  retries: [{ required: true, message: '请输入重试次数' }]
}

// 表格列定义
const columns = [
  {
    title: '路由名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '方法',
    dataIndex: 'method',
    key: 'method',
    width: 80
  },
  {
    title: '路径模式',
    dataIndex: 'path',
    key: 'path',
    width: 200
  },
  {
    title: '目标服务',
    dataIndex: 'targetServiceName',
    key: 'targetServiceName',
    width: 150
  },
  {
    title: '转发路径',
    dataIndex: 'forwardPath',
    key: 'forwardPath',
    width: 150
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}

// 计算属性
const modalTitle = computed(() => isEdit.value ? '编辑路由' : '添加路由')
const hasSelected = computed(() => selectedRowKeys.value.length > 0)

// 方法
const getStatusColor = (status: boolean) => {
  return status ? 'green' : 'red'
}

const getStatusText = (status: boolean) => {
  return status ? '启用' : '禁用'
}

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red',
    PATCH: 'purple',
    '*': 'default'
  }
  return colors[method] || 'default'
}

const getMiddlewareText = (middleware: string) => {
  const texts: Record<string, string> = {
    auth: '认证',
    'rate-limit': '限流',
    cors: '跨域',
    logging: '日志',
    cache: '缓存'
  }
  return texts[middleware] || middleware
}

const filterService = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const showAddModal = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

const editRoute = (route: Route) => {
  isEdit.value = true
  Object.assign(formData, route)
  modalVisible.value = true
}

const viewDetails = (route: Route) => {
  selectedRoute.value = route
  detailModalVisible.value = true
}

const deleteRoute = async (id: string) => {
  try {
    // 这里应该调用删除API
    message.success('删除成功')
    await loadRoutes()
  } catch (error) {
    message.error('删除失败')
  }
}

const batchEnable = async () => {
  try {
    // 这里应该调用批量启用API
    message.success(`已启用 ${selectedRowKeys.value.length} 个路由`)
    selectedRowKeys.value = []
    await loadRoutes()
  } catch (error) {
    message.error('批量启用失败')
  }
}

const batchDisable = async () => {
  try {
    // 这里应该调用批量禁用API
    message.success(`已禁用 ${selectedRowKeys.value.length} 个路由`)
    selectedRowKeys.value = []
    await loadRoutes()
  } catch (error) {
    message.error('批量禁用失败')
  }
}

const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    // 这里应该调用保存API
    message.success(isEdit.value ? '更新成功' : '添加成功')
    modalVisible.value = false
    await loadRoutes()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    method: 'GET',
    path: '',
    targetService: '',
    forwardPath: '',
    priority: 100,
    status: true,
    timeout: 30,
    retries: 3,
    middlewares: [],
    description: ''
  })
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadRoutes()
}

const refreshRoutes = () => {
  loadRoutes()
}

const loadRoutes = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    routes.value = [
      {
        id: '1',
        name: '用户API路由',
        method: 'GET',
        path: '/api/users/*',
        targetService: '1',
        targetServiceName: '用户服务',
        forwardPath: '/users',
        priority: 100,
        status: true,
        timeout: 30,
        retries: 3,
        middlewares: ['auth', 'logging'],
        description: '用户相关API路由',
        createTime: '2024-01-15 10:30:00'
      },
      {
        id: '2',
        name: '订单API路由',
        method: 'POST',
        path: '/api/orders/*',
        targetService: '2',
        targetServiceName: '订单服务',
        forwardPath: '/orders',
        priority: 90,
        status: true,
        timeout: 30,
        retries: 3,
        middlewares: ['auth', 'rate-limit', 'logging'],
        description: '订单相关API路由',
        createTime: '2024-01-15 11:00:00'
      },
      {
        id: '3',
        name: '支付API路由',
        method: 'POST',
        path: '/api/payment/*',
        targetService: '3',
        targetServiceName: '支付服务',
        forwardPath: '/payment',
        priority: 80,
        status: false,
        timeout: 30,
        retries: 3,
        middlewares: ['auth', 'rate-limit', 'cors'],
        description: '支付相关API路由',
        createTime: '2024-01-15 12:00:00'
      }
    ]
    
    pagination.total = routes.value.length
  } catch (error) {
    message.error('加载路由列表失败')
  } finally {
    loading.value = false
  }
}

const loadServices = async () => {
  try {
    // 模拟API调用
    availableServices.value = [
      { id: '1', name: '用户服务', host: '192.168.1.100', port: 8080 },
      { id: '2', name: '订单服务', host: '192.168.1.101', port: 8443 },
      { id: '3', name: '支付服务', host: '192.168.1.102', port: 9090 }
    ]
  } catch (error) {
    message.error('加载服务列表失败')
  }
}

// 生命周期
onMounted(() => {
  loadRoutes()
  loadServices()
})
</script>

<style scoped>
.route-config {
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

.config-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.route-detail {
  padding: 16px 0;
}
</style> 