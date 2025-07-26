import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'

// Mock useApi
const mockLogin = vi.fn()
vi.mock('~/composables/useApi', () => ({
    useApi: () => ({
        login: mockLogin
    })
}))

describe('useAuthStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()

        // Mock useCookie
        global.useCookie = vi.fn(() => ({
            value: null
        }))

        global.navigateTo = vi.fn()
    })

    it('should initialize with unauthenticated state', () => {
        const authStore = useAuthStore()

        expect(authStore.isAuthenticated).toBe(false)
        expect(authStore.user).toBe(null)
    })

    it('should login successfully and set token', async () => {
        const mockResponse = {
            token: 'mock-jwt-token',
            expires_at: 1640995200
        }

        mockLogin.mockResolvedValue(mockResponse)

        const mockToken = { value: null }
        global.useCookie = vi.fn(() => mockToken)

        const authStore = useAuthStore()
        const result = await authStore.login('admin', 'password')

        expect(mockLogin).toHaveBeenCalledWith('admin', 'password')
        expect(mockToken.value).toBe('mock-jwt-token')
        expect(result).toEqual(mockResponse)
    })

    it('should handle login errors', async () => {
        const mockError = new Error('用户名或密码错误')
        mockLogin.mockRejectedValue(mockError)

        const authStore = useAuthStore()

        await expect(authStore.login('admin', 'wrongpassword')).rejects.toThrow('用户名或密码错误')
    })

    it('should logout and clear token', () => {
        const mockToken = { value: 'some-token' }
        global.useCookie = vi.fn(() => mockToken)

        const authStore = useAuthStore()
        authStore.logout()

        expect(mockToken.value).toBe(null)
        expect(global.navigateTo).toHaveBeenCalledWith('/login')
    })

    it('should check token expiry correctly', () => {
        // Mock a valid token (expires in future)
        const futureTimestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        const validToken = btoa(JSON.stringify({ exp: futureTimestamp }))
        const mockToken = { value: `header.${validToken}.signature` }

        global.useCookie = vi.fn(() => mockToken)

        const authStore = useAuthStore()
        const isValid = authStore.checkTokenExpiry()

        expect(isValid).toBe(true)
    })

    it('should detect expired token and logout', () => {
        // Mock an expired token
        const pastTimestamp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
        const expiredToken = btoa(JSON.stringify({ exp: pastTimestamp }))
        const mockToken = { value: `header.${expiredToken}.signature` }

        global.useCookie = vi.fn(() => mockToken)

        const authStore = useAuthStore()
        const isValid = authStore.checkTokenExpiry()

        expect(isValid).toBe(false)
        expect(mockToken.value).toBe(null)
        expect(global.navigateTo).toHaveBeenCalledWith('/login')
    })

    it('should handle invalid token format', () => {
        const mockToken = { value: 'invalid-token' }
        global.useCookie = vi.fn(() => mockToken)

        const authStore = useAuthStore()
        const isValid = authStore.checkTokenExpiry()

        expect(isValid).toBe(false)
        expect(mockToken.value).toBe(null)
    })
})