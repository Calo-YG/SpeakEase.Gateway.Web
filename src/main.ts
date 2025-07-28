import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { notification } from 'ant-design-vue'
import './style.css'
import './styles/theme.css'
import App from './App.vue'
import router from '@/router'

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

// 创建应用实例
const app = createApp(App)

// 初始化主题
initTheme();

// 错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  notification.error({
    message: '错误',
    description: '应用发生错误，请刷新页面重试',
    duration: 2
  })
}

// 性能监控
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 使用插件
const pinia = createPinia()
app.use(router)
app.use(pinia)

// 挂载应用
app.mount('#app')
