<template>
  <a-form
    :model="form"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 14 }"
    @submit.prevent="onRegister"
  >
    <a-form-item label="账号" required>
      <a-input v-model:value="form.account" placeholder="请输入账号" />
    </a-form-item>
    <a-form-item label="密码" required>
      <a-input v-model:value="form.password" type="password" placeholder="请输入密码" />
    </a-form-item>
    <a-form-item label="用户名称" required>
      <a-input v-model:value="form.name" placeholder="请输入用户名称" />
    </a-form-item>
    <a-form-item label="邮箱" required>
      <a-input v-model:value="form.email" placeholder="请输入邮箱" />
    </a-form-item>
    <a-form-item label="头像">
      <a-upload
        :show-upload-list="false"
        :before-upload="beforeUpload"
        :custom-request="customRequest"
        accept="image/*"
      >
        <a-avatar
          v-if="form.avatar"
          :src="form.avatar"
          :size="64"
          style="cursor:pointer"
        />
        <a-button v-else icon="upload">上传头像</a-button>
      </a-upload>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">注册</a-button>
      <router-link to="/login" style="margin-left: 16px;">已有账号？去登录</router-link>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import axios from 'axios'

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
    const formData = new FormData()
    formData.append('file', file)
    // 假设后端上传接口为 /api/upload/avatar，返回 { url: '图片地址' }
    const res = await axios.post('/api/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.value.avatar = res.data.url
    message.success('头像上传成功')
    onSuccess(res.data, file)
  } catch (e) {
    message.error('头像上传失败')
    onError(e)
  }
}

const onRegister = async () => {
  loading.value = true
  try {
    await axios.post('/api/user/register', form.value)
    message.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    message.error('注册失败，请检查信息')
  } finally {
    loading.value = false
  }
}
</script> 