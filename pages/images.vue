<template>
  <div class="images-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="拉取镜像" icon="pi pi-download" @click="showPullImage = true" />
        <Button label="构建镜像" icon="pi pi-cog" outlined />
        <Button label="清理镜像" icon="pi pi-trash" outlined severity="warning" />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索镜像..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshImages" />
      </div>
    </div>

    <DataTable :value="filteredImages" :paginator="true" :rows="8" :rowsPerPageOptions="[5, 8, 15, 30]"
      responsive-layout="scroll" :loading="pending"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="显示第 {first} 到 {last} 条，共 {totalRecords} 条记录">
      <Column field="repository" header="镜像">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <i class="pi pi-image text-blue-500" />
            <div>
              <div class="font-medium">{{ slotProps.data.repository }}</div>
              <div class="text-sm text-gray-500">{{ slotProps.data.tag }}</div>
            </div>
          </div>
        </template>
      </Column>
      <Column field="imageId" header="镜像ID">
        <template #body="slotProps">
          <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ slotProps.data.imageId }}</code>
        </template>
      </Column>
      <Column field="size" header="大小" />
      <Column field="created" header="创建时间" />
      <Column field="containers" header="使用容器" />
      <Column header="操作" class="w-40">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button icon="pi pi-play" size="small" text @click="runContainer(slotProps.data.id)" />
            <Button icon="pi pi-eye" size="small" text @click="inspectImage(slotProps.data.id)" />
            <Button icon="pi pi-upload" size="small" text @click="pushImage(slotProps.data.id)" />
            <Button icon="pi pi-copy" size="small" text @click="tagImage(slotProps.data.id)" />
            <Button icon="pi pi-trash" size="small" text severity="danger" :disabled="slotProps.data.containers > 0"
              @click="deleteImage(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 拉取镜像对话框 -->
    <Dialog v-model:visible="showPullImage" modal header="拉取镜像" :style="{ width: '500px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">镜像名称</label>
          <InputText v-model="pullImageName" class="w-full" placeholder="nginx:latest" />
          <small class="text-gray-600">格式: [registry/]repository[:tag]</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">常用镜像</label>
          <div class="grid grid-cols-2 gap-2">
            <Button label="nginx:latest" size="small" outlined @click="pullImageName = 'nginx:latest'" />
            <Button label="mysql:8.0" size="small" outlined @click="pullImageName = 'mysql:8.0'" />
            <Button label="redis:alpine" size="small" outlined @click="pullImageName = 'redis:alpine'" />
            <Button label="node:18-alpine" size="small" outlined @click="pullImageName = 'node:18-alpine'" />
            <Button label="php:8.2-fpm" size="small" outlined @click="pullImageName = 'php:8.2-fpm'" />
            <Button label="ubuntu:22.04" size="small" outlined @click="pullImageName = 'ubuntu:22.04'" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showPullImage = false" />
        <Button label="拉取" :loading="pulling" @click="pullImage" />
      </template>
    </Dialog>

    <!-- 镜像详情对话框 -->
    <Dialog v-model:visible="showImageDetails" modal header="镜像详情" :style="{ width: '700px' }">
      <div v-if="selectedImage" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">镜像ID</label>
            <code class="text-sm bg-gray-100 px-2 py-1 rounded block">{{ selectedImage.imageId }}</code>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">大小</label>
            <span>{{ selectedImage.size }}</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">标签</label>
          <div class="flex gap-2 flex-wrap">
            <Tag v-for="tag in selectedImage.tags" :key="tag" :value="tag" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">层信息</label>
          <div class="bg-gray-50 p-3 rounded text-sm font-mono">
            <div v-for="layer in selectedImage.layers" :key="layer" class="mb-1">{{ layer }}</div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: '镜像管理 - EtaPanel'
})

// 响应式数据
const showPullImage = ref(false)
const showImageDetails = ref(false)
const pulling = ref(false)
const searchQuery = ref('')
const pullImageName = ref('')
const selectedImage = ref(null)

// 获取镜像数据
const { data: images, pending, refresh } = await useLazyAsyncData('images', () => {
  return Promise.resolve([
    {
      id: '1',
      repository: 'nginx',
      tag: 'latest',
      imageId: 'sha256:abc123...',
      size: '142 MB',
      created: '2024-01-15 10:30',
      containers: 2,
      tags: ['nginx:latest', 'nginx:1.25'],
      layers: [
        'sha256:def456... (5.2 MB)',
        'sha256:ghi789... (67.8 MB)',
        'sha256:jkl012... (69.1 MB)'
      ]
    },
    {
      id: '2',
      repository: 'mysql',
      tag: '8.0',
      imageId: 'sha256:def456...',
      size: '521 MB',
      created: '2024-01-10 14:20',
      containers: 1,
      tags: ['mysql:8.0', 'mysql:latest'],
      layers: [
        'sha256:mno345... (12.3 MB)',
        'sha256:pqr678... (234.5 MB)',
        'sha256:stu901... (274.2 MB)'
      ]
    },
    {
      id: '3',
      repository: 'redis',
      tag: 'alpine',
      imageId: 'sha256:ghi789...',
      size: '32.4 MB',
      created: '2024-01-08 09:15',
      containers: 1,
      tags: ['redis:alpine', 'redis:7-alpine'],
      layers: [
        'sha256:vwx234... (3.2 MB)',
        'sha256:yza567... (29.2 MB)'
      ]
    },
    {
      id: '4',
      repository: 'node',
      tag: '18-alpine',
      imageId: 'sha256:jkl012...',
      size: '178 MB',
      created: '2024-01-20 16:45',
      containers: 0,
      tags: ['node:18-alpine'],
      layers: [
        'sha256:bcd890... (3.2 MB)',
        'sha256:efg123... (45.6 MB)',
        'sha256:hij456... (129.2 MB)'
      ]
    }
  ])
})

// 过滤镜像
const filteredImages = computed(() => {
  if (!images.value) return []
  if (!searchQuery.value) return images.value

  return images.value.filter(image =>
    image.repository.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    image.tag.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const refreshImages = () => {
  refresh()
}

const runContainer = (id: string) => {
  console.log('运行容器:', id)
}

const inspectImage = (id: string) => {
  const image = images.value?.find(img => img.id === id)
  if (image) {
    selectedImage.value = image
    showImageDetails.value = true
  }
}

const pushImage = (id: string) => {
  console.log('推送镜像:', id)
}

const tagImage = (id: string) => {
  console.log('标记镜像:', id)
}

const deleteImage = async (id: string) => {
  console.log('删除镜像:', id)
}

const pullImage = async () => {
  if (!pullImageName.value) return

  pulling.value = true

  try {
    console.log('拉取镜像:', pullImageName.value)

    pullImageName.value = ''
    showPullImage.value = false
    await refresh()
  } catch (error) {
    console.error('拉取镜像失败:', error)
  } finally {
    pulling.value = false
  }
}
</script>

<style scoped>
.w-40 {
  width: 10rem;
}

.w-64 {
  width: 16rem;
}

.space-y-4>*+* {
  margin-top: 1rem;
}

.grid {
  display: grid;
  gap: 0.5rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.flex-wrap {
  flex-wrap: wrap;
}

code {
  font-family: 'Courier New', monospace;
}
</style>