import type { SystemInfo, CpuInfo, MemoryInfo, DiskInfo, NetworkInfo, ProcessInfo } from '~/types'

export const useSystemStore = defineStore('system', () => {
  const systemInfo = ref<SystemInfo>({
    load: '0.0',
    memory: 0,
    disk: 0,
    cpu: 0,
    memoryUsed: '0 GB',
    memoryTotal: '0 GB'
  })

  const cpuInfo = ref<CpuInfo | null>(null)
  const memoryInfo = ref<MemoryInfo | null>(null)
  const diskInfo = ref<DiskInfo[]>([])
  const networkInfo = ref<NetworkInfo | null>(null)
  const processes = ref<ProcessInfo[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  const refreshSystemInfo = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const api = useApi()
      const data = await api.getSystemInfo()
      systemInfo.value = data
    } catch (err: any) {
      error.value = err.message || '获取系统信息失败'
      console.error('获取系统信息失败:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshCpuInfo = async () => {
    try {
      const api = useApi()
      cpuInfo.value = await api.getCpuInfo()
    } catch (err: any) {
      console.error('获取CPU信息失败:', err)
    }
  }

  const refreshMemoryInfo = async () => {
    try {
      const api = useApi()
      memoryInfo.value = await api.getMemoryInfo()
    } catch (err: any) {
      console.error('获取内存信息失败:', err)
    }
  }

  const refreshDiskInfo = async () => {
    try {
      const api = useApi()
      diskInfo.value = await api.getDiskInfo()
    } catch (err: any) {
      console.error('获取磁盘信息失败:', err)
    }
  }

  const refreshNetworkInfo = async () => {
    try {
      const api = useApi()
      networkInfo.value = await api.getNetworkInfo()
    } catch (err: any) {
      console.error('获取网络信息失败:', err)
    }
  }

  const refreshProcesses = async () => {
    try {
      const api = useApi()
      processes.value = await api.getProcesses()
    } catch (err: any) {
      console.error('获取进程列表失败:', err)
    }
  }

  const killProcess = async (pid: number, signal: string = 'TERM') => {
    try {
      const api = useApi()
      await api.killProcess(pid, signal)
      // 刷新进程列表
      await refreshProcesses()
    } catch (err: any) {
      console.error('终止进程失败:', err)
      throw err
    }
  }

  const refreshAll = async () => {
    await Promise.all([
      refreshSystemInfo(),
      refreshCpuInfo(),
      refreshMemoryInfo(),
      refreshDiskInfo(),
      refreshNetworkInfo(),
      refreshProcesses()
    ])
  }

  let autoRefreshTimer: NodeJS.Timeout | null = null

  const startAutoRefresh = (interval = 5000) => {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
    }

    // 立即刷新一次
    refreshSystemInfo()

    // 设置定时刷新
    autoRefreshTimer = setInterval(refreshSystemInfo, interval)

    return autoRefreshTimer
  }

  const stopAutoRefresh = () => {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
      autoRefreshTimer = null
    }
  }

  return {
    // 状态
    systemInfo: readonly(systemInfo),
    cpuInfo: readonly(cpuInfo),
    memoryInfo: readonly(memoryInfo),
    diskInfo: readonly(diskInfo),
    networkInfo: readonly(networkInfo),
    processes: readonly(processes),
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    refreshSystemInfo,
    refreshCpuInfo,
    refreshMemoryInfo,
    refreshDiskInfo,
    refreshNetworkInfo,
    refreshProcesses,
    refreshAll,
    killProcess,
    startAutoRefresh,
    stopAutoRefresh
  }
})