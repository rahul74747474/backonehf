import {Router} from "express"
import { addcomment, addemployee, addproject, allemployees, allprojects, alltasks, alltickets, assignbulkrole, assigntask, assignticket, createAnnouncement, createrole, deleteTask, getannouncements, getroles, projectdetails, redflags, ticketdetail, updateProject, updaterole, updatestatus } from "../controller/Admin.controller.js"

const adminrouter = Router()

adminrouter.route("/addemployee").post(addemployee)
adminrouter.route("/assigntask").post(assigntask)
adminrouter.route("/addproject").post(addproject)
adminrouter.route("/getprojectdetails").post(projectdetails)
adminrouter.route("/createrole").post(createrole)
adminrouter.route("/assignrole").post(assignbulkrole)
adminrouter.route("/ticketdetail").post(ticketdetail)
adminrouter.route("/updatestatus").post(updatestatus)
adminrouter.route("/comment").post(addcomment)
adminrouter.route("/assign").post(assignticket)
adminrouter.route("/announcement").post(createAnnouncement)


//put apis
adminrouter.route("/updateproject").put(updateProject)
adminrouter.route("/updaterole").put(updaterole)
//get apis
adminrouter.route("/getallproject").get(allprojects)

adminrouter.route("/getalltask").get(alltasks)
adminrouter.route("/getalluser").get(allemployees)
adminrouter.route("/getredflags").get(redflags)
adminrouter.route("/getroles").get(getroles)
adminrouter.route("/gettickets").get(alltickets)
adminrouter.route("/getannouncements").get(getannouncements)

//delete apis
adminrouter.route("/deletetask/:id").delete(deleteTask)


export {adminrouter}