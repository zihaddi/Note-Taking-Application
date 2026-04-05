import {fetchCurrentUser, authUser} from "~/composables/useAuth"

export default defineNuxtPlugin(async () => {
    const current_user = authUser()
    if (current_user.value !== undefined) return

    try {
        const userData = await fetchCurrentUser()
        current_user.value = userData
    } catch (error) {
        console.error("Failed to initialize user:", error)
        current_user.value = null
    }
})
