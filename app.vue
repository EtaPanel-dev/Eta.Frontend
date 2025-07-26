<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
    <Toast
      position="top-right"
      :breakpoints="{ '960px': { width: '100%', right: '0', left: '0' } }"
    />
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
