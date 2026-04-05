"use strict"

const menuRepository = require("./menu.repository")

class MenuService {
    async index(filters = {}, page = 1, limit = 50) {
        return menuRepository.getPaginated(filters, page, limit)
    }

    async getForRole(roleSlug) {
        return menuRepository.getForRole(roleSlug)
    }

    async show(id) {
        const item = await menuRepository.findById(id)
        if (!item)
            throw Object.assign(new Error("Menu item not found"), {
                statusCode: 404,
            })
        return item
    }

    async store(data) {
        const {label, path, icon, roles, order, isActive, parent, section} =
            data
        return menuRepository.create({
            label,
            path,
            icon: icon || "lucide:circle",
            roles: roles || [],
            order: order ?? 0,
            isActive: isActive !== undefined ? isActive : true,
            parent: parent || null,
            section: section || "main",
        })
    }

    async update(id, data) {
        const item = await menuRepository.findById(id)
        if (!item)
            throw Object.assign(new Error("Menu item not found"), {
                statusCode: 404,
            })
        return menuRepository.update(id, data)
    }

    async destroy(id) {
        const item = await menuRepository.findById(id)
        if (!item)
            throw Object.assign(new Error("Menu item not found"), {
                statusCode: 404,
            })
        return menuRepository.delete(id)
    }

    async reorder(items) {
        const ops = items.map(({id, order}) =>
            menuRepository.update(id, {order}),
        )
        return Promise.all(ops)
    }
}

module.exports = new MenuService()
