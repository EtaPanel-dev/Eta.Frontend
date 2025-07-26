<template>
  <div class="terminal-content">
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span>Web终端</span>
          <div class="flex gap-2">
            <Button label="连接" icon="pi pi-play" size="small" :disabled="connected" @click="connect" />
            <Button label="断开" icon="pi pi-stop" size="small" :disabled="!connected" @click="disconnect" />
            <Button label="清屏" icon="pi pi-trash" size="small" outlined @click="clearTerminal" />
          </div>
        </div>
      </template>
      <template #content>
        <div class="terminal-window">
          <div class="terminal-header">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :class="connected ? 'bg-green-500' : 'bg-red-500'" />
                <span class="text-sm">{{ connected ? '已连接' : '未连接' }}</span>
              </div>
              <span class="text-sm">{{ currentPath }}</span>
            </div>
          </div>
          <div class="terminal-body" ref="terminalBody" @click="focusInput">
            <div class="terminal-output" ref="terminalOutput">
              <div v-for="(line, index) in outputLines" :key="index" class="terminal-line" v-html="line" />
            </div>
            <div v-if="connected" class="terminal-input-line">
              <span class="prompt">{{ prompt }}</span>
              <input 
                ref="terminalInput"
                v-model="currentInput"
                class="terminal-input"
                @keydown="handleKeydown"
                @keyup="handleKeyup"
                autocomplete="off"
                spellcheck="false"
              />
              <span class="cursor" :class="{ 'cursor-blink': showCursor }">|</span>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 页面 meta
useHead({
  title: 'Web终端 - EtaPanel'
})

// 响应式数据
const connected = ref(false)
const currentInput = ref('')
const outputLines = ref<string[]>(['欢迎使用Web终端，点击连接按钮开始使用'])
const currentPath = ref('~')
const prompt = ref('root@server:~$ ')
const showCursor = ref(true)
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)

// DOM引用
const terminalBody = ref<HTMLElement>()
const terminalOutput = ref<HTMLElement>()
const terminalInput = ref<HTMLInputElement>()

// WebSocket连接
let ws: WebSocket | null = null

// API服务
const api = useApi()

// 连接终端
const connect = async () => {
  try {
    // 这里应该建立WebSocket连接到后端终端服务
    // const wsUrl = `ws://localhost:8080/api/auth/terminal/ws`
    // ws = new WebSocket(wsUrl)
    
    // 模拟连接
    connected.value = true
    outputLines.value.push('<span class="text-green-400">终端连接成功</span>')
    await nextTick()
    scrollToBottom()
    focusInput()
  } catch (error) {
    outputLines.value.push('<span class="text-red-400">连接失败: ' + error + '</span>')
  }
}

// 断开连接
const disconnect = () => {
  if (ws) {
    ws.close()
    ws = null
  }
  connected.value = false
  outputLines.value.push('<span class="text-yellow-400">终端连接已断开</span>')
  scrollToBottom()
}

// 清屏
const clearTerminal = () => {
  outputLines.value = []
  focusInput()
}

// 聚焦输入框
const focusInput = () => {
  if (connected.value && terminalInput.value) {
    terminalInput.value.focus()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  })
}

// 执行命令
const executeCommand = async (command: string) => {
  if (!command.trim()) return
  
  // 添加到历史记录
  commandHistory.value.push(command)
  historyIndex.value = commandHistory.value.length
  
  // 显示命令
  outputLines.value.push(`${prompt.value}${command}`)
  
  try {
    // 这里应该通过WebSocket或API发送命令到后端
    // 模拟命令执行
    const result = await simulateCommand(command)
    if (result) {
      outputLines.value.push(result)
    }
  } catch (error) {
    outputLines.value.push(`<span class="text-red-400">错误: ${error}</span>`)
  }
  
  scrollToBottom()
}

