import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

describe('Login Flow Integration', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()

        global.useCookie = vi.fn(() => ({ value: null }))
        global.navigateTo = vi.fn()
    })

    it('should complete successful login flow', async () => {
        // Mock successful API response
        const mockResponse = {
            code: 200,
            message: 'success',
            data: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                expires_at: 1640995200
            }
        }

        global.$fetch = vi.fn().mockResolvedValue(mockResponse)
        const mockToken = { value: null }
        global.useCookie = vi.fn(() => mockToken)

        const authStore = useAuthStore()

        // Perform login
        const result = await authStore.login('admin', 'password123')

        // Verify API was called correctly
        expect(global.$fetch).toHaveBeenCalledWith(
            'http://localhost:8080/api/public/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: 'admin', password: 'password123' })
            }
        )

        // Verify token was stored
        expect(mockToken.value).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

        // Verify user is authenticated
        expect(authStore.isAuthenticated).toBe(true)

        // Verify return value
        expect(result).toEqual(mockResponse.data)
    })

    it('should handle login failure with specific error message', async () => {
        const mockError = {
            status: 401,
            data: {
                message: '用户名不存在'
            }
        }

        global.$fetch = vi.fn().mockRejectedValue(mockError)

        const authStore = useAuthStore()

        // Attempt login
        await expect(authStore.login('nonexistent', 'password')).rejects.toThrow('用户名不存在')

        // Verify user is not authenticated
        expect(authStore.isAuthenticated).toBe(false)

        // Verify error was marked as handled
        expect(mockError.handled).toBe(true)
    })

    it('should handle subsequent API calls after login', async () => {
        // Setup successful login
        const loginResponse = {
            code: 200,
            message: 'success',
            data: {
                token: 'valid-jwt-token',
                expires_at: 1640995200
            }
        }

        const systemInfoResponse = {
            code: 200,
            message: 'success',
            data: {
                cpu: 45,
                memory: 70,
                disk: 30
            }
        }

        global.$fetch = vi.fn()
            .mockResolvedValueOnce(loginResponse) // First call for login
            .mockResolvedValueOnce(systemInfoResponse) // Second call for system info

        const mockToken = { value: null }
        global.useCookie = vi.fn(() => mockToken)

        const authStore = useAuthStore()
        const api = useApi()

        // Login first
        await authStore.login('admin', 'password')

        // Now make authenticated API call
        const systemInfo = await api.getSystemInfo()

        // Verify system info call was made with token
        expect(global.$fetch).toHaveBeenNthCalledWith(2,
            'http://localhost:8080/api/auth/system',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer valid-jwt-token',
                },
            }
        )

        expect(systemInfo).toEqual(systemInfoResponse.data)
    })

    it('should handle token expiry during API calls', async () => {
        const mockError = {
            status: 401,
            data: {
                message: 'Token expired'
            }
        }

        global.$fetch = vi.fn().mockRejectedValue(mockError)
        const mockToken = { value: 'expired-token' }
        global.useCookie = vi.fn(() => mockToken)

        const api = useApi()

        // Make API call with expired token
        await expect(api.getSystemInfo()).rejects.toThrow('登录已过期，请重新登录')

        // Verify token was cleared
        expect(mockToken.value).toBe(null)

        // Verify redirect to login
        expect(global.navigateTo).toHaveBeenCalledWith('/login')
    })
})