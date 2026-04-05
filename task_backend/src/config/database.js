"use strict"

const mongoose = require("mongoose")

/**
 * Connect to MongoDB
 */
async function connectDB() {
    const uri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/task_notes_db"

    try {
        await mongoose.connect(uri)
        console.log(`[Database] Connected to MongoDB: ${uri}`)
    } catch (error) {
        console.error("[Database] Connection failed:", error.message)
        process.exit(1)
    }

    mongoose.connection.on("error", (err) => {
        console.error("[Database] MongoDB error:", err)
    })

    mongoose.connection.on("disconnected", () => {
        console.warn("[Database] MongoDB disconnected")
    })
}

module.exports = {connectDB}
