"use strict"

require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const {connectDB} = require("../config/database")
const User = require("../modules/user/user.model")
const Note = require("../modules/note/note.model")
const Post = require("../modules/post/post.model")

async function seed() {
    await connectDB()

    // Clear collections
    await User.deleteMany({})
    await Note.deleteMany({})
    await Post.deleteMany({})

    console.log("[Seeder] Cleared existing data")

    const adminPassword = await bcrypt.hash("Admin@123", 12)
    const userPassword = await bcrypt.hash("User@123", 12)

    // Create admin user
    const admin = await User.create({
        name: "Super Admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin",
        status: "active",
        interests: ["management", "technology"],
        bio: "Platform administrator",
    })

    // Create sample users
    const user1 = await User.create({
        name: "Alice Johnson",
        email: "alice@example.com",
        password: userPassword,
        role: "user",
        status: "active",
        interests: ["chess", "reading", "technology"],
        bio: "Avid reader and chess enthusiast",
    })

    const user2 = await User.create({
        name: "Bob Smith",
        email: "bob@example.com",
        password: userPassword,
        role: "user",
        status: "active",
        interests: ["chess", "music", "cooking"],
        bio: "Chess player and music lover",
    })

    const user3 = await User.create({
        name: "Carol White",
        email: "carol@example.com",
        password: userPassword,
        role: "user",
        status: "active",
        interests: ["reading", "technology", "fitness"],
        bio: "Tech enthusiast and reader",
    })

    console.log("[Seeder] Created users")

    // Create notes for user1
    await Note.insertMany([
        {
            title: "My First Note",
            content: "This is my first note content.",
            userId: user1._id,
            tags: ["personal"],
        },
        {
            title: "Shopping List",
            content: "Milk, eggs, bread, coffee.",
            userId: user1._id,
            tags: ["list", "personal"],
            is_pinned: true,
        },
        {
            title: "Work Tasks",
            content: "Complete project report, review code PR.",
            userId: user1._id,
            tags: ["work"],
        },
    ])

    // Create notes for user2
    await Note.insertMany([
        {
            title: "Chess Opening Ideas",
            content: "Sicilian Defence, Ruy Lopez variations.",
            userId: user2._id,
            tags: ["chess"],
        },
        {
            title: "Recipes to Try",
            content: "Pasta carbonara, beef stew, lemon tart.",
            userId: user2._id,
            tags: ["cooking"],
        },
    ])

    // Create notes for user3
    await Note.insertMany([
        {
            title: "Reading List 2026",
            content: "Clean Code, DDIA, JavaScript: The Good Parts.",
            userId: user3._id,
            tags: ["books", "reading"],
        },
    ])

    console.log("[Seeder] Created notes")

    // Create posts (visible to everyone)
    await Post.insertMany([
        {
            title: "Introduction to MongoDB",
            content: "MongoDB is a NoSQL document database...",
            userId: user1._id,
            is_published: true,
            tags: ["tech", "database"],
        },
        {
            title: "Chess Openings for Beginners",
            content: "Starting with e4 or d4 is most common...",
            userId: user2._id,
            is_published: true,
            tags: ["chess"],
        },
        {
            title: "My Reading Journey",
            content: "This year I aim to read 24 books...",
            userId: user3._id,
            is_published: true,
            tags: ["reading", "personal"],
        },
        {
            title: "Getting Better at Chess",
            content: "Practice tactics daily and study endgames...",
            userId: user2._id,
            is_published: true,
            tags: ["chess"],
        },
        {
            title: "Building APIs with Node.js",
            content:
                "Express.js paired with Mongoose makes API development fast...",
            userId: user1._id,
            is_published: true,
            tags: ["tech", "nodejs"],
        },
    ])

    console.log("[Seeder] Created posts")
    console.log("\n[Seeder] ✓ Seeding complete!\n")
    console.log("Admin:  admin@example.com  /  Admin@123")
    console.log("Users:  alice@example.com  /  User@123")
    console.log("        bob@example.com    /  User@123")
    console.log("        carol@example.com  /  User@123")

    await mongoose.disconnect()
}

seed().catch((err) => {
    console.error("[Seeder] Error:", err)
    mongoose.disconnect()
    process.exit(1)
})
