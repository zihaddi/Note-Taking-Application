"use strict"

const {Router} = require("express")
const {body, param} = require("express-validator")
const {authenticate} = require("../../middleware/authenticate")
const {requireAdmin} = require("../../middleware/authorize")
const {validate} = require("../../middleware/validate")
const roleController = require("./role.controller")

const router = Router()

router.get("/admin/roles/all", authenticate, requireAdmin, (req, res) =>
    roleController.all(req, res),
)

router.get("/admin/roles", authenticate, requireAdmin, (req, res) =>
    roleController.index(req, res),
)

router.get(
    "/admin/roles/:id",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid role ID"), validate],
    (req, res) => roleController.show(req, res),
)

router.post(
    "/admin/roles",
    authenticate,
    requireAdmin,
    [body("name").notEmpty().withMessage("Name is required"), validate],
    (req, res) => roleController.store(req, res),
)

router.put(
    "/admin/roles/:id",
    authenticate,
    requireAdmin,
    [
        param("id").isMongoId().withMessage("Invalid role ID"),
        body("name").optional().notEmpty().withMessage("Name cannot be empty"),
        validate,
    ],
    (req, res) => roleController.update(req, res),
)

router.delete(
    "/admin/roles/:id",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid role ID"), validate],
    (req, res) => roleController.destroy(req, res),
)

module.exports = router
