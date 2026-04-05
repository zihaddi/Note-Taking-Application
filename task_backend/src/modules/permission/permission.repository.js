"use strict"

const BaseRepository = require("../../repositories/BaseRepository")
const Permission = require("./permission.model")

class PermissionRepository extends BaseRepository {
    constructor() {
        super(Permission)
    }

    async findBySlug(slug) {
        return Permission.findOne({slug}).lean()
    }

    async findByModule(module) {
        return Permission.find({module}).sort({action: 1}).lean()
    }

    async getAllGroupedByModule() {
        return Permission.aggregate([
            {$sort: {module: 1, action: 1}},
            {
                $group: {
                    _id: "$module",
                    permissions: {
                        $push: {
                            _id: "$_id",
                            name: "$name",
                            slug: "$slug",
                            action: "$action",
                            description: "$description",
                        },
                    },
                },
            },
            {$sort: {_id: 1}},
        ])
    }

    async getPaginated(filters = {}, page = 1, limit = 20) {
        const query = {}
        if (filters.search) {
            query.$or = [
                {name: {$regex: filters.search, $options: "i"}},
                {slug: {$regex: filters.search, $options: "i"}},
                {module: {$regex: filters.search, $options: "i"}},
            ]
        }
        if (filters.module) query.module = filters.module

        const skip = (page - 1) * limit
        const [docs, totalDocs] = await Promise.all([
            Permission.find(query)
                .sort({module: 1, action: 1})
                .skip(skip)
                .limit(limit)
                .lean(),
            Permission.countDocuments(query),
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

module.exports = new PermissionRepository()
