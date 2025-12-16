import {Router} from "express"
import { addcomment, addemployee, addproject, adminlogin, allemployees, allprojects, alltasks, alltickets, assignbulkrole, assigntask, assignticket, attendance, createAnnouncement, createissue, createrole, createticket, deleterole, deleteTask, generateReport, getannouncements, getmetricsdata, getReportExports, getroles, getuser, logout, projectdetails, redflags, reports, scores, sla, ticketdetail, updateemployee, updateProject, updaterole, updatestatus, updatetask } from "../controller/Admin.controller.js"
import { verifyjwt } from "../middleware/auth.middleware.js"

const adminrouter = Router()

adminrouter.route("/addemployee").post(addemployee)
adminrouter.route("/adminlogin").post(adminlogin)
adminrouter.route("/assigntask").post(assigntask)
adminrouter.route("/addproject").post(addproject)
adminrouter.route("/createticket").post(verifyjwt,createticket)
adminrouter.route("/createrole").post(createrole)
adminrouter.route("/assignrole").post(assignbulkrole)
adminrouter.route("/ticketdetail").post(ticketdetail)
adminrouter.route("/updatestatus").post(updatestatus)
adminrouter.route("/comment").post(addcomment)
adminrouter.route("/assign").post(assignticket)
adminrouter.route("/announcement").post(verifyjwt,createAnnouncement)
adminrouter.route("/createissue").post(verifyjwt,createissue)
adminrouter.route("/export").post(
  generateReport
);

// 🔹 Get export history (status + download link)


//put apis
adminrouter.route("/updateproject").put(updateProject)
adminrouter.route("/updaterole").put(updaterole)
adminrouter.route("/updateemployee").put(updateemployee)
adminrouter.route("/updatetask/:id").put(updatetask)
//get apis
adminrouter.route("/getallproject").get(allprojects)
adminrouter.route("/getuser").get(verifyjwt,getuser)
adminrouter.route("/getprojectdetails/:id").get(projectdetails)
adminrouter.route("/getalltask").get(alltasks)
adminrouter.route("/getalluser").get(allemployees)
adminrouter.route("/getredflags").get(redflags)
adminrouter.route("/getroles").get(getroles)
adminrouter.route("/gettickets").get(alltickets)
adminrouter.route("/getannouncements").get(getannouncements)
adminrouter.route("/getmetrics").get(getmetricsdata)
adminrouter.route("/logout").get(logout)
adminrouter.route("/getattendance").get(attendance)
adminrouter.route("/getreports").get(reports)
adminrouter.route("/getsla").get(sla)
adminrouter.route("/getscores").get(scores)
adminrouter.route("/exports").get(
  getReportExports
);

//delete apis
adminrouter.route("/deletetask/:id").delete(deleteTask)
adminrouter.route("/deleterole/:id").delete(deleterole)


export {adminrouter}