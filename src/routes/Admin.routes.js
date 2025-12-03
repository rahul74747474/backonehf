import {Router} from "express"
import { addemployee, addproject, allemployees, allprojects, assigntask } from "../controller/Admin.controller.js"

const adminrouter = Router()

adminrouter.route("/addemployee").post(addemployee)
adminrouter.route("/assigntask").post(assigntask)
adminrouter.route("/addproject").post(addproject)

//get apis
adminrouter.route("/getallproject").get(allprojects)
adminrouter.route("/getalluser").get(allemployees)

export {adminrouter}