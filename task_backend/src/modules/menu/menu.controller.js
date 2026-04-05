"use strict"

const ApiResponse = require("../../traits/ApiResponse")
const menuService = require("./menu.service")

class MenuController {
    async index(req, res) {
        try {
            const {
                search,
                section,
                isActive,
                page = 1,
                per_page = 50,
            } = req.query
            const paginator = await menuService.index(
                {search, section, isActive},
                parseInt(page),
                parseInt(per_page),
            )
            return ApiResponse.paginated(res, "Menu items retrieved", paginator)
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 500,
            )
        }
    }

    async myMenus(req, res) {
        try {
            const roleSlug = req.user?.role || "user"
            const items = await menuService.getForRole(roleSlug)
            return ApiResponse.success(res, "My menus retrieved", items)
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
            const item = await menuService.show(req.params.id)
            return ApiResponse.success(res, "Menu item retrieved", item)
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
            const item = await menuService.store(req.body)
            return ApiResponse.success(res, "Menu item created", item, 201)
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
            const item = await menuService.update(req.params.id, req.body)
            return ApiResponse.success(res, "Menu item updated", item)
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
            await menuService.destroy(req.params.id)
            return ApiResponse.success(res, "Menu item deleted")
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 404,
            )
        }
    }

    async reorder(req, res) {
        try {
            await menuService.reorder(req.body.items || [])
            return ApiResponse.success(res, "Menu order updated")
        } catch (err) {
            return ApiResponse.error(
                res,
                err.message,
                null,
                err.statusCode || 422,
            )
        }
    }
}

module.exports = new MenuController()
