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
          v-if="!isAccessLog"
          v-model="selectedLevel"
          :options="logLevels"
          option-label="label"
          option-value="value"
          placeholder="选择日志级别"
          @change="filterLogs"
        />

        <Dropdown
          v-if="selectedLogType === 'nginx-access'"
          v-model="selectedStatusCode"
          :options="statusCodes"
          option-label="label"
          option-value="value"
          placeholder="状态码"
          @change="filterLogs"
        />
        <Dropdown
          v-if="selectedLogType === 'mysql'"
          v-model="selectedQueryType"
          :options="queryTypes"
          option-label="label"
          option-value="value"
          placeholder="查询类型"
          @change="filterLogs"
        />
      </div>
      <div class="flex gap-2">
        <InputText
          v-if="selectedLogType === 'nginx-access'"
          v-model="ipFilter"
          placeholder="IP地址过滤"
          class="w-32"
        />
        <InputText
          v-if="selectedLogType === 'mysql'"
          v-model="durationFilter"
          placeholder="执行时间(ms)"
          class="w-32"
        />
        <InputText
          v-model="searchQuery"
          :placeholder="getSearchPlaceholder()"
          class="w-64"
        />
        <Button icon="pi pi-refresh" outlined @click="refreshLogs" />
        <Button
          label="清空日志"
          icon="pi pi-trash"
          severity="danger"
          outlined
          @click="clearLogs"
        />
      </div>
    </div>

    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span>{{ getCurrentLogTitle() }}</span>
          <div class="flex gap-2">
            <Button
              label="下载日志"
              icon="pi pi-download"
              size="small"
              outlined
            />
            <Button
              label="实时监控"
              icon="pi pi-eye"
              size="small"
              :severity="isRealTime ? 'success' : 'secondary'"
              @click="toggleRealTime"
            />
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
                <span class="font-bold text-yellow-600">{{
                  logStats.warning
                }}</span>
              </span>
              <span class="flex items-center gap-2 log-stat-item">
                <i class="pi pi-circle-fill text-blue-500 text-xs" />
                <span class="font-medium">信息:</span>
                <span class="font-bold text-blue-600">{{ logStats.info }}</span>
              </span>
              <span class="flex items-center gap-2 log-stat-item">
                <i class="pi pi-circle-fill text-gray-500 text-xs" />
                <span class="font-medium">调试:</span>
                <span class="font-bold text-gray-600">{{
                  logStats.debug
                }}</span>
              </span>
            </div>
          </div>

          <div class="log-container">
            <div
              v-for="(log, index) in filteredLogs"
              :key="index"
              class="log-entry"
              :class="getLogEntryClass(log)"
            >
              <!-- Nginx访问日志格式 -->
              <div v-if="selectedLogType === 'nginx-access'" class="log-header">
                <span class="log-time">{{ log.timestamp }}</span>
                <span class="log-ip">{{ log.ip }}</span>
                <span class="log-method" :class="getMethodClass(log.method)">{{ log.method }}</span>
                <span class="log-status" :class="getStatusClass(log.status)">{{ log.status }}</span>
                <span class="log-duration">{{ log.duration }}s</span>
              </div>
              
              <!-- MySQL日志格式 -->
              <div v-else-if="selectedLogType === 'mysql'" class="log-header">
                <span class="log-time">{{ log.timestamp }}</span>
                <span class="log-query-type" :class="getQueryTypeClass(log.queryType)">{{ log.queryType }}</span>
                <span class="log-database">{{ log.database }}.{{ log.table }}</span>
                <span class="log-duration" :class="getDurationClass(log.duration)">{{ log.duration }}s</span>
              </div>
              
              <!-- 系统日志格式 -->
              <div v-else class="log-header">
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

          <div
            v-if="filteredLogs.length === 0"
            class="text-center py-8 text-gray-500"
          >
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
  title: "系统日志 - EtaPanel",
});

// 响应式数据
const selectedLogType = ref("system");
const selectedLevel = ref("all");
const selectedStatusCode = ref("all");
const selectedQueryType = ref("all");

const ipFilter = ref("");
const durationFilter = ref("");
const searchQuery = ref("");
const isRealTime = ref(false);

