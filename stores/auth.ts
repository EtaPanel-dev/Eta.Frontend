import type { LoginResponse } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie('auth-token', {
    default: () => null,
    httpOnly: false,
    secure: true,
    sameSite: 'strict'
  })

  const user = ref<{ username: string } | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (username: string, password: string) => {
    const api = useApi()
    const response: LoginResponse = await api.login(username, password)

    // 保存token和用户信息
    token.value = response.token
    user.value = { username }

    return response
  }

  const logout = () => {
    token.value = null
    user.value = null
    return navigateTo('/login')
  }

  // 检查token是否过期
  const checkTokenExpiry = () => {
    if (!token.value) return false

    try {
      // 简单的JWT解析（仅用于获取过期时间）
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)

      if (payload.exp && payload.exp < now) {
        logout()
        return false
      }

      return true
    } catch (error) {
      console.error('Token解析失败:', error)
      logout()
      return false
    }
  }

  return {
    token: readonly(token),
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    checkTokenExpiry
  }
})