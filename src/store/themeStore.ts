import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface ThemeConfig {
  isDark: boolean
  primaryColor: string
  backgroundColor: string
  textColor: string
  sidebarBg: string
  headerBg: string
  contentBg: string
}

export const useThemeStore = defineStore('theme', () => {
  // 主题状态
  const isDarkTheme = ref(false)
  
  // 主题配置
  const lightTheme: ThemeConfig = {
    isDark: false,
    primaryColor: '#1890ff',
    backgroundColor: '#f5f5f5',
    textColor: '#333333',
    sidebarBg: 'linear-gradient(180deg, #1890ff 0%, #722ed1 100%)',
    headerBg: '#ffffff',
    contentBg: '#f5f5f5'
  }
  
  const darkTheme: ThemeConfig = {
    isDark: true,
    primaryColor: '#40a9ff',
    backgroundColor: '#141414',
    textColor: '#ffffff',
    sidebarBg: 'linear-gradient(180deg, #1f1f1f 0%, #2f2f2f 100%)',
    headerBg: '#1f1f1f',
    contentBg: '#141414'
  }
  
  // 获取当前主题配置
  const getCurrentTheme = (): ThemeConfig => {
    return isDarkTheme.value ? darkTheme : lightTheme
  }
  
  // 切换主题
  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value
    applyTheme()
    saveTheme()
  }
  
  // 设置主题
  const setTheme = (isDark: boolean) => {
    isDarkTheme.value = isDark
    applyTheme()
    saveTheme()
  }
  
  // 应用主题到全局
  const applyTheme = () => {
    const theme = getCurrentTheme()
    
    // 设置 CSS 变量
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
    document.documentElement.style.setProperty('--background-color', theme.backgroundColor)
    document.documentElement.style.setProperty('--text-color', theme.textColor)
    document.documentElement.style.setProperty('--sidebar-bg', theme.sidebarBg)
    document.documentElement.style.setProperty('--header-bg', theme.headerBg)
    document.documentElement.style.setProperty('--content-bg', theme.contentBg)
    
    // 设置 body 类名
    document.body.className = isDarkTheme.value ? 'dark-theme' : ''
    
    // 设置 html 类名
    document.documentElement.className = isDarkTheme.value ? 'dark-theme' : ''
  }
  
  // 保存主题设置
  const saveTheme = () => {
    localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  }
  
  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      isDarkTheme.value = savedTheme === 'dark'
    } else {
      isDarkTheme.value = prefersDark
    }
    
    applyTheme()
  }
  
  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // 只有在没有保存过主题设置时才跟随系统
      if (!localStorage.getItem('theme')) {
        isDarkTheme.value = e.matches
        applyTheme()
      }
    })
  }
  
  return {
    isDarkTheme,
    getCurrentTheme,
    toggleTheme,
    setTheme,
    applyTheme,
    initTheme,
    watchSystemTheme
  }
}) 