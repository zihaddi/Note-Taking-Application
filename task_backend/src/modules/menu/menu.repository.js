"use strict"

const BaseRepository = require("../../repositories/BaseRepository")
const MenuItem = require("./menu.model")

class MenuRepository extends BaseRepository {
    constructor() {
        super(MenuItem)
    }

    async getForRole(roleSlug) {
        return MenuItem.find({
            isActive: true,
            $or: [{roles: {$size: 0}}, {roles: roleSlug}],
        })
            .sort({order: 1})
            .lean()
    }

    async getBySection(section) {
        return MenuItem.find({section, isActive: true}).sort({order: 1}).lean()
    }

    async getPaginated(filters = {}, page = 1, limit = 50) {
        const query = {}
        if (filters.search) {
            query.$or = [
                {label: {$regex: filters.search, $options: "i"}},
                {path: {$regex: filters.search, $options: "i"}},
            ]
        }
        if (filters.section) query.section = filters.section
        if (filters.isActive !== undefined)
            query.isActive = filters.isActive === "true"

        const skip = (page - 1) * limit
        const [docs, totalDocs] = await Promise.all([
            MenuItem.find(query)
                .sort({section: 1, order: 1})
                .skip(skip)
                .limit(limit)
                .lean(),
            MenuItem.countDocuments(query),
        ])
        return {
            docs,
            totalDocs,
            page,
            limit,
            totalPages: Math.ceil(totalDocs / limit),
        }
    }
}

module.exports = new MenuRepository()
