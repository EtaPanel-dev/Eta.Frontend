<template>
  <div class="ssl-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="申请证书" icon="pi pi-plus" @click="showCreateSSL = true" />
        <Button label="上传证书" icon="pi pi-upload" outlined />
        <Button label="续期检查" icon="pi pi-refresh" outlined />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索域名..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshSSL" />
      </div>
    </div>

    <DataTable 
      :value="filteredSSL" 
      :paginator="true" 
      :rows="10" 
      responsive-layout="scroll"
      :loading="pending"
    >
      <Column field="domain" header="域名">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <i class="pi pi-shield text-green-500" />
            <span class="font-medium">{{ slotProps.data.domain }}</span>
          </div>
        </template>
      </Column>
      <Column field="issuer" header="颁发机构" />
      <Column field="type" header="类型" />
      <Column field="status" header="状态">
        <template #body="slotProps">
          <Tag 
            :severity="getSSLStatusSeverity(slotProps.data.status)" 
            :value="slotProps.data.status"
          />
        </template>
      </Column>
      <Column field="expires" header="到期时间">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <span>{{ slotProps.data.expires }}</span>
            <Tag 
              v-if="slotProps.data.daysLeft <= 30" 
              severity="warning" 
              :value="`${slotProps.data.daysLeft}天`"
            />
          </div>
        </template>
      </Column>
      <Column field="autoRenew" header="自动续期">
        <template #body="slotProps">
          <i 
            :class="slotProps.data.autoRenew ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"
          />
        </template>
      </Column>
      <Column header="操作" class="w-40">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button 
              icon="pi pi-eye" 
              size="small" 
              text 
              @click="viewSSL(slotProps.data.id)"
            />
            <Button 
              icon="pi pi-refresh" 
              size="small" 
              text 
              @click="renewSSL(slotProps.data.id)"
            />
            <Button 
              icon="pi pi-download" 
              size="small" 
              text 
              @click="downloadSSL(slotProps.data.id)"
            />
            <Button 
              icon="pi pi-trash" 
              size="small" 
              text 
              severity="danger" 
              @click="deleteSSL(slotProps.data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 申请SSL证书对话框 -->
    <Dialog v-model:visible="showCreateSSL" modal header="申请SSL证书" :style="{ width: '600px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">域名</label>
          <InputText v-model="newSSL.domain" class="w-full" placeholder="example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">证书类型</label>
          <Dropdown 
            v-model="newSSL.type" 
            :options="sslTypes" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            placeholder="选择证书类型"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">验证方式</label>
          <Dropdown 
            v-model="newSSL.validation" 
            :options="validationMethods" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            placeholder="选择验证方式"
          />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="newSSL.autoRenew" binary />
          <label class="text-sm">启用自动续期</label>
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateSSL = false" />
        <Button label="申请" :loading="creating" @click="createSSL" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: 'SSL证书管理 - EtaPanel'
})

// 响应式数据
const showCreateSSL = ref(false)
const creating = ref(false)
const searchQuery = ref('')

const newSSL = ref({
  domain: '',
  type: 'free',
  validation: 'http',
  autoRenew: true
})

const sslTypes = [
  { label: '免费证书 (Let\'s Encrypt)', value: 'free' },
  { label: '付费证书', value: 'paid' },
  { label: '通配符证书', value: 'wildcard' }
]

const validationMethods = [
  { label: 'HTTP验证', value: 'http' },
  { label: 'DNS验证', value: 'dns' },
  { label: '文件验证', value: 'file' }
]

// 获取SSL证书数据
const { data: sslCerts, pending, refresh } = await useLazyAsyncData('ssl', () => {
  return Promise.resolve([
    {
      id: '1',
      domain: 'example.com',
      issuer: 'Let\'s Encrypt',
      type: '免费证书',
      status: '有效',
      expires: '2024-04-15 10:30',
      daysLeft: 45,
      autoRenew: true
    },
    {
      id: '2',
      domain: '*.example.com',
      issuer: 'DigiCert',
      type: '通配符证书',
      status: '有效',
      expires: '2024-12-20 14:20',
      daysLeft: 280,
      autoRenew: false
    },
    {
      id: '3',
      domain: 'test.local',
      issuer: 'Let\'s Encrypt',
      type: '免费证书',
      status: '即将过期',
      expires: '2024-02-05 16:45',
      daysLeft: 15,
      autoRenew: true
    }
  ])
})

// 过滤SSL证书
const filteredSSL = computed(() => {
  if (!sslCerts.value) return []
  if (!searchQuery.value) return sslCerts.value
  
  return sslCerts.value.filter(cert => 
    cert.domain.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const getSSLStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    '有效': 'success',
    '即将过期': 'warning',
    '已过期': 'danger',
    '申请中': 'info'
  }
  return severityMap[status] || 'secondary'
}

const refreshSSL = () => {
  refresh()
}

const viewSSL = (id: string) => {
  console.log('查看SSL证书:', id)
}

const renewSSL = async (id: string) => {
  console.log('续期SSL证书:', id)
}

const downloadSSL = (id: string) => {
  console.log('下载SSL证书:', id)
}

const deleteSSL = async (id: string) => {
  console.log('删除SSL证书:', id)
}

const createSSL = async () => {
  if (!newSSL.value.domain) return
  
  creating.value = true
  
  try {
    console.log('申请SSL证书:', newSSL.value)
    
    newSSL.value = {
      domain: '',
      type: 'free',
      validation: 'http',
      autoRenew: true
    }
    
    showCreateSSL.value = false
    await refresh()
  } catch (error) {
    console.error('申请SSL证书失败:', error)
  } finally {
    creating.value = false
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

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>