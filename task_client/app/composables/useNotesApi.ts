import {$fetchApi} from "~/utils/$fetch"
import type {
    PaginatedResponse,
    Note,
    CreateNoteData,
    UpdateNoteData,
    ApiResponse,
} from "~/types"

const BASE = "/api/user/notes"
const ADMIN_BASE = "/api/admin/notes"

/**
 * useNotesApi — note CRUD operations.
 */
export const useNotesApi = () => {
    async function getUserNotes(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Note>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    async function getNote(id: string): Promise<ApiResponse<Note>> {
        return $fetchApi(`${BASE}/${id}`, {method: "GET"})
    }

    async function createNote(
        data: CreateNoteData,
    ): Promise<ApiResponse<Note>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    async function updateNote(
        id: string,
        data: UpdateNoteData,
    ): Promise<ApiResponse<Note>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    async function deleteNote(id: string): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/${id}`, {method: "DELETE"})
    }

    async function adminGetAllNotes(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Note>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${ADMIN_BASE}${query ? "?" + query : ""}`, {
            method: "GET",
        })
    }

    return {
        getUserNotes,
        getNote,
        createNote,
        updateNote,
        deleteNote,
        adminGetAllNotes,
    }
}
