import {$fetchApi} from "~/utils/$fetch"
import type {
    ApiResponse,
    PaginatedResponse,
    MenuItem,
    CreateMenuItemData,
    UpdateMenuItemData,
} from "~/types"

const BASE = "/api/admin/menus"

export const useMenusApi = () => {
    async function getMenuItems(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<MenuItem>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    async function getMyMenus(): Promise<ApiResponse<MenuItem[]>> {
        return $fetchApi("/api/menus/my-menus", {method: "GET"})
    }

    async function getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
        return $fetchApi(`${BASE}/${id}`, {method: "GET"})
    }

    async function createMenuItem(
        data: CreateMenuItemData,
    ): Promise<ApiResponse<MenuItem>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    async function updateMenuItem(
        id: string,
        data: UpdateMenuItemData,
    ): Promise<ApiResponse<MenuItem>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    async function deleteMenuItem(id: string): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/${id}`, {method: "DELETE"})
    }

    async function reorderMenuItems(
        items: Array<{id: string; order: number}>,
    ): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/reorder`, {method: "POST", body: {items}})
    }

    return {
        getMenuItems,
        getMyMenus,
        getMenuItem,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        reorderMenuItems,
    }
}
