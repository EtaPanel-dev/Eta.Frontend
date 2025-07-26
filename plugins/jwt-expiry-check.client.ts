export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()
    const notification = useNotification()

    // 定期检查token是否过期
    const checkTokenExpiry = () => {
        if (!authStore.token) return

        if (!authStore.isTokenValid) {
            console.log('Token已过期，自动登出')
            notification.showWarning('登录已过期', '请重新登录')
            authStore.logout()
            return
        }

        // 检查token是否即将过期（剩余时间少于5分钟）
        const timeRemaining = authStore.getTokenTimeRemaining()
        if (timeRemaining && timeRemaining < 300) { // 5分钟 = 300秒
            notification.showWarning('登录即将过期', `还有 ${Math.floor(timeRemaining / 60)} 分钟过期，请及时保存工作`)
        }
    }

    // 每分钟检查一次token状态
    const intervalId = setInterval(checkTokenExpiry, 60000)

    // 页面可见性变化时也检查一次
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            checkTokenExpiry()
        }
    }

    // 页面加载时检查一次
    checkTokenExpiry()

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 清理定时器和事件监听器
    onBeforeUnmount(() => {
        clearInterval(intervalId)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
})