<template>
  <div class="redis-content">
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <span class="text-gray-600">配置文件:</span>
              <span class="font-medium">{{ redisInfo.config }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">数据目录:</span>
              <span class="font-medium">{{ redisInfo.dataDir }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">最大内存:</span>
              <span class="font-medium">{{ redisInfo.maxMemory }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">持久化:</span>
              <span class="font-medium">{{ redisInfo.persistence }}</span>
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <Button label="重启Redis" icon="pi pi-refresh" size="small" />
            <Button label="清空缓存" icon="pi pi-trash" size="small" outlined severity="warning" />
            <Button label="编辑配置" icon="pi pi-cog" size="small" outlined />
          </div>
        </template>
      </Card>

      <!-- 键值管理 -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>键值管理</span>
            <Button label="添加键" icon="pi pi-plus" size="small" @click="showAddKey = true" />
          </div>
        </template>
        <template #content>
          <div class="mb-4">
            <InputText v-model="keySearch" placeholder="搜索键名..." class="w-full" @input="searchKeys" />
          </div>

          <DataTable :value="filteredKeys" responsive-layout="scroll" :rows="6" :paginator="true"
            :rowsPerPageOptions="[6, 10, 20]"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            current-page-report-template="显示第 {first} 到 {last} 条，共 {totalRecords} 条记录">
            <Column field="key" header="键名">
              <template #body="slotProps">
                <span class="font-mono text-sm">{{ slotProps.data.key }}</span>
              </template>
            </Column>
            <Column field="type" header="类型">
              <template #body="slotProps">
                <Tag :value="slotProps.data.type" severity="info" />
              </template>
            </Column>
            <Column field="ttl" header="TTL" />
            <Column header="操作" class="w-20">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <Button icon="pi pi-eye" size="small" text @click="viewKey(slotProps.data.key)" />
                  <Button icon="pi pi-trash" size="small" text severity="danger"
                    @click="deleteKey(slotProps.data.key)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- 添加键对话框 -->
    <Dialog v-model:visible="showAddKey" modal header="添加键值" :style="{ width: '600px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">键名</label>
          <InputText v-model="newKey.key" class="w-full" placeholder="输入键名" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">类型</label>
          <Dropdown v-model="newKey.type" :options="keyTypes" option-label="label" option-value="value" class="w-full"
            placeholder="选择类型" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">值</label>
          <Textarea v-model="newKey.value" class="w-full" rows="4" placeholder="输入值" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">过期时间 (秒)</label>
          <InputNumber v-model="newKey.ttl" class="w-full" placeholder="0表示永不过期" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showAddKey = false" />
        <Button label="添加" :loading="adding" @click="addKey" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: 'Redis管理 - EtaPanel'
})

// 响应式数据
const showAddKey = ref(false)
const adding = ref(false)
const keySearch = ref('')

const stats = ref({
  memory: '45.2 MB',
  keys: 1247,
  hitRate: '98.5%'
})

const redisInfo = ref({
  version: '7.0.8',
  uptime: '15天 8小时',
  config: '/etc/redis/redis.conf',
  dataDir: '/var/lib/redis',
  maxMemory: '512 MB',
  persistence: 'RDB + AOF'
})

const newKey = ref({
  key: '',
  type: 'string',
  value: '',
  ttl: 0
})

const keyTypes = [
  { label: 'String', value: 'string' },
  { label: 'Hash', value: 'hash' },
  { label: 'List', value: 'list' },
  { label: 'Set', value: 'set' },
  { label: 'Sorted Set', value: 'zset' }
]

// 获取键列表
const { data: keys } = await useLazyAsyncData('redis-keys', () => {
  return Promise.resolve([
    { key: 'user:1001', type: 'hash', ttl: '3600s' },
    { key: 'session:abc123', type: 'string', ttl: '1800s' },
    { key: 'cache:products', type: 'list', ttl: '永久' },
    { key: 'counter:visits', type: 'string', ttl: '永久' },
    { key: 'queue:emails', type: 'list', ttl: '永久' },
    { key: 'set:tags', type: 'set', ttl: '永久' },
    { key: 'sorted:scores', type: 'zset', ttl: '7200s' }
  ])
})

// 过滤键
const filteredKeys = computed(() => {
  if (!keys.value) return []
  if (!keySearch.value) return keys.value

  return keys.value.filter(key =>
    key.key.toLowerCase().includes(keySearch.value.toLowerCase())
  )
})

// 方法
const searchKeys = () => {
  // 搜索逻辑已在computed中处理
}

const viewKey = (key: string) => {
  console.log('查看键:', key)
}

const deleteKey = async (key: string) => {
  console.log('删除键:', key)
}

const addKey = async () => {
  if (!newKey.value.key || !newKey.value.value) return

  adding.value = true

  try {
    console.log('添加键:', newKey.value)

    newKey.value = {
      key: '',
      type: 'string',
      value: '',
      ttl: 0
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
.w-20 {
  width: 5rem;
}

.space-y-4>*+* {
  margin-top: 1rem;
}

.space-y-3>*+* {
  margin-top: 0.75rem;
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
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>