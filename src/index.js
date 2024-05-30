// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port: ${process.env.PORT}`)
        })
        app.on("error", () => {
            console.log("Error: ", error)
            throw error
        })
    })
    .catch((err) => {
        console.log("MONGODB connection failed !!!", err)
    })