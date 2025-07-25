import type { SystemInfo } from '~/types'

export const useSystemInfo = () => {
    const { getSystemInfo } = useApi()
    
    // 默认系统信息
    const defaultSystemInfo: SystemInfo = {
        load: '0.0',
        memory: 0,
        disk: 0,
        cpu: 0,
        memoryUsed: '0 GB',
        memoryTotal: '0 GB'
    }

    const systemInfo = useState<SystemInfo>('systemInfo', () => defaultSystemInfo)
    
    // 刷新系统信息
    const refreshSystemInfo = async () => {
        try {
            const data = await getSystemInfo()
            systemInfo.value = data
        } catch (error) {
            console.error('获取系统信息失败:', error)
        }
    }
    
    // 自动刷新
    const startAutoRefresh = (interval = 5000) => {
        const timer = setInterval(refreshSystemInfo, interval)
        onUnmounted(() => clearInterval(timer))
        return timer
    }

    return {
        systemInfo: readonly(systemInfo),
        refreshSystemInfo,
        startAutoRefresh
    }
}