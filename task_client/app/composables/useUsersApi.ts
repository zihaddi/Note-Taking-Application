import {$fetchApi} from "~/utils/$fetch"
import type {
    PaginatedResponse,
    UserListItem,
    CreateUserData,
    UpdateUserData,
    ApiResponse,
    InterestGroup,
    UserWithPosts,
} from "~/types"

const BASE = "/api/admin/users"

/**
 * useUsersApi — admin user management operations.
 */
export const useUsersApi = () => {
    /**
     * GET /api/admin/users
     */
    async function getUsers(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<UserListItem>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    /**
     * GET /api/admin/users/:id
     */
    async function getUser(id: string): Promise<ApiResponse<UserListItem>> {
        return $fetchApi(`${BASE}/${id}`, {method: "GET"})
    }

    /**
     * POST /api/admin/users
     */
    async function createUser(
        data: CreateUserData,
    ): Promise<ApiResponse<UserListItem>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    /**
     * PUT /api/admin/users/:id
     */
    async function updateUser(
        id: string,
        data: UpdateUserData,
    ): Promise<ApiResponse<UserListItem>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    /**
     * DELETE /api/admin/users/:id
     */
    async function deleteUser(id: string): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/${id}`, {method: "DELETE"})
    }

    /**
     * GET /api/admin/users/interests — aggregation: group by interests
     */
    async function getUsersGroupedByInterests(): Promise<
        ApiResponse<InterestGroup[]>
    > {
        return $fetchApi(`${BASE}/interests`, {method: "GET"})
    }

    /**
     * GET /api/admin/users/:id/posts — aggregation: user posts via $lookup
     */
    async function getUserWithPosts(
        id: string,
    ): Promise<ApiResponse<UserWithPosts>> {
        return $fetchApi(`${BASE}/${id}/posts`, {method: "GET"})
    }

    /**
     * GET /api/user/profile
     */
    async function getMyProfile(): Promise<ApiResponse<UserListItem>> {
        return $fetchApi("/api/user/profile", {method: "GET"})
    }

    /**
     * PUT /api/user/profile
     */
    async function updateMyProfile(
        data: Partial<UpdateUserData>,
    ): Promise<ApiResponse<UserListItem>> {
        return $fetchApi("/api/user/profile", {method: "PUT", body: data})
    }

    return {
        getUsers,
        getUser,
        createUser,
        updateUser,
        deleteUser,
        getUsersGroupedByInterests,
        getUserWithPosts,
        getMyProfile,
        updateMyProfile,
    }
}
