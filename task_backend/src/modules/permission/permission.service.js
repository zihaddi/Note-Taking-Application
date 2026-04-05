"use strict"

const permissionRepository = require("./permission.repository")

class PermissionService {
    async index(filters, page, limit) {
        return permissionRepository.getPaginated(filters, page, limit)
    }

    async getAllGrouped() {
        return permissionRepository.getAllGroupedByModule()
    }

    async show(id) {
        return permissionRepository.findOrFail(id)
    }

    async store(data) {
        const existing = await permissionRepository.findBySlug(data.slug)
        if (existing) {
            const err = new Error("Permission slug already exists")
            err.statusCode = 422
            throw err
        }
        return permissionRepository.create(data)
    }

    async update(id, data) {
        await permissionRepository.findOrFail(id)
        if (data.slug) {
            const existing = await permissionRepository.findBySlug(data.slug)
            if (existing && existing._id.toString() !== id) {
                const err = new Error("Permission slug already taken")
                err.statusCode = 422
                throw err
            }
        }
        return permissionRepository.update(id, data)
    }

    async destroy(id) {
        await permissionRepository.findOrFail(id)
        return permissionRepository.delete(id)
    }
}

module.exports = new PermissionService()
