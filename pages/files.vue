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
          :label="isAllSelected ? '取消全选' : '全选'"
          :icon="isAllSelected ? 'pi pi-times' : 'pi pi-check'"
          size="small"
          outlined
          @click="toggleSelectAll"
        />
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

    <!-- 批量操作工具栏 -->
    <div v-if="selectedFiles.length > 0" class="flex items-center justify-between mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
      <span class="text-sm text-blue-700">已选择 {{ selectedFiles.length }} 个项目</span>
      <div class="flex gap-2">
        <Button label="取消选择" size="small" text @click="clearSelection" />
        <Button label="批量删除" size="small" severity="danger" @click="batchDelete" />
      </div>
    </div>

    <!-- 文件列表 -->
    <Card>
      <template #content>
        <div class="relative">
          <!-- Loading overlay -->
          <div v-if="pending" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded">
            <div class="flex flex-col items-center">
              <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-2"></i>
              <span class="text-sm text-gray-600">加载中...</span>
            </div>
          </div>
          
          <DataTable
            ref="dt"
            :value="files"
            responsive-layout="scroll"
            selection-mode="multiple"
            v-model:selection="selectedFiles"
            :metaKeySelection="false"
          >
        <template #empty>
          <div class="text-center py-8 text-gray-500">
            <p>此目录下暂无文件</p>
          </div>
        </template>
      <Column selection-mode="multiple" header-style="width: 3rem" />
      <Column field="name" header="名称">
        <template #body="slotProps">
          <div
            class="flex items-center gap-2 cursor-pointer"
            @click.stop="handleFileClick(slotProps.data)"
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
        </div>
      </template>
    </Card>

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

    <!-- 文件编辑器对话框 -->
    <Dialog
      v-model:visible="showEditor"
      modal
      :header="`编辑文件: ${editingFile?.name || ''}`"
      :style="{ width: '90vw', height: '80vh' }"
      :maximizable="true"
    >
      <div class="editor-container">
        <VueMonacoEditor
          v-if="showEditor && fileContent !== null"
          v-model:value="fileContent"
          :language="getLanguageFromFileName(editingFile?.name || '')"
          theme="vs-dark"
          :options="{
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on'
          }"
          style="height: 60vh;"
          @mount="onEditorMount"
          @unmount="onEditorUnmount"
        />
        <div v-else class="flex items-center justify-center" style="height: 60vh;">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="closeEditor" />
        <Button label="保存" @click="saveFile" />
      </template>
    </Dialog>

    <!-- 确认删除对话框 -->
    <Dialog
      v-model:visible="showConfirmDialog"
      modal
      header="确认删除"
      :style="{ width: '400px' }"
    >
      <div class="flex items-center gap-3 mb-4">
        <i class="pi pi-exclamation-triangle text-orange-500 text-2xl" />
        <span>{{ confirmMessage }}</span>
      </div>
      <template #footer>
        <Button label="取消" text @click="handleCancel" />
        <Button label="确定" severity="danger" @click="handleConfirm" />
      </template>
    </Dialog>

    <!-- 图片预览对话框 -->
    <Dialog
      v-model:visible="showImagePreview"
      modal
      header="图片预览"
      :style="{ width: '80vw', height: '80vh' }"
      :maximizable="true"
    >
      <div class="flex items-center justify-center" style="height: 70vh;">
        <img
          v-if="previewImageUrl"
          :src="previewImageUrl"
          alt="预览图片"
          class="max-w-full max-h-full object-contain"
        />
      </div>
      <template #footer>
        <Button label="关闭" @click="closeImagePreview" />
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
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
import Checkbox from 'primevue/checkbox';
import { useToast } from 'primevue/usetoast';
import type { FileItem } from "~/types";

// 初始化toast
const toast = useToast();

// 确认对话框状态
const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmCallback = ref<(() => void) | null>(null);

const showConfirm = (message: string, callback: () => void) => {
  confirmMessage.value = message;
  confirmCallback.value = callback;
  showConfirmDialog.value = true;
};

const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value();
  }
  showConfirmDialog.value = false;
};

const handleCancel = () => {
  showConfirmDialog.value = false;
  confirmCallback.value = null;
};

// 页面 meta
useHead({
  title: "文件管理 - EtaPanel",
});

// API服务
const api = useApi();

