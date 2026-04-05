"use strict"

const roleRepository = require("./role.repository")

class RoleService {
    async index(filters = {}, page = 1, limit = 20) {
        return roleRepository.getPaginated(filters, page, limit)
    }

    async getAll() {
        return roleRepository.getAllWithPermissions()
    }

    async show(id) {
        const role = await roleRepository.findById(id)
        if (!role)
            throw Object.assign(new Error("Role not found"), {statusCode: 404})
        return role
    }

    async store(data) {
        const {name, slug, description, permissions, isDefault, isSystem} = data

        const generatedSlug =
            slug ||
            name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
        const existing = await roleRepository.findBySlug(generatedSlug)
        if (existing) {
            throw Object.assign(
                new Error("A role with this slug already exists"),
                {statusCode: 422},
            )
        }

        return roleRepository.create({
            name,
            slug: generatedSlug,
            description: description || null,
            permissions: permissions || [],
            isDefault: isDefault || false,
            isSystem: isSystem || false,
        })
    }

    async update(id, data) {
        const role = await roleRepository.findById(id)
        if (!role)
            throw Object.assign(new Error("Role not found"), {statusCode: 404})

        const {name, description, permissions, isDefault} = data
        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (permissions !== undefined) updateData.permissions = permissions
        if (isDefault !== undefined) updateData.isDefault = isDefault

        return roleRepository.update(id, updateData)
    }

    async destroy(id) {
        const role = await roleRepository.findById(id)
        if (!role)
            throw Object.assign(new Error("Role not found"), {statusCode: 404})
        if (role.isSystem) {
            throw Object.assign(new Error("System roles cannot be deleted"), {
                statusCode: 403,
            })
        }
        return roleRepository.delete(id)
    }
}

module.exports = new RoleService()
