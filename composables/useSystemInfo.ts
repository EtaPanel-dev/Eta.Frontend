import type { SystemInfo } from '~/types'

// 全局状态管理 - 确保跨组件数据一致性
// 这些 ref 是全局的，意味着所有使用 useSystemInfo 的组件会共享它们
const globalSystemInfo = ref<SystemInfo | null>(null)
const isRefreshing = ref(false)
const lastUpdateTime = ref<number>(0)
let refreshTimer: NodeJS.Timeout | null = null // 全局定时器句柄

export const useSystemInfo = () => {
    const { getSystemInfo } = useApi()

    // 默认系统信息 - 用于初始化或当数据不可用时
    // 确保这里的类型与你的 API 响应和组件使用保持一致
    const defaultSystemInfo: SystemInfo = {
        load: '0.0',
        memory: 0,
        disk: 0,
        cpu: 0,
        cpuModel: '',
        memoryUsed: '0 GB',
        memoryTotal: '0 GB',
        memoryCached: '0.0',
        memoryBuffer: '0.0',
        swapUsed: 0,
        swapTotal: 0,
        hostname: '',
        os: '',
        arch: '',
        uptime: 0,
        processes: 0,
        cpuCores: 0,
        networkInterfaces: [],
        diskInfo: []
    }

    // 使用全局状态或默认值
    const systemInfo = computed(() => globalSystemInfo.value || defaultSystemInfo)

    // 格式化字节数
    const formatBytes = (bytes: number): string => {
        if (!bytes || bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 刷新系统信息 - 防止重复请求
    const refreshSystemInfo = async (): Promise<void> => {
        if (isRefreshing.value) {
            console.log('正在刷新系统信息，跳过本次请求以避免重复。')
            return // 如果正在刷新，则跳过本次请求
        }

        isRefreshing.value = true
        try {
            // 直接调用API，getSystemInfo已经处理了响应结构
            const data = await getSystemInfo()
            console.log('API响应数据:', data)

            if (!data) {
                console.warn('API返回数据为空或格式不正确，无法更新系统信息。')
                return
            }

            // 处理API数据结构并确保类型安全
            // 确保这里的字段名与你提供的后端 API 响应 JSON 完全匹配
            const newSystemInfo: SystemInfo = {
                // CPU 信息
                // loadAverage 可能为 null，使用 ?. 和 || '0.0' 进行安全访问和默认值
                load: data.cpu?.loadAverage ? data.cpu.loadAverage.join(', ') : '0.0',
                cpu: Math.round(data.cpu?.usage || 0),
                cpuCores: data.cpu?.cores || 0, // 直接从 data.cpu.cores 获取
                cpuModel: data.cpu?.model || 'Unknown', // CPU型号

                // 内存信息
                memory: Math.round(data.memory?.usedPercent || 0),
                memoryUsed: formatBytes(data.memory?.used || 0),
                memoryTotal: formatBytes(data.memory?.total || 0),
                memoryCached: formatBytes(data.memory?.cached || 0).split(' ')[0],
                memoryBuffer: formatBytes(data.memory?.buffers || 0).split(' ')[0],
                swapUsed: data.memory?.swapUsed || 0,
                swapTotal: data.memory?.swapTotal || 0,

                // 磁盘信息
                disk: Math.round(data.disk?.usedPercent || 0),

                // 系统信息
                hostname: data.system?.hostname || '',
                os: data.system?.os || '',
                arch: data.system?.arch || '',
                uptime: data.system?.uptime || 0,
                processes: data.system?.processes || 0,

                // 网络接口
                networkInterfaces: data.network?.interfaces || []
            }

            console.log(newSystemInfo)

            // 更新全局状态
            globalSystemInfo.value = newSystemInfo
            lastUpdateTime.value = Date.now()

        } catch (error) {
            console.error('获取系统信息失败:', error)
            // 保持现有数据，不重置为默认值
        } finally {
            isRefreshing.value = false
        }
    }

    // 自动刷新 - 改进的定时器管理
    const startAutoRefresh = (interval = 5000): void => {
        // 清除现有定时器，确保只有一个定时器在运行
        if (refreshTimer) {
            clearInterval(refreshTimer)
        }

        // 创建新定时器
        refreshTimer = setInterval(async () => {
            await refreshSystemInfo()
        }, interval)
    }

    // 停止自动刷新
    const stopAutoRefresh = (): void => {
        if (refreshTimer) {
            clearInterval(refreshTimer)
            refreshTimer = null
        }
    }

    // 检查数据是否过期（超过30秒）
    const isDataStale = computed(() => {
        // 只有当 lastUpdateTime 被设置过（即大于0）才进行判断，避免初始状态误判
        return lastUpdateTime.value > 0 && (Date.now() - lastUpdateTime.value > 30000)
    })

    // 在组件卸载时清理全局定时器
    // 注意：由于 refreshTimer 是全局的，这个 onUnmounted 只会在第一个使用 useSystemInfo 的组件卸载时触发。
    // 如果你希望定时器在整个应用生命周期中只运行一次，并且在应用关闭时停止，这种全局管理是可行的。
    // 如果每个组件都需要独立的刷新逻辑，那么 refreshTimer 应该在 useSystemInfo 内部作为局部变量管理。
    // 考虑到你原始代码中的全局 ref 模式，我们保持 refreshTimer 为全局，并在这里进行清理。
    onUnmounted(() => {
        // 确保在组件卸载时停止自动刷新，避免内存泄漏
        stopAutoRefresh()
    })

    return {
        systemInfo,
        isRefreshing,
        isDataStale,
        lastUpdateTime,
        refreshSystemInfo,
        startAutoRefresh,
        stopAutoRefresh
    }
}
