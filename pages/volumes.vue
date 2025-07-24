<template>
  <div class="volumes-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="创建存储卷" icon="pi pi-plus" @click="showCreateVolume = true" />
        <Button label="清理未使用" icon="pi pi-trash" outlined severity="warning" />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索存储卷..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshVolumes" />
      </div>
    </div>

    <DataTable :value="filteredVolumes" :paginator="true" :rows="8" :rowsPerPageOptions="[5, 8, 15, 25]"
      responsive-layout="scroll"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="显示第 {first} 到 {last} 条，共 {totalRecords} 条记录" :loading="pending">
      <Column field="name" header="存储卷名称">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <i class="pi pi-database text-blue-500" />
            <span class="font-medium">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="driver" header="驱动" />
      <Column field="mountpoint" header="挂载点" />
      <Column field="size" header="大小" />
      <Column field="created" header="创建时间" />
      <Column field="containers" header="使用容器" />
      <Column header="操作" class="w-32">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button icon="pi pi-eye" size="small" text @click="inspectVolume(slotProps.data.name)" />
            <Button icon="pi pi-trash" size="small" text severity="danger" :disabled="slotProps.data.containers > 0"
              @click="deleteVolume(slotProps.data.name)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 创建存储卷对话框 -->
    <Dialog v-model:visible="showCreateVolume" modal header="创建存储卷" :style="{ width: '500px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">存储卷名称</label>
          <InputText v-model="newVolume.name" class="w-full" placeholder="输入存储卷名称" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">驱动</label>
          <Dropdown v-model="newVolume.driver" :options="driverOptions" option-label="label" option-value="value"
            class="w-full" placeholder="选择驱动" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">标签</label>
          <Textarea v-model="newVolume.labels" class="w-full" rows="3" placeholder="key=value" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateVolume = false" />
        <Button label="创建" :loading="creating" @click="createVolume" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: '存储卷管理 - EtaPanel'
})

// 响应式数据
const showCreateVolume = ref(false)
const creating = ref(false)
const searchQuery = ref('')

const newVolume = ref({
  name: '',
  driver: 'local',
  labels: ''
})

const driverOptions = [
  { label: 'Local', value: 'local' },
  { label: 'NFS', value: 'nfs' },
  { label: 'CIFS', value: 'cifs' }
]

// 获取存储卷数据
const { data: volumes, pending, refresh } = await useLazyAsyncData('volumes', () => {
  return Promise.resolve([
    {
      name: 'mysql_data',
      driver: 'local',
      mountpoint: '/var/lib/docker/volumes/mysql_data/_data',
      size: '2.3 GB',
      created: '2024-01-10 14:20',
      containers: 1
    },
    {
      name: 'redis_data',
      driver: 'local',
      mountpoint: '/var/lib/docker/volumes/redis_data/_data',
      size: '156 MB',
      created: '2024-01-08 09:15',
      containers: 1
    },
    {
      name: 'app_logs',
      driver: 'local',
      mountpoint: '/var/lib/docker/volumes/app_logs/_data',
      size: '45 MB',
      created: '2024-01-20 16:45',
      containers: 2
    },
    {
      name: 'backup_volume',
      driver: 'local',
      mountpoint: '/var/lib/docker/volumes/backup_volume/_data',
      size: '8.7 GB',
      created: '2024-01-05 11:30',
      containers: 0
    }
  ])
})

// 过滤存储卷
const filteredVolumes = computed(() => {
  if (!volumes.value) return []
  if (!searchQuery.value) return volumes.value

  return volumes.value.filter(volume =>
    volume.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const refreshVolumes = () => {
  refresh()
}

const inspectVolume = (name: string) => {
  console.log('查看存储卷:', name)
}

const deleteVolume = async (name: string) => {
  console.log('删除存储卷:', name)
}

const createVolume = async () => {
  if (!newVolume.value.name) return

  creating.value = true

  try {
    console.log('创建存储卷:', newVolume.value)

    newVolume.value = {
      name: '',
      driver: 'local',
      labels: ''
    }

    showCreateVolume.value = false
    await refresh()
  } catch (error) {
    console.error('创建存储卷失败:', error)
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