import {Router} from "express"
import { employeelogin } from "../controller/Employee.controller.js"
import { verifyjwt } from "../middleware/auth.middleware.js"
import { getuser } from "../controller/Admin.controller.js"

const employeerouter = Router()
employeerouter.route("/login").post(employeelogin)
employeerouter.route("/getuser").get(verifyjwt,getuser)



export {employeerouter}