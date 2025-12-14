import express from "express"
import cors from "cors"
import CookieParser from "cookie-parser"

const app = express()

app.use(cors({
   origin:"https://693f21a48d78392ddf1a4a67--prismportal.netlify.app",
   credentials:true
}))

//general settings
app.use(express.json({limit:"16mb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(CookieParser())

//route
import { adminrouter } from "./routes/Admin.routes.js"


app.use("/api/v1/admin",adminrouter)

export {app}