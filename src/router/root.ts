import { RouteRecordRaw } from "vue-router";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard", // 默认跳转到 dashboard
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
    component: () => import("@/layouts/MainLayout.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/Dashboard/index.vue"),
        meta: {
          title: "仪表板",
          requiresAuth: true,
        },
      },
      {
        path: "user",
        name: "User",
        meta: {
          title: "用户管理",
          requiresAuth: true,
        },
        children: [
          {
            path: "list",
            name: "UserList",
            component: () => import("@/views/User/List.vue"),
            meta: {
              title: "用户列表",
              requiresAuth: true,
            },
          },
          {
            path: "profile",
            name: "UserProfile",
            component: () => import("@/views/User/Profile.vue"),
            meta: {
              title: "个人资料",
              requiresAuth: true,
            },
          },
        ],
      },
      {
        path: "service",
        name: "Service",
        meta: {
          title: "服务管理",
          requiresAuth: true,
        },
        children: [
          {
            path: "list",
            name: "ServiceList",
            component: () => import("@/views/Service/List.vue"),
            meta: {
              title: "服务列表",
              requiresAuth: true,
            },
          },
          {
            path: "config",
            name: "ServiceConfig",
            component: () => import("@/views/Service/Config.vue"),
            meta: {
              title: "服务配置",
              requiresAuth: true,
            },
          },
        ],
      },
      {
        path: "route",
        name: "Route",
        meta: {
          title: "路由管理",
          requiresAuth: true,
        },
        children: [
          {
            path: "list",
            name: "RouteList",
            component: () => import("@/views/Route/List.vue"),
            meta: {
              title: "路由列表",
              requiresAuth: true,
            },
          },
          {
            path: "config",
            name: "RouteConfig",
            component: () => import("@/views/Route/Config.vue"),
            meta: {
              title: "路由配置",
              requiresAuth: true,
            },
          },
        ],
      },
      {
        path: "cluster",
        name: "Cluster",
        meta: {
          title: "集群配置",
          requiresAuth: true,
        },
        children: [
          {
            path: "list",
            name: "ClusterList",
            component: () => import("@/views/Cluster/List.vue"),
            meta: {
              title: "集群列表",
              requiresAuth: true,
            },
          },
          {
            path: "monitor",
            name: "ClusterMonitor",
            component: () => import("@/views/Cluster/Monitor.vue"),
            meta: {
              title: "集群监控",
              requiresAuth: true,
            },
          },
        ],
      },
      {
        path: "system",
        name: "System",
        meta: {
          title: "系统设置",
          requiresAuth: true,
        },
        children: [
          {
            path: "config",
            name: "SystemConfig",
            component: () => import("@/views/System/Config.vue"),
            meta: {
              title: "系统配置",
              requiresAuth: true,
            },
          },
          {
            path: "log",
            name: "SystemLog",
            component: () => import("@/views/System/Log.vue"),
            meta: {
              title: "系统日志",
              requiresAuth: true,
            },
          },
        ],
      },
    ],
  },
];
