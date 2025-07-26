import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotification } from '~/composables/useNotification'

describe('useNotification', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // Mock process.client
        Object.defineProperty(global, 'process', {
            value: { client: true },
            writable: true
        })
    })

    it('should show success notification', () => {
        const mockToast = { add: vi.fn() }
        global.useToast = vi.fn(() => mockToast)

        const notification = useNotification()
        notification.showSuccess('操作成功', '数据已保存')

        expect(mockToast.add).toHaveBeenCalledWith({
            severity: 'success',
            summary: '操作成功',
            detail: '数据已保存',
            life: 3000
        })
    })

    it('should show error notification', () => {
        const mockToast = { add: vi.fn() }
        global.useToast = vi.fn(() => mockToast)

        const notification = useNotification()
        notification.showError('操作失败', '网络连接错误')

        expect(mockToast.add).toHaveBeenCalledWith({
            severity: 'error',
            summary: '操作失败',
            detail: '网络连接错误',
            life: 5000
        })
    })

    it('should show warning notification', () => {
        const mockToast = { add: vi.fn() }
        global.useToast = vi.fn(() => mockToast)

        const notification = useNotification()
        notification.showWarning('注意', '磁盘空间不足')

        expect(mockToast.add).toHaveBeenCalledWith({
            severity: 'warn',
            summary: '注意',
            detail: '磁盘空间不足',
            life: 4000
        })
    })

    it('should show info notification', () => {
        const mockToast = { add: vi.fn() }
        global.useToast = vi.fn(() => mockToast)

        const notification = useNotification()
        notification.showInfo('提示', '系统将在5分钟后重启')

        expect(mockToast.add).toHaveBeenCalledWith({
            severity: 'info',
            summary: '提示',
            detail: '系统将在5分钟后重启',
            life: 3000
        })
    })

    it('should not show notification on server side', () => {
        // Mock server environment
        Object.defineProperty(global, 'process', {
            value: { client: false },
            writable: true
        })

        const mockToast = { add: vi.fn() }
        global.useToast = vi.fn(() => mockToast)

        const notification = useNotification()
        notification.showSuccess('测试', '这不应该显示')

        expect(mockToast.add).not.toHaveBeenCalled()
    })

    it('should handle notification without detail', () => {
        const mockToast = { add: vi.fn() }
        global.useToast = vi.fn(() => mockToast)

        const notification = useNotification()
        notification.showSuccess('成功')

        expect(mockToast.add).toHaveBeenCalledWith({
            severity: 'success',
            summary: '成功',
            detail: undefined,
            life: 3000
        })
    })
})