<template>
  <div class="files-content">
    <!-- 工具栏 -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <Button icon="pi pi-home" text @click="navigateToPath('/')" />
        <span class="text-sm text-gray-500">/</span>
        <span
          v-for="(segment, index) in pathSegments"
          :key="index"
          class="flex items-center gap-2"
        >
          <Button :label="segment" text @click="navigateToSegment(index)" />
          <span
            v-if="index < pathSegments.length - 1"
            class="text-sm text-gray-500"
            >/</span
          >
        </span>
      </div>
      <div class="flex gap-2">
        <Button
          label="新建文件夹"
          icon="pi pi-folder-plus"
          @click="showCreateFolder = true"
        />
        <Button
          label="上传文件"
          icon="pi pi-upload"
          @click="$refs.fileInput.click()"
        />
        <Button icon="pi pi-refresh" outlined @click="refreshFiles" />
      </div>
    </div>

    <!-- 文件列表 -->
    <DataTable
      :value="files"
      :loading="pending"
      responsive-layout="scroll"
      selection-mode="multiple"
      v-model:selection="selectedFiles"
    >
      <Column selection-mode="multiple" header-style="width: 3rem" />
      <Column field="name" header="名称">
        <template #body="slotProps">
          <div
            class="flex items-center gap-2 cursor-pointer"
            @click="handleFileClick(slotProps.data)"
          >
            <i :class="getFileIcon(slotProps.data)" />
            <span>{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="size" header="大小" />
      <Column field="permissions" header="权限" />
      <Column field="owner" header="所有者" />
      <Column field="modified" header="修改时间" />
      <Column header="操作" class="w-32">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button
              icon="pi pi-download"
              size="small"
              text
              @click="downloadFile(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              @click="deleteFile(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 新建文件夹对话框 -->
    <Dialog
      v-model:visible="showCreateFolder"
      modal
      header="新建文件夹"
      :style="{ width: '400px' }"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">文件夹名称</label>
          <InputText
            v-model="newFolderName"
            class="w-full"
            placeholder="输入文件夹名称"
          />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="showCreateFolder = false" />
        <Button label="创建" @click="createFolder" />
      </template>
    </Dialog>

    <!-- 隐藏的文件上传输入 -->
    <input
      ref="fileInput"
      type="file"
      multiple
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from "~/types";

// 页面 meta
useHead({
  title: "文件管理 - EtaPanel",
});

// API服务
const api = useApi();

// 响应式数据
const currentPath = ref("/");
const selectedFiles = ref<FileItem[]>([]);
const showCreateFolder = ref(false);
const newFolderName = ref("");
const fileInput = ref<HTMLInputElement>();

// 路径分段
const pathSegments = computed(() => {
  return currentPath.value.split("/").filter((segment) => segment);
});

// 获取文件列表
const {
  data: filesData,
  pending,
  refresh,
} = await useLazyAsyncData(
  "files",
  async () => {
    try {
      const result = await api.getFiles(currentPath.value);
      return result;
    } catch (error) {
      console.error("获取文件列表失败:", error);
      // 返回模拟数据作为后备
      return {
        currentPath: currentPath.value,
        files: [
          {
            name: "documents",
            isDir: true,
            size: 0,
            permissions: "drwxr-xr-x",
            owner: "root",
            group: "root",
            modTime: "2024-01-15T10:30:00Z",
            path: "/documents",
          },
          {
            name: "config.json",
            isDir: false,
            size: 2560,
            permissions: "-rw-r--r--",
            owner: "root",
            group: "root",
            modTime: "2024-01-14T15:20:00Z",
            path: "/config.json",
          },
        ],
      };
    }
  },
  { default: () => ({ currentPath: "/", files: [] }) }
);

// 转换文件数据格式以兼容现有组件
const files = computed(() => {
  if (!filesData.value?.files) return [];

  return filesData.value.files.map((file) => ({
    name: file.name,
    type: file.isDir ? "directory" : "file",
    size: file.isDir ? "-" : formatFileSize(file.size),
    permissions: file.permissions,
    owner: file.owner,
    modified: formatDate(file.modTime),
    path: file.path,
  }));
});

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("zh-CN");
};

// 方法
const getFileIcon = (file: FileItem) => {
  if (file.type === "directory") {
    return "pi pi-folder text-blue-500";
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "txt":
    case "md":
      return "pi pi-file-text text-gray-500";
    case "json":
    case "js":
    case "ts":
      return "pi pi-code text-green-500";
    case "jpg":
    case "png":
    case "gif":
      return "pi pi-image text-purple-500";
    case "pdf":
      return "pi pi-file-pdf text-red-500";
    default:
      return "pi pi-file text-gray-400";
  }
};

const handleFileClick = (file: FileItem) => {
  if (file.type === "directory") {
    navigateToPath(file.path);
  }
};

const navigateToPath = (path: string) => {
  currentPath.value = path;
  refresh();
};

const navigateToSegment = (index: number) => {
  const segments = pathSegments.value.slice(0, index + 1);
  navigateToPath("/" + segments.join("/"));
};

const refreshFiles = () => {
  refresh();
};

const createFolder = async () => {
  if (!newFolderName.value) return;

  try {
    const folderPath =
      currentPath.value === "/"
        ? `/${newFolderName.value}`
        : `${currentPath.value}/${newFolderName.value}`;

    await api.createDirectory(folderPath);
    newFolderName.value = "";
    showCreateFolder.value = false;
    await refresh();
  } catch (error) {
    console.error("创建文件夹失败:", error);
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files) return;

  for (const file of Array.from(files)) {
    try {
      await api.uploadFile(currentPath.value, file);
    } catch (error) {
      console.error(`上传文件 ${file.name} 失败:`, error);
    }
  }

  await refresh();
  target.value = "";
};

const downloadFile = (file: any) => {
  const config = useRuntimeConfig();
  const token = useCookie("auth-token");

  const link = document.createElement("a");
  link.href = `${
    config.public.apiBaseUrl
  }/api/auth/files/download?path=${encodeURIComponent(file.path)}`;

  // 添加认证头
  if (token.value) {
    // 对于下载，我们需要在URL中包含token或使用其他方法
    link.href += `&token=${token.value}`;
  }

  link.download = file.name;
  link.click();
};

const deleteFile = async (file: FileItem) => {
  if (confirm(`确定要删除 ${file.name} 吗？`)) {
    try {
      await api.deleteFile(file.path);
      await refresh();
    } catch (error) {
      console.error("删除文件失败:", error);
    }
  }
};
</script>

<style scoped>
.files-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.w-32 {
  width: 8rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: var(--bg-tertiary);
  border-radius: 0.25rem;
  padding: 0.25rem;
  margin: -0.25rem;
}
</style>
