"use strict"

const ApiResponse = require("../../traits/ApiResponse")
const userService = require("./user.service")

/**
 * UserController 
 
 */
class UserController {
    async index(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1)
            const perPage = Math.min(
                100,
                Math.max(1, parseInt(req.query.per_page) || 15),
            )
            const filters = {
                search: req.query.search || "",
                role: req.query.role || "",
                status: req.query.status || "",
            }

            const paginator = await userService.listUsers(
                filters,
                page,
                perPage,
            )

            const permissions = {
                view: true,
                add: true,
                edit: true,
                delete: true,
            }
            return ApiResponse.paginated(
                res,
                "Users retrieved successfully",
                paginator,
                permissions,
            )
        } catch (err) {
            userService.handleError(err, "UserController.index")
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async show(req, res) {
        try {
            const user = await userService.getUserById(req.params.id)
            return ApiResponse.success(res, "User retrieved successfully", user)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async store(req, res) {
        try {
            const {name, email, password, role, phone, bio, interests} =
                req.body
            const user = await userService.createUser({
                name,
                email,
                password,
                role,
                phone,
                bio,
                interests,
            })
            return ApiResponse.success(
                res,
                "User created successfully",
                user,
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

    async update(req, res) {
        try {
            const {name, email, password, role, status, phone, bio, interests} =
                req.body
            const user = await userService.updateUser(req.params.id, {
                name,
                email,
                password,
                role,
                status,
                phone,
                bio,
                interests,
            })
            return ApiResponse.success(res, "User updated successfully", user)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async destroy(req, res) {
        try {
            await userService.deleteUser(req.params.id)
            return ApiResponse.success(res, "User deleted successfully")
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async groupByInterests(req, res) {
        try {
            const result = await userService.getUsersGroupedByInterests()
            return ApiResponse.success(
                res,
                "Users grouped by interests",
                result,
            )
        } catch (err) {
            userService.handleError(err, "UserController.groupByInterests")
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async getUserPosts(req, res) {
        try {
            const postService = require("../post/post.service")
            const result = await postService.getUserPostsWithLookup(
                req.params.id,
            )
            return ApiResponse.success(
                res,
                "User posts retrieved successfully",
                result,
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

    async profile(req, res) {
        try {
            const user = await userService.getUserById(req.user.id)
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

    async updateProfile(req, res) {
        try {
            const {name, phone, bio, interests} = req.body
            const user = await userService.updateUser(req.user.id, {
                name,
                phone,
                bio,
                interests,
            })
            return ApiResponse.success(
                res,
                "Profile updated successfully",
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
}

module.exports = new UserController()
