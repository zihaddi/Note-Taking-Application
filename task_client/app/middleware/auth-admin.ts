import {authUser} from "~/composables/useAuth"

/**
 * auth-admin — protect routes requiring admin role.
 * Redirects unauthenticated visitors to /admin-login.
 * Redirects non-admin authenticated users to /unauthorized.
 */
export default defineNuxtRouteMiddleware(() => {
    const user = authUser()

    if (!user.value) {
        return navigateTo("/admin-login", {replace: true})
    }

    if (user.value.role !== "admin") {
        return navigateTo("/unauthorized", {replace: true})
    }
})
