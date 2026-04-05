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

module.exports = {authorize, requireAdmin, requireUser}
