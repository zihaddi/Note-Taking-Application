"use strict"

const {Router} = require("express")
const {body} = require("express-validator")
const {authenticate} = require("../../middleware/authenticate")
const {validate} = require("../../middleware/validate")
const authController = require("./auth.controller")

const router = Router()

// ── Public routes

router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("Name is required").trim(),
        body("email")
            .isEmail()
            .withMessage("Valid email is required")
            .normalizeEmail(),
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
    (req, res) => authController.register(req, res),
)

router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Valid email is required")
            .normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required"),
        validate,
    ],
    (req, res) => authController.login(req, res),
)

router.post(
    "/admin/login",
    [
        body("email")
            .isEmail()
            .withMessage("Valid email is required")
            .normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required"),
        validate,
    ],
    (req, res) => authController.adminLogin(req, res),
)

// ── Protected routes

router.get("/profile", authenticate, (req, res) =>
    authController.profile(req, res),
)

router.post("/logout", authenticate, (req, res) =>
    authController.logout(req, res),
)

module.exports = router
