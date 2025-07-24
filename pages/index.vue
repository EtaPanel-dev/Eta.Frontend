<template>
  <div class="dashboard-content">
    <!-- 系统概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card
        v-for="metric in systemMetrics"
        :key="metric.title"
        class="metric-card"
      >
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">{{ metric.title }}</div>
              <div class="text-2xl font-bold">{{ metric.value }}</div>
              <div class="text-xs text-gray-500">{{ metric.subtitle }}</div>
            </div>
            <div
              class="metric-icon"
              :style="{
                backgroundColor: metric.color + '20',
                color: metric.color,
              }"
            >
              <i :class="metric.icon" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 系统监控图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <template #title>CPU 使用率</template>
        <template #content>
          <div class="cpu-chart">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm">当前使用率</span>
              <span class="text-lg font-bold">{{ cpuUsage }}%</span>
            </div>
            <CustomProgressBar :value="cpuUsage" class-name="mb-2" />
            <div class="grid grid-cols-4 gap-2 text-xs text-gray-600">
              <div>1分钟: 0.8</div>
              <div>5分钟: 1.2</div>
              <div>15分钟: 1.5</div>
              <div>进程: 156</div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>内存使用情况</template>
        <template #content>
          <div class="memory-chart">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm">已使用</span>
              <span class="text-lg font-bold"
                >{{ memoryUsed }} / {{ memoryTotal }}</span
              >
            </div>
            <CustomProgressBar :value="memoryUsage" class-name="mb-2" />
            <div class="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>缓存: 2.1 GB</div>
              <div>缓冲区: 0.8 GB</div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 磁盘使用情况 -->
    <Card class="mb-6">
      <template #title>磁盘使用情况</template>
      <template #content>
        <DataTable :value="diskInfo" responsive-layout="scroll">
          <Column field="filesystem" header="文件系统" />
          <Column field="size" header="总大小" />
          <Column field="used" header="已使用" />
          <Column field="available" header="可用" />
          <Column field="usage" header="使用率">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <CustomProgressBar
                  :value="slotProps.data.usagePercent"
                  class-name="flex-1 h-2"
                />
                <span class="text-sm">{{ slotProps.data.usage }}</span>
              </div>
            </template>
          </Column>
          <Column field="mountpoint" header="挂载点" />
        </DataTable>
      </template>
    </Card>

    <!-- 运行中的容器和服务 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>运行中的容器</span>
            <Button
              icon="pi pi-plus"
              size="small"
              text
              @click="navigateToContainers"
            />
          </div>
        </template>
        <template #content>
          <div
            v-if="runningContainers.length === 0"
            class="text-center py-4 text-gray-500"
          >
            暂无运行中的容器
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="container in runningContainers"
              :key="container.id"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex items-center gap-3">
                <Tag severity="success" value="运行中" />
                <div>
                  <div class="font-medium">{{ container.name }}</div>
                  <div class="text-sm text-gray-600">{{ container.image }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <Button icon="pi pi-pause" size="small" text />
                <Button icon="pi pi-stop" size="small" text />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>系统服务状态</template>
        <template #content>
          <div class="space-y-3">
            <div
              v-for="service in systemServices"
              :key="service.name"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex items-center gap-3">
                <Tag
                  :severity="service.status === 'active' ? 'success' : 'danger'"
                  :value="service.status === 'active' ? '运行中' : '已停止'"
                />
                <div>
                  <div class="font-medium">{{ service.name }}</div>
                  <div class="text-sm text-gray-600">
                    {{ service.description }}
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <Button
                  :icon="
                    service.status === 'active' ? 'pi pi-stop' : 'pi pi-play'
                  "
                  size="small"
                  text
                />
                <Button icon="pi pi-refresh" size="small" text />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SystemMetric, DiskInfo, Container, SystemService } from "~/types";

// 使用自定义 composables
const { systemInfo } = useSystemInfo();

// 创建计算属性确保一致的值
const cpuUsage = computed(() => systemInfo.value?.cpu ?? 32);
const memoryUsage = computed(() => systemInfo.value?.memory ?? 68);
const memoryUsed = computed(() => systemInfo.value?.memoryUsed ?? "5.4 GB");
const memoryTotal = computed(() => systemInfo.value?.memoryTotal ?? "8.0 GB");

// 系统指标
const systemMetrics = ref<SystemMetric[]>([
  {
    title: "CPU 使用率",
    value: "32%",
    subtitle: "4核心",
    icon: "pi pi-microchip",
    color: "#3B82F6",
  },
  {
    title: "内存使用",
    value: "5.4GB",
    subtitle: "总计 8.0GB",
    icon: "pi pi-server",
    color: "#10B981",
  },
  {
    title: "磁盘使用",
    value: "45%",
    subtitle: "120GB / 256GB",
    icon: "pi pi-database",
    color: "#F59E0B",
  },
  {
    title: "网络流量",
    value: "125MB/s",
    subtitle: "上行 45MB/s",
    icon: "pi pi-wifi",
    color: "#8B5CF6",
  },
]);

