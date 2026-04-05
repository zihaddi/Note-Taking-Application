"use strict"

const BaseService = require("../../services/BaseService")
const userRepository = require("./user.repository")
const {hashPassword} = require("../../helpers/helpers")

/**
 * UserService — business logic for user management.
 */
class UserService extends BaseService {
    constructor() {
        super(userRepository)
    }

    getSearchableFields() {
        return ["name", "email"]
    }

    /**
     * List all users with pagination.
     *
     * @param {object} filters
     * @param {number} page
     * @param {number} perPage
     */
    async listUsers(filters = {}, page = 1, perPage = 15) {
        return this.getAllPaginated(filters, page, perPage)
    }

    /**
     * Get a user by ID (throws 404 if not found).
     *
     * @param {string} id
     */
    async getUserById(id) {
        return userRepository.findOrFail(id)
    }

    /**
     * Create a new user (admin action).
     *
     * @param {object} data - { name, email, password, role, interests }
     */
    async createUser(data) {
        const existing = await userRepository.findByEmail(data.email)
        if (existing) {
            const err = new Error("Email already registered")
            err.statusCode = 422
            throw err
        }
        data.password = await hashPassword(data.password)
        return userRepository.create(data)
    }

    /**
     * Update a user (admin action).
     *
     * @param {string} id
     * @param {object} data
     */
    async updateUser(id, data) {
        if (data.password) {
            data.password = await hashPassword(data.password)
        }
        const updated = await userRepository.update(id, data)
        if (!updated) {
            const err = new Error("User not found")
            err.statusCode = 404
            throw err
        }
        return updated
    }

    /**
     * Delete a user (admin action).
     *
     * @param {string} id
     */
    async deleteUser(id) {
        const deleted = await userRepository.delete(id)
        if (!deleted) {
            const err = new Error("User not found")
            err.statusCode = 404
            throw err
        }
        return deleted
    }

    /**
     * Group users by interests (aggregation scenario 1).
     */
    async getUsersGroupedByInterests() {
        return userRepository.groupByInterests()
    }
}

module.exports = new UserService()
