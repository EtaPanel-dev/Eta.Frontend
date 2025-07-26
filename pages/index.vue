<template>
  <div class="dashboard-content">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">系统仪表板</h1>
        <Tag
          v-if="isDataStale"
          severity="warning"
          value="数据过期"
          class="text-xs"
        />
      </div>
      <div class="flex items-center gap-2">
        <small v-if="lastUpdateTime" class="text-gray-500">
          更新于 {{ new Date(lastUpdateTime).toLocaleTimeString() }}
        </small>
        <Button
          :icon="isRefreshing ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
          :label="isRefreshing ? '刷新中...' : '刷新'"
          @click="refreshSystemInfo"
          :disabled="isRefreshing"
          size="small"
        />
      </div>
    </div>

    <!-- 系统概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card
        v-for="metric in systemMetrics"
        :key="metric.title"
        class="metric-card relative"
      >
        <template #content>
          <div v-if="isLoading" class="skeleton-container">
            <div class="skeleton-content">
              <div class="skeleton-line skeleton-title"></div>
              <div class="skeleton-line skeleton-value"></div>
              <div class="skeleton-line skeleton-subtitle"></div>
              <div class="skeleton-row">
                <div class="skeleton-line skeleton-left"></div>
                <div class="skeleton-line skeleton-right"></div>
              </div>
            </div>
            <div class="skeleton-icon"></div>
          </div>
          <div v-else class="flex items-center justify-between">
            <div>
              <div class="text-sm text-secondary-content mb-1">
                {{ metric.title }}
              </div>
              <div
                class="text-2xl font-bold text-primary-content"
                :class="{ truncate: metric.title === '系统信息' }"
                :title="metric.title === '系统信息' ? systemInfo?.hostname : ''"
              >
                {{ metric.value }}
              </div>
              <div class="text-xs text-tertiary-content">
                {{ metric.subtitle }}
              </div>
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
              <span class="text-sm text-secondary-content">当前使用率</span>
              <span class="text-lg font-bold text-primary-content"
                >{{ cpuUsage }}%</span
              >
            </div>
            <!-- CustomProgressBar 组件需要你自己提供或引入 -->
            <CustomProgressBar :value="cpuUsage" class-name="mb-2" />
            <div class="grid grid-cols-4 gap-2 text-xs text-secondary-content">
              <div>负载: {{ systemInfo?.load || "0.0" }}</div>
              <div>核心: {{ systemInfo?.cpuCores || 0 }}</div>
              <div>进程: {{ systemInfo?.processes || 0 }}</div>
              <div>架构: {{ systemInfo?.arch || "Unknown" }}</div>
            </div>
            <div class="mt-2 text-xs text-secondary-content truncate" :title="systemInfo?.cpuModel">
              型号: {{ systemInfo?.cpuModel || "Unknown" }}
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
                >{{ memoryUsed }} / {{ memoryTotal }} (交换:
                {{ formatBytes(systemInfo?.swapUsed || 0) }} /
                {{ formatBytes(systemInfo?.swapTotal || 0) }})</span
              >
            </div>
            <CustomProgressBar :value="memoryUsage" class-name="mb-2" />
            <div class="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>缓存: {{ systemInfo?.memoryCached || "0.0" }} GB</div>
              <div>缓冲区: {{ systemInfo?.memoryBuffer || "0.0" }} GB</div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 磁盘使用情况 -->
    <Card class="mb-6">
      <template #title>磁盘使用情况</template>
      <template #content>
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-3">
            <div class="skeleton-line" style="width: 8rem; height: 1rem"></div>
            <div class="skeleton-line" style="width: 6rem; height: 1rem"></div>
            <div class="skeleton-line" style="width: 6rem; height: 1rem"></div>
            <div class="skeleton-line" style="width: 6rem; height: 1rem"></div>
            <div class="flex items-center gap-2 flex-1">
              <div
                class="skeleton-line"
                style="width: 100%; height: 0.5rem"
              ></div>
              <div
                class="skeleton-line"
                style="width: 3rem; height: 1rem"
              ></div>
            </div>
            <div class="skeleton-line" style="width: 8rem; height: 1rem"></div>
          </div>
        </div>
        <div v-else>
          <DataTable :value="paginatedDiskInfo" responsive-layout="scroll">
            <Column field="device" header="设备" />
            <Column field="total" header="总大小">
              <template #body="slotProps">
                {{ formatBytes(slotProps.data.total) }}
              </template>
            </Column>
            <Column field="used" header="已使用">
              <template #body="slotProps">
                {{ formatBytes(slotProps.data.used) }}
              </template>
            </Column>
            <Column field="available" header="可用">
              <template #body="slotProps">
                {{ formatBytes(slotProps.data.available) }}
              </template>
            </Column>
            <Column field="usedPercent" header="使用率">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <CustomProgressBar
                    :value="slotProps.data.usedPercent"
                    class-name="flex-1 h-2"
                  />
                  <span class="text-sm"
                    >{{ Math.round(slotProps.data.usedPercent) }}%</span
                  >
                </div>
              </template>
            </Column>
            <Column field="mountPoint" header="挂载点" />
          </DataTable>
          <Paginator
            v-if="diskInfo.length > diskPageSize"
            v-model:first="diskFirst"
            :rows="diskPageSize"
            :totalRecords="diskInfo.length"
            template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} - {last} / {totalRecords}"
            class="mt-4"
          />
        </div>
      </template>
    </Card>

    <!-- 网络状态卡片 -->
    <Card class="mb-6">
      <template #title>
        <div class="flex items-center justify-between w-full">
          <span>网络状态</span>
          <small
            v-if="networkInterfaces.length > 0"
            class="text-gray-500 ml-auto"
          >
            {{ filteredNetworkInterfaces.length }} /
            {{ networkInterfaces.length }} 个接口
          </small>
        </div>
      </template>
      <template #content>
        <div v-if="isLoading">
          <div class="network-filter-container">
            <div
              class="skeleton-line"
              style="width: 12rem; height: 2.25rem"
            ></div>
          </div>
          <div class="space-y-3 mb-4">
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div
                  class="skeleton-line"
                  style="width: 4rem; height: 1.5rem; border-radius: 1rem"
                ></div>
                <div>
                  <div
                    class="skeleton-line"
                    style="width: 6rem; height: 1rem; margin-bottom: 0.5rem"
                  ></div>
                  <div
                    class="skeleton-line"
                    style="width: 10rem; height: 0.875rem"
                  ></div>
                </div>
              </div>
              <div class="text-right">
                <div
                  class="skeleton-line"
                  style="width: 4rem; height: 0.875rem; margin-bottom: 0.25rem"
                ></div>
                <div
                  class="skeleton-line"
                  style="width: 4rem; height: 0.875rem"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else-if="networkInterfaces.length === 0"
          class="text-center py-4 text-gray-500"
        >
          暂无网络接口信息
        </div>
        <div v-else>
          <div class="network-filter-container">
            <Select
              v-model="networkFilter"
              :options="networkFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="选择网络状态"
              class="network-filter-select"
            />
          </div>
          <div class="space-y-3 mb-4">
            <div
              v-for="netInterface in paginatedNetworkInterfaces"
              :key="netInterface.name"
              class="flex items-center justify-between p-3 border rounded-lg"
            >
              <div class="flex items-center gap-3">
                <Tag
                  :severity="
                    netInterface.addresses && netInterface.addresses.length > 0
                      ? 'success'
                      : 'secondary'
                  "
                  :value="
                    netInterface.addresses && netInterface.addresses.length > 0
                      ? '活跃'
                      : '未连接'
                  "
                />
                <div>
                  <div class="font-medium">{{ netInterface.name }}</div>
                  <div class="text-sm text-gray-600">
                    {{
                      netInterface.addresses &&
                      netInterface.addresses.length > 0
                        ? netInterface.addresses.join(", ")
                        : "无IP地址"
                    }}
                  </div>
                </div>
              </div>
              <div class="text-right text-sm text-gray-500">
                <div>↑ {{ formatBytes(netInterface.txBytes || 0) }}</div>
                <div>↓ {{ formatBytes(netInterface.rxBytes || 0) }}</div>
              </div>
            </div>
          </div>
          <Paginator
            v-if="filteredNetworkInterfaces.length > networkPageSize"
            v-model:first="networkFirst"
            :rows="networkPageSize"
            :totalRecords="filteredNetworkInterfaces.length"
            template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} - {last} / {totalRecords}"
          />
        </div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
