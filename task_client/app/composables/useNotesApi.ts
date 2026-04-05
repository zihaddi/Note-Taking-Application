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
    /**
     * GET /api/user/notes
     */
    async function getUserNotes(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Note>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    /**
     * GET /api/user/notes/:id
     */
    async function getNote(id: string): Promise<ApiResponse<Note>> {
        return $fetchApi(`${BASE}/${id}`, {method: "GET"})
    }

    /**
     * POST /api/user/notes
     */
    async function createNote(
        data: CreateNoteData,
    ): Promise<ApiResponse<Note>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    /**
     * PUT /api/user/notes/:id
     */
    async function updateNote(
        id: string,
        data: UpdateNoteData,
    ): Promise<ApiResponse<Note>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    /**
     * DELETE /api/user/notes/:id
     */
    async function deleteNote(id: string): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/${id}`, {method: "DELETE"})
    }

    /**
     * GET /api/admin/notes — admin view of all notes
     */
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
