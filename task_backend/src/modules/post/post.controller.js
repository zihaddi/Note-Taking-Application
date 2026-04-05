"use strict"

const ApiResponse = require("../../traits/ApiResponse")
const postService = require("./post.service")

/**
 * PostController
 */
class PostController {
    async index(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1)
            const perPage = Math.min(
                100,
                Math.max(1, parseInt(req.query.per_page) || 15),
            )
            const filters = {search: req.query.search || ""}

            const paginator = await postService.listPublicPosts(
                filters,
                page,
                perPage,
            )
            return ApiResponse.paginated(
                res,
                "Posts retrieved successfully",
                paginator,
            )
        } catch (err) {
            postService.handleError(err, "PostController.index")
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
            const post = await postService.getPostById(req.params.id)
            return ApiResponse.success(res, "Post retrieved successfully", post)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async userIndex(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1)
            const perPage = Math.min(
                100,
                Math.max(1, parseInt(req.query.per_page) || 15),
            )
            const filters = {search: req.query.search || ""}

            const paginator = await postService.getUserPosts(
                req.user.id,
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
                "Your posts retrieved successfully",
                paginator,
                permissions,
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

    async store(req, res) {
        try {
            const {title, content, tags, is_published} = req.body
            const post = await postService.createPost(req.user.id, {
                title,
                content,
                tags,
                is_published,
            })
            return ApiResponse.success(
                res,
                "Post created successfully",
                post,
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
            const {title, content, tags, is_published} = req.body
            const post = await postService.updatePost(
                req.params.id,
                req.user.id,
                {title, content, tags, is_published},
            )
            return ApiResponse.success(res, "Post updated successfully", post)
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
            await postService.deletePost(req.params.id, req.user.id)
            return ApiResponse.success(res, "Post deleted successfully")
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

module.exports = new PostController()
