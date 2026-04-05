"use strict"

/**
 * BaseService — mirrors the Laravel BaseService.
 * Wraps a repository and provides common business-logic helpers.
 */
class BaseService {
    /**
     * @param {import('../repositories/BaseRepository')} repository
     */
    constructor(repository) {
        this.repository = repository
    }

    /**
     * Get all records with pagination and optional filters.
     *
     * @param {object} filters
     * @param {number} page
     * @param {number} perPage
     * @returns {Promise<object>}
     */
    async getAllPaginated(filters = {}, page = 1, perPage = 15) {
        const searchFields = this.getSearchableFields()
        return this.repository.getAllPaginated(
            filters,
            searchFields,
            page,
            perPage,
        )
    }

    /**
     * Get a single record by ID.
     *
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async getById(id) {
        return this.repository.find(id)
    }

    /**
     * Get all records (unfiltered).
     *
     * @returns {Promise<object[]>}
     */
    async getAll() {
        return this.repository.all()
    }

    /**
     * Get all active records.
     *
     * @returns {Promise<object[]>}
     */
    async getAllActive() {
        return this.repository.getBy({is_active: true})
    }

    /**
     * Create a new record.
     *
     * @param {object} data
     * @returns {Promise<object>}
     */
    async create(data) {
        return this.repository.create(data)
    }

    /**
     * Update a record by ID.
     *
     * @param {string} id
     * @param {object} data
     * @returns {Promise<object|null>}
     */
    async update(id, data) {
        return this.repository.update(id, data)
    }

    /**
     * Delete a record by ID.
     *
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        return this.repository.delete(id)
    }

    /**
     * Find a record by ID (alias for getById).
     *
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async find(id) {
        return this.repository.find(id)
    }

    /**
     * Searchable fields — override in child classes.
     *
     * @returns {string[]}
     */
    getSearchableFields() {
        return ["name", "title", "description"]
    }

    /**
     * Log an error.
     *
     * @param {Error} err
     * @param {string} context
     */
    handleError(err, context = "") {
        console.error(`[${context || this.constructor.name}]`, err.message, err)
    }

    /**
     * Log an informational message.
     *
     * @param {string} message
     * @param {object} meta
     */
    logInfo(message, meta = {}) {
        console.info(`[${this.constructor.name}]`, message, meta)
    }

    /**
     * Log a warning.
     *
     * @param {string} message
     * @param {object} meta
     */
    logWarning(message, meta = {}) {
        console.warn(`[${this.constructor.name}]`, message, meta)
    }
}

module.exports = BaseService
