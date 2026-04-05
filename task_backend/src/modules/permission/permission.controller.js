"use strict"

const ApiResponse = require("../../traits/ApiResponse")
const permissionService = require("./permission.service")

class PermissionController {
    async index(req, res) {
        try {
            const {search, module: mod, page = 1, per_page = 20} = req.query
            const paginator = await permissionService.index(
                {search, module: mod},
                parseInt(page),
                parseInt(per_page),
            )
            return ApiResponse.paginated(
                res,
                "Permissions retrieved",
                paginator,
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

    async grouped(req, res) {
        try {
            const groups = await permissionService.getAllGrouped()
            return ApiResponse.success(
                res,
                "Permissions grouped by module",
                groups,
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

    async show(req, res) {
        try {
            const permission = await permissionService.show(req.params.id)
            return ApiResponse.success(res, "Permission retrieved", permission)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 404,
            )
        }
    }

    async store(req, res) {
        try {
            const permission = await permissionService.store(req.body)
            return ApiResponse.success(
                res,
                "Permission created",
                permission,
                201,
            )
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 422,
            )
        }
    }

    async update(req, res) {
        try {
            const permission = await permissionService.update(
                req.params.id,
                req.body,
            )
            return ApiResponse.success(res, "Permission updated", permission)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 422,
            )
        }
    }

    async destroy(req, res) {
        try {
            await permissionService.destroy(req.params.id)
            return ApiResponse.success(res, "Permission deleted")
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 404,
            )
        }
    }
}

module.exports = new PermissionController()
