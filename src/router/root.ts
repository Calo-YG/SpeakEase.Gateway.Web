import { RouteRecordRaw } from "vue-router";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/login", // 默认跳转到 login
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/User/Login.vue"),
    meta: {
      title: "登录",
      requiresAuth: false,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/User/Register.vue"),
    meta: {
      title: "注册",
      requiresAuth: false,
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/Dashboard/index.vue"),
    meta: {
      title: "仪表板",
      requiresAuth: true,
    },
  }
];
