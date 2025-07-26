<template>
  <div class="websites-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="创建网站" icon="pi pi-plus" @click="showCreateSite = true" />
        <Button label="重载Nginx" icon="pi pi-refresh" outlined @click="reloadNginx" />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索网站..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshSites" />
      </div>
    </div>

    <div class="relative">
      <!-- Loading overlay -->
      <div v-if="pending" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded">
        <div class="flex flex-col items-center">
          <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-2"></i>
          <span class="text-sm text-gray-600">加载中...</span>
        </div>
      </div>
      
      <DataTable :value="filteredSites" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
        responsive-layout="scroll"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        current-page-report-template="{first} - {last} / {totalRecords}">
        <template #empty>
          <div class="text-center py-8 text-gray-500">
            暂无网站数据
          </div>
        </template>
      <Column field="domain" header="域名">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <Tag :severity="slotProps.data.enabled ? 'success' : 'danger'" 
                 :value="slotProps.data.enabled ? '启用' : '禁用'" />
            <span class="font-medium">{{ slotProps.data.domain }}</span>
          </div>
        </template>
      </Column>
      <Column field="root" header="根目录" />
      <Column field="ssl" header="SSL">
        <template #body="slotProps">
          <Tag :severity="slotProps.data.ssl ? 'success' : 'secondary'" 
               :value="slotProps.data.ssl ? '已启用' : '未启用'" />
        </template>
      </Column>
      <Column field="proxy" header="反向代理">
        <template #body="slotProps">
          <Tag :severity="slotProps.data.proxy ? 'info' : 'secondary'" 
               :value="slotProps.data.proxy ? '已启用' : '未启用'" />
        </template>
      </Column>
      <Column header="操作" class="w-48">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" size="small" text @click="editSite(slotProps.data)" />
            <Button :icon="slotProps.data.enabled ? 'pi pi-pause' : 'pi pi-play'" 
                    size="small" text @click="toggleSite(slotProps.data.id)" />
            <Button icon="pi pi-trash" size="small" text severity="danger" 
                    @click="deleteSite(slotProps.data.id)" />
          </div>
        </template>
      </Column>
      </DataTable>
    </div>

    <!-- 创建/编辑网站对话框 -->
    <Dialog v-model:visible="showCreateSite" modal :header="editingId ? '编辑网站' : '创建网站'" 
            :style="{ width: '600px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">域名</label>
          <InputText v-model="siteForm.domain" class="w-full" placeholder="example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">根目录</label>
          <InputText v-model="siteForm.root" class="w-full" placeholder="/var/www/html" />
        </div>
        <div class="flex gap-4">
          <div class="flex items-center">
            <Checkbox v-model="siteForm.ssl" binary />
            <label class="ml-2">启用SSL</label>
          </div>
          <div class="flex items-center">
            <Checkbox v-model="siteForm.proxy" binary />
            <label class="ml-2">反向代理</label>
          </div>
        </div>
        <div v-if="siteForm.proxy">
          <label class="block text-sm font-medium mb-2">代理地址</label>
          <InputText v-model="siteForm.proxyPass" class="w-full" placeholder="http://localhost:3000" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateSite = false" />
        <Button :label="editingId ? '更新' : '创建'" :loading="creating" @click="saveSite" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: "网站管理 - EtaPanel",
});

// 响应式数据
const showCreateSite = ref(false);
const creating = ref(false);
const searchQuery = ref("");
const editingId = ref<number | null>(null);

const siteForm = ref({
  domain: "",
  root: "",
  ssl: false,
  proxy: false,
  proxyPass: "",
  enabled: true
});

// API服务
const api = useApi()

// 获取网站数据
const {
  data: sites,
  pending,
  refresh,
} = await useLazyAsyncData("nginx-sites", async () => {
  try {
    return await api.getNginxSites()
  } catch (error) {
    console.error('获取网站列表失败:', error)
    return []
  }
});

// 过滤网站
const filteredSites = computed(() => {
  if (!sites.value) return [];
  if (!searchQuery.value) return sites.value;

  return sites.value.filter((site: any) =>
    site.domain.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 方法
const refreshSites = () => {
  refresh();
};

const reloadNginx = async () => {
  try {
    await api.reloadNginx()
    console.log('Nginx重载成功')
  } catch (error) {
    console.error('Nginx重载失败:', error)
  }
}

const editSite = (site: any) => {
  editingId.value = site.id
  siteForm.value = {
    domain: site.domain,
    root: site.root,
    ssl: site.ssl,
    proxy: site.proxy,
    proxyPass: site.proxyPass || "",
    enabled: site.enabled
  }
  showCreateSite.value = true
}

const toggleSite = async (id: number) => {
  try {
    await api.toggleNginxSite(id)
    await refresh()
  } catch (error) {
    console.error('切换网站状态失败:', error)
  }
}

const deleteSite = async (id: number) => {
  if (confirm('确定要删除这个网站吗？')) {
    try {
      await api.deleteNginxSite(id)
      await refresh()
    } catch (error) {
      console.error('删除网站失败:', error)
    }
  }
}

const saveSite = async () => {
  if (!siteForm.value.domain) return

  creating.value = true

  try {
    if (editingId.value) {
      await api.updateNginxSite(editingId.value, siteForm.value)
    } else {
      await api.createNginxSite(siteForm.value)
    }

    // 重置表单
    siteForm.value = {
      domain: "",
      root: "",
      ssl: false,
      proxy: false,
      proxyPass: "",
      enabled: true
    }
    editingId.value = null
    showCreateSite.value = false
    await refresh()
  } catch (error) {
    console.error("保存网站失败:", error)
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

.websites-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}
</style>