<template>
  <div class="nosql-content">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 数据库类型菜单 -->
      <Card class="lg:col-span-1">
        <template #content>
          <div class="space-y-2">
            <div v-for="item in dbMenu" :key="item.key" class="db-menu-item"
              :class="{ active: activeTab === item.key }" @click="activeTab = item.key">
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- 数据库内容 -->
      <div class="lg:col-span-3">
        <!-- Redis -->
        <Card v-if="activeTab === 'redis'">
          <template #title>Redis管理</template>
          <template #content>
            <div class="redis-content min-content">
              <!-- Redis概览 -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card class="stat-card">
                  <template #content>
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-sm text-gray-600 mb-1">连接状态</div>
                        <div class="text-lg font-bold text-green-500">已连接</div>
                      </div>
                      <i class="pi pi-check-circle text-2xl text-green-500" />
                    </div>
                  </template>
                </Card>

                <Card class="stat-card">
                  <template #content>
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-sm text-gray-600 mb-1">内存使用</div>
                        <div class="text-2xl font-bold">{{ stats.memory }}</div>
                        <div class="text-xs text-gray-500">/ {{ stats.maxMemory }}</div>
                      </div>
                      <i class="pi pi-chart-bar text-2xl text-blue-500" />
                    </div>
                  </template>
                </Card>

                <Card class="stat-card">
                  <template #content>
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-sm text-gray-600 mb-1">键总数</div>
                        <div class="text-2xl font-bold">{{ stats.keys }}</div>
                      </div>
                      <i class="pi pi-key text-2xl text-orange-500" />
                    </div>
                  </template>
                </Card>

                <Card class="stat-card">
                  <template #content>
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-sm text-gray-600 mb-1">命中率</div>
                        <div class="text-2xl font-bold">{{ stats.hitRate }}</div>
                      </div>
                      <i class="pi pi-chart-pie text-2xl text-purple-500" />
                    </div>
                  </template>
                </Card>


              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <!-- Redis信息 -->
                <Card>
                  <template #title>Redis信息</template>
                  <template #content>
                    <div class="space-y-3">
                      <div class="flex justify-between">
                        <span class="text-gray-600">版本:</span>
                        <span class="font-medium">{{ redisInfo.version }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">运行时间:</span>
                        <span class="font-medium">{{ redisInfo.uptime }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">端口:</span>
                        <span class="font-medium">{{ redisInfo.port }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">模式:</span>
                        <span class="font-medium">{{ redisInfo.mode }}</span>
                      </div>
                    </div>

                    <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <Button label="重启" icon="pi pi-refresh" size="small" severity="warning" class="mb-0" />
                      <Button label="清空" icon="pi pi-trash" size="small" outlined severity="danger" class="mb-0" />
                    </div>
                  </template>
                </Card>

                <!-- 性能监控 -->
                <Card>
                  <template #title>性能监控</template>
                  <template #content>
                    <div class="space-y-3">
                      <div class="flex justify-between">
                        <span class="text-gray-600">QPS:</span>
                        <span class="font-medium text-green-600">{{ performance.qps }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">延迟:</span>
                        <span class="font-medium">{{ performance.latency }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">网络IO:</span>
                        <span class="font-medium">{{ performance.networkIO }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">CPU使用:</span>
                        <span class="font-medium">{{ performance.cpu }}</span>
                      </div>
                    </div>

                    <div class="mt-4 pt-4 border-t border-gray-200">
                      <Button label="性能报告" icon="pi pi-chart-line" size="small" outlined class="mb-0" />
                    </div>
                  </template>
                </Card>
              </div>

              <!-- 键值管理 -->
              <Card class="mt-3">
                <template #title>
                    <div class="flex items-center justify-between">
                      <span>键值管理</span>
                      <div class="flex gap-2">
                        <Button label="刷新" icon="pi pi-refresh" size="small" outlined @click="refreshKeys" />
                        <Button label="添加键" icon="pi pi-plus" size="small" @click="showAddKey = true" />
                      </div>
                    </div>
                </template>
                <template #content>
                    <div class="relative">
                      <!-- Loading overlay -->
                      <div v-if="keysLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded">
                        <div class="flex flex-col items-center">
                          <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-2"></i>
                          <span class="text-sm text-gray-600">刷新中...</span>
                        </div>
                      </div>
                      
                    <div class="flex gap-2 mb-4">
                      <InputText v-model="keySearch" placeholder="搜索键名..." class="flex-1" />
                      <Dropdown v-model="keyTypeFilter" :options="keyTypeOptions" option-label="label" option-value="value" placeholder="类型" class="w-32" />
                    </div>

                    <DataTable :value="filteredKeys" responsive-layout="scroll" :rows="8" :paginator="true" :loading="keysLoading" paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" :rows-per-page-options="[5,8,10,20]" current-page-report-template="显示 {first} 到 {last} 条，共 {totalRecords} 条">
                      <Column field="key" header="键名" sortable>
                        <template #body="slotProps">
                          <span class="font-mono text-sm">{{ slotProps.data.key }}</span>
                        </template>
                      </Column>
                      <Column field="type" header="类型" sortable>
                        <template #body="slotProps">
                          <Tag :value="slotProps.data.type" :severity="getTypeSeverity(slotProps.data.type)" />
                        </template>
                      </Column>
                      <Column field="size" header="大小" sortable />
                      <Column field="ttl" header="TTL" sortable>
                        <template #body="slotProps">
                          <span :class="{ 'text-red-500': slotProps.data.ttl !== '永久' && parseInt(slotProps.data.ttl) < 60 }">
                            {{ slotProps.data.ttl }}
                          </span>
                        </template>
                      </Column>
                      <Column header="操作" class="w-28">
                        <template #body="slotProps">
                          <div class="flex gap-1">
                            <Button icon="pi pi-eye" size="small" text @click="viewKey(slotProps.data.key)" v-tooltip="'查看'" />
                            <Button icon="pi pi-pencil" size="small" text @click="editKey(slotProps.data.key)" v-tooltip="'编辑'" />
                            <Button icon="pi pi-trash" size="small" text severity="danger" @click="deleteKey(slotProps.data.key)" v-tooltip="'删除'" />
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                    </div>
                </template>
              </Card>

              <!-- 添加键对话框 -->
              <Dialog v-model:visible="showAddKey" modal header="添加键值" :style="{ width: '600px' }">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">键名</label>
                    <InputText v-model="newKey.key" class="w-full" placeholder="输入键名" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">类型</label>
                    <Dropdown v-model="newKey.type" :options="keyTypes" option-label="label" option-value="value" class="w-full" placeholder="选择类型" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">值</label>
                    <Textarea v-model="newKey.value" class="w-full" rows="4" placeholder="输入值" />
                  </div>
                </div>
                <template #footer>
                  <div class="flex gap-2">
                    <Button label="取消" text @click="showAddKey = false" class="mb-0" />
                    <Button label="添加" :loading="adding" @click="addKey" class="mb-0" />
                  </div>
                </template>
              </Dialog>
            </div>
          </template>
        </Card>
        
        <!-- MongoDB -->
        <Card v-if="activeTab === 'mongodb'">
          <template #title>MongoDB管理</template>
          <template #content>
            <div class="mongodb-content min-content">
              <div class="text-center py-8">
                <i class="pi pi-database text-4xl text-green-500 mb-4" />
                <h3 class="text-xl font-semibold mb-2">MongoDB管理</h3>
                <p class="text-gray-600">MongoDB数据库管理功能开发中...</p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: 'NoSQL数据库管理 - EtaPanel'
})

const activeTab = ref('redis');

const dbMenu = [
  { key: 'redis', label: 'Redis', icon: 'pi pi-server' },
  { key: 'mongodb', label: 'MongoDB', icon: 'pi pi-database' }
]

// 响应式数据
const showAddKey = ref(false)
const adding = ref(false)
const keySearch = ref('')

const stats = ref({
  memory: '45.2 MB',
  maxMemory: '512 MB',
  keys: 1247,
  hitRate: '98.5%'
})

const redisInfo = ref({
  version: '7.0.8',
  uptime: '15天 8小时',
  port: '6379',
  mode: 'standalone'
})



const performance = ref({
  qps: '1,234',
  latency: '0.12ms',
  networkIO: '2.3MB/s',
  cpu: '12.5%'
})

const keysLoading = ref(false)
const keyTypeFilter = ref('')

const keyTypeOptions = [
  { label: '全部类型', value: '' },
  { label: 'String', value: 'string' },
  { label: 'Hash', value: 'hash' },
  { label: 'List', value: 'list' },
  { label: 'Set', value: 'set' },
  { label: 'ZSet', value: 'zset' }
]

const newKey = ref({
  key: '',
  type: 'string',
  value: ''
})

const keyTypes = [
  { label: 'String', value: 'string' },
  { label: 'Hash', value: 'hash' },
  { label: 'List', value: 'list' },
  { label: 'Set', value: 'set' }
]

// 获取键列表
const { data: keys } = await useLazyAsyncData('redis-keys', () => {
  return Promise.resolve([
    { key: 'user:1001', type: 'hash', size: '2.1KB', ttl: '3600s' },
    { key: 'session:abc123', type: 'string', size: '156B', ttl: '45s' },
    { key: 'cache:products', type: 'list', size: '15.2KB', ttl: '永久' },
    { key: 'counter:visits', type: 'string', size: '8B', ttl: '永久' },
    { key: 'config:app', type: 'hash', size: '1.8KB', ttl: '永久' },
    { key: 'queue:emails', type: 'list', size: '5.4KB', ttl: '7200s' },
    { key: 'lock:process', type: 'string', size: '32B', ttl: '30s' },
    { key: 'stats:daily', type: 'zset', size: '12.5KB', ttl: '86400s' }
  ])
})

// 过滤键
const filteredKeys = computed(() => {
  if (!keys.value) return []
  let filtered = keys.value

  // 按类型过滤
  if (keyTypeFilter.value) {
    filtered = filtered.filter(key => key.type === keyTypeFilter.value)
  }

  // 按搜索词过滤
  if (keySearch.value) {
    filtered = filtered.filter(key =>
      key.key.toLowerCase().includes(keySearch.value.toLowerCase())
    )
  }

  return filtered
})

// 方法
const refreshKeys = async () => {
  keysLoading.value = true
  // 模拟刷新
  setTimeout(() => {
    keysLoading.value = false
  }, 1000)
}

const viewKey = (key: string) => {
  console.log('查看键:', key)
}

const editKey = (key: string) => {
  console.log('编辑键:', key)
}

const deleteKey = async (key: string) => {
  console.log('删除键:', key)
}

const getTypeSeverity = (type: string) => {
  const severityMap = {
    string: 'success',
    hash: 'info',
    list: 'warning',
    set: 'danger',
    zset: 'secondary'
  }
  return severityMap[type] || 'info'
}

const addKey = async () => {
  if (!newKey.value.key || !newKey.value.value) return

  adding.value = true

  try {
    console.log('添加键:', newKey.value)

    newKey.value = {
      key: '',
      type: 'string',
      value: ''
    }

    showAddKey.value = false
  } catch (error) {
    console.error('添加键失败:', error)
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.nosql-content {
  /* 移除padding，由layout处理 */
}

.db-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  position: relative;
  white-space: nowrap;
}

.db-menu-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.db-menu-item.active {
  background-color: var(--accent-primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.w-20 {
  width: 5rem;
}

.w-28 {
  width: 7rem;
}

.w-32 {
  width: 8rem;
}

.flex-1 {
  flex: 1;
}

.stat-card {
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.font-mono {
  font-family: 'Courier New', monospace;
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:col-span-1 {
    grid-column: span 1 / span 1;
  }

  .lg\:col-span-3 {
    grid-column: span 3 / span 3;
  }

  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lg\:col-span-2 {
    grid-column: span 2 / span 2;
  }

  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.min-content {
  min-height: min-content;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-white {
  background-color: white;
}

.bg-opacity-75 {
  background-color: rgba(255, 255, 255, 0.75);
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.z-10 {
  z-index: 10;
}

.rounded {
  border-radius: 0.375rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-gray-600 {
  color: #4b5563;
}

.text-sm {
  font-size: 0.875rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
</style>