<template>
  <div class="mysql-content">
    <!-- 数据库概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">数据库总数</div>
              <div class="text-2xl font-bold">{{ stats.databases }}</div>
            </div>
            <i class="pi pi-database text-2xl text-blue-500" />
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">用户总数</div>
              <div class="text-2xl font-bold">{{ stats.users }}</div>
            </div>
            <i class="pi pi-users text-2xl text-green-500" />
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">存储使用</div>
              <div class="text-2xl font-bold">{{ stats.storage }}</div>
            </div>
            <i class="pi pi-chart-pie text-2xl text-orange-500" />
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">连接数</div>
              <div class="text-2xl font-bold">{{ stats.connections }}</div>
            </div>
            <i class="pi pi-link text-2xl text-purple-500" />
          </div>
        </template>
      </Card>
    </div>

    <!-- 数据库管理 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 数据库列表 -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>数据库</span>
            <Button label="创建数据库" icon="pi pi-plus" size="small" @click="showCreateDB = true" />
          </div>
        </template>
        <template #content>
          <DataTable :value="databases" responsive-layout="scroll">
            <Column field="name" header="数据库名">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <i class="pi pi-database text-blue-500" />
                  <span class="font-medium">{{ slotProps.data.name }}</span>
                </div>
              </template>
            </Column>
            <Column field="size" header="大小" />
            <Column header="操作" class="w-24">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <Button 
                    icon="pi pi-download" 
                    size="small" 
                    text 
                    @click="backupDatabase(slotProps.data.name)"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    size="small" 
                    text 
                    severity="danger" 
                    @click="deleteDatabase(slotProps.data.name)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- 用户管理 -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>用户</span>
            <Button label="创建用户" icon="pi pi-plus" size="small" @click="showCreateUser = true" />
          </div>
        </template>
        <template #content>
          <DataTable :value="users" responsive-layout="scroll">
            <Column field="username" header="用户名">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <i class="pi pi-user text-green-500" />
                  <span class="font-medium">{{ slotProps.data.username }}</span>
                </div>
              </template>
            </Column>
            <Column field="host" header="主机" />
            <Column header="操作" class="w-24">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <Button 
                    icon="pi pi-key" 
                    size="small" 
                    text 
                    @click="resetPassword(slotProps.data.username)"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    size="small" 
                    text 
                    severity="danger" 
                    @click="deleteUser(slotProps.data.username)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- 创建数据库对话框 -->
    <Dialog v-model:visible="showCreateDB" modal header="创建数据库" :style="{ width: '500px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">数据库名</label>
          <InputText v-model="newDB.name" class="w-full" placeholder="输入数据库名" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">字符集</label>
          <Dropdown 
            v-model="newDB.charset" 
            :options="charsets" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            placeholder="选择字符集"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">排序规则</label>
          <Dropdown 
            v-model="newDB.collation" 
            :options="collations" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            placeholder="选择排序规则"
          />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateDB = false" />
        <Button label="创建" :loading="creatingDB" @click="createDatabase" />
      </template>
    </Dialog>

    <!-- 创建用户对话框 -->
    <Dialog v-model:visible="showCreateUser" modal header="创建用户" :style="{ width: '500px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">用户名</label>
          <InputText v-model="newUser.username" class="w-full" placeholder="输入用户名" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">密码</label>
          <Password v-model="newUser.password" class="w-full" placeholder="输入密码" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">主机</label>
          <InputText v-model="newUser.host" class="w-full" placeholder="%" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">权限</label>
          <MultiSelect 
            v-model="newUser.privileges" 
            :options="privileges" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            placeholder="选择权限"
          />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateUser = false" />
        <Button label="创建" :loading="creatingUser" @click="createUser" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: 'MySQL管理 - EtaPanel'
})

// 响应式数据
const showCreateDB = ref(false)
const showCreateUser = ref(false)
const creatingDB = ref(false)
const creatingUser = ref(false)

const stats = ref({
  databases: 8,
  users: 12,
  storage: '2.3 GB',
  connections: 15
})

const newDB = ref({
  name: '',
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci'
})

const newUser = ref({
  username: '',
  password: '',
  host: '%',
  privileges: []
})

const charsets = [
  { label: 'utf8mb4', value: 'utf8mb4' },
  { label: 'utf8', value: 'utf8' },
  { label: 'latin1', value: 'latin1' }
]

const collations = [
  { label: 'utf8mb4_unicode_ci', value: 'utf8mb4_unicode_ci' },
  { label: 'utf8mb4_general_ci', value: 'utf8mb4_general_ci' },
  { label: 'utf8_unicode_ci', value: 'utf8_unicode_ci' }
]

const privileges = [
  { label: 'SELECT', value: 'SELECT' },
  { label: 'INSERT', value: 'INSERT' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'DROP', value: 'DROP' },
  { label: 'ALL PRIVILEGES', value: 'ALL' }
]

// 获取数据库列表
const { data: databases } = await useLazyAsyncData('mysql-databases', () => {
  return Promise.resolve([
    { name: 'wordpress', size: '156 MB' },
    { name: 'laravel_app', size: '89 MB' },
    { name: 'ecommerce', size: '234 MB' },
    { name: 'blog', size: '45 MB' }
  ])
})

// 获取用户列表
const { data: users } = await useLazyAsyncData('mysql-users', () => {
  return Promise.resolve([
    { username: 'wp_user', host: 'localhost' },
    { username: 'app_user', host: '%' },
    { username: 'readonly', host: '192.168.1.%' }
  ])
})

// 方法
const backupDatabase = (name: string) => {
  console.log('备份数据库:', name)
}

const deleteDatabase = async (name: string) => {
  console.log('删除数据库:', name)
}

const resetPassword = (username: string) => {
  console.log('重置密码:', username)
}

const deleteUser = async (username: string) => {
  console.log('删除用户:', username)
}

const createDatabase = async () => {
  if (!newDB.value.name) return
  
  creatingDB.value = true
  
  try {
    console.log('创建数据库:', newDB.value)
    
    newDB.value = {
      name: '',
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    }
    
    showCreateDB.value = false
  } catch (error) {
    console.error('创建数据库失败:', error)
  } finally {
    creatingDB.value = false
  }
}

const createUser = async () => {
  if (!newUser.value.username || !newUser.value.password) return
  
  creatingUser.value = true
  
  try {
    console.log('创建用户:', newUser.value)
    
    newUser.value = {
      username: '',
      password: '',
      host: '%',
      privileges: []
    }
    
    showCreateUser.value = false
  } catch (error) {
    console.error('创建用户失败:', error)
  } finally {
    creatingUser.value = false
  }
}
</script>

<style scoped>
.w-24 {
  width: 6rem;
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