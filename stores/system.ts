export const useSystemStore = defineStore('system', () => {
  const systemInfo = ref({
    load: '0.0',
    memory: 0,
    disk: 0,
    cpu: 0,
    memoryUsed: '0 GB',
    memoryTotal: '0 GB'
  })

  const refreshSystemInfo = async () => {
    try {
      const api = useApi()
      const data = await api.getSystemInfo()
      systemInfo.value = data
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }

  const startAutoRefresh = (interval = 5000) => {
    const timer = setInterval(refreshSystemInfo, interval)
    return timer
  }

  return {
    systemInfo: readonly(systemInfo),
    refreshSystemInfo,
    startAutoRefresh
  }
})