"use strict"

const express = require("express")
const cors = require("cors")

const authRoutes = require("./modules/auth/auth.routes")
const userRoutes = require("./modules/user/user.routes")
const noteRoutes = require("./modules/note/note.routes")
const postRoutes = require("./modules/post/post.routes")

const app = express()

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({origin: process.env.CLIENT_URL || "*"}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// ── Health check ────────────────────────────────────────────────────────────
app.get("/up", (_req, res) => res.json({status: "ok"}))

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes)
app.use("/api", userRoutes) // handles /api/admin/users, /api/profile
app.use("/api", noteRoutes) // handles /api/user/notes, /api/admin/notes
app.use("/api", postRoutes) // handles /api/posts, /api/user/posts

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({status: "error", message: "Route not found"})
})

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("[App Error]", err)
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        status: "error",
        message: err.message || "Internal server error",
    })
})

module.exports = app
