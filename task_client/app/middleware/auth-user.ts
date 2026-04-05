import {authUser} from "~/composables/useAuth"

export default defineNuxtRouteMiddleware(() => {
    const user = authUser()
    if (!user.value) {
        return navigateTo("/login", {replace: true})
    }
})