const logStats = ref({
  error: 12,
  warning: 45,
  info: 234,
  debug: 89,
});

const logTypes = [
  { label: "系统日志", value: "system" },
  { label: "Nginx访问日志", value: "nginx-access" },
  { label: "Nginx错误日志", value: "nginx-error" },
  { label: "MySQL日志", value: "mysql" },
  { label: "PHP错误日志", value: "php" },
  { label: "应用日志", value: "application" },
];

const logLevels = [
  { label: "全部日志", value: "all" },
  { label: "错误", value: "error" },
  { label: "警告", value: "warning" },
  { label: "信息", value: "info" },
  { label: "调试", value: "debug" },
];

const statusCodes = [
  { label: "全部状态码", value: "all" },
  { label: "2xx 成功", value: "2xx" },
  { label: "3xx 重定向", value: "3xx" },
  { label: "4xx 客户端错误", value: "4xx" },
  { label: "5xx 服务器错误", value: "5xx" },
  { label: "200 OK", value: "200" },
  { label: "404 Not Found", value: "404" },
  { label: "500 Internal Error", value: "500" },
];

const queryTypes = [
  { label: "全部查询", value: "all" },
  { label: "SELECT", value: "SELECT" },
  { label: "INSERT", value: "INSERT" },
  { label: "UPDATE", value: "UPDATE" },
  { label: "DELETE", value: "DELETE" },
  { label: "慢查询", value: "slow" },
];



// 计算属性：是否为访问日志
const isAccessLog = computed(() => {
  return selectedLogType.value === 'nginx-access' || selectedLogType.value === 'mysql';
});

