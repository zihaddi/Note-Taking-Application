import {authUser} from "~/composables/useAuth"

export default defineNuxtRouteMiddleware((to) => {
    const user = authUser()

    if (user.value) {
        const destination =
            user.value.role === "admin" ? "/admin-panel" : "/user-panel"
        return navigateTo(destination, {replace: true})
    }
})
