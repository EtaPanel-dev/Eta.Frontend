<template>
  <div class="app-logo" :class="sizeClass">
    <img src="~/assets/logo.svg" alt="EtaPanel Logo" class="logo-image" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: "small" | "medium" | "large";
  background?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "medium",
  background: true,
});

const sizeClass = computed(() => {
  const classes = [`logo-${props.size}`];
  if (props.background) {
    classes.push("with-background");
  }
  return classes;
});
</script>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 尺寸变体 */
.logo-small {
  width: 24px;
  height: 24px;
  padding: 2px;
}

.logo-medium {
  width: 32px;
  height: 32px;
  padding: 4px;
}

.logo-large {
  width: 80px;
  height: 80px;
  padding: 18px;
  border-radius: 50%;
}

/* 背景样式 */
.with-background {
  background: #62abff;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .logo-large {
    width: 60px;
    height: 60px;
    padding: 8px;
  }
}
</style>
