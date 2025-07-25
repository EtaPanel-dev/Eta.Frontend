export const useActiveMenu = () => {
  const route = useRoute()

  // 根据路由路径确定活跃菜单
  const getActiveMenuFromRoute = (path: string): string => {
    const pathSegment = path.replace(/^\//, '').split('/')[0]
    const routeToMenuMap: Record<string, string> = {
      '': 'dashboard',
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

  const activeMenu = computed(() => getActiveMenuFromRoute(route.path))

  return {
    activeMenu: readonly(activeMenu)
  }
}