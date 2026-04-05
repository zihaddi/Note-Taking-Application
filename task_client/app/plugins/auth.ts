import {fetchCurrentUser, authUser} from "~/composables/useAuth"

/**
 * auth plugin — restores auth state on app load if a valid token cookie exists.
 * Follows the same pattern as the admin/user auth plugins in the main boilerplate.
 */
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
