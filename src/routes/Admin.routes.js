import {Router} from "express"
import { addcomment, addemployee, addproject, allemployees, allprojects, alltasks, alltickets, assignbulkrole, assigntask, assignticket, attendance, createAnnouncement, createrole, deleteTask, getannouncements, getmetricsdata, getroles, projectdetails, redflags, reports, scores, sla, ticketdetail, updateProject, updaterole, updatestatus } from "../controller/Admin.controller.js"

const adminrouter = Router()

adminrouter.route("/addemployee").post(addemployee)
adminrouter.route("/assigntask").post(assigntask)
adminrouter.route("/addproject").post(addproject)

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
adminrouter.route("/getprojectdetails/:id").get(projectdetails)
adminrouter.route("/getalltask").get(alltasks)
adminrouter.route("/getalluser").get(allemployees)
adminrouter.route("/getredflags").get(redflags)
adminrouter.route("/getroles").get(getroles)
adminrouter.route("/gettickets").get(alltickets)
adminrouter.route("/getannouncements").get(getannouncements)
adminrouter.route("/getmetrics").get(getmetricsdata)
adminrouter.route("/getattendance").get(attendance)
adminrouter.route("/getreports").get(reports)
adminrouter.route("/getsla").get(sla)
adminrouter.route("/getscores").get(scores)
//delete apis
adminrouter.route("/deletetask/:id").delete(deleteTask)


export {adminrouter}