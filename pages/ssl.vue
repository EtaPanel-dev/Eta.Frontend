<template>
  <div class="ssl-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="申请证书" icon="pi pi-plus" @click="showCreateSSL = true" />
        <Button label="ACME客户端" icon="pi pi-cog" outlined @click="showAcmeClients = true" />
        <Button label="DNS账号" icon="pi pi-server" outlined @click="showDnsAccounts = true" />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索证书..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshSSLs" />
      </div>
    </div>

    <DataTable :value="filteredSSLs" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
      responsive-layout="scroll" :loading="pending"
      paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      current-page-report-template="{first} - {last} / {totalRecords}">
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
          <Select v-model="sslForm.acme_client_id" :options="acmeClients" 
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

    <!-- ACME客户端管理对话框 -->
    <Dialog v-model:visible="showAcmeClients" modal header="ACME客户端管理" :style="{ width: '800px' }">
      <div class="mb-4">
        <Button label="添加客户端" icon="pi pi-plus" @click="showCreateAcme = true" />
      </div>
      <DataTable :value="acmeClients" :paginator="true" :rows="5">
        <Column field="email" header="邮箱" />
        <Column field="server" header="服务器" />
        <Column field="key_type" header="密钥类型" />
        <Column header="操作">
          <template #body="slotProps">
            <div class="flex gap-1">
              <Button icon="pi pi-pencil" size="small" text @click="editAcmeClient(slotProps.data)" />
              <Button icon="pi pi-trash" size="small" text severity="danger" 
                      @click="deleteAcmeClient(slotProps.data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </Dialog>

    <!-- DNS账号管理对话框 -->
    <Dialog v-model:visible="showDnsAccounts" modal header="DNS账号管理" :style="{ width: '800px' }">
      <div class="mb-4">
        <Button label="添加DNS账号" icon="pi pi-plus" @click="showCreateDns = true" />
      </div>
      <DataTable :value="dnsAccounts" :paginator="true" :rows="5">
        <Column field="name" header="名称" />
        <Column field="provider" header="提供商" />
        <Column header="操作">
          <template #body="slotProps">
            <div class="flex gap-1">
              <Button icon="pi pi-pencil" size="small" text @click="editDnsAccount(slotProps.data)" />
              <Button icon="pi pi-trash" size="small" text severity="danger" 
                      @click="deleteDnsAccount(slotProps.data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </Dialog>

    <!-- 创建/编辑ACME客户端对话框 -->
    <Dialog v-model:visible="showCreateAcme" modal :header="editingAcmeId ? '编辑ACME客户端' : '添加ACME客户端'" 
            :style="{ width: '500px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">邮箱</label>
          <InputText v-model="acmeForm.email" class="w-full" placeholder="your@email.com" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">ACME服务器</label>
          <Select v-model="acmeForm.server" :options="acmeServers" 
                    optionLabel="label" optionValue="value" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">密钥类型</label>
          <Select v-model="acmeForm.key_type" :options="keyTypes" 
                    optionLabel="label" optionValue="value" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateAcme = false" />
        <Button :label="editingAcmeId ? '更新' : '创建'" :loading="creatingAcme" @click="saveAcmeClient" />
      </template>
    </Dialog>

    <!-- 创建/编辑DNS账号对话框 -->
    <Dialog v-model:visible="showCreateDns" modal :header="editingDnsId ? '编辑DNS账号' : '添加DNS账号'" 
            :style="{ width: '500px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">名称</label>
          <InputText v-model="dnsForm.name" class="w-full" placeholder="DNS账号名称" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">DNS提供商</label>
          <Select v-model="dnsForm.provider" :options="dnsProviders" 
                    optionLabel="label" optionValue="value" class="w-full" />
        </div>
        <div v-if="dnsForm.provider === 'cloudflare'">
          <label class="block text-sm font-medium mb-2">邮箱</label>
          <InputText v-model="dnsForm.email" class="w-full" placeholder="Cloudflare账号邮箱" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ dnsForm.provider === 'cloudflare' ? 'API Token' : 'API密钥' }}</label>
          <InputText v-model="dnsForm.api_key" class="w-full" :placeholder="dnsForm.provider === 'cloudflare' ? 'API Token' : 'API密钥'" type="password" />
        </div>
        <div v-if="dnsForm.provider !== 'cloudflare'">
          <label class="block text-sm font-medium mb-2">API密钥ID（可选）</label>
          <InputText v-model="dnsForm.api_secret" class="w-full" placeholder="API密钥ID" type="password" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateDns = false" />
        <Button :label="editingDnsId ? '更新' : '创建'" :loading="creatingDns" @click="saveDnsAccount" />
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
const showAcmeClients = ref(false);
const showDnsAccounts = ref(false);
const showCreateAcme = ref(false);
const showCreateDns = ref(false);
const creating = ref(false);
const creatingAcme = ref(false);
const creatingDns = ref(false);
const searchQuery = ref("");
const editingId = ref<number | null>(null);
const editingAcmeId = ref<number | null>(null);
const editingDnsId = ref<number | null>(null);

