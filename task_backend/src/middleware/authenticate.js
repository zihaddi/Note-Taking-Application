"use strict"

const {verifyToken} = require("../config/jwt")
const ApiResponse = require("../traits/ApiResponse")

/**
 * authenticate — verifies the JWT Bearer token in the Authorization header.
 */
function authenticate(req, res, next) {
    const authHeader =
        req.headers["authorization"] || req.headers["Authorization"]

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiResponse.unauthorized(res, "No token provided")
    }

    const token = authHeader.slice(7)

    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return ApiResponse.unauthorized(res, "Token expired")
        }
        return ApiResponse.unauthorized(res, "Invalid token")
    }
}

module.exports = {authenticate}
