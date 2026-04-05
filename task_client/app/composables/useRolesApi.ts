import {$fetchApi} from "~/utils/$fetch"
import type {
    ApiResponse,
    PaginatedResponse,
    Role,
    CreateRoleData,
    UpdateRoleData,
} from "~/types"

const BASE = "/api/admin/roles"

export const useRolesApi = () => {
    async function getRoles(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Role>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    async function getAllRoles(): Promise<ApiResponse<Role[]>> {
        return $fetchApi(`${BASE}/all`, {method: "GET"})
    }

    async function getRole(id: string): Promise<ApiResponse<Role>> {
        return $fetchApi(`${BASE}/${id}`, {method: "GET"})
    }

    async function createRole(
        data: CreateRoleData,
    ): Promise<ApiResponse<Role>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    async function updateRole(
        id: string,
        data: UpdateRoleData,
    ): Promise<ApiResponse<Role>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    async function deleteRole(id: string): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/${id}`, {method: "DELETE"})
    }

    return {
        getRoles,
        getAllRoles,
        getRole,
        createRole,
        updateRole,
        deleteRole,
    }
}
