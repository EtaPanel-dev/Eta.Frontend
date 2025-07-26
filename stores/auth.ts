import type { LoginResponse } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  // 使用ref来管理状态
  const token = ref<string | null>(null)
  const user = ref<{ username: string } | null>(null)

  // 检查token是否有效（存在且未过期）
  const isTokenValid = computed(() => {
    if (!token.value) return false
    return !isJWTExpired(token.value)
  })

  // 认证状态
  const isAuthenticated = computed(() => isTokenValid.value)

  // 登录
  const login = async (username: string, password: string) => {
    const api = useApi()
    const response: LoginResponse = await api.login(username, password)

    // 保存token
    token.value = response.token

    // 从JWT中解析用户信息
    const userInfo = getUserFromJWT(response.token)
    user.value = userInfo || { username }

    return response
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    return navigateTo('/login')
  }

  // 获取token过期时间
  const getTokenExpiry = () => {
    if (!token.value) return null
    return getJWTExpiry(token.value)
  }

  // 获取token剩余时间（秒）
  const getTokenTimeRemaining = () => {
    if (!token.value) return null
    return getJWTTimeRemaining(token.value)
  }

  // 初始化时恢复用户信息
  const initialize = () => {
    if (token.value && !user.value) {
      const userInfo = getUserFromJWT(token.value)
      if (userInfo) {
        user.value = userInfo
      }
    }
  }

  return {
    token: readonly(token),
    user: readonly(user),
    isAuthenticated,
    isTokenValid,
    login,
    logout,
    getTokenExpiry,
    getTokenTimeRemaining,
    initialize
  }
}, {
  persist: {
    storage: persistedState.localStorage
  }
})