"use strict"

const mongoose = require("mongoose")

const menuItemSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: [true, "Menu label is required"],
            trim: true,
        },
        path: {
            type: String,
            required: [true, "Menu path is required"],
            trim: true,
        },
        icon: {
            type: String,
            default: "lucide:circle",
        },
        roles: [
            {
                type: String,
                comment:
                    "Role slugs that can see this menu item (e.g. 'admin', 'user'). Empty = all roles.",
            },
        ],
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            default: null,
        },
        section: {
            type: String,
            default: "main",
            comment: "Logical section grouping (e.g. main, admin)",
        },
    },
    {
        timestamps: true,
    },
)

menuItemSchema.index({order: 1})
menuItemSchema.index({section: 1, order: 1})

module.exports = mongoose.model("MenuItem", menuItemSchema)
