"use strict"

const {Router} = require("express")
const {body, param} = require("express-validator")
const {authenticate} = require("../../middleware/authenticate")
const {requireUser, requirePermission} = require("../../middleware/authorize")
const {validate} = require("../../middleware/validate")
const postController = require("./post.controller")

const router = Router()

// ── Public routes (no auth required) 
router.get("/posts", (req, res) => postController.index(req, res))

router.get(
    "/posts/:id",
    [param("id").isMongoId().withMessage("Invalid post ID"), validate],
    (req, res) => postController.show(req, res),
)

// ── Authenticated user routes
router.get("/user/posts", authenticate, requireUser, requirePermission("posts.view"), (req, res) =>
    postController.userIndex(req, res),
)

router.post(
    "/user/posts",
    authenticate,
    requireUser,
    requirePermission("posts.create"),
    [
        body("title").notEmpty().withMessage("Title is required").trim(),
        body("content").notEmpty().withMessage("Content is required"),
        body("tags").optional().isArray().withMessage("Tags must be an array"),
        body("is_published")
            .optional()
            .isBoolean()
            .withMessage("is_published must be boolean"),
        validate,
    ],
    (req, res) => postController.store(req, res),
)

router.put(
    "/user/posts/:id",
    authenticate,
    requireUser,
    requirePermission("posts.update"),
    [
        param("id").isMongoId().withMessage("Invalid post ID"),
        body("title")
            .optional()
            .notEmpty()
            .withMessage("Title cannot be empty"),
        body("tags").optional().isArray().withMessage("Tags must be an array"),
        body("is_published")
            .optional()
            .isBoolean()
            .withMessage("is_published must be boolean"),
        validate,
    ],
    (req, res) => postController.update(req, res),
)

router.delete(
    "/user/posts/:id",
    authenticate,
    requireUser,
    requirePermission("posts.delete"),
    [param("id").isMongoId().withMessage("Invalid post ID"), validate],
    (req, res) => postController.destroy(req, res),
)

module.exports = router