// 引入 PrimeVue 组件
import Card from "primevue/card";
import Tag from "primevue/tag";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Paginator from "primevue/paginator";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";

// 假设这些类型定义在你的项目中
import type { SystemMetric, DiskInfo, Container, SystemService } from "~/types"; // 假设你的类型定义在 ~/types.ts

// 引入你真实的 composables
import { useSystemInfo } from "~/composables/useSystemInfo"; // 请确保路径正确
import { useApi } from "~/composables/useApi"; // 请确保路径正确

// 定义 SystemInfo 接口，确保 cpuCores 存在 (如果你的 ~/types 中没有，可以保留在这里)
interface SystemInfo {
  cpu?: number;
  cpuCores?: number;
  load?: string;
  processes?: number;
  arch?: string;
  memory?: number;
  memoryUsed?: string;
  memoryTotal?: string;
  memoryCached?: string;
  memoryBuffer?: string;
  swapUsed?: number;
  swapTotal?: number;
  hostname?: string;
  os?: string;
  uptime?: number;
}

// -------------------------------------------------------------------
// 主组件逻辑
// -------------------------------------------------------------------

// 使用系统信息 composable
const { systemInfo, refreshSystemInfo, startAutoRefresh } = useSystemInfo();
const api = useApi();

// 响应式状态
const nginxStatus = ref({ running: false });
const diskInfo = ref<DiskInfo[]>([]);
const runningContainers = ref<Container[]>([]);
const isLoading = ref(true);

