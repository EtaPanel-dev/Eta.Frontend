export default defineNuxtPlugin(() => {
    // 全局错误处理
    const handleError = (error: any, context?: string) => {
        console.error(`[${context || 'Global'}] Error:`, error)

        const notification = useNotification()

        // 根据错误类型显示不同的提示
        if (error.status === 401) {
            notification.showError('登录已过期，请重新登录')
            navigateTo('/login')
        } else if (error.status === 403) {
            notification.showError('权限不足，无法执行此操作')
        } else if (error.status === 404) {
            notification.showError('请求的资源不存在')
        } else if (error.status >= 500) {
            notification.showError('服务器内部错误，请稍后重试')
        } else if (error.message) {
            notification.showError(error.message)
        } else {
            notification.showError('发生未知错误，请稍后重试')
        }
    }

    // 监听未捕获的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
        handleError(event.reason, 'Unhandled Promise Rejection')
    })

    // 监听全局JavaScript错误
    window.addEventListener('error', (event) => {
        handleError(event.error, 'Global Error')
    })

    // 提供全局错误处理方法
    return {
        provide: {
            handleError
        }
    }
})