// 获取日志数据
const { data: logs, refresh } = await useLazyAsyncData("logs", () => {
  // 根据日志类型返回不同的模拟数据
  if (selectedLogType.value === 'nginx-access') {
    return Promise.resolve([
      {
        timestamp: "2024-01-20 16:45:23",
        ip: "192.168.1.100",
        method: "GET",
        url: "/api/users",
        status: "200",
        size: "1024",
        duration: "0.123",
        userAgent: "Mozilla/5.0 Chrome/120.0",
        message: "GET /api/users 200 1024 0.123s",
      },
      {
        timestamp: "2024-01-20 16:44:15",
        ip: "10.0.0.50",
        method: "POST",
        url: "/api/login",
        status: "404",
        size: "512",
        duration: "0.045",
        userAgent: "Mozilla/5.0 Firefox/121.0",
        message: "POST /api/login 404 512 0.045s",
      },
      {
        timestamp: "2024-01-20 16:43:08",
        ip: "172.16.0.10",
        method: "GET",
        url: "/dashboard",
        status: "500",
        size: "2048",
        duration: "1.234",
        userAgent: "Mozilla/5.0 Safari/17.0",
        message: "GET /dashboard 500 2048 1.234s",
      },
    ]);
  } else if (selectedLogType.value === 'nginx-error') {
    return Promise.resolve([
      {
        timestamp: "2024-01-20 16:45:23",
        level: "error",
        source: "nginx",
        message: "Connection refused to upstream server",
        details: 'upstream: "http://127.0.0.1:3000/api/users"\nhost: "example.com"',
      },
      {
        timestamp: "2024-01-20 16:44:15",
        level: "error",
        source: "nginx",
        message: "SSL certificate verification failed",
        details: "certificate: /etc/ssl/certs/example.com.crt",
      },
      {
        timestamp: "2024-01-20 16:43:08",
        level: "warning",
        source: "nginx",
        message: "Worker process exited unexpectedly",
        details: "PID: 5678, Signal: 11",
      },
    ]);
  } else if (selectedLogType.value === 'mysql') {
    return Promise.resolve([
      {
        timestamp: "2024-01-20 16:45:23",
        queryType: "SELECT",
        duration: "0.023",
        database: "app_db",
        table: "users",
        message: "SELECT * FROM users WHERE id = 1001",
        details: "Rows examined: 1, Rows sent: 1",
      },
      {
        timestamp: "2024-01-20 16:44:15",
        queryType: "slow",
        duration: "2.567",
        database: "app_db",
        table: "orders",
        message: "SELECT * FROM orders WHERE created_at > '2024-01-01' ORDER BY id DESC LIMIT 1000",
        details: "Rows examined: 50000, Rows sent: 1000",
      },
      {
        timestamp: "2024-01-20 16:43:08",
        queryType: "INSERT",
        duration: "0.156",
        database: "app_db",
        table: "logs",
        message: "INSERT INTO logs (level, message, created_at) VALUES ('info', 'User login', NOW())",
        details: "Affected rows: 1",
      },
    ]);
  } else if (selectedLogType.value === 'php') {
    return Promise.resolve([
      {
        timestamp: "2024-01-20 16:45:23",
        level: "error",
        source: "php",
        message: "Fatal error: Uncaught Exception",
        details: "Stack trace:\n#0 /var/www/html/index.php(25): Database->connect()\n#1 {main}",
      },
      {
        timestamp: "2024-01-20 16:44:15",
        level: "warning",
        source: "php",
        message: "Deprecated function used: mysql_connect()",
        details: "File: /var/www/html/legacy.php, Line: 42",
      },
      {
        timestamp: "2024-01-20 16:43:08",
        level: "error",
        source: "php",
        message: "Memory limit exceeded",
        details: "Allowed memory size: 128M, Used: 130M",
      },
    ]);
  } else if (selectedLogType.value === 'application') {
    return Promise.resolve([
      {
        timestamp: "2024-01-20 16:45:23",
        level: "info",
        source: "application",
        message: "User login successful",
        details: "User: admin, IP: 192.168.1.100, Browser: Chrome/120.0",
      },
      {
        timestamp: "2024-01-20 16:44:15",
        level: "debug",
        source: "application",
        message: "Cache miss for key: user_profile_1001",
        details: null,
      },
      {
        timestamp: "2024-01-20 16:43:08",
        level: "warning",
        source: "application",
        message: "API rate limit exceeded",
        details: "IP: 192.168.1.100, Endpoint: /api/users, Limit: 100/hour",
      },
    ]);
  }
  
  // 默认系统日志
  return Promise.resolve([
    {
      timestamp: "2024-01-20 16:45:23",
      level: "info",
      source: "system",
      message: "System startup completed",
      details: "Boot time: 45.2s, Services: 12 started",
    },
    {
      timestamp: "2024-01-20 16:44:15",
      level: "warning",
      source: "system",
      message: "Disk space low on /var partition",
      details: "Available: 2.1GB, Used: 87%",
    },
    {
      timestamp: "2024-01-20 16:43:08",
      level: "error",
      source: "system",
      message: "Failed to start service: docker",
      details: "Exit code: 1, Error: Permission denied",
    },
    {
      timestamp: "2024-01-20 16:42:30",
      level: "info",
      source: "system",
      message: "Cron job executed successfully",
      details: "Job: backup-database, Duration: 2.3s",
    },
  ]);
});

// 过滤日志
const filteredLogs = computed(() => {
  if (!logs.value) return [];

  let filtered = logs.value;

  // Nginx访问日志筛选
  if (selectedLogType.value === 'nginx-access') {
    // 按状态码过滤
    if (selectedStatusCode.value !== "all") {
      if (selectedStatusCode.value.endsWith('xx')) {
        const prefix = selectedStatusCode.value.charAt(0);
        filtered = filtered.filter((log: any) => log.status.startsWith(prefix));
      } else {
        filtered = filtered.filter((log: any) => log.status === selectedStatusCode.value);
      }
    }
    
    // 按IP地址过滤
    if (ipFilter.value) {
      filtered = filtered.filter((log: any) => 
        log.ip.includes(ipFilter.value)
      );
    }
  }
  
  // MySQL日志筛选
  else if (selectedLogType.value === 'mysql') {
    // 按查询类型过滤
    if (selectedQueryType.value !== "all") {
      filtered = filtered.filter((log: any) => {
        if (selectedQueryType.value === 'slow') {
          return log.queryType === 'slow' || parseFloat(log.duration) > 1.0;
        }
        return log.queryType === selectedQueryType.value;
      });
    }
    
    // 按执行时间过滤
    if (durationFilter.value) {
      const maxDuration = parseFloat(durationFilter.value) / 1000; // 转换为秒
      filtered = filtered.filter((log: any) => 
        parseFloat(log.duration) >= maxDuration
      );
    }
  }
  
  // 系统日志筛选
  else {
    // 按级别过滤
    if (selectedLevel.value !== "all") {
      filtered = filtered.filter((log: any) => log.level === selectedLevel.value);
    }
    

  }

  // 通用搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((log: any) => {
      const searchFields = [log.message];
      
      // 根据日志类型添加不同的搜索字段
      if (selectedLogType.value === 'nginx-access') {
        searchFields.push(log.ip, log.method, log.url, log.userAgent);
      } else if (selectedLogType.value === 'mysql') {
        searchFields.push(log.database, log.table, log.queryType);
      } else {
        searchFields.push(log.source);
        if (log.details) searchFields.push(log.details);
      }
      
      return searchFields.some(field => 
        field && field.toLowerCase().includes(query)
      );
    });
  }

  return filtered;
});

