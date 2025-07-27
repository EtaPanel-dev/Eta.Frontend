<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
    <Toast position="top-right" :breakpoints="{ '960px': { width: '100%', right: '0', left: '0' } }"
      :base-z-index="99999" />
    <!-- 腾讯客服聊天组件 -->
    <TencentCustomerService />
  </NuxtLayout>
</template>

<script setup>
// 确保Toast样式正确加载
useHead({
  htmlAttrs: {
    "data-theme": "system",
  },
});
</script>

<style>
.p-toast {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  z-index: 99999 !important;
  width: 25rem !important;
  max-width: calc(100vw - 40px) !important;
}

.p-toast-message {
  margin: 0 0 1rem 0 !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  display: flex !important;
  min-height: 60px !important;
  overflow: hidden !important;
}

.p-toast-message-content {
  padding: 1rem !important;
  display: flex !important;
  align-items: flex-start !important;
  gap: 0.75rem !important;
  width: 100% !important;
}

.p-toast-message-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
}

.p-toast-message-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
}

.p-toast-message-warn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: white !important;
}

.p-toast-message-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
}
</style>
