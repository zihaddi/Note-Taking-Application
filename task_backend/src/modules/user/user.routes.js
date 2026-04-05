"use strict"

const {Router} = require("express")
const {body, param} = require("express-validator")
const {authenticate} = require("../../middleware/authenticate")
const {requireAdmin, requireUser} = require("../../middleware/authorize")
const {validate} = require("../../middleware/validate")
const userController = require("./user.controller")

const router = Router()

// ── Admin routes — /api/admin/users ─────────────────────────────────────────

// Aggregation: must be defined BEFORE /:id routes to avoid param capture
router.get("/admin/users/interests", authenticate, requireAdmin, (req, res) =>
    userController.groupByInterests(req, res),
)

router.get(
    "/admin/users/:id/posts",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid user ID"), validate],
    (req, res) => userController.getUserPosts(req, res),
)

router.get("/admin/users", authenticate, requireAdmin, (req, res) =>
    userController.index(req, res),
)

router.get(
    "/admin/users/:id",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid user ID"), validate],
    (req, res) => userController.show(req, res),
)

router.post(
    "/admin/users",
    authenticate,
    requireAdmin,
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password")
            .isLength({min: 6})
            .withMessage("Password must be at least 6 characters"),
        body("role")
            .optional()
            .isIn(["user", "admin"])
            .withMessage("Role must be user or admin"),
        body("interests")
            .optional()
            .isArray()
            .withMessage("Interests must be an array"),
        validate,
    ],
    (req, res) => userController.store(req, res),
)

router.put(
    "/admin/users/:id",
    authenticate,
    requireAdmin,
    [
        param("id").isMongoId().withMessage("Invalid user ID"),
        body("email")
            .optional()
            .isEmail()
            .withMessage("Valid email is required"),
        body("password")
            .optional()
            .isLength({min: 6})
            .withMessage("Password must be at least 6 characters"),
        body("role")
            .optional()
            .isIn(["user", "admin"])
            .withMessage("Invalid role"),
        body("status")
            .optional()
            .isIn(["active", "inactive", "suspended"])
            .withMessage("Invalid status"),
        body("interests")
            .optional()
            .isArray()
            .withMessage("Interests must be an array"),
        validate,
    ],
    (req, res) => userController.update(req, res),
)

router.delete(
    "/admin/users/:id",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid user ID"), validate],
    (req, res) => userController.destroy(req, res),
)

// ── User profile routes — /api/user/profile ──────────────────────────────
router.get("/user/profile", authenticate, requireUser, (req, res) =>
    userController.profile(req, res),
)

router.put(
    "/user/profile",
    authenticate,
    requireUser,
    [
        body("name").optional().notEmpty().withMessage("Name cannot be empty"),
        body("interests")
            .optional()
            .isArray()
            .withMessage("Interests must be an array"),
        validate,
    ],
    (req, res) => userController.updateProfile(req, res),
)

module.exports = router
