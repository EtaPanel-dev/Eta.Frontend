import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApi } from '~/composables/useApi'

// Mock the global functions
vi.mock('~/composables/useApi', async () => {
    const actual = await vi.importActual('~/composables/useApi')
    return actual
})

describe('useApi', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('login method', () => {
        it('should return login response on successful login', async () => {
            const mockResponse = {
                code: 200,
                message: 'success',
                data: {
                    token: 'mock-jwt-token',
                    expires_at: 1640995200
                }
            }

            global.$fetch = vi.fn().mockResolvedValue(mockResponse)

            const api = useApi()
            const result = await api.login('admin', 'password')

            expect(result).toEqual(mockResponse.data)
            expect(global.$fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/public/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: 'admin', password: 'password' })
                }
            )
        })

        it('should throw specific error message on 401 status', async () => {
            const mockError = {
                status: 401,
                data: {
                    message: '用户名或密码错误'
                }
            }

            global.$fetch = vi.fn().mockRejectedValue(mockError)

            const api = useApi()

            await expect(api.login('admin', 'wrongpassword')).rejects.toThrow('用户名或密码错误')
            expect(mockError.handled).toBe(true)
        })

        it('should throw default error message on 401 without specific message', async () => {
            const mockError = {
                status: 401,
                data: {}
            }

            global.$fetch = vi.fn().mockRejectedValue(mockError)

            const api = useApi()

            await expect(api.login('admin', 'wrongpassword')).rejects.toThrow('用户名或密码错误')
        })

        it('should handle 400 bad request errors', async () => {
            const mockError = {
                status: 400,
                data: {
                    message: '请求参数不能为空'
                }
            }

            global.$fetch = vi.fn().mockRejectedValue(mockError)

            const api = useApi()

            await expect(api.login('', '')).rejects.toThrow('请求参数不能为空')
        })

        it('should handle 500 server errors', async () => {
            const mockError = {
                status: 500,
                data: {
                    message: '服务器内部错误'
                }
            }

            global.$fetch = vi.fn().mockRejectedValue(mockError)

            const api = useApi()

            await expect(api.login('admin', 'password')).rejects.toThrow('服务器内部错误')
        })

        it('should handle network errors', async () => {
            const mockError = new Error('Network Error')

            global.$fetch = vi.fn().mockRejectedValue(mockError)

            const api = useApi()

            await expect(api.login('admin', 'password')).rejects.toThrow('网络连接失败，请检查网络设置')
        })

        it('should handle API response with non-200 code', async () => {
            const mockResponse = {
                code: 400,
                message: '登录失败，请检查用户名和密码',
                data: null
            }

            global.$fetch = vi.fn().mockResolvedValue(mockResponse)

            const api = useApi()

            await expect(api.login('admin', 'password')).rejects.toThrow('登录失败，请检查用户名和密码')
        })
    })

    describe('apiRequest method for authenticated endpoints', () => {
        it('should redirect to login on 401 for authenticated endpoints', async () => {
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

            await expect(api.getSystemInfo()).rejects.toThrow('登录已过期，请重新登录')
            expect(mockToken.value).toBe(null)
            expect(global.navigateTo).toHaveBeenCalledWith('/login')
        })

        it('should handle successful API requests', async () => {
            const mockResponse = {
                code: 200,
                message: 'success',
                data: {
                    cpu: 50,
                    memory: 70,
                    disk: 30
                }
            }

            global.$fetch = vi.fn().mockResolvedValue(mockResponse)
            global.useCookie = vi.fn(() => ({ value: 'valid-token' }))

            const api = useApi()
            const result = await api.getSystemInfo()

            expect(result).toEqual(mockResponse.data)
        })
    })
})