// 从 useSystemInfo 获取状态
const { isRefreshing, isDataStale, lastUpdateTime } = useSystemInfo();

// 响应式计算属性 - 确保实时更新
const cpuUsage = computed(() => {
  const cpu = systemInfo.value?.cpu;
  return typeof cpu === "number" ? Math.round(cpu) : 0;
});

const memoryUsage = computed(() => {
  const memory = systemInfo.value?.memory;
  return typeof memory === "number" ? Math.round(memory) : 0;
});

const memoryUsed = computed(() => systemInfo.value?.memoryUsed || "0 GB");
const memoryTotal = computed(() => systemInfo.value?.memoryTotal || "0 GB");

// 获取磁盘信息
const fetchDiskInfo = async () => {
  try {
    const data = await api.getDiskInfo();
    diskInfo.value = data || [];
  } catch (error) {
    console.error("获取磁盘信息失败:", error);
    diskInfo.value = [];
  }
};

// 网络接口信息和分页
const networkInterfaces = computed(
  () => systemInfo.value?.networkInterfaces || []
);
const networkFilter = ref("all");
const networkFirst = ref(0);
const networkPageSize = 5;

const networkFilterOptions = [
  { label: "全部", value: "all" },
  { label: "活跃", value: "active" },
  { label: "未连接", value: "inactive" },
];

const filteredNetworkInterfaces = computed(() => {
  if (networkFilter.value === "active") {
    return networkInterfaces.value.filter(
      (iface) => iface.addresses && iface.addresses.length > 0
    );
  } else if (networkFilter.value === "inactive") {
    return networkInterfaces.value.filter(
      (iface) => !iface.addresses || iface.addresses.length === 0
    );
  }
  return networkInterfaces.value;
});

