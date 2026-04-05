"use strict"

const {validationResult} = require("express-validator")
const ApiResponse = require("../traits/ApiResponse")

/**
 * validate — runs express-validator validations and returns 422 on failure.
 * Place this after the validation chain array in route definitions.
 */
function validate(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const formatted = {}
        errors.array().forEach((e) => {
            const key = e.path || e.param
            if (!formatted[key]) formatted[key] = []
            formatted[key].push(e.msg)
        })
        return ApiResponse.validationError(res, formatted)
    }
    next()
}

module.exports = {validate}
