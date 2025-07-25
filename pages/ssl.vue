<template>
  <div class="ssl-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="申请证书" icon="pi pi-plus" @click="showCreateSSL = true" />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索证书..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshSSLs" />
      </div>
    </div>

    <DataTable :value="filteredSSLs" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
      responsive-layout="scroll" :loading="pending">
      <Column field="domain" header="域名">
        <template #body="slotProps">
          <span class="font-medium">{{ slotProps.data.domain }}</span>
        </template>
      </Column>
      <Column field="provider" header="提供商" />
      <Column field="email" header="邮箱" />
      <Column field="auto_renew" header="自动续期">
        <template #body="slotProps">
          <Tag :severity="slotProps.data.auto_renew ? 'success' : 'secondary'" 
               :value="slotProps.data.auto_renew ? '已启用' : '未启用'" />
        </template>
      </Column>
      <Column field="enabled" header="状态">
        <template #body="slotProps">
          <Tag :severity="slotProps.data.enabled ? 'success' : 'danger'" 
               :value="slotProps.data.enabled ? '启用' : '禁用'" />
        </template>
      </Column>
      <Column header="操作" class="w-48">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" size="small" text @click="editSSL(slotProps.data)" />
            <Button icon="pi pi-trash" size="small" text severity="danger" 
                    @click="deleteSSL(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 创建/编辑SSL证书对话框 -->
    <Dialog v-model:visible="showCreateSSL" modal :header="editingId ? '编辑证书' : '申请证书'" 
            :style="{ width: '600px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">域名</label>
          <InputText v-model="sslForm.domain" class="w-full" placeholder="example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">ACME客户端</label>
          <Dropdown v-model="sslForm.acme_client_id" :options="acmeClients" 
                    optionLabel="email" optionValue="id" class="w-full" />
        </div>
        <div class="flex gap-4">
          <div class="flex items-center">
            <Checkbox v-model="sslForm.auto_renew" binary />
            <label class="ml-2">自动续期</label>
          </div>
          <div class="flex items-center">
            <Checkbox v-model="sslForm.enabled" binary />
            <label class="ml-2">启用证书</label>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateSSL = false" />
        <Button :label="editingId ? '更新' : '申请'" :loading="creating" @click="saveSSL" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: "SSL证书 - EtaPanel",
});

// 响应式数据
const showCreateSSL = ref(false);
const creating = ref(false);
const searchQuery = ref("");
const editingId = ref<number | null>(null);

const sslForm = ref({
  domain: "",
  acme_client_id: null,
  auto_renew: true,
  enabled: true
});

// API服务
const api = useApi()

// 获取SSL证书数据
const {
  data: ssls,
  pending,
  refresh,
} = await useLazyAsyncData("ssl-certificates", async () => {
  try {
    return await api.getSSLCertificates()
  } catch (error) {
    console.error('获取SSL证书列表失败:', error)
    return []
  }
});

// 获取ACME客户端列表
const { data: acmeClients } = await useLazyAsyncData("acme-clients", async () => {
  try {
    return await api.getAcmeClients()
  } catch (error) {
    console.error('获取ACME客户端列表失败:', error)
    return []
  }
});

// 过滤证书
const filteredSSLs = computed(() => {
  if (!ssls.value) return [];
  if (!searchQuery.value) return ssls.value;

  return ssls.value.filter((ssl: any) =>
    ssl.domain.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 方法
const refreshSSLs = () => {
  refresh();
};

const editSSL = (ssl: any) => {
  editingId.value = ssl.id
  sslForm.value = {
    domain: ssl.domain,
    acme_client_id: ssl.acme_client_id,
    auto_renew: ssl.auto_renew,
    enabled: ssl.enabled
  }
  showCreateSSL.value = true
}

const deleteSSL = async (id: number) => {
  if (confirm('确定要删除这个SSL证书吗？')) {
    try {
      await api.deleteSSLCertificate(id)
      await refresh()
    } catch (error) {
      console.error('删除SSL证书失败:', error)
    }
  }
}

const saveSSL = async () => {
  if (!sslForm.value.domain || !sslForm.value.acme_client_id) return

  creating.value = true

  try {
    if (editingId.value) {
      await api.updateSSLCertificate(editingId.value, sslForm.value)
    } else {
      await api.createSSLCertificate(sslForm.value)
    }

    // 重置表单
    sslForm.value = {
      domain: "",
      acme_client_id: null,
      auto_renew: true,
      enabled: true
    }
    editingId.value = null
    showCreateSSL.value = false
    await refresh()
  } catch (error) {
    console.error("保存SSL证书失败:", error)
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.w-48 {
  width: 12rem;
}

.w-64 {
  width: 16rem;
}

.space-y-4>*+* {
  margin-top: 1rem;
}

.ssl-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}
</style>