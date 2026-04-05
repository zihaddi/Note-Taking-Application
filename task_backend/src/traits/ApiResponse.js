"use strict"

/**
 * ApiResponse
 */
class ApiResponse {
    /**
     * Send a success response.
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
     */
    static error(res, message, errors = null, statusCode = 400) {
        const payload = {status: "error", message}
        if (errors !== null) payload.errors = errors
        return res.status(statusCode).json(payload)
    }

    /**
     * Send a paginated response (mirrors paginatedResponse from ApiResponseTrait).
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
     */
    static validationError(res, errors) {
        return this.error(res, "Validation failed", errors, 422)
    }

    /**
     * 404 Not found response.
     */
    static notFound(res, message = "Resource not found") {
        return this.error(res, message, null, 404)
    }

    /**
     * 401 Unauthorized response.
     */
    static unauthorized(res, message = "Unauthorized") {
        return this.error(res, message, null, 401)
    }

    /**
     * 403 Forbidden response.
     */
    static forbidden(res, message = "Forbidden") {
        return this.error(res, message, null, 403)
    }
}

module.exports = ApiResponse
