import type { Container, SystemInfo, FileItem } from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl
  
  

  const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = useCookie('auth-token')
    const response = await $fetch<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token.value ? `Bearer ${token.value}` : '',
        ...options.headers,
      },
    })
    return response
  }
  // 系统监控API
  const getSystemInfo = () => apiRequest<SystemInfo>('/api/auth/system')
  const getCpuInfo = () => apiRequest('/api/auth/system/cpu')
  const getMemoryInfo = () => apiRequest('/api/auth/system/memory')
  const getDiskInfo = () => apiRequest('/api/auth/system/disk')
  const getNetworkInfo = () => apiRequest('/api/auth/system/network')
  const getProcesses = () => apiRequest('/api/auth/system/processes')
  const killProcess = (pid: number, signal: string = 'TERM') => apiRequest('/api/auth/system/process/kill', {
    method: 'POST',
    body: JSON.stringify({ pid, signal })
  })

  // 文件管理API
  const getFiles = (path: string = '/home') => apiRequest(`/api/auth/files?path=${encodeURIComponent(path)}`)
  const uploadFile = async (path: string, file: File) => {
    const token = useCookie('auth-token')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)
    return await $fetch(`${API_BASE_URL}/api/auth/files/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': token.value ? `Bearer ${token.value}` : ''
      }
    })
  }
  const deleteFile = (path: string) => apiRequest(`/api/auth/files?path=${encodeURIComponent(path)}`, { method: 'DELETE' })
  const createDirectory = (path: string) => apiRequest('/api/auth/files/mkdir', {
    method: 'POST',
    body: JSON.stringify({ path })
  })
  const getFileContent = (path: string) => apiRequest(`/api/auth/files/content?path=${encodeURIComponent(path)}`)
  const saveFileContent = (path: string, content: string) => apiRequest('/api/auth/files/content', {
    method: 'POST',
    body: JSON.stringify({ path, content })
  })

  // Nginx管理API
  const getNginxStatus = () => apiRequest('/api/auth/nginx/status')
  const getNginxSites = () => apiRequest('/api/auth/nginx/sites')
  const createNginxSite = (site: any) => apiRequest('/api/auth/nginx/sites', {
    method: 'POST',
    body: JSON.stringify(site)
  })
  const updateNginxSite = (id: number, site: any) => apiRequest(`/api/auth/nginx/sites/${id}`, {
    method: 'PUT',
    body: JSON.stringify(site)
  })
  const deleteNginxSite = (id: number) => apiRequest(`/api/auth/nginx/sites/${id}`, { method: 'DELETE' })
  const toggleNginxSite = (id: number) => apiRequest(`/api/auth/nginx/sites/${id}/toggle`, { method: 'POST' })
  const reloadNginx = () => apiRequest('/api/auth/nginx/reload', { method: 'POST' })

  // 定时任务API
  const getCrontabs = () => apiRequest('/api/auth/crontab')
  const createCrontab = (crontab: any) => apiRequest('/api/auth/crontab', {
    method: 'POST',
    body: JSON.stringify(crontab)
  })
  const updateCrontab = (id: number, crontab: any) => apiRequest(`/api/auth/crontab/${id}`, {
    method: 'PUT',
    body: JSON.stringify(crontab)
  })
  const deleteCrontab = (id: number) => apiRequest(`/api/auth/crontab/${id}`, { method: 'DELETE' })
  const toggleCrontab = (id: number) => apiRequest(`/api/auth/crontab/${id}/toggle`, { method: 'POST' })

  // SSL证书管理API
  const getSSLCertificates = () => apiRequest('/api/auth/acme/ssl')
  const createSSLCertificate = (ssl: any) => apiRequest('/api/auth/acme/ssl', {
    method: 'POST',
    body: JSON.stringify(ssl)
  })
  const deleteSSLCertificate = (id: number) => apiRequest(`/api/auth/acme/ssl/${id}`, { method: 'DELETE' })

  // 认证API
  const login = (username: string, password: string) => apiRequest('/api/public/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  


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
    
    // Nginx管理
    getNginxStatus,
    getNginxSites,
    createNginxSite,
    updateNginxSite,
    deleteNginxSite,
    toggleNginxSite,
    reloadNginx,
    
    // 定时任务
    getCrontabs,
    createCrontab,
    updateCrontab,
    deleteCrontab,
    toggleCrontab,
    
    // SSL证书
    getSSLCertificates,
    createSSLCertificate,
    deleteSSLCertificate,
    
    // 认证
    login
  }
}