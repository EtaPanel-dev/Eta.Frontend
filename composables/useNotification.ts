import { useToast } from 'primevue/usetoast'

export const useNotification = () => {
    const toast = useToast()

    const showSuccess = (summary: string, detail?: string) => {
        toast.add({
            severity: 'success',
            summary: summary,
            detail: detail,
            life: 3000
        })
    }

    const showError = (summary: string, detail?: string) => {
        toast.add({
            severity: 'error',
            summary: summary,
            detail: detail,
            life: 5000
        })
    }

    const showWarning = (summary: string, detail?: string) => {
        toast.add({
            severity: 'warn',
            summary: summary,
            detail: detail,
            life: 4000
        })
    }

    const showInfo = (summary: string, detail?: string) => {
        toast.add({
            severity: 'info',
            summary: summary,
            detail: detail,
            life: 3000
        })
    }

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
}