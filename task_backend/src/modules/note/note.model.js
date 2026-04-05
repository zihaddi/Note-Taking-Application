"use strict"

const mongoose = require("mongoose")

/**
 * Note Model
 *
 * Indexes (using schema.index so they are visible during review):
 *  - userId: supports user listing their own notes (GET /user/notes)
 *  - { userId, _id }: composite — efficient for user fetching a specific note
 */
const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Content is required"],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        is_pinned: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
)

// ── Indexes ────────────────────────────────────────────────────────────────
// userId — supports listing a user's own notes (filtered by userId)
noteSchema.index({userId: 1})

// Compound { userId, _id } — supports efficient single-note lookups for a user
noteSchema.index({userId: 1, _id: 1})

const Note = mongoose.model("Note", noteSchema)

module.exports = Note
