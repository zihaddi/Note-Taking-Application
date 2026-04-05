import type {AuthUser, LoginCredentials, RegisterData} from "~/types"
import {TOKEN_KEY} from "~/utils/$fetch"
import {useAuthApi} from "~/composables/useAuthApi"

/**
 * authUser — reactive auth state accessor (mirrors client's adminUser / regularUser pattern).
 * Returns `undefined` (not yet loaded), `null` (no user), or the user object.
 */
export const authUser = () =>
    useState<AuthUser | null | undefined>("auth_user", () => undefined)

/**
 * useAuth — authentication composable.
 * Manages auth state and exposes login/logout/register actions.
 */
export const useAuth = () => {
    const router = useRouter()
    const user = authUser()
    const tokenCookie = useCookie<string | null>(TOKEN_KEY, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    })
    const {
        register: apiRegister,
        login: apiLogin,
        adminLogin: apiAdminLogin,
        logout: apiLogout,
    } = useAuthApi()

    const isLoggedIn = computed(() => !!user.value)
    const isAdmin = computed(() => user.value?.role === "admin")
    const isUser = computed(() => user.value?.role === "user")
    const isLoading = ref(false)

    const setAuth = (token: string | null, userData: AuthUser | null) => {
        if (token) tokenCookie.value = token
        if (userData) user.value = userData
    }

    const clearAuth = () => {
        user.value = null
        tokenCookie.value = null
    }

    async function register(data: RegisterData) {
        isLoading.value = true
        try {
            const response: any = await apiRegister(data)
            if (response?.data?.token) {
                setAuth(response.data.token, response.data.user)
            }
            return response
        } finally {
            isLoading.value = false
        }
    }

    async function login(credentials: LoginCredentials) {
        if (isLoggedIn.value) return
        isLoading.value = true
        try {
            const response: any = await apiLogin(credentials)
            if (response?.data?.token) {
                setAuth(response.data.token, response.data.user)
            }
            return response
        } finally {
            isLoading.value = false
        }
    }

    async function adminLogin(credentials: LoginCredentials) {
        if (isLoggedIn.value) return
        isLoading.value = true
        try {
            const response: any = await apiAdminLogin(credentials)
            if (response?.data?.token) {
                setAuth(response.data.token, response.data.user)
            }
            return response
        } finally {
            isLoading.value = false
        }
    }

    async function logout() {
        isLoading.value = true
        try {
            await apiLogout()
        } catch (err) {
            console.warn("[useAuth] Logout API call failed:", err)
        } finally {
            clearAuth()
            isLoading.value = false
            await router.push("/login")
        }
    }

    return {
        user: computed(() => user.value),
        isLoggedIn,
        isAdmin,
        isUser,
        isLoading,
        setAuth,
        clearAuth,
        register,
        login,
        adminLogin,
        logout,
    }
}

/**
 * fetchCurrentUser — fetches the user profile from the API.
 * Used by the auth plugin to initialize user state on app load.
 */
export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
    try {
        const {getProfile} = useAuthApi()
        const response: any = await getProfile()
        return response?.data ?? null
    } catch (error: any) {
        const status = error?.response?.status ?? error?.status
        if ([400, 401, 403, 419].includes(status)) return null
        return null
    }
}
