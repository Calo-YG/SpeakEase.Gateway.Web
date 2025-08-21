import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import { notification } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import './styles/theme.css'
import App from './App.vue'
import router from '@/router'
import { useThemeStore } from '@/store/themeStore'

// 创建应用实例
const app = createApp(App)

// 使用插件
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.use(Antd)

// 初始化全局主题（在 Pinia 初始化之后）
const themeStore = useThemeStore()
themeStore.initTheme()
themeStore.watchSystemTheme()

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

// 挂载应用
app.mount('#app')
