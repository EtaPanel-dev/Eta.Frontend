<template>
  <div class="processes-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button
          label="刷新进程"
          icon="pi pi-refresh"
          @click="refreshProcesses"
        />
        <Button
          label="终止选中"
          icon="pi pi-times"
          severity="danger"
          :disabled="!selectedProcesses.length"
          @click="killSelectedProcesses"
        />
      </div>
      <div class="flex gap-2">
        <InputText
          v-model="searchQuery"
          placeholder="搜索进程..."
          class="w-64"
        />
        <Dropdown
          v-model="sortBy"
          :options="sortOptions"
          option-label="label"
          option-value="value"
          class="w-32"
        />
      </div>
    </div>

    <DataTable
      :value="filteredProcesses"
      :paginator="true"
      :rows="20"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      responsive-layout="scroll"
      :loading="pending"
      selection-mode="multiple"
      v-model:selection="selectedProcesses"
      :sort-field="sortBy"
      :sort-order="1"
    >
      <Column selection-mode="multiple" header-style="width: 3rem" />
      <Column field="pid" header="PID" sortable class="w-20">
        <template #body="slotProps">
          <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{
            slotProps.data.pid
          }}</code>
        </template>
      </Column>
      <Column field="name" header="进程名" sortable>
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <i class="pi pi-cog text-blue-500"></i>
            <span class="font-medium">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="user" header="用户" sortable />
      <Column field="cpu" header="CPU%" sortable class="w-24">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <CustomProgressBar
              :value="slotProps.data.cpu"
              class-name="flex-1 h-2"
            />
            <span class="text-sm">{{ slotProps.data.cpu.toFixed(1) }}%</span>
          </div>
        </template>
      </Column>
      <Column field="memory" header="内存%" sortable class="w-24">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <CustomProgressBar
              :value="slotProps.data.memory"
              class-name="flex-1 h-2"
            />
            <span class="text-sm">{{ slotProps.data.memory.toFixed(1) }}%</span>
          </div>
        </template>
      </Column>
      <Column field="command" header="命令">
        <template #body="slotProps">
          <div class="max-w-xs truncate" :title="slotProps.data.command">
            {{ slotProps.data.command }}
          </div>
        </template>
      </Column>
      <Column header="操作" class="w-32">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button
              icon="pi pi-info-circle"
              size="small"
              text
              @click="showProcessDetails(slotProps.data)"
              v-tooltip="'详细信息'"
            />
            <Button
              icon="pi pi-times"
              size="small"
              text
              severity="danger"
              @click="killProcess(slotProps.data)"
              v-tooltip="'终止进程'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 进程详情对话框 -->
    <Dialog
      v-model:visible="showDetails"
      modal
      header="进程详细信息"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedProcess" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >进程ID</label
            >
            <p class="mt-1 text-sm text-gray-900">{{ selectedProcess.pid }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >进程名</label
            >
            <p class="mt-1 text-sm text-gray-900">{{ selectedProcess.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">用户</label>
            <p class="mt-1 text-sm text-gray-900">{{ selectedProcess.user }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >CPU使用率</label
            >
            <p class="mt-1 text-sm text-gray-900">
              {{ selectedProcess.cpu.toFixed(2) }}%
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >内存使用率</label
            >
            <p class="mt-1 text-sm text-gray-900">
              {{ selectedProcess.memory.toFixed(2) }}%
            </p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >完整命令</label
          >
          <p
            class="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded break-all"
          >
            {{ selectedProcess.command }}
          </p>
        </div>
      </div>
      <template #footer>
        <Button label="关闭" @click="showDetails = false" />
        <Button
          label="终止进程"
          severity="danger"
          @click="killProcess(selectedProcess)"
        />
      </template>
    </Dialog>

    <!-- 终止进程确认对话框 -->
    <Dialog
      v-model:visible="showKillConfirm"
      modal
      header="确认终止进程"
      :style="{ width: '400px' }"
    >
      <div class="space-y-4">
        <p>确定要终止以下进程吗？</p>
        <div v-if="processToKill" class="bg-gray-50 p-3 rounded">
          <p><strong>PID:</strong> {{ processToKill.pid }}</p>
          <p><strong>名称:</strong> {{ processToKill.name }}</p>
          <p><strong>用户:</strong> {{ processToKill.user }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">终止信号</label>
          <Dropdown
            v-model="killSignal"
            :options="signalOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showKillConfirm = false" />
        <Button
          label="确认终止"
          severity="danger"
          :loading="killing"
          @click="confirmKillProcess"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { ProcessInfo } from "~/types";

// 页面 meta
useHead({
  title: "进程管理 - EtaPanel",
});

// 响应式数据
const searchQuery = ref("");
const sortBy = ref("cpu");
const selectedProcesses = ref<ProcessInfo[]>([]);
const showDetails = ref(false);
const showKillConfirm = ref(false);
const selectedProcess = ref<ProcessInfo | null>(null);
const processToKill = ref<ProcessInfo | null>(null);
const killSignal = ref("TERM");
const killing = ref(false);

const sortOptions = [
  { label: "CPU", value: "cpu" },
  { label: "内存", value: "memory" },
  { label: "PID", value: "pid" },
  { label: "名称", value: "name" },
];

const signalOptions = [
  { label: "TERM (正常终止)", value: "TERM" },
  { label: "KILL (强制终止)", value: "KILL" },
  { label: "INT (中断)", value: "INT" },
  { label: "HUP (挂起)", value: "HUP" },
];

// 使用系统store
const systemStore = useSystemStore();

// 获取进程数据
const {
  data: processes,
  pending,
  refresh,
} = await useLazyAsyncData("processes", async () => {
  try {
    return await systemStore.refreshProcesses();
  } catch (error) {
    console.error("获取进程列表失败:", error);
    return [];
  }
});

// 计算属性
const filteredProcesses = computed(() => {
  if (!systemStore.processes) return [];

  let filtered = systemStore.processes;

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (process: ProcessInfo) =>
        process.name.toLowerCase().includes(query) ||
        process.command.toLowerCase().includes(query) ||
        process.user.toLowerCase().includes(query) ||
        process.pid.toString().includes(query)
    );
  }

  // 排序
  filtered = [...filtered].sort((a: ProcessInfo, b: ProcessInfo) => {
    const aVal = a[sortBy.value as keyof ProcessInfo];
    const bVal = b[sortBy.value as keyof ProcessInfo];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return bVal - aVal; // 数字降序
    }

    return String(aVal).localeCompare(String(bVal)); // 字符串升序
  });

  return filtered;
});

// 方法
const refreshProcesses = async () => {
  await systemStore.refreshProcesses();
  await refresh();
};

const showProcessDetails = (process: ProcessInfo) => {
  selectedProcess.value = process;
  showDetails.value = true;
};

const killProcess = (process: ProcessInfo) => {
  processToKill.value = process;
  showKillConfirm.value = true;
};

const killSelectedProcesses = () => {
  if (selectedProcesses.value.length === 0) return;

  // 对于多个进程，我们可以显示一个批量确认对话框
  // 这里简化处理，逐个终止
  selectedProcesses.value.forEach((process) => {
    killProcess(process);
  });
};

const confirmKillProcess = async () => {
  if (!processToKill.value) return;

  killing.value = true;

  try {
    await systemStore.killProcess(processToKill.value.pid, killSignal.value);

    // 刷新进程列表
    await refreshProcesses();

    // 关闭对话框
    showKillConfirm.value = false;
    showDetails.value = false;
    processToKill.value = null;

    // 清除选中的进程
    selectedProcesses.value = [];
  } catch (error: any) {
    console.error("终止进程失败:", error);
    // 这里可以显示错误提示
  } finally {
    killing.value = false;
  }
};

// 自动刷新
onMounted(() => {
  // 每10秒自动刷新一次进程列表
  const timer = setInterval(refreshProcesses, 10000);

  onUnmounted(() => {
    clearInterval(timer);
  });
});
</script>

<style scoped>
.processes-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.w-20 {
  width: 5rem;
}

.w-24 {
  width: 6rem;
}

.w-32 {
  width: 8rem;
}

.w-64 {
  width: 16rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.max-w-xs {
  max-width: 20rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flex-1 {
  flex: 1;
}

.h-2 {
  height: 0.5rem;
}

.break-all {
  word-break: break-all;
}
</style>
