"use strict"

const bcrypt = require("bcryptjs")

const SALT_ROUNDS = 12

/**
 * Hash a plain-text password using bcrypt.
 */
async function hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

/**
 * Compare a plain-text password against a hash.
 */
async function comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Generate a numeric OTP of the given length.
 */
function generateOtp(length = 6) {
    const digits = "0123456789"
    let otp = ""
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)]
    }
    return otp
}

/**
 * Format a permission string as "resource.action".
 *
 * @param {string} resource
 * @param {string} action
 * @returns {string}
 */
function formatPermission(resource, action) {
    return `${resource}.${action}`
}

module.exports = {hashPassword, comparePassword, generateOtp, formatPermission}
