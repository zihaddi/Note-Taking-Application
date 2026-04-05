"use strict"

require("dotenv").config()
const app = require("./app")
const {connectDB} = require("./config/database")

const PORT = process.env.APP_PORT || 3001

;(async () => {
    await connectDB()

    app.listen(PORT, () => {
        console.log(
            `[Server] Running in ${process.env.APP_ENV || "development"} mode on port ${PORT}`,
        )
    })
})()
