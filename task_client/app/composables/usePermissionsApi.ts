import {$fetchApi} from "~/utils/$fetch"
import type {
    ApiResponse,
    PaginatedResponse,
    Permission,
    PermissionGroup,
    CreatePermissionData,
    UpdatePermissionData,
} from "~/types"

const BASE = "/api/admin/permissions"

export const usePermissionsApi = () => {
    async function getPermissions(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Permission>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    async function getPermissionsGrouped(): Promise<
        ApiResponse<PermissionGroup[]>
    > {
        return $fetchApi(`${BASE}/grouped`, {method: "GET"})
    }

    async function getPermission(id: string): Promise<ApiResponse<Permission>> {
        return $fetchApi(`${BASE}/${id}`, {method: "GET"})
    }

    async function createPermission(
        data: CreatePermissionData,
    ): Promise<ApiResponse<Permission>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    async function updatePermission(
        id: string,
        data: UpdatePermissionData,
    ): Promise<ApiResponse<Permission>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    async function deletePermission(id: string): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/${id}`, {method: "DELETE"})
    }

    return {
        getPermissions,
        getPermissionsGrouped,
        getPermission,
        createPermission,
        updatePermission,
        deletePermission,
    }
}
