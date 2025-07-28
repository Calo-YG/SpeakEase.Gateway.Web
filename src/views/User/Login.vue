<template>
  <a-form
    :model="form"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 14 }"
    @submit.prevent="onLogin"
  >
    <a-form-item label="账号" required>
      <a-input v-model:value="form.account" placeholder="请输入账号" />
    </a-form-item>
    <a-form-item label="密码" required>
      <a-input v-model:value="form.password" type="password" placeholder="请输入密码" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">登录</a-button>
      <router-link to="/register" style="margin-left: 16px;">没有账号？去注册</router-link>
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
  password: ''
})
const loading = ref(false)
const router = useRouter()

const onLogin = async () => {
  loading.value = true
  try {
    const res = await axios.post('/api/user/login', form.value)
    // 假设后端返回 token 和用户信息
    localStorage.setItem('token', res.data.token)
    message.success('登录成功')
    router.push('/')
  } catch (e) {
    message.error('登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
</script> 