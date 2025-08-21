<template>
  <div class="cluster-list">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">集群列表</h1>
        <p class="page-description">管理系统中的所有集群节点</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <PlusOutlined />
          </template>
          添加集群
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="集群名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入集群名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="active">运行中</a-select-option>
            <a-select-option value="inactive">已停止</a-select-option>
            <a-select-option value="maintenance">维护中</a-select-option>
            <a-select-option value="error">错误</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="类型">
          <a-select
            v-model:value="searchForm.type"
            placeholder="请选择类型"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="kubernetes">Kubernetes</a-select-option>
            <a-select-option value="docker">Docker Swarm</a-select-option>
            <a-select-option value="nomad">Nomad</a-select-option>
            <a-select-option value="custom">自定义</a-select-option>
          </a-select>
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

    <!-- 集群列表表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="clusterList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getClusterStatusColor(record.status)">
              {{ getClusterStatusText(record.status) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getClusterTypeColor(record.type)">
              {{ getClusterTypeText(record.type) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'nodes'">
            <div class="nodes-info">
              <span class="node-count">{{ record.nodeCount }} 个节点</span>
              <a-progress
                :percent="record.healthyNodeRate"
                :status="getProgressStatus(record.healthyNodeRate)"
                size="small"
                style="margin-top: 4px"
              />
            </div>
          </template>
          
          <template v-else-if="column.key === 'resources'">
            <div class="resources-info">
              <div class="resource-item">
                <span class="resource-label">CPU:</span>
                <span class="resource-value">{{ record.cpuUsage }}%</span>
              </div>
              <div class="resource-item">
                <span class="resource-label">内存:</span>
                <span class="resource-value">{{ record.memoryUsage }}%</span>
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                <template #icon>
                  <EyeOutlined />
                </template>
                查看
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleNodes(record)">
                <template #icon>
                  <ClusterOutlined />
                </template>
                节点
              </a-button>
              <a-dropdown>
                <a-button type="link" size="small">
                  <template #icon>
                    <MoreOutlined />
                  </template>
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="start" @click="handleStart(record.id)" v-if="record.status !== 'active'">
                      <PlayCircleOutlined />
                      启动
                    </a-menu-item>
                    <a-menu-item key="stop" @click="handleStop(record.id)" v-if="record.status === 'active'">
                      <PauseCircleOutlined />
                      停止
                    </a-menu-item>
                    <a-menu-item key="restart" @click="handleRestart(record.id)">
                      <ReloadOutlined />
                      重启
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" @click="handleDelete(record)" danger>
                      <DeleteOutlined />
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑集群模态框 -->
    <a-modal
      v-model:open="showAddModal"
      :title="editingCluster ? '编辑集群' : '添加集群'"
      @ok="handleSave"
      @cancel="handleCancel"
      width="800px"
    >
      <a-form
        ref="formRef"
        :model="clusterForm"
        :rules="rules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="集群名称" name="name">
              <a-input v-model:value="clusterForm.name" placeholder="请输入集群名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="集群类型" name="type">
              <a-select v-model:value="clusterForm.type" placeholder="请选择集群类型">
                <a-select-option value="kubernetes">Kubernetes</a-select-option>
                <a-select-option value="docker">Docker Swarm</a-select-option>
                <a-select-option value="nomad">Nomad</a-select-option>
                <a-select-option value="custom">自定义</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="API地址" name="apiUrl">
              <a-input v-model:value="clusterForm.apiUrl" placeholder="请输入API地址" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="端口" name="port">
              <a-input-number v-model:value="clusterForm.port" placeholder="端口" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="clusterForm.username" placeholder="请输入用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="密码" name="password">
              <a-input-password v-model:value="clusterForm.password" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="clusterForm.description" placeholder="请输入集群描述" :rows="3" />
        </a-form-item>
        
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="clusterForm.tags"
            mode="tags"
            placeholder="请输入标签"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 集群详情模态框 -->
    <a-modal
      v-model:open="showDetailModal"
      title="集群详情"
      :footer="null"
      width="900px"
    >
      <div v-if="selectedCluster" class="cluster-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="集群名称">{{ selectedCluster.name }}</a-descriptions-item>
          <a-descriptions-item label="集群类型">
            <a-tag :color="getClusterTypeColor(selectedCluster.type)">
              {{ getClusterTypeText(selectedCluster.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getClusterStatusColor(selectedCluster.status)">
              {{ getClusterStatusText(selectedCluster.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="API地址">{{ selectedCluster.apiUrl }}</a-descriptions-item>
          <a-descriptions-item label="节点数量">{{ selectedCluster.nodeCount }} 个</a-descriptions-item>
          <a-descriptions-item label="健康节点率">
            <a-progress :percent="selectedCluster.healthyNodeRate" :status="getProgressStatus(selectedCluster.healthyNodeRate)" />
          </a-descriptions-item>
          <a-descriptions-item label="CPU使用率">
            <a-progress :percent="selectedCluster.cpuUsage" :status="getProgressStatus(selectedCluster.cpuUsage)" />
          </a-descriptions-item>
          <a-descriptions-item label="内存使用率">
            <a-progress :percent="selectedCluster.memoryUsage" :status="getProgressStatus(selectedCluster.memoryUsage)" />
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">{{ selectedCluster.createTime }}</a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">{{ selectedCluster.description || '暂无描述' }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <!-- 节点管理模态框 -->
    <a-modal
      v-model:open="showNodesModal"
      title="节点管理"
      :footer="null"
      width="1000px"
    >
      <div v-if="selectedCluster" class="nodes-management">
        <div class="nodes-header">
          <h3>{{ selectedCluster.name }} - 节点列表</h3>
          <a-button type="primary" size="small" @click="showAddNodeModal = true">
            <template #icon>
              <PlusOutlined />
            </template>
            添加节点
          </a-button>
        </div>
        
        <a-table
          :columns="nodeColumns"
          :data-source="selectedCluster.nodes"
          :pagination="false"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getNodeStatusColor(record.status)">
                {{ getNodeStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'role'">
              <a-tag :color="record.role === 'master' ? 'blue' : 'green'">
                {{ record.role === 'master' ? '主节点' : '工作节点' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'resources'">
              <div class="node-resources">
                <div>CPU: {{ record.cpuUsage }}%</div>
                <div>内存: {{ record.memoryUsage }}%</div>
              </div>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleNodeDetails(record)">
                  详情
                </a-button>
                <a-button type="link" size="small" @click="handleNodeRestart(record.id)">
                  重启
                </a-button>
                <a-popconfirm
                  title="确定要删除这个节点吗？"
                  @confirm="handleNodeDelete(record.id)"
                >
                  <a-button type="link" size="small" danger>
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  ClusterOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons-vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  type: ''
})

// 集群表单
const clusterForm = reactive({
  name: '',
  type: '',
  apiUrl: '',
  port: 6443,
  username: '',
  password: '',
  description: '',
  tags: []
})

// 表格列定义
const columns = [
  {
    title: '集群名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '类型',
    key: 'type',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '节点',
    key: 'nodes',
    width: 150
  },
  {
    title: '资源使用',
    key: 'resources',
    width: 150
  },
  {
    title: 'API地址',
    dataIndex: 'apiUrl',
    key: 'apiUrl',
    width: 200
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
    width: 200
  }
]

// 节点表格列定义
const nodeColumns = [
  {
    title: '节点名称',
    dataIndex: 'name',
    key: 'name',
    width: 120
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 120
  },
  {
    title: '角色',
    key: 'role',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '资源使用',
    key: 'resources',
    width: 120
  },
  {
    title: '操作系统',
    dataIndex: 'os',
    key: 'os',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
]

// 响应式数据
const loading = ref(false)
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showNodesModal = ref(false)
const showAddNodeModal = ref(false)
const editingCluster = ref<any>(null)
const selectedCluster = ref<any>(null)
const formRef = ref()

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 模拟集群数据
const clusterList = ref([
  {
    id: '1',
    name: '生产集群',
    type: 'kubernetes',
    status: 'active',
    apiUrl: 'https://k8s-prod.example.com',
    port: 6443,
    nodeCount: 8,
    healthyNodeRate: 87.5,
    cpuUsage: 65,
    memoryUsage: 72,
    createTime: '2024-01-15 10:30:00',
    description: '生产环境Kubernetes集群',
    nodes: [
      {
        id: 'node-1',
        name: 'master-01',
        ip: '192.168.1.10',
        role: 'master',
        status: 'online',
        cpuUsage: 45,
        memoryUsage: 60,
        os: 'Ubuntu 20.04'
      },
      {
        id: 'node-2',
        name: 'worker-01',
        ip: '192.168.1.11',
        role: 'worker',
        status: 'online',
        cpuUsage: 78,
        memoryUsage: 85,
        os: 'Ubuntu 20.04'
      }
    ]
  },
  {
    id: '2',
    name: '测试集群',
    type: 'docker',
    status: 'active',
    apiUrl: 'https://docker-test.example.com',
    port: 2376,
    nodeCount: 3,
    healthyNodeRate: 100,
    cpuUsage: 35,
    memoryUsage: 45,
    createTime: '2024-01-16 14:20:00',
    description: '测试环境Docker Swarm集群',
    nodes: [
      {
        id: 'node-3',
        name: 'manager-01',
        ip: '192.168.1.20',
        role: 'master',
        status: 'online',
        cpuUsage: 30,
        memoryUsage: 40,
        os: 'CentOS 7'
      }
    ]
  },
  {
    id: '3',
    name: '开发集群',
    type: 'nomad',
    status: 'maintenance',
    apiUrl: 'https://nomad-dev.example.com',
    port: 4646,
    nodeCount: 5,
    healthyNodeRate: 60,
    cpuUsage: 25,
    memoryUsage: 30,
    createTime: '2024-01-17 09:15:00',
    description: '开发环境Nomad集群',
    nodes: []
  }
])

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入集群名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择集群类型', trigger: 'change' }],
  apiUrl: [{ required: true, message: '请输入API地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }]
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  fetchClusterList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: '',
    type: ''
  })
  handleSearch()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchClusterList()
}

// 查看集群详情
const handleView = (record: any) => {
  selectedCluster.value = record
  showDetailModal.value = true
}

// 编辑集群
const handleEdit = (record: any) => {
  editingCluster.value = record
  Object.assign(clusterForm, {
    name: record.name,
    type: record.type,
    apiUrl: record.apiUrl,
    port: record.port,
    username: '',
    password: '',
    description: record.description,
    tags: []
  })
  showAddModal.value = true
}

// 节点管理
const handleNodes = (record: any) => {
  selectedCluster.value = record
  showNodesModal.value = true
}

// 启动集群
const handleStart = async (id: string) => {
  try {
    message.success('集群启动命令已发送')
    fetchClusterList()
  } catch (error) {
    message.error('启动集群失败')
  }
}

// 停止集群
const handleStop = async (id: string) => {
  try {
    message.success('集群停止命令已发送')
    fetchClusterList()
  } catch (error) {
    message.error('停止集群失败')
  }
}

// 重启集群
const handleRestart = async (id: string) => {
  try {
    message.success('集群重启命令已发送')
    fetchClusterList()
  } catch (error) {
    message.error('重启集群失败')
  }
}

// 删除集群
const handleDelete = async (record: any) => {
  try {
    message.success('删除成功')
    fetchClusterList()
  } catch (error) {
    message.error('删除失败')
  }
}

// 保存集群
const handleSave = async () => {
  try {
    await formRef.value.validate()
    message.success(editingCluster.value ? '更新成功' : '添加成功')
    showAddModal.value = false
    fetchClusterList()
  } catch (error) {
    message.error('保存失败')
  }
}

// 取消操作
const handleCancel = () => {
  showAddModal.value = false
  editingCluster.value = null
  Object.assign(clusterForm, {
    name: '',
    type: '',
    apiUrl: '',
    port: 6443,
    username: '',
    password: '',
    description: '',
    tags: []
  })
  formRef.value?.resetFields()
}

// 节点相关操作
const handleNodeDetails = (node: any) => {
  message.info(`查看节点详情: ${node.name}`)
}

const handleNodeRestart = async (id: string) => {
  try {
    message.success('节点重启命令已发送')
  } catch (error) {
    message.error('重启节点失败')
  }
}

const handleNodeDelete = async (id: string) => {
  try {
    message.success('节点删除成功')
  } catch (error) {
    message.error('删除节点失败')
  }
}

// 获取集群状态颜色
const getClusterStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'green',
    inactive: 'red',
    maintenance: 'orange',
    error: 'red'
  }
  return colors[status] || 'default'
}

// 获取集群状态文本
const getClusterStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '运行中',
    inactive: '已停止',
    maintenance: '维护中',
    error: '错误'
  }
  return texts[status] || status
}

// 获取集群类型颜色
const getClusterTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    kubernetes: 'blue',
    docker: 'green',
    nomad: 'purple',
    custom: 'orange'
  }
  return colors[type] || 'default'
}

// 获取集群类型文本
const getClusterTypeText = (type: string) => {
  const texts: Record<string, string> = {
    kubernetes: 'Kubernetes',
    docker: 'Docker Swarm',
    nomad: 'Nomad',
    custom: '自定义'
  }
  return texts[type] || type
}

// 获取节点状态颜色
const getNodeStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    online: 'green',
    offline: 'red',
    maintenance: 'orange'
  }
  return colors[status] || 'default'
}

// 获取节点状态文本
const getNodeStatusText = (status: string) => {
  const texts: Record<string, string> = {
    online: '在线',
    offline: '离线',
    maintenance: '维护中'
  }
  return texts[status] || status
}

// 获取进度条状态
const getProgressStatus = (value: number) => {
  if (value >= 80) return 'exception'
  if (value >= 60) return 'normal'
  return 'success'
}

// 获取集群列表
const fetchClusterList = async () => {
  loading.value = true
  try {
    // 这里调用获取集群列表API
    // const response = await getClusterList({
    //   page: pagination.current,
    //   pageSize: pagination.pageSize,
    //   ...searchForm
    // })
    // clusterList.value = response.data.list
    // pagination.total = response.data.total
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    message.error('获取集群列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchClusterList()
})
</script>

<style scoped>
.cluster-list {
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

.table-card {
  border-radius: 8px;
}

.nodes-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-count {
  font-size: 12px;
  color: #666;
}

.resources-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.resource-label {
  color: #666;
}

.resource-value {
  color: #333;
  font-weight: 500;
}

.cluster-detail {
  padding: 16px 0;
}

.nodes-management {
  padding: 16px 0;
}

.nodes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nodes-header h3 {
  margin: 0;
  color: #333;
}

.node-resources {
  font-size: 12px;
  color: #666;
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
}
</style> 