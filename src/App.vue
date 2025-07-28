<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { notification } from 'ant-design-vue'

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err)
  notification.error({
    message: '组件错误',
    description: '组件渲染出错，请刷新页面重试',
    duration: 2
  })
  return false
})
</script>

<template>
  <a-config-provider>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </a-config-provider>
</template>

<style>
/* 全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
