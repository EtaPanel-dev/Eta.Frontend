<template>
  <div class="sql-content">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 数据库类型菜单 -->
      <Card class="lg:col-span-1">
        <template #content>
          <div class="space-y-2">
            <div v-for="item in dbMenu" :key="item.key" class="db-menu-item"
              :class="{ active: activeTab === item.key }" @click="activeTab = item.key">
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- 数据库内容 -->
      <div class="lg:col-span-3">
        <!-- MySQL -->
        <Card v-if="activeTab === 'mysql'">
          <template #title>MySQL管理</template>
          <template #content>
            <div class="mysql-content min-content">
              <!-- 数据库概览 -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
                </div>
                <template #footer>
                  <div class="flex gap-2">
                    <Button label="取消" text @click="showCreateDB = false" />
                    <Button label="创建" :loading="creatingDB" @click="createDatabase" />
                  </div>
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
                </div>
                <template #footer>
                  <div class="flex gap-2">
                    <Button label="取消" text @click="showCreateUser = false" />
                    <Button label="创建" :loading="creatingUser" @click="createUser" />
                  </div>
                </template>
              </Dialog>
            </div>
          </template>
        </Card>
        
        <!-- PostgreSQL -->
        <Card v-if="activeTab === 'postgresql'">
          <template #title>PostgreSQL管理</template>
          <template #content>
            <div class="postgresql-content min-content">
              <div class="text-center py-8">
                <i class="pi pi-database text-4xl text-blue-500 mb-4" />
                <h3 class="text-xl font-semibold mb-2">PostgreSQL管理</h3>
                <p class="text-gray-600">PostgreSQL数据库管理功能开发中...</p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: 'SQL数据库管理 - EtaPanel'
})

const activeTab = ref('mysql');

const dbMenu = [
  { key: 'mysql', label: 'MySQL', icon: 'pi pi-database' },
  { key: 'postgresql', label: 'PostgreSQL', icon: 'pi pi-server' }
]

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
  charset: 'utf8mb4'
})

const newUser = ref({
  username: '',
  password: ''
})

const charsets = [
  { label: 'utf8mb4', value: 'utf8mb4' },
  { label: 'utf8', value: 'utf8' },
  { label: 'latin1', value: 'latin1' }
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
      charset: 'utf8mb4'
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
      password: ''
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
.sql-content {
  /* 移除padding，由layout处理 */
}

.db-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  position: relative;
  white-space: nowrap;
}

.db-menu-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.db-menu-item.active {
  background-color: var(--accent-primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.w-24 {
  width: 6rem;
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
  .lg\:col-span-1 {
    grid-column: span 1 / span 1;
  }

  .lg\:col-span-3 {
    grid-column: span 3 / span 3;
  }

  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.min-content {
  min-height: min-content;
}
</style>