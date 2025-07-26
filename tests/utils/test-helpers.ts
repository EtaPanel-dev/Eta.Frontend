import { vi } from 'vitest'

/**
 * 创建模拟的API响应
 */
export function createMockApiResponse<T>(data: T, code = 200, message = 'success') {
    return {
        code,
        message,
        data
    }
}

/**
 * 创建模拟的API错误
 */
export function createMockApiError(status: number, message: string, data?: any) {
    const error = new Error(message) as any
    error.status = status
    error.data = data || { message }
    return error
}

/**
 * 创建模拟的JWT token
 */
export function createMockJwtToken(payload: any = {}, expiresIn = 3600) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const exp = Math.floor(Date.now() / 1000) + expiresIn
    const tokenPayload = btoa(JSON.stringify({ ...payload, exp }))
    const signature = 'mock-signature'

    return `${header}.${tokenPayload}.${signature}`
}

/**
 * 模拟Cookie
 */
export function createMockCookie(initialValue: any = null) {
    return { value: initialValue }
}

/**
 * 模拟Toast服务
 */
export function createMockToast() {
    return {
        add: vi.fn()
    }
}

/**
 * 模拟系统信息数据
 */
export function createMockSystemInfo() {
    return {
        load: '1.5',
        memory: 75,
        disk: 45,
        cpu: 60,
        memoryUsed: '6 GB',
        memoryTotal: '8 GB'
    }
}

/**
 * 模拟进程数据
 */
export function createMockProcesses() {
    return [
        {
            pid: 1234,
            name: 'nginx',
            cpu: 2.5,
            memory: 1.2,
            user: 'www-data',
            command: '/usr/sbin/nginx -g daemon off;'
        },
        {
            pid: 5678,
            name: 'node',
            cpu: 15.3,
            memory: 8.7,
            user: 'app',
            command: 'node server.js'
        }
    ]
}

/**
 * 模拟文件列表数据
 */
export function createMockFiles() {
    return {
        currentPath: '/home',
        files: [
            {
                name: 'documents',
                isDir: true,
                size: 0,
                permissions: 'drwxr-xr-x',
                owner: 'user',
                group: 'user',
                modTime: '2024-01-15T10:30:00Z',
                path: '/home/documents'
            },
            {
                name: 'config.json',
                isDir: false,
                size: 2560,
                permissions: '-rw-r--r--',
                owner: 'user',
                group: 'user',
                modTime: '2024-01-14T15:20:00Z',
                path: '/home/config.json'
            }
        ]
    }
}

/**
 * 等待异步操作完成
 */
export function waitFor(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟网络延迟
 */
export function withDelay<T>(value: T, delay = 100): Promise<T> {
    return new Promise(resolve => {
        setTimeout(() => resolve(value), delay)
    })
}