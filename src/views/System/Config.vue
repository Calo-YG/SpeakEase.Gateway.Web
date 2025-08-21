<template>
  <div class="system-config">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">系统配置</h1>
        <p class="page-description">配置系统参数和全局设置</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="handleSaveAll">
          <template #icon>
            <SaveOutlined />
          </template>
          保存所有配置
        </a-button>
      </div>
    </div>

    <a-tabs v-model:activeKey="activeTab" type="card" class="config-tabs">
      <!-- 基本配置 -->
      <a-tab-pane key="basic" tab="基本配置">
        <a-card class="config-section">
          <a-form
            ref="basicFormRef"
            :model="basicConfig"
            :rules="basicRules"
            layout="vertical"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="系统名称" name="systemName">
                  <a-input v-model:value="basicConfig.systemName" placeholder="请输入系统名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="系统版本" name="version">
                  <a-input v-model:value="basicConfig.version" placeholder="系统版本" disabled />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="管理员邮箱" name="adminEmail">
                  <a-input v-model:value="basicConfig.adminEmail" placeholder="请输入管理员邮箱" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="系统语言" name="language">
                  <a-select v-model:value="basicConfig.language" placeholder="请选择系统语言">
                    <a-select-option value="zh-CN">中文简体</a-select-option>
                    <a-select-option value="en-US">English</a-select-option>
                    <a-select-option value="ja-JP">日本語</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="时区设置" name="timezone">
                  <a-select v-model:value="basicConfig.timezone" placeholder="请选择时区">
                    <a-select-option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</a-select-option>
                    <a-select-option value="UTC">UTC (UTC+0)</a-select-option>
                    <a-select-option value="America/New_York">America/New_York (UTC-5)</a-select-option>
                    <a-select-option value="Europe/London">Europe/London (UTC+0)</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="日期格式" name="dateFormat">
                  <a-select v-model:value="basicConfig.dateFormat" placeholder="请选择日期格式">
                    <a-select-option value="YYYY-MM-DD">YYYY-MM-DD</a-select-option>
                    <a-select-option value="MM/DD/YYYY">MM/DD/YYYY</a-select-option>
                    <a-select-option value="DD/MM/YYYY">DD/MM/YYYY</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item label="系统描述" name="description">
              <a-textarea v-model:value="basicConfig.description" placeholder="请输入系统描述" :rows="3" />
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 安全配置 -->
      <a-tab-pane key="security" tab="安全配置">
        <a-card class="config-section">
          <a-form
            ref="securityFormRef"
            :model="securityConfig"
            :rules="securityRules"
            layout="vertical"
          >
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="密码最小长度" name="minPasswordLength">
                  <a-input-number 
                    v-model:value="securityConfig.minPasswordLength" 
                    :min="6" 
                    :max="20" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="密码复杂度" name="passwordComplexity">
                  <a-select v-model:value="securityConfig.passwordComplexity" placeholder="请选择密码复杂度">
                    <a-select-option value="low">低 (仅字母数字)</a-select-option>
                    <a-select-option value="medium">中 (字母数字+特殊字符)</a-select-option>
                    <a-select-option value="high">高 (大小写字母+数字+特殊字符)</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="会话超时时间(分钟)" name="sessionTimeout">
                  <a-input-number 
                    v-model:value="securityConfig.sessionTimeout" 
                    :min="5" 
                    :max="1440" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="最大登录失败次数" name="maxLoginAttempts">
                  <a-input-number 
                    v-model:value="securityConfig.maxLoginAttempts" 
                    :min="3" 
                    :max="10" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="启用双因素认证" name="enable2FA">
                  <a-switch v-model:checked="securityConfig.enable2FA" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="启用登录日志" name="enableLoginLog">
                  <a-switch v-model:checked="securityConfig.enableLoginLog" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="允许的IP地址" name="allowedIPs">
                  <a-textarea 
                    v-model:value="securityConfig.allowedIPs" 
                    placeholder="请输入允许访问的IP地址，每行一个" 
                    :rows="4"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="SSL证书路径" name="sslCertPath">
                  <a-input v-model:value="securityConfig.sslCertPath" placeholder="请输入SSL证书路径" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 性能配置 -->
      <a-tab-pane key="performance" tab="性能配置">
        <a-card class="config-section">
          <a-form
            ref="performanceFormRef"
            :model="performanceConfig"
            :rules="performanceRules"
            layout="vertical"
          >
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="最大并发连接数" name="maxConnections">
                  <a-input-number 
                    v-model:value="performanceConfig.maxConnections" 
                    :min="100" 
                    :max="10000" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="连接超时时间(秒)" name="connectionTimeout">
                  <a-input-number 
                    v-model:value="performanceConfig.connectionTimeout" 
                    :min="5" 
                    :max="300" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="请求超时时间(秒)" name="requestTimeout">
                  <a-input-number 
                    v-model:value="performanceConfig.requestTimeout" 
                    :min="10" 
                    :max="600" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="缓存过期时间(分钟)" name="cacheExpiration">
                  <a-input-number 
                    v-model:value="performanceConfig.cacheExpiration" 
                    :min="1" 
                    :max="1440" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="启用压缩" name="enableCompression">
                  <a-switch v-model:checked="performanceConfig.enableCompression" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="启用缓存" name="enableCache">
                  <a-switch v-model:checked="performanceConfig.enableCache" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="日志级别" name="logLevel">
                  <a-select v-model:value="performanceConfig.logLevel" placeholder="请选择日志级别">
                    <a-select-option value="debug">Debug</a-select-option>
                    <a-select-option value="info">Info</a-select-option>
                    <a-select-option value="warn">Warning</a-select-option>
                    <a-select-option value="error">Error</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="日志保留天数" name="logRetentionDays">
                  <a-input-number 
                    v-model:value="performanceConfig.logRetentionDays" 
                    :min="1" 
                    :max="365" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 通知配置 -->
      <a-tab-pane key="notification" tab="通知配置">
        <a-card class="config-section">
          <a-form
            ref="notificationFormRef"
            :model="notificationConfig"
            :rules="notificationRules"
            layout="vertical"
          >
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="启用邮件通知" name="enableEmailNotification">
                  <a-switch v-model:checked="notificationConfig.enableEmailNotification" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="启用短信通知" name="enableSMSNotification">
                  <a-switch v-model:checked="notificationConfig.enableSMSNotification" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="SMTP服务器" name="smtpServer">
                  <a-input v-model:value="notificationConfig.smtpServer" placeholder="请输入SMTP服务器地址" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="SMTP端口" name="smtpPort">
                  <a-input-number 
                    v-model:value="notificationConfig.smtpPort" 
                    :min="1" 
                    :max="65535" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="发件人邮箱" name="senderEmail">
                  <a-input v-model:value="notificationConfig.senderEmail" placeholder="请输入发件人邮箱" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="发件人密码" name="senderPassword">
                  <a-input-password v-model:value="notificationConfig.senderPassword" placeholder="请输入发件人密码" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="短信服务商" name="smsProvider">
                  <a-select v-model:value="notificationConfig.smsProvider" placeholder="请选择短信服务商">
                    <a-select-option value="aliyun">阿里云短信</a-select-option>
                    <a-select-option value="tencent">腾讯云短信</a-select-option>
                    <a-select-option value="huawei">华为云短信</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="短信API密钥" name="smsApiKey">
                  <a-input-password v-model:value="notificationConfig.smsApiKey" placeholder="请输入短信API密钥" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item label="通知模板" name="notificationTemplates">
              <a-textarea 
                v-model:value="notificationConfig.notificationTemplates" 
                placeholder="请输入通知模板配置" 
                :rows="6"
              />
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 备份配置 -->
      <a-tab-pane key="backup" tab="备份配置">
        <a-card class="config-section">
          <a-form
            ref="backupFormRef"
            :model="backupConfig"
            :rules="backupRules"
            layout="vertical"
          >
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="启用自动备份" name="enableAutoBackup">
                  <a-switch v-model:checked="backupConfig.enableAutoBackup" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备份频率" name="backupFrequency">
                  <a-select v-model:value="backupConfig.backupFrequency" placeholder="请选择备份频率">
                    <a-select-option value="daily">每日</a-select-option>
                    <a-select-option value="weekly">每周</a-select-option>
                    <a-select-option value="monthly">每月</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="备份保留数量" name="backupRetentionCount">
                  <a-input-number 
                    v-model:value="backupConfig.backupRetentionCount" 
                    :min="1" 
                    :max="100" 
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备份路径" name="backupPath">
                  <a-input v-model:value="backupConfig.backupPath" placeholder="请输入备份路径" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="启用压缩备份" name="enableCompression">
                  <a-switch v-model:checked="backupConfig.enableCompression" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备份通知" name="backupNotification">
                  <a-switch v-model:checked="backupConfig.backupNotification" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SaveOutlined } from '@ant-design/icons-vue'

