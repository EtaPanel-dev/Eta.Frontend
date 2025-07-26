<template>
  <div class="settings-content">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 设置菜单 -->
      <Card class="lg:col-span-1">
        <template #content>
          <div class="space-y-2">
            <div v-for="item in settingsMenu" :key="item.key" class="settings-menu-item"
              :class="{ active: activeTab === item.key }" @click="activeTab = item.key">
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- 设置内容 -->
      <div class="lg:col-span-3">
        <!-- 系统信息 -->
        <Card v-if="activeTab === 'system'">
          <template #title>系统信息</template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">服务器名称</label>
                  <InputText v-model="systemSettings.hostname" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">时区</label>
                  <Select v-model="systemSettings.timezone" :options="timezones" optionLabel="label"
                    optionValue="value" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">语言</label>
                  <Select v-model="systemSettings.language" :options="languages" optionLabel="label"
                    optionValue="value" class="w-full" />
                </div>
              </div>
              <div class="space-y-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-medium mb-3">系统状态</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span>操作系统:</span>
                      <span>Ubuntu 22.04 LTS</span>
                    </div>
                    <div class="flex justify-between">
                      <span>内核版本:</span>
                      <span>5.15.0-91-generic</span>
                    </div>
                    <div class="flex justify-between">
                      <span>运行时间:</span>
                      <span>15天 8小时</span>
                    </div>
                    <div class="flex justify-between">
                      <span>负载平均:</span>
                      <span>0.85, 1.20, 1.45</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2 mt-6">
              <Button label="保存设置" icon="pi pi-check" />
              <Button label="重启系统" icon="pi pi-refresh" severity="warning" outlined />
            </div>
          </template>
        </Card>

        <!-- 安全设置 -->
        <Card v-if="activeTab === 'security'">
          <template #title>安全设置</template>
          <template #content>
            <div class="space-y-6">
              <!-- SSH设置 -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-4">SSH配置</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">SSH端口</label>
                    <InputNumber v-model="securitySettings.sshPort" class="w-full" />
                  </div>
                  <div class="flex items-center gap-2 mt-6">
                    <Checkbox v-model="securitySettings.sshPasswordAuth" binary />
                    <label class="text-sm">允许密码认证</label>
                  </div>
                </div>
              </div>

              <!-- 防火墙设置 -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-4">防火墙</h4>
                <div class="flex items-center gap-2 mb-4">
                  <Checkbox v-model="securitySettings.firewallEnabled" binary />
                  <label class="text-sm">启用防火墙</label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox v-model="securitySettings.failToBan" binary />
                  <label class="text-sm">启用Fail2Ban</label>
                </div>
              </div>

              <!-- 自动更新 -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-4">自动更新</h4>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="securitySettings.autoUpdate" binary />
                    <label class="text-sm">启用自动安全更新</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="securitySettings.autoReboot" binary />
                    <label class="text-sm">更新后自动重启</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2 mt-6">
              <Button label="保存设置" icon="pi pi-check" />
              <Button label="测试配置" icon="pi pi-play" outlined />
            </div>
          </template>
        </Card>

        <!-- 备份设置 -->
        <Card v-if="activeTab === 'backup'">
          <template #title>备份设置</template>
          <template #content>
            <div class="space-y-6">
              <!-- 自动备份 -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-4">自动备份</h4>
                <div class="space-y-4">
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="backupSettings.enabled" binary />
                    <label class="text-sm">启用自动备份</label>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">备份频率</label>
                    <Select v-model="backupSettings.frequency" :options="backupFrequencies" optionLabel="label"
                      optionValue="value" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">保留天数</label>
                    <InputNumber v-model="backupSettings.retention" class="w-full" />
                  </div>
                </div>
              </div>

              <!-- 备份存储 -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-4">存储配置</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">存储类型</label>
                    <Select v-model="backupSettings.storage" :options="storageTypes" optionLabel="label"
                      optionValue="value" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">存储路径</label>
                    <InputText v-model="backupSettings.path" class="w-full" />
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2 mt-6">
              <Button label="保存设置" icon="pi pi-check" />
              <Button label="立即备份" icon="pi pi-download" outlined />
            </div>
          </template>
        </Card>

        <!-- 通知设置 -->
        <Card v-if="activeTab === 'notifications'">
          <template #title>通知设置</template>
          <template #content>
            <div class="space-y-6">
              <!-- 邮件通知 -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-4">邮件通知</h4>
                <div class="space-y-4">
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="notificationSettings.emailEnabled" binary />
                    <label class="text-sm">启用邮件通知</label>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">SMTP服务器</label>
                    <InputText v-model="notificationSettings.smtpHost" class="w-full" />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium mb-2">端口</label>
                      <InputNumber v-model="notificationSettings.smtpPort" class="w-full" />
                    </div>
                    <div class="flex items-center gap-2 mt-6">
                      <Checkbox v-model="notificationSettings.smtpSSL" binary />
                      <label class="text-sm">使用SSL</label>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">发件人邮箱</label>
                    <InputText v-model="notificationSettings.fromEmail" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">收件人邮箱</label>
                    <InputText v-model="notificationSettings.toEmail" class="w-full" />
                  </div>
                </div>
              </div>

              <!-- 通知类型 -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-medium mb-4">通知类型</h4>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="notificationSettings.systemAlerts" binary />
                    <label class="text-sm">系统警报</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="notificationSettings.backupStatus" binary />
                    <label class="text-sm">备份状态</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="notificationSettings.securityEvents" binary />
                    <label class="text-sm">安全事件</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="notificationSettings.updateAvailable" binary />
                    <label class="text-sm">更新可用</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2 mt-6">
              <Button label="保存设置" icon="pi pi-check" />
              <Button label="发送测试邮件" icon="pi pi-send" outlined />
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
  title: '系统设置 - EtaPanel'
})

