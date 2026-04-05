"use strict"

const ApiResponse = require("../../traits/ApiResponse")
const noteService = require("./note.service")

/**
 * NoteController — handles user and admin note operations.
 */
class NoteController {
    // ── User operations ────────────────────────────────────────────────────

    /**
     * GET /api/user/notes
     * List authenticated user's own notes (paginated).
     */
    async index(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1)
            const perPage = Math.min(
                100,
                Math.max(1, parseInt(req.query.per_page) || 15),
            )
            const filters = {
                search: req.query.search || "",
                tags: req.query.tags || "",
            }

            const paginator = await noteService.getUserNotes(
                req.user.id,
                filters,
                page,
                perPage,
            )

            const permissions = {
                view: true,
                add: true,
                edit: true,
                delete: true,
            }
            return ApiResponse.paginated(
                res,
                "Notes retrieved successfully",
                paginator,
                permissions,
            )
        } catch (err) {
            noteService.handleError(err, "NoteController.index")
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    /**
     * GET /api/user/notes/:id
     * Get a specific note owned by the authenticated user.
     */
    async show(req, res) {
        try {
            const note = await noteService.getUserNote(
                req.params.id,
                req.user.id,
            )
            return ApiResponse.success(res, "Note retrieved successfully", note)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    /**
     * POST /api/user/notes
     * Create a new note.
     */
    async store(req, res) {
        try {
            const {title, content, tags, is_pinned} = req.body
            const note = await noteService.createNote(req.user.id, {
                title,
                content,
                tags,
                is_pinned,
            })
            return ApiResponse.success(
                res,
                "Note created successfully",
                note,
                201,
            )
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    /**
     * PUT /api/user/notes/:id
     * Update an existing note (owner only).
     */
    async update(req, res) {
        try {
            const {title, content, tags, is_pinned} = req.body
            const note = await noteService.updateNote(
                req.params.id,
                req.user.id,
                {title, content, tags, is_pinned},
            )
            return ApiResponse.success(res, "Note updated successfully", note)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    /**
     * DELETE /api/user/notes/:id
     * Delete a note (owner only).
     */
    async destroy(req, res) {
        try {
            await noteService.deleteNote(req.params.id, req.user.id)
            return ApiResponse.success(res, "Note deleted successfully")
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    // ── Admin operations ───────────────────────────────────────────────────

    /**
     * GET /api/admin/notes
     * List all notes across all users (admin view, paginated).
     */
    async adminIndex(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1)
            const perPage = Math.min(
                100,
                Math.max(1, parseInt(req.query.per_page) || 15),
            )
            const filters = {
                search: req.query.search || "",
                userId: req.query.userId || "",
            }

            const paginator = await noteService.getAllNotes(
                filters,
                page,
                perPage,
            )
            const permissions = {
                view: true,
                add: false,
                edit: false,
                delete: false,
            }
            return ApiResponse.paginated(
                res,
                "All notes retrieved successfully",
                paginator,
                permissions,
            )
        } catch (err) {
            noteService.handleError(err, "NoteController.adminIndex")
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }
}

module.exports = new NoteController()
