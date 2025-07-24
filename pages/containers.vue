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

// 获取容器数据
const {
  data: containers,
  pending,
  refresh,
} = await useLazyAsyncData<Container[]>("containers", () => {
  return Promise.resolve([
    {
      id: "1",
      name: "nginx-web",
      image: "nginx:latest",
      status: "running",
      ports: "80:80, 443:443",
      created: "2024-01-15 10:30",
      uptime: "5天 3小时",
    },
    {
      id: "2",
      name: "mysql-db",
      image: "mysql:8.0",
      status: "running",
      ports: "3306:3306",
      created: "2024-01-10 14:20",
      uptime: "10天 8小时",
    },
    {
      id: "3",
      name: "redis-cache",
      image: "redis:alpine",
      status: "stopped",
      ports: "6379:6379",
      created: "2024-01-08 09:15",
      uptime: "-",
    },
    {
      id: "4",
      name: "app-backend",
      image: "node:18-alpine",
      status: "running",
      ports: "3000:3000",
      created: "2024-01-20 16:45",
      uptime: "2天 1小时",
    },
    {
      id: "5",
      name: "postgres-db",
      image: "postgres:15",
      status: "running",
      ports: "5432:5432",
      created: "2024-01-18 09:30",
      uptime: "4天 2小时",
    },
    {
      id: "6",
      name: "mongodb-store",
      image: "mongo:7.0",
      status: "paused",
      ports: "27017:27017",
      created: "2024-01-16 14:15",
      uptime: "-",
    },
    {
      id: "7",
      name: "elasticsearch-search",
      image: "elasticsearch:8.11",
      status: "running",
      ports: "9200:9200, 9300:9300",
      created: "2024-01-14 11:45",
      uptime: "8天 5小时",
    },
    {
      id: "8",
      name: "rabbitmq-queue",
      image: "rabbitmq:3.12-management",
      status: "running",
      ports: "5672:5672, 15672:15672",
      created: "2024-01-12 16:20",
      uptime: "10天 1小时",
    },
    {
      id: "9",
      name: "grafana-monitor",
      image: "grafana/grafana:latest",
      status: "stopped",
      ports: "3000:3000",
      created: "2024-01-11 13:30",
      uptime: "-",
    },
    {
      id: "10",
      name: "prometheus-metrics",
      image: "prom/prometheus:latest",
      status: "running",
      ports: "9090:9090",
      created: "2024-01-09 10:15",
      uptime: "13天 7小时",
    },
    {
      id: "11",
      name: "jenkins-ci",
      image: "jenkins/jenkins:lts",
      status: "running",
      ports: "8080:8080, 50000:50000",
      created: "2024-01-07 15:45",
      uptime: "15天 3小时",
    },
    {
      id: "12",
      name: "sonarqube-quality",
      image: "sonarqube:community",
      status: "stopped",
      ports: "9000:9000",
      created: "2024-01-05 12:20",
      uptime: "-",
    },
  ]);
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

const startContainer = async (id: string) => {
  console.log("启动容器:", id);
  // 这里调用 API 启动容器
};

const pauseContainer = async (id: string) => {
  console.log("暂停容器:", id);
  // 这里调用 API 暂停容器
};

const stopContainer = async (id: string) => {
  console.log("停止容器:", id);
  // 这里调用 API 停止容器
};

const restartContainer = async (id: string) => {
  console.log("重启容器:", id);
  // 这里调用 API 重启容器
};

const openTerminal = (id: string) => {
  console.log("打开终端:", id);
  // 这里打开容器终端
};

const viewLogs = (id: string) => {
  console.log("查看日志:", id);
  // 这里查看容器日志
};

const deleteContainer = async (id: string) => {
  console.log("删除容器:", id);
  // 这里调用 API 删除容器
};

const createContainer = async () => {
  if (!newContainer.value.name || !newContainer.value.image) {
    return;
  }

  creating.value = true;

  try {
    // 这里调用 API 创建容器
    console.log("创建容器:", newContainer.value);

    // 重置表单
    newContainer.value = {
      name: "",
      image: "",
      ports: "",
      env: "",
    };

    showCreateContainer.value = false;
    await refresh();
  } catch (error) {
    console.error("创建容器失败:", error);
  } finally {
    creating.value = false;
  }
};
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
