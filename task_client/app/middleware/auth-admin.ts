import {authUser} from "~/composables/useAuth"

export default defineNuxtRouteMiddleware(() => {
    const user = authUser()

    if (!user.value) {
        return navigateTo("/admin-login", {replace: true})
    }

    if (user.value.role !== "admin") {
        return navigateTo("/unauthorized", {replace: true})
    }
})
