"use strict"

const {Router} = require("express")
const {body, param} = require("express-validator")
const {authenticate} = require("../../middleware/authenticate")
const {requireAdmin} = require("../../middleware/authorize")
const {validate} = require("../../middleware/validate")
const permissionController = require("./permission.controller")

const router = Router()

router.get(
    "/admin/permissions/grouped",
    authenticate,
    requireAdmin,
    (req, res) => permissionController.grouped(req, res),
)

router.get("/admin/permissions", authenticate, requireAdmin, (req, res) =>
    permissionController.index(req, res),
)

router.get(
    "/admin/permissions/:id",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid permission ID"), validate],
    (req, res) => permissionController.show(req, res),
)

router.post(
    "/admin/permissions",
    authenticate,
    requireAdmin,
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("module").notEmpty().withMessage("Module is required"),
        body("action")
            .isIn(["view", "create", "update", "delete", "manage"])
            .withMessage(
                "Action must be one of: view, create, update, delete, manage",
            ),
        validate,
    ],
    (req, res) => permissionController.store(req, res),
)

router.put(
    "/admin/permissions/:id",
    authenticate,
    requireAdmin,
    [
        param("id").isMongoId().withMessage("Invalid permission ID"),
        body("name").optional().notEmpty().withMessage("Name cannot be empty"),
        body("action")
            .optional()
            .isIn(["view", "create", "update", "delete", "manage"])
            .withMessage("Invalid action"),
        validate,
    ],
    (req, res) => permissionController.update(req, res),
)

router.delete(
    "/admin/permissions/:id",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid permission ID"), validate],
    (req, res) => permissionController.destroy(req, res),
)

module.exports = router