// 响应式数据
const route = useRoute();
const router = useRouter();
const currentPath = ref(route.query.path as string || "/");
const selectedFiles = ref<FileItem[]>([]);
const showCreateFolder = ref(false);
const newFolderName = ref("");
const fileInput = ref<HTMLInputElement>();
const dt = ref();
const showEditor = ref(false);
const editingFile = ref<any>(null);
const fileContent = ref("");
const showImagePreview = ref(false);
const previewImageUrl = ref("");


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
  () => `files-${currentPath.value}`,
  async () => {
    try {
      const result = await api.getFiles(currentPath.value);
      console.log('Files API result:', result);
      return result;
    } catch (error) {
      console.error("获取文件列表失败:", error);
      const errorMsg = error?.message || error?.data?.message || '获取文件列表失败';
      toast.add({ severity: 'error', summary: '错误', detail: errorMsg, life: 3000 });
      return {
        currentPath: currentPath.value,
        files: [],
      };
    }
  },
  { 
    default: () => ({ currentPath: "/", files: [] }),
    server: false
  }
);

// 转换文件数据格式以兼容现有组件
const files = computed(() => {
  if (!filesData.value?.files) return [];

  return filesData.value.files.map((file) => ({
    name: file.name,
    type: file.isDir ? "directory" : "file",
    isDir: file.isDir,
    size: file.isDir ? "-" : formatFileSize(file.size),
    permissions: file.permissions,
    owner: `${file.owner}:${file.group}`,
    modified: formatDate(file.modTime),
    path: file.path,
  }));
});

// 监听路由变化
watch(() => route.query.path, (newPath) => {
  const pathValue = (newPath as string) || '/';
  if (pathValue !== currentPath.value) {
    currentPath.value = pathValue;
  }
});

// 监听 currentPath 变化并刷新数据
watch(currentPath, () => {
  selectedFiles.value = []; // 清除选择状态
  refresh();
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
const getFileIcon = (file: any) => {
  if (file.isDir || file.type === "directory") {
    return "pi pi-folder text-blue-500";
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "txt":
    case "md":
    case "readme":
      return "pi pi-file-edit text-gray-600";
    case "json":
      return "pi pi-code text-orange-500";
    case "js":
    case "mjs":
      return "pi pi-code text-yellow-500";
    case "ts":
      return "pi pi-code text-blue-600";
    case "vue":
      return "pi pi-code text-green-600";
    case "html":
    case "htm":
      return "pi pi-code text-orange-600";
    case "css":
    case "scss":
    case "sass":
      return "pi pi-palette text-pink-500";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return "pi pi-image text-purple-500";
    case "pdf":
      return "pi pi-file-pdf text-red-500";
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return "pi pi-file-zip text-yellow-600";
    case "mp4":
    case "avi":
    case "mov":
    case "mkv":
      return "pi pi-video text-indigo-500";
    case "mp3":
    case "wav":
    case "flac":
      return "pi pi-volume-up text-green-500";
    case "doc":
    case "docx":
      return "pi pi-file-word text-blue-700";
    case "xls":
    case "xlsx":
      return "pi pi-file-excel text-green-700";
    case "ppt":
    case "pptx":
      return "pi pi-file text-orange-700";
    case "py":
      return "pi pi-code text-blue-500";
    case "php":
      return "pi pi-code text-purple-600";
    case "java":
      return "pi pi-code text-red-600";
    case "cpp":
    case "c":
    case "h":
      return "pi pi-code text-blue-800";
    case "sh":
    case "bash":
      return "pi pi-terminal text-gray-700";
    case "sql":
      return "pi pi-database text-blue-600";
    case "xml":
      return "pi pi-code text-orange-500";
    case "yaml":
    case "yml":
      return "pi pi-code text-red-400";
    case "log":
      return "pi pi-list text-gray-500";
    case "env":
      return "pi pi-cog text-gray-600";
    default:
      return "pi pi-file text-gray-400";
  }
};

const handleFileClick = async (file: any) => {
  if (file.isDir || file.type === "directory") {
    selectedFiles.value = []; // 清除选中状态
    const newPath = currentPath.value === "/" ? `/${file.name}` : `${currentPath.value}/${file.name}`;
    await router.push({ path: route.path, query: { path: newPath } });
  } else {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const imageExts = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];
    
    if (imageExts.includes(ext)) {
      openImagePreview(file);
    } else {
      await openFileEditor(file);
    }
  }
};

const openFileEditor = async (file: any) => {
  try {
    const content = await api.getFileContent(file.path);
    editingFile.value = file;
    // 确保 fileContent 是字符串
    fileContent.value = typeof content === 'string' ? content : (content?.content || '');
    showEditor.value = true;
  } catch (error) {
    console.error("读取文件内容失败:", error);
    const errorMsg = error?.message || error?.data?.message || '读取文件内容失败';
    toast.add({ severity: 'error', summary: '错误', detail: errorMsg, life: 3000 });
  }
};

const saveFile = async () => {
  if (!editingFile.value) return;
  
  try {
    await api.saveFileContent(editingFile.value.path, fileContent.value);
    showEditor.value = false;
    toast.add({ severity: 'success', summary: '成功', detail: '文件保存成功', life: 3000 });
  } catch (error) {
    console.error("保存文件失败:", error);
    const errorMsg = error?.message || error?.data?.message || '保存文件失败';
    toast.add({ severity: 'error', summary: '错误', detail: errorMsg, life: 3000 });
  }
};

const closeEditor = () => {
  showEditor.value = false;
  editingFile.value = null;
  fileContent.value = "";
};

const openImagePreview = (file: any) => {
  const config = useRuntimeConfig();
  const token = useCookie("auth-token");
  previewImageUrl.value = `${config.public.apiBaseUrl}/api/auth/files/download?path=${encodeURIComponent(file.path)}&token=${token.value}`;
  showImagePreview.value = true;
};

const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImageUrl.value = "";
};

