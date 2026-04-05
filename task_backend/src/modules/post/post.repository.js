'use strict';

const BaseRepository = require('../../repositories/BaseRepository');
const Post = require('./post.model');
const User = require('../user/user.model');
const mongoose = require('mongoose');

/**
 * PostRepository — extends BaseRepository for the Post model.
 */
class PostRepository extends BaseRepository {
  constructor() {
    super(Post);
  }

  /**
   * Paginate all published posts (visible to everyone).
   *
   * @param {object} filters - { search, userId }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<object>}
   */
  async getAllPaginatedPublic(filters = {}, page = 1, limit = 15) {
    const query = { is_published: true };

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.userId) query.userId = filters.userId;

    const sort = { createdAt: -1 };

    const [docs, totalDocs] = await Promise.all([
      Post.find(query).populate('userId', 'name email').sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Post.countDocuments(query),
    ]);

    return { docs, totalDocs, page, limit, totalPages: Math.ceil(totalDocs / limit) };
  }

  /**
   * Paginate posts owned by a specific user.
   *
   * @param {string} userId
   * @param {object} filters
   * @param {number} page
   * @param {number} limit
   */
  async getUserPostsPaginated(userId, filters = {}, page = 1, limit = 15) {
    const query = { userId };

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const sort = { createdAt: -1 };

    const [docs, totalDocs] = await Promise.all([
      Post.find(query).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Post.countDocuments(query),
    ]);

    return { docs, totalDocs, page, limit, totalPages: Math.ceil(totalDocs / limit) };
  }

  /**
   * Aggregation Scenario 2 — Retrieve all posts belonging to a particular user.
   *
   * Uses a single aggregation pipeline with a $lookup stage.
   * The pipeline starts from the User collection, matches the user by ID,
   * then $lookups into the posts collection.
   *
   * @param {string} userId
   * @returns {Promise<object>} user with embedded posts array
   */
  async getUserPostsWithLookup(userId) {
    const results = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'posts',         // posts collection name (Mongoose lowercases + pluralizes)
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          posts: {
            $filter: {
              input: '$posts',
              as: 'post',
              cond: { $eq: ['$$post.is_published', true] },
            },
          },
        },
      },
    ]);

    return results[0] || null;
  }
}

module.exports = new PostRepository();
