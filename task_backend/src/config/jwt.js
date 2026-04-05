"use strict"

const jwt = require("jsonwebtoken")

const JWT_SECRET =
    process.env.JWT_SECRET || "fallback-secret-change-in-production"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

/**
 * Generate a signed JWT access token for a user.
 *
 * @param {object} payload - Data to encode (id, role)
 * @returns {string} signed JWT
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})
}

/**
 * Verify and decode a JWT token.
 */
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET)
}

module.exports = {generateToken, verifyToken}
