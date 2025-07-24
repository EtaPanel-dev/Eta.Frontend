<template>
  <div class="layout-wrapper">
    <!-- 侧边栏 -->
    <AppSidebar :active-menu="activeMenu" @menu-change="handleMenuChange" />

    <!-- 主内容区 -->
    <div class="layout-main">
      <!-- 顶部栏 -->
      <AppHeader :system-info="systemInfo" :page-title="pageTitle" />

      <!-- 页面内容 -->
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用自定义 composables
const { activeMenu, setActiveMenu, getPageTitle } = useActiveMenu();
const { systemInfo } = useSystemInfo();

// 计算页面标题
const pageTitle = computed(() => getPageTitle());

// 处理菜单切换
const handleMenuChange = async (menu: string) => {
  setActiveMenu(menu);

  // 使用 Nuxt3 的路由导航
  try {
    if (menu !== "dashboard") {
      await navigateTo(`/${menu}`);
    } else {
      await navigateTo("/");
    }
  } catch (error) {
    console.error("Navigation error:", error);
  }
};

// 设置页面标题
useHead({
  title: computed(() => `${pageTitle.value} - EtaPanel`),
});

// 监听路由变化，确保侧边栏状态同步
watch(
  () => activeMenu.value,
  (newMenu) => {
    // 侧边栏状态已更新
  },
  { immediate: true }
);
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  height: calc(100vh - 60px); /* 减去 header 高度 */
}
</style>
