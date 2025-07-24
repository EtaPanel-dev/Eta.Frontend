// 全局类型定义
export interface SystemInfo {
  load: string
  memory: number
  disk: number
  cpu: number
  memoryUsed: string
  memoryTotal: string
}

export interface Container {
  id: string
  name: string
  image: string
  status: string
  ports: string
  created: string
  uptime: string
}

export interface FileItem {
  name: string
  type: 'file' | 'directory'
  size: string
  permissions: string
  owner: string
  modified: string
  path: string
}

export interface MenuItem {
  key: string
  label: string
  icon: string
}

export interface MenuSection {
  title: string
  items: MenuItem[]
}

export interface SystemMetric {
  title: string
  value: string
  subtitle: string
  icon: string
  color: string
}

export interface DiskInfo {
  filesystem: string
  size: string
  used: string
  available: string
  usage: string
  usagePercent: number
  mountpoint: string
}

export interface SystemService {
  name: string
  description: string
  status: 'active' | 'inactive'
}