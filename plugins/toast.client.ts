import { useToast } from 'primevue/usetoast'

export default defineNuxtPlugin(() => {
    // 确保Toast服务在客户端正确初始化
    const toast = useToast()

    return {
        provide: {
            toast
        }
    }
})