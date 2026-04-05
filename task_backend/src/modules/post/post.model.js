"use strict"

const mongoose = require("mongoose")

/**
 * Post Model
 * Posts are stored in a SEPARATE collection (different from Users).
 * This enables the $lookup aggregation (Scenario 2).
 *
 * Indexes (using schema.index so they are visible during review):
 *  - userId: supports listing a user's posts and the $lookup aggregation
 *  - _id is automatically indexed by MongoDB
 */
const postSchema = new mongoose.Schema(
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
        is_published: {
            type: Boolean,
            default: true,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    },
)

// ── Indexes ────────────────────────────────────────────────────────────────
// userId — supports GET /user/posts (list user's own posts) and $lookup pipeline
postSchema.index({userId: 1})

const Post = mongoose.model("Post", postSchema)

module.exports = Post
