<template>
  <div class="firewall-content">
    <!-- 防火墙状态 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">防火墙状态</div>
              <div class="text-lg font-bold text-green-500">已启用</div>
            </div>
            <i class="pi pi-shield text-2xl text-green-500" />
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">活跃规则</div>
              <div class="text-2xl font-bold">{{ stats.activeRules }}</div>
            </div>
            <i class="pi pi-list text-2xl text-blue-500" />
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">今日拦截</div>
              <div class="text-2xl font-bold">{{ stats.blockedToday }}</div>
            </div>
            <i class="pi pi-ban text-2xl text-red-500" />
          </div>
        </template>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 防火墙规则 -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>防火墙规则</span>
            <Button label="添加规则" icon="pi pi-plus" size="small" @click="showCreateRule = true" />
          </div>
        </template>
        <template #content>
          <DataTable :value="firewallRules" responsive-layout="scroll">
            <Column field="port" header="端口/服务">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <i :class="getServiceIcon(slotProps.data.service)" />
                  <span class="font-medium">{{ slotProps.data.port }}</span>
                  <small class="text-gray-500">({{ slotProps.data.service }})</small>
                </div>
              </template>
            </Column>
            <Column field="action" header="动作">
              <template #body="slotProps">
                <Tag 
                  :severity="slotProps.data.action === 'ALLOW' ? 'success' : 'danger'" 
                  :value="slotProps.data.action"
                />
              </template>
            </Column>
            <Column field="source" header="来源" />
            <Column header="操作" class="w-20">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <Button 
                    icon="pi pi-pencil" 
                    size="small" 
                    text 
                    @click="editRule(slotProps.data.id)"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    size="small" 
                    text 
                    severity="danger" 
                    @click="deleteRule(slotProps.data.id)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- 快速操作 -->
      <Card>
        <template #title>快速操作</template>
        <template #content>
          <div class="space-y-4">
            <!-- 防火墙控制 -->
            <div class="p-4 border rounded-lg">
              <h4 class="font-medium mb-3">防火墙控制</h4>
              <div class="flex gap-2">
                <Button label="启用防火墙" icon="pi pi-check" severity="success" size="small" />
                <Button label="禁用防火墙" icon="pi pi-times" severity="danger" size="small" outlined />
                <Button label="重载规则" icon="pi pi-refresh" size="small" outlined />
              </div>
            </div>

            <!-- 常用端口 -->
            <div class="p-4 border rounded-lg">
              <h4 class="font-medium mb-3">常用端口</h4>
              <div class="grid grid-cols-2 gap-2">
                <Button label="HTTP (80)" size="small" outlined @click="quickAddRule('80', 'HTTP')" />
                <Button label="HTTPS (443)" size="small" outlined @click="quickAddRule('443', 'HTTPS')" />
                <Button label="SSH (22)" size="small" outlined @click="quickAddRule('22', 'SSH')" />
                <Button label="FTP (21)" size="small" outlined @click="quickAddRule('21', 'FTP')" />
                <Button label="MySQL (3306)" size="small" outlined @click="quickAddRule('3306', 'MySQL')" />
                <Button label="Redis (6379)" size="small" outlined @click="quickAddRule('6379', 'Redis')" />
              </div>
            </div>

            <!-- IP黑名单 -->
            <div class="p-4 border rounded-lg">
              <h4 class="font-medium mb-3">IP管理</h4>
              <div class="flex gap-2 mb-2">
                <InputText v-model="newBlockIP" placeholder="输入IP地址" class="flex-1" />
                <Button label="拉黑" icon="pi pi-ban" size="small" severity="danger" @click="blockIP" />
              </div>
              <div class="text-xs text-gray-600">
                <div>已拉黑IP: 192.168.1.100, 10.0.0.50</div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 添加规则对话框 -->
    <Dialog v-model:visible="showCreateRule" modal header="添加防火墙规则" :style="{ width: '500px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">端口</label>
          <InputText v-model="newRule.port" class="w-full" placeholder="80 或 80:90" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">协议</label>
          <Dropdown 
            v-model="newRule.protocol" 
            :options="protocols" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            placeholder="选择协议"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">动作</label>
          <Dropdown 
            v-model="newRule.action" 
            :options="actions" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            placeholder="选择动作"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">来源IP</label>
          <InputText v-model="newRule.source" class="w-full" placeholder="any 或 192.168.1.0/24" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">备注</label>
          <InputText v-model="newRule.comment" class="w-full" placeholder="规则说明" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateRule = false" />
        <Button label="添加" :loading="creating" @click="createRule" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: '防火墙管理 - EtaPanel'
})

// 响应式数据
const showCreateRule = ref(false)
const creating = ref(false)
const newBlockIP = ref('')

const stats = ref({
  activeRules: 12,
  blockedToday: 45
})

const newRule = ref({
  port: '',
  protocol: 'tcp',
  action: 'ALLOW',
  source: 'any',
  comment: ''
})

const protocols = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'Both', value: 'both' }
]

const actions = [
  { label: '允许 (ALLOW)', value: 'ALLOW' },
  { label: '拒绝 (DENY)', value: 'DENY' }
]

// 获取防火墙规则
const { data: firewallRules } = await useLazyAsyncData('firewall-rules', () => {
  return Promise.resolve([
    {
      id: '1',
      port: '22',
      service: 'SSH',
      action: 'ALLOW',
      source: 'any'
    },
    {
      id: '2',
      port: '80',
      service: 'HTTP',
      action: 'ALLOW',
      source: 'any'
    },
    {
      id: '3',
      port: '443',
      service: 'HTTPS',
      action: 'ALLOW',
      source: 'any'
    },
    {
      id: '4',
      port: '3306',
      service: 'MySQL',
      action: 'DENY',
      source: 'any'
    }
  ])
})

// 方法
const getServiceIcon = (service: string) => {
  const iconMap: Record<string, string> = {
    'SSH': 'pi pi-desktop text-blue-500',
    'HTTP': 'pi pi-globe text-green-500',
    'HTTPS': 'pi pi-shield text-green-500',
    'MySQL': 'pi pi-database text-orange-500',
    'Redis': 'pi pi-server text-red-500',
    'FTP': 'pi pi-folder text-purple-500'
  }
  return iconMap[service] || 'pi pi-circle text-gray-500'
}

const editRule = (id: string) => {
  console.log('编辑规则:', id)
}

const deleteRule = async (id: string) => {
  console.log('删除规则:', id)
}

const quickAddRule = (port: string, service: string) => {
  newRule.value.port = port
  newRule.value.comment = `${service} 服务`
  showCreateRule.value = true
}

const blockIP = () => {
  if (!newBlockIP.value) return
  console.log('拉黑IP:', newBlockIP.value)
  newBlockIP.value = ''
}

const createRule = async () => {
  if (!newRule.value.port) return
  
  creating.value = true
  
  try {
    console.log('创建防火墙规则:', newRule.value)
    
    newRule.value = {
      port: '',
      protocol: 'tcp',
      action: 'ALLOW',
      source: 'any',
      comment: ''
    }
    
    showCreateRule.value = false
  } catch (error) {
    console.error('创建规则失败:', error)
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.w-20 {
  width: 5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.stat-card {
  transition: all 0.2s ease;
}

.stat-card:hover {
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

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.border {
  border: 1px solid #e5e7eb;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.flex-1 {
  flex: 1;
}
</style>