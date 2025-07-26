import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSystemStore } from '~/stores/system'

// Mock useApi
const mockApi = {
    getSystemInfo: vi.fn(),
    getCpuInfo: vi.fn(),
    getMemoryInfo: vi.fn(),
    getDiskInfo: vi.fn(),
    getNetworkInfo: vi.fn(),
    getProcesses: vi.fn(),
    killProcess: vi.fn()
}

vi.mock('~/composables/useApi', () => ({
    useApi: () => mockApi
}))

describe('useSystemStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('should initialize with default state', () => {
        const systemStore = useSystemStore()

        expect(systemStore.systemInfo).toEqual({
            load: '0.0',
            memory: 0,
            disk: 0,
            cpu: 0,
            memoryUsed: '0 GB',
            memoryTotal: '0 GB'
        })
        expect(systemStore.loading).toBe(false)
        expect(systemStore.error).toBe(null)
    })

    it('should refresh system info successfully', async () => {
        const mockSystemInfo = {
            load: '1.5',
            memory: 75,
            disk: 45,
            cpu: 60,
            memoryUsed: '6 GB',
            memoryTotal: '8 GB'
        }

        mockApi.getSystemInfo.mockResolvedValue(mockSystemInfo)

        const systemStore = useSystemStore()
        await systemStore.refreshSystemInfo()

        expect(systemStore.systemInfo).toEqual(mockSystemInfo)
        expect(systemStore.loading).toBe(false)
        expect(systemStore.error).toBe(null)
    })

    it('should handle system info refresh error', async () => {
        const mockError = new Error('网络连接失败')
        mockApi.getSystemInfo.mockRejectedValue(mockError)

        const systemStore = useSystemStore()
        await systemStore.refreshSystemInfo()

        expect(systemStore.error).toBe('网络连接失败')
        expect(systemStore.loading).toBe(false)
    })

    it('should refresh CPU info', async () => {
        const mockCpuInfo = {
            usage: 45,
            cores: 4,
            model: 'Intel Core i7',
            frequency: 2800
        }

        mockApi.getCpuInfo.mockResolvedValue(mockCpuInfo)

        const systemStore = useSystemStore()
        await systemStore.refreshCpuInfo()

        expect(systemStore.cpuInfo).toEqual(mockCpuInfo)
    })

    it('should refresh memory info', async () => {
        const mockMemoryInfo = {
            total: 8589934592,
            used: 6442450944,
            free: 2147483648,
            available: 2147483648,
            usage: 75
        }

        mockApi.getMemoryInfo.mockResolvedValue(mockMemoryInfo)

        const systemStore = useSystemStore()
        await systemStore.refreshMemoryInfo()

        expect(systemStore.memoryInfo).toEqual(mockMemoryInfo)
    })

    it('should refresh processes', async () => {
        const mockProcesses = [
            {
                pid: 1234,
                name: 'nginx',
                cpu: 2.5,
                memory: 1.2,
                user: 'www-data',
                command: '/usr/sbin/nginx'
            },
            {
                pid: 5678,
                name: 'node',
                cpu: 15.3,
                memory: 8.7,
                user: 'app',
                command: 'node server.js'
            }
        ]

        mockApi.getProcesses.mockResolvedValue(mockProcesses)

        const systemStore = useSystemStore()
        await systemStore.refreshProcesses()

        expect(systemStore.processes).toEqual(mockProcesses)
    })

    it('should kill process successfully', async () => {
        const mockProcesses = [
            { pid: 1234, name: 'test-process' }
        ]

        mockApi.killProcess.mockResolvedValue(undefined)
        mockApi.getProcesses.mockResolvedValue([])

        const systemStore = useSystemStore()
        await systemStore.killProcess(1234, 'TERM')

        expect(mockApi.killProcess).toHaveBeenCalledWith(1234, 'TERM')
        expect(mockApi.getProcesses).toHaveBeenCalled()
    })

    it('should handle kill process error', async () => {
        const mockError = new Error('权限不足')
        mockApi.killProcess.mockRejectedValue(mockError)

        const systemStore = useSystemStore()

        await expect(systemStore.killProcess(1234)).rejects.toThrow('权限不足')
    })

    it('should refresh all data', async () => {
        mockApi.getSystemInfo.mockResolvedValue({})
        mockApi.getCpuInfo.mockResolvedValue({})
        mockApi.getMemoryInfo.mockResolvedValue({})
        mockApi.getDiskInfo.mockResolvedValue([])
        mockApi.getNetworkInfo.mockResolvedValue({})
        mockApi.getProcesses.mockResolvedValue([])

        const systemStore = useSystemStore()
        await systemStore.refreshAll()

        expect(mockApi.getSystemInfo).toHaveBeenCalled()
        expect(mockApi.getCpuInfo).toHaveBeenCalled()
        expect(mockApi.getMemoryInfo).toHaveBeenCalled()
        expect(mockApi.getDiskInfo).toHaveBeenCalled()
        expect(mockApi.getNetworkInfo).toHaveBeenCalled()
        expect(mockApi.getProcesses).toHaveBeenCalled()
    })

    it('should start and stop auto refresh', () => {
        vi.useFakeTimers()

        const systemStore = useSystemStore()
        mockApi.getSystemInfo.mockResolvedValue({})

        const timer = systemStore.startAutoRefresh(1000)

        expect(timer).toBeDefined()

        // Fast-forward time
        vi.advanceTimersByTime(1000)
        expect(mockApi.getSystemInfo).toHaveBeenCalled()

        systemStore.stopAutoRefresh()

        vi.useRealTimers()
    })
})