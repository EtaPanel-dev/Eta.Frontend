<template>
  <div class="firewall-content">
    <!-- 防火墙状态 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-secondary-content mb-1">防火墙状态</div>
              <div class="text-lg font-bold firewall-status-active">已启用</div>
            </div>
            <i class="pi pi-shield text-2xl firewall-icon-active" />
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-secondary-content mb-1">活跃规则</div>
              <div class="text-2xl font-bold">{{ stats.activeRules }}</div>
            </div>
            <i class="pi pi-list text-2xl firewall-icon-info" />
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-secondary-content mb-1">今日拦截</div>
              <div class="text-2xl font-bold">{{ stats.blockedToday }}</div>
            </div>
            <i class="pi pi-ban text-2xl firewall-icon-danger" />
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
            <Button
              label="添加规则"
              icon="pi pi-plus"
              size="small"
              @click="showCreateRule = true"
            />
          </div>
        </template>
        <template #content>
          <DataTable
            :value="firewallRules"
            responsive-layout="scroll"
            class="firewall-rules-table"
          >
            <Column field="port" header="端口/服务">
              <template #body="slotProps">
                <div class="service-info">
                  <i :class="getServiceIcon(slotProps.data.service)" />
                  <div class="service-details">
                    <span class="font-medium">{{ slotProps.data.port }}</span>
                    <small class="text-secondary-content"
                      >({{ slotProps.data.service }})</small
                    >
                  </div>
                </div>
              </template>
            </Column>
            <Column field="action" header="动作">
              <template #body="slotProps">
                <Tag
                  :severity="
                    slotProps.data.action === 'ALLOW' ? 'success' : 'danger'
                  "
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
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-bolt firewall-icon-warning" />
            <span>快速操作</span>
          </div>
        </template>
        <template #content>
          <div class="quick-actions-container firewall-quick-actions">
            <!-- 防火墙控制 -->
            <div class="action-section firewall-control">
              <div class="section-header">
                <i class="pi pi-shield" />
                <h4>防火墙控制</h4>
              </div>
              <div class="action-buttons">
                <Button
                  label="启用防火墙"
                  icon="pi pi-check"
                  severity="success"
                  size="small"
                  class="control-btn enable-btn"
                />
                <Button
                  label="禁用防火墙"
                  icon="pi pi-times"
                  severity="danger"
                  size="small"
                  outlined
                  class="control-btn disable-btn"
                />
                <Button
                  label="重载规则"
                  icon="pi pi-refresh"
                  size="small"
                  outlined
                  class="control-btn reload-btn"
                />
              </div>
            </div>

            <!-- 常用端口 -->
            <div class="action-section port-section">
              <div class="section-header">
                <i class="pi pi-sitemap" />
                <h4>常用端口</h4>
              </div>
              <div class="port-grid">
                <Button
                  label="HTTP"
                  icon="pi pi-globe"
                  size="small"
                  outlined
                  class="port-btn http-btn"
                  @click="quickAddRule('80', 'HTTP')"
                >
                  <template #default>
                    <div class="port-btn-content">
                      <i class="pi pi-globe" />
                      <span class="port-name">HTTP</span>
                      <span class="port-number">80</span>
                    </div>
                  </template>
                </Button>
                <Button
                  label="HTTPS"
                  icon="pi pi-shield"
                  size="small"
                  outlined
                  class="port-btn https-btn"
                  @click="quickAddRule('443', 'HTTPS')"
                >
                  <template #default>
                    <div class="port-btn-content">
                      <i class="pi pi-shield" />
                      <span class="port-name">HTTPS</span>
                      <span class="port-number">443</span>
                    </div>
                  </template>
                </Button>
                <Button
                  label="SSH"
                  icon="pi pi-desktop"
                  size="small"
                  outlined
                  class="port-btn ssh-btn"
                  @click="quickAddRule('22', 'SSH')"
                >
                  <template #default>
                    <div class="port-btn-content">
                      <i class="pi pi-desktop" />
                      <span class="port-name">SSH</span>
                      <span class="port-number">22</span>
                    </div>
                  </template>
                </Button>
                <Button
                  label="FTP"
                  icon="pi pi-folder"
                  size="small"
                  outlined
                  class="port-btn ftp-btn"
                  @click="quickAddRule('21', 'FTP')"
                >
                  <template #default>
                    <div class="port-btn-content">
                      <i class="pi pi-folder" />
                      <span class="port-name">FTP</span>
                      <span class="port-number">21</span>
                    </div>
                  </template>
                </Button>
                <Button
                  label="MySQL"
                  icon="pi pi-database"
                  size="small"
                  outlined
                  class="port-btn mysql-btn"
                  @click="quickAddRule('3306', 'MySQL')"
                >
                  <template #default>
                    <div class="port-btn-content">
                      <i class="pi pi-database" />
                      <span class="port-name">MySQL</span>
                      <span class="port-number">3306</span>
                    </div>
                  </template>
                </Button>
                <Button
                  label="Redis"
                  icon="pi pi-server"
                  size="small"
                  outlined
                  class="port-btn redis-btn"
                  @click="quickAddRule('6379', 'Redis')"
                >
                  <template #default>
                    <div class="port-btn-content">
                      <i class="pi pi-server" />
                      <span class="port-name">Redis</span>
                      <span class="port-number">6379</span>
                    </div>
                  </template>
                </Button>
              </div>
            </div>

            <!-- IP黑名单 -->
            <div class="action-section ip-section">
              <div class="section-header">
                <i class="pi pi-ban" />
                <h4>IP管理</h4>
              </div>
              <div class="ip-input-group">
                <InputText
                  v-model="newBlockIP"
                  placeholder="输入IP地址 (例: 192.168.1.100)"
                  class="ip-input ip-address-input"
                />
                <Button
                  label="拉黑"
                  icon="pi pi-ban"
                  size="small"
                  severity="danger"
                  class="block-btn"
                  @click="blockIP"
                />
              </div>
              <div class="blocked-ips">
                <div class="blocked-ips-header">
                  <span class="blocked-count">已拉黑 2 个IP</span>
                </div>
                <div class="blocked-ip-list">
                  <div class="blocked-ip-item">
                    <span class="ip-address">192.168.1.100</span>
                    <Button
                      icon="pi pi-times"
                      size="small"
                      text
                      class="remove-ip-btn"
                    />
                  </div>
                  <div class="blocked-ip-item">
                    <span class="ip-address">10.0.0.50</span>
                    <Button
                      icon="pi pi-times"
                      size="small"
                      text
                      class="remove-ip-btn"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 添加规则对话框 -->
    <Dialog
      v-model:visible="showCreateRule"
      modal
      header="添加防火墙规则"
      :style="{ width: '500px' }"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">端口</label>
          <InputText
            v-model="newRule.port"
            class="w-full"
            placeholder="80 或 80:90"
          />
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
          <InputText
            v-model="newRule.source"
            class="w-full"
            placeholder="any 或 192.168.1.0/24"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">备注</label>
          <InputText
            v-model="newRule.comment"
            class="w-full"
            placeholder="规则说明"
          />
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
  title: "防火墙管理 - EtaPanel",
});

