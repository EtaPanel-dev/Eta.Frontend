<template>
  <div class="custom-progress-bar" :class="className">
    <div 
      class="custom-progress-bar-fill" 
      :style="{ width: value + '%' }"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: number
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  className: ''
})
</script>

<style scoped>
.custom-progress-bar {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
  position: relative;
}

.custom-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 0.25rem;
  transition: width 0.3s ease;
  width: 0%;
}

.h-2 {
  height: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.flex-1 {
  flex: 1;
}
</style>