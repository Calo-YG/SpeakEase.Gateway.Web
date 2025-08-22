<template>
  <div class="user-list">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">用户列表</h1>
        <p class="page-description">管理系统中的所有用户账户</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <PlusOutlined />
          </template>
          添加用户
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="用户名">
          <a-input
            v-model:value="searchForm.userName"
            placeholder="请输入用户名"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="账号">
          <a-input
            v-model:value="searchForm.account"
            placeholder="请输入账号"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input
            v-model:value="searchForm.email"
            placeholder="请输入邮箱"
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

    <!-- 用户列表表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="userList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="userId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :size="40">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '正常' : '禁用' }}
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
                title="确定要删除这个用户吗？"
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

    <!-- 添加/编辑用户模态框 -->
    <a-modal
      v-model:open="showAddModal"
      :title="editingUser ? '编辑用户' : '添加用户'"
      @ok="handleSave"
      @cancel="handleCancel"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="userName">
              <a-input v-model:value="userForm.userName" placeholder="请输入用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="账号" name="account">
              <a-input v-model:value="userForm.account" placeholder="请输入账号" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="userForm.email" placeholder="请输入邮箱" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select v-model:value="userForm.status" placeholder="请选择状态">
                <a-select-option value="active">正常</a-select-option>
                <a-select-option value="inactive">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="头像" name="avatar">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleAvatarChange"
          >
            <img v-if="userForm.avatar" :src="userForm.avatar" alt="avatar" />
            <div v-else>
              <PlusOutlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        
        <a-form-item v-if="!editingUser" label="密码" name="password">
          <a-input-password v-model:value="userForm.password" placeholder="请输入密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 用户详情模态框 -->
    <a-modal
      v-model:open="showDetailModal"
      title="用户详情"
      :footer="null"
      width="500px"
    >
      <div v-if="selectedUser" class="user-detail">
        <div class="detail-item">
          <div class="detail-label">头像：</div>
          <a-avatar :src="selectedUser.avatar" :size="64">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
        </div>
        <div class="detail-item">
          <div class="detail-label">用户名：</div>
          <div class="detail-value">{{ selectedUser.userName }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">账号：</div>
          <div class="detail-value">{{ selectedUser.account }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">邮箱：</div>
          <div class="detail-value">{{ selectedUser.email }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">状态：</div>
          <div class="detail-value">
            <a-tag :color="selectedUser.status === 'active' ? 'green' : 'red'">
              {{ selectedUser.status === 'active' ? '正常' : '禁用' }}
            </a-tag>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">创建时间：</div>
          <div class="detail-value">{{ selectedUser.createTime }}</div>
        </div>
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
  UserOutlined
} from '@ant-design/icons-vue'
import { UserPageDto, UserPageInput } from '@/api/sysuser/sysuser'
import { getUserList } from '@/api/sysuser/user'

// 搜索表单
const searchForm = reactive({
  userName: '',
  account: '',
  email: ''
})

// 用户表单
const userForm = reactive({
  userName: '',
  account: '',
  email: '',
  password: '',
  avatar: '',
  status: 'active'
})

// 表格列定义
const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80
  },
  {
    title: '用户名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '账号',
    dataIndex: 'account',
    key: 'account'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '创建时间',
    dataIndex: 'createAt',
    key: 'createAt',
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
const showDetailModal = ref(false)
const editingUser = ref<any>(null)
const selectedUser = ref<any>(null)
const fileList = ref([])
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

// 模拟用户数据
const userList = ref<Array<UserPageDto>>([])

// 表单验证规则
const rules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    userName: '',
    account: '',
    email: ''
  })
  handleSearch()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchUserList()
}

// 编辑用户
const handleEdit = (record: any) => {
  editingUser.value = record
  Object.assign(userForm, {
    userName: record.userName,
    account: record.account,
    email: record.email,
    avatar: record.avatar,
    status: record.status,
    password: ''
  })
  showAddModal.value = true
}

// 查看用户详情
const handleView = (record: any) => {
  selectedUser.value = record
  showDetailModal.value = true
}

// 删除用户
const handleDelete = async (record: any) => {
  try {
    // 这里调用删除API
    message.success('删除成功')
    fetchUserList()
  } catch (error) {
    message.error('删除失败')
  }
}

// 保存用户
const handleSave = async () => {
  try {
    await formRef.value.validate()
    // 这里调用保存API
    message.success(editingUser.value ? '更新成功' : '添加成功')
    showAddModal.value = false
    fetchUserList()
  } catch (error) {
    message.error('保存失败')
  }
}

// 取消操作
const handleCancel = () => {
  showAddModal.value = false
  editingUser.value = null
  Object.assign(userForm, {
    userName: '',
    account: '',
    email: '',
    password: '',
    avatar: '',
    status: 'active'
  })
  formRef.value?.resetFields()
}

// 头像上传前处理
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
  }
  return isJpgOrPng && isLt2M
}

// 头像变化处理
const handleAvatarChange = (info: any) => {
  if (info.file.status === 'done') {
    userForm.avatar = info.file.response.url
  }
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true

  let params:UserPageInput = {
    userName: searchForm.userName,
    account: searchForm.account,
    email: searchForm.email,
    pagination: {
      page: pagination.current,
      pageSize: pagination.pageSize,
      order: 'createAt',
      orderBy: 'desc'
    }
  }

  getUserList(params).then((res) => {
    console.log("列表响应",res)
    userList.value = res.data
    pagination.total = res.total
    loading.value = false
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-list {
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

.user-detail {
  padding: 16px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.detail-label {
  width: 100px;
  font-weight: 500;
  color: #333;
}

.detail-value {
  flex: 1;
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