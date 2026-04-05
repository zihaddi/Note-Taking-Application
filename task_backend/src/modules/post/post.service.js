"use strict"

const BaseService = require("../../services/BaseService")
const postRepository = require("./post.repository")

/**
 * PostService — business logic for post management.
 */
class PostService extends BaseService {
    constructor() {
        super(postRepository)
    }

    getSearchableFields() {
        return ["title", "content"]
    }

    /**
     * List all published posts (visible to everyone).
     *
     * @param {object} filters
     * @param {number} page
     * @param {number} perPage
     */
    async listPublicPosts(filters = {}, page = 1, perPage = 15) {
        return postRepository.getAllPaginatedPublic(filters, page, perPage)
    }

    /**
     * List posts owned by a specific user.
     *
     * @param {string} userId
     * @param {object} filters
     * @param {number} page
     * @param {number} perPage
     */
    async getUserPosts(userId, filters = {}, page = 1, perPage = 15) {
        return postRepository.getUserPostsPaginated(
            userId,
            filters,
            page,
            perPage,
        )
    }

    /**
     * Aggregation Scenario 2 — get user with their posts via $lookup.
     *
     * @param {string} userId
     * @returns {Promise<object>}
     */
    async getUserPostsWithLookup(userId) {
        const result = await postRepository.getUserPostsWithLookup(userId)
        if (!result) {
            const err = new Error("User not found")
            err.statusCode = 404
            throw err
        }
        return result
    }

    /**
     * Get a single post by ID.
     *
     * @param {string} postId
     */
    async getPostById(postId) {
        return this.repository.findOrFail(postId)
    }

    /**
     * Create a new post.
     *
     * @param {string} userId
     * @param {{ title: string, content: string, tags?: string[], is_published?: boolean }} data
     */
    async createPost(userId, data) {
        return postRepository.create({...data, userId})
    }

    /**
     * Update a post (owner only).
     *
     * @param {string} postId
     * @param {string} userId
     * @param {object} data
     */
    async updatePost(postId, userId, data) {
        const post = await postRepository.findBy({_id: postId, userId})
        if (!post) {
            const err = new Error("Post not found or access denied")
            err.statusCode = 404
            throw err
        }
        return postRepository.update(postId, data)
    }

    /**
     * Delete a post (owner only).
     *
     * @param {string} postId
     * @param {string} userId
     */
    async deletePost(postId, userId) {
        const post = await postRepository.findBy({_id: postId, userId})
        if (!post) {
            const err = new Error("Post not found or access denied")
            err.statusCode = 404
            throw err
        }
        return postRepository.delete(postId)
    }
}

module.exports = new PostService()