// 模拟命令执行（实际应该通过WebSocket与后端通信）
const simulateCommand = async (command: string): Promise<string> => {
  const cmd = command.trim().toLowerCase()
  
  switch (cmd) {
    case 'ls':
    case 'ls -l':
      return `total 8
drwxr-xr-x 2 root root 4096 Jan 20 10:30 <span class="text-blue-400">bin</span>
drwxr-xr-x 2 root root 4096 Jan 20 10:30 <span class="text-blue-400">etc</span>
-rw-r--r-- 1 root root  220 Jan 20 10:30 <span class="text-white">README.md</span>`
    
    case 'pwd':
      return '/root'
    
    case 'whoami':
      return 'root'
    
    case 'date':
      return new Date().toString()
    
    case 'clear':
      outputLines.value = []
      return ''
    
    case 'help':
      return `可用命令:
  ls      - 列出文件
  pwd     - 显示当前目录
  whoami  - 显示当前用户
  date    - 显示日期时间
  clear   - 清屏
  help    - 显示帮助`
    
    default:
      if (cmd.startsWith('echo ')) {
        return command.substring(5)
      }
      return `<span class="text-red-400">命令未找到: ${command}</span>`
  }
}

// 键盘事件处理
const handleKeydown = async (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      await executeCommand(currentInput.value)
      currentInput.value = ''
      break
      
    case 'ArrowUp':
      event.preventDefault()
      if (historyIndex.value > 0) {
        historyIndex.value--
        currentInput.value = commandHistory.value[historyIndex.value]
      }
      break
      
    case 'ArrowDown':
      event.preventDefault()
      if (historyIndex.value < commandHistory.value.length - 1) {
        historyIndex.value++
        currentInput.value = commandHistory.value[historyIndex.value]
      } else {
        historyIndex.value = commandHistory.value.length
        currentInput.value = ''
      }
      break
      
    case 'Tab':
      event.preventDefault()
      // 这里可以实现命令自动补全
      break
  }
}

const handleKeyup = () => {
  // 重置历史索引
  if (historyIndex.value === commandHistory.value.length) {
    historyIndex.value = commandHistory.value.length
  }
}

// 光标闪烁
let cursorInterval: NodeJS.Timeout

onMounted(() => {
  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value
  }, 500)
})

onUnmounted(() => {
  if (cursorInterval) {
    clearInterval(cursorInterval)
  }
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped>
.terminal-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.terminal-window {
  background: #0d1117;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  border: 1px solid #30363d;
}

.terminal-header {
  background: #161b22;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #30363d;
  color: #f0f6fc;
}

.terminal-body {
  padding: 1rem;
  min-height: 500px;
  max-height: 600px;
  overflow-y: auto;
  background: #0d1117;
  cursor: text;
}

.terminal-output {
  color: #f0f6fc;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.terminal-line {
  margin-bottom: 2px;
  min-height: 1.4em;
}

.terminal-input-line {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.prompt {
  color: #58a6ff;
  font-weight: bold;
  white-space: nowrap;
  margin-right: 4px;
}

.terminal-input {
  background: transparent;
  border: none;
  outline: none;
  color: #f0f6fc;
  font-family: inherit;
  font-size: 14px;
  flex: 1;
  padding: 0;
  margin: 0;
}

.cursor {
  color: #f0f6fc;
  font-weight: bold;
  margin-left: 2px;
}

.cursor-blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 工具类 */
.w-3 { width: 0.75rem; }
.h-3 { height: 0.75rem; }
.bg-red-500 { background-color: #ef4444; }
.bg-green-500 { background-color: #22c55e; }
.rounded-full { border-radius: 9999px; }

/* 终端颜色 */
:deep(.text-red-400) { color: #f87171; }
:deep(.text-green-400) { color: #4ade80; }
:deep(.text-yellow-400) { color: #facc15; }
:deep(.text-blue-400) { color: #60a5fa; }
:deep(.text-white) { color: #ffffff; }

/* 滚动条样式 */
.terminal-body::-webkit-scrollbar {
  width: 8px;
}

.terminal-body::-webkit-scrollbar-track {
  background: #161b22;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
}

.terminal-body::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}

/* 卡片样式覆盖 */
:deep(.p-card-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-primary);
}

:deep(.p-card-title) {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.p-card-content) {
  padding: 1.25rem;
}
</style>