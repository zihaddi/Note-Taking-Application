"use strict"

const {Router} = require("express")
const {body, param} = require("express-validator")
const {authenticate} = require("../../middleware/authenticate")
const {requireAdmin, requireUser} = require("../../middleware/authorize")
const {validate} = require("../../middleware/validate")
const noteController = require("./note.controller")

const router = Router()

// ── User note routes — /api/user/notes
router.get("/user/notes", authenticate, requireUser, (req, res) =>
    noteController.index(req, res),
)

router.get(
    "/user/notes/:id",
    authenticate,
    requireUser,
    [param("id").isMongoId().withMessage("Invalid note ID"), validate],
    (req, res) => noteController.show(req, res),
)

router.post(
    "/user/notes",
    authenticate,
    requireUser,
    [
        body("title").notEmpty().withMessage("Title is required").trim(),
        body("content").notEmpty().withMessage("Content is required"),
        body("tags").optional().isArray().withMessage("Tags must be an array"),
        body("is_pinned")
            .optional()
            .isBoolean()
            .withMessage("is_pinned must be boolean"),
        validate,
    ],
    (req, res) => noteController.store(req, res),
)

router.put(
    "/user/notes/:id",
    authenticate,
    requireUser,
    [
        param("id").isMongoId().withMessage("Invalid note ID"),
        body("title")
            .optional()
            .notEmpty()
            .withMessage("Title cannot be empty"),
        body("tags").optional().isArray().withMessage("Tags must be an array"),
        body("is_pinned")
            .optional()
            .isBoolean()
            .withMessage("is_pinned must be boolean"),
        validate,
    ],
    (req, res) => noteController.update(req, res),
)

router.delete(
    "/user/notes/:id",
    authenticate,
    requireUser,
    [param("id").isMongoId().withMessage("Invalid note ID"), validate],
    (req, res) => noteController.destroy(req, res),
)

// ── Admin note routes — /api/admin/notes
router.get("/admin/notes", authenticate, requireAdmin, (req, res) =>
    noteController.adminIndex(req, res),
)

module.exports = router
