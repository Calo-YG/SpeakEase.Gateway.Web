<template>
  <div class="service-list">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">服务列表</h1>
        <p class="page-description">管理系统中的所有服务</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <PlusOutlined />
          </template>
          添加服务
        </a-button>
      </div>
    </div>

    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="serviceList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="serviceId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleView(record)">
                <template #icon>
                  <EyeOutlined />
                </template>
                查看
              </a-button>
              <a-popconfirm
                title="确定要删除这个服务吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

// 表格列定义
const columns = [
  {
    title: '服务名称',
    dataIndex: 'serviceName',
    key: 'serviceName'
  },
  {
    title: '服务地址',
    dataIndex: 'serviceUrl',
    key: 'serviceUrl'
  },
  {
    title: '状态',
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
    width: 200
  }
]

// 响应式数据
const loading = ref(false)
const showAddModal = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 模拟服务数据
const serviceList = ref([
  {
    serviceId: 1,
    serviceName: '用户服务',
    serviceUrl: 'http://localhost:5001',
    status: 'running',
    createTime: '2024-01-15 10:30:00'
  },
  {
    serviceId: 2,
    serviceName: '订单服务',
    serviceUrl: 'http://localhost:5002',
    status: 'stopped',
    createTime: '2024-01-16 14:20:00'
  }
])

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    running: 'green',
    stopped: 'red',
    starting: 'orange',
    stopping: 'orange'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    starting: '启动中',
    stopping: '停止中'
  }
  return textMap[status] || '未知'
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchServiceList()
}

// 编辑服务
const handleEdit = (record: any) => {
  message.info('编辑功能开发中...')
}

// 查看服务
const handleView = (record: any) => {
  message.info('查看功能开发中...')
}

// 删除服务
const handleDelete = async (record: any) => {
  try {
    message.success('删除成功')
    fetchServiceList()
  } catch (error) {
    message.error('删除失败')
  }
}

// 获取服务列表
const fetchServiceList = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    message.error('获取服务列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchServiceList()
})
</script>

<style scoped>
.service-list {
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

.table-card {
  border-radius: 8px;
}
</style> 