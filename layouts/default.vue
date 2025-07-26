<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <AppSidebar 
      :active-menu="activeMenu" 
      :is-open="sidebarOpen"
      :is-mobile="isMobile"
      @menu-change="handleMenuChange" 
      @close="closeSidebar"
    />

    <!-- 主要内容区域 -->
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': !sidebarOpen && !isMobile, 'mobile': isMobile }">
      <!-- 顶部导航栏 -->
      <AppHeader 
        :page-title="pageTitle" 
        :system-info="systemInfo" 
        :class="{ 'sidebar-collapsed': !sidebarOpen && !isMobile }"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- 页面内容 -->
      <main class="app-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// 使用系统信息 composable
const { systemInfo } = useSystemInfo()

// 响应式状态管理
const isMobile = ref(false)
const sidebarOpen = ref(true)

// 检测屏幕尺寸
const checkScreenSize = () => {
  if (process.client) {
    isMobile.value = window.innerWidth <= 768
    // 移动端默认关闭侧边栏
    if (isMobile.value) {
      sidebarOpen.value = false
    } else {
      sidebarOpen.value = true
    }
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 关闭侧边栏
const closeSidebar = () => {
  sidebarOpen.value = false
}

// 根据当前路由确定活动菜单
const activeMenu = computed(() => {
  const path = route.path
  if (path === '/' || path === '/dashboard') return 'dashboard'
  if (path.startsWith('/containers')) return 'containers'
  if (path.startsWith('/images')) return 'images'
  if (path.startsWith('/networks')) return 'networks'
  if (path.startsWith('/volumes')) return 'volumes'
  if (path.startsWith('/websites')) return 'websites'
  if (path.startsWith('/ssl')) return 'ssl'
  if (path.startsWith('/sql')) return 'sql'
  if (path.startsWith('/nosql')) return 'nosql'
  if (path.startsWith('/files')) return 'files'
  if (path.startsWith('/terminal')) return 'terminal'
  if (path.startsWith('/cron')) return 'cron'
  if (path.startsWith('/firewall')) return 'firewall'
  if (path.startsWith('/settings')) return 'settings'
  if (path.startsWith('/logs')) return 'logs'
  return 'dashboard'
})

// 页面标题映射
const pageTitleMap: Record<string, string> = {
  '/': '仪表板',
  '/containers': '容器管理',
  '/images': '镜像管理',
  '/networks': '网络管理',
  '/volumes': '存储卷管理',
  '/websites': '网站管理',
  '/ssl': 'SSL证书管理',
  '/sql': 'SQL数据库管理',
  '/nosql': 'NoSQL数据库管理',
  '/files': '文件管理',
  '/terminal': '终端',
  '/cron': '计划任务',
  '/firewall': '防火墙',
  '/settings': '系统设置',
  '/logs': '系统日志'
}

// 获取当前页面标题
const pageTitle = computed(() => {
  return pageTitleMap[route.path] || '仪表板'
})

// 处理菜单切换
const handleMenuChange = (menuKey: string) => {
  const routeMap: Record<string, string> = {
    dashboard: '/',
    containers: '/containers',
    images: '/images',
    networks: '/networks',
    volumes: '/volumes',
    websites: '/websites',
    ssl: '/ssl',
    sql: '/sql',
    nosql: '/nosql',
    files: '/files',
    terminal: '/terminal',
    cron: '/cron',
    firewall: '/firewall',
    settings: '/settings',
    logs: '/logs',
  }

  const targetRoute = routeMap[menuKey]
  if (targetRoute && targetRoute !== route.path) {
    router.push(targetRoute)
  }
}

// 页面初始化
onMounted(() => {
  // 设置color-scheme以跟随系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.style.colorScheme = prefersDark ? 'dark' : 'light'

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleThemeChange = (e: MediaQueryListEvent) => {
    document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light'
  }

  mediaQuery.addEventListener('change', handleThemeChange)
  
  // 初始化屏幕尺寸检测
  checkScreenSize()
  
  // 监听窗口尺寸变化
  const handleResize = () => {
    checkScreenSize()
  }
  
  window.addEventListener('resize', handleResize)

  // 清理监听器
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleThemeChange)
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
  transition: background-color 0.3s ease;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px;
  min-width: 0;
  transition: margin-left 0.3s ease;
}

.main-wrapper.sidebar-collapsed {
  margin-left: 70px;
}

.main-wrapper.mobile {
  margin-left: 0;
}

/* AppHeader 组件现在处理自己的样式 */

.app-main {
  flex: 1;
  background: var(--bg-secondary);
  overflow-y: auto;
  margin-top: 60px;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-main {
    padding: 1rem;
  }
}

/* 确保所有子页面都有正确的背景和间距 */
:deep(.containers-content),
:deep(.images-content),
:deep(.volumes-content),
:deep(.networks-content),
:deep(.ssl-content),
:deep(.cron-content),
:deep(.redis-content),
:deep(.mysql-content),
:deep(.firewall-content),
:deep(.files-content),
:deep(.dashboard-content),
:deep(.logs-content),
:deep(.settings-content),
:deep(.websites-content),
:deep(.terminal-content),
:deep(.sql-content),
:deep(.nosql-content) {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 1.5rem;
  min-height: calc(100vh - 60px);
  transition: all 0.3s ease;
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  :deep(.containers-content),
  :deep(.images-content),
  :deep(.volumes-content),
  :deep(.networks-content),
  :deep(.ssl-content),
  :deep(.cron-content),
  :deep(.redis-content),
  :deep(.mysql-content),
  :deep(.firewall-content),
  :deep(.files-content),
  :deep(.dashboard-content),
  :deep(.logs-content),
  :deep(.settings-content),
  :deep(.websites-content),
  :deep(.terminal-content),
  :deep(.sql-content),
  :deep(.nosql-content) {
    padding: 1rem;
    min-height: calc(100vh - 60px);
  }
}
</style>