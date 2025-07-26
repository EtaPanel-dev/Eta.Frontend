export default defineNuxtRouteMiddleware((to) => {
  // 跳过登录页面和不需要认证的页面
  if (to.path === '/login' || to.meta.auth === false) {
    return
  }

  const authStore = useAuthStore()

  // 初始化认证状态（从持久化存储恢复用户信息）
  authStore.initialize()

  // 检查JWT token是否有效
  if (!authStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})