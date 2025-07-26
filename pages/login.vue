<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-header">
        <AppLogo size="large" />
        <h1 class="login-title">EtaPanel</h1>
        <p class="login-subtitle">服务器管理面板</p>
      </div>

      <div class="surface-card p-5 shadow-2 border-round w-full">
        <div class="text-center mb-4">
          <div class="text-900 text-2xl font-medium mb-2">用户登录</div>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-field">
            <label for="username" class="form-label">用户名</label>
            <InputText
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              class="w-full"
              style="padding: 0.75rem"
              required
            />
          </div>

          <div class="form-field">
            <label for="password" class="form-label">密码</label>
            <InputText
              id="password"
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              class="w-full"
              style="padding: 0.75rem"
              required
            />
          </div>

          <Button
            type="submit"
            label="登录"
            icon="pi pi-user"
            class="login-btn"
            style="padding: 0.75rem"
            :loading="loading"
          />
        </form>
      </div>

      <div class="login-footer">
        <small class="text-600"
          >&copy;
          <ClientOnly fallback="0000">{{ currentYear }}</ClientOnly> EtaPanel.
          All rights reserved.</small
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "empty",
  auth: false,
});

useHead({
  title: "登录 - EtaPanel",
});

const form = ref({
  username: "",
  password: "",
});

const loading = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notification = useNotification();

const currentYear = computed(() => new Date().getFullYear());

// 检查已登录用户并重定向
onMounted(() => {
  if (authStore.isAuthenticated) {
    const redirect = (route.query.redirect as string) || "/";
    router.replace(redirect);
  }
});

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) return;

  loading.value = true;

  try {
    await authStore.login(form.value.username, form.value.password);

    // 等待一下确保状态已更新
    await nextTick();

    const redirect = (route.query.redirect as string) || "/";

    // 使用replace而不是push，避免返回到登录页
    await router.replace(redirect);
  } catch (error: any) {
    notification.showError("登录失败", error.message || "用户名或密码错误");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-ground);
  padding: 2rem;
}

.login-wrapper {
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Logo样式现在由AppLogo组件处理 */
.app-logo {
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  color: var(--text-color-secondary);
  margin: 0;
  font-size: 1rem;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.login-btn {
  width: 100%;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .login-container {
    padding: 1rem;
  }

  .login-title {
    font-size: 2rem;
  }

  /* 移动端Logo样式由AppLogo组件处理 */
}
</style>
