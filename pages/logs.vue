<template>
  <div class="logs-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Dropdown 
          v-model="selectedLogType" 
          :options="logTypes" 
          option-label="label" 
          option-value="value" 
          placeholder="选择日志类型"
          @change="loadLogs"
        />
        <Dropdown 
          v-model="selectedLevel" 
          :options="logLevels" 
          option-label="label" 
          option-value="value" 
          placeholder="日志级别"
          @change="filterLogs"
        />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索日志..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshLogs" />
        <Button label="清空日志" icon="pi pi-trash" severity="danger" outlined @click="clearLogs" />
      </div>
    </div>

    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span>{{ getCurrentLogTitle() }}</span>
          <div class="flex gap-2">
            <Button label="下载日志" icon="pi pi-download" size="small" outlined />
            <Button label="实时监控" icon="pi pi-eye" size="small" :severity="isRealTime ? 'success' : 'secondary'" @click="toggleRealTime" />
          </div>
        </div>
      </template>
      <template #content>
        <div class="log-viewer">
          <div class="log-stats mb-4">
            <div class="flex gap-6 text-sm">
              <span class="flex items-center gap-2 log-stat-item">
                <i class="pi pi-circle-fill text-red-500 text-xs" />
                <span class="font-medium">错误:</span>
                <span class="font-bold text-red-600">{{ logStats.error }}</span>
              </span>
              <span class="flex items-center gap-2 log-stat-item">
                <i class="pi pi-circle-fill text-yellow-500 text-xs" />
                <span class="font-medium">警告:</span>
                <span class="font-bold text-yellow-600">{{ logStats.warning }}</span>
              </span>
              <span class="flex items-center gap-2 log-stat-item">
                <i class="pi pi-circle-fill text-blue-500 text-xs" />
                <span class="font-medium">信息:</span>
                <span class="font-bold text-blue-600">{{ logStats.info }}</span>
              </span>
              <span class="flex items-center gap-2 log-stat-item">
                <i class="pi pi-circle-fill text-gray-500 text-xs" />
                <span class="font-medium">调试:</span>
                <span class="font-bold text-gray-600">{{ logStats.debug }}</span>
              </span>
            </div>
          </div>
          
          <div class="log-container">
            <div 
              v-for="(log, index) in filteredLogs" 
              :key="index"
              class="log-entry"
              :class="getLogLevelClass(log.level)"
            >
              <div class="log-header">
                <span class="log-time">{{ log.timestamp }}</span>
                <span class="log-level" :class="getLogLevelClass(log.level)">
                  <i :class="getLogLevelIcon(log.level)" />
                  {{ log.level }}
                </span>
                <span class="log-source">{{ log.source }}</span>
              </div>
              <div class="log-message">{{ log.message }}</div>
              <div v-if="log.details" class="log-details">
                <pre>{{ log.details }}</pre>
              </div>
            </div>
          </div>
          
          <div v-if="filteredLogs.length === 0" class="text-center py-8 text-gray-500">
            <i class="pi pi-file-text text-4xl mb-4" />
            <p>暂无日志数据</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: '系统日志 - EtaPanel'
})

// 响应式数据
const selectedLogType = ref('system')
const selectedLevel = ref('all')
const searchQuery = ref('')
const isRealTime = ref(false)

const logStats = ref({
  error: 12,
  warning: 45,
  info: 234,
  debug: 89
})

const logTypes = [
  { label: '系统日志', value: 'system' },
  { label: 'Nginx访问日志', value: 'nginx-access' },
  { label: 'Nginx错误日志', value: 'nginx-error' },
  { label: 'MySQL日志', value: 'mysql' },
  { label: 'PHP错误日志', value: 'php' },
  { label: '应用日志', value: 'application' }
]

const logLevels = [
  { label: '全部', value: 'all' },
  { label: '错误', value: 'error' },
  { label: '警告', value: 'warning' },
  { label: '信息', value: 'info' },
  { label: '调试', value: 'debug' }
]

