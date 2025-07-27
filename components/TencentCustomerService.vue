<template>
    <div class="customer-service-container">
        <!-- 圆形AI聊天按钮 -->
        <button v-if="!showDialog" class="chat-button" @click="openDialog" title="AI聊天助手">
            <i class="pi pi-comments"></i>
        </button>

        <!-- AI聊天弹窗 -->
        <Dialog v-model:visible="showDialog" modal :closable="true" :draggable="false" class="ai-chat-dialog"
            :style="{ width: '500px', height: '700px' }">
            <template #header>
                <div class="dialog-header">
                    <i class="pi pi-comments" style="margin-right: 0.5rem;"></i>
                    AI聊天助手
                </div>
            </template>

            <div class="dialog-content">
                <iframe src="https://lke.cloud.tencent.com/webim_exp/#/chat/FtxWEE" frameborder="0" width="100%"
                    height="100%" allow="microphone; camera" scrolling="no"></iframe>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
const showDialog = ref(false)

const openDialog = () => {
    showDialog.value = true
}
</script>

<style scoped>
.customer-service-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
}

.chat-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1890ff, #096dd9);
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
    background: linear-gradient(135deg, #40a9ff, #1890ff);
}

.chat-button:active {
    transform: translateY(0);
}

/* Dialog 完全填充样式 */
:deep(.ai-chat-dialog .p-dialog) {
    border-radius: 12px;
    overflow: hidden;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
}

:deep(.ai-chat-dialog .p-dialog-header) {
    background: linear-gradient(135deg, #1890ff, #096dd9);
    color: white;
    padding: 1rem;
    border-bottom: none;
    flex-shrink: 0;
}

:deep(.ai-chat-dialog .p-dialog-content) {
    padding: 0 !important;
    flex: 1 !important;
    display: flex !important;
    overflow: hidden !important;
    height: calc(100% - 60px) !important;
}

.dialog-header {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 1.1rem;
    color: white;
}

.dialog-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
}

.dialog-content iframe {
    border: none !important;
    width: 100% !important;
    height: 100% !important;
    flex: 1 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .customer-service-container {
        bottom: 80px;
        right: 15px;
    }

    .chat-button {
        width: 50px;
        height: 50px;
        font-size: 1.2rem;
    }

    :deep(.ai-chat-dialog .p-dialog) {
        width: calc(100vw - 20px) !important;
        height: 85vh !important;
        margin: 10px !important;
    }
}

/* 动画效果 */
@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-10px);
    }

    60% {
        transform: translateY(-5px);
    }
}

.chat-button:hover {
    animation: bounce 1s ease-in-out;
}
</style>