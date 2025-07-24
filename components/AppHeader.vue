<template>
  <div class="main-header">
    <div class="header-content">
      <!-- 左侧：页面标题 -->
      <div class="header-left">
        <span class="page-title">{{ pageTitle }}</span>
      </div>

      <!-- 右侧：系统信息和用户操作 -->
      <div class="header-right">
        <!-- 系统信息 -->
        <div class="system-info">
          <span class="info-item">负载: {{ systemInfo.load }}</span>
          <div class="info-divider" />
          <span class="info-item">内存: {{ systemInfo.memory }}%</span>
          <div class="info-divider" />
          <span class="info-item">磁盘: {{ systemInfo.disk }}%</span>
        </div>

        <!-- 用户操作区域 -->
        <div class="user-actions">
          <!-- 通知按钮 -->
          <div class="action-item">
            <Button icon="pi pi-bell" text rounded class="notification-btn" @click="toggleNotifications" :badge="notificationCount > 0 ? notificationCount.toString() : undefined
              " badge-class="notification-badge" />
            <!-- 通知下拉菜单 -->
            <div v-if="showNotifications" class="dropdown-menu notification-menu">
              <div class="menu-header">
                <span class="menu-title">通知</span>
                <Button icon="pi pi-times" text size="small" @click="showNotifications = false" />
              </div>
              <div class="menu-content">
                <div v-if="notifications.length === 0" class="empty-state">
                  暂无新通知
                </div>
                <div v-else>
                  <div v-for="notification in notifications" :key="notification.id" class="notification-item">
                    <div class="notification-content">
                      <div class="notification-title">
                        {{ notification.title }}
                      </div>
                      <div class="notification-time">
                        {{ notification.time }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 用户菜单 -->
          <div class="action-item">
            <Button icon="pi pi-user" text rounded class="user-btn" @click="toggleUserMenu" />
            <!-- 用户下拉菜单 -->
            <div v-if="showUserMenu" class="dropdown-menu user-menu">
              <div class="menu-header">
                <div class="user-info">
                  <div class="user-avatar">
                    <i class="pi pi-user" />
                  </div>
                  <div class="user-details">
                    <div class="user-name">管理员</div>
                    <div class="user-role">系统管理员</div>
                  </div>
                </div>
              </div>
              <div class="menu-content">
                <div class="menu-item" @click="handleUserAction('profile')">
                  <i class="pi pi-user" />
                  <span>个人资料</span>
                </div>
                <div class="menu-item" @click="handleUserAction('settings')">
                  <i class="pi pi-cog" />
                  <span>系统设置</span>
                </div>
                <div class="menu-divider" />
                <div class="menu-item logout" @click="handleUserAction('logout')">
                  <i class="pi pi-sign-out" />
                  <span>退出登录</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SystemInfo } from "~/types";

defineProps<{
  pageTitle: string;
  systemInfo: SystemInfo;
}>();

// 响应式数据
const showNotifications = ref(false);
const showUserMenu = ref(false);
const notificationCount = ref(3);

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    title: "容器 nginx-web 已启动",
    time: "2分钟前",
  },
  {
    id: 2,
    title: "系统更新可用",
    time: "1小时前",
  },
  {
    id: 3,
    title: "SSL证书即将过期",
    time: "3小时前",
  },
]);

// 方法
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  showNotifications.value = false;
};

const handleUserAction = (action: string) => {
  showUserMenu.value = false;

  switch (action) {
    case "profile":
      // 跳转到个人资料页面
      console.log('跳转到个人资料页面');
      break;
    case "settings":
      // 跳转到系统设置页面
      navigateTo('/settings');
      break;
    case "logout":
      // 处理退出登录
      console.log('处理退出登录');
      break;
  }
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".action-item")) {
    showNotifications.value = false;
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.main-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0 1.5rem;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 260px;
  right: 0;
  z-index: 999;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.system-info {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-primary);
  margin-left: auto;
  transition: all 0.3s ease;
}

.info-item {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
  padding: 0 0.5rem;
  transition: color 0.3s ease;
}

.info-item:first-child {
  padding-left: 0;
}

.info-item:last-child {
  padding-right: 0;
}

.info-divider {
  width: 1px;
  height: 1rem;
  background: var(--border-secondary);
  flex-shrink: 0;
  transition: background-color 0.3s ease;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-item {
  position: relative;
}

.notification-btn,
.user-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: relative;
}

.notification-btn:hover,
.user-btn:hover {
  background: var(--bg-secondary);
  color: var(--accent-primary);
}

/* 通知徽章 */
:deep(.p-button-badge) {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--danger);
  color: white;
  font-size: 0.75rem;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* 下拉菜单通用样式 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 280px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.menu-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-tertiary);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.menu-title {
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.menu-content {
  max-height: 300px;
  overflow-y: auto;
}

/* 通知菜单样式 */
.notification-menu {
  width: 320px;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.notification-item {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border-tertiary);
  cursor: pointer;
  transition: background 0.2s ease;
}

.notification-item:hover {
  background: var(--bg-secondary);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-title {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

/* 用户菜单样式 */
.user-menu {
  width: 240px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--accent-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.menu-item:hover {
  background: var(--bg-secondary);
}

.menu-item i {
  width: 1rem;
  text-align: center;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.menu-item.logout {
  color: var(--danger);
}

.menu-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.menu-item.logout i {
  color: var(--danger);
}

.menu-divider {
  height: 1px;
  background: var(--border-tertiary);
  margin: 0.5rem 0;
  transition: background-color 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-info {
    display: none;
  }

  .header-right {
    gap: 0.5rem;
  }

  .dropdown-menu {
    right: -1rem;
    left: auto;
    width: 280px;
  }

  .notification-menu {
    width: 280px;
  }
}

/* 动画效果 */
.dropdown-menu {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义分割线样式已在 .info-divider 中定义 */
</style>
