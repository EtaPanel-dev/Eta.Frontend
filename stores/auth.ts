export const useAuthStore = defineStore('auth', () => {
  const token = useCookie('auth-token')
  
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (username: string, password: string) => {
    const api = useApi()
    const response = await api.login(username, password)
    
    token.value = response.token
    
    return response
  }
  
  const logout = () => {
    token.value = null
    return navigateTo('/login')
  }
  
  return {
    token,
    isAuthenticated,
    login,
    logout
  }
})