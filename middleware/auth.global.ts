export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/login' || to.meta.auth === false) {
    return
  }

  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})