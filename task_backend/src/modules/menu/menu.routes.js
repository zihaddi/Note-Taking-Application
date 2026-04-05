"use strict"

const {Router} = require("express")
const {body, param} = require("express-validator")
const {authenticate} = require("../../middleware/authenticate")
const {requireAdmin} = require("../../middleware/authorize")
const {validate} = require("../../middleware/validate")
const menuController = require("./menu.controller")

const router = Router()

router.get("/menus/my-menus", authenticate, (req, res) =>
    menuController.myMenus(req, res),
)

router.post("/admin/menus/reorder", authenticate, requireAdmin, (req, res) =>
    menuController.reorder(req, res),
)

router.get("/admin/menus", authenticate, requireAdmin, (req, res) =>
    menuController.index(req, res),
)

router.get(
    "/admin/menus/:id",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid menu item ID"), validate],
    (req, res) => menuController.show(req, res),
)

router.post(
    "/admin/menus",
    authenticate,
    requireAdmin,
    [
        body("label").notEmpty().withMessage("Label is required"),
        body("path").notEmpty().withMessage("Path is required"),
        validate,
    ],
    (req, res) => menuController.store(req, res),
)

router.put(
    "/admin/menus/:id",
    authenticate,
    requireAdmin,
    [
        param("id").isMongoId().withMessage("Invalid menu item ID"),
        body("label")
            .optional()
            .notEmpty()
            .withMessage("Label cannot be empty"),
        body("path").optional().notEmpty().withMessage("Path cannot be empty"),
        validate,
    ],
    (req, res) => menuController.update(req, res),
)

router.delete(
    "/admin/menus/:id",
    authenticate,
    requireAdmin,
    [param("id").isMongoId().withMessage("Invalid menu item ID"), validate],
    (req, res) => menuController.destroy(req, res),
)

module.exports = router
