"use strict"

/**
 * BaseService — mirrors the Laravel BaseService.
 * Wraps a repository and provides common business-logic helpers.
 */
class BaseService {
    constructor(repository) {
        this.repository = repository
    }

    /**
     * Get all records with pagination and optional filters.
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
     */
    async getById(id) {
        return this.repository.find(id)
    }

    /**
     * Get all records (unfiltered).
     */
    async getAll() {
        return this.repository.all()
    }

    /**
     * Get all active records.
     */
    async getAllActive() {
        return this.repository.getBy({is_active: true})
    }

    /**
     * Create a new record.
     */
    async create(data) {
        return this.repository.create(data)
    }

    /**
     * Update a record by ID.
     */
    async update(id, data) {
        return this.repository.update(id, data)
    }

    /**
     * Delete a record by ID.
     */
    async delete(id) {
        return this.repository.delete(id)
    }

    /**
     * Find a record by ID (alias for getById).
     */
    async find(id) {
        return this.repository.find(id)
    }

    /**
     * Searchable fields — override in child classes.
     */
    getSearchableFields() {
        return ["name", "title", "description"]
    }

    /**
     * Log an error.
     */
    handleError(err, context = "") {
        console.error(`[${context || this.constructor.name}]`, err.message, err)
    }

    /**
     * Log an informational message.
     */
    logInfo(message, meta = {}) {
        console.info(`[${this.constructor.name}]`, message, meta)
    }

    /**
     * Log a warning.
     */
    logWarning(message, meta = {}) {
        console.warn(`[${this.constructor.name}]`, message, meta)
    }
}

module.exports = BaseService
