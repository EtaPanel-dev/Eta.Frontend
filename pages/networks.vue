<template>
  <div class="networks-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="创建网络" icon="pi pi-plus" @click="showCreateNetwork = true" />
        <Button label="清理未使用" icon="pi pi-trash" outlined severity="warning" />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索网络..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshNetworks" />
      </div>
    </div>

    <DataTable :value="filteredNetworks" :paginator="true" :rows="8" :rowsPerPageOptions="[5, 8, 15, 25]"
      responsive-layout="scroll" :loading="pending"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="显示第 {first} 到 {last} 条，共 {totalRecords} 条记录">
      <Column field="name" header="网络名称">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <i class="pi pi-sitemap text-blue-500" />
            <span class="font-medium">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="driver" header="驱动" />
      <Column field="scope" header="作用域" />
      <Column field="subnet" header="子网" />
      <Column field="gateway" header="网关" />
      <Column field="containers" header="容器数量" />
      <Column header="操作" class="w-32">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button icon="pi pi-eye" size="small" text @click="inspectNetwork(slotProps.data.id)" />
            <Button icon="pi pi-link" size="small" text @click="connectContainer(slotProps.data.id)" />
            <Button icon="pi pi-trash" size="small" text severity="danger" :disabled="slotProps.data.containers > 0"
              @click="deleteNetwork(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 创建网络对话框 -->
    <Dialog v-model:visible="showCreateNetwork" modal header="创建网络" :style="{ width: '600px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">网络名称</label>
          <InputText v-model="newNetwork.name" class="w-full" placeholder="输入网络名称" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">驱动</label>
          <Dropdown v-model="newNetwork.driver" :options="driverOptions" option-label="label" option-value="value"
            class="w-full" placeholder="选择驱动" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">子网</label>
          <InputText v-model="newNetwork.subnet" class="w-full" placeholder="172.20.0.0/16" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">网关</label>
          <InputText v-model="newNetwork.gateway" class="w-full" placeholder="172.20.0.1" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="newNetwork.internal" binary />
          <label class="text-sm">内部网络</label>
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateNetwork = false" />
        <Button label="创建" :loading="creating" @click="createNetwork" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: '网络管理 - EtaPanel'
})

// 响应式数据
const showCreateNetwork = ref(false)
const creating = ref(false)
const searchQuery = ref('')

const newNetwork = ref({
  name: '',
  driver: 'bridge',
  subnet: '',
  gateway: '',
  internal: false
})

const driverOptions = [
  { label: 'Bridge', value: 'bridge' },
  { label: 'Host', value: 'host' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Macvlan', value: 'macvlan' }
]

// 获取网络数据
const { data: networks, pending, refresh } = await useLazyAsyncData('networks', () => {
  return Promise.resolve([
    {
      id: '1',
      name: 'bridge',
      driver: 'bridge',
      scope: 'local',
      subnet: '172.17.0.0/16',
      gateway: '172.17.0.1',
      containers: 3
    },
    {
      id: '2',
      name: 'host',
      driver: 'host',
      scope: 'local',
      subnet: '-',
      gateway: '-',
      containers: 0
    },
    {
      id: '3',
      name: 'app-network',
      driver: 'bridge',
      scope: 'local',
      subnet: '172.20.0.0/16',
      gateway: '172.20.0.1',
      containers: 5
    },
    {
      id: '4',
      name: 'db-network',
      driver: 'bridge',
      scope: 'local',
      subnet: '172.21.0.0/16',
      gateway: '172.21.0.1',
      containers: 2
    }
  ])
})

// 过滤网络
const filteredNetworks = computed(() => {
  if (!networks.value) return []
  if (!searchQuery.value) return networks.value

  return networks.value.filter(network =>
    network.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const refreshNetworks = () => {
  refresh()
}

const inspectNetwork = (id: string) => {
  console.log('查看网络详情:', id)
}

const connectContainer = (id: string) => {
  console.log('连接容器到网络:', id)
}

const deleteNetwork = async (id: string) => {
  console.log('删除网络:', id)
}

const createNetwork = async () => {
  if (!newNetwork.value.name) return

  creating.value = true

  try {
    console.log('创建网络:', newNetwork.value)

    newNetwork.value = {
      name: '',
      driver: 'bridge',
      subnet: '',
      gateway: '',
      internal: false
    }

    showCreateNetwork.value = false
    await refresh()
  } catch (error) {
    console.error('创建网络失败:', error)
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.w-32 {
  width: 8rem;
}

.w-64 {
  width: 16rem;
}

.space-y-4>*+* {
  margin-top: 1rem;
}
</style>