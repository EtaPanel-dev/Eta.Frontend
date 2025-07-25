<template>
  <div class="containers-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="创建容器" icon="pi pi-plus" @click="showCreateContainer = true" />
        <Button label="拉取镜像" icon="pi pi-download" outlined />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索容器..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshContainers" />
      </div>
    </div>

    <DataTable :value="filteredContainers" :paginator="true" :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
      responsive-layout="scroll" :loading="pending"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="显示第 {first} 到 {last} 条，共 {totalRecords} 条记录">
      <Column field="name" header="容器名称">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <Tag :severity="getContainerStatusSeverity(slotProps.data.status)" :value="slotProps.data.status" />
            <span class="font-medium">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="image" header="镜像" />
      <Column field="ports" header="端口映射" />
      <Column field="created" header="创建时间" />
      <Column field="uptime" header="运行时间" />
      <Column header="操作" class="w-48">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button v-if="slotProps.data.status === 'stopped'" icon="pi pi-play" size="small" text
              @click="startContainer(slotProps.data.id)" />
            <Button v-if="slotProps.data.status === 'running'" icon="pi pi-pause" size="small" text
              @click="pauseContainer(slotProps.data.id)" />
            <Button v-if="slotProps.data.status === 'running'" icon="pi pi-stop" size="small" text
              @click="stopContainer(slotProps.data.id)" />
            <Button icon="pi pi-refresh" size="small" text @click="restartContainer(slotProps.data.id)" />
            <Button icon="pi pi-desktop" size="small" text @click="openTerminal(slotProps.data.id)" />
            <Button icon="pi pi-file-text" size="small" text @click="viewLogs(slotProps.data.id)" />
            <Button icon="pi pi-trash" size="small" text severity="danger"
              @click="deleteContainer(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 创建容器对话框 -->
    <Dialog v-model:visible="showCreateContainer" modal header="创建容器" :style="{ width: '600px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">容器名称</label>
          <InputText v-model="newContainer.name" class="w-full" placeholder="输入容器名称" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">镜像</label>
          <InputText v-model="newContainer.image" class="w-full" placeholder="例如: nginx:latest" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">端口映射</label>
          <InputText v-model="newContainer.ports" class="w-full" placeholder="例如: 80:80" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">环境变量</label>
          <Textarea v-model="newContainer.env" class="w-full" rows="3" placeholder="KEY=VALUE" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateContainer = false" />
        <Button label="创建" :loading="creating" @click="createContainer" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Container } from "~/types";

// 页面 meta
useHead({
  title: "容器管理 - EtaPanel",
});

// 响应式数据
const showCreateContainer = ref(false);
const creating = ref(false);
const searchQuery = ref("");

const newContainer = ref({
  name: "",
  image: "",
  ports: "",
  env: "",
});

// API服务
const api = useApi()

// API文档中没有容器管理接口，返回空数组
const {
  data: containers,
  pending,
  refresh,
} = await useLazyAsyncData<Container[]>("containers", async () => {
  return []
});

// 过滤容器
const filteredContainers = computed(() => {
  if (!containers.value) return [];
  if (!searchQuery.value) return containers.value;

  return containers.value.filter(
    (container) =>
      container.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      container.image.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 方法
const getContainerStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    running: "success",
    stopped: "danger",
    paused: "warning",
    restarting: "info",
  };
  return severityMap[status] || "secondary";
};

const refreshContainers = () => {
  refresh();
};

// 容器操作方法 - API中没有容器接口，空实现
const startContainer = async (id: string) => {
  console.log('容器管理功能暂未实现')
}
const pauseContainer = async (id: string) => {}
const stopContainer = async (id: string) => {}
const restartContainer = async (id: string) => {}
const openTerminal = (id: string) => {}
const viewLogs = async (id: string) => {}
const deleteContainer = async (id: string) => {}
const createContainer = async () => {}
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

/* 页面样式 - 自动跟随系统主题 */
.containers-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

/* 卡片标题修复 */
:deep(.p-card-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-tertiary);
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

:deep(.p-card-title) {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

:deep(.p-card-content) {
  padding: 1.25rem;
  background: var(--bg-primary);
  transition: all 0.3s ease;
}
</style>