const onEditorMount = () => {
  console.log('Editor mounted successfully');
};

const onEditorUnmount = () => {
  console.log('Editor unmounted successfully');
};

const getLanguageFromFileName = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'vue': 'html',
    'py': 'python',
    'php': 'php',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'sh': 'shell',
    'sql': 'sql',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown'
  };
  return languageMap[ext || ''] || 'plaintext';
};



const navigateToPath = async (path: string) => {
  await router.push({ query: { ...route.query, path } });
};

const navigateToSegment = (index: number) => {
  const segments = pathSegments.value.slice(0, index + 1);
  const newPath = segments.length > 0 ? "/" + segments.join("/") : "/";
  navigateToPath(newPath);
};

const refreshFiles = () => {
  refresh();
};

const selectAll = () => {
  selectedFiles.value = [...files.value];
};

const clearSelection = () => {
  selectedFiles.value = [];
};

const isAllSelected = computed(() => {
  return files.value.length > 0 && selectedFiles.value.length === files.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedFiles.value = [];
  } else {
    selectedFiles.value = [...files.value];
  }
};







const batchDelete = async () => {
  if (selectedFiles.value.length === 0) return;
  
  const fileNames = selectedFiles.value.map(f => f.name).join(', ');
  showConfirm(`确定要删除这 ${selectedFiles.value.length} 个项目吗？\n${fileNames}`, async () => {
    try {
      for (const file of selectedFiles.value) {
        await api.deleteFile(file.path);
      }
      selectedFiles.value = [];
      await refresh();
    } catch (error) {
      console.error("批量删除失败:", error);
      const errorMsg = error?.message || error?.data?.message || '批量删除失败';
      toast.add({ severity: 'error', summary: '错误', detail: errorMsg, life: 3000 });
    }
  });
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
    const errorMsg = error?.message || error?.data?.message || '创建文件夹失败';
    toast.add({ severity: 'error', summary: '错误', detail: errorMsg, life: 3000 });
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files) return;

  let successCount = 0;
  let failCount = 0;

  for (const file of Array.from(files)) {
    try {
      await api.uploadFile(currentPath.value, file);
      successCount++;
    } catch (error) {
      console.error(`上传文件 ${file.name} 失败:`, error);
      const errorMsg = error?.message || error?.data?.message || `上传文件 ${file.name} 失败`;
      toast.add({ severity: 'error', summary: '错误', detail: errorMsg, life: 3000 });
      failCount++;
    }
  }

  if (successCount > 0) {
    toast.add({ severity: 'success', summary: '成功', detail: `成功上传 ${successCount} 个文件`, life: 3000 });
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
  showConfirm(`确定要删除 ${file.name} 吗？`, async () => {
    try {
      await api.deleteFile(file.path);
      await refresh();
    } catch (error) {
      console.error("删除文件失败:", error);
      const errorMsg = error?.message || error?.data?.message || '删除文件失败';
      toast.add({ severity: 'error', summary: '错误', detail: errorMsg, life: 3000 });
    }
  });
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

.editor-container {
  height: 60vh;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  overflow: hidden;
}

.editor-container {
  height: 60vh;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  overflow: hidden;
}

/* 骨架屏样式 */
.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  display: block;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 深色模式骨架屏 */
@media (prefers-color-scheme: dark) {
  .skeleton-line {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }
}


</style>
