export default defineNuxtRouteMiddleware((to) => {
  // 跳过登录页面和不需要认证的页面
  if (to.path === '/login' || to.meta.auth === false) {
    return
  }

  // 只在客户端执行认证检查
  if (process.client) {
    const authStore = useAuthStore()
    
    // 检查JWT token是否有效
    if (!authStore.isAuthenticated) {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
})