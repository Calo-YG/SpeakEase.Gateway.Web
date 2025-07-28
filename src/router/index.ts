import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/root";
import { useUserStore } from "@/store/userStore";
import { TokenStorage } from "@/utils/tokenStorage";
import { notification } from "ant-design-vue";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 白名单路由
const whiteList = ["Login", "Register", "NotFound"];

router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - SpeakEase.Gateway`;

  // 获取用户状态
  const userStore = useUserStore();
  const token = TokenStorage.getAccessToken();
  const userInfo = TokenStorage.getUserInfo();

  // 如果已登录
  if (token && userInfo) {
    if (to.name === "Login" || to.name === "Register") {
      // 已登录用户访问登录/注册页，重定向到首页
      next({ name: "Dashboard" });
    } else {
      // 更新用户状态
      if (!userStore.isAuthenticated) {
        userStore.setUserInfo(userInfo);
      }
      next();
    }
  } else {
    // 未登录
    if (whiteList.includes(to.name as string)) {
      // 白名单路由直接放行
      next();
    } else {
      // 其他路由重定向到登录页
      notification.warning({
        message: "提示",
        description: "请先登录",
        duration: 1,
      });
      next({ name: "Login", query: { redirect: to.fullPath } });
    }
  }
});

// 路由错误处理
router.onError((error) => {
  console.error("路由错误:", error);
  notification.error({
    message: "路由错误",
    description: "页面加载失败，请刷新重试",
    duration: 2,
  });
});

export default router;
