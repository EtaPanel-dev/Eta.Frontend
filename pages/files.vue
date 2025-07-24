<template>
  <div class="files-content">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <Breadcrumb :model="breadcrumbItems" />
      </div>
      <div class="flex gap-2">
        <Button
          label="上传文件"
          icon="pi pi-upload"
          @click="showUpload = true"
        />
        <Button label="新建文件夹" icon="pi pi-folder-plus" outlined />
        <Button label="新建文件" icon="pi pi-file-plus" outlined />
        <Button icon="pi pi-refresh" outlined @click="refreshFiles" />
      </div>
    </div>

    <Card>
      <template #content>
        <DataTable :value="files" :loading="pending" responsive-layout="scroll">
          <Column field="name" header="名称">
            <template #body="slotProps">
              <div
                class="flex items-center gap-2 cursor-pointer hover:text-blue-600"
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
                <Button icon="pi pi-download" size="small" text />
                <Button icon="pi pi-pencil" size="small" text />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  text
                  severity="danger"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="showUpload"
      modal
      header="上传文件"
      :style="{ width: '600px' }"
    >
      <div class="text-center p-8">
        <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-4" />
        <p class="text-gray-600">文件上传功能</p>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "文件管理 - EtaPanel",
});

const showUpload = ref(false);
const currentPath = ref("/var/www/html");

const breadcrumbItems = computed(() => [
  { label: "根目录" },
  { label: "var" },
  { label: "www" },
  { label: "html" },
]);

const {
  data: files,
  pending,
  refresh,
} = await useLazyAsyncData("files", () => {
  return Promise.resolve([
    {
      name: "index.html",
      type: "file",
      size: "2.3 KB",
      permissions: "-rw-r--r--",
      owner: "www-data",
      modified: "2024-01-20 15:45",
    },
    {
      name: "assets",
      type: "directory",
      size: "-",
      permissions: "drwxr-xr-x",
      owner: "www-data",
      modified: "2024-01-19 14:20",
    },
  ]);
});

const getFileIcon = (file: any) => {
  return file.type === "directory"
    ? "pi pi-folder text-blue-500"
    : "pi pi-file text-gray-500";
};

const refreshFiles = () => {
  refresh();
};
</script>

<style scoped>
.w-32 {
  width: 8rem;
}
</style>