// 获取日志数据
const { data: logs, pending, refresh } = await useLazyAsyncData('logs', () => {
  return Promise.resolve([
    {
      timestamp: '2024-01-20 16:45:23',
      level: 'error',
      source: 'nginx',
      message: 'Connection refused to upstream server',
      details: 'upstream: "http://127.0.0.1:3000/api/users"\nhost: "example.com"'
    },
    {
      timestamp: '2024-01-20 16:44:15',
      level: 'warning',
      source: 'mysql',
      message: 'Slow query detected (2.5s)',
      details: 'SELECT * FROM users WHERE created_at > "2024-01-01" ORDER BY id DESC LIMIT 1000'
    },
    {
      timestamp: '2024-01-20 16:43:08',
      level: 'info',
      source: 'system',
      message: 'User login successful',
      details: 'User: admin, IP: 192.168.1.100, Browser: Chrome/120.0'
    },
    {
      timestamp: '2024-01-20 16:42:30',
      level: 'debug',
      source: 'application',
      message: 'Cache miss for key: user_profile_1001',
      details: null
    },
    {
      timestamp: '2024-01-20 16:41:45',
      level: 'error',
      source: 'php',
      message: 'Fatal error: Uncaught Exception',
      details: 'Stack trace:\n#0 /var/www/html/index.php(25): Database->connect()\n#1 {main}'
    },
    {
      timestamp: '2024-01-20 16:40:12',
      level: 'info',
      source: 'nginx',
      message: 'Server started successfully',
      details: 'PID: 1234, Port: 80, Workers: 4'
    }
  ])
})

// 过滤日志
const filteredLogs = computed(() => {
  if (!logs.value) return []
  
  let filtered = logs.value
  
  // 按级别过滤
  if (selectedLevel.value !== 'all') {
    filtered = filtered.filter(log => log.level === selectedLevel.value)
  }
  
  // 按搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(query) ||
      log.source.toLowerCase().includes(query) ||
      (log.details && log.details.toLowerCase().includes(query))
    )
  }
  
  return filtered
})

// 方法
const getCurrentLogTitle = () => {
  const logType = logTypes.find(type => type.value === selectedLogType.value)
  return logType ? logType.label : '系统日志'
}

const getLogLevelClass = (level: string) => {
  const classMap: Record<string, string> = {
    'error': 'log-error',
    'warning': 'log-warning',
    'info': 'log-info',
    'debug': 'log-debug'
  }
  return classMap[level] || 'log-info'
}

const getLogLevelIcon = (level: string) => {
  const iconMap: Record<string, string> = {
    'error': 'pi pi-circle-fill text-red-500',
    'warning': 'pi pi-circle-fill text-yellow-500',
    'info': 'pi pi-circle-fill text-blue-500',
    'debug': 'pi pi-circle-fill text-gray-500'
  }
  return iconMap[level] || 'pi pi-circle-fill text-blue-500'
}

const loadLogs = () => {
  console.log('加载日志类型:', selectedLogType.value)
  refresh()
}

const filterLogs = () => {
  console.log('过滤日志级别:', selectedLevel.value)
}

const refreshLogs = () => {
  refresh()
}

const clearLogs = () => {
  console.log('清空日志:', selectedLogType.value)
}

const toggleRealTime = () => {
  isRealTime.value = !isRealTime.value
  console.log('实时监控:', isRealTime.value)
}
</script>

<style scoped>
.w-64 {
  width: 16rem;
}

.log-viewer {
  font-family: 'Courier New', monospace;
}

.log-container {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.log-entry {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.log-entry:hover {
  background-color: #f3f4f6;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.log-time {
  color: #6b7280;
  font-weight: 500;
}

.log-level {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.log-source {
  color: #4b5563;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.log-message {
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.log-details {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.5rem;
  margin-top: 0.5rem;
}

.log-details pre {
  margin: 0;
  font-size: 0.75rem;
  color: #4b5563;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 日志级别样式 */
.log-error {
  border-left: 4px solid #ef4444;
  background: linear-gradient(90deg, #fef2f2 0%, #ffffff 10%);
}

.log-error .log-level {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.log-warning {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(90deg, #fffbeb 0%, #ffffff 10%);
}

.log-warning .log-level {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.log-info {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(90deg, #eff6ff 0%, #ffffff 10%);
}

.log-info .log-level {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.log-debug {
  border-left: 4px solid #6b7280;
  background: linear-gradient(90deg, #f9fafb 0%, #ffffff 10%);
}

.log-debug .log-level {
  background: #f9fafb;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.log-stats {
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.log-stat-item {
  padding: 0.5rem 0.75rem;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.log-stat-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 圆点图标样式优化 */
.pi-circle-fill {
  font-size: 0.5rem;
}

.log-level .pi-circle-fill {
  font-size: 0.375rem;
}
</style>