import {authUser} from "~/composables/useAuth"

/**
 * guest — redirect already-authenticated users away from auth pages.
 */
export default defineNuxtRouteMiddleware((to) => {
    const user = authUser()

    if (user.value) {
        const destination =
            user.value.role === "admin" ? "/admin-panel" : "/user-panel"
        return navigateTo(destination, {replace: true})
    }
})