// 监听日志类型变化，自动刷新数据
watch(selectedLogType, () => {
  refresh();
});

// 方法
const getCurrentLogTitle = () => {
  const logType = logTypes.find((type) => type.value === selectedLogType.value);
  return logType ? logType.label : "系统日志";
};

const getLogEntryClass = (log: any) => {
  if (selectedLogType.value === 'nginx-access') {
    const status = parseInt(log.status);
    if (status >= 500) return "log-error";
    if (status >= 400) return "log-warning";
    return "log-info";
  } else if (selectedLogType.value === 'mysql') {
    const duration = parseFloat(log.duration);
    if (duration > 2.0 || log.queryType === 'slow') return "log-warning";
    return "log-info";
  }
  return getLogLevelClass(log.level);
};

const getLogLevelClass = (level: string) => {
  const classMap: Record<string, string> = {
    error: "log-error",
    warning: "log-warning",
    info: "log-info",
    debug: "log-debug",
  };
  return classMap[level] || "log-info";
};

const getMethodClass = (method: string) => {
  const classMap: Record<string, string> = {
    GET: "method-get",
    POST: "method-post",
    PUT: "method-put",
    DELETE: "method-delete",
  };
  return classMap[method] || "method-default";
};

const getStatusClass = (status: string) => {
  const code = parseInt(status);
  if (code >= 500) return "status-error";
  if (code >= 400) return "status-warning";
  if (code >= 300) return "status-info";
  return "status-success";
};

const getQueryTypeClass = (queryType: string) => {
  const classMap: Record<string, string> = {
    SELECT: "query-select",
    INSERT: "query-insert",
    UPDATE: "query-update",
    DELETE: "query-delete",
    slow: "query-slow",
  };
  return classMap[queryType] || "query-default";
};

const getDurationClass = (duration: string) => {
  const time = parseFloat(duration);
  if (time > 2.0) return "duration-slow";
  if (time > 1.0) return "duration-medium";
  return "duration-fast";
};

const getSearchPlaceholder = () => {
  if (selectedLogType.value === 'nginx-access') {
    return "搜索URL、User-Agent...";
  } else if (selectedLogType.value === 'mysql') {
    return "搜索SQL、数据库、表名...";
  }
  return "搜索日志...";
};

const getLogLevelIcon = (level: string) => {
  const iconMap: Record<string, string> = {
    error: "pi pi-circle-fill text-red-500",
    warning: "pi pi-circle-fill text-yellow-500",
    info: "pi pi-circle-fill text-blue-500",
    debug: "pi pi-circle-fill text-gray-500",
  };
  return iconMap[level] || "pi pi-circle-fill text-blue-500";
};

const loadLogs = () => {
  console.log("加载日志类型:", selectedLogType.value);
  // 重置筛选条件
  selectedLevel.value = "all";
  selectedStatusCode.value = "all";
  selectedQueryType.value = "all";

  ipFilter.value = "";
  durationFilter.value = "";
  searchQuery.value = "";
  refresh();
};

const filterLogs = () => {
  console.log("过滤日志级别:", selectedLevel.value);
};

const refreshLogs = () => {
  refresh();
};

const clearLogs = () => {
  console.log("清空日志:", selectedLogType.value);
};

