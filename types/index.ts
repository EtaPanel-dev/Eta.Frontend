// 全局类型定义

// API响应基础类型
export interface ApiResponse<T = any> {
  status: number
  message: string
  data: T
}

// 登录相关类型
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_at: number
}

// 系统信息类型
export interface SystemInfo {
  load: string
  memory: number
  disk: number
  cpu: number
  cpuModel: string
  memoryUsed: string
  memoryTotal: string
  memoryCached: string
  memoryBuffer: string
  swapUsed: number
  swapTotal: number
  hostname: string
  os: string
  arch: string
  uptime: number
  processes: number
  cpuCores: number
  networkInterfaces: ApiNetworkInterface[]
}

// API返回的网络接口类型
export interface ApiNetworkInterface {
  name: string
  addresses: string[] | null
  mtu: number
  flags: string[]
  rxBytes: number
  txBytes: number
  rxPackets: number
  txPackets: number
}

export interface CpuInfo {
  usage: number
  cores: number
  model: string
  frequency: number
}

export interface MemoryInfo {
  total: number
  used: number
  free: number
  available: number
  usage: number
}

export interface DiskInfo {
  device: string
  mountPoint: string
  fsType: string
  total: number
  used: number
  available: number
  usedPercent: number
}

export interface NetworkInfo {
  interfaces: NetworkInterface[]
  connections: NetworkConnection[]
}

export interface NetworkInterface {
  name: string
  ip: string
  mac: string
  status: string
  rx: number
  tx: number
}

export interface NetworkConnection {
  protocol: string
  localAddress: string
  remoteAddress: string
  state: string
  pid: number
}

export interface ProcessInfo {
  pid: number
  name: string
  cpu: number
  memory: number
  user: string
  command: string
}

// Nginx相关类型
export interface NginxSite {
  id: number
  name: string
  domain: string
  root: string
  enabled: boolean
  ssl: boolean
  sslCert?: string
  sslKey?: string
  proxy: boolean
  proxyPass?: string
  forceHttps: boolean
  aliases: string[]
  index: string
  rewrite?: string
  accessLog: string
  errorLog: string
  configPath: string
  createdAt: string
  updatedAt: string
}

export interface NginxStatus {
  running: boolean
  version: string
  configTest: boolean
  activeConnections: number
  totalRequests: number
}

// 定时任务类型
export interface CrontabEntry {
  id: number
  name: string
  command: string
  schedule: string
  enabled: boolean
  user: string
  createdAt: string
  updatedAt: string
  lastRun?: string
  nextRun?: string
}

// SSL证书类型
export interface SSLCertificate {
  id: number
  domain: string
  issuer: string
  validFrom: string
  validTo: string
  status: 'valid' | 'expired' | 'expiring'
  autoRenew: boolean
  createdAt: string
  updatedAt: string
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

export interface SystemService {
  name: string
  description: string
  status: 'active' | 'inactive'
}