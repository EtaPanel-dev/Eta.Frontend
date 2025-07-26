import type {
  ApiResponse,
  LoginResponse,
  SystemInfo,
  CpuInfo,
  MemoryInfo,
  DiskInfo,
  NetworkInfo,
  ProcessInfo,
  NginxSite,
  NginxStatus,
  CrontabEntry,
  SSLCertificate,
  FileItem
} from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  // 通用API请求方法，支持完整的错误处理
  const apiRequest = async <T>(endpoint: string, options: RequestInit = {}, isLoginRequest = false): Promise<T> => {
    const authStore = useAuthStore()

    // 如果不是登录请求，检查认证状态
    if (!isLoginRequest) {
      if (!authStore.isAuthenticated) {
        throw new Error('用户未登录或登录已过期')
      }
    }

    try {
      const response = await $fetch<ApiResponse<T>>(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method: (options.method as any) || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authStore.token || '',
          ...options.headers,
        },
      })

      // 检查API响应状态
      if (response.code !== 200) {
        throw new Error(response.message || '请求失败')
      }

      return response.data
    } catch (error: any) {
      // 处理401未授权错误
      if (error.status === 401) {
        // 如果是登录请求的401错误，返回具体的错误信息
        if (isLoginRequest) {
          throw new Error(error.data?.message || '用户名或密码错误')
        }

        // 其他请求的401错误，表示token过期
        authStore.logout()
        throw new Error('登录已过期，请重新登录')
      }

      // 处理其他HTTP错误
      if (error.status) {
        throw new Error(error.data?.message || `请求失败 (${error.status})`)
      }

      // 处理网络错误
      throw new Error(error.message || '网络请求失败')
    }
  }
  // 系统监控API
  const getSystemInfo = () => apiRequest<SystemInfo>('/api/auth/system')
  const getCpuInfo = () => apiRequest<CpuInfo>('/api/auth/system/cpu')
  const getMemoryInfo = () => apiRequest<MemoryInfo>('/api/auth/system/memory')
  const getDiskInfo = () => apiRequest<DiskInfo[]>('/api/auth/system/disk')
  const getNetworkInfo = () => apiRequest<NetworkInfo>('/api/auth/system/network')
  const getProcesses = () => apiRequest<ProcessInfo[]>('/api/auth/system/processes')
  const killProcess = (pid: number, signal: string = 'TERM') => apiRequest<void>('/api/auth/system/process/kill', {
    method: 'POST',
    body: JSON.stringify({ pid, signal })
  })

  // 文件管理API
  const getFiles = (path: string = '/home') => apiRequest<{ currentPath: string, files: FileItem[] }>(`/api/auth/files?path=${encodeURIComponent(path)}`)

  const uploadFile = async (path: string, file: File) => {
    const authStore = useAuthStore()

    // 检查认证状态
    if (!authStore.isAuthenticated) {
      throw new Error('用户未登录或登录已过期')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)

    try {
      const response = await $fetch<ApiResponse<void>>(`${API_BASE_URL}/api/auth/files/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': authStore.token || ''
        }
      })

      if (response.code !== 200) {
        throw new Error(response.message || '上传失败')
      }

      return response.data
    } catch (error: any) {
      if (error.status === 401) {
        authStore.logout()
        throw new Error('登录已过期，请重新登录')
      }

      if (error.status === 403) {
        throw new Error('权限不足，无法上传文件')
      }

      if (error.status === 413) {
        throw new Error('文件过大，请选择较小的文件')
      }

      throw new Error(error.data?.message || error.message || '上传失败')
    }
  }

  const deleteFile = (path: string) => apiRequest<void>(`/api/auth/files?path=${encodeURIComponent(path)}`, { method: 'DELETE' })
  const createDirectory = (path: string) => apiRequest<void>('/api/auth/files/mkdir', {
    method: 'POST',
    body: JSON.stringify({ path })
  })
  const getFileContent = (path: string) => apiRequest<{ content: string }>(`/api/auth/files/content?path=${encodeURIComponent(path)}`)
  const saveFileContent = (path: string, content: string) => apiRequest<void>('/api/auth/files/content', {
    method: 'POST',
    body: JSON.stringify({ path, content })
  })
  const copyFile = (source: string, destination: string) => apiRequest<void>('/api/auth/files/copy', {
    method: 'POST',
    body: JSON.stringify({ source, destination })
  })
  const moveFile = (source: string, destination: string) => apiRequest<void>('/api/auth/files/move', {
    method: 'POST',
    body: JSON.stringify({ source, destination })
  })
  const compressFiles = (files: string[], output: string) => apiRequest<void>('/api/auth/files/compress', {
    method: 'POST',
    body: JSON.stringify({ files, output })
  })
  const extractFile = (file: string, destination: string) => apiRequest<void>('/api/auth/files/extract', {
    method: 'POST',
    body: JSON.stringify({ file, destination })
  })
  const getFilePermissions = (path: string) => apiRequest<{ permissions: string, owner: string, group: string }>(`/api/auth/files/permissions?path=${encodeURIComponent(path)}`)
  const setFilePermissions = (path: string, permissions: string, owner?: string, group?: string) => apiRequest<void>('/api/auth/files/permissions', {
    method: 'POST',
    body: JSON.stringify({ path, permissions, owner, group })
  })

  // Nginx管理API
  const getNginxStatus = () => apiRequest<NginxStatus>('/api/auth/nginx/status')
  const getNginxSites = () => apiRequest<NginxSite[]>('/api/auth/nginx/sites')
  const createNginxSite = (site: Partial<NginxSite>) => apiRequest<NginxSite>('/api/auth/nginx/sites', {
    method: 'POST',
    body: JSON.stringify(site)
  })
  const updateNginxSite = (id: number, site: Partial<NginxSite>) => apiRequest<NginxSite>(`/api/auth/nginx/sites/${id}`, {
    method: 'PUT',
    body: JSON.stringify(site)
  })
  const deleteNginxSite = (id: number) => apiRequest<void>(`/api/auth/nginx/sites/${id}`, { method: 'DELETE' })
  const toggleNginxSite = (id: number) => apiRequest<void>(`/api/auth/nginx/sites/${id}/toggle`, { method: 'POST' })
  const reloadNginx = () => apiRequest<void>('/api/auth/nginx/reload', { method: 'POST' })
  const restartNginx = () => apiRequest<void>('/api/auth/nginx/restart', { method: 'POST' })
  const testNginxConfig = () => apiRequest<{ valid: boolean, message: string }>('/api/auth/nginx/test', { method: 'POST' })
  const getNginxConfig = () => apiRequest<{ content: string }>('/api/auth/nginx/config')
  const updateNginxConfig = (content: string) => apiRequest<void>('/api/auth/nginx/config', {
    method: 'PUT',
    body: JSON.stringify({ content })
  })
  const resetNginxConfig = () => apiRequest<void>('/api/auth/nginx/config/reset', { method: 'POST' })

  // 定时任务API
  const getCrontabs = () => apiRequest<CrontabEntry[]>('/api/auth/crontab')
  const createCrontab = (crontab: Partial<CrontabEntry>) => apiRequest<CrontabEntry>('/api/auth/crontab', {
    method: 'POST',
    body: JSON.stringify(crontab)
  })
  const updateCrontab = (id: number, crontab: Partial<CrontabEntry>) => apiRequest<CrontabEntry>(`/api/auth/crontab/${id}`, {
    method: 'PUT',
    body: JSON.stringify(crontab)
  })
  const deleteCrontab = (id: number) => apiRequest<void>(`/api/auth/crontab/${id}`, { method: 'DELETE' })
  const toggleCrontab = (id: number) => apiRequest<void>(`/api/auth/crontab/${id}/toggle`, { method: 'POST' })

  // SSL证书管理API
  const getSSLCertificates = () => apiRequest<SSLCertificate[]>('/api/auth/acme/ssl')
  const createSSLCertificate = (ssl: Partial<SSLCertificate>) => apiRequest<SSLCertificate>('/api/auth/acme/ssl', {
    method: 'POST',
    body: JSON.stringify(ssl)
  })
  const updateSSLCertificate = (id: number, ssl: Partial<SSLCertificate>) => apiRequest<SSLCertificate>(`/api/auth/acme/ssl/${id}`, {
    method: 'PUT',
    body: JSON.stringify(ssl)
  })
  const deleteSSLCertificate = (id: number) => apiRequest<void>(`/api/auth/acme/ssl/${id}`, { method: 'DELETE' })

  // ACME客户端管理
  const getAcmeClients = () => apiRequest<any[]>('/api/auth/acme/clients')
  const createAcmeClient = (client: any) => apiRequest<any>('/api/auth/acme/clients', {
    method: 'POST',
    body: JSON.stringify(client)
  })
  const updateAcmeClient = (id: number, client: any) => apiRequest<any>(`/api/auth/acme/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(client)
  })
  const deleteAcmeClient = (id: number) => apiRequest<void>(`/api/auth/acme/clients/${id}`, { method: 'DELETE' })

  // DNS账号管理
  const getDnsAccounts = () => apiRequest<any[]>('/api/auth/acme/dns')
  const createDnsAccount = (account: any) => apiRequest<any>('/api/auth/acme/dns', {
    method: 'POST',
    body: JSON.stringify(account)
  })
  const updateDnsAccount = (id: number, account: any) => apiRequest<any>(`/api/auth/acme/dns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(account)
  })
  const deleteDnsAccount = (id: number) => apiRequest<void>(`/api/auth/acme/dns/${id}`, { method: 'DELETE' })

  // 认证API - 专门的登录方法，不使用通用的apiRequest
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await $fetch<any>(`${API_BASE_URL}/api/public/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      console.log('Login response:', response) // 调试用

      // 检查API响应状态 - 适配实际的响应格式
      const statusCode = response.code || response.status
      if (statusCode !== 200) {
        throw new Error(response.message || '登录失败')
      }

      // 确保返回的数据包含必要的字段
      if (!response.data || !response.data.token) {
        throw new Error('登录响应数据格式错误')
      }

      return response.data
    } catch (error: any) {
      console.log('Login error details:', error) // 调试用

      // 标记错误已被处理，避免全局错误处理器重复处理
      error.handled = true

      // 如果是$fetch抛出的HTTP错误，需要特殊处理
      if (error.data && typeof error.data === 'object') {
        // 处理服务器返回的结构化错误响应
        const statusCode = error.data.code || error.data.status
        if (statusCode && statusCode !== 200) {
          throw new Error(error.data.message || '登录失败')
        }
      }

      // 登录接口的错误处理，不进行token清理和跳转
      if (error.status === 401) {
        // 尝试从多个可能的位置获取错误信息
        const errorMessage = error.data?.message ||
          error.response?.data?.message ||
          error.statusText ||
          '用户名或密码错误'
        throw new Error(errorMessage)
      }

      if (error.status === 400) {
        const errorMessage = error.data?.message ||
          error.response?.data?.message ||
          '请求参数错误'
        throw new Error(errorMessage)
      }

      if (error.status >= 500) {
        const errorMessage = error.data?.message ||
          error.response?.data?.message ||
          '服务器内部错误，请稍后重试'
        throw new Error(errorMessage)
      }

      // 处理其他HTTP错误
      if (error.status) {
        const errorMessage = error.data?.message ||
          error.response?.data?.message ||
          `登录失败 (${error.status})`
        throw new Error(errorMessage)
      }

      // 处理网络错误
      throw new Error(error.message || '网络连接失败，请检查网络设置')
    }
  }



  return {
    // 系统监控
    getSystemInfo,
    getCpuInfo,
    getMemoryInfo,
    getDiskInfo,
    getNetworkInfo,
    getProcesses,
    killProcess,

    // 文件管理
    getFiles,
    uploadFile,
    deleteFile,
    createDirectory,
    getFileContent,
    saveFileContent,
    copyFile,
    moveFile,
    compressFiles,
    extractFile,
    getFilePermissions,
    setFilePermissions,

    // Nginx管理
    getNginxStatus,
    getNginxSites,
    createNginxSite,
    updateNginxSite,
    deleteNginxSite,
    toggleNginxSite,
    reloadNginx,
    restartNginx,
    testNginxConfig,
    getNginxConfig,
    updateNginxConfig,
    resetNginxConfig,

    // 定时任务
    getCrontabs,
    createCrontab,
    updateCrontab,
    deleteCrontab,
    toggleCrontab,

    // SSL证书
    getSSLCertificates,
    createSSLCertificate,
    updateSSLCertificate,
    deleteSSLCertificate,

    // ACME客户端
    getAcmeClients,
    createAcmeClient,
    updateAcmeClient,
    deleteAcmeClient,

    // DNS账号
    getDnsAccounts,
    createDnsAccount,
    updateDnsAccount,
    deleteDnsAccount,

    // 认证
    login
  }
}