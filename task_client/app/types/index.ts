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

// ── RBAC Types ──────────────────────────────────────────────────────────────

export type PermissionAction =
    | "view"
    | "create"
    | "update"
    | "delete"
    | "manage"

export interface Permission {
    _id: string
    name: string
    slug: string
    module: string
    action: PermissionAction
    description: string | null
    createdAt: string
    updatedAt: string
}

export interface PermissionGroup {
    _id: string // module name
    permissions: Permission[]
}

export interface CreatePermissionData {
    name: string
    module: string
    action: PermissionAction
    slug?: string
    description?: string
}

export interface UpdatePermissionData {
    name?: string
    module?: string
    action?: PermissionAction
    description?: string
}

export interface Role {
    _id: string
    name: string
    slug: string
    description: string | null
    permissions: Permission[]
    isDefault: boolean
    isSystem: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateRoleData {
    name: string
    slug?: string
    description?: string
    permissions?: string[] // permission IDs
    isDefault?: boolean
}

export interface UpdateRoleData {
    name?: string
    description?: string
    permissions?: string[] // permission IDs
    isDefault?: boolean
}

export interface MenuItem {
    _id: string
    label: string
    path: string
    icon: string
    roles: string[]
    order: number
    isActive: boolean
    parent: string | null
    section: string
    createdAt: string
    updatedAt: string
}

export interface CreateMenuItemData {
    label: string
    path: string
    icon?: string
    roles?: string[]
    order?: number
    isActive?: boolean
    parent?: string | null
    section?: string
}

export interface UpdateMenuItemData {
    label?: string
    path?: string
    icon?: string
    roles?: string[]
    order?: number
    isActive?: boolean
    parent?: string | null
    section?: string
}
