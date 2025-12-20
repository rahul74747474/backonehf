import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
   origin:"https://prismportal.netlify.app",
   credentials:true
}))



//general settings
app.use(express.json({limit:"16mb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use("/public", express.static("public"));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));



//route
import { adminrouter } from "./routes/Admin.routes.js"
import { employeerouter } from "./routes/Employee.routes.js"


app.use("/api/v1/admin",adminrouter)
app.use("/api/v1/employee",employeerouter)

export {app}