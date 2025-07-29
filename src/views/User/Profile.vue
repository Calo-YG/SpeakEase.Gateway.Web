<template>
  <div class="user-profile">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">个人资料</h1>
      <p class="page-description">管理您的个人信息和账户设置</p>
    </div>

    <div class="profile-content">
      <!-- 基本信息卡片 -->
      <a-card title="基本信息" class="profile-card">
        <a-form
          ref="basicFormRef"
          :model="basicForm"
          :rules="basicRules"
          layout="vertical"
          :label-col="{ span: 24 }"
          :wrapper-col="{ span: 24 }"
        >
          <a-row :gutter="24">
            <a-col :span="16">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="用户名" name="userName">
                    <a-input v-model:value="basicForm.userName" placeholder="请输入用户名" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="账号" name="account">
                    <a-input v-model:value="basicForm.account" placeholder="请输入账号" disabled />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="邮箱" name="email">
                    <a-input v-model:value="basicForm.email" placeholder="请输入邮箱" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="手机号" name="phone">
                    <a-input v-model:value="basicForm.phone" placeholder="请输入手机号" />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-form-item label="个人简介" name="bio">
                <a-textarea
                  v-model:value="basicForm.bio"
                  placeholder="请输入个人简介"
                  :rows="4"
                />
              </a-form-item>
              
              <a-form-item>
                <a-button type="primary" @click="handleSaveBasic" :loading="basicLoading">
                  保存基本信息
                </a-button>
              </a-form-item>
            </a-col>
            
            <a-col :span="8">
              <div class="avatar-section">
                <div class="avatar-wrapper">
                  <a-avatar :src="basicForm.avatar" :size="120">
                    <template #icon>
                      <UserOutlined />
                    </template>
                  </a-avatar>
                  <a-upload
                    v-model:file-list="fileList"
                    list-type="picture-card"
                    :show-upload-list="false"
                    :before-upload="beforeUpload"
                    @change="handleAvatarChange"
                    class="avatar-upload"
                  >
                    <div class="upload-btn">
                      <CameraOutlined />
                      <div>更换头像</div>
                    </div>
                  </a-upload>
                </div>
                <p class="avatar-tip">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
              </div>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <!-- 修改密码卡片 -->
      <a-card title="修改密码" class="profile-card">
        <a-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          layout="vertical"
          :label-col="{ span: 24 }"
          :wrapper-col="{ span: 24 }"
        >
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="当前密码" name="oldPassword">
                <a-input-password
                  v-model:value="passwordForm.oldPassword"
                  placeholder="请输入当前密码"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="新密码" name="newPassword">
                <a-input-password
                  v-model:value="passwordForm.newPassword"
                  placeholder="请输入新密码"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="确认新密码" name="confirmPassword">
                <a-input-password
                  v-model:value="passwordForm.confirmPassword"
                  placeholder="请再次输入新密码"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item>
            <a-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
              修改密码
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 账户安全卡片 -->
      <a-card title="账户安全" class="profile-card">
        <div class="security-items">
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">
                <LockOutlined class="security-icon" />
                登录密码
              </div>
              <div class="security-desc">用于保护账户安全</div>
            </div>
            <div class="security-action">
              <a-tag color="green">已设置</a-tag>
              <a-button type="link" @click="showPasswordModal = true">修改</a-button>
            </div>
          </div>
          
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">
                <MobileOutlined class="security-icon" />
                手机绑定
              </div>
              <div class="security-desc">已绑定手机：{{ basicForm.phone || '未绑定' }}</div>
            </div>
            <div class="security-action">
              <a-tag :color="basicForm.phone ? 'green' : 'orange'">
                {{ basicForm.phone ? '已绑定' : '未绑定' }}
              </a-tag>
              <a-button type="link" @click="handleBindPhone">
                {{ basicForm.phone ? '更换' : '绑定' }}
              </a-button>
            </div>
          </div>
          
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">
                <MailOutlined class="security-icon" />
                邮箱绑定
              </div>
              <div class="security-desc">已绑定邮箱：{{ basicForm.email || '未绑定' }}</div>
            </div>
            <div class="security-action">
              <a-tag :color="basicForm.email ? 'green' : 'orange'">
                {{ basicForm.email ? '已绑定' : '未绑定' }}
              </a-tag>
              <a-button type="link" @click="handleBindEmail">
                {{ basicForm.email ? '更换' : '绑定' }}
              </a-button>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  CameraOutlined,
  LockOutlined,
  MobileOutlined,
  MailOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

// 基本信息表单
const basicForm = reactive({
  userName: '',
  account: '',
  email: '',
  phone: '',
  bio: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 响应式数据
const basicFormRef = ref()
const passwordFormRef = ref()
const basicLoading = ref(false)
const passwordLoading = ref(false)
const showPasswordModal = ref(false)
const fileList = ref([])

// 基本信息验证规则
const basicRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 保存基本信息
const handleSaveBasic = async () => {
  try {
    await basicFormRef.value.validate()
    basicLoading.value = true
    
    // 这里调用更新用户信息API
    // await updateUserInfo(basicForm)
    
    message.success('基本信息更新成功')
  } catch (error) {
    message.error('更新失败')
  } finally {
    basicLoading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    // 这里调用修改密码API
    // await changePassword(passwordForm)
    
    message.success('密码修改成功')
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    passwordFormRef.value.resetFields()
  } catch (error) {
    message.error('密码修改失败')
  } finally {
    passwordLoading.value = false
  }
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
    basicForm.avatar = info.file.response.url
    message.success('头像上传成功')
  }
}

// 绑定手机
const handleBindPhone = () => {
  message.info('手机绑定功能开发中...')
}

// 绑定邮箱
const handleBindEmail = () => {
  message.info('邮箱绑定功能开发中...')
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const userInfo = userStore.getUserInfo
    Object.assign(basicForm, {
      userName: userInfo.userName,
      account: userInfo.account,
      email: userInfo.email,
      avatar: userInfo.avatar,
      phone: '',
      bio: ''
    })
  } catch (error) {
    message.error('获取用户信息失败')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-profile {
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card {
  border-radius: 8px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
}

.upload-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

.upload-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.avatar-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin: 0;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.security-info {
  flex: 1;
}

.security-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.security-icon {
  margin-right: 8px;
  color: #87CEEB;
}

.security-desc {
  font-size: 12px;
  color: #666;
}

.security-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-card :deep(.ant-form-item) {
    margin-bottom: 16px;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .security-action {
    align-self: flex-end;
  }
}
</style> 