"use strict"

const mongoose = require("mongoose")

/**
 * Permission Model
 *
 * Represents a single granular action in the system.
 * Example: { module: 'users', action: 'delete', slug: 'users.delete' }
 */
const permissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug is required"],
            lowercase: true,
            trim: true,
            unique: true,
            // e.g. 'users.create', 'notes.view', 'posts.delete'
        },
        module: {
            type: String,
            required: [true, "Module is required"],
            trim: true,
            lowercase: true,
        },
        action: {
            type: String,
            required: [true, "Action is required"],
            trim: true,
            lowercase: true,
            enum: ["view", "create", "update", "delete", "manage"],
        },
        description: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    },
)

permissionSchema.index({module: 1, action: 1})

const Permission = mongoose.model("Permission", permissionSchema)

module.exports = Permission
