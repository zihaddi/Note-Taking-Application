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
    async function getUsers(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<UserListItem>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    async function getUser(id: string): Promise<ApiResponse<UserListItem>> {
        return $fetchApi(`${BASE}/${id}`, {method: "GET"})
    }

    async function createUser(
        data: CreateUserData,
    ): Promise<ApiResponse<UserListItem>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    async function updateUser(
        id: string,
        data: UpdateUserData,
    ): Promise<ApiResponse<UserListItem>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    async function deleteUser(id: string): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/${id}`, {method: "DELETE"})
    }

    async function getUsersGroupedByInterests(): Promise<
        ApiResponse<InterestGroup[]>
    > {
        return $fetchApi(`${BASE}/interests`, {method: "GET"})
    }

    async function getUserWithPosts(
        id: string,
    ): Promise<ApiResponse<UserWithPosts>> {
        return $fetchApi(`${BASE}/${id}/posts`, {method: "GET"})
    }

    async function getMyProfile(): Promise<ApiResponse<UserListItem>> {
        return $fetchApi("/api/user/profile", {method: "GET"})
    }

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
