"use strict"

const ApiResponse = require("../traits/ApiResponse")

/**
 * authorize — role-based access control middleware.
 * Must be used AFTER authenticate middleware.
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return ApiResponse.unauthorized(res, "Authentication required")
        }

        if (!roles.includes(req.user.role)) {
            return ApiResponse.forbidden(res, "Insufficient permissions")
        }

        next()
    }
}

/**
 * requireAdmin — shorthand that only allows the admin role.
 */
const requireAdmin = authorize("admin")

/**
 * requireUser — shorthand that allows both user and admin roles.
 */
const requireUser = authorize("user", "admin")

/**
 * requirePermission — check that the user's role has a specific permission slug.
 */
function requirePermission(permissionSlug) {
    return async (req, res, next) => {
        if (!req.user) {
            return ApiResponse.unauthorized(res, "Authentication required")
        }

        try {
            const Role = require("../modules/role/role.model")
            const role = await Role.findOne({ slug: req.user.role })
                .populate("permissions", "slug")
                .lean()

            if (!role) {
                return ApiResponse.forbidden(res, "Role not found")
            }

            const hasPerm = role.permissions.some((p) => p.slug === permissionSlug)
            if (!hasPerm) {
                return ApiResponse.forbidden(res, `Missing permission: ${permissionSlug}`)
            }

            next()
        } catch (err) {
            return ApiResponse.error(res, "Permission check failed", null, 500)
        }
    }
}

module.exports = { authorize, requireAdmin, requireUser, requirePermission }
