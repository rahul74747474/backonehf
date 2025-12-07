import {Router} from "express"
import { addemployee, addproject, allemployees, allprojects, alltasks, assigntask, deleteTask, projectdetails, redflags, updateProject } from "../controller/Admin.controller.js"

const adminrouter = Router()

adminrouter.route("/addemployee").post(addemployee)
adminrouter.route("/assigntask").post(assigntask)
adminrouter.route("/addproject").post(addproject)
adminrouter.route("/getprojectdetails").post(projectdetails)


//put apis
adminrouter.route("/updateproject").put(updateProject)
//get apis
adminrouter.route("/getallproject").get(allprojects)

adminrouter.route("/getalltask").get(alltasks)
adminrouter.route("/getalluser").get(allemployees)
adminrouter.route("/getredflags").get(redflags)

//delete apis
adminrouter.route("/deletetask/:id").delete(deleteTask)


export {adminrouter}