// 当前激活的标签页
const activeTab = ref('basic')

// 表单引用
const basicFormRef = ref()
const securityFormRef = ref()
const performanceFormRef = ref()
const notificationFormRef = ref()
const backupFormRef = ref()

// 基本配置
const basicConfig = reactive({
  systemName: 'SpeakEase Gateway',
  version: '1.0.0',
  adminEmail: 'admin@example.com',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  description: 'SpeakEase Gateway 是一个现代化的API网关管理系统'
})

// 安全配置
const securityConfig = reactive({
  minPasswordLength: 8,
  passwordComplexity: 'medium',
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  enable2FA: false,
  enableLoginLog: true,
  allowedIPs: '',
  sslCertPath: '/etc/ssl/certs/gateway.crt'
})

// 性能配置
const performanceConfig = reactive({
  maxConnections: 1000,
  connectionTimeout: 30,
  requestTimeout: 60,
  cacheExpiration: 30,
  enableCompression: true,
  enableCache: true,
  logLevel: 'info',
  logRetentionDays: 30
})

// 通知配置
const notificationConfig = reactive({
  enableEmailNotification: false,
  enableSMSNotification: false,
  smtpServer: 'smtp.example.com',
  smtpPort: 587,
  senderEmail: 'noreply@example.com',
  senderPassword: '',
  smsProvider: 'aliyun',
  smsApiKey: '',
  notificationTemplates: ''
})