// 磁盘信息
const diskInfo = ref<DiskInfo[]>([
  {
    filesystem: "/dev/sda1",
    size: "256GB",
    used: "115GB",
    available: "141GB",
    usage: "45%",
    usagePercent: 45,
    mountpoint: "/",
  },
  {
    filesystem: "/dev/sda2",
    size: "500GB",
    used: "320GB",
    available: "180GB",
    usage: "64%",
    usagePercent: 64,
    mountpoint: "/home",
  },
]);

// 运行中的容器
const runningContainers = ref<Container[]>([
  {
    id: "1",
    name: "nginx-web",
    image: "nginx:latest",
    status: "running",
    ports: "80:80",
    created: "2024-01-15",
    uptime: "5天",
  },
  {
    id: "2",
    name: "mysql-db",
    image: "mysql:8.0",
    status: "running",
    ports: "3306:3306",
    created: "2024-01-10",
    uptime: "10天",
  },
  {
    id: "3",
    name: "redis-cache",
    image: "redis:alpine",
    status: "running",
    ports: "6379:6379",
    created: "2024-01-08",
    uptime: "12天",
  },
]);

// 系统服务
const systemServices = ref<SystemService[]>([
  {
    name: "Docker",
    description: "Docker 容器服务",
    status: "active",
  },
  {
    name: "Nginx",
    description: "Web 服务器",
    status: "active",
  },
  {
    name: "SSH",
    description: "SSH 远程连接服务",
    status: "active",
  },
  {
    name: "Firewall",
    description: "防火墙服务",
    status: "inactive",
  },
]);

// 导航到容器页面
const navigateToContainers = () => {
  navigateTo("/containers");
};

// 设置页面 meta
useHead({
  title: "仪表板 - EtaPanel",
});
</script>

<style scoped>
.metric-card {
  border: 1px solid #e2e8f0;
}

.metric-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
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

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.h-2 {
  height: 0.5rem;
}

.flex-1 {
  flex: 1;
}

/* 卡片标题与边框间距修复 */
:deep(.p-card) {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:deep(.p-card-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem 1.5rem; /* 调整顶部和底部内边距 */
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
  margin: 0; /* 确保没有外边距 */
}

:deep(.p-card-title) {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.5;
}

:deep(.p-card-content) {
  padding: 1.5rem;
  margin: 0; /* 确保没有外边距 */
}

:deep(.p-card-body) {
  padding: 0;
  margin: 0;
}

/* 系统概览卡片特殊样式 */
.metric-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.metric-card :deep(.p-card-content) {
  padding: 1.75rem 1.5rem; /* 增加内边距使内容更舒适 */
}

.metric-card :deep(.p-card-header) {
  display: none; /* 隐藏系统概览卡片的标题栏 */
}

/* 确保所有卡片标题区域的一致性 */
:deep(.p-card-header .p-button) {
  margin: 0;
  padding: 0.5rem;
}

/* 修复表格卡片的标题间距 */
:deep(.p-datatable) .p-datatable-header {
  padding: 0;
  border: none;
  background: transparent;
}

/* 优化卡片内容区域的间距 */
:deep(.p-card-content) > .space-y-3 > *:first-child {
  margin-top: 0;
}

:deep(.p-card-content) > .grid:first-child {
  margin-top: 0;
}

/* 修复卡片标题文字间距 */
:deep(.p-card-title) {
  letter-spacing: 0.025em !important; /* 增加字母间距 */
  word-spacing: 0.1em !important; /* 增加单词间距 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial,
    sans-serif !important;
}

/* 修复进度条样式 */
:deep(.p-progressbar) {
  height: 0.5rem !important;
  background: #e5e7eb !important;
  border-radius: 0.25rem !important;
  overflow: hidden !important;
}

:deep(.p-progressbar .p-progressbar-value) {
  background: #3b82f6 !important;
  height: 100% !important;
  border-radius: 0.25rem !important;
  transition: width 0.3s ease !important;
}

/* 确保进度条文字隐藏 */
:deep(.p-progressbar .p-progressbar-label) {
  display: none !important;
}

/* 修复CPU和内存图表区域的间距 */
.cpu-chart,
.memory-chart {
  padding: 0;
}

.cpu-chart .flex,
.memory-chart .flex {
  align-items: center;
  justify-content: space-between;
}

/* 优化统计信息网格的间距 */
.cpu-chart .grid,
.memory-chart .grid {
  margin-top: 0.75rem;
}

.cpu-chart .grid > div,
.memory-chart .grid > div {
  padding: 0.25rem 0;
}

/* 修复中文字体显示和间距 */
.text-sm,
.text-lg,
.text-xs,
.text-2xl {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial,
    sans-serif !important;
  letter-spacing: 0.025em;
}

/* 优化卡片标题区域的整体布局 */
:deep(.p-card-header) {
  min-height: 3.5rem; /* 确保标题区域有足够高度 */
  align-items: center;
}

/* 修复标题文字的垂直对齐 */
:deep(.p-card-title) {
  display: flex;
  align-items: center;
  min-height: 1.5rem;
}

/* 自定义进度条样式优化 */
:deep(.custom-progress-bar) {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

:deep(.custom-progress-bar-fill) {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}
</style>
