"use strict"

/**
 * BaseRepository — mirrors the Laravel BaseRepository.
 * Generic CRUD & pagination operations for a Mongoose model.
 */
class BaseRepository {
    /**
     * @param {import('mongoose').Model} model - Mongoose model class
     */
    constructor(model) {
        this.model = model
    }

    /**
     * Get all documents.
     *
     * @param {object} projection
     * @returns {Promise<import('mongoose').Document[]>}
     */
    async all(projection = {}) {
        return this.model.find({}, projection).lean()
    }

    /**
     * Find a document by its _id.
     *
     * @param {string} id
     * @param {object} projection
     * @returns {Promise<import('mongoose').Document|null>}
     */
    async find(id, projection = {}) {
        return this.model.findById(id, projection).lean()
    }

    /**
     * Find a document by _id or throw a 404-like error.
     *
     * @param {string} id
     * @returns {Promise<import('mongoose').Document>}
     */
    async findOrFail(id) {
        const doc = await this.model.findById(id).lean()
        if (!doc) {
            const err = new Error("Resource not found")
            err.statusCode = 404
            throw err
        }
        return doc
    }

    /**
     * Find first document matching the given criteria.
     *
     * @param {object} criteria
     * @param {object} projection
     * @returns {Promise<import('mongoose').Document|null>}
     */
    async findBy(criteria, projection = {}) {
        return this.model.findOne(criteria, projection).lean()
    }

    /**
     * Get all documents matching the given criteria.
     *
     * @param {object} criteria
     * @param {object} projection
     * @returns {Promise<import('mongoose').Document[]>}
     */
    async getBy(criteria, projection = {}) {
        return this.model.find(criteria, projection).lean()
    }

    /**
     * Create a new document.
     *
     * @param {object} data
     * @returns {Promise<import('mongoose').Document>}
     */
    async create(data) {
        const doc = new this.model(data)
        return doc.save()
    }

    /**
     * Update a document by _id.
     * Returns the updated document or null if not found.
     *
     * @param {string} id
     * @param {object} data
     * @returns {Promise<import('mongoose').Document|null>}
     */
    async update(id, data) {
        return this.model
            .findByIdAndUpdate(
                id,
                {$set: data},
                {new: true, runValidators: true},
            )
            .lean()
    }

    /**
     * Delete (hard) a document by _id.
     *
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id)
        return !!result
    }

    /**
     * Paginate documents with optional filters.
     * Returns a paginator object compatible with ApiResponse.paginated().
     *
     * @param {object} filters    - { search, ...extraFilters }
     * @param {string[]} searchFields - fields to apply full-text search on
     * @param {number} page
     * @param {number} limit
     * @param {object} sort       - e.g. { createdAt: -1 }
     * @returns {Promise<{ docs, totalDocs, page, limit, totalPages }>}
     */
    async getAllPaginated(
        filters = {},
        searchFields = ["name"],
        page = 1,
        limit = 15,
        sort = {createdAt: -1},
    ) {
        const query = this._buildQuery(filters, searchFields)

        const [docs, totalDocs] = await Promise.all([
            this.model
                .find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.model.countDocuments(query),
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
     * Build a Mongoose query object from filters.
     * Override in child classes for custom filter logic.
     *
     * @param {object} filters
     * @param {string[]} searchFields
     * @returns {object}
     */
    _buildQuery(filters = {}, searchFields = ["name"]) {
        const query = {}

        if (filters.search) {
            query.$or = searchFields.map((field) => ({
                [field]: {$regex: filters.search, $options: "i"},
            }))
        }

        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active
        }

        return query
    }
}

module.exports = BaseRepository
