"use strict"

const userRepository = require("../user/user.repository")
const {hashPassword, comparePassword} = require("../../helpers/helpers")
const {generateToken} = require("../../config/jwt")

/**
 * AuthService — handles registration, login, and profile retrieval.
 * Note: JWT is stateless; "logout" is handled client-side by discarding the token.
 */
class AuthService {
  
    async register(data) {
        const existing = await userRepository.findByEmail(data.email)
        if (existing) {
            const err = new Error("Email already registered")
            err.statusCode = 422
            throw err
        }

        const hashed = await hashPassword(data.password)
        const user = await userRepository.create({
            name: data.name,
            email: data.email,
            password: hashed,
            role: data.role || "user",
            interests: data.interests || [],
        })

        const token = generateToken({id: user._id.toString(), role: user.role})

        const {password: _pw, ...safeUser} = user.toObject
            ? user.toObject()
            : user
        return {user: safeUser, token}
    }

 
    async login(credentials) {
        const user = await userRepository.findByEmailWithPassword(
            credentials.email,
        )
        if (!user) {
            const err = new Error("Invalid email or password")
            err.statusCode = 401
            throw err
        }

        const match = await comparePassword(credentials.password, user.password)
        if (!match) {
            const err = new Error("Invalid email or password")
            err.statusCode = 401
            throw err
        }

        if (user.status !== "active") {
            const err = new Error(
                "Account is not active. Please contact support.",
            )
            err.statusCode = 403
            throw err
        }

        const token = generateToken({id: user._id.toString(), role: user.role})

        const {password: _pw, ...safeUser} = user
        return {user: safeUser, token}
    }

   
    async adminLogin(credentials) {
        const result = await this.login(credentials)
        if (result.user.role !== "admin") {
            const err = new Error("Access denied: Admin credentials required")
            err.statusCode = 403
            throw err
        }
        return result
    }

   
    async getProfile(userId) {
        return userRepository.findOrFail(userId)
    }
}

module.exports = new AuthService()
