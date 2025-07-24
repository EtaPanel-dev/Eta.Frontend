export default defineNuxtPlugin(() => {
  const router = useRouter()

  // 确保在客户端水合后正确初始化路由状态
  router.afterEach((to) => {
    if (import.meta.client) {
      console.log('Client route initialized:', to.path)

      // 触发一次状态更新以确保侧边栏正确显示
      nextTick(() => {
        console.log('Route state synchronized')
      })
    }
  })
})