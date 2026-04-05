"use strict"

const ApiResponse = require("../../traits/ApiResponse")
const roleService = require("./role.service")

class RoleController {
    async index(req, res) {
        try {
            const {search, page = 1, per_page = 20} = req.query
            const paginator = await roleService.index(
                {search},
                parseInt(page),
                parseInt(per_page),
            )
            return ApiResponse.paginated(res, "Roles retrieved", paginator)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async all(req, res) {
        try {
            const roles = await roleService.getAll()
            return ApiResponse.success(res, "All roles retrieved", roles)
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
            const role = await roleService.show(req.params.id)
            return ApiResponse.success(res, "Role retrieved", role)
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
            const role = await roleService.store(req.body)
            return ApiResponse.success(res, "Role created", role, 201)
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
            const role = await roleService.update(req.params.id, req.body)
            return ApiResponse.success(res, "Role updated", role)
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
            await roleService.destroy(req.params.id)
            return ApiResponse.success(res, "Role deleted")
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

module.exports = new RoleController()
