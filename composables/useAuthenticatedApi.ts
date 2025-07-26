/**
 * 安全的API调用composable
 * 确保只有在用户已认证的情况下才发起API请求
 */
export const useAuthenticatedApi = () => {
    const authStore = useAuthStore()
    const api = useApi()

    // 包装API方法，添加认证检查
    const safeApiCall = async <T>(
        apiMethod: () => Promise<T>,
        errorMessage = '请先登录'
    ): Promise<T> => {
        if (!authStore.isAuthenticated) {
            throw new Error(errorMessage)
        }

        try {
            return await apiMethod()
        } catch (error: any) {
            // 如果是401错误，自动登出
            if (error.message?.includes('登录已过期') || error.message?.includes('未登录')) {
                authStore.logout()
            }
            throw error
        }
    }

    // 返回包装后的API方法
    return {
        // 系统监控
        getSystemInfo: () => safeApiCall(() => api.getSystemInfo()),
        getCpuInfo: () => safeApiCall(() => api.getCpuInfo()),
        getMemoryInfo: () => safeApiCall(() => api.getMemoryInfo()),
        getDiskInfo: () => safeApiCall(() => api.getDiskInfo()),
        getNetworkInfo: () => safeApiCall(() => api.getNetworkInfo()),
        getProcesses: () => safeApiCall(() => api.getProcesses()),
        killProcess: (pid: number, signal?: string) =>
            safeApiCall(() => api.killProcess(pid, signal)),

        // 文件管理
        getFiles: (path?: string) => safeApiCall(() => api.getFiles(path)),
        uploadFile: (path: string, file: File) =>
            safeApiCall(() => api.uploadFile(path, file)),
        deleteFile: (path: string) => safeApiCall(() => api.deleteFile(path)),
        createDirectory: (path: string) => safeApiCall(() => api.createDirectory(path)),
        getFileContent: (path: string) => safeApiCall(() => api.getFileContent(path)),
        saveFileContent: (path: string, content: string) =>
            safeApiCall(() => api.saveFileContent(path, content)),
        copyFile: (source: string, destination: string) =>
            safeApiCall(() => api.copyFile(source, destination)),
        moveFile: (source: string, destination: string) =>
            safeApiCall(() => api.moveFile(source, destination)),
        compressFiles: (files: string[], output: string) =>
            safeApiCall(() => api.compressFiles(files, output)),
        extractFile: (file: string, destination: string) =>
            safeApiCall(() => api.extractFile(file, destination)),
        getFilePermissions: (path: string) =>
            safeApiCall(() => api.getFilePermissions(path)),
        setFilePermissions: (path: string, permissions: string, owner?: string, group?: string) =>
            safeApiCall(() => api.setFilePermissions(path, permissions, owner, group)),

        // Nginx管理
        getNginxStatus: () => safeApiCall(() => api.getNginxStatus()),
        getNginxSites: () => safeApiCall(() => api.getNginxSites()),
        createNginxSite: (site: any) => safeApiCall(() => api.createNginxSite(site)),
        updateNginxSite: (id: number, site: any) =>
            safeApiCall(() => api.updateNginxSite(id, site)),
        deleteNginxSite: (id: number) => safeApiCall(() => api.deleteNginxSite(id)),
        toggleNginxSite: (id: number) => safeApiCall(() => api.toggleNginxSite(id)),
        reloadNginx: () => safeApiCall(() => api.reloadNginx()),
        restartNginx: () => safeApiCall(() => api.restartNginx()),
        testNginxConfig: () => safeApiCall(() => api.testNginxConfig()),
        getNginxConfig: () => safeApiCall(() => api.getNginxConfig()),
        updateNginxConfig: (content: string) =>
            safeApiCall(() => api.updateNginxConfig(content)),
        resetNginxConfig: () => safeApiCall(() => api.resetNginxConfig()),

        // 定时任务
        getCrontabs: () => safeApiCall(() => api.getCrontabs()),
        createCrontab: (crontab: any) => safeApiCall(() => api.createCrontab(crontab)),
        updateCrontab: (id: number, crontab: any) =>
            safeApiCall(() => api.updateCrontab(id, crontab)),
        deleteCrontab: (id: number) => safeApiCall(() => api.deleteCrontab(id)),
        toggleCrontab: (id: number) => safeApiCall(() => api.toggleCrontab(id)),

        // SSL证书
        getSSLCertificates: () => safeApiCall(() => api.getSSLCertificates()),
        createSSLCertificate: (ssl: any) => safeApiCall(() => api.createSSLCertificate(ssl)),
        updateSSLCertificate: (id: number, ssl: any) =>
            safeApiCall(() => api.updateSSLCertificate(id, ssl)),
        deleteSSLCertificate: (id: number) => safeApiCall(() => api.deleteSSLCertificate(id)),

        // ACME客户端
        getAcmeClients: () => safeApiCall(() => api.getAcmeClients()),
        createAcmeClient: (client: any) => safeApiCall(() => api.createAcmeClient(client)),
        updateAcmeClient: (id: number, client: any) =>
            safeApiCall(() => api.updateAcmeClient(id, client)),
        deleteAcmeClient: (id: number) => safeApiCall(() => api.deleteAcmeClient(id)),

        // DNS账号
        getDnsAccounts: () => safeApiCall(() => api.getDnsAccounts()),
        createDnsAccount: (account: any) => safeApiCall(() => api.createDnsAccount(account)),
        updateDnsAccount: (id: number, account: any) =>
            safeApiCall(() => api.updateDnsAccount(id, account)),
        deleteDnsAccount: (id: number) => safeApiCall(() => api.deleteDnsAccount(id)),

        // 原始API（用于登录等不需要认证的操作）
        login: api.login
    }
}