<template>
  <div class="websites-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="添加网站" icon="pi pi-plus" @click="showCreateWebsite = true" />
        <Button label="批量操作" icon="pi pi-list" outlined />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索网站..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshWebsites" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card v-for="website in filteredWebsites" :key="website.id" class="website-card">
        <template #content>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-globe text-blue-500" />
                <span class="font-medium">{{ website.domain }}</span>
              </div>
              <Tag 
                :severity="website.status === 'active' ? 'success' : 'danger'" 
                :value="website.status === 'active' ? '运行中' : '已停止'"
              />
            </div>
            
            <div class="text-sm text-gray-600 space-y-1">
              <div><strong>根目录:</strong> {{ website.root }}</div>
              <div><strong>PHP版本:</strong> {{ website.php }}</div>
              <div><strong>SSL:</strong> {{ website.ssl ? '已启用' : '未启用' }}</div>
              <div><strong>创建时间:</strong> {{ website.created }}</div>
            </div>
            
            <div class="flex gap-2 pt-2">
              <Button 
                icon="pi pi-external-link" 
                size="small" 
                text 
                @click="openWebsite(website.domain)"
              />
              <Button 
                icon="pi pi-cog" 
                size="small" 
                text 
                @click="editWebsite(website.id)"
              />
              <Button 
                icon="pi pi-shield" 
                size="small" 
                text 
                :severity="website.ssl ? 'success' : 'secondary'"
                @click="manageSSL(website.id)"
              />
              <Button 
                icon="pi pi-trash" 
                size="small" 
                text 
                severity="danger" 
                @click="deleteWebsite(website.id)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 创建网站对话框 -->
    <Dialog v-model:visible="showCreateWebsite" modal header="添加网站" :style="{ width: '600px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">域名</label>
          <InputText v-model="newWebsite.domain" class="w-full" placeholder="example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">根目录</label>
          <InputText v-model="newWebsite.root" class="w-full" placeholder="/var/www/html" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">PHP版本</label>
          <Dropdown 
            v-model="newWebsite.php" 
            :options="phpVersions" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            placeholder="选择PHP版本"
          />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="newWebsite.ssl" binary />
          <label class="text-sm">启用SSL证书</label>
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateWebsite = false" />
        <Button label="创建" :loading="creating" @click="createWebsite" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: '网站管理 - EtaPanel'
})

// 响应式数据
const showCreateWebsite = ref(false)
const creating = ref(false)
const searchQuery = ref('')

const newWebsite = ref({
  domain: '',
  root: '/var/www/html',
  php: '8.2',
  ssl: false
})

const phpVersions = [
  { label: 'PHP 8.3', value: '8.3' },
  { label: 'PHP 8.2', value: '8.2' },
  { label: 'PHP 8.1', value: '8.1' },
  { label: 'PHP 7.4', value: '7.4' }
]

// 获取网站数据
const { data: websites, pending, refresh } = await useLazyAsyncData('websites', () => {
  return Promise.resolve([
    {
      id: '1',
      domain: 'example.com',
      root: '/var/www/example.com',
      php: '8.2',
      ssl: true,
      status: 'active',
      created: '2024-01-15 10:30'
    },
    {
      id: '2',
      domain: 'blog.example.com',
      root: '/var/www/blog',
      php: '8.1',
      ssl: true,
      status: 'active',
      created: '2024-01-10 14:20'
    },
    {
      id: '3',
      domain: 'test.local',
      root: '/var/www/test',
      php: '7.4',
      ssl: false,
      status: 'inactive',
      created: '2024-01-20 16:45'
    }
  ])
})

// 过滤网站
const filteredWebsites = computed(() => {
  if (!websites.value) return []
  if (!searchQuery.value) return websites.value
  
  return websites.value.filter(website => 
    website.domain.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const refreshWebsites = () => {
  refresh()
}

const openWebsite = (domain: string) => {
  window.open(`https://${domain}`, '_blank')
}

const editWebsite = (id: string) => {
  console.log('编辑网站:', id)
}

const manageSSL = (id: string) => {
  console.log('管理SSL:', id)
}

const deleteWebsite = async (id: string) => {
  console.log('删除网站:', id)
}

const createWebsite = async () => {
  if (!newWebsite.value.domain) return
  
  creating.value = true
  
  try {
    console.log('创建网站:', newWebsite.value)
    
    newWebsite.value = {
      domain: '',
      root: '/var/www/html',
      php: '8.2',
      ssl: false
    }
    
    showCreateWebsite.value = false
    await refresh()
  } catch (error) {
    console.error('创建网站失败:', error)
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.w-64 {
  width: 16rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.website-card {
  transition: all 0.2s ease;
}

.website-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>