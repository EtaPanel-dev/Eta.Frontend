export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()
    const notification = useNotification()

    // 全局错误处理
    const handleApiError = (error: any) => {
        if (error.message?.includes('用户未登录') ||
            error.message?.includes('登录已过期') ||
            error.message?.includes('Token已过期')) {

            // 如果用户还在登录状态，显示过期提示并登出
            if (authStore.isAuthenticated) {
                notification.showError('登录已过期', '请重新登录')
                authStore.logout()
            }
            return
        }

        // 其他API错误
        if (error.message && !error.handled) {
            notification.showError('操作失败', error.message)
        }
    }

    // 监听未处理的Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && typeof event.reason === 'object' && event.reason.message) {
            handleApiError(event.reason)
        }
    })

    // 提供全局错误处理方法
    return {
        provide: {
            handleApiError
        }
    }
})