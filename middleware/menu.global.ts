export default defineNuxtRouteMiddleware((to) => {
  // 在客户端执行
  if (process.client) {
    const { setActiveMenu } = useActiveMenu()
    
    // 根据路由路径设置活动菜单
    const path = to.path
    if (path === '/') {
      setActiveMenu('dashboard')
    } else {
      const menuKey = path.slice(1) // 移除开头的 '/'
      setActiveMenu(menuKey)
    }
  }
})