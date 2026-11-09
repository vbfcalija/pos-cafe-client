import { authService } from '@/components/api/user/AuthService'
import { useUserStore } from '@/store/user'

export function useSignOut() {
    const userStore = useUserStore() as any

    async function signOut() {
        try {
            await authService.logout()
        } catch (error) {
            // Session is revoked client-side regardless of whether the request
            // reaches the server (e.g. the token already expired server-side).
        }

        localStorage.removeItem('_token')
        userStore.resetUser()

        await navigateTo('/login')
    }

    return { signOut }
}
