export const useActiveMenu = () => {
  const route = useRoute()
  const router = useRouter()

  // 根据当前路由路径确定活跃菜单
  const getActiveMenuFromRoute = (path: string): string => {
    // 移除开头的斜杠并获取第一个路径段
    const pathSegment = path.replace(/^\//, '').split('/')[0]

    // 路径映射到菜单键
    const routeToMenuMap: Record<string, string> = {
      '': 'dashboard',           // 根路径 -> 仪表板
      'containers': 'containers',
      'images': 'images',
      'networks': 'networks',
      'volumes': 'volumes',
      'websites': 'websites',
      'ssl': 'ssl',
      'mysql': 'mysql',
      'redis': 'redis',
      'files': 'files',
      'terminal': 'terminal',
      'cron': 'cron',
      'firewall': 'firewall',
      'settings': 'settings',
      'logs': 'logs'
    }

    return routeToMenuMap[pathSegment] || 'dashboard'
  }

  // 菜单键到页面标题的映射
  const getPageTitle = (): string => {
    const currentMenu = getActiveMenuFromRoute(route.path)

    const titleMap: Record<string, string> = {
      'dashboard': '仪表板',
      'containers': '容器管理',
      'images': '镜像管理',
      'networks': '网络管理',
      'volumes': '存储卷管理',
      'websites': '网站管理',
      'ssl': 'SSL证书管理',
      'mysql': 'MySQL管理',
      'redis': 'Redis管理',
      'files': '文件管理',
      'terminal': '终端',
      'cron': '计划任务',
      'firewall': '防火墙管理',
      'settings': '系统设置',
      'logs': '系统日志'
    }

    return titleMap[currentMenu] || '仪表板'
  }

  // 响应式的活跃菜单状态
  const activeMenu = computed(() => {
    const menu = getActiveMenuFromRoute(route.path)
    if (import.meta.client) {
      console.log('Current route:', route.path, '-> Active menu:', menu)
    }
    return menu
  })

  // 设置活跃菜单（用于编程式导航）
  const setActiveMenu = (menu: string) => {
    console.log('Setting active menu:', menu)
    // 实际的状态更新由路由变化触发，这里只是日志记录
  }

  // 监听路由变化
  if (import.meta.client) {
    watch(() => route.path, (newPath, oldPath) => {
      console.log('Route changed from', oldPath, 'to', newPath)
      const newMenu = getActiveMenuFromRoute(newPath)
      console.log('New active menu:', newMenu)
    }, { immediate: true })
  }

  return {
    activeMenu: readonly(activeMenu),
    setActiveMenu,
    getPageTitle
  }
}