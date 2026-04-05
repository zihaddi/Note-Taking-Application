"use strict"

require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const {connectDB} = require("../config/database")
const User = require("../modules/user/user.model")
const Note = require("../modules/note/note.model")
const Post = require("../modules/post/post.model")
const Permission = require("../modules/permission/permission.model")
const Role = require("../modules/role/role.model")
const MenuItem = require("../modules/menu/menu.model")

async function seed() {
    await connectDB()

    // Clear collections
    await User.deleteMany({})
    await Note.deleteMany({})
    await Post.deleteMany({})
    await Permission.deleteMany({})
    await Role.deleteMany({})
    await MenuItem.deleteMany({})

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

    // ── RBAC: Permissions ────────────────────────────────────────────────────
    const permissionDefs = [
        // User management
        { name: "View Users",       slug: "users.view",       module: "users",       action: "view"   },
        { name: "Create Users",     slug: "users.create",     module: "users",       action: "create" },
        { name: "Update Users",     slug: "users.update",     module: "users",       action: "update" },
        { name: "Delete Users",     slug: "users.delete",     module: "users",       action: "delete" },
        // Notes
        { name: "View Notes",       slug: "notes.view",       module: "notes",       action: "view"   },
        { name: "Create Notes",     slug: "notes.create",     module: "notes",       action: "create" },
        { name: "Update Notes",     slug: "notes.update",     module: "notes",       action: "update" },
        { name: "Delete Notes",     slug: "notes.delete",     module: "notes",       action: "delete" },
        // Posts
        { name: "View Posts",       slug: "posts.view",       module: "posts",       action: "view"   },
        { name: "Create Posts",     slug: "posts.create",     module: "posts",       action: "create" },
        { name: "Update Posts",     slug: "posts.update",     module: "posts",       action: "update" },
        { name: "Delete Posts",     slug: "posts.delete",     module: "posts",       action: "delete" },
        // Role management
        { name: "Manage Roles",     slug: "roles.manage",     module: "roles",       action: "manage" },
        // Permission management
        { name: "Manage Permissions", slug: "permissions.manage", module: "permissions", action: "manage" },
        // Menu management
        { name: "Manage Menus",     slug: "menus.manage",     module: "menus",       action: "manage" },
    ]

    const createdPermissions = await Permission.insertMany(permissionDefs)
    const permMap = {}
    createdPermissions.forEach((p) => { permMap[p.slug] = p._id })

    console.log("[Seeder] Created permissions")

    // ── RBAC: Roles ──────────────────────────────────────────────────────────
    const adminRole = await Role.create({
        name: "Admin",
        slug: "admin",
        description: "Full system access",
        permissions: createdPermissions.map((p) => p._id),
        isSystem: true,
    })

    const userRole = await Role.create({
        name: "User",
        slug: "user",
        description: "Standard authenticated user",
        permissions: [
            permMap["notes.view"],
            permMap["notes.create"],
            permMap["notes.update"],
            permMap["notes.delete"],
            permMap["posts.view"],
            permMap["posts.create"],
            permMap["posts.update"],
            permMap["posts.delete"],
        ],
        isDefault: true,
        isSystem: true,
    })

    console.log("[Seeder] Created roles")

    // ── RBAC: Menu Items ─────────────────────────────────────────────────────
    await MenuItem.insertMany([
        // Admin section
        { label: "Dashboard",        path: "/admin-panel",             icon: "lucide:layout-dashboard", roles: ["admin"], order: 1,  section: "admin" },
        { label: "Users",            path: "/admin-panel/users",       icon: "lucide:users",            roles: ["admin"], order: 2,  section: "admin" },
        { label: "Posts",            path: "/admin-panel/posts",       icon: "lucide:file-text",        roles: ["admin"], order: 3,  section: "admin" },
        { label: "Notes",            path: "/admin-panel/notes",       icon: "lucide:notebook",         roles: ["admin"], order: 4,  section: "admin" },
        { label: "Roles",            path: "/admin-panel/roles",       icon: "lucide:shield",           roles: ["admin"], order: 5,  section: "admin" },
        { label: "Permissions",      path: "/admin-panel/permissions", icon: "lucide:key",              roles: ["admin"], order: 6,  section: "admin" },
        { label: "Menu Manager",     path: "/admin-panel/menus",       icon: "lucide:menu",             roles: ["admin"], order: 7,  section: "admin" },
        // User section
        { label: "Dashboard",        path: "/user-panel",              icon: "lucide:layout-dashboard", roles: ["user"],  order: 1,  section: "user" },
        { label: "My Posts",         path: "/user-panel/posts",        icon: "lucide:file-text",        roles: ["user"],  order: 2,  section: "user" },
        { label: "My Notes",         path: "/user-panel/notes",        icon: "lucide:notebook",         roles: ["user"],  order: 3,  section: "user" },
        { label: "Profile",          path: "/user-panel/profile",      icon: "lucide:user",             roles: ["user"],  order: 4,  section: "user" },
    ])

    console.log("[Seeder] Created menu items")
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