// 响应式数据
const activeTab = ref('system')

const settingsMenu = [
  { key: 'system', label: '系统信息', icon: 'pi pi-desktop' },
  { key: 'security', label: '安全设置', icon: 'pi pi-shield' },
  { key: 'backup', label: '备份设置', icon: 'pi pi-download' },
  { key: 'notifications', label: '通知设置', icon: 'pi pi-bell' }
]

const systemSettings = ref({
  hostname: 'eta-server',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN'
})

const securitySettings = ref({
  sshPort: 22,
  sshPasswordAuth: true,
  firewallEnabled: true,
  failToBan: true,
  autoUpdate: true,
  autoReboot: false
})

const backupSettings = ref({
  enabled: true,
  frequency: 'daily',
  retention: 7,
  storage: 'local',
  path: '/var/backups'
})

const notificationSettings = ref({
  emailEnabled: false,
  smtpHost: '',
  smtpPort: 587,
  smtpSSL: true,
  fromEmail: '',
  toEmail: '',
  systemAlerts: true,
  backupStatus: true,
  securityEvents: true,
  updateAvailable: true
})

const timezones = [
  { label: '北京时间 (Asia/Shanghai)', value: 'Asia/Shanghai' },
  { label: '东京时间 (Asia/Tokyo)', value: 'Asia/Tokyo' },
  { label: 'UTC时间', value: 'UTC' },
  { label: '纽约时间 (America/New_York)', value: 'America/New_York' }
]

const languages = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
  { label: '日本語', value: 'ja-JP' }
]

const backupFrequencies = [
  { label: '每小时', value: 'hourly' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' }
]

const storageTypes = [
  { label: '本地存储', value: 'local' },
  { label: 'FTP服务器', value: 'ftp' },
  { label: 'AWS S3', value: 's3' },
  { label: '阿里云OSS', value: 'oss' }
]
</script>

<style scoped>
.settings-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.space-y-2>*+* {
  margin-top: 0.5rem;
}

.space-y-4>*+* {
  margin-top: 1rem;
}

.space-y-6>*+* {
  margin-top: 1.5rem;
}

.settings-menu-item {
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

.settings-menu-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.settings-menu-item.active {
  background-color: var(--accent-primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
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
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:col-span-1 {
    grid-column: span 1 / span 1;
  }

  .lg\:col-span-3 {
    grid-column: span 3 / span 3;
  }

  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.border {
  border: 1px solid var(--p-content-border-color);
}

.rounded-lg {
  border-radius: var(--p-border-radius);
}

.bg-gray-50 {
  background-color: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
}

/* 设置项容器样式 */
:deep(.p-card) {
  box-shadow: var(--p-card-shadow);
  border: 1px solid var(--p-card-border-color);
}

:deep(.p-card .p-card-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-card-title-color);
  margin-bottom: 1rem;
}

/* 表单标签样式 */
label {
  color: var(--p-text-color);
  font-weight: 500;
}

/* 设置分组样式 */
.p-4.border.rounded-lg {
  background-color: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  transition: all 0.2s;
}

.p-4.border.rounded-lg:hover {
  border-color: var(--p-primary-color);
  box-shadow: var(--p-focus-ring-shadow);
}

/* 系统状态信息样式 */
.p-4.bg-gray-50.rounded-lg {
  background: var(--p-surface-50);
  border: 1px solid var(--p-content-border-color);
}

/* 按钮组样式 */
.flex.gap-2.mt-6 {
  padding-top: 1.5rem;
  border-top: 1px solid var(--p-content-border-color);
}
</style>