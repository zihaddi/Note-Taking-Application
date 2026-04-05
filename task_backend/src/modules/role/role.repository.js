"use strict"

const BaseRepository = require("../../repositories/BaseRepository")
const Role = require("./role.model")

class RoleRepository extends BaseRepository {
    constructor() {
        super(Role)
    }

    async findBySlug(slug) {
        return Role.findOne({slug}).lean()
    }

    async getAllWithPermissions() {
        return Role.find().sort({name: 1}).populate("permissions").lean()
    }

    async findBySlugWithPermissions(slug) {
        return Role.findOne({slug}).populate("permissions").lean()
    }

    async getPaginated(filters = {}, page = 1, limit = 20) {
        const query = {}
        if (filters.search) {
            query.$or = [
                {name: {$regex: filters.search, $options: "i"}},
                {slug: {$regex: filters.search, $options: "i"}},
            ]
        }

        const skip = (page - 1) * limit
        const [docs, totalDocs] = await Promise.all([
            Role.find(query)
                .sort({name: 1})
                .skip(skip)
                .limit(limit)
                .populate("permissions", "name slug module action")
                .lean(),
            Role.countDocuments(query),
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

module.exports = new RoleRepository()