// 响应式数据
const showCreateRule = ref(false);
const creating = ref(false);
const newBlockIP = ref("");

const stats = ref({
  activeRules: 12,
  blockedToday: 45,
});

const newRule = ref({
  port: "",
  protocol: "tcp",
  action: "ALLOW",
  source: "any",
  comment: "",
});

const protocols = [
  { label: "TCP", value: "tcp" },
  { label: "UDP", value: "udp" },
  { label: "Both", value: "both" },
];

const actions = [
  { label: "允许 (ALLOW)", value: "ALLOW" },
  { label: "拒绝 (DENY)", value: "DENY" },
];

// 获取防火墙规则
const { data: firewallRules } = await useLazyAsyncData("firewall-rules", () => {
  return Promise.resolve([
    {
      id: "1",
      port: "22",
      service: "SSH",
      action: "ALLOW",
      source: "any",
    },
    {
      id: "2",
      port: "80",
      service: "HTTP",
      action: "ALLOW",
      source: "any",
    },
    {
      id: "3",
      port: "443",
      service: "HTTPS",
      action: "ALLOW",
      source: "any",
    },
    {
      id: "4",
      port: "3306",
      service: "MySQL",
      action: "DENY",
      source: "any",
    },
  ]);
});

// 方法
const getServiceIcon = (service: string) => {
  const iconMap: Record<string, string> = {
    SSH: "pi pi-desktop service-icon-ssh",
    HTTP: "pi pi-globe service-icon-http",
    HTTPS: "pi pi-shield service-icon-https",
    MySQL: "pi pi-database service-icon-mysql",
    Redis: "pi pi-server service-icon-redis",
    FTP: "pi pi-folder service-icon-ftp",
  };
  return iconMap[service] || "pi pi-circle text-secondary-content";
};

const editRule = (id: string) => {
  console.log("编辑规则:", id);
};

const deleteRule = async (id: string) => {
  console.log("删除规则:", id);
};

const quickAddRule = (port: string, service: string) => {
  newRule.value.port = port;
  newRule.value.comment = `${service} 服务`;
  showCreateRule.value = true;
};

