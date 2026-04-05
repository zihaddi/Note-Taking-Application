"use strict"

const BaseRepository = require("../../repositories/BaseRepository")
const User = require("./user.model")

/**
 * UserRepository — extends BaseRepository for the User model.
 */
class UserRepository extends BaseRepository {
    constructor() {
        super(User)
    }

    /**
     * Find a user by email (includes password field for auth comparison).
     *
     * @param {string} email
     * @returns {Promise<object|null>}
     */
    async findByEmailWithPassword(email) {
        return User.findOne({email}).select("+password").lean()
    }

    /**
     * Find a user by email (excludes password).
     *
     * @param {string} email
     * @returns {Promise<object|null>}
     */
    async findByEmail(email) {
        return User.findOne({email}).lean()
    }

    /**
     * Paginate users with role/search filters.
     *
     * @param {object} filters - { search, role, status }
     * @param {number} page
     * @param {number} limit
     * @returns {Promise<object>}
     */
    async getAllPaginated(filters = {}, _searchFields, page = 1, limit = 15) {
        const query = {}

        if (filters.search) {
            query.$or = [
                {name: {$regex: filters.search, $options: "i"}},
                {email: {$regex: filters.search, $options: "i"}},
            ]
        }

        if (filters.role) query.role = filters.role
        if (filters.status) query.status = filters.status

        const sort = {createdAt: -1}

        const [docs, totalDocs] = await Promise.all([
            User.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ])

        return {
            docs,
            totalDocs,
            page,
            limit,
            totalPages: Math.ceil(totalDocs / limit),
        }
    }

    /**
     * Aggregation Scenario 1 — Group users by interests.
     *
     * Uses exactly ONE collection.aggregate() call.
     * Requires: $unwind + $group stages.
     * Supported by the interests array field (no separate index needed—
     * compound or array index would be overkill here since we aggregate the full collection).
     *
     * @returns {Promise<Array<{ _id: string, count: number, users: object[] }>>}
     */
    async groupByInterests() {
        return User.aggregate([
            {$unwind: "$interests"},
            {
                $group: {
                    _id: "$interests",
                    count: {$sum: 1},
                    users: {
                        $push: {
                            id: "$_id",
                            name: "$name",
                            email: "$email",
                        },
                    },
                },
            },
            {$sort: {count: -1}},
            {$project: {interest: "$_id", count: 1, users: 1, _id: 0}},
        ])
    }
}

module.exports = new UserRepository()
