<template>
  <div class="cron-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button
          label="添加任务"
          icon="pi pi-plus"
          @click="showCreateCron = true"
        />
        <Button label="导入任务" icon="pi pi-upload" outlined />
      </div>
      <div class="flex gap-2">
        <InputText
          v-model="searchQuery"
          placeholder="搜索任务..."
          class="w-64"
        />
        <Button icon="pi pi-refresh" outlined @click="refreshCron" />
      </div>
    </div>

    <DataTable
      :value="filteredCronJobs"
      :paginator="true"
      :rows="8"
      :rowsPerPageOptions="[5, 8, 15, 25]"
      responsive-layout="scroll"
      :loading="pending"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="显示第 {first} 到 {last} 条，共 {totalRecords} 条记录"
    >
      <Column field="name" header="任务名称">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <i class="pi pi-clock text-blue-500" />
            <span class="font-medium">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="description" header="描述">
        <template #body="slotProps">
          <span class="text-gray-600">{{ slotProps.data.description }}</span>
        </template>
      </Column>
      <Column field="schedule" header="执行时间" />
      <Column field="status" header="状态">
        <template #body="slotProps">
          <Tag
            :severity="slotProps.data.status === '启用' ? 'success' : 'danger'"
            :value="slotProps.data.status"
          />
        </template>
      </Column>
      <Column field="lastRun" header="上次执行" />
      <Column field="nextRun" header="下次执行" />
      <Column header="操作" class="w-40">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button
              icon="pi pi-play"
              size="small"
              text
              @click="runCron(slotProps.data.id)"
              v-tooltip.top="'立即执行'"
            />
            <Button
              icon="pi pi-info-circle"
              size="small"
              text
              @click="viewDetails(slotProps.data)"
              v-tooltip.top="'详细信息'"
            />
            <Button
              icon="pi pi-pencil"
              size="small"
              text
              @click="editCron(slotProps.data.id)"
              v-tooltip.top="'编辑任务'"
            />
            <Button
              icon="pi pi-eye"
              size="small"
              text
              @click="viewLogs(slotProps.data.id)"
              v-tooltip.top="'查看日志'"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              @click="deleteCron(slotProps.data.id)"
              v-tooltip.top="'删除任务'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 任务详细信息对话框 -->
    <Dialog
      v-model:visible="showDetails"
      modal
      header="任务详细信息"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedCron" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >任务名称</label
            >
            <div class="p-2 bg-gray-50 rounded border">
              {{ selectedCron.name }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >执行时间</label
            >
            <div class="p-2 bg-gray-50 rounded border">
              {{ selectedCron.schedule }}
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >描述</label
          >
          <div class="p-2 bg-gray-50 rounded border">
            {{ selectedCron.description || "无描述" }}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >预设命令</label
          >
          <div
            class="p-3 bg-gray-900 text-green-400 rounded border font-mono text-sm"
          >
            {{ selectedCron.command }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >状态</label
            >
            <div class="p-2 bg-gray-50 rounded border">
              <Tag
                :severity="
                  selectedCron.status === '启用' ? 'success' : 'danger'
                "
                :value="selectedCron.status"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >创建时间</label
            >
            <div class="p-2 bg-gray-50 rounded border">
              {{ selectedCron.createdAt || "2024-01-15 10:30" }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >上次执行</label
            >
            <div class="p-2 bg-gray-50 rounded border">
              {{ selectedCron.lastRun }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >下次执行</label
            >
            <div class="p-2 bg-gray-50 rounded border">
              {{ selectedCron.nextRun }}
            </div>
          </div>
        </div>

        <div v-if="selectedCron.lastOutput">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >最近执行输出</label
          >
          <div
            class="p-3 bg-gray-100 rounded border text-sm max-h-32 overflow-y-auto"
          >
            <pre>{{ selectedCron.lastOutput }}</pre>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="关闭" @click="showDetails = false" />
        <Button label="编辑任务" icon="pi pi-pencil" @click="editFromDetails" />
      </template>
    </Dialog>

    <!-- 创建计划任务对话框 -->
    <Dialog
      v-model:visible="showCreateCron"
      modal
      header="添加计划任务"
      :style="{ width: '700px' }"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">任务名称</label>
          <InputText
            v-model="newCron.name"
            class="w-full"
            placeholder="输入任务名称"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">执行命令</label>
          <Textarea
            v-model="newCron.command"
            class="w-full"
            rows="3"
            placeholder="输入要执行的命令"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">执行时间</label>
          <div class="grid grid-cols-5 gap-2">
            <div>
              <label class="block text-xs text-gray-600 mb-1"
                >分钟 (0-59)</label
              >
              <InputText v-model="newCron.minute" placeholder="*" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1"
                >小时 (0-23)</label
              >
              <InputText v-model="newCron.hour" placeholder="*" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">日 (1-31)</label>
              <InputText v-model="newCron.day" placeholder="*" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">月 (1-12)</label>
              <InputText v-model="newCron.month" placeholder="*" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">周 (0-7)</label>
              <InputText v-model="newCron.weekday" placeholder="*" />
            </div>
          </div>
          <div class="mt-2">
            <small class="text-gray-600">
              Cron表达式: {{ cronExpression }}
            </small>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">快速设置</label>
          <div class="flex gap-2 flex-wrap">
            <Button
              label="每分钟"
              size="small"
              outlined
              @click="setQuickCron('* * * * *')"
            />
            <Button
              label="每小时"
              size="small"
              outlined
              @click="setQuickCron('0 * * * *')"
            />
            <Button
              label="每天"
              size="small"
              outlined
              @click="setQuickCron('0 0 * * *')"
            />
            <Button
              label="每周"
              size="small"
              outlined
              @click="setQuickCron('0 0 * * 0')"
            />
            <Button
              label="每月"
              size="small"
              outlined
              @click="setQuickCron('0 0 1 * *')"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="newCron.enabled" binary />
          <label class="text-sm">启用任务</label>
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateCron = false" />
        <Button label="创建" :loading="creating" @click="createCron" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: "计划任务 - EtaPanel",
});

// 响应式数据
const showCreateCron = ref(false);
const showDetails = ref(false);
const creating = ref(false);
const searchQuery = ref("");
const selectedCron = ref(null);

const newCron = ref({
  name: "",
  command: "",
  minute: "*",
  hour: "*",
  day: "*",
  month: "*",
  weekday: "*",
  enabled: true,
});

// 计算Cron表达式
const cronExpression = computed(() => {
  return `${newCron.value.minute} ${newCron.value.hour} ${newCron.value.day} ${newCron.value.month} ${newCron.value.weekday}`;
});

// 获取计划任务数据
const {
  data: cronJobs,
  pending,
  refresh,
} = await useLazyAsyncData("cron", () => {
  return Promise.resolve([
    {
      id: "1",
      name: "数据库备份",
      description: "每日自动备份MySQL数据库",
      command: "/usr/local/bin/backup-db.sh",
      schedule: "每天 02:00",
      status: "启用",
      lastRun: "2024-01-20 02:00",
      nextRun: "2024-01-21 02:00",
      createdAt: "2024-01-10 14:30",
      lastOutput:
        "Database backup completed successfully\nBackup file: /backup/db_20240120_020000.sql\nSize: 2.3GB",
    },
    {
      id: "2",
      name: "清理日志文件",
      description: "清理7天前的系统日志文件",
      command: 'find /var/log -name "*.log" -mtime +7 -delete',
      schedule: "每周日 03:00",
      status: "启用",
      lastRun: "2024-01-14 03:00",
      nextRun: "2024-01-21 03:00",
      createdAt: "2024-01-08 09:15",
      lastOutput: "Cleaned 15 log files\nFreed space: 1.2GB",
    },
    {
      id: "3",
      name: "系统更新检查",
      description: "检查系统可用更新",
      command: "apt update && apt list --upgradable",
      schedule: "每天 06:00",
      status: "禁用",
      lastRun: "2024-01-15 06:00",
      nextRun: "-",
      createdAt: "2024-01-05 16:45",
      lastOutput: "5 packages can be upgraded",
    },
    {
      id: "4",
      name: "网站健康检查",
      description: "检查网站服务是否正常运行",
      command: 'curl -f http://localhost/health || echo "Site down"',
      schedule: "每5分钟",
      status: "启用",
      lastRun: "2024-01-20 16:25",
      nextRun: "2024-01-20 16:30",
      createdAt: "2024-01-12 11:20",
      lastOutput: "HTTP/1.1 200 OK\nHealth check passed",
    },
  ]);
});

// 过滤计划任务
const filteredCronJobs = computed(() => {
  if (!cronJobs.value) return [];
  if (!searchQuery.value) return cronJobs.value;

  return cronJobs.value.filter(
    (job) =>
      job.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      job.command.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 方法
const refreshCron = () => {
  refresh();
};

const runCron = (id: string) => {
  console.log("立即执行任务:", id);
};

const editCron = (id: string) => {
  console.log("编辑任务:", id);
};

const viewLogs = (id: string) => {
  console.log("查看日志:", id);
};

const viewDetails = (cron: any) => {
  selectedCron.value = cron;
  showDetails.value = true;
};

const editFromDetails = () => {
  showDetails.value = false;
  editCron(selectedCron.value.id);
};

const deleteCron = async (id: string) => {
  console.log("删除任务:", id);
};

const setQuickCron = (expression: string) => {
  const parts = expression.split(" ");
  newCron.value.minute = parts[0];
  newCron.value.hour = parts[1];
  newCron.value.day = parts[2];
  newCron.value.month = parts[3];
  newCron.value.weekday = parts[4];
};

const createCron = async () => {
  if (!newCron.value.name || !newCron.value.command) return;

  creating.value = true;

  try {
    console.log("创建计划任务:", newCron.value);

    newCron.value = {
      name: "",
      command: "",
      minute: "*",
      hour: "*",
      day: "*",
      month: "*",
      weekday: "*",
      enabled: true,
    };

    showCreateCron.value = false;
    await refresh();
  } catch (error) {
    console.error("创建计划任务失败:", error);
  } finally {
    creating.value = false;
  }
};
</script>

<style scoped>
.w-32 {
  width: 8rem;
}

.w-40 {
  width: 10rem;
}

.w-64 {
  width: 16rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.grid {
  display: grid;
  gap: 0.5rem;
}

.grid-cols-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.max-h-32 {
  max-height: 8rem;
}

.overflow-y-auto {
  overflow-y: auto;
}

.flex-wrap {
  flex-wrap: wrap;
}

code {
  font-family: "Courier New", monospace;
}
</style>
