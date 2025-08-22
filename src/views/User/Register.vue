<template>
  <div class="register-container">
    <div class="register-background">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
      <div class="bg-shape bg-shape-3"></div>
    </div>
    
    <div class="register-content">
      <div class="register-left">
        <div class="brand-section">
          <div class="brand-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#87CEEB"/>
              <path d="M12 16h24v2H12v-2zm0 6h24v2H12v-2zm0 6h16v2H12v-2z" fill="white"/>
            </svg>
          </div>
          <h1 class="brand-title">SpeakEase Gateway</h1>
          <p class="brand-subtitle">智能网关管理平台</p>
        </div>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">🚀</div>
            <div class="feature-text">高性能网关服务</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <div class="feature-text">安全可靠的管理</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div class="feature-text">实时监控分析</div>
          </div>
        </div>
      </div>
      
      <div class="register-right">
        <div class="register-form-container">
          <div class="form-header">
            <h2>创建账户</h2>
            <p>请填写您的注册信息</p>
          </div>
          
          <a-form
            :model="form"
            @submit.prevent="onRegister"
            class="register-form"
            layout="vertical"
          >
            <a-form-item label="账号" required>
              <a-input 
                v-model:value="form.account" 
                placeholder="请输入您的账号" 
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </a-form-item>
            
            <a-form-item label="密码" required>
              <a-input-password 
                v-model:value="form.password" 
                placeholder="请输入您的密码" 
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>
            
            <a-form-item label="用户名称" required>
              <a-input 
                v-model:value="form.name" 
                placeholder="请输入您的姓名" 
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </a-form-item>
            
            <a-form-item label="邮箱" required>
              <a-input 
                v-model:value="form.email" 
                placeholder="请输入您的邮箱" 
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <MailOutlined />
                </template>
              </a-input>
            </a-form-item>
            
            <a-form-item label="头像">
              <a-upload
                :show-upload-list="false"
                :before-upload="beforeUpload"
                :custom-request="customRequest"
                accept="image/*"
                class="avatar-upload"
              >
                <a-avatar
                  v-if="form.avatar"
                  :src="form.avatar"
                  :size="64"
                  class="avatar-preview"
                />
                <div v-else class="avatar-upload-trigger">
                  <PlusOutlined />
                  <div class="upload-text">上传头像</div>
                </div>
              </a-upload>
            </a-form-item>
            
            <a-form-item>
              <a-button 
                type="primary" 
                html-type="submit" 
                :loading="loading" 
                block 
                size="large"
                class="register-btn"
              >
                {{ loading ? '注册中...' : '注册' }}
              </a-button>
            </a-form-item>
            
            <div class="login-section">
              <span>已有账户？</span>
              <router-link to="/login" class="login-link">立即登录</router-link>
            </div>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, MailOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { register, uploadAvatar } from '@/api/sysuser/user'

const form = ref({
  account: '',
  password: '',
  name: '',
  email: '',
  avatar: ''
})
const loading = ref(false)
const router = useRouter()

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2MB')
  }
  return isImage && isLt2M
}

const customRequest = async (options: any) => {
  const { file, onSuccess, onError } = options
  try {
    const avatarUrl = await uploadAvatar(file)
    form.value.avatar = avatarUrl
    message.success('头像上传成功')
    onSuccess(avatarUrl, file)
  } catch (e) {
    message.error('头像上传失败')
    onError(e)
  }
}

const onRegister = async () => {
  loading.value = true
  try {
    await register(form.value)
    message.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    message.error('注册失败，请检查信息')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #87CEEB 0%, #D8BFD8 50%, #FFFFFF 100%);
  position: relative;
  overflow: hidden;
}

.register-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.bg-shape-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
  background: linear-gradient(45deg, #87CEEB, #D8BFD8);
}

.bg-shape-2 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: -75px;
  animation: float 8s ease-in-out infinite reverse;
  background: linear-gradient(45deg, #D8BFD8, #FFFFFF);
}

.bg-shape-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 10%;
  animation: float 7s ease-in-out infinite;
  background: linear-gradient(45deg, #87CEEB, #FFFFFF);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.register-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  overflow: hidden;
  z-index: 2;
  margin: 0 20px;
}

.register-left {
  flex: 1;
  background: linear-gradient(135deg, #87CEEB 0%, #D8BFD8 50%, #FFFFFF 100%);
  color: #333;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-section {
  text-align: center;
}

.brand-logo {
  margin-bottom: 20px;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
  color: #555;
}

.feature-list {
  margin-top: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.5);
}

.feature-icon {
  font-size: 20px;
  margin-right: 12px;
}

.feature-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.register-right {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
}

.register-form-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.form-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.register-form {
  width: 100%;
}

.register-form :deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.custom-input {
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  height: 48px;
}

.custom-input:hover {
  border-color: #87CEEB;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.1);
}

.custom-input:focus-within {
  border-color: #87CEEB;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.2);
}

.avatar-upload {
  display: flex;
  justify-content: center;
}

.avatar-preview {
  cursor: pointer;
  border: 3px solid #87CEEB;
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  transform: scale(1.05);
  border-color: #D8BFD8;
}

.avatar-upload-trigger {
  width: 64px;
  height: 64px;
  border: 2px dashed #d9d9d9;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.avatar-upload-trigger:hover {
  border-color: #87CEEB;
  background: #f0f8ff;
}

.avatar-upload-trigger .anticon {
  font-size: 20px;
  color: #999;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
  color: #999;
}

.register-btn {
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #87CEEB 0%, #D8BFD8 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
  background: linear-gradient(135deg, #7BB8E8 0%, #C8A9C8 100%);
}

.register-btn:active {
  transform: translateY(0);
}

.login-section {
  text-align: center;
  margin-top: 24px;
  color: #666;
  font-size: 14px;
}

.login-link {
  color: #87CEEB;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.login-link:hover {
  color: #D8BFD8;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-content {
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    margin: 0 10px;
  }
  
  .register-left {
    padding: 40px 30px;
  }
  
  .register-right {
    padding: 40px 30px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .feature-list {
    margin-top: 30px;
  }
  
  .feature-item {
    margin-bottom: 15px;
    padding: 10px;
  }
}
</style> 