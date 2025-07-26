<template>
  <div class="cron-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <Button label="创建任务" icon="pi pi-plus" @click="showCreateCron = true" />
      </div>
      <div class="flex gap-2">
        <InputText v-model="searchQuery" placeholder="搜索任务..." class="w-64" />
        <Button icon="pi pi-refresh" outlined @click="refreshCrons" />
      </div>
    </div>

    <DataTable :value="filteredCrons" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
      responsive-layout="scroll" :loading="pending"
      paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      current-page-report-template="{first} - {last} / {totalRecords}">
      <Column field="comment" header="任务名称">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <Tag :severity="slotProps.data.enabled ? 'success' : 'danger'" 
                 :value="slotProps.data.enabled ? '启用' : '禁用'" />
            <span class="font-medium">{{ slotProps.data.comment || '未命名任务' }}</span>
          </div>
        </template>
      </Column>
      <Column field="fullLine" header="Cron表达式" />
      <Column field="command" header="执行命令" />
      <Column field="nextRun" header="下次执行" />
      <Column header="操作" class="w-48">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" size="small" text @click="editCron(slotProps.data)" />
            <Button :icon="slotProps.data.enabled ? 'pi pi-pause' : 'pi pi-play'" 
                    size="small" text @click="toggleCron(slotProps.data.id)" />
            <Button icon="pi pi-trash" size="small" text severity="danger" 
                    @click="deleteCron(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 创建/编辑任务对话框 -->
    <Dialog v-model:visible="showCreateCron" modal :header="editingId ? '编辑任务' : '创建任务'" 
            :style="{ width: '600px' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">任务名称</label>
          <InputText v-model="cronForm.comment" class="w-full" placeholder="任务描述" />
        </div>
        <div class="grid grid-cols-5 gap-2">
          <div>
            <label class="block text-sm font-medium mb-2">分钟</label>
            <InputText v-model="cronForm.minute" class="w-full" placeholder="*" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">小时</label>
            <InputText v-model="cronForm.hour" class="w-full" placeholder="*" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">日</label>
            <InputText v-model="cronForm.day" class="w-full" placeholder="*" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">月</label>
            <InputText v-model="cronForm.month" class="w-full" placeholder="*" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">周</label>
            <InputText v-model="cronForm.weekday" class="w-full" placeholder="*" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">执行命令</label>
          <Textarea v-model="cronForm.command" class="w-full" rows="3" placeholder="/usr/bin/command" />
        </div>
        <div class="flex items-center">
          <Checkbox v-model="cronForm.enabled" binary />
          <label class="ml-2">启用任务</label>
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateCron = false" />
        <Button :label="editingId ? '更新' : '创建'" :loading="creating" @click="saveCron" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: "定时任务 - EtaPanel",
});

// 响应式数据
const showCreateCron = ref(false);
const creating = ref(false);
const searchQuery = ref("");
const editingId = ref<number | null>(null);

const cronForm = ref({
  comment: "",
  minute: "*",
  hour: "*",
  day: "*",
  month: "*",
  weekday: "*",
  command: "",
  enabled: true
});

// API服务
const api = useApi()

// 获取定时任务数据
const {
  data: crons,
  pending,
  refresh,
} = await useLazyAsyncData("crontabs", async () => {
  try {
    return await api.getCrontabs()
  } catch (error) {
    console.error('获取定时任务列表失败:', error)
    return []
  }
});

// 过滤任务
const filteredCrons = computed(() => {
  if (!crons.value) return [];
  if (!searchQuery.value) return crons.value;

  return crons.value.filter((cron: any) =>
    (cron.comment || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    cron.command.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 方法
const refreshCrons = () => {
  refresh();
};

const editCron = (cron: any) => {
  editingId.value = cron.id
  cronForm.value = {
    comment: cron.comment || "",
    minute: cron.minute,
    hour: cron.hour,
    day: cron.day,
    month: cron.month,
    weekday: cron.weekday,
    command: cron.command,
    enabled: cron.enabled
  }
  showCreateCron.value = true
}

const toggleCron = async (id: number) => {
  try {
    await api.toggleCrontab(id)
    await refresh()
  } catch (error) {
    console.error('切换任务状态失败:', error)
  }
}

const deleteCron = async (id: number) => {
  if (confirm('确定要删除这个定时任务吗？')) {
    try {
      await api.deleteCrontab(id)
      await refresh()
    } catch (error) {
      console.error('删除任务失败:', error)
    }
  }
}

const saveCron = async () => {
  if (!cronForm.value.command) return

  creating.value = true

  try {
    if (editingId.value) {
      await api.updateCrontab(editingId.value, cronForm.value)
    } else {
      await api.createCrontab(cronForm.value)
    }

    // 重置表单
    cronForm.value = {
      comment: "",
      minute: "*",
      hour: "*",
      day: "*",
      month: "*",
      weekday: "*",
      command: "",
      enabled: true
    }
    editingId.value = null
    showCreateCron.value = false
    await refresh()
  } catch (error) {
    console.error("保存任务失败:", error)
  } finally {
    creating.value = false
  }
}
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

.grid {
  display: grid;
}

.grid-cols-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.gap-2 {
  gap: 0.5rem;
}

.cron-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}
</style>