const paginatedNetworkInterfaces = computed(() => {
  return filteredNetworkInterfaces.value.slice(
    networkFirst.value,
    networkFirst.value + networkPageSize
  );
});

// 重置分页当筛选条件改变时
watch(networkFilter, () => {
  networkFirst.value = 0;
});

// 磁盘信息分页
const diskFirst = ref(0);
const diskPageSize = 5;
const paginatedDiskInfo = computed(() => {
  return diskInfo.value.slice(diskFirst.value, diskFirst.value + diskPageSize);
});

// 字节数格式化函数
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 磁盘大小格式化函数
const formatDiskSize = (size: string | number): string => {
  if (typeof size === "string" && size.match(/\d+[KMGT]?B?$/i)) {
    return size;
  }

  const bytes = typeof size === "string" ? parseInt(size) : size;
  if (isNaN(bytes) || bytes === 0) return "0 B";

  return formatBytes(bytes);
};

// 系统指标 - 完全响应式
const systemMetrics = computed<SystemMetric[]>(() => {
  const info = systemInfo.value;
  if (!info) return [];

  return [
    {
      title: "CPU 使用率",
      value: `${cpuUsage.value}%`,
      subtitle: `${info.cpuCores || 0}核心`,
      icon: "pi pi-microchip",
      color: "#3B82F6",
    },
    {
      title: "内存使用",
      value: memoryUsed.value,
      subtitle: `总计 ${memoryTotal.value}`,
      icon: "pi pi-server",
      color: "#10B981",
    },
    {
      title: "系统信息",
      value: info.hostname || "Unknown",
      subtitle: `${info.os || ""} ${info.arch || ""}`.trim() || "Unknown",
      icon: "pi pi-desktop",
      color: "#F59E0B",
    },
    {
      title: "进程数量",
      value: (info.processes || 0).toString(),
      subtitle: `运行时间 ${Math.floor((info.uptime || 0) / 3600)}h`,
      icon: "pi pi-cog",
      color: "#8B5CF6",
    },
  ];
});

// 系统服务状态 - 响应式
const systemServices = computed<SystemService[]>(() => [
  {
    name: "Nginx",
    description: "Web 服务器",
    status: nginxStatus.value?.running ? "active" : "inactive",
  },
  // 假设你的真实数据中也包含其他服务，或者你可以从 API 获取
  // 例如：
  // {
  //   name: "MySQL",
  //   description: "数据库服务",
  //   status: someApi.getMysqlStatus() ? "active" : "inactive",
  // },
]);

// 获取Nginx状态
const fetchNginxStatus = async () => {
  try {
    const result = await api.getNginxStatus(); // 使用真实的 api.getNginxStatus()
    nginxStatus.value = result || { running: false };
  } catch (error) {
    console.error("获取Nginx状态失败:", error);
    nginxStatus.value = { running: false };
  }
};

// 初始化数据获取
const initializeData = async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      refreshSystemInfo(),
      fetchDiskInfo(),
      fetchNginxStatus(),
    ]);
  } catch (error) {
    console.error("初始化数据失败:", error);
  } finally {
    isLoading.value = false;
  }
};

// 导航到容器页面 (这里只是一个占位符函数)
const navigateToContainers = () => {
  console.log("导航到容器页面");
  // 实际项目中会使用 Vue Router 进行导航
  // 例如: router.push('/containers');
};

// SSR/CSR 兼容的初始化
if (process.client) {
  onMounted(async () => {
    await initializeData();
    startAutoRefresh(5000);
  });
}

// 页面离开时清理
onBeforeUnmount(() => {
  // 自动刷新会在 useSystemInfo 中自动清理
});

// 设置页面 meta (如果你使用 Nuxt 或类似的框架)
// useHead({
//   title: "仪表板 - EtaPanel",
// });

