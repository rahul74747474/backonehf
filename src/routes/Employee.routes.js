import {Router} from "express"
import { employeelogin, saveTime, startAttendance, taskcompleted } from "../controller/Employee.controller.js"
import { verifyjwt } from "../middleware/auth.middleware.js"
import { getuser } from "../controller/Admin.controller.js"

const employeerouter = Router()
//post api
employeerouter.route("/login").post(employeelogin)
employeerouter.route("/completedtask").post(verifyjwt,taskcompleted)
employeerouter.route("/start-attendance").post(startAttendance)
employeerouter.route("/save-time").post(saveTime)




//get api
employeerouter.route("/getuser").get(verifyjwt,getuser)



export {employeerouter}