"use strict"

const mongoose = require("mongoose")

/**
 * Note Model
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

// ── Indexes
noteSchema.index({userId: 1})

// Compound { userId, _id }
noteSchema.index({userId: 1, _id: 1})

const Note = mongoose.model("Note", noteSchema)

module.exports = Note
