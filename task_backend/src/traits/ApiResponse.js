"use strict"

/**
 * ApiResponse — mirrors the ApiResponseTrait from the Laravel boilerplate.
 * Provides consistent JSON response helpers used across all controllers.
 */
class ApiResponse {
    /**
     * Send a success response.
     *
     * @param {import('express').Response} res
     * @param {string} message
     * @param {*} data
     * @param {number} statusCode
     */
    static success(res, message, data = null, statusCode = 200) {
        return res.status(statusCode).json({
            status: "success",
            message,
            data,
        })
    }

    /**
     * Send an error response.
     *
     * @param {import('express').Response} res
     * @param {string} message
     * @param {*} errors
     * @param {number} statusCode
     */
    static error(res, message, errors = null, statusCode = 400) {
        const payload = {status: "error", message}
        if (errors !== null) payload.errors = errors
        return res.status(statusCode).json(payload)
    }

    /**
     * Send a paginated response (mirrors paginatedResponse from ApiResponseTrait).
     *
     * @param {import('express').Response} res
     * @param {string} message
     * @param {{ docs: any[], totalDocs: number, page: number, limit: number, totalPages: number }} paginator
     * @param {object} permissions
     */
    static paginated(res, message, paginator, permissions = {}) {
        const {docs, totalDocs, page, limit, totalPages} = paginator
        const baseUrl = ""

        const buildPageUrl = (p) =>
            p >= 1 && p <= totalPages ? `?page=${p}&per_page=${limit}` : null

        return res.status(200).json({
            status: "success",
            message,
            data: {
                data: docs,
                links: {
                    first: buildPageUrl(1),
                    last: buildPageUrl(totalPages),
                    prev: buildPageUrl(page - 1),
                    next: buildPageUrl(page + 1),
                },
                meta: {
                    current_page: page,
                    from: (page - 1) * limit + 1,
                    last_page: totalPages,
                    per_page: limit,
                    to: Math.min(page * limit, totalDocs),
                    total: totalDocs,
                },
                permissions,
            },
        })
    }

    /**
     * Send a response with permissions attached.
     *
     * @param {import('express').Response} res
     * @param {string} message
     * @param {*} data
     * @param {object} permissions
     */
    static withPermissions(res, message, data, permissions = {}) {
        return res.status(200).json({
            status: "success",
            message,
            data: {data, permissions},
        })
    }

    /**
     * 422 Validation error response.
     *
     * @param {import('express').Response} res
     * @param {object} errors
     */
    static validationError(res, errors) {
        return this.error(res, "Validation failed", errors, 422)
    }

    /**
     * 404 Not found response.
     *
     * @param {import('express').Response} res
     * @param {string} message
     */
    static notFound(res, message = "Resource not found") {
        return this.error(res, message, null, 404)
    }

    /**
     * 401 Unauthorized response.
     *
     * @param {import('express').Response} res
     * @param {string} message
     */
    static unauthorized(res, message = "Unauthorized") {
        return this.error(res, message, null, 401)
    }

    /**
     * 403 Forbidden response.
     *
     * @param {import('express').Response} res
     * @param {string} message
     */
    static forbidden(res, message = "Forbidden") {
        return this.error(res, message, null, 403)
    }
}

module.exports = ApiResponse
