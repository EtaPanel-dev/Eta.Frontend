import type { SystemInfo } from '~/types'

export const useSystemInfo = () => {
    // 使用固定的初始值确保服务端和客户端一致
    const defaultSystemInfo: SystemInfo = {
        load: '1.2',
        memory: 68,
        disk: 45,
        cpu: 32,
        memoryUsed: '5.4 GB',
        memoryTotal: '8.0 GB'
    }

    const systemInfo = useState<SystemInfo>('systemInfo', () => defaultSystemInfo)

    return {
        systemInfo: readonly(systemInfo)
    }
}