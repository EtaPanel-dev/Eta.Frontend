export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // 确保在路由导航前初始化认证状态
  authStore.initialize()
})