const toggleRealTime = () => {
  isRealTime.value = !isRealTime.value;
  console.log("实时监控:", isRealTime.value);
};
</script>

<style scoped>
.logs-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.w-64 {
  width: 16rem;
}

.log-viewer {
  font-family: "Courier New", monospace;
}

.log-container {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

.log-entry {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-tertiary);
  transition: all 0.3s ease;
}

.log-entry:hover {
  background-color: var(--bg-tertiary);
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
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
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
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.log-message {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.log-details {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  border-radius: 0.25rem;
  padding: 0.5rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.log-details pre {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
  transition: color 0.3s ease;
}

/* 日志级别样式 - 支持深色模式 */
.log-error {
  border-left: 4px solid var(--danger);
  background: linear-gradient(
    90deg,
    rgba(239, 68, 68, 0.1) 0%,
    var(--bg-secondary) 10%
  );
  transition: all 0.3s ease;
}

.log-error .log-level {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.log-warning {
  border-left: 4px solid var(--warning);
  background: linear-gradient(
    90deg,
    rgba(245, 158, 11, 0.1) 0%,
    var(--bg-secondary) 10%
  );
  transition: all 0.3s ease;
}

.log-warning .log-level {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.log-info {
  border-left: 4px solid var(--info);
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.1) 0%,
    var(--bg-secondary) 10%
  );
  transition: all 0.3s ease;
}

.log-info .log-level {
  background: rgba(59, 130, 246, 0.1);
  color: var(--info);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.log-debug {
  border-left: 4px solid var(--text-tertiary);
  background: linear-gradient(
    90deg,
    rgba(156, 163, 175, 0.1) 0%,
    var(--bg-secondary) 10%
  );
  transition: all 0.3s ease;
}

.log-debug .log-level {
  background: rgba(156, 163, 175, 0.1);
  color: var(--text-tertiary);
  border: 1px solid rgba(156, 163, 175, 0.2);
}

.log-stats {
  padding: 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.log-stat-item {
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border-radius: 0.375rem;
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
}

.log-stat-item:hover {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* 圆点图标样式优化 */
.pi-circle-fill {
  font-size: 0.5rem;
}

.log-level .pi-circle-fill {
  font-size: 0.375rem;
}

/* 日志统计项颜色修正 - 确保生产环境一致性 */
.text-red-600 {
  color: #dc2626 !important;
}

.text-yellow-600 {
  color: #d97706 !important;
}

.text-blue-600 {
  color: #2563eb !important;
}

.text-gray-600 {
  color: #4b5563 !important;
}

/* 深色模式颜色修正 */
@media (prefers-color-scheme: dark) {
  .text-red-600 {
    color: #f87171 !important;
  }

  .text-yellow-600 {
    color: #fbbf24 !important;
  }

  .text-blue-600 {
    color: #60a5fa !important;
  }

  .text-gray-600 {
    color: #9ca3af !important;
  }
}

/* 空状态样式优化 */
.text-center.py-8.text-gray-500 {
  color: var(--text-secondary) !important;
  transition: color 0.3s ease;
}

.text-center.py-8.text-gray-500 .pi {
  color: var(--text-tertiary) !important;
  transition: color 0.3s ease;
}

/* Nginx访问日志样式 */
.log-ip {
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: monospace;
  transition: all 0.3s ease;
}

.log-method {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.method-get {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.method-post {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.method-put {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.method-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.method-default {
  background: rgba(156, 163, 175, 0.1);
  color: var(--text-tertiary);
  border: 1px solid rgba(156, 163, 175, 0.2);
}

.log-status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: monospace;
}

.status-success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.status-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* MySQL日志样式 */
.log-query-type {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.query-select {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.query-insert {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.query-update {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.query-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.query-slow {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.query-default {
  background: rgba(156, 163, 175, 0.1);
  color: var(--text-tertiary);
  border: 1px solid rgba(156, 163, 175, 0.2);
}

.log-database {
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: monospace;
  transition: all 0.3s ease;
}

.log-duration {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: monospace;
}

.duration-fast {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.duration-medium {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.duration-slow {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* 响应式布局优化 */
.w-32 {
  width: 8rem;
}

@media (max-width: 768px) {
  .log-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .w-32, .w-64 {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
