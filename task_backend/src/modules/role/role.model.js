"use strict"

const mongoose = require("mongoose")

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Role name is required"],
            trim: true,
            maxlength: [100, "Role name cannot exceed 100 characters"],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: null,
        },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Permission",
            },
        ],
        isDefault: {
            type: Boolean,
            default: false,
        },
        isSystem: {
            type: Boolean,
            default: false,
            comment: "System roles (admin, user) cannot be deleted",
        },
    },
    {
        timestamps: true,
    },
)

// Auto-generate slug from name before saving
roleSchema.pre("save", function (next) {
    if (this.isModified("name") && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
    }
    next()
})

module.exports = mongoose.model("Role", roleSchema)
