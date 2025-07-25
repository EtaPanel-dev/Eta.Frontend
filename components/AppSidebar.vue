<template>
  <div class="layout-sidebar">
    <div class="sidebar-header">
      <div class="flex items-center gap-2 p-3">
        <i class="pi pi-server text-2xl text-primary" />
        <span class="font-bold text-lg">EtaPanel</span>
      </div>
    </div>

    <div class="sidebar-content">
      <div
        v-for="section in menuSections"
        :key="section.title"
        class="nav-section"
      >
        <div class="nav-title">{{ section.title }}</div>
        <div
          v-for="item in section.items"
          :key="item.key"
          class="nav-item"
          :class="{ active: props.activeMenu === item.key }"
          @click="handleMenuClick(item.key)"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuSection } from "~/types";

const props = defineProps<{
  activeMenu: string;
}>();

const emit = defineEmits<{
  "menu-change": [menu: string];
}>();

// 处理菜单项点击
const handleMenuClick = (menuKey: string) => {
  // 发出菜单变化事件
  emit("menu-change", menuKey);
};

// 菜单配置
const menuSections: MenuSection[] = [
  {
    title: "概览",
    items: [{ key: "dashboard", label: "仪表板", icon: "pi pi-home" }],
  },
  {
    title: "应用管理",
    items: [
      { key: "containers", label: "容器", icon: "pi pi-box" },
      { key: "images", label: "镜像", icon: "pi pi-image" },
      { key: "networks", label: "网络", icon: "pi pi-sitemap" },
      { key: "volumes", label: "存储卷", icon: "pi pi-database" },
    ],
  },
  {
    title: "网站管理",
    items: [
      { key: "websites", label: "网站", icon: "pi pi-globe" },
      { key: "ssl", label: "SSL证书", icon: "pi pi-shield" },
    ],
  },
  {
    title: "数据库",
    items: [
      { key: "mysql", label: "MySQL", icon: "pi pi-database" },
      { key: "redis", label: "Redis", icon: "pi pi-server" },
    ],
  },
  {
    title: "系统工具",
    items: [
      { key: "files", label: "文件管理", icon: "pi pi-folder" },
      { key: "terminal", label: "终端", icon: "pi pi-desktop" },
      { key: "cron", label: "计划任务", icon: "pi pi-clock" },
      { key: "firewall", label: "防火墙", icon: "pi pi-shield" },
    ],
  },
  {
    title: "系统设置",
    items: [
      { key: "settings", label: "系统设置", icon: "pi pi-cog" },
      { key: "logs", label: "系统日志", icon: "pi pi-list" },
    ],
  },
];
</script>

<style scoped>
.layout-sidebar {
  width: 260px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-primary);
  flex-shrink: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.sidebar-header {
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  transition: border-color 0.3s ease;
}

.sidebar-header .flex {
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.sidebar-header .text-primary {
  color: var(--accent-primary);
}

.sidebar-content {
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  position: relative;
}

.nav-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: var(--accent-primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.nav-item i {
  width: 1.25rem;
  text-align: center;
  transition: color 0.3s ease;
}

/* 滚动条样式 - 自动跟随主题 */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-primary);
}
</style>
