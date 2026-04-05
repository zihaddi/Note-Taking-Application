import {authUser} from "~/composables/useAuth"

/**
 * auth-user — protect routes requiring authentication (any role).
 * Redirects unauthenticated visitors to /login.
 */
export default defineNuxtRouteMiddleware(() => {
    const user = authUser()
    if (!user.value) {
        return navigateTo("/login", {replace: true})
    }
})
