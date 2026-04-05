"use strict"

const mongoose = require("mongoose")

/**
 * User Model
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false, // never returned by default
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
        },
        phone: {type: String, default: null},
        bio: {type: String, default: null},
        avatar: {type: String, default: null},
        interests: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    },
)

// ── Indexes (required so they are visible during code review) ──────────────
// Unique email — supports login and GET /users/:id lookups
userSchema.index({email: 1}, {unique: true})

// Role — supports admin listing users filtered by role
userSchema.index({role: 1})

const User = mongoose.model("User", userSchema)

module.exports = User