// 备份配置
const backupConfig = reactive({
  enableAutoBackup: true,
  backupFrequency: 'daily',
  backupRetentionCount: 7,
  backupPath: '/backup',
  enableCompression: true,
  backupNotification: true
})

// 表单验证规则
const basicRules = {
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  adminEmail: [
    { required: true, message: '请输入管理员邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const securityRules = {
  minPasswordLength: [{ required: true, message: '请输入密码最小长度', trigger: 'blur' }],
  sessionTimeout: [{ required: true, message: '请输入会话超时时间', trigger: 'blur' }]
}

const performanceRules = {
  maxConnections: [{ required: true, message: '请输入最大并发连接数', trigger: 'blur' }],
  connectionTimeout: [{ required: true, message: '请输入连接超时时间', trigger: 'blur' }]
}

const notificationRules = {
  smtpServer: [{ required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }],
  senderEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const backupRules = {
  backupPath: [{ required: true, message: '请输入备份路径', trigger: 'blur' }],
  backupRetentionCount: [{ required: true, message: '请输入备份保留数量', trigger: 'blur' }]
}

// 保存所有配置
const handleSaveAll = async () => {
  try {
    // 验证所有表单
    await Promise.all([
      basicFormRef.value?.validate(),
      securityFormRef.value?.validate(),
      performanceFormRef.value?.validate(),
      notificationFormRef.value?.validate(),
      backupFormRef.value?.validate()
    ])

    // 合并所有配置
    const allConfig = {
      basic: basicConfig,
      security: securityConfig,
      performance: performanceConfig,
      notification: notificationConfig,
      backup: backupConfig
    }

    // 这里调用保存配置API
    // await saveSystemConfig(allConfig)
    
    message.success('配置保存成功')
  } catch (error) {
    message.error('配置保存失败，请检查表单验证')
  }
}

// 加载配置
const loadConfig = async () => {
  try {
    // 这里调用获取配置API
    // const response = await getSystemConfig()
    // const config = response.data
    
    // 模拟加载配置
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Object.assign(basicConfig, config.basic)
    // Object.assign(securityConfig, config.security)
    // Object.assign(performanceConfig, config.performance)
    // Object.assign(notificationConfig, config.notification)
    // Object.assign(backupConfig, config.backup)
    
    message.success('配置加载成功')
  } catch (error) {
    message.error('配置加载失败')
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.system-config {
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

.config-tabs {
  background: #fff;
  border-radius: 8px;
}

.config-section {
  border-radius: 8px;
  margin-bottom: 16px;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
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
  
  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }
}
</style> 