const blockIP = () => {
  if (!newBlockIP.value) return;
  console.log("拉黑IP:", newBlockIP.value);
  newBlockIP.value = "";
};

const createRule = async () => {
  if (!newRule.value.port) return;

  creating.value = true;

  try {
    console.log("创建防火墙规则:", newRule.value);

    newRule.value = {
      port: "",
      protocol: "tcp",
      action: "ALLOW",
      source: "any",
      comment: "",
    };

    showCreateRule.value = false;
  } catch (error) {
    console.error("创建规则失败:", error);
  } finally {
    creating.value = false;
  }
};
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

/* 防火墙页面样式 - 深色模式支持 */
.firewall-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 1.5rem;
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 状态卡片样式 */
.stat-card {
  transition: all 0.2s ease;
  border: 1px solid var(--border-primary);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-secondary);
}

/* 防火墙状态颜色 */
.firewall-status-active {
  color: var(--success);
}

.firewall-icon-active {
  color: var(--success);
}

.firewall-icon-info {
  color: var(--info);
}

.firewall-icon-danger {
  color: var(--danger);
}

.firewall-icon-warning {
  color: var(--warning);
}

/* 服务图标颜色 */
.service-icon-ssh {
  color: var(--info);
}

.service-icon-http {
  color: var(--success);
}

.service-icon-https {
  color: var(--success);
}

.service-icon-mysql {
  color: var(--warning);
}

.service-icon-redis {
  color: var(--danger);
}

.service-icon-ftp {
  color: #8b5cf6;
}

/* 快捷操作容器样式 */
.quick-actions-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 移除了淡入动画以提升效率 */

/* 操作区域样式 */
.action-section {
  padding: 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
}

.action-section:hover {
  border-color: var(--border-secondary);
}

/* 区域标题样式 */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-tertiary);
}

.section-header i {
  font-size: 1.125rem;
  color: var(--accent-primary);
}

.section-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 防火墙控制按钮样式 */
.firewall-control .action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.control-btn {
  flex: 1;
  min-width: 120px;
  justify-content: center;
}

/* 端口网格样式 */
.port-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.port-btn {
  height: auto;
  padding: 0;
  border: 1px solid var(--border-secondary);
  background: var(--bg-primary);
}

.port-btn:hover {
  border-color: var(--accent-primary);
  background: var(--bg-secondary);
}

.port-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  text-align: center;
}

.port-btn-content i {
  font-size: 1.25rem;
  color: var(--accent-primary);
  margin-bottom: 0.25rem;
}

.port-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.port-number {
  font-size: 0.625rem;
  color: var(--text-secondary);
  font-family: "Courier New", monospace;
}

/* 特定端口按钮的图标颜色和悬停效果 */
.http-btn .port-btn-content i {
  color: var(--success);
}

.http-btn:hover {
  border-color: var(--success) !important;
}

.https-btn .port-btn-content i {
  color: var(--success);
}

.https-btn:hover {
  border-color: var(--success) !important;
}

.ssh-btn .port-btn-content i {
  color: var(--info);
}

.ssh-btn:hover {
  border-color: var(--info) !important;
}

.ftp-btn .port-btn-content i {
  color: #8b5cf6;
}

.ftp-btn:hover {
  border-color: #8b5cf6 !important;
}

.mysql-btn .port-btn-content i {
  color: var(--warning);
}

.mysql-btn:hover {
  border-color: var(--warning) !important;
}

.redis-btn .port-btn-content i {
  color: var(--danger);
}

.redis-btn:hover {
  border-color: var(--danger) !important;
}

/* IP管理样式 */
.ip-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.ip-input {
  flex: 1;
  font-family: "Courier New", monospace;
}

.block-btn {
  flex-shrink: 0;
  min-width: 80px;
}

.blocked-ips {
  border-top: 1px solid var(--border-tertiary);
  padding-top: 1rem;
}

.blocked-ips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.blocked-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.blocked-ip-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.blocked-ip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
}

.blocked-ip-item:hover {
  border-color: var(--border-secondary);
  background: var(--bg-tertiary);
}

.ip-address {
  font-family: "Courier New", monospace;
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.remove-ip-btn {
  color: var(--danger);
  padding: 0.25rem;
}

.remove-ip-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .firewall-control .action-buttons {
    flex-direction: column;
  }

  .control-btn {
    min-width: auto;
  }

  .port-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ip-input-group {
    flex-direction: column;
  }

  .block-btn {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .port-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-container {
    gap: 1rem;
  }

  .action-section {
    padding: 0.75rem;
  }
}

/* 工具类 */
.border {
  border: 1px solid var(--border-primary);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.flex-1 {
  flex: 1;
}

.w-20 {
  width: 5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
