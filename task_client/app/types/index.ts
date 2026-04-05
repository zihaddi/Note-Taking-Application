/**
 * Type Definitions for NoteApp Task Client
 */

// ── Base API Response Types ─────────────────────────────────────────────────

export interface ApiResponse<T = any> {
    status: "success" | "error"
    message: string
    data?: T
    errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
    status: "success" | "error"
    message: string
    data: {
        data: T[]
        links: {
            first: string | null
            last: string | null
            prev: string | null
            next: string | null
        }
        meta: {
            current_page: number
            from: number
            last_page: number
            per_page: number
            to: number
            total: number
        }
        permissions?: Record<string, boolean>
    }
}

// ── Auth Types ──────────────────────────────────────────────────────────────

export interface AuthUser {
    _id: string
    id?: string
    name: string
    email: string
    role: "user" | "admin"
    status: "active" | "inactive" | "suspended"
    phone: string | null
    bio: string | null
    avatar: string | null
    interests: string[]
    createdAt: string
    updatedAt: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    password: string
    role?: "user" | "admin"
    interests?: string[]
}

export interface AuthResponse {
    user: AuthUser
    token: string
}

// ── Note Types ──────────────────────────────────────────────────────────────

export interface Note {
    _id: string
    title: string
    content: string
    userId: string
    tags: string[]
    is_pinned: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateNoteData {
    title: string
    content: string
    tags?: string[]
    is_pinned?: boolean
}

export interface UpdateNoteData {
    title?: string
    content?: string
    tags?: string[]
    is_pinned?: boolean
}

// ── Post Types ──────────────────────────────────────────────────────────────

export interface Post {
    _id: string
    title: string
    content: string
    userId: string | AuthUser
    tags: string[]
    is_published: boolean
    createdAt: string
    updatedAt: string
}

export interface CreatePostData {
    title: string
    content: string
    tags?: string[]
    is_published?: boolean
}

// ── User Types (Admin) ──────────────────────────────────────────────────────

export interface UserListItem extends AuthUser {
    notesCount?: number
}

export interface CreateUserData {
    name: string
    email: string
    password: string
    role?: "user" | "admin"
    phone?: string
    bio?: string
    interests?: string[]
}

export interface UpdateUserData {
    name?: string
    email?: string
    password?: string
    role?: "user" | "admin"
    status?: "active" | "inactive" | "suspended"
    phone?: string
    bio?: string
    interests?: string[]
}

// ── Aggregation Types ───────────────────────────────────────────────────────

export interface InterestGroup {
    interest: string
    count: number
    users: Array<{id: string; name: string; email: string}>
}

export interface UserWithPosts {
    _id: string
    name: string
    email: string
    posts: Post[]
}
