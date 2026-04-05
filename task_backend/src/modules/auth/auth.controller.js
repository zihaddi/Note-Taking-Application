"use strict"

const ApiResponse = require("../../traits/ApiResponse")
const authService = require("./auth.service")

/**
 * AuthController — handles /api/auth/* routes.
 */
class AuthController {
    async register(req, res) {
        try {
            const {name, email, password, role, interests} = req.body
            const result = await authService.register({
                name,
                email,
                password,
                role,
                interests,
            })
            return ApiResponse.success(
                res,
                "Registration successful",
                result,
                201,
            )
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async login(req, res) {
        try {
            const {email, password} = req.body
            const result = await authService.login({email, password})
            return ApiResponse.success(res, "Login successful", result)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async adminLogin(req, res) {
        try {
            const {email, password} = req.body
            const result = await authService.adminLogin({email, password})
            return ApiResponse.success(res, "Admin login successful", result)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async profile(req, res) {
        try {
            const user = await authService.getProfile(req.user.id)
            return ApiResponse.success(
                res,
                "Profile retrieved successfully",
                user,
            )
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async myPermissions(req, res) {
        try {
            const Role = require("../role/role.model")
            const role = await Role.findOne({slug: req.user.role})
                .populate("permissions", "slug")
                .lean()
            const slugs = role ? role.permissions.map((p) => p.slug) : []
            return ApiResponse.success(res, "Permissions retrieved", slugs)
        } catch (err) {
            return ApiResponse.error(res, err.message, null, 500)
        }
    }

    async logout(req, res) {
        return ApiResponse.success(res, "Logged out successfully")
    }
}

module.exports = new AuthController()
