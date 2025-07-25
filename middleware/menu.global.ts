export default defineNuxtRouteMiddleware((to) => {
  // 在客户端执行
  if (process.client) {
    // 根据路由路径设置活动菜单
    const path = to.path
    const menuKey = path === '/' ? 'dashboard' : path.slice(1)
    console.log('Setting active menu:', menuKey)
  }
})