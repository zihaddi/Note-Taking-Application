"use strict"

const BaseService = require("../../services/BaseService")
const noteRepository = require("./note.repository")

/**
 * NoteService — business logic for note management.
 */
class NoteService extends BaseService {
    constructor() {
        super(noteRepository)
    }

    getSearchableFields() {
        return ["title", "content"]
    }

    /**
     * List notes owned by a user.
     */
    async getUserNotes(userId, filters = {}, page = 1, perPage = 15) {
        return noteRepository.getUserNotesPaginated(
            userId,
            filters,
            page,
            perPage,
        )
    }

    /**
     * List all notes (admin view).
     */
    async getAllNotes(filters = {}, page = 1, perPage = 15) {
        return noteRepository.getAllNotesPaginated(filters, page, perPage)
    }

    /**
     * Get a specific note owned by a user (throws 403 if not the owner).
     */
    async getUserNote(noteId, userId) {
        const note = await noteRepository.findUserNote(noteId, userId)
        if (!note) {
            const err = new Error("Note not found or access denied")
            err.statusCode = 404
            throw err
        }
        return note
    }

    /**
     * Create a new note for a user.
     */
    async createNote(userId, data) {
        return noteRepository.create({...data, userId})
    }

    /**
     * Update a note — only by its owner.
     */
    async updateNote(noteId, userId, data) {
        const note = await noteRepository.findUserNote(noteId, userId)
        if (!note) {
            const err = new Error("Note not found or access denied")
            err.statusCode = 404
            throw err
        }
        return noteRepository.update(noteId, data)
    }

    /**
     * Delete a note — only by its owner.
     */
    async deleteNote(noteId, userId) {
        const note = await noteRepository.findUserNote(noteId, userId)
        if (!note) {
            const err = new Error("Note not found or access denied")
            err.statusCode = 404
            throw err
        }
        return noteRepository.delete(noteId)
    }
}

module.exports = new NoteService()
