"use strict"

const BaseRepository = require("../../repositories/BaseRepository")
const Note = require("./note.model")

/**
 * NoteRepository — extends BaseRepository for the Note model.
 */
class NoteRepository extends BaseRepository {
    constructor() {
        super(Note)
    }

    /**
     * Paginate notes for a specific user.
     */
    async getUserNotesPaginated(userId, filters = {}, page = 1, limit = 15) {
        const query = {userId}

        if (filters.search) {
            query.$or = [
                {title: {$regex: filters.search, $options: "i"}},
                {content: {$regex: filters.search, $options: "i"}},
            ]
        }

        if (filters.tags) {
            query.tags = {
                $in: Array.isArray(filters.tags)
                    ? filters.tags
                    : [filters.tags],
            }
        }

        const sort = {createdAt: -1}

        const [docs, totalDocs] = await Promise.all([
            Note.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Note.countDocuments(query),
        ])

        return {
            docs,
            totalDocs,
            page,
            limit,
            totalPages: Math.ceil(totalDocs / limit),
        }
    }

    /**
     * Paginate all notes (admin view).
     */
    async getAllNotesPaginated(filters = {}, page = 1, limit = 15) {
        const query = {}

        if (filters.search) {
            query.$or = [
                {title: {$regex: filters.search, $options: "i"}},
                {content: {$regex: filters.search, $options: "i"}},
            ]
        }

        if (filters.userId) query.userId = filters.userId

        const sort = {createdAt: -1}

        const [docs, totalDocs] = await Promise.all([
            Note.find(query)
                .populate("userId", "name email")
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Note.countDocuments(query),
        ])

        return {
            docs,
            totalDocs,
            page,
            limit,
            totalPages: Math.ceil(totalDocs / limit),
        }
    }

    /**
     * Find a note that belongs to a specific user.
     */
    async findUserNote(noteId, userId) {
        return Note.findOne({_id: noteId, userId}).lean()
    }
}

module.exports = new NoteRepository()