const sslForm = ref({
  domain: "",
  acme_client_id: null,
  auto_renew: true,
  enabled: true
});

const acmeForm = ref({
  email: "",
  server: "https://acme-v02.api.letsencrypt.org/directory",
  key_type: "rsa"
});

const dnsForm = ref({
  name: "",
  provider: "",
  email: "",
  api_key: "",
  api_secret: ""
});

// ACME服务器选项
const acmeServers = [
  { label: "Let's Encrypt", value: "https://acme-v02.api.letsencrypt.org/directory" },
  { label: "Let's Encrypt Staging", value: "https://acme-staging-v02.api.letsencrypt.org/directory" },
  { label: "ZeroSSL", value: "https://acme.zerossl.com/v2/DV90" }
];

// 密钥类型选项
const keyTypes = [
  { label: "RSA 2048", value: "rsa" },
  { label: "ECDSA P-256", value: "ecdsa" }
];

// DNS提供商选项
const dnsProviders = [
  { label: "Cloudflare", value: "cloudflare" },
  { label: "Aliyun", value: "aliyun" },
  { label: "Tencent Cloud", value: "tencent" },
  { label: "DNSPod", value: "dnspod" },
  { label: "GoDaddy", value: "godaddy" }
];

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
const { data: acmeClients, refresh: refreshAcmeClients } = await useLazyAsyncData("acme-clients", async () => {
  try {
    return await api.getAcmeClients()
  } catch (error) {
    console.error('获取ACME客户端列表失败:', error)
    return []
  }
});

// 获取DNS账号列表
const { data: dnsAccounts, refresh: refreshDnsAccounts } = await useLazyAsyncData("dns-accounts", async () => {
  try {
    return await api.getDnsAccounts()
  } catch (error) {
    console.error('获取DNS账号列表失败:', error)
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

// ACME客户端管理方法
const editAcmeClient = (client: any) => {
  editingAcmeId.value = client.id
  acmeForm.value = {
    email: client.email,
    server: client.server,
    key_type: client.key_type
  }
  showCreateAcme.value = true
}

const deleteAcmeClient = async (id: number) => {
  if (confirm('确定要删除这个ACME客户端吗？')) {
    try {
      await api.deleteAcmeClient(id)
      await refreshAcmeClients()
    } catch (error) {
      console.error('删除ACME客户端失败:', error)
    }
  }
}

const saveAcmeClient = async () => {
  if (!acmeForm.value.email || !acmeForm.value.server) return

  creatingAcme.value = true

  try {
    if (editingAcmeId.value) {
      await api.updateAcmeClient(editingAcmeId.value, acmeForm.value)
    } else {
      await api.createAcmeClient(acmeForm.value)
    }

    acmeForm.value = {
      email: "",
      server: "https://acme-v02.api.letsencrypt.org/directory",
      key_type: "rsa"
    }
    editingAcmeId.value = null
    showCreateAcme.value = false
    await refreshAcmeClients()
  } catch (error) {
    console.error("保存ACME客户端失败:", error)
  } finally {
    creatingAcme.value = false
  }
}

// DNS账号管理方法
const editDnsAccount = (account: any) => {
  editingDnsId.value = account.id
  dnsForm.value = {
    name: account.name,
    provider: account.provider,
    email: account.email || "",
    api_key: account.api_key,
    api_secret: account.api_secret || ""
  }
  showCreateDns.value = true
}

const deleteDnsAccount = async (id: number) => {
  if (confirm('确定要删除这个DNS账号吗？')) {
    try {
      await api.deleteDnsAccount(id)
      await refreshDnsAccounts()
    } catch (error) {
      console.error('删除DNS账号失败:', error)
    }
  }
}

const saveDnsAccount = async () => {
  if (!dnsForm.value.name || !dnsForm.value.provider || !dnsForm.value.api_key) return
  if (dnsForm.value.provider === 'cloudflare' && !dnsForm.value.email) return

  creatingDns.value = true

  try {
    if (editingDnsId.value) {
      await api.updateDnsAccount(editingDnsId.value, dnsForm.value)
    } else {
      await api.createDnsAccount(dnsForm.value)
    }

    dnsForm.value = {
      name: "",
      provider: "",
      email: "",
      api_key: "",
      api_secret: ""
    }
    editingDnsId.value = null
    showCreateDns.value = false
    await refreshDnsAccounts()
  } catch (error) {
    console.error("保存DNS账号失败:", error)
  } finally {
    creatingDns.value = false
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