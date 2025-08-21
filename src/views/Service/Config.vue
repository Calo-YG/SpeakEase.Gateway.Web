<template>
  <div class="service-config">
    <div class="page-header">
      <h1 class="page-title">服务配置</h1>
      <p class="page-description">配置服务的各项参数和设置</p>
    </div>
    
    <div class="config-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <a-button type="primary" @click="showAddModal">
          <template #icon><PlusOutlined /></template>
          添加服务
        </a-button>
        <a-button @click="refreshServices">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>

      <!-- 服务列表 -->
      <a-table
        :columns="columns"
        :data-source="services"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'health'">
            <a-progress
              :percent="record.health"
              :status="getHealthStatus(record.health)"
              size="small"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editService(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="viewDetails(record)">
                详情
              </a-button>
              <a-popconfirm
                title="确定要删除这个服务吗？"
                @confirm="deleteService(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 添加/编辑服务模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="服务名称" name="name">
              <a-input v-model:value="formData.name" placeholder="请输入服务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="服务类型" name="type">
              <a-select v-model:value="formData.type" placeholder="请选择服务类型">
                <a-select-option value="http">HTTP</a-select-option>
                <a-select-option value="https">HTTPS</a-select-option>
                <a-select-option value="grpc">gRPC</a-select-option>
                <a-select-option value="websocket">WebSocket</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="主机地址" name="host">
              <a-input v-model:value="formData.host" placeholder="请输入主机地址" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="端口" name="port">
              <a-input-number
                v-model:value="formData.port"
                :min="1"
                :max="65535"
                placeholder="请输入端口"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="服务路径" name="path">
          <a-input v-model:value="formData.path" placeholder="请输入服务路径" />
        </a-form-item>

        <a-form-item label="超时时间(秒)" name="timeout">
          <a-input-number
            v-model:value="formData.timeout"
            :min="1"
            :max="300"
            placeholder="请输入超时时间"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="重试次数" name="retries">
          <a-input-number
            v-model:value="formData.retries"
            :min="0"
            :max="10"
            placeholder="请输入重试次数"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="负载均衡策略" name="loadBalancer">
          <a-select v-model:value="formData.loadBalancer" placeholder="请选择负载均衡策略">
            <a-select-option value="round-robin">轮询</a-select-option>
            <a-select-option value="least-connections">最少连接</a-select-option>
            <a-select-option value="ip-hash">IP哈希</a-select-option>
            <a-select-option value="weighted">权重</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="健康检查" name="healthCheck">
          <a-switch v-model:checked="formData.healthCheck" />
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="3"
            placeholder="请输入服务描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 服务详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="服务详情"
      @cancel="detailModalVisible = false"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedService" class="service-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="服务名称">{{ selectedService.name }}</a-descriptions-item>
          <a-descriptions-item label="服务类型">{{ selectedService.type }}</a-descriptions-item>
          <a-descriptions-item label="主机地址">{{ selectedService.host }}</a-descriptions-item>
          <a-descriptions-item label="端口">{{ selectedService.port }}</a-descriptions-item>
          <a-descriptions-item label="服务路径">{{ selectedService.path }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(selectedService.status)">
              {{ getStatusText(selectedService.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="健康度">
            <a-progress
              :percent="selectedService.health"
              :status="getHealthStatus(selectedService.health)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="负载均衡">{{ selectedService.loadBalancer }}</a-descriptions-item>
          <a-descriptions-item label="超时时间">{{ selectedService.timeout }}秒</a-descriptions-item>
          <a-descriptions-item label="重试次数">{{ selectedService.retries }}</a-descriptions-item>
          <a-descriptions-item label="健康检查">
            <a-tag :color="selectedService.healthCheck ? 'green' : 'red'">
              {{ selectedService.healthCheck ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">{{ selectedService.createTime }}</a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">{{ selectedService.description }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'

// 服务接口定义
interface Service {
  id: string
  name: string
  type: string
  host: string
  port: number
  path: string
  status: string
  health: number
  timeout: number
  retries: number
  loadBalancer: string
  healthCheck: boolean
  description: string
  createTime: string
}

// 响应式数据
const loading = ref(false)
const services = ref<Service[]>([])
const modalVisible = ref(false)
const detailModalVisible = ref(false)
const selectedService = ref<Service | null>(null)
const isEdit = ref(false)

// 表单数据
const formRef = ref()
const formData = reactive({
  id: '',
  name: '',
  type: 'http',
  host: '',
  port: 80,
  path: '/',
  timeout: 30,
  retries: 3,
  loadBalancer: 'round-robin',
  healthCheck: true,
  description: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入服务名称' }],
  type: [{ required: true, message: '请选择服务类型' }],
  host: [{ required: true, message: '请输入主机地址' }],
  port: [{ required: true, message: '请输入端口' }],
  path: [{ required: true, message: '请输入服务路径' }],
  timeout: [{ required: true, message: '请输入超时时间' }],
  retries: [{ required: true, message: '请输入重试次数' }],
  loadBalancer: [{ required: true, message: '请选择负载均衡策略' }]
}

// 表格列定义
const columns = [
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
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    width: 200,
    customRender: ({ record }: { record: Service }) => `${record.host}:${record.port}${record.path}`
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
    title: '负载均衡',
    dataIndex: 'loadBalancer',
    key: 'loadBalancer',
    width: 120
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

// 计算属性
const modalTitle = computed(() => isEdit.value ? '编辑服务' : '添加服务')

// 方法
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'green',
    inactive: 'red',
    pending: 'orange',
    error: 'red'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '运行中',
    inactive: '已停止',
    pending: '启动中',
    error: '错误'
  }
  return texts[status] || status
}

const getHealthStatus = (health: number) => {
  if (health >= 80) return 'success'
  if (health >= 60) return 'normal'
  if (health >= 40) return 'exception'
  return 'exception'
}

const showAddModal = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

const editService = (service: Service) => {
  isEdit.value = true
  Object.assign(formData, service)
  modalVisible.value = true
}

const viewDetails = (service: Service) => {
  selectedService.value = service
  detailModalVisible.value = true
}

const deleteService = async (id: string) => {
  try {
    // 这里应该调用删除API
    message.success('删除成功')
    await loadServices()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    // 这里应该调用保存API
    message.success(isEdit.value ? '更新成功' : '添加成功')
    modalVisible.value = false
    await loadServices()
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
    type: 'http',
    host: '',
    port: 80,
    path: '/',
    timeout: 30,
    retries: 3,
    loadBalancer: 'round-robin',
    healthCheck: true,
    description: ''
  })
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadServices()
}

const refreshServices = () => {
  loadServices()
}

const loadServices = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    services.value = [
      {
        id: '1',
        name: '用户服务',
        type: 'http',
        host: '192.168.1.100',
        port: 8080,
        path: '/api/users',
        status: 'active',
        health: 95,
        timeout: 30,
        retries: 3,
        loadBalancer: 'round-robin',
        healthCheck: true,
        description: '用户管理服务',
        createTime: '2024-01-15 10:30:00'
      },
      {
        id: '2',
        name: '订单服务',
        type: 'https',
        host: '192.168.1.101',
        port: 8443,
        path: '/api/orders',
        status: 'active',
        health: 88,
        timeout: 30,
        retries: 3,
        loadBalancer: 'least-connections',
        healthCheck: true,
        description: '订单管理服务',
        createTime: '2024-01-15 11:00:00'
      },
      {
        id: '3',
        name: '支付服务',
        type: 'grpc',
        host: '192.168.1.102',
        port: 9090,
        path: '/payment',
        status: 'error',
        health: 45,
        timeout: 30,
        retries: 3,
        loadBalancer: 'ip-hash',
        healthCheck: true,
        description: '支付处理服务',
        createTime: '2024-01-15 12:00:00'
      }
    ]
    
    pagination.total = services.value.length
  } catch (error) {
    message.error('加载服务列表失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadServices()
})
</script>

<style scoped>
.service-config {
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

.service-detail {
  padding: 16px 0;
}
</style> 