// -------------------------------------------------------------------
// CustomProgressBar 组件 (需要你从项目中引入或提供)
// -------------------------------------------------------------------
// 请确保你的项目中有这个组件。如果这是一个单独的 Vue 组件文件，
// 你需要正确地导入它。这里不再提供内联实现。
// import CustomProgressBar from '~/components/CustomProgressBar.vue'; // 示例导入路径
</script>

<style scoped>
/* 仪表板页面样式 - 自动跟随系统主题 */
.dashboard-content {
  background: var(--bg-secondary, #f8fafc); /* 默认值 */
  color: var(--text-primary, #334155); /* 默认值 */
  transition: all 0.3s ease;
}

.metric-card {
  border: 1px solid var(--border-primary, #e2e8f0); /* 默认值 */
  transition: all 0.3s ease;
}

.metric-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
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

/* 卡片标题与边框间距修复 - 自动跟随系统主题 */
:deep(.p-card) {
  border: 1px solid var(--border-primary, #e2e8f0);
  border-radius: 0.75rem;
  box-shadow: var(
    --shadow-md,
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06)
  );
  overflow: hidden;
  background: var(--bg-primary, #ffffff);
  transition: all 0.3s ease;
}

:deep(.p-card-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid var(--border-tertiary, #f1f5f9);
  background: var(--bg-secondary, #f8fafc);
  margin: 0;
  transition: all 0.3s ease;
}

:deep(.p-card-title) {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary, #334155);
  line-height: 1.5;
  transition: color 0.3s ease;
}

:deep(.p-card-content) {
  padding: 1.5rem;
  margin: 0;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #334155);
  transition: all 0.3s ease;
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
  border-color: var(--border-secondary, #cbd5e1);
  box-shadow: var(
    --shadow-lg,
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05)
  );
  transform: translateY(-2px);
}

.metric-card :deep(.p-card-content) {
  padding: 1.75rem 1.5rem;
}

.metric-card :deep(.p-card-header) {
  display: none;
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
  letter-spacing: 0.025em !important;
  word-spacing: 0.1em !important;
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
  background: linear-gradient(to right, #00dc82, #3b82f6) !important;
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
  min-height: 3.5rem;
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
  background: linear-gradient(to right, #00dc82, #3b82f6);
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}

/* 加载状态样式 */
.metric-card.opacity-60 {
  transition: opacity 0.3s ease;
}

.metric-card .absolute {
  backdrop-filter: blur(1px);
}

/* 数据过期标签样式 */
:deep(.p-tag.text-xs) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* 页面标题区域样式 */
.dashboard-content h1 {
  color: var(--text-primary);
  font-weight: 700;
}

.dashboard-content .text-gray-500 {
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

/* 主机名截断样式 */
.text-2xl.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}

/* 骨架屏样式 */
.skeleton-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.skeleton-content {
  flex: 1;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  display: block;
  margin-bottom: 4px;
}

.skeleton-title {
  width: 64px;
  height: 12px;
}

.skeleton-value {
  width: 80px;
  height: 28px;
}

.skeleton-subtitle {
  width: 96px;
  height: 12px;
}

.skeleton-extra {
  width: 80px;
  height: 12px;
}

.skeleton-row {
  display: flex;
  gap: 8px;
}

.skeleton-left {
  width: 48px;
  height: 12px;
  margin-bottom: 0;
}

.skeleton-right {
  width: 32px;
  height: 12px;
  margin-bottom: 0;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 定义 CSS 变量以支持主题切换 */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #334155;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --border-primary: #e2e8f0;
  --border-secondary: #cbd5e1;
  --border-tertiary: #f1f5f9;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 网络筛选器样式 */
.network-filter-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.network-filter-select {
  width: 12rem;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .network-filter-select {
    width: 10rem;
  }
}



/* 示例：暗色主题（如果你有主题切换功能） */
/*
body.dark-theme {
  --bg-primary: #1e293b;
  --bg-secondary: #0f172a;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --border-primary: #334155;
  --border-secondary: #475569;
  --border-tertiary: #1f2937;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
}
*/
</style>
