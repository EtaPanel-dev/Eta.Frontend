<template>
  <div class="terminal-content">
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span>终端</span>
          <div class="flex gap-2">
            <Button label="新建会话" icon="pi pi-plus" size="small" />
            <Button label="清屏" icon="pi pi-trash" size="small" outlined />
          </div>
        </div>
      </template>
      <template #content>
        <div class="terminal-window">
          <div class="terminal-header">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-red-500 rounded-full" />
              <div class="w-3 h-3 bg-yellow-500 rounded-full" />
              <div class="w-3 h-3 bg-green-500 rounded-full" />
              <span class="ml-4 text-sm text-gray-600">root@server:~</span>
            </div>
          </div>
          <div class="terminal-body">
            <div class="terminal-output">
              <div class="terminal-line">
                <span class="text-green-400">root@server:~$</span>
                <span class="ml-2">ls -la</span>
              </div>
              <div class="terminal-line text-gray-300">
                total 24<br>
                drwxr-xr-x  6 root root 4096 Jan 20 10:30 .<br>
                drwxr-xr-x  3 root root 4096 Jan 15 14:20 ..<br>
                -rw-r--r--  1 root root  220 Jan 15 14:20 .bash_logout<br>
                -rw-r--r--  1 root root 3771 Jan 15 14:20 .bashrc<br>
                drwxr-xr-x  3 root root 4096 Jan 20 10:30 docker<br>
                -rw-r--r--  1 root root  807 Jan 15 14:20 .profile
              </div>
              <div class="terminal-line">
                <span class="text-green-400">root@server:~$</span>
                <span class="ml-2 animate-pulse">|</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
// 页面 meta
useHead({
  title: '终端 - EtaPanel'
})
</script>

<style scoped>
.terminal-window {
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Courier New', monospace;
}

.terminal-header {
  background: #2d2d2d;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #404040;
}

.terminal-body {
  padding: 1rem;
  min-height: 400px;
  background: #1a1a1a;
}

.terminal-output {
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
}

.terminal-line {
  margin-bottom: 0.5rem;
}

.w-3 {
  width: 0.75rem;
}

.h-3 {
  height: 0.75rem;
}

.bg-red-500 {
  background-color: #ef4444;
}

.bg-yellow-500 {
  background-color: #eab308;
}

.bg-green-500 {
  background-color: #22c55e;
}

.text-green-400 {
  color: #4ade80;
}

.text-gray-300 {
  color: #d1d5db;
}

.text-gray-600 {
  color: #4b5563;
}

.rounded-full {
  border-radius: 9999px;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 卡片标题修复 */
:deep(.p-card-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
}

:deep(.p-card-title) {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

:deep(.p-card-content) {
  padding: 1.25rem;
}
</style>