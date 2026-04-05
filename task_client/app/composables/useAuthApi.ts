import {$fetchApi} from "~/utils/$fetch"
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    ApiResponse,
    AuthUser,
} from "~/types"

/**
 * useAuthApi — all authentication API calls.
 * Mirrors the useAuthApi composable from the main boilerplate.
 */
export const useAuthApi = () => {
    /**
     * POST /api/auth/register
     */
    async function register(
        data: RegisterData,
    ): Promise<ApiResponse<AuthResponse>> {
        return $fetchApi("/api/auth/register", {method: "POST", body: data})
    }

    /**
     * POST /api/auth/login
     */
    async function login(
        credentials: LoginCredentials,
    ): Promise<ApiResponse<AuthResponse>> {
        return $fetchApi("/api/auth/login", {method: "POST", body: credentials})
    }

    /**
     * POST /api/auth/admin/login
     */
    async function adminLogin(
        credentials: LoginCredentials,
    ): Promise<ApiResponse<AuthResponse>> {
        return $fetchApi("/api/auth/admin/login", {
            method: "POST",
            body: credentials,
        })
    }

    /**
     * GET /api/auth/profile
     */
    async function getProfile(): Promise<ApiResponse<AuthUser>> {
        return $fetchApi("/api/auth/profile", {method: "GET"})
    }

    /**
     * POST /api/auth/logout
     */
    async function logout(): Promise<ApiResponse<null>> {
        return $fetchApi("/api/auth/logout", {method: "POST"})
    }

    return {register, login, adminLogin, getProfile, logout}
}
