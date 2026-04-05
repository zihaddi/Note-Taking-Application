import {$fetchApi} from "~/utils/$fetch"

/**
 * usePermissions — fetches the current user's permission slugs once,
 * caches them in shared state, and exposes a `can(slug)` helper.
 */
export const usePermissions = () => {
    const slugs = useState<string[]>("user_perm_slugs", () => [])
    const isLoaded = useState<boolean>("user_perm_loaded", () => false)

    async function loadPermissions() {
        if (isLoaded.value) return
        try {
            const res: any = await $fetchApi("/api/auth/my-permissions", {
                method: "GET",
            })
            slugs.value = res?.data || []
            isLoaded.value = true
        } catch {
            slugs.value = []
            isLoaded.value = true
        }
    }

    /** Returns true if the current user's role has the given permission slug. */
    function can(slug: string): boolean {
        return slugs.value.includes(slug)
    }

    return {can, loadPermissions, isLoaded}
}
