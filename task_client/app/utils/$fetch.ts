import {$fetch, FetchError} from "ofetch"

export const TOKEN_KEY = "app_token"
const AUTH_HEADER = "Authorization"

interface ResponseMap {
    blob: Blob
    text: string
    arrayBuffer: ArrayBuffer
}
type ResponseType = keyof ResponseMap | "json"

/**
 * $fetchApi — wrapper around ofetch that attaches the JWT Bearer token.
 * Mirrors the $fetchAdmin / $fetchUser pattern from the main boilerplate.
 *
 * @param path    - URL path (relative to API_BASE_URL)
 * @param options - fetch options (method, body, headers, etc.)
 */
export async function $fetchApi<T, R extends ResponseType = "json">(
    path: RequestInfo,
    {...options}: Record<string, any> = {},
) {
    const {API_BASE_URL} = useRuntimeConfig().public
    let token = useCookie(TOKEN_KEY).value

    // On the client, always read from document.cookie to avoid SSR cookie mismatch
    if (import.meta.client) {
        token = getCookie(TOKEN_KEY) ?? token
    }

    let headers: Record<string, string> = {
        accept: "application/json",
        ...options?.headers,
        ...(token && {[AUTH_HEADER]: `Bearer ${token}`}),
    }

    if (import.meta.server) {
        const url = useRequestURL()
        headers = {
            ...headers,
            ...useRequestHeaders(["cookie"]),
            referer: url.hostname,
        }
    }

    try {
        return await $fetch<T, R>(path as string, {
            baseURL: API_BASE_URL,
            ...options,
            headers,
        })
    } catch (error) {
        if (!(error instanceof FetchError)) throw error

        const status = error.response?.status ?? -1

        if (import.meta.client) {
            console.error("[API Error]", {
                path,
                status,
                message: error.message,
                data: error.data,
            })
        }

        if (status === 401 && import.meta.client) {
            // Clear token and redirect to login
            useCookie(TOKEN_KEY).value = null
            const user = useState<any>("auth_user")
            user.value = null
            window.location.href = "/login"
            return
        }

        throw error
    }
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(
        new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"),
    )
    return match && match[3] ? decodeURIComponent(match[3]) : null
}
